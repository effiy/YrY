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

type: task
---

# 百度/腾讯 OCR — 开发方案

## 源码

`YiPot/src/services/recognize/baidu/`、`baidu_accurate/`、`baidu_img/`
`YiPot/src/services/recognize/tencent/`、`tencent_accurate/`、`tencent_img/`

## 百度 OCR

### 通用 OCR (baidu)

```javascript
export default async function recognize(imageBase64, options) {
  const params = new URLSearchParams({
    image: imageBase64,
    language_type: options.language || "CHN_ENG"
  });
  const res = await fetch(`https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic?access_token=${token}`, {
    method: "POST", body: params
  });
  const data = await res.json();
  return {
    text: data.words_result.map(w => w.words).join("\n"),
    confidence: data.words_result_num > 0 ? 0.9 : 0
  };
}
```

### 精准 OCR (baidu_accurate)

- URL: `rest/2.0/ocr/v1/accurate_basic`
- 返回 `words_result` 含 `location` 字段: `{top, left, width, height}`
- 适用: 需要文字位置信息的场景

### 图片 OCR (baidu_img)

- URL: `rest/2.0/ocr/v1/general`
- 支持更多图片格式 (WebP, BMP 等)

## 腾讯 OCR

```javascript
// TC3-HMAC-SHA256 签名
import CryptoJS from "crypto-js";

function sign(secretId, secretKey, service, action, payload) {
  const date = new Date().toISOString().slice(0, 10);
  // 1. 规范请求
  // 2. 待签字符串
  // 3. 计算签名
  return `TC3-HMAC-SHA256 Credential=${secretId}/${date}/${service}/tc3_request, SignedHeaders=..., Signature=${sig}`;
}
```

| 服务 | Action | 特点 |
|------|--------|------|
| 腾讯通用 | GeneralBasicOCR | 通用识别 |
| 腾讯精准 | GeneralAccurateOCR | 高精度 + 位置 |
| 腾讯图片 | RecognizeGeneralOCR | 图片优化 |

## 设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| Access Token | 缓存 30 天 (百度) | 减少认证请求频率 |
| 签名位置 | 前端 (腾讯 TC3) | 与翻译服务的签名逻辑一致 |
| 图片预处理 | 灰度化 + 对比度增强 | 提高识别率 |