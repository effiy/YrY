---

doc_type: test
title: "YA-08-01: GraphQL 联邦层 — 测试规格"
status: 已完成
priority: P2
owner: 陈铭
roles: [engineer, qa]
created: 2026-09-11
updated: 2026-09-23
project: YiAi
project_id: yiai
prd_month: "202608"
prd_task_id: "YA-08-01"
source_prds: ["01-需求-GraphQL联邦层"]
source_modules: ["01-prd-task-GraphQL联邦层"]
source_okr: [yiai-001]

type: test
---

# YA-08-01: GraphQL 联邦层 — 测试规格

> 来源 PRD：[01-需求-GraphQL联邦层.md](../../prds/2026-08/01-需求-GraphQL联邦层.md)
> 开发方案：[01-prd-task-GraphQL联邦层.md](../../devs/2026-08/01-prd-task-GraphQL联邦层.md)
> 需求编号：YA-08-01 -- 优先级：P2

> **文档职责**：本文档定义**怎么验证**（VERIFY）。覆盖 GraphQL 查询、RPC 适配器、DataLoader、Federation 子图、Schema 类型安全。

---

## 一、测试范围与策略

### 1.1 测试分层

| 层级 | 工具 | 环境依赖 | 执行时机 |
|------|------|---------|---------|
| L1 单元 | pytest | 无（mock RPC 服务） | 每次提交 |
| L2 集成 | pytest + httpx + Strawberry test client | YiAi 服务 + MongoDB | 每次提交 |

### 1.2 覆盖范围

| 编号 | 被测对象 | 层级 |
|------|---------|------|
| COV-1 | 单实体查询（Query） | L2 |
| COV-2 | 跨服务查询聚合 | L2 |
| COV-3 | Mutation 操作（create/update/delete/writeFile） | L2 |
| COV-4 | RPC 适配器错误 → GraphQL error 转换 | L1 |
| COV-5 | DataLoader 批处理（N+1 防反模式） | L1 |
| COV-6 | Federation `@key` 解析 + `_entities` 查询 | L2 |
| COV-7 | 查询深度限制（max_depth=5） | L2 |
| COV-8 | 自定义标量（JSON/DateTime）序列化 | L1 |
| COV-9 | GraphQL IDE（GraphiQL）可访问 | L2 |
| COV-10 | RPC 信封兼容（双协议共存） | L2 |

### 1.3 测试数据

| 夹具 | 数据 | 用途 |
|------|------|------|
| `graphql_client` | Strawberry test client | 所有 GraphQL 查询测试 |
| `mock_data_service` | Mock DataService 返回固定数据 | Resolver 调用验证 |
| `test_documents` | 3 条测试文档（issues 集合） | 文档查询验证 |
| `test_knowledge_files` | 2 条知识库文件记录 | knowledgeFiles 查询验证 |
| `test_sessions` | 1 条会话记录 | sessions 查询验证 |

---

## 二、单元测试

### 2.1 单实体查询（COV-1 . L1/L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-01 | 单实体查询 | 1. 执行 `query { knowledgeFile(path:"x") { title } }` | 返回 title 字段 | P0 | 已完成 |
| UT-GQ-02 | 查询文档列表（含可选 filter） | 1. 执行 `query { documents(cname: "issues") { id data } }` | 返回 issues 集合的文档列表 | P0 | 待实现 |
| UT-GQ-03 | 查询单个文档 | 1. 执行 `query { document(cname: "bugs", id: "BUG-001") { id } }` | 返回 BUG-001 的 Document | P0 | 待实现 |
| UT-GQ-04 | 查询不存在的文档 → null | 1. 执行查询不存在的 id | 返回 `null`（非错误） | P0 | 待实现 |
| UT-GQ-05 | knowledgeFiles 带 scope 过滤 | 1. `query { knowledgeFiles(scope: "engineer") { path title } }` | 仅返回 engineer scope 的文件 | P1 | 待实现 |
| UT-GQ-06 | 空查询参数 → 返回全部或 validation error | 1. `query { knowledgeFile(path: "") { title } }` | 返回 validation error | P0 | 已完成 |

### 2.2 跨服务聚合 + DataLoader（COV-2 + COV-5 . L1/L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-07 | 跨服务查询聚合 | 1. 执行 `query { knowledgeFile { title } sessions { key } }` | 两个 RPC 调用被聚合，返回统一的 data 对象 | P0 | 已完成 |
| UT-GQ-08 | DataLoader 批量 → 10 实体仅 2 次 RPC | 1. 查询 10 个 knowledgeFile 的 related docs | 仅 2 次 RPC 调用（批量加载），而非 11 次（1+10） | P0 | 已完成 |
| UT-GQ-09 | DataLoader 批量 → 单次 MongoDB $in 查询 | 1. 查询 5 个 Document 的 id | 合并为 `find({_id: {$in: [...]}})` | P1 | 待实现 |
| UT-GQ-10 | DataLoader 批次大小限制（max_batch=100） | 1. 查询 150 个实体 | 分批处理，每批 <= 100 | P1 | 待实现 |
| UT-GQ-11 | DataLoader 慢查询不阻塞其他查询 | 1. 批次中 1 个查询超时 5s | 使用 `asyncio.as_completed`，其他查询不受影响 | P1 | 待实现 |

