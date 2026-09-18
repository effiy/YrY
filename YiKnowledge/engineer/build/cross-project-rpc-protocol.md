---
title: "Cross-Project RPC Protocol Specification"
aliases: [rpc-protocol, rpc-spec, cross-project-rpc, rpc-envelope]
tags: [rpc, protocol, contract, cross-project, api, build]
category: engineer/build
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Single source of truth for all cross-project RPC communication — prevent parameter-name bugs that cause silent failures"
acceptance_criteria:
  - "Complete envelope format specification"
  - "All parameter name contracts documented"
  - "Known bug patterns with root causes"
  - "Error code reference"
related:
  - ./implement-cross-project-rpc-call.md
  - ./implement-sse-streaming.md
  - ../learn/lessons/gotchas/02-陷阱-RPC参数名不匹配.md
  - ../../INDEX.md
---

# 跨项目 RPC 协议规范

> **这是 YrY 所有跨项目通信的唯一事实来源。** 任何前端（YiVad/YiPet）到后端（YiAi）的调用必须遵循此协议。参数名不匹配是 YrY 最常见的 Bug 模式——后端会静默忽略未知参数。

## 协议概览

```
YiVad (Vue SPA) ──┐
                   ├── POST / → YiAi (FastAPI :10086) → MongoDB
YiPet (Chrome Ext)─┘
```

所有跨项目调用使用单一 HTTP 端点 `POST /`，通过 JSON body 中的 `module_name` 和 `method_name` 进行路由分发。

## 请求格式

```json
POST / HTTP/1.1
Content-Type: application/json

{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
```

### module_name 规范

Python 模块路径，相对于 `YiAi/src/`：

| 模块路径 | 对应文件 | 职责 |
|---------|---------|------|
| `services.database.data_service` | `src/services/database/data_service.py` | 通用 CRUD（query/create/update/delete） |
| `services.database.session_service` | `src/services/database/session_service.py` | 聊天会话管理 |
| `services.ai.chat_service` | `src/services/ai/chat_service.py` | AI 聊天（SSE 流式） |
| `services.knowledge.knowledge_service` | `src/services/knowledge/knowledge_service.py` | 知识库扫描/读取/写入 |
| `services.rag.rag_service` | `src/services/rag/rag_service.py` | RAG 检索/聊天 |
| `services.rss.feed_service` | `src/services/rss/feed_service.py` | RSS 订阅管理 |
| `services.execution.executor` | `src/services/execution/executor.py` | 通用模块执行 |

### method_name 规范

模块中的可调用对象名（函数或方法）。必须是模块 `__init__.py` 中导出的公开 API。

## 响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": <any>
}
```

### 业务错误响应

```json
{
  "code": <ErrorCode>,
  "message": "<description>",
  "data": null
}
```

### HTTP 层错误（非 RPC 信封）

```json
{
  "detail": "<error message>"
}
```

HTTP 422 通常表示请求体格式错误（如缺少 `module_name`），HTTP 500 表示未捕获的服务器异常。

## 标准错误码

| 错误码 | 含义 | 触发场景 |
|--------|------|---------|
| `0` | 成功 | 所有正常响应 |
| `1001` | 参数验证失败 | 缺少必填字段、类型不匹配、参数名错误 |
| `1002` | 资源不存在 | 查询/更新/删除不存在的文档 |
| `1003` | 资源已存在 | 创建重复文档 |
| `2001` | AI 服务不可用 | Ollama 连接失败、模型未加载 |
| `2002` | AI 推理超时 | LLM 调用超过配置的时间限制 |
| `3001` | 文件读写失败 | 磁盘 I/O 错误、路径无效 |
| `3002` | 文件不存在 | 读取不存在的文件 |
| `4001` | 认证失败 | Token 无效或过期 |
| `4002` | 权限不足 | 无权限访问资源 |
| `5001` | 数据库错误 | MongoDB 连接失败或操作异常 |
| `9999` | 未知内部错误 | 未分类的服务器异常 |

## 参数名称契约

> **这是 YrY 最重要的代码契约。** 以下参数名必须精确匹配——任何偏差都会导致后端静默忽略参数，不会报错。

### data_service 参数

| 方法 | 参数 | 正确名称 | 错误名称（禁止使用） |
|------|------|---------|-------------------|
| `query_documents` | 集合名称 | `cname` | `collection_name`, `collection`, `table` |
| `query_documents` | 过滤条件 | `filter` | `query`, `where`, `condition`, `match` |
| `query_documents` | 页码 | `pageNum` | `page`, `page_num`, `offset` |
| `query_documents` | 每页条数 | `pageSize` | `limit`, `size`, `per_page` |
| `query_documents` | 排序字段 | `sortField` | `sort`, `orderBy`, `sort_by` |
| `query_documents` | 排序方向 | `sortOrder` | `order`, `direction` |
| `query_documents` | 投影字段 | `projection` | `fields`, `select`, `include` |
| `create_document` | 集合名称 | `cname` | （同上） |
| `create_document` | 文档数据 | `document` | `data`, `body`, `payload`, `doc` |
| `update_document` | 集合名称 | `cname` | （同上） |
| `update_document` | 过滤条件 | `filter` | （同上） |
| `update_document` | 更新操作 | `update` | `set`, `data`, `changes`, `patch` |
| `delete_document` | 集合名称 | `cname` | （同上） |
| `delete_document` | 过滤条件 | `filter` | （同上） |

### 文件操作参数

| 端点 | 参数 | 正确名称 | 错误名称 |
|------|------|---------|---------|
| `/read-file` | 文件路径 | `target_file` | `path`, `file`, `file_path`, `filename` |
| `/write-file` | 文件路径 | `target_file` | （同上） |
| `/write-file` | 文件内容 | `content` | `data`, `body`, `text` |
| `/write-file` | Base64 标记 | `is_base64` | `base64`, `encoding`, `encoded` |

### session_service 参数

| 方法 | 参数 | 正确名称 | 错误名称 |
|------|------|---------|---------|
| `query_sessions` | 过滤条件 | `filter` | `query`, `where` |
| `create_session` | 会话标识 | `key` | `id`, `session_id`, `sessionKey` |

## 已知 Bug 模式

以下是从真实事故中总结的参数名不匹配 Bug 模式：

### 模式 1：前端用 `query`，后端期望 `filter`

**症状**：`query_documents` 返回全量数据，过滤条件不生效。

**根因**：后端 `_build_filter()` 从 `parameters.filter` 读取过滤条件。前端传了 `query` 参数，后端从 `parameters` 中找不到 `filter` 键，返回空过滤条件 → 查询返回所有文档。

**影响**：YiVad 和 YiPet 中所有使用 `data_service.query_documents` 的列表页面。

**检测**：检查请求 payload 中是否出现 `"query"` 字符串。

### 模式 2：前端用 `path`，后端期望 `target_file`

**症状**：文件读写返回 HTTP 422 或 `FILE_NOT_FOUND`。

**根因**：`/read-file` 和 `/write-file` 端点的 Pydantic 模型定义了 `target_file` 字段。传入 `path` 会触发 FastAPI 422 验证错误。

**影响**：所有文件读写操作。

### 模式 3：用 `collection_name` 代替 `cname`

**症状**：RPC 返回 `PARAM_VALIDATION_FAILED (1001)`。

**根因**：`data_service` 从 `parameters.cname` 读取集合名称。传入 `collection_name` 导致找不到集合名称参数。

---

## data_service 完整 API

### query_documents — 分页查询

```json
// 请求
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": {
    "cname": "projects",
    "filter": { "status": "active" },
    "pageNum": 1,
    "pageSize": 20,
    "sortField": "created_at",
    "sortOrder": "desc",
    "projection": { "name": 1, "status": 1 }
  }
}

