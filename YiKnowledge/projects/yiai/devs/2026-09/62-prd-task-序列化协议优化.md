---
doc_type: module
prd_task_id: "YA-09-108"
title: "YA-09-108: 序列化协议优化 — MessagePack 替代 JSON — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 0.5
source_prd: "62-需求-序列化协议优化.md"
source_okr: [yiai-001]
---

# YA-09-108: 序列化协议优化 — MessagePack 替代 JSON — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[62-需求-序列化协议优化.md](../../prds/2026-09/62-需求-序列化协议优化.md)
> 需求编号：YA-09-108 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

RPC 响应使用 MessagePack 替代 JSON——二进制格式，体积减少 30-50%，解析更快。通过 `Accept` 头协商格式。

```python
import msgpack

@app.middleware("http")
async def format_negotiation(request, call_next):
    response = await call_next(request)
    if "application/x-msgpack" in request.headers.get("Accept", ""):
        body = json.loads(response.body)
        return Response(content=msgpack.packb(body), media_type="application/x-msgpack")
    return response
```

### 对比

| 维度 | JSON | MessagePack |
|------|------|------------|
| 体积 (5KB doc) | 5KB | 3KB (-40%) |
| 解析速度 | 基准 | 1.5-3x |
| 可读性 | 是 | 否 (二进制) |
| 浏览器兼容 | 原生 | 需 JS 库 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | msgpack 中间件 + Accept 协商 | `Accept: msgpack` → 二进制响应 | 0.25 |
| 2 | 前端集成 + 测试 | JSON/msgpack 双格式支持 | 0.25 |

**合计：0.5d**。