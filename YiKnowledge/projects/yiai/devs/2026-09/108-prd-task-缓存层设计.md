---

doc_type: module
prd_task_id: "YA-09-102"
title: "YA-09-102: 缓存层设计 — Redis 集成 + RAG 缓存 + 内存降级 + 命中率监控 — 开发任务"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 5.0
source_prd: "108-需求-缓存层设计.md"
source_okr: [yiai-001]
related_tests: ["108-prd-test-缓存层设计"]
acceptance_criteria:
  - 高频查询 (listKnowledgeFiles/getMenuTree/getUserPermissions) 缓存命中时延迟 < 1ms
  - MongoDB 查询量降低 ≥ 50%（对比缓存启用前后）
  - Redis 不可用时自动降级为 L1-only 或直连 MongoDB，业务不中断
  - L1 命中率 ≥ 60%，L2 命中率 ≥ 80%（稳态运行 1h 后）
  - Prometheus 指标 `yiai_cache_hit_total` / `yiai_cache_miss_total` 可正常采集

type: task
---

# YA-09-102: 缓存层设计 — Redis 集成 + RAG 缓存 + 内存降级 + 命中率监控 — 开发任务

| 属性 | 值 |
|------|-----|
| 文档编号 | YA-09-102 |
| 版本 | v1.0 |
| 密级 | 内部 |
| 作者 | 陈铭 |
| 审核人 | — |
| 状态 | 需求已编写 |
| 最后更新 | 2026-09-23 |

> 来源 PRD：[108-需求-缓存层设计.md](../../prds/2026-09/108-需求-缓存层设计.md)
> 需求编号：YA-09-102 · 优先级：P1 · 人天：5.0d
> 测试规格：[108-prd-test-缓存层设计.md](../../tests/2026-09/108-prd-test-缓存层设计.md)

---

## 目录

