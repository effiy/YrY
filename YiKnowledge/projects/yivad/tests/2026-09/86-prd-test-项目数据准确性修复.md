---
prd_task_id: "YV-09-86"
title: "YV-09-86: 项目数据准确性修复 — 测试用例"
status: 已完成
priority: P0
owner: ""
roles: [engineer]
created: 2026-09-22
updated: 2026-09-22
project: YiVad
project_id: yivad
prd_month: "202609"
source_prds: ["86-prd-项目数据准确性修复.md"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 项目数据准确性修复]
benefit: "测试用例：项目数据准确性修复"
lifecycle: active
---

# YV-09-86: 项目数据准确性修复 — 测试用例

> 来源 PRD：[86-prd-项目数据准确性修复.md](../../prds/2026-09/86-prd-项目数据准确性修复.md)
> 开发方案：[87-dev-项目数据准确性修复.md](../../devs/2026-09/87-dev-项目数据准确性修复.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

## 一、测试范围与策略

| 层级 | 范围 | 方法 |
|------|------|------|
| L1 单元 | `_compute_basic_stats` 聚合管道 | Code review + 现有 pytest |
| L2 集成 | `/analytics/dashboard` 端点 | curl + 人工对比 MongoDB |
| L3 E2E | YiVad `/project` 页面 | 浏览器人工验证 |

## 二、测试用例

### 2.1 后端测试

**TC-BE-01：Basic Stats 不含 createdAt 日期过滤**

| 项目 | 内容 |
|------|------|
| 前置条件 | MongoDB `issues` 集合存在 30 天前创建的 issue |
| 步骤 | 1. 调用 `POST /analytics/dashboard`（无 dateRange 参数） 2. 检查 `basic.by_project[].issues` |
| 预期 | issues 计数包含 30 天前创建的记录 |
| 关联 AC | AC-1, AC-2 |

**TC-BE-02：Overdue 计算仍然正确**

| 项目 | 内容 |
|------|------|
| 前置条件 | 存在 `due_date < today` 且状态非 closed 的 issue |
| 步骤 | 1. 调用 dashboard 2. 检查 `basic.by_project[].overdue` |
| 预期 | overdue 计数 > 0，仅统计未关闭且已过期的 issue |
| 关联 AC | AC-1 |

**TC-BE-03：Bug/Module 计数不变**

| 项目 | 内容 |
|------|------|
| 前置条件 | Bug/Module 管道原本就没有日期过滤 |
| 步骤 | 1. 对比修改前后 Bug/Module 计数 |
| 预期 | 计数不变 |
| 关联 AC | AC-3 |

**TC-BE-04：效率/质量指标仍为 30 天窗口**

| 项目 | 内容 |
|------|------|
| 前置条件 | 存在超过 30 天前的 issue |
| 步骤 | 1. 调用 dashboard 2. 检查 `efficiency` 和 `quality` 字段 |
| 预期 | `period.start` 和 `period.end` 差值约为 30 天 |
| 关联 AC | AC-8 |

### 2.2 前端测试

**TC-FE-01：服务端统计覆盖客户端统计**

| 项目 | 内容 |
|------|------|
| 前置条件 | YiAi 运行中，dashboard 返回全量数据 |
| 步骤 | 1. 打开 `/project` 2. 对比卡片 Issues 数与 `db.issues.countDocuments()` |
| 预期 | 两者一致 |
| 关联 AC | AC-1 |

**TC-FE-02：服务端不可用时降级**

| 项目 | 内容 |
|------|------|
| 前置条件 | YiAi 未运行 |
| 步骤 | 1. 打开 `/project` |
| 预期 | 页面正常加载，统计数据来自客户端 fetch（可能被 pageSize 截断） |
| 关联 AC | AC-7 |

**TC-FE-03：零值守卫**

| 项目 | 内容 |
|------|------|
| 前置条件 | 服务端返回 `{ issues: 0, bugs: 0, modules: 0 }`，客户端有数据 |
| 步骤 | 1. 模拟服务端返回全零 2. 检查页面显示 |
| 预期 | 保留客户端统计数据，不显示全零 |
| 关联 AC | AC-6 |

**TC-FE-04：进度环百分比正确**

| 项目 | 内容 |
|------|------|
| 前置条件 | 项目有 N 个 issue，其中 M 个 done |
| 步骤 | 1. 打开 `/project` 2. 检查进度环百分比 |
| 预期 | 显示 `round(M / N * 100)%` |
| 关联 AC | AC-4 |

**TC-FE-05：Risk 标志仍正常工作**

| 项目 | 内容 |
|------|------|
| 前置条件 | 项目存在 overdue issue |
| 步骤 | 1. 检查项目卡片上的 risk chip |
| 预期 | 显示 "Overdue work" 标签 |
| 关联 AC | AC-6 |

## 三、回归用例

| # | 用例 | 验证方式 |
|---|------|----------|
| REG-01 | `python -m pytest tests/ -v` 全部通过（不含预存失败） | 自动化 |
| REG-02 | `pnpm type:check` 通过 | 自动化 |
| REG-03 | `pnpm lint:eslint` 通过 | 自动化 |
| REG-04 | 项目 CRUD（创建/编辑/归档/恢复）正常 | 人工 |
| REG-05 | 项目详情页 Overview 统计正确 | 人工 |
| REG-06 | Analytics 面板效率/质量指标正确 | 人工 |

## 四、执行记录

| 日期 | 执行人 | 结果 | 备注 |
|------|--------|------|------|
| 2026-09-22 | Claude | 通过 | 549 passed, 36 pre-existing failures (unrelated); type:check pre-existing errors only |