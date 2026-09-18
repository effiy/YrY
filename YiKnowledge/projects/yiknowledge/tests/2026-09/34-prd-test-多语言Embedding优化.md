---
doc_type: test
title: "YK-09-31: 多语言 Embedding 优化 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-31"
source_prds: ["34-架构设计-多语言Embedding优化"]
source_modules: ["34-prd-task-多语言Embedding优化"]
source_okr: [yiknowledge-001]
---

# YK-09-31: 多语言 Embedding 优化 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-ME-01 | 中文查询→英文文档匹配 | bge-m3 召回率 > 单语言模型 |
| UT-ME-02 | 英文查询→中文文档匹配 | 跨语言语义相似度 > 0.5 |
| UT-ME-03 | 维度变更 768→1024 | 索引重建后维度正确 |
| UT-ME-04 | A/B 对比 | 多语言模型 MRR ≥ 单语言模型 |

---