1. [问题分析](#一问题分析)
2. [设计约束](#二设计约束)
3. [架构设计](#三架构设计)
4. [实施步骤](#四实施步骤)
5. [非功能性设计](#五非功能性设计)
6. [测试策略](#六测试策略)
7. [关联与回滚](#七关联与回滚)
附录 A. [变更记录](#附录-a-变更记录)

---

<a id="sec-1"></a>
## 一、问题分析

### 1.1 当前瓶颈

YiAi 所有数据查询直连 MongoDB，无缓存层。高频查询重复访问数据库：

| 查询 | 调用频率 | 平均延迟 | 缓存收益 |
|------|---------|---------|---------|
| `listKnowledgeFiles` | 每次页面加载 + 30s 轮询 | 50-200ms | **高** |
| `getMenuTree` | 每次导航 | 20-50ms | **高** |
| `getUserPermissions` | 每次 API 调用 | 10-30ms | **高** |
| `query_documents(sessions)` | 对话列表加载 | 30-100ms | 中 |
| `query_documents(issues)` | Issue 列表 | 30-80ms | 中 |

**目标：高频查询延迟降 80%，MongoDB 查询量降 50%。**

---

<a id="sec-2"></a>
## 二、设计约束

| 约束项 | 说明 |
|--------|------|
| 缓存不可用时降级 | Redis 连接失败/超时时自动跳过 L2，直连 MongoDB，业务不中断 |
| 写穿透失效 | 数据变更时必须同步失效对应缓存 key，允许 ≤ 1s 的最终一致性窗口 |
| 缓存键命名空间隔离 | 所有 Redis key 使用 `yiai:cache:` 前缀，避免与其他服务 key 冲突 |
| L1 内存上限 | LRU 最大 1000 条，防止内存泄漏；单条 value ≤ 100KB |
| 不缓存大对象 | MongoDB 文档 > 100KB 不缓存，仅缓存元数据和聚合结果 |
| Redis 可选依赖 | 无 Redis 时 L1 内存缓存独立工作，功能降级但不报错 |

---

<a id="sec-3"></a>
## 三、架构设计

### 3.1 多级缓存

```
请求 → L1 内存 LRU (1min TTL, 1000 entries)
         ↓ miss
       L2 Redis (10min TTL)
         ↓ miss
       MongoDB
```

### 3.2 核心实现

```python
# server/cache.py
from functools import wraps
import asyncio, hashlib, json, time
from typing import Any, Optional
from collections import OrderedDict
import redis.asyncio as redis

class LRUCache:
    def __init__(self, maxsize=1000, ttl=60):
        self._store = OrderedDict()
        self._maxsize, self._ttl = maxsize, ttl

    def get(self, key: str) -> Optional[Any]:
        if key not in self._store: return None
        value, expiry = self._store[key]
        if time.monotonic() > expiry:
            del self._store[key]; return None
        self._store.move_to_end(key)
        return value

    def set(self, key: str, value: Any):
        self._store[key] = (value, time.monotonic() + self._ttl)
        self._store.move_to_end(key)
        while len(self._store) > self._maxsize:
            self._store.popitem(last=False)

    def clear(self): self._store.clear()

class RedisCache:
    def __init__(self, url: str, prefix="yiai:cache:"):
        self._redis = None
        self._url, self._prefix = url, prefix

    async def connect(self):
        self._redis = redis.from_url(self._url, decode_responses=True)
        await self._redis.ping()

    async def get(self, key: str) -> Optional[Any]:
        raw = await self._redis.get(f"{self._prefix}{key}")
        return json.loads(raw) if raw else None

    async def set(self, key: str, value: Any, ttl=600):
        await self._redis.setex(f"{self._prefix}{key}", ttl, json.dumps(value, default=str))

    async def delete(self, key: str):
        await self._redis.delete(f"{self._prefix}{key}")

    async def delete_pattern(self, pattern: str):
        keys = await self._redis.keys(f"{self._prefix}{pattern}")
        if keys: await self._redis.delete(*keys)

class MultiLevelCache:
    def __init__(self, l1: LRUCache, l2: RedisCache):
        self._l1, self._l2 = l1, l2

    def cached(self, ttl=600, key_prefix=""):
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                ck = self._build_key(key_prefix, func.__name__, args, kwargs)
                for val in [self._l1.get(ck), await self._l2.get(ck)]:
                    if val is not None:
                        self._l1.set(ck, val)
                        return val
                result = await func(*args, **kwargs)
                self._l1.set(ck, result)
                await self._l2.set(ck, result, ttl)
                return result
            return wrapper
        return decorator

    def _build_key(self, prefix, fname, args, kwargs):
        raw = f"{prefix}:{fname}:{args}:{sorted(kwargs.items())}"
        return hashlib.md5(raw.encode()).hexdigest()[:16]

    def invalidate(self, key: str):
        self._l1._store.pop(key, None)
        asyncio.create_task(self._l2.delete(key))

    async def invalidate_pattern(self, pattern: str):
        await self._l2.delete_pattern(pattern)
        self._l1.clear()
```

### 3.3 缓存策略

| 操作 | L1 | L2 | 说明 |
|------|----|----|------|
| 读 | 命中返回 / miss 查 L2 | 命中回填 L1 / miss 查 DB | Cache-Aside |
| 写 | 删除对应 key | 删除对应 key | 写穿透 |
| 批量写 | 全量清除 | delete_pattern | 避免逐 key 删除 |
| Redis 故障 | 跳过 L2，直连 MongoDB | - | 降级策略，不影响业务 |

### 3.4 配置

```yaml
# config.yaml
cache:
  enabled: true
  redis_url: "redis://localhost:6379/0"
  l1: { maxsize: 1000, ttl: 60 }
  l2: { default_ttl: 600, knowledge_ttl: 60, menu_ttl: 600 }
```

---

<a id="sec-4"></a>
## 四、实施步骤

| # | 步骤 | 验证 | 人天 |
|---|------|------|------|
| 1 | LRU + Redis 基础类 + 单元测试 | 读写/过期/驱逐 | 1.5 |
| 2 | `@cached` 装饰器 + `listKnowledgeFiles` | 第二次查询命中 L1 (<1ms) | 1.0 |
| 3 | `getMenuTree` + `getUserPermissions` | 菜单加载 50ms → <1ms | 0.5 |
| 4 | 写失效（知识库变更 → 缓存失效） | 文件变更后缓存立即失效 | 0.5 |
| 5 | `query_documents` 高频查询 | 缓存命中率 > 60% | 1.0 |
| 6 | Prometheus 指标 + docker-compose Redis | Grafana 显示命中率 | 0.5 |

**合计：5.0d**

---

<a id="sec-5"></a>
## 五、非功能性设计

### 5.1 性能指标

| 指标 | 目标值 | 测试条件 |
|------|--------|----------|
| L1 缓存命中延迟 | ≤ 0.5ms | OrderedDict 内存查找 |
| L2 缓存命中延迟 | ≤ 5ms | Redis 同机部署，GET 单 key |
| L1 命中率 (稳态) | ≥ 60% | 运行 1h 后统计 |
| L2 命中率 (稳态) | ≥ 80% | 运行 1h 后统计 |
| 写失效延迟 | ≤ 1s | 从数据变更到缓存 key 被删除 |

### 5.2 容量预估

| 指标 | 预估值 | 推算依据 |
|------|--------|----------|
| L1 最大内存占用 | ≈ 50MB | 1000 条 × 50KB avg value |
| L2 Redis 最大内存 | ≈ 200MB | 高频 key 5000 条 × 40KB avg |
| Redis 连接数 | ≤ 10 | 单实例连接池，max_connections=10 |
| 缓存键数量 | ≈ 5000 | 知识库分类 + 菜单 + 权限 + 查询结果 |

### 5.3 监控与告警

| 监控项 | 数据源 | 采集频率 | 告警规则 |
|--------|--------|----------|----------|
| L1/L2 命中率 | `yiai_cache_hit_total` / `_miss_total` | 实时 (Prometheus) | L2 命中率 < 50% 持续 10min → warning |
| Redis 连接状态 | `redis.ping()` 健康检查 | 30s | 连续 3 次失败 → critical |
| L1 条目数 | `len(LRU._store)` | 实时 | ≥ 1000 (满) 持续 5min → warning |
| 缓存写入失败率 | `yiai_cache_write_errors_total` | 实时 | > 0/min → warning |

### 5.4 安全

| 层面 | 措施 |
|------|------|
| Redis 认证 | 生产环境启用 Redis AUTH (requirepass) |
| 数据敏感性 | 不缓存用户凭证、Token、密码等敏感数据 |
| 序列化安全 | JSON 序列化，不使用 pickle (防反序列化攻击) |
| 网络隔离 | Redis 仅监听 localhost 或内网地址 |

### 5.5 降级路径

```
Redis 连接失败 → 跳过 L2，L1-only 模式
  ├── 命中 L1 → 返回缓存值
  └── miss L1 → 直连 MongoDB

Redis 恢复 → 自动重连，L1 回填 L2 (渐进恢复)
  ├── 新写入正常写 L2
  └── 已有 L1 条目在下次读取时回填 L2
```

---

<a id="sec-6"></a>
## 六、测试策略

### 6.1 测试分层

| 层级 | 覆盖范围 | 工具 |
|------|----------|------|
| 单元测试 | LRU 读写/过期/驱逐、RedisCache 序列化/key 构建 | pytest |
| 集成测试 | MultiLevelCache L1→L2→DB 级联、写失效、Redis 降级 | pytest + fakeredis |
| 接口测试 | `@cached` 装饰器行为正确性（不改变返回值、不吞异常） | pytest + httpx |
| 性能测试 | 缓存命中率统计、延迟对比 | pytest-benchmark |

### 6.2 关键测试用例

| 场景 | 验证点 |
|------|--------|
| L1 命中 | 首次查询 miss 查 DB，第二次查询命中 L1，延迟 < 1ms |
| L1 过期 | 超过 TTL 后查询 miss，重新查 DB |
| L1 驱逐 | 写入 > 1000 条，最早条目被驱逐 |
| L2 命中 | L1 miss → L2 命中 → 回填 L1 → 返回 |
| L2 miss 查 DB | L1 miss → L2 miss → 查 DB → 回填 L2 + L1 |
| Redis 不可用降级 | 关闭 Redis → 查询跳过 L2 → 直连 MongoDB → 返回正确结果 |
| Redis 恢复 | 重连 Redis → 后续查询正常使用 L2 |
| 写失效 | 数据变更 → invalidate → L1 + L2 key 被删除 → 下次查询 miss |
| 批量写失效 | `invalidate_pattern("knowledge:*")` → 匹配的 L2 keys 全删 + L1 全清 |
| 装饰器异常透传 | 被装饰函数抛异常 → 异常正确 re-raise，不受缓存影响 |

---

<a id="sec-7"></a>
## 七、关联与回滚

- 依赖：Redis（docker-compose 新增服务）
- 集成：RAG 引擎、监控告警、知识监视器
- 回滚：`cache.enabled = false` 全局禁用；Redis 故障自动降级直连 MongoDB

---

## 附录 A. 变更记录

| 日期 | 版本 | 变更内容 | 作者 |
|------|------|----------|------|
| 2026-09-11 | v1.0 | 初始版本：LRU + Redis 双级缓存架构、缓存策略、实施步骤 | 陈铭 |
| 2026-09-23 | v1.1 | 补充设计约束、非功能性设计（性能/容量/监控/安全/降级路径）、测试策略、变更记录 | 陈铭 |