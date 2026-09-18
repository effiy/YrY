---
doc_type: test
title: "YK-09-20: 贡献者激励机制 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-20"
source_prds: ["23-架构设计-贡献者激励机制"]
source_modules: ["23-prd-task-贡献者激励机制"]
source_okr: [yiknowledge-001]
---

# YK-09-20: 贡献者激励机制 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SC-01 | 新建文档 +5 分 | 作者积分 +5 |
| UT-SC-02 | 排行榜月度聚合 | 按积分降序，Top-10 |
| UT-SC-03 | Dashboard API 返回 | `{monthly: [...], quarterly: [...], yearly: [...]}` |

---