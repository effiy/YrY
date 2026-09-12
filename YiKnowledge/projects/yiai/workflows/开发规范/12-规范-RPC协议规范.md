---
title: RPC 协议规范
tags: [yiai, rpc, protocol, api, contract, cross-project, sse, error-codes]
category: projects/yiai/specs
created: 2026-09-08
updated: 2026-09-10
source: YiAi
type: spec
status: active
---

# RPC 协议规范

> YiAi 后端与 YiVad/YiPet 前端之间的唯一跨项目通信协议。本规范是三等项目中所有 API 调用的权威参考。

## 一、协议定位

RPC 信封协议是 YrY 单体仓库中 YiAi（后端）与 YiVad/YiPet（前端）之间所有数据交互的唯一协议。前端不能直接访问 MongoDB——所有数据操作必须通过本协议。

**设计原则：**
- **单一端点**：所有调用都通过 `POST /`，由 `module_name` + `method_name` 动态路由
- **统一响应**：所有响应使用 `{ code, message, data }` 格式
- **动态发现**：`module_name` 自动映射到 Python 模块路径，无需手动注册路由
- **类型约定**：参数名称是跨项目契约，变更视为破坏性变更

## 二、请求格式

```
POST /  Content-Type: application/json
Authorization: Bearer <token>（可选，默认禁用认证）

{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `module_name` | string | 是 | Python 模块路径，格式 `services.<domain>.<service>` |
| `method_name` | string | 是 | 模块中可调用的方法名（snake_case） |
| `parameters` | object | 是 | 方法参数，形状因方法而异 |

### module_name 解析规则

```
module_name: "services.database.data_service"
                    ↓
Python 路径: src/services/database/data_service.py
                    ↓
查找 method_name: "query_documents"
                    ↓
