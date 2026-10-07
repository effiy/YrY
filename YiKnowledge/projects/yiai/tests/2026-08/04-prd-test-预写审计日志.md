---

doc_type: test
title: "YA-08-04: 预写审计日志 — 测试规格"
status: 已完成
priority: P0
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-04"
source_prds: ["04-需求-预写审计日志"]
source_modules: ["04-prd-task-预写审计日志"]
source_okr: [yiai-001]

type: test
---

# YA-08-04: 预写审计日志 — 测试规格

> 来源 PRD：[04-需求-预写审计日志.md](../../prds/2026-08/04-需求-预写审计日志.md)
> 开发方案：[04-prd-task-预写审计日志.md](../../devs/2026-08/04-prd-task-预写审计日志.md)
> 需求编号：YA-08-04 -- 优先级：P0

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 `@audit_log` 装饰器行为、审计日志持久化、查询 API。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock MongoDB） | 每次提交 |
| L2 集成 | pytest + mongomock | MongoDB test 实例 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | `@audit_log` 装饰器 before/after 快照 | L1 |
| COV-2 | 操作类型自动推断（create/update/delete） | L1 |
| COV-3 | 装饰器透明代理（不修改返回值） | L1 |
| COV-4 | 同步/异步方法兼容 | L1 |
| COV-5 | duration_ms 耗时记录 | L1 |
| COV-6 | success/failure 标记 | L1 |
| COV-7 | 写入失败不影响业务 | L1 |
| COV-8 | 大参数截断（10KB） | L1 |
| COV-9 | MongoDB 持久化 | L2 |
| COV-10 | 审计查询 API | L2 |
| COV-11 | TTL 索引验证 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mock_collection` | mongomock collection | MongoDB audit_logs 模拟 |
| `valid_params` | `{cname: "issues", data: {title: "测试"}}` | CREATE 操作参数 |
| `update_params` | `{cname: "issues", key: "doc_001", data: {title: "新标题"}}` | UPDATE 操作参数 |
| `large_params` | 15KB 的参数数据 | 截断测试 |

---

## 二、单元测试

### 2.1 装饰器核心行为（COV-1 ~ COV-3 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-AL-01 | 装饰器记录 before/after | 1. `@audit_log` 装饰 `create_doc(params)`；2. 调用 | `audit_log.before = params`, `audit_log.after = return_value` | P0 | 已完成 |
| UT-AL-02 | operation="create" | 1. 方法名含 `create`；2. 调用 | `audit_log.operation = "create"` | P0 | 已完成 |
| UT-AL-03 | operation="update" | 1. 方法名含 `update`；2. 调用 | `audit_log.operation = "update"` | P0 | 已完成 |
| UT-AL-04 | operation="delete" | 1. 方法名含 `delete`；2. 调用 | `audit_log.operation = "delete"` | P0 | 已完成 |
| UT-AL-05 | 装饰器不修改返回值 | 1. `create_doc(params)` → result；2. 检查装饰后返回值 | 返回 `result`（透明代理） | P0 | 已完成 |
| UT-AL-06 | 同步方法兼容 | 1. `@audit_log` 装饰普通 `def` 方法 | 正常记录审计日志 | P0 | 已完成 |
| UT-AL-07 | 异步方法兼容 | 1. `@audit_log` 装饰 `async def` 方法 | 正常记录审计日志 | P0 | 已完成 |
| UT-AL-08 | 装饰后 `iscoroutinefunction` 正确 | 1. 对 async 方法使用装饰器；2. `inspect.iscoroutinefunction(wrapped)` | 返回 True | P1 | 待实现 |

### 2.2 耗时 + 状态记录（COV-5 + COV-6 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-AL-09 | duration_ms 记录 | 1. 方法耗时 150ms；2. 检查 audit_log | `audit_log.duration_ms` ≈ 150（±20ms） | P0 | 已完成 |
| UT-AL-10 | success=True（正常完成） | 1. 方法执行成功 | `audit_log.success = True` | P0 | 已完成 |
| UT-AL-11 | success=False（异常） | 1. 方法抛出异常 | `audit_log.success = False`，异常继续传播 | P0 | 已完成 |

### 2.3 容错与边界（COV-7 + COV-8 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-AL-12 | 写入失败不影响业务 | 1. Mock MongoDB 不可用；2. 调用装饰方法 | 方法正常返回，WARNING 日志，无异常 | P0 | 已完成 |
| UT-AL-13 | 大参数截断 10KB | 1. 参数 > 10KB；2. 调用 | `before` 中截断为 `"...[TRUNCATED]"` | P0 | 已完成 |
| UT-AL-14 | `audit_enabled = false` 时跳过 | 1. 禁用审计；2. 调用带装饰器的方法 | 不写入审计日志 | P0 | 待实现 |
| UT-AL-15 | before 数据查询失败 → before=null | 1. UPDATE 操作；2. Mock `find_one` 抛出异常 | before=null，操作正常完成，WARNING 日志 | P1 | 待实现 |
| UT-AL-16 | `_compute_changes` 嵌套字段 diff | 1. `before = {"meta": {"a": 1}}`；2. `after = {"meta": {"a": 2}}` | `changes = {"meta.a": {"old": 1, "new": 2}}`（扁平化） | P1 | 待实现 |

---

## 三、集成测试

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| IT-AL-01 | 端到端 create → audit_log 写入 | 1. 调用 RPC `data_service.create_document` | MongoDB `audit_logs` 新增 1 条记录 | P0 | 已完成 |
| IT-AL-02 | 端到端 update → before/after + changes | 1. 创建文档 → 更新文档 | 审计日志含 before/after + changes diff | P0 | 待实现 |
| IT-AL-03 | 端到端 delete → before 快照 | 1. 创建文档 → 删除文档 | 审计日志 before 含完整文档, after=null | P0 | 待实现 |
| IT-AL-04 | 审计日志查询 API | 1. `list_audit_logs(module="data_service", operation="update")` | 返回过滤后的审计日志列表 | P0 | 已完成 |
| IT-AL-05 | 审计查询按 actor 过滤 | 1. 创建 alice 和 bob 的操作；2. 按 actor="alice" 查询 | 仅返回 alice 的操作记录 | P0 | 待实现 |
| IT-AL-06 | 审计查询按时间范围过滤 | 1. 创建不同时间的审计记录；2. 按 `start_time`/`end_time` 查询 | 仅返回时间范围内的记录 | P0 | 待实现 |
| IT-AL-07 | 审计查询分页 | 1. 创建 100 条审计记录；2. `limit=20, offset=0` | 返回 20 条，`total=100` | P1 | 待实现 |
| IT-AL-08 | TTL 索引验证 | 1. 插入审计日志；2. 检查索引 | `audit_logs` 存在 `expireAfterSeconds` 的 TTL 索引 | P0 | 已完成 |
| IT-AL-09 | 非阻塞写入 | 1. 100 并发请求 | 业务延迟不受审计日志影响（P95 < 基线 + 5ms） | P1 | 已完成 |
| IT-AL-10 | 审计日志不可通过 data_service 修改 | 1. 尝试 `data_service.update_document(cname="audit_logs", ...)` | 返回错误（审计日志只追加） | P1 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AL-EDGE-001 | 空参数 → 审计日志记录空 before | 1. CREATE 操作 `data: {}` | 审计日志 before={} | P1 | 待实现 |
| TC-AL-EDGE-002 | UPSERT 操作 → insert 路径 | 1. 文档不存在 → upsert | operation=UPSERT，before=null, after 非空 | P1 | 待实现 |
| TC-AL-EDGE-003 | UPSERT 操作 → update 路径 | 1. 文档存在 → upsert | operation=UPSERT，before/after 均非空 + changes | P1 | 待实现 |
| TC-AL-EDGE-004 | 参数为 JSON 字符串而非 dict | 1. `parameters = '{"cname": "test"}'` | 装饰器正确解析 JSON 字符串 | P1 | 待实现 |
| TC-AL-EDGE-005 | 并发 10 个写入请求 | 1. 10 并发 create；2. 检查审计日志数量 | 10 条审计记录，无丢失，无乱序 | P1 | 待实现 |
| TC-AL-EDGE-006 | 超大 before 数据（> 1MB）→ 截断 | 1. 文档含 500KB content 字段 | before 中 content 截断为 2000 字符 + [truncated] | P1 | 待实现 |

---

## 五、回归用例

| 编号 | 关联缺陷 | 场景 | 当前预期 | 修复后预期 | 优先级 | 状态 |
|------|---------|------|---------|-----------|--------|------|
| TC-AL-REG-001 | 缺陷 1：`asyncio.create_task` 在 shutdown 时丢失 | SIGTERM 信号后审计日志丢失 | 最后 5s 的日志可能丢失（固化） | 优雅关闭等待任务完成 | P2 | 待实现 |
| TC-AL-REG-002 | 缺陷 3：BSON 类型被误截断 | Code/Binary 字段 | 不截断 BSON 类型（固化） | BSON 类型走规范序列化 | P1 | 待实现 |
| TC-AL-REG-003 | 缺陷 4：`created_at` 早于实际写入时间 | TTL 提前 1 天删除 | 使用 `insert_one` 时的 `datetime.now()` | TTL 从实际写入时间计算 | P1 | 待实现 |

---

## 六、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 @audit_log 装饰器 | before/after 快照 + operation | UT-AL-01 ~ 08 |
| FR-02 耗时 + 状态记录 | duration_ms + success | UT-AL-09 ~ 11 |
| FR-03 故障容忍 | 写入失败不影响业务 + 截断 | UT-AL-12 ~ 16 |
| FR-04 MongoDB 持久化 | audit_logs 集合写入 + TTL | IT-AL-01, IT-AL-08 |
| FR-05 审计查询 API | actor/collection/time/filter | IT-AL-04 ~ 07 |
| FR-06 非阻塞写入 | asyncio.create_task | IT-AL-09 |
| FR-07 审计日志不可变性 | 无 update/delete 审计日志的 API | IT-AL-10 |

---

## 七、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 文件写入审计未覆盖 | write_file 操作无审计 | 扩展到 files_service |
| G-2 | 知识库写入审计未覆盖 | knowledge writer.py 无审计 | 后续迭代实现 |
| G-3 | AI 聊天审计未覆盖 | 用户对话内容无审计 | 评估隐私影响后再决定 |
| G-4 | 审计日志可视化面板缺失 | 仅 RPC 查询，无仪表盘 | 在 YiVad Dashboard 中增加审计面板 |