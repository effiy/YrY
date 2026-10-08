---

doc_type: test
title: "上下文压缩提示 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["91-架构设计-上下文压缩提示.md"]
source_modules: ["91-prd-task-上下文压缩提示.md"]

type: test
---

# 上下文压缩提示 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CTX01 | >80% token→警告 | 黄色提醒 | P2 |
| TC-CTX02 | 摘要压缩 | 保留关键消息 | P2 |

