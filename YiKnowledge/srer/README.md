---
title: Oncall SRE
tags: [leaf, srer, incident-response, observability, release]
category: srer
created: 2026-08-06
updated: 2026-09-15
last_verified: 2026-09-15
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
> Srer 负责运维生产环境。不构建系统（见 [engineer/](../engineer/)），不做架构决策（见 [leader/](../leader/)），不定义产品需求（见 [producter/](../producter/)）。

## 团队角色与职责

SRE 角色在 YrY 单仓中承担以下核心职责：

| 职责领域 | 具体内容 | 产出物 |
|---|---|---|
| **事件响应** | 告警响应、故障定级、作战室指挥、根因分析 | 事件时间线、事后复盘文档 |
| **可观测性** | 监控配置、仪表盘建设、告警规则维护、SLO 追踪 | 监控 Dashboard、告警规则、SLO 报告 |
| **发布管理** | 发布协调、金丝雀部署、热修复流程、发布冻结执行 | 发布记录、回滚方案、发布日历 |
| **容量管理** | 资源监控、容量规划、成本追踪 | 容量仪表盘、成本报告 |
| **值班运维** | On-call 轮值、告警响应、交接文档 | 值班日志、交接记录 |

## 快速导航

| 资源 | 描述 |
|---|---|
| [INDEX.md](./INDEX.md) | Srer 角色索引 — 子目录映射、文件数量、关键流程 |
| [ONBOARDING.md](./ONBOARDING.md) | SRE 新人入职指南 — 30 天上手路线图 |
| [QUARTERLY-REVIEW.md](./QUARTERLY-REVIEW.md) | SRE 季度回顾指南 — 数据驱动的可靠性改进 |
| [QUICKREF.md](./QUICKREF.md) | 运维速查卡 — 值班 SRE 的即时命令参考 |
| [incident-response/](./incident-response/) | 事件流程、事后复盘、oncall 交接、演练 — 16 个文件 |
| [observability/](./observability/) | 监控、告警、基础设施、SLO/SLI、容量 — 18 个文件 |
| [release/](./release/) | 发布协调、金丝雀、热修复、回滚、冻结 — 7 个文件 |

## 流水线芯片契约

| 芯片 | 类型 | 阶段 | 描述 | 知识域 |
|---|---|---|---|---|
| Working software | 输入 | 4 | 来自 engineer/ 的实现制品 | [engineer/](../engineer/) |
| Running services | 输入 | 5 | 生产环境中运行的服务 | [observability/](./observability/) |
| `release-procedures` | 输出 | 4 | 发布、回滚、金丝雀、热修复流程 | [release/](./release/) |
| `incident-response` | 输出 | 4 | On-call 交接、无责事后复盘模板 | [incident-response/](./incident-response/) |
| `observability` | 输出 | 4 | 监控、告警、仪表盘、SLO/SLI | [observability/](./observability/) |
| `slo-compliance` | 输出 | 5 | SLO 追踪、错误预算管理、可用性 | [observability/](./observability/) |
| `postmortems` | 输出 | 5 | 根因分析、行动项、时间线重建 | [incident-response/](./incident-response/) |

## 摘要

- 3 个子目录：[incident-response/](./incident-response/)（事件流程 + 事后复盘 + 演练 + oncall 运维）/ [observability/](./observability/)（监控 + 基础设施 + SLO + 备份）/ [release/](./release/)（发布 + 回滚 + 热修复 + 冻结）
- 事件响应覆盖事件全生命周期：响应 → 作战室 → 复盘 → 演练 → runbook → 沟通 → 灾难恢复 → 去重劳动
- 可观测性覆盖三大支柱（日志/指标/链路追踪）、基础设施（容器化/反向代理/GPU）、SLO/SLI、错误预算策略、SRE 指标体系、告警规则、健康检查、性能测试、容量/成本、数据库备份和技术债务
- 发布覆盖标准流程、金丝雀、热修复、回滚演练、发布冻结和变更管理
- 事后复盘**方法论**存放在 [leader/risk/](../leader/risk/)；事件复盘**指南**和模板存放在 [incident-response/](./incident-response/)

## 核心观点

