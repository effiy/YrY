---
title: 会议 / Meetings
tags: [leaf, work, meetings]
category: producter/delivery
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter, leader]
benefit: "PM 可以找到每个交付阶段合适的会议形式，确保会议驱动决策而非仅仅是状态更新"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
  - ../../engineer/run/review-lessons.md
  - ../../curator/templates/meeting-notes.md
  - ../../engineer/run/sprint-retrospective.md
---

# 会议 / Meetings

> **作为**产品经理，**我想要**召开高效的会议并运行交付流程，**以便**团队保持对齐并按时交付。

汇集会议模板、会议记录标准和会议效率原则。

## 收录范围

- 周会 / 评审会 / 回顾会 / 1on1
- 会议记录标准
- 会议效率原则
- 异步会议

## 文件类型与命名

- `*-template.md`：会议模板
- `*-summary.md`：一类会议的组织总结
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: some meeting template
tags: [meeting, type]
created: YYYY-MM-DD
source: internal
type: template
lifecycle: reference
review_cycle: quarterly
related:
  - ./daily-report.md
  - ./dashboard-product-delivery.md
  - ./design-review.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐撰写结构（会议模板）

1. 会议目标
2. 参与人与角色
3. 议程（含时间分配）
4. 输入材料
5. 产出（决策 / 行动项 / Parking Lot）
6. 后续跟踪

## 已收录

- `weekly-meeting-template.md` — 周会模板
- `review-meeting-template.md` — 评审会模板
- `retrospective-meeting-template.md` — 回顾会模板
- `weekly-report-sample.md` — 周报示例（2026 年第 31 周）：本周完成 / 下周计划 / 阻塞项 / 跨项目链接 / 风险
- `daily-report-sample.md` — 日报示例（2026-08-01 周五）：今日完成 / PR 速览 / 明日计划 / 阻塞项 / 风险雷达
- `retrospective-sample.md` — 回顾示例（2026 年第 31 周）：Keep / Drop / Try + 累积产出 + 关键事件时间线
- `one-on-one.md` — 1on1 模板，含管理者指南、skip-level 指南、教练问题库和频率建议
- `meeting-efficiency.md` — 会议效率原则：分类、卫生检查清单、成本计算器、异步优先决策树
- `async-meeting.md` — 异步会议模式：书面提案、异步站会、ADR、渠道选择、团队过渡路线图
- `quarterly-planning.md` — 季度规划会议模板：容量规划、承诺 vs 预测、依赖管理、反组合

## 相关叶子目录

- [../processes/](.) — 会议配套流程
- [../../engineer/collaboration-process](../../engineer/run/README.md) — 协作原则
- [../../curator/templates/meeting-notes.md](../../curator/templates/meeting-notes.md) — 会议记录模板
- [../../curator/templates/one-on-one.md](../../curator/templates/one-on-one.md) — 1on1 模板
- [../../engineer/run/sprint-retrospective.md](../../engineer/run/sprint-retrospective.md) — Sprint 回顾模板
- [../../engineer/run/review-lessons.md](../../engineer/run/review-lessons.md) — 场景入口