---
doc_type: module
prd_task_id: "YA-09-34"
title: "YA-09-34: Agent 工具缓存 — 减少重复推理与执行开销 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "18-需求-Agent工具调用结果缓存.md"
source_okr: [yiai-001]
related_tests: ["18-prd-test-Agent工具调用结果缓存"]
---

# YA-09-34: Agent 工具缓存 — 减少重复推理与执行开销 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[18-需求-Agent工具调用结果缓存.md](../../prds/2026-09/18-需求-Agent工具调用结果缓存.md)
> 需求编号：YA-09-34 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Agent 对话循环中，同一工具+参数组合可能被多次调用（如反复读取同一文件）。基于 `(tool_name, hash(params))` 缓存结果。

```python
@cached(cache=TTLCache(maxsize=200, ttl=300))
async def execute_tool(name: str, params: dict) -> dict:
    tool = registry.get(name)
    return await tool.execute(**params)
```

### 缓存键粒度

| 工具 | TTL | 缓存键 |
|------|-----|--------|
| `read_file` | 60s | `(path, mtime)` |
| `web_search` | 300s | `(query, source)` |
| `knowledge_search` | 120s | `(query, scope)` |
| `code_execute` | 0s | 不缓存（副作用） |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | TTL 缓存 + 工具粒度 TTL 配置 | 重复调用命中缓存 | 0.5 |
| 2 | 副作用工具排除 + 测试 | `code_execute` 不被缓存 | 0.5 |

**合计：1.0d**。

---

## 三、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 缓存键仅基于参数哈希 | P3 | 相同语义不同表述未命中 | 待实施 |

**合计：1.0d**。