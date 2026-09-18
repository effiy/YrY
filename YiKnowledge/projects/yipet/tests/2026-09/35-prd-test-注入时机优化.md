---
doc_type: test
title: "注入时机优化 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["35-性能-注入时机优化"]
source_modules: ["35-prd-task-注入时机优化"]
---

# 注入时机优化 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-TIM01 | CSS 先于 JS | document_start 注入 CSS 避免闪烁 | P0 |
| TC-TIM02 | 脚本在 end 注入 | DOM 就绪后注入 JS | P1 |
| TC-TIM03 | Pet 懒渲染 | 用户可见时才渲染 | P1 |