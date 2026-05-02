---
name: self-improving
description: |
  Agent harness performance system. Measures, aggregates, and drives
  closed-loop improvement for the generate-document and implement-code
  pipelines. Harvests per-document Workflow Standardization Review and
  System Architecture Evolution Thinking, then feeds consolidated
  performance intelligence into the weekly report.
user_invocable: true
lifecycle: default-pipeline
agents:
  required:
    - weekly-analyzer
  optional: []
contracts:
  output: shared/agent-output-contract.md
---

# self-improving

## Positioning

`self-improving` is the **agent harness performance system** for the documentation and implementation pipeline. It treats every feature delivery as a performance sample, harvesting standardized reflection sections to measure process friction, architectural drift, and feedback-loop health across the entire agent ecosystem.

It does not generate primary artifacts; it **measures** how well the harness produces them, **aggregates** performance signals into trends, and **drives** closed-loop improvement through the weekly report.

### When to use

- After any `generate-document` or `implement-code` run, to persist per-document reflection data.
- During `/generate-document weekly`, to aggregate reflection data into the weekly report §5.2 and §5.3.
- Manually via `/self-improving collect` to refresh the aggregation cache.

### When NOT to use

- When no feature documents exist yet (empty harvest is normal, but the skill will report it).
- As a substitute for `weekly-analyzer` (this skill supplies *inputs* to the analyzer, it does not replace it).

## Commands

### Collect per-document reflections

```
/self-improving collect
```

Scans `docs/<feature-name>/*.md` for `Workflow Standardization Review` and `System Architecture Evolution Thinking` sections, writes consolidated cache to `docs/.memory/self-improvement-cache.jsonl`.

### Generate weekly aggregation

```
/self-improving weekly <YYYY-MM-DD>
```

Reads the cache, filters by the specified natural week, and produces `docs/weekly/<week-range>/self-improvement-aggregate.md`. This file is consumed by `weekly-analyzer` when composing the weekly report.

## Input Artifacts

- `docs/<feature-name>/01_requirement-document.md`
- `docs/<feature-name>/02_requirement-tasks.md`
- `docs/<feature-name>/03_design-document.md`
- `docs/<feature-name>/04_usage-document.md`
- `docs/<feature-name>/05_dynamic-checklist.md`
- `docs/<feature-name>/06_process-summary.md`
- `docs/<feature-name>/07_project-report.md`

## Output Artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| Cache | `docs/.memory/self-improvement-cache.jsonl` | Append-only line-delimited JSON of extracted sections |
| Weekly aggregate | `docs/weekly/<week>/self-improvement-aggregate.md` | Markdown tables ready for injection into weekly report |

## Delta Rules

### 1. Harvest contract enforcement

Every document produced by `generate-document` or `implement-code` MUST contain the two standardized reflection sections. If a document is missing them, `self-improving` logs a P1 gap and appends a stub reminder to the cache.

### 2. Aggregation logic

- **Workflow Standardization Review**: Count "Yes/No/Partial" answers per question across all features; surface repeated manual operations and missing decision criteria.
- **System Architecture Evolution Thinking**: Extract bottleneck type (performance / maintainability / scalability / security / none) and evolution-node descriptions; flag features that share the same bottleneck.

### 3. Weekly hand-off

`weekly-analyzer` MUST read `self-improvement-aggregate.md` before writing weekly report §5.2 and §5.3. The analyzer may interpret and prioritize, but it must not fabricate data that contradicts the aggregate.

## Stop Conditions

- No feature directories under `docs/`: output empty aggregate with note "no active user story cases this week".
- Cache corruption: rebuild from full scan instead of incremental append.

## Supporting Files

```
.claude/skills/self-improving/
├── SKILL.md                    # Entry + manifest (this file)
├── README.md                   # Quick start
├── rules/
│   ├── collection-contract.md  # Per-document section format + extraction rules
│   └── weekly-integration.md   # How aggregate feeds into weekly-report.md
└── scripts/
    └── collect-self-improvement.js
```