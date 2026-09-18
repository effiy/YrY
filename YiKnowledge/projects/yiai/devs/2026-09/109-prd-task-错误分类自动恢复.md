---
doc_type: module
prd_task_id: "YA-09-115"
title: "YA-09-115: 错误分类与自动恢复 — 5xx/4xx 差异化处理 — 开发方案"
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
source_prd: "109-需求-错误分类自动恢复.md"
source_okr: [yiai-001]
---

# YA-09-115: 错误分类与自动恢复 — 5xx/4xx 差异化处理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[109-需求-错误分类自动恢复.md](../../prds/2026-09/109-需求-错误分类自动恢复.md)
> 需求编号：YA-09-115 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
ERROR_CLASSIFICATION = {
    "TRANSIENT": [  # 可重试
        "ServerSelectionTimeoutError", "ConnectionResetError", "TimeoutError",
    ],
    "PERMANENT": [  # 不可重试
        "ValidationError", "AuthenticationError", "PermissionError",
    ],
    "DEGRADED": [   # 降级可用
        "OllamaConnectionError", "RedisConnectionError",
    ],
}

def classify_and_recover(error: Exception) -> str:
    name = type(error).__name__
    if name in TRANSIENT: return "RETRY"
    if name in PERMANENT: return "FAIL"
    if name in DEGRADED: return "DEGRADE"
    return "FAIL"

async def handle_error(error: Exception):
    action = classify_and_recover(error)
    if action == "RETRY":
        await asyncio.sleep(1)
        return await retry()
    if action == "DEGRADE":
        logger.warning(f"Degraded: {error}")
        return degraded_response()
    raise error
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 错误分类 + 恢复策略 | MongoDB 瞬断自动重试 | 0.25 |
| 2 | 集成到 RPC 异常处理器 + 测试 | 4xx 不重试，5xx 瞬断重试 | 0.25 |

**合计：0.5d**。