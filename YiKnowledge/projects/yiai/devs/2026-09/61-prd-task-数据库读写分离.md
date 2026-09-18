---
doc_type: module
prd_task_id: "YA-09-54"
title: "YA-09-54: 数据库读写分离 — 主从路由 + 读优先从库 — 开发方案"
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
source_prd: "61-需求-数据库读写分离.md"
source_okr: [yiai-001]
---

# YA-09-54: 数据库读写分离 — 主从路由 + 读优先从库 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[61-需求-数据库读写分离.md](../../prds/2026-09/61-需求-数据库读写分离.md)
> 需求编号：YA-09-54 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

MongoDB Replica Set 已部署时，写操作路由到 Primary，读操作优先路由到 Secondary，分散主库压力。

```python
from pymongo import ReadPreference

class ReadWriteRouter:
    def __init__(self, client):
        self.client = client

    @property
    def write_db(self):
        return self.client.get_database(read_preference=ReadPreference.PRIMARY)

    @property
    def read_db(self):
        return self.client.get_database(read_preference=ReadPreference.SECONDARY_PREFERRED)

# 写操作
await rw.write_db["users"].insert_one(doc)
# 读操作
docs = await rw.read_db["users"].find(filter).to_list(None)
```

### 路由规则

| 操作 | 路由 | 原因 |
|------|------|------|
| `insert_one/update_one/delete_one` | PRIMARY | 必须写主库 |
| `find` (实时性要求高) | PRIMARY | 避免复制延迟 |
| `find` (Dashboard 统计) | SECONDARY_PREFERRED | 可容忍延迟 |
| `aggregate` (报告生成) | SECONDARY | 减轻主库压力 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ReadWriteRouter 实现 | 读写路由到不同节点 | 0.5 |
| 2 | 集成到 repository + Dashboard + 测试 | 主库 QPS 下降 | 0.5 |

**合计：1.0d**。