调用: data_service.query_documents(**parameters)
```

**支持的模块路径前缀：**
- `services.<domain>.<service>` → `src/services/<domain>/<service>.py`
- `domain.<module>` → `src/domain/<module>/core.py`
- 其他路径需要显式注册（见 `src/server/routes/root.py`）

### 请求校验

后端在调用方法前进行以下校验：

| 校验项 | 失败响应 |
|--------|----------|
| `module_name` 存在 | `{ code: 1001, message: "模块不存在: ..." }` |
| `method_name` 是模块中的可调用对象 | `{ code: 1001, message: "方法不存在: ..." }` |
| `parameters` 是 dict 类型 | `{ code: 1001, message: "参数必须是 JSON 对象" }` |
| 方法签名匹配（通过 `inspect` 检查） | `{ code: 1001, message: "参数验证失败: ..." }` |

## 三、响应格式

### 成功响应

```json
{
  "code": 0,
  "message": "ok",
  "data": <any>
}
```

`data` 字段的内容由具体方法定义。常见形状：
- 列表查询：`{ "list": [...], "total": 25, "page": 1, "page_size": 20 }`
- 单条查询：`{ "detail": { ... } }`
- 创建操作：`{ "inserted_id": "...", "document": { ... } }`
- 更新操作：`{ "modified_count": 1 }`
- 删除操作：`{ "deleted_count": 3 }`

### 业务错误响应

```json
{
  "code": 1002,
  "message": "资源不存在: projects/invalid-key",
  "data": null
}
```

### HTTP 层错误（非 RPC 信封）

当请求在到达 RPC 路由之前失败时，返回 FastAPI 原生错误格式：

```json
{
  "detail": "Method Not Allowed"
}
```

常见 HTTP 层错误：
- `422 Unprocessable Entity` — 请求体 JSON 格式错误或字段类型不匹配
- `405 Method Not Allowed` — 使用了 GET 而非 POST
- `500 Internal Server Error` — Python 模块加载异常

## 四、标准错误码

### 通用错误（1xxx）

| 错误码 | 枚举名 | 含义 | 示例 message |
|--------|--------|------|-------------|
| `0` | `SUCCESS` | 成功 | `"ok"` |
| `1001` | `PARAM_VALIDATION_FAILED` | 参数校验失败 | `"缺少必填字段: cname"` |
| `1002` | `RESOURCE_NOT_FOUND` | 资源不存在 | `"资源不存在: projects/key-123"` |
| `1003` | `RESOURCE_ALREADY_EXISTS` | 资源已存在 | `"名称已存在: 测试项目"` |
| `1004` | `PARAM_TYPE_MISMATCH` | 参数类型错误 | `"page 必须是整数"` |

### AI 服务错误（2xxx）

| 错误码 | 枚举名 | 含义 | 触发场景 |
|--------|--------|------|----------|
| `2001` | `AI_UNAVAILABLE` | AI 服务不可用 | Ollama 未启动、连接失败 |
| `2002` | `AI_TIMEOUT` | AI 推理超时 | LLM 调用超过 `ai.timeout_seconds` |
| `2003` | `AI_MODEL_NOT_FOUND` | 模型不存在 | 请求的模型未在 Ollama 中拉取 |
| `2004` | `AI_STREAM_ABORTED` | 流式中断 | 客户端断开 SSE 连接 |

### 文件操作错误（3xxx）

| 错误码 | 枚举名 | 含义 |
|--------|--------|------|
| `3001` | `FILE_IO_ERROR` | 文件读写失败 |
| `3002` | `FILE_NOT_FOUND` | 文件不存在 |
| `3003` | `FILE_PATH_TRAVERSAL` | 路径遍历攻击（`../` 等） |

### 认证错误（4xxx）

| 错误码 | 枚举名 | 含义 |
|--------|--------|------|
| `4001` | `AUTH_FAILED` | Token 无效或过期 |
| `4002` | `FORBIDDEN` | 无权限访问资源 |
| `4003` | `TOKEN_EXPIRED` | Token 已过期 |

### 系统错误（5xxx / 9xxx）

| 错误码 | 枚举名 | 含义 |
|--------|--------|------|
| `5001` | `DATABASE_ERROR` | MongoDB 连接失败或操作异常 |
| `5002` | `DATABASE_TIMEOUT` | 数据库操作超时 |
| `9999` | `INTERNAL_ERROR` | 未分类的服务器内部异常 |

## 五、服务方法完整契约

### data_service（`services.database.data_service`）

最常用的通用数据服务。所有 CRUD 操作通过此服务完成。

| 方法 | 参数（必填标记 `*`） | 返回 |
|------|---------------------|------|
| `query_documents` | `cname*`, `filter?`, `page?`, `page_size?`, `sort?`, `fields?`, `exclude_fields?` | `{ list, total, page, page_size }` |
| `get_document_detail` | `cname*`, `key*` | `{ detail }` |
| `count_documents` | `cname*`, `filter?`, `group_by?` | `{ count }` 或 `{ groups: [...] }` |
| `create_document` | `cname*`, `document*` | `{ inserted_id, document }` |
| `update_document` | `cname*`, `key*`, `update*` | `{ modified_count }` |
| `upsert_document` | `cname*`, `key*`, `document*` | `{ upserted_id }` |
| `delete_document` | `cname*`, `keys*` | `{ deleted_count }` |

**分页参数规范：**

| 参数 | 类型 | 默认 | 范围 |
|------|------|------|------|
| `page` | int | 1 | >= 1 |
| `page_size` | int | 20 | 1-100 |

**排序参数规范：**
```json
{
  "sort": {
    "field": "created_at",
    "order": "desc"
  }
}
```

### chat_service（`services.ai.chat_service`）

| 方法 | 参数 | 返回类型 | 说明 |
|------|------|----------|------|
| `chat` | `model*`, `messages*`, `stream?`, `system?`, `images?`, `temperature?`, `max_tokens?` | SSE 流 或 JSON | `stream: true` 时返回 SSE |

### knowledge_service（`services.knowledge.knowledge_service`）

> 注：`scan`、`read`、`write` 为 REST 端点（`/knowledge/scan`、`/knowledge/read`、`/knowledge/write`），不通过 RPC 信封。

| 方法 | 参数 | 返回 |
|------|------|------|
| `write_entry_markdown` | `target_file*`, `frontmatter*`, `body*` | `{ path }` |
| `delete_entry_markdown` | `target_file*` | `{ deleted }` |
| `entry_exists` | `target_file*` | `{ exists }` |
| `list_bugs` | `filter?` | `{ list }` |
| `read_bug` | `target_file*` | `{ content }` |

### rag_service（`services.rag.rag_service`）

| 方法 | 参数 | 返回 |
|------|------|------|
| `query` | `question*`, `scope?`, `category?`, `top_k?` | `{ answer, sources, confidence? }` |
| `status` | — | `{ index_count, last_built, is_building }` |
| `rebuild` | — | `{ status, estimated_seconds }` |

---

## 六、跨项目参数名契约（强制）

以下参数名曾因不匹配导致真实 bug。任何修改必须同步更新所有三个项目。

| 正确 | 错误 | 上下文 | Bug 现象 |
|------|------|--------|----------|
| `filter` | `query` | `data_service.query_documents` | 后端静默忽略 `query`，返回全部数据，前端筛选不生效 |
| `cname` | `collection_name` | `data_service` 集合参数 | 参数名不匹配，使用默认集合 |
| `target_file` | `path` | `/knowledge/read`、`/knowledge/write` | 后端返回 422 Validation Error |
| `page` | `pageNum` | 所有分页查询 | 参数不匹配，使用默认 page=1 |
| `page_size` | `pageSize` | 所有分页查询 | 参数不匹配，使用默认 page_size=20 |
| `key` | `id` / `_id` | 更新/删除操作 | 查找失败，返回 1002 |
| `document` | `data` | 创建操作 | 参数不匹配，创建空文档 |

### 为什么会发生静默忽略？

RPC 路由使用 Python 的 `**kwargs` 接收参数：

```python
async def query_documents(cname: str, filter: dict | None = None, **kwargs):
    # kwargs 中的 'query' 被接收但不使用 → 静默忽略
    ...