- **SRE 运维，不构建** — 事件响应流程、可观测性仪表盘和发布协调是运维问题；实现模式属于 [engineer/](../engineer/)
- **事后复盘是运维记录，方法论是战略** — 实际事后复盘存放在 [incident-response/](./incident-response/)；事后复盘模板和方法论存放在 [leader/risk/](../leader/risk/)
- **可观测性是可靠性的基础** — 无法衡量的东西就无法改进；SLO/SLI 定义驱动错误预算和发布信心
- **发布是流程，不是按钮** — 发布协调、冻结管理和回滚演练是经过实践的运维流程，不是 CI/CD 自动化（那是 [engineer/](../engineer/) 的范畴）

## 子目录

### incident-response/（16 个文件）

| 分类 | 关键文件 |
|---|---|
| 响应流程 | [响应事件](./incident-response/04-事件-响应事件.md) · [处理数据泄露](./incident-response/01-事件-处理数据泄露.md) |
| 作战室与演练 | [作战室运作](./incident-response/05-事件-作战室运作.md) · [Game Day 演练](./incident-response/08-事件-GameDay演练.md) |
| 事后复盘 | [事后复盘指南](./incident-response/07-事件-事后复盘指南.md) · [复盘会议主持](./incident-response/13-事件-复盘会议主持.md) · [复盘示例](./incident-response/14-事件-事后复盘示例.md) |
| 风险预防 | [FMEA 模板](./incident-response/16-事件-FMEA模板.md) |
| 事件沟通 | [事件沟通模板](./incident-response/10-事件-事件沟通模板.md) |
| 灾难恢复 | [灾难恢复计划](./incident-response/11-事件-灾难恢复计划.md) |
| Oncall 运维 | [处理值班轮班](./incident-response/02-事件-处理值班轮班.md) · [值班交接](./incident-response/03-事件-值班交接.md) · [建立值班轮换](./incident-response/06-事件-建立值班轮换.md) · [交接示例](./incident-response/15-事件-值班交接示例.md) |
| Runbook | [Runbook 模板](./incident-response/09-事件-Runbook模板.md) |
| 效率提升 | [减少重复劳动](./incident-response/12-事件-减少重复劳动.md) |

### observability/（18 个文件）

| 分类 | 关键文件 |
|---|---|
| 核心可观测性 | [可观测性三支柱](./observability/05-可观测-可观测性三支柱.md) · [搭建可观测性](./observability/07-可观测-搭建可观测性.md) |
| 告警与 SLO | [告警规则配置](./observability/10-可观测-告警规则配置.md) · [SLO 与 SLI 定义](./observability/08-可观测-SLO与SLI定义.md) · [错误预算策略](./observability/12-可观测-错误预算策略.md) |
| SRE 度量 | [SRE 指标体系](./observability/15-可观测-SRE指标体系.md) · [SLA 管理](./observability/16-可观测-SLA管理.md) |
| 健康与性能 | [健康检查设计](./observability/14-可观测-健康检查设计.md) · [性能测试指南](./observability/13-可观测-性能测试指南.md) |
| 基础设施 | [Docker 与 Kubernetes](./observability/03-可观测-Docker与Kubernetes.md) · [反向代理](./observability/06-可观测-反向代理.md) · [GPU 推理](./observability/04-可观测-GPU推理.md) |
| CI/CD | [CI/CD 流水线](./observability/02-可观测-CICD.md) |
| 容量与成本 | [容量与成本](./observability/01-可观测-容量与成本.md) |
| 数据保护 | [数据库备份恢复](./observability/11-可观测-数据库备份恢复.md) |
| AI 运维 | [知识库与 RAG 运维](./observability/17-可观测-知识库与RAG运维.md) · [Ollama 模型管理](./observability/18-可观测-Ollama模型管理.md) |
| 技术债务 | [技术债清单](./observability/09-可观测-技术债清单.md) |

### release/（7 个文件）

| 分类 | 关键文件 |
|---|---|
| 发布流程 | [发布流程](./release/04-发布-发布流程.md) · [金丝雀发布](./release/01-发布-金丝雀发布.md) · [热修复发布](./release/02-发布-热修复发布.md) |
| 发布治理 | [发布冻结](./release/03-发布-发布冻结.md) · [变更管理](./release/06-发布-变更管理流程.md) |
| 回滚 | [回滚演练](./release/05-发布-回滚演练.md) |
| 上线门禁 | [生产就绪审查](./release/07-发布-生产就绪审查.md) |

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
| [incident-response/](./incident-response/) | 如何响应和管理事件？ | 16 |
| [observability/](./observability/) | 如何监控和观测系统？ | 18 |
| [release/](./release/) | 如何安全发布和回滚？ | 7 |

