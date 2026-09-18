---
doc_type: test
title: "长会话性能优化 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
---

# 长会话性能优化 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-LS01 | >100条虚拟滚动 | DOM ≤20 | P1 |
| TC-LS02 | 分页加载 | 首屏 <200ms | P1 |
| TC-LS03 | IndexedDB | >10MB 异步 | P2 |