---
title: API 架构与规范
tags: [yipet, api, rpc, sse, apiclient, fetch, retry, error-handling]
category: projects/yipet/workflows
created: 2026-09-07
updated: 2026-09-15
source: YiPet
type: architecture
roles: [engineer]
benefit: "ApiClient 四层封装、RPC 协议、SSE 流式解析、9个领域 Service、关键参数契约"
status: active
---

# API 架构与规范

> YiPet 4-Tier API 架构：ApiClient → Endpoints → Types → Services。涵盖 RPC 协议、SSE 流式解析、错误处理与重试、请求取消、参数契约。所有 HTTP 通信的单一入口。

**相关文档**：[Chat Store](../功能模式/01-模式-ChatStore状态管理.md) · [RPC 协议](../../../../CLAUDE.md#rpc-协议详细规范) · [错误处理](../开发规范/11-规范-错误处理模式.md)

## 一、四层架构

```
Layer 1: ApiClient（src/api/client.ts）
  ├── fetch 封装 + 请求/响应拦截
  ├── Token 注入（X-Token Header）
  ├── RPC 信封自动组装 { module_name, method_name, parameters }
  ├── SSE 流式解析（text/event-stream）
  ├── 错误处理 + 超时控制（AbortController）
  └── 响应解包（YiAi Envelope → ApiResponse）

Layer 2: Endpoints（src/api/endpoints.ts）
  ├── EXECUTION.ROOT → "/"（RPC 分发器）
  ├── AUTH, FILES, STATE, WEWORK, KNOWLEDGE, RAG → 各域端点路径

Layer 3: Types（src/api/types.ts）
  ├── RpcRequest, QueryResult<T>, MutationResult
  ├── ChatParams, StreamChunk, CRUD 参数类型
  └── 40+ 请求/响应接口

Layer 4: Services（src/api/services/）
  ├── ChatService, SessionService, DatabaseService
  ├── KnowledgeService, RagService, BugService
  ├── AuthService, WeWorkService, BridgeService
  └── createApiServices() 工厂函数（9 个服务）
```

**分层规则**：Services → Client（构造注入），Store/Component → Services（导入）。Types 零依赖，Client 不导入 Services。**禁止直接 fetch。**

## 二、ApiClient 核心

### RPC 调用模式

```typescript
// 所有 API 调用通过 rpc() 方法，自动组装信封 + 解包响应
const res = await apiClient.rpc<QueryResult>(
  "services.database.data_service", "query_documents",
  { cname: "bugs", filter: { status: "open" }, pageNum: 1, pageSize: 20 }
);
if (!res.ok) { /* res.error 包含错误消息 */ }
```

### 响应模型（ApiResponse，不抛异常）

| 字段 | 类型 | 说明 |
|------|------|------|
| `ok` | `boolean` | `true` = 成功 |
| `status` | `number` | HTTP 状态码（0 = 网络错误） |
| `data` | `T` | 业务数据 |
| `error?` | `string` | 错误消息（ok=false 时） |

### 重试策略

**仅重试网络错误**（fetch 抛出），不重试 HTTP 4xx/5xx。线性退避 `baseMs * (attempt + 1)`，默认不启用（需 `config.retry` 配置）。

| 错误场景 | 重试 | 理由 |
|----------|:---:|------|
| 网络错误（fetch 抛出） | ✓ | 临时网络波动 |
| HTTP 4xx/5xx | ✗ | 重试无效 |
| 业务错误（code ≠ 0） | ✗ | 业务逻辑错误 |
| 请求超时 | ✗ | 直接返回错误 |
| AbortError（用户取消） | ✗ | 用户主动取消 |

## 三、SSE 流式解析

流式超时 600s（10min），每读超时 30s。解析 `data:` 帧，处理 `[DONE]` 结束标记。保留 AbortError 身份供调用方区分用户取消 vs 真实错误。

```typescript
// 调用方消费模式
const stream = api.client.stream('/rag-chat', body, signal);
for await (const chunk of stream) {
  if (chunk.done) { if (chunk.error) handleError(chunk.error); break; }
  appendToken(chunk.data);
}
```

## 四、Service 层模式

```typescript
// 构造注入 ApiClient，模块名常量，返回 ApiResponse<T>
class DatabaseService {
  constructor(private client: ApiClient) {}
  async query(p): Promise<ApiResponse<QueryResult>> { return this.client.rpc(); }
}
// 工厂 createApiServices 聚合 9 个服务
```

**复用优先**：大多数 CRUD 直接复用 `DatabaseService`。跨项目会话桥接使用 `BridgeService`（一次性 token，替代 URL 参数传递 sessionKey）。

## 五、关键参数契约

| 正确 | 错误 | 上下文 |
|------|------|--------|
| `filter` | `query` | `data_service.query_documents` |
| `target_file` | `path` | `/read-file`, `/write-file` |
| `cname` | `collection_name` | `data_service` 集合名称 |
| `module_name` | `moduleName` | RPC 信封（snake_case） |
| `method_name` | `methodName` | RPC 信封（snake_case） |

> 这些不匹配曾导致真实 Bug — 后端静默忽略 `query`，对 `path` 返回 422。

## 六、跨项目 RPC 协议

| 操作 | RPC 路径 | 关键约束 |
|------|----------|----------|
| 通用 CRUD | `services.database.data_service` | `filter`(非`query`), `cname`(非`collection_name`) |
| 聊天 SSE | `services.ai.chat_service.chat` | `stream: true` 时返回 SSE |
| RAG 查询 | `services.rag.rag_service.query` | `question`, `scope?`, `category?` |
| 知识文件读写 | `/knowledge/read`, `/knowledge/write` | `target_file`(非`path`) |

## 七、请求取消与超时

- 普通请求超时 30s（`AbortController` + `setTimeout`）
- 流式请求超时 600s，每读超时 30s
- Chat Store 中每个流式请求独立 `AbortController`，`stopSending()` 时 abort
- 组件卸载时必须取消进行中的请求

## 八、错误处理

所有错误通过 `ApiResponse<T>` 统一表示，ApiClient 不抛异常：

| 错误来源 | status | 处理 |
|----------|--------|------|
| 网络错误 | `0` | Base client 线性退避重试（如配置） |
| 请求超时 | `0` | 不重试，直接返回 |
| HTTP 4xx/5xx | 实际状态码 | 不重试 |
| 业务错误（code≠0） | HTTP 200 | `unwrapEnvelope` 提取 message |
| 用户取消 | — | AbortError 向上传播，调用方静默 |

## 九、反模式

| 反模式 | 正确做法 | 原因 |
|--------|----------|------|
| 组件中直接 fetch | 通过 ApiClient → Service | 失去 Token 注入和错误处理 |
| 参数名用 `query` | 用 `filter` | 后端静默忽略 |
| 驼峰 RPC 字段 | snake_case | RPC 分发器解析失败 |
| 不处理 SSE 中断 | AbortSignal + onUnmounted 清理 | 资源泄漏 |
| 硬编码 API 地址 | `RSBUILD_API_BASE` 环境变量 | 不可配置 |
| 吞没 AbortError | 检查 `e.name === 'AbortError'` | 用户取消被误报为错误 |

## 十、约束

**必须遵守：**
- 所有 API 调用通过 ApiClient，不直接 fetch
- RPC 信封 `{ module_name, method_name, parameters }`（snake_case）
- 参数名 `filter`（非 `query`）、`target_file`（非 `path`）
- SSE 流式请求独立 AbortController，组件销毁时取消
- 请求超时：普通 30s，流式 600s，每读 30s

**禁止：**
- 不绕过 ApiClient 直接调用 fetch
- 不在 Service 层之外组装 RPC 信封
- 不硬编码 API 地址和端点路径
- 不忽略 SSE 请求的取消清理