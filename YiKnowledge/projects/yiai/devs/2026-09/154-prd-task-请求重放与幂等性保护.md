---
doc_type: module
prd_task_id: "YA-09-48"
title: "YA-09-48: 请求幂等性保护 — Idempotency-Key + 缓存结果 — 开发方案"
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
source_prd: "154-需求-请求重放与幂等性保护.md"
source_okr: [yiai-001]
---

# YA-09-48: 请求幂等性保护 — Idempotency-Key + 缓存结果 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[154-需求-请求重放与幂等性保护.md](../../prds/2026-09/154-需求-请求重放与幂等性保护.md)
> 需求编号：YA-09-48 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

对写操作（`create_document`、`/write-file`）支持幂等键——客户端传 `Idempotency-Key` 头，服务端缓存首次结果，重放请求直接返回缓存结果。

```python
IDEMPOTENT_METHODS = {"POST", "PUT", "PATCH"}

@app.middleware("http")
async def idempotency_middleware(request, call_next):
    if request.method not in IDEMPOTENT_METHODS:
        return await call_next(request)

    key = request.headers.get("Idempotency-Key")
    if not key:
        return await call_next(request)

    # 检查缓存
    cached = await cache.get(f"idem:{key}")
    if cached:
        return JSONResponse(content=cached, status_code=cached["_status"])

    response = await call_next(request)
    # 缓存结果 (TTL 24h)
    body = json.loads(response.body)
    body["_status"] = response.status_code
    await cache.set(f"idem:{key}", body, ttl=86400)

    return response
```

### 并发保护

同一 key 的并发请求：第一个请求执行，其余等待结果。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Idempotency-Key 中间件 | 相同 key 重复请求返回缓存 | 0.5 |
| 2 | 并发保护 + TTL 清理 + 测试 | 并发请求不重复执行 | 0.5 |

**合计：1.0d**。