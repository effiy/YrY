---
title: "Learn phase index"
tags: [index, learn, lessons, projects, wins, failures, gotchas]
category: engineer/learn
created: 2026-08-26
updated: 2026-09-10
last_verified: 2026-09-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Navigate lessons learned and project-specific docs from a single index"
acceptance_criteria:
  - "lessons/ and projects/ subdirectories listed with file counts"
  - "Cross-references to related phases"
related:
  - ./README.md
  - ../INDEX.md
  - ../../INDEX.md
  - ../build/
  - ../ship/
  - ../run/
---

# Learn — 阶段索引

> **流水线阶段**: LEARN — 记录什么有效、什么无效、什么需要避免。Build 阶段查阅 [../build/](../build/)。Ship 阶段查阅 [../ship/](../ship/)。

## 子目录结构

| 分类 | 目录 | 内容 | 子索引 |
|---|---|---|---|
| 经验教训 | [lessons/](./lessons/) | 来自 YrY 真实项目的成功案例、失败复盘、陷阱记录 | [INDEX](./lessons/00-INDEX.md) |
| 项目文档 | [projects/](./projects/) | 每个子项目的工程文档（架构设计、开发规范、用户故事） | 每个项目有自己的 00-INDEX.md |

## 经验教训概览

| 类别 | 目录 | 描述 | 代表性文件 |
|---|---|---|---|
| 成功案例 | [lessons/wins/](./lessons/wins/) | 可复用的成功模式 | [YiPet 跨项目 Hub](./lessons/wins/01-成果-YiPet跨项目Hub.md) — 浏览器扩展作为多项目集成中心的架构模式 |
| 失败复盘 | [lessons/failures/](./lessons/failures/) | 失败分析和事后复盘 | [YiVad AICR 端口幻觉](./lessons/failures/01-教训-YiVad-AICR端口幻觉.md) — AI 助手声称完成但实际不存在的代码移植 |
| 陷阱记录 | [lessons/gotchas/](./lessons/gotchas/) | 需要避开的工程坑点 | [RPC 参数名不匹配](./lessons/gotchas/02-陷阱-RPC参数名不匹配.md) — `filter` vs `query` 导致后端静默忽略 |
| 框架学习 | [lessons/](./lessons/) | 工程能力提升 | [学习 PM 框架](./lessons/01-经验-学习PM框架.md) — 产品管理框架的学习路径 |
| 项目 Bug | [../../projects/yivad/bugs/](../../projects/yivad/bugs/) | Bug 分析报告 | ProTable 搜索参数不匹配、项目 i18n 标题不显示等 |

### 经验教训总数

- 成功案例 (wins): 1 篇
- 失败复盘 (failures): 1 篇
- 陷阱记录 (gotchas): 4 篇
- 学习路径 (lessons): 1 篇

## 项目文档概览

| 项目 | 目录 | 技术栈 | 核心文档 |
|---|---|---|---|
| YiVad | [projects/yivad/](./projects/yivad/) | Vue 3.5 管理后台 | [架构设计](./projects/yivad/01-项目-架构设计.md), [开发规范](./projects/yivad/02-项目-开发规范.md), [功能模块](./projects/yivad/03-项目-功能模块.md), [流水线闭环](./projects/yivad/04-项目-流水线闭环.md) |
| YiAi | [projects/yiai/](./projects/yiai/) | FastAPI 后端 | [架构设计](./projects/yiai/01-项目-架构设计.md), [开发规范](./projects/yiai/02-项目-开发规范.md), [功能模块](./projects/yiai/03-项目-功能模块.md) |
| YiPet | [projects/yipet/](./projects/yipet/) | Chrome MV3 扩展 | [架构设计](./projects/yipet/01-项目-架构设计.md), [开发规范](./projects/yipet/02-项目-开发规范.md), [功能模块](./projects/yipet/03-项目-功能模块.md) |

### 用户故事

| 项目 | 故事数 | 代表性故事 |
|---|---|---|
| YiVad | 3 篇 | AiCR 代码审查、分析文件 Prompt 生成与 AiCR 联动、Story Board 看板 |
| YiAi | 2 篇 | YiAi 路由模块分析、用户导入与导出 |
| YiPet | 1 篇 | 宠物设置（皮肤/角色/模型配置） |

## 按使用场景快速跳转

### 场景 1：我在调试一个诡异的跨项目 Bug

1. 先检查 [gotchas/](./lessons/gotchas/) 目录，看是否有已知的陷阱记录
2. 重点关注 [RPC 参数名不匹配](./lessons/gotchas/02-陷阱-RPC参数名不匹配.md) 和 [SSE onDone 守卫](./lessons/gotchas/03-陷阱-SSE-onDone守卫.md)
3. 如果没有匹配，考虑在问题解决后贡献一篇新的 gotcha

### 场景 2：我要了解某个项目的架构

1. 进入对应项目的 `00-INDEX.md`（如 [projects/yivad/00-INDEX.md](./projects/yivad/00-INDEX.md)）
2. 先读架构设计（`01-项目-架构设计.md`），了解技术栈和分层
3. 再读开发规范（`02-项目-开发规范.md`），了解编码约定和关键陷阱
4. 最后读功能模块（`03-项目-功能模块.md`），了解模块清单

### 场景 3：我要开始一个新的 AI 辅助开发任务

1. 先读 [YiVad AICR 端口幻觉](./lessons/failures/01-教训-YiVad-AICR端口幻觉.md) 学习"信任但验证"原则
2. 建立验证流程：每个开发会话结束后用 `git diff --stat` 和 `ls` 验证 AI 声称的产出
3. 在 CLAUDE.md 中只记录经过独立验证的状态

## 交叉引用

- [../build/](../build/) — 架构与设计模式（Build 阶段）
- [../ship/](../ship/) — 质量、安全、数据、可靠性（Ship 阶段）
- [../run/](../run/) — 团队工作流与新人入职（Run 阶段）
- [../../leader/risk/write-a-postmortem.md](../../leader/risk/write-a-postmortem.md) — 事故复盘方法论
- [../../projects/](../../projects/) — 项目运营产物（Bug 跟踪、Issue、Demo）
- [../../INDEX.md](../../INDEX.md) — 知识库顶层索引