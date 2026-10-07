---

doc_type: test
title: "YiAi 九月迭代 — 稳定性加固 / RAG 优化 / Agent 可靠性 / API 契约 — 测试规格"
status: 待开始
priority: 高
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-01"
source_prds: ["00-需求总览"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YiAi 九月迭代 — 稳定性加固 / RAG 优化 / Agent 可靠性 / API 契约 — 测试规格

> **文档职责**：本文档定义**怎么验证**（VERIFY），不含产品目标与实现方案。

> 来源 PRD：[00-需求总览.md](../../prds/2026-09/00-需求总览.md)
> 提取日期：2026-09-11

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 纯函数/类级，无外部依赖 | pytest + unittest.mock | RPC 路由、参数校验、工具函数、数据模型 |
| L2 集成测试 | 真实 MongoDB + Ollama（可选 mock）| pytest-asyncio + motor + httpx | RPC 端点、Agent 循环、RAG 检索、数据 CRUD |
| L3 端到端测试 | 前后端联动验证 | curl + YiVad/YiPet 手动 | 关键用户路径（聊天、搜索、数据管理） |
| L4 性能基准 | 延迟/吞吐量/内存测量 | pytest + time.perf_counter + memory_profiler | API 响应延迟、SSE 流稳定性、并发容量 |

### 1.2 九月迭代总体测试策略

九月迭代聚焦四大方向，测试策略按优先级分层：

| 方向 | 优先级 | 测试重点 | 关键风险 |
|------|--------|---------|---------|
| 稳定性加固（RAG/数据层/Agent）| P0 | 静默失败检测、超时保护、连接池泄漏 | 生产环境数据丢失或服务不可用 |
| RAG 优化（检索/索引/数据管理）| P1-P2 | 检索精度、索引一致性、排序正确性 | 检索结果质量退化 |
| Agent 可靠性（超时/SSE/工具）| P0-P1 | 分层超时、错误传播、缓存策略 | Agent 循环挂起，用户无限等待 |
| API 契约（参数校验/类型同步）| P1 | 参数白名单、跨项目类型一致性 | 前端参数名漂移导致静默 bug |

### 1.3 测试环境要求

```yaml
Python: 3.10+
MongoDB: 7.x（test database: yiai_test）
Ollama: 运行中（可选 mock 替代）
pytest: 8.x
pytest-asyncio: 0.24+
pytest-cov: 5.x+
httpx: 0.27+
motor: 3.x+
```

### 1.4 全局验收标准

- [ ] 所有 P0 需求模块的 L1+L2 测试覆盖率 >= 80%
- [ ] 所有 P1 需求模块的 L1 测试覆盖率 >= 70%
- [ ] 零 S0 级缺陷逃逸到生产环境
- [ ] 核心 API 端点 P95 延迟不退化超过 10%
- [ ] SSE 流式响应无断连或内存泄漏

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

### 2.1 共享 Fixtures（tests/conftest.py）

```python
import pytest
import pytest_asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient, ASGITransport

@pytest.fixture(scope="session")
def mongodb_url():
    """测试数据库连接 URL。"""
    return "mongodb://localhost:27017/yiai_test"

@pytest_asyncio.fixture
async def test_db(mongodb_url):
    """创建测试数据库实例——每个测试函数独立。"""
    client = AsyncIOMotorClient(mongodb_url)
    db = client.get_default_database()
    yield db
    # 清理测试数据
    collections = await db.list_collection_names()
    for coll in collections:
        if coll != "system.indexes":
            await db[coll].delete_many({})
    client.close()

@pytest_asyncio.fixture
async def async_client():
    """创建 httpx AsyncClient 用于集成测试。"""
    from main import app
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

@pytest.fixture
def sample_rpc_request():
    """标准 RPC 信封请求体。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {
            "cname": "test_collection",
            "filter": {},
            "pageNum": 1,
            "pageSize": 10
        }
    }

@pytest.fixture
def sample_rpc_request_with_unknown_param():
    """包含未知参数的 RPC 信封。"""
    return {
        "module_name": "services.database.data_service",
        "method_name": "query_documents",
        "parameters": {
            "cname": "test_collection",
            "query": {"status": "open"},  # 错误参数名
            "filter": {}
        }
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 稳定性加固类（P0）

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-OV-01 | RAG 增量索引修复验证 | 知识库中有新文件待索引 | 1. Knowledge Watcher 检测到文件变更<br>2. 调用 `indexer.refresh_index(docs)` | 索引更新成功，日志显示 `inserted=N, errors=0` | P0 |
| TC-OV-02 | Embedding 维度不匹配自动检测 | 切换 Embedding 模型后重启服务 | 1. 修改 config.yaml embed_model<br>2. 重启 YiAi<br>3. 访问 `/health` | 启动时抛出 DimensionMismatchError，提示维度不匹配 | P0 |
| TC-OV-03 | 数据层连接池冷启动保护 | 服务重启后突发流量 | 1. 重启服务<br>2. 发送 10 个并发 `query_documents` 请求 | minPoolSize=10 预热连接，无超时 | P0 |
| TC-OV-04 | Cursor 泄漏修复验证 | 长时间运行后查询数据 | 1. 执行 1000 次 `find()` 操作<br>2. 检查连接池状态 | 连接数保持稳定，无持续增长 | P0 |
| TC-OV-05 | Agent 工具调用超时保护 | 模拟外部服务不可达 | 1. Agent 调用 `search_knowledge`<br>2. Ollama 无响应 | 30s 超时触发，Agent 继续执行而非崩溃 | P0 |

### 3.2 RAG 优化类（P1-P2）

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-OV-06 | RAG 检索结果排序正确性 | 知识库中有已知文档 | 1. 使用标准测试查询调用 `rag_query`<br>2. 对比 Top-5 排序与预期 | 排序与人工标注一致，NDCG@5 >= 0.8 | P1 |
| TC-OV-07 | 索引一致性校验 | 知识库 100 个文档 | 1. `rag_build` 全量重建索引<br>2. 检查 `knowledge_files` 数量 | 索引文档数 = 知识库文件数 | P1 |
| TC-OV-08 | 多轮检索迭代收敛 | Agent 复杂查询 | 1. 发起需要多轮检索的查询<br>2. 观察迭代次数 | 迭代收敛在 <= 5 轮内，每次有新结果 | P2 |
| TC-OV-09 | 时间感知检索 | 新旧混合文档 | 1. 查询"最新 X"<br>2. 检查结果排序 | 新文档排名高于旧文档 | P2 |

### 3.3 API 契约类（P1）

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-OV-10 | 参数名白名单校验 | RPC 调用使用 `query` 而非 `filter` | 1. 发送 parameters 含 `query` 的请求<br>2. 检查日志 | WARNING 日志记录未知参数 `query`，正常处理 `filter` | P1 |
| TC-OV-11 | RPC 信封路由正确性 | 有效的 module_name + method_name | 1. POST / 发送标准 RPC 信封<br>2. 检查响应 | code=0，data 非空，message=ok | P1 |
| TC-OV-12 | 跨项目参数契约一致性 | YiVad 调用 YiAi | 1. 前端使用 `target_file`（非 `path`）<br>2. 调用 `/read-file` | 正常返回文件内容，200 OK | P1 |

### 3.4 基础设施类（P1-P2）

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-OV-13 | 审计日志写入不阻塞业务 | 调用标记了 `@audit_log` 的方法 | 1. 执行数据写入操作<br>2. 检查响应延迟和日志 | 业务响应延迟增加 < 5ms，audit_logs 中有记录 | P1 |
| TC-OV-14 | 服务健康检查端点 | 服务正常运行 | 1. GET `/health`<br>2. GET `/health/ready` | /health 返回 200，/health/ready 返回依赖状态 | P2 |
| TC-OV-15 | SSE 流式响应完整性 | Agent 正常对话 | 1. 发起 SSE 聊天请求<br>2. 收集所有 SSE 事件 | 所有帧正确接收，包含 done 事件，无遗漏 | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-OV-01 | 空 RPC 信封 | `{module_name: "", method_name: "", parameters: {}}` | 返回 code=1001 参数验证失败 | P1 |
| EG-OV-02 | 超大分页请求 | `pageSize=100000` | 限制为最大 1000，返回部分结果 + WARNING | P2 |
| EG-OV-03 | MongoDB 连接中断恢复 | 模拟 MongoDB 短暂不可用（kill mongod 10s） | 连接恢复后自动重连，请求正常返回 | P1 |
| EG-OV-04 | 并发 50 请求同一端点 | 50 个并发 `query_documents` | 全部返回 code=0，无 5xx 错误 | P1 |
| EG-OV-05 | Ollama 冷启动 | 模型未加载时发起 chat 请求 | 返回 code=2001 AI 服务不可用，含等待建议 | P1 |
| EG-OV-06 | 非法 Unicode 输入 | 查询参数含 `\x00` 空字节 | 参数校验拒绝，返回 code=1001 | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-OV-01 | 八月迭代功能不受影响 | 执行全部 76 个已有测试用例 | 零回归失败，核心 API 行为不变 | P0 |
| RG-OV-02 | YiVad 列表页关键路径 | YiVad 访问 Issues/Bugs/知识库列表 | 数据正常加载，分页正确，过滤生效 | P0 |
| RG-OV-03 | YiPet 跨项目聊天 | YiPet 发起 AI 聊天 | SSE 流正常，Agent 工具调用不挂起 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 需求 | 对应测试用例 | 覆盖率 |
|----------|------------|--------|
| YA-09-01 RAG 引擎稳定性 | TC-OV-01, TC-OV-02 | 增量索引 + 维度校验 |
| YA-09-02 数据层稳定性 | TC-OV-03, TC-OV-04, EG-OV-03 | 连接池 + Cursor + 恢复 |
| YA-09-03 Agent 可靠性 | TC-OV-05 | 工具超时保护 |
| YA-09-04 API 契约校验 | TC-OV-10, TC-OV-12 | 参数白名单 + 跨项目契约 |
| YA-09-05 审计日志 | TC-OV-13 | 审计写入不阻塞业务 |
| YA-09-06 全局搜索 | TC-OV-01（关联索引）| 跨集合检索 |
| 八月回归 | RG-OV-01, RG-OV-02, RG-OV-03 | 已有功能不受影响 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| 端到端测试缺失（YiVad 全路径） | 前端集成问题可能漏检 | 添加 Playwright/Cypress E2E 测试覆盖关键用户路径 |
| 生产环境负载测试 | 无法验证真实流量下的稳定性 | 使用 locust 或 k6 进行生产级压测 |
| 多语言跨项目契约测试 | YiPet 参数名可能漂移 | 在 YiPet CI 中添加 RPC 契约校验 |
| Ollama 多模型切换测试 | 不同模型的 embedding 维度差异 | 添加多模型维度兼容性测试套件 |
| MongoDB Atlas 环境测试 | 本地 Mongo 与 Atlas 行为差异 | 添加 Atlas 环境 CI 工作流 |
| 知识库文件监视器跨平台测试 | macOS/Linux 文件系统差异 | 在 CI 中添加 Linux 环境测试 |