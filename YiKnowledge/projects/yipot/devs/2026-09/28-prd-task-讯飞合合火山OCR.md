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

type: task
---

# 讯飞/合合/火山 OCR — 开发方案

## 源码

`YiPot/src/services/recognize/iflytek/`、`iflytek_intsig/`、`iflytek_latex/`
`YiPot/src/services/recognize/volcengine/`、`volcengine_multi_lang/`
`YiPot/src/services/recognize/simple_latex/`、`qrcode/`

## 科大讯飞 OCR

```javascript
// HMAC-SHA256 签名
const sign = CryptoJS.HmacSHA256(
  `POST\n${host}\n${path}\n${date}`,
  secret
).toString(CryptoJS.enc.Base64);
```

## 合合信息 (intsig)

- 名片/证件结构化识别
- 返回: `{name, title, company, phone, email, address}`

## LaTeX 公式识别

### 讯飞 LaTeX (iflytek_latex)

```javascript
export default async function recognize(imageBase64, options) {
  const res = await fetch("https://rest-api.iflytek.com/v1/ocr/latex", {
    headers: { "X-Appid": options.appId, "X-CurTime": ..., "X-Param": ..., "X-CheckSum": ... },
    body: imageBase64
  });
  const data = await res.json();
  return { text: data.latex, confidence: data.confidence };
}
```

### Simple LaTeX (simple_latex)

- 本地公式识别，无需 API Key
- 基于简单规则匹配
- 适用: 基础数学公式

## 二维码 (qrcode)

```javascript
import jsQR from "jsqr";

export default async function recognize(imageBase64, options) {
  const img = await loadImage(imageBase64);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, canvas.width, canvas.height);
  if (!code) throw new Error("二维码未识别");
  return { text: code.data, type: "qrcode" };
}
```

## 火山 OCR

```javascript
// HMAC-SHA256 签名
const headers = {
  "X-Date": new Date().toUTCString(),
  "Authorization": `HMAC-SHA256 Credential=${ak}, SignedHeaders=..., Signature=${sign}`
};
```

- 通用 OCR: 基本文字识别
- 多语言 OCR: 100+ 语言支持，自动语言检测