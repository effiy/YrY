---
doc_type: module
prd_task_id: "YA-09-88"
title: "YA-09-88: 按端点差异化请求体限制 — 细粒度 BodySize — 开发方案"
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
source_prd: "133-需求-请求大小按端点差异化.md"
source_okr: [yiai-001]
---

# YA-09-88: 按端点差异化请求体限制 — 细粒度 BodySize — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[133-需求-请求大小按端点差异化.md](../../prds/2026-09/133-需求-请求大小按端点差异化.md)
> 需求编号：YA-09-88 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 `BodySizeLimitMiddleware` 使用全局统一限制。按端点设置不同上限——文件上传 50MB、RPC 5MB、登录 1KB。

```python
ENDPOINT_LIMITS = {
    "/upload-image-to-oss": 50 * 1024 * 1024,  # 50MB
    "/write-file": 10 * 1024 * 1024,            # 10MB
    "POST /": 5 * 1024 * 1024,                  # RPC 5MB
    "/auth/login": 1024,                         # 1KB
    "DEFAULT": 1 * 1024 * 1024,                 # 1MB
}

class PerEndpointBodySizeMiddleware:
    async def __call__(self, request, call_next):
        limit = ENDPOINT_LIMITS.get(request.url.path, ENDPOINT_LIMITS["DEFAULT"])
        body = await request.body()
        if len(body) > limit:
            return JSONResponse(status_code=413, content={"error": f"Body too large. Max {limit} bytes"})
        return await call_next(request)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 端点级 BodySize 配置 | 超大文件上传被拒绝 | 0.25 |
| 2 | 413 错误友好提示 + 测试 | 前端收到明确限值信息 | 0.25 |

**合计：0.5d**。