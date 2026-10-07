---

doc_type: module
prd_id: "YV-09-101"
title: "YV-09-101: 翻译分析 ECharts 仪表盘 — KPI 卡片 + 图表 + 供应商表格"
status: 已完成
priority: P0
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
related_tasks: ["101-prd-task-翻译分析ECharts仪表盘.md"]
related_tests: ["101-prd-test-翻译分析ECharts仪表盘.md"]

type: 需求
---

# YV-09-101: 翻译分析 ECharts 仪表盘

> 子 PRD，主 PRD：[100-prd-翻译分析仪表盘](./100-prd-翻译分析仪表盘.md)

## 背景

YiAi 提供 4 个翻译分析 RPC 接口。YiVad 需消费这些接口提供 ECharts 可视化 Dashboard。

## 用户问题

- **目标用户**：管理者（SLA 概览）、运维（供应商巡检）、PM（趋势分析）
- **证据**：强 — YiAi RPC 就绪；中 — AnalyticsConsole 验证了 Dashboard 模式

## 范围

**In scope**：5 KPI 卡片 + 3 ECharts 图表（饼图/柱状图/折线图）+ 供应商表格

**Out of scope**：对比模式、告警配置 → 后续 PRD

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P0 | KPI 概览 | 5 卡片显示数值+单位 |
| P0 | 供应商健康柱状图 | 颜色编码（绿/黄/红） |
| P1 | 翻译趋势折线图 | dataZoom 交互 |

## 成功指标

| 指标 | 目标 | 测量 |
|------|------|------|
| 首屏 | <2s | Performance API |
| 刷新 | <500ms | 3 API 并行 |

## 时间线

全部 2026-09-23（Claude）