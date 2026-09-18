---
doc_type: module
prd_task_id: "YA-09-57"
title: "YA-09-57: ETag 缓存验证 — 304 响应 + 条件请求 — 开发方案"
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
source_prd: "53-需求-ETag缓存验证.md"
source_okr: [yiai-001]
---

# YA-09-57: ETag 缓存验证 — 304 响应 + 条件请求 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[53-需求-ETag缓存验证.md](../../prds/2026-09/53-需求-ETag缓存验证.md)
> 需求编号：YA-09-57 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

为静态资源和大文件读取添加 ETag 支持——内容未变化时返回 304，减少带宽消耗。

```python
import hashlib
from fastapi import Request, Response

@app.get("/read-file")
async def read_file(target_file: str, request: Request):
    content = await file_service.read(target_file)
    etag = f'"{hashlib.md5(content).hexdigest()}"'

    if request.headers.get("If-None-Match") == etag:
        return Response(status_code=304)

    return Response(content=content, headers={"ETag": etag, "Cache-Control": "max-age=3600"})
```

### 适用端点

| 端点 | 缓存策略 |
|------|---------|
| `/read-file` | ETag (内容哈希) |
| `/static/*` | ETag + `max-age=86400` |
| `/knowledge/tree` | ETag (mtime 哈希) |
| Dashboard API | `max-age=30` (短 TTL) |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ETag 中间件 | `If-None-Match` → 304 | 0.25 |
| 2 | 端点集成 + 测试 | 重复请求带宽降 80%+ | 0.25 |

**合计：0.5d**。