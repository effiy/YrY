---
doc_type: module
prd_task_id: "YK-09-28"
title: "YK-09-28: 健康仪表盘 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "31-架构设计-健康仪表盘.md"
source_okr: [yiknowledge-001]
related_tests: ["31-prd-test-健康仪表盘"]
---

# YK-09-28: 健康仪表盘 — 开发方案

> 需求编号：YK-09-28 · 优先级：P2 · 人天：1.0d

---

## 一、架构总览

知识库健康仪表盘聚合展示：文件总数/分类分布/Frontmatter 合规率/过期文档数/空结果率/索引状态。数据源复用 YK-09-04 监控指标和 YK-09-06 生命周期数据，前端 ECharts 渲染。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 仪表盘数据聚合 API | 0.3 |
| 2 | ECharts 图表渲染（饼图/折线图/柱状图） | 0.4 |
| 3 | 趋势预警阈值配置 | 0.2 |
| 4 | 测试 | 0.1 |

**总计：1.0d**

---