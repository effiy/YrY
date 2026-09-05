# YiAi

> 基于 FastAPI 的 AI 服务中心 — 聊天推理、双写持久化的文件存储、RSS 聚合、WeCom 消息推送、通用模块执行引擎、任意键值记录的状态存储、基于 markdown 知识库的 RAG（检索增强生成）层，以及知识库监视器。基于 uvicorn（ASGI）运行，MongoDB 通过 Motor（异步）访问，自托管 LLM 推理通过 Ollama，RAG 通过 llama_index，对象存储通过 OSS。

> **入门指南** → `YiKnowledge/projects/YiAi/onboarding.md`（8 个部分：环境搭建 / 工作流 / 已知陷阱 / 第一天任务）

---

## 目录

- [概述](#概述)
- [亮点](#亮点)
- [架构](#架构)
- [模块边界](#模块边界)
- [数据流](#数据流)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [API 设计](#api-设计)
- [配置](#配置)
- [领域语言](#领域语言)
- [近期变更](#近期变更)
- [相关项目](#相关项目)

---

## 概述

YiAi 是一个 FastAPI 后端服务器，提供 AI 驱动的服务（Ollama 聊天）、双写持久化的文件管理、WeCom 机器人消息推送、RSS 源聚合、通用模块执行引擎、任意键值记录的状态存储、基于 YiKnowledge markdown 树的 RAG 层（llama_index + 混合检索 + 内联引用），以及将 markdown 树镜像到 MongoDB 元数据中的知识库扫描器/监视器。它基于 uvicorn 运行，使用 MongoDB 通过 Motor 进行异步数据访问，并与外部存储（OSS）和自托管 LLM 推理（Ollama）集成。

服务器遵循严格的领域驱动模块化架构：每个领域子包拥有自己的逻辑，并通过 `__init__.py` 暴露清晰的公共 API。所有端点返回统一的响应信封，附带类型化错误码。

---

## 亮点

- **Ollama 驱动的 LLM 聊天**，支持 SSE 流式传输和图像处理（qwen-vl-utils）。
- **文件管理**，支持双写持久化（本地磁盘 + MongoDB 备份）。
- **WeCom（企业微信）机器人消息推送**，通过 webhook 集成。
- **RSS 源聚合**，基于 APScheduler 的调度。
- **通用模块执行引擎**（GET/POST + SSE 流式传输）。
- **状态存储**，用于任意键值记录，支持类型/标签过滤。
- **RAG（检索增强生成）**，通过 llama_index — 混合检索（向量 + BM25）、可选重排、内联 `[Source N]` 引用编号、按文件路径范围过滤。
- **知识库管理** — markdown 树扫描器，支持 YAML frontmatter 解析、基于 apscheduler 的监视器（macOS FSEvents 的轮询回退方案）、附带 MongoDB 元数据 upsert 的写回。
- **MCP（Model Context Protocol）服务器集成**。
- **统一 API 响应信封**，附带类型化错误码。
- **配置驱动架构**，通过 `config.yaml` + pydantic-settings。
- **Observer 运行时监控** — 节流、采样、沙箱、重入守卫。
- **JWT + bcrypt 认证**（可选，X-Token 头部验证）。
- **Tenacity 支持的重试**，用于瞬时故障。

---

## 架构

YiAi 沿**模块化**轴推进：按领域拆分为命名模块；在模块之间暴露清晰的公共 API；分离入口 / 领域 / 持久化 / 外部层。

```
┌──────────────────────────────────────────────────────────────┐
│  HTTP 层 (src/server/)                                       │
│  FastAPI 应用工厂 · 认证中间件 · 全局错误处理器              │
│  路由 (about, auth, files, execution, wework, maintenance,  │
│        state, system, users, health) — 每个 APIRouter        │
└──────────────────────┬───────────────────────────────────────┘
                       │ 调用
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  服务层 (src/services/)                                      │
│  包装领域逻辑 + 数据访问；向路由暴露粗粒度操作              │
│  子包: ai/ · database/ · execution/ · knowledge/ ·          │
│        rag/ · rss/ · storage/                               │
└──────────────────────┬───────────────────────────────────────┘
                       │ 委托给
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  领域层 (src/domain/)                                        │
│  子包: ai/ · auth/ · execution/ · files/ ·                  │
│        knowledge/ · rag/ · rss/ · state/ · wework/          │
│  每个拥有自己的逻辑 + 通过 __init__.py 暴露公共 API          │
└──────────────────────┬───────────────────────────────────────┘
                       │ 持久化 / 查询
                       ▼
┌──────────────────────────────────────────────────────────────┐
│  数据层 (src/data/)                                          │
│  MongoDB 单例 · motor 异步 · repository 模式                │
│  集合: sessions · static_files · state_records ·            │
│        seeds · faqs · apis · ...                            │
└──────────────────────────────────────────────────────────────┘

横切关注点 (src/shared/):
  config.py · exceptions.py · response.py · error_codes.py ·
  logging.py · utils.py
```

### 执行引擎

通用模块执行端点允许调用者通过 HTTP 调用任何 `services.<domain>.<service>.<method>` 函数，长时间运行的方法支持 SSE 流式传输。这就是 YiPet 和 YiVad 无需一次性端点即可访问后端的方式 — 例如 `{"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {...}}`。

---

## 模块边界

领域包外的每个调用者只能依赖该包的公共 API 表面。内部文件保持私有。

| 模块（位于 `src/domain/` 或 `src/services/` 下） | 公共 API | 内部文件（不直接导入） |
|---|---|---|
| `domain/ai/` | `chat.py`（Ollama 聊天 + 图像处理） | — |
| `domain/auth/` | JWT + bcrypt 辅助函数 | — |
| `domain/execution/` | `executor.py`（动态模块/方法调用） | — |
| `domain/files/` | `__init__.py` 重新导出 `read_file`、`write_file`、`delete_file`、`rename_file`、`delete_folder`、`rename_folder`、`upload_image` | `local.py`、`storage.py`、`paths.py` |
| `domain/knowledge/` | `scanner.py`（markdown 树遍历 + frontmatter 解析）、`watcher.py`（apscheduler 轮询）、`writer.py`（markdown 写回） | — |
| `domain/rag/` | `engine.py`（`rag_query`、`rag_chat_stream`、`rag_file_query`、`rag_file_chat_stream`）、`indexer.py`（`get_kb_index`、`build_file_index`）、`settings.py`、`paths.py` | — |
| `domain/rss/` | `feed.py`、`scheduler.py` | — |
| `domain/state/` | 状态记录 CRUD 辅助函数 | — |
| `domain/wework/` | `__init__.py` 重新导出 `send_message` | `client.py` |
| `services/ai/` | `chat_service.py`（包装 `domain/ai/chat.py` + 模型） | — |
| `services/database/` | `data_service.py`（`query_documents`、`create_document`、`update_document`、`delete_document`）、`session_service.py` | — |
| `services/execution/` | `executor.py` | — |
| `services/knowledge/` | `knowledge_service.py`（扫描 / 读取 / 写入 / 元数据 CRUD） | — |
| `services/rag/` | `rag_service.py`（包装 `domain/rag/engine.py` 供路由使用） | — |
| `services/rss/` | `feed_service.py`、`rss_scheduler.py` | — |
| `services/storage/` | `oss_client.py` | — |
| `data/` | `database.py`（MongoDB 单例：`find_one`、`find_many`、`insert_one`、`insert_many`、`update_one`、`delete_one`）、`repository.py`（`query_documents`、`get_document_detail`、`create_document`、`update_document`、`delete_document`）、`sessions.py`、`store.py` | — |

### 跨项目协议

所有三个项目就以下形式达成一致（"RPC 信封"）：

```
POST /  body: {
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { <method-specific shape> }
}

response: { "code": 0, "message": "ok", "data": <any> }
```

关键参数名称（这些曾是过去 bug 的来源）：

| 方法 | 契约 |
|---|---|
| `data_service.query_documents` | `parameters: { cname | collection_name, filter?: dict, pageNum?, pageSize?, limit?, fields?, excludeFields?, orderBy?, orderType? }`。`filter` 字典通过 `_build_filter` 合并到 Mongo 查询中。**切勿使用 `query` — 它会被静默忽略。** |
| `data_service.create_document` | `parameters: { cname, data }` |
| `data_service.update_document` | `parameters: { cname, key, data }` |
| `data_service.delete_document` | `parameters: { cname, key }` |

---

## 数据流

### 通用 RPC（YiPet 和 YiVad 共同使用）

```
YiPet / YiVad
   │
   │ fetch() POST /
   │ body: {module_name, method_name, parameters}
   ▼
FastAPI 根路由处理器 (src/server/routes/execution.py 或 app.py)
   │
   │ 解析 module_name → Python 模块
   │ 解析 method_name → 该模块上的可调用对象
   │ 将 parameters 合并到方法的 kwargs 中
   ▼
services.<domain>.<service>.<method>(**parameters)
   │
   │ （如果是 data_service.query_documents）
   │   弹出 `filter`，合并到 query_params
   │   弹出 pageNum/pageSize/limit/page/fields/exclude/orderBy
   │   调用 _build_filter(query_params) → Mongo 过滤字典
   │   collection.find(filter_dict, projection).sort().skip().limit()
   ▼
MongoDB（Motor 异步）
   │
   ▼
{ list: [...], total, pageNum, pageSize, totalPages }
```

### 聊天 SSE 流式传输

```
YiPet / YiVad
   │
   │ fetch() POST /
   │ body: {module_name: "services.ai.chat_service", method_name: "chat",
   │        parameters: {model, messages, stream: true, system?, images?}}
   ▼
chat_service.chat()
   │
   │ StreamingResponse(text/event-stream)
   │ yields: data: {"data": {"message": "..."}}\n\n
   │ ends:   data: {"done": true}\n\n
   ▼
Ollama HTTP API (http://localhost:11434/api/chat)
```

### 双写文件持久化

```
POST /write-file  {target_file, content}
   │
   │ 1. 写入本地磁盘（主存储，如果此步骤失败则返回失败）
   │ 2. 尽力而为 upsert 到 MongoDB static_files（备份）
   ▼
response: success
```

---

## 快速开始

### 前提条件

- Python 3.10+
- MongoDB 5+（本地或远程）
- （可选）Ollama 运行在 `http://localhost:11434` 用于 AI 聊天端点
- （可选）阿里云 OSS bucket + 凭证用于对象存储

### 安装与运行

```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器（通过 uvicorn --reload 热重载）
python main.py

# 启动生产服务器
uvicorn src.app:app --host 0.0.0.0 --port 10086

# 验证健康状态
curl http://localhost:10086/health/observer
```

### 配置

编辑 `config.yaml` — 唯一配置来源，通过 `pydantic-settings` 配合 `YamlConfigSettingsSource` 加载。参见下方[配置](#配置)部分。

### 健康检查

```bash
curl http://localhost:10086/health/observer
# → { "code": 0, "message": "ok", "data": { "throttle": ..., "sampler": ..., ... } }
```

---

## 项目结构

```
YiAi/
├── main.py                    # 开发入口点（uvicorn 带 --reload）
├── config.yaml                # 服务器配置（唯一配置来源）
├── requirements.txt           # Python 依赖
├── CLAUDE.md                  # 助手指南
├── README.md                  # 本文件
└── src/
    ├── app.py                 # FastAPI 应用工厂 + 生命周期
    ├── shared/                # 共享工具
    │   ├── config.py          # Pydantic 设置（读取 config.yaml）
    │   ├── exceptions.py      # BusinessException 定义
    │   ├── response.py        # 统一响应包装器（success/fail）
    │   ├── error_codes.py     # ErrorCode 枚举
    │   ├── logging.py         # 日志设置
    │   └── utils.py           # 文本、哈希、时间、文件工具函数
    ├── data/                  # MongoDB 数据访问层
    │   ├── database.py        # MongoDB 单例（连接、索引、CRUD 包装器）
    │   ├── sessions.py        # Session 集合操作
    │   ├── store.py           # 状态记录存储操作
    │   └── repository.py      # 通用集合 repository（query_documents, ...）
    ├── models/                # Pydantic 数据模型
    │   ├── schemas.py         # 请求/响应模式
    │   └── collections.py     # 集合名称常量
    ├── domain/                # 业务领域逻辑
    │   ├── ai/                #   Ollama 聊天 + 图像处理
    │   ├── auth/              #   JWT + bcrypt
    │   ├── execution/        #   通用模块/方法执行
    │   ├── files/             #   双写：磁盘 + MongoDB + OSS
    │   ├── knowledge/         #   Markdown 树扫描器 + 监视器 + 写入器
    │   ├── rag/               #   llama_index 检索 + 聊天引擎
    │   ├── rss/               #   RSS 源获取器 + APScheduler
    │   ├── state/             #   通用键值状态记录
    │   └── wework/            #   WeCom webhook 消息推送
    ├── services/              # 服务层（包装领域 + 数据）
    │   ├── ai/                #   chat_service.py
    │   ├── database/          #   data_service.py, session_service.py
    │   ├── execution/         #   executor.py
    │   ├── knowledge/         #   knowledge_service.py
    │   ├── rag/               #   rag_service.py
    │   ├── rss/               #   feed_service.py, rss_scheduler.py
    │   └── storage/           #   oss_client.py
    └── server/                # HTTP 服务器层
        ├── middleware.py      # 认证中间件（X-Token 头部验证）
        ├── errors.py          # 全局异常处理器
        └── routes/            # APIRouter 模块
            ├── about.py, auth.py, execution.py, files.py,
            │   health.py, knowledge.py, maintenance.py, rag.py,
            │   state.py, system.py, users.py, wework.py
```

---

## API 设计

所有端点返回统一信封：

```json
{ "code": 0, "message": "ok", "data": <any> }
```

- **成功** → `code: 0`（`ErrorCode.OK.business`）。
- **失败** → 类型化错误码定义在 `src/shared/error_codes.py` 中。
- **分页** → 响应包含可选的 `pagination` 键（`{ total, page, pageSize }`）。
- **SSE 流式传输** → 聊天和执行端点返回 `text/event-stream`，包含增量 `data:` 帧。
- **路由** → 组织为 `src/server/routes/` 下的 `APIRouter` 模块，在 `src/app.py` 的 `create_app()` 工厂中组装。
- **认证** → 可选的 `X-Token` 头部验证（中间件在 `src/server/middleware.py` 中，默认禁用）。

### 路由模块

| 模块 | 路径前缀 | 用途 |
|---|---|---|
| `files.py` | `/files` | 文件 CRUD + 多部分上传 + `/read-file`、`/write-file`、`/delete-file`、`/delete-folder`、`/rename-file`、`/rename-folder`、`/upload-image-to-oss` |
| `execution.py` | `/exec` | 通用模块/方法执行（同步 + SSE） |
| `wework.py` | `/wework` | WeCom webhook 发送 |
| `maintenance.py` | `/maintenance` | 图像 / 会话清理 |
| `state.py` | `/state` | 状态记录 CRUD，支持类型/标签过滤 |
| `knowledge.py` | `/knowledge` | 知识库扫描 / 读取 / 写入 / 元数据 CRUD |
| `rag.py` | `/rag` | RAG 查询 + RAG 聊天（SSE）+ 按文件 RAG 查询/聊天 |
| `health.py` | `/health` | Observer 运行时健康检查 |

---

## 配置

`config.yaml` 是唯一配置来源。顶层部分：

| 部分 | 用途 |
|---|---|
| `server` | 主机、端口、日志级别 |
| `mongodb` | 连接 URL、数据库名称 |
| `static` | 本地磁盘文件的 `base_dir` |
| `ollama` | 主机 URL、默认模型 |
| `oss` | Bucket、区域、凭证 |
| `wework` | Webhook URL |
| `rss` | 源列表 + 调度器间隔 |
| `auth` | 启用/禁用 X-Token 验证 |
| `observer` | 节流、采样、沙箱、重入配置 |
| `knowledge` | `base_dir`、`watcher_enabled`、`watcher_poll_seconds`（macOS 使用轮询 — FSEvents 已损坏） |
| `rag` | `embed_model`、`llm_model`、`persist_dir`、`top_k`、`chunk_size`、`chunk_overlap`、`auto_rebuild_*`、`hybrid_retrieval_enabled`、`rerank_enabled`、`inline_citations_enabled` |

通过环境变量覆盖任何键（pydantic-settings 先读取环境变量，然后回退到 YAML）。

---

## 领域语言

YiAi 是一个 AI 服务中心 — 一个将聊天推理、文件存储、外部消息推送、RSS 摄取和通用执行框架结合在一起的后端。

### 术语定义

| 术语 | 定义 |
|------|------------|
| **State Record（状态记录）** | 具有唯一键的持久化键值记录，支持类型/标签分类和时间范围检索。 |
| **Module Execution（模块执行）** | 一种通用执行机制，通过 HTTP GET/POST 动态调用 `services/` 或 `domain/` 中的任何模块方法。 |
| **Dual Write（双写）** | 一种同时将文件持久化到本地磁盘（主存储）和 MongoDB（备份）的策略，优先保证磁盘写入成功，MongoDB upsert 尽力而为。 |
| **Seed（种子数据）** | 存储在 MongoDB `seeds` 集合中的初始化数据/配置种子，用于系统启动时的数据填充。 |
| **Observer（观察者）** | 一组运行时监控组件：Throttle（限流）、Sampler（慢请求采样）、Sandbox（执行沙箱）、ReentrancyGuard（重入保护）。 |
| **RPC 信封** | 每个跨项目调用使用的 `{module_name, method_name, parameters}` 请求形式。 |
| **RAG** | 检索增强生成 — `domain/rag/engine.py` 从 YiKnowledge markdown 树上的 llama_index 持久化索引中检索 top-k 块，然后流式输出基于这些块的 LLM 回答。 |
| **Hybrid Retrieval（混合检索）** | `QueryFusionRetriever` 结合向量 + BM25 检索，使用倒数排名融合 — 对概念查询和关键词查询都表现良好。 |
| **Inline Citations（内联引用）** | `_NumberSourcesPostprocessor` 在每个检索块前添加 `[Source N]`，使聊天 LLM 可以发出 `[N]` 标记，映射到 UI 中显示的排名来源列表。 |
| **Knowledge Watcher（知识监视器）** | `domain/knowledge/watcher.py` — apscheduler 轮询循环（默认 5s），扫描 YiKnowledge markdown 树的变更。macOS FSEvents 在此 Mac 上静默损坏，因此使用轮询作为回退。 |
| **`filter`（而非 `query`）** | `query_documents` 中的 MongoDB 过滤参数名称。`query` 不被识别 — 请使用 `filter`。 |

### 关系

- **Module Execution** 请求以 **services/** 层中的方法为目标，该方法进而调用 **domain/** 层。
- **State Record** 属于一个类型类别，并携带可选的标签用于过滤。
- **Dual Write** 是文件操作的持久化模型；它跨越**本地磁盘**和 **MongoDB static_files** 集合。
- **Observer** 组件包装请求管道：Throttle 和 Sampler 是 FastAPI 中间件。
- **Seed** 数据在初始化期间馈送到数据库集合中。
- **RPC 信封** 是 YiVad、YiPet 和执行引擎之间的通用语言 — 永远不要发明新形式；复用信封。

### 示例对话

> **用户**：查找最近上传文件的状态记录。
> **系统**：我查询了状态记录 API，按 `record_type=file_upload` 和最近 7 天内的 `created_after` 过滤。返回了 3 条记录，每条带有一个键和关联的元数据。
> **用户**：这些文件是通过双写持久化的吗？
> **系统**：是的。写入时，文件首先保存到本地静态目录，然后通过双写机制 upsert 到 MongoDB 的 `static_files` 集合。`target_file` 作为唯一索引以保证幂等性。

### 消歧标记

| 术语 | 不要混淆为 |
|------|---------------------|
| **State Record** | 不是会话（会话记录是单独的 MongoDB 集合） |
| **Module Execution** | 不是 RPC（无持久连接）；它是 HTTP 同步 / SSE 流式传输 |
| **Dual Write** | 不是事务性写入（无两阶段提交）；在本地磁盘写入成功时返回 |
| **Seed** | 不是迁移（不处理模式变更）；仅数据填充 |
| **Observer** | 不是 APM（不跟踪分布式跨度）；它是进程内运行时监控 |
| **RAG** | 不是向量数据库；llama_index 是索引，MongoDB 是元数据存储，markdown 文件是真相来源 |
| **Knowledge Watcher** | 不是基于 FSEvents 的；apscheduler 轮询循环（FSEvents 在此 Mac 上静默丢弃事件） |
| **`filter`** | 不是 `query`（后端的 `query_documents` 仅识别 `filter`）；不是 Mongo 的 `$filter` 聚合阶段 |

---

## 近期变更

### 2026-07-31 — RAG + Knowledge 模块

- **`domain/rag/` + `services/rag/`**：基于 `llama_index` 构建的新 RAG 模块。`engine.py` 暴露 `rag_query`、`rag_chat_stream`（SSE）、`rag_file_query`、`rag_file_chat_stream`。混合检索（向量 + BM25 通过 `QueryFusionRetriever`），可选的 `LLMRerank`，通过 `_NumberSourcesPostprocessor` 实现内联 `[Source N]` 引用编号。按 `file_path` 子串的范围过滤。持久化索引位于 `./data/rag_store`。在 `config.yaml` 的 `rag:` 部分下配置。
- **`domain/knowledge/` + `services/knowledge/`**：知识库管理模块 — `scanner.py` 遍历 `../YiKnowledge` markdown 树并解析 frontmatter，`watcher.py` 通过 apscheduler 轮询（macOS FSEvents 已损坏 — 参见 `YiKnowledge/lessons/gotchas/macos-fsevents-silent-drop.md`），`writer.py` 执行 markdown 写回，并将元数据 upsert 到 MongoDB `knowledge_files` 集合。
- **`config.yaml`**：添加了 `knowledge`（base_dir、watcher_enabled、watcher_poll_seconds）和 `rag`（模型、top_k、chunk_size、混合/检索/重排/引用开关）部分。
- **`server/routes/`**：添加了 `knowledge.py` 和 `rag.py` 路由模块；在 `src/app.py` 中注册。

### 2026-07 — Bug 修复（数据层）

- **`data/database.py`**：向 `MongoDB` 单例类添加了缺失的 `find_many` 和 `delete_one` 包装器方法。这些方法被 `domain/files/storage.py`（具体是 `delete_oss_file`、`delete_file_tags`、`get_all_tags`）调用但从未定义，因此这些调用者会在运行时引发 `AttributeError`。
- **`data/repository.py`**：修复了 `_handle_range_or_list_filter`，使 2 元素字符串列表（例如 `tags: ["work", "personal"]`）不再被静默丢弃。之前，如果两个元素都没有解析为日期或数字，函数返回 `True` 而不设置过滤条件 — 调用者拿回所有文档。现在穿透到 `$in` 语义。

### 2026-07 — 跨项目协议规范

- 记录了 `query_documents` 的 `filter`（而非 `query`）契约 — YiPet 和 YiVad 都遇到过这个 bug。参见[模块边界](#模块边界)中的规范表格。
- 记录了 `/read-file` 和 `/write-file` 的 `target_file` 字段名称 — YiVad 曾发送 `path` 并得到 422 响应。

---

## 相关项目

| 项目 | 类型 | 关系 |
|---|---|---|
| **YiPet** | Chrome MV3 扩展 | 前端 — 调用 YiAi 端点进行聊天、会话、认证、配置 |
| **YiVad** | Vue 3 管理后台 | 管理界面 — 可视化和管理 YiAi 数据和服务 |