---
doc_type: module
prd_task_id: "YA-09-42"
title: "YA-09-42: MongoDB 事务支持 — 多文档 ACID + 回滚 — 开发方案"
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
source_prd: "58-需求-MongoDB事务支持.md"
source_okr: [yiai-001]
---

# YA-09-42: MongoDB 事务支持 — 多文档 ACID + 回滚 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[58-需求-MongoDB事务支持.md](../../prds/2026-09/58-需求-MongoDB事务支持.md)
> 需求编号：YA-09-42 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

MongoDB 4.0+ 支持多文档事务（需 Replica Set）。封装 Motor 的 `session.with_transaction()` 简化事务使用。

```python
class Transaction:
    def __init__(self, db):
        self.db = db

    async def __aenter__(self):
        self.session = await self.db.client.start_session()
        return self.session

    async def __aexit__(self, *args):
        if args[0]:  # exception
            await self.session.abort_transaction()
        else:
            await self.session.commit_transaction()

async with Transaction(db) as session:
    await db.users.insert_one(doc, session=session)
    await db.audit_logs.insert_one(log, session=session)
```

### 约束

| 约束 | 说明 |
|------|------|
| 需 Replica Set | 单节点不支持事务 |
| 超时 60s | 长事务自动 abort |
| 跨集合 | 仅限同一数据库 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Transaction 上下文管理器 | 异常时自动回滚 | 0.5 |
| 2 | 集成到关键写操作 + 测试 | 用户+审计事务性写入 | 1.0 |

**合计：1.5d**。