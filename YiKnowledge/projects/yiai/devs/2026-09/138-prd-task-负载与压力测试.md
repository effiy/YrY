---
doc_type: module
prd_task_id: "YA-09-80"
title: "YA-09-80: 负载与压力测试 — Locust + CI 回归检测 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "138-需求-负载与压力测试.md"
source_okr: [yiai-001]
---

# YA-09-80: 负载与压力测试 — Locust + CI 回归检测 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[138-需求-负载与压力测试.md](../../prds/2026-09/138-需求-负载与压力测试.md)
> 需求编号：YA-09-80 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
# locustfile.py
from locust import HttpUser, task, between

class YiAiUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def rpc_query(self):
        self.client.post("/", json={"module_name": "services.database.data_service", "method_name": "query_documents", "parameters": {"cname": "projects", "pageSize": 20}})

    @task(1)
    def chat_stream(self):
        self.client.post("/", json={"module_name": "services.ai.chat_service", "method_name": "chat", "parameters": {"messages": [{"role": "user", "content": "Hello"}], "stream": False}})
```

### 测试场景

| 场景 | 用户数 | 持续时间 | 目标 |
|------|--------|---------|------|
| 基准 | 50 | 5min | P95 < 500ms |
| 负载 | 200 | 15min | P95 < 2s |
| 压力 | 500 | 5min | 错误率 < 5% |
| 浸泡 | 100 | 2h | 无内存泄漏 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Locust 脚本 + 4 场景 | 压力测试报告 | 1.0 |
| 2 | CI 集成 + 性能回归 + 测试 | PR 中性能劣化被检测 | 0.5 |

**合计：1.5d**。