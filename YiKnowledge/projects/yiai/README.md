---
title: YiAi 知识库索引
tags: [yiai, fastapi, backend, rpc, rag, sse, mongodb, ollama]
category: projects/yiai
created: 2026-08-25
updated: 2026-10-09
source: YiAi
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer, sre, leader, curator]
benefit: "YiAi FastAPI 后端完整知识体系索引——架构分层、RPC 协议、RAG 引擎、SSE 流式、性能优化、可观测性、新人 5 天入门路线图"
benefit_secondary: "覆盖 1,004+ 知识产物（238 PRD · 258 Dev · 254 Test · 254 Task），OKR→PRD→Dev→Test 全链路可追溯"
acceptance_criteria:
  - "架构分层 6 层明确：shared/data/models/domain/services/server"
  - "RPC 信封协议完整定义：请求/响应/错误码/参数契约"
  - "RAG 引擎架构说明：BM25/向量混合检索、缓存、增量索引策略"
  - "SRE 体系：熔断器、优雅关闭、连接池、监控告警、健康检查"
  - "新人 5 天上手路线图：Day1~Day5 任务 + Checklist + 常见坑"
related:
  - ../INDEX.md
  - ../README.md
  - ../../MEMORY.md
  - ../../../YiAi/CLAUDE.md
aliases:
  - yiai-readme
  - yiai-overview
  - yi-family-backend-engine
  - yiai-rag-architecture
  - yiai-rpc-envelope-protocol
---

# YiAi 项目知识库

> **FastAPI 后端引擎** — 单体仓库 `YrY` 的中枢服务，YiVad 管理后台、YiPet Chrome 扩展、YiPot 桌面翻译的唯一数据后端。承载 AI 聊天（Ollama/DeepSeek）、RAG 混合检索引擎、双写持久化文件管理、RSS 聚合、企业微信消息推送、Agent 工具执行、审计日志、实时看板 SSE 等核心能力。

---

## 0. 新人入职指南 — 5 天上手路线图

| 阶段 | 核心任务 | 交付物 | 参考文档 | Checklist |
|------|---------|--------|---------|-----------|
| **Day 1 · 环境搭建** | Python 3.10+ · uv · MongoDB · Ollama · 项目启动成功 | 端口 10086 可访问 `/health` 返回 200 | [快速开始](./workflows/操作指南/001-指南-快速开始.md) | `uv run python main.py` 无报错 ✓ · `/docs` Swagger 可打开 ✓ |
| **Day 2 · 架构概念** | 6 层分层架构 · RPC 信封 · 双写持久化 · SSE 帧 | 手绘架构图一张，标注请求生命周期 | [架构概览](./workflows/架构设计/001-架构-架构概览.md) · [目录结构](./workflows/架构设计/002-架构-目录结构.md) | 能口述 `module_name→importlib→service.method` 调用链 ✓ |
| **Day 3 · 调试单测** | pytest 运行 144 单测 · 单步调试 data_service.query_documents · 构建覆盖率报告 | `htmlcov/index.html` 覆盖率 ≥ shared 模块 90% | [测试策略](./workflows/操作指南/007-指南-测试策略.md) · [性能优化](./workflows/开发规范/006-规范-性能优化.md) | `pytest tests/ -v` 全绿 ✓ · 能使用 `--slow` / `--integration` 标记 ✓ |
| **Day 4 · 功能开发** | 新增 1 个领域模块：API Router + Service + Repository + Pydantic Schema | PR 合入，通过 Code Review | [添加领域模块](./workflows/操作指南/002-指南-添加领域模块.md) · [领域服务模式](./workflows/设计模式/001-模式-领域服务模式.md) | 使用 `StandardResponse` 统一信封 ✓ · ErrorCode + BusinessException 处理 ✓ |
| **Day 5 · PR 准备** | 阅读 Code Review Checklist · 运行 Lint + 全量 Build · 写 1 条 Bug 到知识库 | 独立产出符合规范的 PR | [RPC 协议规范](./workflows/开发规范/005-规范-RPC协议规范.md) · [编码规范](./workflows/开发规范/001-规范-编码规范.md) | 无 ruff 告警 ✓ · PRD→Dev→Test 关联齐全 ✓ |

---

## 0.1 快速入门 — 三阶上手（30 秒 / 5 分钟 / 30 分钟）

> 与 YiPot / YiVad / YiPet / YiKnowledge 统一的三阶入门结构，避免跨项目信息过载。每步配一张表，对应"能做什么 / 去哪看 / 产出是什么"。

### 0.1.1 30 秒速览（YiAi 能做什么，不能做什么）

| 我想了解 | 跳转位置 | 30 秒掌握的关键信息 |
|---------|---------|------------------|
| YiAi 是什么（一句话）| 下方 §1 项目画像"类型/运行时/端口"行 | FastAPI + Motor + Ollama/RAG 的统一后端，端口 `10086`，YiVad/YiPet/YiPot 三端唯一后端 |
| 硬约束红线（违反=CI 红）| §8 关键约束速查（Hard Constraints）顶部 3 条 | ① SSE 端口 7777/8787 已废弃，全部走 10086 <br/> ② RAG embedding `RAG_EMBED_KILL_SWITCH` 默认 ON（节流 3000ms）<br/> ③ RPC 信封必须 `{module_name, method_name, parameters}`，禁止裸路径 |
| 我接手项目该从哪开始 | 下方 §0.2 按角色学习路径 | 找自己的角色（Backend/Rust/SRE/QA/Product）→ 对应首选章节顺序 |

