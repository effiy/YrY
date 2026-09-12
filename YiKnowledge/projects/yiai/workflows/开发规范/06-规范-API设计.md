---
title: API 规范
tags: [yiai, api, rpc, sse, routes, contract, middleware, error-handling]
category: projects/yiai/specs
created: 2026-08-25
updated: 2026-09-10
source: YiAi
type: architecture
status: active
---

# API 规范

> RPC 协议、路由模块、SSE 流式响应、关键参数契约、RPC 方法参考、中间件链、错误处理、文件操作、Agent 控制、反模式。

## 一、RPC 协议

### 请求信封

所有 YiVad/YiPet 请求使用统一 RPC 信封，POST 到根路径 `/`：

```json
POST / {
  "module_name": "services.database.data_service",
  "method_name": "query_documents",
  "parameters": {
    "cname": "projects",
    "filter": { "status": "active" },
    "pageNum": 1,
    "pageSize": 20
  }
}
```

### 响应格式

```json
// 成功
{ "code": 0, "message": "ok", "data": { "list": [...], "total": 100 } }

// 业务错误
{ "code": 401, "message": "登录已过期", "data": null }

// 服务器错误
{ "code": 500, "message": "内部服务器错误", "data": null }

// 验证错误
{ "code": 422, "message": "参数验证失败", "data": { "errors": ["filter 参数不能为空"] } }
```

### 错误码枚举

| 错误码 | 常量 | 说明 | HTTP 状态码 | 触发条件 |
|--------|------|------|------------|----------|
| 0 | `SUCCESS` | 成功 | 200 | 正常响应 |
| 401 | `UNAUTHORIZED` | 未认证/Token 过期 | 401 | Token 无效或过期 |
| 403 | `FORBIDDEN` | 无权限 | 403 | 角色权限不足 |
| 404 | `NOT_FOUND` | 资源不存在 | 404 | 查询的资源不存在 |
| 422 | `VALIDATION_ERROR` | 参数验证失败 | 422 | 参数格式/类型错误 |
| 429 | `RATE_LIMITED` | 请求频率过高 | 429 | 触发限流 |
| 500 | `INTERNAL_ERROR` | 服务器内部错误 | 500 | 未捕获异常 |
| 503 | `AI_UNAVAILABLE` | AI 服务不可用 | 503 | Ollama 连接失败 |

### Python 类型定义

```python
# src/schemas/response.py
from pydantic import BaseModel
from typing import Any, Generic, TypeVar

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "ok"
    data: T | None = None

class RpcRequest(BaseModel):
    module_name: str
    method_name: str
    parameters: dict[str, Any] = {}

class PaginatedData(BaseModel, Generic[T]):
    list: list[T]
    total: int
    pageNum: int
    pageSize: int
    totalPages: int
```

### RPC 分发器

```python
# src/app.py
from fastapi import FastAPI, Request
from src.schemas.response import StandardResponse, RpcRequest

app = FastAPI()

@app.post("/")
async def rpc_dispatcher(request: Request):
    """RPC 分发器 — 解析 module_name.method_name，路由到对应服务"""
    body = await request.json()
    rpc = RpcRequest(**body)

    try:
        # 动态导入模块并调用方法
        module_path = rpc.module_name  # "services.database.data_service"
        method_name = rpc.method_name   # "query_documents"

        module = importlib.import_module(f"src.{module_path.replace('.', '/')}")
        handler = getattr(module, method_name)

        result = await handler(**rpc.parameters)
        return StandardResponse(data=result)

    except ModuleNotFoundError:
        return StandardResponse(code=404, message=f"模块不存在: {rpc.module_name}")
    except AttributeError:
        return StandardResponse(code=404, message=f"方法不存在: {rpc.method_name}")
    except Exception as e:
        logger.error(f"RPC error: {e}", exc_info=True)
        return StandardResponse(code=500, message="内部服务器错误")
```

---

## 二、路由模块（20 个）

