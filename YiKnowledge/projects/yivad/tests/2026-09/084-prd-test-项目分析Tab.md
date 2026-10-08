---
title: "YV-09-102: 项目分析Tab — 测试用例"
status: 已完成
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-14
project: YiVad
project_id: yivad
prd_month: "202609"
prd_task_id: "YV-09-102"
source_prds: ["84-prd-项目分析Tab"]
source_modules: ["84-prd-task-项目分析Tab"]
type: test
category: projects/yivad/tests
source: YiVad
tags: [yivad, test, 项目分析Tab]
benefit: "测试用例：项目分析Tab"
lifecycle: active
---

# YV-09-102: 项目分析Tab — 测试用例

> 来源 PRD：[84-prd-项目分析Tab.md](../../prds/2026-09/84-prd-项目分析Tab.md)
> 开发方案：[84-prd-task-项目分析Tab.md](../../devs/2026-09/84-prd-task-项目分析Tab.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

---

## 测试策略

| 层级 | 说明 | 自动化 | 执行时机 |
|------|------|--------|---------|
| L1 单元 | Issue 统计 computed 计算逻辑 | Vitest | 每次提交 |
| L2 组件 | DetailAnalysis ECharts 渲染 | Vitest + @vue/test-utils | 每次提交 |
| L3 集成 | useCodeHealth ↔ API ↔ 组件 | Vitest + mock | 每次提交 |
| L4 端到端 | 完整 Tab 加载+图表渲染 | 手动 | 提测/回归 |

---

## 需求覆盖矩阵

| FR | 需求 | 测试覆盖 | 状态 |
|----|------|---------|------|
| FR-1 | Issue 统计图表（状态分布+类型分布） | CT + IT | ✅ |
| FR-2 | 源码大文件预警（Top 10 + 阈值着色） | CT + IT | ✅ |
| FR-3 | Issue 活跃度趋势（30天面积图） | CT | ✅ |
| FR-4 | 汇总卡片（Issue数/待处理/逾期/Bug/模块/完成率） | CT | ✅ |
| FR-5 | 代码健康大盘（CodeHealthPanel 复用） | CT + IT | ✅ |

---

## L1 单元测试

### UT-01: Issue 统计 computed

**GIVEN** allIssues 包含 50 条 Issue（20 open, 15 done, 10 in_progress, 5 cancelled）  
**WHEN** 计算 `issueStats = computed(() => buildStats(allIssues))`  
**THEN** `issueStats.totalOpen` 应为 20  
**AND** `issueStats.completionRate` 应为 30%（15/50）  
**AND** `issueStats.overdue` 应仅计算截止日期已过的 open 状态 Issue

### UT-02: 大文件阈值判定

**GIVEN** `getFileLevel(350)`  
**THEN** 返回 `{ level: 'warn', color: '#E6A23C' }`（>300）  
**GIVEN** `getFileLevel(650)`  
**THEN** 返回 `{ level: 'danger', color: '#F56C6C' }`（>600）

---

## L2 组件测试

### CT-01: ECharts 图表渲染

**GIVEN** DetailAnalysis Tab 组件挂载，传入 project data  
**THEN** 应渲染 2 个横向柱状图（状态分布 + 类型分布）  
**AND** 1 个折线面积图（30天活跃度趋势）  
**AND** 图表配置复用 `charts.ts` 中的 `buildStatusBar`/`buildActivityArea`

### CT-02: 大文件预警列表

**GIVEN** useCodeHealth 返回 `top_files: [{ path, lines: 650 }, { path, lines: 350 }]`  
**WHEN** 渲染大文件预警区域  
**THEN** 650 行文件显示红色行 + 红色标签「>600」  
**AND** 350 行文件显示黄色行 + 黄色标签「>300」  
**AND** 点击文件行 → 打开文件预览

### CT-03: 汇总卡片

**GIVEN** project 数据：50 Issue, 8 Bug, 6 模块, 30% 完成率  
**WHEN** 渲染汇总卡片区域  
**THEN** 应显示 6 个 KPI 卡片：Issues(50) / Open(20) / Overdue(3) / Bugs(8) / Modules(6) / Rate(30%)

### CT-04: CodeHealthPanel 复用

**GIVEN** DetailAnalysis Tab 挂载  
**THEN** CodeHealthPanel 组件在 Tab 内容中正确渲染  
**AND** 默认展开显示代码规模/密度/复用/重复率指标

---

## L3 集成测试

### IT-01: useCodeHealth 数据加载

**GIVEN** 项目 key = "yivad"  
**WHEN** `useCodeHealth().analyze("yivad")` 被调用  
**THEN** `loading` 状态 → `report.value` 包含 `scale`/`density`/`reuse`/`duplication` 指标  
**AND** 失败时 `error.value` 包含错误信息 + 显示重试按钮

### IT-02: 日期过滤联动

**GIVEN** 用户在详情页切换日期导航  
**WHEN** filterDateStr 变化  
**THEN** DetailAnalysis Tab 中的图表数据随日期过滤更新  
**AND** 汇总卡片数字反映过滤后的数据

---

## L4 端到端场景

### E2E-01: 分析Tab完整流程

1. 打开 `/project/yivad` → 切换到「分析」Tab
2. 汇总卡片显示正确的 KPI 数字
3. ECharts 图表正确渲染（状态分布+类型分布+活跃度趋势）
4. 大文件预警列表：点击 >600 行文件 → 预览弹窗打开
5. CodeHealthPanel 展开 → 显示代码规模/密度/复用/重复率
6. 切换日期 → 所有图表数据更新