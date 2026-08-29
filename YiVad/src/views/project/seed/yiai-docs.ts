/**
 * Seed documentation pages for the YiAi project.
 */
import type { SeedPage } from "./yivad-docs";

export const yiaiDocs: SeedPage[] = [
  {
    order: 1,
    tag: "getting-started",
    title: "快速开始",
    content: `# 快速开始

## 环境要求

- **Python** >= 3.10
- **MongoDB** 运行在 \`localhost:27017\`
- **Ollama** 运行在 \`localhost:11434\` (可选，AI 功能需要)

## 安装与启动

\`\`\`bash
cd YiAi

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器 (http://localhost:10086)
python main.py
\`\`\`

## 前置条件

\`\`\`bash
# 确保 MongoDB 运行中
mongod --dbpath ./data

# 确保 Ollama 运行中 (如需 AI 功能)
ollama serve
ollama pull qwen3.5:4b
ollama pull nomic-embed-text
\`\`\`

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| FastAPI | >=0.140.0 | Web 框架 |
| Python | 3.10+ | 运行时 |
| MongoDB | Motor async | 数据库 |
| Ollama | >=0.6.2 | LLM 推理 |
| llama_index | >=0.13.0 | RAG 框架 |
| pytest | >=8.0.0 | 测试框架 |
| ruff | — | 代码检查 |
`
  },
  {
    order: 2,
    tag: "architecture",
    title: "目录结构",
    content: `# 目录结构

\`\`\`
YiAi/
├── main.py                  # 启动入口 (uvicorn)
├── config.yaml              # 全局配置 (YAML + pydantic-settings)
├── requirements.txt         # Python 依赖
├── pyproject.toml           # pytest 配置
├── ruff.toml                # Ruff linter 配置
├── src/
│   ├── app.py               # FastAPI 应用工厂 + 生命周期
│   ├── shared/              # 跨模块共享
│   │   ├── config.py        # 配置 (YamlConfigSettingsSource)
│   │   ├── response.py      # 响应封装 (StandardResponse)
│   │   ├── error_codes.py   # 错误码枚举 (ErrorCode)
│   │   ├── exceptions.py    # 业务异常 (BusinessException)
│   │   ├── logging.py       # 日志配置
│   │   └── utils.py         # 通用工具
│   ├── data/                # 数据访问层
│   │   ├── database.py      # MongoDB 单例 (Motor async)
│   │   ├── repository.py    # 通用数据仓库
│   │   ├── sessions.py      # 会话数据操作
│   │   ├── store.py         # 状态存储
│   │   └── seeds/           # 种子数据 (menus, users, projects...)
│   ├── models/              # Pydantic 数据模型
│   ├── domain/              # 业务逻辑层
│   │   ├── ai/              # AI 聊天 + Agent 循环
│   │   │   ├── chat.py      # 聊天服务
│   │   │   ├── agent.py     # Agent 循环 (Pi 风格)
│   │   │   ├── tools.py     # 工具注册 + 执行
│   │   │   └── data_tools.py # 通用数据工具
│   │   ├── auth/            # 认证 (JWT + bcrypt)
│   │   ├── execution/       # 通用模块执行
│   │   ├── files/           # 文件操作 (磁盘 + MongoDB 双写)
│   │   ├── knowledge/       # 知识库管理
│   │   ├── rag/             # RAG 检索引擎 (llama_index)
│   │   ├── rss/             # RSS 聚合
│   │   ├── state/           # 状态记录 CRUD
│   │   └── wework/          # 企业微信消息
│   ├── services/            # 服务层
│   │   ├── ai/              # chat_service.py
│   │   ├── database/        # data_service.py, session_service.py
│   │   ├── execution/       # executor.py
│   │   ├── knowledge/       # knowledge_service.py
│   │   ├── rag/             # rag_service.py
│   │   ├── rss/             # feed_service.py, rss_scheduler.py
│   │   └── storage/         # oss_client.py
│   └── server/              # HTTP 层
│       ├── middleware.py    # 认证中间件
│       ├── errors.py        # 全局异常处理
│       ├── mcp_server.py    # MCP 服务
│       └── routes/          # 18 个路由模块
├── tests/                   # 测试 (76+ tests)
└── data/                    # 运行时数据
    └── rag_store/           # RAG 持久化索引
\`\`\`
`
  },
  {
    order: 3,
    tag: "architecture",
    title: "路由与 API",
    content: `# 路由与 API

## 路由模块 (18 个)

| 路由 | 文件 | 说明 |
|------|------|------|
| \`/\` | 根路由 (app.py) | RPC 分发器 |
| \`/about\` | \`about.py\` | 服务信息 |
| \`/auth/*\` | \`auth.py\` | 认证 (登录/注册/Token) |
| \`/users/*\` | \`users.py\` | 用户管理 |
| \`/system/*\` | \`system.py\` | 系统信息 |
| \`/files/*\` | \`files.py\` | 文件上传/下载/管理 |
| \`/read-file\` | \`files.py\` | 文件读取 (target_file) |
| \`/write-file\` | \`files.py\` | 文件写入 (target_file, content) |
| \`/execution/*\` | \`execution.py\` | 模块执行 |
| \`/wework/*\` | \`wework.py\` | 企业微信消息 |
| \`/maintenance/*\` | \`maintenance.py\` | 维护操作 |
| \`/state/*\` | \`state.py\` | 状态存储 |
| \`/agent/*\` | \`agent.py\` | Agent 聊天/确认/steer |
| \`/health\` | \`health.py\` | 健康检查 |
| \`/knowledge/*\` | \`knowledge.py\` | 知识库扫描/读取/写入 |
| \`/rag/*\` | \`rag.py\` | RAG 检索/聊天/构建 |
| \`/search/*\` | \`search.py\` | 全局搜索 |
| \`/mcp/*\` | \`mcp.py\` | MCP 协议 |
| \`/dashboard/*\` | \`dashboard.py\` | 仪表盘数据 |
| \`/v1/*\` | \`openai_compat.py\` | OpenAI API 兼容 |

## RPC 协议

所有 YiVad/YiPet 请求使用统一信封：

\`\`\`json
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
\`\`\`

响应格式：
\`\`\`json
{ "code": 0, "message": "ok", "data": { "list": [...], "total": 100 } }
\`\`\`

## RPC 方法

| module_name | method_name | 说明 |
|-------------|-------------|------|
| \`services.database.data_service\` | \`query_documents\` | 查询文档 |
| \`services.database.data_service\` | \`create_document\` | 创建文档 |
| \`services.database.data_service\` | \`update_document\` | 更新文档 |
| \`services.database.data_service\` | \`delete_document\` | 删除文档 |
| \`services.ai.chat_service\` | \`chat\` | AI 聊天 (SSE) |
| \`services.ai.chat_service\` | \`chat_rag\` | RAG 增强聊天 |
`
  },
  {
    order: 4,
    tag: "architecture",
    title: "权限管理",
    content: `# 权限管理

## 认证模式

- **默认关闭** — \`middleware.auth_enabled: false\`，所有端点公开
- **开启时** — \`header_verification_middleware\` 检查 \`X-Token\` 请求头
- **JWT** — \`bcrypt\` 密码哈希 + \`PyJWT\` Token 签发/验证
- **配置**: \`middleware.auth_token\` (静态 Token) 或 \`jwt.secret\` (JWT 模式)

## CORS 配置

\`\`\`yaml
cors:
  origins: ["*"]              # 允许所有来源
  allow_any_origin: true
\`\`\`

## 安全配置

\`\`\`yaml
middleware:
  auth_enabled: false          # 默认关闭，生产环境开启
  auth_token: "dev-token-change-me"

jwt:
  secret: "yi-ai-jwt-secret-change-in-production"
  expire_minutes: 1440
\`\`\`

## 观察者 (Observer) 中间件

\`\`\`yaml
observer:
  enabled: false               # 默认关闭
  throttle_enabled: false      # 限流
  sampler_enabled: true        # 慢请求采样
  sampler_slow_threshold_ms: 5000.0
  guard_enabled: true          # 深度防护
  guard_max_depth: 3
\`\`\`
`
  },
  {
    order: 5,
    tag: "architecture",
    title: "数据库",
    content: `# 数据库

## MongoDB 架构

\`\`\`
MongoDB (Motor async)
├── 数据库: ruiyi (config: mongodb.db_name)
├── 连接池: pool_size=10, max_pool_size=50
└── 集合:
    ├── sessions          # 聊天会话
    ├── menus             # 菜单配置
    ├── users             # 用户
    ├── projects          # 项目
    ├── issues            # 任务
    ├── cycles            # 迭代周期
    ├── releases          # 发布
    ├── modules           # 模块
    ├── pages             # 页面
    ├── labels            # 标签
    ├── bugs              # Bug
    ├── knowledge_files   # 知识文件元数据
    ├── static_files      # 静态文件备份
    ├── rss               # RSS 条目
    ├── chat_records      # 聊天记录
    └── ...               # 字典表
\`\`\`

## 数据访问层

\`\`\`
routes → services → repository → database (MongoDB 单例)
\`\`\`

- \`data/database.py\` — MongoDB 单例：\`find_one\`, \`find_many\`, \`insert_one\`, \`insert_many\`, \`update_one\`, \`delete_one\`
- \`data/repository.py\` — 通用仓库：\`query_documents\` (分页/过滤/排序)
- \`_build_filter(query_params)\` — 将 HTTP 参数转为 Mongo 查询条件

## 种子数据

启动时自动从 \`src/data/seeds/\` 导入：

\`\`\`
menus.json, users.json, projects.json, issues.json,
cycles.json, releases.json, modules.json, pages.json,
labels.json, bugs.json, dict_status.json, dict_gender.json,
dict_department.json, dict_role.json
\`\`\`
`
  },
  {
    order: 6,
    tag: "deployment",
    title: "构建部署",
    content: `# 构建部署

## 启动配置

\`\`\`yaml
server:
  host: "0.0.0.0"
  port: 10086
  reload: true                  # 开发模式热重载

uvicorn:
  limit_concurrency: 1000
  limit_max_requests: 10000
  timeout_keep_alive: 5
\`\`\`

## 启动流程

\`\`\`
main.py
  → uvicorn.run("app:app", host, port)
    → app.py: create_app()
      → setup_logging()
      → 注册异常处理器
      → 注册 Observer 中间件 (可选)
      → 注册 18 个路由模块
      → 配置 CORS 中间件
      → 配置 Auth 中间件 (可选)
      → 挂载 MCP 服务
      → 挂载静态文件
      → lifespan:
        → 初始化 MongoDB
        → 导入种子数据
        → 初始化 RSS 系统
        → 初始化 Knowledge Watcher
        → 预加载 RAG 索引
\`\`\`

## 部署方式

\`\`\`bash
# 开发
python main.py

# 生产 (建议)
uvicorn src.app:app --host 0.0.0.0 --port 10086 --workers 4
\`\`\`

## 测试

\`\`\`bash
# 运行所有测试
python -m pytest tests/ -v

# 覆盖率报告
python -m pytest tests/ --cov=src --cov-report=html
\`\`\`
`
  },
  {
    order: 7,
    tag: "conventions",
    title: "项目规范",
    content: `# 项目规范

## 编码规范

| 领域 | 标准 |
|------|------|
| 语言 | Python 3.10+，优先 async |
| 文件命名 | snake_case |
| 配置 | \`config.yaml\` + pydantic-settings |
| 响应格式 | 统一 \`{ code, message, data }\` 信封 |
| 错误处理 | \`ErrorCode\` 枚举 + \`BusinessException\` |
| SSE 流 | \`text/event-stream\`，增量 \`data:\` 帧 |
| 重试策略 | \`tenacity\` 处理瞬态故障 |

## 模块分层

\`\`\`
server/routes/   ← HTTP 层，不直接访问 data/
      ↓
services/        ← 服务层，封装 domain 供 routes 调用
      ↓
domain/          ← 业务逻辑层，不导入 server/
      ↓
data/            ← 数据访问层，MongoDB 操作
      ↓
shared/          ← 跨模块共享 (config, response, error_codes, utils)
\`\`\`

## 自约束

- **Domain 层拥有业务逻辑** — Routes 不直接调用 \`data/\`
- **公开 API 通过 \`__init__.py\` 导出**
- **MongoDB 单例只按需扩展**
- **参数名称是合同** — \`filter\` 不是 \`query\`，\`target_file\` 不是 \`path\`
`
  },
  {
    order: 8,
    tag: "architecture",
    title: "模块分析",
    content: `# 模块分析

## AI 聊天模块 (\`domain/ai/\`)

| 文件 | 职责 |
|------|------|
| \`chat.py\` | 聊天服务：Ollama/OpenAI/Anthropic 多后端 |
| \`agent.py\` | Agent 循环 (Pi 风格)：多轮对话、工具调用、确认门控 |
| \`tools.py\` | 工具注册中心：\`ToolRegistry\` + \`execute\` + 参数校验 |
| \`data_tools.py\` | 通用数据工具：\`db_list\`, \`db_schema\`, \`db_create\`, \`db_update\`, \`db_delete\` |

Agent 循环特性：
- **确认门控** — 写操作需用户确认，120s 超时
- **拒绝记忆** — 同 session 内拒绝的调用自动拦截
- **模型切换** — 弱模型停滞时自动升级到更强模型
- **预算感知** — 剩余轮次不足时提醒模型压缩步骤
- **旋转检测** — 连续 3 次相同观察触发 nudge
- **结果裁剪** — 超大工具结果自动裁剪
- **断连检测** — 客户端断开时自动中止 Agent 运行

## RAG 模块 (\`domain/rag/\`)

- 混合检索 (向量 + BM25)
- 可选 LLM Rerank
- 内联引用编号
- HyDE 查询增强
- Sentence Window 检索
- 文件级和文件夹级 scope 过滤

## 文件模块 (\`domain/files/\`)

双写策略：磁盘 (主) + MongoDB (备份)
`
  },
  {
    order: 9,
    tag: "architecture",
    title: "架构设计",
    content: `# 架构设计

## 分层架构

\`\`\`
┌──────────────────────────────────────────────┐
│  HTTP Layer (server/)                         │
│  Middleware → Routes → Exception Handlers     │
├──────────────────────────────────────────────┤
│  Service Layer (services/)                    │
│  封装 domain 逻辑，提供 routes 调用接口        │
├──────────────────────────────────────────────┤
│  Domain Layer (domain/)                       │
│  业务逻辑: AI/Agent, Files, RAG, Knowledge,   │
│  RSS, Auth, Execution, State, WeWork          │
├──────────────────────────────────────────────┤
│  Data Layer (data/)                           │
│  MongoDB 单例 → Repository → Session/Store    │
├──────────────────────────────────────────────┤
│  Shared Layer (shared/)                       │
│  Config, Response, ErrorCodes, Utils, Logging │
└──────────────────────────────────────────────┘
\`\`\`

## 请求生命周期

\`\`\`
HTTP Request
  → CORS 中间件
  → Auth 中间件 (可选)
  → Observer 中间件 (可选)
  → 路由匹配
  → 路由处理函数
    → services 层
      → domain 层
        → data 层
          → MongoDB
  → 响应 (统一信封)
\`\`\`

## 降级策略

| 场景 | 行为 |
|------|------|
| MongoDB 不可用 | 写入失败，读取返回空结果 |
| Ollama 不可用 | 聊天端点返回 \`ErrorCode.AI_UNAVAILABLE\` |
| OSS 不可用 | 文件存储回退到本地磁盘 |
| Auth 禁用 | 所有端点公开 (默认) |
`
  },
  {
    order: 10,
    tag: "dependencies",
    title: "开发依赖",
    content: `# 开发依赖

## 核心框架

| 包 | 版本 | 用途 |
|----|------|------|
| fastapi | >=0.140.0 | Web 框架 |
| uvicorn | >=0.51.0 | ASGI 服务器 |
| pydantic | >=2.13.4 | 数据验证 |
| pydantic-settings | >=2.14.2 | 配置管理 |

## 数据库

| 包 | 版本 | 用途 |
|----|------|------|
| motor | >=3.7.1 | MongoDB 异步驱动 |
| pymongo | >=4.17.0 | MongoDB 同步驱动 |

## AI/ML

| 包 | 版本 | 用途 |
|----|------|------|
| ollama | >=0.6.2 | Ollama API 客户端 |
| llama-index | >=0.13.0 | RAG 框架 |
| llama-index-embeddings-ollama | >=0.6.0 | Ollama Embedding |
| llama-index-llms-ollama | >=0.6.0 | Ollama LLM |
| openai | >=1.0.0 | OpenAI API |
| anthropic | >=0.40.0 | Anthropic API |
| rank-bm25 | >=0.2.2 | BM25 检索 |
| transformers | >=5.14.1 | HuggingFace Transformers |

## 工具

| 包 | 版本 | 用途 |
|----|------|------|
| aiohttp | >=3.14.3 | 异步 HTTP 客户端 |
| feedparser | >=6.0.12 | RSS 解析 |
| apscheduler | >=3.11.3 | 定时任务 |
| tenacity | >=9.1.4 | 重试策略 |
| PyYAML | >=6.0.3 | YAML 配置 |
| aiofiles | >=25.1.0 | 异步文件操作 |
| python-multipart | >=0.0.32 | 文件上传 |
| bcrypt | >=5.0.0 | 密码哈希 |
| PyJWT | >=2.13.0 | JWT Token |
| oss2 | >=2.19.1 | 阿里云 OSS |
| mcp | >=1.28.1 | MCP 协议 |
| ddgs | >=9.0.0 | 网络搜索 |

## 测试

| 包 | 版本 | 用途 |
|----|------|------|
| pytest | >=8.0.0 | 测试框架 |
| pytest-asyncio | >=0.24.0 | 异步测试 |
| httpx | >=0.27.0 | HTTP 测试客户端 |
| pytest-cov | >=5.0.0 | 覆盖率 |
`
  },
  {
    order: 11,
    tag: "dependencies",
    title: "核心代码",
    content: `# 核心代码

## 入口文件

| 文件 | 说明 |
|------|------|
| \`main.py\` | 启动入口：\`uvicorn.run("app:app", ...)\` |
| \`src/app.py\` | FastAPI 应用工厂：\`create_app()\` + 生命周期管理 |
| \`config.yaml\` | 全局配置 (YAML + pydantic-settings) |

## 关键模块

| 模块 | 路径 | 核心逻辑 |
|------|------|----------|
| 应用工厂 | \`src/app.py\` | \`create_app()\` — 路由注册、中间件、生命周期 |
| 配置 | \`src/shared/config.py\` | \`YamlConfigSettingsSource\` — YAML 扁平化 |
| 响应封装 | \`src/shared/response.py\` | \`StandardResponse\` — \`{code, message, data}\` |
| 错误码 | \`src/shared/error_codes.py\` | \`ErrorCode\` 枚举 |
| 数据库 | \`src/data/database.py\` | \`MongoDB\` 单例 — Motor async |
| 数据仓库 | \`src/data/repository.py\` | \`query_documents\` — 分页/过滤/排序 |
| Agent 循环 | \`src/domain/ai/agent.py\` | Pi 风格 Agent |
| 数据工具 | \`src/domain/ai/data_tools.py\` | 通用 CRUD 工具 |
| 聊天服务 | \`src/services/ai/chat_service.py\` | SSE 流式聊天 |
| 数据服务 | \`src/services/database/data_service.py\` | RPC 数据操作 |
| 知识扫描 | \`src/domain/knowledge/scanner.py\` | 遍历 YiKnowledge 目录树 |
| RAG 引擎 | \`src/domain/rag/engine.py\` | 混合检索 + SSE 流式 RAG |
| Agent 路由 | \`src/server/routes/agent.py\` | Agent 聊天/确认/steer |

## 生命周期管理

\`\`\`
启动:
  setup_logging()
  → 注册异常处理器
  → 注册中间件
  → 注册路由
  → init MongoDB
  → seed 种子数据
  → init RSS 系统
  → init Knowledge Watcher
  → preload RAG 索引

关闭:
  → shutdown Knowledge Watcher
  → shutdown RSS 系统
  → close MongoDB
\`\`\`
`
  }
];