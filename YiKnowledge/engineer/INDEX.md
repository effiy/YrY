---
title: "Engineer role index"
tags: [index, engineer, build, ship, run, learn]
category: engineer
created: 2026-08-06
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers find content by problem domain"
acceptance_criteria:
  - "4 phase directories with README files"
related:
  - ./README.md
  - ../INDEX.md
  - ./SECURITY.md
  - ../curator/COLLABORATION.md
---

# Engineer — 角色索引

> **流水线阶段**: 3. 设计与构建 — Engineer 角色负责**实现**。架构决策请查阅 [leader/](../leader/)。事件响应请查阅 [srer/](../srer/)。产品需求请查阅 [producter/](../producter/)。

## 问题域

按 Build/Ship/Run/Learn 四个阶段组织，外加 Project 项目参考和 OKR 目标管理：

| 阶段 | 目录 | 解决的核心问题 | 子索引 |
|---|---|---|---|
| BUILD | [build/](./build/) | 如何设计和搭建此系统？——架构模式、API 设计、RPC 契约、SSE 流式实现 | — |
| SHIP | [ship/](./ship/) | 如何测试、加固、持久化并使其具有韧性？——容量规划、安全加固、数据迁移、退避重试、测试基础设施、技术债管理 | — |
| RUN | [run/](./run/) | 如何高效协作和新手上路？——竞品调研、入职指南（YiAi/YiPet/YiVad） | — |
| LEARN | [learn/](./learn/) | 经验教训和项目特定文档——成功案例、失败复盘、陷阱记录、项目架构与开发规范 | [INDEX](./learn/INDEX.md) |
| PROJECTS | [projects/](./projects/) | 四个子项目的完整参考文档——快速开始、架构设计、开发规范、功能模块、构建部署 | — |
| OKR | [okr/](./okr/) | 工程团队季度目标与关键结果——2026 Q3 构建健康度与调试自闭环 | — |

## BUILD 阶段 — 快速跳转

| 文档 | 用途 |
|---|---|
| [cross-project-rpc-protocol.md](./build/cross-project-rpc-protocol.md) | RPC 信封规范、参数名契约、已知 Bug 模式——所有跨项目调用的唯一事实来源 |
| [implement-cross-project-rpc-call.md](./build/implement-cross-project-rpc-call.md) | 跨 YiVad/YiPet 到 YiAi 添加新 RPC 调用的分步实施指南 |
| [implement-sse-streaming.md](./build/implement-sse-streaming.md) | AI 聊天的 SSE 流式实现指南，含中止处理和超时管理 |
| [04-MongoDB模式设计](./build/04-构建-MongoDB模式设计.md) | MongoDB 文档模型设计——嵌入 vs 引用、索引策略、命名规范 |
| [05-API设计模式](./build/05-构建-API设计模式.md) | RPC vs REST 决策、响应格式标准、分页与错误处理约定 |
| [06-调试排错指南](./build/06-构建-调试排错指南.md) | 四步诊断方法论——从症状到根因的排查流程、请求链路追踪 |
| [07-性能优化指南](./build/07-构建-性能优化指南.md) | Python 异步并发、Vue 渲染优化、MongoDB 索引与查询优化 |
| [08-环境变量配置](./build/08-构建-环境变量配置.md) | YiAi config.yaml、YiVad RSBUILD_ENV_ 前缀、YiPet .env 三套配置系统 |

## SHIP 阶段 — 关键文档

