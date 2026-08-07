---
title: SQL Generation Prompt
aliases:
- sql-generation-prompt
- text-to-sql-prompt
tags:
- prompt
- sql
- text-to-sql
- nl2sql
category: ai-engineer/methodology/prompts
created: 2026-07-31
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: prompt
status: stable
lifecycle: active
review_cycle: yearly
roles:
- ai-engineer
- product-manager
benefit: ai methodology sound
acceptance_criteria:
  - "prompt intent and expected output format are stated"
  - "input variables are documented with types and examples"
  - "edge cases and failure modes are addressed"
related:
- ./agent-tool-use.md
- ./rag-system.md
- ../../../knowledge-curator/templates/tech-selection-evaluation.md
- ../hallucination-mitigation.md
tacit: false
---

# SQL Generation Prompt

> **As an** AI engineer, **I want to** sql generation, **so that** ai methodology sound.

> System prompt for natural-language to SQL: inject schema + business glossary + few-shot, constrain LLM to only generate read-only SELECT, ask clarifying questions when ambiguous, explicitly explain when unsupported. Double-layer read-only defense (system prompt + DB user permissions).

## Summary

- User asks business questions in natural language → LLM generates read-only SQL → validate → execute → format and return
- Strict SELECT-only, no INSERT/UPDATE/DELETE/DROP/ALTER
- Business glossary locks mapping (e.g. "abnormal noise" → `cases.issue_type='noise'`)
- When ambiguous, output `AMBIGUOUS: <clarification>`; when schema doesn't support it, output `NOT_SUPPORTED: <reason>`
- Date relative to today (e.g. "last month" = previous calendar month); default LIMIT 100 rows

## Prompt body

### System Prompt

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
3. Use business glossary to map business terms (e.g., "abnormal noise" → field cases.issue_type='noise').
4. If the question is ambiguous, output: "AMBIGUOUS: <clarification question>".
5. If schema doesn't support the query, output: "NOT_SUPPORTED: <reason>".
6. Date ranges: use relative to today unless user specifies absolute dates. "Last month" = previous calendar month.
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

### Schema injection format

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

### Business glossary example

```json
{
  "abnormal noise": "cases.issue_type = 'noise'",
  "water leak": "cases.issue_type = 'leak'",
  "last month": "created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')",
  "Model X": "cases.model = 'X'"
}
```

### Few-shot example

```
Q: How many abnormal-noise cases for Model X last month?
A: SELECT COUNT(*) FROM cases WHERE model='X' AND issue_type='noise' AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')

Q: Ticket count by region last quarter
A: SELECT region, COUNT(*) FROM cases WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL DAYOFQUARTER(CURDATE())-1 DAY) GROUP BY region
```

### Expected output

Plain SQL, no fence:

```sql
SELECT COUNT(*) FROM cases WHERE model='X' AND issue_type='noise' AND created_at >= DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(CURDATE(), '%Y-%m-01')
```

## Variable explanation

| Variable | Meaning |
|---|---|
| `{dialect}` | SQL dialect (MySQL / PostgreSQL / MongoDB etc.) |
| `{schema}` | Table structure + field explanations + relationships |
| `{business_glossary}` | Mapping of business terms to fields |
| `{user_question}` | User's natural-language question |
| `{examples}` | Few-shot examples (query-SQL pairs) |
| `{read_only}` | Whether only SELECT is allowed |

## Usage suggestions

- **temperature**: 0 (most deterministic)
- **top_p**: 1.0
- **max_tokens**: 500 (SQL typically not long)
- **Schema too long**: filter irrelevant tables before injecting (use RAG to select relevant tables)
- **Dialect differences**: date functions, LIMIT syntax, string quoting vary by dialect
- **Business terms**: maintain a dictionary of business terms → SQL fragments, update regularly
- **Few-shot essential**: 5-10 high-quality examples improve accuracy
- **Pre-execution schema validation**: use sqlparse / sqlglot to validate SQL legality
- **Read-only execution**: DB user permissions read-only, double-layer defense
- **Timeout**: hard timeout (30s) to avoid long queries dragging down the service
- **Engineering pipeline**: user question → LLM call → SQL output → sqlglot validation + static check → read-only DB execution (30s timeout) → result formatting (markdown table / chart) → reference backfill → return to user
- **Integration**: YiAi BRD user asks "how many abnormal-noise cases for Model X last month" → SQL generation → execution → data goes into BRD section; 50 business queries run monthly for syntax + business correctness rate

## Anti-patterns

| Failure | Symptom | Defense |
|---|---|---|
| SELECT * | fetches all fields, poor performance | system prompt forbids + post-processing check |
| Wrong cross-table JOIN | misunderstood relationships | explicit foreign-key relationships in schema |
| Wrong date understanding | "last month" misused | business glossary + few-shot |
| Fabricated fields | field name not in schema | schema validation + post-processing |
| Privilege escalation | generates DELETE | read-only DB user + SQL static check |
| Long SQL timeout | complex query | limit JOIN count + execution timeout |

## Evaluation metrics

| Metric | Goal |
|---|---|
| Syntax legality rate | ≥ 95% |
| Business correctness rate (human eval) | ≥ 85% |
| Ambiguity recognition rate | asks when should ask |
| Execution success rate | ≥ 90% |
| Average execution duration | < 5s |

## Security points

1. **Read-only DB user**: double-layer defense; even if SQL has DELETE it is rejected by DB
2. **Whitelist tables**: only expose allowed tables
3. **Row-level permissions**: filter by user identity (e.g. only see own-region data)
4. **Timeout**: 30s per query to avoid long queries dragging down service
5. **Rate limiting**: limit queries per minute per user
6. **Audit**: retain all SQL execution logs

## Related

- As tool call: [agent-tool-use-prompt.md](./agent-tool-use.md)
- References and refusal: [rag-system-prompt.md](./rag-system.md)
- Selection methodology: [../../../knowledge-curator/templates/tech-selection-evaluation.md](../../../knowledge-curator/templates/tech-selection-evaluation.md)
- Hallucination defense: [../hallucination-mitigation.md](../hallucination-mitigation.md)
