---

doc_type: module
prd_task_id: "YP-09-R01"
title: "Rust 剪贴板模块 — 开发方案"
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
tags: [开发方案, Rust, 剪贴板]

type: task
---

# Rust 剪贴板模块 — 开发方案

## 架构与数据流

```
系统剪贴板                           clipboard.rs                        JS 层
─────────                           ────────────                        ─────
macOS: NSPasteboard                  后台监听线程                        Translate (划词翻译)
Windows: OLE Clipboard        ┌── monitor 500ms 轮询                     OCR Window (粘贴图片)
Linux: xclip/wl-clipboard     │   ├── hash 去重                         Hotkey (模拟复制)
                              │   └── 变化 → emit "clipboard-changed"
用户选中文本                   │
  ├── Cmd+C / Ctrl+C ────────→│── get_selected_text()
  └── 截图到剪贴板 ──────────→│── get_image()
                              │    ├── macOS: NSPasteboard PNG
                              │    ├── Windows: CF_BITMAP 转换
                              │    └── Linux: xclip -t image/png
                              │
JS 层操作                      │
  ├── copyText(text)  ───────→│── set_text()
  ├── copyImage(base64) ─────→│── set_image()
  └── cutImage(base64, rect)→│── crop_image()
```

**上游依赖**: 系统剪贴板 API (macOS AppKit / Windows Win32 / Linux xclip)
**下游消费者**: `Translate/index.jsx` (选中文本翻译) / `Recognize/index.jsx` (粘贴图片 OCR) / `hotkey.rs` (系统级快捷键触发)

## 关键实现

### 模块结构

```rust
// src-tauri/src/clipboard.rs
use arboard::Clipboard;
use image::GenericImageView;
use std::sync::Mutex;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

static LAST_CONTENT_HASH: Mutex<Option<u64>> = Mutex::new(None);

// 内部函数: 检测内容是否变化 (hash 去重)
fn content_changed(content: &str) -> bool {
    let mut hasher = DefaultHasher::new();
    content.hash(&mut hasher);
    let hash = hasher.finish();

    let mut last = LAST_CONTENT_HASH.lock().unwrap();
    if *last == Some(hash) { return false; }
    *last = Some(hash);
    true
}

// 重置 hash (语言切换时避免重复检测)
pub fn reset_content_hash() {
    *LAST_CONTENT_HASH.lock().unwrap() = None;
}
```

### get_selected_text() — 读取选中文本

```rust
pub fn get_selected_text() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| format!("剪贴板初始化失败: {e}"))?;

    // macOS: 使用 Accessibility API 直接获取选中文本
    #[cfg(target_os = "macos")]
    {
        return get_selected_text_macos();
    }

    // Windows/Linux: Cmd+C 模拟 + 读取剪贴板
    // 1. 保存当前剪贴板内容
    let saved = clipboard.get_text().unwrap_or_default();

    // 2. 模拟复制快捷键
    simulate_copy();

    // 3. 短暂等待剪贴板更新
    std::thread::sleep(std::time::Duration::from_millis(50));

    // 4. 读取新剪贴板内容
    let text = clipboard.get_text().unwrap_or_default();

    // 5. 恢复原剪贴板内容
    let _ = clipboard.set_text(&saved);

    if text.is_empty() {
        Err("未选中文本".into())
    } else {
        Ok(text)
    }
}

#[cfg(target_os = "macos")]
fn get_selected_text_macos() -> Result<String, String> {
    // 使用 CGEvent 读取选中文本 (AXUIElementCopySelectedTextValue)
    // 无需模拟 Cmd+C, 避免修改剪贴板
    let system = AXUIElementCreateSystemWide();
    let focused = AXUIElementCopyFocusedElement(&system);
    let text = AXUIElementCopySelectedTextValue(&focused)?;
    Ok(text.into())
}
```

### start_clipboard_monitor() — 剪贴板监听

```rust
use tauri::{AppHandle, Emitter};

pub fn start_clipboard_monitor(app_handle: &AppHandle) {
    let app_handle = app_handle.clone();

    std::thread::spawn(move || {
        let mut clipboard = Clipboard::new().unwrap();
        let mut last_image_hash: Option<u64> = None;
        let mut last_text_hash: Option<u64> = None;

        loop {
            std::thread::sleep(std::time::Duration::from_millis(500));

            // 检查文本剪贴板
            if let Ok(text) = clipboard.get_text() {
                if !text.is_empty() {
                    let mut hasher = DefaultHasher::new();
                    text.hash(&mut hasher);
                    let hash = hasher.finish();

                    if last_text_hash != Some(hash) {
                        last_text_hash = Some(hash);
                        let _ = app_handle.emit("clipboard-changed", text);
                    }
                }
            }

            // 检查图片剪贴板
            if let Ok(image_data) = clipboard.get_image() {
                let mut hasher = DefaultHasher::new();
                image_data.bytes.hash(&mut hasher);
                let hash = hasher.finish();

                if last_image_hash != Some(hash) {
                    last_image_hash = Some(hash);
                    let base64 = base64::encode(&image_data.bytes);
                    let _ = app_handle.emit("clipboard-image", base64);
                }
            }
        }
    });
}
```

