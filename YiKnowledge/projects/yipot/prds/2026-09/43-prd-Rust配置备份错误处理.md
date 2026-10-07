---
doc_type: prd
title: "YP-09-R04: Rust 配置/备份/错误处理模块"
status: 已完成
priority: P1
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-R04
estimate_frontend: 1.0
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, Rust, 配置, 备份, 错误处理]
category: 项目/桌面应用/需求
---

# YP-09-R04: Rust 配置/备份/错误处理模块

> 需求编号：YP-09-R04 · 优先级：P1 · 人天：1.0d · 状态：已完成

## config.rs

### 配置管理

```rust
use tauri_plugin_store::StoreExt;

pub fn init_config(app: &mut tauri::App) {
    // 创建/加载 .pot.dat 配置文件
    // 设置默认值
}

pub fn get(key: &str) -> Option<serde_json::Value> { ... }
pub fn set(key: &str, value: impl Into<serde_json::Value>) { ... }

#[tauri::command]
pub fn reload_store(app: tauri::AppHandle) {
    // 重新加载配置文件（导入后使用）
}
```

### 首次运行检测

```rust
pub fn is_first_run() -> bool {
    // 检查配置文件是否存在
    // 不存在 → 首次运行 → 打开设置窗口
}
```

## backup.rs

### 三种备份方式

| 命令 | 函数 | 功能 |
|------|------|------|
| `local` | 本地备份 | 导出/导入 JSON |
| `webdav` | WebDAV | PUT/GET 同步 |
| `aliyun` | 阿里云 OSS | SDK 上传/下载 |

## error.rs

### 统一错误类型

```rust
#[derive(Debug)]
pub enum AppError {
    Config(String),
    Clipboard(String),
    Hotkey(String),
    Screenshot(String),
    Ocr(String),
    Server(String),
}
```

## 验收标准

- [ ] 配置读写正常
- [ ] 首次运行正确检测
- [ ] 备份三种方式均可用
- [ ] 错误统一类型化

## 量化验收标准

### config.rs

| 操作 | 目标延迟 | 测量方法 |
|------|----------|----------|
| `get(key)` 读取 | < 1ms | 内存 HashMap 查找 |
| `set(key, value)` 写入 | < 1ms | 内存 HashMap 更新 + 异步持久化 |
| `reload_store()` | < 100ms | JSON 文件读取 + 反序列化 + 整合 |
| `is_first_run()` | < 10ms | 文件系统 exists 检查 |
| 配置文件保存到磁盘 | < 500ms | 防抖 500ms 内不重复写入 |

### backup.rs

| 操作 | 目标 |
|------|------|
| 本地 JSON 导出 | < 500ms (配置 < 1MB) |
| 本地 JSON 导入 | < 1s (含 schema 校验) |
| WebDAV PUT | < 3s |
| WebDAV GET | < 3s |
| 阿里云 OSS PutObject | < 3s |
| 阿里云 OSS GetObject | < 3s |

### error.rs

| 需求 | 目标 |
|------|------|
| 错误类型覆盖 | >= 6 种分类 (Config, Clipboard, Hotkey, Screenshot, Ocr, Server) |
| 每个变体包含人类可读消息 | 100% |
| 从错误到 Tauri command error 的转换 < 1ms | O(1) 字符串格式化 |

## 边界条件与异常处理

### config.rs

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 配置文件不存在 | 首次运行 | `is_first_run()` 返回 true，使用默认值 | 打开设置窗口引导用户 |
| 配置文件损坏 | JSON 解析失败 | 自动备份损坏文件为 `.bak`，使用默认值 | 弹窗提示用户 |
| 并发写入 | 多个 `set()` 快速调用 | 防抖 500ms，只最后一次触发持久化 | 使用 `AtomicBool` dirty flag + timer |
| key 不存在 | get("unknown_key") | 返回 `None` | 调用方自行处理默认值 |
| 配置文件权限不足 | 写入时 PermissionDenied | 返回 `AppError::Config("无法写入配置文件".into())` | 内存中保留修改 |
| 配置值类型不匹配 | `get("port")` 返回了 String 但代码期望 Number | JSON serde 自动转换 | 如果转换失败则 panic 或返回 None |
| 磁盘空间不足 | 写入时 ENOSPC | 同上，不损坏存量配置 | 提示用户清理磁盘 |

