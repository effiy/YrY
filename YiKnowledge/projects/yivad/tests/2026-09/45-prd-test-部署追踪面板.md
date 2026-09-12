---
doc_type: test
title: "YV-09-97: 部署追踪面板 — 部署历史、环境状态、部署成功率和变更日志 — 测试规格"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-11
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-97"
source_prds: ["45-prd-部署追踪面板"]
source_modules: []
---
# YV-09-97: 部署追踪面板 — 部署历史、环境状态、部署成功率和变更日志 — 测试规格

> 来源 PRD：[45-prd-部署追踪面板.md](../../prds/2026-09/45-prd-部署追踪面板.md)
> 提取日期：2026-09-11

---

## 六、测试规格

### 组件测试：EnvStatusCard

#### Scenario: 健康环境卡片
- **GIVEN** 生产环境 `health_status = 'healthy'`，版本 v2.1.0
- **WHEN** 渲染 EnvStatusCard
- **THEN** 显示绿色健康图标、版本号 v2.1.0、最后部署时间

#### Scenario: 异常环境卡片
- **GIVEN** Staging 环境 `health_status = 'degraded'`
- **WHEN** 渲染 EnvStatusCard
- **THEN** 显示黄色警告图标、环境名称旁有警告标记

### 组件测试：DeployTimeline

#### Scenario: 部署时间线渲染
- **GIVEN** 有 5 条部署记录（3 成功 + 1 失败 + 1 回滚）
- **WHEN** 渲染 DeployTimeline
- **THEN** 时间线按时间倒序排列，成功的绿色圆点，失败的红色圆点，回滚的有回滚标记

#### Scenario: 时间线展开变更详情
- **GIVEN** 部署记录包含 3 个 ChangeItem
- **WHEN** 点击部署记录的展开按钮
- **THEN** 展开区域显示 3 个 ChangeItem（Issue/PR/Commit 链接）

### 组件测试：DeployStats

#### Scenario: 部署统计图表
- **GIVEN** 过去 30 天有 20 次部署，成功率 85%
- **WHEN** 渲染 DeployStats
- **THEN** 显示成功率数字（85%）、成功率趋势折线图、按环境分组的失败统计

### 集成测试：部署仪表盘

#### Scenario: 首次加载完整仪表盘
- **GIVEN** 项目有 3 个环境 + 30 条部署记录
- **WHEN** 加载 DeployDashboard
- **THEN** 顶部 3 张环境卡片、中间统计图表、底部时间线全部正确渲染

#### Scenario: 无部署记录
- **GIVEN** 新项目无任何部署记录
- **WHEN** 加载 DeployDashboard
- **THEN** 环境卡片显示"无部署记录"，时间线区域显示引导提示

---

