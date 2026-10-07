---

doc_type: module
prd_task_id: "YA-09-100"
title: "YA-09-100: 服务端 API 速率限制动态调整 — 基于负载的自动弹性伸缩限流阈值 — 开发任务"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-11
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "105-需求-动态限流调整.md"
source_okr: [yiai-002]

type: task
---

# YA-09-100: API 限流动态调整 — 基于负载的自动弹性伸缩限流阈值 — 开发任务

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[105-需求-动态限流调整.md](../../prds/2026-09/105-需求-动态限流调整.md)
> 需求编号：YA-09-100 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

## 一、架构总览

YA-09-12 实现了基于令牌桶的固定限流（10 req/s per user），但固定阈值在波动负载下存在根本性缺陷：低峰期浪费闲置资源（用户被不必要限流），高峰期阈值过松导致系统过载。方案：在现有 RateLimiter 之上增加 `AdaptiveRateController`，每 10 秒采样系统负载指标（CPU/内存/QPS/P95延迟），通过加权融合计算负载因子（0~1），动态调整限流阈值 `[3, 30]` req/s。平滑过渡避免阈值突变。

```mermaid
graph TB
    subgraph "监控采集层 (每 10s)"
        CPU[CPU 使用率<br/>psutil]
        MEM[内存使用率<br/>psutil]
        QPS[当前 QPS<br/>RateLimiter 统计]
        LAT[P95 延迟<br/>中间件采集]
    end

    subgraph "AdaptiveRateController"
        FUSION[加权融合<br/>0.4*CPU + 0.3*LAT + 0.2*QPS + 0.1*MEM]
        FACTOR[负载因子 0~1]
        THROTTLE[阈值计算<br/>rate = max(3, min(30, base_rate / (1 + factor*3)))]
        SMOOTH[EMA 平滑<br/>rate = α*new + (1-α)*old, α=0.2]
    end

    subgraph "限流执行层"
        RL[RateLimiter<br/>YA-09-12]
        BUCKETS[每用户令牌桶]
    end

    subgraph "响应"
        OK[正常放行]
        LIMIT[429 Too Many Requests]
    end

    CPU --> FUSION
    MEM --> FUSION
    QPS --> FUSION
    LAT --> FUSION

    FUSION --> FACTOR
    FACTOR --> THROTTLE
    THROTTLE --> SMOOTH
    SMOOTH -->|"更新 rate (每 10s)"| RL
    RL --> BUCKETS
    BUCKETS --> OK
    BUCKETS --> LIMIT
```

### 限流阈值滑动曲线

```
负载因子        限流阈值 (req/s)
────────        ────────────────
0.0 (空闲)      30 (放宽)
0.1-0.3         20
0.3-0.5         12
0.5-0.7         8
0.7-0.9         5
0.9-1.0 (过载)  3 (收紧)

平滑公式: rate_t = 0.2 * raw_rate + 0.8 * rate_{t-1}
```

---

## 二、文件清单

| 文件 | 操作 | 行数 | 说明 |
|------|------|------|------|
| `src/services/adaptive_rate_controller.py` | **新建** | ~120 | AdaptiveRateController：负载采样、因子计算、阈值调整、EMA 平滑 |
| `src/services/rate_limiter.py` | 修改 | +20 | 新增 `update_rate()` 方法，接受动态阈值 |
| `src/shared/config.py` | 修改 | +10 | 新增 `adaptive_rate_enabled`、`rate_min`、`rate_max`、`rate_smooth_alpha` |
| `tests/services/test_adaptive_rate.py` | **新建** | ~100 | 4 场景测试：低峰放宽、高峰收紧、平滑过渡、配置边界 |

---

## 三、模块设计

### 3.1 AdaptiveRateController（核心类）

