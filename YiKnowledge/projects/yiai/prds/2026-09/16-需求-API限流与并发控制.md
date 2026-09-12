---
title: "YA-09-12: API 限流与并发控制 — 令牌桶算法与分级配额策略"
tags: [需求文档, API, 限流, 并发控制, 令牌桶, 配额, 后端]
category: 项目/管理后台/需求
created: 2026-09-09
updated: 2026-09-10
source: 内部
type: 需求
status: 需求已编写
priority: P1
project: YiAi
project_id: yiai
owner: 陈铭
prd_month: "202609"
prd_task_id: YA-09-12
estimate_backend: 1.5
review_status: 待评审
issue_type: 架构
roles: [engineer, srer]
---

# YA-09-12: API 限流与并发控制 — 令牌桶算法与分级配额策略

> 需求编号：YA-09-12 · 优先级：P1 · 人天：1.5d · 状态：需求已编写
> 依赖：YA-09-02（数据层稳定性）、YA-09-03（Agent 可靠性）

## 背景

YiAi 作为 YrY 唯一后端，面临三类资源竞争：Agent（LLM 推理，最耗资源）、RAG（向量检索+Embedding）、CRUD（MongoDB 查询）。当前无系统级限流保护：

| 风险 | 场景 | 影响 |
|------|------|------|
| **Agent 洪泛** | 用户快速连续发送 10 条消息 | Ollama GPU 过载 → 所有请求超时 |
| **RAG 并发风暴** | 5 个用户同时 RAG 检索 | Embedding API 排队 → P95 延迟飙升 |
| **单用户资源独占** | 1 个用户持续的 Agent 循环 | 其他用户排队 → 不公平 |
| **前端 Bug 导致请求风暴** | YiVad 组件无限重试 | MongoDB 连接池耗尽 (YA-09-02 仅部分缓解) |

当前仅有 Agent Semaphore(3) 隔舱保护（§0.6），缺少全局限流和分级配额。

---

## 一、现状分析

### 1.1 当前资源保护层级

```
L0: 无保护 — CRUD API (任何频率)
L1: Semaphore(3) — Agent 实例 (已实现)
L2: 连接池 maxPoolSize=100 — MongoDB (已实现)
L3: ❌ 无全局限流
L4: ❌ 无分级配额
L5: ❌ 无用户级限流
```

### 1.2 接口资源消耗分级

| 接口 | 资源消耗 | 典型延迟 | 并发敏感度 | 限流优先级 |
|------|----------|----------|-----------|-----------|
| `chat_service.chat` (SSE) | **极高** (LLM GPU) | 2-30s | 极高 | **P0** |
| `agent_service.run_agent` | **极高** (LLM + 工具) | 10-60s | 极高 (Semaphore 3) | **P0** |
| `rag.rag_chat` (SSE) | **高** (Embedding + LLM) | 3-15s | 高 | **P0** |
| `rag.rag_query` | 中 (Embedding + BM25) | 0.5-2s | 中 | P1 |
| `rag.rag_build` | **高** (全量索引重建) | 1-5min | 极高 (仅允许 1 个并发) | P0 |
| `data_service.*` (CRUD) | 低 (MongoDB) | 0.01-0.5s | 中 | P2 |
| `knowledge.*` (文件读写) | 中 (磁盘 I/O) | 0.1-1s | 低 | P2 |

---

## 二、设计决策

### 决策 1：限流算法 — 固定窗口 vs 滑动窗口 vs 令牌桶

| 选项 | 突发容忍 | 内存开销 | 精度 |
|------|----------|----------|------|
| 固定窗口 | 差（边界突发 ×2） | 低 (1 counter/key) | 低 |
| 滑动窗口 | 中 | 中 (N 个子窗口) | 中 |
| **令牌桶** | 高（可配置 burst） | 低 (tokens + last_refill) | 高 |

**选择：令牌桶。** 允许短时突发（如页面加载后连续 3 个 API 调用），同时限制长期速率。Redis/MongoDB 存储桶状态。

### 决策 2：限流粒度 — 全局 vs 用户级 vs 接口级

**选择：三级级联。** 全局限流（总并发）→ 接口级限流（per-endpoint）→ 用户级限流（per-user）。任一超限即返回 429。

### 决策 3：限流存储 — 内存 vs MongoDB vs Redis

