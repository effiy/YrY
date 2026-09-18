---
doc_type: module
prd_task_id: "YA-09-152"
title: "YA-09-152: 模型版本回滚 — 快照 + 一键回滚 + A/B 对比 — 开发方案"
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
source_prd: "223-需求-模型版本回滚.md"
source_okr: [yiai-002]
---

# YA-09-152: 模型版本回滚 — 快照 + 一键回滚 + A/B 对比 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[223-需求-模型版本回滚.md](../../prds/2026-09/223-需求-模型版本回滚.md)
> 需求编号：YA-09-152 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

模型热切换（YA-09-144）的补充——保留切换前模型快照，支持一键回滚。新模型质量下降时快速恢复。

```python
class ModelSnapshot:
    def __init__(self):
        self.history: list[dict] = []  # [{model, timestamp, reason, metrics}]

    async def snapshot(self, reason: str):
        self.history.append({"model": current_model, "timestamp": now, "reason": reason, "metrics": await get_current_metrics()})

    async def rollback(self) -> str:
        if len(self.history) < 2: raise Exception("No previous version to rollback")
        prev = self.history[-2]
        await hot_swapper.swap(prev["model"])
        return prev["model"]
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 快照 + 回滚 API | 一键恢复到上一版本 | 0.25 |
| 2 | A/B 对比 + 回滚历史 + 测试 | 回滚前后指标可视化对比 | 0.25 |

**合计：0.5d**。