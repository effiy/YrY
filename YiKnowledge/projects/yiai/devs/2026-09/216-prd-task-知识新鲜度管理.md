---
doc_type: module
prd_task_id: "YA-09-147"
title: "YA-09-147: 知识新鲜度管理 — 过期评分 + 自动重索引 — 开发方案"
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
source_prd: "216-需求-知识新鲜度管理.md"
source_okr: [yiai-001]
---

# YA-09-147: 知识新鲜度管理 — 过期评分 + 自动重索引 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[216-需求-知识新鲜度管理.md](../../prds/2026-09/216-需求-知识新鲜度管理.md)
> 需求编号：YA-09-147 · 优先级：P2 · 人天：0.5d · 状态：需求已编写

---

<a id="sec-1"></a>
## 一、方案

知识文件可能过时（last_updated > 180 天）。新鲜度评分影响 RAG 检索排序——新内容优先。定时重索引更新内容。

```python
def freshness_score(doc: dict) -> float:
    days_since_update = (datetime.now() - parse_date(doc["updated"])).days
    if days_since_update < 7:   return 1.0
    if days_since_update < 30:  return 0.8
    if days_since_update < 90:  return 0.5
    if days_since_update < 180: return 0.2
    return 0.05  # 半年以上几乎不考虑

# RAG 检索时: final_score = similarity * 0.7 + freshness * 0.3
final_score = similarity_score * 0.7 + freshness_score(doc) * 0.3
```

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 新鲜度评分 + RAG 集成 | 新文档排序优于旧文档 | 0.25 |
| 2 | 过期告警 + Dashboard + 测试 | 180 天未更新文档标记 stale | 0.25 |

**合计：0.5d**。