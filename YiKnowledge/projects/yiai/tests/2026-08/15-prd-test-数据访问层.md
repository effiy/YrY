---

doc_type: test
title: "数据访问层 — 测试规格"
status: 已完成
priority: P1
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-15"
source_prds: ["15-需求-数据访问层"]
source_modules: ["15-prd-task-数据访问层"]
source_okr: [yiai-001]

type: test
---

# 数据访问层 — 测试规格

> 来源 PRD：[15-需求-数据访问层.md](../../prds/2026-08/15-需求-数据访问层.md)
> 开发方案：[15-prd-task-数据访问层.md](../../devs/2026-08/15-prd-task-数据访问层.md)
> 提取日期：2026-09-23

本文档定义**验证方式**——测什么、怎么测、通过标准是什么。覆盖 MongoDB 单例、Repository `_build_filter` 6 种查询策略、RPC 动态路由、RSS 日期归一化、排序 tiebreaker、审计装饰器集成。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock MongoDB/Motor） | 每次提交 |
| L2 集成 | pytest + mongomock | MongoDB test 实例 | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | MongoDB 单例 DCL + `initialize()` | L1 |
| COV-2 | `_build_filter` 字符串模糊搜索（regex） | L1 |
| COV-3 | `_build_filter` 精确匹配（int/float/bool） | L1 |
| COV-4 | `_build_filter` 范围查询（`$gte`/`$lte`） | L1 |
| COV-5 | `_build_filter` 列表过滤（`$in` / 范围 / 嵌套字段） | L1 |
| COV-6 | `_build_filter` Mongo 操作符透传（$or/$and） | L1 |
| COV-7 | `_build_filter` isoDate 特殊处理 | L1 |
| COV-8 | `query_documents()` 分页/排序/投影 | L2 |
| COV-9 | `create_document()` 自动填充 + auto-order | L2 |
| COV-10 | `update_document()` 更新 + upsert fallback | L2 |
| COV-11 | `delete_document()` 删除 + markdown 联动 | L2 |
| COV-12 | `upsert_document()` insert/update 判断 | L2 |
| COV-13 | `_build_sort_list` tiebreaker（updatedTime + createdTime） | L1 |
| COV-14 | `_parse_ms_ts()` RSS 日期归一化 | L1 |
| COV-15 | RPC 动态路由（importlib.import_module） | L1 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `mock_collection` | mongomock collection | CRUD 操作测试 |
| `test_docs` | `[{key: "d1", title: "alpha", status: "open", count: 5}, {key: "d2", title: "beta", status: "closed", count: 10}]` | 查询过滤测试 |
| `rss_docs` | 含不同格式 `published_parsed` 的文档 | `_parse_ms_ts` 测试 |
| `iso_date_docs` | 含 `isoDate` 字段的文档 | isoDate 过滤测试 |
| `range_filter_params` | `{count: [5, 10]}` 范围，`{tags: ["a", "b"]}` IN 查询 | 范围/列表过滤测试 |

---

## 二、测试用例

### 2.1 MongoDB 单例（COV-1 . L1）