| 选项 | 持久化 | 多进程共享 | 性能 |
|------|--------|-----------|------|
| 内存 (dict) | 否 | 否 | 最高 |
| MongoDB | 是 | 是 | 中 |
| Redis | 是 | 是 | 高 |

**选择：内存 + 可选 Redis。** 单进程部署时内存足够（YiAi 当前单实例），多进程部署时可切换 Redis。

---

## 三、目标架构

### 3.1 三级令牌桶限流器

```python
# YiAi/src/server/rate_limiter.py

import time
import asyncio
from dataclasses import dataclass, field
from fastapi import Request, HTTPException

@dataclass
class TokenBucket:
    """令牌桶——支持突发和持续速率限制。"""
    rate: float           # 令牌生成速率 (tokens/sec)
    capacity: int          # 桶容量 (最大突发)
    tokens: float = 0
    last_refill: float = field(default_factory=time.monotonic)

    def consume(self, tokens: int = 1) -> bool:
        """尝试消费令牌。返回 True = 允许，False = 限流。"""
        self._refill()
        if self.tokens >= tokens:
            self.tokens -= tokens
            return True
        return False

    def _refill(self):
        now = time.monotonic()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, self.tokens + elapsed * self.rate)
        self.last_refill = now

# 限流配置——三级配额
RATE_LIMITS = {
    # 接口级: 每接口的速率限制
    "endpoint": {
        "chat_service.chat":       TokenBucket(rate=2, capacity=5),     # 2 req/s, burst 5
        "agent_service.run_agent": TokenBucket(rate=1, capacity=3),     # 1 req/s, burst 3
        "rag.rag_chat":            TokenBucket(rate=2, capacity=5),
        "rag.rag_query":           TokenBucket(rate=5, capacity=10),
        "rag.rag_build":           TokenBucket(rate=0.1, capacity=1),   # 6/min, burst 1
        "data_service.*":          TokenBucket(rate=50, capacity=100),
        "knowledge.*":             TokenBucket(rate=20, capacity=50),
    },
    # 用户级: 每用户的速率限制
    "user": {
        "default":    TokenBucket(rate=10, capacity=30),   # 10 req/s per user
        "premium":    TokenBucket(rate=30, capacity=100),
    },
    # 全局: 系统总量限制
    "global": {
        "total":      TokenBucket(rate=100, capacity=200), # 100 req/s total
        "agent":      TokenBucket(rate=3, capacity=5),     # 3 agent req/s total
    },
}

class RateLimiter:
    """三级令牌桶限流器中间件。"""

    def __init__(self):
        self._user_buckets: dict[str, TokenBucket] = {}

    async def __call__(self, request: Request):
        endpoint = self._get_endpoint(request)
        user_id = request.headers.get("X-User-Id", "anonymous")
        user_tier = self._get_user_tier(user_id)

        # L1: 全局限流
        if not RATE_LIMITS["global"]["total"].consume():
            raise HTTPException(429, detail="全局限流——请稍后重试")

        # L2: 接口级限流
        endpoint_limit = self._match_endpoint_limit(endpoint)
        if endpoint_limit and not endpoint_limit.consume():
            raise HTTPException(
                429,
                detail=f"接口限流 ({endpoint})——{endpoint_limit.rate:.0f} req/s",
                headers={"Retry-After": str(int(1 / endpoint_limit.rate))},
            )

        # L3: 用户级限流
        user_limit = self._get_user_bucket(user_id, user_tier)
        if not user_limit.consume():
            raise HTTPException(
                429,
                detail=f"用户限流——{user_limit.rate:.0f} req/s",
                headers={"Retry-After": "5"},
            )

    def _match_endpoint_limit(self, endpoint: str) -> TokenBucket | None:
        """匹配接口限制（支持通配符 'data_service.*'）。"""
        if endpoint in RATE_LIMITS["endpoint"]:
            return RATE_LIMITS["endpoint"][endpoint]
        # 通配符匹配
        for pattern, bucket in RATE_LIMITS["endpoint"].items():
            if pattern.endswith(".*"):
                prefix = pattern[:-1]
                if endpoint.startswith(prefix):
                    return bucket
        return None

    def _get_user_bucket(self, user_id: str, tier: str) -> TokenBucket:
        """获取用户级令牌桶。"""
        key = f"{user_id}:{tier}"
        if key not in self._user_buckets:
            base = RATE_LIMITS["user"].get(tier, RATE_LIMITS["user"]["default"])
            self._user_buckets[key] = TokenBucket(
                rate=base.rate, capacity=base.capacity
            )
        return self._user_buckets[key]

    def _cleanup_stale_buckets(self):
        """清理不活跃的用户桶（每小时）。"""
        # 超过 1 小时未使用的桶自动删除
        now = time.monotonic()
        stale = [
            k for k, b in self._user_buckets.items()
            if now - b.last_refill > 3600
        ]
        for k in stale:
            del self._user_buckets[k]
```

