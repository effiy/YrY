---
title: YiAi 缺陷索引
tags: [yiai, bugs, index]
category: projects/yiai/bugs
created: 2026-09-07
updated: 2026-09-11
source: YiAi
type: index
status: active
---

# YiAi 缺陷追踪

> 按月份 → 分类归档的缺陷记录，每个缺陷包含复现步骤、根因分析、修复方案和预防措施。

## 目录结构

```
bugs/
├── README.md
├── 2026-07/
│   └── 模板/
├── 2026-08/
│   └── 模板/
└── 2026-09/
    ├── 模板/
    ├── 代码质量/
    ├── 中间件/
    ├── 企业微信/
    ├── 大模型/
    ├── 执行/
    ├── 接口/
    ├── 搜索/
    ├── 数据/
    ├── 状态/
    ├── 知识库/
    ├── 认证/
    ├── 配置/
    ├── MCP/
    ├── RAG/
    └── SSE/
```

## 分类目录

| 分类 | 路径示例 | 说明 |
|------|------|------|
| API 通信 | `2026-09/接口/` | RPC 协议、参数契约、SSE 流式、中间件 |
| 架构 | `2026-09/architecture/` | 分层违反、模块边界、Service 层职责、依赖方向 |
| 认证 | `2026-09/认证/` | JWT、bcrypt、中间件、Token 刷新、安全配置 |
| 配置 | `2026-09/配置/` | 配置加载、环境变量、pydantic-settings、YAML 扁平化 |
| 数据层 | `2026-09/数据/` | MongoDB 查询、连接池、Repository、Cursor 管理 |
| 模块执行 | `2026-09/执行/` | 代码执行、沙箱、超时、资源限制 |
| 知识库 | `2026-09/知识库/` | 文件监视器、bulk_write、sync、RAG 触发 |
| LLM 推理 | `2026-09/大模型/` | Ollama 调用、Embedding 维度、模型切换、流式响应 |
| MCP | `2026-09/MCP/` | MCP 协议、工具发现、工具注册 |
| 中间件 | `2026-09/中间件/` | 异常处理、CORS、限流、Observer |
| RAG 引擎 | `2026-09/RAG/` | 检索、索引构建、llama_index、向量存储、竞态条件 |
| 搜索 | `2026-09/搜索/` | 全局搜索、空查询、全表扫描 |
| SSE | `2026-09/SSE/` | 流式响应、错误传播、连接管理 |
| 状态存储 | `2026-09/状态/` | TTL、数据清理、KV 存储 |
| 企业微信 | `2026-09/企业微信/` | Token 刷新、消息推送、API 集成 |
| 代码质量 | `2026-09/代码质量/` | 未使用导入、未使用变量、代码风格 |
| 模板 | `{月份}/模板/` | 缺陷模板（每月一份） |

> 新缺陷按 `{月份}/{分类}/` 归类，分类目录不存在时创建。

## 严重度

| 严重度 | 定义 |
|--------|------|
| **critical** | 服务不可用、数据丢失或安全漏洞 |
| **major** | 核心功能不可用，但服务可基本运行 |
| **minor** | 功能受损但不影响核心流程 |
| **trivial** | 视觉瑕疵、文案错误 |

## 优先级

| 优先级 | 响应 |
|--------|------|
| **P0** | 即时修复，阻塞发布 |
| **P1** | 下一迭代 |
| **P2** | 计划内修复 |
| **P3** | 积压待排 |

## 生命周期

```
open → analyzing → in_progress → resolved → verified → closed
  │                                              │
  └── cannot_reproduce / wont_fix                └── 验证失败 → open
```

## 缺陷列表