> 自动化落点：`tests/integration/data/test_database.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DA-001 | MongoDB 单例仅创建一次（DCL） | 1. 调用 `MongoDB()` 两次 | 两次返回同一实例（`is` 为 True） | P0 | 待实现 |
| TC-DA-002 | `initialize()` 创建 AsyncIOMotorClient | 1. 调用 `db.initialize()` | `db._client` 为 `AsyncIOMotorClient` 实例 | P0 | 待实现 |
| TC-DA-003 | `initialize()` 幂等（多次调用安全） | 1. 调用 `initialize()` 三次 | 不重复创建 client，不抛异常 | P0 | 待实现 |
| TC-DA-004 | `_ensure_indexes()` 创建唯一索引 | 1. Mock collection.create_index；2. 调用 `_ensure_indexes()` | `create_index` 被调用（含 `unique=True`） | P1 | 待实现 |
| TC-DA-005 | `insert_one` 自动填充 `createdTime` | 1. 插入不含 `createdTime` 的文档 | 文档包含 `createdTime`，值为当前时间戳 | P0 | 待实现 |
| TC-DA-006 | `insert_one` 不覆盖已有的 `createdTime` | 1. 插入含 `createdTime: 1000000` 的文档 | `createdTime` 保持 `1000000` | P1 | 待实现 |
| TC-DA-007 | `find_one` 查询不存在文档返回 None | 1. 查询不存在文档 | 返回 None | P0 | 待实现 |
| TC-DA-008 | `delete_one` 返回 `deleted_count` | 1. 插入并删除；2. 检查返回值 | `deleted_count = 1` | P0 | 待实现 |

### 2.2 `_build_filter` 6 种查询策略（COV-2 ~ COV-7 . L1）

> 自动化落点：`tests/integration/data/test_repository.py`（已存在，需扩展）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DA-009 | 字符串 → regex 模糊搜索（大小写不敏感） | 1. `_build_filter({title: "alpha"})` | 返回 `{title: re.compile(".*alpha.*", re.IGNORECASE)}` | P0 | 待实现 |
| TC-DA-010 | int/float → 精确匹配 | 1. `_build_filter({count: 5})` | 返回 `{count: 5}`（无 regex 包装） | P0 | 待实现 |
| TC-DA-011 | bool → 精确匹配 | 1. `_build_filter({active: True})` | 返回 `{active: True}` | P0 | 待实现 |
| TC-DA-012 | 2 元素列表 → 范围查询（`$gte`/`$lte`） | 1. `_build_filter({count: [5, 10]})` | 返回 `{count: {$gte: 5, $lte: 10}}` | P0 | 待实现 |
| TC-DA-013 | 多元素列表 → `$in` 查询 | 1. `_build_filter({tags: ["a", "b", "c"]})` | 返回 `{tags: {$in: ["a", "b", "c"]}}` | P0 | 待实现 |
| TC-DA-014 | dict → Mongo 操作符透传 | 1. `_build_filter({status: {$ne: "deleted"}})` | 返回 `{status: {$ne: "deleted"}}`（透传） | P0 | 待实现 |
| TC-DA-015 | `$or`/`$and` 透传 | 1. `_build_filter({$or: [{a: 1}, {b: 2}]})` | 直接返回输入，不做变换 | P0 | 待实现 |
| TC-DA-016 | isoDate 特殊处理 | 1. `_build_filter({isoDate: "2026-08-01"})` | 调用 `_build_published_date_filter`，转换为 Mongo 日期查询 | P0 | 待实现 |
| TC-DA-017 | 空 filter → 空 dict | 1. `_build_filter({})` | 返回 `{}` | P1 | 待实现 |
| TC-DA-018 | 嵌套字段的 filter | 1. `_build_filter({"meta.author": "alice"})` | 正确处理嵌套路径 | P1 | 待实现 |
| TC-DA-019 | 参数名使用 `filter` 而非 `query` | 1. `query_documents(cname="test", filter={title: "x"})` | 正常过滤；`query` 参数被静默忽略 + WARNING 日志 | P0 | 待实现 |

### 2.3 CRUD 操作（COV-8 ~ COV-12 . L2）

> 自动化落点：`tests/integration/data/test_repository.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DA-020 | `query_documents` 返回分页结构 | 1. 插入 50 条文档；2. `query_documents(cname, {}, page=1, pageSize=20)` | 返回 `{list: [...], total: 50, pageNum: 1, pageSize: 20, totalPages: 3}` | P0 | 待实现 |
| TC-DA-021 | `query_documents` 分页 offset 正确 | 1. 插入 50 条文档；2. 请求 page=2, pageSize=20 | `list` 长度为 20，为第 21-40 条文档 | P0 | 待实现 |
| TC-DA-022 | `query_documents` 排序 + tiebreaker | 1. 插入同 `createdTime` 的文档；2. 按 `createdTime` 排序 | 排序结果稳定（tiebreaker 使用 `updatedTime`），同值文档不会跨页重复 | P0 | 待实现 |
| TC-DA-023 | `query_documents` 投影字段 | 1. 请求 `projection: {title: 1, _id: 0}` | 返回文档仅包含 `title` 字段 | P1 | 待实现 |
| TC-DA-024 | `create_document` 自动生成 key + createdTime + updatedTime + order | 1. 创建不含这些字段的文档 | 返回文档包含 `key`（UUID）、`createdTime`、`updatedTime`、`order` | P0 | 待实现 |
| TC-DA-025 | `create_document` order 自增 | 1. 连续创建 3 条文档 | `order` 依次为 0, 1, 2（自增） | P1 | 待实现 |
| TC-DA-026 | `update_document` 更新字段 | 1. 创建 `{key: "u1", title: "旧"}`；2. 更新 `{data: {title: "新"}}` | `title` 变为 "新"，`updatedTime` 更新 | P0 | 待实现 |
| TC-DA-027 | `update_document` 文档不存在 → upsert | 1. 更新不存在的 key | 新文档被创建（upsert），`matched_count = 0` | P0 | 待实现 |
| TC-DA-028 | `delete_document` 删除成功 | 1. 创建后删除 | 文档不存在于 MongoDB 中 | P0 | 待实现 |
| TC-DA-029 | `delete_document` bugs/issues 同步删除 markdown | 1. 创建 `bugs` 集合文档（含 markdown 文件路径）；2. 删除 | markdown 文件也被删除 | P1 | 待实现 |
| TC-DA-030 | `upsert_document` insert 路径 | 1. 文档不存在 → upsert | 新文档创建，`upserted_id` 非空 | P0 | 待实现 |
| TC-DA-031 | `upsert_document` update 路径 | 1. 文档存在 → upsert | `modified_count > 0` | P0 | 待实现 |
| TC-DA-032 | `count_documents` 返回总数 | 1. 插入 5 条文档；2. `count_documents(cname)` | 返回 `{total: 5}` | P1 | 待实现 |

