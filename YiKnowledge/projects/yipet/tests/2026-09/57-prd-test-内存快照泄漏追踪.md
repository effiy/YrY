---
doc_type: test
title: "内存快照泄漏追踪 — 测试用例"
status: 待开始
owner: 陈铭
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["57-性能-内存快照泄漏追踪"]
---

# 内存快照泄漏追踪 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-MEM01 | JS Heap < 50MB | 性能预算 | P2 |
| TC-MEM02 | DOM Nodes < 500 | 节点预算 | P2 |
| TC-MEM03 | 10min 增长 < 5MB | 无泄漏 | P2 |