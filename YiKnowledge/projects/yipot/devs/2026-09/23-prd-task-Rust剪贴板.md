---

doc_type: module
prd_task_id: "YP-09-R01"
title: "Rust 剪贴板 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "40-prd-Rust剪贴板模块.md"

type: task
---

# Rust 剪贴板 — 开发方案

## get_selected_text

```rust
pub fn get_selected_text() -> String {
    // 1. 保存当前剪贴板内容
    let original = read_clipboard();

    // 2. 模拟 Ctrl+C / Cmd+C
    simulate_copy();

    // 3. 读取剪贴板新内容
    let selected = read_clipboard();

    // 4. 恢复原始剪贴板内容
    write_clipboard(&original);

    selected
}
```

## 剪贴板监听

```rust
pub fn start_clipboard_monitor(app_handle: &AppHandle) {
    std::thread::spawn(move || {
        let mut last = String::new();
        loop {
            std::thread::sleep(Duration::from_millis(500));

            let enabled = app_handle
                .state::<ClipboardMonitorEnableWrapper>()
                .0.lock().unwrap();
            if *enabled != "true" { continue; }

            let content = read_clipboard_text();
            if !content.is_empty() && content != last {
                last = content.clone();
                app_handle.emit_all("clipboard-changed", content).ok();
            }
        }
    });
}
```

## Tauri Commands

| 命令 | 功能 |
|------|------|
| `get_text` | 读取选中文本 |
| `cut_image` | 裁剪图片 |
| `get_base64` | 图片 → base64 |
| `copy_img` | 复制图片到剪贴板 |