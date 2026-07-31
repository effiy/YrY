# 产品指标 / Product Metrics

收录产品指标体系、监控规范、北极星指标。

## 文件类型

- `*-summary.md`：某指标体系摘要
- `*-template.md`：指标定义模板

## 推荐结构

```markdown
---
title: 某指标体系
tags: [指标, 监控]
category: product/metrics
created: YYYY-MM-DD
source: <链接>
type: summary
---

## 指标定义（公式 / 计算口径）
## 采集方式（埋点 / 日志 / 调查）
## 健康阈值（绿 / 黄 / 红）
## 异常处置流程
## 关联指标（领先 / 滞后）
```

## 已收录

- `north-star-metric-summary.md` — 北极星指标
- `ai-product-metrics-summary.md` — AI 产品专用指标（幻觉率 / 置信度 / 工具调用成功率）
- `retention-and-churn-summary.md` — 留存与流失指标

## 待收录

- AARRR 海盗指标（与 HEART 一起见 `methodology/pm-frameworks/heart-aarrr-metrics-summary.md`）
- DORA 研发效能指标（见 `work/processes/engineering-productivity-metrics-summary.md`）
