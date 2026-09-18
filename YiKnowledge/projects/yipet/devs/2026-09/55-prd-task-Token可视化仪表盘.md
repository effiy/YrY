---
doc_type: module
prd_task_id: "YP-09-48"
title: "YP-09-48: Token 可视化仪表盘 — 开发方案"
status: 待开始
priority: P3
owner: 陈铭
created: 2026-09-11
updated: 2026-09-14
project: YiPet
prd_month: "202609"
source_prd: "55-功能实现-Token可视化仪表盘.md"
---

# YP-09-48: Token 可视化仪表盘 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 需求编号：YP-09-48 · 状态：待开始

---

<a id="sec-1"></a>
## 一、方案概述

每条消息显示 Token 消耗：输入/输出/总 Token，成本估算，会话累计。

### Token 展示

| 位置 | 内容 |
|------|------|
| 消息底部芯片 | `📊 234 tokens · ¥0.001` |
| 会话顶部 | 累计 Token + 估算成本 |
| 设置页面 | 按模型/日期统计图表 |

> 低优先级。