## 快速参考

| 我想... | 前往 |
|---|---|
| 响应事件 | [incident-response/04-事件-响应事件.md](./incident-response/04-事件-响应事件.md) |
| 处理数据泄露 | [incident-response/01-事件-处理数据泄露.md](./incident-response/01-事件-处理数据泄露.md) |
| 主持 War Room | [incident-response/05-事件-作战室运作.md](./incident-response/05-事件-作战室运作.md) |
| 组织 Game Day | [incident-response/08-事件-GameDay演练.md](./incident-response/08-事件-GameDay演练.md) |
| 撰写事后复盘 | [incident-response/07-事件-事后复盘指南.md](./incident-response/07-事件-事后复盘指南.md) |
| 参考复盘示例 | [incident-response/14-事件-事后复盘示例.md](./incident-response/14-事件-事后复盘示例.md) |
| 主持复盘会议 | [incident-response/13-事件-复盘会议主持.md](./incident-response/13-事件-复盘会议主持.md) |
| 编写 Runbook | [incident-response/09-事件-Runbook模板.md](./incident-response/09-事件-Runbook模板.md) |
| 事件中对外沟通 | [incident-response/10-事件-事件沟通模板.md](./incident-response/10-事件-事件沟通模板.md) |
| 制定灾难恢复计划 | [incident-response/11-事件-灾难恢复计划.md](./incident-response/11-事件-灾难恢复计划.md) |
| 做故障模式分析 | [incident-response/16-事件-FMEA模板.md](./incident-response/16-事件-FMEA模板.md) |
| 减少重复手工操作 | [incident-response/12-事件-减少重复劳动.md](./incident-response/12-事件-减少重复劳动.md) |
| 处理 oncall 值班 | [incident-response/02-事件-处理值班轮班.md](./incident-response/02-事件-处理值班轮班.md) |
| 设置 oncall 排班 | [incident-response/06-事件-建立值班轮换.md](./incident-response/06-事件-建立值班轮换.md) |
| 执行值班交接 | [incident-response/03-事件-值班交接.md](./incident-response/03-事件-值班交接.md) |
| 参考交接示例 | [incident-response/15-事件-值班交接示例.md](./incident-response/15-事件-值班交接示例.md) |
| 配置可观测性 | [observability/07-可观测-搭建可观测性.md](./observability/07-可观测-搭建可观测性.md) |
| 理解可观测性三大支柱 | [observability/05-可观测-可观测性三支柱.md](./observability/05-可观测-可观测性三支柱.md) |
| 配置告警规则 | [observability/10-可观测-告警规则配置.md](./observability/10-可观测-告警规则配置.md) |
| 定义 SLO | [observability/08-可观测-SLO与SLI定义.md](./observability/08-可观测-SLO与SLI定义.md) |
| 管理错误预算 | [observability/12-可观测-错误预算策略.md](./observability/12-可观测-错误预算策略.md) |
| 做性能测试 | [observability/13-可观测-性能测试指南.md](./observability/13-可观测-性能测试指南.md) |
| 设计健康检查 | [observability/14-可观测-健康检查设计.md](./observability/14-可观测-健康检查设计.md) |
| 搭建 SRE 指标体系 | [observability/15-可观测-SRE指标体系.md](./observability/15-可观测-SRE指标体系.md) |
| 定义 SLA 协议 | [observability/16-可观测-SLA管理.md](./observability/16-可观测-SLA管理.md) |
| 运维知识库和 RAG | [observability/17-可观测-知识库与RAG运维.md](./observability/17-可观测-知识库与RAG运维.md) |
| 管理 Ollama 模型 | [observability/18-可观测-Ollama模型管理.md](./observability/18-可观测-Ollama模型管理.md) |
| 监控容量和成本 | [observability/01-可观测-容量与成本.md](./observability/01-可观测-容量与成本.md) |
| 备份恢复数据库 | [observability/11-可观测-数据库备份恢复.md](./observability/11-可观测-数据库备份恢复.md) |
| 管理技术债务清单 | [observability/09-可观测-技术债清单.md](./observability/09-可观测-技术债清单.md) |
| 发布上线 | [release/04-发布-发布流程.md](./release/04-发布-发布流程.md) |
| 做金丝雀发布 | [release/01-发布-金丝雀发布.md](./release/01-发布-金丝雀发布.md) |
| 发布热修复 | [release/02-发布-热修复发布.md](./release/02-发布-热修复发布.md) |
| 管理发布冻结 | [release/03-发布-发布冻结.md](./release/03-发布-发布冻结.md) |
| 做回滚演练 | [release/05-发布-回滚演练.md](./release/05-发布-回滚演练.md) |
| 管理变更流程 | [release/06-发布-变更管理流程.md](./release/06-发布-变更管理流程.md) |
| 执行生产就绪审查 | [release/07-发布-生产就绪审查.md](./release/07-发布-生产就绪审查.md) |
| 做季度 SRE 回顾 | [QUARTERLY-REVIEW.md](./QUARTERLY-REVIEW.md) |

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
- [响应事件](./incident-response/04-事件-响应事件.md) ← [事后复盘指南](./incident-response/07-事件-事后复盘指南.md) → [搭建可观测性](./observability/07-可观测-搭建可观测性.md)
- [搭建可观测性](./observability/07-可观测-搭建可观测性.md) ← [告警规则配置](./observability/10-可观测-告警规则配置.md) → [SLO 与 SLI 定义](./observability/08-可观测-SLO与SLI定义.md)
- [回滚演练](./release/05-发布-回滚演练.md) ← [数据库备份恢复](./observability/11-可观测-数据库备份恢复.md) — 数据恢复是回滚的最后防线
- [容量与成本](./observability/01-可观测-容量与成本.md) ← [错误预算策略](./observability/12-可观测-错误预算策略.md) — 预算追踪反馈到成本监控

