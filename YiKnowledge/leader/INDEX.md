---
title: "Tech Lead role index"
tags: [index, leader, adr, architecture, capacity, risk, roadmap]
category: leader
created: 2026-08-06
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "技术负责人可通过此索引一站式查阅架构决策、容量规划、风险登记册和路线图"
acceptance_criteria:
  - "6 个子目录均包含 README 文件（含场景导航）"
  - "所有子目录 README 包含场景导航"
related:
  - ./README.md
  - ./QUICKREF.md
  - ./architecture/README.md
  - ./capacity/README.md
  - ./decisions/README.md
  - ./okr/README.md
  - ./risk/README.md
  - ./roadmap/README.md
  - ../INDEX.md
---

# 技术负责人 — 角色索引

> **流水线阶段**：2. 决策 — 技术负责人负责决策。实现阶段请查阅 [engineer/](../engineer/)。事故响应请查阅 [srer/](../srer/)。产品需求请查阅 [producter/](../producter/)。

## 子目录

| 领域 | 文件数 | 内容 |
|---|---|---|
| [architecture/](./architecture/) | 26+1 | 覆盖架构决策、选型、战略、设计、质量、运维六大领域 |
| [capacity/](./capacity/) | 6+1 | FinOps、成本追踪、依赖审计、自研vs采购、规模估算、预算规划 |
| [decisions/](./decisions/) | 14+1 | YiAi(5)、YiVad(3)、YiPet(6) 项目的架构决策记录 (ADR) |
| [okr/](./okr/) | 6+1 | Q3 已完成 + Q4 进行中（含 2 个 KR 追踪文档） |
| [risk/](./risk/) | 8+1 | 上线评估、事后复盘、风险登记册、依赖风险、事故指挥、安全审查、Runbook、灾难恢复 |
| [roadmap/](./roadmap/) | 20+1+1 | 看板、SLO、技术债量化、选型、PoC、路线图、审查、沟通、节奏、估算、委托、入职、反馈、获得支持、状态报告、健康检查 |

## 跨角色引用

- [../engineer/build/](../engineer/build/) — ADR 中引用的设计模式
- [../engineer/ship/](../engineer/ship/) — 安全决策
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — 安全领域索引
- [../srer/incident-response/](../srer/incident-response/) — 事故复盘记录（方法论在 risk/，记录在 srer/）