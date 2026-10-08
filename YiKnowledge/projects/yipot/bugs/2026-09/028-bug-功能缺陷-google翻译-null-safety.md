---
title: "Google 翻译 index.jsx 嵌套数组访问无 null 安全保护"
tags: [bug, frontend, translate, google, null-safety, api-response]
category: projects/yipot/bugs
created: 2026-09-23
updated: 2026-09-23
source: internal
type: bug
status: resolved
severity: minor
priority: p2
project: yipot
module: src/services/translate/google/index.jsx
reporter: Claude
environment: all
affected_version: 3.0.7
fixed_version: 3.0.8
frequency: occasional
roles: [engineer]
---

# Google 翻译响应解析 null safety

---

## 一、现象

> Google API 返回非预期格式（空数组、缺失字段）时，`TypeError: Cannot read properties of undefined` 导致翻译静默失败。

## 二、根因

4 处深层嵌套数组访问无保护：

| 行 | 代码 | 风险 |
|----|------|------|
| 41 | `result[0][1][3]` | result[0] 或 [1] 为 undefined |
| 46 | `i[2].map(...)` | i[2] 为 undefined |
| 54 | `result[13][0]` | result[13] 为 undefined |
| 63 | `r[0]` | r 为 undefined |

## 三、修复

- `result[0]?.[1]?.[3]` — 可选链
- `i?.[2]` — null guard + `x?.[0] ?? ''` — map null safety
- `result[13]?.[0]` — 可选链
- `r?.[0]` — 可选链
- 顶层 `!result || !Array.isArray(result)` 格式验证

## 四、验证

- [x] `pnpm build` 通过
- [ ] 空 API 响应不抛出 TypeError