---
doc_type: prd
title: "YP-09-R03: Rust 截图/OCR/语言检测模块"
status: 已完成
priority: P0
project: YiPot
project_id: yipot
owner: Pot-App 社区
prd_month: "202609"
prd_task_id: YP-09-R03
estimate_frontend: 1.5
created: 2026-09-23
updated: 2026-09-23
source: 内部
type: 需求
issue_type: 功能
roles: [engineer]
tags: [需求文档, Rust, 截图, OCR, 语言检测]
category: 项目/桌面应用/需求
---

# YP-09-R03: Rust 截图/OCR/语言检测模块

> 需求编号：YP-09-R03 · 优先级：P0 · 人天：1.5d · 状态：已完成

## screenshot.rs

### 全屏截图

```rust
pub fn screenshot() -> Vec<u8> {
    // macOS: CGWindowListCreateImage
    // Windows: BitBlt + GDI
    // Linux: xdg-screenshot / grim
}
```

以 PNG 字节流返回，前端用 Canvas 展示选区。

## system_ocr.rs

### 系统原生 OCR

```rust
#[tauri::command]
pub async fn system_ocr(image_base64: String, language: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    return macos_ocr(&image_base64, &language);
    #[cfg(target_os = "windows")]
    return windows_ocr(&image_base64, &language);
    #[cfg(target_os = "linux")]
    return Err("Not available".into());
}
```

## lang_detect.rs

### 语言检测

```rust
pub fn init_lang_detect() { /* 初始化语言检测模型 */ }

#[tauri::command]
pub fn lang_detect(text: String) -> String {
    // 返回检测到的语言代码 (zh/en/ja/ko/...)
}
```

使用 franc 或 CLD3 模型进行语言检测。

## 验收标准

- [ ] 截图三平台可用
- [ ] macOS/Windows 系统 OCR 离线可用
- [ ] 语言检测准确率 > 90%

## 量化验收标准

### screenshot.rs

| 指标 | macOS | Windows | Linux (X11) | Linux (Wayland) |
|------|-------|---------|-------------|-----------------|
| 全屏截图延迟 | < 100ms | < 150ms | < 200ms | < 300ms |
| 截图分辨率 | 与实际屏幕一致 | 一致 | 一致 | 一致 (via pipewire) |
| 输出格式 | PNG bytes | PNG bytes | PNG bytes | PNG bytes |
| 多显示器支持 | 是 (CGDisplay) | 是 (EnumDisplayMonitors) | 是 (XDG) | 部分支持 |

### system_ocr.rs

| 指标 | macOS Vision | Windows OCR |
|------|-------------|-------------|
| 首次调用延迟 | < 200ms (模型预热) | < 300ms |
| 后续调用延迟 | < 100ms | < 200ms |
| 中文准确率 | >= 95% | >= 93% |
| 英文准确率 | >= 96% | >= 95% |
| 支持语言数 | 18 种 | 25 种 |
| 离线可用 | 是 | 是 |
| 内存占用 | ~20MB | ~15MB |

### lang_detect.rs

| 指标 | 目标 |
|------|------|
| 检测延迟 | < 50ms |
| Top-1 准确率 (中/英/日/韩) | >= 92% |
| Top-2 准确率 (50+ 语言) | >= 85% |
| 内存占用 | < 10MB (whatlang/franc 模型) |
| 最小输入长度 | 3 字符 |
| 混语检测 | 返回主导语言 |

## 边界条件与异常处理

| 场景 | 触发条件 | 预期行为 | 恢复策略 |
|------|----------|----------|----------|
| 截图时显示器断开 | 外接显示器拔出 | 仅截取剩余屏幕，不崩溃 | 日志记录，忽略丢失的显示器 |
| 截图被安全策略阻止 | macOS Screen Recording 权限未授权 | 返回权限错误，引导用户授权 | 缓存权限状态 |
| 系统 OCR 不支持的图片格式 | 非标准色彩空间 | 自动转换为 sRGB 再识别 | image crate 色彩空间转换 |
| 系统 OCR 识别空区域 | 截图中无文字 | 返回空字符串 `""` | 不阻塞在线 OCR 调用 |
| 语言检测文本过短 | < 3 字符 | 返回 `"und"` (undetermined) | 前端根据用户手动选择的语言处理 |
| 语言检测歧义 | 中/日共享汉字 | 按词频分布 + 假名检测决策 | 可能误判为其中一种 |
| Linux 系统 OCR 不可用 | Tesseract 未安装 | 返回 `"系统 OCR 不可用"` | 仅在线 API 可用 |
| Wayland 截图不完整 | 某些合成器的安全模式 | 可能仅截部分窗口 | 提示切换到 X11 或授权 |

