---
doc_type: module
prd_task_id: "YA-09-105"
title: "YA-09-105: LLM 实时翻译服务 — 多语言翻译 + 领域术语 — 开发方案"
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
source_prd: "167-需求-实时翻译服务.md"
source_okr: [yiai-002]
---

# YA-09-105: LLM 实时翻译服务 — 多语言翻译 + 领域术语 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[167-需求-实时翻译服务.md](../../prds/2026-09/167-需求-实时翻译服务.md)
> 需求编号：YA-09-105 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

利用 LLM 提供高质量翻译，支持领域术语表保持专业术语一致性。

```python
async def translate(text: str, target_lang: str, domain: str = "general") -> str:
    glossary = DOMAIN_GLOSSARIES.get(domain, {})
    glossary_prompt = "\n".join(f"{k} → {v}" for k, v in glossary.items())

    response = await llm.chat(messages=[{
        "role": "system", "content": f"你是专业翻译。目标语言: {target_lang}。术语表:\n{glossary_prompt}\n保持术语一致性。",
    }, {
        "role": "user", "content": text,
    }])
    return response
```

### 领域术语表

| 中文 | English | 领域 |
|------|---------|------|
| 检索增强生成 | RAG | AI |
| 混合检索 | Hybrid Search | AI |
| 断路器 | Circuit Breaker | 架构 |
| 优雅关闭 | Graceful Shutdown | 运维 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | LLM 翻译 + 术语表注入 | 领域术语保持一致 | 0.25 |
| 2 | RPC 端点 + 测试 | 中英互译正确 | 0.25 |

**合计：0.5d**。