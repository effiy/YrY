---
type: loop-template
loopId: loop-XXX
stage: deployment
title: <部署主题>
role: srer
goalId: sre-XXX
status: in-progress
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [loop-record, deployment]
---

# 06 部署 — loop-XXX

> 需求编号：loop-XXX · 部署人：<SRE> · 状态：<进行中/已完成>

## 部署信息

| 项目 | 值 |
|---|---|
| Artifact | <名称/包名> |
| Version | <版本号> |
| Environment | production / staging |
| Branch / Commit | <分支或提交 hash> |
| 部署时间 | YYYY-MM-DD HH:mm |

## 部署步骤

| # | 步骤 | 命令/操作 | 结果 | 耗时 |
|---|---|---|---|---|
| 1 | <步骤描述> | `<command>` | ✅/❌ | <n>s |
| 2 | <步骤描述> | `<command>` | ✅/❌ | <n>s |

## 部署验证

| # | 验证项 | 方法 | 预期 | 实际 | 结果 |
|---|---|---|---|---|---|
| 1 | <验证项> | <方法> | <预期> | <实际> | ✅/❌ |

## 回滚预案

| 场景 | 触发条件 | 回滚步骤 | 预计耗时 |
|---|---|---|---|
| <场景> | <条件> | <步骤> | <n>min |

## 部署备注

- <备注/异常/注意事项>