---
doc_type: test
title: "YK-09-45: 内容摘要自动生成 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-45"
source_prds: ["48-架构设计-内容摘要自动生成"]
source_modules: ["48-prd-task-内容摘要自动生成"]
source_okr: [yiknowledge-001]
---

# YK-09-45: 内容摘要自动生成 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SM-01 | 摘要 ≤200 字 | LLM 生成的 description ≤ 200 字符 |
| UT-SM-02 | frontmatter 写入 | description 字段写入 frontmatter |
| UT-SM-03 | 已有摘要不重复生成 | 已存在 description → 跳过 |

---