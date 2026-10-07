---

doc_type: module
prd_task_id: "YP-09-S11"
title: "系统 OCR 离线识别 — 开发方案"
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
source_prd: "22-prd-系统OCR离线识别.md"

type: task
---

# 系统 OCR 离线识别 — 开发方案

> 来源 PRD：[22-prd-系统OCR离线识别.md](../../prds/2026-09/22-prd-系统OCR离线识别.md)

## 架构概览

```
用户截图
      │
      ▼
┌───────────────────────────────────────────────────┐
│          前端截图模块 (React)                      │
│    selection_capture → base64 image                │
│    │                                                │
│    │  invoke("system_ocr", { imageBase64, lang })   │
│    ▼                                                │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│         Rust system_ocr.rs (Tauri Command)         │
│                                                    │
│  #[tauri::command]                                 │
│  fn system_ocr(image_base64: &str, language: &str) │
│    │                                                │
│    ├── #[cfg(target_os = "macos")]                 │
│    │   macos_ocr(image_base64, language)            │
│    │   │  base64 → CGImage                         │
│    │   │  VNRecognizeTextRequest                    │
│    │   │  VNImageRequestHandler.perform()          │
│    │   ▼  Result<String, String>                   │
│    │                                                │
│    ├── #[cfg(target_os = "windows")]                │
│    │   windows_ocr(image_bytes, language)           │
│    │   │  InMemoryRandomAccessStream               │
│    │   │  BitmapDecoder → SoftwareBitmap            │
│    │   │  OcrEngine.RecognizeAsync()                │
│    │   ▼  Result<String, String>                   │
│    │                                                │
│    └── #[cfg(target_os = "linux")]                 │
│        Err("System OCR not available on Linux")    │
│                                                    │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│  识别结果 (text string)                            │
│    │                                                │
│    │  翻译窗口展示 OR 直接复制到剪贴板              │
│    ▼                                                │
│  用户获取文字内容                                  │
└───────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

`YiPot/src-tauri/src/system_ocr.rs` + 前端 `services/recognize/system/`

### macOS — Vision Framework

```rust
#[cfg(target_os = "macos")]
fn macos_ocr(image_base64: &str, language: &str) -> Result<String, String> {
    // 1. Base64 解码 → NSData → CGImage
    let img = base64_to_cgimage(image_base64)
        .map_err(|e| format!("Image decode failed: {}", e))?;

    // 2. 创建文字识别请求
    let request = VNRecognizeTextRequest::new();
    request.set_recognition_level(VNRequestTextRecognitionLevel::Accurate);
    request.set_recognition_languages(&[language]);
    request.set_uses_language_correction(true);

    // 3. 执行识别
    let handler = VNImageRequestHandler::new_with_cgimage(img, &[]);
    handler.perform(&[request])
        .map_err(|e| format!("OCR failed: {}", e))?;

    // 4. 收集结果 (按行排序)
    let results = request.results();
    let text = results.iter()
        .map(|obs| obs.top_candidates(1).first().unwrap().string().to_string())
        .collect::<Vec<_>>()
        .join("\n");

    Ok(text)
}
```

支持语言：中文、英文、日文、韩文、法文、德文、西班牙文、意大利文、葡萄牙文（Vision Framework 内置 9 语言）。

### Windows — Windows.Media.OCR

```rust
#[cfg(target_os = "windows")]
fn windows_ocr(image_bytes: &[u8], language: &str) -> Result<String, String> {
    // 1. Base64 解码 → byte array
    // 2. Create InMemoryRandomAccessStream
    // 3. BitmapDecoder::CreateAsync → decode image
    // 4. SoftwareBitmap::Convert (BGRA8 pixel format)
    // 5. OcrEngine::TryCreateFromLanguage(lang)
    // 6. engine.RecognizeAsync(bitmap) → OcrResult
    // 7. result.Lines → Line.Words → Word.Text → concat
}
```

支持语言：系统已安装的语言包（Windows Settings > Language > OCR 语言包）。

### Linux 降级

```rust
#[cfg(target_os = "linux")]
fn linux_ocr(_image_base64: &str, _language: &str) -> Result<String, String> {
    // 系统 OCR 在 Linux 不可用，前端应自动降级到 Tesseract.js
    Err("System OCR not available on Linux. Use Tesseract.js instead.".into())
}
```

### 前端调用入口

```javascript
// services/recognize/system/index.jsx
import { invoke } from "@tauri-apps/api/tauri";

