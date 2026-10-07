---

doc_type: test
title: "YA-09-28: 服务集成测试框架增强 — 契约测试与端到端测试基座 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-28"
source_prds: ["32-需求-集成测试框架增强"]
source_modules: []
source_okr: [yiai-001]

type: test
---

# YA-09-28: 服务集成测试框架增强 — 契约测试与端到端测试基座 — 测试规格

> **文档职责**：本文档定义测试框架增强的**怎么验证**（VERIFY），覆盖测试分层、标准化 fixture、契约测试、E2E 基座和 Mock 验证。

> 来源 PRD：[32-需求-集成测试框架增强.md](../../prds/2026-09/32-需求-集成测试框架增强.md)

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元 | 纯函数，无外部依赖，< 10s | pytest | 响应格式、错误码、工具函数 |
| L2 契约 | JSON Schema 验证 RPC 参数名一致性，< 15s | pytest + jsonschema | 所有 RPC 端点的请求/响应 Schema |
| L3 集成 | 真实 MongoDB + httpx ASGITransport，< 30s | pytest-asyncio + motor | API 端点 ≥ 80% |
| L4 E2E | 真实 MongoDB + 可选真实 Ollama，< 5min | pytest + docker | 核心流程 ≥ 60% |

### 1.2 测试数据

```python
# tests/conftest.py 增强

@pytest_asyncio.fixture
async def client():
    """FastAPI 测试客户端——每次测试独立。"""
    from server.main import app
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as ac:
        yield ac

@pytest_asyncio.fixture
async def mongo_test_db():
    """MongoDB 测试数据库——每次测试独立数据库。"""
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["yiai_test_db"]
    yield db
    # 清理: 删除测试数据库
    await client.drop_database("yiai_test_db")

@pytest.fixture
def mock_ollama(monkeypatch):
    """Mock Ollama——返回确定性响应。"""
    async def mock_chat(*args, **kwargs):
        return {"message": {"content": "Mock response"}}
    monkeypatch.setattr(
        "domain.ai.ollama_client.chat", mock_chat
    )

@pytest.fixture
def rpc_contract_spec():
    """加载所有 RPC 契约 Schema 定义。"""
    return load_all_rpc_schemas("contracts/rpc/")

@pytest.fixture
def layered_test_dir(tmp_path):
    """创建分层测试目录结构。"""
    tests_dir = tmp_path / "tests"
    (tests_dir / "unit").mkdir(parents=True)
    (tests_dir / "contract").mkdir(parents=True)
    (tests_dir / "integration").mkdir(parents=True)
    (tests_dir / "e2e").mkdir(parents=True)
    return tests_dir
```

---

<a id="sec-test-cases"></a>
## 二、测试用例

### 2.1 测试分层执行

---

#### TC-FWK-001: 单元测试套件独立运行且 < 10s

| 字段 | 内容 |
|------|------|
| **ID** | TC-FWK-001 |
| **层级** | L1 单元 |
| **优先级** | P0 |
| **前提** | 所有单元测试标记 `@pytest.mark.unit` |
| **步骤** | 1. 执行 `pytest -m unit --durations=5`<br/>2. 检查总耗时<br/>3. 检查测试数量 |
| **预期结果** | - 仅运行标记 `unit` 的测试<br/>- 总耗时 < 10s<br/>- 无 MongoDB/Ollama 连接尝试 |

---

#### TC-FWK-002: 契约测试套件独立运行且 < 15s

| 字段 | 内容 |
|------|------|
| **ID** | TC-FWK-002 |
| **层级** | L2 契约 |
| **优先级** | P0 |
| **前提** | 所有契约测试标记 `@pytest.mark.contract` |
| **步骤** | 1. 执行 `pytest -m contract --durations=5`<br/>2. 验证运行时无真实服务依赖 |
| **预期结果** | - 仅运行标记 `contract` 的测试<br/>- 总耗时 < 15s<br/>- 覆盖所有已注册 RPC 端点 |

