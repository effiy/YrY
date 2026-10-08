---

doc_type: test
title: "预写审计日志系统 — 装饰器驱动的数据变更追踪 — 测试规格"
status: 待开始
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-10"
source_prds: ["08-需求-预写审计日志系统"]
source_modules: ["08-prd-task-预写审计日志系统"]
source_okr: [yiai-001]

type: test
---

# 预写审计日志系统 — 装饰器驱动的数据变更追踪 — 测试规格

> 来源 PRD：[08-需求-预写审计日志系统.md](../../prds/2026-08/08-需求-预写审计日志系统.md)
> 开发方案：[08-prd-task-预写审计日志系统.md](../../devs/2026-08/08-prd-task-预写审计日志系统.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。需求见 PRD，实现见开发方案。本文件聚焦于 `@audit_write` 装饰器的**系统级行为**（与 0004-prd-test-预写审计日志.md 的底层装饰器单元测试互补）。

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
| COV-1 | `AuditLog` dataclass 创建 + 序列化 | L1 |
| COV-2 | `AuditLogger.write()` 异步写入 + TTL 索引管理 | L1 |
| COV-3 | `AuditLogger.write_async()` fire-and-forget 行为 | L1 |
| COV-4 | `@audit_write` 装饰器 before/after/changes 快照 | L2 |
| COV-5 | `set_audit_context()` ContextVar actor 传递 | L2 |
| COV-6 | `_truncate_large_fields` 大字段截断 | L1 |
| COV-7 | `_compute_changes` 字段级 diff 计算 | L1 |
| COV-8 | 审计日志配置开关 `audit_enabled` | L2 |
| COV-9 | TTL 索引 `expireAfterSeconds` 配置 | L1 |
| COV-10 | 写入失败不阻塞主业务流程 | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mock_collection` | mongomock collection | 模拟 MongoDB audit_logs 集合 |
| `sample_document` | `{key: "doc_001", title: "旧标题", status: "open"}` | before 快照 |
| `updated_document` | `{key: "doc_001", title: "新标题", status: "closed"}` | after 快照 |
| `large_field_document` | `{content: "x" * 5000}` | 大字段截断测试 |
| `audit_context` | `{actor: "alice", ip: "192.168.1.1", user_agent: "Chrome"}` | ContextVar 传递测试 |

---

## 二、测试用例

### 2.1 AuditLog 数据模型（COV-1 . L1）

> 自动化落点：`tests/unit/domain/test_audit_models.py`（已存在，需扩展）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AUDSYS-001 | AuditLog 创建所有必填字段 | 1. 构造 `AuditLog(log_id="id1", timestamp=now, actor="alice", operation="CREATE", collection="menus", document_key="m1")` | 所有字段正确赋值，`before/after/changes` 默认为 None | P0 | 待实现 |
| TC-AUDSYS-002 | AuditLog 包含可选字段 | 1. 构造 AuditLog 含 `before={...}, after={...}, changes={...}, ip_address, user_agent` | 所有可选字段正确赋值 | P0 | 待实现 |
| TC-AUDSYS-003 | `to_dict()` 排除 None 字段 | 1. 创建 AuditLog 不传 `ip_address`；2. 调用 `to_dict()` | 返回字典中不包含 `ip_address` 键 | P0 | 待实现 |
| TC-AUDSYS-004 | `to_dict()` 包含所有非 None 字段 | 1. 创建完整 AuditLog（含 before/after/changes）；2. 调用 `to_dict()` | 返回字典包含 10+ 个键 | P1 | 待实现 |
| TC-AUDSYS-005 | `log_id` 使用 UUID 格式 | 1. 创建 AuditLog 时 `log_id = str(uuid.uuid4())` | `log_id` 为 36 字符 UUID 字符串（含连字符） | P1 | 待实现 |

### 2.2 AuditLogger 异步写入（COV-2 + COV-3 . L1）

> 自动化落点：`tests/unit/domain/test_audit_logger.py`（已存在，需扩展）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AUDSYS-006 | `write()` 成功写入 MongoDB | 1. Mock `collection.insert_one`；2. 调用 `AuditLogger.write(entry)` | `insert_one` 被调用一次，参数包含 entry 数据 | P0 | 待实现 |
| TC-AUDSYS-007 | `write()` 自动填充 `log_id` 和 `timestamp` | 1. 传入不含 `log_id` 的 entry；2. 调用 `AuditLogger.write(entry)` | entry 中自动添加 `log_id`（UUID）和 `timestamp`（UTC datetime） | P0 | 待实现 |
| TC-AUDSYS-008 | `write()` 写入失败记录 ERROR 日志 | 1. Mock `insert_one` 抛出 `ServerSelectionTimeoutError`；2. 调用 `AuditLogger.write(entry)` | 不抛出异常，ERROR 日志记录 `"Audit log write failed:"` | P0 | 待实现 |
| TC-AUDSYS-009 | `write_async()` 创建 `asyncio.create_task` | 1. Mock `asyncio.create_task`；2. 调用 `AuditLogger.write_async(entry)` | `asyncio.create_task` 被调用一次 | P0 | 待实现 |
| TC-AUDSYS-010 | `_ensure_indexes()` 创建 5 个索引 | 1. Mock collection 的 `create_index`；2. 调用 `_ensure_indexes()` | `create_index` 被调用 5 次（timestamp、actor+timestamp、collection+timestamp、operation+timestamp、TTL） | P0 | 待实现 |
| TC-AUDSYS-011 | `_ensure_indexes()` 仅初始化一次 | 1. 调用 `_ensure_indexes()` 两次 | 第二次调用时 `_initialized = True`，直接返回，不重复创建索引 | P1 | 待实现 |
| TC-AUDSYS-012 | TTL 索引的 `expireAfterSeconds` 由配置决定 | 1. 设置 `audit_retention_days = 180`；2. 调用 `_ensure_indexes()` | TTL 索引的 `expireAfterSeconds = 15552000`（180 * 86400） | P1 | 待实现 |

### 2.3 `@audit_write` 装饰器行为（COV-4 + COV-5 . L2）

> 自动化落点：`tests/unit/domain/test_audit_decorator.py`（已存在，需扩展为 L2 集成测试）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AUDSYS-013 | CREATE 操作记录 after 数据 | 1. 使用 `@audit_write("CREATE")` 装饰一个 mock create 函数；2. 调用该函数 | 审计日志 `before = null`, `after` 包含返回数据, `operation = "CREATE"` | P0 | 待实现 |
| TC-AUDSYS-014 | UPDATE 操作记录 before/after + changes | 1. Mock before 数据为 `{title: "旧"}`；2. 使用 `@audit_write("UPDATE")` 装饰更新函数；3. 调用函数返回 `{title: "新"}` | 审计日志 `before.title = "旧"`, `after.title = "新"`, `changes.title = {old: "旧", new: "新"}` | P0 | 待实现 |
| TC-AUDSYS-015 | DELETE 操作记录 before 数据 | 1. Mock before 数据为完整文档；2. 使用 `@audit_write("DELETE")` 装饰删除函数 | 审计日志 `before` 包含完整文档, `after = null`, `operation = "DELETE"` | P0 | 待实现 |
| TC-AUDSYS-016 | actor 从 ContextVar 正确传递 | 1. 调用 `set_audit_context(actor="bob")`；2. 执行带有 `@audit_write` 装饰的函数 | 审计日志 `actor = "bob"` | P0 | 待实现 |
| TC-AUDSYS-017 | 未设置 ContextVar 时 actor 默认为 "anonymous" | 1. 不调用 `set_audit_context`；2. 执行审计装饰的函数 | 审计日志 `actor = "anonymous"` | P0 | 待实现 |
| TC-AUDSYS-018 | ip_address 和 user_agent 从 ContextVar 传递 | 1. `set_audit_context(ip="10.0.0.1", user_agent="Firefox")`；2. 执行审计 | 审计日志 `ip_address = "10.0.0.1"`, `user_agent = "Firefox"` | P1 | 待实现 |

### 2.4 大字段截断与 diff 计算（COV-6 + COV-7 . L1）

> 自动化落点：`tests/unit/domain/test_audit_decorator.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AUDSYS-019 | `_truncate_large_fields` 截断超长字符串 | 1. 输入 `{"content": "x" * 5000}`，`max_chars = 2000` | 返回 `{"content": "x" * 2000 + "[truncated]"}` | P0 | 待实现 |
| TC-AUDSYS-020 | `_truncate_large_fields` 不截断短字符串 | 1. 输入 `{"title": "短标题"}`，`max_chars = 2000` | 返回原数据不变 | P0 | 待实现 |
| TC-AUDSYS-021 | `_truncate_large_fields` 处理嵌套 dict | 1. 输入 `{"meta": {"desc": "x" * 3000}}`，`max_chars = 2000` | 嵌套字段 `meta.desc` 被截断 | P1 | 待实现 |
| TC-AUDSYS-022 | `_truncate_large_fields` 处理 None 输入 | 1. 输入 `data = None` | 返回 `None`，不抛异常 | P1 | 待实现 |
| TC-AUDSYS-023 | `_compute_changes` 正确计算字段 diff | 1. `before = {"a": 1, "b": "x"}`；2. `after = {"a": 2, "b": "x", "c": 3}` | `changes = {"a": {"old": 1, "new": 2}, "c": {"old": null, "new": 3}}`（b 相同，不在 changes 中） | P0 | 待实现 |
| TC-AUDSYS-024 | `_compute_changes` 处理空 before | 1. `before = {}`, `after = {"a": 1}` | `changes = {"a": {"old": null, "new": 1}}` | P1 | 待实现 |
| TC-AUDSYS-025 | `_compute_changes` 处理空 after | 1. `before = {"a": 1}`, `after = {}` | `changes = {"a": {"old": 1, "new": null}}` | P1 | 待实现 |

### 2.5 配置开关与故障容忍（COV-8 + COV-9 + COV-10 . L2）

> 自动化落点：`tests/unit/domain/test_audit_decorator.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AUDSYS-026 | `audit_enabled = false` 时跳过审计 | 1. 设置 `settings.audit_enabled = False`；2. 执行带 `@audit_write` 的函数 | 不写入审计日志（`AuditLogger.write_async` 不被调用） | P0 | 待实现 |
| TC-AUDSYS-027 | `audit_enabled = true` 时正常审计 | 1. 设置 `settings.audit_enabled = True`；2. 执行带 `@audit_write` 的函数 | 审计日志正常写入 | P0 | 待实现 |
| TC-AUDSYS-028 | MongoDB 不可用时业务操作正常 | 1. Mock `AuditLogger.write_async` 抛出异常；2. 执行审计装饰的函数 | 函数正常返回，不抛出异常，仅 WARNING 日志 | P0 | 待实现 |
| TC-AUDSYS-029 | before 数据查询失败不阻塞操作 | 1. Mock `find_one` 抛出 `ServerSelectionTimeoutError`；2. 执行 UPDATE 操作 | 操作正常完成，`before = null`，WARNING 日志记录 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-AUDSYS-EDGE-001 | 空 collection_name 的审计 | 1. 参数中 `cname = ""`；2. 执行 `@audit_write("CREATE")` | 审计日志 `collection = ""`，不抛异常 | P1 | 待实现 |
| TC-AUDSYS-EDGE-002 | document_key 为嵌套路径（如 `meta.key`） | 1. 参数中 `key = "parent.child"`；2. 执行审计 | 审计日志 `document_key = "parent.child"`，正常记录 | P2 | 待实现 |
| TC-AUDSYS-EDGE-003 | 并发审计写入（10 并发） | 1. 并发执行 10 个 `@audit_write("CREATE")` 调用；2. 检查审计日志集合 | 全部 10 条审计记录写入，无丢失，无重复 | P1 | 待实现 |
| TC-AUDSYS-EDGE-004 | 参数为 JSON 字符串而非 dict | 1. `parameters = '{"cname": "test"}'`（字符串）；2. 执行审计 | 装饰器正确解析 JSON 字符串，提取 `collection_name` | P1 | 待实现 |
| TC-AUDSYS-EDGE-005 | changes 中嵌套对象的值是比较引用而非深拷贝 | 1. before 和 after 包含相同引用对象；2. 计算 changes | changes 基于值比较（`!=`），不因引用相同而漏报变更 | P1 | 待实现 |
| TC-AUDSYS-EDGE-006 | 装饰器不修改原函数返回值 | 1. 原函数返回 `{"key": "result"}`；2. 经过 `@audit_write` 装饰 | 返回值仍为 `{"key": "result"}`，未经修改 | P0 | 待实现 |

---

## 四、回归用例

> 针对开发方案 .8 已登记的缺陷。

| 编号 | 关联缺陷 | 场景 | 当前预期（固化） | 修复后预期 | 优先级 | 状态 |
|------|---------|------|-----------------|-----------|--------|------|
| TC-AUDSYS-REG-001 | 缺陷 1：`asyncio.create_task` 在 shutdown 时丢失 | 发送 SIGTERM 信号后检查审计日志 | 最后 5s 内的审计日志可能丢失 | 优雅关闭时等待审计任务完成 | P2 | 待实现 |
| TC-AUDSYS-REG-002 | 缺陷 3：BSON 类型被误截断 | 审计 `before_data.config` 包含 `Code` 类型字段 | `_truncate_large_fields` 不截断 BSON 类型 | BSON 类型通过规范序列化处理 | P1 | 待实现 |
| TC-AUDSYS-REG-003 | 缺陷 5：装饰器后 `iscoroutinefunction` 返回 False | 对 async 函数使用 `@audit_write` 后检查 `inspect.iscoroutinefunction` | `iscoroutinefunction` 返回 True | 始终返回 True | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| AuditLog 数据模型 | 所有必填字段可创建 + to_dict 排除 None | TC-AUDSYS-001 ~ 005 |
| AuditLogger 异步写入 | write + write_async + TTL 索引 | TC-AUDSYS-006 ~ 012 |
| @audit_write 装饰器 | before/after/changes 正确记录 | TC-AUDSYS-013 ~ 018 |
| 大字段截断 | > 2000 字符截断为 [truncated] | TC-AUDSYS-019 ~ 022 |
| 字段 diff | 仅变更字段出现在 changes 中 | TC-AUDSYS-023 ~ 025 |
| 配置开关 | audit_enabled 控制是否审计 | TC-AUDSYS-026 ~ 027 |
| 故障容忍 | 审计失败不影响业务 | TC-AUDSYS-028 ~ 029 |
| ContextVar 传递 | actor/ip/user_agent 正确记录 | TC-AUDSYS-016 ~ 018 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | 大批量写入（> 1000 条/秒）下审计日志丢失率 | `asyncio.create_task` 可能积压 | 使用 pytest-benchmark 压测 |
| G-2 | TTL 索引在 MongoDB 5.0 以下版本不支持 | 旧版本 MongoDB 审计日志无限增长 | 增加定时清理任务作为降级方案 |
| G-3 | 跨 worker 进程的 ContextVar 传递 | 多 worker 部署时 ContextVar 互不可见 | 确认 ContextVar 在单 worker 内正确即可 |
| G-4 | 审计查询 API 分页性能 | 百万级审计日志时 `count_documents` 可能慢 | 使用 `estimated_document_count` 替代 |