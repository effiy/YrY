---
doc_type: test
title: "YK-09-19: 大文件分片与索引懒加载 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-19"
source_prds: ["22-架构设计-大文件分片与索引懒加载"]
source_modules: ["22-prd-task-大文件分片与索引懒加载"]
source_okr: [yiknowledge-001]
---

# YK-09-19: 大文件分片与索引懒加载 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CH-01 | `##` 标题分片 | 5 个 `##` → 5 个 chunk |
| UT-CH-02 | chunk 级检索 | 搜索 chunk B 内容 → 仅返回 chunk B（非全文件） |
| UT-CH-03 | 懒加载 | 文件未被检索 → 索引不包含该文件 chunk |

---