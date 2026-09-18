---
doc_type: test
title: "YK-09-32: 批量知识迁移自动化 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-32"
source_prds: ["35-架构设计-批量知识迁移自动化"]
source_modules: ["35-prd-task-批量知识迁移自动化"]
source_okr: [yiknowledge-001]
---

# YK-09-32: 批量知识迁移自动化 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-BM-01 | 目录级迁移 10 文件 | 全部移动到目标目录，引用全部更新 |
| UT-BM-02 | MDB 索引同步 | knowledge_files path 字段全部更新 |
| UT-BM-03 | 迁移后 RAG 检索正常 | 按旧关键词仍可找到文件（redirect 生效） |

---