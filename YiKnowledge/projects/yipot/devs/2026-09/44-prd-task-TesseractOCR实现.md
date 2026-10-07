---

doc_type: module
prd_task_id: "YP-09-S12"
title: "Tesseract.js 离线 OCR — 开发方案"
status: 已完成
priority: P1
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "23-prd-Tesseract离线OCR.md"

type: task
---

# Tesseract.js 离线 OCR — 开发方案

> 来源 PRD：[23-prd-Tesseract离线OCR.md](../../prds/2026-09/23-prd-Tesseract离线OCR.md)

## 架构概览

```
用户截图
      │
      ▼
┌───────────────────────────────────────────────────┐
│         OCR 引擎选择器 (services/recognize/)       │
│                                                    │
│  if (platform === "macos" || "windows")            │
│    → system_ocr (原生 API)                         │
│  else (linux) 或 用户手动选择                       │
│    → tesseract_ocr                                  │
│                                                    │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│           Tesseract Service (React/JS)             │
│                                                    │
│  recognize(imageBase64, { lang: "eng+chi_sim" })   │
│    │                                                │
│    │  1. 检查语言包缓存 (local dir)                 │
│    │     ├── 已下载 → 直接使用                      │
│    │     └── 未下载 → 自动下载 (progress 回调)      │
│    │                                                │
│    │  2. Tesseract.recognize(image, lang)           │
│    │     ├── WASM Worker (独立线程, 不阻塞 UI)      │
│    │     ├── 图片预处理 (canvas resize + binarize)  │
│    │     └── 逐行识别 → 文字拼接                    │
│    │                                                │
│    ▼  { text, confidence, words[] }                │
└───────────────────────┬───────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────┐
│  识别结果 (text string)                            │
│    → 翻译窗口展示                                  │
│    → 或直接复制到剪贴板                            │
└───────────────────────────────────────────────────┘
```

## 核心实现

### 源码位置

前端 `services/recognize/tesseract/index.jsx`

### Tesseract 识别服务

```javascript
// services/recognize/tesseract/index.jsx
import Tesseract from "tesseract.js";

const LANG_CACHE_DIR = "tesseract_langs";  // 本地语言包缓存

export default async function recognize(imageBase64, options = {}) {
  const language = options.language || "eng+chi_sim";

  // 1. 图片预处理：过大图片缩放以加速识别
  const processedImage = await preprocessImage(imageBase64, {
    maxWidth: 2048,
    maxHeight: 2048,
    binarize: true,        // 二值化提高对比度
  });

  // 2. 执行识别 (WASM Worker 异步)
  const { data } = await Tesseract.recognize(processedImage, language, {
    // 语言包按需下载路径
    langPath: `/${LANG_CACHE_DIR}`,
    
    // 进度回调：下载语言包 / 识别进度
    logger: (info) => {
      if (info.status === "downloading traineddata") {
        options.onProgress?.(info.progress);  // 0~1
      }
    },
  });

  return {
    text: data.text,
    confidence: data.confidence,                   // 0~100 置信度
    words: data.words.map(w => ({                  // 逐词解析
      text: w.text,
      bbox: w.bbox,                                // { x0, y0, x1, y1 }
      confidence: w.confidence,
    })),
    source: "tesseract",
  };
}
```

### 图片预处理

```javascript
async function preprocessImage(base64, { maxWidth, maxHeight, binarize }) {
  const img = await loadImage(base64);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // 按比例缩放
  let { width, height } = img;
  if (width > maxWidth || height > maxHeight) {
    const scale = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  // 二值化：提高 OCR 准确率
  if (binarize) {
    const imageData = ctx.getImageData(0, 0, width, height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const gray = imageData.data[i] * 0.299 
                 + imageData.data[i + 1] * 0.587 
                 + imageData.data[i + 2] * 0.114;
      const bw = gray > 128 ? 255 : 0;
      imageData.data[i] = imageData.data[i + 1] 
        = imageData.data[i + 2] = bw;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  return canvas.toDataURL();
}
```

### 语言包管理

