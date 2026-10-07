---

doc_type: task
prd_task_id: "YV-09-101"
title: "YV-09-101: 翻译分析 ECharts 仪表盘 — 技术设计"
status: 已完成
priority: P0
owner: Claude
roles: [engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
estimate_frontend: 0.3
source_prd: "101-prd-翻译分析ECharts仪表盘.md"

type: task
---

# YV-09-101: ECharts 仪表盘 — 技术设计

## 业务上下文

YiVad 新增 TranslationAnalytics.vue 页面，消费 YiAi 4 个分析 RPC 接口，通过 ECharts 6 渲染可视化。

## 架构

```
TranslationAnalytics.vue
  │ Promise.all([analytics, health, trend, breakdown])
  │ echarts.init() → setOption() → dispose()
  ▼
translationService.ts → callService("services.translation.translate_service", ...)
```

## 实现

**文件**：`views/dashboard/analytics/TranslationAnalytics.vue`（~280 行）

**ECharts 生命周期**：onMounted init → setOption → onUnmounted dispose + clearInterval

**3 图表**：环形饼图（语言分布）、柱状图（供应商健康）、折线图（趋势 + dataZoom）

## 非功能需求

| 维度 | 目标 |
|------|------|
| 内存 | dispose() 防泄漏 |
| 响应式 | echarts.resize() |