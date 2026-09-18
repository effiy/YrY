---
doc_type: test
title: "YA-09-05: 数据层稳定性修复 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-16
project: YiAi
project_id: yiai
prd_month: "202609"
prd_task_id: "YA-09-05"
source_prds: ["06-需求-数据层"]
source_modules: ["06-prd-task-数据层"]
source_okr: [yiai-001]
---

# YA-09-05: 数据层稳定性修复 — 测试规格

> 来源 PRD：[06-需求-数据层.md](../../prds/2026-09/06-需求-数据层.md)
> 开发方案：[06-prd-task-数据层.md](../../devs/2026-09/06-prd-task-数据层.md)
> 需求编号：YA-09-05 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖连接池优化、Cursor 泄漏修复、超时控制。

---

## 一、单元测试

| 编号 | 用例 | 预期 |
|------|------|------|
| UT-DL-01 | 连接池 maxPoolSize=100 | 并发 101 请求 → 第 101 等待而非崩溃 |
| UT-DL-02 | Cursor 使用后自动关闭 | `async for doc in cursor` → cursor 在循环结束后关闭 |
| UT-DL-03 | 查询超时 30s | 慢查询 > 30s → `asyncio.TimeoutError` |
| UT-DL-04 | 聚合管道超时 | `$lookup` 耗时 > 30s → 超时 + 降级返回 |
| UT-DL-05 | 连接池耗尽恢复 | 短暂 MDB 不可用 → 恢复后自动重连 |

---

## 二、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-DL-01 | 100 并发查询 | 连接池 ≤ 100，无连接泄漏（查询后连接数恢复基线） |
| IT-DL-02 | 长时间运行（1h）连接数稳定 | 连接数 ≤ maxPoolSize，无持续增长 |

---

## 三、缺陷分级

| 级别 | 示例 |
|------|------|
| S0 — 阻断 | Cursor 泄漏导致连接池耗尽（服务 500） |
| S1 — 严重 | 连接池配置过小导致正常流量排队超时 |

---