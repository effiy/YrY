---
title: Failure case study / Failures
aliases: [failures-leaf-readme, failures-readme]
tags: [leaf, lessons, failures]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer, leader, srer]
benefit: "Engineers can understand and apply failure case study / failures with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../INDEX.md
  - ../README.md
  - ../../INDEX.md
  - ../../../leader/risk/write-a-postmortem.md
---

# 失败案例研究 / Failures

> **作为** engineer，**我希望**理解并应用失败案例研究，**以便**分析失败并防止其再次发生。

> 产品发布、技术实施、流程事故的失败案例与经验教训。复盘报告使用 blameless 写作风格。

## 包含范围

- 产品发布失败案例研究
- 技术实施事故（宕机、数据泄露、性能回退）
- 流程事故（审查遗漏、回滚失败）
- 复盘报告与改进行动
- 单点 bug 复盘（`bugs/` 子分类）

## 文件类型与命名

- `{event-name}-failure-summary.md`：失败案例研究总结
- `{event-name}-postmortem.md`：复盘报告（blameless）
- `bugs/bug_{YYYYMMDD}_{slug}.md`：单点 bug 复盘
- 命名使用英文 kebab-case

## 已包含

| 文件 | 内容 | 状态 |
|---|---|---|
| [ai-product-launch-lessons-summary.md](failure-ai-product-launch-lessons.md) | AI 产品发布失败案例与经验教训（5 个案例 + red team 检查清单） | active |
| [incident-postmortem-summary.md](failure-incident-postmortem.md) | 事故复盘总结（blameless 文化 + 5-Why + 行动跟踪） | active |
| [incident-postmortem-template.md](failure-incident-postmortem.md) | 事故复盘模板（十段可填写表格） | reference |
| [bugs/bug-metaschemas-sed-deletion.md](bug-bug-metaschemas-sed-deletion.md) | sed 链式操作覆盖 metaColumns 数组声明 | active |
| [bugs/bug-topicdetail-meta-validation.md](bug-bug-topicdetail-meta-validation.md) | TopicDetailPage 表单模型与验证路径断开 | active |

## 待包含

- 因 red-team 测试不足导致的发布事故
- 幻觉事故复盘
- 数据流断链事故
- 跨时区协作失败发布事故
- 因审查遗漏导致的回滚案例研究

## 推荐写作结构

1. 事故概述（时间、影响范围、严重程度）
2. 时间线
3. 根因分析（5 Why、鱼骨图）
4. 经验教训提取
5. 改进行动与负责人
6. 后续跟踪与验证

## 相关叶子

- [../gotchas/](.) — 工程踩坑记录（小粒度）
- [../wins/](.) — 成功案例研究对比
- [../../processes/incident-response.md](../process/incident-response.md) — 事件响应流程
- [../../../srer/release/hotfix-release.md](../../srer/release/hotfix-release.md) — hotfix 流程
- [../../strategies/check-engineering-gotchas.md](../process/check-engineering-gotchas.md) — 场景入口
- [../../processes/review-lessons.md](../process/review-lessons.md) — 场景入口