---
doc_type: module
prd_task_id: "YA-09-139"
title: "YA-09-139: 语义分块优化 — 按语义分段替代固定大小 — 开发方案"
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
source_prd: "199-需求-语义分块优化.md"
source_okr: [yiai-001]
---

# YA-09-139: 语义分块优化 — 按语义分段替代固定大小 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[199-需求-语义分块优化.md](../../prds/2026-09/199-需求-语义分块优化.md)
> 需求编号：YA-09-139 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

当前 RAG 使用固定 512 token 分块——可能在段落中间截断。改为按 Markdown 标题/段落语义分块 + 重叠。

```python
from llama_index.core.node_parser import MarkdownNodeParser, SentenceSplitter

parser = MarkdownNodeParser()  # 按 ## 标题分块
nodes = parser.get_nodes_from_documents(docs)

# 子句分割 + 重叠
splitter = SentenceSplitter(chunk_size=512, chunk_overlap=64)
nodes = splitter.get_nodes_from_documents(docs)
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | MarkdownNodeParser 集成 | 分块不截断段落 | 0.25 |
| 2 | 分块质量评分 + 测试 | RAG 检索精度提升 | 0.25 |

**合计：0.5d**。