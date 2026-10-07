---

title: "12-prd-数据规范化与正向健康指标"
tags: ["prd", "data-normalization", "health-metrics", "data-quality-v2"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

上轮指标增强暴露了更深层的数据质量问题，同时缺少正向健康指标来平衡负面警告：

- **443 个 Issue Status 值不一致** — "To Do"/"Done"/"In Progress" 等混用导致统计偏差
- **382 个 Issue 无 issue_type（76%）** — 无法分类管理
- **缺少正向指标** — 只展示问题，不展示成绩（Bug 解决率等）

## 需求目标

1. **MongoDB Status 值正常化** — 统一为 snake_case
2. **新增 Issue Type 缺口告警**
3. **新增正向健康指标**（Bug 解决率、知识文档覆盖）

## 功能规格

### 1. Status 值正常化

MongoDB `issues` 集合批量更新：

| 旧值 | 新值 | 修复量 |
|------|------|--------|
| "To Do" | "todo" | 123 |
| "Done" | "done" | 106 |
| "In Progress" | "in_progress" | 75 |
| "Backlog" | "backlog" | 82 |
| "Review" | "in_review" | 57 |

### 2. 首页新增 Type 缺口告警

当 `noTypeCount > 20` 时显示黄色告警，引导补全 Issue 类型。

### 3. 项目详情新增正向指标

- **Bug 解决率**：在 Bugs 统计卡片显示 `resolved/total (百分比)`，>80% 时变绿色
- **知识文档覆盖**：新增 Docs 统计卡片，显示该项目 YiKnowledge 文档数量

### 4. 数据质量扩展到 Issue 类型

项目详情数据质量卡片新增「缺少类型」指标。

## 验收标准

- [x] MongoDB Status 值已统一
- [x] 首页显示 Issue 类型缺失告警
- [x] 项目详情 Bugs 卡片显示解决率
- [x] 项目详情新增 Docs 卡片
- [x] 数据质量卡片包含 Issue 类型缺口
- [x] `vue-tsc --noEmit` 通过