| 月份 | ID | 标题 | 严重度 | 优先级 | 分类 | 模块 | 状态 | 日期 |
|------|----|------|--------|--------|------|------|------|------|
| 2026-09 | 1 | [RPC 参数名 query vs filter 静默忽略](./2026-09/接口/01-接口-RPC参数query-vs-filter静默忽略.md) | major | p1 | api | domain/data/data_service.py | resolved | 2026-09-05 |
| 2026-09 | 2 | [MongoDB 连接池耗尽导致高并发下请求超时](./2026-09/数据/01-数据-MongoDB连接池耗尽.md) | major | p1 | data | domain/data/database.py | resolved | 2026-09-06 |
| 2026-09 | 3 | [Ollama Embedding 模型切换后维度不匹配](./2026-09/大模型/01-模型-Ollama-Embedding维度不匹配.md) | major | p1 | llm | domain/rag/embedder.py | resolved | 2026-09-03 |
| 2026-09 | 4 | [VectorStoreIndex.insert_documents 方法不存在](./2026-09/RAG/01-RAG-VectorStoreIndex-insert_documents方法不存在.md) | major | p1 | rag | domain/rag/indexer.py | resolved | 2026-09-07 |
| 2026-09 | 5 | [JWT Secret 使用硬编码默认值，生产环境未强制覆盖](./2026-09/认证/01-认证-JWT-Secret硬编码默认值.md) | major | p1 | auth | src/shared/config.py | resolved | 2026-09-07 |
| 2026-09 | 6 | [YAML 配置扁平化导致嵌套键名冲突](./2026-09/配置/01-配置-YAML配置扁平化键名冲突.md) | minor | p2 | config | src/shared/config.py | resolved | 2026-09-07 |
| 2026-09 | 7 | [stream_async 中生成器异常未被捕获，客户端收到截断流](./2026-09/SSE/01-SSE-stream-async生成器异常未被捕获.md) | major | p1 | sse | src/shared/sse_utils.py | resolved | 2026-09-07 |
| 2026-09 | 8 | [header_verification_middleware 异常处理器吞没真实错误](./2026-09/中间件/01-中间件-异常处理器吞没真实错误.md) | minor | p2 | middleware | src/server/middleware.py | resolved | 2026-09-07 |
| 2026-09 | 9 | [Watcher bulk_write 部分失败时返回成功计数](./2026-09/知识库/01-知识-Watcher-bulk-write部分失败.md) | minor | p2 | knowledge | src/domain/knowledge/watcher.py | resolved | 2026-09-07 |
| 2026-09 | 10 | [增量刷新与全量重建存在竞态条件](./2026-09/RAG/02-RAG-增量刷新与全量重建竞态条件.md) | major | p1 | rag | src/domain/knowledge/watcher.py | resolved | 2026-09-07 |
| 2026-09 | 11 | [模块执行器缺少超时和资源限制](./2026-09/执行/01-执行-模块执行器缺少超时和资源限制.md) | major | p1 | execution | src/domain/execution/executor.py | resolved | 2026-09-07 |
| 2026-09 | 12 | [WeWork Token 刷新无并发保护](./2026-09/企业微信/01-企微-Token刷新无并发保护.md) | minor | p2 | wework | src/domain/wework/client.py | resolved | 2026-09-07 |
| 2026-09 | 13 | [状态记录 TTL 未强制执行](./2026-09/状态/01-状态-状态记录TTL未强制执行.md) | minor | p2 | state | src/domain/state/recorder.py | resolved | 2026-09-07 |
| 2026-09 | 14 | [全局搜索空查询未做防护，导致全表扫描](./2026-09/搜索/01-搜索-空查询未做防护导致全表扫描.md) | minor | p2 | search | src/server/routes/search.py | resolved | 2026-09-07 |
| 2026-09 | 15 | [MCP Server 工具发现失败时静默降级](./2026-09/MCP/01-MCP-MCP工具发现静默失败.md) | minor | p2 | mcp | src/server/mcp_server.py | resolved | 2026-09-07 |
| 2026-09 | 16 | [chat.py 和 tools.py 存在未使用的 import](./2026-09/代码质量/01-质量-chat-tools未使用的导入.md) | trivial | p3 | code-quality | src/domain/ai/ | closed | 2026-09-09 |
| 2026-09 | 17 | [repository.py 和 code_health_service.py 存在未使用变量](./2026-09/代码质量/02-质量-repository模块未使用的变量.md) | trivial | p3 | code-quality | src/data/, src/services/ | closed | 2026-09-09 |
| 2026-09 | 18 | [code_health_service.py 使用歧义变量名 l](./2026-09/代码质量/03-质量-变量命名模糊不清.md) | trivial | p3 | code-quality | src/services/code_health_service.py | closed | 2026-09-09 |
| 2026-09 | 19 | [第二批未使用 import 和变量清理](./2026-09/代码质量/04-质量-第二批未使用的导入.md) | trivial | p3 | code-quality | 6 个文件 | closed | 2026-09-09 |
| 2026-09 | 20 | [except 块中 raise 未使用 from 保留异常链](./2026-09/代码质量/05-质量-except块中raise缺少from.md) | minor | p2 | code-quality | 3 个文件 | closed | 2026-09-09 |
| 2026-09 | 21 | [循环变量未使用及 noqa 冗余](./2026-09/代码质量/06-质量-未使用的循环变量和noqa.md) | trivial | p3 | code-quality | 2 个文件 | closed | 2026-09-09 |
| 2026-09 | 22 | [异步函数中使用阻塞 open() 调用](./2026-09/代码质量/07-质量-异步函数中使用阻塞式open.md) | major | p1 | code-quality | 4 个文件 | closed | 2026-09-09 |
| 2026-09 | 23 | [遗留 print 语句和未引用的 asyncio 任务](./2026-09/代码质量/08-质量-print语句和悬空任务.md) | minor | p2 | code-quality | 3 个文件 | closed | 2026-09-09 |
| 2026-09 | 24 | [try-except-pass 静默吞没异常](./2026-09/代码质量/09-质量-try-except-pass静默吞异常.md) | minor | p2 | code-quality | 9 个文件 | closed | 2026-09-09 |
| 2026-09 | 25 | [try-except-continue 静默跳过循环异常](./2026-09/代码质量/10-质量-try-except-continue静默吞异常.md) | minor | p2 | code-quality | 5 个文件 | closed | 2026-09-09 |
| 2026-09 | 26 | [使用裸 Exception 而非 BusinessException](./2026-09/代码质量/11-质量-抛原生异常而非业务异常.md) | minor | p2 | code-quality | src/domain/execution/executor.py | closed | 2026-09-09 |
| 2026-09 | 27 | [state/recorder.py 整个模块为死代码桩](./2026-09/代码质量/12-质量-stub-recorder死代码模块.md) | trivial | p3 | code-quality | src/domain/state/recorder.py | open | 2026-09-09 |
| 2026-09 | 28 | [StateStoreService 方法内部延迟导入](./2026-09/代码质量/13-质量-state-service延迟导入.md) | trivial | p3 | code-quality | src/domain/state/service.py | open | 2026-09-09 |
| 2026-09 | 29 | [_seed_collection_if_empty 静默吞没数据库异常](./2026-09/代码质量/14-质量-seed集合错误静默忽略.md) | minor | p2 | code-quality | src/app.py | closed | 2026-09-09 |
| 2026-09 | 30 | [_apply_rss_date_filters 原地修改输入字典](./2026-09/代码质量/15-质量-RSS日期过滤副作用.md) | minor | p2 | code-quality | src/data/repository.py | closed | 2026-09-09 |
| 2026-09 | 31 | [delete_document 中 bug/issue 删除逻辑重复](./2026-09/代码质量/16-质量-Bug和Issue删除逻辑重复.md) | trivial | p3 | code-quality | src/data/repository.py | open | 2026-09-09 |
| 2026-09 | 32 | [_resolve_project_path 函数过长且圈复杂度高](./2026-09/代码质量/17-质量-resolve-project-path逻辑复杂.md) | minor | p2 | code-quality | src/domain/files/local.py | open | 2026-09-09 |
| 2026-09 | 33 | [_lookup_source_category 和 _get_enabled_sources 吞没异常](./2026-09/代码质量/18-质量-分类查找吞没异常.md) | minor | p2 | code-quality | src/domain/rss/feed.py, scheduler.py | open | 2026-09-09 |
| 2026-09 | 34 | [is_image_file 函数在 maintenance.py 和 paths.py 中重复](./2026-09/代码质量/19-质量-is-image-file函数重复.md) | trivial | p3 | code-quality | 2 个文件 | closed | 2026-09-09 |
| 2026-09 | 35 | [feed.py 辅助函数使用通用 Exception 捕获](./2026-09/代码质量/20-质量-feed-helpers中宽泛的except.md) | trivial | p3 | code-quality | src/domain/rss/feed.py | closed | 2026-09-09 |
| 2026-09 | 36 | [硬编码的运维参数应移至 config.yaml](./2026-09/代码质量/21-质量-硬编码运维配置值.md) | minor | p2 | code-quality | 13 个文件 | open | 2026-09-09 |
| 2026-09 | 37 | [模块级可变状态导致测试隔离问题](./2026-09/代码质量/22-质量-模块级可变状态.md) | minor | p2 | code-quality | 4 个文件 | open | 2026-09-09 |
| 2026-09 | 38 | [_format_sse 和 _stream_async 在路由模块中重复](./2026-09/代码质量/23-质量-SSE格式化代码重复.md) | trivial | p3 | code-quality | 2 个路由模块 | open | 2026-09-09 |
| 2026-09 | 39 | [Dashboard 端点 to_list(length=None) 无限制加载全量数据](./2026-09/代码质量/24-质量-无限制to-list内存风险.md) | minor | p2 | code-quality | 4 个路由文件 | open | 2026-09-09 |
| 2026-09 | 40 | [多处 find() 查询未使用投影限制返回字段](./2026-09/代码质量/25-质量-find查询缺少字段投影.md) | trivial | p3 | code-quality | 7 个文件 | open | 2026-09-09 |
| 2026-09 | 41 | [data_service.py 四个 RPC 方法缺失参数类型注解](./2026-09/代码质量/26-质量-RPC方法缺少类型注解.md) | trivial | p3 | code-quality | 7 个文件 | open | 2026-09-09 |
| 2026-09 | 42 | [execute_module 路由将完整请求参数记录到日志](./2026-09/代码质量/27-质量-日志中泄露敏感数据.md) | minor | p2 | code-quality | src/server/routes/execution.py | closed | 2026-09-09 |
| 2026-09 | 43 | [FastAPI app 未配置请求体大小限制](./2026-09/代码质量/28-质量-缺少请求体大小限制.md) | minor | p2 | code-quality | src/app.py, main.py | open | 2026-09-09 |
| 2026-09 | 44 | [datetime.now() 未指定时区导致 naive datetime](./2026-09/代码质量/29-质量-未处理时区的datetime-now.md) | trivial | p3 | code-quality | storage.py, local.py, repository.py | closed | 2026-09-09 |
| 2026-09 | 45 | [tools.py _ALLOWED_ROOTS 白名单包含过时路径引用](./2026-09/代码质量/30-质量-allowed-roots包含过时路径.md) | trivial | p3 | code-quality | src/domain/ai/tools.py | open | 2026-09-09 |
| 2026-09 | 46 | [asyncio.gather 未设置 return_exceptions 单任务失败取消全部](./2026-09/代码质量/31-质量-asyncio-gather未使用return-exceptions.md) | minor | p2 | code-quality | dashboard.py, scheduler.py | closed | 2026-09-09 |
| 2026-09 | 56 | [logging.py os.makedirs 无 exist_ok 存在竞态条件](./2026-09/代码质量/42-质量-makedirs缺exist-ok竞态条件.md) | trivial | p3 | code-quality | src/shared/logging.py | open | 2026-09-09 |
| 2026-09 | 57 | [is 用于非 None 值比较应改为 ==](./2026-09/代码质量/43-质量-is与等于比较混用.md) | trivial | p3 | code-quality | 多个模块 | open | 2026-09-09 |
| 2026-09 | 58 | [services/audit/__init__.py 为空文件](./2026-09/代码质量/44-质量-audit模块空init文件.md) | trivial | p3 | code-quality | src/services/audit/ | open | 2026-09-09 |
| 2026-09 | 59 | [SSE 编码 .encode() 未显式指定 utf-8](./2026-09/代码质量/45-质量-编码未显式指定utf8.md) | trivial | p3 | code-quality | sse_utils.py, openai_compat.py, rag.py | open | 2026-09-09 |
| 2026-09 | 60 | [audit_service.py 查询未设置 maxTimeMS 超时](./2026-09/代码质量/46-质量-audit查询缺少超时.md) | trivial | p3 | code-quality | src/services/audit/ | open | 2026-09-09 |
| 2026-09 | 62 | [app.py 中 if __name__ 死代码从未被执行](./2026-09/代码质量/48-质量-app-py中死代码入口.md) | trivial | p3 | code-quality | src/app.py | open | 2026-09-09 |
| 2026-09 | 91 | [未配置结构化 JSON 日志格式](./2026-09/代码质量/77-质量-缺少结构化JSON日志.md) | trivial | p3 | code-quality | shared/logging.py | open | 2026-09-09 |
| 2026-09 | 93 | [硬编码日志路径 logs/app.log](./2026-09/代码质量/79-质量-日志路径硬编码.md) | trivial | p3 | code-quality | shared/logging.py | open | 2026-09-09 |

