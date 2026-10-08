---
title: "TTS Lingva config 解构无默认值 + HTTP 错误静默返回 undefined"
tags: [bug, frontend, tts, lingva, null-safety, error-handling]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/tts/lingva/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# TTS Lingva config 解构无默认值 + HTTP 错误静默

---

## 一、现象

> `config` 未定义时 `let { requestPath } = config` 抛出 TypeError。HTTP 非 200 时函数返回 `undefined`（无错误提示）。

## 二、修复

```js
// config 默认值 + try/catch + HTTP 错误 throw
const { config = {} } = options;
try {
    const res = await fetch(...);
    if (res.ok) return res.data?.audio;
    throw `Http Error: ${res.status}`;
} catch (e) {
    throw `TTS failed: ${e.message || e}`;
}
```

## 三、验证

- [x] `pnpm build` 通过