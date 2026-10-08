---
title: 138-基线-API并发与RAG延迟
tags:
  - perfbaseline
  - stride
  - threat
  - security
  - yiai
  - baseline
  - performance
  - api
  - rag
category: projects/yiai/tests/2026-09
created: 2026-10-07
updated: 2026-10-07
source: internal
type: baseline / analysis
status: stable
lifecycle: active
review_cycle: quarterly
roles:
  - sre
  - engineer
  - security
benefit: 建立 YiAi API 并发与 RAG 检索延迟的量化基线，保障生产环境在高负载下的 SLA 承诺与用户体验一致性。
acceptance_criteria:
  - API p95 延迟稳定低于 800ms，RAG 检索 p99 低于 3s，连续 3 轮压测错误率均 < 1%
  - wrk/ab/httpx 四档并发脚本可重复执行，结果记录表与基线快照可跨环境对比复现
  - mongostat 连接池与 Motor pool_size 观测项覆盖完整，回归脚本在 CI 中可一键触发
related:
  - ../../prds/2026-09/138-prd-负载与压力测试.md
  - ../../prds/2026-09/06-prd-数据层.md
  - ../../prds/2026-09/09-prd-审计日志.md
  - ../../prds/2026-09/105-prd-熔断器.md
  - ../../bugs/2026-09/RAG/0001-RAG-VectorStoreIndex-insert-documents方法不存在.md
  - ../../bugs/2026-09/搜索/0001-搜索-空查询未做防护导致全表扫描.md
---

## 一、环境说明表

| 维度 | 取值 | 备注 |
| --- | --- | --- |
| 部署环境 | staging (k8s 单节点) | 与 prod 同构 2C4G × 3 |
| YiAi 版本 | v0.9.2-rc3 | commit: a1f3e8d |
| MongoDB | 6.0.8 replica set (1 primary + 2 secondary) | Motor 驱动 3.3.2 |
| LLM Provider | OpenAI gpt-4o-mini + 本地 Embedding | RAG 向量库 Milvus 2.3 |
| 样本集 | projects 集合 5 篇真实文档 / 30 条历史查询 | 文档平均长度 1.2KB |
| 观测窗口 | 15min 稳态 + 5min 峰值 | 预热 30s 后开始采集 |

## 二、基线目标表 P50 / P95 / P99

| 指标 | 单位 | P50 | P95 | P99 | 判定 |
| --- | --- | --- | --- | --- | --- |
| /api/v1/chat RPC 查询 | ms | 220 | 650 | **< 800** | ✅ 目标 |
| /api/v1/projects 查询 5 文档 | ms | 95 | 380 | 520 | ✅ 目标 |
| RAG 端到端检索+生成 | ms | 950 | 2100 | **< 3000** | ✅ 目标 |
| RAG faithfulness | % | 0.91 | — | — | ✅ ≥ 0.88 |
| RAG answer_relevancy | % | 0.87 | — | — | ✅ ≥ 0.82 |
| 全局错误率 | % | — | — | **< 1.0** | ✅ 目标 |

## 三、执行命令脚本块

### 3.1 wrk 并发 50 / 100 / 300 / 500

```bash
# 并发 50
wrk -t4 -c50 -d300s -s scripts/projects_query.lua \
  --header "Authorization: Bearer $TOKEN" \
  http://yiai-staging.internal:8787/api/v1/projects

# 并发 100
wrk -t6 -c100 -d300s -s scripts/chat_rpc.lua \
  --header "Authorization: Bearer $TOKEN" \
  --latency http://yiai-staging.internal:8787/api/v1/chat

# 并发 300
ab -n 9000 -c 300 -H "Authorization: Bearer $TOKEN" \
  -p payload/rag_query.json -T application/json \
  http://yiai-staging.internal:8787/api/v1/rag/query

# 并发 500
python - <<'PY'
import asyncio, httpx, time
sem = asyncio.Semaphore(500)
async def one(c):
    async with sem, c as client:
        r = await client.post("http://yiai-staging.internal:8787/api/v1/chat",
            headers={"Authorization": f"Bearer {TOKEN}"},
            json={"query":"projects 最近 5 篇文档","use_rag":True})
        return r.status_code, r.elapsed
async def main():
    async with httpx.AsyncClient(timeout=10) as c:
        t=time.time()
        res=await asyncio.gather(*[one(c) for _ in range(15000)])
        print("qps=", len(res)/(time.time()-t), "err=", sum(1 for s,_ in res if s>=400))
asyncio.run(main())
PY
```

### 3.2 RPC / projects 5 文档调用片段

```python
# projects 查询 5 篇文档
from yiai.clients.rpc import YiAiRpcClient
cli = YiAiRpcClient(endpoint="http://yiai-staging.internal:8787")
docs = await cli.list_projects(limit=5, fields=["id", "title", "summary", "updated_at"])

# RAG 质量评估（faithfulness / answer_relevancy）
from deepeval.metrics import FaithfulnessMetric, AnswerRelevancyMetric
fm = FaithfulnessMetric(threshold=0.88)
arm = AnswerRelevancyMetric(threshold=0.82)
for case in rag_cases:
    fm.measure(case.output, case.context)
    arm.measure(case.output, case.input)
```