| 路由 | 文件 | 说明 | 认证 | 方法 |
|------|------|------|------|------|
| `/` | `app.py` | RPC 分发器 | 可选 | POST |
| `/about` | `about.py` | 服务信息（版本、运行时间） | 否 | GET |
| `/auth/*` | `auth.py` | 认证（登录/注册/Token 刷新） | 否 | POST |
| `/users/*` | `users.py` | 用户管理（CRUD + 角色） | 是 | GET/POST/PUT/DELETE |
| `/system/*` | `system.py` | 系统信息（CPU/内存/磁盘） | 是 | GET |
| `/files/*` | `files.py` | 文件上传/下载/管理 | 可选 | GET/POST |
| `/read-file` | `files.py` | 文件读取（`target_file`） | 可选 | POST |
| `/write-file` | `files.py` | 文件写入（`target_file`, `content`） | 可选 | POST |
| `/execution/*` | `execution.py` | 模块执行（代码运行） | 是 | POST |
| `/wework/*` | `wework.py` | 企业微信消息推送 | 是 | POST |
| `/maintenance/*` | `maintenance.py` | 维护操作（清理/备份） | 是 | POST |
| `/state/*` | `state.py` | 状态存储（KV 存储） | 是 | GET/POST/DELETE |
| `/agent/*` | `agent.py` | Agent 聊天/确认/引导 | 可选 | POST |
| `/health` | `health.py` | 健康检查（MongoDB + Ollama） | 否 | GET |
| `/knowledge/*` | `knowledge.py` | 知识库扫描/读取/写入 | 可选 | GET/POST |
| `/rag/*` | `rag.py` | RAG 检索/聊天/构建索引 | 可选 | GET/POST |
| `/search/*` | `search.py` | 全局搜索（跨集合） | 可选 | POST |
| `/mcp/*` | `mcp.py` | MCP 协议（工具暴露） | 可选 | POST |
| `/dashboard/*` | `dashboard.py` | 仪表盘数据（统计/图表） | 是 | GET |
| `/v1/*` | `openai_compat.py` | OpenAI API 兼容（chat/completions） | 可选 | POST |

### 路由认证级别

| 级别 | 说明 | 路由 |
|------|------|------|
| 否 | 完全公开，无需认证 | `/about`, `/health`, `/auth/*` |
| 可选 | 有 Token 则注入用户，无 Token 也可访问 | `/`, `/agent/*`, `/files/*`, `/knowledge/*`, `/rag/*`, `/search/*`, `/mcp/*`, `/v1/*` |
| 是 | 必须认证，否则返回 401 | `/users/*`, `/system/*`, `/execution/*`, `/wework/*`, `/maintenance/*`, `/state/*`, `/dashboard/*` |

---

## 三、RPC 方法参考

### data_service（通用 CRUD）

| method_name | 说明 | 关键参数 | 返回 |
|-------------|------|----------|------|
| `query_documents` | 分页查询文档 | `cname`, `filter`, `pageNum`, `pageSize`, `orderBy`, `orderType` | `{ list, total, pageNum, pageSize, totalPages }` |
| `create_document` | 创建文档 | `cname`, `data` | `{ inserted_id }` |
| `update_document` | 更新文档 | `cname`, `key`, `data` | `{ modified_count }` |
| `delete_document` | 删除文档 | `cname`, `key` | `{ deleted_count }` |
| `get_document` | 获取单个文档 | `cname`, `key` | `{ document }` |
| `aggregate` | 聚合查询 | `cname`, `pipeline` | `{ results }` |
| `count_documents` | 计数 | `cname`, `filter` | `{ count }` |
| `distinct` | 去重查询 | `cname`, `field`, `filter` | `{ values }` |

### chat_service（AI 聊天）

| method_name | 说明 | 关键参数 | 返回 |
|-------------|------|----------|------|
| `chat` | AI 聊天（SSE 流式） | `model`, `messages`, `stream`, `temperature`, `max_tokens` | SSE 流 |
| `chat_rag` | RAG 增强聊天 | `model`, `messages`, `scope`, `top_k` | SSE 流 |
| `get_models` | 获取可用模型列表 | — | `{ models: [{name, size, modified}] }` |
| `get_model_info` | 获取模型详情 | `model` | `{ name, size, parameters, template }` |

### session_service（会话管理）

| method_name | 说明 | 关键参数 | 返回 |
|-------------|------|----------|------|
| `create_session` | 创建会话 | `title`, `model` | `{ session_id }` |
| `get_session` | 获取会话（含消息） | `session_id` | `{ session }` |
| `list_sessions` | 会话列表（分页） | `filter`, `pageNum`, `pageSize` | `{ list, total }` |
| `update_session` | 更新会话标题 | `session_id`, `data` | `{ modified_count }` |
| `delete_session` | 删除会话及消息 | `session_id` | `{ deleted_count }` |
| `add_message` | 添加消息 | `session_id`, `message` | `{ message_id }` |

