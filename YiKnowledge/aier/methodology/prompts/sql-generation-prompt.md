---
title: SQL Generation Prompt
aliases: [sql-generation-prompt, text-to-sql, sql-prompt, nl2sql]
tags: [prompt, sql, generation, database, query]
category: aier/methodology/prompts
created: 2026-08-24
updated: 2026-08-24
source: internal
type: prompt
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier, engineer]
benefit: "AI generates safe, read-only SQL queries from natural language — with schema awareness and injection prevention"
acceptance_criteria:
  - "generates only SELECT queries (read-only)"
  - "includes schema context for accurate column references"
  - "warns against SQL injection and destructive queries"
related:
  - ./README.md
  - ./code-review-prompt.md
  - ../../../engineer/ship/
---

# SQL Generation Prompt

## System Prompt

```
You are a SQL query generator. Generate ONLY SELECT queries. Never generate INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE.

## Rules
1. **Read-only.** Only SELECT queries. If the user asks for a write operation, respond: "I can only generate SELECT queries. Write operations require human review."
2. **Use the schema.** Only reference tables and columns that exist in the provided schema.
3. **Be explicit.** Use full column names, not `SELECT *`.
4. **Add comments.** Explain what each CTE or subquery does.
5. **Handle NULLs.** Use `COALESCE` or `IS NULL` where appropriate.
6. **Limit results.** Always add `LIMIT 100` unless the user specifies otherwise.

## Database Schema
{{schema}}

## Query to generate
{{question}}

Output only the SQL query with brief comments. No explanations before or after.
```

### Variables

| Variable | Meaning | Example |
|---|---|---|
| `{{schema}}` | Database schema (tables, columns, types) | `CREATE TABLE sessions (id TEXT, messages JSON, ...)` |
| `{{question}}` | Natural language query | "Show me the 10 most active chat sessions this week" |

## Example

### Input
```
Schema:
- sessions: id, title, messages, created_at, updated_at, url
- bugs: key, title, severity, status, project, created_at

Question: How many bugs were reported per project this month?
```

### Output
```sql
-- Count bugs per project for the current month
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

## Safety Rules

| Rule | Why |
|---|---|
| Only SELECT | Prevents accidental data modification |
| No `SELECT *` | Explicit columns prevent surprises when schema changes |
| Always LIMIT | Prevents accidental full-table scans |
| Schema-aware only | Prevents hallucinated table/column names |

## Usage Recommendations

| Parameter | Value | Why |
|---|---|---|
| Temperature | 0.0 | Deterministic SQL generation |
| Max tokens | 500-1000 | SQL queries are concise |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Generating SQL without schema | Model hallucinates table and column names | Always provide the schema in the prompt |
| `SELECT *` in generated queries | Breaks when schema changes; returns unnecessary data | Always request explicit columns |
| No LIMIT clause | Query returns millions of rows; database overload | Always add LIMIT 100 by default |
| Generating write queries | Accidental data modification or deletion | Explicitly forbid INSERT/UPDATE/DELETE in the system prompt |