// 响应
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [ { "_id": "...", "name": "...", "status": "active" } ],
    "total": 42,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

**filter 支持的 MongoDB 操作符**：`$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin`, `$exists`, `$regex`, `$text`

### create_document — 创建文档

```json
{
  "module_name": "services.database.data_service",
  "method_name": "create_document",
  "parameters": {
    "cname": "projects",
    "document": { "name": "New Project", "status": "active" }
  }
}
```

### update_document — 更新文档

```json
{
  "module_name": "services.database.data_service",
  "method_name": "update_document",
  "parameters": {
    "cname": "projects",
    "filter": { "_id": "64f1a2b3c4d5e6f7a8b9c0d1" },
    "update": { "$set": { "status": "archived" } }
  }
}
```

**update 支持的操作符**：`$set`, `$unset`, `$inc`, `$push`, `$pull`, `$addToSet`

### delete_document — 删除文档

```json
{
  "module_name": "services.database.data_service",
  "method_name": "delete_document",
  "parameters": {
    "cname": "projects",
    "filter": { "_id": "64f1a2b3c4d5e6f7a8b9c0d1" }
  }
}
```

## SSE 流式端点

AI 聊天使用 SSE（Server-Sent Events），不走 RPC 信封：

```
POST /agent/chat
Content-Type: application/json

{ "message": "你好", "session_key": "abc123" }

→ text/event-stream
  data: {"type": "token", "content": "你"}
  data: {"type": "token", "content": "好"}
  data: {"type": "done"}
```

详细 SSE 实现指南见 [implement-sse-streaming.md](./implement-sse-streaming.md)。

## 前端调用模式

### YiVad (RequestHttp)

```typescript
// src/api/modules/dataService.ts
import http from '@/api';

export const queryDocuments = (params: {
  cname: string;
  filter?: Record<string, unknown>;
  pageNum?: number;
  pageSize?: number;
}) => http.post<ApiResponse<PaginatedData>>('', {
  module_name: 'services.database.data_service',
  method_name: 'query_documents',
  parameters: params,
});
```

### YiPet (ApiClient)

```typescript
// src/api/endpoints/data.ts
import { apiClient } from '../client';

export const queryDocuments = (params: QueryParams) =>
  apiClient.post<ApiResponse<PaginatedData>>('/', {
    module_name: 'services.database.data_service',
    method_name: 'query_documents',
    parameters: params,
  });
```

## 添加新 RPC 方法的检查清单

- [ ] 后端 `services/<domain>/<service>.py` 中实现方法
- [ ] 方法在 `__init__.py` 中导出
- [ ] 参数名与此规范中已有命名保持一致
- [ ] YiVad `src/api/modules/` 中添加调用函数
- [ ] YiPet `src/api/endpoints/` 中添加调用函数
- [ ] 两端参数名交叉验证（前后端一一比对）
- [ ] 手动测试（curl 或 Postman）验证端到端流程

## 反模式

| 反模式 | 为什么失败 | 正确做法 |
|---|---|---|
| 前端绕过 RPC 直调后端原始端点 | 绕过统一错误处理和认证 | 所有跨项目调用走 `POST /` + RPC 信封 |
| 在 Python/TypeScript 各自定义参数名 | 名称不一致导致静默 Bug | 以本文档为唯一事实来源 |
| RPC 响应中嵌套业务错误码 | 前端需要解析两层错误 | 统一使用 `{ code, message, data }` 信封 |
| 不验证参数就调用 | 无效参数导致难以排查的静默失败 | 调用前对照本文档验证参数名 |