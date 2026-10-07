---

doc_type: module
prd_task_id: "YP-09-S04"
title: "系统托盘 — 开发方案"
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
source_prd: "15-prd-系统托盘与通知.md"

type: task
---

# 系统托盘 — 开发方案

## 源码

`YiPot/src-tauri/src/tray.rs`

## 托盘菜单构建

```rust
pub fn update_tray(app: &AppHandle, select_label: String, input_label: String) {
    let menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("selection_translate", select_label))
        .add_item(CustomMenuItem::new("input_translate", input_label))
        .add_item(CustomMenuItem::new("ocr_recognize", "截图 OCR"))
        .add_item(CustomMenuItem::new("ocr_translate", "截图翻译"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("config", "设置"))
        .add_item(CustomMenuItem::new("about", "关于"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit", "退出"));

    app.tray_handle().set_menu(menu).ok();
}
```

## 事件处理

```rust
pub fn tray_event_handler(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "selection_translate" => toggle_selection_translate(),
            "input_translate" => input_translate(),
            "ocr_recognize" => ocr_recognize(),
            "ocr_translate" => ocr_translate(),
            "config" => config_window(),
            "about" => show_about(),
            "quit" => std::process::exit(0),
            _ => {}
        },
        _ => {}
    }
}
```

## 平台差异

| 平台 | 实现 |
|------|------|
| macOS | NSStatusBar + template icon + ActivationPolicy::Accessory |
| Windows | Shell_NotifyIcon + 彩色图标 + 通知气泡 |
| Linux | libayatana-appindicator |