```python
# src/services/adaptive_rate_controller.py

import asyncio
import psutil
import time


class AdaptiveRateController:
    """自适应限流控制器。

    职责：
    - 每 10s 采集系统负载指标（CPU/内存/QPS/P95延迟）
    - 加权融合计算负载因子 (0.0 ~ 1.0)
    - 根据负载因子计算目标限流阈值 [rate_min, rate_max]
    - EMA 平滑过渡，避免阈值突变
    - 通过 update_rate() 回调更新 RateLimiter
    """

    WEIGHTS: dict[str, float] = {
        "cpu": 0.4,    # CPU 使用率权重最高
        "latency": 0.3, # P95 延迟次之
        "qps": 0.2,     # 当前 QPS
        "memory": 0.1,  # 内存权重最低
    }

    def __init__(
        self,
        rate_min: int = 3,
        rate_max: int = 30,
        sample_interval: int = 10,
        smooth_alpha: float = 0.2,
    ) -> None: ...

    async def start(self) -> None: ...
    async def stop(self) -> None: ...
    async def _sample_loop(self) -> None: ...

    def _collect_metrics(self) -> dict[str, float]: ...
    def _compute_load_factor(self, metrics: dict) -> float: ...
    def _compute_target_rate(self, factor: float) -> float: ...
    def _smooth_rate(self, target: float) -> float: ...
    def get_current_rate(self) -> float: ...
    def get_stats(self) -> dict: ...


# 全局单例
adaptive_controller = AdaptiveRateController()
```

### 3.2 负载因子计算

```python
def _compute_load_factor(self, metrics: dict) -> float:
    """加权融合计算负载因子。

    各指标归一化到 0~1:
    - CPU: 直接使用比例 (0.35 → 0.35)
    - Latency: P95 / 1000ms (500ms → 0.5)
    - QPS: min(current_qps / max_observed_qps, 1.0)
    - Memory: 直接使用比例 (0.72 → 0.72)

    factor = 0.4*cpu + 0.3*lat + 0.2*qps + 0.1*mem
    """
    return (
        self.WEIGHTS["cpu"] * metrics["cpu"]
        + self.WEIGHTS["latency"] * min(metrics["p95_latency_ms"] / 1000.0, 1.0)
        + self.WEIGHTS["qps"] * min(metrics["current_qps"] / max(metrics["max_qps"], 1), 1.0)
        + self.WEIGHTS["memory"] * metrics["memory"]
    )

def _compute_target_rate(self, factor: float) -> float:
    """根据负载因子计算目标限流阈值。

    rate = max(rate_min, min(rate_max, base_rate / (1 + factor * 3)))
    低负载 (factor=0):  rate = 30 req/s
    中负载 (factor=0.5): rate = 12 req/s
    高负载 (factor=1.0): rate = 7.5 → max(3, 7.5) = 7.5 req/s
    """
    base_rate = self.rate_max
    raw = base_rate / (1.0 + factor * 3.0)
    return max(float(self.rate_min), min(float(self.rate_max), raw))

def _smooth_rate(self, target: float) -> float:
    """EMA 平滑: rate_t = α * target + (1-α) * rate_{t-1}"""
    self._current_rate = (
        self.smooth_alpha * target
        + (1.0 - self.smooth_alpha) * self._current_rate
    )
    return self._current_rate
```

### 3.3 RateLimiter 集成

```python
# src/services/rate_limiter.py — 新增方法

class RateLimiter:
    def update_rate(self, new_rate: float) -> None:
        """动态更新所有令牌桶的填充速率。"""
        self._rate = new_rate
        for bucket in self._buckets.values():
            bucket.rate = new_rate
```

---

## 四、数据流

### 4.1 自适应调整循环

```
[启动] → adaptive_controller.start()
  → asyncio.create_task(_sample_loop())
    → while running:
      sleep(10s)
      → metrics = _collect_metrics()
        → psutil.cpu_percent(interval=0.1) → cpu
        → psutil.virtual_memory().percent → memory
        → rate_limiter.get_stats() → current_qps, max_qps
        → middleware.get_latency_stats() → p95_latency_ms
      → factor = _compute_load_factor(metrics)
      → target = _compute_target_rate(factor)
      → smoothed = _smooth_rate(target)
      → rate_limiter.update_rate(smoothed)
      → log: "限流阈值调整 factor=0.45 rate=12.3 req/s"
```

### 4.2 各时段行为示例

