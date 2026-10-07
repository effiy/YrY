---
title: "info.ts 语言枚举系统性缺口"
tags: [bug, frontend, info.ts, language, coverage]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: acknowledged
severity: minor
priority: p3
project: yipot
module: src/services/**/info.ts
reporter: Claude
environment: all
affected_version: 3.0.7
---

# info.ts 语言枚举系统性缺口

---

## 一、发现

全部 36 个服务的 `info.ts` 中 Language enum 与 `languageList` (30 语言) 存在不同程度缺口：

| 缺口 | 服务数 | 说明 |
|------|--------|------|
| 30 (无 enum) | 10 | AI 引擎 — 接受任意语言，无需 enum |
| 8-15 | 10 | 传统引擎 — 缺少蒙语/挪威语/葡萄牙语等 |
| 16-29 | 16 | 有限语言集引擎 — 仅支持主流语言 |

## 二、影响

非致命 — 服务调用时 Language enum 缺失不会导致崩溃，但会导致 UI 语言选择器中该语言不可选。

## 三、建议

| 优先级 | 行动 |
|--------|------|
| P3 | 传统引擎（baidu/tencent/google/youdao）补全支持的 ISO 639-1 语言 |
| P3 | AI 引擎（openai/ollama/deepl）无需 Language enum，接受任意语言 |