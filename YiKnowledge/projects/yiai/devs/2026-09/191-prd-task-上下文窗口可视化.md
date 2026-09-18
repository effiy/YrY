---
doc_type: module
prd_task_id: "YA-09-138"
title: "YA-09-138: 上下文窗口可视化 — Token 用量实时展示 — 开发方案"
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
source_prd: "191-需求-上下文窗口可视化.md"
source_okr: [yiai-002]
---

# YA-09-138: 上下文窗口可视化 — Token 用量实时展示 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[191-需求-上下文窗口可视化.md](../../prds/2026-09/191-需求-上下文窗口可视化.md)
> 需求编号：YA-09-138 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

前端显示当前对话的 Token 用量进度条——系统提示 + 历史消息 + 当前消息各占多少，接近窗口上限时警告。

```python
async def token_usage(session_id: str) -> dict:
    messages = await get_session_messages(session_id)
    tokens = {"system": count(system_prompt), "history": sum(count(m["content"]) for m in messages[:-1]),
              "current": count(messages[-1]["content"]) if messages else 0}
    return {"tokens": tokens, "total": sum(tokens.values()), "limit": 8192,
            "usage_pct": round(sum(tokens.values()) / 8192 * 100)}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Token 计数 API | 实时返回各段用量 | 0.25 |
| 2 | 前端进度条 + 溢出警告 + 测试 | > 80% 黄色，> 95% 红色 | 0.25 |

**合计：0.5d**。