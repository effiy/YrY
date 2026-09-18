---
doc_type: test
title: "YK-09-39: Agent 辅助 FAQ 生成 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-39"
source_prds: ["42-架构设计-Agent辅助FAQ生成"]
source_modules: ["42-prd-task-Agent辅助FAQ生成"]
source_okr: [yiknowledge-001]
---

# YK-09-39: Agent 辅助 FAQ 生成 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-FQ-01 | 关键概念提取 | 文档→提取 3-5 个关键概念 |
| UT-FQ-02 | Q&A 对生成 | 每个关键概念→1-3 个 FAQ 条目 |
| UT-FQ-03 | 输出 Markdown 格式 | Q&A 对含 `## Q:` 和 `**A:**` 格式 |

---