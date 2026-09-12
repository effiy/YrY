---
title: "产品经理角色索引"
tags: [index, producter, frameworks, discovery, delivery, strategy]
category: producter
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "产品经理可在统一索引中快速定位框架、发现、交付和战略内容"
acceptance_criteria:
  - "5 个子目录，各有对应的知识文件"
related:
  - ./README.md
  - ../INDEX.md
---

# 产品经理 — 角色索引

> **流水线阶段**：1. 需求定义 — 产品经理定义"做什么"。如何构建 → [engineer/](../engineer/)。技术决策 → [leader/](../leader/)。业务战略 → [executiver/](../executiver/)。

## 使用说明

本索引按问题领域组织产品经理的所有知识文件。你可以：

- **按子目录浏览**：每个子目录聚焦一个 PM 核心领域
- **按芯片查找**：通过 README.md 中的流水线芯片契约，按输入/输出快速定位
- **按场景检索**：使用 README.md 中的快速参考表，从"我想要..."出发找到对应文件

## 子目录

| 领域 | 内容 | 典型问题 |
|---|---|---|
| [frameworks/](./frameworks/) | PM 方法论框架：JTBD、Kano、RICE/ICE、MoSCoW、OKR、用户故事地图、用户研究方法 | "这个功能该不该做？优先级怎么排？" |
| [discovery/](./discovery/) | 用户研究、PRD 撰写与模板、UX 检查清单、产品指标体系 | "用户真正需要什么？如何写一份清晰的 PRD？" |
| [delivery/](./delivery/) | Sprint 管理、五项仪式、容量规划、反模式 | "如何高效运作一个 Sprint？" |
| [strategy/](./strategy/) | 行业案例研究、AI 产品模式、竞争分析 | "行业里其他人怎么做的？我们可以借鉴什么？" |
| [projects/](./projects/) | 各项目 PM 管理文档：YiAi、YiVad、YiPet | "每个项目的迭代节奏和交付物是什么？" |
| [okr/](./okr/) | 季度 OKR 与关键结果追踪 | "本季度目标完成情况如何？" |

## 建议学习路径

### 新手入门（第一周）
1. [01-发现-编写PRD.md](./discovery/01-发现-编写PRD.md) — 理解 PRD 的结构和撰写流程
2. [01-需求-PRD模板.md](./discovery/prd/01-需求-PRD模板.md) — 拿模板直接上手写第一份 PRD
3. [06-框架-RICE-ICE优先级.md](./frameworks/06-框架-RICE-ICE优先级.md) — 学会用数据而不是直觉排优先级

### 进阶（第二周）
4. [02-框架-JTBD框架摘要.md](./frameworks/02-框架-JTBD框架摘要.md) — 从"用户要什么功能"转向"用户要完成什么任务"
5. [03-框架-Kano模型摘要.md](./frameworks/03-框架-Kano模型摘要.md) — 学会分类功能属性，避免做了没人用的功能
6. [01-框架-用户研究方法.md](./frameworks/01-框架-用户研究方法.md) — 用证据替代假设

### 全面掌握（持续）
7. [04-框架-MoSCoW优先级.md](./frameworks/04-框架-MoSCoW优先级.md) — 版本范围控制的利器
8. [05-框架-OKR设计摘要.md](./frameworks/05-框架-OKR设计摘要.md) — 团队目标对齐
9. [07-框架-用户故事地图.md](./frameworks/07-框架-用户故事地图.md) — 可视化用户旅程
10. [01-指标-北极星指标.md](./discovery/metrics/01-指标-北极星指标.md) — 定义产品成功的唯一指标
11. [01-交付-运作Sprint.md](./delivery/01-交付-运作Sprint.md) — 从规划到回顾的完整 Sprint
12. [01-战略-AI客服案例.md](./strategy/01-战略-AI客服案例.md) — AI 产品模式参考

## 跨角色引用

- [../engineer/run/](../engineer/run/) — 工程团队协作和会议模板
- [../engineer/learn/lessons/](../engineer/learn/lessons/) — 成功案例、失败教训和踩坑记录
- [../executiver/strategy/](../executiver/strategy/) — 业务战略对齐
- [../leader/decisions/](../leader/decisions/) — 架构决策记录（ADR）
- [../aier/methods/](../aier/methods/) — AI 方法论参考