---

#### TC-FWK-003: 集成测试套件使用真实 MongoDB

| 字段 | 内容 |
|------|------|
| **ID** | TC-FWK-003 |
| **层级** | L3 集成 |
| **优先级** | P0 |
| **前提** | MongoDB 测试数据库可用 |
| **步骤** | 1. 执行 `pytest -m integration`<br/>2. 验证 `mongo_test_db` fixture 创建了独立测试库<br/>3. 测试结束后检查是否清理 |
| **预期结果** | - 测试数据库 `yiai_test_db` 被创建<br/>- 测试数据写入测试库<br/>- 测试结束后 `yiai_test_db` 被删除<br/>- 生产数据库不受影响 |

---

#### TC-FWK-004: E2E 测试通过 --real-ollama 标记控制

| 字段 | 内容 |
|------|------|
| **ID** | TC-FWK-004 |
| **层级** | L4 E2E |
| **优先级** | P1 |
| **前提** | Ollama 服务运行（可选） |
| **步骤** | 1. 不带 `--real-ollama` 运行 E2E 测试→使用 Mock<br/>2. 带 `--real-ollama` 运行 E2E 测试→使用真实 Ollama |
| **预期结果** | - 默认使用 Mock Ollama<br/>- `--real-ollama` 切换到真实服务<br/>- 无标记时 E2E 测试被跳过 |

---

### 2.2 契约测试

---

#### TC-CTR-001: 所有 RPC 请求参数包含必需字段

| 字段 | 内容 |
|------|------|
| **ID** | TC-CTR-001 |
| **层级** | L2 契约 |
| **优先级** | P0 |
| **前提** | 存在所有 RPC 端点的 JSON Schema 定义 |
| **步骤** | 1. 遍历 `contracts/rpc/` 下所有 Schema<br/>2. 对每个端点构造最小有效请求<br/>3. `jsonschema.validate(request, schema)` |
| **预期结果** | - 所有端点 Schema 通过验证<br/>- `module_name`、`method_name`、`parameters` 为必需字段<br/>- `version` 字段为可选，默认 `"v1"` |

---

#### TC-CTR-002: 参数名契约检测——filter vs query 不一致时失败

| 字段 | 内容 |
|------|------|
| **ID** | TC-CTR-002 |
| **层级** | L2 契约 |
| **优先级** | P0 |
| **前提** | `data_service.query_documents` 的契约定义 `filter` 为正确参数名 |
| **步骤** | 1. 构造使用 `query` 参数的请求<br/>2. 运行契约验证 |
| **预期结果** | - 契约测试失败<br/>- 错误提示: "Invalid parameter 'query', expected 'filter'"<br/>- 列出所有无效参数 |

---

#### TC-CTR-003: 响应 Schema 验证——成功响应格式

| 字段 | 内容 |
|------|------|
| **ID** | TC-CTR-003 |
| **层级** | L2 契约 |
| **优先级** | P0 |
| **前提** | 所有 RPC 响应的 JSON Schema 定义 |
| **步骤** | 1. 对每个端点构造 mock 成功响应<br/>2. 验证 `{code: 0, message: "ok", data: <expected_type>}` |
| **预期结果** | - `code` 始终为 number<br/>- `message` 始终为 string<br/>- `data` 类型与 Schema 定义一致 |

---

#### TC-CTR-004: 前端参数名自动扫描——检测已知不一致

| 字段 | 内容 |
|------|------|
| **ID** | TC-CTR-004 |
| **层级** | L2 契约 |
| **优先级** | P0 |
| **前提** | 已知不一致列表: `{query→filter, path→target_file, collection_name→cname}` |
| **步骤** | 1. 扫描前端源码（YiVad + YiPet）<br/>2. 在 API 调用中搜索错误的参数名<br/>3. 与契约 Schema 对比 |
| **预期结果** | - 检测到任何 `query`/`path`/`collection_name` 使用时失败<br/>- CI 中契约测试失败阻止合并 |

