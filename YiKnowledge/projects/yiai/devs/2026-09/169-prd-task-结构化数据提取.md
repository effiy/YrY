---
doc_type: module
prd_task_id: "YA-09-62"
title: "YA-09-62: 结构化数据提取 — LLM 从非结构化文本抽取实体 — 开发方案"
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
source_prd: "169-需求-结构化数据提取.md"
source_okr: [yiai-002]
---

# YA-09-62: 结构化数据提取 — LLM 从非结构化文本抽取实体 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[169-需求-结构化数据提取.md](../../prds/2026-09/169-需求-结构化数据提取.md)
> 需求编号：YA-09-62 · 优先级：P2 · 人天：1.0d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

利用 LLM function calling 能力，从非结构化文本中提取结构化实体。Agent 工具调用、RAG 文档解析等场景通用。

```python
from pydantic import BaseModel, Field

class ExtractedEntities(BaseModel):
    people: list[str] = Field(default_factory=list, description="人名")
    organizations: list[str] = Field(default_factory=list, description="组织/公司")
    dates: list[str] = Field(default_factory=list, description="日期")
    technical_terms: list[str] = Field(default_factory=list, description="技术术语")
    action_items: list[str] = Field(default_factory=list, description="待办事项")

async def extract_entities(text: str, schema: type[BaseModel] = ExtractedEntities) -> dict:
    response = await llm.chat(
        messages=[{
            "role": "system", "content": "从以下文本中提取结构化信息。仅返回 JSON。",
        }, {
            "role": "user", "content": text
        }],
        tools=[{"type": "function", "function": schema_to_tool(schema)}],
    )
    return json.loads(response["tool_calls"][0]["function"]["arguments"])
```

### 应用场景

| 场景 | Schema | 示例 |
|------|--------|------|
| 会议纪要 → 待办 | `action_items: list[{task, owner, deadline}]` | "周五前完成 RAG 优化" |
| Bug 报告 → 结构化 | `BugReport(severity, module, steps)` | 用户自然语言描述 |
| 技术文档 → 元数据 | `DocMeta(tags, related_modules, difficulty)` | 知识库自动标注 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | Schema 定义 + LLM function calling | 中文文本正确提取实体 | 0.5 |
| 2 | 集成到 Agent 工具 + 测试 | Agent 可调用提取工具 | 0.5 |

**合计：1.0d**。