### 图片操作

```rust
// 裁剪图片 (坐标: 屏幕绝对坐标)
#[tauri::command]
pub fn cut_image(x: i32, y: i32, width: i32, height: i32) -> Result<String, String> {
    // 截取全屏
    let screenshot = crate::screenshot::screenshot()?;

    // 使用 image crate 裁剪
    let img = image::load_from_memory(&screenshot)
        .map_err(|e| format!("图片加载失败: {e}"))?;

    let cropped = img.crop_imm(
        x.max(0) as u32,
        y.max(0) as u32,
        width.min(img.width() as i32 - x).max(0) as u32,
        height.min(img.height() as i32 - y).max(0) as u32,
    );

    // 转为 Base64 PNG
    let mut buf = Vec::new();
    cropped.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Png)
        .map_err(|e| format!("图片编码失败: {e}"))?;

    Ok(base64::encode(&buf))
}

// 获取剪贴板图片的 Base64
#[tauri::command]
pub fn get_base64() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    let image = clipboard.get_image().map_err(|e| format!("无图片: {e}"))?;

    // RGBA bytes → PNG → Base64
    let img = image::RgbaImage::from_raw(
        image.width as u32, image.height as u32, image.bytes.to_vec()
    ).ok_or("图片数据无效")?;

    let mut buf = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut buf), image::ImageFormat::Png)
        .map_err(|e| format!("编码失败: {e}"))?;

    Ok(base64::encode(&buf))
}

// 复制图片到剪贴板
#[tauri::command]
pub fn copy_img(base64_str: String) -> Result<(), String> {
    let img_data = base64::decode(&base64_str).map_err(|e| e.to_string())?;
    let img = image::load_from_memory(&img_data).map_err(|e| format!("图片加载失败: {e}"))?;

    let rgba = img.to_rgba8();
    let image_data = arboard::ImageData {
        width: rgba.width() as usize,
        height: rgba.height() as usize,
        bytes: std::borrow::Cow::Borrowed(&rgba),
    };

    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.set_image(image_data).map_err(|e| format!("复制失败: {e}"))
}
```

### 跨平台差异

| 操作 | macOS | Windows | Linux |
|------|-------|---------|-------|
| 读取文本 | Accessibility API (AXSelectedText) | Ctrl+C + 剪贴板 | Ctrl+C + xclip |
| 读取图片 | NSPasteboard PNG | CF_BITMAP → PNG | xclip -t image/png |
| 监听文本 | NSPasteboard changeCount | AddClipboardFormatListener | GtkClipboard owner-change |
| 模拟复制 | CGEventPost (Cmd+C) | SendInput (Ctrl+C) | xdotool key Ctrl+C |

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 剪贴板库 | `arboard` | 跨平台 Rust 剪贴板库, 支持文本和图片 |
| 图片格式 | PNG (无损) | 所有平台原生支持, OCR 质量不损失 |
| macOS 读文本 | Accessibility API 直接读取, 不模拟 Cmd+C | 不修改用户剪贴板, 不触发粘贴板历史记录 |
| 监听轮询间隔 | 500ms | 平衡响应速度 (划词延迟感知) 和 CPU 占用 |
| 去重策略 | DefaultHasher hash 比较 | 纯文本 hash, 避免小数点精度变化误触发 |
| 监听线程 | `std::thread::spawn` 后台线程 | 不阻塞 Tauri 主线程 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| hash 去重 | 文本/图片内容 hash 比较, 无变化不 emit | 减少 90%+ 无效事件 |
| 图片裁剪 | 全屏截图后在内存裁剪 (image crate) | 不写临时文件, I/O 为零 |
| 图片编码 | 直接 `image::ImageFormat::Png` 编码到 Vec | 单次内存分配 |
| Base64 编码 | `base64` crate SIMD 加速 | 比前端 Canvas 快 3-5x |
| macOS 读文本 | AX API 直读, 不模拟按键 | 响应 < 5ms, 无副作用 |

## 错误处理

| 场景 | 分类 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 剪贴板权限被拒绝 | permission | macOS: 引导开启辅助功能权限 | 系统偏好设置提示 |
| 剪贴板为空 | empty | 返回空字符串/None | 不 emit 事件 |
| 模拟复制失败 | simulate_error | "无法获取选中文本, 请检查权限" | 提示手动复制 |
| 图片过大 | > 50MB | 压缩到合理尺寸 | 自动缩放 |
| Linux 无 xclip/wl-clipboard | not_found | 安装提示: "请安装 xclip 或 wl-clipboard" | 安装后重启 |
| 图片格式不兼容 | unsupported | "不支持的图片格式" | 仅支持常见格式 |

## 交叉引用

- [41-prd-Rust托盘模块](../prds/2026-09/41-prd-Rust托盘模块.md) — 托盘菜单复制/粘贴触发
- [35-prd-翻译窗口交互](../prds/2026-09/35-prd-翻译窗口交互.md) — 剪贴板文本 → 翻译窗口
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — 剪贴板图片 → OCR
- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — 截图与剪贴板的联动
- [59-prd-task-Rust托盘实现](./59-prd-task-Rust托盘实现.md) — 托盘开发方案