---

### 2.3 E2E 测试基座

---

#### TC-E2E-001: 标准 E2E fixture 启动 MongoDB + FastAPI

| 字段 | 内容 |
|------|------|
| **ID** | TC-E2E-001 |
| **层级** | L4 E2E |
| **优先级** | P0 |
| **前提** | Docker MongoDB 或本地 MongoDB 运行 |
| **步骤** | 1. 使用 `client` + `mongo_test_db` fixture<br/>2. 发送 RPC 请求查询数据<br/>3. 验证请求遍历完整链路 |
| **预期结果** | - MongoDB 连接成功<br/>- RPC 请求正常路由<br/>- 响应包含真实的数据库查询结果 |

---

#### TC-E2E-002: Mock Ollama 在 E2E 中返回确定性数据

| 字段 | 内容 |
|------|------|
| **ID** | TC-E2E-002 |
| **层级** | L4 E2E |
| **优先级** | P0 |
| **前提** | `mock_ollama` fixture |
| **步骤** | 1. 发送 RAG 查询请求<br/>2. 检查 LLM 响应内容 |
| **预期结果** | - 响应为 `"Mock response"`<br/>- 不连接真实 Ollama 服务<br/>- 同一请求多次运行返回相同结果 |

---

#### TC-E2E-003: E2E 测试后数据清理验证

| 字段 | 内容 |
|------|------|
| **ID** | TC-E2E-003 |
| **层级** | L4 E2E |
| **优先级** | P1 |
| **步骤** | 1. 运行 E2E 测试<br/>2. 测试结束后查询 `yiai_test_db` |
| **预期结果** | - `yiai_test_db` 已被删除<br/>- 生产数据库无测试残留数据<br/>- 测试间数据完全隔离 |

---

### 2.4 Mock 验证

---

#### TC-MOCK-001: Mock 行为与真实实现一致性检测

| 字段 | 内容 |
|------|------|
| **ID** | TC-MOCK-001 |
| **层级** | L4 E2E |
| **优先级** | P1 |
| **前提** | 存在真实 Ollama 环境的 E2E 对比结果 |
| **步骤** | 1. 用 Mock Ollama 运行 RAG 测试<br/>2. 用真实 Ollama 运行相同测试（`--real-ollama`）<br/>3. 对比两套结果的结构差异 |
| **预期结果** | - 响应结构一致: `{code, message, data}`<br/>- Mock 响应字段不缺失<br/>- 对比报告列出字段差异 |

---

#### TC-MOCK-002: 无 Mock 泄漏——单元测试不调用外部服务

| 字段 | 内容 |
|------|------|
| **ID** | TC-MOCK-002 |
| **层级** | L1 单元 |
| **优先级** | P1 |
| **步骤** | 1. 停止 MongoDB 和 Ollama<br/>2. 运行 `pytest -m unit` |
| **预期结果** | - 所有单元测试通过<br/>- 无 `ConnectionRefusedError` 或 `ServerSelectionTimeoutError` |

---

<a id="sec-edge-cases"></a>
## 三、边界与异常测试

### TC-EDGE-001: MongoDB 不可用时集成测试优雅跳过

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-001 |
| **层级** | L3 集成 |
| **优先级** | P1 |
| **步骤** | 1. 停止 MongoDB<br/>2. 运行 `pytest -m integration` |
| **预期结果** | - 所有集成测试 SKIP（非 FAIL）<br/>- 日志: "MongoDB not available, skipping integration tests"<br/>- 单元测试不受影响 |

### TC-EDGE-002: 契约 Schema 文件缺失时的降级行为

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-002 |
| **层级** | L2 契约 |
| **优先级** | P1 |
| **步骤** | 1. 删除某个端点的 Schema 文件<br/>2. 运行契约测试 |
| **预期结果** | - 缺失 Schema 的端点标记为 WARNING<br/>- 不中断其他端点的契约验证<br/>- 覆盖率报告中标注"Schema 缺失" |

