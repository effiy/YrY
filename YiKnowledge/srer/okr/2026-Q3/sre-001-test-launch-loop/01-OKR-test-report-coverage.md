---
type: okr-metric
id: sre-m01
name: 测试报告覆盖
category: 测试
framework: OKR
trend: up
progress: 100
title: SRE M01 测试报告覆盖
updated: 2026-09-10
---

# 测试报告覆盖

有测试报告（typecheck/build + 手动验证）的需求占比。

## 指标说明

该指标衡量的是：在 Q2 所有已上线的需求中，有多少需求产出了完整的测试报告。测试报告内容包括：

- TypeScript 类型检查结果（`vue-tsc --noEmit` / `tsc --noEmit`）
- 项目构建结果（`pnpm build:pro` / `npm run build`）
- 手动功能验证结果（核心流程、边界条件、回归检查）

目标是确保每条需求在上线前都经过了可追溯的质量验证。

| 字段 | 值 |
|---|---|
| ID | `sre-m01` |
| 类别 | 测试 |
| 框架 | OKR |
| 基线值 | 0%（Q2 无测试报告规范）|
| 当前值 | 100% |
| 目标值 | 100% |
| 趋势 | 上升 |
| 进度 | 100% |