---
doc_type: test
title: "YK-09-40: 文档权威性 PageRank — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-40"
source_prds: ["43-架构设计-文档权威性PageRank"]
source_modules: ["43-prd-task-文档权威性PageRank"]
source_okr: [yiknowledge-001]
---

# YK-09-40: 文档权威性 PageRank — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-PR-01 | 高引用文档得分高 | 被 5 篇引用的文档得分 > 被 1 篇引用的文档 |
| UT-PR-02 | 无引用文档得分 > 0 | 阻尼因子 d=0.85 确保每个文档有基础分 |
| UT-PR-03 | RAG 检索排序集成 | 同相似度时，权威文档排前 |

---