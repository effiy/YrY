---

doc_type: test
title: "回复置信度标注 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["95-架构设计-回复置信度标注.md"]
source_modules: ["95-prd-task-回复置信度标注.md"]

type: test
---

# 回复置信度标注 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CF01 | 高置信度 🟢 | 确定性回答 | P3 |
| TC-CF02 | 低置信度 🔴 | 不确定警告 | P3 |

