---

doc_type: module
prd_task_id: "YP-09-R04"
title: "Rust 配置/备份/错误 — 开发方案"
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

type: task
---

# Rust 配置/备份/错误 — 开发方案

## config.rs — 配置初始化

```rust
pub fn init_config(app: &mut tauri::App) {
    let store = app.store(".pot.dat").expect("Failed to create store");

    // 设置默认值
    let defaults = vec![
        ("app_language", "en"),
        ("app_theme", "system"),
        ("app_font_size", "16"),
        ("translate_window_width", "350"),
        ("server_port", "60828"),
        ("clipboard_monitor", "false"),
    ];
    for (k, v) in defaults {
        if store.get(k).is_none() {
            store.set(k, serde_json::Value::String(v.into())).ok();
        }
    }
}

pub fn is_first_run() -> bool {
    // 检查 .pot.dat 是否存在
    !config_path().exists()
}
```

## backup.rs — 备份操作

```rust
#[tauri::command]
fn local(action: String, path: String) -> Result<(), String> {
    match action.as_str() {
        "export" => {
            let config = export_all_config()?;
            fs::write(&path, serde_json::to_string_pretty(&config)?)?;
        }
        "import" => {
            let data = fs::read_to_string(&path)?;
            let config: serde_json::Value = serde_json::from_str(&data)?;
            merge_config(config)?;
        }
        _ => return Err("Unknown action".into())
    }
    Ok(())
}

#[tauri::command]
fn webdav(action: String, url: String, username: String, password: String) -> Result<(), String> {
    let client = reqwest::blocking::Client::new();
    // PUT/GET 配置文件
}

#[tauri::command]
fn aliyun(action: String, bucket: String, region: String, ak: String, sk: String) -> Result<(), String> {
    // OSS SDK 操作
}
```

## error.rs — 统一错误

```rust
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Config error: {0}")]
    Config(String),
    #[error("Clipboard error: {0}")]
    Clipboard(String),
    #[error("Hotkey error: {0}")]
    Hotkey(String),
    #[error("Screenshot error: {0}")]
    Screenshot(String),
    #[error("OCR error: {0}")]
    Ocr(String),
    #[error("Server error: {0}")]
    Server(String),
}

impl From<AppError> for String {
    fn from(e: AppError) -> String { e.to_string() }
}
```