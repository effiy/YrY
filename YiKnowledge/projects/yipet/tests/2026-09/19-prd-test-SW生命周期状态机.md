---
doc_type: test
title: "SW 生命周期状态机 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["19-架构设计-SW生命周期状态机"]
source_modules: ["19-prd-task-SW生命周期状态机"]
---

# SW 生命周期状态机 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 测试用例

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-LC01 | install→activate 流程 | 状态机正确流转 | P0 |
| TC-LC02 | running→idle→terminated | 空闲终止前持久化状态 | P0 |
| TC-LC03 | terminated→running | 唤醒后状态恢复正确 | P0 |
| TC-LC04 | 崩溃恢复 | 异常终止后恢复 | P1 |

## 出口准则

- [ ] P0 用例 100% 通过