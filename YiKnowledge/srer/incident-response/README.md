---
title: Incident Response
tags: [leaf, incident-response, oncall, postmortem, war-room]
category: srer/incident-response
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [srer, engineer, leader]
benefit: "Oncall 工程师在一个地方找到事件流程、事后复盘和交接模板"
acceptance_criteria:
  - "事件响应流程按场景分类"
  - "包含事后复盘示例和模板"
  - "存在 oncall 交接模板"
related:
  - ../INDEX.md
  - ../../INDEX.md
  - ../../engineer/SECURITY.md
  - ../../leader/risk/
---

# Incident Response

> **作为** oncall SRE，**我希望**找到事件响应流程、事后复盘模板和交接文档，**以便**快速响应事件并从过去的失败中学习。

## 响应流程

| 场景 | 文件 | 类型 |
|---|---|---|
| 通用事件 | [respond-to-an-incident.md](./respond-to-an-incident.md) | 流程 |
| 数据泄露 | [handle-a-data-breach.md](./handle-a-data-breach.md) | 流程 |
| DDoS 攻击 | [handle-a-ddos-attack.md](./handle-a-ddos-attack.md) | 流程 |
| 缓存失效 | [handle-a-cache-invalidation.md](./handle-a-cache-invalidation.md) | 流程 |
| 成本超支 | [handle-a-cost-overrun.md](./handle-a-cost-overrun.md) | 流程 |
| 客户升级 | [handle-a-customer-escalation.md](./handle-a-customer-escalation.md) | 流程 |
| 大版本升级 | [handle-a-major-version-upgrade.md](./handle-a-major-version-upgrade.md) | 流程 |
| Pull Request 事件 | [handle-a-pull-request.md](./handle-a-pull-request.md) | 流程 |
| 团队冲突 | [handle-a-team-conflict.md](./handle-a-team-conflict.md) | 流程 |
| 组织调整 | [handle-a-reorg.md](./handle-a-reorg.md) | 流程 |

## 演练与演习

| 演习 | 文件 |
|---|---|
| War Room | [run-a-war-room.md](./run-a-war-room.md) |
| Game Day | [run-a-game-day.md](./run-a-game-day.md) |
| 混沌工程 | [run-a-chaos-engineering-experiment.md](./run-a-chaos-engineering-experiment.md) |
| 回滚演练 | [do-a-rollback-drill.md](./do-a-rollback-drill.md) |
| 爆炸半径分析 | [do-a-blast-radius-analysis.md](./do-a-blast-radius-analysis.md) |
| 安全审计 | [do-a-security-audit.md](./do-a-security-audit.md) |
| FinOps 评审 | [run-a-finops-review.md](./run-a-finops-review.md) |

## Oncall 运维

| 任务 | 文件 |
|---|---|
| Oncall 值班 | [handle-an-oncall-shift.md](./handle-an-oncall-shift.md) |
| 设置排班 | [set-up-an-oncall-rotation.md](./set-up-an-oncall-rotation.md) |
| 仪表盘趋势 | [dashboard-incident-trends.md](./dashboard-incident-trends.md) |

## 事后复盘与交接

| 文档 | 文件 |
|---|---|
| FSEvents 静默丢失（2026-08） | [tl-postmortem-fsevents-silent-drop-2026-08.md](./tl-postmortem-fsevents-silent-drop-2026-08.md) |
| 无锁文件供应链（2026-07） | [tl-postmortem-no-lockfile-supply-chain-2026-07.md](./tl-postmortem-no-lockfile-supply-chain-2026-07.md) |
| Oncall 交接 W32 | [tl-oncall-handover-2026-w32.md](./tl-oncall-handover-2026-w32.md) |
| Oncall 交接 W33 | [tl-oncall-handover-2026-w33.md](./tl-oncall-handover-2026-w33.md) |

## 交叉引用

- [../../leader/risk/](../../leader/risk/) — 风险登记册和事后复盘方法论
- [../../engineer/ship/](../../engineer/ship/) — 弹性模式、健康检查、容量规划
- [../../srer/release/](../../srer/release/) — 发布、金丝雀、回滚、热修复
- [../../engineer/SECURITY.md](../../engineer/SECURITY.md) — 安全域索引