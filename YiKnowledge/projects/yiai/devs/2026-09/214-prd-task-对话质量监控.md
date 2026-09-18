---
doc_type: module
prd_task_id: "YA-09-146"
title: "YA-09-146: 对话质量监控 — 幻觉检测 + 异常告警 — 开发方案"
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
source_prd: "214-需求-对话质量监控.md"
source_okr: [yiai-001]
---

# YA-09-146: 对话质量监控 — 幻觉检测 + 异常告警 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[214-需求-对话质量监控.md](../../prds/2026-09/214-需求-对话质量监控.md)
> 需求编号：YA-09-146 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

实时监控 LLM 对话质量：检测幻觉（回答与知识库矛盾）、异常短响应、用户重复提问等质量信号。

```python
async def check_hallucination(answer: str, sources: list[str]) -> float:
    """LLM 自检：回答中的事实是否在来源文档中"""
    response = await llm.chat(messages=[{
        "role": "user", "content": f"回答:\n{answer}\n\n来源:\n{chr(10).join(sources)}\n\n回答是否完全基于来源？1-5 分。仅返回数字。"
    }])
    return int(response.strip())

async def quality_monitor(session_id: str):
    metrics = {
        "hallucination_score": await check_hallucination(answer, sources),
        "response_length": len(answer),
        "repeat_query": await check_if_repeat(query, history),
    }
    if metrics["hallucination_score"] <= 2: await send_wework(f"幻觉风险: {session_id}")
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 幻觉检测 + 异常响应检测 | 低分回答触发告警 | 0.25 |
| 2 | Dashboard + 趋势 + 测试 | 质量趋势可视化 | 0.25 |

**合计：0.5d**。