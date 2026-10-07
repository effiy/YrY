---

title: "18-prd-WIP与最近完成"
tags: ["prd", "wip", "recently-completed", "momentum"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

项目详情 Overview 页展示数据质量和统计卡片，但缺少：
- **在途任务可视化** — 46 in_progress + 33 in_review + 89 todo，需展示分布
- **最近完成激励** — 185 done 中有哪些是最近完成的，展示交付节奏

## 功能规格

### 在途任务（WIP）卡片

- 显示 3 行彩色条状图：in_progress（蓝）/ in_review（黄）/ todo（灰）
- 每行显示状态名、条（按最大计数比例）、计数
- 不包含 backlog 和 done/cancelled
- 仅在有活跃任务时显示

### 最近完成

- 显示最近 5 个 done Issue
- 每项显示：绿色勾 + 标题 + 相对时间
- 点击跳转 Issue 列表
- 仅在有已完成 Issue 时显示

## 验收标准

- [x] WIP 卡片显示 3 状态分布
- [x] 最近完成显示 5 个最新 done
- [x] `vue-tsc --noEmit` 通过