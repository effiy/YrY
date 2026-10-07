---
title: "YouDao/index.jsx config 解构无默认值"
tags: [bug, frontend, translate, youdao, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: yipot
module: src/services/translate/youdao/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# YouDao config 解构无默认值

---

## 一、现象

> `const { config } = options` 无默认值，config 未传入时后续解构 `const { appkey, key } = config` 抛出 TypeError。

## 二、修复

```js
// Before:
const { config } = options;
const { appkey, key } = config;

// After:
const { config = {} } = options;
const { appkey, key } = config;
```

## 三、验证

- [x] `pnpm build` 通过