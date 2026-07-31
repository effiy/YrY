---
title: SQL 生成 Prompt
tags: [Prompt, SQL, 自然语言转SQL]
category: resources/prompts
created: 2026-07-31
updated: 2026-07-31
source: internal
type: prompt
status: stable
---

# SQL 生成 Prompt

## 1. 适用场景

用户用自然语言问业务问题，LLM 转 SQL 查询数据库。典型场景：售后业务数据查询、运营报表生成、业务用户自助取数。

## 2. 输入变量

| 变量 | 含义 |
|---|---|
| `{dialect}` | SQL 方言（MySQL / PostgreSQL / MongoDB 等） |
| `{schema}` | 表结构 + 字段说明 + 关系 |
| `{business_glossary}` | 业务术语到字段的映射 |
| `{user_question}` | 用户自然语言问题 |
| `{examples}` | few-shot 示例（query-SQL 对） |
| `{read_only}` | 是否只允许 SELECT |

## 3. System Prompt

```
You are a SQL generator for the after-sales business database.

Dialect: {dialect}
Read-only mode: {read_only} (only SELECT allowed)

Schema:
{schema}

Business glossary (maps business terms to fields):
{business_glossary}

Rules:
1. Generate ONLY the SQL. No prose, no explanation, no markdown fences.
2. Use only SELECT statements. Never INSERT/UPDATE/DELETE/DROP/ALTER.
3. Use business glossary to map business terms (e.g., "异响" → field cases.issue_type='noise').
4. If the question is ambiguous, output: "AMBIGUOUS: <clarification question>".
5. If schema doesn't support the query, output: "NOT_SUPPORTED: <reason>".
6. Date ranges: use relative to today unless user specifies absolute dates. "上月" = previous calendar month.
7. Limit results to 100 rows by default unless user specifies otherwise.
8. Quote identifiers with backticks.
9. Avoid SELECT *, list specific columns.

Few-shot examples:
{examples}

User question:
<question>
{user_question}
</question>

SQL:
```

## 4. Schema 注入格式

```
Table cases:
- id (BIGINT, primary key)
- model (VARCHAR, e.g., 'X', 'Y', 'Z')
- issue_type (VARCHAR, e.g., 'noise', 'leak', 'power')
- created_at (DATETIME)
- status (VARCHAR, e.g., 'open', 'closed')
- region (VARCHAR, e.g., 'EU', 'CN', 'US')
- customer_id (BIGINT, foreign key to customers.id)

Table customers:
- id (BIGINT, primary key)
- name (VARCHAR)
- country (VARCHAR)
- segment (VARCHAR, e.g., 'enterprise', 'smb')
```

## 5. 业务术语表示例

```json
{
  "异响": "cases.issue_type = 'noise'",
  "漏水": "cases.issue_type = 'leak'",
  "上月": "created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
  "Model X": "cases.model = 'X'"
}
```

## 6. few-shot 示例

```
Q: 上月 Model X 异响案例有多少？
A: SELECT COUNT(*) FROM cases WHERE model='X' AND issue_type='noise' AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')

Q: 上季度各区域工单数
A: SELECT region, COUNT(*) FROM cases WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL DAYOFQUARTER(CURDATE())-1 DAY) GROUP BY region
```

## 7. 期望输出

纯 SQL，无 fence：

```sql
SELECT COUNT(*) FROM cases WHERE model='X' AND issue_type='noise' AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')
```

## 8. 调试笔记

- **temperature**：0（确定性最强）
- **top_p**：1.0
- **max_tokens**：500（SQL 通常不长）
- **schema 太长**：把不相关表过滤后再注入（用 RAG 选相关表）
- **方言差异**：日期函数、LIMIT 语法、字符串引号因方言而异
- **业务术语**：维护业务术语→SQL 片段的字典，常更新
- **few-shot 必要**：5-10 个高质量示例提升准确率
- **执行前 schema 校验**：用 sqlparse / sqlglot 校验 SQL 合法性
- **只读执行**：DB 用户权限只读，双层防御
- **超时**：执行硬超时（30s），避免长查询拖垮服务

## 9. 评估指标

| 指标 | 目标 |
|---|---|
| 语法合法率 | ≥ 95% |
| 业务正确率（人工评测） | ≥ 85% |
| 模糊识别率 | 应该问时能问 |
| 执行成功率 | ≥ 90% |
| 平均执行时长 | < 5s |

## 10. 失败模式

| 失败 | 现象 | 防御 |
|---|---|---|
| SELECT * | 字段全取，性能差 | system prompt 禁止 + 后处理检查 |
| 跨表 JOIN 错 | 关系理解错 | schema 中明确外键关系 |
| 日期理解错 | "上月" 用错 | 业务术语表 + few-shot |
| 编造字段 | 字段名不在 schema | schema 校验 + 后处理 |
| 越权 | 生成 DELETE | 只读 DB 用户 + SQL 静态校验 |
| 长 SQL 超时 | 复杂查询 | 限制 JOIN 数量 + 执行超时 |

## 11. 工程集成

```
User question
   ↓
LLM call (本 prompt)
   ↓
SQL output
   ↓
SQL validation (sqlglot 解析 + 静态检查)
   ↓
Execute (read-only DB user, timeout 30s)
   ↓
Result formatting (markdown table / chart)
   ↓
Answer to user with citation
```

## 12. 安全要点

1. **只读 DB 用户**：双层防御，即使 SQL 有 DELETE 也会被 DB 拒绝
2. **白名单表**：只暴露允许查询的表
3. **行级权限**：按用户身份过滤（如只能看自己区域数据）
4. **超时**：单查询 30s，避免长查询拖垮
5. **限流**：单用户每分钟查询数限制
6. **审计**：所有 SQL 执行日志留存

## 13. 与 YiAi 集成

- YiAi BRD：用户问"上月 X 型异响多少" → SQL 生成 → 执行 → 数据进 BRD 章节
- 评估：50 条业务 query，月度跑语法 + 业务正确率

## 14. 关联

- 相关：[agent-tool-use-prompt.md](./agent-tool-use-prompt.md)（SQL 作为工具调用）
- 模板：[tech-selection-evaluation-summary.md](../templates/tech-selection-evaluation-summary.md)
