---
doc_type: test
title: "YK-09-30: 静态站点生成 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-30"
source_prds: ["33-架构设计-静态站点生成"]
source_modules: ["33-prd-task-静态站点生成"]
source_okr: [yiknowledge-001]
---

# YK-09-30: 静态站点生成 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-SS-01 | VitePress build 成功 | `dist/` 生成静态文件 |
| UT-SS-02 | 全文搜索可用 | 客户端搜索返回结果 |
| UT-SS-03 | CI 部署成功 | Pages URL 可访问 |

---