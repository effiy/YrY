---
doc_type: module
prd_task_id: "YA-09-05"
title: "YA-09-05: 数据层稳定性修复 — 连接池优化 + Cursor 泄漏修复 + 超时控制 — 开发方案"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer]
created: 2026-09-11
updated: 2026-09-14
project: YiAi
project_id: yiai
prd_month: "202609"
estimate_frontend: 3.0
source_prd: "06-需求-数据层.md"
source_okr: [yiai-001]
related_tests: ["06-prd-test-数据层"]
---

# YA-09-05: 数据层稳定性修复 — 连接池优化 + Cursor 泄漏修复 + 超时控制 — 开发方案

> **文档职责**：本文档定义**怎么做、为什么这么做、实际做成什么样**（HOW），不含产品目标与测试用例。

> 来源 PRD：[06-需求-数据层.md](../../prds/2026-09/06-需求-数据层.md)
> 需求编号：YA-09-05 · 优先级：P0 · 人天：3.0d · 状态：已完成

---

<a id="sec-1"></a>
## 一、问题背景

| 问题 | 根因 | 影响 |
|------|------|------|
| 连接池耗尽 | `maxPoolSize` 默认 100，高峰时不足 | 请求排队/超时 |
| Cursor 泄漏 | 未显式关闭 Motor cursor | 连接不归还池 |
| 聚合无超时 | `aggregate()` 无 `maxTimeMS` | 慢聚合阻塞连接 |

---

<a id="sec-2"></a>
## 二、修复

| 修复 | 方案 |
|------|------|
| 连接池 | `maxPoolSize=200` + `minPoolSize=10` + `maxIdleTimeMS=300000` |
| Cursor 泄漏 | `async with collection.find(...) as cursor:` 确保关闭 |
| 聚合超时 | `.aggregate(pipeline, maxTimeMS=30000)` |
| 慢查询日志 | 超过 100ms 的查询记录 WARN + 查询计划 |

---

<a id="sec-3"></a>
## 三、实施步骤

| 步骤 | 验证 | 人天 |
|------|------|------|
| 1 | 连接池配置优化 | 压测下无连接等待 | 1.0 |
| 2 | Cursor 泄漏扫描 + 修复 | 长时间运行无连接泄漏 | 1.0 |
| 3 | 聚合超时 + 慢查询日志 + 测试 | 慢聚合超时断开 | 1.0 |

**合计：3.0d**。

---

<a id="sec-4"></a>
## 四、关联模块

- 依赖：[YA-08-15 数据访问层](../2026-08/15-prd-task-数据访问层.md)
- 参考：[MongoDB 连接池耗尽](../../bugs/2026-09/数据/01-数据-MongoDB连接池耗尽.md)

---

## 已知缺口与技术债

### 功能缺口

| # | 缺口 | 影响 | 建议 |
|---|------|------|------|
| — | 无 | — | — |

### 技术债

| # | 技术债 | 优先级 | 预计人天 | 说明 | 状态 |
|---|--------|--------|---------|------|------|
| — | 无 | — | — | — | — |
