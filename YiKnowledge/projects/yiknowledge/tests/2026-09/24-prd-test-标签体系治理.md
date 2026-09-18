---
doc_type: test
title: "YK-09-21: 标签体系治理 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-21"
source_prds: ["24-架构设计-标签体系治理"]
source_modules: ["24-prd-task-标签体系治理"]
source_okr: [yiknowledge-001]
---

# YK-09-21: 标签体系治理 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-TG-01 | 标签合并 "检索增强"→"RAG" | 全库所有 "检索增强" 替换为 "RAG" |
| UT-TG-02 | 标签重命名 "ML"→"机器学习" | 全库 "ML" 替换为 "机器学习" |
| UT-TG-03 | 标签废弃 | 标记 deprecated，MDB 保留历史数据 |

---