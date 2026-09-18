---
doc_type: test
title: "滚动性能优化 — 测试用例"
status: 已完成
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["69-性能-滚动性能优化"]
---

# 滚动性能优化 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-SCR01 | passive 监听 | 不阻塞滚动 | P1 |
| TC-SCR02 | rAF 节流 | 60fps | P1 |