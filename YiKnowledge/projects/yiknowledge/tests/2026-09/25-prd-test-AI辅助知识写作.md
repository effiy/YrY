---
doc_type: test
title: "YK-09-22: AI 辅助知识写作 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-22"
source_prds: ["25-架构设计-AI辅助知识写作"]
source_modules: ["25-prd-task-AI辅助知识写作"]
source_okr: [yiknowledge-001]
---

# YK-09-22: AI 辅助知识写作 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AI-01 | 草稿生成含 RAG 上下文 | 主题"微服务架构"→草稿含现有知识库术语 |
| UT-AI-02 | 质量预检：章节完整性 | 对照模板检查 → 缺失章节列表 |
| UT-AI-03 | 质量预检：链接有效性 | 死链 → 标记 |

---