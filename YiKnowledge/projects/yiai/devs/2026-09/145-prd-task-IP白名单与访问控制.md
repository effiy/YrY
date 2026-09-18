---
doc_type: module
prd_task_id: "YA-09-84"
title: "YA-09-84: IP 白名单与访问控制 — 中间件 + 动态黑名单 — 开发方案"
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
source_prd: "145-需求-IP白名单与访问控制.md"
source_okr: [yiai-001]
---

# YA-09-84: IP 白名单与访问控制 — 中间件 + 动态黑名单 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[145-需求-IP白名单与访问控制.md](../../prds/2026-09/145-需求-IP白名单与访问控制.md)
> 需求编号：YA-09-84 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
import ipaddress

class IPAccessControl:
    def __init__(self):
        self.whitelist: set[str] = set()      # 白名单 IP/CIDR
        self.blacklist: set[str] = set()      # 动态黑名单
        self.failures: dict[str, list[float]] = {}  # 失败计数

    def is_allowed(self, ip: str) -> bool:
        ip_obj = ipaddress.ip_address(ip)
        if ip in self.blacklist: return False
        if not self.whitelist: return True
        return any(ip_obj in ipaddress.ip_network(cidr) for cidr in self.whitelist)

    def record_failure(self, ip: str):
        now = time.time()
        self.failures.setdefault(ip, []).append(now)
        recent = [t for t in self.failures[ip] if now - t < 60]
        if len(recent) >= 10:  # 1 分钟内 10 次失败 → 加入黑名单
            self.blacklist.add(ip)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | IP 白名单/黑名单中间件 | 非白名单 IP 被拒绝 | 0.25 |
| 2 | 动态黑名单 + 自动过期 + 测试 | 恶意 IP 自动封禁 | 0.25 |

**合计：0.5d**。