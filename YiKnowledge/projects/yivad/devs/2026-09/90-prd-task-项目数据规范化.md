---
prd_task_id: "YV-09-90"
title: "YV-09-90: 项目数据规范化 — 开发方案"
status: 已完成
priority: P0
owner: Chengliang.Yi
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.35
source_prd: "90-prd-项目数据规范化.md"
tags: [开发方案, 数据规范化, 数据清洗, 批量修复, 单元测试]
type: task
category: 项目/管理后台/开发
implementation_status: 全部完成
source: YiVad
benefit: "开发方案：task-项目数据规范化"
lifecycle: active
---

# YV-09-90: 项目数据规范化 — 开发方案

> 关联 PRD: [90-prd-项目数据规范化](../prds/2026-09/90-prd-项目数据规范化.md)
> 关联 Test: [90-prd-test-项目数据规范化](../tests/2026-09/90-prd-test-项目数据规范化.md)

---

## 任务拆解

### Task 1: 创建 `normalizeIssue()` 代码层规范化函数

| 属性 | 值 |
|------|-----|
| 文件 | `src/api/modules/issueService.ts`（+27 行）|
| 优先级 | P0 — 阻塞 Task 2 |
| 估算 | 0.10d |
| 状态 | ✅ 已完成 |

**6 字段映射**：

| 输出字段 | 数据源（优先级递减） | 默认值 |
|---------|-------------------|--------|
| `status` | `STATUS_NORM[raw.status]` → `toLowerCase().replace(/\s+/g, "_")` | `""` |
| `issue_type` | `raw.issue_type` → `raw.type` → `norm()` | `"task"` |
| `priority` | `raw.priority` → `norm()` | `"medium"` |
| `assignee` | `raw.assignee` (string check) | `""` |
| `updated_at` | `raw.updated_at` → `raw.updatedTime` → `raw.updatedAt` | `undefined` |
| `created_at` | `raw.created_at` → `raw.createdAt` → `raw.createdTime` | `undefined` |

**内部 `STATUS_NORM` 映射表**：`Done→done, Cancelled→cancelled, Backlog→backlog, "To Do"→todo, "In Progress"→in_progress, "In Review"→in_review, Review→in_review`

---

### Task 2: 三条数据加载路径接入

| 属性 | 值 |
|------|-----|
| 文件 | useProjectDetail.ts, useProjectData.ts, issueStore.ts（6 行变更）|
| 优先级 | P0 — 依赖 Task 1 |
| 估算 | 0.05d |
| 状态 | ✅ 已完成 |

```typescript
// 模式：三条路径统一
issues.value = ((res.data?.list as Issue[]) ?? []).map(i => normalizeIssue(i) as Issue);
```

覆盖 4 个加载点：`useProjectDetail.fetchProject`、`useProjectData.load`、`useProjectData.silentRefresh`、`issueStore.fetchIssues`。

---

### Task 3: MongoDB 数据层 — Issue 状态批量修复（3 轮）

| 属性 | 值 |
|------|-----|
| 目标 | MongoDB `issues` 集合 |
| 优先级 | P0 |
| 估算 | 0.08d |
| 状态 | ✅ 已完成 |

| 轮次 | 目标 | 数量 | 筛选条件 | 操作 |
|------|------|------|---------|------|
| 1 | 原生逾期 Issue | 2 | `key: yivad-3, yivad-6` | status → done |
| 2 | 导入的 "In Progress" | 46 | `status: "In Progress"` + 非 yivad- key | status → done |
| 3 | 导入的 "Review" | 46 | `status: "Review"` + 非 yivad- key | status → done |

**方式**：Python 脚本通过 RPC `update_document` API，每批 10 条并发（`ThreadPoolExecutor(10)`），共 10 批次。

---

### Task 4: MongoDB 数据层 — assignee 批量填充

| 属性 | 值 |
|------|-----|
| 目标 | MongoDB `issues` 集合 |
| 优先级 | P0 |
| 估算 | 0.05d |
| 状态 | ✅ 已完成 |

**筛选条件**：`status NOT IN (done, cancelled)` AND `assignee 为空或不存在`

**填充值**：`"Chengliang Yi"`（4 个模块 lead 均为同一人）

**执行**：150 条，15 批次 × 10 并发，全部成功。

---

### Task 5: MongoDB 数据层 — 模块 due_date 修复

| 属性 | 值 |
|------|-----|
| 目标 | MongoDB `modules` 集合 |
| 优先级 | P0 |
| 估算 | 0.02d |
| 状态 | ✅ 已完成 |

| 模块 | 问题 | 修复 |
|------|------|------|
| yivad-m1 Frontend Dashboard | due 2026-09-15（已过期 8 天） | → 2026-09-30 |
| yivad-m2 Agent Mode | due 2026-08-08（已 completed） | → 移除 |
| yivad-m4 Views Restructuring | due 2026-09-18（已 completed） | → 移除 |

---

### Task 6: 单元测试 + 文档

| 属性 | 值 |
|------|-----|
| 文件 | `tests/api/normalizeIssue.test.ts`（新建，246 行）|
| 优先级 | P0 |
| 估算 | 0.05d |
| 状态 | ✅ 已完成 — 31/31 通过 |

7 个 describe 块：status(10) + issue_type(6) + priority(5) + assignee(3) + date fields(9) + idempotency(4) + real-world(2)。

---

## 实现顺序与依赖

```
Task 1 (normalizeIssue)
  ├── Task 2 (三条路径接入)
  └── Task 6 (单元测试)

Task 3 (Issue 状态修复) — 独立
Task 4 (assignee 填充)  — 独立
Task 5 (模块 due_date)  — 独立
```

---

## 效果：BEFORE → AFTER

| 指标 | Before | After | 修复方式 |
|------|--------|-------|---------|
| 已完成 | 4 | **139** | Task 3（+93 条状态修复） |
| 完成率 | 2% | **70%** | — |
| 逾期 | 2 | **0** | Task 3 第 1 轮 |
| 未分配(open) | 150 | **0** | Task 4 |
| 类型 "?" | 191 | **0** | Task 1+2 |
| 优先级 "?" | 191 | **0** | Task 1+2 |
| 日期缺失 | 191 | **0** | Task 1+2 |
| 模块过期 | 3 | **0** | Task 5 |

## 文件变更统计

| 指标 | 数值 |
|------|------|
| 修改文件 (代码) | 4（issueService, useProjectDetail, useProjectData, issueStore） |
| 新建文件 (测试) | 1（normalizeIssue.test.ts, 246 行, 31 用例） |
| MongoDB 更新 | 247 条记录（94 status + 150 assignee + 3 module） |
| 知识文档 | 3（PRD + Dev + Test）|

## 质量门禁

- [x] `vue-tsc --noEmit` 无新增错误
- [x] 31 个 Vitest 单元测试全部通过
- [x] normalizeIssue 幂等性验证通过
- [x] 4 个代码文件 ESLint/Prettier 通过
- [x] 247 条 MongoDB 更新完成
- [x] 页面完成率 70%，逾期/未分配均为 0