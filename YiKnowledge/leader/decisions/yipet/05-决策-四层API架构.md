---
title: "ADR: YiPet Four-Tier API Layer Design"
tags: [adr, yipet, api, architecture, client, services]
category: leader/decisions/yipet
created: 2026-08-24
updated: 2026-09-10
source: internal
type: decision
status: accepted
lifecycle: implemented
review_cycle: quarterly
roles: [leader, engineer]
benefit: "理解四层 API 架构的设计——为什么 4 层而非 1 层，以及构造函数注入 ApiClient 如何实现可测试性和一致性"
related:
  - ../../../engineer/learn/projects/yipet/README.md
  - ../../../engineer/learn/projects/yipet/01-项目-架构设计.md
---

# ADR: YiPet 四层 API 架构设计

> **状态**：已接受 (2026-07-27) — 已实施

## 上下文

YiPet 需要一个 HTTP API 层与 YiAi FastAPI 后端通信。初始原型中使用了散布在组件和 content scripts 中的内联 `fetch` 调用。随着扩展功能增长（聊天、会话、认证、知识库、RAG、数据库操作），内联方式变得不可维护：
- 重复的错误处理逻辑
- 不一致的 RPC 信封构造（`{module_name, method_name, parameters}`）
- 无共享的类型定义——参数名称到处被手动编写

**问题的严重性**：YiPet 与 YiVad 共享相同的 RPC 信封协议和参数名称契约（`filter` 而非 `query`、`target_file` 而非 `path`）。参数名称不匹配的 bug 曾导致后端静默失败——这是跨项目协作中最常见的 bug 模式。

## 决策

**实现四层 API 架构：`client → endpoints → types → services`，通过构造函数注入 `ApiClient`。**

### 架构

```
src/api/
├── client.ts          # 第 1 层：ApiClient — 封装 fetch + 重试 + SSE 流式传输
├── endpoints.ts       # 第 2 层：按域划分的路径常量
├── types.ts           # 第 3 层：请求/响应接口
├── index.ts           # Barrel 导出
└── services/          # 第 4 层：领域服务类
    ├── auth.ts        #   AuthService — 登录、登出、刷新、用户信息
    ├── chat.ts        #   ChatService — 提示词 + SSE 流式传输
    ├── config.ts      #   ConfigService — 应用配置 CRUD
    ├── database.ts    #   DatabaseService — 通用集合 CRUD
    ├── faq.ts         #   FaqService — 常见问题管理 + 批量排序
    ├── sessions.ts    #   SessionService — CRUD、搜索、收藏、导出/导入
    ├── knowledge.ts   #   KnowledgeService — 扫描、读取、写入
    ├── rag.ts         #   RagService — RAG 查询 + 聊天 (SSE)
    └── index.ts       #   createApiServices() 聚合器
```

### 各层职责

| 层 | 文件 | 职责 | 不负责 |
|---|---|---|---|
| 1 — Client | `client.ts` | `ApiClient` 类封装 `fetch`，提供重试、超时、错误提取、开发模式日志和 SSE 流式传输。其他层禁止直接调用 `fetch` | 不做业务逻辑 |
| 2 — Endpoints | `endpoints.ts` | 按域划分的路径常量（`/auth/login`、`/sessions`、`/chat`、`/rag/query`...）。URL 路径的唯一数据源 | 不做请求 |
| 3 — Types | `types.ts` | 请求/响应接口（`LoginRequest`、`RpcRequest`、`QueryParams`、`ChatParams`、`SessionRecord`...）。Services 和调用者从此层导入类型 | 不做运行时逻辑 |
| 4 — Services | `services/*.ts` | 领域服务类。每个类通过构造函数注入接收 `ApiClient`。`createApiServices(config)` 聚合所有服务 | 不做 HTTP 调用（委托给 Client）|

### 关键设计决策

1. **构造函数注入 `ApiClient`**：Services 不创建自己的 HTTP 客户端——它们接收已配置好的客户端。这使得测试时可替换为 mock 客户端，并确保所有服务使用一致的错误处理策略。

2. **`ApiClient` 包装 CDN 加载的工具类**：实际的 `fetch` 包装器 (`api-client.ts`) 位于 `public/cdn/utils/`，通过 CDN 目录加载。`src/api/client.ts` 在此之上添加开发日志和 SSE 流式传输支持。

3. **`createApiServices()` 聚合器**：单一的工厂函数使用共享的 `ApiClient` 配置创建所有服务。调用者导入一个函数，而非手动连接每个服务。

4. **RPC 信封集中管理**：`{module_name, method_name, parameters}` 结构在 `ApiClient` 中构造，而非在各个 Service 中。确保信封在所有调用间一致。如果 RPC 协议进化（如添加 `version` 字段），只需修改一处。

## 后果

### 正面影响
- 跨项目一致性：YiVad 使用相同模式（`RequestHttp` → API 模块 → Service）
- 类型化的请求/响应契约在编译时捕获参数名称不匹配
- 构造函数注入使测试成为可能（只需 mock `ApiClient`）

### 负面影响
- 对单后端的 Chrome 扩展而言是过度工程——4 层架构处理的工作本可以用 1 个文件完成
- 为简单调用增加了间接层次（一次 `fetch` 调用现在经过 4 层）

### 风险
- CDN 加载的 `api-client.ts` 是运行时依赖——如果 CDN 目录加载失败，所有 API 调用将失败

## 替代方案

1. **组件中的内联 `fetch` 调用** — 拒绝。理由：重复的错误处理、无类型安全、RPC 信封构造散落各处。随着服务增多，维护成本指数增长
2. **单一的 `api.ts` 文件包含所有函数** — 拒绝。理由：随着服务增长会变成一个"上帝模块"；四层设计分离了关注点——路径更换只改第 2 层，类型变更只改第 3 层
3. **从 YiAi 的 OpenAPI 规范生成类型** — 拒绝。理由：YiAi 不暴露 OpenAPI；手动类型目前是务实的选择（未来可考虑 FastAPI 自动生成 OpenAPI spec 后再评估）

## 适用场景

- 前端/扩展项目设计 API 通信层时的架构参考
- 理解构造函数注入如何实现 API 层的可测试性
- 评估 API 层复杂度与项目规模的匹配度

## 反模式

- **为无关场景引入相同的架构复杂度。** YiPet 的 4 层 API 架构对当前的扩展规模是过度设计的。如果只有 2-3 个 API 端点，一个文件就足够了。仅在服务数量超过你的记忆容量时引入分层才值得
- **Services 自己处理 HTTP 调用。** Service 类不应知道 HTTP 的存在——它们只知道"调用一个方法然后得到结果"。HTTP 细节（重试、超时、认证头）属于第 1 层 Client。违反此规则意味着更换通信协议（如 HTTP → WebSocket）需要修改所有 Service，而非仅修改 Client