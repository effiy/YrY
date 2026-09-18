---
doc_type: test
title: "YK-09-15: 多模态内容支持 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-15"
source_prds: ["18-架构设计-多模态内容支持"]
source_modules: ["18-prd-task-多模态内容支持"]
source_okr: [yiknowledge-001]
---

# YK-09-15: 多模态内容支持 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MM-01 | 图片 alt 提取 | `![RAG 架构图](rag.png)` → alt "RAG 架构图" 可检索 |
| UT-MM-02 | Mermaid 节点提取 | 流程图 → 节点标签文本被索引 |
| UT-MM-03 | 代码块注释提取 | `# 连接 MongoDB` 注释被索引 |
| IT-MM-01 | 多模态 RAG 检索 | 搜索"MongoDB 连接" → 代码块注释匹配的结果返回 |

---