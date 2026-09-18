---
doc_type: module
prd_task_id: "YA-09-145"
title: "YA-09-145: HITL 人机协同标注 — 标注管线 + 质量控制 — 开发方案"
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
source_prd: "212-需求-HITL-人机协同标注.md"
source_okr: [yiai-001]
---

# YA-09-145: HITL 人机协同标注 — 标注管线 + 质量控制 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[212-需求-HITL-人机协同标注.md](../../prds/2026-09/212-需求-HITL-人机协同标注.md)
> 需求编号：YA-09-145 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

RAG 评估和微调需要标注数据。AI 预标注 + 人工审核纠错的协同管线。

```python
class AnnotationPipeline:
    async def pre_annotate(self, task: dict) -> dict:
        return await llm.chat(messages=[{"role": "user", "content": f"标注以下数据:\n{task['data']}"}])

    async def submit_review(self, task_id: str, corrections: dict):
        await db.annotations.update_one({"_id": task_id}, {"$set": {"reviewed": True, "corrections": corrections}})

    def iaa_score(self, annotations: list[dict]) -> float:
        """标注者间一致性 Cohen's Kappa"""
        ...
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | AI 预标注 + 人工审核 | 标注效率提升 3x | 0.25 |
| 2 | 一致性计算 + 质量控制 + 测试 | Kappa > 0.7 | 0.25 |

**合计：0.5d**。