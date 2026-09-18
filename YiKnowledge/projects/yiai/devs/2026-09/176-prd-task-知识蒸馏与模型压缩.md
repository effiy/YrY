---
doc_type: module
prd_task_id: "YA-09-136"
title: "YA-09-136: 知识蒸馏 — 大模型→小模型 + 精度保持 — 开发方案"
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
source_prd: "176-需求-知识蒸馏与模型压缩.md"
source_okr: [yiai-002]
---

# YA-09-136: 知识蒸馏 — 大模型→小模型 + 精度保持 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[176-需求-知识蒸馏与模型压缩.md](../../prds/2026-09/176-需求-知识蒸馏与模型压缩.md)
> 需求编号：YA-09-136 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

大模型（Teacher）生成高质量回答作为小模型（Student）训练数据，在精度损失可控下大幅降低推理成本。

```python
async def distill(teacher: str, student: str, prompts: list[str]):
    dataset = []
    for prompt in prompts:
        answer = await llm.chat(model=teacher, messages=[{"role": "user", "content": prompt}])
        dataset.append({"prompt": prompt, "completion": answer})
    # 用 dataset 微调 student 模型
    return await finetune(student, dataset)
```

### 效果: 7B → 1.5B，精度保持 85%+，推理速度 5x

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 教师-学生数据生成 | 1000 条高质量训练对 | 0.5 |
| 2 | LoRA 蒸馏 + 评估 + 测试 | 1.5B 模型可用 | 0.5 |

**合计：1.0d**。