---

doc_type: module
prd_id: "YV-09-104"
title: "YV-09-104: Analytics Console — 多维度质量分析仪表盘（质量评分/缺陷/吞吐量/周期/前置时间/流效率/可预测性）"
status: 已完成
priority: P0
owner: Claude
roles: [product, engineer]
created: 2026-09-23
updated: 2026-09-23
project: YiVad
project_id: yivad
prd_month: "202609"
related_tasks: ["104-prd-task-AnalyticsConsole.md"]
related_tests: ["104-prd-test-AnalyticsConsole.md"]

type: 需求
---

# YV-09-104: Analytics Console

> **PRD 版本**：v3.0 · **状态**：已完成

## 1. 背景

YiVad 管理后台需一站式质量分析仪表盘，覆盖代码质量、缺陷趋势、交付吞吐量、周期时间、流效率、可预测性等维度。供技术管理者和 QA 团队日常使用。

## 2. 用户问题

- **目标用户**：技术管理者（周度评审）、QA（质量趋势）
- **问题陈述**：作为技术管理者，我需要在统一页面查看团队交付质量和速度的多维度指标
- **证据**：强 — 代码已实现（`AnalyticsConsole.vue`，1000+ 行）

## 3. 范围

**In scope**：
- 7 个 KPI 卡片（Quality Score / Open Bugs / Throughput / Cycle Time P50 / Lead Time P50 / Flow Efficiency / Predictability）
- KPI 含趋势箭头 + 迷你图 + 阈值颜色
- 项目筛选 + 日期范围 + 实时轮询

**Out of scope**：告警规则配置 → 后续 PRD

| 优先级 | 故事 | 验收标准 |
|--------|------|---------|
| P0 | 查看质量 KPI 概览 | 7 卡片含趋势指示 |
| P0 | 按项目筛选 | Select 过滤联动 |
| P1 | 实时轮询 | 30s 自动刷新 |

## 4. 成功指标

| 指标 | 目标 |
|------|------|
| 首屏 | <2s |
| 数据准确性 | 与 MongoDB 一致 |

## 5. 时间线

历史已实现，本次补充文档（2026-09-23）