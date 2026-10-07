---

doc_type: module
prd_task_id: "YP-09-R03"
title: "Rust 截图/OCR/语言检测 — 开发方案"
status: 已完成
priority: P0
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "42-prd-Rust截图OCR语言检测.md"

type: task
---

# Rust 截图/OCR/语言检测 — 开发方案

## screenshot.rs

```rust
pub fn screenshot() -> Vec<u8> {
    #[cfg(target_os = "macos")]
    { return macos_screenshot(); }
    #[cfg(target_os = "windows")]
    { return windows_screenshot(); }
    #[cfg(target_os = "linux")]
    { return linux_screenshot(); }
}
```

### macOS: CGWindowListCreateImage

### Windows: BitBlt + GDI

### Linux: xdg-screenshot / grim

## system_ocr.rs

```rust
#[tauri::command]
pub async fn system_ocr(image_base64: String, language: String) -> Result<String, String> {
    let img = base64::decode(&image_base64).map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    {
        let cg_img = create_cgimage(&img)?;
        let request = VNRecognizeTextRequest::new();
        request.set_recognition_languages(&[&language]);
        let handler = VNImageRequestHandler::new_with_cgimage(&cg_img, &[]);
        handler.perform(&[request])?;
        Ok(request.results().iter().map(|r| r.text()).join("\n"))
    }
    #[cfg(target_os = "windows")]
    {
        windows_ocr_impl(&img, &language)
    }
    #[cfg(target_os = "linux")]
    {
        Err("System OCR not available on Linux".into())
    }
}
```

## lang_detect.rs

```rust
use whatlang::{detect, Lang};

pub fn init_lang_detect() { /* preload models */ }

#[tauri::command]
pub fn lang_detect(text: String) -> String {
    match detect(&text) {
        Some(info) => info.lang().code().to_string(),
        None => "en".to_string(),
    }
}
```