## 分类统计

### 按严重度

| 严重度 | 数量 | 缺陷 |
|--------|------|------|
| critical | 0 | — |
| major | 9 | #1, #2, #3, #4, #5, #7, #10, #11, #22 |
| minor | 21 | #6, #8, #9, #12, #13, #14, #15, #20, #23, #24, #25, #26, #29, #30, #32, #33, #36, #37, #39, #42, #43 |
| trivial | 14 | #16, #17, #18, #19, #21, #27, #28, #31, #34, #35, #38, #40, #41, #44 |

### 按分类

| 分类 | 数量 | 缺陷 |
|------|------|------|
| api | 1 | #1 |
| auth | 1 | #5 |
| config | 1 | #6 |
| data | 1 | #2 |
| execution | 1 | #11 |
| knowledge | 1 | #9 |
| llm | 1 | #3 |
| mcp | 1 | #15 |
| middleware | 1 | #8 |
| rag | 2 | #4, #10 |
| search | 1 | #14 |
| code-quality | 23 | #16, #17, #18, #19, #20, #21, #22, #23, #24, #25, #26, #27, #28, #29, #30, #31, #32, #33, #34, #35, #36, #37, #38 |
| sse | 1 | #7 |
| state | 1 | #13 |
| wework | 1 | #12 |

