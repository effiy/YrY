---
title: Engineering domain index
tags: [domain-index, engineering, architecture, quality, deployment, data, tools, lessons]
category: root
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, aier, srer]
benefit: "All engineering content reachable from a single cross-role index"
acceptance_criteria:
  - "Aggregates engineering directories from engineer/, leader/, srer/"
  - "Organized by subdomain"
related:
  - ./INDEX.md
  - ./README.md
  - ./SECURITY.md
  - ../curator/COLLABORATION.md
---

# 工程领域聚合索引

跨角色聚合架构、开发、质量、部署、数据、可靠性及工具类内容，提供统一的工程知识入口。

## 架构与设计

| 目录 | 角色 | 描述 |
|---|---|---|
| [build/](./build/) | engineer | API 设计模式、系统架构、开发实践指南。关键文档：RPC 协议规范、SSE 流式实现、跨项目调用指南 |
| [../leader/架构/](../leader/架构/) | leader | 技术选型评估、架构成熟度模型、系统级设计原则 |
| [../leader/decisions/](../leader/decisions/) | leader | 架构决策记录（ADR），覆盖 YiAi、YiVad、YiPet、FDE 等技术决策 |

## 开发与工具

| 目录 | 角色 | 描述 |
|---|---|---|
| [build/](./build/) | engineer | 开发工具链、开发者体验（DX）、项目启动模板、依赖管理策略 |

## 质量与测试

| 目录 | 角色 | 描述 |
|---|---|---|
| [ship/](./ship/) | engineer | 测试基础设施搭建、代码审查实践、供应链安全加固、技术债管理 |
| [../srer/observability/](../srer/observability/) | srer | 生产环境监控、告警配置、仪表盘、SLO/SLI 定义 |

## 数据与持久化

| 目录 | 角色 | 描述 |
|---|---|---|
| [ship/](./ship/) | engineer | 数据安全迁移（四阶段流程）、数据库备份策略、MongoDB 性能优化 |

## 可靠性与韧性

| 目录 | 角色 | 描述 |
|---|---|---|
| [ship/](./ship/) | engineer | 退避重试模式、熔断降级、容量规划与扩缩容决策 |
| [../srer/../observability/](../srer/observability/) | srer | 生产环境可观测性：监控、告警、仪表盘、SLO 跟踪 |

## 部署与运维

| 目录 | 角色 | 描述 |
|---|---|---|
| [../srer/release/](../srer/release/) | srer | 发布协调、热修复（hotfix）、回滚流程、金丝雀部署 |
| [../srer/incident-response/](../srer/incident-response/) | srer | 事件响应流程和事故复盘（postmortem）方法 |

## 经验教训

| 目录 | 角色 | 描述 |
|---|---|---|
| [learn/lessons/](./learn/lessons/) | engineer | 来自 YrY 真实项目的成功案例（wins）、失败复盘（failures）、陷阱记录（gotchas） |
| [learn/projects/](./learn/projects/) | engineer | 项目特定文档：YiAi/YiVad/YiPet 的架构设计、开发规范、功能模块清单 |

## 团队协作与入职

| 目录 | 角色 | 描述 |
|---|---|---|
| [run/onboarding/](./run/onboarding/) | engineer | 新人入职指南：YiAi（Python 后端）、YiPet（Chrome 扩展）、YiVad（Vue 前端） |
| [../curator/COLLABORATION.md](../curator/COLLABORATION.md) | curator | 团队流程、会议规范、知识共享机制 |

## 跨领域引用

- [SECURITY.md](./SECURITY.md) — 安全领域聚合索引：供应链安全、应用安全、风险评估、合规
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — 团队流程与协作领域索引
- [./INDEX.md](./INDEX.md) — Engineer 角色完整索引（Build/Ship/Run/Learn 全部内容）