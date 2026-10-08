---
title: YiAi 知识库索引
tags: [yiai, index, workflows, bugs, requirements]
category: projects/yiai
created: 2026-08-25
updated: 2026-10-07
source: YiAi
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, leader]
benefit: "YiAi 后端知识库的总索引，涵盖架构、开发、需求、缺陷和 OKR 追溯"
benefit: "YiAi FastAPI 后端的完整知识体系索引——新人入门、日常开发、代码审查、约束速查"
---

# YiAi 项目知识库

> FastAPI 后端的完整知识体系 — 架构规范、实现模式、开发指南、工作流、需求、缺陷。为 YiVad 和 YiPet 提供 AI 聊天、RAG 检索、数据持久化、文件管理、RSS 聚合、企业微信消息、Agent 循环等服务。

## 目录结构

```
YiKnowledge/projects/yiai/
├── README.md                  # 本文件 — 总索引
├── okrs/                      # OKR 目标与关键结果（按季度归档）
│   └── 2026-Q3/               # Q3: 稳定性修复 + LLM 统一架构 + Agent 增强 + Q4 前瞻规划
├── prds/                      # 产品需求 PRD（按月归档）
│   ├── 模板/
│   └── {month}/               # 2026-07/08/09
├── devs/                      # 开发方案（按月归档）
│   ├── 模板/
│   └── {month}/               # 2026-07/08/09
├── tests/                     # 测试用例（按月归档）
├── bugs/                      # 缺陷报告（按分类子目录归档）
│   ├── README.md              # 缺陷索引 + 分类目录 + 常见模式 + 排查流程
│   └── {分类}/                # 代码质量/数据/接口/认证/配置/RAG/SSE/MCP 等
└── workflows/                 # 开发指南 + 工作流
    ├── README.md              # 工作流索引
    ├── 架构设计/              # 架构概览、目录结构、核心模块、模块结构、跨项目总结、数据流全景、ADR代码审计 (7 个文件)
    ├── 开发规范/              # 编码规范、API 规范、认证规范、数据库规范、RPC 协议、性能优化、代码维护、翻译API、测试覆盖 (9 个文件)
    ├── 操作指南/              # 快速开始、添加领域模块、跨项目开发、Agent 工具开发、RAG 调试、SSE 调试、测试策略、速查卡 (8 个文件)
    ├── 流程规范/              # 分支管理、OpenSpec 变更、构建部署、OpenSpec 工作流、跨项目PRD索引、审计报告、综合总结 (7 个文件)
    └── 设计模式/              # 领域服务模式、Repository 模式 (2 个文件)
```

## 快速导航

### 迭代状态
- [2026-09 迭代状态报告](./STATUS-2026-09.md) — 235 需求矩阵、完成进度、优先级分布、下一步行动

### 新人入门

1. [快速开始](./workflows/操作指南/001-指南-快速开始.md) — 环境搭建、安装启动
2. [架构概览](./workflows/架构设计/001-架构-架构概览.md) — 技术栈、分层架构、数据流、请求生命周期
3. [目录结构](./workflows/架构设计/002-架构-目录结构.md) — 完整源码目录树
4. [编码规范](./workflows/开发规范/001-规范-编码规范.md) — 模块分层、命名、异步编程、自约束
5. [速查卡](./workflows/操作指南/000-速查卡-YiAi开发速查.md) — 常用命令和模式速查

### 日常开发