### 3.2 前端 429 响应处理

```typescript
// YiVad/YiPet 统一处理
if (error.response?.status === 429) {
  const retryAfter = parseInt(error.response.headers['Retry-After'] ?? '5');
  ElMessage.warning(`请求过于频繁，${retryAfter}s 后自动重试`);
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  return retryRequest();
}
```

---

## 四、具体改动

| 文件 | 说明 |
|------|------|
| `YiAi/src/server/rate_limiter.py` | 新增: 三级令牌桶限流器 |
| `YiAi/src/server/middleware.py` | 修改: 注册 RateLimiter 中间件 |
| `YiAi/src/shared/config.py` | 修改: 限流配置项 (`RATE_LIMIT_*`) |

---

## 五、实施步骤

| 步骤 | 验证方式 | 人天 |
|------|------|------|
| 1 | 新增 `TokenBucket` + 三级限流架构 | 单接口连续 10 次请求 → 第 6 次返回 429 | 0.5 |
| 2 | 集成 FastAPI 中间件 | 正常请求通过 + 超限请求被拦截 | 0.5 |
| 3 | 前端统一 429 处理 | 触发限流 → toast 提示 + 自动重试 | 0.5 |

**总计：1.5d**

---

## 六、性能分析

| 操作 | 开销 | 说明 |
|------|------|------|
| 单次 `consume()` | < 0.01ms | 纯内存浮点运算 |
| 中间件总体延迟 | < 0.1ms | 3 次 `consume()` + 1 次字典查找 |

---

## 七、可观测性

### 7.1 关键指标

| 指标 | 采集方式 | 告警阈值 | 说明 |
|------|----------|----------|------|
| 全局限流触发率 | `RateLimiter` 中间件计数 | > 5% 请求 | 正常流量不应频繁触发全局限流 |
| 429 响应数/min | HTTP 响应码统计 | > 10/min | 前端可能存在问题或遭受异常流量 |
| Agent 队列深度 | Semaphore 等待计数 | > 5 排队 | Agent 并发过载，需扩容或限流 |
| 用户级限流触发 | 单用户 429 计数 | > 20 次/小时 | 该用户可能滥用或前端 bug 导致请求风暴 |
| 接口级限流触发率 | 每接口 429 比率 | > 10% | 该接口配额不合理或流量模式变化 |
| 令牌桶预热延迟 | `TokenBucket._refill()` 耗时 | P99 > 0.5ms | 浮点运算不应成为瓶颈 |

### 7.2 限流日志规范

| 日志级别 | 场景 | 示例 |
|---------|------|------|
| `WARN` | 全局限流触发 | `[RateLimiter] global limit reached, 429 returned` |
| `WARN` | 接口级限流触发 | `[RateLimiter] chat_service.chat rate limited (2.0 req/s), user=xxx` |
| `INFO` | 用户级限流首次触发 | `[RateLimiter] user xxx tier=default rate limited (10 req/s)` |
| `ERROR` | 用户桶 OOM 清理异常 | `[RateLimiter] stale bucket cleanup failed: {error}` |
| `DEBUG` | 令牌桶状态 | `[RateLimiter] bucket tokens=3.5, rate=2.0, capacity=5` |

### 7.3 监控仪表盘指标

```markdown
## API 限流状态

| 指标 | 当前值 | 阈值 | 状态 |
|------|--------|------|------|
| 全局请求速率 | 45 req/s | 100 req/s | 🟢 |
| Agent 并发数 | 2/3 | 3 | 🟢 |
| 429 响应率 (最近 5min) | 1.2% | < 5% | 🟢 |
| 用户级限流触发 | 3 users | < 10 users/hour | 🟢 |
| RAG 查询速率 | 3.1 req/s | 5 req/s | 🟢 |
| CRUD 查询速率 | 12 req/s | 50 req/s | 🟢 |
```

