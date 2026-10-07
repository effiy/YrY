---
title: "GameDay 演练：YiAi RPC 熔断防雪崩 — 500 并发 /projects query 触发熔断器"
aliases: [gameday-yiai-circuit-breaker, yiai-rpc-avalanche, yiai-105-circuit-breaker-gameday]
tags: [sre, incident-response, gameday, yiai, circuit-breaker, resilience]
category: sre/incident-response
created: 2026-10-07
updated: 2026-10-07
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [sre, engineer]
benefit: "SRE 季度 GameDay 验证 YiAi RPC 熔断器按 PRD-105 正确打开并返回 429/503 降级，防止下游过载雪崩连锁故障"
acceptance_criteria:
  - "覆盖 5 大节：目标 / 准备环境 / 触发脚本 / 观测指标表 / 期望行为 vs 实际结果 vs 改进项"
  - "Python 脚本 500 并发构造 /projects query RPC，观测成功率、p95、熔断打开计数"
  - "期望行为：熔断器打开后返回 429/503；fallback/cache 降级；引用 yiai 105-prd-熔断器 PRD"
related:
  - ../../projects/yiai/prds/2026-09/105-prd-熔断器.md
  - ../../projects/yiai/prds/2026-09/36-prd-告警路由.md
  - ../../projects/yiai/prds/2026-09/76-prd-滑动窗口限流.md
  - ../run/003-运行-YiAi后端健康Runbook.md
  - ../observability/010-可观测-告警规则配置.md
  - ./008-事件-GameDay演练.md
  - ./004-事件-响应事件.md
  - ../QUICKREF.md
---

# GameDay 演练：YiAi RPC 熔断防雪崩 — 500 并发 /projects query 触发熔断器

> **适用场景**：季度 GameDay / 熔断器上线回归 / 发布前压测。
> **PRD 引用**：`projects/yiai/prds/2026-09/105-prd-熔断器.md 定义熔断器状态机 CLOSED→OPEN→HALF_OPEN→CLOSED 以及半开探测参数。

| GameDay | 详情 |
|---|---|
| **演练 ID** | GD-YIAI-CB-017 |
| **演练目标** | 防雪崩：下游 services.database.data_service.query_documents RPC 故障时，熔断器快速打开 + 降级 + 快速失败不堆积线程 |
| **演练范围** | staging；生产仅在低峰窗口 + 金丝雀 1% 流量 |
| **参与人** | SRE oncall + YiAi 模块 Owner |
| **预计时长** | 40 分钟（10m 准备 + 10m 触发 + 10m 观测 + 10m 复盘） |
| **日期** | 2026-10-07 |
| **最终判定** | 👇 **实际结果填写区 + 改进项 |

---

## 一、演练目标 (防雪崩)

YiAi RPC 模块 `services.database.data_service.query_documents(cname=projects)` 是 YiVad 项目页调用的高频接口（占比 40%）。当 Mongo 变慢或出错时，熔断器的价值在于：

1. **快速失败**：失败率阈值（默认 50% 失败 + 最小样本 20 次）→ 状态机 `CLOSED → OPEN` → **不打下游**。
2. **降级响应**：OPEN 期间直接返回 **HTTP 429**（熔断）或 **503**（降级）+ 只读缓存；客户端 YiVad 看到红色提示但不白屏。
3. **半开探测**：OPEN 持续 30s 后 HALF_OPEN 允许 1 次探测 → 成功则恢复 CLOSED，否则再开 30s。
4. **防止雪崩**：线程池/连接池不堆积 → 不把故障扩散到兄弟模块（同一 uvicorn 进程不被打挂）。

---

## 二、准备环境

| 项目 | 准备清单 | Done |
|---|---|---|
| **环境选择** | `staging`；105-prd-熔断器特性开关 `FEATURE_CIRCUIT_BREAKER=true` | ☐ |
| **依赖就绪** | MongoDB staging 正常，projects 集≥ 5 条（见 run/03）；:10086 健康 | ☐ |
| **监控看板** | Grafana Unified Dashboard，`$project=yiai $env=staging` | ☐ |
| **熔断参数基准** | `failure_threshold=0.5, min_samples=20, open_duration=30s, half_open_permits=1` | ☐ |
| **告警静默** | Alertmanager 对 staging yiai 模块：创建 1h Silence `gameday=GD-YIAI-CB-017` 避免误告警骚扰 | ☐ |
| **回滚开关** | `FEATURE_CIRCUIT_BREAKER=false` 热切换 (config center)；若不生效则 `kubectl rollout restart` | ☐ |
| **观测脚本就位** | 第三节脚本就绪；压测机与 YiAi 同机房（避免网络干扰） | ☐ |

---

## 三、触发脚本 — Python 构造 500 并发 RPC /projects query

> **压测工具**：Python `asyncio + aiohttp` (500 并发，总 10000 请求)；或等价 hey/wrk。
>
> **RPC 负载**：`module_name=services.database.data_service method=query_documents parameters={cname=projects,pageSize=5}`

```python
# trigger_yiai_rpc_500concurrent.py
"""
GameDay 触发：YiAi /projects query 500 并发 RPC  —  在 staging 上触发熔断器阈值。
同时每 5s 做一次基准单请求测成功率 & p95。
运行： pip install aiohttp;  python trigger_yiai_rpc_500concurrent.py
"""
import asyncio, time, statistics, json, random
import aiohttp

