---
doc_type: test
title: "YK-09-49: 内容难度评级 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-49"
source_prds: ["52-架构设计-内容难度评级"]
source_modules: ["52-prd-task-内容难度评级"]
source_okr: [yiknowledge-001]
---

# YK-09-49: 内容难度评级 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-DF-01 | HSK 1-2 级词汇为主→beginner | 80% 词汇 ≤ HSK 2 → beginner |
| UT-DF-02 | 技术术语密度高→advanced | 术语密度 > 15% → advanced |
| UT-DF-03 | frontmatter 写入 | `difficulty: intermediate` 写入 |

---