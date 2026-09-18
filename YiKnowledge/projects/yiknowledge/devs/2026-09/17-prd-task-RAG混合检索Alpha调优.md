---
doc_type: module
prd_task_id: "YK-09-14"
title: "YK-09-14: RAG 混合检索 Alpha 调优 — 开发方案"
status: 需求已编写
priority: P2
owner: 陈铭
roles: [engineer]
created: 2026-09-15
updated: 2026-09-15
project: YiKnowledge
project_id: yiknowledge
prd_month: "202609"
estimate_frontend: 1.5
source_prd: "17-架构设计-RAG混合检索Alpha调优.md"
source_okr: [yiknowledge-001]
related_tests: ["17-prd-test-RAG混合检索Alpha调优"]
---

# YK-09-14: RAG 混合检索 Alpha 调优 — 开发方案

> 来源 PRD：[17-架构设计-RAG混合检索Alpha调优.md](../../prds/2026-09/17-架构设计-RAG混合检索Alpha调优.md)
> 需求编号：YK-09-14 · 优先级：P2 · 人天：1.5d

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW）。

---

## 一、架构总览

RRF 融合公式 `score = α × vec_score + (1-α) × bm25_score` 的 α 参数当前固定 0.5。基于 YK-09-07 用户反馈信号（👍/👎），按查询意图动态调整 α：事实查询 α→0.7（语义优先），关键词查询 α→0.3（BM25 优先）。

## 二、关键技术决策

- **离线评估 + 在线调整**：每周基于反馈数据计算最优 α，非实时调整（避免抖动）
- **查询意图分类**：复用 YA-09-01 意图分类器（factual→α高, analytical→α中, conversational→α低）

## 三、实施步骤

| 步骤 | 任务 | 人天 |
|------|------|------|
| 1 | α 离线评估引擎（基于 👍/👎 历史） | 0.5 |
| 2 | 查询意图→α 映射规则 | 0.3 |
| 3 | RAG 检索集成动态 α | 0.3 |
| 4 | AB 测试 + 对比评估 | 0.4 |

**总计：1.5d**

## 四、已知缺口与技术债

| # | 技术债 | 优先级 | 说明 | 状态 |
|---|--------|--------|------|------|
| 1 | α 值离线评估每周执行 | P3 | 非实时调整，反馈延迟最长 1 周 | 待评估（日评估） |

---