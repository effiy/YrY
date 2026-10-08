---
title: "协作总索引 — 跨角色协作导航"
tags: [category/curator, collaboration, index, onboarding, mentor, meeting, estimation, governance]
category: curator
created: 2026-10-07
updated: 2026-10-07
source: internal
type: guide
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer, curator]
benefit: "新成员1分钟内定位所有协作相关资源，消除死链并统一7个协作领域的导航入口"
acceptance_criteria:
  - "7栏导航覆盖：入职引导/Mentor制度/会议与节奏/排期与估算/跨项目协作/知识治理/项目管理"
  - "每栏至少2个跳转链接指向真实存在的文件"
  - "所有链接可正常访问，无死链"
related:
  - ./INDEX.md
  - ./README.md
  - ./governance/0002-治理-治理规范.md
  - ./governance/0008-治理-操作速查卡.md
  - ../engineer/run/0001-入职-YiAi入职.md
  - ../engineer/run/0008-运行-CodeReview指南.md
  - ../product/delivery/0001-交付-运作Sprint.md
  - ../leader/roadmap/0013-路线图-运营节奏.md
---

# 协作总索引 — 跨角色协作导航

> **死链复活**：本页是 YiKnowledge 协作领域的唯一总索引。所有跨角色、跨目录的协作流程在此汇聚。之前散落各处的协作链接已统一迁移到本页，消除历史死链。

---

## 七栏导航总览

| 入职引导 | Mentor 制度 | 会议与节奏 | 排期与估算 | 跨项目协作 | 知识治理 | 项目管理 |
|---|---|---|---|---|---|---|
| [YiAi 入职](../engineer/run/001-入职-YiAi入职.md) | [一对一模板](./templates/004-模板-一对一模板.md) | [Sprint 运作](../product/delivery/001-交付-运作Sprint.md) | [估算指南](../leader/roadmap/014-路线图-估算指南.md) | [跨项目协作](../product/delivery/005-交付-跨项目协作.md) | [治理规范](./governance/002-治理-治理规范.md) | [YiAi 管理](../product/projects/yiai/001-项目-管理.md) |
| [YiPet 入职](../engineer/run/002-入职-YiPet入职.md) | [Mentor 一对一指南](../engineer/run/009-运行-Mentor一对一指南.md) | [运营节奏](../leader/roadmap/013-路线图-运营节奏.md) | [排期估算方法](../engineer/run/010-运行-排期估算方法.md) | [跨项目Hub](../leader/decisions/yipet-yipet-yipet-004-决策-跨项目Hub.md) | [操作速查卡](./governance/008-治理-操作速查卡.md) | [YiPot 项目](../engineer/projects/005-项目-YiPot项目.md) |
| [YiVad 入职](../engineer/run/003-入职-YiVad入职.md) | [反馈指南](../leader/roadmap/017-路线图-反馈指南.md) | [会议记录模板](./templates/003-模板-会议记录模板.md) | [容量规划](../leader/capacity/005-容量-基础设施规模估算.md) | [RPC 桥接](../engineer/build/006-构建-跨项目RPC协议设计.md) | [收件箱处理](./governance/003-治理-收件箱.md) | [技术债策略](../executive/strategy/040-战略-技术债策略.md) |
| [开发工作流](../engineer/run/006-运行-开发工作流.md) | [入职指南](../leader/roadmap/016-路线图-入职指南.md) | [回顾模板](./templates/006-模板-回顾模板.md) | [预算规划](../leader/capacity/006-容量-预算规划指南.md) | [项目间桥接PRD](../projects/yipet/prds/2026-08/04-prd-跨项目桥接.md) | [就绪检查清单](./governance/004-治理-就绪检查清单.md) | [季度技术债](../engineer/ship/004-交付-季度技术债.md) |

---

## 各栏详细说明

### 1. 入职引导

新成员从这里开始，按项目找到入职文档和基础工作流：

- [YiAi 入职](../engineer/run/001-入职-YiAi入职.md) — 后端 Python + FastAPI 项目环境搭建
- [YiPet 入职](../engineer/run/002-入职-YiPet入职.md) — Chrome 插件 Vue + Rsbuild 项目环境搭建
- [YiVad 入职](../engineer/run/003-入职-YiVad入职.md) — 项目管理系统前端环境搭建
- [开发工作流](../engineer/run/006-运行-开发工作流.md) — 日常开发的标准流程
- [Git 工作流](../engineer/run/007-运行-Git工作流.md) — 分支策略与提交规范

### 2. Mentor 制度

一对一辅导、成长反馈和新成员融入：

- [一对一模板](./templates/004-模板-一对一模板.md) — 每次 1on1 的标准议程和行动项跟踪
- [Mentor 一对一指南](../engineer/run/009-运行-Mentor一对一指南.md) — 30/60/90 天三阶段辅导方案 + 30 个开放式问题
- [反馈指南](../leader/roadmap/017-路线图-反馈指南.md) — 给予和接受有效反馈的框架
- [入职指南](../leader/roadmap/016-路线图-入职指南.md) — 管理者视角的新成员融入节奏