## 非功能需求

### 性能
- 截图结果缓存（同一秒内的重复截图请求复用结果）
- 系统 OCR 结果写入 LRU 缓存（key = image hash），减少重复识别
- 语言检测模型在应用启动时预加载（`init_lang_detect()`）

### 平台适配

| 平台 | 截图 API | 系统 OCR | 语言检测 |
|------|----------|----------|----------|
| macOS | `CGWindowListCreateImage` | Vision Framework (VNRecognizeTextRequest) | franc / whatlang-rs |
| Windows | `BitBlt` via GDI | Windows.Media.OCR.OcrEngine | franc / whatlang-rs |
| Linux (X11) | `xdg-screenshot` or X11 SHM | 不支持 (Tesseract 可选) | franc / whatlang-rs |
| Linux (Wayland) | `grim` via pipewire | 不支持 | franc / whatlang-rs |

### 内存
- 截图数据用完后立即释放（不持有原图引用）
- 系统 OCR 引擎为单例模式，避免重复加载模型

## 模块交互

```
screenshot.rs ────────────┐
     │                     │
     ├── fn screenshot()   │ → 全屏截图 PNG bytes
     │   └── 调用者:       │
     │       ├── clipboard.rs::cut_image() (裁剪)
     │       ├── Screenshot 窗口 (选区展示)
     │       └── tray.rs (OCR 流程触发)
     │                     │
system_ocr.rs ────────────┤
     │                     │
     ├── fn system_ocr()   │ → 离线 OCR 文字
     │   ├── cfg(macos)    │
     │   │    → Vision Framework (NSProcessInfo)
     │   ├── cfg(windows)  │
     │   │    → Windows.Media.OCR (winrt)
     │   └── cfg(linux)    │
     │        → 不支持      │
     │                     │
lang_detect.rs ───────────┤
     │                     │
     ├── fn init_lang()    │ → 预加载模型
     ├── fn lang_detect()  │ → 检测语言代码
     └── 调用者:            │
         ├── Translate 窗口 (自动设源语言)
         └── OCR 窗口 (决定 OCR 语言参数)
                           │
                           ▼
                     前端 JS 层
                     (Tauri commands)
```

**上游依赖**：
- `config.rs`：用户语言偏好设置

**下游消费者**：
- `clipboard.rs::cut_image()`：从全屏截图中裁剪选区
- Screenshot 窗口 (React)：展示全屏截图 + 选区交互
- OCR 窗口 (React)：展示识别结果
- Translate 窗口 (React)：自动设置源语言

**Tauri Commands 注册**：
```rust
// main.rs 或 lib.rs
app.manage(MyState::default());
// 命令自动通过 #[tauri::command] 宏注册
// 前端调用: invoke('screenshot'), invoke('system_ocr', {image_base64, language}), invoke('lang_detect', {text})
```

## 参考

- [32-prd-百度腾讯OCR](./32-prd-百度腾讯OCR.md) — 在线 OCR 服务（与系统 OCR 互补）
- [33-prd-讯飞合合火山OCR](./33-prd-讯飞合合火山OCR.md) — 在线 OCR 服务
- [40-prd-Rust剪贴板模块](./40-prd-Rust剪贴板模块.md) — 剪贴板读取截图数据
- [36-prd-OCR窗口交互](./36-prd-OCR窗口交互.md) — OCR 结果展示 UI
- [49-prd-macOS平台适配](./49-prd-macOS平台适配.md) — macOS 截图权限
- [50-prd-WindowsLinux平台适配](./50-prd-WindowsLinux平台适配.md) — X11/Wayland 截图差异