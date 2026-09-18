---
doc_type: test
title: "YK-09-16: 知识库国际化内容管理 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-16"
source_prds: ["19-架构设计-知识库国际化内容管理"]
source_modules: ["19-prd-task-知识库国际化内容管理"]
source_okr: [yiknowledge-001]
---

# YK-09-16: 知识库国际化内容管理 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-I18N-01 | lang 字段解析 | frontmatter `lang: en` → MDB 记录 lang=en |
| UT-I18N-02 | 语言过滤检索 | `lang=en` 过滤 → 仅返回英文文档 |
| UT-I18N-03 | 跨语言检索 | 中文查询 → 多语言 Embedding 匹配英文文档 |

---