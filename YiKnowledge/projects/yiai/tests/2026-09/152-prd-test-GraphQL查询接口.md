---

doc_type: test
title: 'YA-09-146: GraphQL 查询接口 — Strawberry 集成 + Schema 自动生成 + DataLoader 防 N+1 —
  测试规格'
status: 待开始
priority: P2
owner: 陈铭
roles:
- engineer
- qa
created: 2026-09-11
updated: '2026-09-23'
project: YiAi
project_id: yiai
prd_month: '202609'
prd_task_id: YA-09-146
source_prds:
- 152-需求-GraphQL查询接口
source_modules: []
source_okr:
- yiai-001

type: test
---

# YA-09-146: GraphQL 查询接口 — 测试规格

> 来源 PRD：[152-需求-GraphQL查询接口.md](../../prds/2026-09/152-需求-GraphQL查询接口.md)
> 提取日期：2026-09-11 · 更新日期：2026-09-23

## 一、测试范围与策略

### 测试范围

- **类型定义**：`services/graphql/types.py` — Session, User, Bug, KnowledgeFile, FilterInput, PageInput 等 GraphQL 类型
- **DataLoader 批量加载**：`services/graphql/dataloaders.py` — UserLoader, SessionLoader, KnowledgeFileLoader 的 load/dispatch 方法
- **Query Resolver**：`services/graphql/schema.py` — session/sessions/bugs/search/projects 查询
- **Mutation Resolver**：`services/graphql/schema.py` — createIssue/updateBug/deleteDocument 变更
- **FastAPI 集成**：`services/graphql/routes.py` — GraphQL 端点注册、认证中间件

## 二、测试数据 / Fixtures

- `seed_mongodb` — 测试数据 fixture


## 三、详细测试用例

### TC-01: 按 key 查询单个会话
- **P0** | `data.session.key == "sess_001"` | `data.session.messageCount == 3`，不返回 `messages` 数组（按需返回）

### TC-02: 分页查询会话列表
- **P0** | `items` 长度 == 2，`pageInfo.total == 2`

### TC-03: 会话关联创建者（DataLoader 批量加载）
- **P0** | `sess_001.creator.username == "alice"`，`sess_002.creator.username == "bob"` | MongoDB `users` 集合仅被查询 1 次（批量 $in 合并）

### TC-04: 查询不存在的 key
- **P1** | 

### TC-05: 全局搜索跨集合
- **P1** | 

### TC-06: 创建 Issue
- **P0** | 

### TC-07: 更新 Bug 状态
- **P0** | 

### TC-08: 更新不存在的 Bug
- **P1** | 

### TC-09: 删除文档
- **P0** | 

### TC-10: 删除不允许的集合
- **P1** | 


## 四、边界与异常测试

### EC-01: 空结果集分页
- **步骤**：查询无匹配结果的 filter
- **预期**：`items` 为空数组，`pageInfo.total == 0`，不报错

### EC-02: pageSize 超过上限
- **步骤**：请求 `pageSize: 1000`（默认上限 100）
- **预期**：返回错误或自动截断为 100

### EC-03: 深层嵌套查询（超过 5 层）
- **步骤**：发送嵌套深度 > 5 的查询（session → creator → session → ...）
- **预期**：返回错误，提示查询深度超限

### EC-04: MongoDB 连接断开
- **步骤**：模拟 MongoDB 连接失败，发送查询
- **预期**：返回 `errors` 数组，不返回 HTTP 500


## 五、回归测试

### RG-01: 新增 GraphQL 后，现有 RPC 信封调用正常
- **步骤**：注册 GraphQL 路由后，发送标准 RPC 请求 `{module_name: "services.data.data_service", method_name: "query_documents", parameters: {cname: "bugs"}}`

### RG-02: `ENABLE_GRAPHIQL=false` 时界面不可访问
- **步骤**：设置 `ENABLE_GRAPHIQL=false`，访问 `GET /graphql`


## 六、可追溯性矩阵

| 测试用例 | 对应需求场景 | PRD 章节 |
|----------|-------------|----------|
| EC-01~04 | 边界/异常情况 | 七、风险与缓解 |
| RG-01 | GraphQL 不影响 RPC | 八、回滚策略 |
| RG-02 | GraphiQL 安全 | 七、风险 #3 |

## 七、覆盖率缺口

| 缺口 | 原因 | 建议 |
|------|------|------|
| DataLoader 多字段关联加载 | 本期仅测试 UserLoader，其余结构相同 | 补充 SessionLoader/KnowledgeFileLoader 测试 |
| 大结果集分页性能 | 需要 > 1000 条种子数据 | 使用 factory_boy 生成大数据量补充性能测试 |

*测试规格基于 PRD [152-需求-GraphQL查询接口.md](../../prds/2026-09/152-需求-GraphQL查询接口.md) 提取，覆盖 12 个用例 + 4 个边界测试 + 2 个回归测试。*
