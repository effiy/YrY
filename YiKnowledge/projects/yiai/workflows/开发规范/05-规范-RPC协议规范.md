---
title: RPC 协议规范
tags: [yiai, rpc, protocol, cross-project]
category: projects/yiai/workflows
created: 2026-09-08
updated: 2026-09-15
source: internal
type: spec
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "跨项目 RPC 通信协议权威参考——YiAi/YiVad/YiPet 三方契约"
---

# RPC 协议规范

> **读完你将能够**：理解 RPC 协议的所有细节，避免跨项目通信 bug

> 本规范是 YiAi（后端）与 YiVad/YiPet（前端）之间所有数据交互的唯一协议。前端不能直接访问 MongoDB——所有操作必须通过本协议。

## 一、协议定义

```
POST /  Content-Type: application/json
{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { ... }
}
```

**设计原则**：单一端点（`POST /`）、统一响应（`{code, message, data}`）、动态路由（`module_name` 映射到 Python 模块）。

## 二、请求/响应格式

```json
// 请求
POST / {
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": { "cname": "projects", "filter": {"status": "active"}, "pageNum": 1, "pageSize": 20 }
}

// 成功
{ "code": 0, "message": "ok", "data": { "list": [...], "total": 100, "pageNum": 1, "pageSize": 20, "totalPages": 5 } }

// 错误
{ "code": 1001, "message": "参数不完整", "data": null }
```

## 三、关键参数名契约（硬性要求）

| 正确 | 错误 | 上下文 | 影响 |
|------|------|--------|------|
| `filter` | `query` | data_service 查询过滤 | 后端静默忽略，返回全部数据 |
| `target_file` | `path` | `/read-file`, `/write-file` | 后端返回 422 |
| `cname` | `collection_name` | data_service 集合参数 | 后端返回 422 |
| `module_name` | `moduleName` | RPC 信封 | 分发器无法解析 |
| `method_name` | `methodName` | RPC 信封 | 分发器无法解析 |

这些不匹配曾导致真实 Bug——后端静默忽略 `query`，对 `path` 返回 422。

## 四、RPC 分发器实现

```python
# 根路由 POST /
@app.post("/")
async def rpc_dispatcher(request: Request):
    body = await request.json()
    module_name = body["module_name"]
    method_name = body["method_name"]
    parameters = body.get("parameters", {})

    service = _resolve_service(module_name)
    method = getattr(service, method_name)
    result = await method(**parameters)
    return {"code": 0, "message": "ok", "data": result}
```

## 五、已注册服务

| module_name | 核心方法 |
|-------------|---------|
| `services.database.data_service` | query_documents, create_document, update_document, delete_document, count_documents |
| `services.ai.chat_service` | chat（SSE 流式） |
| `services.database.session_service` | create_session, get_session, list_sessions, update_session, delete_session |
| `services.knowledge.knowledge_service` | scan_knowledge, read_file, write_file, write_entry_markdown |
| `services.rag.rag_service` | query, status, rebuild |
| `services.rss.feed_service` | RSS 订阅管理 |
| `services.audit.audit_service` | query_audit_logs |

## 六、标准错误码

| 码 | 含义 | HTTP 状态 |
|----|------|----------|
| 0 | 成功 | 200 |
| 1001 | 参数验证失败 | 400 |
| 1002 | 资源不存在 | 404 |
| 2001 | AI 服务不可用 | 503 |
| 3001 | 文件读写失败 | 500 |
| 4001 | 认证失败 | 401 |
| 5001 | 数据库错误 | 500 |

## 七、跨项目变更规则

- 修改 `module_name`/`method_name` 视为破坏性变更——需同步所有消费端
- 新增可选参数安全（前端不传则使用默认值）
- 删除参数需先标记 deprecated，至少一个版本后才能删除
- 响应字段新增安全，删除/重命名视为破坏性变更

## 八、约束

- 前端不直接访问 MongoDB——所有数据操作通过 RPC
- 参数名使用 snake_case
- 统一响应 `{code, message, data}`
- 变更 RPC 契约时同步通知 YiVad 和 YiPet 消费端