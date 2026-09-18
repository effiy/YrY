---
title: "协作领域索引"
aliases: [collaboration, team-processes, cross-role-collaboration]
tags: [collaboration, team, onboarding, meetings, knowledge-sharing, cross-role, MOC]
category: curator
created: 2026-09-15
updated: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator, engineer, leader, producter, srer, executiver, aier]
benefit: "团队成员在一个索引中找到所有协作相关内容：入职引导、会议规范、代码审查、知识分享、迭代流程"
acceptance_criteria:
  - "覆盖 6 个协作主题"
  - "每个条目指向已存在的文件"
  - "按角色和主题双向索引"
related:
  - ./README.md
  - ./INDEX.md
  - ../engineer/ENGINEERING.md
  - ../engineer/SECURITY.md
---

# 协作领域索引

> 跨角色协作内容的聚合入口。不重复存储内容——通过 frontmatter `roles:` 和交叉引用聚合所有角色目录中的协作相关内容。

## 主题导航

| 主题 | 说明 | 核心文件 |
|------|------|----------|
| [入职引导](#入职引导) | 新成员上手各项目的路径 | 3 个项目入职文档 |
| [会议与沟通](#会议与沟通) | 会议记录、一对一、沟通模板 | 会议模板 + 一对一模板 |
| [知识分享](#知识分享) | 经验教训、成功案例、读书笔记 | lessons/ + reading-list/ |
| [代码审查](#代码审查) | 审查流程、AI 辅助审查、提示词 | 审查提示词 + ADR |
| [迭代流程](#迭代流程) | Sprint 运作、PRD 到上线 | delivery/ + loop/ |
| [复盘改进](#复盘改进) | 事后复盘、回顾模板、行动跟踪 | 复盘模板 + 事故响应 |

---

## 入职引导

| 资源 | 位置 | 适用角色 |
|------|------|----------|
| YiAi 后端入职 | [engineer/run/onboarding/01-入职-YiAi入职.md](../engineer/run/onboarding/01-入职-YiAi入职.md) | engineer, aier |
| YiPet 扩展入职 | [engineer/run/onboarding/02-入职-YiPet入职.md](../engineer/run/onboarding/02-入职-YiPet入职.md) | engineer |
| YiVad 前端入职 | [engineer/run/onboarding/03-入职-YiVad入职.md](../engineer/run/onboarding/03-入职-YiVad入职.md) | engineer |
| 知识库新人入口 | [../README.md](../README.md) → [curator/INDEX.md](./INDEX.md) | 所有角色 |
| 项目架构概览 | [engineer/learn/projects/](../engineer/learn/projects/) | engineer |

## 会议与沟通

| 资源 | 位置 | 适用场景 |
|------|------|----------|
| 会议记录模板 | [templates/03-模板-会议记录模板.md](./templates/03-模板-会议记录模板.md) | 所有会议 |
| 一对一谈话模板 | [templates/04-模板-一对一模板.md](./templates/04-模板-一对一模板.md) | 管理者→成员 |
| 季度业务回顾 | [executiver/roadmap/04-路线图-季度业务回顾.md](../executiver/roadmap/04-路线图-季度业务回顾.md) | executiver, leader |
| 组织 OKR 追踪 | [executiver/roadmap/03-路线图-组织OKR追踪.md](../executiver/roadmap/03-路线图-组织OKR追踪.md) | executiver, leader |
| 值班交接 | [srer/incident-response/03-事件-值班交接.md](../srer/incident-response/03-事件-值班交接.md) | srer |

## 知识分享

| 资源 | 位置 | 适用角色 |
|------|------|----------|
| 经验教训总览 | [engineer/learn/lessons/00-INDEX.md](../engineer/learn/lessons/00-INDEX.md) | 所有角色 |
| 成功案例 | [engineer/learn/lessons/wins/](../engineer/learn/lessons/wins/) | 所有角色 |
| 失败教训 | [engineer/learn/lessons/failures/](../engineer/learn/lessons/failures/) | 所有角色 |
| 踩坑记录 | [engineer/learn/lessons/gotchas/](../engineer/learn/lessons/gotchas/) | engineer |
| 管理层阅读清单 | [executiver/reading-list/01-阅读-阅读清单.md](../executiver/reading-list/01-阅读-阅读清单.md) | 所有角色 |
| 读书笔记汇总 | [executiver/reading-list/03-阅读-读书笔记汇总.md](../executiver/reading-list/03-阅读-读书笔记汇总.md) | 所有角色 |
| 知识库贡献规范 | [governance/02-治理-治理规范.md](./governance/02-治理-治理规范.md) | curator, 所有作者 |

## 代码审查

| 资源 | 位置 | 适用场景 |
|------|------|----------|
| AI 代码审查提示词 | [aier/methods/prompts/03-提示词-代码审查.md](../aier/methods/prompts/03-提示词-代码审查.md) | engineer, aier |
| YiVad AICR 移植 ADR | [leader/decisions/yivad/01-决策-AICR阶段移植.md](../leader/decisions/yivad/01-决策-AICR阶段移植.md) | leader, engineer |
| YiPet AICR 移植 ADR | [leader/decisions/yipet/01-决策-AICR移植.md](../leader/decisions/yipet/01-决策-AICR移植.md) | leader, engineer |
| 代码审查阶段规范 | [okr/2026-Q3/loop/INDEX.md](./okr/2026-Q3/loop/INDEX.md) (03-代码审查) | 所有开发者 |

## 迭代流程

| 资源 | 位置 | 适用角色 |
|------|------|----------|
| Sprint 运作指南 | [producter/delivery/01-交付-运作Sprint.md](../producter/delivery/01-交付-运作Sprint.md) | producter, engineer |
| PRD 编写指南 | [producter/discovery/01-发现-编写PRD.md](../producter/discovery/01-发现-编写PRD.md) | producter |
| PRD 模板 | [templates/05-模板-PRD模板.md](./templates/05-模板-PRD模板.md) | producter |
| 全流程闭环记录 | [okr/2026-Q3/loop/INDEX.md](./okr/2026-Q3/loop/INDEX.md) | 所有角色 |
| 进度看板 | [leader/roadmap/01-路线图-进度看板.md](../leader/roadmap/01-路线图-进度看板.md) | leader |
| 发布管理 | [srer/release/](../srer/release/) | srer, engineer |
| 北极星指标 | [producter/discovery/metrics/01-指标-北极星指标.md](../producter/discovery/metrics/01-指标-北极星指标.md) | producter, executiver |

## 复盘改进

| 资源 | 位置 | 适用场景 |
|------|------|----------|
| 回顾复盘模板 | [templates/06-模板-回顾模板.md](./templates/06-模板-回顾模板.md) | 所有角色 |
| 事后复盘指南 | [leader/risk/02-风险-事后复盘.md](../leader/risk/02-风险-事后复盘.md) | leader, srer |
| 事件响应流程 | [srer/incident-response/04-事件-响应事件.md](../srer/incident-response/04-事件-响应事件.md) | srer |
| 作战室运作 | [srer/incident-response/05-事件-作战室运作.md](../srer/incident-response/05-事件-作战室运作.md) | srer, leader |
| 技术债管理 | [leader/roadmap/08-路线图-管理技术债.md](../leader/roadmap/08-路线图-管理技术债.md) | leader, engineer |
| 季度技术债审查 | [engineer/ship/04-交付-季度技术债.md](../engineer/ship/04-交付-季度技术债.md) | engineer |
| 隐性知识捕获 | [governance/06-治理-隐性知识待办.md](./governance/06-治理-隐性知识待办.md) | curator, 所有角色 |

## 按角色快速查找

| 角色 | 最相关的协作资源 |
|------|-----------------|
| engineer | 入职文档、代码审查提示词、经验教训、Sprint 运作 |
| leader | ADR、事后复盘、技术债管理、进度看板、一对一模板 |
| producter | PRD 模板、Sprint 运作、北极星指标、用户研究方法 |
| srer | 事件响应、值班交接、发布管理、作战室运作 |
| aier | AI 代码审查提示词、Agent 架构模式 |
| executiver | 季度业务回顾、OKR 追踪、阅读清单、读书笔记 |
| curator | 治理规范、知识分享流程、隐性知识捕获 |

## 维护说明

- 新增协作相关文件时，在此索引中添加条目
- 每季度验证所有链接有效性
- 不在此文件中直接写协作内容——始终链接到角色目录中的源文件