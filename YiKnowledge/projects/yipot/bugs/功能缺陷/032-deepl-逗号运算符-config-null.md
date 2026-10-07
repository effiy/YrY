---
title: "DeepL/index.jsx 逗号运算符误用 + config 解构无默认值"
tags: [bug, frontend, translate, deepl, comma-operator, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/deepl/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# DeepL 逗号运算符误用 + config null safety

---

## 一、现象

> Line 115 使用逗号运算符 `(result.translations, result.translations[0])` 而非逻辑与 `result.translations && result.translations[0]`。此外 `const { config } = options` 无默认值。

## 二、根因

**逗号运算符**: `(a, b)` 总是返回 `b`，`a` 被求值但丢弃。实际效果等同于 `result.translations[0]`（无 null guard）。

```js
// Before (line 115):
if ((result.translations, result.translations[0])) {

// After:
if (result.translations && result.translations[0]) {
```

**config 解构**: 追加默认值 `= {}`。

## 三、验证

- [x] `pnpm build` 通过