---

doc_type: test
title: "Webhook 集成 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["75-架构设计-Webhook集成.md"]
source_modules: ["75-prd-task-Webhook集成.md"]

type: test
---

# Webhook 集成 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-WHK01 | AI 回复完成事件 | POST webhook URL | P2 |
| TC-WHK02 | 会话创建事件 | webhook 触发 | P2 |
| TC-WHK03 | Bug 提交事件 | webhook 触发 | P2 |

