---
title: 图查询联邦层
tags: [功能, 后端, 图查询, 接口]
category: 问题/功能
created: 2026-08-22
updated: 2026-08-25
source: 内部
type: 问题
status: 待排期
priority: 低
issue_type: 功能
project: YiAi
project_id: yiai
owner: 陈铭
estimate_points: 8
review_status: 待评审
prd_month: "202608"
prd_task_id: "6"
roles: [engineer]
---

# GraphQL 联邦层

## 基本信息

| 字段 | 值 |
|------|-----|
| 需求编号 | 6 |
| 项目 | YiAi (FastAPI Backend) |
| 代码仓库 | `YrY/YiAi` |
| 功能模块 | API Gateway |
| 优先级 | 低 |
| 人天 | 8.0d |
| 状态 | 待排期 |

### 功能概述

在现有 RPC envelope 之上构建 GraphQL 网关层，为外部前端提供类型安全的查询接口。当前 RPC envelope 对所有调用使用 `POST /` 通用端点，GraphQL 层提供强类型的 Schema 定义和查询能力。

### 技术实现

#### GraphQL Schema 设计

```graphql
type Query {
  # 知识库查询
  knowledgeFiles(
    category: String
    tags: [String!]
    roles: [String!]
    limit: Int = 20
  ): [KnowledgeFile!]!

  # Issue 查询
  issues(
    projectKey: String!
    status: IssueStatus
    priority: Priority
  ): [Issue!]!

  # 项目查询
  projects: [Project!]!

  # RAG 检索
  ragQuery(
    query: String!
    topK: Int = 3
    category: String
  ): RagResult!
}

type Mutation {
  # 知识文件操作
  writeFile(targetFile: String!, content: String!): WriteResult!
  scanKnowledge: ScanResult!

  # Issue 操作
  createIssue(input: IssueInput!): Issue!
  updateIssue(key: String!, input: IssueInput!): Issue!
}
```

#### 技术选型

- **GraphQL 框架**：Strawberry（Python，类型安全，支持 FastAPI 集成）
- **Schema 构建**：代码优先（code-first），从 Python 类型生成 Schema
- **与 FastAPI 集成**：`strawberry.fastapi.GraphQLRouter`
- **端点**：`POST /graphql`（与现有 `POST /` RPC 端点并存）

#### 实现策略

- GraphQL 层作为薄封装层，调用现有 RPC Service
- 不修改现有 RPC envelope 接口
- 类型映射：Python dataclass → GraphQL Type
- 权限控制：复用现有 JWT 认证中间件

#### 性能考量

- GraphQL 查询解析开销 < 5ms
- 使用 DataLoader 避免 N+1 查询
- 查询复杂度限制（max_depth = 5）
- 响应缓存（可选，Redis）

### 关联模块

- 后端框架：FastAPI + Strawberry
- 现有 RPC 层：`services/` 各模块
- 认证：`domain/auth/`
- 配置：`config.yaml`

### 验收标准

1. GraphQL Schema 定义完整的 Query 和 Mutation 类型
2. 知识库查询、Issue 查询、RAG 检索通过 GraphQL 可用
3. 与现有 RPC envelope 共存，不互相影响
4. 类型安全：Python 类型与 GraphQL Schema 一致
5. GraphQL Playground 可访问（开发环境）

---

*来源: `projects/yiai/requires/2026-08/graphql-federation-layer.md`*