### 3. 会议与节奏

各类会议的召开方式、模板和运营节奏：

- [Sprint 运作](../product/delivery/001-交付-运作Sprint.md) — Sprint 规划、站会、评审、回顾四会
- [运营节奏](../leader/roadmap/013-路线图-运营节奏.md) — 日/周/月/季的会议和审查节奏
- [会议记录模板](./templates/003-模板-会议记录模板.md) — 决策、待办和行动项的结构化记录
- [回顾模板](./templates/006-模板-回顾模板.md) — Sprint/季度复盘的 Start/Stop/Continue 框架
- [CodeReview 指南](../engineer/run/008-运行-CodeReview指南.md) — 代码审查的标准和流程

### 4. 排期与估算

从 T 恤尺寸到 PERT 的完整估算方法栈：

- [估算指南](../leader/roadmap/014-路线图-估算指南.md) — 路线图级别的估算方法论
- [排期估算方法](../engineer/run/010-运行-排期估算方法.md) — T恤尺寸/规划扑克/三点PERT/置信区间/缓冲策略
- [容量规划](../leader/capacity/005-容量-基础设施规模估算.md) — 服务器、带宽、存储的容量估算
- [预算规划](../leader/capacity/006-容量-预算规划指南.md) — 季度人力和云资源预算编制
- [进度看板](../leader/roadmap/001-路线图-进度看板.md) — 可视化排期和进度追踪

### 5. 跨项目协作

YiAi / YiPet / YiVad / YiPot 之间的协作协议：

- [跨项目协作](../product/delivery/005-交付-跨项目协作.md) — 跨项目依赖管理和沟通机制
- [跨项目Hub决策](../leader/decisions/yipet-yipet-yipet-004-决策-跨项目Hub.md) — YiPet 作为跨项目统一入口的 ADR
- [跨项目 RPC 协议](../engineer/build/006-构建-跨项目RPC协议设计.md) — `{module_name, method_name, parameters}` 信封规范
- [跨项目桥接 PRD](../projects/yipet/prds/2026-08/04-prd-跨项目桥接.md) — YiPet ↔ YiAi 桥接功能需求
- [四层 API 架构](../leader/decisions/yipet-yipet-yipet-005-决策-四层API架构.md) — YiPet API 分层设计决策

### 6. 知识治理

知识库的生命周期管理、质量门禁和审查流程：

- [治理规范](./governance/002-治理-治理规范.md) — 4 角色 3 节奏治理模型
- [操作速查卡](./governance/008-治理-操作速查卡.md) — 日常操作一页纸
- [收件箱处理](./governance/003-治理-收件箱.md) — 新内容进入 KB 的第一站
- [就绪检查清单](./governance/004-治理-就绪检查清单.md) — 发布前 10 题门禁
- [审查日志](./governance/005-治理-审查日志.md) — 每次季度审查的记录
- [ADR 模板](./templates/001-模板-ADR模板.md) — 架构决策记录标准模板

### 7. 项目管理

各项目的管理入口、技术债和风险管理：

- [YiAi 项目管理](../product/projects/yiai/001-项目-管理.md) — 后端项目的计划、风险、依赖
- [YiPot 项目](../engineer/projects/005-项目-YiPot项目.md) — 桌面翻译工具项目概览
- [技术债策略](../executive/strategy/040-战略-技术债策略.md) — 技术债识别、排序、偿还框架
- [季度技术债](../engineer/ship/004-交付-季度技术债.md) — 每季度技术债清理计划
- [风险登记册](../leader/risk/003-风险-风险登记册模板.md) — 项目风险识别和追踪
- [OKR 方法论](../executive/strategy/015-战略-OKR方法论.md) — 目标与关键结果设定框架

---

## 协作快速入口（按使用频率排序）

| 场景 | 直达链接 |
|---|---|
| 每天开站会 | [Sprint 运作](../product/delivery/001-交付-运作Sprint.md) → 站会章节 |
| 每周 1on1 | [一对一模板](./templates/004-模板-一对一模板.md) |
| 要做技术选型 | [ADR 模板](./templates/001-模板-ADR模板.md) |
| 估算需求工时 | [排期估算方法](../engineer/run/010-运行-排期估算方法.md) |
| 写 PRD | [PRD 模板](./templates/005-模板-PRD模板.md) |
| 发新文件前检查 | [就绪检查清单](./governance/004-治理-就绪检查清单.md) |
| 新同事入职 | [入职引导](#1-入职引导) |
| 月底复盘 | [回顾模板](./templates/006-模板-回顾模板.md) |

---

## 链接维护说明

本页是"死链复活"工程的核心成果。维护规则：

1. **新增协作资源**必须在本页对应栏目添加链接，否则视为未发布
2. **每季度审查**（配合治理节奏）检查所有链接有效性，失效链接立即修复或移除
3. **7 栏结构**是固定的——如果有新的协作领域，先与 Curator 讨论是否扩展结构
4. **related 字段**至少包含本页 + 各自栏目下的 2-3 个核心文档