> **结束条件**：你能向别人用一句话介绍 YiAi，并能说出 3 条硬约束中的至少 2 条。

### 0.1.2 5 分钟启动（看到健康检查 + Swagger 并跑一条 RAG 查询）

> 前提：本机已安装 Python 3.10+ · uv · MongoDB 6+ · Ollama（可选）。缺依赖 → 跳 §0 Day 1 环境搭建。

| 步骤 | 命令 / 动作 | 预期结果 | 异常排查跳转 |
|------|------------|---------|------------|
| ① 安装依赖 | `cd /Users/yi/YrY/YiAi && uv sync` | 生成 `.venv`，无 ERROR 红色 | [快速开始](./workflows/操作指南/001-指南-快速开始.md) · §11 FAQ 新 Python 环境问题 |
| ② 启动服务 | `uv run python main.py` 或 `make dev` | 控制台 `Uvicorn running on http://0.0.0.0:10086`，日志字段对齐（trace_id/span_id）| [调试排错](./workflows/操作指南/003-指南-调试排错.md) · §8 硬约束 端口冲突 |
| ③ 健康检查 | `curl -s http://localhost:10086/health \| jq` | 返回 `{"status":"ok","version":"1.0.0","mongodb":"ok","rag":"ON|OFF"}` | §5 SRE 可靠性 · /debug/performance 端点 |
| ④ 跑一条 RAG 查询 | `curl -sS http://localhost:10086/docs` 浏览器打开 → `/search/query` Try it out，参数 `q=如何定义SLO` | 返回 ≥ 3 条 YiKnowledge 结果，每条含 `path` 知识库文件路径 | §6 RAG 数据源集成 · §3 RPC 信封 callService 调用链 |
| ⑤ 质量门禁（5 分钟内跑核心）| `ruff check . && pytest tests/shared tests/routes/test_health.py -v` | ruff 0 warning · 20 tests PASS | §10 技术栈速查 · Code Review Checklist 12 项 |

> **结束条件**：/health 200 + /docs 打开 + ruff + 核心单测全绿。

### 0.1.3 30 分钟主线（独立交付一个新领域模块，完整 PRD→Dev→Test 可追溯）

| 步骤 | 主题 | 用时 | 跳转锚点 / 参考文档 | 交付物 |
|------|------|------|-------------------|-------|
| ① | 模式对齐：读 §3 RPC 信封 + §4 领域 DDD 模式 + 1 个现成 Gold Copy（如 audit_service 或 translation_service）| 5 分 | §3 RPC 信封 · [领域服务模式](./workflows/设计模式/001-模式-领域服务模式.md) | 能画出新模块 Router→Service→Repository→Models 的链路图 |
| ② | 按 0 Day 4 的模板新建 5 个文件：routes/ · services/ · domain/ · models/schemas_xxx.py · tests/test_xxx.py | 10 分 | [添加领域模块](./workflows/操作指南/002-指南-添加领域模块.md) · §3.3 Pydantic 预编译规则 | 5 文件骨架齐全，import 无循环依赖 |
| ③ | 实现 1 条方法 + 用 StandardResponse 统一信封 + ErrorCode + BusinessException | 8 分 | [RPC 协议规范](./workflows/开发规范/005-规范-RPC协议规范.md) §4 错误码 | 用 httpx TestClient 跑通 200 + 422 + 4xx 三类用例各 1 条 |
| ④ | 12 项 CR 自查 + 单测覆盖率 ≥ 80% + ruff/mypy | 5 分 | §9 关键约束 · [编码规范](./workflows/开发规范/001-规范-编码规范.md) | 自查表 12/12 ✅，Coverage 报告对应模块 ≥ 80% |
| ⑤ | PR 关联 Task/PRD/Dev（Frontmatter related 字段）| 2 分 | [代码审查流程](./workflows/流程规范/003-流程-代码审查.md) | PR 标题 `feat(yiai/xxx): 新增 xxx 模块` + links 3 个知识库文件 |

> **结束条件**：PR 已发出 + GitHub Actions CI（ruff + mypy + pytest）全绿。

---

## 0.2 按角色学习路径（我是 Backend/SRE/QA/Product/Leader 从哪切入）