### 2.3 Mutation 操作（COV-3 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-12 | createDocument mutation | 1. 执行 `mutation { createDocument(cname: "issues", data: {...}) { id } }` | 返回包含 id 的 Document | P0 | 待实现 |
| UT-GQ-13 | updateDocument mutation | 1. 更新已有文档 | 返回更新后的 Document | P0 | 待实现 |
| UT-GQ-14 | deleteDocument mutation | 1. 删除文档 | 返回 `true` | P0 | 待实现 |
| UT-GQ-15 | writeFile mutation | 1. 执行 `mutation { writeFile(targetFile: "...", content: "# Hello") { success path } }` | 返回 `{success: true, path: "..."}` | P0 | 待实现 |

### 2.4 RPC 适配器错误处理（COV-4 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-16 | RPC 返回 1002 → GraphQL error | 1. Mock RPC 返回 `code: 1002`；2. 查询 | `errors[{message, extensions: {code: 1002}}]` | P0 | 已完成 |
| UT-GQ-17 | RPC 返回 5001（数据库错误）→ GraphQL error | 1. Mock 数据库异常 | GraphQL error 不暴露内部堆栈 | P0 | 待实现 |
| UT-GQ-18 | RPC 超时 → GraphQL error | 1. Mock RPC 调用超时 | `errors[{message: "timeout"}]`，不崩溃 | P1 | 待实现 |

### 2.5 Federation 子图（COV-6 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-19 | Federation `@key` 解析 | 1. 发送 `_entities([{__typename: "Document", id: "..."}])` | 正确解析跨子图引用 | P0 | 已完成 |
| UT-GQ-20 | Federation Schema 可组合 | 1. 验证 Schema 包含 `_service { sdl }` 字段 | `_service.sdl` 返回完整的 Federation SDL | P1 | 待实现 |
| UT-GQ-21 | `strawberry.ID` 的 value 提取正确 | 1. `resolve_reference` 中使用 `id` | 提取的值为 `"proj-1"` 而非 `"ID('proj-1')"` | P1 | 待实现 |

### 2.6 Schema 安全（COV-7 . L2）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-22 | 查询深度限制 max_depth=5 | 1. 发送 6 层嵌套查询 | 拒绝查询，返回 depth error | P0 | 已完成 |
| UT-GQ-23 | 查询深度 5 层 → 允许 | 1. 发送 5 层嵌套查询 | 正常执行 | P1 | 待实现 |
| UT-GQ-24 | 生产环境禁用 introspection | 1. 请求 `__schema`/`__type`（生产模式） | 返回 403 | P1 | 待实现 |

### 2.7 自定义标量（COV-8 . L1）

| 编号 | 用例 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| UT-GQ-25 | JSON 标量序列化 | 1. `JSON.serialize({"a": 1})` | 返回 `'{"a": 1}'` | P0 | 待实现 |
| UT-GQ-26 | JSON 标量反序列化 | 1. `JSON.parse_value('{"a": 1}')` | 返回 `{"a": 1}` | P0 | 待实现 |
| UT-GQ-27 | DateTime 标量序列化 | 1. `DateTime.serialize(datetime(2026, 8, 1))` | 返回 `"2026-08-01T00:00:00"` | P0 | 待实现 |
| UT-GQ-28 | DateTime 标量反序列化 | 1. `DateTime.parse_value("2026-08-01T00:00:00")` | 返回 `datetime(2026, 8, 1)` | P0 | 待实现 |
| UT-GQ-29 | JSON 标量 ObjectId 特殊处理 | 1. 序列化含 `ObjectId` 的对象 | `ObjectId` 序列化为无前缀的 hex 字符串 | P1 | 待实现 |

---

## 三、集成测试

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| IT-GQ-01 | POST `/graphql` 查询 | 1. POST `/graphql` 带 query | 返回 JSON `{data, errors}` | P0 | 已完成 |
| IT-GQ-02 | GraphiQL 交互式查询 | 1. GET `/graphql` | 显示 GraphiQL IDE | P0 | 已完成 |
| IT-GQ-03 | 三个子图联合查询 | 1. 查询 data + chat + knowledge 子图 | 三个子图同时工作 | P0 | 已完成 |
| IT-GQ-04 | RPC 双协议共存 | 1. 分别通过 GraphQL 和 RPC 查询同一数据 | 两者返回一致（协议不同但数据相同） | P0 | 待实现 |
| IT-GQ-05 | GraphQL 认证集成 | 1. 不带 Token 访问 GraphQL（认证启用时） | 返回 401 | P1 | 待实现 |

---

## 四、边缘场景用例