### 按优先级

| 优先级 | 数量 | 缺陷 |
|--------|------|------|
| p0 | 0 | — |
| p1 | 9 | #1, #2, #3, #4, #5, #7, #10, #11, #22 |
| p2 | 18 | #6, #8, #9, #12, #13, #14, #15, #20, #23, #24, #25, #26, #29, #30, #32, #33, #36, #37 |
| p3 | 11 | #16, #17, #18, #19, #21, #27, #28, #31, #34, #35, #38 |

## 常见缺陷模式

### API 通信（接口/）

- **参数名不匹配**：RPC 参数名使用 `query` 而非 `filter` 导致后端静默忽略。始终参考 API 规范 #关键参数约定。
- **响应结构假设**：未校验 `response.data` 结构直接访问深层属性。始终先校验 `code` 字段再访问 `data`。

### 数据层（数据/）

- **连接池耗尽**：高并发下 Motor 连接池默认 `maxPoolSize=100` 但 `minPoolSize=0`，突发流量时连接建立延迟。设置 `minPoolSize=10` 预热连接池。
- **Cursor 泄漏**：`collection.find()` 返回的 cursor 未显式关闭。始终使用 `try/finally` 或 `async with` 确保 cursor 关闭。
- **聚合超时**：复杂聚合管道未设置 `maxTimeMS`。始终设置合理的超时时间。

