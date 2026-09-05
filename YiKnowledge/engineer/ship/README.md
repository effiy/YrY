---
title: Ship — Quality, Security, Data & Reliability
tags: [leaf, ship, quality, security, data, reliability, testing, resilience, observability]
category: engineer/ship
created: 2026-08-06
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, leader, srer]
benefit: "Engineers find quality, security, data, and reliability patterns"
acceptance_criteria:
  - "SHIP phase scope clearly bounded"
  - "Cross-references to related phases and roles are present"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../SECURITY.md
  - ../build/
  - ../run/
  - ../learn/
---

# Ship — 质量、安全、数据与可靠性

> **作为** engineer，**我希望**找到质量、安全、数据和可靠性模式，**以便**交付健壮、安全且具有韧性的系统。

SHIP 是 engineer pipeline 的第二个阶段——确保系统安全、经过测试，并在部署前做好生产准备。

## 此处应包含的内容

- 供应链安全与依赖加固
- 应用安全（密钥、审计日志、零信任）
- 数据库迁移与数据持久化模式
- 韧性模式（重试、超时、熔断器、背压）
- 可观测性与分布式追踪
- 流量管理（限流、负载削减、扩缩容）

## 交叉引用

- [../build/](../build/) — 架构与设计模式
- [../run/](../run/) — 团队工作流与 onboarding
- [../learn/](../learn/) — 经验教训与项目特定文档
- [../SECURITY.md](../SECURITY.md) — 跨角色安全领域索引
- [../../leader/risk/](../../leader/risk/) — 风险登记册与复盘
- [../../srer/observability/](../../srer/observability/) — 监控、告警、SLO