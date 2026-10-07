---

doc_type: module
prd_task_id: "YP-09-S22"
title: "讯飞/合合/火山 OCR — 开发方案"
status: 已完成
priority: P2
owner: Pot-App 社区
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPot
project_id: yipot
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "33-prd-讯飞合合火山OCR.md"
tags: [开发方案, OCR, 讯飞, 合合, 火山]

type: task
---

# 讯飞/合合/火山 OCR — 开发方案

## 架构与数据流

```
UI Layer                        JS Service Layer                  External API
─────────                       ────────────────                  ────────────
OCR Window                      parallelDispatch (调度器)
       │                              │
       ▼                              ▼
ServiceSelector                Promise.allSettled([
                                   iflytek.execute(),         → api.xfyun.cn
                                   iflytek_intsig.execute(),  → api.xfyun.cn (名片)
                                   iflytek_latex.execute(),   → api.xfyun.cn (公式)
                                   volcengine.execute(),      → open.volcengineapi.com
                                   volcengine_multi.execute(),→ open.volcengineapi.com
                                   simple_latex.execute(),    → 本地 WASM/JS
                                   qrcode.execute()           → 本地 jsQR
                               ])
                                     │
                                     ▼
                              ResultAggregator
                                     │
                              特殊消费者:
                              ├── LaTeXRenderer (KaTeX → SVG)
                              └── Collection (名片 → 联系人)
```

**上游依赖**: `screenshot.rs` (截图图片) / `clipboard.rs` (二维码图片) / `lang_detect.rs` (火山多语言语言参数)
**下游消费者**: `LaTeXRenderer` (KaTeX 渲染) / `Collection` (结构化名片存储)

## 关键实现

### 讯飞 OCR 通用 (iflytek)

```javascript
// services/recognize/iflytek/index.jsx
import CryptoJS from "crypto-js";

function buildAuthUrl(host, apiKey, apiSecret) {
  const date = new Date().toUTCString();
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/its HTTP/1.1`;
  const signature = CryptoJS.enc.Base64.stringify(
    CryptoJS.HmacSHA256(signatureOrigin, apiSecret)
  );
  const authorization = `api_key="${apiKey}",algorithm="hmac-sha256",headers="host date request-line",signature="${signature}"`;
  return { authorization, date };
}

