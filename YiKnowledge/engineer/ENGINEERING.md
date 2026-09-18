---
title: Engineering Domain Index
aliases: [engineering-index, architecture-patterns, dev-practices, quality-engineering]
tags: [domain-index, engineering, architecture, quality, deployment, data, reliability, tools, lessons]
category: root
created: 2026-08-06
updated: 2026-09-18
last_verified: 2026-09-18
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader, aier, srer]
benefit: "All engineering content — architecture, development, quality, data, reliability, deployment, tools, and lessons — reachable from a single cross-role index"
acceptance_criteria:
  - "Aggregates engineering content from engineer/, leader/, srer/, aier/"
  - "Organized by 8 subdomains with verified file paths"
  - "Each entry describes what the reader will find"
  - "Covers both BUILD (design+construct) and SHIP (quality+release) phases"
related:
  - ./INDEX.md
  - ./README.md
  - ./SECURITY.md
  - ../curator/COLLABORATION.md
  - ../leader/README.md
  - ../srer/README.md
---

# 工程领域聚合索引

> 跨角色聚合架构设计、开发实践、质量保障、数据工程、可靠性设计、部署运维、开发工具及经验教训类内容。不重复存储内容——通过 frontmatter `roles:` 和交叉引用聚合所有角色目录中的工程相关内容。

## 主题导航

