---
doc_type: test
title: "CDN 资源加载 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["15-架构设计-CDN资源加载系统"]
source_modules: ["15-prd-task-CDN资源加载系统"]
---

# CDN 资源加载 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CDN01 | Vendor JS 预加载 | Vue/ElementPlus 正确加载 | P0 |
| TC-CDN02 | 版本号 URL | `vue@3.5.13/` 资源 200 | P1 |
| TC-CDN03 | 加载失败重试 3 次 | 失败→重试→最终降级 | P1 |
| TC-CDN04 | CSS 同步加载 | Pet 样式先于 JS 渲染 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过