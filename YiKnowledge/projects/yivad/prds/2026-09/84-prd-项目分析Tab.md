---
title: 功能实现-项目分析Tab
tags:
- 需求文档
- 管理后台
- 项目
- 分析
- 图表
category: 项目/管理后台/需求
created: '2026-09-10'
updated: 2026-09-10
source: 内部
type: 需求
status: 已完成
priority: 中
project: YiVad
project_id: yivad
owner: 陈铭
prd_month: '202609'
prd_task_id: YV-09-102
estimate_frontend: 1
review_status: 已评审
issue_type: 功能
roles:
- engineer
source_okr: [yivad-003]
---

# 项目分析 Tab

在项目详情页 (`/project/:key`) 中新增「分析」Tab，提供项目级数据可视化和代码健康度分析。

## 功能描述

### 内容

1. **Issue 统计图表** — 使用 ECharts 渲染当前项目的 Issue 状态分布（横向柱状图）、Issue 类型分布（横向柱状图）
2. **源码大文件预警** — 调用 `useCodeHealth` 获取 `top_files`，展示 Top 10 大文件及行数，按阈值着色（>600 行红色、>300 行黄色），支持点击分析和刷新
3. **Issue 活跃度趋势** — 近 30 天 Issue 更新频次的面积图
4. **汇总卡片** — Issue 总数、待处理数、逾期数、Bug 总数、模块数、完成率
5. **代码健康大盘** — 复用 `CodeHealthPanel` 组件，默认展开，显示代码规模、密度、组件复用、代码重复、预警信息

### 数据来源

- 复用 `useProjectDetail()` 注入的 `allIssues`、`allBugs`、`allModules`
- 统计计算在组件内通过 `computed` 完成，无需额外 API 调用
- 图表配置复用 `charts.ts` 中的 `buildStatusBar`、`buildPriorityDonut`、`buildTypeBar`、`buildActivityArea`

### 图表配置

- **状态分布**：横向柱状图，按 `ISSUE_STATUS_MAP` 映射颜色
- **大文件预警**：调用 `useCodeHealth` 获取 `scale.top_files`，按行数渲染横向占比条，>600 行红色、>300 行黄色
- **类型分布**：横向柱状图，按 `ISSUE_TYPE_MAP` 映射颜色
- **活跃度**：30 天折线面积图，零值填充

## 实现方案

### 文件变更

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/views/project/components/DetailAnalytics.vue` | 新增 | 分析 Tab 内容组件 |
| `src/hooks/useDetailTabs.ts` | 修改 | 新增 analytics tab 配置 |
| `src/languages/modules/project/zh.ts` | 修改 | 新增 `tabs.analytics: "分析"` |
| `src/languages/modules/project/en.ts` | 修改 | 新增 `tabs.analytics: "Analytics"` |
| `src/views/project/components/CodeHealthPanel.vue` | 修改 | `collapsed` 默认值改为 `false` |

### 架构决策

- `DetailAnalytics` 通过 `useProjectDetail()` inject 获取数据，与现有 Tab 组件保持一致
- 统计逻辑内聚在组件内（纯 `computed`），不引入新的 composable
- CodeHealthPanel 默认展开，因为分析 Tab 是其主要展示场景

## 验证方法

- [ ] 项目详情页出现「分析」Tab，位于「概览」和「需求」之间
- [ ] 有 Issue 的项目正确渲染状态/类型图表
- [ ] 无 Issue 的项目显示空状态提示
- [ ] 源码大文件预警点击「分析」后可加载 top_files 列表
- [ ] 大文件按行数着色（>600 红、>300 黄）
- [ ] 汇总卡片数值与实际数据一致
- [ ] 代码健康大盘默认展开
- [ ] 切换中/英文时 Tab 标签正确显示

## 影响范围

- **影响组件/页面**：详见描述章节
- **影响用户**：所有用户
- **是否影响 API 契约**：否
- **是否影响其他前端项目**：否（仅 YiVad）

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 加强代码审查，关注此类问题模式 |
| 测试 | 增加自动化测试覆盖对应场景 |
| 流程 | 将此类问题纳入检查清单 |

## 经验教训

- 此类问题属于常见开发疏忽，可通过静态分析和自动化检查提前发现
- 建议将典型问题模式记录到团队知识库，避免重复踩坑
- 代码审查应重点关注此类边界情况


