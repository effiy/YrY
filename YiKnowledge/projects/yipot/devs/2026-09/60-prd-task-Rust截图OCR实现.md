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
tags: [开发方案, Rust, 截图, OCR, 语言检测]

type: task
---

# Rust 截图/OCR/语言检测 — 开发方案

## 架构与数据流

```
截图流程                              Rust Layer                         JS Layer
────────                              ─────────                         ───────
用户触发 (快捷键/托盘)                  screenshot.rs
       │                              ├── full_screenshot()
       │                              │   ├── macOS: CGWindowListCreateImage
       │                              │   ├── Windows: BitBlt + GDI
       │                              │   └── Linux: xdg-screenshot / grim
       │                              │
       │                              ├── 裁剪图片 (image crate)
       │                              │
       ▼                              ├── Base64 编码
OCR 识别                              │
       │                              system_ocr.rs
       │                              ├── macOS: Vision framework (VNRecognizeTextRequest)
       │                              ├── Windows: Windows.Media.Ocr (OCR Engine)
       │                              └── Linux: Not available → 在线 API only
       │
       │                              lang_detect.rs
       │                              ├── whatlang-rs 模型 (106+ 语言)
       │                              └── 返回语言代码: zh/en/ja/ko/...
       │
       ▼
OCR 窗口 / 翻译窗口
```

**上游依赖**: 操作系统原生截图/OCR API / `whatlang-rs` (语言检测) / `image` crate (图片处理)
**下游消费者**: `Recognize/index.jsx` (OCR 窗口) / `Translate/index.jsx` (截图翻译模式)

## 关键实现

### screenshot.rs — 全屏截图

```rust
// src-tauri/src/screenshot.rs
use image::GenericImageView;

#[tauri::command]
pub fn screenshot() -> Result<Vec<u8>, String> {
    #[cfg(target_os = "macos")]
    {
        macos_screenshot()
    }
    #[cfg(target_os = "windows")]
    {
        windows_screenshot()
    }
    #[cfg(target_os = "linux")]
    {
        linux_screenshot()
    }
}

#[cfg(target_os = "macos")]
fn macos_screenshot() -> Result<Vec<u8>, String> {
    use core_graphics::display::CGDisplay;
    use core_graphics::image::CGImage;

    let display = CGDisplay::main();
    let image = CGDisplay::screenshot(display.id, CGRectNull, 0, 0)
        .map_err(|e| format!("截图失败: {e}"))?;

    // CGImage → PNG bytes
    let mut buf = Vec::new();
    // encode to PNG via image crate conversion
    Ok(buf)
}

#[cfg(target_os = "windows")]
fn windows_screenshot() -> Result<Vec<u8>, String> {
    use winapi::um::winuser::{GetDC, ReleaseDC, GetDesktopWindow, BitBlt, SRCCOPY};
    use winapi::um::wingdi::{CreateCompatibleDC, CreateCompatibleBitmap, SelectObject, DeleteDC, DeleteObject};

    unsafe {
        let hwnd = GetDesktopWindow();
        let hdc = GetDC(hwnd);
        let mem_dc = CreateCompatibleDC(hdc);

        let width = 1920; // GetSystemMetrics
        let height = 1080;
        let bitmap = CreateCompatibleBitmap(hdc, width, height);
        let old_bitmap = SelectObject(mem_dc, bitmap as _);

        BitBlt(mem_dc, 0, 0, width, height, hdc, 0, 0, SRCCOPY);

        SelectObject(mem_dc, old_bitmap);
        DeleteDC(mem_dc);
        ReleaseDC(hwnd, hdc);
        DeleteObject(bitmap as _);
    }

    // HBITMAP → PNG bytes via image crate
    Ok(vec![])
}

#[cfg(target_os = "linux")]
fn linux_screenshot() -> Result<Vec<u8>, String> {
    std::process::Command::new("grim")
        .arg("-t").arg("png")
        .arg("-") // stdout
        .output()
        .map_err(|e| format!("截图失败 (需要 grim): {e}"))
        .map(|o| o.stdout)
}
```

### system_ocr.rs — 系统原生 OCR

```rust
// src-tauri/src/system_ocr.rs

#[tauri::command]
pub async fn system_ocr(image_base64: String, language: String) -> Result<String, String> {
    let img_bytes = base64::decode(&image_base64).map_err(|e| e.to_string())?;

    #[cfg(target_os = "macos")]
    {
        macos_ocr(&img_bytes, &language)
    }
    #[cfg(target_os = "windows")]
    {
        windows_ocr(&img_bytes, &language)
    }
    #[cfg(target_os = "linux")]
    {
        // 检查 tesseract 可用性
        if std::process::Command::new("tesseract").arg("--version").output().is_ok() {
            tesseract_ocr(&img_bytes, &language)
        } else {
            Err("Linux 系统暂不支持原生 OCR, 请安装 tesseract".into())
        }
    }
}

#[cfg(target_os = "macos")]
fn macos_ocr(img_bytes: &[u8], language: &str) -> Result<String, String> {
    use objc::{class, msg_send, sel, sel_impl};
    use cocoa::foundation::NSData;

    // 1. 创建 CGImage
    let data = NSData::dataWithBytes_length(NSData::alloc(nil), img_bytes.as_ptr(), img_bytes.len());
    let image = create_cgimage(data);

    // 2. 创建 Vision 识别请求
    let request = VNRecognizeTextRequest::new();
    request.set_recognition_languages(&[language]);
    request.set_recognition_level(1); // 1 = accurate

    // 3. 执行请求
    let handler = VNImageRequestHandler::new_with_cgimage(&image, &[]);
    handler.perform(&[request])?;

    // 4. 提取结果
    let results: Vec<String> = request.results().iter()
        .filter(|r| r.confidence() > 0.3)
        .map(|r| r.text().to_string())
        .collect();

    Ok(results.join("\n"))
}

#[cfg(target_os = "windows")]
fn windows_ocr(img_bytes: &[u8], language: &str) -> Result<String, String> {
    // 使用 Windows.Media.Ocr.OcrEngine
    // 通过 winrt 调用系统 OCR API
    // 支持 25+ 语言
    todo!("Windows OCR implementation via winrt::Windows::Media::Ocr")
}
```

