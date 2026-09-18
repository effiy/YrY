---
doc_type: module
prd_task_id: "YA-09-135"
title: "YA-09-135: 个性化记忆系统 — 长期用户记忆 + 衰减 — 开发方案"
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
source_prd: "185-需求-个性化记忆系统.md"
source_okr: [yiai-001]
---

# YA-09-135: 个性化记忆系统 — 长期用户记忆 + 衰减 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[185-需求-个性化记忆系统.md](../../prds/2026-09/185-需求-个性化记忆系统.md)
> 需求编号：YA-09-135 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

跨会话记住用户偏好（名字、角色、常用工具）。记忆按重要性和时间衰减，自动注入到系统提示词。

```python
class UserMemory:
    async def remember(self, user_id: str, key: str, value: str, importance: float = 1.0):
        await db.memories.update_one({"user_id": user_id, "key": key},
            {"$set": {"value": value, "importance": importance, "last_access": now}}, upsert=True)

    async def recall(self, user_id: str, top_k: int = 5) -> str:
        memories = await db.memories.find({"user_id": user_id}).sort([("importance", -1), ("last_access", -1)]).limit(top_k).to_list(None)
        return "\n".join(f"- {m['key']}: {m['value']}" for m in memories)

    async def decay(self):  # 定期降低未访问记忆的重要性
        await db.memories.update_many({"last_access": {"$lt": now - timedelta(days=30)}}, {"$mul": {"importance": 0.9}})
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 记忆 CRUD + 自动注入 | 新会话加载用户历史偏好 | 0.25 |
| 2 | 衰减 + 隐私控制 + 测试 | 30 天未访问记忆降权 | 0.25 |

**合计：0.5d**。