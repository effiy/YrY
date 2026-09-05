---
title: 产品管理框架 / PM 框架
tags: [leaf, methodology, pm-frameworks]
category: producter/frameworks
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter, executiver]
benefit: "PM 可以找到适合其场景的优先级排序和发现框架，避免生搬硬套方法论"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
  - ../../engineer/learn/lessons/learn-pm-frameworks.md
  - ../../executiver/strategy/README.md
  - ../discovery/metrics/README.md
  - ../discovery/ux/README.md
---

# 产品管理框架 / PM 框架

> **作为**产品经理，**我想要**找到适合我场景的 PM 框架，**以便**将经过验证的方法论应用于产品决策。

汇集产品管理方法论、流程框架和决策模型。

## 范围

- 敏捷产品管理（Scrum / Kanban / SAFe）
- 产品发现与交付（双轨敏捷、发现）
- 路线图与优先级排序（RICE、ICE、MoSCoW、Kano）
- 用户研究方法（JTBD、用户画像、用户旅程地图）
- 度量与回顾（OKR、NPS、HEART、AARRR）

## 文件类型与命名

- `{framework-name}-summary.md`：框架摘要
- `{framework-name}-template.md`：可复用模板
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: Some Framework
tags: [PM, framework, topic]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: <link or internal>
type: summary
lifecycle: reference
review_cycle: quarterly
related:
  - ./agile-product-management.md
  - ./dashboard-pm-frameworks.md
  - ./do-user-research.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐结构

1. 框架起源与作者
2. 核心概念与原则
3. 实施步骤
4. 输入 / 产出物
5. 适用场景与边界
6. 与其他框架的对比
7. 本团队的落地案例

## 已收录

- `agile-product-management-summary.md` — 敏捷产品管理摘要
- `rice-ice-prioritization-summary.md` — RICE / ICE 优先级排序框架
- `jobs-to-be-done-summary.md` — Jobs-to-Be-Done (JTBD)
- `kano-model-summary.md` — Kano 模型
- `heart-aarrr-metrics-summary.md` — HEART / AARRR 指标框架
- `okr-design-summary.md` — OKR 设计指南
- `dual-track-agile-summary.md` — 双轨敏捷
- `product-discovery-framework-summary.md` — 产品发现框架
- `moscow-prioritization.md` — MoSCoW 优先级排序方法
- `story-mapping.md` — 用户故事地图技术
- `lean-startup.md` — 精益创业方法论
- `jtbd-kano.md` — JTBD + Kano 模型整合

## 相关叶子目录

- [../../aier/方法](../../aier/方法) — AI 方法论
- [../../curator/templates/thinking](../../curator/templates/thinking) — 思维模型
- [../../executiver/strategy](../../executiver/strategy) — 战略
- [../product/metrics](../discovery/metrics) — 指标
- [../product/ux](../discovery/ux) — UX
- [../../curator/templates](../../curator/templates) — 模板
- [../../engineer/learn/lessons/learn-pm-frameworks.md](../../engineer/learn/lessons/learn-pm-frameworks.md) — 场景入口