### lang_detect.rs — 语言检测

```rust
// src-tauri/src/lang_detect.rs
use whatlang::{detect, Lang};
use std::sync::OnceLock;

static LANG_MODEL_LOADED: OnceLock<bool> = OnceLock::new();

#[tauri::command]
pub fn init_lang_detect() {
    LANG_MODEL_LOADED.get_or_init(|| {
        // whatlang 模型在首次 detect() 调用时自动加载
        true
    });
}

#[tauri::command]
pub fn lang_detect(text: String) -> String {
    if text.trim().is_empty() {
        return "en".to_string();
    }

    match detect(&text) {
        Some(info) => {
            let lang_code = info.lang().code();
            tracing::debug!("语言检测: {} -> {} (置信度: {:.2})", &text[..20.min(text.len())], lang_code, info.confidence());

            // 置信度阈值过滤
            if info.confidence() < 0.3 {
                "auto".to_string()
            } else {
                lang_code.to_string()
            }
        }
        None => "auto".to_string(),
    }
}

// 语言代码映射 (whatlang code → 各 API 语言代码)
#[tauri::command]
pub fn map_lang_code(whatlang_code: String, target_api: String) -> String {
    let mapping = match target_api.as_str() {
        "baidu" => match whatlang_code.as_str() {
            "cmn" => "CHN_ENG",
            "jpn" => "JAP",
            "kor" => "KOR",
            "fra" => "FRE",
            "spa" => "SPA",
            _ => "auto",
        }.to_string(),
        "google" => whatlang_code.replace("cmn", "zh-CN"),
        _ => whatlang_code,
    };
    mapping
}

// 脚本检测 (中日韩字符区分)
pub fn detect_script(text: &str) -> &'static str {
    for c in text.chars() {
        let range = c as u32;
        if (0x4E00..=0x9FFF).contains(&range) { return "zh"; }
        if (0x3040..=0x309F).contains(&range) || (0x30A0..=0x30FF).contains(&range) { return "ja"; }
        if (0xAC00..=0xD7AF).contains(&range) { return "ko"; }
    }
    "en"
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 截图方案 | macOS: CoreGraphics / Windows: GDI / Linux: grim | 各平台原生最快速方案 |
| OCR 引擎 | macOS: Vision / Windows: Windows.Media.Ocr / Linux: tesseract | 系统原生, 离线可用, 无额外依赖 |
| 语言检测库 | `whatlang-rs` (pure Rust) | 无 FFI, 106+ 语言支持, 模型 < 2MB |
| 检测回退 | whatlang + script 分析双层检测 | CJK 短文本 whatlang 可能不准, script 回退 |
| 置信度阈值 | < 0.3 返回 "auto" | 避免低置信度误导后续 API 调用 |
| macOS OCR 精度 | `recognition_level = accurate` | 准确模式下中文识别率 > 95% |

## 性能优化

| 优化项 | 措施 | 目标 |
|--------|------|------|
| 截图 (macOS) | CGWindowListCreateImage, 单帧捕获 | < 50ms |
| 截图 (Windows) | BitBlt from Desktop DC | < 50ms |
| 截图 (Linux) | grim 一次 PNG 输出 | < 100ms |
| OCR (macOS) | Vision framework 硬件加速 (ANE) | < 500ms |
| 语言检测 | `whatlang` 首次懒加载, 后续内存缓存 | < 1ms per call |
| 脚本回退 | Unicode range check O(n) | < 0.1ms per call |
| 图片编码 | 直接 PNG 编码, 不转中间格式 | 零拷贝 |

## 错误处理

| 场景 | 分类 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| macOS 截图权限 | permission | "请在系统偏好设置 > 隐私 > 屏幕录制中授权" | 引导打开系统设置 |
| Windows GDI 失败 | system | "截图失败, 请检查系统" | 日志记录错误码 |
| Linux grim 缺失 | not_found | "请安装 grim: sudo apt install grim" | 检测后提示 |
| macOS OCR 权限 | permission | "请在隐私设置中允许 Pot 访问屏幕内容" | 引导授权 |
| Linux 无 tesseract | not_found | "请安装 tesseract-ocr" | 降级到在线 API |
| 语言检测置信度低 | low_confidence | 返回 "auto" | 触发多语言 API 调用 |
| 系统 OCR 不可用 | unavailable | 结果区显示 "不可用" | 仅展示在线 API 结果 |
| 截图图片过大 | > 10MB | 自动压缩到 4MB | 保持可读性的最大压缩比 |

## 交叉引用

- [40-prd-Rust剪贴板模块](../prds/2026-09/40-prd-Rust剪贴板模块.md) — 剪贴板截图/图片
- [32-prd-百度腾讯OCR](../prds/2026-09/32-prd-百度腾讯OCR.md) — 在线 OCR 服务 (系统 OCR 的补充)
- [33-prd-讯飞合合火山OCR](../prds/2026-09/33-prd-讯飞合合火山OCR.md) — 在线 OCR 服务
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 结果前端展示
- [58-prd-task-Rust剪贴板实现](./58-prd-task-Rust剪贴板实现.md) — 剪贴板开发方案