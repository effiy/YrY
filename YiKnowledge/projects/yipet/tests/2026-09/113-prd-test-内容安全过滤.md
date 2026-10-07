---

doc_type: test
title: "内容安全过滤 — 测试用例"
status: 方案已编写
owner: 陈铭
created: 2026-09-11
updated: 2026-09-23
priority: P2
project: YiPet
roles: [engineer, qa]
prd_month: "202609"
source_prds: ["113-功能实现-内容安全过滤.md"]
source_modules: ["113-prd-task-内容安全过滤.md"]

type: test
---

# 内容安全过滤 — 测试用例

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。
| 编号 | 用例 | 预期 | 优先级 |
|------|------|------|--------|
| TC-CF01 | 敏感词过滤 | 拒绝发送 | P1 |
| TC-CF02 | PII 脱敏 | 手机/邮箱掩码 | P1 |