### knowledge_service（知识库）

| method_name | 说明 | 关键参数 | 返回 |
|-------------|------|----------|------|
| `scan_knowledge` | 扫描知识库 | `base_dir` | `{ scanned, new, modified, deleted }` |
| `read_file` | 读取知识文件 | `target_file` | `{ content, target_file }` |
| `write_file` | 写入知识文件 | `target_file`, `content` | `{ target_file, written }` |
| `list_files` | 文件列表 | `directory` | `{ files }` |
| `get_stats` | 知识库统计 | — | `{ total, active, draft, archived }` |

### rag_service（RAG 检索）

| method_name | 说明 | 关键参数 | 返回 |
|-------------|------|----------|------|
| `query` | RAG 检索 | `query`, `top_k`, `scope` | `{ results, sources }` |
| `chat` | RAG 聊天（SSE 流式） | `query`, `messages`, `scope` | SSE 流 |
| `build_index` | 构建索引 | `force` | `{ indexed, duration_seconds }` |
| `get_status` | 索引状态 | — | `{ indexed_files, index_size_mb, last_built }` |
| `decompose_question` | 子问题分解 | `question` | `{ sub_questions }` |

---

## 四、SSE 流式响应

### AI 聊天 SSE

```
POST /  body: {
  module_name: "services.ai.chat_service",
  method_name: "chat",
  parameters: { model: "qwen2.5", messages: [...], stream: true }
}
Response: text/event-stream

data: {"data": {"message": "Hello"}}

data: {"data": {"message": " World"}}

data: {"done": true}
```

### SSE 服务端实现

```python
# src/domain/ai/chat_service.py
from fastapi.responses import StreamingResponse
import json

async def chat_stream(model: str, messages: list[dict], **kwargs):
    """SSE 流式聊天生成器"""
    async def event_generator():
        try:
            async for chunk in ollama_client.chat(
                model=model,
                messages=messages,
                stream=True,
                options={"temperature": kwargs.get("temperature", 0.7)}
            ):
                if chunk.get("message", {}).get("content"):
                    yield f"data: {json.dumps({'data': {'message': chunk['message']['content']}})}\n\n"

                if chunk.get("done"):
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    break

        except Exception as e:
            logger.error(f"SSE error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 禁用 Nginx 缓冲
        }
    )
```

### Agent 事件流

```
POST /agent/chat
Response: text/event-stream

data: {"type":"turn_start","turn":1}

data: {"type":"tool_call","tool":"db_list","args":{"cname":"menus"}}

data: {"type":"confirmation_required","confirmation_id":"t0:tool_1","tool":"db_create","args":{"cname":"projects","data":{"name":"New"}}}

data: {"type":"tool_execution_start","tool":"db_create","args":{...}}

data: {"type":"tool_execution_end","tool":"db_create","result":{"inserted_id":"..."}}

data: {"type":"turn_end","turn":1,"summary":"已创建项目"}

data: {"type":"agent_end","stop_reason":"completed","turns":3}
```

### Agent 事件类型

| 事件类型 | 说明 | 携带数据 | 触发时机 |
|----------|------|----------|----------|
| `turn_start` | 新一轮开始 | `turn` | 每轮 LLM 调用前 |
| `tool_call` | LLM 决定调用工具 | `tool`, `args`, `call_id` | LLM 返回 tool_call |
| `confirmation_required` | 写操作需用户确认 | `confirmation_id`, `tool`, `args` | 工具标记 requires_confirmation |
| `tool_execution_start` | 工具开始执行 | `tool`, `args` | 确认后或读操作直接执行 |
| `tool_execution_end` | 工具执行完成 | `tool`, `result`, `error` | 工具执行完毕 |
| `turn_end` | 本轮结束 | `turn`, `summary` | 工具结果返回 LLM 后 |
| `model_switch` | 模型自动切换 | `from`, `to` | 任务复杂度触发模型升级 |
| `error` | 错误事件 | `error`, `code` | 任何异常 |
| `agent_end` | Agent 终止 | `stop_reason`, `turns` | 任务完成/用户停止/超时 |

---

## 五、关键参数约定

以下参数名约定是硬性要求，违反会导致后端 422 或静默忽略：

