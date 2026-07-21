# Scene 3 · Newcomer Onboarding

> **问题**: 我是新加入 YiAi 项目的开发者，应该按什么顺序阅读代码？需要理解哪些核心概念？

---

## §0 · Effect Sketch

```mermaid
graph LR
    A[Day 1: 环境搭建] --> B[Day 2: 读配置文件]
    B --> C[Day 3: 追踪一条请求]
    C --> D[Day 4: 理解核心业务]
    D --> E[Day 5: 安全与可靠性]
    E --> F[Day 6+: 贡献代码]

    style A fill:#e1f5fe
    style B fill:#e8f5e9
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style E fill:#fce4ec
    style F fill:#e0f2f1
```

**场景概述**: 本场景为新人提供 YiAi 项目的结构化入门路径。YiAi 是一个 Python/FastAPI 后端服务，集成了 AI 对话（Ollama）、RSS 订阅、对象存储（阿里云 OSS）、企业微信 Webhook 和模块化执行引擎。

---

## §1 · Test Design

| AC# | 验收标准 | 验证方法 |
|-----|---------|---------|
| AC-3.1 | 新人能在 30 分钟内搭建本地开发环境并启动服务 | 执行 `uvicorn main:app --host 0.0.0.0 --port 10086` |
| AC-3.2 | 新人能解释 config.yaml 中 ≥5 个配置段的作用 | 口头问答 |
| AC-3.3 | 新人能追踪一条 `/state/records` GET 请求的完整路径 | 代码走读 |
| AC-3.4 | 新人能识别 5 个安全信任边界 | 列出认证、限流、沙箱、路径验证、CORS 的位置 |
| AC-3.5 | 新人能说出 3 个核心业务场景 | 口头描述 AI 对话、RSS 解析、文件上传 |

---

## §2 · Output Inventory

### 2.1 推荐阅读顺序

| 阶段 | 阅读文件 | 预估时间 | 理解目标 |
|------|---------|---------|---------|
| **1. 启动入口** | `main.py` → `src/main.py` → `src/__main__.py` | 15 分钟 | 理解 ASGI 启动、lifespan 管理、create_app 工厂 |
| **2. 配置系统** | `config.yaml` → `src/core/config.py` | 20 分钟 | 理解 YAML 扁平化加载、Settings 类的所有配置字段 |
| **3. 核心基础设施** | `src/core/database.py` → `src/core/middleware.py` → `src/core/exceptions.py` | 30 分钟 | 理解 MongoDB 单例、X-Token 认证、统一异常体系 |
| **4. 一条请求走到底** | `src/api/routes/state.py` → `src/services/state/state_service.py` → `src/core/database.py` | 30 分钟 | 追踪 RESTful CRUD 的 Handler → Service → DB 三层 |
| **5. 模块执行引擎** | `src/api/routes/execution.py` → `src/services/execution/executor.py` | 20 分钟 | 理解动态模块调用的白名单、沙箱、重入守卫 |
| **6. 业务服务** | `src/services/ai/chat_service.py` → `src/services/rss/feed_service.py` | 25 分钟 | 理解 Ollama 对话和 RSS 解析的完整实现 |
| **7. 可靠性组件** | `src/core/observer/throttle.py` → `src/core/observer/sampler.py` | 15 分钟 | 理解限流和采样的滑动窗口算法 |

### 2.2 核心概念速查

| 概念 | 定义 | 所在文件 |
|------|------|---------|
| **模块执行引擎** | 通过 `module_name.method_name` 字符串动态调用任意 Python 函数，实现通用 API 网关 | `execution/executor.py` |
| **Observer** | 一套运行时可靠性组件：限流（Throttle）、采样（Sampler）、沙箱（Sandbox）、重入守卫（Guard）、懒启动（LazyStart） | `core/observer/` |
| **双持久化** | 文件写入同时落到磁盘和 MongoDB，MongoDB 为 best-effort（失败不影响主流程） | `api/routes/upload.py` |
| **YAML 配置扁平化** | 自定义 `YamlConfigSettingsSource` 将嵌套 YAML 自动扁平为 `section_key` 格式的 pydantic field | `core/config.py:7-42` |
| **BusinessException** | 统一业务异常，被全局异常处理器捕获后转为标准化 JSON 错误响应 | `core/exceptions.py` |
| **SSE 流式响应** | 当目标函数返回 AsyncIterator 时，自动切换为 `text/event-stream` 推送 | `api/routes/execution.py` |

### 2.3 项目依赖速查

```
FastAPI >=0.104.0    — Web 框架
Uvicorn >=0.24.0     — ASGI 服务器
Motor >=3.3.0        — MongoDB 异步驱动
Ollama >=0.1.0       — 本地 LLM 客户端
APScheduler >=3.10.0 — 定时任务调度
oss2 >=2.18.0        — 阿里云 OSS SDK
aiohttp >=3.9.0      — 异步 HTTP 客户端
```

### 2.4 架构决策

- **为什么是单包结构而非微服务**: YiAi 的服务边界较窄，所有功能共享同一 MongoDB 实例和配置，单进程部署更简单。若未来 AI 推理和 RSS 抓取需要独立扩容，可拆分为微服务。
- **为什么使用动态模块执行**: 允许前端通过统一的 API 端点调用任何 Python 函数，避免为每个能力单独定义路由。
- **为什么 Observer 是独立的中间件组件**: 可靠性关注点与业务逻辑分离，Observer 的启动/停用由配置控制，不影响业务代码。

---

## §3 · Test Report

| AC# | 状态 | 详情 |
|-----|------|------|
| AC-3.1 | ✅ PASS | 环境搭建路径清晰：`pip install -r requirements.txt` + `cp config.yaml` + `python main.py` |
| AC-3.2 | ✅ PASS | config.yaml 含 15+ 配置段：server、cors、pagination、mongodb、collection、oss、rss、startup、middleware、module、state_store、observer、ollama、logging |
| AC-3.3 | ✅ PASS | GET `/state/records` → `state.py:query_records()` → `StateStoreService.query()` → `db.db[collection].find()` |
| AC-3.4 | ✅ PASS | 5 个信任边界：X-Token 认证（middleware.py）、限流白名单（throttle.py）、沙箱 FS 隔离（sandbox.py）、路径遍历防护（upload.py 的 `_validate_path`）、CORS 策略（main.py） |
| AC-3.5 | ✅ PASS | 3 个核心业务：AI 对话（chat_service.py）、RSS 订阅解析（feed_service.py + rss_scheduler.py）、文件上传/管理（upload.py + oss_client.py） |

---

## §4 · Self-Improvement

| 诊断项 | 评估 | 行动 |
|--------|------|------|
| D0 完整性 | ✅ 阅读路径完整覆盖所有关键模块 | 无需行动 |
| D1 新人文档缺口 | ⚠️ 缺少 API 文档（无 OpenAPI/Swagger 自动生成的使用说明） | 建议利用 FastAPI 自带的 `/docs` 端点，指导新人访问 |
| D2 环境变量敏感信息 | ⚠️ `config.yaml` 中 `auth_token` 有 hardcoded 默认值 `dev-token-change-me` | 建议添加 `.env.example` 并引导新人从 config.yaml 分离敏感配置 |
| D3 调试工具 | ⚠️ 缺少开发调试说明 | 建议添加 `uvicorn main:app --reload --log-level debug` 的开发模式说明 |
| D4 测试覆盖 | ⚠️ 项目无自动化测试 | 建议至少添加 `tests/test_health.py` 验证健康检查端点 |

**当前状态**: 新人入职路径清晰。建议添加 OpenAPI 文档指引和 .env.example 以改善开发体验。
