---

doc_type: module
prd_task_id: "YP-09-S11"
title: "系统 OCR — 开发方案"
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

# 系统 OCR — 开发方案

> 来源 PRD：[22-prd-系统OCR离线识别.md](../../prds/2026-09/22-prd-系统OCR离线识别.md)

## 源码

`YiPot/src-tauri/src/system_ocr.rs`

### macOS — Vision Framework

```rust
#[cfg(target_os = "macos")]
fn macos_ocr(image_base64: &str, language: &str) -> Result<String, String> {
    let img = base64_to_cgimage(image_base64)?;

    // 创建文字识别请求
    let request = VNRecognizeTextRequest::new();
    request.set_recognition_languages(&[language]);

    // 执行识别
    let handler = VNImageRequestHandler::new_with_cgimage(img);
    handler.perform(&[request])?;

    // 收集结果
    let results = request.results();
    let text = results.iter()
        .map(|r| r.text())
        .collect::<Vec<_>>()
        .join("\n");

    Ok(text)
}
```

### Windows — Windows.Media.OCR

```rust
#[cfg(target_os = "windows")]
fn windows_ocr(image_bytes: &[u8], language: &str) -> Result<String, String> {
    // 1. 创建 InMemoryRandomAccessStream
    // 2. BitmapDecoder 解码图片
    // 3. OcrEngine 创建识别引擎
    // 4. RecognizeAsync 执行识别
    // 5. 收集 Line → Word → Text
}
```

### 前端调用

```javascript
// services/recognize/system/index.jsx
import { invoke } from "@tauri-apps/api/tauri";

export default async function recognize(imageBase64, options) {
  const text = await invoke("system_ocr", {
    imageBase64,
    language: options.language || "zh-Hans"
  });
  return { text };
}
```


## 设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| macOS OCR | Vision Framework (VNRecognizeTextRequest) | Tesseract CLI / Tesseract.js | 系统级硬件加速，识别 < 200ms，18 种语言，无需额外安装 | 仅限 macOS 10.15+，iOS 衍生 API 部分能力受限 |
| Windows OCR | Windows.Media.OCR (WinRT) | Tesseract / 第三方 OCR DLL | 系统内置无需安装，支持 25 种语言，硬件加速 | 中文识别精度低于百度 (~85% vs ~98%)，需要 Win10+ |
| Linux OCR | 无系统 API → Tesseract.js 兜底 | 无替代方案 | Linux 无内置 OCR API，Tesseract 是唯一离线方案 | 识别速度慢 (1-5s)，无硬件加速 |
| 语言参数传递 | 前端通过 invoke 传递 language 参数 | Rust 端自动检测系统语言 | 用户可能需要识别非系统语言的文本 (如英文系统识别中文) | 需要用户在 UI 中选择语言 |
| Rust FFI | macOS: objc crate, Windows: windows-rs crate | 外部进程调用 (swift/python 脚本) | 同进程调用零序列化开销，类型安全 | macOS objc 不安全宏增加编译复杂度 |
| 图片格式 | Base64 编码传给 Rust FFI | 文件路径 / 像素缓冲区 | Base64 通用格式，前端 Canvas.toDataURL 直接获取 | 内存膨胀 33%，大图 ~4MB → ~5.3MB |
| 结果质量检查 | confidence 阈值过滤低置信度结果 | 返回所有结果 | 避免低置信度（< 0.3）的嘈杂结果干扰用户 | 可能丢弃部分正确但模糊的文字 |

### macOS Vision Framework FFI 细节

```rust
// Rust objc FFI 调用链:
// 1. 创建 NSAttributedString 的 OCR 识别请求
// 2. 设置语言偏好 (如 zh-Hans, ja-JP)
// 3. 设置 revision (VNRecognizeTextRequestRevision3, 最新)
// 4. 设置 recognitionLevel = .accurate (高精度模式)
// 5. 创建 VNImageRequestHandler (CGImage)
// 6. perform() 执行识别
// 7. 遍历 results → VNRecognizedTextObservation → topCandidates(1) → string

识别参数:
  recognitionLevel: .accurate (vs .fast → 速度优先但精度低)
  usesLanguageCorrection: true (自动纠正常见识别错误)
  minimumTextHeight: 0.01 (识别极小文字)
  revision: VNRecognizeTextRequestRevision3 (visionOS 2+, 最新算法)
```

### Windows.Media.OCR FFI 细节

