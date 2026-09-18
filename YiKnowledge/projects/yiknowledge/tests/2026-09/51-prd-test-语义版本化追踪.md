---
doc_type: test
title: "YK-09-48: 语义版本化追踪 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-48"
source_prds: ["51-架构设计-语义版本化追踪"]
source_modules: ["51-prd-task-语义版本化追踪"]
source_okr: [yiknowledge-001]
---

# YK-09-48: 语义版本化追踪 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SV-01 | 相似文档→版本关联 | Embedding cos > 0.8 → 标记为版本链 |
| UT-SV-02 | 不同文档→不关联 | cos < 0.5 → 不标记版本关系 |
| UT-SV-03 | 版本时间线 | v1→v2→v3 按时间排序展示 |

---