| 编号 | 场景 | 步骤 | 预期结果 | 优先级 | 状态 |
|------|------|------|---------|--------|------|
| TC-GQ-EDGE-001 | GraphQL 查询无匹配结果 → 空数组 | 1. 查询不存在的数据 | 返回空 `list: []`，非 null，非错误 | P1 | 待实现 |
| TC-GQ-EDGE-002 | 超大 query（> 10KB）| 1. 发送 15KB 的 GraphQL query | 返回错误或正常处理（取决于配置） | P2 | 待实现 |
| TC-GQ-EDGE-003 | 变量注入（GraphQL variables）| 1. 使用 `variables` 字典传递参数 | 变量正确解析和注入 | P1 | 待实现 |
| TC-GQ-EDGE-004 | 多个 mutation 顺序执行 | 1. `mutation { m1: createDocument(...) { id } m2: createDocument(...) { id } }` | 顺序执行，两个都成功 | P1 | 待实现 |
| TC-GQ-EDGE-005 | MutationInput 中可选字段传 null → MongoDB 不插入 null | 1. createDocument 不填 `description` 字段 | MongoDB 文档不包含 `description: null` 键值对 | P1 | 待实现 |

---

## 五、回归用例

> 针对开发方案 .8 已登记的 7 个回归问题。

| 编号 | 关联缺陷 | 场景 | 预期 | 优先级 | 状态 |
|------|---------|------|------|--------|------|
| TC-GQ-REG-001 | 缺陷 1：GraphQLRouter 拦截 `POST /` RPC 调用 | 路由注册后测试 RPC | GraphQL 和 RPC 路径分离，无冲突 | P0 | 待实现 |
| TC-GQ-REG-002 | 缺陷 2：JSONScalar ObjectId 序列化为 `"ObjectId('...')"` | 查询含 ObjectId 的文档 | ObjectId 为无前缀 hex 字符串 | P0 | 待实现 |
| TC-GQ-REG-003 | 缺陷 4：`strawberry.ID.__str__` 返回 `"ID('...')"` | resolve_reference 使用 str(id) | 值为 `"proj-1"` 而非 `"ID('proj-1')"` | P0 | 待实现 |
| TC-GQ-REG-004 | 缺陷 6：StrEnum 序列化为 `"StatusEnum.ACTIVE"` | 使用 StrEnum 的 GraphQL enum | `str()` 返回 `"active"` 而非 `"StatusEnum.ACTIVE"` | P1 | 待实现 |
| TC-GQ-REG-005 | 缺陷 7：DataLoader batch_load_fn 未使用 $in | 批量查询 45 个文档 | 合并为 3 次 $in 查询（非 45 次 find_one） | P0 | 待实现 |

---

## 六、追溯矩阵

| 需求项（PRD） | 验收标准 | 覆盖用例 |
|--------------|---------|---------|
| FR-01 文档查询（Query.documents） | 返回类型安全的 Document 列表 | UT-GQ-02 ~ 04 |
| FR-02 知识库查询（Query.knowledgeFiles） | 支持 scope/category 过滤 | UT-GQ-01, UT-GQ-05 |
| FR-03 跨服务查询聚合 | 多子图联合查询 | UT-GQ-07, IT-GQ-03 |
| FR-04 Mutation 操作 | create/update/delete/writeFile | UT-GQ-12 ~ 15 |
| FR-05 RPC 适配器错误转换 | code → GraphQL error | UT-GQ-16 ~ 18 |
| FR-06 DataLoader 批处理 | N+1 → 批量 RPC | UT-GQ-08 ~ 11 |
| FR-07 Federation @key 解析 | _entities 查询正确 | UT-GQ-19 ~ 21 |
| FR-08 查询深度限制 | depth > 5 拒绝 | UT-GQ-22 ~ 23 |
| FR-09 自定义标量 | JSON/DateTime 序列化 | UT-GQ-25 ~ 29 |
| FR-10 双协议共存 | RPC + GraphQL 互不影响 | IT-GQ-04 |
| NFR 安全（introspection 禁用） | 生产环境拒绝 schema 探测 | UT-GQ-24 |

---

## 七、覆盖缺口

| 编号 | 缺口 | 影响 | 建议 |
|------|------|------|------|
| G-1 | GraphQL Subscription（chatStream → SSE）未充分测试 | WebSocket/SSE 传输层测试缺失 | 使用 Strawberry test client 的 subscribe 接口测试 |
| G-2 | 真实 Apollo Gateway 联邦组合测试 | 单体测试无法验证多子图 Gateway 组合 | 后续搭建多服务测试环境 |
| G-3 | 查询复杂度限制（max_complexity）未测试 | 资源耗尽攻击防护验证缺失 | 实现 `MaxComplexityLimiter` 后补充 |
| G-4 | 前端 GraphQL Codegen 类型生成未验证 | TypeScript 类型与 Python 类型可能不一致 | 对比 `print_schema` 输出与 TypeScript 类型定义 |