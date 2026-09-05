---
title: Oncall SRE
tags: [leaf, srer, incident-response, observability, release]
category: srer
created: 2026-08-06
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer, engineer]
benefit: "Oncall SRE 按问题域组织查找事件响应、可观测性和发布流程"
acceptance_criteria:
  - "3 个问题域子目录：incident-response, observability, release"
  - "每个子目录有 README，包含分类文件清单"
  - "最多 3 级目录"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../engineer/SECURITY.md
  - ../engineer/ship/
---

# Oncall SRE

> **流水线阶段 4/5：质量 + 发布 + 5/5：运维 + 学习** — 输入芯片：`Working software`、`Running services` → 输出芯片：`Release procedures`、`Incident response`、`Observability`、`SLO compliance`、`Postmortems`
>
> **作为** oncall SRE，**我希望**找到事件响应流程、可观测性指南和发布管理流程，**以便**保持系统可靠性并有效响应事件。
>
> Srer 运维生产环境。不构建系统（→ [engineer/](../engineer/)），不做架构决策（→ [leader/](../leader/)），不定义产品需求（→ [producter/](../producter/)）。

## 快速导航

| 资源 | 描述 |
|---|---|
| [INDEX.md](./INDEX.md) | Srer 角色索引 — 子目录映射、文件数量、关键流程 |
| [incident-response/](./incident-response/) ([README](./incident-response/README.md)) | 事件流程、事后复盘、oncall 交接、演练 — 17 个文件 |
| [observability/](./observability/) ([README](./observability/README.md)) | 监控、告警、基础设施、SLO/SLI、容量 — 13 个文件 |
| [release/](./release/) ([README](./release/README.md)) | 发布协调、金丝雀、热修复、回滚、冻结 — 6 个文件 |

## 流水线芯片契约

| 芯片 | 类型 | 阶段 | 描述 | 知识域 |
|---|---|---|---|---|
| Working software | ← 输入 | 4 | 来自 engineer/ 的实现制品 | [engineer/](../engineer/) |
| Running services | ← 输入 | 5 | 生产环境中运行的服务 | [observability/](./observability/) |
| `release-procedures` | 输出 → | 4 | 发布、回滚、金丝雀、热修复流程 | [release/](./release/) |
| `incident-response` | 输出 → | 4 | On-call 交接、无责事后复盘模板 | [incident-response/](./incident-response/) |
| `observability` | 输出 → | 4 | 监控、告警、仪表盘、SLO/SLI | [observability/](./observability/) |
| `slo-compliance` | 输出 → | 5 | SLO 追踪、错误预算管理、可用性 | [observability/](./observability/) |
| `postmortems` | 输出 → | 5 | 根因分析、行动项、时间线重建 | [incident-response/](./incident-response/) |

## 摘要

- 3 个子目录：[incident-response/](./incident-response/)（事件流程 + 事后复盘）/ [observability/](./observability/)（监控 + 基础设施 + SLO）/ [release/](./release/)（发布 + 回滚 + 热修复）
- 2 份真实事后复盘：[FSEvents silent drop](./incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md) / [no-lockfile supply chain](./incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md)
- 2 份 oncall 交接示例：[W32](./incident-response/tl-oncall-handover-2026-w32.md) / [W33](./incident-response/tl-oncall-handover-2026-w33.md)
- 可观测性覆盖三大支柱（日志/指标/链路追踪）、容器化、CI/CD、反向代理、GPU 推理、容量/成本和技术债务
- 发布覆盖标准、金丝雀、热修复和回滚演练工作流
- 事件响应事后复盘存放在此；事后复盘**方法论**存放在 [leader/risk/](../leader/risk/)

## 核心观点

- **SRE 运维，不构建** — 事件响应流程、可观测性仪表盘和发布协调是运维问题；实现模式属于 [engineer/](../engineer/)
- **事后复盘是运维记录，方法论是战略** — 实际事后复盘存放在 [incident-response/](./incident-response/)；事后复盘模板和方法论存放在 [leader/risk/](../leader/risk/)
- **可观测性是可靠性的基础** — 无法衡量的东西就无法改进；SLO/SLI 定义驱动错误预算和发布信心
- **发布是流程，不是按钮** — 发布协调、冻结管理和回滚演练是经过实践的运维流程，不是 CI/CD 自动化（那是 [engineer/](../engineer/) 的范畴）

## 子目录

### incident-response/（17 个文件）

