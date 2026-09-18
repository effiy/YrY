---
doc_type: module
prd_task_id: "YA-09-106"
title: "YA-09-106: 资源配额隔离 — 多项目公平分配 — 开发方案"
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
source_prd: "73-需求-资源配额隔离.md"
source_okr: [yiai-001]
---

# YA-09-106: 资源配额隔离 — 多项目公平分配 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[73-需求-资源配额隔离.md](../../prds/2026-09/73-需求-资源配额隔离.md)
> 需求编号：YA-09-106 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

4 个项目共享 YiAi 后端，需要配额隔离防止单一项目占用全部资源。

```python
@dataclass
class ProjectQuota:
    max_rps: int          # 最大请求速率
    max_concurrent: int   # 最大并发
    max_tokens_per_hour: int  # LLM Token 配额
    max_storage_mb: int   # 存储配额

QUOTAS = {
    "yivad": ProjectQuota(200, 20, 1_000_000, 500),
    "yipet": ProjectQuota(100, 10, 500_000, 200),
    "yiai":   ProjectQuota(50,  5,  200_000, 100),
    "default": ProjectQuota(50, 5, 100_000, 100),
}

async def check_quota(project: str, resource: str, amount: int = 1) -> bool:
    quota = QUOTAS.get(project, QUOTAS["default"])
    usage = await get_usage(project, resource)
    return usage + amount <= getattr(quota, resource)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 配额定义 + 用量追踪 (Redis) | 超出配额返回 429 + 项目名 | 0.5 |
| 2 | Dashboard 配额面板 + 测试 | YiVad 可查看各项目配额 | 0.5 |

**合计：1.0d**。