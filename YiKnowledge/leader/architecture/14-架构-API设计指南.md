---
title: "API Design Guide — YrY RPC Envelope and Endpoint Standards"
aliases: [api-design, rpc-design, endpoint-standards]
tags: [architecture, api, rpc, design, leader]
category: leader/architecture
created: 2026-09-15
updated: 2026-09-15
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, engineer]
benefit: "技术负责人和工程师在设计新 API 时遵循一致的 RPC 信封规范、参数命名约定和错误码标准"
acceptance_criteria:
  - "覆盖 RPC 信封规范、参数命名契约、错误码标准、SSE 流式响应"
  - "包含已知导致 bug 的参数名对照表"
related:
  - ./01-架构-架构决策设计.md
  - ../decisions/README.md
  - ../../../YiAi/CLAUDE.md
---

# API 设计指南

> YrY 的跨项目通信使用 RPC 信封作为**唯一协议**。不引入 RESTful 或 GraphQL 端点。这个约束减少了决策空间，但也要求每个人理解并遵守信封规范。

## RPC 信封规范

### 请求格式

```
POST /
Content-Type: application/json

{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific> }
}
```

**字段说明**：

| 字段 | 类型 | 必需 | 说明 |
|---|---|---|---|
| `module_name` | string | 是 | Python 模块路径。格式：`services.<领域>.<服务>` |
| `method_name` | string | 是 | 模块中的可调用对象名 |
| `parameters` | object | 是 | 方法参数。即使无参数也要传 `{}` |

### 响应格式

```json
// 成功
{ "code": 0, "message": "ok", "data": <any> }

// 业务错误
{ "code": <ErrorCode>, "message": "<description>", "data": null }
```

**规则**：
- `code: 0` 始终表示成功
- `code !== 0` 表示业务错误——前端根据 code 而非 message 做判断
- `data` 在成功时可以是任何 JSON 类型（对象、数组、null、字符串）
- HTTP 状态码始终为 200（即使是业务错误）——不使用 HTTP 状态码表示业务结果

### 模块命名规范

```
services.<domain>.<service>

domain: ai | data | knowledge | file | auth | rag
service: chat_service | data_service | knowledge_service | file_service | auth_service | rag_service
```

**已有模块**：
- `services.ai.chat_service` — 聊天、Agent
- `services.data.data_service` — 通用 CRUD
- `services.knowledge.knowledge_service` — 知识库管理
- `services.file.file_service` — 文件读写

## 参数命名契约

以下是**曾导致实际 bug** 的参数名不匹配。后端静默忽略错误参数名，前端收到空结果或不报错——这是最隐蔽的 bug 模式。

| 正确 | 错误 | 上下文 | 影响 |
|---|---|---|---|
| `filter` | `query` | `data_service.query_documents` | 后端忽略 `query`，返回空数组 |
| `target_file` | `path` | `/read-file`、`/write-file` | HTTP 422 |
| `cname` | `collection_name` | `data_service` 集合操作 | 后端忽略 |

### 新增参数时的规则

1. **前端和后端使用完全相同的参数名**——前后端开发者在 PR 描述中显式列出参数名对照
2. **参数名使用 snake_case**——与 Python 惯例一致
3. **参数名使用完整单词**——`target_file` 而非 `tgt`、`collection_name` 而非 `cname`（注意：历史遗留的 `cname` 已存在，新参数用完整名）
4. **必填参数在服务端验证**——不要依赖前端验证。缺失必填参数返回 `code: 1001`
5. **布尔参数使用 `is_` 前缀**——`is_active`、`is_base64`

## 标准错误码

