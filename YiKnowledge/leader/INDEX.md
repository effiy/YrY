---
title: "Tech Lead role index"
tags: [index, leader, adr, architecture, capacity, risk, roadmap]
category: leader
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "技术负责人可通过此索引一站式查阅架构决策、容量规划、风险登记册和路线图"
acceptance_criteria:
  - "5个子目录均包含 README 文件"
related:
  - ./README.md
  - ../INDEX.md
---

# 技术负责人 — 角色索引

> **流水线阶段**：2. 决策 — 技术负责人负责决策。实现阶段请查阅 [engineer/](../engineer/)。事故响应请查阅 [srer/](../srer/)。产品需求请查阅 [producter/](../producter/)。

## 子目录

| 领域 | 内容 |
|---|---|
| [architecture/](./architecture/) | 架构模式、技术选型评估、成熟度模型 |
| [decisions/](./decisions/) | YiAi、YiVad、YiPet、FDE 等项目的架构决策记录 (ADR) |
| [capacity/](./capacity/) | 容量与成本追踪、依赖审计 |
| [risk/](./risk/) | 风险登记册、故障沟通、事后复盘方法论 |
| [roadmap/](./roadmap/) | 路线图规划、技术债务管理、概念验证、SLO 定义 |

## 跨角色引用

- [../engineer/build/](../engineer/build/) — ADR 中引用的设计模式
- [../engineer/ship/](../engineer/ship/) — 安全决策
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — 安全领域索引