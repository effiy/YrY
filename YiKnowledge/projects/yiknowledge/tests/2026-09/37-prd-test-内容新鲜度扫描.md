---
doc_type: test
title: "YK-09-34: 内容新鲜度扫描 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-34"
source_prds: ["37-架构设计-内容新鲜度扫描"]
source_modules: ["37-prd-task-内容新鲜度扫描"]
source_okr: [yiknowledge-001]
---

# YK-09-34: 内容新鲜度扫描 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-FR-01 | 超 review_cycle 文档标记 | overdue_ratio > 1 → 标记 "需审查" |
| UT-FR-02 | 企微通知策展人 | 过期文档列表发送 |
| UT-FR-03 | Dashboard 过期文档列表 | 按 overdue 天数降序 |

---