---

## 八、容量规划

| 场景 | Agent 并发 | 全局 req/s | 用户数 | 内存占用 | 存储需求 | 说明 |
|------|-----------|-----------|--------|---------|---------|------|
| 本地开发 | 1 | 20 | 1 | ~2MB | 0 | 单用户全部资源 |
| 小型团队（< 5 人） | 3 | 50 | 5 | ~5MB | 0 (内存) | Semaphore 3 足够 |
| 中型团队（5-15 人） | 5 | 100 | 15 | ~10MB | Redis 可选 | 并发 Agent 5 实例 |
| 大型团队（15-50 人） | 10 | 200 | 50 | ~20MB | Redis 推荐 | 多进程部署，Redis 共享桶状态 |
| 企业级（50+ 人） | 20 | 500 | 100+ | ~50MB | Redis 必需 | 需独立 Redis 集群 |
| **YiAi 当前** | **3** | **~30** | **~3** | **~3MB** | **0 (内存)** | 单实例部署，内存令牌桶 |

### 弹性扩容建议

- **QPS > 50**：切换到 Redis 存储令牌桶（多进程共享状态）
- **用户 > 20**：启用用户分级配额（default/premium），避免单用户占满配额
- **Agent 并发 > 5**：评估 Ollama GPU 容量，考虑多模型实例负载均衡

---

## 九、测试规格

### Requirement: 三级令牌桶限流器

#### Scenario: 正常请求通过三级限流
- **Given** 全局、接口级、用户级令牌桶均有足够令牌
- **When** 发送 API 请求
- **Then** 三级 `consume()` 全部返回 `True`
- **And** 请求正常处理

#### Scenario: 全局限流触发
- **Given** 全局令牌桶已耗尽（100 req/s 持续超过容量）
- **When** 下一个请求到达
- **Then** 全局 `consume()` 返回 `False`
- **And** HTTP 429 返回，`Retry-After` 头部 = `1`
- **And** 不继续检查接口级和用户级

#### Scenario: 接口级限流触发
- **Given** `chat_service.chat` 接口已超过 2 req/s 速率
- **When** 新 `chat_service.chat` 请求到达
- **Then** 接口级 `consume()` 返回 `False`
- **And** HTTP 429 返回，detail 包含 `chat_service.chat` 和 `2 req/s`
- **And** `Retry-After` = `1`（`1/2` 向上取整）

#### Scenario: 用户级限流触发
- **Given** 用户 `user_123` (tier=default) 已超过 10 req/s
- **When** 同用户的下一个请求到达
- **Then** 用户级 `consume()` 返回 `False`
- **And** HTTP 429 返回，`Retry-After` = `5`

#### Scenario: 通配符接口匹配
- **Given** 请求接口为 `services.database.data_service.query_documents`
- **When** 检查接口级限流
- **Then** 匹配通配符 `data_service.*` 规则（rate=50, capacity=100）

#### Scenario: 令牌桶自动恢复
- **Given** 令牌桶耗尽（tokens=0）
- **When** 等待 `1/rate` 秒（如 rate=2, 等待 0.5s）
- **Then** 令牌自动补充至 1.0
- **And** 下一个请求可通过

#### Scenario: 闲置用户桶自动清理
- **Given** 用户 `user_456` 桶的 `last_refill` 超过 1 小时
- **When** `_cleanup_stale_buckets()` 执行
- **Then** `user_456` 桶从 `_user_buckets` 字典中删除

### Requirement: 前端 429 处理

#### Scenario: YiVad 429 自动重试
- **GIVEN** API 返回 429 + `Retry-After: 5`
- **WHEN** `RequestHttp` 拦截器处理响应
- **THEN** 显示 toast "请求过于频繁，5s 后自动重试"
- **AND** 等待 5s 后自动重试原请求
- **AND** 重试成功后正常渲染数据

#### Scenario: YiPet 429 排队提示
- **GIVEN** Agent API 返回 429 + `Retry-After: 3`
- **WHEN** `ApiClient` 处理响应
- **THEN** 聊天窗口显示"系统繁忙，预计等待 3s"
- **AND** 3s 后自动重试
- **AND** 最多重试 3 次，失败后显示错误提示

