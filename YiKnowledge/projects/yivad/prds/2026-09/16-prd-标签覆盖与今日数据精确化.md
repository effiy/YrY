---

title: "16-prd-标签覆盖与今日数据精确化"
tags: ["prd", "labels", "data-accuracy", "today"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

- **77% 的 Issue 无标签** — 标签覆盖率仅 23%，严重影响分类和过滤
- **今日摘要栏 done 数为周聚合** — `todayDoneCount` 实际统计的是最近 7 天数据，非真正今日

## 功能规格

### 1. 数据质量新增标签覆盖

项目详情数据质量卡片新增「缺少标签」指标：
- 统计开放 Issue 中 `labels` 为空的数量
- 使用 PriceTag 图标
- >20 时橙色告警

### 2. 今日摘要栏精确化

- 新增 `doneTodayExact` 查询：`status=done AND updated_at >= today`
- 今日摘要栏 done 数改为使用精确的今日数据
- 与 created（今日）保持口径一致

## 验收标准

- [x] 数据质量卡片包含标签覆盖
- [x] 今日摘要栏 done 数为当日精确值
- [x] `vue-tsc --noEmit` 通过