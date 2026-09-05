---
title: Engineer role
tags: [engineer, role, index]
category: engineer
created: 2026-08-03
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "Engineers find content by problem domain within 2 hops"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "cross-references to related leaves and parent INDEX are present"
related:
  - ./INDEX.md
  - ./ENGINEERING.md
  - ./SECURITY.md
  - ../README.md
  - ../INDEX.md
---

# Engineer

> **Pipeline 阶段 3：设计 + 构建** — Engineer 负责**实现**。不做架构决策（→ [leader/](../leader/)）、不定义产品需求（→ [producter/](../producter/)）、不运维生产环境（→ [srer/](../srer/)）。

## 问题域

| 阶段 | 领域 | 解决的问题 |
|---|---|---|
| BUILD | [build/](./build/) | 如何设计和搭建此系统？ |
| SHIP | [ship/](./ship/) | 如何测试、加固、持久化并使其具有韧性？ |
| RUN | [run/](./run/) | 我们如何协作和 onboarding？ |
| LEARN | [learn/](./learn/) | 经验教训和项目特定文档 |

## 范围

### 范围内（engineer 拥有）
- 系统设计、API 设计、开发工具、DX → [build/](./build/)
- 代码质量、测试、安全、数据、韧性、可观测性 → [ship/](./ship/)
- 团队工作流、onboarding、横切场景 → [run/](./run/)
- 成功案例、失败案例、踩坑记录、项目特定文档 → [learn/](./learn/)

### 范围外（委托给其他角色）
- 带权衡的架构决策 → [leader/decisions/](../leader/decisions/)
- 技术选型评估 → [leader/架构/](../leader/架构/)
- 事件响应流程 → [srer/incident-response/](../srer/incident-response/)
- AI 理论与基础 → [aier/基础/](../aier/基础/)
- 产品需求与 PRD → [producter/discovery/](../producter/discovery/)
- KB 治理与结构 → [curator/治理/](../curator/治理/)

## 核心观点

- **问题域优先** — 内容按你正在解决的问题组织（Build → Ship → Run → Learn）
- **实现，而非决策** — engineer/ 记录如何构建；leader/ 记录为何选择该方案
- **经验教训是第一类产物** — 每次成功、失败和踩坑都值得记录

## 跨角色引用

- [../leader/](../leader/) — 架构决策、容量、风险、路线图
- [../aier/](../aier/) — AI 基础、方法论、平台
- [../producter/](../producter/) — PM 框架、发现、交付
- [../srer/](../srer/) — 事件响应、可观测性、发布
- [../projects/](../projects/) — 项目运营产物（bugs、issues、demos）
- [./ENGINEERING.md](./ENGINEERING.md) — 跨角色工程领域索引
- [./SECURITY.md](./SECURITY.md) — 跨角色安全领域索引
- [./learn/INDEX.md](./learn/INDEX.md) — Learn 阶段索引（经验教训 + 项目）