---

## 十、代码审查检查清单

合并前审查人需确认以下项目：

- [ ] 三级级联限流架构（全局 → 接口级 → 用户级）正确实现
- [ ] 令牌桶算法 `consume()` 使用 `time.monotonic()`（不受系统时间调整影响）
- [ ] 接口级限流支持通配符匹配（`data_service.*`）
- [ ] 用户级限流支持分级配额（default/premium）
- [ ] 闲置用户桶定时清理（防止内存泄漏）
- [ ] 429 响应包含 `Retry-After` 头部
- [ ] 429 响应 body 包含 `detail` 说明限流原因
- [ ] 前端 429 处理有重试上限（最多 3 次自动重试）
- [ ] FastAPI 中间件注册顺序：RateLimiter 在 CORS 之后、Auth 之前
- [ ] 限流配置可通过环境变量覆盖（`RATE_LIMIT_*`）
- [ ] `mypy` 类型检查通过
- [ ] 单元测试覆盖：三级限流正常/超限/通配符/清理

---

## 十一、回归问题预测

| # | 预测问题 | 原因 | 验证方法 |
|---|---------|------|---------|
| 1 | 令牌桶内存泄漏：多用户并发时 `_user_buckets` 字典无限增长 | 新用户每次创建新桶，闲置清理仅在每小时触发 | 模拟 1000 个不同用户连续请求，观察内存使用是否持续增长 |
| 2 | SSE 长连接占用令牌不释放：`chat_service.chat` 的 SSE 连接持续 30s，期间令牌被消耗但无法恢复 | 令牌桶按请求计数而非连接持续时间计数 | 长 SSE 连接期间，其他短请求是否受到不合理的限流影响 |
| 3 | 通配符匹配冲突：`data_service.*` 和 `data_service.query_documents` 同时存在时匹配优先级不明确 | 精确匹配与通配符匹配的优先级未定义 | 同时配置精确规则和通配符规则，验证匹配顺序 |
| 4 | `time.monotonic()` 漂移导致令牌计算异常 | 长时间运行的 Python 进程中，`time.monotonic()` 的累积浮点误差 | 连续运行 24h 后，检查令牌桶的令牌数是否偏离预期值 |
| 5 | 多进程/多 worker 下内存令牌桶状态不一致 | uvicorn 多 worker 模式下，每个 worker 有独立的 `_user_buckets` | 同一用户轮询到不同 worker 时，限流计数是否一致 |
| 6 | 前端重试风暴：429 重试逻辑在没有 `Retry-After` 头部时默认 5s，但可能所有客户端同时重试 | 多个客户端在同一时刻收到 429，在相同延迟后同时重试 | 添加随机抖动（jitter）±25% 到重试延迟 |
| 7 | 令牌桶 `capacity` 过大导致短时请求风暴穿透 | `chat_service.chat` burst=5 允许 5 个并发请求通过，可能在 100ms 内全部到达 | 在令牌桶基础上叠加并发限制（Semaphore），双保险 |

## 影响范围

- **影响模块**：待补充
- **涉及文件**：
- 待补充
- **是否影响 API 契约**：否
- **是否影响其他项目（YiVad/YiPet）**：否
- **用户感知**：待确认

## 预防措施

| 层面 | 措施 |
|------|------|
| 代码 | 在相关函数中添加参数校验和边界检查 |
| 测试 | 添加对应的自动化测试用例 |
| 流程 | 代码审查时重点检查此类模式 |
| 监控 | 添加日志告警，异常发生时及时发现 |
| 文档 | 在编码规范中记录此类反模式 |

## 经验教训

1. **根本原因**：开发过程中对边界情况和异常路径的考虑不足是此类问题的共同根因
2. **设计阶段**：在接口设计和模块实现时，应主动考虑异常输入、空值、超时等边界场景
3. **代码审查**：审查时应检查是否存在类似的反模式（如未捕获异常、无超时控制、缺少参数校验等）
4. **测试覆盖**：异常路径的测试覆盖率应与正常路径同等重视
5. **团队分享**：此类问题应在团队周会或技术分享中讨论，形成团队共识
