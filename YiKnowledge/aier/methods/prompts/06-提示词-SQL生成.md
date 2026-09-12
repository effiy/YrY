---
title: SQL 生成 Prompt
aliases: [sql-generation-prompt, text-to-sql, sql-prompt, nl2sql, SQL生成]
tags: [prompt, sql, generation, database, query]
category: aier/methods/prompts
created: 2026-08-24
updated: 2026-09-10
source: internal
type: prompt
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer]
benefit: "AI 从自然语言生成安全、只读的 SQL 查询——具备 Schema 感知和注入防护能力"
acceptance_criteria:
  - "仅生成 SELECT 查询（只读）"
  - "包含 Schema 上下文以确保列引用准确"
  - "防止 SQL 注入和破坏性查询"
related:
  - ./03-提示词-代码审查.md
  - ../../../engineer/ship/
---

# SQL 生成 Prompt

## System Prompt

```
你是一个 SQL 查询生成器。**仅生成 SELECT 查询。** 绝不生成 INSERT、UPDATE、DELETE、DROP、ALTER 或 TRUNCATE 语句。

## 生成规则
1. **只读原则。** 仅 SELECT 查询。如果用户要求写操作，回复："我只能生成 SELECT 查询。写操作（INSERT/UPDATE/DELETE）需要人工审查后执行。"
2. **基于 Schema。** 仅引用提供的 Schema 中存在的表和列。不要臆造表名或列名。
3. **显式列名。** 使用具体的列名，不使用 `SELECT *`。当 Schema 变更时，显式列名不会意外引入或丢失字段。
4. **添加注释。** 用注释解释每个 CTE 或子查询的作用——让 SQL 可以被后续维护者理解。
5. **处理 NULL。** 在需要的地方使用 `COALESCE` 处理 NULL 值，用 `IS NULL` / `IS NOT NULL` 做 NULL 判断（不能用 `= NULL`）。
6. **限制结果。** 除非用户另外指定，始终添加 `LIMIT 100`。防止全表扫描产生性能问题。

## 数据库 Schema
{{schema}}

## 查询需求
{{question}}

仅输出 SQL 查询和必要注释。不要输出其他解释性文字。
```

### 变量说明

| 变量 | 含义 | 示例 |
|---|---|---|
| `{{schema}}` | 数据库 Schema（表名、列名、类型、关系） | `CREATE TABLE sessions (id TEXT PRIMARY KEY, title TEXT, messages JSONB, created_at TIMESTAMP, ...)` |
| `{{question}}` | 自然语言查询需求 | "显示本周最活跃的 10 个聊天会话及其消息数量" |

## 完整示例

### 输入
```
Schema:
- sessions: id, title, messages, created_at, updated_at, user_id
- bugs: key, title, severity, status, project, module, created_at, assignee
- users: id, username, role, created_at

关系: sessions.user_id → users.id, bugs.assignee → users.id

查询需求: 本月每个项目报告了多少 Bug？按数量降序排列。
```

### 期望输出
```sql
-- 按项目统计本月新增 Bug 数量
SELECT
    project,
    COUNT(*) AS bug_count
FROM bugs
WHERE
    created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY project
ORDER BY bug_count DESC
LIMIT 100;
```

## 安全规则

| 规则 | 原因 | 违反后果 |
|---|---|---|
| **仅 SELECT** | 防止意外的数据修改或删除 | 数据丢失、业务中断 |
| **不使用 `SELECT *`** | Schema 变更时显式列名更安全，避免意外引入敏感字段 | 敏感数据泄露、查询结果不可预测 |
| **始终 LIMIT** | 防止意外的全表扫描，保护数据库性能 | 数据库负载飙升，服务不可用 |
| **仅使用 Schema 中存在的对象** | 防止 SQL 注入和臆造的表/列名 | 查询失败或返回错误结果 |
| **参数化查询（如适用）** | 防止 SQL 注入攻击 | 数据泄露或破坏 |

## 高级场景

### 场景一：跨表关联查询

```
-- 查询每个用户报告的 Bug 数量，包括未报告 Bug 的用户
SELECT
    u.username,
    COUNT(b.key) AS bug_count,
    COALESCE(STRING_AGG(DISTINCT b.severity, ', '), '无') AS severities
FROM users u
LEFT JOIN bugs b ON u.id = b.assignee
    AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.username
ORDER BY bug_count DESC
LIMIT 100;
```

### 场景二：窗口函数做排名

```
-- 每个项目中最新创建的 5 个 Bug（按创建时间排名）
SELECT *
FROM (
    SELECT
        *,
        ROW_NUMBER() OVER (PARTITION BY project ORDER BY created_at DESC) AS rn
    FROM bugs
    WHERE status != 'closed'
) ranked
WHERE rn <= 5
ORDER BY project, rn;
```

## 使用参数建议

| 参数 | 推荐值 | 原因 |
|---|---|---|
| Temperature | 0.0 | SQL 生成必须确定——相同需求每次生成相同查询 |
| Max Tokens | 500-1000 | SQL 查询通常简洁，不需要长篇输出 |

## 反模式

| 反模式 | 为什么失败 | 修复方案 |
|---|---|---|
| 不提供 Schema 生成 SQL | 模型臆造表名和列名，生成的 SQL 无法执行 | 始终在 Prompt 中提供完整的 Schema 上下文 |
| 生成的 SQL 使用 `SELECT *` | Schema 变更时查询结果不可预测，可能泄露新加的敏感字段 | Prompt 规则中明确要求显式列名 |
| 没有 LIMIT 子句 | 大表上全表扫描返回数百万行，数据库负载飙升 | 默认添加 `LIMIT 100`，Prompt 中强制要求 |
| 生成写操作 SQL | 意外的 INSERT/UPDATE/DELETE 导致数据损坏或丢失 | System Prompt 第一行即明确禁止，LLM 检查写操作请求 |
| 不处理 NULL 值 | `SELECT AVG(score)` 忽略 NULL，但 `score = NULL` 永远为 FALSE | Prompt 中提醒使用 `IS NULL` 和 `COALESCE` |
| 不标注索引依赖 | 生成的查询可能依赖不存在的索引，生产环境性能极差 | 在 Schema 中标注已有索引，生成 SQL 时考虑执行计划 |