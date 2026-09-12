---
title: YiAi Routes Module Analysis
key: 90210215-409c-4a76-b866-e14058d18207
tags:
- routes
- api
- architecture
- modules
- endpoints
category: engineer/learn/projects/yiai/stories
created: '2026-07-26'
updated: 2026-09-10
source: internal
type: story
status: testing
project: YiAi
story_name: yiai-routes-module-analysis
---

# YiAi 路由模块分析

对 YiAi 的 10 个路由模块（覆盖 52 个 API 端点）进行全面分析。

## 路由三层分类

路由按职责和依赖方向组织为三个层级：

### 第一层：核心层（元数据与监控）

| 路由 | 端点 | 用途 |
|---|---|---|
| `/about` | `GET /about` | 服务基本信息（名称、版本、依赖服务状态） |
| `/health` | `GET /health` | 健康检查（MongoDB 连接、Ollama 可用性） |

**特征**：无状态、无外部依赖（除检查目标本身）、最先响应

### 第二层：实体 CRUD 层（领域资源）

| 路由 | 端点 | 操作 |
|---|---|---|
| `/auth/*` | `POST /auth/login`, `POST /auth/register`, `POST /auth/refresh` | 认证全生命周期 |
| `/users/*` | `GET/POST/PUT/DELETE /users/*` | 用户 CRUD |
| `/system/*` | `GET /system/info` | 系统配置信息 |
| `/state/*` | `GET/POST /state/*` | 键值状态存储 |
| `/files/*` | `GET/POST/PUT/DELETE` + `/read-file` + `/write-file` | 文件全生命周期 |

**特征**：标准 CRUD 操作、Pydantic 模型验证、MongoDB 持久化

### 第三层：集成层（外部服务边界）

| 路由 | 端点 | 用途 |
|---|---|---|
| `/execution/*` | `POST /execution/run` | 执行任意 Python 模块 |
| `/wework/*` | `POST /wework/send` | 企业微信消息发送 |
| `/maintenance/*` | `POST /maintenance/*` | 数据维护操作（清理、重建索引） |
| `/mcp/*` | `POST /mcp/*` | MCP 协议（Model Context Protocol） |

**特征**：与外部系统交互、错误处理复杂、可能需要重试逻辑

### RPC 分发器（所有跨项目调用的入口）

`POST /` 根路由处理器是 YiAi 最核心的设计——它不定义固定的端点，而是通过 `{module_name, method_name, parameters}` 动态路由到对应的 Service 方法。这使得前端只需一个 POST 端点即可完成所有数据操作。

## 统一响应信封

所有 52 个端点返回相同的 JSON 格式：

```json
// 成功
{ "code": 0, "message": "ok", "data": <any> }

// 业务错误
{ "code": <ErrorCode>, "message": "<描述>", "data": null }

// HTTP 层错误
{ "detail": "<错误信息>" }
```

## 端点统计

| 层级 | 路由模块数 | 端点数 | 典型操作 |
|---|---|---|---|
| 核心层 | 2 | 2 | 元数据查询、健康检查 |
| 实体 CRUD 层 | 5 | 25 | 标准 CRUD + 批量操作 |
| 集成层 | 4 | 12 | 外部服务调用 |
| RPC 分发器 | 1 | 1 | 通用 RPC 入口 |
| AI/Agent | 3 | 8 | 流式聊天、RAG 检索 |
| 仪表盘/知识 | 3 | 14 | 仪表盘数据、知识库管理 |
| **总计** | **18** | **约 62** | — |