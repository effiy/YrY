---
title: "Ollama config 解构无默认值 + Bing result[0] null safety"
tags: [bug, frontend, translate, ollama, bing, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/ollama/index.jsx, src/services/translate/bing/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# Ollama config 解构 + Bing null safety

---

## 一、Ollama — config 无默认值

`const { config, setResult, detect } = options` → config 为 undefined 时 `let { ... } = config` 抛出 TypeError。

**修复**: `const { config = {}, setResult, detect } = options;`

## 二、Bing — result[0] 无 null guard

`result[0].translations` → 空数组时 TypeError。

**修复**: `result?.[0]?.translations` — 可选链。

---

## 三、验证

- [x] `pnpm build` 通过