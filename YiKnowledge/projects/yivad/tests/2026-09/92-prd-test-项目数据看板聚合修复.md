---
prd_task_id: "YV-09-92"
title: "项目数据看板聚合修复 — 测试用例"
status: 已完成
priority: 中
owner: Chengliang.Yi
source_prds: ["92-prd-项目数据看板聚合修复"]
source_modules: ["YV-09-92-1"]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, Bug修复, 后端]
category: 项目/管理后台/测试
roles: [engineer]
test_execution_date: 2026-09-23
source: YiVad
benefit: "测试用例：项目数据看板聚合修复"
lifecycle: active
---

# 项目数据看板聚合修复 — 测试用例

> 来源 PRD: [92-prd-项目数据看板聚合修复](../../prds/2026-09/92-prd-项目数据看板聚合修复.md)

---

## L3 数据验证

### TC-01：Issue 总数

| 属性 | 值 |
|------|-----|
| 操作 | `POST /analytics/dashboard {"project_key":"yivad"}` |
| 预期 | `by_project.project_key=yivad` → `issues=544` |
| 结果 | ✅ 544 |

### TC-02：Done 计数

| 属性 | 值 |
|------|-----|
| 预期 | `done=206` (106 "Done" + 92 "done" + 8 native done) |
| 结果 | ✅ 206 |

### TC-03：Overdue = 0

| 属性 | 值 |
|------|-----|
| 预期 | `overdue=0` (535 条无 due_date 不再误计) |
| 结果 | ✅ 0 |

### TC-04：Unassigned = 0

| 属性 | 值 |
|------|-----|
| 预期 | `unassigned=0` (150 条已批量分配) |
| 结果 | ✅ 0 |

### TC-05：project_key 合并

| 属性 | 值 |
|------|-----|
| 预期 | `by_project` 仅一条 `project_key=yivad` |
| 结果 | ✅ 仅一条 |

---

## 回归

| # | 回归项 | 结果 |
|---|--------|------|
| RG-01 | 无 project_key 参数时返回全量数据 | ✅ |
| RG-02 | 其他项目 (yiai) 数据不受影响 | ✅ |