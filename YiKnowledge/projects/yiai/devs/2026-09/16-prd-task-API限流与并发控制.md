---
doc_type: module
prd_task_id: "YA-09-08"
title: "YA-09-08: API 限流与并发控制 — 令牌桶 + 分级配额 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.5
source_prd: "16-需求-API限流与并发控制.md"
source_okr: [yiai-001]
related_tests: ["16-prd-test-API限流与并发控制"]
---

# YA-09-08: API 限流与并发控制 — 令牌桶 + 分级配额 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[16-需求-API限流与并发控制.md](../../prds/2026-09/16-需求-API限流与并发控制.md)
> 需求编号：YA-09-08 · 优先级：P1 · 人天：2.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

基于令牌桶算法实现分级限流——不同端点/用户分配不同配额。

### 分级配额

| 级别 | 适用端点 | 速率 | 突发 |
|------|---------|------|------|
| 宽松 | `/health`, `/about` | 无限制 | — |
| 标准 | RPC `query_documents`, `/read-file` | 100/min | 20 |
| 严格 | `/auth/login` | 10/min | 3 |
| LLM | `chat_service.chat` | 30/min | 5 |

### 实现

```python
class TokenBucket:
    def __init__(self, rate: float, burst: int):
        self.rate = rate          # tokens/sec
        self.burst = burst        # max tokens
        self.tokens = burst
        self.last_refill = time.monotonic()

    def consume(self, n: int = 1) -> bool:
        self._refill()
        if self.tokens >= n:
            self.tokens -= n
            return True
        return False  # 限流
```

中间件集成：在请求进入 RPC 调度前检查令牌，超限返回 `ErrorCode.RATE_LIMITED` (429)。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | TokenBucket 实现 | 单元测试验证速率精度 | 0.5 |
| 2 | 分级配额配置 + 中间件集成 | 超限返回 429 | 1.0 |
| 3 | 内存/Redis 双后端 + 测试 | Redis 不可用时回退内存 | 1.0 |

**合计：2.5d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 集成：[YA-07-03 RPC 信封协议](../2026-07/03-prd-task-RPC信封协议.md)——在 RPC 调度前拦截
- 下游：[滑动窗口限流](./76-prd-task-滑动窗口限流.md)、[动态限流调整](./105-prd-task-动态限流调整.md)

---

## 四、代码审查检查清单

- [x] 令牌桶速率精度 ±5%
- [x] 超限返回 429 + Retry-After header
- [x] Redis 不可用时回退内存令牌桶

---

## 五、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 限流配额硬编码 | P3 | 分级配额未配置化 | 待实施 |
| 2 | 429 错误无 Dashboard | P3 | 限流触发次数不可见 | 待实施 |