### 2.4 RSS 日期归一化（COV-13 + COV-14 . L1）

> 自动化落点：`tests/integration/data/test_repository.py`

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DA-033 | `_parse_ms_ts` 处理 int 时间戳（秒级） | 1. `_parse_ms_ts(1724900000)` | 返回 `1724900000000`（转换为毫秒） | P0 | 待实现 |
| TC-DA-034 | `_parse_ms_ts` 处理 str 时间戳（毫秒级） | 1. `_parse_ms_ts("1724900000000")` | 返回 `1724900000000`（字符串转 int） | P0 | 待实现 |
| TC-DA-035 | `_parse_ms_ts` 处理 ISO 日期字符串 | 1. `_parse_ms_ts("2026-08-01T00:00:00Z")` | 返回毫秒时间戳 | P0 | 待实现 |
| TC-DA-036 | `_parse_ms_ts` 处理无效值 | 1. `_parse_ms_ts(None)` 或 `_parse_ms_ts("invalid")` | 返回 0 或抛出明确异常 | P1 | 待实现 |
| TC-DA-037 | `_build_sort_list` tiebreaker `updatedTime` | 1. sort list 不含 `updatedTime` | 自动追加 `updatedTime` 作为 tiebreaker | P0 | 待实现 |
| TC-DA-038 | `_build_sort_list` tiebreaker `createdTime` | 1. sort list 不含 `createdTime` | 自动追加 `createdTime` 作为最终 tiebreaker | P0 | 待实现 |
| TC-DA-039 | RSS 日期过滤在 Python 层做内存过滤 | 1. 插入不同 `published_parsed` 格式的 RSS 文档；2. 按日期范围查询 | 正确过滤，不因格式差异遗漏 | P1 | 待实现 |

### 2.5 RPC 动态路由（COV-15 . L1）

> 自动化落点：`tests/unit/test_executor.py`（**待新增**）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DA-040 | `importlib.import_module` 正确加载模块 | 1. `importlib.import_module("services.database.data_service")` | 返回 data_service 模块 | P0 | 待实现 |
| TC-DA-041 | `getattr(module, "query_documents")` 获取函数 | 1. 获取目标函数 | 返回 callable | P0 | 待实现 |
| TC-DA-042 | 白名单外的 module:method → 拒绝 | 1. 不在 `EXEC_ALLOWLIST` 中的调用 | 返回 `code: 4002`（权限不足） | P0 | 待实现 |
| TC-DA-043 | 参数为 JSON 字符串 → parse_parameters 解析 | 1. `parameters = '{"cname": "test"}'`；2. `parse_parameters(parameters)` | 返回 `{"cname": "test"}`（dict） | P1 | 待实现 |
| TC-DA-044 | 重入保护（最大深度限制） | 1. 递归调用超过最大深度 | 返回错误，不无限递归 | P1 | 待实现 |

