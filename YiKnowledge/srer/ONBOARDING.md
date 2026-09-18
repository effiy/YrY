---
title: "SRE 新人入职指南 — 30 天上手路线图"
aliases: [sre-onboarding, sre-ramp-up, new-sre, sre-training]
tags: [sre, onboarding, training, operations, ramp-up]
category: srer
created: 2026-09-15
updated: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [srer]
benefit: "新的 SRE 团队成员在 30 天内系统性地掌握 YrY 系统的运维技能，从环境搭建到独立值班"
acceptance_criteria:
  - "4 周分阶段路线图：环境→工具→流程→独立值班"
  - "每周有明确的学习目标和验证方式"
  - "覆盖 YiAi/YiVad/YiPet 三个服务的运维要点"
related:
  - ./README.md
  - ./incident-response/02-事件-处理值班轮班.md
  - ./QUARTERLY-REVIEW.md
---

# SRE 新人入职指南 — 30 天上手路线图

> **适用场景**：新 SRE 团队成员入职第一周开始时。本指南提供结构化的 30 天学习路径，确保新人在一个月内具备独立值班能力。

## 你需要了解的系统全景

YrY 是一个包含 3 个应用 + 1 个知识库的单体仓库：

```
你的工作台（SRE）
    │
    ├── YiAi (Python FastAPI :10086) ← 所有前端依赖的唯一后端
    │   ├── MongoDB ← 数据存储
    │   ├── Ollama ← AI 推理（聊天、RAG）
    │   └── YiKnowledge/ ← 知识库（RAG 数据源）
    │
    ├── YiVad (Vue 3 SPA :8848) ← 管理后台
    └── YiPet (Chrome 扩展) ← 浏览器扩展

你的工作：保持这套系统稳定运行。
```

## 第一周：环境与工具（"能看到系统"）

**目标**：能够启动全栈环境、访问所有监控端点、理解服务间依赖关系。

### 第 1-2 天：环境搭建

- [ ] 在本地启动 YiAi 后端（`cd YiAi && python main.py`）
- [ ] 确认 MongoDB 运行（`brew services list | grep mongodb`）
- [ ] 确认 Ollama 运行（`ollama serve`，已拉取 qwen3.5 模型）
- [ ] 启动 YiVad 前端（`cd YiVad && pnpm dev`）
- [ ] 访问所有健康检查端点：
  - `curl localhost:10086/health/observer`
  - `curl localhost:10086/rag-status`
- [ ] 阅读根级 [CLAUDE.md](../../../CLAUDE.md) 理解 RPC 协议和数据流

**验证方式**：能从浏览器访问 YiVad，能通过 YiVad 发送聊天消息并获得 AI 回复。

### 第 3-4 天：服务依赖理解

- [ ] 画出 YrY 服务依赖图（手绘或 draw.io）
- [ ] 理解每个依赖不可用时的降级行为——阅读 [事件响应流程](./incident-response/04-事件-响应事件.md) 中的「Yi 家族服务降级应对表」
- [ ] 理解 RPC 信封格式：`{module_name, method_name, parameters}`
- [ ] 理解关键参数名称契约（`filter` 非 `query`，`target_file` 非 `path`）

**验证方式**：能口头解释"如果 MongoDB 挂了，用户看到什么？如果 Ollama 挂了，用户看到什么？"

### 第 5 天：工具熟悉

- [ ] 掌握 Git 操作（查看日志、回滚到指定提交）
- [ ] 了解项目使用的 CI 命令：`vue-tsc --noEmit`（YiVad）、`tsc --noEmit`（YiPet）、`pytest`（YiAi）
- [ ] 熟悉浏览器 DevTools（Console、Network 面板）判断前端错误

**验证方式**：能独立重启任一服务并验证恢复。

## 第二周：监控与告警（"能发现问题"）

**目标**：能够配置基础监控、理解告警规则、掌握日志排查技能。

### 第 6-7 天：可观测性基础

- [ ] 阅读 [可观测性三支柱](./observability/05-可观测-可观测性三支柱.md) 理解日志/指标/链路追踪
- [ ] 阅读 [搭建可观测性](./observability/07-可观测-搭建可观测性.md) 掌握当前人工监控清单
- [ ] 实操：运行 `check-health.sh`，解读健康检查输出
- [ ] 实操：查看 YiAi stdout 日志，学会 `tail -f` 和 `grep` 关键模式

**验证方式**：能独立执行每日人工检查清单并判断系统是否健康。

### 第 8-10 天：告警与 SLO

- [ ] 阅读 [告警规则配置](./observability/10-可观测-告警规则配置.md) 理解每条告警的含义
- [ ] 阅读 [SLO 与 SLI 定义](./observability/08-可观测-SLO与SLI定义.md) 理解 SLI/SLO/SLA/错误预算
- [ ] 阅读 [错误预算策略](./observability/12-可观测-错误预算策略.md) 理解预算耗尽时的行动
- [ ] 实操：手动触发一个健康检查失败（停止 Ollama），观察系统行为

**验证方式**：能解释"P99 延迟的 SLO 是 2 秒，但错误预算还剩 15%，意味着什么？该做什么？"

## 第三周：事件响应与发布（"能处理问题"）

**目标**：能够在监督下处理 P1/P2 事件，理解发布流程。

### 第 11-12 天：事件响应

- [ ] 阅读 [事件响应流程](./incident-response/04-事件-响应事件.md) — 4 阶段响应
- [ ] 阅读 [作战室运作](./incident-response/05-事件-作战室运作.md) — 角色分工
- [ ] 阅读 [Runbook 模板](./incident-response/09-事件-Runbook模板.md) — 3 个 YrY 实战 runbook
- [ ] 实操：模拟一个 MongoDB 不可达场景，按 runbook 操作

