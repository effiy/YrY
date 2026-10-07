---

title: "15-prd-完成速度与趋势指标"
tags: ["prd", "velocity", "trend", "weekly-done"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

首页统计条已有 5 个卡片 + 完成率仪表盘，但：
- 缺少"本周完成"正向激励指标
- 完成率仪表盘缺少变化趋势

## 功能规格

### 1. "本周完成"统计卡片

- 显示最近 7 天 done Issue 数量
- sub 文字显示「上周 N」对比
- delta 箭头显示周环比变化
- 绿色左边框（正向指标）

### 2. 完成率趋势箭头

- 在完成率仪表盘标签旁显示 ↑↓ 趋势
- 与上周完成率对比：上升绿色、下降红色
- 仅在有上周数据时显示

## 验收标准

- [x] 统计条显示"本周完成"卡片
- [x] 完成率仪表盘显示趋势箭头
- [x] `vue-tsc --noEmit` 通过