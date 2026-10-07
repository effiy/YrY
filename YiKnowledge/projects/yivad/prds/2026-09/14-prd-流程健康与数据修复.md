---

title: "14-prd-流程健康与数据修复"
tags: ["prd", "process-health", "bottleneck", "data-fix"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

数据分析发现两个新问题：

- **33 个 Issue 卡在 in_review 状态** — 评审瓶颈，阻塞交付流
- **2 个孤儿模块** — project_key 为空，不归属任何项目
- **项目分析仪表盘聚合数据为空** — 效率/质量图表无数据

## 功能规格

### 1. 首页流程健康指标

**今日摘要栏增强**：新增「待评审 {n}」计数，直观显示评审队列大小。

**评审瓶颈告警**：当 `inReviewCount > 10` 时在建议区域显示蓝色告警「N 个 Issue 待评审阻塞」。

### 2. 数据修复

- 2 个孤儿模块的 `project_key` 从空值修复为 `yivad`
- 分析仪表盘聚合数据生成（backend — 失败需后续调查）

## 验收标准

- [x] 首页今日摘要显示待评审数
- [x] 首页评审 >10 时显示阻塞告警
- [x] 孤儿模块已修复
- [x] `vue-tsc --noEmit` 通过