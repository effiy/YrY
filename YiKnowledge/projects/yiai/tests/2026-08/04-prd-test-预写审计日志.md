---
doc_type: test
title: "YA-08-04: 预写审计日志 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-15
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-04"
source_prds: ["04-需求-预写审计日志"]
source_modules: ["04-prd-task-预写审计日志"]
source_okr: [yiai-001]
---

# YA-08-04: 预写审计日志 — 测试规格

> 来源 PRD：[04-需求-预写审计日志.md](../../prds/2026-08/04-需求-预写审计日志.md)
> 开发方案：[04-prd-task-预写审计日志.md](../../devs/2026-08/04-prd-task-预写审计日志.md)
> 需求编号：YA-08-04 · 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 `@audit_log` 装饰器行为、审计日志持久化、查询 API。

---

## 一、测试范围

| 组件 | 测试重点 |
|------|---------|
| `@audit_log` 装饰器 | before/after 快照、操作类型、耗时记录、同步/异步方法兼容 |
| MongoDB 持久化 | `audit_logs` 集合写入、TTL 索引 |
| 审计查询 API | 按时间/操作人/模块/操作类型查询 |
| 异常路径 | 写入失败不中断业务、大参数截断 |

---

## 二、单元测试

| 编号 | 用例 | 输入 | 预期 |
|------|------|------|------|
| UT-AL-01 | 装饰器记录 before/after | `@audit_log` 装饰 `create_doc(params)` | audit_log.before=params, audit_log.after=return_value |
| UT-AL-02 | operation="create" | 方法名含 `create` | `audit_log.operation = "create"` |
| UT-AL-03 | operation="update" | 方法名含 `update` | `audit_log.operation = "update"` |
| UT-AL-04 | operation="delete" | 方法名含 `delete` | `audit_log.operation = "delete"` |
| UT-AL-05 | 装饰器不修改返回值 | `create_doc(params) → result` | 装饰器返回 `result`（透明代理） |
| UT-AL-06 | 同步方法兼容 | `@audit_log` 装饰普通 `def` 方法 | 正常记录 |
| UT-AL-07 | 异步方法兼容 | `@audit_log` 装饰 `async def` 方法 | 正常记录 |
| UT-AL-08 | duration_ms 记录 | 方法耗时 150ms | `audit_log.duration_ms` ≈ 150（±5ms） |
| UT-AL-09 | success=True（正常） | 方法执行成功 | `audit_log.success = True` |
| UT-AL-10 | success=False（异常） | 方法抛出异常 | `audit_log.success = False`，异常继续抛出 |
| UT-AL-11 | 写入失败不影响业务 | MongoDB 不可用 | 方法正常返回，WARNING 日志，无异常 |
| UT-AL-12 | 大参数截断 10KB | 参数 > 10KB | `before` 截断为 `"...[TRUNCATED]"` |

---

## 三、集成测试

| 编号 | 场景 | 预期 |
|------|------|------|
| IT-AL-01 | 端到端 create → audit_log 写入 | 调用 RPC → MDB `audit_logs` 新增 1 条记录 |
| IT-AL-02 | 审计日志查询 API | `list_audit_logs(module="data_service", operation="update")` → 返回过滤结果 |
| IT-AL-03 | TTL 索引验证 | 插入审计日志 → 设置 `timestamp` 为 91 天前 → 索引清理后日志消失 |
| IT-AL-04 | 非阻塞写入 | 100 并发请求 → 业务延迟不受审计日志影响 |

---

## 四、性能测试

| 编号 | 场景 | 目标 |
|------|------|------|
| PT-01 | 装饰器包装开销（无实际方法调用） | < 1ms |
| PT-02 | 审计日志写入（`asyncio.create_task`） | 不增加主方法响应时间 |

---

## 五、缺陷分级

| 级别 | 定义 | 示例 |
|------|------|------|
| S0 — 阻断 | `@audit_log` 导致业务方法崩溃 | MongoDB 写入失败导致 `create_doc` 500 |
| S1 — 严重 | 审计日志数据错误 | before/after 快照互换、success 标记反转 |
| S2 — 一般 | 查询 API 异常 | 按时间查询返回空（有数据） |
| S3 — 轻微 | 大参数未被截断导致 MDB 文档过大 |

---

## 六、自动化现状

| 模块 | 状态 | 说明 |
|------|------|------|
| 装饰器单元测试 | ✅ 已完成 | pytest 76 个测试的一部分 |
| MongoDB 集成测试 | ✅ 已完成 | httpx + 测试 MDB |
| 查询 API | ✅ 已完成 | 同上 |
| 异常路径 | ✅ 已完成 | MDB mock 不可用 |

---