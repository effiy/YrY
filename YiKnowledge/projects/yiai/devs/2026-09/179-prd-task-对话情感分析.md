---
doc_type: module
prd_task_id: "YA-09-140"
title: "YA-09-140: 对话情感分析 — 实时情绪识别 + 自适应响应 — 开发方案"
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
source_prd: "179-需求-对话情感分析.md"
source_okr: [yiai-002]
---

# YA-09-140: 对话情感分析 — 实时情绪识别 + 自适应响应 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[179-需求-对话情感分析.md](../../prds/2026-09/179-需求-对话情感分析.md)
> 需求编号：YA-09-140 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

LLM 识别用户情绪（正面/中性/负面/愤怒/焦虑），据此调整回答的语气和策略。

```python
async def analyze_sentiment(message: str) -> dict:
    response = await llm.chat(messages=[{
        "role": "system", "content": "分析用户情绪，仅返回 JSON: {\"emotion\": \"...\", \"intensity\": 1-5, \"keywords\": [...]}",
    }, {"role": "user", "content": message}])
    return json.loads(response)

def adjust_response_style(sentiment: dict) -> dict:
    if sentiment["emotion"] == "angry":
        return {"temperature": 0.3, "system_extra": "用户情绪激动。保持冷静、共情、提供明确解决方案。"}
    if sentiment["emotion"] == "anxious":
        return {"temperature": 0.5, "system_extra": "用户焦虑。提供 reassurance 和清晰步骤。"}
    return {}
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 情感分类 + 风格调整 | 负面情绪时回答更有共情感 | 0.25 |
| 2 | 情感趋势追踪 + Dashboard + 测试 | 会话级情感曲线 | 0.25 |

**合计：0.5d**。