TARGET = "http://localhost:10086/"  # staging: http://stg-yiai:10086/
PAYLOAD = {
    "module_name": "services.database.data_service",
    "method_name": "query_documents",
    "parameters": {"cname": "projects", "pageSize": 5},
}
CONCURRENCY = 500
TOTAL = 10_000
SEMAPHORE = asyncio.Semaphore(CONCURRENCY)

status_counts = {"200": 0, "429": 0, "503": 0, "5xx": 0, "other": 0, "timeout": 0, "error": 0}
latencies_ms = []

async def one_request(session: aiohttp.ClientSession, idx: int):
    try:
        async with SEMAPHORE:
            t0 = time.perf_counter()
            # 每 100 次请求人为注入 1 次超长 timeout，提升失败率，便于在健康 staging 更快打到熔断阈值
            override = {"timeout": aiohttp.ClientTimeout(total=0.001 if idx % 100 == 0 else 10)}
            async with session.post(TARGET, json=PAYLOAD, **override) as resp:
                ms = (time.perf_counter() - t0) * 1000
                latencies_ms.append(ms)
                code = str(resp.status)
                if code == "429": status_counts["429"] += 1
                elif code == "503": status_counts["503"] += 1
                elif code.startswith("5"): status_counts["5xx"] += 1
                elif code == "200": status_counts["200"] += 1
                else: status_counts["other"] += 1
    except asyncio.TimeoutError:
        status_counts["timeout"] += 1
    except Exception as e:
        status_counts["error"] += 1

async def probe_loop():
    """每 5s 发 1 次干净的基准请求，记录熔断器状态（通过响应头 x-circuit-state 若已实现）"""
    async with aiohttp.ClientSession() as s:
        for _ in range(20):
            try:
                t0 = time.perf_counter()
                async with s.post(TARGET, json=PAYLOAD, timeout=aiohttp.ClientTimeout(total=5)) as r:
                    ms = (time.perf_counter() - t0) * 1000
                    state = r.headers.get("x-circuit-state", "n/a")
                    print(f"[PROBE t={int(time.time()-START)}s] HTTP {r.status}  lat={ms:.0f}ms  circuit-state={state}")
            except Exception as e:
                print(f"[PROBE] EXC {e}")
            await asyncio.sleep(5)

async def main():
    global START
    START = time.time()
    async with aiohttp.ClientSession() as session:
        tasks = [asyncio.create_task(probe_loop())] + [
            asyncio.create_task(one_request(session, i)) for i in range(TOTAL)
        ]
        await asyncio.gather(*tasks, return_exceptions=True)

    elapsed = time.time() - START
    # 结果汇总
    qps = TOTAL / elapsed if elapsed > 0 else 0
    print("\n================= GameDay Trigger Summary =================")
    print(f"Concurrency={CONCURRENCY} Total={TOTAL}  Elapsed={elapsed:.1f}s  QPS~{qps:.0f}")
    print(f"Status breakdown: {json.dumps(status_counts, ensure_ascii=False)}")
    if latencies_ms:
        latencies_ms.sort()
        def pct(p): return latencies_ms[int((len(latencies_ms)-1)*p)]
        print(f"Latency ms: p50={pct(.5):.1f} p95={pct(.95):.1f} p99={pct(.99):.1f} max={latencies_ms[-1]:.1f}")
    print("[判定] 一旦 429/503 出现，即表示熔断器已触发；记录 t=? 秒首次出现。")

if __name__ == "__main__":
    asyncio.run(main())