export default async function recognize(imageBase64, options = {}) {
  try {
    const text = await invoke("system_ocr", {
      imageBase64,
      language: options.language || detectSystemLang()
    });
    return { text, source: "system_ocr" };
  } catch (e) {
    // Linux 自动降级到 Tesseract.js
    if (platform === "linux") {
      return await tesseractRecognize(imageBase64, options);
    }
    throw e;
  }
}
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| OCR 引擎选择 | 系统原生 API (Vision/OcrEngine) | 纯自研 OCR 模型 | 系统内置，无需下载模型、无需 GPU、零配置 | 无法自定义识别参数 (如 PSM 模式) |
| 语言支持 | macOS 9 语言内置，Windows 按需安装语言包 | 统一使用 Tesseract 语言包 | 系统 API 已内置主流语言，开箱即用 | Windows 稀有语言需手动安装 |
| 准确度等级 | macOS 使用 .accurate 级别 | .fast 级别 | 翻译场景需要极高准确度 (一个字符错误改变含义) | 识别速度慢 2-3 倍 (但仍 <1s) |
| Linux 策略 | 返回错误 → 前端自动降级 Tesseract.js | 不支持 Linux | Linux 无系统 OCR API，降级可保证跨平台一致性 | 降级后识别精度可能下降 |
| 图片格式 | Base64 传入 Rust | 文件路径 | Base64 避免跨进程文件系统权限问题 | 大图 (>10MB) Base64 编解码有开销 |
| 语言校正 | macOS 启用 uses_language_correction | 原始识别 | 语言学上下文纠正常见 OCR 错误 (如 1→l) | 极少数专有名词可能被错误更正 |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 图片预处理 | 提高识别准确率 | 前端截图前自动提高对比度 + 二值化 | 低对比度场景识别率提升 ~15% |
| 识别速度 | macOS <1s, Windows <1s | 系统 API 原生硬件加速 (Metal/DirectX) | Vision Framework 在 Apple Silicon 上 <200ms |
| 内存管理 | 避免 CGImage 泄漏 | Rust Drop trait 自动释放 NSObject | 多次截图不累积内存 |
| 并发识别 | 避免重复请求 | 前端 debounce 300ms + 取消上一个飞行中的 invoke | 快速连续截图不堆积 OCR 任务 |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-平台 | Linux 系统 OCR 不可用 | 返回明确错误 → 前端自动降级 Tesseract.js | 自动切换引擎 | 无感知（识别结果可能略有差异） |
| L1-平台 | Windows 语言包未安装 | 提示用户安装语言包 | 引导跳转 Windows 语言设置 | Toast "请安装 OCR 语言包" |
| L2-图像 | Base64 解码失败 | 返回错误 → 提示重新截图 | 用户重试 | Toast "图片解析失败" |
| L2-图像 | 图片尺寸过大 (>4096px) | 前端自动等比缩放到 2048px | 静默缩放 | 极细文字可能识别率下降 |
| L2-识别 | 识别结果为空 (无文字区域) | 返回空字符串 → 翻译窗口提示"未检测到文字" | 用户重新截图 | Toast |
| L3-系统 | Vision Framework 抛出异常 | 捕获 NSException → 包装为 Rust Result::Err | 上报错误 + 降级 Tesseract | 用户可能注意到延迟 |

---

## 跨平台差异

| 维度 | macOS (Vision) | Windows (Media.OCR) | Linux |
|------|---------------|---------------------|-------|
| API | VNRecognizeTextRequest | OcrEngine | — |
| 语言安装 | 9 种内置，无需安装 | 需通过 Settings 安装语言包 | — |
| 识别速度 | ~200ms (M1+) | ~500ms | — |
| 文字方向 | 自动检测 (横/竖排) | 横向为主 | — |
| 边界框 | 返回每个词/行的 bounding box | 返回每行 bounding box | — |
| GPU 加速 | Metal | DirectX | — |

---

**关联文档**：
- OCR 服务插件：[05-prd-task-OCR服务插件实现.md](./05-prd-task-OCR服务插件实现.md)
- Tesseract OCR：[44-prd-task-TesseractOCR实现.md](./44-prd-task-TesseractOCR实现.md)
- 测试方案：[22-prd-test-系统OCR离线识别](../../tests/2026-09/22-prd-test-系统OCR离线识别.md)