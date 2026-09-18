---
doc_type: test
title: "YK-09-28: 健康仪表盘 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-28"
source_prds: ["31-架构设计-健康仪表盘"]
source_modules: ["31-prd-task-健康仪表盘"]
source_okr: [yiknowledge-001]
---

# YK-09-28: 健康仪表盘 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-DB-01 | 文件总数/分类分布 | 数据与 MDB 一致 |
| UT-DB-02 | Frontmatter 合规率 | 合规文件数/总文件数 |
| UT-DB-03 | 过期文档预警 | 超 review_cycle 文档标记红色 |
| UT-DB-04 | 仪表盘数据刷新 | 新文件创建后仪表盘自动更新 |

---