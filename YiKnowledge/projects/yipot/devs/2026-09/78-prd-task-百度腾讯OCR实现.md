---

doc_type: module
prd_task_id: "YP-09-S21"
title: "百度/腾讯 OCR — 开发方案"
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
source_prd: "32-prd-百度腾讯OCR.md"
tags: [开发方案, OCR, 百度, 腾讯]

type: task
---

# 百度/腾讯 OCR — 开发方案

## 架构与数据流

```
UI Layer                        JS Service Layer                  External API
─────────                       ────────────────                  ────────────
Translate/OCR Window            parallelDispatch (调度器)
       │                              │
       ▼                              ▼
ServiceSelector.jsx           Promise.allSettled([
       │                        baidu.execute(),
       ▼                        baidu_accurate.execute(),
  ResultAggregator             baidu_img.execute(),
       │                        tencent.execute(),
       ▼                        tencent_accurate.execute(),
  TargetArea/TextArea           tencent_img.execute()
                              ])
                                     │
                                     ▼
                              access_token 缓存层 (百度)
                              TC3-HMAC-SHA256 签名 (腾讯)
                                     │
                                     ▼
                              api.baidu.com / aip.baidubce.com
                              ocr.tencentcloudapi.com
```

**上游依赖**: `clipboard.rs` (截图图片) / `screenshot.rs` (截图流程) / `tauri-plugin-store` (API Key)
**下游消费者**: `Translate/index.jsx` (翻译管道) / `Collection` (生词本保存)

## 关键实现

### 百度 Access Token 缓存

```javascript
// services/recognize/baidu/auth.js
let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken(apiKey, secretKey) {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
  const res = await fetch(
    `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`
  );
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 3600) * 1000; // 提前 1h 刷新
  return cachedToken;
}
```

### 百度通用 OCR (baidu)

```javascript
export default async function recognize(imageBase64, options) {
  const token = await getAccessToken(options.apiKey, options.secretKey);
  const params = new URLSearchParams({
    image: imageBase64,
    language_type: options.language || "CHN_ENG",
    detect_direction: "true",
  });
  const res = await fetch(
    `https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`,
    { method: "POST", body: params }
  );
  const data = await res.json();
  if (data.error_code) throw { status: data.error_code, message: data.error_msg };
  return {
    text: data.words_result.map((w) => w.words).join("\n"),
    confidence: data.words_result_num > 0 ? 0.9 : 0,
    raw: data.words_result,
  };
}
```

### 百度精准 OCR (baidu_accurate)

- URL: `rest/2.0/ocr/v1/accurate_basic`
- 返回 `words_result` 含 `location` 字段: `{top, left, width, height}`
- bounding box 四元组格式，用于 OCR 窗口文本高亮

### 腾讯 TC3-HMAC-SHA256 签名

```javascript
import CryptoJS from "crypto-js";

function signTC3(secretId, secretKey, service, action, payload) {
  const now = new Date();
  const timestamp = Math.floor(now.getTime() / 1000);
  const date = now.toISOString().slice(0, 10);

  // 1. 规范请求
  const canonicalRequest = [
    "POST", "/", "",
    `content-type:application/json\nhost:${service}.tencentcloudapi.com\n`,
    "content-type;host", CryptoJS.SHA256(payload).toString()
  ].join("\n");

  // 2. 待签字符串
  const stringToSign = [
    "TC3-HMAC-SHA256", timestamp,
    `${date}/${service}/tc3_request`,
    CryptoJS.SHA256(canonicalRequest).toString()
  ].join("\n");

  // 3. 签名计算
  const kDate = CryptoJS.HmacSHA256(date, `TC3${secretKey}`);
  const kService = CryptoJS.HmacSHA256(service, kDate);
  const kSigning = CryptoJS.HmacSHA256("tc3_request", kService);
  const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString();

  return `TC3-HMAC-SHA256 Credential=${secretId}/${date}/${service}/tc3_request, SignedHeaders=content-type;host, Signature=${signature}`;
}
```

### 腾讯 OCR 服务映射

| 服务 | Action | API 端点 | 特点 |
|------|--------|----------|------|
| 腾讯通用 | GeneralBasicOCR | ocr.tencentcloudapi.com | 通用识别 |
| 腾讯精准 | GeneralAccurateOCR | ocr.tencentcloudapi.com | 高精度 + 位置坐标 |
| 腾讯图片 | RecognizeGeneralOCR | ocr.tencentcloudapi.com | PNG/JPG/WEBP/BMP，<= 4MB |

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| Access Token 管理 | 前端缓存 30 天，提前 1h 刷新 | 减少百度 API 认证请求，避免 key 暴露到 Rust 层 |
| 签名位置 | 前端 CryptoJS (腾讯) | 与翻译服务签名逻辑统一，避免 Rust 层依赖 JS 加密库 |
| 图片预处理 | 灰度化 + 对比度增强 (Rust 层) | 提高识别率，减少 JS 主线程负担 |
| 服务注册 | `services/recognize/{name}/info.ts` | 统一服务发现，设置页面自动扫描、启用/禁用 |
| 坐标格式 | bounding box 四元组 (top, left, w, h) | 与各 OCR API 返回格式对齐 |

## 性能优化

| 优化项 | 措施 | 效果 |
|--------|------|------|
| Token 缓存 | 内存缓存 access_token，29 天有效期 | 单次请求节省 ~200ms 认证往返 |
| 图片压缩 | Rust 层压缩 > 4MB 图片到 <= 4MB | 减少上传带宽 60-80% |
| 并发控制 | 同服务最多 3 并发，不同服务不互阻塞 | 避免触发百度 API 限流 |
| 请求去重 | 同一图片 + 同一服务 2s 内只发一次 | 避免重复 OCR 开销 |

## 错误处理

| 错误码/场景 | 分类 | 用户提示 | 恢复策略 |
|------------|------|----------|----------|
| 百度 API 返回 error_code | auth/quota/server | 根据 error_msg 显示中文提示 | 引导更新 Key 或等待配额恢复 |
| 腾讯 401/403 | auth | "密钥无效或已过期" | 引导到设置页重新配置 |
| 腾讯 429 | quota | "今日配额已用尽" | 次日自动恢复，显示剩余配额 |
| 空白图片 (无文字) | empty | "未检测到文字" | 不报错，返回空结果 |
| 图片 > 10MB | client_error | "图片过大，请压缩后重试" | Rust 层自动压缩到 4MB |
| 网络超时 10s | timeout | "网络连接超时" | 自动重试 1 次 (间隔 2s) |

## 交叉引用

- [33-prd-讯飞合合火山OCR](../prds/2026-09/33-prd-讯飞合合火山OCR.md) — 其他 OCR 服务
- [34-prd-并行调度策略](../prds/2026-09/34-prd-并行调度策略.md) — 多 OCR 服务并行调度
- [42-prd-Rust截图OCR语言检测](../prds/2026-09/42-prd-Rust截图OCR语言检测.md) — Rust 层截图和系统 OCR
- [36-prd-OCR窗口交互](../prds/2026-09/36-prd-OCR窗口交互.md) — OCR 结果的前端展示
- [51-prd-task-讯飞合合火山OCR](./51-prd-task-讯飞合合火山OCR.md) — 其他 OCR 服务开发方案