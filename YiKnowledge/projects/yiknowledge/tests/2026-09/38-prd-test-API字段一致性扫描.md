---
doc_type: test
title: "YK-09-35: API 字段一致性扫描 — 测试用例"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
prd_task_id: "YK-09-35"
source_prds: ["38-架构设计-API字段一致性扫描"]
source_modules: ["38-prd-task-API字段一致性扫描"]
source_okr: [yiknowledge-001]
---

# YK-09-35: API 字段一致性扫描 — 测试用例

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-AP-01 | `filter` vs `query` 漂移检测 | TS 使用 `query` → 报告不一致 |
| UT-AP-02 | `target_file` vs `path` 漂移检测 | TS 使用 `path` → 报告不一致 |
| UT-AP-03 | 一致→无报告 | 参数名匹配 → 扫描通过 |

---