---
title: 技术负责人 — 架构决策 / 技术选型 / 容量规划 / 路线图 / 风险管理工作区
aliases: [leader-readme, leader-index]
tags: [category, leader, architecture, adr, capacity, roadmap, risk]
category: leader
created: 2026-08-05
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: monthly
roles: [leader, engineer, aier]
benefit: "架构决策 / ADR / 技术选型 / 容量规划 / 路线图 / 风险登记册集中管理；跨子项目技术决策可追溯"
acceptance_criteria:
  - "叶子目录范围边界清晰"
  - "文件清单表完整，包含一句话描述"
  - "包含与相关叶子目录和父级 INDEX 的交叉引用"
related:
  - ../INDEX.md
  - ../README.md
  - ../engineer/ship/README.md
  - ./INDEX.md
---

# 技术负责人 — 架构决策 / 技术选型 / 容量 / 路线图 / 风险工作区

> **流水线阶段 2/5：决策** — 输入芯片：`PRDs`、`requirements` → 输出芯片：`ADRs`、`tech selections`、`capacity plans`
>
> **作为**技术负责人，**我想要**理解并应用技术负责人 — 架构决策 / 技术选型 / 容量 / 路线图 / 风险工作区，**以便**跨项目技术决策可追溯，新负责人无需重新推导已有结论。
>
> Leader 决策技术方向。Leader 不实现模式（→ [engineer/](../engineer/)）、不响应事故（→ [srer/](../srer/)）、不定义产品需求（→ [producter/](../producter/)）。

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| PRDs | ← Input | 来自 producter/ 的产品需求文档 | [producter/discovery/prd/](../producter/discovery/prd/) |
| requirements | ← Input | 功能和非功能需求 | [producter/discovery/](../producter/discovery/) |
| `adrs` | Output → | 架构决策记录 — 上下文/决策/后果 | [decisions/](./decisions/), [architecture/](./架构/) |
| `tech-selections` | Output → | 技术栈评估、对比矩阵 | [architecture/](./架构/), [roadmap/](./roadmap/) |
| `capacity-plans` | Output → | 容量规划、FinOps 审查、基础设施规模估算 | [capacity/](./capacity/), [roadmap/](./roadmap/) |

## 子目录（按流水线芯片）

| Chip | Domain | Content | Files |
|---|---|---|---|
| `adrs` | [architecture/](./架构/) | 架构决策框架、技术选型评估、成熟度模型 | 7 |
| `adrs` | [decisions/](./decisions/) | 按项目组织的 ADR：YiAi (6)、YiVad (3)、YiPet (3)、FDE (4) + 跨项目 | 18 |
| `adrs` | [risk/](./risk/) | 风险登记册、事后复盘方法论、故障沟通、依赖风险 | 5 |
| `capacity-plans` | [capacity/](./capacity/) | 容量与成本追踪、FinOps 审查、依赖审计、成本超支处理 | 7 |
| `tech-selections`, `capacity-plans` | [roadmap/](./roadmap/) | 路线图规划、技术债务管理、技术选型、PoC、SLO、废弃、下线 | 11 |

## 范围

### 范围内（leader 负责）

**`adrs` 芯片：**
- 包含权衡和后果的架构决策（ADR） → [decisions/](./decisions/)
- 架构决策框架、成熟度模型 → [architecture/](./架构/)
- 风险登记册和事前风险评估 → [risk/](./risk/)
- 跨项目技术决策对齐

**`tech-selections` 芯片：**
- 技术选型和供应商评估决策 → [architecture/](./架构/)
- 技术路线图和季度规划 → [roadmap/](./roadmap/)

**`capacity-plans` 芯片：**
- 容量规划和 FinOps 策略 → [capacity/](./capacity/)
- SLO 定义和基础设施规模估算 → [roadmap/](./roadmap/)

### 范围外（委托给其他角色）
- 实现模式和操作指南 → **[engineer/](../engineer/)**
- 事故响应流程 → **[srer/incident-response/](../srer/incident-response/)**
- 事后复盘 → **[srer/incident-response/](../srer/incident-response/)**（leader/risk/ 有方法论，srer/ 有实际复盘报告）
- 成本监控和仪表盘 → **[srer/observability/](../srer/observability/)**
- 产品需求和 PRD → **[producter/discovery/](../producter/discovery/)**
- 业务战略和市场分析 → **[executiver/](../executiver/)**
- 组织（非技术）路线图 → **[executiver/roadmap/](../executiver/roadmap/)**

