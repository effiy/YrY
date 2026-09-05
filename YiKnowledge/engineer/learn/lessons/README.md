---
title: Lessons
aliases: [lessons-category-readme, lessons-readme]
tags: [leaf, lessons, engineering, wins, failures]
chip: lessons-learned
category: engineer/learn/lessons
created: 2026-08-03
updated: 2026-08-10
last_verified: 2026-08-10
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles: [engineer]
benefit: "README outcome clear"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../../leader/risk/write-a-postmortem.md
  - ../../../srer/incident-response/respond-to-an-incident.md
  - ./INDEX.md
  - ../INDEX.md
  - ../../run/check-engineering-gotchas.md
  - ../../run/review-lessons.md
  - ../../../projects/
---

# 经验教训

> **作为** engineer，**我希望**从过去的成功、失败和踩坑中学习，**以便**避免重复错误并复制成功。

> 产品、技术和流程经验教训的顶层入口：成功、失败、踩坑和 bug。

## 子目录

| 叶子 | 内容 |
|---|---|
| [wins/](./wins/) | 成功案例与可复用经验 |
| [failures/](./failures/) | 失败案例与复盘 |
| [gotchas/](./gotchas/) | 工程踩坑记录与注意事项 |
| [bugs/](./bugs/) | Bug 跟踪与解决记录 |

## 归档原则

- 复盘报告使用 **blameless postmortem** 写法
- 量化影响范围和严重程度
- 每条经验教训必须可追溯到具体事件或证据
- 改进行动需要有负责人和跟进日期
- 踩坑记录在遇到后 24 小时内添加（硬性要求，参见 [../../run/knowledge-contributor-charter.md](../../run/knowledge-contributor-charter.md)）

## 常被引用

- [gotchas/macos-fsevents-silent-drop.md](./gotchas/gotcha-macos-fsevents-silent-drop.md) — macOS FSEvents 静默丢弃事件
- [gotchas/vite-to-rsbuild-migration.md](./gotchas/gotcha-vite-to-rsbuild-migration.md) — Vite → Rsbuild 迁移踩坑记录
- [failures/incident-postmortem.md](./failures/failure-incident-postmortem.md) — 事故复盘总结
- [failures/ai-product-launch-lessons.md](./failures/failure-ai-product-launch-lessons.md) — AI 产品上线失败案例
- [wins/yiai-brd-agent-launch.md](./wins/win-yiai-brd-agent-launch.md) — YiAi BRD agent 上线
- [dashboard-lessons-learned.md](./dashboard-lessons-learned.md) — 经验教训仪表盘

## 相关

- [INDEX.md](./INDEX.md) — 此分类的索引
- [../../run/check-engineering-gotchas.md](../../run/check-engineering-gotchas.md) — 场景入口：工程踩坑记录
- [../../run/review-lessons.md](../../run/review-lessons.md) — 场景入口：复盘与经验教训