| 文档 | 用途 |
|---|---|
| [01-容量规划](./ship/01-交付-容量规划.md) | YiAi/MongoDB/Ollama 资源评估与扩缩容决策 |
| [02-加固供应链](./ship/02-交付-加固供应链.md) | Python 和 Node.js 依赖审计、锁文件完整性、构建可重现性 |
| [03-数据迁移](./ship/03-交付-数据迁移.md) | MongoDB 数据安全迁移四阶段流程（准备→迁移→验证→清理） |
| [04-季度技术债](./ship/04-交付-季度技术债.md) | 跨 YrY 项目的技术债盘点与优先级决策框架 |
| [05-退避重试](./ship/05-交付-退避重试.md) | Python（tenacity）和 TypeScript（ApiClient）的指数退避重试实现 |
| [06-搭建测试基础设施](./ship/06-交付-搭建测试基础设施.md) | pytest（YiAi）+ vitest（YiVad/YiPet）测试框架搭建与 CI 集成 |
| [07-CICD流水线](./ship/07-交付-CICD流水线.md) | GitHub Actions 流水线配置——lint、类型检查、测试、安全审计的质量门禁 |
| [08-部署指南](./ship/08-交付-部署指南.md) | YiAi Docker/uvicorn、YiVad OSS/Nginx、YiPet Chrome Web Store 部署与回滚 |

## RUN 阶段 — 关键文档

| 文档 | 用途 |
|---|---|
| [01-了解竞品](./run/01-运行-了解竞品.md) | 竞品分析方法论——识别、调研、框架、归档 |
| [01-YiAi入职](./run/onboarding/01-入职-YiAi入职.md) | YiAi 后端新人第一天快速上手 |
| [02-YiPet入职](./run/onboarding/02-入职-YiPet入职.md) | YiPet 扩展新人第一天快速上手 |
| [03-YiVad入职](./run/onboarding/03-入职-YiVad入职.md) | YiVad 前端新人第一天快速上手 |
| [02-开发工作流](./run/02-运行-开发工作流.md) | 全栈启动、按项目开发、常见问题排查的日常开发流程 |
| [03-Git工作流](./run/03-运行-Git工作流.md) | 分支策略、Conventional Commits、PR 流程、合并策略 |
| [04-CodeReview指南](./run/04-运行-CodeReview指南.md) | Code Review 清单——按语言分层的审查要点和 RPC 契约验证 |

## LEARN 阶段 — 经验教训精选

| 类别 | 代表性文档 |
|---|---|
| 成功案例 (wins) | [YiPet 跨项目 Hub](./learn/lessons/wins/01-成果-YiPet跨项目Hub.md) — 浏览器扩展作为集成中心的架构模式 |
| 成功案例 (wins) | [RPC 统一信封](./learn/lessons/wins/02-成果-RPC统一信封.md) — 一个端点服务三个项目，YrY 中回报率最高的架构决策 |
| 成功案例 (wins) | [测试基础设施](./learn/lessons/wins/03-成果-测试基础设施.md) — 从零到 76 个测试，shared/ 模块 92% 覆盖率的策略 |
| 失败复盘 (failures) | [YiVad AICR 端口幻觉](./learn/lessons/failures/01-教训-YiVad-AICR端口幻觉.md) — AI 助手生成虚假交付报告 |
| 失败复盘 (failures) | [无锁文件供应链事故](./learn/lessons/failures/02-教训-无锁文件供应链.md) — lockfile 缺失导致构建不可重现 |
| 陷阱记录 (gotchas) | [RPC 参数名不匹配](./learn/lessons/gotchas/02-陷阱-RPC参数名不匹配.md) — `filter` vs `query` 导致后端静默忽略 |
| 陷阱记录 (gotchas) | [SSE onDone 守卫缺失](./learn/lessons/gotchas/03-陷阱-SSE-onDone守卫.md) — 中止的 SSE 流仍触发外发副作用 |

## 跨角色引用

- [../leader/](../leader/) — 架构决策记录（ADR）、容量规划、技术风险、技术路线图
- [../aier/](../aier/) — AI 基础理论、RAG/Agent 方法、LLM 平台
- [../producter/](../producter/) — 产品管理框架、需求发现、交付管理
- [../srer/](../srer/) — 事件响应流程、可观测性（监控/告警/SLO）、发布回滚
- [../projects/](../projects/) — 项目运营产物（Bug 跟踪、Issue、Demo）
- [./SECURITY.md](./SECURITY.md) — 跨角色安全领域聚合索引
- [./ENGINEERING.md](./ENGINEERING.md) — 跨角色工程领域聚合索引
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — 团队协作领域聚合索引