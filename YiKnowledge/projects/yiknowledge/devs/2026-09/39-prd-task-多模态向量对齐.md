---
doc_type: module
prd_task_id: "YK-09-36"
title: "YK-09-36: 多模态向量对齐 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-16
updated: 2026-09-16
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.0
source_prd: "39-架构设计-多模态向量对齐.md"
source_okr: [yiknowledge-001]
related_tests: ["39-prd-test-多模态向量对齐"]
---

# YK-09-36: 多模态向量对齐 — 开发方案

> 需求编号：YK-09-36 · 人天：1.0d

---

## 一、架构总览

将 Markdown 文档中的文本、Mermaid 图表、代码块分别向量化，映射到共享语义空间。使用 CLIP-style 联合 Embedding 或 bge-m3 多模态能力，支持跨模态检索（文本查询→匹配图表/代码）。

## 二、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | 图表/代码块独立 chunk 向量化 | 0.3 |
| 2 | 多模态联合检索 | 0.3 |
| 3 | A/B 对比评估 + 测试 | 0.4 |

**总计：1.0d**

## 三、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | 图表向量化依赖图表描述文本 | P3 | Mermaid 代码不可直接向量化 | 待改进 |

---