---
doc_type: test
title: "错误追踪与可观测性 — 测试用例"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
---

# 错误追踪与可观测性 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-OBS01 | window.onerror | 全局错误捕获 | P2 |
| TC-OBS02 | unhandledrejection | Promise 错误 | P2 |
| TC-OBS03 | PerformanceObserver | 性能指标 | P3 |