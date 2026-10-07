---

doc_type: test
title: "YiAi 七月迭代 — RAG 检索引擎 / Knowledge Watcher / 模块执行沙箱 / 认证系统 — 测试规格"
status: 待开始
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202607"
prd_task_id: "YI-07-01"
source_prds: ["00-需求总览"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YiAi 七月迭代 — 整体测试策略与跨模块集成测试规格

> **文档职责**：本文档定义七月迭代 7 大模块的**整体测试策略**和**跨模块集成测试**。各模块的独立测试规格见对应文件。

> 来源 PRD：[00-需求总览.md](../../prds/2026-07/00-需求总览.md)
> 来源 Dev：[00-prd-task-00-需求总览.md](../../devs/2026-07/00-prd-task-00-需求总览.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 迭代测试全景

七月迭代共 7 个模块，测试分层如下：

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级别，无外部依赖 | pytest + unittest.mock | ErrorCode 枚举、RpcResponse、bcrypt hash、frontmatter 解析 |
| L2 集成测试 | 模块间交互，真实 MongoDB (test db) | pytest-asyncio + httpx + motor | RPC 路由、认证中间件、Watcher 同步、沙箱执行 |
| L3 手动回归 | 全栈端到端 | 手动 + curl + YiVad 页面 | RAG 检索端到端、Ollama SSE 流式、企微消息送达 |
| L4 性能基准 | 关键路径延迟测量 | pytest + time.perf_counter | RPC 路由延迟、轮询开销、RAG 检索 P95 |

### 1.2 各模块测试独立文档

| 编号 | 模块 | 测试文件 | 优先级 |
|------|------|---------|--------|
| YA-07-01 | RAG 混合检索引擎 | (待补充) | P0 |
| YA-07-02 | 知识库监听器 | [02-prd-test-知识库监听器.md](./02-prd-test-知识库监听器.md) | P0 |
| YA-07-03 | RPC 信封协议 | [03-prd-test-RPC信封协议.md](./03-prd-test-RPC信封协议.md) | P0 |
| YA-07-04 | AI 聊天服务 | (待补充) | P0 |
| YA-07-05 | 模块执行沙箱 | [05-prd-test-模块执行沙箱.md](./05-prd-test-模块执行沙箱.md) | P0 |
| YA-07-06 | 认证与授权系统 | [06-prd-test-认证与授权系统.md](./06-prd-test-认证与授权系统.md) | P0 |
| YA-07-07 | 企业微信消息推送 | [07-prd-test-企业微信消息推送.md](./07-prd-test-企业微信消息推送.md) | P1 |

### 1.3 测试环境

| 环境要求 | 说明 |
|----------|------|
| Python | 3.10+，所有依赖安装 (requirements.txt) |
| MongoDB | 测试数据库 `test_yiai`，Motor 异步驱动 |
| Ollama | 必须运行，模型 `qwen2.5` + `nomic-embed-text` 已加载 |
| YiKnowledge | 测试用 markdown 目录树（`tests/fixtures/knowledge/`） |
| YiAi 服务 | `python main.py` 启动，端口 10086 |
| 企业微信 | 可选——仅 L3 手动回归需要真实 Webhook URL |

### 1.4 测试数据

```python
# tests/conftest.py 新增 fixtures

@pytest.fixture
def sample_rpc_request():
    """标准 RPC 信封请求 fixture。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {"cname": "menus", "filter": {}}
    }

@pytest.fixture
def sample_knowledge_md_tree(tmp_path):
    """在临时目录创建模拟 YiKnowledge 目录树。"""
    base = tmp_path / "YiKnowledge"
    base.mkdir()
    (base / "test-file.md").write_text("""---
title: "测试文档"
tags: [test, integration]
category: "项目/测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: draft
---

# 测试文档内容

这是测试正文。
""")
    (base / "subdir").mkdir()
    (base / "subdir" / "nested.md").write_text("""---
title: "嵌套文档"
tags: [nested]
category: "项目/测试"
created: 2026-09-23
updated: 2026-09-23
source: internal
type: test
status: draft
---

# 嵌套文档内容
""")
    return base

@pytest.fixture
async def test_mongo_collection():
    """创建测试集合，测试后自动清理。"""
    from data.database import get_database
    db = get_database()
    collection = db["test_integration"]
    yield collection
    await collection.drop()

@pytest.fixture
async def clean_knowledge_files():
    """测试前清空 knowledge_files 集合，测试后恢复。"""
    from data.database import get_database
    db = get_database()
    collection = db["knowledge_files"]
    # 保存当前文档数
    count_before = await collection.count_documents({})
    yield collection
    # 注意：实际测试中应使用 test database，此处仅示意
```

---

<a id="sec-cross-module"></a>
## 二、跨模块集成测试

七月迭代的 7 个模块不是孤立的，它们通过 RPC 协议紧密协作。以下测试验证模块间的集成正确性。

### 2.1 模块间依赖关系

```
RPC 信封协议 (03) ──→ 模块执行沙箱 (05)
        │                    │
        ├──→ AI 聊天服务 (04) ←── RAG 检索引擎 (01) ←── 知识库监听器 (02)
        ├──→ 认证与授权 (06)
        └──→ 企业微信推送 (07)
```

关键集成路径：
1. **RPC → 沙箱 → 服务**：所有前端请求经过 RPC 路由，由沙箱安全分发到各 Service
2. **Watcher → RAG**：监听器同步文件后触发 RAG 索引增量更新
3. **聊天 → RAG**：AI 聊天可选启用 RAG 增强（检索知识库内容注入上下文）
4. **认证 → 所有端点**：认证中间件保护所有非白名单端点

### TC-CROSS-001: RPC 路由 → 沙箱白名单 → Service 调用完整链路

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | YiAi 服务运行，MongoDB test db 可用，`module_allowlist` 配置正确 |
| **步骤** | 1. 发送 POST / RPC 请求 `{module_name: "services.database.data_service", method_name: "query_documents", parameters: {cname: "menus", filter: {}}}`<br/>2. 检查 RPC 路由是否正确分发到 `data_service.query_documents`<br/>3. 检查沙箱白名单是否通过（模块在白名单内）<br/>4. 检查 MongoDB 查询是否正常执行 |
| **预期结果** | - HTTP 200<br/>- 响应 `{code: 0, message: "ok", data: {list: [...], ...}}`<br/>- RPC 路由日志包含 `RPC dispatch: module=services.database.data_service function=query_documents` |

### TC-CROSS-002: RPC 路由 → 沙箱拒绝非白名单模块

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `module_allowlist` 不包含 `os` 或 `subprocess` |
| **步骤** | 1. 发送 POST / RPC 请求 `{module_name: "os", method_name: "system", parameters: {}}`<br/>2. 检查沙箱白名单校验 |
| **预期结果** | - 沙箱拒绝执行<br/>- 返回 `{code: 4002, message: "Execution forbidden: os:system"}`<br/>- 或等价的白名单拒绝响应 |

### TC-CROSS-003: 认证中间件 → RPC 端点受保护访问

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | `middleware.auth_enabled=true` |
| **步骤** | 1. 不带 X-Token 请求受保护的 RPC 端点<br/>2. 带有效 JWT Token 再次请求 |
| **预期结果** | - 无 Token 时返回 401 `{code: 4001}`<br/>- 有 Token 时正常返回数据 |

### TC-CROSS-004: Knowledge Watcher 同步 → RAG 索引增量更新

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **前提** | Knowledge Watcher 和 RAG Indexer 均正常运行 |
| **步骤** | 1. 在 YiKnowledge 测试目录新增一个 markdown 文件<br/>2. 等待 Watcher 下一轮 60s 轮询（或手动触发 `scan_knowledge`）<br/>3. 检查 MongoDB `knowledge_files` 集合是否有新文档<br/>4. 检查 RAG 索引是否被触发更新 |
| **预期结果** | - MongoDB `knowledge_files` 中出现新文档<br/>- RAG 索引器日志包含 `incremental rebuild triggered`<br/>- RAG 检索可查到新文件内容 |

### TC-CROSS-005: AI Chat → RAG → SSE 流式响应

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-005 |
| **层级** | L3 手动回归 |
| **优先级** | P1 |
| **前提** | Ollama + MongoDB 运行，RAG 索引已构建 |
| **步骤** | 1. 通过 RPC 信封发起 `rag_chat` 请求，query 为"YrY 的权限系统如何设计"<br/>2. 监听 SSE 流<br/>3. 验证流中的 `type: status/chunk/token/done` 事件<br/>4. 检查 AI 回答是否引用了知识库内容 |
| **预期结果** | - SSE 流正常推送四种类型事件<br/>- 回答中包含知识库来源引用<br/>- 首 token 延迟 < 2s<br/>- 完成后收到 `type: done` |

### TC-CROSS-006: 企微推送 ← AI Chat 完成回调

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-006 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **前提** | 企业微信 Webhook URL 可用（或 mock） |
| **步骤** | 1. 模拟 AI Chat `onDone` 回调，触发 `forwardReplyToWeCom`<br/>2. 调用 `POST /wework/send-message`<br/>3. 检查企微 Webhook 收到消息 |
| **预期结果** | - 企微 Webhook 返回 `{errcode: 0}`<br/>- 转发失败不阻断聊天完成流程 |

### TC-CROSS-007: 端到端：前端 RPC → 沙箱 → 认证 → Service → MongoDB

| 字段 | 内容 |
|------|------|
| **ID** | TC-CROSS-007 |
| **层级** | L3 手动回归 |
| **优先级** | P0 |
| **前提** | YiAi + MongoDB + Ollama 全部运行 |
| **步骤** | 1. 在 YiVad 管理后台登录<br/>2. 打开数据管理页面，查询 menus 集合<br/>3. 打开聊天页面，发送 RAG 增强消息<br/>4. 打开知识库页面，触发扫描 |
| **预期结果** | - 登录成功获得 JWT Token<br/>- 数据列表正常展示<br/>- RAG 回答包含知识库引用<br/>- 知识扫描返回同步文件数 |

---

<a id="sec-regression"></a>
## 三、回归测试

确保七月迭代不破坏已有功能。以下端点必须在每次迭代后验证。

### TC-REG-001: 七月前已有端点保持正常

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `POST /read-file` with `{target_file: "CLAUDE.md"}`<br/>2. `POST /write-file` with `{target_file: "test.txt", content: "test"}`<br/>3. `POST /` RPC `data_service.query_documents` |
| **预期结果** | - `/read-file` 返回文件内容<br/>- `/write-file` 返回 `{code: 0}`<br/>- `data_service` 返回标准分页响应 |

### TC-REG-002: SSE 流式聊天仍可用（非 RAG 模式）

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 发起 `chat_service.chat` RPC（非 RAG 模式）<br/>2. 验证 SSE 流 |
| **预期结果** | - SSE 流正常推送 token 事件<br/>- 完成后收到 `done` 事件<br/>- `Semaphore(3)` 并发限制生效 |

### TC-REG-003: 参数名契约未退化

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-003 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. 用错误参数名 `query` 替代 `filter` 调用 `data_service.query_documents`<br/>2. 用错误参数名 `path` 替代 `target_file` 调用 `/read-file` |
| **预期结果** | - `query` 被静默忽略，WARNING 日志记录 "Unknown parameter 'query'"<br/>- `path` 返回 422（FastAPI 参数校验） |

### TC-REG-004: MongoDB 连接健康

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-004 |
| **层级** | L2 集成 |
| **优先级** | P0 |
| **步骤** | 1. `/health/live` → 期望 `{status: "alive"}`<br/>2. `/health/ready` → 期望 `{status: "ready"}` |
| **预期结果** | - 两个健康检查端点均返回 200<br/>- `/health/ready` 包含 MongoDB/Ollama 连接状态 |

---

<a id="sec-edge-cases"></a>
## 四、跨模块边界与异常测试

### TC-EDGE-001: MongoDB 不可达时各服务的降级行为

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 停止 MongoDB<br/>2. 分别调用 data_service, chat_service, knowledge_service<br/>3. 检查各服务的降级行为 |
| **预期结果** | - `data_service.query_documents` 返回 `{code: 5001, message: "数据库错误"}`<br/>- `chat_service` SSE 流可以处理（聊天下文在内存中）<br/>- `knowledge_service` 扫描跳过本轮，日志记录 "MongoDB unreachable" |

### TC-EDGE-002: Ollama 不可达时 RAG 降级

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 停止 Ollama<br/>2. 调用 `rag_service.rag_query` |
| **预期结果** | - 返回 `{code: 2001, message: "AI 服务不可用"}`<br/>- 不返回 500 或空响应 |

### TC-EDGE-003: 并发 RPC 调用下模块缓存一致

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 使用 `asyncio.gather` 同时发送 20 个 RPC 请求到 5 个不同 Service<br/>2. 检查所有响应 |
| **预期结果** | - 20 个请求全部成功（code=0）<br/>- `importlib` 模块缓存未出现竞争<br/>- 不同请求不串扰 |

### TC-EDGE-004: 知识库文件大量变更时的同步性能

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 在 YiKnowledge 测试目录创建 200 个新 markdown 文件<br/>2. 触发全量扫描<br/>3. 测量扫描耗时 |
| **预期结果** | - 200 文件扫描耗时 < 5s<br/>- MongoDB `knowledge_files` 文档数正确（200）<br/>- `bulk_write` 分批执行，每批 1000 条 |

### TC-EDGE-005: 中间件白名单路径不受认证限制

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-005 |
| **层级** | L2 集成 |
| **优先级** | P1 |
| **步骤** | 1. 认证开启时，不带 Token 访问 `/auth/login`、`/health`、`/about` |
| **预期结果** | - 白名单路径正常响应（不返回 401）<br/>- 非白名单路径（如 RPC 端点）返回 401 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 涉及模块 | 测试用例 | 覆盖层级 |
|--------|---------|---------|---------|
| FR-全链路 RPC | RPC + 沙箱 + Service | TC-CROSS-001 | L2 |
| FR-安全隔离 | RPC + 沙箱 | TC-CROSS-002 | L2 |
| FR-认证保护 | 认证 + RPC | TC-CROSS-003 | L2 |
| FR-知识同步 → 检索 | Watcher + RAG | TC-CROSS-004 | L2 |
| FR-RAG 聊天 | Chat + RAG | TC-CROSS-005 | L3 |
| FR-消息转发 | Chat + 企微 | TC-CROSS-006 | L2 |
| FR-端到端体验 | 全部 | TC-CROSS-007 | L3 |
| FR-已有功能兼容 | 全部 | TC-REG-001~004 | L2 |
| — | — | TC-EDGE-001~005 (边界) | L2 |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| RAG 检索 L1 单元测试缺失 | 七月迭代仅要求 L4 手动回归，L1-L3 计划八月补充 | 八月迭代补充 `test_rag_engine.py` |
| 企业微信真实 Webhook E2E | 测试环境无真实企微 Webhook URL | Mock HTTP endpoint 作为 Webhook 接收方 |
| 跨项目前端 E2E (YiVad/YiPet) | 前端测试独立于后端测试策略 | YiVad/YiPet 各自维护 E2E 测试 |
| 性能基准测试 | 七月迭代未建立性能基线 | 随可观测性迭代（九月）引入性能基准 |
| Docker 环境兼容性 | 测试仅在 macOS 执行 | CI 中增加 Linux Docker 环境测试 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [00-需求总览.md](../../prds/2026-07/00-需求总览.md) |
| 源 Dev Module | [00-prd-task-00-需求总览.md](../../devs/2026-07/00-prd-task-00-需求总览.md) |
| RPC 协议测试 | [03-prd-test-RPC信封协议.md](./03-prd-test-RPC信封协议.md) |
| 认证系统测试 | [06-prd-test-认证与授权系统.md](./06-prd-test-认证与授权系统.md) |
| 模块沙箱测试 | [05-prd-test-模块执行沙箱.md](./05-prd-test-模块执行沙箱.md) |
| 知识库监听器测试 | [02-prd-test-知识库监听器.md](./02-prd-test-知识库监听器.md) |
| RPC 契约测试 (九月) | [../2026-09/14-prd-test-RPC契约测试.md](../2026-09/14-prd-test-RPC契约测试.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-07/00-需求总览.md`*