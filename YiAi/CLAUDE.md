# CLAUDE.md — YiAi

> FastAPI 后端服务器，服务于 Yi 家族。提供 AI 聊天（Ollama）、双写持久化的文件管理、RSS 聚合、WeCom 消息推送、通用模块执行以及状态存储。基于 uvicorn（ASGI）运行，MongoDB 通过 Motor（异步）访问。

---

## 目录

- [基本信念](#基本信念)
- [铁律](#铁律)
- [架构方向](#架构方向)
- [项目概况](#项目概况)
- [项目结构](#项目结构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [项目约束](#项目约束)
- [降级对策](#降级对策)
- [自我约束](#自我约束)
- [近期变更](#近期变更)
- [参考指南](#参考指南)

---

## 基本信念

- **信任模型** — 当模型给出合理的响应时，不要用多余的验证质疑它，除非结果具有破坏性。
- **珍惜注意力** — 注意上下文窗口的经济性。优先使用简洁的代码，避免冗长的脚手架。花在样板代码上的每个 token 都是从解决问题上夺走的 token。
- **验证现实** — 磁盘上的代码是唯一的真相。在未阅读模块之前，不要假定它存在或以某种方式运行。
- **先思考再编码** — 不要假设，要呈现权衡。明确陈述假设；如果存在多种解释，逐一列出；如果存在更简单的方案，直接说明。

## 铁律

1. **简洁优先** — 最小化代码，不写推测性内容。不超过需求范围的功能；不为单次使用的代码做抽象；不为不可能的场景做错误处理。
2. **精准修改** — 只改动必须改的部分。不要"顺便优化"相邻代码；匹配现有风格；每一行改动都可追溯到用户需求。
3. **目标驱动执行** — 定义成功标准，循环直到验证通过。将任务转化为可验证的目标；对于多步骤任务，陈述简要计划，每步附带验证检查。
4. **禁止静默写入** — 编辑前先读取文件。使用现有约定（snake_case、FastAPI 模式、双写模型）。除非有明确理由，否则不要引入新模式。

## 架构方向

> **模块化。**
>
> YiAi 是一个 FastAPI 后端服务器。方向是朝着更紧密的模块边界发展：每个领域子包（`domain/ai/`、`domain/files/`、`domain/rss/`、`domain/wework/`、`domain/execution/`、`domain/auth/`、`domain/state/`）拥有自己的逻辑；`services/` 层将其包装后提供给路由。新功能应落在命名的领域模块中，并具有清晰的公共 API 表面（`__init__.py` 导出可调用的契约），而不是将处理程序散落在现有文件中。
>
> 参考：[../../rules/architecture-direction.md](../../rules/architecture-direction.md)

## 项目概况

| 维度 | 值 |
|-----------|-------|
| 名称 | YiAi |
| 类型 | 后端 |
| 版本 | 1.0.0 |
| 架构 | 单一 `src/` 树，无嵌套包 |
| 生态系统 | Python 3.10+ / FastAPI |
| 运行时 | uvicorn（ASGI），端口 10086 |
| 数据库 | MongoDB 通过 Motor（异步） |
| 自托管 | Ollama（LLM 推理）、OSS（对象存储）、llama_index（RAG） |
| 认证 | bcrypt + PyJWT（可选的 X-Token 头部） |
| 配置 | `config.yaml` + pydantic-settings |
| 知识库 | `../YiKnowledge` markdown 树，apscheduler 监视器（macOS FSEvents 的轮询回退方案） |
| 测试框架 | pytest 8 + pytest-asyncio + httpx + pytest-cov |
| 代码检查/格式化 | ruff（参见 ruff.toml） |

## 项目结构

```
src/
├── app.py              # FastAPI 应用工厂 + 生命周期
├── shared/             # 横切关注点（config、response、error_codes、logging、utils）
├── data/               # MongoDB 访问（database 单例、repository、sessions、store）
├── models/             # Pydantic 模式 + 集合名称常量
├── domain/             # 业务逻辑 — ai/ auth/ execution/ files/ knowledge/ rag/ rss/ state/ wework/
├── services/           # 服务层 — ai/ database/ execution/ knowledge/ rag/ rss/ storage/
└── server/             # HTTP 层 — middleware、errors、routes/
```

## 模块边界

领域包外的每个调用者只能依赖该包的公共 API 表面。内部文件保持私有。

| 模块 | 公共 API | 内部（禁止直接导入） |
|---|---|---|
| `domain/ai/` | `chat.py` | — |
| `domain/auth/` | JWT + bcrypt 辅助函数 | — |
| `domain/execution/` | `executor.py` | — |
| `domain/files/` | `__init__.py` 重新导出 `read_file`、`write_file`、`delete_file`、`rename_file`、`delete_folder`、`rename_folder`、`upload_image` | `local.py`、`storage.py`、`paths.py` |
| `domain/knowledge/` | `scanner.py`（树遍历 + frontmatter 解析）、`watcher.py`（apscheduler 轮询循环）、`writer.py`（markdown 写回） | — |
| `domain/rag/` | `engine.py`（`rag_query`、`rag_chat_stream`、`rag_file_query`、`rag_file_chat_stream`）、`indexer.py`（`get_kb_index`、`build_file_index`）、`settings.py`、`paths.py` | — |
| `domain/rss/` | `feed.py`、`scheduler.py` | — |
| `domain/state/` | 状态记录 CRUD 辅助函数 | — |
| `domain/wework/` | `__init__.py` 重新导出 `send_message` | `client.py` |
| `services/ai/` | `chat_service.py` | — |
| `services/database/` | `data_service.py`（`query_documents`、`create_document`、`update_document`、`delete_document`）、`session_service.py` | — |
| `services/execution/` | `executor.py` | — |
| `services/knowledge/` | `knowledge_service.py`（扫描 / 读取 / 写入 / 元数据 CRUD） | — |
| `services/rag/` | `rag_service.py`（包装 `domain/rag/engine.py` 供路由使用） | — |
| `services/rss/` | `feed_service.py`、`rss_scheduler.py` | — |
| `services/storage/` | `oss_client.py` | — |
| `data/` | `database.py`（MongoDB 单例：`find_one`、`find_many`、`insert_one`、`insert_many`、`update_one`、`delete_one`）、`repository.py`（`query_documents`、`get_document_detail`、`create_document`、`update_document`、`delete_document`）、`sessions.py`、`store.py` | — |

### 跨项目协议

YiPet 和 YiVad 共同使用的"RPC 信封"：

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}
response: { "code": 0, "message": "ok", "data": <any> }
```

| 方法 | 契约 |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`。`filter` 字典通过 `_build_filter` 合并到 Mongo 查询中。**切勿使用 `query` — 它会被静默忽略。** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |
| `/read-file`、`/write-file` | `target_file`（而非 `path`）、`content`、可选的 `is_base64` |
| `/upload-image-to-oss` | `data_url`、`filename`、`directory` |

## 数据流

### 通用 RPC

```
YiPet / YiVad
   │ fetch() POST /  body: {module_name, method_name, parameters}
   ▼
FastAPI 根路由处理器
   │ 解析 module → Python 模块，method → 可调用对象，parameters → kwargs
   ▼
services.<domain>.<service>.<method>(**parameters)
   │ （如果是 data_service.query_documents）
   │   弹出 `filter`，合并到 query_params
   │   弹出 pageNum/pageSize/limit/page/fields/exclude/orderBy
   │   _build_filter(query_params) → Mongo 过滤字典
   │   collection.find(filter_dict, projection).sort().skip().limit()
   ▼
MongoDB（Motor 异步）
   ▼
{ list: [...], total, pageNum, pageSize, totalPages }
```

### 聊天 SSE

```
client  fetch POST /  body: {services.ai.chat_service.chat, stream:true}
   ▼
chat_service.chat()  →  StreamingResponse(text/event-stream)
   yields: data: {"data": {"message": "..."}}\n\n
   ends:   data: {"done": true}\n\n
   ▼
Ollama (http://localhost:11434/api/chat)
```

### 双写文件持久化

```
POST /write-file {target_file, content}
   │ 1. 写入本地磁盘（主存储 — 如果此步骤失败则返回失败）
   │ 2. 尽力而为 upsert 到 MongoDB static_files（备份）
   ▼
success
```

## 项目约束

### 不可协商的基线

| 入口点 | `main.py`（开发）或 `uvicorn src.app:app`（生产） |
|---|---|
| 配置 | `config.yaml` + pydantic-settings（扁平 YAML 键通过 `YamlConfigSettingsSource` 映射） |
| 语言 | Python 3.10+（整体优先使用 async — 不要混用同步/异步） |
| 文件命名 | snake_case |
| 认证模型 | 可选的 X-Token 头部验证（默认禁用） |
| 文件持久化 | 双写：磁盘（主存储）+ MongoDB（备份，尽力而为 upsert） |
| 静态文件 | 通过 `/static` 提供服务，基础目录可通过 `static.base_dir` 配置 |
| API 响应 | 统一信封：`{ "code": int, "message": str, "data": any }` |
| 错误处理 | `src/shared/error_codes.py` 中的类型化 `ErrorCode` 枚举；领域层抛出 `BusinessException` |
| SSE 流式传输 | 聊天和执行端点返回 `text/event-stream`，包含增量 `data:` 帧 |
| 重试策略 | `tenacity` 用于瞬时故障（网络、MongoDB、Ollama） |
| 降级 | MongoDB 不可用 → 写入失败；认证禁用 → 无门控；observer 禁用 → 无运行时防护 |

### 自我约束

- **测试框架：pytest 8** — `python -m pytest tests/ -v` 运行测试套件。配置在 `pyproject.toml` 中。覆盖率通过 `pytest-cov`（htmlcov/）。
- **不强制执行代码检查或格式化** — 当代码风格偏离成为问题时再添加 `ruff`。

## 降级对策

| 条件 | 行为 |
|-----------|----------|
| MongoDB 不可达 | 写入快速失败；读取返回空结果（无缓存层） |
| Ollama 不可达 | 聊天端点返回 `ErrorCode.AI_UNAVAILABLE`；图像处理端点返回 503 |
| OSS bucket 不可达 | 文件存储仅回退到本地磁盘（双写降级为单写） |
| 认证禁用（默认） | 无门控；所有端点公开 |
| Observer 禁用 | 无节流 / 采样 / 沙箱 / 重入保护 |

## 自我约束

- **领域层拥有逻辑。** 路由永远不直接调用 `data/` — 它们通过 `services/` 调用。领域包永远不导入 `server/`。
- **公共 API 表面是 `__init__.py`**，适用于有该文件的领域包（`domain/files/`、`domain/wework/`）。调用者使用重新导出，而非内部文件。
- **`MongoDB` 单例包装器仅在调用者需要时才增长。** 不要推测性地添加 `update_one` — 仅当调用者实际需要时才添加（参见 2026-07-28 的修复，其中 `find_many`/`delete_one` 是为响应 `domain/files/storage.py` 调用者而添加的）。
- **`_build_filter` 参数名称至关重要。** `filter`（而非 `query`）、`target_file`（而非 `path`）、`cname`/`collection_name`。过去的 bug 都源于调用者使用了错误的名称。

## 近期变更

### 2026-08-21 — pytest 测试基础设施

- **`pyproject.toml`**：pytest 配置 — `pythonpath = ["src"]`、`testpaths = ["tests"]`、`--cov=src` 附带 term-missing + html 报告、`slow` + `integration` 标记。
- **`tests/conftest.py`**：src/ 路径设置 + 共享 fixtures（`sample_text`、`sample_json_text`、`sample_markdown_json`）。
- **`tests/`**（新增）：5 个测试套件，76 个测试 — `test_utils.py`（estimateTokens、cleanText、truncateText、extractJsonFromText、isNumber、formatFileSize、formatTokens、chunkList 等）、`test_error_codes.py`（ErrorCode 枚举 + map_http_to_error_code）、`test_response.py`（StandardResponse、success、fail）、`test_exceptions.py`（BusinessException）、`test_config.py`（YamlConfigSettingsSource._flatten、Settings._to_list）。
- **覆盖率**：shared/error_codes.py 100%、shared/exceptions.py 100%、shared/response.py 100%、shared/utils.py 93%、shared/config.py 92%。

### 2026-08-08 — 当无写入提示被忽略时升级到回退模型（仅侦察停滞恢复）

- **`domain/ai/agent.py`**：无写入任务完成提示触发一次（"[TASK] … never actually invoked the write tool"）— 但如果弱模型忽略它（实际观察到：qwen3.5 / qwen3-coder 做了 `db_schema` 侦察后叙述完成，从未提议 `db_create`），循环就直接以 `completed` 结束但写入从未完成。无写入提示后的新逻辑块：当 `_task_nudged` 已设置、没有写入被执行、用户没有拒绝或引导、尚未升级、且存在 `model_fallback` → 发出 `MODEL_SWITCH`，将 `cfg.model` 替换为回退模型，并注入一条 `[MODEL SWITCH]` 接管消息，明确指出具体失败原因（"only performed read-only reconnaissance … never invoked the write tool"），以便"执行者"模型完成任务。受限于与叙述并停止路径相同的每次运行一次 `_model_escalated` 标志；镜像该路径的结构。被拒绝的写入永远不会重新武装；用户引导优先。（已知限制：门槛是每次运行的 `_write_executed`，因此主写入成功后的*后续*写入不会被提示/升级 — 按任务写入跟踪是未来的迭代方向。）
- **已验证**：确定性 `/tmp/test_nudge_escalation.py`（stub：叙述 → `db_schema` 侦察 → 叙述被忽略 → 升级 → `db_create` + 批准 → 摘要）— 5 次 LLM 调用，`model_switches=[('qwen3.5','qwen3-coder')]`，1 次确认，1 次 `db_create` 执行，`stop=completed`，探测菜单自行清理。在线 `/tmp/e2e_nudge_escalation.py` **2/2**：qwen3.5 两次运行均停滞，两次均升级到 qwen3-coder 执行了 `db_create` 并以 `completed` 结束 — 0 个残留探测。完整回归：所有 11 个后端套件通过（bounded/budget/count_gap/counts/mission/reject_memory/reject_memory_loop/spin/steer_checkpoint/skipped_tool_events/followup_drain）。前端：无变更（vue-tsc 18 基线不变）。

### 2026-08-08（稍晚）— 在 agent 时间线中展示被跳过的工具调用（拒绝/超时/阻止可见性）

- **`domain/ai/agent.py`**：被确认门控的工具被**拒绝、超时或被自动阻止**（拒绝记忆）时，通过追加一个被阻止的 `ToolResult` 跳过 — 但之前它**不**发出 `tool_execution_start`/`tool_execution_end`，因此用户看到确认横幅消失，但没有任何痕迹说明为什么写入没有运行。长度停止路径已经为截断的调用发出 start+end 并附带错误；确认跳过路径现在与之匹配。新的 `_blocked_events(call, blocked)` 辅助函数为每个被阻止的调用发出 `TOOL_EXECUTION_START` + `TOOL_EXECUTION_END`（附带错误，例如 "Rejected by user" / "Confirmation timed out — tool skipped" / "Blocked: identical call…"），并接入并行和顺序执行循环。模型的上下文仍然携带相同的 `ToolResult` 错误 — 行为不变，可见性增加。
- **`YiVad/src/stores/modules/aiChat.ts`** `tool_execution_end` 处理器：当结束的工具匹配待处理确认的工具时，立即清除 `pendingConfirmation` — 确认在后端展示工具结束（已执行或已跳过）的那一刻即被解决。之前，超时确认的横幅会持续到 120s 前端自动拒绝计时器，点击对已解决的 id 是无操作的。
- **已验证**：确定性 `/tmp/test_skipped_tool_events.py`（stub LLM 提议 `db_create`，确认 stub 设为"拒绝"）— `start_events=['db_create']`，`end_events=[('db_create','Rejected by user')]`，tool_result 仍然携带拒绝，`stop=completed`。在线 `/tmp/e2e_skipped_tool.py`（qwen3-coder，拒绝第一次确认）：`db_create_starts=2`（被拒绝的调用及其拒绝记忆自动阻止的重新发出都被展示），两个结束事件都携带错误，0 个残留探测。完整回归：所有 10 个后端套件通过（bounded/budget/count_gap/counts/mission/reject_memory/reject_memory_loop/spin/steer_checkpoint + 本套件）。vue-tsc：0 个新错误（18 基线）。

### 2026-08-08 — aiChat agent 通用数据工具 + 确认门控

- **`domain/ai/data_tools.py`**（新增）：用于替代已移除的逐菜单工具的通用工具 — `db_list`（只读，任意集合）、`db_schema`（将已注册的集合模式作为 LLM 上下文返回）、`db_create`/`db_update`/`db_delete`（写入受 `_WRITABLE_COLLECTIONS` 门控，当前为 `{"menus"}`，+ 确认）。领域知识（菜单文档结构、`meta` 字段）存在于 `_COLLECTION_SCHEMAS` 中，由 `db_schema` 返回；agent 基于集合进行推理，而非硬编码的逐领域工具。在 `domain/ai/tools.py:get_tool_registry` 中延迟接入。
- **`domain/ai/tools.py:execute`**：修复了 `ToolResult.error` 被静默丢弃的问题 — 携带 `{"error": ...}` 的结果字典现在将错误传播到 `ToolResult.error`（之前 `menu_update` 使用不存在的键返回 `error: None`）。
- **`domain/ai/agent.py`**：确认门控 — 循环发出 `confirmation_required`，通过 `_wait_for_confirmation` 暂停（轮询内存中的决策存储，120s 超时），然后仅在 `"approved"` 时执行。向 `AgentEvent` 添加了 `confirmation_id`。工具执行现在将 `on_event` 传递给 `registry.execute`，以便循环发出 `tool_execution_start` / `tool_execution_end`（Pi 的在线工具生命周期）；`end` 事件携带最终的 `content` + `error`。**确认 ID 每轮唯一** — Ollama 在每次生成时重置原生工具调用 ID（`tool_0`、`tool_1`），因此仅 `call.id` 在轮次间会冲突，来自较早轮次的陈旧决策可能自动批准*后来*的、不同的工具调用。`_wait_for_confirmation` 现在接受显式的 `confirmation_id`；预检阶段将其前缀为轮次索引（`t{turn_index}:{call.id}`），同时为 `tool_result` 消息协议保留原始 `call.id`。确定性验证：两轮中相同的原始 `tool_0` 不再继承第一轮的批准。
- **`server/routes/agent.py`**：`POST /agent/confirm {session_id, confirmation_id, approve}` 将批准/拒绝决策写入 `_confirmation_store`；由 `mark_confirmation_seen` 消费一次。**客户端断开连接中止（Pi：断开连接时取消）** — `_watch_disconnect` 与 SSE 流并行运行，设置一个 `abort` 事件，agent 循环在轮次和工具调用之间检查，因此中途关闭聊天会停止循环（而不是等待 120s 确认超时或完成长时间的工具调用）。它轮询原始 ASGI 接收通道（`await asyncio.wait_for(http_request._receive(), timeout=1.0)`）而非 `Request.is_disconnected()`：路由的 body 参数是 Pydantic `AgentChatRequest`（而非 Starlette `Request`），因此 `request.is_disconnected()`/`request._receive` 会引发 `AttributeError`；真正的请求作为 `http_request: Request` 注入。Starlette 的 `is_disconnected()` 也是一个非阻塞检查，仅在已排队的 `http.disconnect` 上触发（在 uvicorn 0.40 中流式传输中不可靠），而等待 `_receive` 会在 uvicorn 注意到传输关闭时立即返回 `http.disconnect`。在线验证：确认等待期间断开连接会中止运行，流在同一秒结束（无 120s 挂起）；待处理的 `db_create` 被拒绝且永不写入。
- **原生 Ollama 工具调用**：`services/ai/model_runtime.py:OllamaRuntime.stream_chat` 现在接受 `tools` 并转发结构化的 `tool_calls`；`agent.py:_stream_llm_response` 将 SDK 工具调用转换为应用 `ToolCall` 并传递注册表的函数定义。`<tool_call>` XML 文本解析器保留作为回退。（在此之前，小型模型如 qwen3.5 很少发出有效的 `<tool_call>` XML，因此 agent 无法可靠地完成任务。）
- **工具参数验证（Pi：`validateToolArguments`）**：`domain/ai/tools.py:_validate_arguments` 在 `ToolRegistry.execute` 内部检查工具调用的 `arguments` 是否符合注册的 JSON schema — 在发出开始事件或调用 `execute` 之前。缺少必填字段和类型不匹配（string/object/array/boolean/integer/number）返回短的模型可读错误字符串；工具永远不会被调用，错误返回给模型以便在下一轮自我纠正。之前格式错误的参数直接流入工具（例如没有 `data` 的 `db_create`），产生不透明的失败。
- **长度停止工具调用失败（Pi：`failToolCallsFromTruncatedMessage`）**：当响应达到模型的输出 token 限制时，其中的任何工具调用可能携带截断的参数。`model_runtime.py` 现在转发 Ollama 的最终 `done_reason`（`"length"`）；`agent.py` 捕获它，并在 `stop_reason == "length"` 时，将该轮中的每个工具调用都标记为失败并附带错误结果（发出 `tool_execution_start`/`tool_execution_end` + 错误 `TURN_END`），而不是执行可能损坏的参数。截断现在作为可读错误展示给模型，提示其进行纠正重试。
- **LLM 重试与退避（Pi：瞬时故障重试）**：`_stream_llm_response` 现在将 `runtime.stream_chat` 调用包装在重试循环中（`AgentConfig.llm_max_retries`，默认 2；通过 `llm_retry_backoff_base` 进行指数退避）。瞬时 Ollama 故障 — 连接重置、首次调用时模型仍在加载到 VRAM、5xx — 自动重试，而不是终结整个 agent 运行，因此聊天驱动的任务可以在 Ollama 中途故障时存活。重试仅在当前尝试中尚未流式传输任何内容时进行：在内容已产出后重试会重复用户已看到的文本。每次重试记录警告。
- **展示 LLM 流错误（修复）**：循环的 LLM 流分支之前完全忽略 `{"error": ...}` 块，因此失败的模型调用被静默丢弃，轮次继续，就好像模型什么都没说一样。现在它发出一个 `error` 事件，以 `agent_end stop_reason="error"` 结束运行，并产出 `{"error": ...}` + `{"done": true}` — 失败到达前端而不是消失。
- **Schema 规则 + 孤儿守卫（`domain/ai/data_tools.py`）**：`menus` schema 条目现在携带一个 `rules` 块 — 菜单目录陷阱（死链接组件、无级联删除、永不删除 `home`、aiChat/RAG 是静态路由、侧边栏按 `meta.title` 排序、`name` 是缓存/权限键）提炼为模型可读的约束，`db_schema` 将其作为上下文返回，以便 agent 在写入前遵守这些规则，而不是在代码中硬编码菜单逻辑。Schema 还声明了 `parent_ref_field: "parent"`，`db_delete` **通用地**使用它（无逐集合代码）：在删除前，它通过 `key` 加载目标，查询 `parent` 等于目标 `path`/`key` 的文档（通过 Mongo `$eq`，绕过 repository 的子串模糊搜索，使 `/system/settings` 不被视为 `/system` 的子节点），并在存在子节点时拒绝 — 报告子节点计数 + 一个示例键，并建议模型先删除子节点或使用 `force: true` 重新运行。`force` 是 `db_delete` 的一个新参数，在其工具定义中记录。在线针对 Mongo 验证：有子节点的父节点被拒绝，先删子节点的删除序列成功，精确匹配守卫不会过度拒绝。
- **确认门控端到端验证（本次会话）**：早期端到端运行中 "Confirmation timed out — tool skipped" 的 120s 失败被追溯到**测试工具的 `resp.read(4096)`** 缓冲了 SSE 帧 — 它将 `confirmation_required` 帧保留到轮询已超时之后，因此 `/agent/confirm` POST 仅在之后才发送。后端门控本身是正确的。基于行的读取器（处理每个 SSE 帧到达时进行处理，匹配前端的 `reader.read()` 循环）在约 1.5s 内解决批准（`WAIT-CHECK checks=1` → `ARRIVE`/`SET` 同一秒 → `WAIT-FOUND checks=2`），`db_create` 执行。用于证明此问题的临时 `/tmp/confirm_debug.log` 工具已被移除。
- **叙述并停止守卫（`domain/ai/agent.py`）**：qwen3.5（一个推理模型）有时将其*计划*作为内容流式输出，并在未发出 `tool_call` 的情况下停止 — 像"创建此菜单"这样的任务以模型描述了 `db_create` 但从未调用它而结束。无工具调用分支现在检查助手的文本是否命名了任何已注册但未执行的工具；如果是，则注入一条 `[CONTINUE]` 用户消息（"you described calling X but did not actually invoke them — call them now"）并继续循环而不是中断。由 `max_turns` 和每次运行上限（`_MAX_NUDGES = 2`）限制，因此顽固的模型无法无限循环。纯问答很少命名工具，经过工具调用的叙述只命名已执行的工具，因此守卫在这些情况下保持安静。在线验证：之前以 `narrate → stop` 结束的端到端运行现在完成 `db_create`（批准已解决，文档已创建）。
- **工具调用 XML 解析错误回退（`domain/ai/agent.py:_stream_llm_response`）**：qwen3.5 间歇性地发出格式错误的工具调用 XML（`Ollama request failed: XML syntax error on line 5: element <function> closed by </parameter>`），Ollama 将其作为通用错误帧展示。使用相同的 `tools` 定义重试是徒劳的 — 损坏的帧往往在所有 `llm_max_retries` 尝试中重复出现，以 `agent_end stop_reason="error"` 结束运行。在包含 `"XML syntax error"` 的错误上，重试现在丢弃 `tools`（`tool_defs = None`），使模型以纯文本回答；agent 循环现有的 `_parse_tool_calls_from_text` 回退然后从文本流中提取任何 `<tool_call>` XML。**XML 错误即使在内容已流出后也重试**（与非 XML 瞬时错误不同，后者仅在内容之前重试以避免重复文本）：像 qwen3.5 这样的推理模型通常先流式输出其*计划*，*然后*搞砸工具帧，因此仅以 `not yielded_content` 为门槛会导致运行停滞在 `stop=error`（观察到：一个启用升级的端到端运行在 14s 时因 XML 错误而终止，日志中零重试警告）。已验证：（1）单元测试 monkeypatching `OllamaRuntime.stream_chat` — 尝试 1 使用 tools → XML 错误，尝试 2 不使用 → 恢复（`RESULT: PASS`）；（2）12 次运行的在线端到端循环以 `stop=completed` 完成 11/12，零 `stop=error`；（3）在内容后修复后，4 次运行的升级样本完成 **4/4**，零 `[error]` 帧。
- **基于失败的模型升级（`domain/ai/agent.py`）**：当提示守卫耗尽（2 次提示）且模型*仍然*叙述工具调用而不执行时，循环现在升级到更强的模型，而不是以任务未完成结束。配置 `agent_model_fallback`（默认 `["qwen3-coder"]`）提供有序列表；在停滞时循环弹出下一个模型，发出 `model_switch` 事件（`message: {from, to}`），注入一条 `[MODEL SWITCH]` 接管消息并附带完整对话上下文，然后继续。每次运行限制一次升级（`_model_escalated`）。`model_fallback` 通过 `AgentChatRequest` → `/agent/chat` 传递（`None` ⇒ 服务器默认，`[]` ⇒ 禁用）。受 Pi 启发的弹性：将停滞的"思考者"替换为有能力的"执行者"，而不是让运行失败。在线验证：qwen3.5 在菜单任务上停滞（轮次 1/3/5 叙述并停止），`model_switch` 触发，qwen3-coder 接管并完成 `db_create`（`created=True`，`stop=completed`）— 同样的停滞之前以 `created=False` 结束。前端 `KnowledgeChatPanel` 展示交接（`> ⚙️ 模型自动切换：qwen3.5 → qwen3-coder`）。
- **无工具任务完成提示（`domain/ai/agent.py`）**：上述两个守卫仅在模型*命名*工具时触发。如果它在类似任务的请求上含糊其辞（不命名任何工具）且从未执行工具，运行将静默以 `stop_reason="completed"` 结束，任务未完成。在正常循环 `break` 之前，如果**本次运行中零工具被执行**（`not _executed_tool_names`）且最后一条用户消息是*具体任务*（`_is_task_request` — 中/英文任务动词子串启发式：创建/删除/更新/列出/查询/count/create/delete/…），循环注入一条 `[TASK]` 用户消息（"if the task requires a tool, call it now; if none is genuinely needed, say so and finish"），然后继续。每次运行限制一次（`_task_nudged`），记录为 "Agent task-completion nudge fired"。纯问答很少包含任务动词（介绍/解释/what is/why are 不是标记），因此在这些情况下保持安静。在线回归检查（2026-08-08）：3/3 创建 + 1/1 查询不变 — 守卫无法干扰成功的运行，因为任何执行了工具的运行都有非空的 `_executed_tool_names`。

### 2026-08-08（稍晚）— 自动引导纯文本消息到运行中的 agent（pi Agent.steer）

- **即时引导排空（`domain/ai/agent.py`）**：循环之前将外部引导存储（`server.routes.agent.get_steering_messages`）拉入 `steering_queue`，该队列仅在*下一次*迭代开始时排空 — 一个轮次的延迟，让模型在见到引导之前按过时指令行动。外部引导现在**直接**追加到 `agent_messages`（Pi 的 `Agent.steer` 语义：指令立即进入上下文）。`steering_queue`/`_drain_steering` 现在是残留的（无任何内容向其提供数据）但保留在原位。
- **`_steering_consumed` 标志（`domain/ai/agent.py`）**：每次运行标志，在任何外部引导落入 `agent_messages` 时设置。设置后，所有三个任务完成检查点被抑制 — 无写入提示、完整性检查点和计数感知间隙检测器各自添加了 `and not _steering_consumed`。理由：一旦人类在运行中引导（"actually use X instead"），他们的*指令*是新的真相，循环不得用基于原始任务文本构建的启发式来质疑它（这会重新武装已放弃的写入或要求已放弃的删除）。模型现在完成修正后的任务，而非原始任务。
- **前端自动引导（`YiVad/src/stores/modules/aiChat.ts`）**：`sendMessage` 之前丢弃 agent 循环运行时的每条消息（`if (sending.value) return;`）— 用户在运行中修正任务（"改成 X，不是 Y"）会静默丢失其话语。当 `sending && agentMode` 时，输入的纯文本消息现在调用 `steerAgent(convKey, msg)`（`POST /agent/steer`），将文本反映为对话中的用户气泡，并 toast 成功/失败。斜杠命令（`/steer`、`/followup`、`/stop`、…）和图像保持之前的行为。
- **占位符（`YiVad/src/views/aiChat/components/ChatInput.vue`）**：agent 模式占位符现在显示 "Agent is running — type to redirect it, or /followup <msg> to queue after it finishes"，将引导能力展示出来，而不是隐藏在 `/steer` 语法后面。
- **已验证（2026-08-08）**：确定性引导检查点测试（`/tmp/test_steer_checkpoint.py`）— RUN A 运行中被引导：无删除重新武装，无提示触发，`stop=completed`；RUN B 基线（无引导）：检查点触发，完整的创建→更新→删除任务完成。所有约 112 个后端单元/集成检查通过。在线端到端（`/tmp/e2e_steer_live.py`，qwen3-coder，自动批准）：运行中引导 "title 改为 'Final'，不是 'Changed'" 胜过了原始计划 — `update_titles=['Changed','Final'] last_title='Final'`，无 `db_delete`，`stop=completed`。只读查询健全性不变（`mutated=False`）。vue-tsc：0 个新错误（18 个先前存在的无关错误）。

### 2026-08-08（稍晚）— 拒绝记忆：自动阻止重复的已拒绝写入

- **拒绝账本（`domain/ai/agent.py`）**：确认门控现在记住用户明确拒绝的内容，按会话。模块级 `_session_rejections: Dict[session_id, List[str]]` 存储规范调用签名 — `_call_signature` = `f"{name}|{json.dumps(arguments, sort_keys=True, ensure_ascii=False)}"`，因此两个调用"相同"当且仅当相同工具 + 相同参数，无论提供者重用的调用 id。当 `_wait_for_confirmation` 返回 `"rejected"` 时，预检阶段调用 `_remember_rejection`；`"timeout"` 故意不被记住（模糊 — 可能需要在恢复后重新尝试）。每个会话限制为最近 `_MAX_SESSION_REJECTIONS = 20` 条（丢弃最旧的）。
- **自动阻止相同的重新发出（`domain/ai/agent.py` 预检）**：在发出 `CONFIRMATION_REQUIRED` 之前，预检检查 `_is_rejected_call(session_id, call)` — 如果用户已经拒绝了这个确切的调用，它被**自动阻止**：`_write_rejected = True` 且一个 `ToolResult(error="Blocked: identical call was previously rejected by the user in this session. Do NOT retry it — change your approach or ask the user how to proceed.")` 被反馈给模型，**无第二次提示**。这关闭了之前记录的已接受边缘情况（"模型可能仍然重新尝试刚被拒绝的写入，弹出一个*新的*确认用户可以再次拒绝"）— 旋转守卫仅在 3 个连续相同的观察后才捕获它，意味着最多 2 次冗余重新提示。
- **防御性穿透**：来自 `_wait_for_confirmation` 的意外决策值（`approved`/`rejected`/`timeout` 之外的任何值）被视为跳过（`_write_rejected = True`，"Confirmation decision invalid — tool skipped"）— 它永远不能穿透到执行。数据始终由用户门控；用户只是不会被问同样的问题两次。
- **验证（2026-08-08）**：（1）纯辅助函数 9/9 单元测试（`/tmp/test_reject_memory.py`：键排序参数、按会话隔离、空会话无操作、去重、有界列表、unicode 稳定性）；（2）确定性循环集成测试（`/tmp/test_reject_memory_loop.py`）— stub LLM 提议 `db_create` 然后在拒绝后重新发出**相同**调用；真正的预检自动阻止了它：`wait_calls=1`（无重新提示），`confirmations=1`，`blocked_seen=True`，`executed=False`，`stop_reason=completed`；（3）在线端到端（`/tmp/e2e_reject_memory.py`，qwen3-coder，引导重试）：`confirm_count=1 blocked_seen=True doc_created=False final_stop=completed` — 模型的真实重新发出被自动阻止，附带 "Blocked: identical call" 错误，零第二次提示。所有先前套件仍然通过（20+15+15+9+17+9）。

### 2026-08-08（稍晚）— 轮次预算感知（pi：在 max_turns 内规划）

- **问题**：`turn_index`/`max_turns` 仅到达前端（SSE 事件）— **模型从未看到自己的轮次预算**，因此它过度规划并在 `max_turns_reached` 时被中途截断。一个在第 7/10 轮的 agent 愉快地开始一个它无法完成的新 3 步计划。
- **`_budget_warning(turn_index, max_turns, warn_leftover=3)`（`domain/ai/agent.py`）**：纯辅助函数，返回一次性 `[BUDGET]` 注释（"本次运行最多 N 轮，当前第 X 轮，还剩 R 轮。压缩非必要步骤；若不够完成，明确说还差哪些，方便用户回复「继续」"），在运行距限制 `warn_leftover` 轮以内时触发一次。在轮次开始时注入，每次运行仅一次（`_budget_injected`），仅在接近上限时 — 正常运行（在 max_turns−3 之前完成）永远不会看到它。`[BUDGET]` 前缀遵循现有的 `_last_user_text` `[`-跳过约定，因此注入的注释永远不会为完整性检查点遮蔽用户的真实任务（已验证：一个写入任务在尾随 `[BUDGET]` 注释后仍然被读取为写入请求）。
- **已验证**：15/15 单元测试（`/tmp/test_budget.py` — 触发边界在剩余 3 时，最后一轮剩余 0，紧凑预算轮次 1/2，自定义 `warn_leftover`，`[`-跳过弹性）。在线：恢复工具（运行 1 `max_turns=2`）在服务器日志中触发 "Agent budget warning injected … turn 1/2, 1 left"，恢复仍然完成完整的生命周期 PASS。回归：cycle e2e SUCCESS，所有套件（bounded/spin/mission/counts/count_gap）通过。

### 2026-08-08（稍晚）— 重复观察旋转守卫（pi：打破卡住的循环）

- **问题**：模型可能陷入每轮重新发出相同工具调用并观察相同结果 — 对未更改查询的读取循环，或重新尝试刚被拒绝的写入。现有守卫都无法捕获它（叙述守卫需要*命名但未执行*的工具；升级需要叙述；提示需要写入间隙），因此旋转的模型耗尽所有 `max_turns` 并以 `max_turns_reached` 结束，任务未完成。
- **检测（`domain/ai/agent.py`）**：纯辅助函数 `_turn_observation_signature(tool_results)`（每轮名称 + 有效结果内容；错误渲染为 `Error: …`）和 `_advance_spin_state(prev, run, obs, threshold=3)`（仅叙述轮次重置链；相同非空观察递增；达到 `threshold` 触发一次并重置运行，使相同旋转不会每轮重新触发）。真正的进展*改变*观察 — 写入改变稍后读取看到的数据，不同查询返回不同行 — 因此正常的创建→更新→删除周期永远不会被计为旋转。
- **提示**：在 3 个连续相同观察时，循环注入一条 `[TASK]` 用户消息（"stop repeating this step; re-read the task and do the next step; if a step was rejected by the user, do NOT retry it"）并继续。每次运行限制一次（`_spin_nudged`）。拒绝感知子句直接打破重新尝试已拒绝写入的循环（之前每轮弹出一个新确认）。
- **已验证**：15/15 单元测试（`/tmp/test_spin.py` — 签名形状包括错误结果、叙述重置、在阈值触发、阈值参数、正常创建周期跟踪从不触发、已拒绝写入重复触发）。在线：菜单周期端到端保持 SUCCESS，**零** "Agent spin guard fired" 日志行（正常观察从不误触发）。回归：bounded/mission/counts/count_gap 套件全部通过。

### 2026-08-08（稍晚）— 在 LLM 上下文中限制过大工具结果（pi 上下文预算）

- **问题**：`db_list` 可以返回最多 1000 个文档（约 75K tokens）— 远超 16K `ollama_num_ctx` 窗口。压缩仅在轮次*之后*触发并*总结掉*模型所需的确切数据，Ollama 超窗口从中间截断（可能在中途分割 tool_result 的 JSON）— 这是列表密集型菜单工作中小型模型任务失败的真实原因。实测：`db_list menus limit=1000` 今天返回 **21,267 字符**。
- **`_bound_tool_result(name, content, max_chars)`（`domain/ai/agent.py`）**：纯辅助函数，仅在 LLM 上下文渲染边界限制单个工具结果 — 持久化和 UI 保留完整内容。保留头部（70%）+ 尾部（22%）并追加显式注释（`… [result truncated for context: N chars, ~K lines omitted … Re-query with filter/fields/key to fetch the specific items you need.]`），使模型知道其余部分存在以及如何重新查询 — 正确性保留，上下文受限。短结果（< `AgentConfig.max_tool_result_chars`，默认 6000）逐字节原样传递。接入 `_stream_llm_response` 的 `tool_result` → `[Tool result: <name>]` 渲染。
- **已验证**：20/20 单元测试（`/tmp/test_bounded.py` — 短/精确边界原样传递，列表形状和单块输入的头部/尾部/注释，省略行数准确性，自定义边界，病态输入仍然受限）。在线：大列表只读端到端（`/tmp/e2e_bounded.py`，qwen3-coder）— 一个 21KB 的 `db_list`，`stop=completed`，正确答案（66 个文档，前两个已命名），**零变异工具**；正常周期端到端保持 SUCCESS。回归：mission/counts/count_gap 套件仍然 35/35。

### 2026-08-08（稍晚）— 计数感知部分完成检测

- **`domain/ai/agent.py`**：命名工具检查点捕获"工具被命名但从未执行"，但无法捕获"工具执行次数*少于任务要求*" — 像"创建 2 个菜单"这样的任务，模型创建 1 个并自信地停止，是静默半完成（db_create 确实运行了，因此命名工具检查点和无写入提示都无法触发）。新的 `_parse_task_item_counts(text)` 将每个显式项目计数与同一子句中最近的前置写入动词关联（边界 + 否定感知）："创建 2 个菜单" → `(db_create, 2)`，"删除 2 个，创建 1 个" → `(db_delete, 2)`。`_COUNT_RE` 仅在数字后跟项目名词（`菜单/记录/menu/…`）或在子句边界处的裸量词时将其视为项目计数 — "2 个字段" / "2 小时后" / "2 个层级" 被正确忽略。中断前检查点现在还跟踪每个工具的成功写入计数（`_write_counts`），并在 `need ≥ 2` 且 `have < need` 时，注入一条 `[TASK]` 提示，明确指出确切差距，并指示 agent 先用 `db_list` 验证，不要重复。单元测试：解析器 17/17 + 间隙决策 9/9（`/tmp/test_counts.py`、`/tmp/test_count_gap.py`）。在线无回归："创建 2 个菜单"任务以精确 2 个 `db_create` 和零计数感知触发完成；单项周期仍然 SUCCESS。触发需要真正的部分失败（罕见 — 模型可靠地完成），因此像无写入提示一样，这是一个防御性安全网。

### 2026-08-08（稍晚）— 按会话恢复：忠实的 继续 续接（pi 持久循环）

- **问题**：在 `max_turns_reached` 之后，前端的恢复重新发送**仅文本**历史（仅叙述 — 工具结果仅存在于前端元数据中）。恢复模型必须猜测状态并重新运行已完成的写入 — 实测 3/3 恢复运行重新创建了 `db_create` 已经创建的菜单。
- **会话历史持久化（`domain/ai/agent.py`）**：`save_session_history`/`load_session_history` 持久化每次运行的完整 `agent_messages`（包括 `tool_result` 消息，这些消息渲染给模型为 `[Tool result: <name>] …`），按 `session_id`，内存中存储，1 小时 TTL。`agent_chat_stream` 获得 `resume: bool`（新的 `AgentChatRequest.resume`，通过路由传递）；设置时，恢复的轨迹被前置，只有用户的续接内容在请求中传递。消息摄取现在保留 `name`/`tool_call_id`，使恢复的 `tool_result` 保留其工具名称。
- **显式交接**：恢复合并注入一条 `[RESUME]` 系统注释，命名已执行的工具（"db_create/db_update/db_delete 请勿重复执行"）— 忠实的轨迹对有能力的模型（qwen3-coder）足够了，注释为较弱的模型提供防御。
- **任务感知完成检查**：循环结束时的无写入 / 命名工具 / 计数感知检查点之前以 `_last_user_text` 为门槛，在恢复时它只是"继续"（不是写入请求）— 因此恢复可能以仍有步骤待处理而错误地"完成"。`_is_continuation` 检测裸继续指令；当最后一条用户消息是续接且运行的 `task_text`（原始任务，从 `agent_chat_stream` 传递）是写入请求时，检查针对 `task_text` 运行。每次运行工具跟踪从恢复轨迹的 `tool_result`（`_resume_names`）播种，因此检查针对完整任务进行比较，而不要求重新运行已完成的写入。
- **在线验证（`/tmp/e2e_resume.py`，qwen3-coder，自动批准，严格最终状态断言）**：max_turns=2 和 max_turns=3 场景，8/8 PASS — 恢复完成完整生命周期（所有 db_create/db_update/db_delete 跨两次运行），无重复 `db_create`，清理前零探测菜单。完整性检查点恢复了 2 次恢复运行，这些运行在 `db_delete` 仍待处理时停止（日志："task named tool(s) db_delete that never executed"）。正常（非恢复）周期 SUCCESS 和只读查询 `mutated=False` 不变。已知限制：弱默认 qwen3.5 在恢复时仍可能重做已完成的写入，尽管有轨迹 + `[RESUME]` 注释（已记录的模型不稳定）；任务感知检查点然后恢复*缺失*的步骤。

### 2026-08-08（稍晚）— 诚实的 agent_end stop_reason：max_turns_reached vs completed

- **`domain/ai/agent.py`**：最终的 `AGENT_END` 之前硬编码 `stop_reason="completed"`，即使循环在任务中途耗尽 `max_turns`（步骤仍待处理）— 前端对未完成的任务显示"完成"。`_natural_stop` 标志现在在自然完成 `break` 时设置；当 `while turn_index < max_turns` 循环退出时，发出 `stop_reason="max_turns_reached"` 并附带日志行。已验证：一个 3 步任务，`max_turns=2` 现在报告 `max_turns_reached`（之前是 `completed`）；一个自然 3 步周期仍然报告 `completed`。这是用户回复"继续"的队列 — 循环在下一个请求时从累积历史恢复。
- **YiVad 前端**展示它：`src/stores/modules/aiChat.ts` + `KnowledgeChatPanel.vue` 在 `agent_end` 且 `stop_reason=max_turns_reached` 时追加 `> ⚠️ 已达到最大轮次，任务可能未完成。回复「继续」可接着完成。`

### 2026-08-08（稍晚）— 压缩后任务重新注入（pi transformContext）

- **`_inject_mission_if_needed` + 接入 `transform_context` 钩子（`domain/ai/agent.py`）**：压缩将旧消息折叠为摘要，仅保留最后 4 条逐字消息，因此一个长的多步骤任务可能在运行中丢失其确切要求（菜单名称、路径、项目计数）— 模型然后以错误的细节"完成"或遗漏项目。`agent_chat_stream` 现在捕获第一条用户消息作为任务，并接入之前未使用的 `transform_context` 钩子，在每次 LLM 调用前逐字重新注入，但**仅当它不再逐字存在于上下文中**（压缩已修剪它）且尚未注入时。短运行（任务仍然是最后一条用户消息）不受影响 — 零行为变化 — 这就是为什么周期（9 轮）和查询端到端完全相同地通过。单元测试 9/9（`/tmp/test_mission.py`）：存在时无操作、压缩后注入、幂等、空列表边缘情况。日志 "Agent mission re-injected after context loss"。

### 2026-08-08（稍晚）— 提示加固：否定感知写入检测 + 完整性检查点

- **否定感知 `_is_write_request`（`domain/ai/agent.py`）**：任务启发式（`_write_marker_count`）现在将每个写入动词出现扫描回前一个**子句边界**（而非固定窗口）以查找否定标记（`不要`/`禁止`/`请勿`/`do not`/`not `…）。修复了两个真实 bug：（1）一个只读查询，其文本说"只读，不要创建/更新/删除任何菜单"被误读为写入任务，并得到一个虚假提示（每次查询浪费约 40s 的升级 + 重试轮次；现在 `elapsed 64s→16s`）；（2）固定 12 字符窗口在"不要调用 db_create/db_update/db_delete"上失败，因为第二个/第三个工具名称将否定推到了窗口之外。子句边界扫描也保持混合情况正确（"不要创建菜单，但把 X 的标题更新为 Y" → 仍然是写入任务，计数 1）。单元测试 27/27 包括否定 + 标记计数情况。
- **`_write_executed` 跟踪*成功*写入 + 新 `_write_rejected` 标志（`domain/ai/agent.py`）**：**被拒绝**的确认之前仍然填充 `_write_executed`（被拒绝工具的 `ToolResult` 带有 `error="Rejected by user"` 通过 tool_results 循环），因此完整性检查点在拒绝路径上错误触发。`_write_executed` 现在仅记录那些结果无错误的 `requires_confirmation` 工具，`_write_rejected` 在确认决策 != `"approved"` 时设置。两个提示都检查 `not _write_rejected`，因此**两者都不能重新武装用户拒绝的写入**。
- **完整性检查点（`domain/ai/agent.py`）**：运行可能执行了写入但仍然部分完成 — 观察到创建+更新完成，然后模型在未执行其计划的删除的情况下停止（在此之前周期约 2/5）。无写入提示（`_write_executed` 非空）和叙述守卫（模型*忘记*工具而不是叙述它）都不触发。当运行即将结束时，循环计算**任务文本中命名但从未执行的写入工具**（`td.requires_confirmation and td.name in last_user and td.name not in _executed_tool_names`），如果有，注入一条 `[TASK]` 提示，明确指出缺失工具的精确名称。命名具体工具优于要求模型自我评估 — 通用的"还有剩余步骤吗？"在模型自信地认为已完成时被拒绝（早期的启发式变体在每次多步骤完成时触发，从未恢复失败，并在自然完成时消耗一轮）。以命名但未执行工具为门槛意味着完全完成的多步骤运行支付**零**额外轮次，单项创建任务（仅命名 `db_create`，已运行）永远不会被检查。2026-08-08 在线实测：菜单周期创建→更新→删除 **8/8 SUCCESS**（8 次中的 2 次 — `cd`、`cg` — 丢弃了删除，被命名 `db_delete` 的检查点恢复；其他 6 次自然完成，无检查点轮次）。
- **升级接管是拒绝感知的（`domain/ai/agent.py`）**：当 `[MODEL SWITCH]` 接管在 `_write_rejected` 已设置的运行上触发时，消息追加 "do NOT re-attempt that specific write — respect the rejection." 已知边缘（已接受）：如果模型无论如何重新尝试刚被拒绝的写入，它弹出一个*新的*确认用户可以再次拒绝 — 数据始终由确认提示门控，从不强制。

### 2026-07-31 — RAG + Knowledge 模块

- **`domain/rag/` + `services/rag/`**：基于 `llama_index` 构建的新 RAG（检索增强生成）模块。`engine.py` 暴露 `rag_query`、`rag_chat_stream`（SSE）、`rag_file_query`、`rag_file_chat_stream`。混合检索（向量 + BM25 通过 `QueryFusionRetriever`），可选的 `LLMRerank`，通过 `_NumberSourcesPostprocessor` 实现内联 `[Source N]` 引用编号。按 `file_path` 子串的范围过滤。持久化索引位于 `./data/rag_store`。在 `config.yaml` 的 `rag:` 部分下配置（embed/llm 模型、top_k、chunk_size、混合/检索开关）。
- **`domain/knowledge/` + `services/knowledge/`**：知识库管理模块。`scanner.py` 遍历 `../YiKnowledge` markdown 树并解析 frontmatter，`watcher.py` 通过 apscheduler 轮询（macOS FSEvents 已损坏 — 参见 `YiKnowledge/engineer/learn/lessons/gotchas/macos-fsevents-silent-drop.md`），`writer.py` 执行 markdown 写回，并将元数据 upsert 到 MongoDB `knowledge_files` 集合。
- **`config.yaml`**：添加了 `knowledge`（base_dir、watcher_enabled、watcher_poll_seconds）和 `rag`（模型、top_k、chunk_size、混合/检索/重排/引用开关）部分。
- **`server/routes/`**：添加了 `knowledge.py` 和 `rag.py` 路由模块；在 `src/app.py` 中注册。

### 2026-07-28 — Bug 修复（数据层）

- **`data/database.py`**：向 `MongoDB` 单例添加了缺失的 `find_many` 和 `delete_one` 包装器。之前 `domain/files/storage.py`（`delete_oss_file`、`delete_file_tags`、`get_all_tags`）调用了它们但它们未定义 → 运行时 `AttributeError`。
- **`data/repository.py`**：修复了 `_handle_range_or_list_filter`，使 2 元素字符串列表不再静默丢弃过滤条件。之前，`tags: ["work", "personal"]` 返回所有文档，因为两个元素都没有解析为日期/数字，函数返回 `True` 而不设置 `filter_dict[key]`。现在穿透到 `{'$in': value_list}`。

### 2026-07 — 跨项目协议规范

- 记录了 `filter`（而非 `query`）契约 — YiPet 的 `SessionService.list/get` 正在发送 `query:` 并获得空结果。已在 YiPet 中修复。
- 记录了 `target_file`（而非 `path`）契约 — YiVad 的 `fileService.readFile/writeFile` 正在发送 `path` 并获得 422。已在 YiVad 中修复。

## 参考指南

| 资源 | 位置 |
|----------|---------|
| [docs/specs/](./docs/specs/) | 架构规范 + 模式模板（领域、服务、RPC、数据） |
| [docs/workflows/](./docs/workflows/) | 任务工作流（添加领域模块、API 端点、测试） |
| 单体仓库入口 | `../CLAUDE.md` — 跨项目关系、共享约定 |
| 项目 README | `README.md` |
| 服务器配置 | `config.yaml` |
| 路由定义 | `src/server/routes/` |
| 领域逻辑 | `src/domain/` |
| 服务层 | `src/services/` |
| 数据访问 | `src/data/` |
| 共享工具 | `src/shared/` |
| 数据模型 | `src/models/` |
| 错误码 | `src/shared/error_codes.py` |
| 响应包装器 | `src/shared/response.py` |
| 应用工厂 | `src/app.py` |
| 架构方向规则 | `../../rules/architecture-direction.md` |