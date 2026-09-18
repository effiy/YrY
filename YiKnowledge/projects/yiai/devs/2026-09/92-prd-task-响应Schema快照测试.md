---
doc_type: module
prd_task_id: "YA-09-83"
title: "YA-09-83: Schema 快照测试 — JSON Schema 回归对比 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "92-需求-响应Schema快照测试.md"
source_okr: [yiai-001]
---

# YA-09-83: Schema 快照测试 — JSON Schema 回归对比 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[92-需求-响应Schema快照测试.md](../../prds/2026-09/92-需求-响应Schema快照测试.md)
> 需求编号：YA-09-83 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Pydantic model 变更时，API 响应结构可能被意外修改。在测试中录制响应 JSON Schema 快照，CI 中对比检测回归。

```python
from genson import SchemaBuilder
import json, pytest

@pytest.mark.contract
async def test_api_response_schema(client):
    resp = await client.post("/", json={"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {"cname": "projects"}})
    assert resp.status_code == 200

    # 生成 JSON Schema
    builder = SchemaBuilder()
    builder.add_object(resp.json())
    schema = builder.to_schema()

    # 对比快照
    snapshot_path = "tests/snapshots/query_documents_schema.json"
    if not os.path.exists(snapshot_path):
        with open(snapshot_path, "w") as f: json.dump(schema, f, indent=2)
    else:
        with open(snapshot_path) as f:
            expected = json.load(f)
        from jsonschema import validate
        validate(resp.json(), expected)  # 当前响应是否符合预期 Schema
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | genson + pytest 快照 | 响应结构变更被检测 | 0.25 |
| 2 | CI 集成 + 测试 | PR 中 Schema 破坏被捕获 | 0.25 |

**合计：0.5d**。