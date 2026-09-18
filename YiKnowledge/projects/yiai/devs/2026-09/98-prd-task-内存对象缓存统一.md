---
doc_type: module
prd_task_id: "YA-09-32"
title: "YA-09-32: 统一内存对象缓存 — LRU/LFU + TTL 过期 — 开发方案"
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
source_prd: "98-需求-内存对象缓存统一.md"
source_okr: [yiai-003]
---

# YA-09-32: 统一内存对象缓存 — LRU/LFU + TTL 过期 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[98-需求-内存对象缓存统一.md](../../prds/2026-09/98-需求-内存对象缓存统一.md)
> 需求编号：YA-09-32 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

替代散落在各模块的 `dict` 缓存（`_cached_token`、`_recorder`、`_guard` 等），统一为 `cachetools` 库的标准缓存。

```python
from cachetools import TTLCache, LRUCache

# 短期 TTL 缓存：Token、配置、健康状态
token_cache = TTLCache(maxsize=100, ttl=300)

# 长期 LRU 缓存：知识库元数据、Dashboard 聚合
metadata_cache = LRUCache(maxsize=1000)

# 函数缓存装饰器
@cached(cache=token_cache)
async def get_access_token() -> str: ...
```

### 缓存策略选择

| 场景 | 策略 | maxsize | TTL |
|------|------|---------|-----|
| 企微 Access Token | TTL | 10 | 7200s |
| 知识库文件列表 | LRU | 500 | 60s |
| Dashboard 聚合结果 | TTL | 100 | 30s |
| 配置项 | TTL | 50 | 300s |
| RAG 检索结果 | LRU | 200 | 120s |
| 用户信息 | LRU | 500 | 600s |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `cachetools` 集成 + 替换散落缓存 | 所有手动 dict 缓存改为统一 API | 0.5 |
| 2 | 缓存命中率监控 + 测试 | Dashboard 可见各缓存命中率 | 0.5 |

**合计：1.0d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 集成：[YA-09-14 查询缓存层](./29-prd-task-数据查询缓存层.md)