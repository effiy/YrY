---
prd_task_id: "YV-09-90"
title: "项目数据规范化 — 测试用例"
status: 已完成
priority: 中
owner: Chengliang.Yi
source_prds: ["90-prd-项目数据规范化"]
source_modules: ["YV-09-90-1"]
source_okr: [yivad-003]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
type: test
tags: [测试用例, 数据质量, 数据规范化, 回归测试]
category: 项目/管理后台/测试
roles: [engineer]
test_coverage: "L1 单元测试 31 用例通过，L3 数据验证 5 项通过，L4 手动验证 12 用例通过"
test_execution_date: 2026-09-23
source: YiVad
benefit: "测试用例：项目数据规范化"
lifecycle: active
---

# 项目数据规范化 — 测试用例

> 来源 PRD：[90-prd-项目数据规范化](../../prds/2026-09/90-prd-项目数据规范化.md)
> 来源 Dev：[90-prd-task-项目数据规范化](../../devs/2026-09/90-prd-task-项目数据规范化.md)
> 需求编号：YV-09-90

> **文档职责**：本文档定义**如何验证、验证什么、验证结果**（VERIFY），独立于产品需求和开发方案。

---

## 目录

- [一、测试范围与策略](#sec-1)
- [二、L1 单元测试 — normalizeIssue()](#sec-2)
- [三、L3 数据验证 — MongoDB 批量修复](#sec-3)
- [四、L4 端到端 — 页面指标验证](#sec-4)
- [五、回归用例](#sec-5)
- [六、追溯矩阵](#sec-6)

---

<a id="sec-1"></a>
## 一、测试范围与策略

### 测试分层

| 层级 | 工具 | 覆盖内容 | 用例数 | 通过率 |
|------|------|---------|--------|--------|
| L1 单元 | Vitest 4.1 | normalizeIssue() 全部规范化逻辑 | 31 | 100% |
| L3 数据 | Python + RPC API | MongoDB 3 轮批量修复后数据完整性 | 5 | 100% |
| L4 手动 | Chrome 128+ | 3 个页面 12 项关键指标 | 12 | 100% |

### 测试环境

| 维度 | 配置 |
|------|------|
| 浏览器 | Chrome 128+ |
| 后端 | YiAi :10086 (MongoDB yivad 项目 200 条数据) |
| 前端 | YiVad :8848 (dev server，已重启加载 normalizeIssue) |

---

<a id="sec-2"></a>
## 二、L1 单元测试 — normalizeIssue()

**文件**：`tests/api/normalizeIssue.test.ts`（246 行，31 用例）

### 测试分组与结果

| 分组 | 用例数 | 覆盖内容 | 结果 |
|------|--------|---------|------|
| status normalization | 10 | 标准值直通 + Title Case 7 种 + fallback + 空值 | ✅ |
| issue_type normalization | 6 | 直通 + type 映射 + 优先级 + Title Case + 默认值 | ✅ |
| priority normalization | 5 | 直通 + Title Case + 空/null/undefined 默认值 | ✅ |
| assignee normalization | 3 | 直通 + 缺失/null/非字符串 | ✅ |
| date fields | 9 | updated_at/updatedTime/updatedAt + created_at/createdAt/createdTime + 优先级链 | ✅ |
| idempotency & safety | 4 | 二次规范化 + 字段透传 + null安全 + 空对象 | ✅ |
| real-world scenario | 2 | 完整 Linear 导入记录 + 原生 Issue 混合 | ✅ |

**运行**：`npx vitest run tests/api/normalizeIssue.test.ts` — 31/31 passed, < 10ms

---

<a id="sec-3"></a>
## 三、L3 数据验证 — MongoDB 批量修复

### TC-DB-01：Issue 状态修复 — 第 1 轮（原生逾期）

| 属性 | 值 |
|------|-----|
| 操作 | yivad-3, yivad-6 → status: done |
| 验证 | API 查询 `{"key": {"$in": ["yivad-3","yivad-6"]}}`，确认 status=done |
| 结果 | ✅ yivad-3=done, yivad-6=done |

### TC-DB-02：Issue 状态修复 — 第 2 轮（In Progress→done）

| 属性 | 值 |
|------|-----|
| 操作 | 46 条 `status: "In Progress"` 且 key 非 yivad- 前缀 → done |
| 验证 | API 查询 count where status="In Progress" = 0 |
| 结果 | ✅ 0 条残留 |

### TC-DB-03：Issue 状态修复 — 第 3 轮（Review→done）

| 属性 | 值 |
|------|-----|
| 操作 | 46 条 `status: "Review"` → done |
| 验证 | API 查询 count where status="Review" = 0 |
| 结果 | ✅ 0 条残留 |

### TC-DB-04：assignee 批量填充

| 属性 | 值 |
|------|-----|
| 操作 | 150 条无 assignee 的未关闭 Issue → "Chengliang Yi" |
| 验证 | API 查询 count where status NOT IN (done,cancelled) AND (assignee 为空) |
| 结果 | ✅ 0 条未分配 |

### TC-DB-05：模块 due_date 修复

| 属性 | 值 |
|------|-----|
| 操作 | yivad-m1→09-30, yivad-m2→移除, yivad-m4→移除 |
| 验证 | API 查询 modules，检查 due_date < today 的数量 |
| 结果 | ✅ 0 个模块过期 |

---

<a id="sec-4"></a>
## 四、L4 端到端 — 页面指标验证

### 项目详情页 (`/project/yivad`)

| # | 验证项 | 目标值 | 实际值 | 结果 |
|---|--------|--------|--------|------|
| TC-01 | Overview 加载正常 | 无控制台错误 | 正常 | ✅ |
| TC-02 | Analytics 完成率 | ≥ 60% | 70% (139/200) | ✅ |
| TC-03 | Analytics 逾期数 | = 0 | 0 | ✅ |
| TC-04 | Analytics 未分配数 | = 0 (open) | 0 | ✅ |
| TC-05 | 状态分布图 | 6 种标准状态，done 占比最大 | ✅ | ✅ |
| TC-06 | 类型分布图 | 无 "?" | task(191)+feature(5)+improvement(3)+requirement(1) | ✅ |
| TC-07 | 优先级分布图 | 无 "?" | medium(194)+high(4)+low(2) | ✅ |
| TC-08 | Activity Timeline | 有近期活动 | ✅ | ✅ |

### 项目列表页 (`/project`)

| # | 验证项 | 预期 | 结果 |
|---|--------|------|------|
| TC-09 | yivad 卡片进度环 | 完成率 ≈ 70% | ✅ |
| TC-10 | KPI 磁贴 | yivad 数据计入汇总 | ✅ |

### Issue 列表页 (`/issue`)

| # | 验证项 | 预期 | 结果 |
|---|--------|------|------|
| TC-11 | Status 列 | 标准标签，无异常值 | ✅ |
| TC-12 | Type/Priority 列 | 有效标签，无 "?" | ✅ |

---

<a id="sec-5"></a>
## 五、回归用例

| # | 回归项 | 风险 | 结果 |
|---|--------|------|------|
| RG-01 | 原生 Issue CRUD 不受影响 | 高 | ✅ |
| RG-02 | Bug 列表页正常 (独立数据源) | 低 | ✅ |
| RG-03 | Module 列表页正常 (独立数据源) | 低 | ✅ |
| RG-04 | Kanban 页面正常 (经 issueStore) | 中 | ✅ |
| RG-05 | Gantt 页面正常 (经 issueStore) | 中 | ✅ |
| RG-06 | 页面刷新后数据一致 | 中 | ✅ |

---

<a id="sec-6"></a>
## 六、追溯矩阵

| 测试 | 覆盖 PRD | 覆盖 Dev |
|------|---------|---------|
| L1 (31 用例) | FR-1, FR-2 | Task 1, 2, 6 |
| L3 TC-DB-01~03 | FR-3 | Task 3 |
| L3 TC-DB-04 | FR-4 | Task 4 |
| L3 TC-DB-05 | FR-5 | Task 5 |
| L4 TC-01~12 | FR-1~5 | Task 1~5 |
| RG-01~06 | 全部 FR | 全部 Task |