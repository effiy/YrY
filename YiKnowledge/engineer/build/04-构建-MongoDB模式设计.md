---
title: "MongoDB Schema Design Guide"
aliases: [mongodb-schema, schema-design, data-modeling, document-model]
tags: [mongodb, schema, data-modeling, document-design, build]
category: engineer/build
created: 2026-09-15
updated: 2026-09-15
last_verified: 2026-09-15
source: internal
type: howto
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "Design MongoDB schemas correctly — embedding vs referencing, index strategy, naming conventions"
acceptance_criteria:
  - "Embedding vs referencing decision framework"
  - "Collection naming conventions"
  - "Index strategy for common query patterns"
  - "YrY-specific collection examples"
related:
  - ../ship/03-交付-数据迁移.md
  - ../projects/01-项目-YiAi项目.md
  - ./cross-project-rpc-protocol.md
---

# MongoDB 模式设计指南

> YiAi 使用 MongoDB 作为唯一数据库。MongoDB 是文档数据库，模式设计决策直接影响查询性能、数据一致性和维护成本。**核心权衡**：嵌入（embedding）减少查询次数但增加文档大小，引用（referencing）保持文档精简但需要额外查询。

## 集合命名规范

| 规范 | 示例 | 说明 |
|------|------|------|
| 小写下划线 | `chat_records`, `knowledge_files` | 不用驼峰或连字符 |
| 复数形式 | `projects`, `sessions`, `users` | 集合表示多条记录 |
| 避免缩写 | `notifications` 而非 `notifs` | 清晰优先于简短 |
| 字典表前缀 | `dict_status`, `dict_role` | 区分业务表和数据字典 |

### YrY 现有集合清单

| 集合 | 用途 | 数据量级 | 关键字段 |
|------|------|---------|---------|
| `sessions` | 聊天会话 | 百级 | `key`, `messages[]`, `title`, `tags` |
| `menus` | 动态菜单 | 十级 | `path`, `name`, `parent`, `component` |
| `users` | 用户账户 | 十级 | `username`, `password_hash`, `roles` |
| `projects` | 项目 | 十级 | `name`, `status`, `members[]` |
| `issues` | 任务 | 百级 | `title`, `project_id`, `status`, `assignee` |
| `bugs` | 缺陷 | 十级 | `title`, `project`, `severity`, `status` |
| `knowledge_files` | 知识元数据 | 百级 | `path`, `title`, `tags`, `frontmatter` |
| `static_files` | 文件备份 | 十级 | `path`, `content`, `is_base64` |
| `chat_records` | 聊天记录 | 千级 | `session_key`, `role`, `content` |

## 嵌入 vs 引用

### 决策框架

```
数据一起读取吗？──是──→ 数据有独立的生命周期吗？──否──→ 嵌入
    │                        │
   否                        是
    │                        │
    ▼                        ▼
  引用                     数据会无限增长吗？──是──→ 引用
                              │
                             否
                              │
                              ▼
                            嵌入（子集）
```

### 何时嵌入

```json
// ✓ 会话中的消息——总是一起读取，生命周期与会话绑定
{
  "_id": "...",
  "key": "session-123",
  "title": "讨论架构",
  "messages": [
    { "role": "user", "content": "...", "timestamp": "2026-09-15T10:00:00Z" },
    { "role": "assistant", "content": "...", "timestamp": "2026-09-15T10:00:05Z" }
  ]
}
```

```json
// ✓ 项目中的成员列表——有限数组，总是一起展示
{
  "_id": "...",
  "name": "YrY 单体仓库",
  "members": [
    { "user_id": "u1", "role": "owner", "joined_at": "..." },
    { "user_id": "u2", "role": "member", "joined_at": "..." }
  ]
}
```

### 何时引用

```json
// ✓ issue 引用 project——project 独立存在，issue 可能很多
{
  "_id": "...",
  "title": "修复 SSE 流中断 Bug",
  "project_id": "64f1a2b3c4d5e6f7a8b9c0d1",  // ← 引用
  "status": "in_progress"
}
```

```json
// ✓ 聊天记录独立存储——无限增长，不能嵌入 session
// 集合: chat_records
{
  "_id": "...",
  "session_key": "session-123",
  "role": "user",
  "content": "你好",
  "created_at": "2026-09-15T10:00:00Z"
}
```

### 经验法则

| 场景 | 选择 | 原因 |
|------|------|------|
| 数据总是一起读取 | 嵌入 | 减少查询次数 |
| 子文档数量 ≤ 100 | 嵌入 | MongoDB 单文档 16MB 限制 |
| 子文档会无限增长 | 引用 | 如聊天记录、日志 |
| 子文档被多个父文档共享 | 引用 | 避免数据重复 |
| 子文档需要独立查询和排序 | 引用 | 内嵌数组查询有局限性 |
| 子文档频繁独立更新 | 引用 | 避免大文档频繁写入 |

## 字段设计原则

### 命名一致

