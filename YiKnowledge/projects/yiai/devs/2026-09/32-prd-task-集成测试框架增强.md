---
doc_type: module
prd_task_id: "YA-09-36"
title: "YA-09-36: 集成测试框架增强 — pytest fixtures + MongoDB mock + 契约测试基座 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "32-需求-集成测试框架增强.md"
source_okr: [yiai-001]
---

# YA-09-36: 集成测试框架增强 — pytest fixtures + MongoDB mock + 契约测试基座 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[32-需求-集成测试框架增强.md](../../prds/2026-09/32-需求-集成测试框架增强.md)
> 需求编号：YA-09-36 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 YA-08-03 的 76 个单元测试基础上，增加集成测试层——真实 FastAPI + httpx AsyncClient + MongoDB mock/真实实例可选。

```python
# conftest.py
@pytest.fixture
async def app():
    return create_app(init_db=False, init_rss=False, init_knowledge=False)

@pytest.fixture
async def client(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def mongodb():
    if os.getenv("CI"):
        yield db  # CI: 真实 MongoDB
    else:
        yield mongomock.MongoClient()  # 本地: mock
```

### 新增测试类型

| 标记 | 运行 | 用途 |
|------|------|------|
| `@pytest.mark.integration` | `pytest -m integration` | API 端点集成测试 |
| `@pytest.mark.contract` | `pytest -m contract` | RPC 参数契约测试 |
| `@pytest.mark.slow` | `pytest -m "not slow"` 排除 | 真实 Ollama 测试 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | httpx AsyncClient + ASGITransport fixtures | 不启动 uvicorn 即可测 API | 0.5 |
| 2 | mongomock + 契约测试基座 | CI 中 `-m integration` 通过 | 0.5 |
| 3 | 覆盖率合并 + 测试 | 单测+集成覆盖率 > 80% | 0.5 |

**合计：1.5d**。