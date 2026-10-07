---
title: "ADR: YiPot Rust 错误处理统一使用 anyhow 替换当前 thiserror + Box<dyn Error>"
tags: [category/leader, 决策, adr, yipot, rust, anyhow, error-handling, thiserror]
category: leader/decisions
created: 2026-10-07
updated: 2026-10-07
source: internal
type: decision
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "YiPot Rust 后端错误处理从 4 层嵌套（thiserror + Box<dyn Error> + 手写 From impl + 到处 unwrap）变为 anyhow! 宏 1 行，新增错误类型零样板，错误栈追踪可追溯，开发效率提升 50%"
acceptance_criteria:
  - "error.rs（当前 YiPot/src-tauri/src/error.rs:1-40）改造为 anyhow::Result + 可选 thiserror 领域错误，删除 Box<dyn Error> 包装
  - "所有模块 30+ 处 .unwrap() 调用改为 ? 传播 + context() 附加上下文，panic 率降低 80%
  - "main.rs 或 app.rs 增加 anyhow 错误捕获和统一日志（含 backtrace on nightly）
related:
  - ./README.md
  - ./yipot-008-决策-tiny_http端口60828.md
  - ../../curator/templates/00001-模板-ADR模板.md
  - ../../projects/yipot/prds/2026-09/62-prd-健壮性强化.md
  - ../../projects/yipot/bugs/性能问题/001-剪切板CPU占用高.md
  - ../../engineer/build/003-构建-调试排错指南.md
  - ../../engineer/ship/0002-交付-加固供应链.md
  - ../../curator/governance/00002-治理-治理规范.md
---

# ADR: YiPot Rust 错误处理统一使用 anyhow 替换当前 thiserror + Box<dyn Error>

> **状态**：已接受 (2026-10-07)

---

## 上下文

YiPot Rust 后端（src-tauri/src/）当前使用 `thiserror` 派生自定义 `Error` 枚举，搭配 `Box<dyn std::error::Error>` 兜底。实现在 `YiPot/src-tauri/src/error.rs:1-40`：

```rust
// YiPot/src-tauri/src/error.rs:1-30
#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error(transparent)]
    Error(#[from] Box<dyn std::error::Error>),  // 兜底 Box
    #[error(transparent)]
    Dav(#[from] reqwest_dav::Error),
    // ... 共 13 个变体
}
```

存在问题：
1. **Box<dyn Error> 丢失类型信息**：`Error::Error(Box<...>)` 变体是万能兜底，但任何错误进了 Box 之后 match 时无法具体判断是哪种错误——只能打印字符串，无法差异化处理（比如 network error 重试 vs serde error 崩溃）
2. **From impl 爆炸**：加一种新的依赖库错误，要改 error.rs 加 1 个变体 + 1 个 `#[from]`，14 个依赖要改 14 处
3. **.unwrap() 泛滥**：error.rs 只定义了类型，但各模块实际 30+ 处调用 `.unwrap()`，包括 `server.rs:60 read_to_string().unwrap()`（第 59 行）、`clipboard.rs:15 app_handle.clipboard_manager().read_text()`（clipboard.rs 第 15 行）——任何一个 I/O 异常直接 panic 退出应用
4. **无栈追踪**：即使 62-prd-健壮性强化.md 要求"错误可追溯"，当前实现没有 backtrace，错误日志只有一行 message，不知道调用链哪一环出的问题

为什么现在必须改：Q3 62-prd-健壮性强化要求 panic 率从每周 2-3 次降低到每月 ≤1 次。当前 30+ unwrap 是最大的崩溃来源，如果不换 anyhow 统一 error 上下文，panic 率降不下去。

---

## 决策

**YiPot Rust 后端错误处理分两层：应用层统一用 anyhow::Result + context() 附加上下文传播，边界层（领域特定错误：如备份业务逻辑）保留 thiserror 派生具体枚举。彻底删除 Box<dyn Error> 兜底。**

具体改造：
1. **Cargo.toml 依赖变更**：`anyhow = { version = "1", features = ["backtrace"] }`，保留 `thiserror` 但仅用于领域特定枚举
2. **error.rs 瘦身**：`YiPot/src-tauri/src/error.rs:1-40` 从 13 变体 thiserror 枚举改为：
   - 导出 `pub type AppResult<T> = anyhow::Result<T>;` 全局使用
   - 保留 `BackupError`/`ClipboardError` 等 ≤3 个领域特定错误（有差异化处理逻辑的）用 thiserror 派生
   - 删除 `Error::Error(Box<dyn Error>)` 兜底变体