```

**运行：**

```bash
# 1. （可选）人为让下游变慢，在 staging 上对 MongoDB projects 集合加阻塞锁，或在 RPC 层注入延迟中间件（debug 模式）
# 2. 运行压测
pip install aiohttp --quiet
python trigger_yiai_rpc_500concurrent.py | tee /tmp/gameday_17_trigger.log
```

---

## 四、观测指标表

> 采集窗口：触发前 5m → 触发 10m → 触发后 20m（熔断器半开恢复阶段）

| 指标 | 采集方式 / PromQL 模板 | 触发前基线 | 触发中实测 | 恢复后实测 | 判定 (PASS / FAIL / TODO) |
|---|---|---|---|---|---|
| **RPC 成功率** (2xx / 总请求) | `sum(rate(rpc_requests_total{project="yiai",module="services.database.data_service",status=~"2.."}[1m])) / clamp_min(sum(rate(rpc_requests_total{project="yiai",module="services.database.data_service"}[1m])),1)` | ≥99.9% | ☐ 填写 | ☐ 填写 | ☐ |
| **RPC p95** | `histogram_quantile(0.95,sum by(le)(rate(rpc_duration_seconds_bucket{module="services.database.data_service"}[1m]))) * 1000` | <200ms | ☐ 填写 ms | ☐ 填写 ms | ☐ |
| **熔断器打开次数** (counter) | `increase(yiai_circuit_breaker_opened_total{module="services.database.data_service"}[10m])` | 0 | ☐ 次 | ☐ 次 | ☐ ≥1 为 PASS |
| **熔断器当前状态 gauge** (0=CLOSED /1=OPEN /2=HALF) | `yiai_circuit_breaker_state{module="services.database.data_service"}` | 0 CLOSED | ☐ | ☐ 必须回落 0 | ☐ |
| **HTTP 429 计数 (rate)** | `sum(rate(http_requests_total{project="yiai",status="429"}[1m]))` | 0 | ☐ qps | ☐ 0 | ☐ |
| **HTTP 503 计数 (rate)** | `sum(rate(http_requests_total{project="yiai",status="503"}[1m]))` | 0 | ☐ qps | ☐ 0 | ☐ |
| **Mongo 连接池 current** | `mongodb_connections_current{project="yiai"}` | <50 | ☐ | ☐ | ☐ 不应打满 |
| **Uvicorn 活跃线程 / backlog** | `uvicorn_requests_in_progress{project="yiai"}` | <10 | ☐ | ☐ | ☐ 不雪崩堆积 |
| **降级 fallback 命中 (stale cache)** | `increase(yiai_fallback_cache_served_total{module="data_service"}[10m])` | 0 | ☐ | ☐ | ☐ >0=降级生效 |
| **兄弟模块成功率 (e.g. ai chat)** | `sum(rate(rpc_requests_total{module="services.ai.chat_service",status=~"2.."}[1m])) / clamp_min(sum(rate(rpc_requests_total{module="services.ai.chat_service"}[1m])),1)` | ≥99% | ☐ | ☐ | ☐ 不被拖垮 (无雪崩) |

---

## 五、期望行为 — 实际结果 — 改进项

### 5.1 期望行为 (Expected, 来自 105-prd-熔断器)

1. **T+? 秒**：压测开始，注入的 1% 超时 + 正常请求混合 → 失败率达到 50% × 样本 ≥20 → **熔断器 OPEN**。
2. **OPEN 期间**：新请求**不进入下游 RPC**，直接返回 **HTTP 429** 并带响应头：`x-circuit-state: open` + `Retry-After: 30`；fallback 配置启用时部分命中返回 **503** + cache body。
3. **T+30s**：进入 HALF_OPEN → 允许 1 次探测请求 → 如果探测 200 → **CLOSED**；否则继续 OPEN。
4. **全过程**：Mongo 连接池 current 不打满；兄弟模块 chat 成功率不降；uvicorn backlog 不线性增长。

### 5.2 实际结果 (Actual, **演练当场填写**)

```markdown
[ ] 实际熔断器打开时机：T=______s（从压测 start 算）
[ ] 首次 429/503 出现：T=______s，比例=______%
[ ] HALF_OPEN 探测：成功/失败 ______，恢复 CLOSED 用时=______s
[ ] 兄弟模块成功率：被影响 Y/N，影响率=______%
[ ] Mongo 连接池峰值：______，是否耗尽 Y/N
[ ] 回滚开关：是否生效 Y/N；恢复方式=手动关闭特性 / 自动恢复 / kubectl rollout

异常记录：
1. ___________________________________________________
2. ___________________________________________________
```

### 5.3 改进项 (Action Items)

| # | 改进项 | 负责人 | 优先级 | 截止日期 | 关联 PRD/Issue |
|---|---|---|---|---|---|
| 1 | (示例) 熔断器指标 `yiai_circuit_breaker_state` 目前未暴露 → 需在 PRD-105 中增加 metrics 端点 | ☐ YiAi TL | P1 | 2026-10-14 | 105-prd-熔断器.md |
| 2 | (示例) 429 响应缺少 `x-circuit-state` 头 → YiVad 前端未识别导致未显示"稍后重试" | ☐ YiVad TL | P2 | 2026-10-21 | yivad 项目 |
| 3 | | ☐ | | | |
| 4 | | ☐ | | | |
| 5 | | ☐ | | | |

---

## 六、演练结束 Checklist

- [ ] **静默恢复**：删除 Alertmanager Silence `gameday=GD-YIAI-CB-017`
- [ ] **特性开关还原**：`FEATURE_CIRCUIT_BREAKER` 回到演练前值
- [ ] **数据留档**：`trigger_yiai_rpc_500concurrent.py` + Grafana 截图 + 上面表格填入 Git commit 到 `sre/incident-response/gameday-logs/2026-10-07-GD-017/`
- [ ] **事后复盘会议**：48h 内召集参与人完成 5-Why 根因 + 改进项 owner 指派