async function recognize(imageBase64, options) {
  const host = "api.xfyun.cn";
  const { authorization, date } = buildAuthUrl(host, options.apiKey, options.apiSecret);

  const params = {
    header: {
      app_id: options.appId,
      status: 3, // 3=通用文字识别
    },
    parameter: {
      ocr: { language: options.language || "cn|en", result: { encoding: "utf8", compress: "raw", format: "json" } },
    },
    payload: {
      image: { encoding: "jpg", image: imageBase64, status: 3 },
    },
  };

  const res = await fetch(`https://${host}/v2/its`, {
    method: "POST",
    headers: { Authorization: authorization, Date: date, "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  return { text: extractText(data), confidence: data.header?.code === 0 ? 0.9 : 0 };
}
```

### 合合信息名片 OCR (iflytek_intsig)

- 服务端点: `api.xfyun.cn/v1/service/v1/ocr/business_card`
- 结构化返回: `{ name, company, title, phone, email, address }`
- 无结构化内容时 fallback 到讯飞通用 OCR

```javascript
function extractBusinessCard(data) {
  const payload = data?.payload?.result?.parsed?.text || "";
  const fields = JSON.parse(payload);
  return {
    name: fields.name || "",
    company: fields.company || "",
    title: fields.title || "",
    phone: fields.phone || "",
    email: fields.email || "",
    address: fields.address || "",
    raw: fields,
  };
}
```

### 讯飞 LaTeX 公式识别 (iflytek_latex)

- 服务端点: `api.xfyun.cn/v1/service/v1/ocr/recognize_formula`
- 返回 LaTeX 字符串，经 KaTeX 渲染为 SVG
- 非公式图片返回空结果，提示"未检测到公式"

### 火山引擎 OCR (volcengine)

```javascript
// HMAC-SHA256 签名，与腾讯签名逻辑类似
function signVolcengine(method, path, query, headers, body, accessKey, secretKey) {
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonicalRequest = [method, path, query, canonicalHeaders(headers), signedHeaders, sha256(body)].join("\n");
  const stringToSign = ["HMAC-SHA256", dateISO, credentialScope(date, region, service), sha256(canonicalRequest)].join("\n");
  // ... signing key 计算
  return signature;
}
```

### Simple LaTeX (simple_latex)

- 纯前端实现，使用 Pix2Tex 模型 (ONNX/WASM)
- 仅单行公式，限制 20 token
- 无网络请求，完全离线可用

### 二维码解码 (qrcode)

```javascript
import jsQR from "jsqr";

async function decodeQR(imageBase64) {
  const img = await loadImage(imageBase64);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
  const result = jsQR(data, width, height);
  return result ? { text: result.data, location: result.location } : null;
}
```

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 合合信息集成方式 | 共享讯飞 API 通道 (APPID + APIKey + APISecret) | 合合信息为讯飞子品牌，减少认证逻辑重复 |
| LaTeX 实现策略 | 双轨: Simple LaTeX (本地离线) + 讯飞 LaTeX (在线高精度) | Simple LaTeX 响应 < 500ms 兜底，复杂公式降级到讯飞 |
| 二维码解码 | 纯前端 jsQR，不经过 Rust 层 | 响应 < 500ms，需 Rust 层 sentinel 可 plumb through |
| 火山多语言语言参数 | 依赖 `lang_detect.rs` 自动检测结果 | 避免用户手动选择 100+ 语言 |
| Simple LaTeX 复杂度限制 | 单行公式，最多 20 token | ONNX 模型能力边界，避免超长处理时间 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| 本地识别不阻塞主线程 | Simple LaTeX 和 jsQR 在 Web Worker 执行 | 不影响 UI 渲染 |
| 图片预处理下沉 | 合合信息图片压缩/格式转换在 Rust 层 | 避免 JS 层大图片 OOM |
| LaTeX 渲染缓存 | KaTeX 渲染结果用 LRU 缓存 (max 50) | 重复公式渲染 < 1ms |
| 二维码优先级 | 若检测到二维码模式，跳过文本 OCR 直接解码 | 节省在线 API 调用 |

## 错误处理

| 场景 | 分类 | 用户提示 | 恢复策略 |
|------|------|----------|----------|
| 合合信息无结构化内容 | fallback | 空结构化字段，自动降级到讯飞通用 OCR | 不报错，返回通用识别结果 |
| 讯飞 LaTeX 非公式图片 | empty | "未检测到公式" | 用户可手动触发通用 OCR |
| 二维码模糊/破损 | decode_fail | "无法识别二维码" | jsQR 返回 null，明确提示 |
| Simple LaTeX 复杂公式 | limit_exceeded | 返回部分结果或空 | 降级到讯飞 LaTeX (网络请求) |
| 火山 TLS 版本不兼容 (Win7) | tls_error | "请升级系统或手动安装 TLS 1.2 补丁" | 连接失败时检测 TLS 版本 |
| 讯飞并发限制 (> 5) | queue_full | 排队等待，最多 30s | 超时自动取消 |
| 火山多语言生僻语言 | low_confidence | 标注 "该语言识别精度有限" | 仍返回结果但附加 confidence < 0.85 |

## 交叉引用

- [32-prd-百度腾讯OCR](../prds/2026-09/32-prd-百度腾讯OCR.md) — 百度/腾讯 OCR 服务
- [34-prd-并行调度策略](../prds/2026-09/34-prd-并行调度策略.md) — 多 OCR 服务并行调度
- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — Rust 层截图和语言检测
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 结果前端展示
- [50-prd-task-百度腾讯OCR实现](./50-prd-task-百度腾讯OCR实现.md) — 百度/腾讯 OCR 开发方案