---
doc_type: prd
title: "YP-09-S27: Rust CLI 与命令行参数"
status: 已完成
priority: P2
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-S27
estimate_frontend: 0.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, CLI, 命令行]
category: 项目/桌面应用/需求
---

# YP-09-S27: Rust CLI 与命令行参数

> 需求编号：YP-09-S27 · 优先级：P2 · 人天：0.5d · 状态：已完成

## 背景

命令行支持让 Pot 可以集成到脚本和自动化工作流中。

## 需求

### cmd.rs

```rust
// 解析命令行参数
// pot translate "hello" --from en --to zh
// pot ocr --screenshot
// pot --version
```

### 支持的命令

| 命令 | 参数 | 功能 |
|------|------|------|
| `translate` | text, --from, --to | 翻译文本 |
| `ocr` | --screenshot | 截图 OCR |
| `config` | — | 打开设置 |
| `--version` | — | 显示版本 |

## 验收标准

- [ ] `pot translate "hello" --to zh` 正常工作
- [ ] `pot --version` 输出版本号
- [ ] 无效命令给出帮助提示

## 量化验收标准

| 命令 | 输入 | 预期输出 | 耗时 |
|------|------|----------|------|
| `pot translate "hello" --to zh` | 英文 → 中文 | "你好" (含所有启用服务结果) | < 2s |
| `pot translate "你好" --from zh --to en` | 中文 → 英文 | "Hello" | < 2s |
| `pot ocr --screenshot` | 触发截图 | OCR 文字输出到 stdout | < 3s |
| `pot ocr --file screenshot.png` | 指定图片文件 | OCR 文字输出 | < 2s |
| `pot config` | 无参数 | 打开图形化设置窗口 | < 1s |
| `pot --version` | — | `pot 1.0.0` (格式) | < 100ms |
| `pot --help` | — | 帮助文本 (含所有子命令) | < 100ms |
| `pot translate` (无参数) | 缺少必填 | 错误提示 "请提供要翻译的文本" | < 100ms |
| `pot unknown-command` | 无效命令 | 错误提示 + 建议类似命令 | < 100ms |

## 边界条件与异常处理

| 场景 | 输入 | 预期行为 | 恢复策略 |
|------|------|----------|----------|
| 文本含换行符 | `pot translate "line1\nline2"` | 整体翻译，换行保留 | — |
| 文本含特殊 shell 字符 | `"hello $USER world"` | 正确转义，不展开变量 | 单引号包裹建议 |
| 语言代码无效 | `pot translate "hello" --to xyz` | 错误提示 "不支持的语言代码" | 显示可用语言列表 |
| 截图失败 | `pot ocr --screenshot` 用户取消 | 返回 exit code 1，无输出 | — |
| 指定文件不存在 | `pot ocr --file missing.png` | 错误提示 "文件不存在" | — |
| 无网络 | `pot translate "hello" --to zh` | 使用本地/缓存的翻译服务 | 标注 "离线模式" |
| stdin 管道输入 | `echo "hello" \| pot translate --to zh` | 从 stdin 读取文本 | 与 `--text` 互斥 |
| 应用已在运行 | 再次执行 `pot` | 将参数转发到已有实例 | Tauri single-instance 插件 |

## 非功能需求

### 性能
- CLI 命令解析 < 50ms（不含实际翻译/OCR 操作）
- `--version` / `--help` 直接输出，不初始化完整应用

### 兼容性
- 命令行参数与 Tauri 主窗口事件系统互通
- Windows 下 `pot.exe` 需在 PATH 中或使用完整路径

### 输出格式
- 结果默认 human-readable，支持 `--json` flag 输出 JSON
- `--json` 模式输出: `{"services":[{"name":"baidu","result":"..."}],"text":"..."}`

## 模块交互

```
CLI Input (终端)
     │
     ▼
main.rs → cmd.rs (解析 clap/argh 参数)
     │
     ├── translate "text" --from --to
     │   └── Tauri command translate(text, from, to)
     │       └── parallelDispatch → 输出到 stdout
     │
     ├── ocr --screenshot / --file
     │   └── Tauri command screenshot_ocr() / file_ocr(path)
     │       └── parallelDispatch → 输出到 stdout
     │
     ├── config
     │   └── Tauri command open_config_window()
     │
     ├── --version
     │   └── println!(env!("CARGO_PKG_VERSION"))
     │
     └── --help
         └── 自动生成 (clap help text)
```

**上游依赖**：
- `cmd.rs`：clap 或 argh 参数解析
- `parallelDispatch`：翻译/OCR 的并行调度（JS 层）
- `tauri::command`：CLI 参数转换为 Tauri 命令调用
- `tauri-plugin-single-instance`：多实例参数转发

**下游消费者**：
- 用户脚本/自动化工具
- macOS Automator / Shortcuts / Alfred workflow
- 其他应用的 system call 集成

## 参考

- [43-prd-Rust配置备份错误处理](./43-prd-Rust配置备份错误处理.md) — Rust 层命令注册模式
- [34-prd-并行调度策略](./34-prd-并行调度策略.md) — 翻译/OCR 的并行调度
- [44-prd-ADR-Tauri选择](./44-prd-ADR-Tauri选择.md) — 为什么用 Rust CLI