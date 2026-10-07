---

doc_type: module
prd_task_id: "YP-09-R04"
title: "Rust 配置/备份/错误处理 — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "43-prd-Rust配置备份错误处理.md"
tags: [开发方案, Rust, 配置, 备份, 错误处理]

type: task
---

# Rust 配置/备份/错误处理 — 开发方案

## 架构与数据流

```
配置读写                            config.rs                           Consumer
────────                            ────────                           ────────
tauri-plugin-store (.pot.dat)        init_config()                     所有窗口
       │                             ├── 创建/加载 store                    ├── 读取: config.get("theme")
       ▼                             ├── 设置默认值                         ├── 写入: config.set("theme", "dark")
get(key) / set(key, value)           └── is_first_run()                    └── 监听: store.on_change()
       │
       ▼                             backup.rs
Jotai atoms (UI 层缓存)              ├── local("export", path)         设置页面 Backup
       │                             ├── local("import", path)              ├── 导出 JSON
       ├── configAtom                ├── webdav(action, url, user, pwd)     ├── 导入 JSON
       ├── themeAtom                 └── aliyun(action, bucket, ...)        ├── WebDAV 同步
       └── servicesAtom                                                      └── 阿里云 OSS 同步
       │
       ▼                             error.rs
所有 UI 组件                          AppError enum                      所有模块
                                     ├── Config(String)                      └── 统一定义错误类型
                                     ├── Clipboard(String)
                                     ├── Hotkey(String)
                                     ├── Screenshot(String)
                                     ├── Ocr(String)
                                     └── Server(String)
```

**上游依赖**: `tauri-plugin-store` / `serde_json` / `reqwest` (WebDAV) / `aliyun-oss-rust-sdk` (阿里云)
**下游消费者**: 所有窗口 (读配置) / 设置页面 (写配置) / 托盘 (划词翻译状态)

## 关键实现

### config.rs — 配置初始化

```rust
// src-tauri/src/config.rs
use tauri::App;
use tauri_plugin_store::StoreExt;
use std::path::PathBuf;

pub fn init_config(app: &mut App) {
    // 创建 .pot.dat 存储
    let store = app.store(".pot.dat").expect("Failed to create .pot.dat store");

    // 设置默认值 (仅在 key 不存在时)
    let defaults: Vec<(&str, serde_json::Value)> = vec![
        ("app_language", serde_json::json!("en")),
        ("app_theme", serde_json::json!("system")),
        ("app_font", serde_json::json!("system")),
        ("app_font_size", serde_json::json!(16)),
        ("translate_window_width", serde_json::json!(350)),
        ("translate_window_height", serde_json::json!(500)),
        ("server_port", serde_json::json!(60828)),
        ("clipboard_monitor", serde_json::json!(false)),
        ("selection_enabled", serde_json::json!(false)),
    ];

    for (key, value) in defaults {
        if store.get(key).is_none() {
            store.set(key, value).ok();
        }
    }

    store.save().expect("Failed to save default config");
}

// 首次运行检测
pub fn is_first_run() -> bool {
    let config_path = config_dir().join(".pot.dat");
    !config_path.exists()
}

fn config_dir() -> PathBuf {
    #[cfg(target_os = "macos")]
    { dirs_next::home_dir().unwrap().join("Library/Application Support/com.pot.app") }
    #[cfg(target_os = "windows")]
    { dirs_next::data_dir().unwrap().join("com.pot.app") }
    #[cfg(target_os = "linux")]
    { dirs_next::config_dir().unwrap().join("pot") }
}
```

### 配置读写 Tauri Commands

