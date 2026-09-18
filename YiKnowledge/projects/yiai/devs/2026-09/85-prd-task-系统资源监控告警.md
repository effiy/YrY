---
doc_type: module
prd_task_id: "YA-09-65"
title: "YA-09-65: 系统资源监控 — psutil + Prometheus + 趋势告警 — 开发方案"
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
source_prd: "85-需求-系统资源监控告警.md"
source_okr: [yiai-001]
---

# YA-09-65: 系统资源监控 — psutil + Prometheus + 趋势告警 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[85-需求-系统资源监控告警.md](../../prds/2026-09/85-需求-系统资源监控告警.md)
> 需求编号：YA-09-65 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

通过 `psutil` 采集系统级指标，暴露为 Prometheus gauge，集成到 [YA-09-39 监控告警体系](./106-prd-task-监控与告警体系.md)。

```python
import psutil
from prometheus_client import Gauge

cpu_usage = Gauge("system_cpu_percent", "CPU 使用率")
mem_usage = Gauge("system_memory_bytes", "内存使用", ["type"])  # used/available/total
disk_usage = Gauge("system_disk_bytes", "磁盘使用", ["mountpoint"])
net_io = Gauge("system_network_bytes", "网络 IO", ["direction"])  # rx/tx

async def collect_system_metrics():
    cpu_usage.set(psutil.cpu_percent(interval=1))
    mem = psutil.virtual_memory()
    mem_usage.labels("used").set(mem.used)
    mem_usage.labels("available").set(mem.available)

    for part in psutil.disk_partitions():
        usage = psutil.disk_usage(part.mountpoint)
        disk_usage.labels(part.mountpoint).set(usage.used)
```

### 告警阈值

| 指标 | 警告 | 紧急 |
|------|------|------|
| CPU | > 80% (5min) | > 95% |
| 内存 | > 80% | > 90% |
| 磁盘 | > 85% | > 95% |
| FD 数 | > 10000 | > 50000 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | psutil 指标采集 + Prometheus 暴露 | `/metrics` 含系统指标 | 0.25 |
| 2 | 告警规则 + 测试 | CPU > 80% 触发企微通知 | 0.25 |

**合计：0.5d**。