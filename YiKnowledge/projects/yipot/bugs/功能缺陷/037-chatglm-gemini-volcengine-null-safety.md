---
title: "ChatGLM/Gemini/Volcengine config 解构 + promptList null safety"
tags: [bug, frontend, translate, chatglm, gemini, volcengine, null-safety]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/{chatglm,geminipro,volcengine}/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: rare
roles: [engineer]
---

# ChatGLM/Gemini/Volcengine config + promptList null safety

---

## 一、现象

三个 AI 翻译引擎的 `config` 解构无默认值，`promptList.map()` 无 null guard。

- **ChatGLM**: `apiKey.split('.')` 在 undefined 上调用 TypeError
- **Gemini**: `item.parts[0].text` 深层访问无保护
- **Volcengine**: `CryptoJS.HmacSHA256(date, secret)` 中 secret 可能为 undefined

## 二、修复

| 文件 | 修复 |
|------|------|
| `chatglm/index.jsx` | `config = {}` + `apiKey` 前置检查 + `(promptList \|\| []).map()` |
| `geminipro/index.jsx` | `config = {}` + `(promptList \|\| []).map()` |
| `volcengine/index.jsx` | `config = {}` |

## 三、验证

- [x] `pnpm build` 通过