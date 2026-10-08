---

doc_type: test
title: "YA-09-53: 服务端 RPC 查询复杂度限制 — 深度/广度限制与成本分析 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-53"
source_prds: ["57-需求-查询复杂度限制"]
source_modules: ["57-prd-task-查询复杂度限制"]
source_okr: [yiai-001]

type: test
---

# YA-09-53: RPC 查询复杂度限制 — 测试规格

> 来源 PRD：[57-需求-查询复杂度限制.md](../../prds/2026-09/57-需求-查询复杂度限制.md)
> 提取日期：2026-09-23

本文档定义查询复杂度限制的**验证方式**——覆盖 pageSize 上限、filter 深度限制、聚合管道阶段数限制、成本预算模型、白名单机制、explain 预分析。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock 查询参数） | 每次提交 |
| L2 集成 | pytest + httpx + MongoDB | MongoDB 运行中 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | pageSize 上限拦截（max 500） | L1 |
| COV-2 | filter 嵌套深度限制（max 3 层） | L1 |
| COV-3 | 聚合管道阶段数限制（max 5 阶段） | L1 |
| COV-4 | 成本预算模型（加权计算） | L1 |
| COV-5 | 全表扫描检测（空 filter + 大 pageSize） | L1 |
| COV-6 | 白名单方法豁免 | L1 |
| COV-7 | explain 预分析 | L2 |
| COV-8 | query_documents 集成 | L2 |
| COV-9 | aggregate_documents 集成 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `normal_query` | `{cname: "bugs", filter: {status: "open"}, pageSize: 20}` | 正常查询 |
| `large_pageSize` | `{pageSize: 10000}` | 超大分页 |
| `deep_filter` | `{$or: [{$and: [{$or: [{$and: [{x: 1}]}]}]}]}` — 5 层嵌套 | 深度 filter |
| `long_pipeline` | 8 阶段聚合管道 | 超阶段数 |
| `full_scan_query` | `{filter: {}, pageSize: 500}` | 全表扫描 |
| `whitelist_methods` | Dashboard 聚合查询方法列表 | 白名单测试 |

---

## 二、测试用例

### 2.1 查询参数限制（COV-1~3 . L1）

> 自动化落点：`tests/unit/test_query_complexity.py`（待新增）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-QCX-001 | pageSize <= 500 正常通过 | 1. `pageSize=100` 发送请求 | 正常执行，返回结果 | P0 | 待实现 |
| TC-QCX-002 | pageSize > 500 拒绝 | 1. `pageSize=501`；2. 发送请求 | 返回 code: 1001, message: "pageSize 超过上限 (500)" | P0 | 待实现 |
| TC-QCX-003 | pageSize 默认值 20 | 1. 不传 pageSize；2. 检查限制器行为 | 使用默认值 20，不触发限制 | P1 | 待实现 |
| TC-QCX-004 | filter 深度 <= 3 正常通过 | 1. 3 层 `$or/$and` 嵌套 | 通过深度检查 | P0 | 待实现 |
| TC-QCX-005 | filter 深度 > 3 拒绝 | 1. 5 层嵌套；2. 发送请求 | 返回 code: 1001, message: "filter 嵌套深度超过上限 (3)" | P0 | 待实现 |
| TC-QCX-006 | 简单 filter（深度 0）通过 | 1. `{status: "open"}` | 通过检查 | P0 | 待实现 |
| TC-QCX-007 | 聚合管道 <= 5 阶段通过 | 1. 5 阶段 pipeline | 正常执行 | P0 | 待实现 |
| TC-QCX-008 | 聚合管道 > 5 阶段拒绝 | 1. 8 阶段 pipeline | 返回 1001: "聚合管道阶段数超过上限 (5)" | P0 | 待实现 |
| TC-QCX-009 | 无 pipeline 参数时不检查阶段数 | 1. 不传 pipeline 参数 | 跳过阶段数检查 | P1 | 待实现 |

### 2.2 成本模型（COV-4~5 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-QCX-010 | 成本 = pageSize × depth_factor × stage_factor | 1. pageSize=100, depth=2, stages=3 | 成本 = 100 × 1.5 × 2.0 = 300 | P0 | 待实现 |
| TC-QCX-011 | 成本超过预算（1000）拒绝 | 1. pageSize=200, depth=3, stages=5 | 成本 = 200×2.0×3.0 = 1200 > 1000，拒绝 | P0 | 待实现 |
| TC-QCX-012 | 空 filter 检测——全表扫描加成本 | 1. `filter={}` + pageSize=500 | 成本增量 +200（全表扫描惩罚） | P1 | 待实现 |

### 2.3 白名单与集成（COV-6~9 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-QCX-013 | 白名单方法不受限制 | 1. Dashboard 聚合查询使用 pageSize=1000 | 白名单方法绕过限制，正常执行 | P0 | 待实现 |
| TC-QCX-014 | 白名单方法仍检查 pipeline 阶段数 | 1. 白名单方法但 pipeline 15 阶段 | pipeline 限制仍生效（安全底线） | P1 | 待实现 |
| TC-QCX-015 | query_documents 集成测试 | 1. 正常查询 → 复杂查询 → 超限查询 | 正常通过，超限拒绝，错误信息明确 | P0 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-QCX-EDGE-001 | pageSize=0（默认值） | 请求 pageSize=0 | 使用默认值 20，不触发拦截 | P1 | 待实现 |
| TC-QCX-EDGE-002 | filter 为 None | 不传 filter 参数 | 等价于 {}，成本 +0 | P1 | 待实现 |
| TC-QCX-EDGE-003 | filter 含 `$text` 全文搜索 | filter: {$text: {$search: "keyword"}} | 检测到 $text，额外 +50 成本 | P2 | 待实现 |
| TC-QCX-EDGE-004 | 成本为 0（空查询） | 所有参数为默认值 | 不触发拦截 | P1 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-QCX-REG-001 | 缺陷 1：pageSize=10000 导致 8s 查询 | 引入限制后重新测试 | pageSize 被拦截，查询不会执行 | P0 | 待实现 |
| TC-QCX-REG-002 | 缺陷 2：12 阶段聚合管道导致 CPU 100% | 引入限制后重新测试 | 管道阶段数超限，拒绝执行 | P0 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 pageSize 限制 | max 500 | TC-QCX-001 ~ 003 |
| FR-02 filter 深度限制 | max 3 层 | TC-QCX-004 ~ 006 |
| FR-03 pipeline 阶段限制 | max 5 阶段 | TC-QCX-007 ~ 009 |
| FR-04 成本预算模型 | 加权计算 + 上限 | TC-QCX-010 ~ 012 |
| FR-05 白名单 | 高优先级方法豁免 | TC-QCX-013 ~ 014 |
| FR-06 RPC 集成 | query_documents/aggregate | TC-QCX-015 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | explain 预分析开销对正常查询的影响 | 每次查询增加 5-20ms | 可选 explain + 缓存策略 |
| G-2 | sort 用未索引字段的成本检测 | 无法检测全表扫描排序 | 在成本模型中增加索引感知 |
| G-3 | MongoDB 副本集下的查询延迟差异 | 不同节点性能不同 | 在多节点环境中补充测试 |

---

*测试规格来源: `YiKnowledge/projects/yiai/prds/2026-09/57-需求-查询复杂度限制.md`*
