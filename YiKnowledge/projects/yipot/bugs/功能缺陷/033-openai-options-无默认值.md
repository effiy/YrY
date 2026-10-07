---
title: "OpenAI/index.jsx options 参数无默认值导致 TypeError"
tags: [bug, frontend, translate, openai, null-safety, options]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/openai/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# OpenAI options 参数无默认值

---

## 一、现象

> `translate(text, from, to, options)` 中 `options` 无默认值。调用方未传 options 时，`const { config } = options` 抛出 TypeError。

## 二、修复

```js
// Before:
export async function translate(text, from, to, options) {
    const { config, setResult, detect } = options;
    let { service, ... } = config;

// After:
export async function translate(text, from, to, options = {}) {
    const { config = {}, setResult, detect } = options;
    let { service, ... } = config || {};
```

## 三、验证

- [x] `pnpm build` 通过