| 场景 | 参考文档 |
|------|----------|
| 新增 API 端点 | [API 规范](./workflows/开发规范/002-规范-API规范.md) |
| 新增领域模块 | [领域服务模式](./workflows/设计模式/001-模式-领域服务模式.md) + [添加领域模块](./workflows/操作指南/002-指南-添加领域模块.md) |
| 新增 MongoDB 集合 | [数据库规范](./workflows/开发规范/004-规范-数据库规范.md) + [Repository 模式](./workflows/设计模式/002-模式-Repository模式.md) |
| 修改 RAG 检索 | [核心模块 #RAG 引擎](./workflows/架构设计/003-架构-核心模块.md) + [RAG 管道调试](./workflows/操作指南/005-指南-RAG管道调试.md) |
| 添加认证逻辑 | [认证规范](./workflows/开发规范/003-规范-认证规范.md) |
| 调用 LLM | [核心模块 #AI 聊天](./workflows/架构设计/003-架构-核心模块.md) |
| 配置定时任务 | [核心模块 #知识库监视器](./workflows/架构设计/003-架构-核心模块.md) |
| 处理异步操作 | [编码规范 #异步优先](./workflows/开发规范/001-规范-编码规范.md) |
| 处理 SSE 流式响应 | [API 规范 #SSE 流式](./workflows/开发规范/002-规范-API规范.md) + [SSE 流式调试](./workflows/操作指南/006-指南-SSE流式调试.md) |
| 添加 RPC 方法 | [RPC 协议规范](./workflows/开发规范/005-规范-RPC协议规范.md) + [API 规范](./workflows/开发规范/002-规范-API规范.md) |
| 性能优化 | [性能优化](./workflows/开发规范/006-规范-性能优化.md) |
| 编写测试 | [测试策略](./workflows/操作指南/007-指南-测试策略.md) |
| 开发 Agent 工具 | [Agent 工具开发](./workflows/操作指南/004-指南-Agent工具开发.md) |
| 跨项目开发 | [跨项目开发工作流](./workflows/操作指南/003-指南-跨项目开发工作流.md) |

### 代码审查

| 检查项 | 参考 |
|--------|------|
| 是否通过 services 层而非直接访问 data/ | [编码规范 #分层导入规则](./workflows/开发规范/001-规范-编码规范.md) |
| 参数名是否使用 `filter` 而非 `query` | [RPC 协议规范 #参数名称契约](./workflows/开发规范/005-规范-RPC协议规范.md) |
| 是否使用 `StandardResponse` 统一信封 | [API 规范 #RPC 协议](./workflows/开发规范/002-规范-API规范.md) |
| RPC 信封格式是否正确 | [RPC 协议规范](./workflows/开发规范/005-规范-RPC协议规范.md) |
| 是否遵循 `snake_case` 命名 | [编码规范 #命名约定](./workflows/开发规范/001-规范-编码规范.md) |
| Domain 层是否导入 `server/` | [编码规范 #分层导入规则](./workflows/开发规范/001-规范-编码规范.md) |
| 错误处理是否使用 `ErrorCode + BusinessException` | [架构概览 #错误处理](./workflows/架构设计/001-架构-架构概览.md) |
| 是否使用 `async/await` 而非同步代码 | [编码规范 #异步优先](./workflows/开发规范/001-规范-编码规范.md) |
| MongoDB 查询是否有分页限制 | [数据库规范](./workflows/开发规范/004-规范-数据库规范.md) |
| 新增端点是否有 JWT 认证中间件 | [认证规范](./workflows/开发规范/003-规范-认证规范.md) |
| Cursor 是否使用 `try/finally` 或 `async with` 关闭 | [编码规范 #异步编程](./workflows/开发规范/001-规范-编码规范.md) |
| 安全配置是否从环境变量读取 | [认证规范](./workflows/开发规范/003-规范-认证规范.md) |
| SSE 流中异常是否正确传播 | [API 规范 #SSE 流式](./workflows/开发规范/002-规范-API规范.md) |
| Service 层是否有实际业务逻辑 | [领域服务模式](./workflows/设计模式/001-模式-领域服务模式.md) |
| 是否使用 `asyncio.timeout` 包装外部 I/O | [编码规范 #异步编程](./workflows/开发规范/001-规范-编码规范.md) |
| 性能关键路径是否有缓存 | [性能优化](./workflows/开发规范/006-规范-性能优化.md) |

### 流程操作

| 操作 | 参考 |
|------|------|
| 创建新分支 | [分支管理](./workflows/流程规范/001-流程-分支管理规范.md) |
| OpenSpec 变更 | [OpenSpec 变更管理](./workflows/流程规范/002-流程-OpenSpec变更管理.md) |
| 变更状态推进 | [OpenSpec 工作流规范](./workflows/流程规范/004-流程-OpenSpec工作流规范.md) |
| 发布上线 | [构建部署](./workflows/流程规范/003-流程-构建部署.md) + [分支管理](./workflows/流程规范/001-流程-分支管理规范.md) |

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
- **安全配置**（JWT Secret、Auth Token）必须通过环境变量覆盖默认值

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
| MongoDB | Motor async | 数据库（异步驱动，连接池 pool_size=10, max_pool_size=50） |
| Ollama | >= 0.6.2 | LLM 推理（自托管，多模型支持） |
| llama_index | >= 0.13.0 | RAG 框架（混合检索：向量 + BM25） |
| pydantic | >= 2.13.4 | 数据验证 + 配置管理（pydantic-settings） |
| bcrypt + PyJWT | >= 5.0 / 2.13 | 密码哈希 + JWT Token 认证 |
| tenacity | >= 9.1.4 | 瞬态故障自动重试（网络、MongoDB、Ollama） |
| apscheduler | — | 定时任务调度（Knowledge Watcher、RSS） |
| pytest | >= 8.0.0 | 测试框架（pytest-asyncio + httpx + pytest-cov） |
| ruff | — | 代码检查 + 格式化 |
| orjson | — | 高性能 JSON 序列化（SSE 帧 + ORJSONResponse） |
| httpx | — | 异步 HTTP 客户端（Ollama 连接池复用） |

## 相关资源

### 项目级文档
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — YiAi 项目 CLAUDE.md（模块边界、近期变更、自约束）
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
- [YiKnowledge/sre/observability/](../../sre/observability/) — 可观测性（监控、SLO、仪表盘）
- [YiKnowledge/leader/decisions/](../../leader/decisions/) — 架构决策记录

### 跨项目参考
- [YiVad 知识库](../yivad/README.md) — YiVad 前端知识库
- [YiPet 知识库](../yipet/README.md) — YiPet 扩展知识库