| 角色 | 首选章节顺序 | 重点锚点 | 典型交付任务（2 周内）|
|------|------------|---------|-------------------|
| **后端工程师 Backend** | §0.1.2 → §2 6 层架构 → §3 RPC 信封 → §4 核心子系统 → §10 技术栈 → §11 开发命令 | Motor 连接池预热 · StandardResponse 信封 · 6 层调用链 · RAG llama_index | 新增领域模块 · RAG provider 新增重排器 · Notification Service 接入企微高级消息 |
| **前端工程师（对接 YiVad / YiPet / YiPot）** | §3 RPC 信封（callService 参数格式）→ §4.5 translation_service / bridge_service → §5.2 SSE 帧格式 · AbortSignal 联合取消 | YiAi RPC 唯一契约 · 旧 7777/8787 端口迁移通知 · 桥接 Token 一次性签名（C-006 三端互信）| YiVad 菜单 API 新增字段 · YiPot HTTP 60828 ↔ YiAi 10086 健康状态联动 |
| **SRE / 可靠性** | §5 SRE 可靠性 6 节体系 → §2 架构分层依赖 → §8 硬约束（端口/节流/限流）→ §11 健康端点 | /debug/performance · Prometheus 指标前缀 `yiai_` · Burn Rate Policy 4 级（YiPot 对齐）· apscheduler 60s 轮询 | YiAi 宕机 GameDay（YiPot §16.6 对应 C-001 降级）· 慢查询 Top 10 Dashboard |
| **QA / 测试工程师** | §5 可靠性 → §3 RPC 信封（边界用例）→ §6 RAG 混合检索 · 向量召回异常 → §10 技术栈 pytest-asyncio/httpx | 144 tests 分类标签（slow/integration/rag 需要 --integration）· ErrorCode 42 条全覆盖测试 | DORA 变更失败率基线 · 故障注入测试（Motor 超时 3s、Ollama 429 熔断）|
| **Product 产品经理** | §1 项目画像（功能域边界）→ §4 核心子系统 9 领域 → §6 RAG 知识库消费者路径 → §0 Day1-Day5 能力矩阵 | RAG 消费者能力边界 · AI 聊天 Agent 工具执行清单 · Audit/Backup/State 可追踪能力 | 写一个 RAG 召回体验优化 PRD（对齐 RICE × OKR goal-005）|
| **Leader / 架构师** | §2 6 层架构 → §8 Hard Constraints（红线）→ [INDEX 技能协作链 §4](../INDEX.md) · [跨项目契约 §15](../../yipot/README.md#L560-L713) → §7 目录结构（知识库自描述）| Yi Family RPC 信封 SSOT · 跨项目 6 契约（C-001 ~ C-006）· 单仓库 5 项目 OKR→PRD→Task 追溯 | 季度 ADR-013 "RAG 节流 kill switch 默认 ON" 决策 · 2027-Q1 微服务拆分评估 ADR |

---

## 1. 项目画像

| 维度 | 规格 |
|------|------|
| **项目名称** | YiAi — Yi Family AI Backend Engine |
| **类型** | 后端服务（ASGI） |
| **版本** | 1.0.0 |
| **运行时** | Python 3.10+ · uvicorn ≥ 0.51.0 · 默认端口 `10086` |
| **架构模式** | 单一 `src/` 树 · 6 层分层架构 · 依赖注入 · Domain-Driven |
| **数据库** | MongoDB 6+ · Motor 异步驱动 · 连接池 pool_size=10, max_pool_size=50 |
| **LLM 推理** | Ollama（自托管，默认 :11434）· DeepSeek API · 熔断器 + 优雅降级 |
| **RAG 框架** | llama_index ≥ 0.13.0 · 混合检索（向量 + BM25）· QueryFusionRetriever |
| **配置管理** | `config.yaml` + pydantic-settings · YamlConfigSettingsSource 扁平映射 |
| **知识库** | `../YiKnowledge` Markdown 树 · apscheduler 60s 轮询（macOS FSEvents 回退） |
| **认证授权** | bcrypt 密码哈希 · PyJWT Token · 可选 X-Token 头验证（默认关闭） |
| **可观测性** | Prometheus Metrics · 结构化日志 · `/debug/performance` 性能端点 |
| **测试框架** | pytest 8 · pytest-asyncio · httpx (TestClient) · pytest-cov · 144/144 测试通过 |
| **代码质量** | ruff (lint + format) · mypy 渐进式类型检查 |
| **部署形态** | Dockerfile · docker-compose.yml · 支持 systemd / pm2 |
| **知识产物** | 238 PRD · 258 Dev · 254 Test · 254 Task · 合计 **1,004+** 文件 |

---

## 2. 6 层架构分层全景

```
┌─────────────────────────────────────────────────────────────┐
│  server/          HTTP 接入层                                │
│  ├─ routes/       APIRouter 模块化路由（22 个路由模块）       │
│  ├─ middleware.py  ASGI 纯协议中间件（Auth/Gzip/追踪）        │
│  ├─ errors.py      FastAPI Exception Handler                │
│  ├─ lifespan.py    生命周期：预热/连接池预热/优雅排水         │
│  └─ mcp_server.py  MCP 协议服务器                            │
├─────────────────────────────────────────────────────────────┤
│  services/        服务编排层（18+ 领域服务）                  │
│  ├─ ai/           chat_service · llm_provider · compaction  │
│  ├─ rag/          rag_service （包装 domain/rag）            │
│  ├─ database/     data_service CRUD 统一入口                 │
│  ├─ knowledge/    knowledge_service（扫描/读写/元数据）      │
│  ├─ translation/  translate_service · provider_health       │
│  ├─ analytics/    collector · aggregator · query_engine     │
│  ├─ audit/ backup/ notification/ tags/ milestone/ ...       │
│  └─ bridge_service.py  一次性桥接 Token（YiPet→YiVad）       │
├─────────────────────────────────────────────────────────────┤
│  domain/          业务逻辑层（9+ 领域模块）                   │
│  ├─ ai/           chat.py · tools/(core/builtin/mcp)        │
│  ├─ rag/          engine · indexer · retrieval · llm_stream │
│  ├─ knowledge/    scanner · watcher · writer                │
│  ├─ files/        双写持久化（磁盘+MongoDB）                  │
│  ├─ auth/ audit/ state/ wework/ search/ rss/ execution/     │
├─────────────────────────────────────────────────────────────┤
│  models/          数据契约层（Pydantic v2）                   │
│  ├─ collections.py  集合名称常量（27 个集合）                 │
│  ├─ schemas*.py    Pydantic 模型（31 个，启动时预编译）       │
├─────────────────────────────────────────────────────────────┤
│  data/            数据访问层（MongoDB 封装）                  │
│  ├─ database.py    Motor 单例 · 连接池 · 慢查询监控          │
│  ├─ repository.py  query_documents（$facet 单查询分页）      │
│  └─ chat_records / sessions / mutation / query / ...        │
├─────────────────────────────────────────────────────────────┤
│  shared/          横切关注点（14 个模块）                     │
│  ├─ config.py      pydantic-settings 配置中心                │
│  ├─ response.py    StandardResponse {code, message, data}   │
│  ├─ error_codes.py ErrorCode 枚举（40+ 错误码）               │
│  ├─ exceptions.py  BusinessException + http 映射             │
│  ├─ cache.py       Cache-Aside · LRU · 缓存键中心            │
│  ├─ circuit_breaker.py 时间窗口熔断器（Ollama/DeepSeek）     │
│  ├─ sse_utils.py   orjson SSE 帧格式化 · stream_sync/async  │
│  ├─ status.py      Issue/Bug 状态规范化中心                  │
│  └─ logging / metrics / migration / utils / url_guard       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. RPC 信封协议（跨项目唯一通信契约）

> **唯一入口**：`POST /`（同时挂载根路径和 `/api` 前缀，兼容开发环境 proxy）

### 3.1 请求信封

```json
{
  "module_name": "services.<domain>.<service>",
  "method_name": "<method>",
  "parameters": { "<method-specific-shape>": true }
}
```

### 3.2 响应信封

```json
{ "code": 0, "message": "ok", "data": "<any>" }
```

| code 范围 | 含义 | 处理方式 |
|-----------|------|---------|
| `0` | 成功 | 正常消费 `data` |
| `4xxx` | 客户端错误（参数/鉴权/资源不存在） | 前端提示用户，不重试 |
| `5xxx` | 服务端错误（内部/依赖不可用/超时） | 指数退避重试（3 次），熔断冷却 |

### 3.3 高频方法契约速查

| 方法 | 必须参数 | 易错点 · 真实 Bug 来源 |
|------|---------|---------------------|
| `services.database.data_service.query_documents` | `cname`, `filter?`, `pageNum`, `pageSize` | **`filter` 非 `query`** — `query` 会被后端静默忽略，返回全量结果（2026-07 Bug） |
| `services.database.data_service.create_document` | `cname`, `data` | |
| `services.database.data_service.update_document` | `cname`, `key`, `data` | |
| `services.database.data_service.delete_document` | `cname`, `key` | |
| `/read-file` · `/write-file` | `target_file`（**非 `path`**）, `content` | 错误使用 `path` → 422 Unprocessable（2026-07 Bug） |
| `/upload-image-to-oss` | `data_url`, `filename`, `directory` | |
| `services.ai.chat_service.chat` | `model`, `messages`, `stream: true` | SSE 帧：`data: {"data":{"message":"..."}}\n\n` → `done:true` |
| `services.rag.rag_service.rag_query` | `question`, `scope?` | 检索来源用 `[Source N]` 内联引用 |

---

## 4. 核心子系统架构

### 4.1 RAG 检索引擎

```
  用户提问
    │
    ▼
┌──────────────────────────────────────────────────────────┐
│  全局硬开关 RAG_EMBED_KILL_SWITCH（默认 ON）              │
│  ├─ 允许路径：手动 /rag-build · allow_embed_scope 临时开启 │
│  └─ 阻断未授权的 /api/embed 调用                          │
├──────────────────────────────────────────────────────────┤
│  rag_service.rag_query                                    │
│    ├─ get_kb_index()  从持久化 rag_store/ 加载            │
│    ├─ QueryFusionRetriever  向量 + BM25 混合检索          │
│    │   ├─ 向量检索：Ollama Embedding（节流 3000ms 间隔）  │
│    │   └─ BM25：全文检索（默认 query_embed_enabled=false）│
│    ├─ LLMRerank 可选重排序                                │
│    └─ _NumberSourcesPostprocessor → [Source N] 编号引用   │
├──────────────────────────────────────────────────────────┤
│  缓存层                                                   │
│    ├─ rag_persist_dir/embed_cache.jsonl  全长度覆盖      │
│    │   └─ 取消 2000 字符硬门槛，chunk 100% 命中缓存       │
│    ├─ embed_batch_size = 256  减少 HTTP 往返              │
│    └─ 检索结果 60s TTL Cache-Aside                       │
├──────────────────────────────────────────────────────────┤
│  索引构建（手动触发 + 增量策略）                           │
│    ├─ POST /rag-build  手动触发全量构建（启动时隐式禁用） │
│    ├─ 增量：YIAI_ALLOW_RAG_REFRESH=1 + auto_rebuild=true │
│    └─ kb_indexer.py  二级缓存（_FILE_READ_CACHE/_WALK_MEMO）│
│       └─ ⚠️ 禁用 SimpleDirectoryReader（高频插件分发）    │
└──────────────────────────────────────────────────────────┘
```

### 4.2 SSE 流式基础设施

| 能力 | 端点 | 帧格式 | 取消策略 |
|------|------|--------|---------|
| AI 聊天流 | `services.ai.chat_service.chat` | `data: {data:{message}}` / `done:true` | AbortSignal 透传 → `httpx.AsyncClient.stream()` 断连 |
| RAG 聊天流 | `services.rag.rag_service.rag_chat_stream` | 同上 | 同上 |
| Agent 执行流 | `services.ai.chat_service.chat(tools=...)` | 附加 `tool_call_start` / `tool_call_end` 帧 | 同上 |
| Dashboard 实时 KPI | `GET /dashboard/live`（5s 推送） | `data: {kpis, ts}` | 客户端 close() |
| Dashboard 快照 | `GET /dashboard/live-snapshot` | 单次 JSON，非流式 | — |

**帧序列化**：`shared/sse_utils.py` 使用 `orjson.dumps`（替代 json.dumps，2~5× 更快），每帧节省 10~50μs。

### 4.3 双写文件持久化

```
POST /write-file {target_file, content}
    │
    ├─ ① 写入本地磁盘（主存储）→ 失败立即返回 5xx
    │     路径：config.yaml → `files.base_dir`
    │
    └─ ② 尽力而为 upsert 到 MongoDB `static_files` 集合
          失败记 warn 日志 + metrics，不阻断响应（降级为单写）
```

读取策略：磁盘优先 → 命中失败回退 MongoDB 备份。

---

## 5. SRE 可靠性工程体系

### 5.1 熔断器（Circuit Breaker）

- **实现位置**：`shared/circuit_breaker.py` — 滑动时间窗口 + 冷却期半开探测
- **保护对象**：Ollama `chat()`/`embed()` · DeepSeek API · 外部翻译引擎
- **状态流转**：`CLOSED` → (连续失败 N 次) → `OPEN` → (冷却 X 秒) → `HALF_OPEN` → (成功 1 次) → `CLOSED`
- **集成点**：`LLMProviderRouter.chat_with_fallback()` · `embed_with_fallback()`

### 5.2 优雅关闭与排水

| 机制 | 实现位置 | 行为 |
|------|---------|------|
| GracefulShutdownMiddleware | `server/middleware.py` | ASGI 级 inflight 计数器，跟踪每个请求生命周期 |
| app shutdown 钩子 | `src/app.py` lifespan | 等待所有 inflight 请求完成（**最长 30s**）→ 清理 LLM HTTP 连接池 → 关闭 Motor 连接 |
| uvicorn --graceful-timeout 45 | `main.py` | 操作系统信号 SIGTERM → 45s 超时兜底 |

### 5.3 连接池与冷启动优化

| 优化项 | 说明 |
|--------|------|
| **Motor batch_size=500** | 大结果集 MongoDB 往返减少 ~5× |
| **PyMongo CommandListener** | 慢查询监控（默认 >200ms），输出结构化日志 |
| **写关注分级 w=0** | `audit_logs` / `state_records` / `chat_records` 非关键集合写不等待 ACK |
| **httpx.AsyncClient 复用** | LLM 推理共享连接池，避免每次请求 TCP 握手 |
| **uvloop 自动安装** | 启动时检测可用，libuv 事件循环替代 asyncio 默认（20~30% 吞吐提升） |
| **模型预预热** | `app.py` 启动时预导入 5 个热模块（data_service/chat_service/knowledge_service/rag_service/repository），消除首次 RPC 冷启动 |
| **Pydantic model_rebuild()** | `models/__init__.py` 导入时一次性预编译 31 个 Schema，消除首次请求 Rust Schema 编译耗时 |
| **$facet 单查询分页** | `query_documents` 从 find+count 两次往返 → 单次聚合管道 |

### 5.4 中间件性能改造

| 原实现 | 新实现 | 收益 |
|--------|--------|------|
| BaseHTTPMiddleware | 纯 ASGI `__call__(scope, receive, send)` | 消除 anyio.create_task_group() 开销 ~50~100μs/req |
| Starlette Gzip (level 9) | FastGZipMiddleware + zlib level 1 | 压缩速度 3~4× 更快，体积仅 +~10% |
| 函数式 `app.middleware("http")` Auth | AuthMiddleware 类 + 失败采样日志 | 降级 info 级，减少磁盘 I/O |

---

## 6. 目录结构（知识库内）

```
YiKnowledge/projects/yiai/
├── README.md                  # 本文件 — 总索引
├── okrs/                      # OKR 目标与关键结果（按季度）
│   ├── 2026-Q3/               # Q3: 稳定性修复 + LLM 统一架构 + Agent 增强
│   └── 2026-Q4/               # Q4: 安全合规 · 容器化 · 成本优化
├── prds/                      # 产品需求 PRD（238+，按月归档）
│   ├── 模板/00-模板-需求文档.md
│   ├── 2026-07/ · 2026-08/ · 2026-09/
│   │   └─ 00-prd-需求总览.md → 01/02/.../229 PRD 文档
├── devs/                      # 开发方案（258+，按月归档）
│   ├── 模板/00-模板-开发方案.md
│   └── 2026-08/ · 2026-09/
├── tests/                     # 测试规格（254+，按月归档）
│   ├── 模板/00-模板-测试规格.md
│   └── 2026-09/
├── bugs/                      # 缺陷报告（STRIDE 威胁模型 + 分类）
│   ├── README.md              # 缺陷索引 + 排查流程
│   └── 2026-09/
│       └── STRIDE-YiAi威胁模型.md
└── workflows/                 # 开发指南 + 工作流（33+）
    ├── README.md
    ├── 架构设计/  7 篇  概览·目录·核心模块·模块规范·跨项目数据流·ADR审计
    ├── 开发规范/  9 篇  编码·API·认证·数据库·RPC协议·性能·代码维护·翻译API·测试覆盖
    ├── 操作指南/  8 篇  速查卡·快速开始·添加领域模块·跨项目·Agent工具·RAG调试·SSE调试·测试策略
    ├── 流程规范/  7 篇  分支·OpenSpec变更·构建部署·工作流·跨项目PRD索引·审计完整性·代码健康综合总结
    └── 设计模式/  2 篇  领域服务模式 · Repository 模式
```

---

## 7. 快速导航矩阵

### 7.1 日常开发场景

| 你想做什么 | 第一步看 | 第二步看 | 关键约束 |
|-----------|---------|---------|---------|
| 新增 API 端点 | [API 规范](./workflows/开发规范/002-规范-API规范.md) | [RPC 协议](./workflows/开发规范/005-规范-RPC协议规范.md) | 必须用 `StandardResponse` · `code+message+data` |
| 新增领域模块 | [添加领域模块](./workflows/操作指南/002-指南-添加领域模块.md) | [领域服务模式](./workflows/设计模式/001-模式-领域服务模式.md) | routes → services → domain → data，禁止反向依赖 |
| MongoDB 增删改查 | [数据库规范](./workflows/开发规范/004-规范-数据库规范.md) | [Repository 模式](./workflows/设计模式/002-模式-Repository模式.md) | filter 非 query · cname 非 collection_name |
| 修改 RAG 检索 | [核心模块#RAG引擎](./workflows/架构设计/003-架构-核心模块.md) | [RAG 管道调试](./workflows/操作指南/005-指南-RAG管道调试.md) | 索引构建必须手动触发 · Embedding 节流 3000ms |
| 调用 LLM / Agent | [核心模块#AI聊天](./workflows/架构设计/003-架构-核心模块.md) | [SSE 流式调试](./workflows/操作指南/006-指南-SSE流式调试.md) | 外部 I/O 用 `asyncio.timeout` 包裹 · AbortSignal 透传 |
| 新增定时任务 | [核心模块#知识库监视器](./workflows/架构设计/003-架构-核心模块.md) | apscheduler JobStore | 考虑频率 · 幂等性 · 错误重试策略 |
| 处理 SSE 流式 | [API 规范#SSE流式](./workflows/开发规范/002-规范-API规范.md) | [SSE 流式调试](./workflows/操作指南/006-指南-SSE流式调试.md) | 使用 `shared/sse_utils.py` · orjson · 统一 done 帧 |
| 新增 RPC 方法 | [RPC 协议规范](./workflows/开发规范/005-规范-RPC协议规范.md) | 同上 | 注册到 execution.router 双路径（/ 和 /api） |
| 性能优化 | [性能优化规范](./workflows/开发规范/006-规范-性能优化.md) | `/debug/performance` 端点 | 微基准对比 before/after · 不回归现有指标 |
| 安全合规 | [认证规范](./workflows/开发规范/003-规范-认证规范.md) | [STRIDE 威胁模型](./bugs/2026-09/STRIDE-YiAi威胁模型.md) | 密钥从 env 读取 · 日志脱敏 · CORS 白名单 |

### 7.2 Code Review 18 项必查清单

| # | 检查项 | 违反后果 | 参考 |
|---|--------|---------|------|
| 1 | routes **不直接调用 data/**，必须过 services | 分层污染 | [编码规范#分层导入](./workflows/开发规范/001-规范-编码规范.md) |
| 2 | domain **不导入 server/** | 循环依赖风险 | 同上 |
| 3 | Mongo 过滤参数名是 `filter` | 静默返回全量 | [RPC 协议](./workflows/开发规范/005-规范-RPC协议规范.md) |
| 4 | 文件操作用 `target_file` | 422 Unprocessable | 同上 |
| 5 | 响应包 `StandardResponse` | 前端解包失败 | [API 规范](./workflows/开发规范/002-规范-API规范.md) |
| 6 | 命名 snake_case | style error | [编码规范#命名](./workflows/开发规范/001-规范-编码规范.md) |
| 7 | 错误抛 `BusinessException(ErrorCode.XXX)` | 500 吞异常 | [架构概览#错误处理](./workflows/架构设计/001-架构-架构概览.md) |
| 8 | 全链路 async/await，**不混用同步** | 事件循环阻塞 | [编码规范#异步优先](./workflows/开发规范/001-规范-编码规范.md) |
| 9 | MongoDB 查询**强制分页**（pageSize 上限） | OOM 打爆内存 | [数据库规范](./workflows/开发规范/004-规范-数据库规范.md) |
| 10 | 新增端点挂 **JWT 中间件** | 越权 | [认证规范](./workflows/开发规范/003-规范-认证规范.md) |
| 11 | Cursor 使用 `try/finally` / `async with` | 连接泄漏 | [编码规范#异步编程](./workflows/开发规范/001-规范-编码规范.md) |
| 12 | 密钥从 `env/config` 读取，**不硬编码** | 安全事故 | [认证规范](./workflows/开发规范/003-规范-认证规范.md) |
| 13 | SSE 异常正确传播（不吞） | 客户端挂死 | [API 规范#SSE流式](./workflows/开发规范/002-规范-API规范.md) |
| 14 | services 层有**实际业务逻辑**，非纯 re-export | 分层无意义 | [领域服务模式](./workflows/设计模式/001-模式-领域服务模式.md) |
| 15 | 外部 I/O（网络/磁盘）用 `asyncio.timeout` 包裹 | 请求无限挂死 | [编码规范#异步编程](./workflows/开发规范/001-规范-编码规范.md) |
| 16 | 热路径有缓存策略（LRU/TTL） | 性能不达标 | [性能优化](./workflows/开发规范/006-规范-性能优化.md) |
| 17 | `_build_filter` 支持的字段白名单齐全 | 过滤条件静默丢弃 | [RPC 协议](./workflows/开发规范/005-规范-RPC协议规范.md) |
| 18 | 新增集合有**对应索引**（explain 验证） | 慢查询打爆 DB | [数据库规范](./workflows/开发规范/004-规范-数据库规范.md) |

---

## 8. 关键约束速查（Hard Constraints）

### ✅ 必须遵守

1. **统一响应信封**：所有 HTTP/RPC 响应使用 `StandardResponse {code, message, data}`
2. **错误分类**：使用 `ErrorCode 枚举 + BusinessException`，禁止裸 `raise Exception`
3. **参数命名契约**：`filter`（非 query）· `target_file`（非 path）· `cname`（非 collection_name）
4. **双写文件持久化**：磁盘（主）+ MongoDB `static_files`（备份，尽力而为）
5. **SSE 规范**：MIME `text/event-stream`，增量 `data:` 帧，结束 `done:true`，全程 AbortSignal
6. **命名规范**：Python 代码 **snake_case**，Pydantic 字段 camelCase alias 仅在序列化层转换
7. **全异步**：所有 I/O 使用 `async/await`，不同步混用；外部调用 `asyncio.timeout` 包裹
8. **依赖注入**：Service 层构造函数注入 Repository，禁止全局单例直接调用
9. **路由注册**：`APIRouter` + `include_router`，禁止 `@app` 装饰器散落在业务文件
10. **资源释放**：Cursor/Client/File 用 `try/finally` 或 `async with` 上下文
11. **配置外部化**：密钥/域名/端口从 `config.yaml + env` 覆盖，禁止源码硬编码
12. **索引构建**：RAG 全量索引必须通过 `POST /rag-build` **手动触发**，启动不隐式构建
13. **Embedding 节流**：两次 `/api/embeddings` 请求间隔 ≥ 3000ms（防灌爆队列）
14. **RPC 路由双挂载**：`execution.router` 同时注册 `/` 和 `/api` 前缀（dev proxy 兼容）
15. **RAG 硬开关**：`RAG_EMBED_KILL_SWITCH` 默认 ON，任何 embed 调用经授权路径

### ❌ 严格禁止

1. routes 中直接 import `data/`（跳过 services 层）
2. domain 层 import `server/`（反向依赖）
3. 同步 / 异步代码混用（异步函数里跑 sync I/O，事件循环挂死）
4. 推测性给 MongoDB 单例加方法（等真实消费者再扩展）
5. `__init__.py` 之外暴露内部实现文件
6. 绕过 RPC 信封直接暴露裸 REST 端点（不符合跨项目契约）
7. 纯 re-export 的 Service 层（空壳无业务逻辑）
8. 静默 `except Exception: pass` 吞异常（必须分类处理 + 可见日志）
9. 给 `RAG_EMBED_KILL_SWITCH` 开后门绕过
10. 隐式启动构建索引（启动发现缺索引即 build）

---

## 9. 技术栈速查表

| 分类 | 技术 | 最低版本 | 核心用途 |
|------|------|---------|---------|
| **Runtime** | Python | 3.10+ | 类型提示 · 结构化模式匹配 |
| **Web 框架** | FastAPI | ≥ 0.140.0 | ASGI · 自动 OpenAPI · Depends 注入 |
| **ASGI Server** | uvicorn | ≥ 0.51.0 | HTTP 服务器 · uvloop · H11 |
| **数据库** | MongoDB + Motor | 6+ / 3.5 | 异步文档存储 · 连接池 |
| **LLM 推理** | Ollama | ≥ 0.6.2 | 自托管模型（qwen3.5/llama3 等） |
| **RAG 框架** | llama_index | ≥ 0.13.0 | QueryFusionRetriever · 持久化索引 |
| **数据验证** | Pydantic | ≥ 2.13.4 | v2 Rust Schema · pydantic-settings |
| **认证安全** | bcrypt + PyJWT | 5.0 / 2.13 | 密码哈希 · JWT Token 签发验证 |
| **重试机制** | tenacity | ≥ 9.1.4 | 网络/MongoDB/Ollama 瞬态故障重试 |
| **调度任务** | apscheduler | — | Knowledge Watcher · RSS 抓取 · 备份 |
| **测试** | pytest + pytest-asyncio | 8.x | 单元 + 集成 · httpx TestClient · 144 用例 |
| **质量工具** | ruff + mypy | — | lint · format · 渐进类型 |
| **序列化** | orjson | — | SSE 帧 · 响应体高性能 JSON |
| **HTTP** | httpx | — | 异步客户端 · LLM 连接池复用 |
| **指标监控** | prometheus_client | — | /metrics 端点 · 熔断器 · 请求耗时 |
| **容器** | Docker + docker-compose | — | 一键部署 MongoDB + YiAi |
| **构建缓存** | uv.lock | — | pip 替代 · 冷安装 < 3min |

---

## 10. 开发命令速查

```bash
# 环境安装
uv sync                              # 同步依赖（读取 uv.lock）
uv venv && source .venv/bin/activate # 创建激活虚拟环境

# 启动开发服务器
uv run python main.py                # 端口 10086 · 热重载（debug=True）
uvicorn src.app:app --reload --port 10086  # 同上，显式 uvicorn

# 测试与质量
pytest tests/ -v                     # 运行 144 单测
pytest tests/ -v --cov=src           # 生成覆盖率报告 → htmlcov/
pytest tests/ -v -m "not slow"       # 跳过慢速测试
ruff check src/                      # Lint
ruff format src/ --check             # 格式检查
mypy src/                            # 类型检查（渐进式）

# 运维与健康
curl http://localhost:10086/health   # 健康检查（MongoDB + LLM 可达）
curl http://localhost:10086/metrics  # Prometheus 指标
curl http://localhost:10086/docs     # Swagger UI
curl http://localhost:10086/debug/performance  # 性能诊断（熔断器状态 + inflight + 连接池）

# 手动操作
curl -X POST http://localhost:10086/rag-build  # 手动重建 RAG 索引
```

---

## 11. 相关资源索引

### 11.1 项目级文档
- [YiAi/CLAUDE.md](../../../YiAi/CLAUDE.md) — 边界 · 铁律 · 近期变更 · 数据流 · 降级对策
- [YrY/CLAUDE.md](../../../CLAUDE.md) — 单体仓库级约定 · RPC 协议 · 跨项目关系

### 11.2 知识库层导航
- [YiKnowledge/INDEX.md](../../INDEX.md) — 顶层导航（角色目录 × 流水线阶段）
- [YiKnowledge/README.md](../../README.md) — 流水线架构 · 角色决策树
- [YiKnowledge/MEMORY.md](../../MEMORY.md) — 知识库规则手册 · 命名约定 · 15 字段 Frontmatter
- [projects/INDEX.md](../INDEX.md) — 5 个项目 × 分类文件矩阵 · 2,450+ 文件统计
- [projects/README.md](../README.md) — 项目知识中心总览 · OKR→PRD→Dev→Test 追溯模型

### 11.3 跨项目契约参考
- [YiVad 知识库](../yivad/README.md) — 前端消费方：RPC 调用方 · SSE 客户端 · ProTable 分页参数
- [YiPet 知识库](../yipet/README.md) — 扩展消费方：4-Tier API · 跨世界 IPC · 聊天 SSE
- [YiPot 知识库](../yipot/README.md) — 桌面消费方：翻译服务插件 · 本地 HTTP API · TTS OCR

### 11.4 工程角色参考
- [engineer/README.md](../../engineer/README.md) — 架构模式 · 开发实践 · 质量安全
- [engineer/learn/lessons/](../../engineer/learn/lessons/) — 成功/失败/陷阱/缺陷（跨项目）
- [sre/README.md](../../sre/README.md) — 可观测性看板 · SLO 设计 · 告警路由（企业微信）
- [leader/decisions/](../../leader/decisions/) — ADR 架构决策记录（8 强制字段）
- [aier/README.md](../../aier/README.md) — RAG 最佳实践 · Agent 架构模式 · LLM 评估基准

---

## 12. 变更历史

| 日期 | 变更摘要 |
|------|---------|
| 2026-10-09 | **README 专业化重构**：新增 5 天入职路线图 · 6 层架构全景图 · RPC 契约速查 · RAG/SSE/双写 架构深度说明 · SRE 体系（熔断/优雅排水/连接池/冷启动）· CR 18 项必查清单 · Hard Constraints 15 必/10 禁 · 技术栈 16 项分类表 · 命令速查 |
| 2026-10-07 | 近期动态更新：Q3→Q4 OKR 过渡 · 跨项目桥接文档链接 |
| 2026-09-20 | 知识库结构标准化 · workflows 33 文件分类 |
| 2026-08-25 | 初版创建：基础索引 + 快速导航 |