| 分类 | 关键文件 |
|---|---|
| 响应流程 | [respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) · [handle-a-data-breach.md](./incident-response/handle-a-data-breach.md) · [handle-a-ddos-attack.md](./incident-response/handle-a-ddos-attack.md) · [handle-a-cache-invalidation.md](./incident-response/handle-a-cache-invalidation.md) · [handle-a-major-version-upgrade.md](./incident-response/handle-a-major-version-upgrade.md) |
| 演练与演习 | [run-a-war-room.md](./incident-response/run-a-war-room.md) · [run-a-game-day.md](./incident-response/run-a-game-day.md) · [run-a-chaos-engineering-experiment.md](./incident-response/run-a-chaos-engineering-experiment.md) · [do-a-rollback-drill.md](./incident-response/do-a-rollback-drill.md) · [do-a-blast-radius-analysis.md](./incident-response/do-a-blast-radius-analysis.md) |
| Oncall 运维 | [handle-an-oncall-shift.md](./incident-response/handle-an-oncall-shift.md) · [set-up-an-oncall-rotation.md](./incident-response/set-up-an-oncall-rotation.md) |
| 事后复盘 | [tl-postmortem-fsevents-silent-drop-2026-08.md](./incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md) · [tl-postmortem-no-lockfile-supply-chain-2026-07.md](./incident-response/tl-postmortem-no-lockfile-supply-chain-2026-07.md) |
| 交接 | [tl-oncall-handover-2026-w32.md](./incident-response/tl-oncall-handover-2026-w32.md) · [tl-oncall-handover-2026-w33.md](./incident-response/tl-oncall-handover-2026-w33.md) |

### observability/（13 个文件）

| 分类 | 关键文件 |
|---|---|
| 核心可观测性 | [observability-triad.md](./observability/observability-triad.md) · [set-up-observability.md](./observability/set-up-observability.md) |
| 基础设施 | [docker-kubernetes.md](./observability/docker-kubernetes.md) · [containerized-deployment.md](./observability/containerized-deployment.md) · [reverse-proxy.md](./observability/reverse-proxy.md) · [private-vs-public-cloud.md](./observability/private-vs-public-cloud.md) · [gpu-inference.md](./observability/gpu-inference.md) |
| CI/CD | [cicd.md](./observability/cicd.md) |
| 容量与成本 | [capacity-and-cost.md](./observability/capacity-and-cost.md) · [capacity-and-cost-template.md](./observability/capacity-and-cost-template.md) |
| 技术债务 | [tech-debt-inventory.md](./observability/tech-debt-inventory.md) · [tech-debt-inventory-template.md](./observability/tech-debt-inventory-template.md) |

### release/（6 个文件）

| 分类 | 关键文件 |
|---|---|
| 发布流程 | [release.md](./release/release.md) · [canary-release.md](./release/canary-release.md) · [hotfix-release.md](./release/hotfix-release.md) |
| 发布治理 | [release-freeze.md](./release/release-freeze.md) |
| 回滚 | [rollback-drill.md](./release/rollback-drill.md) |

## 范围

### 在范围内（srer 拥有）

**`release-procedures` 芯片：**
- 发布协调、热修复流程、回滚演练 → [release/](./release/)
- 发布冻结管理 → [release/](./release/)

**`incident-response` 芯片：**
- 事件响应流程和 runbook → [incident-response/](./incident-response/)
- On-call 交接模板和排班 → [incident-response/](./incident-response/)
- War room 和 Game Day 主持 → [incident-response/](./incident-response/)

**`observability` 芯片：**
- 可观测性配置（监控、告警、仪表盘、SLO） → [observability/](./observability/)
- 容量和成本监控仪表盘 → [observability/](./observability/)

**`slo-compliance` 芯片：**
- SLO/SLI 定义和追踪 → [observability/](./observability/)
- 错误预算管理 → [observability/](./observability/)

**`postmortems` 芯片：**
- 无责事后复盘撰写和示例 → [incident-response/](./incident-response/)
- 技术债务清单追踪 → [observability/](./observability/)

### 超出范围（委托给其他角色）
- 事前风险评估和风险登记册 → **[leader/risk/](../leader/risk/)**
- 关于可靠性的架构决策 → **[leader/decisions/](../leader/decisions/)**
- 弹性实现模式（重试、退避、熔断器） → **[engineer/ship/](../engineer/ship/)**
- CI/CD 流水线搭建 → **[engineer/build/](../engineer/build/)**
- 安全加固和威胁建模 → **[engineer/ship/](../engineer/ship/)**
- 容量规划和 FinOps 策略 → **[leader/capacity/](../leader/capacity/)**
- 部署策略（金丝雀、蓝绿） → **[engineer/ship/](../engineer/ship/)**

