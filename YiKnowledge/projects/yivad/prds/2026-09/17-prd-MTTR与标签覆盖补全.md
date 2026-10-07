---

title: "17-prd-MTTR与标签覆盖补全"
tags: ["prd", "mttr", "resolution-time", "labels"]
category: "requirements"
created: "2026-09-23"
updated: "2026-09-23"
source: "claude"
type: prd
status: 已完成
owner: "Chengliang Yi"

---

## 需求背景

- **MTTR（平均修复时间）是 DevOps 核心指标**，但项目详情页无展示
- **标签覆盖率 29%**，上轮已添加到数据质量

## 功能规格

### MTTR 卡片

项目详情 Stats Strip 新增 MTTR 卡片：
- 显示已解决 Bug 的中位修复时间（小时）
- 使用 `createdAt → updatedAt` 时间差计算
- <24h 绿色边框（快速），≥24h 蓝色边框
- 点击跳转 Bug 列表

## 验收标准

- [x] Stats Strip 显示 MTTR 卡片
- [x] `vue-tsc --noEmit` 通过（仅新增文件，预存 csv.ts 错误除外）