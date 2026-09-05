---
title: 技术负责人 — 风险管理
tags: [leaf, leader, risk, postmortem, outage, register]
category: leader/risk
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, srer]
benefit: "技术负责人可以在一个地方找到风险登记册、事后复盘方法论和故障沟通流程"
acceptance_criteria:
  - "风险登记册包含已追踪的风险"
  - "事后复盘撰写方法论存在"
  - "故障沟通流程已包含"
related:
  - ../INDEX.md
  - ../../srer/incident-response/
  - ../../engineer/SECURITY.md
---

# 技术负责人 — 风险管理

> **作为**技术负责人，**我想要**找到风险管理框架和事故沟通流程，**以便**在风险演变为事故之前识别、追踪和缓解风险。

## 风险登记册

| File | Description |
|---|---|
| [tl-risk-register-single-provider-llm-lock-in.md](./tl-risk-register-single-provider-llm-lock-in.md) | 单一供应商 LLM 锁定风险 |
| [manage-dependency-risk.md](./manage-dependency-risk.md) | 依赖风险识别、评估和缓解框架 |

## 事后复盘与故障

| File | Description |
|---|---|
| [write-a-postmortem.md](./write-a-postmortem.md) | 事后复盘撰写方法论 |
| [handle-an-outage-communication.md](./handle-an-outage-communication.md) | 故障沟通流程 |

## 仪表盘

| File | Description |
|---|---|
| [dashboard-risk-management.md](./dashboard-risk-management.md) | 风险管理仪表盘 |

## 交叉引用

- [../../srer/incident-response/](../../srer/incident-response/) — 事故响应流程
- [../../engineer/SECURITY.md](../../engineer/SECURITY.md) — 安全领域索引