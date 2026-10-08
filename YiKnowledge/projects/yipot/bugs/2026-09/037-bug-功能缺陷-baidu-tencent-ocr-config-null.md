---
title: "Baidu OCR/Tencent OCR config 解构无默认值"
tags: [bug, frontend, ocr, baidu, tencent, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/recognize/baidu/index.jsx, src/services/recognize/tencent/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Baidu/Tencent OCR config 解构无默认值

---

## 一、现象

> Baidu OCR 和 Tencent OCR 的 `recognize()` 函数中 `const { config } = options` 无默认值，后续 `const { client_id, client_secret } = config` 在 config 未传入时抛出 TypeError。

## 二、修复

两个文件统一修复：

```js
// Before:
const { config } = options;
const { ... } = config;

// After:
const { config = {} } = options;
const { ... } = config;
```

- `src/services/recognize/baidu/index.jsx:4`
- `src/services/recognize/tencent/index.jsx:7`

## 三、验证

- [x] `pnpm build` 通过