3. **全局 ? 传播 + context()**：所有函数返回 AppResult，用 `?` 替代 `.unwrap()`，每一层加 `with_context(|| format!("处理 XXX 失败: 参数={:?}", param))`。例：server.rs:59 从 `unwrap()` 改为：
   ```rust
   request.as_reader()
       .read_to_string(&mut content)
       .with_context(|| format!("读取 HTTP 请求体失败, url={}", request.url()))?;
   ```
4. **主入口统一捕获**：`main.rs` 或 `#[tauri::command]` 统一层用 `match result { Ok(v) => ..., Err(e) => { error!("{e:#?}"); ... }` 打印完整 backtrace（anyhow 的 `{e:#?}` 含上下文链）
5. **渐进式改造**：优先级 = 1) 所有 .unwrap() 立即替换；2) 已有 Box<dyn Error> 逐步换 anyhow；3) 领域错误 thiserror 保留

---

## 备选评估

| 替代方案 | 优点 | 缺点 | 否决原因 |
|---|---|---|---|
| **方案 A：维持 thiserror + 补全所有 From impl，删除 Box + 加 unwrap → ?** | 类型最安全，所有错误都可 match | 每加一个依赖改 error.rs；错误枚举膨胀；.unwrap() 还是 30+ 处手动改；仍无 stacktrace | 14 个依赖 + 未来新增依赖，每次都要改 error.rs——thiserror 适合库不适合应用；样板太多 |
| **方案 B：仅用 snafu 替换 thiserror（another error library）** | 和 anyhow 同作者，同时支持类型安全和上下文 | 学习曲线陡；团队 0 人有 snafu 经验；生态比 anyhow 小 | 团队无经验 → 引入学习成本；收益不大于 anyhow（学习成本+生态） |
| **方案 C（已选择）：应用层 anyhow::Result + context()，边界/领域错误保留 thiserror** | 1 行 `?` 传播；`.context()` 每一层加信息；backtrace on nightly 开箱即用；30 处 unwrap 改完立竿见影；团队已有 Rust 项目（YiAi 是 Python，但 YiPot Rust 大家都见过 anyhow） | 编译后二进制略大（~200KB）；anyhow error 类型是 trait object 不是具体 enum，match 需要 downcast | 二进制 200KB 对桌面应用无影响；downcast 场景极少，99% 情况只打印日志 |

---

## 后果

### 正面影响
- **崩溃率立降 80%**：30+ 处 unwrap 变 ? 传播，不再 panic 直接退出，至少 80% 的现有崩溃场景变成日志记录 + 继续运行
- **错误可追溯**：`{e:#?}` 打印完整上下文链：`备份失败 → 读取配置失败 → I/O 错误 Permission denied`，而不是只有最后一行 I/O error
- **开发效率提升 50%**：加一个依赖再也不用改 error.rs 加 From 变体，直接 `?` 自动 into anyhow::Error
- **62-prd-健壮性强化 达标**：panic 率从每周 2-3 次降到每月 ≤1 次（只有极端 OOM 之类还会 panic，业务错误全部可恢复）

### 负面影响
- **一次性改造工作量**：14 个文件、30+ unwrap、20+ 返回类型换 AppResult，约 3-4 人天；需要 1 天回归测试
- **领域错误 downcast**：极少数需要 match 具体错误类型（如 backup 时"文件已存在"是合法场景 vs 其他错误）的地方，得用 `anyhow::Error::downcast_ref::<BackupError>()`，比 thiserror match 多一行
- **编译时间增加 ~10%**：anyhow backtrace feature 拉了一些依赖；对桌面应用开发节奏可接受
- **和其他 Rust 代码风格对齐**：如果未来 YiVad/YiPet 引入 Rust 代码，需要同步 anyhow 规范，避免项目间风格不一致

### 中性影响
- **和 yipot-10（剪贴板节流 CPU）协作**：clipboard.rs:1-33 改造为 AppResult 时一起引入 `debounce/throttle` 逻辑的错误传播，两边同一次 PR 改完
- **与 yipot-08（tiny_http 端口）协作**：server.rs:18-26 `Server::http` 错误当前直接 warn+return，用 `with_context(|| format!("启动 HTTP 服务失败 port={}", port))` 后能定位到具体哪个端口冲突
- **Cargo feature flag backtrace**：nightly Rust 才能跑 `RUST_BACKTRACE=1` 完整栈，stable 下只有上下文链——够用；每季度评审是否切到 Rust 稳定版 backtrace 稳定后直接开

---

## Status

**状态：accepted（已接受）**

**日期：2026-10-07**

**代码改造路径：**
- `YiPot/src-tauri/Cargo.toml` 加 anyhow 依赖
- `YiPot/src-tauri/src/error.rs:1-40` 改造
- 全局 30+ .unwrap() 替换（优先级 clipboard.rs/server.rs/main.rs 先改）
- 命令行 + 集成测试确保改造后不再触发 unwrap panic
