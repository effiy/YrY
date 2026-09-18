---
doc_type: module
prd_task_id: "YA-09-06"
title: "YA-09-06: 全局搜索服务 — 跨集合全文检索 + 搜索结果聚合 — 开发方案"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 2.5
source_prd: "10-需求-全局搜索服务.md"
source_okr: [yiai-001]
related_tests: ["10-prd-test-全局搜索服务"]
---

# YA-09-06: 全局搜索服务 — 跨集合全文检索 + 搜索结果聚合 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[10-需求-全局搜索服务.md](../../prds/2026-09/10-需求-全局搜索服务.md)
> 需求编号：YA-09-06 · 优先级：P1 · 人天：2.5d · 状态：已完成

---

<a id="sec-1"></a>
## 一、方案

提供跨 MongoDB 集合的全文搜索，聚合结果按类型分组返回。复用 `server/routes/search.py` 端点。

```mermaid
flowchart LR
  Q["搜索关键词"] --> SVC["search_service"]
  SVC --> COL["sessions / knowledge_files / bugs / projects"]
  COL --> AGG["按类型聚合"]
  AGG --> RANK["相关度排序"]
  RANK --> RESULT["{ sessions: [...], knowledge: [...], bugs: [...] }"]
```

### 搜索策略

| 集合 | 搜索字段 | 权重 |
|------|---------|------|
| `sessions` | `title`, `pageContent` | 高 |
| `knowledge_files` | `title`, `tags` | 中 |
| `bugs` | `title`, `description` | 中 |
| `projects` | `name`, `description` | 低 |

---

<a id="sec-2"></a>
## 二、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | MongoDB `$text` 索引创建 | 各集合全文搜索可用 | 0.5 |
| 2 | 跨集合聚合 + 排序 | 搜索结果按相关度排列 | 1.0 |
| 3 | search_service RPC 封装 + 测试 | RPC 调用返回聚合结果 | 1.0 |

**合计：2.5d**。

---

<a id="sec-3"></a>
## 三、关联模块

- 消费：[YiVad 全局搜索页面](../../yivad/)

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| 1 | 跨集合搜索无索引优化 | P2 | 0.3 | 多集合 $text 搜索无复合索引 | 待实施 |
| 2 | 搜索结果缓存未实现 | P3 | 0.2 | 相同查询重复搜索 | 待实施 |
