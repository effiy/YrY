---
title: 产品指标 / Product Metrics
tags: [leaf, product, metrics]
category: producter/discovery/metrics
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter, executiver]
benefit: "PM 可以通过清晰的框架、可操作的建议和反模式意识来理解和应用产品指标"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - 包含与相关叶子目录和父级 INDEX 的交叉引用
related:
  - ../../../engineer/learn/lessons/learn-pm-frameworks.md
  - ../../../executiver/strategy/README.md
  - ../../frameworks/heart-aarrr-metrics.md
---

# 产品指标 / Product Metrics

> **作为**产品经理，**我想要**发现用户需求并验证产品决策，**以便**我们为正确的理由构建正确的东西。

包含产品指标体系、监控标准和北极星指标。

## 收录范围

- 北极星指标
- AI 产品特定指标（幻觉率、置信度、工具调用成功率）
- 留存与流失
- AARRR 海盗指标
- DORA 工程效率

## 文件类型与命名

- `*-summary.md`：指标体系的摘要
- `*-template.md`：指标定义模板
- 命名使用英文 kebab-case

## Frontmatter 模板

```yaml
---
title: A metric system
tags: [metric, monitoring]
created: YYYY-MM-DD
source: <link>
type: summary
lifecycle: reference
review_cycle: quarterly
related:
  - ./ai-product-metrics.md
  - ./dashboard-customer-health.md
  - ./dashboard-product-portfolio.md
  - ../README.md
  - ../INDEX.md
---
```

## 推荐撰写结构

1. 指标定义（公式 / 计算逻辑）
2. 采集方法（埋点 / 日志 / 查询）
3. 健康阈值（绿色 / 黄色 / 红色）
4. 异常处理流程
5. 相关指标（先行 / 滞后）
6. 本产品当前值及目标值

## 已收录

- `north-star-metric-summary.md` — 北极星指标
- `ai-product-metrics-summary.md` — AI 产品特定指标（幻觉率 / 置信度 / 工具调用成功率）
- `retention-and-churn-summary.md` — 留存与流失指标
- `aarrr-metrics.md` — AARRR 海盗指标：各阶段指标、AI 产品适配
- `dora-metrics.md` — DORA 工程效率指标：四项关键指标、Elite/High/Medium/Low 基准、能力驱动因素
- `nps-csat.md` — NPS 和 CSAT 方法论：问卷设计、闭环流程、AI 产品考量
- `funnel-conversion.md` — 漏斗转化分析：AIDA 模型、流失诊断、CRO 实验框架

## 相关叶子目录

- [../../../executiver/strategy](../../../executiver/strategy) — 战略对齐
- [../ux/](../ux/) — UX 度量
- [../../frameworks](../../frameworks) — HEART / AARRR
- [../../../engineer/run/engineering-productivity-metrics.md](../../../engineer/run/engineering-productivity-metrics.md) — DORA
- [../../../engineer/learn/lessons/learn-pm-frameworks.md](../../../engineer/learn/lessons/learn-pm-frameworks.md) — 场景入口