## 边界情况决策规则

| 当内容涉及... | Chip | Route to | Because |
|---|---|---|---|
| ADR（为什么选择 X 而非 Y） | `adrs` | [leader/decisions/](./decisions/) | 包含权衡的决策 |
| 如何实现 X 模式 | `architecture-patterns` | [engineer/build/](../engineer/build/) | 实现知识 |
| 技术选型评估 | `tech-selections` | [leader/架构/](./架构/) | 战略性技术选择 |
| 事前风险评估 | `adrs` | [leader/risk/](./risk/) | 主动风险管理 |
| 事中事故响应 | `incident-response` | [srer/incident-response/](../srer/incident-response/) | 运维流程 |
| 事后复盘 | `postmortems` | [srer/incident-response/](../srer/incident-response/) | 运维记录 |
| 容量规划（多少资源、多少成本） | `capacity-plans` | [leader/capacity/](./capacity/) | 战略规划 |
| 容量监控（当前使用量） | `observability` | [srer/observability/](../srer/observability/) | 运维监控 |
| 技术路线图（何时用什么技术） | `tech-selections` | [leader/roadmap/](./roadmap/) | 技术领导力 |
| 业务路线图（什么业务目标） | — | [executiver/roadmap/](../executiver/roadmap/) | 业务领导力 |

## 子目录描述

### architecture/
架构决策框架、技术选型评估和成熟度评估。涵盖：ADR 框架和 12 节模板、LLM 供应商选择、React 状态管理选择、架构成熟度模型、文档成熟度模型、YiVad 测试框架技术债务。

关键文件：
- [design-architecture-decision.md](./架构/design-architecture-decision.md) — ADR 框架和 12 节模板
- [tl-tech-selection-llm-provider.md](./架构/tl-tech-selection-llm-provider.md) — LLM 供应商选择标准
- [tl-tech-selection-react-state-management.md](./架构/tl-tech-selection-react-state-management.md) — React 状态管理选择
- [tl-maturity-model-arch-2026-08.md](./架构/tl-maturity-model-arch-2026-08.md) — 架构成熟度评估
- [tl-maturity-model-docs-2026-08.md](./架构/tl-maturity-model-docs-2026-08.md) — 文档成熟度评估
- [tl-tech-debt-yivad-no-test-framework.md](./架构/tl-tech-debt-yivad-no-test-framework.md) — YiVad 测试框架技术债务

### decisions/
按项目子目录组织的架构决策记录。每个 ADR 遵循 [architecture/design-architecture-decision.md](./架构/design-architecture-decision.md) 中的 12 节模板。ADR 模板位于 [../curator/templates/adr.md](../curator/templates/adr.md)。

**YiAi（6 个 ADR）：**
- [route-llm-traffic-across-providers.md](./decisions/yiai/route-llm-traffic-across-providers.md) — 多供应商 LLM 流量路由策略
- [llm-multi-provider-rollout.md](./decisions/yiai/llm-multi-provider-rollout.md) — LLM 多供应商分阶段推出
- [rag-evaluation-infra.md](./decisions/yiai/rag-evaluation-infra.md) — RAG 评估基础设施
- [brd-agent-launch.md](./decisions/yiai/brd-agent-launch.md) — BRD agent 启动决策
- [pytest-introduction.md](./decisions/yiai/pytest-introduction.md) — Pytest 测试框架引入
- [knowledge-watcher-deployment.md](./decisions/yiai/knowledge-watcher-deployment.md) — 知识监听器部署

**YiVad（3 个 ADR）：**
- [vitest-introduction.md](./decisions/yivad/vitest-introduction.md) — Vitest 测试框架引入
- [vitest-rollout.md](./decisions/yivad/vitest-rollout.md) — Vitest 分阶段推出计划
- [aicr-phase-port.md](./decisions/yivad/aicr-phase-port.md) — AiCR 移植阶段

**YiPet（3 个 ADR）：**
- [biome-lint-format.md](./decisions/yipet/biome-lint-format.md) — ESLint → Biome 2.5 迁移
- [chrome-manifest-dual-world-boundary.md](./decisions/yipet/chrome-manifest-dual-world-boundary.md) — MV3 双世界边界设计
- [aicr-port-rollout.md](./decisions/yipet/aicr-port-rollout.md) — AiCR 移植推出

