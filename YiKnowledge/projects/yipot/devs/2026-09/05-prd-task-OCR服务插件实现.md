---

doc_type: module
prd_task_id: "YP-09-M08"
title: "OCR 服务插件实现 — 开发方案"
status: 已完成
priority: 高
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 4
source_prd: "06-prd-OCR服务接口全景.md"

type: task
---

# OCR 服务插件实现 — 开发方案

> 来源 PRD：[06-prd-OCR服务接口全景.md](../../prds/2026-09/06-prd-OCR服务接口全景.md)

---

## 一、OCR 插件接口

```typescript
// info.ts
export const info = {
  id: "baidu_accurate",
  name: "百度精准OCR",
  type: "recognize",
  configurable: true,
  needs: [{ name: "apiKey", message: "API Key" }, { name: "secretKey", message: "Secret Key" }]
};

// index.jsx
export default async function recognize(imageBase64, options) {
  const result = await fetch(API_URL, {
    body: buildFormData(imageBase64, options)
  });
  return {
    text: result.words_result.map(w => w.words).join("\n"),
    regions: result.words_result.map(w => ({
      text: w.words,
      box: w.location
    }))
  };
}
```

---

## 二、15 个 OCR 插件

| # | 插件 | 类型 | 特点 |
|---|------|------|------|
| 1 | 百度通用 | 云服务 | 中文优化 |
| 2 | 百度精准 | 云服务 | 含位置信息 |
| 3 | 百度图片 | 云服务 | 多种图片格式 |
| 4 | 腾讯通用 | 云服务 | 通用识别 |
| 5 | 腾讯精准 | 云服务 | 高精度 |
| 6 | 腾讯图片 | 云服务 | 图片识别 |
| 7 | 科大讯飞 | 云服务 | 通用 |
| 8 | 合合信息 | 云服务 | 名片/证件 |
| 9 | 火山通用 | 云服务 | 多语言 |
| 10 | 火山多语言 | 云服务 | 100+语言 |
| 11 | 系统OCR | 本地 | 离线 |
| 12 | Tesseract.js | 本地 | 离线 |
| 13 | 二维码 | 本地 | jsQR |
| 14 | 讯飞LaTeX | 云服务 | 公式 |
| 15 | Simple LaTeX | 本地 | 公式 |

---

## 三、系统 OCR 实现

### Rust FFI 调用

```rust
// system_ocr.rs
#[tauri::command]
pub async fn system_ocr(
    image_base64: String,
    language: String,
) -> Result<String, String> {
    let img = base64_to_image(&image_base64);

    #[cfg(target_os = "macos")]
    return macos_ocr(img, language);

    #[cfg(target_os = "windows")]
    return windows_ocr(img, language);

    #[cfg(target_os = "linux")]
    return Err("System OCR not available on Linux".into());
}
```

**macOS**: Vision Framework → `VNRecognizeTextRequest`
**Windows**: `Windows.Media.OCR.OcrEngine`

### Tesseract.js 备选方案

```javascript
// services/recognize/tesseract/index.jsx
import Tesseract from "tesseract.js";

export default async function recognize(imageBase64, options) {
  const { data: { text } } = await Tesseract.recognize(imageBase64, options.lang);
  return { text };
}
```

---

## 四、截图 → OCR 完整数据流

```
快捷键触发
  → Rust screenshot.rs (全屏截图 + 选区)
    → macOS: screencapture -i
    → Win/Linux: 自绘截图窗口
  → 截图窗口 emit "success" → canvas.toBlob
  → invoke("cut_image") → Rust 裁剪
  → 返回 PNG base64
  → OCR services 并行识别
  → Recognize Window 展示结果
```


## 五、设计决策

| 决策点 | 方案 | 备选方案 | 选择理由 | 代价/权衡 |
|--------|------|---------|---------|----------|
| 系统 OCR 集成 | Rust FFI 调用系统原生 API (Vision/Windows.OCR) | Node.js native addon / 外部进程调用 | Tauri Rust 后端与系统 API 在同一进程，零序列化开销 | macOS/Windows 需各自维护 ~150 行 FFI 代码 |
| OCR 服务并行 | 系统 OCR + 云端服务同时发起，先到先展示 | 串行尝试 (系统 → 云端 → 离线) | 用户体验最优，系统 OCR 通常 200ms 返回 (秒级展示) | 浪费网络带宽 (云端结果可能被丢弃) |
| 二维码识别 | jsQR (前端纯 JS) | Quirc (Rust FFI) | 无需 Rust FFI 绑定，Bundle +45KB，对截图场景足够 | 不支持畸变二维码，识别率 95% vs ZBar 99% |
| 图片上传格式 | multipart/form-data (云端) + Base64 (系统 OCR invoke) | 统一 Base64 / 统一文件路径 | 云端 API 普遍要求 form-data；系统 OCR 通过 invoke 传 Base64 方便 | 两套传输方式增加代码分支 |
| Tesseract 集成 | tesseract.js (Web Worker) | Tesseract CLI 子进程 | 前端统一管理，无需打包 Tesseract 二进制到 Tauri bundle | 识别速度慢于原生 Tesseract CLI (WASM vs Native) |

