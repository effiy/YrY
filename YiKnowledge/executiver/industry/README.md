---
title: 行业情报
aliases:
- industry-category-readme
- industry-readme
- market-intelligence
tags:
- leaf
- industry
- market
- competitors
category: executiver/industry
created: '2026-08-03'
updated: '2026-08-03'
last_verified: '2026-08-07'
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: monthly
roles:
- executiver
benefit: "高管可以按子领域找到市场情报、竞争对手分析和行业报告，以支持基于证据的战略决策"
acceptance_criteria:
- 叶子目录范围边界清晰
- 文件清单表完整，包含一句话描述
- 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
- ./INDEX.md
- ../../engineer/run/understand-competitors.md
- ../../aier/机器学习/find-ai-deployment-cases.md
- ../../producter/strategy/
---

# 行业情报

> **作为**高管，**我想要**追踪竞争对手、市场趋势和行业报告，**以便**战略决策立足于市场现实。
> 外部行业知识中心入口：竞争对手、市场趋势、行业报告、落地案例研究。行业知识具有时效性；超过半年未验证的条目必须标记 `status: deprecated`。

## 子目录

| Leaf | Curated content |
|---|---|
| [competitors/](./competitors/) | 竞争对手公司档案、分析、模板 |
| [market-trends/](./market-trends/) | 市场趋势观察、半年度回顾、区域市场模板 |
| [reports/](./reports/) | 第三方行业报告摘要和原文 |
| [use-cases/](../../producter/strategy) | AI 客服 / 售后 / RAG+Agent 落地案例研究、案例研究模板 |

## 归档原则

- **双副本归档**：外部内容保留两份 — 原文 `*-original.md` + 摘要 `*-summary.md`，frontmatter 中 `source` 指向原文。
- **YAML 元数据规范**：所有摘要必须包含 `updated` 和 `last_verified`；外部内容必须包含 `review_cycle`（monthly / quarterly / yearly）。
- **时效性管理**：超过半年未验证的条目必须标记 `status: deprecated` 并归档到 `archive/`。
- **月度审查节奏**：每月扫描 `last_verified`；及时验证或归档过期条目。

## 常用参考 Top

- [competitors/llm-vendor-landscape-summary.md](./competitors/llm-vendor-landscape.md) — 大模型供应商竞争格局
- [competitors/competitor-analysis-template.md](./competitors/competitor-analysis.md) — 竞争对手分析模板
- [reports/ai-industry-report-summary.md](./reports/ai-industry-report.md) — AI 行业报告摘要

## 相关

- [INDEX.md](./INDEX.md) — 本类别 MOC
- [../../engineer/run/understand-competitors.md](../../engineer/run/understand-competitors.md) — 场景入口：竞争对手和行业
- [../../aier/机器学习/find-ai-deployment-cases.md](../../aier/机器学习/find-ai-deployment-cases.md) — 场景入口：AI 落地案例研究
- [../../curator/diagrams/knowledge-map.md](../../curator/diagrams/knowledge-map.md) — 知识地图
- [../../MEMORY.md](../../MEMORY.md) — 知识库全局归档原则和 YAML 规范