**FDE（4 个 ADR）：**
- [delta-as-a-contract.md](./decisions/fde/delta-as-a-contract.md) — Delta 作为契约，而非功能
- [air-gap-first-for-regulated-clients.md](./decisions/fde/air-gap-first-for-regulated-clients.md) — 合规驱动默认采用 air-gap-first
- [two-loop-eval-as-production-gate.md](./decisions/fde/two-loop-eval-as-production-gate.md) — 双循环评估作为生产发布门禁
- [enterprise-rag-hybrid-search-mandatory.md](./decisions/fde/enterprise-rag-hybrid-search-mandatory.md) — 企业 RAG 必须使用混合搜索

**跨项目：**
- [stack-migration-sequencing.md](./decisions/stack-migration-sequencing.md) — 多项目技术栈迁移排序

### capacity/
容量规划、成本追踪、FinOps 审查和依赖审计。涵盖：各项目成本分解、趋势分析、季度预测、成本超支处理、FinOps 审查流程、npm 依赖审计。

关键文件：
- [tl-capacity-cost-2026-08-trend.md](./capacity/tl-capacity-cost-2026-08-trend.md) — 容量成本趋势分析
- [tl-capacity-cost-2026-q4-prediction.md](./capacity/tl-capacity-cost-2026-q4-prediction.md) — 2026 年 Q4 成本预测
- [tl-capacity-cost-yiai-yivad-yipet-2026-06.md](./capacity/tl-capacity-cost-yiai-yivad-yipet-2026-06.md) — 各项目成本分解
- [tl-dependency-audit-yipet-npm-2026-08.md](./capacity/tl-dependency-audit-yipet-npm-2026-08.md) — YiPet npm 依赖审计
- [run-a-finops-review.md](./capacity/run-a-finops-review.md) — FinOps 审查方法论
- [handle-a-cost-overrun.md](./capacity/handle-a-cost-overrun.md) — 成本超支响应流程

### risk/
风险登记册、事后复盘方法论、故障沟通和依赖风险管理。涵盖：风险识别与追踪、事后复盘撰写、故障利益相关者沟通、依赖风险评估。

关键文件：
- [tl-risk-register-single-provider-llm-lock-in.md](./risk/tl-risk-register-single-provider-llm-lock-in.md) — 单一供应商 LLM 锁定风险
- [manage-dependency-risk.md](./risk/manage-dependency-risk.md) — 依赖风险识别、评估和缓解
- [write-a-postmortem.md](./risk/write-a-postmortem.md) — 事后复盘撰写方法论
- [handle-an-outage-communication.md](./risk/handle-an-outage-communication.md) — 故障沟通流程

### roadmap/
路线图规划、技术债务管理、技术选型、PoC 验证、SLO 定义、功能废弃和服务下线。

关键文件：
- [plan-tech-roadmap.md](./roadmap/plan-tech-roadmap.md) — 技术路线图规划流程
- [tl-roadmap-review-2026-q4-preview.md](./roadmap/tl-roadmap-review-2026-q4-preview.md) — 2026 年 Q4 路线图预览
- [tl-org-diagnose-yipet-collab-2026-08.md](./roadmap/tl-org-diagnose-yipet-collab-2026-08.md) — YiPet 协作组织诊断
- [do-a-tech-selection.md](./roadmap/do-a-tech-selection.md) — 技术选型流程
- [do-a-capacity-plan.md](./roadmap/do-a-capacity-plan.md) — 容量规划方法论
- [do-a-proof-of-concept.md](./roadmap/do-a-proof-of-concept.md) — PoC 验证方法论
- [manage-tech-debt.md](./roadmap/manage-tech-debt.md) — 技术债务管理框架
- [define-an-slo.md](./roadmap/define-an-slo.md) — SLO 定义指南
- [deprecate-a-feature.md](./roadmap/deprecate-a-feature.md) — 功能废弃流程
- [decommission-a-service.md](./roadmap/decommission-a-service.md) — 服务下线流程

## 核心观点

- **ADR 是决策的唯一真实来源** — 编写 ADR 不是文档负担，而是给"将来不会重新推导的审查者"的礼物；每个 ADR 包含 Context / Decision / Consequences
- **容量规划与 FinOps 挂钩** — leader 不仅决策技术，还决策成本上限；与 [srer/observability/](../srer/observability/) 联动进行监控
- **路线图是承诺** — 季度路线图是 leader 对 PM/executiver 的承诺；不得静默变更
- **风险登记册前置** — 事后复盘是事后行为；事前风险评估归入 `risk/`，事后回顾归入 [srer/incident-response/](../srer/incident-response/)

## 常用参考

