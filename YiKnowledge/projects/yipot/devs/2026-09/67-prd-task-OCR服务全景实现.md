---

doc_type: module
prd_task_id: "YP-09-M08"
title: "OCR 服务接口全景 — 开发方案"
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

# OCR 服务接口全景 — 开发方案

> 来源 PRD：[06-prd-OCR服务接口全景.md](../../prds/2026-09/06-prd-OCR服务接口全景.md)
> 需求编号：YP-09-M08 · 优先级：P0 · 人天：4d

> **文档职责**：本文档定义 14 个 OCR 服务插件的**统一实现模式**、图片预处理管线、错误恢复与重试机制（HOW/WHY），不含产品目标。

---

## 一、OCR 服务拓扑

### 1.1 完整服务矩阵

```
OCR 服务 (14 个)
├── 云 OCR (9 个) — 需 API Key
│   ├── 百度系 (3): 通用 / 精准 / 图片
│   ├── 腾讯系 (3): 通用 / 精准 / 图片
│   ├── 讯飞系 (1): 通用 + LaTeX 公式
│   ├── 合合信息 (1): 名片/证件结构化
│   └── 火山引擎 (1): 通用 + 多语言
├── 本地 OCR (3 个) — 离线 / 无 API Key
│   ├── macOS Vision Framework (系统 OCR)
│   ├── Windows.Media.OCR (系统 OCR)
│   └── Tesseract.js (跨平台降级)
├── 二维码 (1 个) — 本地
│   └── jsQR 解码
└── 公式识别 (1 个) — 本地
    └── Simple LaTeX OCR
```

### 1.2 统一服务接口

```typescript
// 所有 OCR 插件共享此接口
interface OCRService {
  info: {
    id: string;
    name: string;
    type: 'recognize';
    subtype: 'cloud' | 'local' | 'qrcode' | 'formula';
    requiresAuth: boolean;
    languages: string[];
  };
  
  // 核心识别方法
  recognize(imageBase64: string, options?: RecognizeOptions): Promise<OCRResult>;
}

interface RecognizeOptions {
  language?: string;
  detectDirection?: boolean;
  returnPosition?: boolean;  // 是否返回文字坐标
}

interface OCRResult {
  text: string;
  confidence: number;        // 0 ~ 1
  language?: string;
  blocks?: TextBlock[];      // 带位置信息的文字块
  raw?: any;                 // 原始响应 (调试用)
}

interface TextBlock {
  text: string;
  boundingBox: { x: number; y: number; width: number; height: number };
  confidence: number;
}
```

---

## 二、云 OCR 实现模式

### 2.1 百度系 (3 个) — 统一签名方案

```typescript
// 百度 OCR 通用实现: baidu_base.ts
async function baiduAuth(apiKey: string, secretKey: string): Promise<string> {
  // OAuth 2.0 Client Credentials
  const response = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  );
  const { access_token } = await response.json();
  return access_token;
}

async function baiduOCR(
  imageBase64: string, 
  endpoint: string,  // 'accurate_basic' | 'general_basic' | etc.
  accessToken: string
): Promise<OCRResult> {
  const formData = new URLSearchParams({
    image: imageBase64.replace(/^data:image\/\w+;base64,/, ''), // 去前缀
    detect_direction: 'true',
    paragraph: 'true',
  });
  
  const response = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/${endpoint}?access_token=${accessToken}`,
    { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: formData }
  );
  
  const data = await response.json();
  return {
    text: data.words_result?.map((w: any) => w.words).join('\n') || '',
    confidence: calculateConfidence(data.words_result),
    raw: data,
  };
}

// 三个变体
// baidu/index.ts         → endpoint = 'general_basic'
// baidu_accurate/index.ts → endpoint = 'accurate_basic'  
// baidu_img/index.ts     → endpoint = 'webimage'
```

### 2.2 腾讯系 (3 个) — HMAC-SHA1 签名

```typescript
// 腾讯 OCR 签名算法
function tencentSign(secretId: string, secretKey: string, payload: string): Headers {
  const timestamp = Math.floor(Date.now() / 1000);
  const [hash, now] = [/* HMAC-SHA1 签名计算 */];
  return {
    'Authorization': hash,
    'X-TC-Action': 'GeneralBasicOCR', // 或 AccurateOCR / RecognizeTableOCR
    'X-TC-Timestamp': timestamp.toString(),
  };
}
```

### 2.3 通用 HTTP 客户端

所有云 OCR 请求统一通过 HTTP client 层，自动走代理配置：

```typescript
// httpClient.ts — 统一网络层
async function ocrRequest(url: string, options: RequestInit): Promise<Response> {
  // 1. 检查代理设置
  const proxyUrl = await getProxyConfig();
  
  // 2. 超时控制: 云 OCR 5s 超时
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  
  // 3. 发起请求
  const response = await fetch(url, { ...options, signal: controller.signal });
  clearTimeout(timer);
  
  return response;
}
```

---

## 三、本地 OCR 实现

### 3.1 系统 OCR (Rust FFI)

```rust
// Rust 侧 — 通过 Tauri command 调用系统 OCR
#[cfg(target_os = "macos")]
#[tauri::command]
fn system_ocr(image_base64: String) -> Result<OCRResult, String> {
    use objc::*; // Vision Framework FFI
    // VNRecognizeTextRequest → 配置 recognitionLanguages
    // 返回 { text, confidence, blocks }
}

