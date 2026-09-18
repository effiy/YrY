---
doc_type: test
title: "聊天消息虚拟滚动 — 测试用例"
status: 已完成
priority: 中
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiPet
prd_month: "202609"
source_prds: ["18-性能-聊天消息虚拟滚动"]
source_modules: ["18-prd-task-聊天消息虚拟滚动"]
---

# 聊天消息虚拟滚动 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-VS01 | 100+消息虚拟滚动 | DOM ≤ 20 节点，60fps | P0 |
| TC-VS02 | 自动滚底 | 新消息→自动滚动到底 | P0 |
| TC-VS03 | 回到底部按钮 | 上滚后显示浮动按钮 | P1 |
| TC-VS04 | 内存 < 50MB | 1000 条消息内存达标 | P1 |