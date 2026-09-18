---
doc_type: module
prd_task_id: "YA-09-96"
title: "YA-09-96: CORS 安全增强 — 动态 Origin + 凭证管理 — 开发方案"
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
source_prd: "49-需求-CORS安全策略增强.md"
source_okr: [yiai-001]
---

# YA-09-96: CORS 安全增强 — 动态 Origin + 凭证管理 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[49-需求-CORS安全策略增强.md](../../prds/2026-09/49-需求-CORS安全策略增强.md)
> 需求编号：YA-09-96 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 CORS 白名单硬编码在 `config.yaml`。升级为数据库驱动的动态白名单，Admin 页面可管理。

```python
class DynamicCORS:
    async def get_origins(self) -> list[str]:
        origins = await db.cors_origins.find({"active": True}).to_list(None)
        return [o["origin"] for o in origins]

    def validate(self, origin: str, allowed: list[str]) -> bool:
        if "*" in allowed: return False  # 禁止通配符+凭证
        for pattern in allowed:
            if fnmatch.fnmatch(origin, pattern): return True
        return False
```

### 安全约束

| 约束 | 说明 |
|------|------|
| 禁止 `*` | 生产环境必须指定具体 Origin |
| 禁止 `null` | 防止本地文件攻击 |
| HTTPS 优先 | 生产环境仅允许 HTTPS Origin |
| 凭证限制 | `Access-Control-Allow-Credentials` 仅对白名单 Origin |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 动态 Origin + Admin 管理 | 白名单热更新 | 0.25 |
| 2 | 安全策略验证 + 测试 | `*` 被拒绝 | 0.25 |

**合计：0.5d**。