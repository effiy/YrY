---
title: 技术负责人 — 架构
tags: [leaf, leader, architecture, tech-selection, maturity-model, tech-debt]
category: leader/architecture
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人可以在一个地方找到架构决策框架、成熟度模型和技术选型指南"
acceptance_criteria:
  - "架构决策框架和 ADR 模板可访问"
  - "成熟度模型评估已记录"
  - "技术选型和技术债务追踪存在"
related:
  - ../INDEX.md
  - ../decisions/
  - ../../engineer/build/
---

# 技术负责人 — 架构

> **作为**技术负责人，**我想要**找到架构决策框架和技术选型指南，**以便**做出一致且文档完善的架构选择。

## 架构决策

| File | Description |
|---|---|
| [design-architecture-decision.md](./design-architecture-decision.md) | ADR 框架和 12 节模板 |
| [tl-tech-selection-llm-provider.md](./tl-tech-selection-llm-provider.md) | LLM 供应商选择标准 |
| [tl-tech-selection-react-state-management.md](./tl-tech-selection-react-state-management.md) | React 状态管理选择 |

## 成熟度与健康度

| File | Description |
|---|---|
| [tl-maturity-model-arch-2026-08.md](./tl-maturity-model-arch-2026-08.md) | 架构成熟度评估 |
| [tl-maturity-model-docs-2026-08.md](./tl-maturity-model-docs-2026-08.md) | 文档成熟度评估 |
| [tl-dora-metrics-2026-q2-baseline.md](./tl-dora-metrics-2026-q2-baseline.md) | DORA 指标基线 |

## 技术债务

| File | Description |
|---|---|
| [tl-tech-debt-yivad-no-test-framework.md](./tl-tech-debt-yivad-no-test-framework.md) | YiVad 测试框架技术债务 |

## 交叉引用

- [../decisions/](../decisions/) — 项目级 ADR（YiAi、YiVad、YiPet、FDE）
- [../../engineer/build/](../../engineer/build/) — 系统设计模式