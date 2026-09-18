---
doc_type: module
prd_task_id: "YA-09-90"
title: "YA-09-90: 自定义 Embedding 模型 — 微调模型注册 + 评估 + 热替换 — 开发方案"
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
source_prd: "174-需求-自定义Embedding模型.md"
source_okr: [yiai-001]
---

# YA-09-90: 自定义 Embedding 模型 — 微调模型注册 + 评估 + 热替换 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[174-需求-自定义Embedding模型.md](../../prds/2026-09/174-需求-自定义Embedding模型.md)
> 需求编号：YA-09-90 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 Embedding 使用 Ollama 的通用模型（`bge-m3`）。支持注册领域微调的专用 Embedding 模型，通过评估基准对比后热替换。

```python
class EmbeddingRegistry:
    def __init__(self):
        self.models: dict[str, EmbeddingModel] = {}

    def register(self, name: str, model: EmbeddingModel):
        self.models[name] = model

    async def evaluate(self, name: str, benchmark: list[dict]) -> dict:
        """在基准数据集上评估"""
        model = self.models[name]
        scores = {"mrr": 0, "ndcg@10": 0, "recall@5": 0}
        for item in benchmark:
            embedding = await model.encode(item["query"])
            results = await vector_search(embedding, top_k=10)
            scores["mrr"] += reciprocal_rank(results, item["relevant_ids"])
        n = len(benchmark)
        return {k: v / n for k, v in scores.items()}

    def hot_swap(self, old: str, new: str):
        """热替换：新模型写入 → 验证 → 切换 active → 旧模型可回滚"""
        asyncio.create_task(self._swap(old, new))
```

### 模型管理

| 操作 | 说明 |
|------|------|
| 注册 | `ollama pull my-bge-v2` → 注册到 registry |
| 评估 | 在 100 条基准查询上对比 MRR/NDCG/Recall |
| 热替换 | 新模型评分 > 旧模型 → 切换 active |
| 回滚 | 保留旧模型 7 天，可随时回滚 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 注册 + 评估基准 | MRR/Recall 指标正确 | 0.75 |
| 2 | 热替换 + 回滚 + 测试 | 切换后检索结果更新 | 0.75 |

**合计：1.5d**。