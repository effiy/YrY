---
doc_type: test
title: "YK-09-17: 知识库访问控制 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-17"
source_prds: ["20-架构设计-知识库访问控制"]
source_modules: ["20-prd-task-知识库访问控制"]
source_okr: [yiknowledge-001]
---

# YK-09-17: 知识库访问控制 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AC-01 | access=public | 所有角色可检索 |
| UT-AC-02 | access=internal | engineer+curator 可检索，viewer 不可 |
| UT-AC-03 | access=restricted | 仅 curator 可检索 |
| UT-AC-04 | 未声明 access | 默认 internal |
| IT-AC-01 | RAG 检索过滤 | viewer 搜索 → restricted 文档不在结果中 |

---