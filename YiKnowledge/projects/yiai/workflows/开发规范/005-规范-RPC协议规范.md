---
title: RPC 协议规范
tags: [yiai, rpc, protocol, cross-project]
category: projects/yiai/workflows
created: 2026-09-08
updated: 2026-09-20
source: internal
type: spec
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "跨项目 RPC 通信协议权威参考——YiAi/YiVad/YiPet 三方契约，与 execution.py 实际实现一致"
---

# RPC 协议规范

> 本规范是 YiAi（后端）与 YiVad/YiPet（前端）之间所有数据交互的唯一协议。前端禁止直接访问 MongoDB。实现代码在 `server/routes/execution.py` + `domain/execution/executor.py`。

## 一、协议定义

```
POST /  Content-Type: application/json
{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { ... }
}
```

**设计原则**：单一端点（`POST /`）、统一响应（`{code, message, data}`）、动态路由（`importlib.import_module` → `getattr`）。同时支持 `POST /batch` 并发调用。

## 二、请求/响应格式

```json
// 请求 — POST /
{
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": {
    "cname": "projects",
    "filter": {"status": "active"},
    "pageNum": 1,
    "pageSize": 20
  }
}

// 成功
{
  "code": 0,
  "message": "ok",
  "data": {
    "list": [...],
    "total": 100,
    "pageNum": 1,
    "pageSize": 20,
    "totalPages": 5
  }
}

// 错误
{ "code": 1004, "message": "Resource Not Found", "data": null }

// Batch 请求 — POST /batch
{
  "calls": [
    {"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {...}},
    {"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {...}}
  ]
}
// Batch 响应
{ "code": 0, "message": "ok", "data": { "results": [
    {"code": 0, "message": "ok", "data": {...}},
    {"code": 0, "message": "ok", "data": {...}}
]}}
```

## 三、RPC 分发器实现（execution.py + executor.py）

```python
# server/routes/execution.py — 实际代码（简化）
class ExecuteRequest(BaseModel):
    module_name: str
    method_name: str
    parameters: dict[str, Any] = {}

@router.post("/")
async def execute_module_via_post(request: ExecuteRequest):
    result = await execute_module(request.module_name, request.method_name, request.parameters)
    # 自动检测异步生成器 → StreamingResponse(text/event-stream)
    # 自动检测同步生成器 → StreamingResponse(text/event-stream)
    # 普通返回值 → success(data=result)
    return success(data=result)

# domain/execution/executor.py — 实际分发
# 1. importlib.import_module(module_name) → module
# 2. getattr(module, method_name) → func
# 3. func(**parameters) | func(parameters) → result
# 4. _FUNC_CACHE 字典缓存已解析的函数引用，消除重复 importlib 开销
```

**关键**：支持异步生成器 → 自动切换为 SSE 流式响应。`POST /batch` 并发执行多个 RPC 调用，单个失败不影响其他。

## 四、关键参数名契约

| 正确 | 错误 | 上下文 | 影响 |
|------|------|--------|------|
| `filter` | `query` | data_service 查询过滤 | **后端静默忽略 `query`**，返回全部数据 |
| `cname` 或 `collection_name` | — | data_service 集合参数 | 两者均支持 |
| `target_file` | `path` | `/read-file`, `/write-file` | 后端返回 422 |
| `module_name` | `moduleName` | RPC 信封 | 分发器无法解析 |
| `method_name` | `methodName` | RPC 信封 | 分发器无法解析 |

**最重要的**：`filter` ≠ `query`。使用 `query` 会被后端静默忽略，查询返回全量数据。这是最隐蔽的跨项目 bug。

## 五、已注册服务（实际模块）

| module_name | 核心方法 |
|-------------|---------|
| `services.database.data_service` | query_documents, create_document, update_document, delete_document, get_document, count_documents |
| `services.ai.chat_service` | chat（SSE 流式）, chat_rag, get_models |
| `services.knowledge.knowledge_service` | scan_knowledge, read_file, write_file, search_knowledge |
| `services.rag.rag_service` | query, chat（SSE 流式）, build_index, status, file_query, file_chat |
| `services.rss.feed_service` | RSS 订阅管理 |
| `services.audit.audit_service` | query_audit_logs |
| `services.bridge_service` | create_session_token, exchange_token |
| `services.code_health_service` | analyze 代码健康分析 |

**不存在的服务**（在旧文档中出现过）：`services.database.session_service` — 会话管理在 `rag.py` 路由中，不通过单独的 RPC 服务。

## 六、错误码（src/shared/error_codes.py）

| 业务码 | 枚举名 | HTTP | 含义 |
|--------|--------|------|------|
| `0` | `OK` | 200 | 成功 |
| `1000` | `INVALID_REQUEST` | 400 | 请求格式无效 |
| `1001` | `BUSINESS_ERROR` | 400 | 业务逻辑错误 |
| `1002` | `INVALID_PARAMS` | 400 | 参数验证失败 |
| `1003` | `RATE_LIMITED` | 429 | 请求频率超限 |
| `1004` | `DATA_NOT_FOUND` | 404 | 资源不存在 |
| `1008` | `PERMISSION_DENIED` | 403 | 权限不足 |
| `1009` | `UNAUTHORIZED` | 401 | 认证失败 |
| `5000` | `SERVER_ERROR` | 500 | 服务器繁忙 |
| `5001` | `INTERNAL_ERROR` | 500 | 内部错误 |
| `5002` | `DATA_STORE_FAIL` | 500 | 数据创建失败 |
| `5003` | `DATA_UPDATE_FAIL` | 500 | 数据更新失败 |
| `5004` | `DATA_DESTROY_FAIL` | 500 | 数据删除失败 |

## 七、跨项目变更规则

- 修改 `module_name`/`method_name` 视为破坏性变更 — 需同步所有消费端（YiVad、YiPet）
- 新增可选参数安全（前端不传则使用默认值）
- 删除参数需先标记 deprecated，至少一个版本后才能删除
- 响应字段新增安全，删除/重命名视为破坏性变更
- 变更 RPC 契约时同步通知 YiVad 和 YiPet 消费端

## 八、约束

- 前端禁止直接访问 MongoDB — 所有数据操作通过 RPC
- 参数名使用 snake_case（`module_name` 而非 `moduleName`）
- 统一响应信封 `{code, message, data}`
- `filter` 参数绝不能写成 `query`（最隐蔽的 bug）