---

## 三、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-DA-EDGE-001 | `_build_filter` 空 list → 不添加过滤条件 | 1. `_build_filter({tags: []})` | 不生成 `$in: []`（会匹配空数组），跳过该字段 | P1 | 待实现 |
| TC-DA-EDGE-002 | 超大数据量分页（page 1000） | 1. 请求远超数据量的 page | 返回空 list，total 正确 | P2 | 待实现 |
| TC-DA-EDGE-003 | `query_documents` order 默认降序 | 1. 不指定 sort；2. 查询 | 默认 `order: -1` 排序 | P1 | 待实现 |
| TC-DA-EDGE-004 | MongoDB 连接断开时优雅处理 | 1. 断开连接；2. 调用 CRUD | 返回错误（非裸异常），不崩溃 | P1 | 待实现 |
| TC-DA-EDGE-005 | 参数名 `query` 而非 `filter` → 静默忽略 + WARNING | 1. `query_documents(cname="test", query={title: "x"})` | WARNING 日志 + 全量返回（无过滤） | P0 | 待实现 |
| TC-DA-EDGE-006 | `pageSize` 为 0 → 默认值 | 1. `query_documents(pageSize=0)` | 使用默认 pageSize（20） | P2 | 待实现 |

---

## 四、回归用例

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-DA-REG-001 | 缺陷 1：2 元素字符串列表被误判为范围查询 | `_build_filter({tags: ["a", "b"]})` | 应为 `$in: ["a", "b"]`，非 `$gte: "a", $lte: "b"` | P0 | 待实现 |
| TC-DA-REG-002 | 缺陷 2：双写（磁盘 + MongoDB）不一致 | 文件写入成功但 MongoDB 写入失败 | 事务性：磁盘写入也应回滚（或至少记录不一致） | P2 | 待实现 |
| TC-DA-REG-003 | 缺陷 3：排序 tiebreaker 缺失导致分页重复 | 同 order 文档跨页 | tiebreaker 确保排序稳定 | P1 | 待实现 |

---

## 五、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 MongoDB 单例 + DCL | 单例 + 幂等初始化 | TC-DA-001 ~ 008 |
| FR-02 _build_filter 6 种策略 | 字符串/精确/范围/列表/操作符/isoDate | TC-DA-009 ~ 019 |
| FR-03 query_documents 分页排序投影 | page/pageSize/sort/projection | TC-DA-020 ~ 023 |
| FR-04 create_document 自动填充 | key/createdTime/updatedTime/order | TC-DA-024 ~ 025 |
| FR-05 update_document + upsert | 更新 + 不存在时 upsert | TC-DA-026 ~ 027 |
| FR-06 delete_document + markdown 联动 | 删除 + 关联文件删除 | TC-DA-028 ~ 029 |
| FR-07 upsert 策略 | insert vs update 判断 | TC-DA-030 ~ 031 |
| FR-08 RSS 日期归一化 | int/str/ISO 三种格式 → ms | TC-DA-033 ~ 036 |
| FR-09 排序 tiebreaker | updatedTime + createdTime | TC-DA-037 ~ 038 |
| FR-10 RPC 动态路由 | importlib + getattr + 白名单 | TC-DA-040 ~ 044 |
| FR-11 @audit_write 装饰器集成 | 写操作审计 | 见 04-prd-test-预写审计日志 |

---

## 六、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | `$text` 全文搜索未实现 | 大文本字段仅 regex 匹配，性能差 | 在 `_build_filter` 中增加 `$text` 策略 |
| G-2 | `estimated_document_count` 未使用 | `count_documents({})` 在大集合上慢 | 使用估算方法作为默认值 |
| G-3 | 查询超时控制缺失 | 慢查询可能阻塞事件循环 | 增加 `maxTimeMS` 参数 |
| G-4 | 连接池健康检查缺失 | 连接池耗尽时无法主动发现 | 增加定期 ping 和连接池监控 |
| G-5 | `_build_filter` 不支持嵌套字段的模糊搜索 | 嵌套路径如 `meta.author.name` 无法 regex | 扩展支持点分路径 |