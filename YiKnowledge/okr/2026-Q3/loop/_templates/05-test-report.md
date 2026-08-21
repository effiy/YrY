---
type: loop-template
loopId: loop-XXX
stage: test-report
title: <测试报告主题>
role: srer
goalId: sre-XXX
status: in-progress
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [loop-record, test-report]
---

# 05 测试报告 — loop-XXX

> 需求编号：loop-XXX · 测试人：<SRE> · 状态：<进行中/通过>

## 测试范围
- <被测对象与范围>

## 自动化门禁

| 项 | 命令 | 结果 |
|---|---|---|
| 类型检查 | `pnpm typecheck` | ✅/❌ |
| 构建 | `pnpm build` | ✅/❌ |

## 手动验证

| 场景 | 步骤 | 预期 | 实际 | 结论 |
|---|---|---|---|---|
| <场景> | <步骤> | <预期> | <实际> | ✅/❌ |

## 缺陷汇总

| # | 缺陷 | 严重度 | 状态 |
|---|---|---|---|
| 1 | <描述> | 高/中/低 | 已修复/遗留 |

## 结论
<通过/不通过 + 一句话说明>
