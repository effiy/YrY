---

doc_type: test
title: "MCP 协议服务 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-12"
source_prds: ["12-需求-MCP协议服务"]
source_modules: ["12-prd-task-MCP协议服务"]
source_okr: [yiai-003]

type: test
---

# MCP 协议服务 — 测试规格

> 来源 PRD：[12-需求-MCP协议服务.md](../../prds/2026-08/12-需求-MCP协议服务.md)
> 开发方案：[12-prd-task-MCP协议服务.md](../../devs/2026-08/12-prd-task-MCP协议服务.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖 FastMCP 5 个工具定义、REST 代理端点（`/mcp/tools`、`/mcp/call`）、跨版本兼容序列化、工具调用执行。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock MCP server + 后端服务） | 每次提交 |
| L2 集成 | pytest + httpx | YiAi 服务（mock 外部依赖） | 每次提交 |
| L4 端到端 | 手动 + Claude Code | 真实 YiAi + Claude Code MCP 客户端 | 发布前 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | MCP 工具发现 `GET /mcp/tools` | L2 |
| COV-2 | MCP 工具调用 `POST /mcp/call` | L2 |
| COV-3 | `chat_with_ollama` 工具 | L1 |
| COV-4 | `list_ollama_models` 工具 | L1 |
| COV-5 | `health_check` 工具 | L1 |
| COV-6 | `list_collections` 工具 | L1 |
| COV-7 | `query_collection` 工具 | L2 |
| COV-8 | `mount_to_app` FastAPI 挂载 | L2 |
| COV-9 | `_serialize_tool` 跨版本兼容序列化 | L1 |
| COV-10 | `_extract_content` 递归文本提取 | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mock_mcp_server` | FastMCP 实例（mock 后端服务） | 工具定义和调用测试 |
| `sample_tool_call` | `{name: "health_check", arguments: {}}` | 无参数工具调用 |
| `sample_query_call` | `{name: "query_collection", arguments: {collection_name: "test", filter_json: "{}", limit: 10}}` | 数据库查询工具调用 |
| `test_collection_data` | MongoDB 集合含 5 条测试文档 | `query_collection` 返回数据验证 |

---

## 二、测试用例

### 2.1 MCP 工具发现（COV-1 . L2）

> 自动化落点：`tests/api/test_mcp.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCP-001 | `GET /mcp/tools` 返回 5 个工具 | 1. GET `/mcp/tools`；2. 检查返回的工具列表 | 返回数组包含 `chat_with_ollama`、`list_ollama_models`、`health_check`、`list_collections`、`query_collection` | P0 | 待实现 |
| TC-MCP-002 | 每个工具含 `name`、`description`、`input_schema` | 1. 检查工具列表中第一个工具 | 包含 `{name, description, input_schema}` 三个字段 | P0 | 待实现 |
| TC-MCP-003 | `input_schema` 格式符合 JSON Schema | 1. 检查 `chat_with_ollama` 的 `input_schema` | 包含 `type: "object"`、`properties`、`required` | P0 | 待实现 |
| TC-MCP-004 | `chat_with_ollama` 含 `prompt`、`model`、`system_prompt` 参数 | 1. 检查该工具的 `input_schema.properties` | properties 包含 `prompt`（required）、`model`（可选）、`system_prompt`（可选） | P0 | 待实现 |
| TC-MCP-005 | `query_collection` 含 `collection_name`、`filter_json`、`limit` 参数 | 1. 检查该工具的 `input_schema.properties` | `collection_name` 为 required，`filter_json` 默认 `"{}"`，`limit` 默认 20 | P1 | 待实现 |

### 2.2 MCP 工具调用（COV-2 . L2）

> 自动化落点：`tests/api/test_mcp.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCP-006 | `POST /mcp/call` 调用 `health_check` | 1. POST `/mcp/call` 带 `{name: "health_check", arguments: {}}` | 返回 `{content, structured, raw}`，`content` 包含服务器状态信息 | P0 | 待实现 |
| TC-MCP-007 | `POST /mcp/call` 调用 `list_collections` | 1. 调用 list_collections | 返回 MongoDB 集合名列表 | P0 | 待实现 |
| TC-MCP-008 | `POST /mcp/call` 调用 `list_ollama_models` | 1. Mock Ollama 返回模型列表；2. 调用 | 返回 `[{name: "qwen2.5"}, ...]` | P0 | 待实现 |
| TC-MCP-009 | `POST /mcp/call` 调用不存在的工具 | 1. 调用 `{name: "nonexistent"}` | 返回错误信息，非 500 | P0 | 待实现 |
| TC-MCP-010 | `POST /mcp/call` 缺少必填参数 | 1. 调用 `chat_with_ollama` 不传 `prompt` | 返回参数校验错误 | P1 | 待实现 |
| TC-MCP-011 | `POST /mcp/call` 响应包含 `content`、`structured`、`raw` | 1. 调用任意工具；2. 检查响应结构 | `content` 为文本，`structured` 为 JSON（如可序列化），`raw` 为格式化的原始结果 | P1 | 待实现 |

### 2.3 各 MCP 工具功能（COV-3 ~ COV-7 . L1/L2）

> 自动化落点：`tests/unit/test_mcp_tools.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCP-012 | `chat_with_ollama` 正常调用 | 1. Mock OllamaService.generate_response 返回 "你好"；2. 调用工具 | 返回内容 "你好" | P0 | 待实现 |
| TC-MCP-013 | `chat_with_ollama` 使用默认 model | 1. 不传 model 参数；2. 调用 | 使用默认 `qwen3.5:4b` | P1 | 待实现 |
| TC-MCP-014 | `chat_with_ollama` 支持 system_prompt | 1. 传 `system_prompt: "用中文回答"`；2. 调用 | system_prompt 传递给 OllamaService | P1 | 待实现 |
| TC-MCP-015 | `list_ollama_models` 返回模型列表 | 1. Mock OllamaService.list_models 返回 `["qwen2.5", "nomic-embed-text"]` | 返回 `["qwen2.5", "nomic-embed-text"]` | P0 | 待实现 |
| TC-MCP-016 | `health_check` 返回多行状态 | 1. 调用 health_check | 返回文本包含 `server`、`mongodb`、`ollama`、`rss`、`auth` 等字段 | P0 | 待实现 |
| TC-MCP-017 | `list_collections` 返回 8 个集合 | 1. Mock MongoDB 返回集合列表；2. 调用 | 返回 `["menus", "users", "sessions", "bugs", "static_files", "knowledge_files", "rss_sources", "audit_logs"]` | P0 | 待实现 |
| TC-MCP-018 | `query_collection` 正常查询 | 1. 插入 3 条测试文档到 `test_coll`；2. 调用 `query_collection("test_coll")` | 返回 JSON 字符串包含 3 条文档 | P0 | 待实现 |
| TC-MCP-019 | `query_collection` 带 filter_json | 1. 插入文档 `{title: "a"}, {title: "b"}`；2. 调用 `query_collection("test", '{"title": "a"}')` | 仅返回 `title: "a"` 的文档 | P0 | 待实现 |
| TC-MCP-020 | `query_collection` 限制 limit | 1. 插入 50 条文档；2. 调用 `limit: 10` | 返回最多 10 条 | P0 | 待实现 |
| TC-MCP-021 | `query_collection` 上限 100 | 1. 调用 `limit: 200` | 实际限制为 `min(200, 100) = 100` | P1 | 待实现 |
| TC-MCP-022 | `query_collection` 不存在的集合 | 1. 调用 `query_collection("nonexistent_coll")` | 返回空结果或错误信息，非 500 | P1 | 待实现 |

### 2.4 FastAPI 挂载与兼容性（COV-8 + COV-9 + COV-10 . L1/L2）

> 自动化落点：`tests/api/test_mcp.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCP-023 | `mount_to_app` 挂载到 FastAPI | 1. 创建 FastAPI app；2. 调用 `mount_to_app(app)`；3. 启动 TestClient | `/mcp/` 路径可访问（streamable HTTP） | P0 | 待实现 |
| TC-MCP-024 | REST 代理与 MCP 协议共存 | 1. 挂载后测试 `/mcp/tools`（REST）和 `/mcp/`（MCP Streamable HTTP） | 两个路径均正常响应 | P1 | 待实现 |
| TC-MCP-025 | `_serialize_tool` 跨 SDK 版本兼容 | 1. 使用 mock Tool 对象（模拟不同 SDK 版本属性） | 序列化不抛异常，正确提取 `name`/`description`/`input_schema` | P0 | 待实现 |
| TC-MCP-026 | `_extract_content` 递归提取嵌套文本 | 1. 输入 `[{type: "text", text: "hello"}, {type: "image", data: "base64..."}]` | 返回 `"hello"`（仅提取 text 类型） | P0 | 待实现 |
| TC-MCP-027 | `_jsonable` 处理不可序列化对象 | 1. 输入含 `ObjectId` 的结果；2. 序列化 | 不抛 `TypeError`，`ObjectId` 转为字符串 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-MCP-EDGE-001 | 并发调用 `POST /mcp/call` | 1. 10 并发调用 `health_check` | 全部成功，无竞态（health_check 无副作用） | P1 | 待实现 |
| TC-MCP-EDGE-002 | `chat_with_ollama` 超长 prompt（> 10KB） | 1. 传入 15KB 的 prompt | 正常处理或返回明确错误 | P1 | 待实现 |
| TC-MCP-EDGE-003 | `query_collection` 的 filter_json 非法 JSON | 1. 传入 `filter_json: "not json"` | 返回 JSON 解析错误 | P1 | 待实现 |
| TC-MCP-EDGE-004 | MCP Streamable HTTP 握手流程 | 1. 发送 MCP 协议的 `initialize` 请求 | 返回正确的 `initialize` 响应 | P2 | 待实现 |
| TC-MCP-EDGE-005 | 工具调用超时（30s） | 1. Mock `chat_with_ollama` 花费 40s；2. 调用 | 超时后返回错误，不无限等待 | P1 | 待实现 |
| TC-MCP-EDGE-006 | REST 代理的工具名大小写敏感 | 1. 调用 `{name: "HEALTH_CHECK"}` | 返回工具不存在错误（大小写敏感） | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-MCP-REG-001 | 缺陷 3：SDK 版本升级后 `_serialize_tool` 异常 | Mock 新版 SDK Tool 对象属性结构 | 序列化不抛异常，降级为 `repr()` 或 `dir()` 提取 | P1 | 待实现 |
| TC-MCP-REG-002 | 缺陷 4：`raw` 字段泄露内部信息 | 检查 `call_mcp_tool` 响应中的 `raw` 字段 | 不包含 MongoDB 连接字符串、API Key 等敏感信息 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 MCP 5 个工具可发现 | `/mcp/tools` 返回完整列表 | TC-MCP-001 ~ 005 |
| FR-02 MCP 工具调用 | `/mcp/call` 正确执行 | TC-MCP-006 ~ 011 |
| FR-03 chat_with_ollama | 支持 prompt/model/system_prompt | TC-MCP-012 ~ 014 |
| FR-04 list_ollama_models | 返回模型名列表 | TC-MCP-015 |
| FR-05 health_check | 返回多子系统状态 | TC-MCP-016 |
| FR-06 list_collections | 返回集合名列表 | TC-MCP-017 |
| FR-07 query_collection | 支持 filter + limit | TC-MCP-018 ~ 022 |
| FR-08 mount_to_app | FastAPI 路由注册 | TC-MCP-023 ~ 024 |
| FR-09 跨版本兼容 | _serialize_tool + _extract_content | TC-MCP-025 ~ 027 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | Claude Code 真实集成测试 | MCP 协议兼容性最关键的验证 | 手动测试或自动化脚本使用 `@anthropic-ai/claude-code` |
| G-2 | MCP Streamable HTTP 完整协议测试 | SSE + JSON-RPC 握手流程未覆盖 | 使用 MCP SDK 客户端编写集成测试 |
| G-3 | `chat_with_ollama` 使用 `run_in_executor` 的线程池耗尽场景 | 高并发时可能阻塞 | pytest-benchmark 压力测试 |
| G-4 | `query_collection` 绕过 repository 层的一致性 | 不同路径查询同一数据可能结果不同 | 对比 `query_collection` 和 `data_service.query_documents` 返回结果 |