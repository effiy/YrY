---
doc_type: module
prd_task_id: "YA-09-116"
title: "YA-09-116: 数据库分片策略 — 按时间/集合水平扩展 — 开发方案"
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
source_prd: "100-需求-数据库分片策略.md"
source_okr: [yiai-001]
---

# YA-09-116: 数据库分片策略 — 按时间/集合水平扩展 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[100-需求-数据库分片策略.md](../../prds/2026-09/100-需求-数据库分片策略.md)
> 需求编号：YA-09-116 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

单集合数据量增长到千万级时需分片。MongoDB 原生 sharding + 应用层按时间分集合（`sessions_2026_09`）双策略。

```python
class ShardRouter:
    def get_collection(self, base_name: str, key: str | datetime) -> str:
        if base_name == "chat_records":
            month = key.strftime("%Y_%m") if isinstance(key, datetime) else datetime.now().strftime("%Y_%m")
            return f"{base_name}_{month}"
        return base_name
```

### 分片策略

| 集合 | 策略 | 分片键 |
|------|------|--------|
| `sessions` | MongoDB Hash Sharding | `key` |
| `chat_records` | 按月分集合 | `created_at` → `chat_records_2026_09` |
| `audit_logs` | 按季度分集合 | `created_at` |
| `knowledge_files` | 不分区 | 数据量小 (< 1000) |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ShardRouter + 按月分集合 | 历史数据查询自动路由 | 0.5 |
| 2 | MongoDB sharding 配置 + 测试 | Hash sharding 负载均衡 | 0.5 |

**合计：1.0d**。