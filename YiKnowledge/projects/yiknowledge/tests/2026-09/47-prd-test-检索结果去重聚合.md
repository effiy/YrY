---
doc_type: test
title: "YK-09-44: 检索结果去重聚合 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-44"
source_prds: ["47-架构设计-检索结果去重聚合"]
source_modules: ["47-prd-task-检索结果去重聚合"]
source_okr: [yiknowledge-001]
---

# YK-09-44: 检索结果去重聚合 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-DD-01 | SimHash 相似文档分组 | 3 篇相似文档→1 个群组 |
| UT-DD-02 | 群组展示代表+N | "xxx.md + 2 篇相关" |
| UT-DD-03 | 不相似文档独立展示 | 汉明距离 > 3 → 不聚合 |

---