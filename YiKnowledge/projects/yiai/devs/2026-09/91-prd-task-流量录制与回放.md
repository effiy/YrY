---
doc_type: module
prd_task_id: "YA-09-58"
title: "YA-09-58: 流量录制与回放 — 生产流量镜像 → 测试压测 — 开发方案"
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
source_prd: "91-需求-流量录制与回放.md"
source_okr: [yiai-001]
---

# YA-09-58: 流量录制与回放 — 生产流量镜像 → 测试压测 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[91-需求-流量录制与回放.md](../../prds/2026-09/91-需求-流量录制与回放.md)
> 需求编号：YA-09-58 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

中间件层录制生产流量（脱敏后），测试环境回放进行压力测试和回归验证。

```python
class TrafficRecorder:
    def __init__(self, sample_rate: float = 0.01):
        self.sample_rate = sample_rate
        self.records: list[dict] = []

    async def record(self, request, response):
        if random.random() > self.sample_rate:
            return
        self.records.append({
            "method": request.method,
            "path": request.url.path,
            "headers": dict(request.headers),
            "body": await sanitize_body(request),
            "status": response.status_code,
            "duration_ms": response.duration_ms,
        })

    def export(self, path: str):
        with open(path, "w") as f:
            json.dump(self.records, f, indent=2)
```

### 回放

```python
async def replay(records: list[dict], base_url: str, concurrency: int = 10):
    sem = asyncio.Semaphore(concurrency)
    async def do(rec):
        async with sem:
            start = time.monotonic()
            resp = await client.request(rec["method"], f"{base_url}{rec['path']}", json=rec["body"])
            return {"expected_status": rec["status"], "actual_status": resp.status_code, "duration": time.monotonic() - start}
    return await asyncio.gather(*[do(r) for r in records])
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 录制中间件 | 生产流量采样写入文件 | 0.5 |
| 2 | 回放引擎 + 报告 + 测试 | 测试环境回放 1000 条请求 | 0.5 |

**合计：1.0d**。