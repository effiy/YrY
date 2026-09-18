---
doc_type: module
prd_task_id: "YA-09-38"
title: "YA-09-38: Redis 分布式缓存 — aioredis 集成 + 哨兵 + 优雅降级 — 开发方案"
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
source_prd: "63-需求-Redis分布式缓存.md"
source_okr: [yiai-003]
---

# YA-09-38: Redis 分布式缓存 — aioredis 集成 + 哨兵 + 优雅降级 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[63-需求-Redis分布式缓存.md](../../prds/2026-09/63-需求-Redis分布式缓存.md)
> 需求编号：YA-09-38 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-14 查询缓存层](./29-prd-task-数据查询缓存层.md) 的 L2 Redis 层基础上，增加哨兵模式高可用和优雅降级。Redis 不可用时自动回退内存缓存。

```python
import redis.asyncio as aioredis

class RedisCache:
    def __init__(self, url: str, sentinel: bool = False):
        if sentinel:
            self.client = aioredis.Sentinel([(host, port)]).master_for(service_name)
        else:
            self.client = aioredis.from_url(url, decode_responses=True)

    async def get(self, key: str) -> str | None:
        try: return await self.client.get(key)
        except aioredis.RedisError:
            return None  # 降级：返回 None 触发 L1 回退

    async def set(self, key: str, value: str, ttl: int = 300):
        try: await self.client.setex(key, ttl, value)
        except aioredis.RedisError:
            pass  # 降级：静默失败
```

### 缓存分层

| 层 | 后端 | 容量 | 延迟 |
|----|------|------|------|
| L1 | 内存 (cachetools) | 1000 | < 0.1ms |
| L2 | Redis | 无限制 | < 5ms |
| L3 | MongoDB (无缓存) | — | < 50ms |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | aioredis + 哨兵模式 | Redis 故障自动切换 | 0.5 |
| 2 | L1/L2 降级链 + 测试 | Redis 不可用 > 回退 L1 > 回退 MongoDB | 1.0 |

**合计：1.5d**。