| 时间 | CPU | P95延迟 | QPS | 内存 | factor | 阈值 (req/s) |
|------|-----|---------|-----|------|--------|-------------|
| 03:00 低峰 | 5% | 10ms | 2 | 20% | 0.05 | 26 |
| 10:00 正常 | 35% | 50ms | 40 | 55% | 0.30 | 18 |
| 14:00 高峰 | 78% | 200ms | 90 | 72% | 0.62 | 10 |
| 18:00 过载 | 92% | 800ms | 120 | 85% | 0.89 | 5 |

---

## 五、实施路线图

| 阶段 | 人天 | 任务 | 产出 | 验证 |
|------|------|------|------|------|
| 一：核心控制器 | 0.15 | 实现 AdaptiveRateController 类（负载采样 + 因子计算 + 阈值调整 + EMA 平滑） | `adaptive_rate_controller.py` (~120行) | 单元测试：4 场景通过 |
| 二：RateLimiter 改造 | 0.10 | RateLimiter 新增 `update_rate()` 方法；启动时注册 adaptive_controller | `rate_limiter.py` 修改 (+20行) | 集成测试：动态调整阈值生效 |
| 三：配置 + 指标 | 0.10 | 添加配置项；接入 psutil 监控；暴露 `/metrics` 端点 | config + metrics 端点 | 负载因子可观测 |
| 四：边界处理 | 0.05 | 处理 psutil 不可用降级、首次采样无历史数据、极低 QPS 场景 | 边界代码 | 降级后使用固定阈值 |
| 五：测试收尾 | 0.10 | 编写完整测试 + 压力验证（模拟高负载 → 阈值收紧 → 负载下降 → 阈值恢复） | `test_adaptive_rate.py` (~100行) | pytest 全部通过 |

**合计：0.5d。**

---

## 六、代码审查检查清单

- [ ] 负载采样每 10s 执行一次（`asyncio.sleep(10)`，非阻塞）
- [ ] 加权权重：CPU 0.4 + P95延迟 0.3 + QPS 0.2 + 内存 0.1
- [ ] 各指标归一化到 0~1 范围（延迟 / 1000ms, QPS / max_observed_qps）
- [ ] 限流阈值范围 [3, 30] req/s，可配置
- [ ] EMA 平滑 α=0.2，防止阈值突变
- [ ] `rate_limiter.update_rate()` 立刻生效于所有活跃令牌桶
- [ ] psutil 不可用时降级为固定阈值（WARNING 日志）
- [ ] 统计信息通过 `get_stats()` 暴露（当前 factor/rate/阈值范围）
- [ ] `adaptive_rate_enabled=False` 时回退到固定限流
- [ ] 启动时不立即调整（等第一次采样完成）
- [ ] 测试覆盖：低峰放宽、高峰收紧、平滑过渡、配置边界

---

## 七、技术风险评估

| 风险 | 概率 | 影响 | 等级 | 缓解措施 |
|------|------|------|------|----------|
| psutil 采样开销影响请求延迟 | 低 | 低 | 低 | 采样间隔 10s，单次 < 1ms |
| 指标波动导致阈值抖动 | 中 | 中 | 中 | EMA 平滑 α=0.2；最小调整阈值 1 req/s |
| 短期指标 spike 误判为持续高负载 | 中 | 中 | 中 | EMA 平滑过滤瞬时波动 |
| 首次启动无历史 QPS 数据 | 低 | 低 | 低 | max_qps 初始化为 rate_max，首次采样后更新 |
| 低负载时阈值过高导致无保护 | 低 | 低 | 低 | rate_max 硬限制 30 req/s |
| 与 YA-09-99 限流令牌回收冲突 | 低 | 中 | 低 | 令牌回收在 update_rate 后不重置桶状态 |

### 回滚策略

| 场景 | 操作 | 回滚时间 |
|------|------|----------|
| 自适应导致误限流 | `adaptive_rate_enabled=False` | < 1min |
| EMA 平滑导致响应过慢 | 增大 α 到 0.5 | < 1min |
| 完全回滚 | 恢复固定 rate=10 req/s + 注释 adaptive_controller | < 5min |