**验证方式**：能在 10 分钟内按 runbook 恢复一个被模拟故障的服务。

### 第 13-14 天：事后复盘与沟通

- [ ] 阅读 [事后复盘指南](./incident-response/07-事件-事后复盘指南.md) — 无责文化、5-Why、模板
- [ ] 阅读 [事件沟通模板](./incident-response/10-事件-事件沟通模板.md) — 4 类受众沟通
- [ ] 实操：为前一天的模拟故障撰写一份事后复盘

**验证方式**：撰写的事后复盘通过老 SRE 的审查（时间线完整、根因到达系统层面、有具体行动项）。

### 第 15 天：发布流程

- [ ] 阅读 [发布流程](./release/04-发布-发布流程.md) — 4 个服务的发布路径
- [ ] 阅读 [金丝雀发布](./release/01-发布-金丝雀发布.md)
- [ ] 阅读 [热修复发布](./release/02-发布-热修复发布.md)
- [ ] 阅读 [变更管理流程](./release/06-发布-变更管理流程.md) — 风险分级
- [ ] 实操：在监督下执行一次 YiAi 的低风险发布（如修改配置文件）

**验证方式**：能独立完成一次低风险变更（记录变更日志 + 部署 + 验证）。

## 第四周：独立值班准备（"能独当一面"）

**目标**：具备独立值班能力，了解值班期间的所有职责和升级路径。

### 第 16-18 天：值班制度

- [ ] 阅读 [处理值班轮班](./incident-response/02-事件-处理值班轮班.md) — 3 阶段值班
- [ ] 阅读 [值班交接](./incident-response/03-事件-值班交接.md) — 交接模板
- [ ] 阅读 [建立值班轮换](./incident-response/06-事件-建立值班轮换.md) — 升级路径
- [ ] 实操：跟随现任值班人见习 2-3 天

**验证方式**：能独立完成一次值班交接文档。

### 第 19-20 天：深水区知识

- [ ] 阅读 [GPU 推理](./observability/04-可观测-GPU推理.md) 理解 Ollama 显存限制
- [ ] 阅读 [反向代理](./observability/06-可观测-反向代理.md) 理解 Nginx + SSE 配置
- [ ] 阅读 [数据库备份恢复](./observability/11-可观测-数据库备份恢复.md) 理解备份策略
- [ ] 阅读 [Game Day 演练](./incident-response/08-事件-GameDay演练.md)

**验证方式**：能回答"如果要给 YiAi 配置 Nginx 反代，哪些配置对 SSE 流式传输至关重要？"

### 第 21-22 天：综合演练

由老 SRE 设计一个综合故障场景（如：Ollama 不可用 + 磁盘空间不足），新人在监督下独立完成：

- [ ] 发现故障（通过监控/告警/用户反馈）
- [ ] 定级（P0/P1/P2）
- [ ] 按 runbook 响应
- [ ] 对外沟通（模拟 #incidents 频道更新）
- [ ] 故障恢复
- [ ] 撰写事后复盘

**验证通过标准**：
- 15 分钟内完成故障定级和初始响应
- 按 runbook 操作无重大错误
- 事后复盘质量达标

## 入职 30 天检查清单

| 领域 | 应掌握的内容 | 自评 (1-5) |
|---|---|---|
| **系统理解** | 能画出服务依赖图，理解每个依赖不可用的影响 | |
| **监控告警** | 能完成每日人工检查清单，理解所有告警规则 | |
| **事件响应** | 能按 runbook 独立处理 P2 事件，知道何时升级 | |
| **发布流程** | 能独立完成低风险变更，理解高风险变更审批流程 | |
| **值班运维** | 能独立完成值班交接，了解升级路径 | |
| **事后复盘** | 能撰写符合标准的无责事后复盘 | |
| **工具使用** | 能使用 Git、curl、DevTools 排查问题 | |

每个领域自评 ≥ 3 分 → 可独立值班。任一领域 < 3 分 → 向老 SRE 请求对该领域的额外指导。

## 学习资源速查

| 想学什么 | 去哪里 |
|---|---|
| 系统整体架构 | [../../CLAUDE.md](../../CLAUDE.md)、[README.md](./README.md) |
| 响应一个事件 | [事件响应流程](./incident-response/04-事件-响应事件.md) |
| 处理一个告警 | [告警规则配置](./observability/10-可观测-告警规则配置.md) → 找到对应 runbook |
| 部署一个服务 | [发布流程](./release/04-发布-发布流程.md) |
| 发布有风险的变更 | [变更管理流程](./release/06-发布-变更管理流程.md) |
| 如何做值班交接 | [值班交接](./incident-response/03-事件-值班交接.md) |
| 出事后怎么写复盘 | [事后复盘指南](./incident-response/07-事件-事后复盘指南.md) |
| 如何建监控 | [搭建可观测性](./observability/07-可观测-搭建可观测性.md) |

## 常见新人陷阱

| 陷阱 | 表现 | 正确做法 |
|---|---|---|
| 不读 runbook 就上手操作 | 用错误的方式修复故障，导致问题扩大 | 先找到对应 runbook，按步骤操作 |
| 不检查日志就重启服务 | 丢失根因证据 | 永远先 `tail` 日志，再决定是否重启 |
| 不敢升级求助 | 一个人硬撑，延误恢复时间 | 升级不是无能的表现——设定时间盒，超时即升级 |
| 凭"感觉"判断系统状态 | "看起来应该好了" | 每一步操作后用验证命令确认，不靠感觉 |
| 只学 YiAi 不学前端 | 前端故障时不知所措 | YiVad 和 YiPet 的日志/健康检查同样重要 |