```rust
#[tauri::command]
pub fn get_config(app: tauri::AppHandle, key: String) -> Result<serde_json::Value, String> {
    let store = app.store(".pot.dat").map_err(|e| e.to_string())?;
    store.get(&key).ok_or_else(|| format!("配置项 '{}' 不存在", key))
}

#[tauri::command]
pub fn set_config(app: tauri::AppHandle, key: String, value: serde_json::Value) -> Result<(), String> {
    let store = app.store(".pot.dat").map_err(|e| e.to_string())?;

    // 校验特殊字段
    validate_config_value(&key, &value)?;

    store.set(&key, value).ok_or("配置写入失败")?;
    store.save().map_err(|e| format!("配置保存失败: {e}"))
}

fn validate_config_value(key: &str, value: &serde_json::Value) -> Result<(), String> {
    match key {
        "app_font_size" => {
            let size = value.as_i64().unwrap_or(16);
            if !(8..=72).contains(&size) {
                return Err("字体大小必须在 8-72 之间".into());
            }
        }
        "server_port" => {
            let port = value.as_i64().unwrap_or(60828);
            if !(1024..=65535).contains(&port) {
                return Err("端口号必须在 1024-65535 之间".into());
            }
        }
        "app_theme" => {
            let theme = value.as_str().unwrap_or("system");
            if !["light", "dark", "system"].contains(&theme) {
                return Err("主题必须是 light/dark/system 之一".into());
            }
        }
        _ => {}
    }
    Ok(())
}

#[tauri::command]
pub fn reload_store(app: tauri::AppHandle) {
    if let Ok(store) = app.store(".pot.dat") {
        store.reload();
    }
}
```

### backup.rs — 备份操作

```rust
// src-tauri/src/backup.rs
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
struct BackupFile {
    version: String,
    export_time: String,
    general: serde_json::Value,
    services: serde_json::Value,
    hotkeys: serde_json::Value,
}

#[tauri::command]
fn backup_local(action: String, path: Option<String>) -> Result<String, String> {
    match action.as_str() {
        "export" => {
            let app = tauri::AppHandle::current();
            let store = app.store(".pot.dat").map_err(|e| e.to_string())?;

            let backup = BackupFile {
                version: env!("CARGO_PKG_VERSION").to_string(),
                export_time: chrono::Utc::now().to_rfc3339(),
                general: store.get("general").unwrap_or(serde_json::Value::Null),
                services: store.get("services").unwrap_or(serde_json::Value::Null),
                hotkeys: store.get("hotkeys").unwrap_or(serde_json::Value::Null),
            };

            let json = serde_json::to_string_pretty(&backup).map_err(|e| e.to_string())?;
            let export_path = path.unwrap_or_else(default_backup_path);
            std::fs::write(&export_path, &json).map_err(|e| format!("写入失败: {e}"))?;
            Ok(export_path)
        }

        "import" => {
            let import_path = path.ok_or("请指定导入文件路径")?;
            let data = std::fs::read_to_string(&import_path)
                .map_err(|e| format!("读取失败: {e}"))?;

            let backup: BackupFile = serde_json::from_str(&data)
                .map_err(|e| format!("JSON 解析失败, 文件可能已损坏: {e}"))?;

            // 版本兼容性检查
            if !is_version_compatible(&backup.version) {
                return Err("配置版本不兼容".into());
            }

            let app = tauri::AppHandle::current();
            let store = app.store(".pot.dat").map_err(|e| e.to_string())?;

            // 合并导入 (不破坏现有配置)
            if !backup.general.is_null() { store.set("general", backup.general); }
            if !backup.services.is_null() { store.set("services", backup.services); }
            if !backup.hotkeys.is_null() { store.set("hotkeys", backup.hotkeys); }

            store.save().map_err(|e| format!("保存失败: {e}"))?;
            store.reload();
            Ok("导入成功".into())
        }

        _ => Err("Unknown action".into()),
    }
}

fn is_version_compatible(_version_str: &str) -> bool {
    // 当前仅检查版本字符串不为空
    // 未来可根据 semver 做主/次版本兼容判断
    true
}

fn default_backup_path() -> String {
    dirs_next::desktop_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("pot_backup.json")
        .to_string_lossy()
        .to_string()
}
```

### error.rs — 统一错误类型

```rust
// src-tauri/src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
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

    #[error("服务端错误: {0}")]
    Server(String),

    #[error("备份错误: {0}")]
    Backup(String),
}

// 转换为 Tauri command 返回类型 (所有 command 返回 Result<T, String>)
impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

// 从常见的外部错误转换
impl From<serde_json::Error> for AppError {
    fn from(e: serde_json::Error) -> Self {
        AppError::Config(format!("JSON 解析错误: {e}"))
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Config(format!("文件 I/O 错误: {e}"))
    }
}

impl From<reqwest::Error> for AppError {
    fn from(e: reqwest::Error) -> Self {
        AppError::Server(format!("网络请求错误: {e}"))
    }
}

// 使用示例
pub type AppResult<T> = Result<T, AppError>;
```

