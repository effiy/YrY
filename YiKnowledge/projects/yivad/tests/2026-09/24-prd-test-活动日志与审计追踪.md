---
title: "YV-09-54: 活动日志与审计追踪 — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-54"
source_prds: ["24-prd-活动日志与审计追踪"]
source_modules: ["24-prd-task-活动日志与审计追踪"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 活动日志与审计追踪]
benefit: "测试用例：活动日志与审计追踪"
lifecycle: active
---

# YV-09-54: 活动日志与审计追踪 — 测试用例

> 来源 PRD：[24-prd-活动日志与审计追踪.md](../../prds/2026-09/24-prd-活动日志与审计追踪.md)
> 开发方案：[24-prd-task-活动日志与审计追踪.md](../../devs/2026-09/24-prd-task-活动日志与审计追踪.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | 操作类型图标映射、过滤/排序逻辑 | Vitest | 每次提交 |
| L2 组件 | ProTable + 筛选器 + 详情 drawer | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | 操作→自动记录→查看完整链路 | Vitest + mock | 每次提交 |
| L4 端到端 | 完整活动日志浏览流程 | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | ProTable 列：时间/用户/操作/目标/详情/IP | CT + IT | ✅ |
| FR-2 | 操作类型图标+颜色映射 | UT + CT | ✅ |
| FR-3 | 筛选器：用户/操作类型/时间范围 | CT | ✅ |
| FR-4 | 日志详情 el-drawer（变更前后对比） | CT | ✅ |
| FR-5 | 只读（无编辑/删除按钮） | CT | ✅ |

---

## L1 单元测试

### UT-01: 操作类型图标映射

**GIVEN** `getActivityIcon('issue.created')` 调用  
**THEN** 返回 `{ icon: 'CirclePlus', color: '#67C23A' }`  
**GIVEN** `getActivityIcon('bug.deleted')` 调用  
**THEN** 返回 `{ icon: 'Delete', color: '#F56C6C' }`  
**GIVEN** `getActivityIcon('project.updated')` 调用  
**THEN** 返回 `{ icon: 'Edit', color: '#409EFF' }`

### UT-02: 日志过滤

**GIVEN** 100 条混合日志  
**WHEN** `filterLogs(logs, { user_id: 'user-1', action_type: 'issue.updated' })`  
**THEN** 仅返回匹配的日志条目

---

## L2 组件测试

### CT-01: ProTable 列渲染

**GIVEN** ActivityLog 组件挂载，传入 20 条日志  
**THEN** 应显示列：Time | User | Action(图标+颜色) | Target | Details | IP  
**AND** 创建→绿⊕, 删除→红⊘, 修改→蓝✎, 查看→灰👁

### CT-02: 筛选器交互

**GIVEN** 用户选择操作类型 = `issue.updated` + 时间范围 = 「今天」  
**WHEN** 筛选器变更  
**THEN** ProTable 仅显示今天的 `issue.updated` 日志

### CT-03: 详情 drawer

**GIVEN** 用户点击某条日志「详情」  
**THEN** el-drawer 打开，显示：时间/IP/UserAgent/操作类型/目标/变更前后对比  
**AND** 变更字段高亮（红色=旧值, 绿色=新值）

### CT-04: 只读性

**GIVEN** ActivityLog 页面渲染  
**THEN** 无「编辑」或「删除」按钮  
**AND** 操作列仅含「详情」

---

## L3 集成测试

### IT-01: 自动记录

**GIVEN** 用户创建 Issue  
**WHEN** 检查 `activity_log` 集合  
**THEN** 存在 `{ action_type: 'issue.created', user_id, target_id, ip, created_at }` 记录

### IT-02: 分页加载

**GIVEN** `activity_log` 有 500 条记录  
**WHEN** 打开页面（pageSize=20）  
**THEN** 加载前 20 条 + 分页器 → 点击第 2 页 → 加载 21-40 条

---

## L4 端到端场景

### E2E-01: 操作→记录→查看

1. 用户 A 创建 Issue → 用户 B 编辑 → 用户 C 删除
2. 管理员打开 `/system/activity-log`
3. ProTable 显示 3 条日志：创建(绿)、修改(蓝)、删除(红)
4. 筛选「issue.deleted」→ 仅显示删除日志
5. 点击详情 → drawer 显示变更对比
6. 筛选「今天」→ 仅显示今日日志