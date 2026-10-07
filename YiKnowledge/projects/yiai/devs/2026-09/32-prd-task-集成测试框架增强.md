---

doc_type: module
prd_task_id: "YA-09-20"
title: "YA-09-20: 集成测试框架增强 — 76→150+ 测试覆盖 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 6.0
source_prd: "32-需求-集成测试框架增强.md"
source_okr: [yiai-001]
related_tests: ["32-prd-test-集成测试框架增强"]

type: task
---

# YA-09-20: 集成测试框架增强 — 76→150+ 测试覆盖 — 开发方案

> 来源 PRD：[32-需求-集成测试框架增强.md](../../prds/2026-09/32-需求-集成测试框架增强.md)
> 需求编号：YA-09-20 · 优先级：P1 · 人天：6.0d

---

<a id="sec-1"></a>
## 一、现状

当前 76 个 pytest 测试，shared/ 模块 92% 覆盖但 domain 模块 <30%。无契约测试验证前后端 RPC 格式一致性。

**目标**: 整体覆盖率 60%+，关键路径 80%+，契约测试覆盖所有 RPC 端点。

### 1.1 覆盖率分布

| 模块 | 当前覆盖率 | 目标 | 现有测试 |
|------|----------|------|---------|
| shared/ | 92% | 95% | 41 |
| domain/ai/ | 45% | 70% | 12 |
| domain/rag/ | 38% | 70% | 8 |
| domain/knowledge/ | 25% | 60% | 6 |
| domain/agent/ | 15% | 60% | 3 |
| services/ | 20% | 50% | 6 |

---

<a id="sec-2"></a>
## 二、实施计划

### 2.1 测试策略

| 层级 | 框架 | 目标数量 | 覆盖内容 |
|------|------|---------|---------|
| 单元测试 | pytest + pytest-asyncio | 80+ | 每个 domain 模块 ≥5 测试 |
| 集成测试 | httpx AsyncClient | 40+ | 所有 RPC 端点 |
| 契约测试 | 自定义 schema diff | 15+ | RPC 响应格式 vs 前端期望 |

### 2.2 契约测试框架

```python
# tests/contract/test_rpc_contract.py
import json
from pathlib import Path

RPC_CONTRACTS = {
    "chat_service.chat": {
        "request": ["model", "messages"],
        "response": {"code": 0, "message": "ok", "data": {"message": str}}
    },
    "rag_service.rag_chat_stream": {
        "request": ["query"],
        "response_stream": {"data": {"message": str}, "done": bool}
    },
    "data_service.query_documents": {
        "request": ["cname", "filter"],
        "response": {"code": 0, "data": {"list": list, "total": int}}
    },
}

@pytest.mark.parametrize("endpoint,contract", RPC_CONTRACTS.items())
async def test_rpc_contract(endpoint, contract, client):
    module_name, method_name = endpoint.split(".")
    payload = generate_request(contract["request"])
    resp = await client.post("/", json={
        "module_name": f"services.{module_name}",
        "method_name": method_name,
        "parameters": payload
    })
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 0
    validate_response_shape(body.get("data"), contract["response"])
```

### 2.3 测试 Fixture 增强

```python
# tests/conftest.py 新增
@pytest.fixture
async def seeded_db(db):
    """预填充测试数据."""
    await db.issues.insert_many([...])
    await db.sessions.insert_many([...])
    yield db
    await db.issues.delete_many({})
    await db.sessions.delete_many({})

@pytest.fixture
def mock_ollama(mocker):
    """Mock Ollama API 响应，避免测试依赖外部服务."""
    return mocker.patch("httpx.AsyncClient.post", return_value=MockResponse(...))
```

---

<a id="sec-3"></a>
## 三、测试清单

### Domain 模块 (40 新增)

| 模块 | 关键测试场景 | 数量 |
|------|------------|------|
| ai/ | chat_stream 正常流、超时、空输入、多轮对话 | 8 |
| rag/ | 检索结果、空结果、混合检索权重、增量索引 | 8 |
| knowledge/ | 文件扫描、frontmatter 解析、增量更新 | 6 |
| agent/ | 工具调用、循环终止、超时、SSE 错误传播 | 8 |
| data/ | CRUD、分页、排序、filter 参数 | 5 |
| auth/ | JWT 签发/验证、权限检查、Token 过期 | 5 |

### 集成测试 (40 新增)

| 端点 | 测试场景 |
|------|---------|
| POST / (RPC 信封) | 有效请求、无效 module_name、无效 method_name、缺少参数 |
| POST /read-file | 存在文件、不存在文件、路径穿越 |
| POST /write-file | 新建、覆盖、无效路径 |
| /health/* | liveness、readiness、startup |

---

## 四、实施步骤

| # | 步骤 | 验证 | 人天 |
|---|------|------|------|
| 1 | contract test 框架 + 所有 RPC 端点契约 | 15 个契约测试通过 | 1.5 |
| 2 | domain/ai/ + domain/rag/ 单元测试 | 覆盖率 45%→70% | 1.5 |
| 3 | domain/knowledge/ + domain/agent/ 单元测试 | 覆盖率 25%→60% | 1.5 |
| 4 | 集成测试（RPC 端点 + 文件读写） | 40 个集成测试通过 | 1.0 |
| 5 | CI 集成：pytest-cov 报告 + 覆盖率门槛 | PR 低于 60% 阻断合并 | 0.5 |

**合计：6.0d**

---

## 五、验收

- [ ] 总测试数 76 → 150+
- [ ] 整体覆盖率 60%+, 关键路径 80%+
- [ ] 契约测试覆盖所有 RPC 端点
- [ ] CI pipeline 包含 pytest-cov 报告
- [ ] 覆盖率低于 60% 的 PR 被阻断