#[cfg(target_os = "windows")]
#[tauri::command]
fn system_ocr_windows(image_base64: String) -> Result<OCRResult, String> {
    // Windows.Media.OCR.OcrEngine
}
```

### 3.2 Tesseract.js (Web Worker)

```typescript
// tesseractWorker.ts — 在 Web Worker 中运行, 不阻塞 UI
import Tesseract from 'tesseract.js';

self.onmessage = async (e: MessageEvent<{ image: string; lang: string }>) => {
  const worker = await Tesseract.createWorker(e.data.lang, 1, {
    logger: (m) => self.postMessage({ type: 'progress', progress: m.progress }),
  });
  
  const { data } = await worker.recognize(e.data.image);
  await worker.terminate();
  
  self.postMessage({
    type: 'result',
    text: data.text,
    confidence: data.confidence,
  });
};
```

**决策理由**：Web Worker 隔离 Tesseract 的 CPU 密集型操作，避免阻塞 React 主线程。首次加载语言包耗时较长（中文可能 5s+），Worker 内的 progress 回调可反馈给 UI 进度条。

---

## 四、自动选择与降级策略

### 4.1 智能选择引擎

```typescript
class OCRServiceSelector {
  async selectStrategy(imageBase64: string, userConfig: ServiceConfig[]): Promise<Strategy> {
    const hasNetwork = await checkNetwork();
    
    if (!hasNetwork) {
      // 完全离线 → 系统 OCR → Tesseract 降级
      return { services: ['system', 'tesseract'], timeout: 3000 };
    }
    
    // 预热图片分析: 检测文字密度和语言
    const { density, lang } = await quickAnalyze(imageBase64);
    
    if (lang.length > 1) {
      // 多语言 → 火山多语言 OCR 优先
      return { services: ['volcengine_multi_lang', 'baidu_accurate', 'tencent'], timeout: 5000 };
    }
    
    if (lang[0] === 'zh') {
      // 中文 → 百度精准 OCR 优先
      return { services: ['baidu_accurate', 'tencent', 'system'], timeout: 5000 };
    }
    
    // 默认: 系统 OCR → 通用云 OCR
    return { services: ['system', 'tencent', 'baidu'], timeout: 5000 };
  }
}
```

### 4.2 重试机制

| 错误类型 | 重试次数 | 退避策略 | 最大等待 | 最终降级 |
|---------|---------|---------|---------|---------|
| 网络超时 | 3 次 | 1s / 3s / 5s 指数退避 | 9s | 系统 OCR |
| API 限流 (429) | 2 次 | Retry-After 头 | 10s | 下一优先级 |
| 认证失败 (401) | 0 次 | 不重试 | — | 提示检查 API Key |
| 服务不可用 (503) | 2 次 | 2s / 5s 固定间隔 | 7s | 下一优先级 |
| 图片过大 | 0 次 | 不重试 | — | 自动压缩后重试 |

---

## 五、二维码识别

```typescript
// 使用 jsQR 库, 同步解码
import jsQR from 'jsqr';

function decodeQRCode(imageData: ImageData): QRResult | null {
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  if (!code) return null;
  return { text: code.data, type: 'qrcode' };
}
```

**性能**：在 Canvas 中预缩放图片 → 提取 ImageData → jsQR 解码, 全流程 ≤ 500ms。

---

## 六、公式识别 (LaTeX)

讯飞 LaTeX OCR 将手写/印刷数学公式转为 LaTeX 代码。Simple LaTeX 作为本地 fallback：

```typescript
// 讯飞 LaTeX OCR — 云端
async function iflytekLatexOCR(imageBase64: string): Promise<string> {
  // POST to 讯飞公式识别 API
  // return: '\\frac{d}{dx}\\int_0^x f(t)dt'
}

// Simple LaTeX — 本地 (基于 pix2tex 等模型)
// 精度低于云服务, 但离线可用
```

---

## 七、交叉引用

- 开发方案: [29-prd-task-OCR截图实现](./29-prd-task-OCR截图实现.md)
- 开发方案: [05-prd-task-OCR服务插件实现](./05-prd-task-OCR服务插件实现.md)
- 开发方案: [17-prd-task-系统OCR](./17-prd-task-系统OCR.md)
- 开发方案: [25-prd-task-Rust截图OCR](./25-prd-task-Rust截图OCR.md)
- 开发方案: [27-prd-task-百度腾讯OCR](./27-prd-task-百度腾讯OCR.md)
- 开发方案: [28-prd-task-讯飞合合火山OCR](./28-prd-task-讯飞合合火山OCR.md)
- PRD: [02-prd-OCR与截图识别](../../prds/2026-09/02-prd-OCR与截图识别.md)
- PRD: [22-prd-系统OCR离线识别](../../prds/2026-09/22-prd-系统OCR离线识别.md)
- PRD: [23-prd-Tesseract离线OCR](../../prds/2026-09/23-prd-Tesseract离线OCR.md)