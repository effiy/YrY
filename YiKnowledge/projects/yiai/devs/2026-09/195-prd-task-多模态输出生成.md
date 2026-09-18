---
doc_type: module
prd_task_id: "YA-09-141"
title: "YA-09-141: 多模态输出生成 — 图表/表格/Mermaid/代码 — 开发方案"
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
source_prd: "195-需求-多模态输出生成.md"
source_okr: [yiai-003]
---

# YA-09-141: 多模态输出生成 — 图表/表格/Mermaid/代码 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[195-需求-多模态输出生成.md](../../prds/2026-09/195-需求-多模态输出生成.md)
> 需求编号：YA-09-141 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

LLM 不仅输出纯文本，还能生成结构化内容——Mermaid 图、JSON Schema、ECharts 配置、代码块等。前端根据内容类型差异化渲染。

```python
OUTPUT_TYPES = {
    "mermaid": lambda content: f"```mermaid\n{content}\n```",
    "echarts": lambda content: f"```echarts\n{json.dumps(content)}\n```",
    "table": lambda content: tabulate(content, headers="keys", tablefmt="github"),
    "code": lambda content: f"```python\n{content}\n```",
}

# LLM 系统提示中声明支持的输出格式
system_prompt = """你可以输出多种格式:
- Mermaid 图表: { "type": "mermaid", "content": "graph LR..." }
- ECharts: { "type": "echarts", "content": {...} }
- 表格: { "type": "table", "content": [...] }
"""
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 4 种输出类型 + 前端渲染 | Mermaid 图在前端正确渲染 | 0.25 |
| 2 | 自动类型检测 + 测试 | 代码块自动语法高亮 | 0.25 |

**合计：0.5d**。