## 四、结果记录表

| 轮次 | 并发 | 时长 | QPS | API p50/p95/p99 (ms) | RAG p50/p95/p99 (ms) | 错误率 | faithfulness | answer_relevancy |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-18 #1 | 50 | 5m | 218 | 180 / 510 / 640 | 820 / 1800 / 2450 | 0.21% | 0.92 | 0.88 |
| 2026-09-18 #2 | 100 | 5m | 396 | 240 / 620 / 760 | 960 / 2050 / 2800 | 0.44% | 0.91 | 0.87 |
| 2026-09-18 #3 | 300 | 5m | 812 | 310 / 740 / **890** | 1120 / 2400 / 3120 | **1.12%** | 0.90 | 0.86 |
| 2026-09-18 #4 | 500 | 5m | 1024 | 405 / 910 / **1240** | 1450 / 2860 / **3780** | **2.38%** | 0.89 | 0.84 |

### MongoDB 连接池与 Motor 观测

```bash
# 1) mongostat 全局连接池
mongostat --uri="mongodb://yiai-staging-rs0/?replicaSet=rs0" \
  -u admin -p $MONGOPASS --rowcount 0 1 | tee logs/mongostat_138.log

# 2) Motor pool_size 实时水位
python - <<'PY'
import asyncio, motor.motor_asyncio, time
cli = motor.motor_asyncio.AsyncIOMotorClient(
    "mongodb://yiai-staging-rs0/?replicaSet=rs0",
    maxPoolSize=200, minPoolSize=20)
async def top():
    while True:
        s = cli.topology_description
        pool = cli.delegate._topology._servers[next(iter(s._topology_id._replica_set_members))]
        print(time.strftime("%H:%M:%S"), "pool_size=", pool.pool.size,
              "in_use=", pool.pool.in_use, "idle=", pool.pool.idle,
              "waiters=", pool.pool.wait_queue_length)
        await asyncio.sleep(1)
asyncio.run(top())
PY

# 3) 当前活跃连接数
mongosh mongodb://admin:$MONGOPASS@yiai-staging-rs0/admin --eval \
  "db.currentOp(true).inprog.length + ' active / ' + db.serverStatus().connections.current + ' total'"

# 4) 慢查询 > 500ms
mongosh mongodb://admin:$MONGOPASS@yiai-staging-rs0/local --eval \
  "db.setProfilingLevel(1,{slowms:500}); db.system.profile.find({millis:{\$gt:500}}).sort({ts:-1}).limit(20)"
```

## 五、回归脚本

```bash
#!/usr/bin/env bash
# ci/regression_baseline_138.sh
set -euo pipefail
TARGET="${1:-http://yiai-staging.internal:8787}"
OUT="artifacts/baseline_138_$(date +%F_%H%M).json"

python scripts/run_wrk_suite.py --target "$TARGET" --load 50,100,300,500 \
  --token "$YIAI_TOKEN" --output "$OUT"

python scripts/rag_quality.py --target "$TARGET" --cases datasets/rag_v3.jsonl \
  --metrics faithfulness,answer_relevancy --append "$OUT"

python scripts/compare_baseline.py --current "$OUT" \
  --baseline snapshots/baseline_138_v20260918.json \
  --fail-on-regression p95:1.15 p99:1.20 error_rate:1.5
```

## 六、对比基线快照

| 快照版本 | 日期 | 并发 300 API p95 | 并发 300 RAG p99 | 300 错误率 | 备注 |
| --- | --- | --- | --- | --- | --- |
| v20260918 | 2026-09-18 | 740 ms | 3120 ms | 1.12% | 首次基线，未达标 |
| v20260925 | 2026-09-25 | **610 ms** | **2780 ms** | **0.68%** | Motor pool 优化 + RAG 缓存预热 |
| v20261002 | 2026-10-02 | 585 ms | 2640 ms | 0.52% | 熔断器 105-prd 合入后 |

## 七、优化建议

1. **并发 300+ 时 API p95 超 800ms**：Motor `maxPoolSize` 从 100 调至 200，同时为 projects 集合增加 `(owner, updated_at)` 复合索引，预期 p95 下降 15%~20%。
2. **RAG p99 > 3s**：Embedding 侧增加 64 维 LRU 缓存（命中率 ≥ 0.4），并将 rerank 阶段限制 Top-3 文档，可将 p99 压缩至 2.6s 以内。
3. **错误率随并发陡增**：在 `/api/v1/chat` 入口接入 105-prd 熔断器（并发阈值 420），并开启 SSE stream 异常捕获（参见 bugs/SSE/01），可将 500 并发错误率控制在 0.8% 以下。
