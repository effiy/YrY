---
doc_type: module
prd_task_id: "YA-09-46"
title: "YA-09-46: API 版本化与废弃管理 — Deprecation 头 + 迁移指引 — 开发方案"
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
source_prd: "82-需求-API废弃迁移指引.md"
source_okr: [yiai-002]
---

# YA-09-46: API 版本化与废弃管理 — Deprecation 头 + 迁移指引 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[82-需求-API废弃迁移指引.md](../../prds/2026-09/82-需求-API废弃迁移指引.md)
> 需求编号：YA-09-46 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

API 变更需平滑过渡——通过 `Deprecation` 和 `Sunset` HTTP 头通知客户端，并记录废弃时间线。

```python
from datetime import datetime, timedelta
from functools import wraps

def deprecated(since: str, sunset: str, alternative: str):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            response = await fn(*args, **kwargs)
            response.headers["Deprecation"] = "true"
            response.headers["Sunset"] = sunset
            response.headers["Link"] = f'<{alternative}>; rel="successor-version"'
            return response
        return wrapper
    return decorator
```

### 版本策略

| 阶段 | 时间 | 行为 |
|------|------|------|
| Active | — | 正常服务 |
| Deprecated | +0 天 | 响应头标记 + WARN 日志 |
| Sunset | +90 天 | 返回 410 Gone |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `@deprecated` 装饰器 + 响应头 | 废弃端点返回 Deprecation 头 | 0.5 |
| 2 | 迁移指引文档 + CI 检查 + 测试 | 废弃 90 天后 CI 提醒移除 | 0.5 |

**合计：1.0d**。