- [design-architecture-decision.md](./架构/design-architecture-decision.md) — ADR 框架和 12 节模板
- [write-a-postmortem.md](./risk/write-a-postmortem.md) — 事后复盘撰写方法论
- [do-a-tech-selection.md](./roadmap/do-a-tech-selection.md) — 技术选型流程
- [do-a-capacity-plan.md](./roadmap/do-a-capacity-plan.md) — 容量规划方法论
- [run-a-finops-review.md](./capacity/run-a-finops-review.md) — FinOps 审查方法论
- [manage-tech-debt.md](./roadmap/manage-tech-debt.md) — 技术债务管理框架
- [manage-dependency-risk.md](./risk/manage-dependency-risk.md) — 依赖风险管理
- [handle-a-cost-overrun.md](./capacity/handle-a-cost-overrun.md) — 成本超支响应
- [handle-an-outage-communication.md](./risk/handle-an-outage-communication.md) — 故障沟通
- [../curator/templates/adr.md](../curator/templates/adr.md) — ADR 模板（新 ADR 的起点）

## 行动建议

1. **新决策走 ADR 流程**：复制 [../curator/templates/adr.md](../curator/templates/adr.md) 作为起点；落在 `decisions/<project>/<decision-name>.md`
2. **路线图每季度同步**：任何路线图变更必须通过 `roadmap/` 更新 + 通知 PM/executiver
3. **风险前置登记**：通过 [risk/](./risk/) 登记册识别新风险；事后通过 [write-a-postmortem.md](./risk/write-a-postmortem.md) 处理
4. **容量评估联动 FinOps**：新服务上线前必须通过 [capacity/](./capacity/) 评估 + 设置成本上限
5. **跨子项目决策对齐**：YiAi/YiVad/YiPet 子项目的 `engineering/claude.md` 必须引用本目录的决策，不得重复内容

## 反模式

- **静默变更路线图** — 后果：PM/executiver 失去信任；路线图是承诺，变更必须同步
- **ADR 写了但不维护** — 后果：决策上下文丢失；后续审查者重新推导已废弃的方案
- **事后复盘未登记为风险** — 后果：同类故障重复发生；事后必须执行 [risk/](./risk/) 登记册 + 改进措施
- **省略容量评估** — 后果：上线后成本超支；必须执行 [capacity/](./capacity/) 评估 + 设置上限

## 相关

- 同类（角色目录）：[../engineer/README.md](../engineer/README.md) / [../srer/README.md](../srer/README.md) / [../producter/README.md](../producter/README.md) / [../aier/README.md](../aier/README.md)
- 上游：[../README.md](../README.md) / [../INDEX.md](../INDEX.md)
- 角色索引：[./INDEX.md](./INDEX.md) — 完整文件列表及数量
- 子 README：[architecture/README.md](./架构/README.md) / [decisions/README.md](./decisions/README.md) / [capacity/README.md](./capacity/README.md) / [risk/README.md](./risk/README.md) / [roadmap/README.md](./roadmap/README.md)
- 下游：[../curator/templates/adr.md](../curator/templates/adr.md) — ADR 模板
- 下游：[../aier/README.md](../aier/README.md) — AI 工程视角

## Pipeline flow

```
producter/ (Stage 1: Requirements)
    │ prds, user-stories, priorities
    ▼
┌── leader/ (Stage 2: Decisions) ─────────┐
│  Input:  PRDs, requirements               │
│  Output: ADRs, tech selections, capacity  │
└──────────────────────────────────────────┘
    │ adrs, tech-selections, capacity-plans
    ▼
engineer/ (Stage 3: Design+Build)
    │ architecture-patterns, dev-practices
    ▼
srer/ (Stage 4+5: Quality+Release + Operate+Learn)
```

### 关键跨阶段链接
- [design-architecture-decision.md](./架构/design-architecture-decision.md) ← producter/ PRD → [../engineer/build/](../engineer/build/)
- [do-a-tech-selection.md](./roadmap/do-a-tech-selection.md) ← producter/ JTBD → [../engineer/build/](../engineer/build/)
- [run-a-finops-review.md](./capacity/run-a-finops-review.md) ← producter/ prioritization → [../srer/observability/](../srer/observability/)
- [define-an-slo.md](./roadmap/define-an-slo.md) ← producter/ metrics → [../srer/observability/](../srer/observability/)
- [write-a-postmortem.md](./risk/write-a-postmortem.md) ← [../srer/incident-response/](../srer/incident-response/) → [../engineer/learn/lessons/](../engineer/learn/lessons/)