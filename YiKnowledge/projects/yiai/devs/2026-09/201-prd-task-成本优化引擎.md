---
doc_type: module
prd_task_id: "YA-09-86"
title: "YA-09-86: AI 成本优化引擎 — Token 追踪 + 模型降本 + 预算告警 — 开发方案"
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
source_prd: "201-需求-成本优化引擎.md"
source_okr: [yiai-002]
---

# YA-09-86: AI 成本优化引擎 — Token 追踪 + 模型降本 + 预算告警 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[201-需求-成本优化引擎.md](../../prds/2026-09/201-需求-成本优化引擎.md)
> 需求编号：YA-09-86 · 优先级：P2 · 人天：1.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

追踪每次 LLM 调用的 Token 消耗和成本（Ollama 自托管成本接近零，外部 API 按量计费），提供预算告警和降本建议。

```python
class CostTracker:
    PRICING = {
        "deepseek-chat": {"input": 0.14, "output": 0.28},  # $/1M tokens
        "ollama-local": {"input": 0, "output": 0},           # 自托管
    }

    async def track(self, model: str, prompt_tokens: int, completion_tokens: int):
        pricing = self.PRICING.get(model, {"input": 0, "output": 0})
        cost = (prompt_tokens * pricing["input"] + completion_tokens * pricing["output"]) / 1_000_000

        await db.ai_costs.insert_one({
            "model": model, "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens, "cost_usd": cost,
            "timestamp": datetime.now(timezone.utc),
        })
```

### 降本策略

| 策略 | 效果 |
|------|------|
| 简单任务用便宜模型 | 成本 -70% |
| Prompt 压缩 | Token -30% |
| 缓存命中 | API 调用 -50% |
| 批量处理 | 减少请求数 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Token 计数 + 成本追踪 | 每次调用成本可见 | 0.5 |
| 2 | 预算告警 + 降本建议 + Dashboard | 超预算企微通知 | 1.0 |

**合计：1.5d**。