---
doc_type: test
title: "YK-09-38: 检索片段优化 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-38"
source_prds: ["41-架构设计-检索片段优化"]
source_modules: ["41-prd-task-检索片段优化"]
source_okr: [yiknowledge-001]
---

# YK-09-38: 检索片段优化 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SN-01 | 句子边界截断 | 片段以 `。！？. ! ?` 结尾，非词中间 |
| UT-SN-02 | 关键词居中对齐 | 匹配词在片段中间位置 |
| UT-SN-03 | 短文档扩展上下文 | < 200 字的文档返回更多上下文 |

---