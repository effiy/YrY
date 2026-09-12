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
- [测试策略](#测试策略)
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
├── shared/             # 横切关注点（config、response、error_codes、logging、utils、cache、metrics、migration、sse_utils）
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
| `domain/ai/` | `chat.py`、`tools/`（core/builtin/mcp） | — |
| `domain/auth/` | JWT + bcrypt 辅助函数 | — |
| `domain/execution/` | `executor.py` | — |
| `domain/files/` | `__init__.py` 重新导出 `read_file`、`write_file`、`delete_file`、`rename_file`、`delete_folder`、`rename_folder`、`upload_image` | `local.py`、`storage.py`、`paths.py` |
| `domain/knowledge/` | `scanner.py`（树遍历 + frontmatter 解析）、`watcher.py`（apscheduler 轮询循环）、`writer.py`（markdown 写回） | — |
| `domain/rag/` | `engine.py`（`rag_query`、`rag_chat_stream`、`rag_file_query`、`rag_file_chat_stream`）、`indexer.py`（`get_kb_index`、`build_file_index`）、`settings.py`、`paths.py` | — |
| `domain/rss/` | `feed.py`、`scheduler.py` | — |
| `domain/state/` | 状态记录 CRUD 辅助函数 | — |
| `domain/wework/` | `__init__.py` 重新导出 `send_message` | `client.py` |
| `domain/audit/` | `decorator.py`（审计装饰器）、`logger.py`、`models.py` | — |
| `services/ai/` | `chat_service.py`（重导出）、`llm_provider.py`（LLMProvider/OllamaProvider/DeepSeekProvider）、`compaction.py` | — |
| `services/alert/` | `alert_service.py` | — |
| `services/analytics/` | `aggregator.py`、`collector.py`、`query_engine.py` | — |
| `services/audit/` | `audit_service.py` | — |
| `services/backup/` | `backup_service.py`、`scheduler.py` | — |
| `services/bridge_service.py` | 一次性桥接 token 管理（YiPet → YiVad） | — |
| `services/code_health_service.py` | 代码健康分析（规模/密度/复用/重复检测） | — |
| `services/custom_fields/` | `custom_field_service.py` | — |
| `services/database/` | `data_service.py`（`query_documents`、`create_document`、`update_document`、`delete_document`） | — |
| `services/export/` | `export_service.py` | — |
| `services/knowledge/` | `knowledge_service.py`（扫描 / 读取 / 写入 / 元数据 CRUD） | — |
| `services/milestone/` | `milestone_service.py` | — |
| `services/notification/` | `notification_service.py` | — |
| `services/rag/` | `rag_service.py`（包装 `domain/rag/engine.py` 供路由使用） | — |
| `services/report/` | `report_service.py` | — |
| `services/rss/` | `feed_service.py`、`rss_scheduler.py` | — |
| `services/tags/` | `tag_service.py` | — |
| `data/` | `database.py`（MongoDB 单例）、`repository.py`、`sessions.py`、`chat_records.py` | — |

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

### 测试策略

- **测试框架：pytest 8** — `python -m pytest tests/ -v` 运行测试套件。配置在 `pyproject.toml` 中（`pythonpath = ["src"]`、`testpaths = ["tests"]`、`--cov=src`）。
- **覆盖率**：通过 `pytest-cov` 生成 term-missing + html 报告（`htmlcov/`）。shared 模块目标 90%+ 覆盖率。
- **测试分类**：
  | 类型 | 标记 | 位置 | 运行方式 |
  |------|------|------|----------|
  | 单元测试 | 无（默认） | `tests/test_*.py` | `pytest tests/ -v` |
  | 集成测试 | `@pytest.mark.integration` | `tests/test_*.py` | `pytest tests/ -v -m integration` |
  | 慢速测试 | `@pytest.mark.slow` | `tests/test_*.py` | `pytest tests/ -v -m slow` |
  | 确定性 Agent 测试 | 无 | `/tmp/test_*.py`（独立脚本） | `python /tmp/test_*.py` |
  | 在线端到端 | 无 | `/tmp/e2e_*.py`（独立脚本） | `python /tmp/e2e_*.py` |
- **测试结构**：
  - `tests/conftest.py`：src/ 路径设置 + 共享 fixtures（`sample_text`、`sample_json_text`、`sample_markdown_json`）
  - `tests/test_utils.py`：工具函数（estimateTokens、cleanText、truncateText、extractJsonFromText 等）
  - `tests/test_error_codes.py`：ErrorCode 枚举 + map_http_to_error_code
  - `tests/test_response.py`：StandardResponse、success、fail
  - `tests/test_exceptions.py`：BusinessException
  - `tests/test_config.py`：YamlConfigSettingsSource、Settings
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

### 2026-09-10 — SSE 工具去重 + 模块边界更新

- **`shared/sse_utils.py`**：新增 `stream_sync()` — 供同步生成器的 SSE 流式传输。
- **`server/routes/execution.py`**：删除重复的 `_format_sse`/`_stream_async`/`_stream_sync`（24 行），改为从 `shared.sse_utils` 导入。
- **`server/routes/rag.py`**：删除重复的 `_format_sse`/`_stream_async`（19 行），改为从 `shared.sse_utils` 导入。
- **`services/code_health_service.py`**：移除重复的 case-insensitive 项目目录搜索循环（死代码）。
- **模块边界表更新**：移除过期的 `services/execution/`、`services/storage/`、`store.py`；新增 15 个未记录的模块（`alert`、`analytics`、`audit`、`backup`、`bridge_service`、`code_health_service`、`custom_fields`、`export`、`milestone`、`notification`、`report`、`tags`、`domain/audit/`、`llm_provider`、`compaction`）。

### 2026-08-21 — pytest 测试基础设施

- **`pyproject.toml`**：pytest 配置 — `pythonpath = ["src"]`、`testpaths = ["tests"]`、`--cov=src` 附带 term-missing + html 报告、`slow` + `integration` 标记。
- **`tests/conftest.py`**：src/ 路径设置 + 共享 fixtures（`sample_text`、`sample_json_text`、`sample_markdown_json`）。
- **`tests/`**（新增）：5 个测试套件，76 个测试 — `test_utils.py`（estimateTokens、cleanText、truncateText、extractJsonFromText、isNumber、formatFileSize、formatTokens、chunkList 等）、`test_error_codes.py`（ErrorCode 枚举 + map_http_to_error_code）、`test_response.py`（StandardResponse、success、fail）、`test_exceptions.py`（BusinessException）、`test_config.py`（YamlConfigSettingsSource._flatten、Settings._to_list）。
- **覆盖率**：shared/error_codes.py 100%、shared/exceptions.py 100%、shared/response.py 100%、shared/utils.py 93%、shared/config.py 92%。

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
| [RPC 协议规范](../YiKnowledge/projects/yiai/specs/rpc-protocol.md) | RPC 协议完整规范（请求/响应、错误码、方法契约） |
| [API 参考](../YiKnowledge/projects/yiai/specs/api-reference.md) | 完整 API 端点参考（16 个路由模块、REST + RPC） |
| [数据模型](../YiKnowledge/projects/yiai/specs/data-model.md) | MongoDB 数据模型参考（28 个集合、字段定义、索引策略） |
| [添加领域模块](../YiKnowledge/projects/yiai/workflows/adding-domain-module.md) | 添加领域模块工作流 |
| [跨项目开发](../YiKnowledge/projects/yiai/workflows/cross-project-development.md) | 跨项目开发工作流 |
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