### backup.rs

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 导入 JSON 格式错误 | 非 JSON 内容 | 返回 `AppError::Config("导入文件格式错误".into())` | 不修改当前配置 |
| 导入配置版本不兼容 | JSON 缺少关键字段 | 合并模式：仅覆盖已知字段 | 报告跳过字段 |
| 导入后配置类型错误 | 字段类型不匹配 | Schema 校验拒绝，不导入 | 报告具体错误字段 |
| WebDAV 网络超时 | 15s 无响应 | 返回 `AppError::Server("连接超时".into())` | 3 次重试 (2s/4s/8s) |
| 阿里云 OSS 权限不足 | 403 Forbidden | 返回 `AppError::Server("OSS 权限不足".into())` | 引导用户检查 AK/SK |

### error.rs

| 场景 | 预期行为 |
|------|----------|
| 任何模块返回的错误 | 通过 `impl From<X> for AppError` 统一转换 |
| 错误消息传递给 Tauri command | 自动序列化为 `Result<T, String>` |
| 前端接收到 Error | 解析 error message，显示本地化提示 |

## 非功能需求

### config.rs 架构

```rust
// 配置存储层
tauri-plugin-store (StoreExt)
     │  ┌── .pot.dat (JSON 文件)
     │  │
     ├── get(key) → serde_json::Value
     ├── set(key, value) → 自动 save()
     └── reload_store() → 重新从磁盘加载

// 访问模式
1. JS 层 → Jotai configAtom → invoke("get_config", {key})
2. Rust 层 → config::get() / config::set() → tauri-plugin-store
3. 启动时 → init_config() → 创建/加载 .pot.dat → 设置默认值
```

### error.rs 设计

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("配置错误: {0}")]
    Config(String),

    #[error("剪贴板错误: {0}")]
    Clipboard(String),

    #[error("快捷键错误: {0}")]
    Hotkey(String),

    #[error("截图错误: {0}")]
    Screenshot(String),

    #[error("OCR 错误: {0}")]
    Ocr(String),

    #[error("服务错误: {0}")]
    Server(String),
}

// 所有模块的内部错误类型可以 impl From<T> for AppError
// 使用 thiserror 自动 derive Display + Error trait
// Tauri command 返回 Result<T, String> 时自动使用 Display 格式化
```

### 防抖写入策略

```
用户操作 → Jotai setConfig → invoke → config::set() → dirty_flag = true
                                                           │
                                                   500ms debounce
                                                           │
                                                    store.save() → .pot.dat
```

## 模块交互

```
config.rs
     │
     ├── 消费者:
     │   ├── tray.rs (读取托盘偏好)
     │   ├── hotkey.rs (读取快捷键配置)
     │   ├── clipboard.rs (读取监听开关)
     │   └── JS 层所有功能窗口 (翻译/OCR/截图偏好)
     │
     ├── 存储:
     │   └── tauri-plugin-store → .pot.dat
     │
     └── 生命周期:
         app_setup() → init_config() → IS_FIRST_RUN 检查
         app_exit()  → store.save() (确保最后修改不丢失)

backup.rs
     │
     ├── local() → std::fs (文件读写)
     ├── webdav() → reqwest HTTP client
     │   └── HTTP PUT/GET/PROPFIND
     ├── aliyun() → aliyun-oss-rust-sdk
     │   └── OSS PutObject/GetObject
     └── 消费者: 设置页面 > Backup 页面

error.rs
     │
     ├── 生产: 各模块内部错误 → .into() Vec<AppError>
     ├── 消费: Tauri command #[tauri::command] → Result<T, String>
     └── 前端: try/catch invoke() → 显示错误提示
```

**上游依赖**：
- `tauri-plugin-store`：配置文件持久化 (config.rs)
- `reqwest` crate：HTTP 客户端 (backup.rs webdav)
- `aliyun-oss-rust-sdk`：OSS SDK (backup.rs aliyun)
- `thiserror` crate：错误类型 derive (error.rs)

**下游消费者**：
- 所有功能模块依赖 config.rs 读取设置
- 设置页面依赖 backup.rs 进行备份操作
- 所有 Tauri commands 通过 error.rs 统一错误类型

## 参考

- [37-prd-设置页面架构](./37-prd-设置页面架构.md) — 配置的 UI 管理
- [39-prd-WebDAV阿里云备份](./39-prd-WebDAV阿里云备份.md) — 备份操作细节
- [38-prd-CLI命令行](./38-prd-CLI命令行.md) — CLI 参数与配置的关系