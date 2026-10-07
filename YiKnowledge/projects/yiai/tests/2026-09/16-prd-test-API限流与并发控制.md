---

doc_type: test
title: "YA-09-16: API 限流与并发控制 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-16"
source_prds: ["16-需求-API限流与并发控制"]
source_modules: ["16-prd-task-API限流与并发控制"]
source_okr: [yiai-001]

type: test
---

# YA-09-16: API 限流与并发控制 — 测试规格

> 来源 PRD：[16-需求-API限流与并发控制.md](../../prds/2026-09/16-需求-API限流与并发控制.md)
> 开发方案：[16-prd-task-API限流与并发控制.md](../../devs/2026-09/16-prd-task-API限流与并发控制.md)

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖令牌桶限流、分级配额、429 响应 Retry-After、Redis 回退内存模式。

---

<a id="sec-scope"></a>
## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 描述 | 工具 | 覆盖目标 |
|------|------|------|---------|
| L1 单元测试 | 令牌桶算法纯逻辑 | pytest | 令牌消耗/补充/溢出、时间窗口滑动 |
| L2 集成测试 | FastAPI 中间件 + httpx | pytest-asyncio + httpx | 限流中间件、429 响应、Retry-After 头 |
| L4 性能基准 | 限流对吞吐量的影响 | pytest + time.perf_counter | 限流开销 < 1ms/请求 |

### 1.2 分级配额

| 角色 | 速率限制 | 并发限制 | 适用场景 |
|------|---------|---------|---------|
| admin | 100 req/s | 无限制 | 管理操作 |
| user | 10 req/s | 5 并发 | 正常用户 |
| guest | 1 req/s | 1 并发 | 未登录 |

### 1.3 令牌桶参数

| 参数 | 值 | 说明 |
|------|------|------|
| rate | role-dependent | 令牌补充速率 |
| capacity | rate × 2 | 桶容量（允许突发） |
| refill_interval | 1s | 补充间隔 |

---

<a id="sec-fixtures"></a>
## 二、测试数据与 Fixtures

```python
import pytest
import time
from unittest.mock import MagicMock, patch

@pytest.fixture
def token_bucket_config():
    """令牌桶配置。"""
    return {
        "admin": {"rate": 100, "capacity": 200},
        "user": {"rate": 10, "capacity": 20},
        "guest": {"rate": 1, "capacity": 2},
    }

@pytest.fixture
def mock_redis():
    """Mock Redis 客户端。"""
    redis = MagicMock()
    redis.get = MagicMock(return_value=None)
    redis.set = MagicMock(return_value=True)
    redis.incr = MagicMock(return_value=1)
    redis.expire = MagicMock(return_value=True)
    return redis

@pytest.fixture
def admin_headers():
    """Admin 用户请求头。"""
    return {"X-Token": "admin_jwt_token", "X-Role": "admin"}

@pytest.fixture
def user_headers():
    """普通用户请求头。"""
    return {"X-Token": "user_jwt_token", "X-Role": "user"}

@pytest.fixture
def guest_headers():
    """游客请求头。"""
    return {}  # 无认证

@pytest.fixture
def rate_limited_endpoints():
    """支持限流的端点。"""
    return {
        "chat": {"path": "/", "method": "POST", "rate_limit": True},
        "health": {"path": "/health", "method": "GET", "rate_limit": False},
        "rag_query": {"path": "/", "method": "POST", "rate_limit": True},
    }
```

---

<a id="sec-cases"></a>
## 三、详细测试用例

### 3.1 令牌桶基本功能

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RL-01 | User 令牌桶 10/s——正常通过 | user role, empty bucket | 1. 1s 内发送 10 个请求<br>2. 检查每个响应 | 全部返回 code=0，无 429 | P0 |
| TC-RL-02 | User 令牌桶 10/s——第 11 个拒绝 | user role, 前 10 个已消耗 | 1. 1s 内发第 11 个请求<br>2. 检查响应 | 返回 429 Too Many Requests | P0 |
| TC-RL-03 | 令牌补充后恢复 | 等待 1s 令牌补充 | 1. 超出配额后等待 1s<br>2. 发送新请求 | 请求正常通过 | P1 |
| TC-RL-04 | 突发流量允许 | capacity=20 (user) | 1. 1s 内发送 15 个请求（超过 rate 但未超 capacity）<br>2. 检查响应 | 前 15 个通过，第 16 个起 429 | P1 |
| TC-RL-05 | 429 含 Retry-After 头 | 限流触发 | 1. 检查 429 响应头<br>2. 验证 `Retry-After` 字段 | `Retry-After: 1`（整数秒） | P1 |

