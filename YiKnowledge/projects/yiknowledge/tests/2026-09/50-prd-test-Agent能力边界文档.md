---
doc_type: test
title: "YK-09-47: Agent 能力边界文档 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-47"
source_prds: ["50-架构设计-Agent能力边界文档"]
source_modules: ["50-prd-task-Agent能力边界文档"]
source_okr: [yiknowledge-001]
---

# YK-09-47: Agent 能力边界文档 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AB-01 | 能力边界注入 system prompt | Agent 不尝试超越能力边界的操作 |
| UT-AB-02 | Hallucination 模式记录 | 已知幻觉模式被文档化 |
| UT-AB-03 | 边界外操作→Agent 拒绝 | "执行代码"→Agent 回复不支持 |

---