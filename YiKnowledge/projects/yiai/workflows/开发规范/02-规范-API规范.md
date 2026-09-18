---
title: API 规范
tags: [yiai, api, rpc, fastapi, sse, error-codes]
category: projects/yiai/workflows
created: 2026-09-02
updated: 2026-09-15
source: internal
type: spec
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "RPC 信封协议、SSE 流式、错误码、端点速查"
related:
  - ../架构设计/04-架构-模块结构规范.md
  - ./04-规范-数据库规范.md
  - ./03-规范-认证规范.md
---

# API 规范

> **读完你将能够**：掌握 RPC 信封协议、SSE 流式响应、错误码体系

> YiAi 使用两种 API 模式：RPC 信封（通用服务调用，`POST /`）和 RESTful 端点（文件、认证、Agent 等）。

## 一、RPC 信封协议

所有前端调用使用统一信封：

```json
// 请求: POST /
{ "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "projects", "filter": {"status": "active"}, "pageNum": 1, "pageSize": 20 } }

// 成功: { "code": 0, "message": "ok", "data": { "list": [...], "total": 100 } }
// 错误: { "code": 1001, "message": "参数不完整", "data": null }
```

根路由 `/` 作为 RPC 分发器：`_resolve_service(module_name)` → `getattr(service, method_name)(**parameters)`。

## 二、RPC 方法清单

### data_service（通用 CRUD）
| method_name | 关键参数 |
|-------------|---------|
| `query_documents` | `cname`, `filter`, `pageNum`, `pageSize`, `orderBy`, `orderType`, `fields`, `excludeFields` |
| `create_document` | `cname`, `data` |
| `update_document` | `cname`, `key`, `data` |
| `delete_document` | `cname`, `key` |
| `get_document` | `cname`, `key` |
| `count_documents` | `cname`, `filter` |

### chat_service（AI 聊天）
`chat`（SSE 流式）、`chat_rag`（RAG 增强）、`get_models`

### session_service
`create_session`, `get_session`, `list_sessions`, `update_session`, `delete_session`

### knowledge_service
`scan_knowledge`, `read_file`, `write_file`, `list_files`, `write_entry_markdown`, `delete_entry_markdown`

### rag_service
`query`, `chat`, `build_index`, `decompose_question`, `status`

## 三、SSE 流式响应

```python
# StreamingResponse + text/event-stream
# async generator yield "data: {json}\n\n"
# 结束标记 "data: [DONE]\n\n"
```

Agent 事件类型：`thinking`、`tool_call`、`tool_result`、`token`、`done`、`error`。

```python
# 流式错误处理
try:
    async for event in agent.run(request):
        yield event
except BusinessException as e:
    yield f"data: {json.dumps({'type': 'error', 'code': e.error_code, 'message': e.detail})}\n\n"
finally:
    yield "data: [DONE]\n\n"
```

## 四、错误码

| 码 | 含义 | 场景 |
|----|------|------|
| `0` | 成功 | 正常响应 |
| `1001` | 参数验证失败 | 缺少必填字段 |
| `1002` | 资源不存在 | 查询不存在文档 |
| `1003` | 资源已存在 | 创建重复文档 |
| `2001` | AI 服务不可用 | Ollama 连接失败 |
| `2002` | AI 推理超时 | LLM 调用超时 |
| `3001` | 文件读写失败 | 磁盘 I/O 错误 |
| `3002` | 文件不存在 | 读取不存在文件 |
| `4001` | 认证失败 | Token 无效或过期 |
| `4002` | 权限不足 | 无权限访问 |
| `5001` | 数据库错误 | MongoDB 异常 |
| `9999` | 未知错误 | 未分类异常 |

## 五、关键参数名（写错会静默失败）

| 正确 | 错误 | 上下文 |
|------|------|--------|
| `filter` | `query` | data_service 查询过滤（后端静默忽略 query） |
| `target_file` | `path` | 文件读写（后端返回 422） |
| `cname` | `collection_name` | MongoDB 集合名（后端返回 422） |
| `module_name` | `moduleName` | RPC 信封（必须 snake_case） |

## 六、REST 端点速查

| 路径 | 方法 | 说明 |
|------|------|------|
| `/` | POST | RPC 分发器 |
| `/health` | GET | 健康检查（MongoDB + Ollama） |
| `/about` | GET | 服务信息 |
| `/read-file` | POST | 读文件（`target_file`） |
| `/write-file` | POST | 写文件（`target_file`, `content`） |
| `/auth/login` | POST | 登录 |
| `/agent/chat` | POST | Agent 聊天（SSE） |
| `/agent/confirm` | POST | 确认工具调用 |
| `/agent/steer` | POST | 引导 Agent |
| `/rag-query` | POST | RAG 检索 |
| `/rag-build` | POST | 重建索引 |
| `/bridge/create-token` | POST | YiPet→YiVad 桥接 |
| `/notification/stream` | GET | 通知 SSE 流 |
| `/metrics` | GET | Prometheus 指标 |
| `/backup/full` | POST | 全量备份 |

## 七、约束

**必须**：RPC 信封格式、snake_case 参数名、SSE `text/event-stream`、StandardResponse 统一响应

**禁止**：绕过 RPC 分发器、路由层写业务逻辑、混用 RESTful 和 RPC、直接操作 MongoDB