| 错误码 | 含义 | 使用场景 |
|---|---|---|
| `0` | 成功 | 所有正常响应 |
| `1001` | 参数验证失败 | 缺少必填字段、类型不匹配、枚举值无效 |
| `1002` | 资源不存在 | 查询/更新/删除不存在的文档 |
| `1003` | 资源已存在 | 创建重复文档 |
| `2001` | AI 服务不可用 | Ollama 连接失败、模型未加载 |
| `2002` | AI 推理超时 | LLM 调用超过时间限制 |
| `3001` | 文件读写失败 | 磁盘 I/O 错误、路径无效 |
| `3002` | 文件不存在 | 读取不存在的文件 |
| `4001` | 认证失败 | Token 无效或过期 |
| `4002` | 权限不足 | 无权限访问资源 |
| `5001` | 数据库错误 | MongoDB 连接失败或操作异常 |
| `9999` | 未知内部错误 | 未分类的服务器异常 |

### 新增错误码的规则

- 错误码范围：`<模块编号><错误序号>`。模块编号：1=参数，2=AI，3=文件，4=认证，5=数据库，9=系统
- 不要复用已有的错误码表示不同的错误——"参数验证失败"和"参数类型错误"可以共用 1001
- 错误消息 (`message`) 应面向开发者而非最终用户——描述哪里出了问题，而非道歉

## SSE 流式响应

聊天和 Agent 使用 Server-Sent Events (SSE) 而非 RPC 信封（SSE 不适合信封格式）。

### SSE 事件格式

```
data: {"type": "token", "content": "你"}
data: {"type": "token", "content": "好"}
data: {"type": "done", "message_id": "xxx"}
data: {"type": "error", "code": 2001, "message": "Ollama 连接超时"}
```

### SSE 事件类型

| type | 含义 | 前端行为 |
|---|---|---|
| `token` | 流式输出的单个 token | 追加到消息末尾 |
| `done` | 流式输出完成 | 保存完整消息，关闭连接 |
| `error` | 流式输出异常中断 | 显示错误提示，保留已输出的内容 |
| `tool_call` | Agent 调用了工具 | 显示工具调用状态（"正在搜索知识库..."） |

## 新增端点的检查清单

在 YiAi 中新增一个 RPC 方法时：

- [ ] 方法放在正确的 service 模块中（不跨 domain）
- [ ] `parameters` 参数使用 snake_case，完整单词
- [ ] 必填参数有服务端验证（缺失返回 1001）
- [ ] `target_file` 参数有路径遍历检查（不能通过 `../` 访问 YiKnowledge 之外）
- [ ] 使用已有错误码（除非确实是新的错误类别）
- [ ] 前端调用方使用了正确的参数名（对照参数命名契约表）
- [ ] 在对应的 CLAUDE.md 中更新了端点文档
- [ ] 如果需要认证，验证了 `X-Token`

## 参数验证模板

```python
# YiAi 服务端参数验证模式
def validate_required(params: dict, *fields: str) -> Optional[dict]:
    """验证必需参数。缺失时返回错误响应，否则返回 None。"""
    missing = [f for f in fields if f not in params or params[f] is None]
    if missing:
        return {
            "code": 1001,
            "message": f"缺少必填参数: {', '.join(missing)}",
            "data": None
        }
    return None

# 使用示例
error = validate_required(parameters, "filter", "cname")
if error:
    return error
```

## 反模式

| 反模式 | 失败原因 | 正确做法 |
|---|---|---|
| 前后端参数名不一致 | 后端静默忽略——不报错但返回错误结果 | 使用参数命名契约表对照；PR 中显式列出参数名 |
| 用 HTTP 状态码表示业务错误 | 前端需要同时检查 HTTP 状态和 body code | 始终 HTTP 200；用 body `code` 表示业务结果 |
| 参数验证只在前端做 | 绕过前端直接调 API 时参数验证缺失 | 服务端验证所有必填参数 |
| `target_file` 不做路径遍历检查 | 可读取服务器上的任意文件 | `Path.resolve().is_relative_to(base)` |
| 错误消息复制粘贴 | "操作失败"——无助于排查 | 描述具体原因："集合 `sessions` 中未找到 key=`xxx` 的文档" |