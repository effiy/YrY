---
doc_type: test
title: "YA-09-04: 检索数据管理 — 测试规格"
status: 待开始
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-04"
source_prds: ["04-需求-检索数据管理"]
source_modules: ["04-prd-task-检索数据管理"]
source_okr: [yiai-002]
---

# YA-09-04: 检索数据管理 — 测试规格

> 来源 PRD：[04-需求-检索数据管理.md](../../prds/2026-09/04-需求-检索数据管理.md)
> 开发方案：[04-prd-task-检索数据管理.md](../../devs/2026-09/04-prd-task-检索数据管理.md)

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-MT-01 | 多轮检索上下文融合 | 第 3 轮 query → 融合前 2 轮 Embedding (衰减 0.7²=0.49) |
| UT-MT-02 | 历史轮次上限 5 | 第 6 轮 → 仅融合前 5 轮 |
| UT-EX-01 | 相关性四维度拆解 | score 含 bm25/vec/freshness/field 四个子分 |
| UT-ML-01 | 跨语言检索 | 中文查询 → 匹配英文文档 |
| UT-TA-01 | 时效性加权 | 1 天内文档 > 365 天前文档 |
| UT-CL-01 | 结果聚类 | 10 个结果 → 2-3 个类别，每类含 top-3 高频词 |

---

## 二、缺陷分级

| 级别 | 示例 |
|------|------|
| S1 — 严重 | 多轮融合导致检索结果严重偏离 |
| S2 — 一般 | 聚类标签不准确 |

---