| 正确 | 错误 | 上下文 | 影响 |
|------|------|--------|------|
| `filter` | `query` | `data_service.query_documents` 参数 | 后端静默忽略 `query`，返回全部数据 |
| `target_file` | `path` | `/read-file`, `/write-file` 接口 | 后端返回 422 |
| `cname` | `collection_name` | `data_service` 集合名称参数 | 后端返回 422 |
| `module_name` | `moduleName` | RPC 信封 | 后端返回 422 |
| `method_name` | `methodName` | RPC 信封 | 后端返回 422 |
| `pageNum` | `page` / `page_num` | 分页参数 | 分页失效，返回默认值 |
| `pageSize` | `page_size` / `limit` | 分页参数 | 分页失效，返回默认值 |

> 这些参数名不匹配曾导致真实 Bug — 后端会静默忽略 `query` 参数，对 `path` 返回 422。前端调用时必须使用正确参数名。

---

## 六、文件操作端点

### 读取文件

```
POST /read-file
Body: { "target_file": "path/to/file.md" }
Response: { "code": 0, "data": { "content": "...", "target_file": "path/to/file.md" } }
```

### 写入文件

```
POST /write-file
Body: { "target_file": "path/to/file.md", "content": "...", "is_base64": false }
Response: { "code": 0, "data": { "target_file": "path/to/file.md", "written": true } }
```

### 文件操作实现

```python
# src/domain/file/file_service.py
import os
import base64
from pathlib import Path

async def read_file(target_file: str) -> dict:
    """读取文件内容"""
    base_dir = config.knowledge.base_dir  # "../YiKnowledge"
    full_path = os.path.join(base_dir, target_file)

    # 路径遍历防护
    real_path = os.path.realpath(full_path)
    if not real_path.startswith(os.path.realpath(base_dir)):
        raise ValueError("文件路径超出允许范围")

    if not os.path.exists(real_path):
        raise FileNotFoundError(f"文件不存在: {target_file}")

    with open(real_path, "r", encoding="utf-8") as f:
        content = f.read()

    return {"content": content, "target_file": target_file}

async def write_file(target_file: str, content: str, is_base64: bool = False) -> dict:
    """写入文件内容"""
    if is_base64:
        content = base64.b64decode(content).decode("utf-8")

    base_dir = config.knowledge.base_dir
    full_path = os.path.join(base_dir, target_file)

    # 路径遍历防护
    real_path = os.path.realpath(full_path)
    if not real_path.startswith(os.path.realpath(base_dir)):
        raise ValueError("文件路径超出允许范围")

    # 确保目录存在
    os.makedirs(os.path.dirname(real_path), exist_ok=True)

    with open(real_path, "w", encoding="utf-8") as f:
        f.write(content)

    return {"target_file": target_file, "written": True}
```

---

## 七、中间件链

### 注册顺序

中间件按以下顺序注册（顺序影响请求处理流程）：

```
1. CORSMiddleware            — 最先处理，Origin 检查
2. ObserverMiddleware（可选）— 限流/采样/深度防护
3. AuthMiddleware（可选）    — X-Token 验证
4. RequestLoggingMiddleware  — 请求日志
5. 路由匹配                  — 20 个路由模块
6. ExceptionHandler          — 全局异常捕获
```

### 中间件配置

```yaml
# config.yaml
middleware:
  auth_enabled: false
  auth_token: "dev-token-change-me"

cors:
  origins: ["*"]
  allow_any_origin: true

observer:
  enabled: false
  throttle_enabled: false
  sampler_enabled: true
  sampler_slow_threshold_ms: 5000.0
  guard_enabled: true
  guard_max_depth: 3
```

---

## 八、Agent 控制端点

### 确认工具调用

```
POST /agent/confirm
Body: { "session_id": "...", "confirmation_id": "t0:tool_1", "approve": true }
Response: { "code": 0, "data": { "confirmed": true } }
```

### 引导 Agent

```
POST /agent/steer
Body: { "session_id": "...", "message": "改成标题为 Final" }
Response: { "code": 0, "data": { "steered": true } }
```

### 停止 Agent

```
POST /agent/stop
Body: { "session_id": "..." }
Response: { "code": 0, "data": { "stopped": true } }
```

---

## 九、健康检查

```
GET /health
Response: {
  "code": 0,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "uptime_seconds": 86400,
    "mongodb": "connected",
    "ollama": "available",
    "rag_index": "ready"
  }
}
```

### 健康检查实现