| 主题 | 说明 | 核心角色 |
|------|------|----------|
| [架构与设计](#架构与设计) | 系统设计、API 模式、ADR、架构全景 | engineer, leader |
| [开发实践](#开发实践) | 工具链、DX、代码规范、环境配置 | engineer |
| [质量保障](#质量保障) | 测试策略、代码审查、技术债管理 | engineer |
| [数据工程](#数据工程) | 数据库设计、数据迁移、缓存策略 | engineer |
| [可靠性工程](#可靠性工程) | 退避重试、熔断降级、容量规划 | engineer, srer |
| [部署与发布](#部署与发布) | CI/CD、发布流程、金丝雀部署 | engineer, srer |
| [经验教训](#经验教训) | 成功案例、失败复盘、陷阱记录 | engineer |
| [团队协作](#团队协作) | 入职指南、项目文档、协作流程 | engineer, curator |

---

## 架构与设计

### 架构决策 (ADR)

| 资源 | 位置 | 描述 |
|------|------|------|
| ADR 模板 | [../leader/architecture/01-架构-架构决策设计.md](../leader/architecture/01-架构-架构决策设计.md) | 12 节 ADR 模板：上下文→决策→后果→替代方案 |
| YiAi ADR | [../leader/decisions/yiai/](../leader/decisions/yiai/) | 知识监听器、LLM 路由、pytest、RAG 评估等 5 项决策 |
| YiVad ADR | [../leader/decisions/yivad/](../leader/decisions/yivad/) | AICR 移植、Rsbuild 迁移、Vitest 引入等 3 项决策 |
| YiPet ADR | [../leader/decisions/yipet/](../leader/decisions/yipet/) | Biome、双世界架构、跨项目 Hub 等 6 项决策 |

### 架构全景与评估

| 资源 | 位置 | 描述 |
|------|------|------|
| 架构全景图 | [../leader/architecture/09-架构-架构全景图.md](../leader/architecture/09-架构-架构全景图.md) | 4 个子项目架构关系、数据流和关键决策总览 |
| 架构成熟度模型 | [../leader/architecture/03-架构-架构成熟度模型-2026-08.md](../leader/architecture/03-架构-架构成熟度模型-2026-08.md) | 各项目架构纪律评估 |
| 文档成熟度模型 | [../leader/architecture/04-架构-文档成熟度模型-2026-08.md](../leader/architecture/04-架构-文档成熟度模型-2026-08.md) | 各项目文档体系评估 |
| DORA 指标基线 | [../leader/architecture/02-架构-DORA指标-2026-Q2基线.md](../leader/architecture/02-架构-DORA指标-2026-Q2基线.md) | 部署频率、变更前置时间、变更失败率、恢复时间 |

### 系统设计模式

| 资源 | 位置 | 描述 |
|------|------|------|
| API 设计模式 | [build/05-构建-API设计模式.md](./build/05-构建-API设计模式.md) | RESTful 设计、RPC 信封规范、SSE 流式模式 |
| MongoDB 模式设计 | [build/04-构建-MongoDB模式设计.md](./build/04-构建-MongoDB模式设计.md) | 嵌入 vs 引用、索引策略、查询优化 |
| 跨项目 RPC 协议参考 | [build/cross-project-rpc-protocol.md](./build/cross-project-rpc-protocol.md) | 参数名称契约（filter/query, target_file/path 等曾导致 bug 的不匹配） |
| 跨项目 RPC 调用实现 | [build/implement-cross-project-rpc-call.md](./build/implement-cross-project-rpc-call.md) | 前端→YiAi RPC 调用的完整实现指南 |
| SSE 流式实现 | [build/implement-sse-streaming.md](./build/implement-sse-streaming.md) | Server-Sent Events 流式响应的前后端实现 |

---

## 开发实践

### 开发工具链

| 资源 | 位置 | 描述 |
|------|------|------|
| 调试排错指南 | [build/06-构建-调试排错指南.md](./build/06-构建-调试排错指南.md) | 跨项目调试技巧：YiAi 日志、YiVad DevTools、YiPet content script |
| 性能优化指南 | [build/07-构建-性能优化指南.md](./build/07-构建-性能优化指南.md) | 前端打包优化、后端查询优化、SSE 流控 |
| 环境变量配置 | [build/08-构建-环境变量配置.md](./build/08-构建-环境变量配置.md) | 三项目环境变量管理：`.env` 规范、默认值、生产覆盖 |

### 代码规范

| 资源 | 位置 | 描述 |
|------|------|------|
| 代码审查标准 | [../leader/architecture/10-架构-代码审查标准.md](../leader/architecture/10-架构-代码审查标准.md) | 各项目的代码审查检查清单 |
| AI 代码审查提示词 | [../aier/methods/prompts/03-提示词-代码审查.md](../aier/methods/prompts/03-提示词-代码审查.md) | 用于 Claude 辅助代码审查的提示词模板 |

### 技术选型参考

| 资源 | 位置 | 描述 |
|------|------|------|
| LLM 提供商选型 | [../leader/architecture/06-架构-技术选型-LLM提供商.md](../leader/architecture/06-架构-技术选型-LLM提供商.md) | 本地 Ollama vs 云端 API 的评估矩阵 |
| React 状态管理选型 | [../leader/architecture/07-架构-技术选型-React状态管理.md](../leader/architecture/07-架构-技术选型-React状态管理.md) | 状态管理方案对比 |
| 技术选型流程 | [../leader/roadmap/07-路线图-技术选型.md](../leader/roadmap/07-路线图-技术选型.md) | 加权评分矩阵、PoC 验证、推荐建议模板 |

---

## 质量保障

### 测试策略

| 资源 | 位置 | 描述 |
|------|------|------|
| 搭建测试基础设施 | [ship/06-交付-搭建测试基础设施.md](./ship/06-交付-搭建测试基础设施.md) | pytest (YiAi) + Vitest (YiVad/YiPet) 测试框架搭建 |
| YiVad 测试框架技术债 | [../leader/architecture/05-架构-技术债-YiVad缺少测试框架.md](../leader/architecture/05-架构-技术债-YiVad缺少测试框架.md) | YiVad 测试覆盖现状和改进路线 |

### 代码质量

| 资源 | 位置 | 描述 |
|------|------|------|
| 供应链加固 | [ship/02-交付-加固供应链.md](./ship/02-交付-加固供应链.md) | 依赖审计、锁文件验证、构建可重现性 |
| 季度技术债审查 | [ship/04-交付-季度技术债.md](./ship/04-交付-季度技术债.md) | 技术债识别、量化、优先级排序和偿还计划 |
| 技术债管理框架 | [../leader/roadmap/08-路线图-管理技术债.md](../leader/roadmap/08-路线图-管理技术债.md) | 技术债分类（代码/架构/依赖/知识）和偿还策略 |

### 生产质量

| 资源 | 位置 | 描述 |
|------|------|------|
| SLO/SLI 定义 | [../srer/observability/08-可观测-SLO与SLI定义.md](../srer/observability/08-可观测-SLO与SLI定义.md) | 服务等级目标和指标定义方法 |
| 错误预算策略 | [../srer/observability/12-可观测-错误预算策略.md](../srer/observability/12-可观测-错误预算策略.md) | 错误预算消耗与发布冻结的联动策略 |
| 性能测试指南 | [../srer/observability/13-可观测-性能测试指南.md](../srer/observability/13-可观测-性能测试指南.md) | 负载测试、压力测试、基准测试方法 |

---

## 数据工程

| 资源 | 位置 | 描述 |
|------|------|------|
| 数据迁移指南 | [ship/03-交付-数据迁移.md](./ship/03-交付-数据迁移.md) | 四阶段安全迁移：双写→回填→切换→清理 |
| 数据库备份恢复 | [../srer/observability/11-可观测-数据库备份恢复.md](../srer/observability/11-可观测-数据库备份恢复.md) | MongoDB 备份策略、恢复验证、RPO/RTO |
| MongoDB 模式设计 | [build/04-构建-MongoDB模式设计.md](./build/04-构建-MongoDB模式设计.md) | 文档模型设计：嵌入 vs 引用、索引策略、查询优化 |

### YrY 数据存储总览

| 存储 | 用途 | 关键约束 |
|------|------|----------|
| MongoDB | 主数据库：menus, sessions, bugs, static_files, knowledge_files, users | Motor 异步驱动，前端不直连 |
| Ollama 模型 | LLM 推理（本地 GPU） | 通过 Ollama API localhost:11434 |
| llama_index | RAG 向量索引 | `data/rag_store/`，混合检索（向量+BM25） |
| 文件系统 | 静态资源、YiKnowledge markdown | 通过 `/read-file`、`/write-file` 端点访问 |

---

## 可靠性工程

| 资源 | 位置 | 描述 |
|------|------|------|
| 退避重试模式 | [ship/05-交付-退避重试.md](./ship/05-交付-退避重试.md) | 指数退避、抖动、最大重试次数、幂等性保证 |
| 容量规划 | [ship/01-交付-容量规划.md](./ship/01-交付-容量规划.md) | 资源估算、扩缩容决策、性能基线 |
| CI/CD 流水线 | [ship/07-交付-CICD流水线.md](./ship/07-交付-CICD流水线.md) | 持续集成/部署流水线设计与实现 |

### 可靠性模式速查

| 模式 | 适用场景 | YiAi 实现 |
|------|----------|-----------|
| 重试+退避 | 网络瞬时故障、Ollama 临时不可用 | LLMProviderRouter fallback 链 |
| 心跳保活 | SSE 长连接防断 | OllamaRuntime 15s heartbeat |
| 超时保护 | Agent 多步工具调用防卡死 | 600s 硬超时 + classify_error() |
| 熔断降级 | 依赖服务持续失败 | DeepSeek→Ollama 自动回退 |

---

## 部署与发布

| 资源 | 位置 | 描述 |
|------|------|------|
| 部署指南 | [ship/08-交付-部署指南.md](./ship/08-交付-部署指南.md) | 三项目部署流程：YiAi (uvicorn)、YiVad (静态站点)、YiPet (Chrome Web Store) |
| 发布流程 | [../srer/release/04-发布-发布流程.md](../srer/release/04-发布-发布流程.md) | 标准发布协调流程 |
| 金丝雀发布 | [../srer/release/01-发布-金丝雀发布.md](../srer/release/01-发布-金丝雀发布.md) | 渐进式流量切换 |
| 热修复发布 | [../srer/release/02-发布-热修复发布.md](../srer/release/02-发布-热修复发布.md) | 紧急修复的加速发布通道 |
| 回滚演练 | [../srer/release/05-发布-回滚演练.md](../srer/release/05-发布-回滚演练.md) | 回滚方案设计和定期演练 |
| 发布冻结 | [../srer/release/03-发布-发布冻结.md](../srer/release/03-发布-发布冻结.md) | 冻结窗口的沟通、审批和例外流程 |
| 生产就绪审查 | [../srer/release/07-发布-生产就绪审查.md](../srer/release/07-发布-生产就绪审查.md) | 上线前检查清单 |

---

## 经验教训

### 按类别

| 类别 | 位置 | 描述 |
|------|------|------|
| 成功案例 (Wins) | [learn/lessons/wins/](./learn/lessons/wins/) | 可复用的成功模式 |
| 失败复盘 (Failures) | [learn/lessons/failures/](./learn/lessons/failures/) | 从失败中提取的教训 |
| 踩坑记录 (Gotchas) | [learn/lessons/gotchas/](./learn/lessons/gotchas/) | 已知陷阱和意外行为 |

### 典型经验条目

| 经验 | 类别 | 描述 |
|------|------|------|
| RPC 参数名不匹配 | gotcha | `filter`/`query`、`target_file`/`path` 不匹配导致静默失败 |
| SSE onDone 防护 | gotcha | SSE 流结束事件未正确 guard 导致重复处理 |
| macOS FSEvents 静默丢弃 | gotcha | 文件监视器在 macOS 下的事件丢失问题 |
| YiPet 跨项目桥接 | win | 通过 session key 实现 YiPet→YiVad 的安全跳转 |
| YiVad AICR 端口迁移 | failure | 代码审查功能从独立端口迁移到主流程的教训 |

### 项目特定文档

| 项目 | 位置 | 内容 |
|------|------|------|
| YiAi | [learn/projects/yiai/](./learn/projects/yiai/) | 架构设计、模块分析、Story 记录 |
| YiVad | [learn/projects/yivad/](./learn/projects/yivad/) | 架构设计、开发规范、功能模块、AICR 分析 |
| YiPet | [learn/projects/yipet/](./learn/projects/yipet/) | 架构设计、功能模式、Story 记录 |

---

## 团队协作

### 入职指南

| 资源 | 位置 | 适用对象 |
|------|------|----------|
| YiAi 后端入职 | [run/onboarding/01-入职-YiAi入职.md](./run/onboarding/01-入职-YiAi入职.md) | Python 后端开发者 |
| YiPet 扩展入职 | [run/onboarding/02-入职-YiPet入职.md](./run/onboarding/02-入职-YiPet入职.md) | Chrome 扩展开发者 |
| YiVad 前端入职 | [run/onboarding/03-入职-YiVad入职.md](./run/onboarding/03-入职-YiVad入职.md) | Vue 3 前端开发者 |

### 项目管理

| 资源 | 位置 | 描述 |
|------|------|------|
| 项目知识中心 | [../projects/README.md](../projects/README.md) | 4 个项目的 Bug/PRD/Dev/Test 产物总览 |
| 进度看板 | [../leader/roadmap/01-路线图-进度看板.md](../leader/roadmap/01-路线图-进度看板.md) | 路线图进度追踪仪表盘 |
| 协作领域索引 | [../curator/COLLABORATION.md](../curator/COLLABORATION.md) | 入职、会议、代码审查、知识分享、迭代流程 |

---

## 跨领域引用

- [SECURITY.md](./SECURITY.md) — 安全领域聚合索引：供应链安全、应用安全、风险管理
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — 团队流程与协作领域索引
- [./INDEX.md](./INDEX.md) — Engineer 角色完整索引（Build/Ship/Run/Learn 全部内容）
- [../aier/README.md](../aier/README.md) — AI 工程方法论（RAG、Agent、LLM 评估）
- [../leader/README.md](../leader/README.md) — 架构决策和技术选型

## 维护说明

- 新增工程相关文件时，在此索引中添加条目
- 每季度验证所有链接有效性
- 每个新项目启动后，在此索引中添加项目特定文档的链接
- 不在此文件中直接写工程内容——始终链接到角色目录中的源文件