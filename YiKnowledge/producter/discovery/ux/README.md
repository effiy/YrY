---
title: 用户体验 / UX
tags: [leaf, product, ux]
category: producter/discovery/ux
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter]
benefit: "PM 可以通过清晰的框架、可操作的建议和反模式意识来理解和应用用户体验 / UX"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - "包含与相关叶子目录和父级 INDEX 的交叉引用"
related:
 - ../../../engineer/learn/lessons/learn-pm-frameworks.md
 - ../metrics/README.md
 - ../../frameworks/README.md
---

# 用户体验 / UX

> **作为**产品经理，**我想要**发现用户需求并验证产品决策，**以便**我们为正确的理由构建正确的东西。

汇集 UX 研究、设计原则、可用性 QA 结果。

## 收录范围

- UX 研究摘要
- 设计原则（Nielsen 10 项启发式原则等）
- 可用性 QA 报告
- AI 产品 UX 模式
- 跨文化 UX
- 视觉走查记录

## 文件类型与命名

- `*-summary.md`：UX 研究摘要
- `*-test.md`：可用性 QA 报告
- `*-review.md`：视觉走查
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: some UX research
tags: [UX, usability]
created: YYYY-MM-DD
source: <link or internal>
type: summary
lifecycle: active
review_cycle: quarterly
related:
  - ./after-sales-pad-visual-review.md
  - ./ai-product-ux-patterns.md
  - ./cross-cultural-ux.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐撰写结构

1. 研究目标
2. 方法（访谈 / 可用性 QA / 数据分析）
3. 关键发现
4. 设计建议
5. 后续跟踪
6. 相关指标

## 已收录

- `spritesheet-summary.md` — 雪碧图摘要
- `after-sales-pad-visual-review-summary.md` — 售后 PAD 视觉走查表（7.21）
- `ai-product-ux-patterns-summary.md` — AI 产品 UX 模式（流式输出 / 思考展示 / 工具调用透明）
- `nielsen-heuristics-summary.md` — Nielsen 10 项启发式原则评估
- `cross-cultural-ux-summary.md` — 跨文化 UX 设计
- `mobile-usability.md` — 移动端可用性最佳实践
- `accessibility.md` — Web 无障碍标准
- `information-architecture.md` — 信息架构设计
- `micro-interaction.md` — 微交互设计

## 相关叶子目录

- [../metrics/](../metrics/) — UX 度量（CSAT / 任务完成率）
- [../../../executiver/strategy](../../../executiver/strategy) — 战略对齐
- [../../frameworks](../../frameworks) — PM 框架
- [../../../curator/templates/usability-test-report.md](../../../curator/templates/usability-test-report.md) — 可用性 QA 模板
- [../../../engineer/learn/lessons/learn-pm-frameworks.md](../../../engineer/learn/lessons/learn-pm-frameworks.md) — 场景入口