### RAG 引擎（RAG/）

- **llama_index API 兼容性**：调用前验证方法存在性（`hasattr`），升级依赖前检查 CHANGELOG。
- **向量维度不匹配**：Embedding 模型切换后向量维度可能变化，需重建索引。
- **竞态条件**：增量刷新和全量重建操作同一索引目录。使用 `asyncio.Lock` 串行化索引操作。

### LLM 推理（大模型/）

- **Embedding 维度不匹配**：切换模型时未校验向量维度。初始化时探测维度，加载索引时校验匹配。
- **异常静默吞没**：通用 `except Exception` 捕获维度不匹配异常后返回空结果。异常应分类处理。

### 配置（配置/）

- **YAML 扁平化键冲突**：嵌套 YAML 键名扁平化后可能重复。使用 `{module}_{field}` 命名模式避免冲突。
- **安全配置默认值**：JWT Secret、Auth Token 等安全配置使用硬编码默认值。生产环境 MUST 通过环境变量覆盖。

### SSE 流式（SSE/）

- **异常不传播**：生成器异常时仅发送 `done` 帧，客户端误以为流正常结束。在 `done` 帧中携带 `error` 字段。
- **连接未超时**：SSE 连接无超时限制。设置合理的连接级别超时。

### 中间件（中间件/）

- **异常吞没**：中间件通用 `except Exception` 返回通用错误，掩盖真实 bug。开发环境返回详细错误信息。
- **CORS 配置过宽**：`allow_any_origin: true` 且 `origins: ["*"]`。生产环境应限制允许的 Origin。

### 架构（architecture/）

- **Service 层薄包装**：Service 层仅做 re-export，无业务编排。Service 层 MUST 包含参数校验、审计日志、错误转换。
- **跨层直接调用**：Route 直接调用 Domain 层。必须通过 Service 层。

### 排查流程

1. 确认问题是否可稳定复现（frequency: always / intermittent）
2. 检查 YiAi 日志中的错误堆栈（`logs/` 目录）
3. 使用 `curl` 或 Postman 直接调用 API 端点验证
4. 检查 MongoDB 中的数据状态和连接池指标
5. 对比预期行为与实际行为，定位根因层级（API/Service/Domain/Data）
6. 根据根因归入对应分类目录

## 相关资源

- [缺陷模板](./2026-09/模板/00-模板-项目bug模板.md)
- [YiVad 缺陷索引](../yivad/bugs/README.md)
- [YiPet 缺陷索引](../yipet/bugs/README.md)
- [API 规范](../workflows/开发规范/04-规范-认证规范.md)
- [编码规范](../workflows/开发规范/01-规范-编码规范.md)
- [架构概览](../workflows/架构设计/01-架构-架构概览.md)