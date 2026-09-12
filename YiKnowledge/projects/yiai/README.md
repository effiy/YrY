---
title: YiAi 知识库索引
tags: [yiai, index, specs, workflows, bugs, requirements]
category: projects/yiai
created: 2026-08-25
updated: 2026-09-10
source: YiAi
type: index
status: active
---

# YiAi 项目知识库

> FastAPI 后端的完整知识体系 — 架构规范、实现模式、开发指南、工作流、需求、缺陷。为 YiVad 和 YiPet 提供 AI 聊天、RAG 检索、数据持久化、文件管理、RSS 聚合、企业微信消息、Agent 循环等服务。

## 目录结构

```
YiKnowledge/projects/yiai/
├── README.md                  # 本文件 — 总索引
├── specs/                     # 架构规范 + 实现模式 + AI 代码生成规范
│   ├── overview.md            # 架构概览（技术栈、分层、数据流、设计原则、反模式）
│   ├── directory-structure.md # 完整目录结构（启动流程、模块通信、文件大小指南）
│   ├── api.md                 # API 规范（RPC 协议、SSE 流式、参数契约、中间件、错误处理）
│   ├── auth.md                # 权限认证（JWT、bcrypt、中间件、Agent 安全）
│   ├── database.md            # 数据库设计（MongoDB 集合、Schema、Repository 模式）
│   ├── core-modules.md        # 核心模块（入口、Agent 循环、RAG 引擎、数据层）
│   ├── domain-service.md      # Domain Service 分层（Domain + Service + Repository）
│   ├── domain-service-implementation.md # Domain Service 实现详解
│   ├── repository.md          # Repository 模式（MongoDB Motor、查询构建器）
│   ├── architecture.md        # 架构规范
│   ├── module-structure.md    # 模块结构规范
│   ├── api-conventions.md     # API 约定
│   ├── api-reference.md       # API 参考（16 个路由模块、RPC 方法列表）
│   ├── auth-conventions.md    # 认证约定
│   ├── data-model.md          # 数据模型（MongoDB 集合、Schema 定义）
│   ├── database-conventions.md # 数据库约定
│   ├── rpc-protocol.md        # RPC 协议规范（请求/响应格式、错误码、参数契约）
│   └── index.md               # 规范索引
├── workflows/                 # 开发指南 + 工作流
│   ├── quickstart.md          # 快速开始（环境搭建、架构概览、调试技巧、部署）
│   ├── coding-standards.md    # 编码规范（异步编程、依赖注入、异常处理、日志）
│   ├── build-deploy.md        # 构建部署（uvicorn、Gunicorn、Docker、CI/CD）
│   ├── dependencies.md        # 依赖清单（核心框架、AI/ML、数据库、工具、测试）
│   ├── branching.md           # 分支管理策略（环境映射、发布流程、hotfix）
│   ├── deploy.md              # 部署流程
│   ├── adding-domain-module.md # 添加领域模块流程
│   ├── cross-project-development.md # 跨项目开发流程
│   ├── prd-to-proposal.md     # PRD → Proposal 结构化提炼
│   ├── standards.md           # OpenSpec 工作流规范（子代理、质量门禁、项目约束）
│   ├── state.md               # 变更状态管理（生命周期、检查清单、异常处理）
│   └── land.md                # 变更落地流程（回写、验证、确认、提交）
├── requirements/              # 需求（按月归档）
│   ├── 2026-07/               # 7 月需求（混合检索、知识库监听器）
│   ├── 2026-08/               # 8 月需求（Agent、多提供商 LLM、测试、审计日志、GraphQL）
│   └── 2026-09/               # 9 月需求（稳定性修复、Multi-Provider LLM、Agent 增强）
└── bugs/                      # 缺陷（按分类归档）
    ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
    ├── template/              # 缺陷模板
    ├── api/                   # API 通信类
    ├── auth/                  # 认证安全类
    ├── config/                # 配置管理类
    ├── data/                  # 数据层类
    ├── execution/             # 模块执行类
    ├── knowledge/             # 知识库类
    ├── llm/                   # LLM 推理类
    ├── mcp/                   # MCP 协议类
    ├── middleware/             # 中间件类
    ├── rag/                   # RAG 引擎类
    ├── search/                # 搜索类
    ├── sse/                   # SSE 流式类
    ├── state/                 # 状态存储类
    └── wework/                # 企业微信类
```

## 快速导航

### 新人入门