## 行动建议

1. **发生事件** → 从 [响应事件](./incident-response/04-事件-响应事件.md) 开始；对外沟通使用 [事件沟通模板](./incident-response/10-事件-事件沟通模板.md)
2. **事后** → 使用 [事后复盘指南](./incident-response/07-事件-事后复盘指南.md) 撰写事后复盘
3. **新服务上线** → 通过 [搭建可观测性](./observability/07-可观测-搭建可观测性.md) 配置可观测性，通过 [SLO 与 SLI 定义](./observability/08-可观测-SLO与SLI定义.md) 定义 SLO，通过 [错误预算策略](./observability/12-可观测-错误预算策略.md) 设定预算策略
4. **发布日** → 遵循 [发布流程](./release/04-发布-发布流程.md)；高风险变更走 [变更管理流程](./release/06-发布-变更管理流程.md)；热修复使用 [热修复发布](./release/02-发布-热修复发布.md)
5. **Oncall 交接** → 使用 [值班交接](./incident-response/03-事件-值班交接.md) 模板；每周更新
6. **每季度** → 通过 [技术债清单](./observability/09-可观测-技术债清单.md) 评审技术债务，通过 [Game Day](./incident-response/08-事件-GameDay演练.md) 组织 Game Day，通过 [数据库备份恢复](./observability/11-可观测-数据库备份恢复.md) 验证备份可恢复，通过 [性能测试指南](./observability/13-可观测-性能测试指南.md) 更新性能基线
7. **新人入职** → 从 [SRE 新人入职指南](./ONBOARDING.md) 开始，按 4 周路线图逐步上手
8. **灾难发生** → 遵循 [灾难恢复计划](./incident-response/11-事件-灾难恢复计划.md) 按恢复优先级重建系统

## 反模式

- **没有方法论就写事后复盘** — 后果：格式不一致，缺少根因分析；始终使用 [事后复盘指南](./incident-response/07-事件-事后复盘指南.md)
- **跳过回滚演练** — 后果：第一次回滚尝试发生在真实事件中；每季度执行 [回滚演练](./release/05-发布-回滚演练.md)
- **没有 SLO 就配置告警** — 后果：告警疲劳，无优先级；先通过 [SLO 与 SLI 定义](./observability/08-可观测-SLO与SLI定义.md) 定义 SLO，再通过 [告警规则配置](./observability/10-可观测-告警规则配置.md) 配置告警
- **可观测性事后补** — 后果：生产环境盲区；将可观测性作为上线检查清单的一部分，而非上线后补救
- **Oncall 无交接** — 后果：轮班之间上下文丢失；始终在轮换结束前完成交接文档
- **混淆运维监控与战略规划** — 后果：成本仪表盘（srer）与成本预算（leader）混合；使用[决策规则](#边界情况决策规则)表