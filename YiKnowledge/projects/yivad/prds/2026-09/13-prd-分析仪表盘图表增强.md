---

title: "13-prd-分析仪表盘图表增强"
tags: ["prd", "analytics", "charts", "aging", "velocity", "priority-health"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

项目详情分析页当前展示基础 KPI + Status 分布 + 活动趋势 + 代码健康 + 研发效率 + 质量大盘。但缺少以下关键分析维度：

- **Issue 老化分析**：312 个开放 Issue 中多少已滞留 >7d/30d/90d
- **优先级健康**：开放 Issue 的优先级分布，帮助识别紧急任务集中度
- **完成速度**：每周完成 Issue 数量趋势，正向指标激励

## 功能规格

### 1. Issue 老化 KPI

在 KPI 区域新增 3 个卡片：
- **>7d Open**：开放超过 7 天的 Issue 数量和百分比
- **>30d Open**：开放超过 30 天的 Issue 数量和百分比
- **>90d Open**：开放超过 90 天的 Issue 数量和百分比（红色预警）

### 2. 优先级健康图

在 Issue 分析区域新增饼图：
- 展示开放 Issue 的优先级分布（P0 红/O1 橙/P2 黄/P3 蓝/无 灰）
- 环形饼图（donut chart），中心显示总数
- 帮助识别优先级集中度

### 3. 周完成速度图

在 Issue 分析区域新增柱状图：
- 展示最近 8 周的 done Issue 数量
- 绿色柱状图，正向指标
- 顶部显示总完成数

## 验收标准

- [x] KPI 区域显示 3 个老化指标卡片
- [x] Issue 分析区域显示优先级健康饼图
- [x] Issue 分析区域显示周完成速度柱状图
- [x] `vue-tsc --noEmit` 通过