## 边界情况决策规则

| 当内容涉及... | 芯片 | 路由到 | 原因 |
|---|---|---|---|
| 事件期间该做什么 | `incident-response` | [srer/incident-response/](./incident-response/) | 运维流程 |
| 如何预防此类事件 | `adrs` | [leader/risk/](../leader/risk/) | 战略性风险缓解 |
| 特定事件的事后复盘 | `postmortems` | [srer/incident-response/](./incident-response/) | 运维记录 |
| 事后复盘方法/模板 | `adrs` | [leader/risk/](../leader/risk/) | 方法论（与 leader 共享） |
| 如何为 X 配置监控 | `observability` | [srer/observability/](./observability/) | 运维配置 |
| 如何实现金丝雀发布 | `release-procedures` | [engineer/ship/](../engineer/ship/) | 实现模式 |
| 发布协调和审批 | `release-procedures` | [srer/release/](./release/) | 运维流程 |
| SLO 定义和追踪 | `slo-compliance` | [srer/observability/](./observability/) | 运维追踪 |
| 事前风险评估 | `adrs` | [leader/risk/](../leader/risk/) | 战略规划 |
| 如何在代码中实现重试逻辑 | — | [engineer/ship/](../engineer/ship/) | 实现模式 |
| 发布协调检查清单 | `release-procedures` | [srer/release/](./release/) | 运维流程 |
| 金丝雀部署实现 | — | [engineer/ship/](../engineer/ship/) | 实现模式 |
| 成本监控仪表盘 | `observability` | [srer/observability/](./observability/) | 运维监控 |
| 成本规划和预算 | `capacity-plans` | [leader/capacity/](../leader/capacity/) | 战略规划 |

## 问题域

| 域 | 解决问题 | 文件数 |
|---|---|---|
| [incident-response/](./incident-response/) | 如何响应和管理事件？ | 17 |
| [observability/](./observability/) | 如何监控和观测系统？ | 13 |
| [release/](./release/) | 如何安全发布和回滚？ | 6 |

## 快速参考

| 我想... | 前往 |
|---|---|
| 响应事件 | [incident-response/respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) |
| 处理数据泄露 | [incident-response/handle-a-data-breach.md](./incident-response/handle-a-data-breach.md) |
| 处理 DDoS 攻击 | [incident-response/handle-a-ddos-attack.md](./incident-response/handle-a-ddos-attack.md) |
| 主持 War Room | [incident-response/run-a-war-room.md](./incident-response/run-a-war-room.md) |
| 组织 Game Day | [incident-response/run-a-game-day.md](./incident-response/run-a-game-day.md) |
| 运行混沌实验 | [incident-response/run-a-chaos-engineering-experiment.md](./incident-response/run-a-chaos-engineering-experiment.md) |
| 做爆炸半径分析 | [incident-response/do-a-blast-radius-analysis.md](./incident-response/do-a-blast-radius-analysis.md) |
| 处理 oncall 值班 | [incident-response/handle-an-oncall-shift.md](./incident-response/handle-an-oncall-shift.md) |
| 设置 oncall 排班 | [incident-response/set-up-an-oncall-rotation.md](./incident-response/set-up-an-oncall-rotation.md) |
| 撰写事后复盘 | [../leader/risk/write-a-postmortem.md](../leader/risk/write-a-postmortem.md) |
| 阅读真实事后复盘 | [incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md](./incident-response/tl-postmortem-fsevents-silent-drop-2026-08.md) |
| 配置可观测性 | [observability/set-up-observability.md](./observability/set-up-observability.md) |
| 理解可观测性三大支柱 | [observability/observability-triad.md](./observability/observability-triad.md) |
| 监控容量和成本 | [observability/capacity-and-cost.md](./observability/capacity-and-cost.md) |
| 管理技术债务清单 | [observability/tech-debt-inventory.md](./observability/tech-debt-inventory.md) |
| 发布上线 | [release/release.md](./release/release.md) |
| 做金丝雀发布 | [release/canary-release.md](./release/canary-release.md) |
| 发布热修复 | [release/hotfix-release.md](./release/hotfix-release.md) |
| 管理发布冻结 | [release/release-freeze.md](./release/release-freeze.md) |
| 做回滚演练 | [release/rollback-drill.md](./release/rollback-drill.md) |

## 交叉引用