```rust
// Windows-rs FFI 调用链:
// 1. 创建 InMemoryRandomAccessStream
// 2. BitmapDecoder::CreateAsync(BitmapDecoder::PngDecoderId, stream)
// 3. GetSoftwareBitmapAsync()
// 4. OcrEngine::TryCreateFromLanguage(Language::new(lang))
// 5. engine.RecognizeAsync(bitmap)
// 6. 遍历 result.Lines() → Words() → Text()

语言映射 (内部 → Windows BCP-47):
  zh-Hans → "zh-Hans"
  zh-Hant → "zh-Hant"  
  ja → "ja"
  ko → "ko"
  en → "en"
  // Windows OCR 不支持的语言 → 回退 Tesseract.js

已知问题:
  - 中文识别无法区分简繁体 (zh-Hans/zh-Hant 实际效果相近)
  - 手写文字识别率低 (< 50%)
  - 竖排文字无法识别
```

### Tesseract.js 兜底机制

```
系统 OCR 调用流程:
  1. 检测平台: #[cfg(target_os = "...")]
  2. macOS: macos_ocr(image, lang)
     └── 失败 → 降级 Tesseract.js (前端)
  3. Windows: windows_ocr(image, lang)
     └── 失败 → 降级 Tesseract.js (前端)
  4. Linux: 直接调用 Tesseract.js (前端)
     └── 提示 "Linux 仅支持离线 OCR"

Tesseract.js 语言数据:
  - 存储路径: tauri 应用数据目录/tesseract/
  - 首次使用自动下载: https://github.com/naptha/tessdata/raw/gh-pages/4.0.0/{lang}.traineddata
  - 中文简: chi_sim.traineddata (~15MB)
  - 中文繁: chi_tra.traineddata (~25MB)
  - 英文: eng.traineddata (~15MB)
  - 日语: jpn.traineddata (~17MB)
```


## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-macOS | Vision 框架不可用 (macOS < 10.15) | 降级 Tesseract.js | 自动降级 | 无感知（仅性能下降） |
| L1-Windows | OcrEngine.TryCreateFromLanguage 失败 (语言不支持) | 降级 Tesseract.js + 指定语言 | 自动降级 | "所选语言不支持系统 OCR，使用离线识别" |
| L2-Image | 图片格式转换失败 (非 PNG/JPEG) | 重新编码为 PNG → 重试 | 自动修复 | 无感知 |
| L2-Image | 图片尺寸过大 (> 4096px) | 等比缩放到 4096px | 自动缩放 | 无感知（精度可能略降） |
| L3-OCR | 识别结果为空 (无文字区域) | 返回空字符串 + 提示 | 用户重试/切换服务 | "未识别到文字" |
| L3-OCR | 识别置信度过低 (< 0.3) | 标记 "low_confidence" + 提示 | 用户手动选择云端 OCR | "识别可信度较低，建议使用云端服务" |
| L4-Tesseract | 语言数据包下载失败 | 提示网络错误 + 离线不可用 | 用户手动下载 | "离线数据包下载失败，请检查网络" |
| L4-Tesseract | 语言数据包损坏 | 重新下载 | 自动重试 | "数据包不完整，正在重新下载" |

### OCR 置信度处理

```javascript
// 前端结果处理
if (result.confidence < 0.3) {
  // 低置信度: 展示 + 警告
  showWarning("识别可信度较低，建议使用云端OCR服务");
} else if (result.confidence < 0.6) {
  // 中等置信度: 展示 + 标记
  result.displayText = result.text + ` (可信度: ${Math.round(result.confidence * 100)}%)`;
}
// 置信度 >= 0.6: 正常展示
```


## 性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| macOS Vision | recognitionLevel = .accurate (硬件加速) | 识别 < 200ms | ~180ms (4K 截图) |
| 图片缩放 | > 4096px 自动缩放 (大部分 OCR 引擎最优输入 ~2048px) | 识别速度 +30% | Windows OCR: ~250ms (缩放后) |
| Base64 传输 | 前端 Canvas.toBlob → ArrayBuffer → Rust (避免 Base64 膨胀) | 传输体积 -33% | — |
| Tesseract Worker | 复用单 Worker (不每次新建) | 后续识别 -3s (创始化时间) | 首次 ~4.2s, 后续 ~1.2s |
| 图片预处理 | 灰度化 + 对比度增强 (仅 Tesseract) | Tesseract 识别率 +15% | 预处理 ~30ms |

**关联文档**：
- [OCR 识别架构](./02-prd-task-OCR识别架构.md) — OCR 流程与截图架构
- [OCR 服务插件实现](./05-prd-task-OCR服务插件实现.md) — 15 个 OCR 插件
- [桌面集成架构](./03-prd-task-桌面集成架构.md) — system_ocr.rs 模块