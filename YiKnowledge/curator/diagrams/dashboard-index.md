---
title: Knowledge Dashboard Index
aliases: [dashboard-index, knowledge-dashboards, metrics-dashboards]
tags: [curator, diagrams, dashboard, metrics, health]
category: curator/diagrams
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Curators track knowledge base health through dashboards — file counts, freshness, coverage, and quality"
acceptance_criteria:
  - "4 dashboard categories: volume, freshness, quality, coverage"
  - "each dashboard has metrics, thresholds, and current status"
  - "linked to governance processes"
related:
  - ./README.md
  - ./knowledge-map.md
  - ../治理/governance.md
  - ../治理/readiness-checklist.md
---

# Knowledge Dashboard Index

> **Purpose:** Track the health of the knowledge base through quantitative dashboards. Review monthly.

## Dashboard 1: Volume — How much knowledge exists?

| Metric | Current | 3 months ago | Trend | Target |
|---|---|---|---|---|
| Total files (excluding rss/) | 427 | ~200 | ↑ | Steady growth |
| engineer/ files | 50 | ~40 | ↑ | 50-60 |
| leader/ files | 45 | ~35 | ↑ | 45-55 |
| srer/ files | 20 | 8 | ↑↑ | 25-30 |
| aier/ files | 26 | 12 | ↑↑ | 25-30 |
| Templates (curator/templates/) | 11 | 0 | ↑↑ | 11-15 |
| Prompt templates (aier/提示词/) | 8 | 0 | ↑↑ | 8-12 |

**Status:** All role directories are above minimum thresholds. Growth is healthy.

## Dashboard 2: Freshness — Is the knowledge current?

| Metric | Current | Threshold | Status |
|---|---|---|---|
| Files with `last_verified` field | ~60% | > 80% | ⚠️ Below target |
| Files verified within 6 months | ~50% | > 70% | ⚠️ Below target |
| Files with `status: deprecated` | < 5% | < 10% | ✓ Healthy |
| Files with `lifecycle: active` | ~40% | > 50% | ⚠️ Below target |

**Action:** Run a freshness audit. Update `last_verified` on all files; mark stale files as deprecated.

```bash
# Find files not verified in 6 months
rg "^last_verified: 202[56]" YiKnowledge -l | while read f; do
  date=$(rg "^last_verified:" "$f" | head -1 | awk '{print $2}')
  # check if > 6 months ago
done
```

## Dashboard 3: Quality — Is the knowledge well-structured?

| Metric | Current | Threshold | Status |
|---|---|---|---|
| Files with complete frontmatter (8 required fields) | ~70% | > 90% | ⚠️ Below target |
| Files with `benefit:` field | ~50% | > 80% | ⚠️ Below target |
| Files with `acceptance_criteria:` | ~40% | > 70% | ⚠️ Below target |
| Files with `roles:` field | ~60% | > 80% | ⚠️ Below target |
| Dead `related:` links | Unknown | < 5% | ⚠️ Not measured |

**Action:** Run the readiness checklist on all files; prioritize `benefit:` and `acceptance_criteria:` fields (critical for RAG retrieval).

```bash
# Find files missing benefit field
find YiKnowledge -name "*.md" -not -path "*/rss/*" | while read f; do
  if ! rg -q "^benefit:" "$f"; then
    echo "MISSING benefit: $f"
  fi
done
```

## Dashboard 4: Coverage — Are all topics covered?

| Topic | Status | Files | Gaps |
|---|---|---|---|
| API design | ✓ Covered | engineer/build/implement-an-api.md | — |
| RPC protocol | ✓ Covered | engineer/build/implement-cross-project-rpc-call.md | — |
| SSE streaming | ✓ Covered | engineer/build/implement-sse-streaming.md | — |
| RAG patterns | ✓ Covered | aier/基础/RAG设计模式.md | — |
| Agent architecture | ✓ Covered | aier/方法/智能体架构模式.md | — |
| Incident response | ✓ Covered | srer/incident-response/ | — |
| Observability | ✓ Covered | srer/observability/ | — |
| Release management | ✓ Covered | srer/release/ | — |
| Sprint management | ✓ Covered | producter/delivery/run-a-sprint.md | — |
| User research | ✓ Covered | producter/frameworks/do-user-research.md | — |
| Competitor analysis | ✓ Covered | executiver/industry/competitors/ | — |
| YiVad component reference | ✗ Missing | — | Needs component library doc |
| YiPet debugging guide | ✗ Missing | — | Needs content script debug guide |
| E2E test strategy | ✗ Missing | — | Needs cross-project test doc |

## Monthly Review Checklist

- [ ] Update file counts per role directory
- [ ] Run freshness audit: `last_verified` > 6 months → flag
- [ ] Run quality audit: missing `benefit:` or `acceptance_criteria:` → flag
- [ ] Review coverage gaps: any new topics that need documentation?
- [ ] Update this dashboard with current numbers

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Dashboards without thresholds | Can't tell if numbers are good or bad | Every metric needs a target or threshold |
| Dashboards reviewed annually | Issues fester for 12 months | Monthly review; automated where possible |
| Coverage gaps logged but never actioned | Gap list grows; nothing is filled | Assign an owner to each gap; track in sprint |