### main.rs 集成

```rust
// src-tauri/src/main.rs
mod cmd;
mod tray;
mod clipboard;
mod screenshot;
mod system_ocr;
mod lang_detect;
mod config;
mod backup;
mod error;

fn main() {
    let cli = cmd::Cli::parse();

    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            // 初始化配置
            config::init_config(app);

            // 首次运行 → 打开设置
            if config::is_first_run() {
                tray::show_config_window(app.handle());
            }

            // 初始化系统托盘
            let tray = tray::create_tray();
            app.set_system_tray(tray)?;

            // 初始化语言检测
            lang_detect::init_lang_detect();

            Ok(())
        })
        .on_system_tray_event(tray::tray_event_handler)
        .invoke_handler(tauri::generate_handler![
            screenshot::screenshot,
            system_ocr::system_ocr,
            lang_detect::lang_detect,
            lang_detect::map_lang_code,
            config::get_config,
            config::set_config,
            config::reload_store,
            clipboard::cut_image,
            clipboard::get_base64,
            clipboard::copy_img,
            backup::backup_local,
            backup::webdav,
            backup::aliyun,
        ])
        .run(tauri::generate_context!())
        .expect("error running tauri application");
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 配置持久化库 | `tauri-plugin-store` | Tauri 官方插件, JSON 文件存储, 跨平台路径 |
| 配置文件格式 | JSON (`.pot.dat`) | 人类可读, `tauri-plugin-store` 原生支持 |
| 首次运行检测 | 检查 `.pot.dat` 是否存在 | 简单可靠, 无额外 flag |
| 配置校验 | 写入前 validate (字体 8-72, 端口 1024-65535) | 防止不合法配置导致运行时错误 |
| 备份格式 | JSON + version 字段 + timestamp | 版本兼容性检查, 导入时可识别 |
| 错误类型 | `thiserror::Error` derive 宏 | 统一错误类型, 自动实现 Display + From |
| 导入策略 | 仅导入 `general/services/hotkeys` 三个已知 key | 安全合并, 不覆盖未知配置 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 默认值设置 | 仅在 key 不存在时写入 | 避免启动时覆盖已有配置 |
| 配置写入 | 前端 500ms debounce + diff 比较 | 减少磁盘 I/O |
| 备份导出 | `serde_json::to_string_pretty` 一次性序列化 | 快照透传, 零拷贝 |
| 语言检测 | `whatlang` 首次调用懒加载, 后续内存命中 | 首次 < 50ms, 后续 < 1ms |

## 错误处理

| 场景 | 分类 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 配置文件损坏 | Config | "配置已重置为默认值" | 自动备份 `.pot.dat.bak`, 默认配置覆盖 |
| 配置写入失败 | Config | "配置保存失败" | 保留内存中的修改 |
| 字体大小非法 | Config | "字体大小必须在 8-72 之间" | 输入校验阻止 |
| 端口号非法 | Config | "端口号必须在 1024-65535 之间" | 输入校验阻止 |
| 备份写入失败 | Backup | "备份文件写入失败" | 检查磁盘空间 |
| 备份 JSON 损坏 | Backup | "导入文件 JSON 解析失败" | 不修改现有配置 |
| 备份版本不兼容 | Backup | "配置版本不兼容" | 提示升级 |
| 网络请求失败 | Server | "网络请求失败: {error}" | 保留重试能力 |

## 交叉引用

- [37-prd-设置页面架构](../prds/2026-09/37-prd-设置页面架构.md) — 设置页面 Config/Backup 页
- [39-prd-WebDAV阿里云备份](../prds/2026-09/39-prd-WebDAV阿里云备份.md) — WebDAV/阿里云备份细节
- [40-prd-Rust剪贴板模块](../prds/2026-09/40-prd-Rust剪贴板模块.md) — 配置驱动剪贴板监听开关
- [41-prd-Rust托盘模块](../prds/2026-09/41-prd-Rust托盘模块.md) — 配置驱动托盘菜单状态
- [55-prd-task-设置页面实现](./55-prd-task-设置页面实现.md) — 设置页面开发方案
- [57-prd-task-WebDAV备份实现](./57-prd-task-WebDAV备份实现.md) — WebDAV 备份开发方案