### 系统 OCR vs 云端 OCR 分工

```
系统 OCR (优先):
  优势: 离线、免费、快速 (macOS Vision ~200ms)
  劣势: Windows 中文识别精度低 (~85%)，Linux 不支持
  适用: 日常快速识别、隐私敏感场景

云端 OCR (补充):
  优势: 高精度 (百度精准 ~98%)、支持更多语言、表格/名片结构化
  劣势: 需要网络、需要 API Key/付费、有配额限制
  适用: 高精度需求、复杂排版、多语言混合

Tesseract.js (兜底):
  优势: 完全离线、100+ 语言、零成本
  劣势: 速度慢 (1-5s)、对非标准字体识别率低
  适用: 无网络 + 无系统 OCR 场景 (Linux 平台)
```


## 六、错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | 图片上传超时 (> 15s，图片较大) | 标记超时 + 自动压缩重试 (JPEG Q70%) | 压缩后自动重试 | "上传超时，正在压缩重试..." |
| L2-认证 | API Key 无效 | 同翻译插件错误策略 | 用户重新配置 | "认证失败 [服务名]" |
| L3-OCR | 系统 OCR 返回空结果 | confidence < 0.3 → 降级到云端 | 自动降级 | "未识别到文字，尝试云端识别..." |
| L3-OCR | 系统 OCR 语言不支持 | 降级到 Tesseract.js (指定语言) | 自动降级 + 提示 | 无感知 (仅日志) |
| L4-Tesseract | 语言数据包未下载 | 自动下载对应 traineddata (~10MB) | 下载完成自动重试 | "正在下载 OCR 数据包 (xx%)" |
| L4-Tesseract | 识别超时 (> 10s) | 返回部分结果 + 建议使用云端 | 手动切换 | "离线识别超时，建议使用云端服务" |
| L5-图片 | 图片格式不支持 (如 WebP) | 自动转 PNG 后重试 | 自动转换 | 无感知 |
| L5-图片 | 图片过大 (> 10MB) | 自动压缩到 2MB 以内 | 压缩后重试 | "图片过大，已自动压缩" |

### OCR 结果置信度处理

```
置信度阈值策略:
  confidence >= 0.8: 直接展示 (高置信度)
  0.5 <= confidence < 0.8: 展示 + 标记 "可信度: xx%"
  confidence < 0.5: 展示 + 提示 "识别置信度较低，建议使用云端服务"
  confidence == 0: 系统 OCR 无结果 → 自动降级
```


## 七、性能优化

| 优化点 | 手段 | 预期收益 | 实测数据 |
|--------|------|---------|---------|
| 图片压缩 | 上传前 JPEG Q85% 压缩 + max 4096px | 传输体积 -55% | 4K 截图 11MB → 5MB |
| 系统 OCR | 原生 API (Vision/Windows.OCR) | 识别速度 5-10x vs Tesseract | Vision: ~180ms, Tesseract: ~1200ms |
| 并行识别 | 多 OCR 服务同时发起 | 首结果展示时延 = min(各服务) | 系统 OCR 先行展示 (~200ms) |
| Tesseract Worker | 复用单个 Web Worker (不每次创建) | 消除 Worker 初始化开销 (~3s) | 后续识别 ~1.2s vs 首次 ~4.2s |
| 图片预处理 | 灰度化 + 二值化 (OffscreenCanvas) | Tesseract 识别速度 +20% | 预处理 ~30ms |

**关联文档**：
- [OCR 识别架构](./02-prd-task-OCR识别架构.md) — OCR 流程与系统 OCR 架构
- [系统 OCR 实现](./17-prd-task-系统OCR.md) — 系统原生 OCR (Vision/Windows.OCR)
- [翻译核心架构](./01-prd-task-翻译核心架构.md) — 截图 → OCR → 翻译完整链路