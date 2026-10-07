---

doc_type: test
prd_test_id: "YP-09-115"
title: "YP-09-115: CDN 依赖版本审计 — 测试方案"
status: planned
priority: P1
owner: unassigned
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiPet
project_id: yipet
prd_month: "202609"
source_prd: "115-基础设施-CDN依赖版本审计.md"
tags: [cdn, testing, planned]

type: test
---

# YP-09-115: CDN 依赖版本审计 — 测试方案

## 1. 测试用例

| ID | 用例 | 验证方法 |
|----|------|---------|
| TC-01 | `YiPet.load('gsap')` 加载 GSAP 3.x | `window.gsap.version` 含主版本号 |
| TC-02 | `YiPet.load('vue')` 正常 | `window.Vue.version` |
| TC-03 | `YiPet.load('mermaid')` 正常 | `window.mermaid` 存在 |
| TC-04 | GSAP 旧 key 兼容 | `YiPet.load('gsap-legacy')` 注入 TweenMax |
| TC-05 | catalog.ts 所有 60+ key 可解析 | `catalogByKey[key]` 非 undefined |
| TC-06 | 全局重复注入防护 | 连续两次 `YiPet.load('vue')` 第二次返回 false |
| TC-07 | CDN CSS 加载 | 页面 `<head>` 中 `<link>` 标签存在 |
| TC-08 | typecheck | `vue-tsc --noEmit` |
| TC-09 | 回归测试 | `npm test` 138/138 |

## 2. 自动化

```bash
npm run typecheck && npm test && npm run build
```