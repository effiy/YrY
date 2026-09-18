---
doc_type: module
prd_task_id: "YA-09-53"
title: "YA-09-53: Admin API 安全加固 — 独立 Token + 审计 + IP 白名单 — 开发方案"
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
source_prd: "54-需求-AdminAPI安全加固.md"
source_okr: [yiai-001]
---

# YA-09-53: Admin API 安全加固 — 独立 Token + 审计 + IP 白名单 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[54-需求-AdminAPI安全加固.md](../../prds/2026-09/54-需求-AdminAPI安全加固.md)
> 需求编号：YA-09-53 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

运维端点（`/maintenance/*`、`/backup/*`、`/system/*`）使用独立 Admin Token，与普通用户 JWT 隔离。所有 Admin 操作强制审计。

```python
ADMIN_PATHS = {"/maintenance", "/backup", "/system"}

@app.middleware("http")
async def admin_auth_middleware(request, call_next):
    if not any(request.url.path.startswith(p) for p in ADMIN_PATHS):
        return await call_next(request)

    token = request.headers.get("X-Admin-Token")
    if not token or token != settings.admin_token:
        return JSONResponse(status_code=403, content={"error": "Admin access required"})

    # 审计
    await audit_logger.record_admin(request)

    return await call_next(request)
```

### 防护层

| 层 | 措施 |
|----|------|
| Token | 独立 `X-Admin-Token`（非用户 JWT） |
| IP 白名单 | 仅允许内网 IP 段 |
| 审计 | 所有 Admin 操作记录到 `admin_audit` |
| 限流 | Admin 端点 10/min（更严格） |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Admin 中间件 + Token | 无 Admin Token → 403 | 0.5 |
| 2 | IP 白名单 + 审计 + 测试 | 非白名单 IP → 403 | 0.5 |

**合计：1.0d**。