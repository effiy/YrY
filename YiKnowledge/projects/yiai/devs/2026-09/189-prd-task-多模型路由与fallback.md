---
doc_type: module
prd_task_id: "YA-09-81"
title: "YA-09-81: 多模型路由与 Fallback — 成本/延迟/健康多维路由 — 开发方案"
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
source_prd: "189-需求-多模型路由与fallback.md"
source_okr: [yiai-002]
---

# YA-09-81: 多模型路由与 Fallback — 成本/延迟/健康多维路由 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[189-需求-多模型路由与fallback.md](../../prds/2026-09/189-需求-多模型路由与fallback.md)
> 需求编号：YA-09-81 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

在 [YA-08-14 ModelRuntime](./14-prd-task-ModelRuntime抽象层.md) 的 fallback 基础上，增加多维度智能路由——根据任务复杂度、成本预算、延迟要求选择最优模型。

```python
class ModelRouter:
    def route(self, task: Task, models: list[ModelInfo]) -> ModelInfo:
        scores = {}
        for m in models:
            if not m.healthy: continue
            scores[m.name] = (
                m.cost_score(task) * self.weights.cost +
                m.latency_score(task) * self.weights.latency +
                m.quality_score(task) * self.weights.quality
            )
        return max(scores, key=scores.get)
```

### 路由策略

| 策略 | 适用任务 | 模型选择 |
|------|---------|---------|
| 成本优化 | 摘要、翻译 | 便宜模型 (qwen2.5:0.5b) |
| 质量优先 | 代码审查、分析 | 强模型 (deepseek-chat) |
| 延迟敏感 | 实时对话 | 本地 Ollama |
| 自动 | 默认 | 根据复杂度评分 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | ModelRouter + 多维评分 | 不同任务路由到不同模型 | 0.75 |
| 2 | Fallback 链 + 健康检查 + 测试 | 模型故障自动切换 | 0.75 |

**合计：1.5d**。