### TC-EDGE-003: 并发 E2E 测试数据隔离

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-003 |
| **层级** | L4 E2E |
| **优先级** | P2 |
| **步骤** | 1. 使用 `pytest-xdist` 并行运行 E2E 测试<br/>2. 每个 worker 使用不同数据库名 |
| **预期结果** | - 并行测试不互相干扰<br/>- 数据库名格式: `yiai_test_db_{worker_id}` |

### TC-EDGE-004: 超大响应体 Schema 验证性能

| 字段 | 内容 |
|------|------|
| **ID** | TC-EDGE-004 |
| **层级** | L2 契约 |
| **优先级** | P2 |
| **步骤** | 1. 构造含 10,000 条记录的 `data` 数组<br/>2. 运行响应 Schema 验证 |
| **预期结果** | - Schema 验证 < 200ms<br/>- 不因数据量大而 OOM |

---

<a id="sec-regression"></a>
## 四、回归测试

### TC-REG-001: 现有 76 个测试在新框架下全部通过

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-001 |
| **层级** | L1+L3 |
| **优先级** | P0 |
| **步骤** | 1. 运行 `pytest tests/ -v`<br/>2. 检查测试总数和通过率 |
| **预期结果** | - 76 个测试全部通过<br/>- 无 fixture 冲突<br/>- conftest.py 增强不破坏现有测试 |

### TC-REG-002: CI 流水线分阶段执行时间控制

| 字段 | 内容 |
|------|------|
| **ID** | TC-REG-002 |
| **层级** | CI |
| **优先级** | P1 |
| **步骤** | 1. CI Stage 1: `pytest -m unit`<br/>2. CI Stage 2: `pytest -m contract`<br/>3. CI Stage 3: `pytest -m integration`<br/>4. CI Stage 4: `pytest -m e2e` |
| **预期结果** | - Stage 1 < 10s, Stage 2 < 15s<br/>- Stage 3 < 30s, Stage 4 < 5min<br/>- 早期失败快速反馈 |

---

<a id="sec-traceability"></a>
## 五、需求-测试追溯矩阵

| PRD FR | 模块 | 测试用例 | 覆盖层级 |
|--------|------|---------|---------|
| FR-测试分层 | pytest mark | TC-FWK-001~004 | L1+L4 |
| FR-契约测试 | JSON Schema 验证 | TC-CTR-001~004 | L2 |
| FR-E2E 基座 | 标准化 fixture | TC-E2E-001~003 | L4 |
| FR-Mock 质量 | 行为对比 | TC-MOCK-001~002 | L1+L4 |
| FR-数据隔离 | mongo_test_db | TC-EDGE-003, TC-E2E-003 | L4 |
| FR-CI 集成 | pytest 标记 | TC-REG-001~002 | CI |

---

<a id="sec-coverage"></a>
## 六、覆盖缺口

| 缺口 | 原因 | 补救计划 |
|------|------|---------|
| 真实 Ollama E2E 稳定性 | CI 环境无 GPU/模型 | 使用 `--real-ollama` 标记在开发环境手动运行 |
| Testcontainers 集成 | 未引入 Docker SDK 依赖 | 评估 `testcontainers-python` 后补充 |
| 前端 TS 端契约扫描 | 需跨仓库访问 YiVad/YiPet 源码 | 在跨项目契约测试中补充 |
| 代码覆盖率报告 | 需 `pytest-cov` 集成 | CI 流水线中增加 `--cov` 参数 |

---

<a id="sec-references"></a>
## 七、参考文档

| 资源 | 路径 |
|------|------|
| 源 PRD | [32-需求-集成测试框架增强.md](../../prds/2026-09/32-需求-集成测试框架增强.md) |
| RPC 契约测试 | [../2026-09/14-prd-test-RPC契约测试与类型同步.md](../2026-09/14-prd-test-RPC契约测试与类型同步.md) |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/32-需求-集成测试框架增强.md`*