---
doc_type: module
prd_task_id: "YA-09-149"
title: "YA-09-149: 知识置信度标注 — 事实分级 + 来源归因 — 开发方案"
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
source_prd: "219-需求-知识置信度标注.md"
source_okr: [yiai-001]
---

# YA-09-149: 知识置信度标注 — 事实分级 + 来源归因 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[219-需求-知识置信度标注.md](../../prds/2026-09/219-需求-知识置信度标注.md)
> 需求编号：YA-09-149 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

知识文件中的事实可信度不同——官方文档 > 经验总结 > 推测。RAG 检索时低置信度内容降权或标记。

```python
CONFIDENCE_LEVELS = {
    "verified":   1.0,   # 官方文档、经过了验证
    "high":       0.8,   # 实践验证的经验
    "medium":     0.5,   # 团队共识
    "low":        0.2,   # 推测性内容
}

# Frontmatter 标注
"""
---
confidence: high
source_attribution: "基于 YiAi RAG 模块代码分析"
---
"""
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 置信度字段 + Frontmatter | RAG 结果可见置信度标记 | 0.25 |
| 2 | 低置信度审核队列 + Dashboard + 测试 | `low` 内容自动标记审核 | 0.25 |

**合计：0.5d**。