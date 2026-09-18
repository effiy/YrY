---
doc_type: test
title: "YK-09-41: 检索个性化排序 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-41"
source_prds: ["44-架构设计-检索个性化排序"]
source_modules: ["44-prd-task-检索个性化排序"]
source_okr: [yiknowledge-001]
---

# YK-09-41: 检索个性化排序 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-PS-01 | engineer → 技术文档优先 | "架构"查询→技术类文档排前 |
| UT-PS-02 | producter → 需求文档优先 | "用户"查询→PRD 文档排前 |
| UT-PS-03 | 冷启动→角色默认权重 | 无历史行为→使用角色默认权重 |
| UT-PS-04 | 10+ 行为→个性化权重 | 积累行为后权重从个性化学习 |

---