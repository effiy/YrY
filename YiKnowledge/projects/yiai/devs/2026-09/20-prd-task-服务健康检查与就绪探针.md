---
doc_type: module
prd_task_id: "YA-09-12"
title: "YA-09-12: 服务健康检查与就绪探针 — K8s 部署可观测性 — 开发方案"
status: 需求已编写
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "20-需求-服务健康检查与就绪探针.md"
source_okr: [yiai-001]
---

# YA-09-12: 服务健康检查与就绪探针 — K8s 部署可观测性 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[20-需求-服务健康检查与就绪探针.md](../../prds/2026-09/20-需求-服务健康检查与就绪探针.md)
> 需求编号：YA-09-12 · 优先级：P1 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

提供 K8s 标准的 liveness/readiness/startup 探针端点。

### 端点设计

| 端点 | 用途 | 检查内容 | K8s 配置 |
|------|------|---------|---------|
| `/health/live` | Liveness | 进程存活 | `initialDelaySeconds: 5, periodSeconds: 10` |
| `/health/ready` | Readiness | MongoDB + Ollama 连通 | `initialDelaySeconds: 10, periodSeconds: 5` |
| `/health/startup` | Startup | 所有依赖就绪 | `failureThreshold: 30, periodSeconds: 10` |

### Readiness 检查

```python
@router.get("/health/ready")
async def readiness():
    checks = {
        "mongodb": await db.ping(),
        "ollama": await check_ollama(),
    }
    healthy = all(checks.values())
    return {"status": "ready" if healthy else "not_ready", "checks": checks}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | `/health/live` + `/health/ready` | K8s 探针正常调度 | 0.5 |
| 2 | `/health/startup` + 依赖检查 | 所有依赖就绪后才接收流量 | 0.25 |
| 3 | Metrics 端点 `/health/metrics` | Prometheus 可抓取 | 0.25 |

**合计：1.0d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 关联：[YA-08-07 Dashboard](../2026-08/07-prd-task-Dashboard健康聚合API.md)
- 下游：[K8s 部署配置](../../../YiAi/)