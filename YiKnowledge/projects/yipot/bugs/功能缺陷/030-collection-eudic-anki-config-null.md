---
title: "Eudic/Anki 生词本服务 config 解构无默认值"
tags: [bug, frontend, collection, eudic, anki, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p3
project: yipot
module: src/services/collection/eudic/index.jsx, src/services/collection/anki/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Eudic/Anki 生词本 config 解构无默认值

---

## 一、现象

> `collection()` 函数中 `const { config } = options` 在 config 未传入时解构 `undefined`，后续 `config['name']` 抛出 TypeError。

## 二、修复

两处统一修复：

```js
// Before:
const { config } = options;

// After:
const { config = {} } = options;
```

## 三、验证

- [x] `pnpm build` 通过