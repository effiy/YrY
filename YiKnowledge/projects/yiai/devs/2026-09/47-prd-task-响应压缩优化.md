---
doc_type: module
prd_task_id: "YA-09-73"
title: "YA-09-73: 响应压缩优化 — Gzip/Brotli 中间件 — 开发方案"
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
source_prd: "47-需求-响应压缩优化.md"
source_okr: [yiai-001]
---

# YA-09-73: 响应压缩优化 — Gzip/Brotli 中间件 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[47-需求-响应压缩优化.md](../../prds/2026-09/47-需求-响应压缩优化.md)
> 需求编号：YA-09-73 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

FastAPI 不内置响应压缩。集成 `GZipMiddleware` 或 `brotli-asgi` 中间件——JSON 响应体积减少 70-90%。

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1024)  # 仅压缩 > 1KB

# Brotli（更高压缩比）
from brotli_asgi import BrotliMiddleware
app.add_middleware(BrotliMiddleware, quality=6)
```

### 压缩策略

| Content-Type | 压缩 | 算法 |
|-------------|------|------|
| `application/json` | 是 | brotli (优先) → gzip |
| `text/html` | 是 | brotli → gzip |
| `image/*` | 否 | 已压缩 |
| `text/event-stream` (SSE) | 否 | 逐帧压缩破坏流式性 |

```python
GZipMiddleware(app, minimum_size=1024, compresslevel=6, exclude_paths=["/sse", "/stream"])
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | GZipMiddleware + Brotli 集成 | JSON 响应体积 -80% | 0.25 |
| 2 | SSE 排除 + 测试 | SSE 流式不受影响 | 0.25 |

**合计：0.5d**。