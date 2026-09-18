---
doc_type: test
title: "YK-09-29: 变更日志自动生成 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-29"
source_prds: ["32-架构设计-变更日志自动生成"]
source_modules: ["32-prd-task-变更日志自动生成"]
source_okr: [yiknowledge-001]
---

# YK-09-29: 变更日志自动生成 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-CL-01 | feat/fix/docs 分组 | commit 按类型分到对应 CHANGELOG 段落 |
| UT-CL-02 | MR 合并→CHANGELOG 更新 | CI 自动追加新条目 |
| UT-CL-03 | 无新 commit→不追加 | CHANGELOG 内容不变 |

---