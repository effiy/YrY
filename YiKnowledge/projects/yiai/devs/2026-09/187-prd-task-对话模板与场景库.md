---
doc_type: module
prd_task_id: "YA-09-137"
title: "YA-09-137: 对话模板与场景库 — 预置模板 + 参数化 — 开发方案"
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
source_prd: "187-需求-对话模板与场景库.md"
source_okr: [yiai-002]
---

# YA-09-137: 对话模板与场景库 — 预置模板 + 参数化 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[187-需求-对话模板与场景库.md](../../prds/2026-09/187-需求-对话模板与场景库.md)
> 需求编号：YA-09-137 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

预置场景模板：代码审查、Bug 分析、PRD 生成、SQL 优化、翻译等。用户一键加载模板开始对话。

```yaml
templates:
  code_review:
    title: "代码审查"
    system_prompt: "你是资深代码审查员。检查代码的安全性、性能和可读性。"
    initial_message: "请审查以下代码:\n{code}"
  sql_optimize:
    title: "SQL 优化"
    system_prompt: "你是数据库优化专家。"
    initial_message: "优化以下 SQL:\n{sql}"
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 模板 YAML + 加载 + 10 预设 | YiVad/YiPet 可见模板列表 | 0.25 |
| 2 | 参数化 + 自定义模板 + 测试 | `{code}` 占位符正确替换 | 0.25 |

**合计：0.5d**。