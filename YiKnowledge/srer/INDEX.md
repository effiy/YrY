---
title: "Oncall SRE 角色索引"
tags: [index, srer, incident-response, observability, release]
category: srer
created: 2026-08-06
updated: 2026-09-10
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer]
benefit: "SRE 通过此索引快速定位事件响应、可观测性和发布管理的内容"
acceptance_criteria:
  - "3 个子目录，每个都有 README 文件"
related:
  - ./README.md
  - ../INDEX.md
  - ../engineer/SECURITY.md
---

# Oncall SRE — 角色索引

> **流水线阶段**：4. 质量与发布 + 5. 运维与学习 — Srer 负责**运维**生产环境。实现细节见 [engineer/](../engineer/)，风险策略见 [leader/risk/](../leader/risk/)。

## 角色定位

SRE 角色在 YrY 单仓中的定位是：**保障生产环境稳定运行**。当系统出现故障时，SRE 是第一个被通知的人；当需要发布变更时，SRE 执行发布流程并监控发布后的系统状态；当系统设计存在可靠性缺陷时，SRE 通过事后复盘推动改进。

| 关注点 | SRE 角色职责 |
|---|---|
| **事件响应** | 接收告警、定级故障、指挥作战室、撰写事后复盘 |
| **可观测性** | 搭建监控、配置告警、维护仪表盘、追踪 SLO |
| **发布管理** | 执行发布流程、协调多服务发布、处理热修复、管理发布冻结 |
| **值班运维** | 轮值 on-call、交接上下文、维护 runbook |

## 子目录导航

| 问题域 | 内容 | 文件数 |
|---|---|---|
| [incident-response/](./incident-response/) | 事件流程、事后复盘、oncall 交接、runbook | 17 |
| [observability/](./observability/) | 监控告警、仪表盘、SLO 定义、容量成本 | 13 |
| [release/](./release/) | 发布协调、热修复、回滚、金丝雀发布 | 6 |

## 常用入口

| 场景 | 起始文件 |
|---|---|
| 收到告警，不知道如何处理 | [响应事件](./incident-response/04-事件-响应事件.md) |
| 需要主持作战室 | [作战室运作](./incident-response/05-事件-作战室运作.md) |
| 需要发布上线 | [发布流程](./release/04-发布-发布流程.md) |
| 需要紧急修复生产 Bug | [热修复发布](./release/02-发布-热修复发布.md) |
| 需要搭建监控 | [搭建可观测性](./observability/07-可观测-搭建可观测性.md) |
| 需要定义 SLO | [SLO 与 SLI 定义](./observability/08-可观测-SLO与SLI定义.md) |
| 需要做回滚演练 | [回滚演练](./release/05-发布-回滚演练.md) |
| 需要管理技术债务 | [技术债清单](./observability/09-可观测-技术债清单.md) |

## 跨角色引用

| 相关角色 | 关系 | 说明 |
|---|---|---|
| [engineer/ship/](../engineer/ship/) | 上游 | CI/CD、发布实现、灾备恢复 |
| [leader/risk/](../leader/risk/) | 下游 | 风险登记册、事后复盘方法论文档 |
| [leader/capacity/](../leader/capacity/) | 下游 | 容量规划、FinOps 策略 |
| [engineer/SECURITY.md](../engineer/SECURITY.md) | 同级 | 安全域索引（跨领域） |