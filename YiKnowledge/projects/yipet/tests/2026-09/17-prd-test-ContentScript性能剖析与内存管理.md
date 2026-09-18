---
doc_type: test
title: "Content Script 性能剖析 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["17-稳定性-ContentScript性能剖析与内存管理"]
source_modules: ["17-prd-task-ContentScript性能剖析与内存管理"]
---

# Content Script 性能剖析 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-PRF01 | Event Listener 清理 | `onUnmounted` 中移除 | P0 |
| TC-PRF02 | MutationObserver disconnect | 页面卸载时断开 | P0 |
| TC-PRF03 | 定时器清理 | clearInterval/Timeout | P1 |
| TC-PRF04 | DOM 引用释放 | 无闭包持有已移除节点 | P1 |