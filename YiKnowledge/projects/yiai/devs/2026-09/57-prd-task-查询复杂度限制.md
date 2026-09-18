---
doc_type: module
prd_task_id: "YA-09-107"
title: "YA-09-107: RPC 查询复杂度限制 — 深度/广度 + 成本分析 — 开发方案"
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
source_prd: "57-需求-查询复杂度限制.md"
source_okr: [yiai-001]
---

# YA-09-107: RPC 查询复杂度限制 — 深度/广度 + 成本分析 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[57-需求-查询复杂度限制.md](../../prds/2026-09/57-需求-查询复杂度限制.md)
> 需求编号：YA-09-107 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

RPC `query_documents` 的 `filter` 参数无深度/复杂度限制，恶意或错误查询可能导致全表扫描。分析 filter 结构复杂度，超限拒绝。

```python
def estimate_query_cost(filter: dict) -> int:
    """递归计算 filter 复杂度分数"""
    cost = 0
    for key, value in filter.items():
        if key.startswith("$"):  # 操作符
            if key in ("$or", "$and", "$nor"): cost += sum(estimate_query_cost(v) for v in value) * 2
            elif key == "$regex": cost += 10
            elif key == "$text":  cost += 5
        else:
            cost += 1
            if isinstance(value, dict): cost += estimate_query_cost(value)
    return cost

# 限制: max_cost=20, max_depth=5
if estimate_query_cost(filter) > 20 or filter_depth(filter) > 5:
    raise BusinessException(INVALID_PARAMS, "Query too complex")
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | cost 计算 + 深度限制 | $regex 无索引查询被限制 | 0.25 |
| 2 | 集成到 data_service + 测试 | 复杂查询返回友好提示 | 0.25 |

**合计：0.5d**。