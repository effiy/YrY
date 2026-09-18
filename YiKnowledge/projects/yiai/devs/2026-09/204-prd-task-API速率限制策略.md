---
doc_type: module
prd_task_id: "YA-09-70"
title: "YA-09-70: 高级限流 — per-user/per-endpoint + 响应头 + 分析面板 — 开发方案"
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
source_prd: "204-需求-API速率限制策略.md"
source_okr: [yiai-002]
---

# YA-09-70: 高级限流 — per-user/per-endpoint + 响应头 + 分析面板 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[204-需求-API速率限制策略.md](../../prds/2026-09/204-需求-API速率限制策略.md)
> 需求编号：YA-09-70 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-09-08 令牌桶](./16-prd-task-API限流与并发控制.md) 和 [YA-09-21 滑动窗口](./76-prd-task-滑动窗口限流.md) 基础上，增加多维度限流和标准响应头。

```python
@app.middleware("http")
async def rate_limit_middleware(request, call_next):
    user = request.headers.get("X-Token", "anonymous")
    endpoint = request.url.path
    key = f"{user}:{endpoint}"

    limiter = get_limiter(endpoint)  # per-endpoint 配置
    allowed, reset_at, remaining = limiter.check(key)

    if not allowed:
        return JSONResponse(status_code=429, headers={
            "X-RateLimit-Limit": str(limiter.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(int(reset_at)),
            "Retry-After": str(int(reset_at - time.time())),
        }, content={"code": 1003, "message": "请求过于频繁，请稍后重试"})

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limiter.limit)
    response.headers["X-RateLimit-Remaining"] = str(remaining)
    response.headers["X-RateLimit-Reset"] = str(int(reset_at))
    return response
```

### 多维度配额

| 维度 | 示例 | 配置 |
|------|------|------|
| per-IP | 匿名请求 | 100/min |
| per-User | `X-Token` | 1000/min |
| per-Endpoint | `/auth/login` | 10/min |
| per-User+Endpoint | `user123:/chat` | 30/min |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | per-user/per-endpoint 限流 | 不同维度独立计数 | 0.5 |
| 2 | X-RateLimit-* 头 + 分析面板 + 测试 | 前端可展示剩余配额 | 0.5 |

**合计：1.0d**。