```javascript
// 常用语言包映射
const LANG_MAP = {
  "zh": "chi_sim",       // 简体中文
  "zh-TW": "chi_tra",    // 繁体中文
  "en": "eng",
  "ja": "jpn",
  "ko": "kor",
  "fr": "fra",
  "de": "deu",
  "es": "spa",
  // ... 100+ 语言
};

// 语言包按需下载 (~10MB each)
// 首次使用 → Tesseract.js 自动 fetch → 缓存到 TesseractWorker 默认路径
// 后续使用 → 直接读取缓存
```

---

## 设计决策

| 决策点 | 方案 | 备选 | 理由 | 代价 |
|--------|------|------|------|------|
| 运行环境 | React 前端 (JS/WASM) | Rust FFI 调用 Tesseract C++ | 无需 Rust 交叉编译 C++ 库，WASM 一次构建全平台可用 | WASM 性能比原生 C++ 慢 ~30% |
| 语言包分发 | 按需下载 (CDN) | 打包进安装包 | 安装包体积可控 (~50MB vs 500MB+) | 首次使用需网络 + 等待下载 |
| OCR Worker | Web Worker (独立线程) | 主线程 | 不阻塞 UI 渲染，长时间识别不影响交互 | Worker 通信开销 (~10ms 序列化) |
| 图片预处理 | Canvas 二值化 + 缩放 | 原始图片 | 固定阈值二值化显著提高 Tesseract 准确率 | 彩色文字场景可能丢失信息 |
| 多语言 | 一次识别同步执行 | 多次识别取最佳 | 一次指定所有语言 (eng+chi_sim+jpn)，Tesseract 内部多模型并行 | 语言越多越慢 |
| 位置策略 | Linux 主引擎 + 其他平台手动切换 | 全平台默认 | Linux 无系统 OCR，Tesseract 是唯一选择 | macOS/Windows 上用户需手动切换到 Tesseract |

---

## 性能优化

| 优化点 | 目标 | 方案 | 效果 |
|--------|------|------|------|
| 语言包缓存 | 第二次识别 0s 下载 | 自动缓存到 TesseractWorker 内部路径 | 首次 ~10s 下载 → 后续 <2s 识别 |
| 图片缩放 | 识别速度提升 | 大图等比缩放到 2048px，减小 WASM 处理量 | 4K 截图从 8s → 2s |
| 二值化预处理 | 准确率提升 | Canvas 固定阈值 128 二值化 | 低对比度文字识别率 +10~15% |
| Worker 线程 | UI 不冻结 | Tesseract.recognize 内部自动使用 Web Worker | 识别时交互流畅 |
| 语言包复用 | 避免重复下载 | 检查 `langPath` 目录现有文件 | 跨会话语言包持久化 |

---

## 错误处理与恢复

| 错误层级 | 错误类型 | 处理策略 | 恢复方式 | 用户感知 |
|---------|---------|---------|---------|---------|
| L1-网络 | 语言包下载失败 | 提示重试 → 降级到系统 OCR (macOS/Windows) | 自动切换引擎 | Toast "语言包下载失败，已切换到系统 OCR" |
| L1-引擎 | Tesseract WASM 加载失败 | 降级到系统 OCR | 自动切换 | 无感知 |
| L2-识别 | 图片无文字区域 | 返回空字符串 | 翻译窗口提示 | "未检测到文字" |
| L2-识别 | confidence < 30% | 标记低置信度，前端展示时加提示 | 用户可手动选择其他 OCR 引擎 | 识别结果前加 "[低置信度]" |
| L3-输入 | 图片格式不支持 | 前端校验 → 转为 PNG 后重试 | 自动格式转换 | 无感知 |
| L3-输入 | 图片完全空白 | 提前返回空结果，不调用 Tesseract | 避免无效计算 | 无感知 |

---

**关联文档**：
- 系统 OCR：[43-prd-task-系统OCR实现.md](./43-prd-task-系统OCR实现.md)
- OCR 服务插件：[05-prd-task-OCR服务插件实现.md](./05-prd-task-OCR服务插件实现.md)
- 测试方案：[23-prd-test-Tesseract离线OCR](../../tests/2026-09/23-prd-test-Tesseract离线OCR.md)