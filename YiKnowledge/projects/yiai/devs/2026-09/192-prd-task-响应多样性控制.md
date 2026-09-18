---
doc_type: module
prd_task_id: "YA-09-98"
title: "YA-09-98: LLM 响应多样性控制 — 温度/惩罚/创意滑块 — 开发方案"
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
source_prd: "192-需求-响应多样性控制.md"
source_okr: [yiai-002]
---

# YA-09-98: LLM 响应多样性控制 — 温度/惩罚/创意滑块 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[192-需求-响应多样性控制.md](../../prds/2026-09/192-需求-响应多样性控制.md)
> 需求编号：YA-09-98 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

```python
class DiversitySampler:
    PRESETS = {
        "precise":  {"temperature": 0.1, "repeat_penalty": 1.5, "top_p": 0.3},
        "balanced":  {"temperature": 0.7, "repeat_penalty": 1.1, "top_p": 0.9},
        "creative":  {"temperature": 1.2, "repeat_penalty": 1.0, "top_p": 0.95},
    }

    def sample(self, preset: str, intent: str | None = None):
        params = dict(self.PRESETS.get(preset, self.PRESETS["balanced"]))
        if intent == "code":
            params["temperature"] = 0.3  # 代码生成保持精确
        return params

async def chat_with_diversity(messages, diversity: str = "balanced"):
    params = sampler.sample(diversity, intent=classify_intent(messages[-1]["content"]))
    return await ollama.chat(messages=messages, options=params)
```

### 前端交互

用户可选择 "精确/平衡/创意" 三档，影响 LLM 采样参数。

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 三档 Preset + 意图自适应 | 精确模式下代码输出一致 | 0.25 |
| 2 | 前端集成 + 测试 | UI 可见选择滑块 | 0.25 |

**合计：0.5d**。