```python
# src/routes/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    checks = {
        "status": "ok",
        "version": config.app.version,
        "uptime_seconds": int(time.time() - start_time),
    }

    # MongoDB 检查
    try:
        await db.client.admin.command("ping")
        checks["mongodb"] = "connected"
    except Exception:
        checks["mongodb"] = "disconnected"
        checks["status"] = "degraded"

    # Ollama 检查
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(f"{config.ollama.base_url}/api/tags", timeout=5)
            checks["ollama"] = "available" if resp.status_code == 200 else "unavailable"
    except Exception:
        checks["ollama"] = "unavailable"
        checks["status"] = "degraded"

    # RAG 索引检查
    checks["rag_index"] = "ready" if os.path.exists("data/rag_store/docstore.json") else "not_built"

    return {"code": 0, "data": checks}
```

---

## 十、错误处理

### 全局异常处理器

```python
# src/app.py
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理 — 捕获所有未处理的异常"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)

    # 根据异常类型返回不同错误码
    if isinstance(exc, ValueError):
        return JSONResponse({"code": 422, "message": str(exc), "data": None})
    if isinstance(exc, PermissionError):
        return JSONResponse({"code": 403, "message": "无权限", "data": None})

    return JSONResponse({"code": 500, "message": "内部服务器错误", "data": None})
```

### 错误响应模式

| 场景 | HTTP 状态码 | code | message | 处理方式 |
|------|------------|------|---------|----------|
| 参数验证失败 | 422 | 422 | 具体验证错误 | Pydantic 自动验证 |
| 认证失败 | 401 | 401 | "登录已过期" | AuthMiddleware |
| 权限不足 | 403 | 403 | "无权限" | 手动抛出 PermissionError |
| 资源不存在 | 404 | 404 | "资源不存在" | 手动抛出 ValueError |
| AI 服务不可用 | 503 | 503 | "AI 服务不可用" | Ollama 连接失败 |
| 服务器内部错误 | 500 | 500 | "内部服务器错误" | 全局异常处理器 |
| 限流 | 429 | 429 | "请求过于频繁" | ObserverMiddleware |

---

## 十一、反模式

| 反模式 | 错误示例 | 正确做法 | 原因 |
|--------|----------|----------|------|
| 参数名使用 `query` | `parameters: { query: {...} }` | `parameters: { filter: {...} }` | 后端静默忽略 `query` |
| 参数名使用 `path` | `{ "path": "/file.md" }` 调用 `/read-file` | `{ "target_file": "/file.md" }` | 后端返回 422 |
| 使用驼峰命名 | `{ "moduleName": "...", "methodName": "..." }` | `{ "module_name": "...", "method_name": "..." }` | RPC 分发器无法解析 |
| 绕过 RPC 信封 | 直接 POST 到 `/api/data` | 使用 `POST /` + `module_name.method_name` | 失去统一错误处理和认证 |
| 在路由中直接操作 MongoDB | 路由中 `await db.find_one(...)` | 路由 → Service → Repository → MongoDB | 分层架构破坏 |
| SSE 不设超时 | 流式请求使用默认 30s 超时 | SSE 请求不设超时 | 长连接被中断 |
| 硬编码集合名称 | `db.find_one("projects", ...)` | 使用常量 `PROJECTS_COLLECTION` | 集合名变更需改多处 |
| 忽略路径遍历 | `open(user_path + file, "r")` | 使用 `os.path.realpath` 验证 | 安全漏洞 |

---

## 十二、约束

### 必须遵守

- 所有 RPC 调用使用统一信封 `{module_name, method_name, parameters}`
- 响应使用 StandardResponse 统一格式 `{code, message, data}`
- 参数名使用 `filter`（非 `query`）、`target_file`（非 `path`）、`cname`（非 `collection_name`）
- SSE 流式响应使用 `text/event-stream` 格式，设置 `Cache-Control: no-cache`
- 文件操作使用 `os.path.realpath` 进行路径遍历防护
- API 路由放在 `src/routes/`，服务逻辑放在 `src/domain/`
- 所有数据库操作通过 `data/` 层，不在路由中直接操作 MongoDB

### 禁止

- 不在 RPC 信封中使用驼峰命名（`moduleName`、`methodName`）
- 不破坏现有 RPC 方法签名（增加参数用可选参数，不删除已有参数）
- 不在 SSE 流中发送非 `data:` 前缀的帧
- 不在路由中直接调用 `database.py` 的方法
- 不硬编码 API 路径或集合名称
- 不对文件路径进行字符串拼接（必须用 `os.path.join` + `os.path.realpath`）