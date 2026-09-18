---
doc_type: test
title: "YK-09-36: 多模态向量对齐 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-36"
source_prds: ["39-架构设计-多模态向量对齐"]
source_modules: ["39-prd-task-多模态向量对齐"]
source_okr: [yiknowledge-001]
---

# YK-09-36: 多模态向量对齐 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MM-01 | 文本查询→匹配图表 chunk | "架构图" → Mermaid 图表的 chunk 被检索到 |
| UT-MM-02 | 代码块独立向量化 | Python 代码块可被语义检索匹配 |
| UT-MM-03 | 跨模态检索 MRR | 多模态检索 MRR ≥ 单文本检索 |

---