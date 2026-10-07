---

title: "11-prd-数据质量与指标覆盖增强"
tags: ["prd", "data-quality", "gap-metrics", "key-normalization"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

上轮分析发现，除未分配和 Bug 严重度外，还有三大数据质量缺口严重影响项目管理效率：

- **290 个 Issue 无优先级（58%）** — 无法有效排序和资源分配
- **336 个 Issue 无截止日期（67.2%）** — 缺少时间约束，交付无预期
- **项目 Key 不一致** — "YiVad" vs "yivad" 导致 544 个 Issue/187 Bug 关联错位

## 需求目标

1. **首页：新增优先级缺失 + 截止日期缺失告警**
2. **项目详情页：新增数据质量模块（优先级/截止日期/负责人缺口）**
3. **数据层：修复项目 Key 不一致问题**

## 功能规格

### 1. 首页 — 数据质量告警

在建议区域新增两条告警：

- **缺少优先级**：当 `noPriorityCount > 20` 时显示黄色警告
- **缺少截止日期**：当 `noDueDateCount > 20` 时显示黄色警告

### 2. 项目详情页 — 数据质量卡片

在 Bug 严重度模块下方新增数据质量卡片：

- 3 个指标卡片：缺少优先级 / 缺少截止日期 / 未分配负责人
- 使用图标 + 数字 + 标签的卡片式布局
- 严重缺口（>20）使用橙色背景，轻微缺口使用蓝色背景
- 点击任一卡片跳转 Issue 列表

### 3. 数据修复 — 项目 Key 正常化

- MongoDB `issues` 集合：535 条记录 `project_key` 从 "YiVad" → "yivad"
- MongoDB `bugs` 集合：178 条记录 `project_key` 从 "YiVad" → "yivad"

## 数据来源

- 首页：`useHomeData.ts` 新增 `noPriorityCount`/`noDueDateCount` 查询
- 项目详情：`allIssues` 前端聚合计算

## 验收标准

- [x] 首页显示优先级缺失告警
- [x] 首页显示截止日期缺失告警
- [x] 项目详情页显示数据质量卡片
- [x] 项目 Key 不一致已修复
- [x] `vue-tsc --noEmit` 通过