```

无法识别的参数名只是不被使用，**不会触发错误**。这导致前端以为传了 `query`，后端却用了 `filter=None`（等于没有筛选条件）。

### 契约强制措施

- 前端：`grep -rn '"query"' src/api/` 必须返回空
- 后端：代码审查中检查新增参数是否遵循契约
- CI：可添加参数名校验脚本（推荐）

## 七、SSE 流式响应协议

### 通用 SSE 格式

聊天和 Agent 端点返回 `Content-Type: text/event-stream`：

```
data: {"data": {"message": "你"}}\n\n
data: {"data": {"message": "好"}}\n\n
data: {"done": true}\n\n
```

### Agent 端点扩展事件

```
# 需要用户确认工具调用
data: {"type": "confirmation_required", "confirmation_id": "abc123", "tool_call": {"name": "write_file", "arguments": {}}}\n\n

# 工具开始执行
data: {"type": "tool_execution_start", "tool_name": "read_file", "arguments": {"path": "..."}}\n\n

# 工具执行完毕
data: {"type": "tool_execution_end", "tool_name": "read_file", "content": "file contents...", "error": null}\n\n

# 模型切换
data: {"type": "model_switch", "from": "qwen3.5:4b", "to": "qwen3.5:14b"}\n\n

# Agent 循环结束
data: {"type": "agent_end", "stop_reason": "completed", "total_turns": 5, "total_tokens": 1234}\n\n
```

### stop_reason 枚举

| 值 | 含义 |
|------|------|
| `completed` | Agent 正常完成任务 |
| `max_turns_reached` | 达到最大回合数限制 |
| `error` | 执行过程中发生异常 |
| `user_aborted` | 用户中止 |

### SSE 错误处理

SSE 流中的错误通过 `data:` 帧传递（不断开连接）：

```
data: {"error": "模型响应超时", "code": 2002}\n\n
```

仅在不可恢复时断开 SSE 连接（HTTP 状态码非 200）。

## 八、协议兼容性

### 向后兼容规则

| 变更类型 | 兼容性 | 操作要求 |
|----------|--------|----------|
| 新增可选参数 | ✓ 向后兼容 | 后端支持默认值，前端按需传递 |
| 新增必填参数 | ✗ 破坏性变更 | 需要同步更新所有消费端 |
| 新增响应字段 | ✓ 向后兼容 | 前端忽略未知字段 |
| 删除响应字段 | ✗ 破坏性变更 | 前端可能依赖该字段 |
| 参数重命名 | ✗ 破坏性变更 | 旧名称不再被识别 |
| 错误码变更 | ✗ 破坏性变更 | 前端依赖具体错误码做分支处理 |
| 新增 `module_name` 或 `method_name` | ✓ 向后兼容 | 新增的路由不影响已有调用 |

### 破坏性变更流程

1. 在 proposal 中标记为 breaking change
2. 先更新后端（支持新旧两种参数名过渡期）
3. 更新 YiVad 消费端
4. 更新 YiPet 消费端
5. 全部消费端更新后，后端移除旧参数名支持
6. 更新本规范文档

## 九、请求示例

### 标准查询

```bash
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {
      "cname": "projects",
      "filter": {"status": "active"},
      "page": 1,
      "page_size": 20,
      "sort": {"field": "created_at", "order": "desc"}
    }
  }'
```

### SSE 流式聊天

```bash
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -d '{
    "module_name": "services.ai.chat_service",
    "method_name": "chat",
    "parameters": {
      "model": "qwen3.5:4b",
      "messages": [{"role": "user", "content": "你好"}],
      "stream": true
    }
  }'
```

### 带认证的请求

```bash
curl -X POST http://localhost:10086/ \
  -H "Content-Type: application/json" \
  -H "X-Token: eyJhbGciOiJIUzI1NiIs..." \
  -d '{...}'
```

## 十、常见问题排查

### 问题 1：前端调用成功但筛选不生效

**原因**：参数名使用了 `query` 而非 `filter`

**排查**：浏览器 DevTools → Network → Payload → 检查参数名

**修复**：将 `query` 改为 `filter`

### 问题 2：422 Unprocessable Entity

**原因**：请求体 JSON 字段名不匹配后端 Pydantic 模型

**排查**：检查 `parameters` 对象的键名是否与契约一致

### 问题 3：1001 "方法不存在"

**原因**：`method_name` 拼写错误或 `module_name` 路径错误

**排查**：
```bash
curl http://localhost:10086/about  # 查看已加载的服务列表
```

### 问题 4：SSE 流中断但无错误信息

**原因**：Nginx/代理超时设置过短

**修复**：Nginx 配置 `proxy_read_timeout 300s;`