1. [快速开始](./workflows/操作指南/01-快速开始.md) — 环境搭建、安装启动
2. [架构概览](./specs/架构设计/01-架构概览.md) — 技术栈、分层架构、数据流、请求生命周期
3. [目录结构](./specs/架构设计/03-目录结构.md) — 完整源码目录树
4. [编码规范](./workflows/开发规范/01-编码规范.md) — 模块分层、命名、异步编程、自约束

### 日常开发

| 场景 | 参考文档 |
|------|----------|
| 新增 API 端点 | [API 规范](./specs/开发规范/03-API设计.md) |
| 新增领域模块 | [Domain Service 模式](./specs/功能模式/01-领域服务模式.md) + [编码规范](./workflows/开发规范/01-编码规范.md) |
| 新增 MongoDB 集合 | [数据库设计](./specs/开发规范/07-数据库设计.md) + [Repository 模式](./specs/功能模式/03-Repository模式.md) |
| 修改 RAG 检索 | [核心模块 #RAG 引擎](./specs/架构设计/04-核心模块.md) |
| 添加认证逻辑 | [权限认证](./specs/开发规范/05-权限认证.md) |
| 调用 LLM | [核心模块 #AI 聊天](./specs/架构设计/04-核心模块.md) |
| 配置定时任务 | [核心模块 #知识监视器](./specs/架构设计/04-核心模块.md) |
| 处理异步操作 | [编码规范 #异步编程](./workflows/开发规范/01-编码规范.md) |
| 添加依赖注入 | [编码规范 #依赖注入](./workflows/开发规范/01-编码规范.md) |
| 处理 SSE 流式响应 | [API 规范 #SSE 流式](./specs/开发规范/03-API设计.md) |
| 添加 RPC 方法 | [API 规范 #RPC 方法参考](./specs/开发规范/03-API设计.md) |
| 配置多提供商 LLM | [核心模块 #LLM 提供商](./specs/架构设计/04-核心模块.md) |

### 代码审查

| 检查项 | 参考 |
|--------|------|
| 是否通过 services 层而非直接访问 data/ | [编码规范 #模块分层](./workflows/开发规范/01-编码规范.md) |
| 参数名是否使用 `filter` 而非 `query` | [API 规范 #关键参数约定](./specs/开发规范/03-API设计.md) |
| 是否使用 `StandardResponse` 统一信封 | [API 规范 #RPC 协议](./specs/开发规范/03-API设计.md) |
| RPC 信封格式是否正确 | [API 规范 #RPC 协议](./specs/开发规范/03-API设计.md) |
| 是否遵循 `snake_case` 命名 | [编码规范](./workflows/开发规范/01-编码规范.md) |
| Domain 层是否导入 `server/` | [编码规范 #自约束](./workflows/开发规范/01-编码规范.md) |
| 错误处理是否使用 `ErrorCode + BusinessException` | [架构概览 #错误处理](./specs/架构设计/01-架构概览.md) |
| 是否使用 `async/await` 而非同步代码 | [编码规范 #异步编程](./workflows/开发规范/01-编码规范.md) |
| MongoDB 查询是否有分页限制 | [数据库设计](./specs/开发规范/07-数据库设计.md) |
| 新增端点是否有 JWT 认证中间件 | [权限认证](./specs/开发规范/05-权限认证.md) |
| Cursor 是否使用 `try/finally` 或 `async with` 关闭 | [编码规范 #异步编程](./workflows/开发规范/01-编码规范.md) |
| 安全配置是否从环境变量读取（非硬编码默认值） | [权限认证](./specs/开发规范/05-权限认证.md) |
| SSE 流中异常是否正确传播 | [API 规范 #SSE 流式](./specs/开发规范/03-API设计.md) |
| Service 层是否有实际业务逻辑（非纯 re-export） | [Domain Service 模式](./specs/功能模式/01-领域服务模式.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理](./workflows/流程规范/01-分支管理规范.md) |
| 需求转提案 | [PRD → Proposal](./workflows/流程规范/04-PRD到Proposal流程.md) |
| OpenSpec 变更 | [OpenSpec 规范](./workflows/开发规范/02-OpenSpec工作流规范.md) |
| 变更状态推进 | [状态管理](./workflows/流程规范/03-变更状态管理规范.md) |
| 代码收口落地 | [落地流程](./workflows/流程规范/02-变更落地工作流.md) |
| 发布上线 | [构建部署](./workflows/流程规范/05-构建部署.md) + [分支管理](./workflows/流程规范/01-分支管理规范.md) |
| 部署流程 | [部署流程](./workflows/流程规范/06-部署规范.md) |

## 关键约束速查

### 必须遵守

- 使用 **StandardResponse** 统一响应信封 `{code, message, data}`
- 使用 **ErrorCode 枚举 + BusinessException** 处理业务错误
- 参数名使用 **`filter`**（非 `query`）、**`target_file`**（非 `path`）、**`cname`**（非 `collection_name`）
- 文件持久化使用**双写策略**：磁盘（主）+ MongoDB（备份）
- SSE 流式响应使用 **`text/event-stream`**，增量 `data:` 帧
- Python 代码使用 **snake_case** 命名
- 所有异步操作使用 **async/await**，不混用同步/异步
- Service 层通过**依赖注入**获取 Repository
- API 路由使用 **APIRouter + include_router** 注册
- 所有外部 I/O 调用使用 **`asyncio.timeout`** 包装
- **Cursor 操作**使用 `try/finally` 或 `async with` 确保连接释放
- **安全配置**（JWT Secret、Auth Token）MUST 通过环境变量覆盖默认值

### 禁止

- 不在 routes 中直接调用 `data/` 层（必须通过 `services/`）
- 不在 domain 层导入 `server/`
- 不混用同步和异步代码
- 不推测性地向 `MongoDB` 单例添加方法（仅在调用者需要时添加）
- 不在 `__init__.py` 之外暴露内部实现
- 不绕过 RPC 信封协议直接暴露 REST 端点
- 不添加未要求的功能
- 不在 Service 层做纯 re-export（必须包含实际业务逻辑）
- 不静默吞没异常（异常必须分类处理，传播或降级）
- 不硬编码配置值（必须从 config 读取）

## 技术栈速查

| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI | >= 0.140.0 | Web 框架（ASGI，自动 OpenAPI 文档） |
| Python | 3.10+ | 运行时（全局优先 async/await） |
| uvicorn | >= 0.51.0 | ASGI 服务器（开发热重载，生产多 worker） |
| MongoDB | Motor async | 数据库（异步驱动，连接池 pool_size=10） |
| Ollama | >= 0.6.2 | LLM 推理（自托管，多模型支持） |
| llama_index | >= 0.13.0 | RAG 框架（混合检索：向量 + BM25） |
| pydantic | >= 2.13.4 | 数据验证 + 配置管理（pydantic-settings） |
| bcrypt + PyJWT | >= 5.0 / 2.13 | 密码哈希 + JWT Token 认证 |
| tenacity | >= 9.1.4 | 瞬态故障自动重试（网络、MongoDB、Ollama） |
| apscheduler | — | 定时任务调度（Knowledge Watcher、RSS） |
| pytest | >= 8.0.0 | 测试框架（pytest-asyncio + httpx + pytest-cov） |
| ruff | — | 代码检查 + 格式化（替代 flake8 + isort） |
| mypy | — | 类型检查 |

## 相关资源

### 项目级文档
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — YiAi 项目 CLAUDE.md（模块边界、近期变更、自约束）
- [YiAi/docs/specs/](../../../YiAi/docs/specs/) — YiAi 架构规范（AI 代码生成用）
- [YiAi/docs/workflows/](../../../YiAi/docs/workflows/) — YiAi 任务工作流
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级 CLAUDE.md（RPC 协议、跨项目关系）

### 知识库层
- [YiKnowledge/INDEX.md](../../INDEX.md) — 知识库顶层导航索引
- [YiKnowledge/README.md](../../README.md) — 知识库流水线概览与角色决策树
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册与命名约定
- [YiKnowledge/projects/INDEX.md](../INDEX.md) — 项目知识中心完整文件清单
- [YiKnowledge/projects/README.md](../README.md) — 项目知识中心总览与导航入口

### 相关角色目录
- [YiKnowledge/engineer/README.md](../../engineer/README.md) — 工程实现层（架构模式、开发实践、质量安全）
- [YiKnowledge/engineer/learn/lessons/](../../engineer/learn/lessons/) — 经验教训（成功/失败/陷阱/缺陷）
- [YiKnowledge/aier/README.md](../../aier/README.md) — AI 赋能层（RAG 模式、Agent 架构、LLM 评估）
- [YiKnowledge/aier/platform/](../../aier/platform/) — AI 平台选型（向量数据库、Embedding 模型）
- [YiKnowledge/srer/observability/](../../srer/observability/) — 可观测性（监控、SLO、仪表盘）

### 跨项目参考
- [YiVad 知识库](../yivad/README.md) — YiVad 前端知识库（跨项目参考）
- [YiPet 知识库](../yipet/README.md) — YiPet 扩展知识库（跨项目参考）