### 上游（srer 的输入）
- [../engineer/](../engineer/) — 实现制品（Working software）
- [../engineer/ship/](../engineer/ship/) — 弹性实现模式
- [../engineer/build/](../engineer/build/) — CI/CD 流水线搭建
- [../engineer/ship/](../engineer/ship/) — 安全加固、威胁建模
- [../leader/roadmap/](../leader/roadmap/) — SLO 定义、路线图优先级

### 同级（同一流水线阶段）
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — 安全域索引（跨领域）

### 下游（srer 产出的消费者）
- [../leader/risk/](../leader/risk/) — 事后复盘方法论、风险登记册
- [../leader/capacity/](../leader/capacity/) — 容量规划和 FinOps 策略
- [../engineer/learn/lessons/](../engineer/learn/lessons/) — 来自事件的现场笔记

### 同类（角色 README）
- [../engineer/README.md](../engineer/README.md) · [../leader/README.md](../leader/README.md) · [../producter/README.md](../producter/README.md) · [../aier/README.md](../aier/README.md) · [../executiver/README.md](../executiver/README.md)

## 流水线流程

```
engineer/（阶段 3：设计+构建）
    │ 架构模式、开发实践、质量安全
    ▼
┌── srer/（阶段 4：质量+发布 + 5：运维+学习）──┐
│  输入：Working software, Running services              │
│  输出：Release procedures, Incident response,          │
│        Observability, SLO compliance, Postmortems      │
└──────────────────────────────────────────────────────────┘
    │ 事后复盘、经验教训
    ▼
leader/risk/（事后复盘方法论）+ engineer/learn/lessons/（现场笔记）
```

### 关键跨阶段链接
- [release.md](./release/release.md) ← [engineer/ship/harden-supply-chain.md](../engineer/ship/harden-supply-chain.md) → [release/canary-release.md](./release/canary-release.md)
- [respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) ← [leader/risk/write-a-postmortem.md](../leader/risk/write-a-postmortem.md) → [observability/set-up-observability.md](./observability/set-up-observability.md)
- [set-up-observability.md](./observability/set-up-observability.md) ← [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) → [engineer/ship/retry-with-backoff.md](../engineer/ship/retry-with-backoff.md)
- [rollback-drill.md](./release/rollback-drill.md) ← [engineer/ship/migrate-data.md](../engineer/ship/migrate-data.md) — 数据迁移需要回滚方案
- [capacity-and-cost.md](./observability/capacity-and-cost.md) ← [leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — FinOps 反馈到监控

## 行动建议

1. **发生事件** → 从 [respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) 开始，然后按场景选择特定流程
2. **事后** → 使用 [leader/risk/write-a-postmortem.md](../leader/risk/write-a-postmortem.md) 撰写事后复盘；将实际复盘存放在 [incident-response/](./incident-response/)
3. **新服务上线** → 通过 [set-up-observability.md](./observability/set-up-observability.md) 配置可观测性，通过 [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) 定义 SLO，通过 [capacity-and-cost.md](./observability/capacity-and-cost.md) 进行容量评估
4. **发布日** → 遵循 [release.md](./release/release.md)；如需热修复，使用 [hotfix-release.md](./release/hotfix-release.md)；如需回滚，使用 [rollback-drill.md](./release/rollback-drill.md)
5. **Oncall 交接** → 使用 [tl-oncall-handover-2026-w33.md](./incident-response/tl-oncall-handover-2026-w33.md) 作为模板；每周更新
6. **每季度** → 通过 [tech-debt-inventory.md](./observability/tech-debt-inventory.md) 评审技术债务，通过 [run-a-game-day.md](./incident-response/run-a-game-day.md) 组织 Game Day

## 反模式

- **没有方法论就写事后复盘** — 后果：格式不一致，缺少根因分析；始终使用 leader/risk/ 中的 [事后复盘模板](../leader/risk/write-a-postmortem.md)
- **跳过回滚演练** — 后果：第一次回滚尝试发生在真实事件中；每季度执行 [rollback-drill.md](./release/rollback-drill.md)
- **没有 SLO 就配置告警** — 后果：告警疲劳，无优先级；先通过 [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) 定义 SLO，再配置告警
- **可观测性事后补** — 后果：生产环境盲区；将可观测性作为上线检查清单的一部分，而非上线后补救
- **Oncall 无交接** — 后果：轮班之间上下文丢失；始终在轮换结束前完成交接文档
- **混淆运维监控与战略规划** — 后果：成本仪表盘（srer）与成本预算（leader）混合；使用[决策规则](#边界情况决策规则)表