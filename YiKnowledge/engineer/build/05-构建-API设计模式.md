---
title: "API Design Patterns for YrY"
aliases: [api-design, rest-patterns, error-response, pagination, naming]
tags: [api, design, patterns, rest, rpc, naming]
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
benefit: "Design consistent APIs across YrY — know when to use RPC vs REST, how to structure responses, and naming conventions"
acceptance_criteria:
  - "Decision tree: RPC envelope vs dedicated REST endpoint"
  - "Response format standards"
  - "Naming conventions for endpoints and parameters"
  - "Error response patterns"
related:
  - ./cross-project-rpc-protocol.md
  - ./implement-cross-project-rpc-call.md
---

# API 设计模式

> YrY 中有两种 API 风格共存：**RPC 信封**（动态路由，用于通用 CRUD）和 **专用 REST 端点**（固定路由，用于特定功能）。知道何时使用哪种风格是关键设计决策。

## RPC 信封 vs 专用 REST 端点

### 决策树

```
这个操作是通用 CRUD 吗？
  │
  是 → 使用 RPC 信封
  │     module_name: "services.database.data_service"
  │     适用：查询/创建/更新/删除任意集合的文档
  │
  否 → 这个操作有特定的业务逻辑吗？
        │
        是 → 创建专用 REST 端点
        │     适用：AI 聊天、文件操作、Agent 循环、RAG 检索
        │
        否 → 它是否适合现有的 Service？
              │
              是 → 扩展现有 Service 的 RPC 方法
              否 → 评估是否需要新的 Service 模块
```

### 对比

| 维度 | RPC 信封 (`POST /`) | 专用 REST 端点 |
|------|---------------------|---------------|
| 路由方式 | `module_name` + `method_name` | URL 路径 + HTTP 方法 |
| 适用场景 | 通用 CRUD、数据查询 | 特定业务逻辑、流式响应 |
| 参数位置 | `parameters` 字典 | 请求体 / 查询参数 / 路径参数 |
| 优势 | 无需新增端点、前后端调用统一 | 语义清晰、可独立文档化 |
| 劣势 | 参数名无编译期检查 | 每个功能需要独立端点 |
| YrY 示例 | `data_service.query_documents` | `POST /agent/chat`、`GET /read-file` |

## 响应格式标准

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": <payload>
}
```

`data` 的类型因操作而异：

| 操作类型 | data 形状 |
|---------|----------|
| 查询列表 | `{ "list": [...], "total": 123, "pageNum": 1, "pageSize": 20 }` |
| 查询单条 | `{ ...document }` |
| 创建 | `{ "insertedId": "..." }` |
| 更新 | `{ "modifiedCount": 1 }` |
| 删除 | `{ "deletedCount": 1 }` |
| 文件读取 | `{ "content": "...", "path": "..." }` |

### 分页响应

统一使用 `list + total + pageNum + pageSize` 四字段模式：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [ { "id": 1, "name": "..." }, { "id": 2, "name": "..." } ],
    "total": 42,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

**不使用** `items`、`results`、`data` 等替代字段名。

### 错误响应

```json
{
  "code": 1002,
  "message": "资源不存在: projects/xyz",
  "data": null
}
```

- `code`：使用 `ErrorCode` 枚举中的标准错误码
- `message`：人类可读的描述，包含足够的上下文（如操作失败的资源标识）
- `data`：始终为 `null`

## 端点命名约定

### URL 路径

```
/名词（复数）          → 集合操作
/名词/{id}             → 单个资源
/动词-名词             → 动作端点（非 CRUD）
/domain/action         → 领域操作
```

| 端点 | 风格 | 说明 |
|------|------|------|
| `POST /` | RPC 信封 | 通用数据操作 |
| `/files/upload` | 资源动作 | 文件上传 |
| `/read-file` | 动作端点 | 文件读取（非 CRUD） |
| `/agent/chat` | 领域操作 | Agent 聊天 |
| `/auth/login` | 领域操作 | 用户登录 |
| `/health` | 基础设施 | 健康检查 |

### HTTP 方法使用

| 方法 | 适用场景 | YrY 示例 |
|------|---------|---------|
| `GET` | 只读查询、健康检查 | `GET /health`, `GET /read-file?target_file=...` |
| `POST` | 创建资源、RPC 调用、流式响应 | `POST /`, `POST /agent/chat` |
| `PUT` | 完整更新资源 | `PUT /files/rename` |
| `DELETE` | 删除资源 | `DELETE /delete-file?target_file=...` |

**原则**：`GET` 用于无副作用操作，`POST` 用于有副作用和流式操作。不使用 `PATCH`。

## 参数命名约定

### 查询参数（GET 请求）

```
?target_file=path/to/file.md
?session_key=abc123
?page=1&size=20
```

全部使用 snake_case，不使用 camelCase。

### 请求体参数（POST 请求）

```json
// RPC 信封
{ "module_name": "...", "method_name": "...", "parameters": { ... } }

// 专用端点
{ "message": "...", "session_key": "abc123" }
```

### 路径参数

不使用路径参数——YrY 所有端点使用查询参数或请求体传参。这避免了 URL 编码问题和路由冲突。

## 流式响应（SSE）

用于 AI 聊天和 RAG 聊天等长耗时操作：

```
POST /agent/chat
Content-Type: application/json
→ Response: text/event-stream
  data: {"type": "token", "content": "..."}
  data: {"type": "done"}
```

SSE 流的响应不遵循 `{code, message, data}` 信封格式，而是直接流式输出事件。

## 批量操作

YrY 目前不支持批量操作（一次请求操作多条记录）。如果需要批量操作：

```python
# 后端：通过循环调用单条操作的 repository 方法
for item in parameters.get("items", []):
    await repository.create_document(cname, item)

# 返回成功/失败计数
{ "code": 0, "data": { "successCount": 10, "failureCount": 0 } }
```

## API 版本管理

YrY 不进行 API 版本管理（无 `/v1/`、`/v2/` 前缀）。因为：
- 前后端由同一团队维护，可以同步变更
- 没有外部 API 消费者
- RPC 信封天然支持方法级演进（新增 method_name 不破坏旧方法）

如果未来需要版本管理，建议在 RPC 信封中添加 `version` 字段：
```json
{ "module_name": "...", "method_name": "...", "version": "v2", "parameters": {...} }
```

## 反模式

| 反模式 | 正确做法 |
|---|---|
| 为简单 CRUD 创建专用端点 | 复用 RPC 信封 + `data_service` |
| 响应中嵌套多层错误码 | 统一使用 `{code, message, data}` 顶层信封 |
| GET 请求中携带敏感数据 | 敏感数据放请求体（POST），不暴露在 URL |
| 使用自定义分页字段名 | 统一使用 `list/total/pageNum/pageSize` |
| SSE 流响应格式不一致 | 统一使用 `{"type": "...", "content/error/message": "..."}` |