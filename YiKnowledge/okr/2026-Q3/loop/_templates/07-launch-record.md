---
type: loop-template
loopId: loop-XXX
stage: launch
title: <上线标题>
role: srer
goalId: sre-XXX
status: in-progress
created: YYYY-MM-DD
updated: YYYY-MM-DD
tags: [loop-record, launch]
---

# 07 上线记录 — loop-XXX

> 需求编号：loop-XXX · 发布人：<SRE> · 状态：<已上线/滚动中/预发布>

## 发布信息

| 字段 | 值 |
|---|---|
| artifact | <产物名> |
| version | <版本号> |
| env | prod / staging |
| project | <项目> |
| deployedAt | YYYY-MM-DD |
| goalId | <关联目标> |
| taskId | <关联任务> |

## 上线检查清单

- [ ] 门禁（typecheck/build）通过
- [ ] 手动验证通过
- [ ] 可回滚方案就绪

## 回滚方案
<如何回滚>

## 关联
- 需求评审：`loop-XXX/01-requirement-review.md`
- 技术评审：`loop-XXX/02-technical-review.md`
- 测试报告：`loop-XXX/04-test-report.md`
