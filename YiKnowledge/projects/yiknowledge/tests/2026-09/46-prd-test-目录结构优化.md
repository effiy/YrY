---
doc_type: test
title: "YK-09-43: 目录结构优化 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-43"
source_prds: ["46-架构设计-目录结构优化"]
source_modules: ["46-prd-task-目录结构优化"]
source_okr: [yiknowledge-001]
---

# YK-09-43: 目录结构优化 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-DR-01 | 异常文档检测 | "架构设计"文档在 "srer/" 目录→标记异常 |
| UT-DR-02 | 重组建议 | 异常文档→建议移动到最相似的目录 |
| UT-DR-03 | 批量执行不丢引用 | `git mv` + 引用更新后链接全部有效 |

---