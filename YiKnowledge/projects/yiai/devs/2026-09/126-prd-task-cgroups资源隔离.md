---
doc_type: module
prd_task_id: "YA-09-117"
title: "YA-09-117: cgroups 资源隔离 — CPU/内存硬限制 — 开发方案"
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
source_prd: "126-需求-cgroups资源隔离.md"
source_okr: [yiai-001]
---

# YA-09-117: cgroups 资源隔离 — CPU/内存硬限制 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[126-需求-cgroups资源隔离.md](../../prds/2026-09/126-需求-cgroups资源隔离.md)
> 需求编号：YA-09-117 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

Docker 通过 cgroups v2 限制容器资源。为 YiAi 容器配置 CPU/内存硬限制，防止 OOM 影响宿主机。

```yaml
# docker-compose.yml
services:
  yiai:
    deploy:
      resources:
        limits: { cpus: "2.0", memory: "2G" }
        reservations: { cpus: "1.0", memory: "1G" }
```

### 限制策略

| 资源 | 软限制 (reservations) | 硬限制 (limits) | OOM 行为 |
|------|---------------------|----------------|---------|
| CPU | 1.0 core | 2.0 cores | 降频，不杀 |
| 内存 | 1GB | 2GB | > 2GB → OOM Kill |

```python
# 应用层内存监控
import psutil
async def memory_watchdog():
    while True:
        mem = psutil.Process().memory_info().rss / 1024**3
        if mem > 1.8:  # 接近硬限制
            gc.collect()
            logger.warning(f"Memory high: {mem:.1f}GB")
        await asyncio.sleep(10)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | docker-compose resources 配置 | 容器不超限制 | 0.25 |
| 2 | 内存 watchdog + 测试 | 接近限制时主动 GC | 0.25 |

**合计：0.5d**。