```json
// ✓ 所有集合统一使用 snake_case
{ "project_id": "...", "created_at": "...", "updated_at": "..." }

// ✗ 不同集合混用命名风格
// projects 用 project_id，但 issues 用 projectId
```

### 避免深层嵌套

```json
// ✗ 嵌套超过 3 层，查询和更新困难
{
  "project": {
    "details": {
      "owner": {
        "profile": {
          "name": "..."  // 第 5 层
        }
      }
    }
  }
}

// ✓ 最多 2-3 层
{
  "project": {
    "name": "...",
    "owner_name": "...",
    "owner_avatar": "..."
  }
}
```

### 使用数组存储有序列表

```json
// ✓ 有序数据用数组
{ "tags": ["bug", "frontend", "urgent"] }

// ✓ 固定顺序的选项列表
{ "statuses": ["backlog", "todo", "in_progress", "done"] }
```

### 布尔字段命名

```json
// ✓ 使用 is_ 前缀表示布尔值
{ "is_active": true, "is_deleted": false, "has_attachments": true }
```

## 索引策略

### 索引创建原则

```javascript
// 1. 为所有查询条件中的字段创建索引
db.projects.createIndex({ "status": 1 });

// 2. 为排序字段创建索引
db.issues.createIndex({ "created_at": -1 });

// 3. 复合索引：等值查询在前，范围查询在后
db.issues.createIndex({ "project_id": 1, "status": 1, "created_at": -1 });
// project_id = X AND status = Y ORDER BY created_at DESC

// 4. 文本索引用于搜索
db.knowledge_files.createIndex({ "title": "text", "tags": "text" });

// 5. 唯一索引防止重复
db.users.createIndex({ "username": 1 }, { unique: true });
```

### YrY 推荐的索引

| 集合 | 索引 | 类型 | 原因 |
|------|------|------|------|
| `sessions` | `{key: 1}` | 唯一 | 按会话 key 查找 |
| `issues` | `{project_id: 1, status: 1}` | 复合 | 按项目和状态过滤 |
| `issues` | `{assignee: 1, created_at: -1}` | 复合 | 我的任务列表 |
| `bugs` | `{project: 1, severity: 1}` | 复合 | Bug 列表过滤 |
| `knowledge_files` | `{title: "text", tags: "text"}` | 文本 | 知识库搜索 |
| `chat_records` | `{session_key: 1, created_at: -1}` | 复合 | 聊天记录查询 |
| `static_files` | `{path: 1}` | 唯一 | 文件路径查找 |

### 索引使用检查

```javascript
// 用 explain 检查查询是否使用索引
db.issues.find({ project_id: "p1", status: "active" }).explain("executionStats");
// 关注: winningPlan.inputStage.stage === "IXSCAN" (索引扫描)
// 避免: winningPlan.inputStage.stage === "COLLSCAN" (全表扫描)
```

## 数据一致性

### 软删除模式

```json
// 不物理删除，标记 is_deleted
{
  "_id": "...",
  "title": "旧项目",
  "is_deleted": true,
  "deleted_at": "2026-09-15T10:00:00Z"
}

// 所有查询默认过滤已删除文档
db.projects.find({ "is_deleted": { "$ne": true } });
```

### 时间戳约定

```json
// 每个文档都应包含
{
  "created_at": "2026-09-15T10:00:00Z",  // ISO 8601 UTC
  "updated_at": "2026-09-15T12:00:00Z"
}
```

## 查询优化

### 投影减少传输

```javascript
// 只返回需要的字段
db.projects.find(
  { status: "active" },
  { name: 1, status: 1, _id: 0 }  // 投影
);
```

### 分页避免 skip

```javascript
// ✗ 大偏移量分页效率低
db.issues.find().skip(1000).limit(20);

// ✓ 使用范围查询 + 索引
db.issues.find({ created_at: { "$lt": lastSeenDate } })
  .sort({ created_at: -1 }).limit(20);
```

### 聚合管道优化

```javascript
// 将 $match 和 $limit 放在流水线前面
db.issues.aggregate([
  { "$match": { project_id: "p1" } },      // ← 先用索引过滤
  { "$sort": { created_at: -1 } },
  { "$limit": 20 },
  { "$lookup": { ... } }                    // ← 最后做关联
]);
```

## 反模式

| 反模式 | 为什么失败 | 正确做法 |
|---|---|---|
| 用 `_id` 做业务主键 | ObjectId 无业务含义，迁移困难 | 添加 `key` 或 `slug` 字段做业务标识 |
| 无限制的嵌入数组 | 文档超过 16MB 限制 | 预估数据量，可能无限增长的用引用 |
| 无索引的大集合查询 | 全表扫描，随数据增长性能线性下降 | 分析查询模式，按需创建索引 |
| 所有字段建索引 | 写入变慢，内存浪费 | 只为查询条件的字段建索引 |
| 字段类型不一致 | 同一字段在`"123"`和`123`间切换 | 在应用层校验字段类型 |