### 3.2 分级配额

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RL-06 | Admin 100 req/s | admin_headers | 1. 1s 内发送 50 请求（远低于 100/s 限制） | 全部通过 | P1 |
| TC-RL-07 | User vs Guest 配额区分 | user 10/s, guest 1/s | 1. guest 发第 2 个请求<br>2. 检查响应 | guest 返回 429，user 通过 | P1 |
| TC-RL-08 | Guest 1 req/s 严格限制 | guest headers | 1. 1s 内发 2 个请求 | 第 1 个通过，第 2 个 429 | P2 |
| TC-RL-09 | Admin 超高并发保护 | admin 100/s | 1. 1s 内发 200 请求（超过 capacity=200） | 前 200 通过（capacity），第 201 429 | P2 |

### 3.3 Redis 集成与回退

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RL-10 | Redis 模式——分布式限流 | Redis 可用 | 1. 两个实例共享 Redis 令牌桶<br>2. 检查跨实例限流一致性 | 两个实例总计不超过配额 | P1 |
| TC-RL-11 | Redis 不可用→内存回退 | Redis 宕机 | 1. 断开 Redis 连接<br>2. 发送请求 | 降级为内存令牌桶，限流继续工作 | P0 |
| TC-RL-12 | Redis 恢复后切回 | Redis 从不可用到恢复 | 1. 恢复 Redis<br>2. 检查限流模式 | 切换回 Redis 模式，日志 INFO | P2 |

### 3.4 端点白名单

| ID | 用例名称 | 前置条件 | 测试步骤 | 预期结果 | 优先级 |
|----|---------|---------|---------|---------|--------|
| TC-RL-13 | 健康检查不受限流 | /health endpoint | 1. 1s 内发送 50 个 /health 请求 | 全部 200，无 429 | P1 |
| TC-RL-14 | Chat 端点受限流 | SSE chat endpoint | 1. 1s 内超过配额发送 chat 请求 | 超过配额的返回 429 | P1 |

---

<a id="sec-edge"></a>
## 四、边界与异常测试

| ID | 用例名称 | 输入/场景 | 预期行为 | 优先级 |
|----|---------|---------|---------|--------|
| EG-RL-01 | 速率配置为 0 | rate=0 | 所有请求返回 429 | P2 |
| EG-RL-02 | 超长 IP/Token 作为 key | 256 字符的 X-Token | 正常作为限流 key 使用 | P2 |
| EG-RL-03 | 并发修改 Redis 令牌 | 两个请求同时消耗令牌 | Redis INCR 原子操作保证正确性 | P1 |
| EG-RL-04 | 系统时钟回拨 | NTP 校时导致时间倒退 | 令牌桶时间不倒退（使用 monotonic clock） | P2 |
| EG-RL-05 | 消费者极慢 | 请求间隔 > 1h | 令牌桶正确恢复到 full capacity | P2 |

---

<a id="sec-regression"></a>
## 五、回归测试

| ID | 回归场景 | 触发条件 | 验证目标 | 优先级 |
|----|---------|---------|---------|--------|
| RG-RL-01 | 限流中间件不影响响应格式 | 正常请求通过 | RPC 响应格式不变 | P1 |
| RG-RL-02 | 限流不影响 SSE 长连接 | SSE chat 连接建立后 | 已建立的 SSE 连接不计算在限流配额内 | P1 |

---

<a id="sec-traceability"></a>
## 六、可追溯性矩阵

| PRD 功能需求 | 对应测试用例 | 覆盖率 |
|-------------|------------|--------|
| FR1: 令牌桶限流 | TC-RL-01 ~ TC-RL-05 | 通过/拒绝/补充/突发/Retry-After |
| FR2: 分级配额 | TC-RL-06 ~ TC-RL-09 | admin/user/guest/超高并发 |
| FR3: Redis + 回退 | TC-RL-10 ~ TC-RL-12 | 分布式/回退/恢复 |
| FR4: 端点白名单 | TC-RL-13, TC-RL-14 | 免限流/受限流 |

---

<a id="sec-gaps"></a>
## 七、覆盖缺口

| 缺口 | 影响 | 建议 |
|------|------|------|
| IP 级别限流 | 当前按用户角色限流，未按 IP | 添加 IP 级令牌桶测试 |
| 滑动窗口精确性 | 固定窗口在边界处有突发问题 | 添加滑动窗口 vs 固定窗口对比测试 |
| 多 YiAi 实例分布式限流 | Redis 模式下竞态条件 | 添加多实例并发限流一致性测试 |
| 限流指标暴露 | 无 Prometheus 指标验证 | 添加 rate_limit_hits/rate_limit_exceeded 指标测试 |