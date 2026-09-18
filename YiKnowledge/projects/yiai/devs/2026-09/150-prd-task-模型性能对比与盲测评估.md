---
doc_type: module
prd_task_id: "YA-09-121"
title: "YA-09-121: 模型性能对比与盲测 — 多模型 A/B 评估框架 — 开发方案"
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
source_prd: "150-需求-模型性能对比与盲测评估.md"
source_okr: [yiai-002]
---

# YA-09-121: 模型性能对比与盲测 — 多模型 A/B 评估框架 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[150-需求-模型性能对比与盲测评估.md](../../prds/2026-09/150-需求-模型性能对比与盲测评估.md)
> 需求编号：YA-09-121 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

多模型并存时需客观对比质量。盲测：同时对两个模型发送相同 query，用户不知哪个是哪个，投票选出更好回答。

```python
async def blind_test(query: str, model_a: str, model_b: str) -> dict:
    # 随机交换顺序
    models = [model_a, model_b]; random.shuffle(models)
    results = await asyncio.gather(
        llm.chat(messages=[{"role": "user", "content": query}], model=models[0]),
        llm.chat(messages=[{"role": "user", "content": query}], model=models[1]),
    )
    return {"A": results[0], "B": results[1], "mapping": {models[0]: "A", models[1]: "B"}}
```

### 评估维度: 准确性、速度、Token 消耗、用户偏好投票

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 盲测框架 + 投票收集 | A/B 结果和偏好可记录 | 0.5 |
| 2 | Dashboard 对比 + 测试 | 模型质量趋势可视化 | 0.5 |

**合计：1.0d**。