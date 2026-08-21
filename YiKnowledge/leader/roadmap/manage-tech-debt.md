---
title: Manage Tech Debt
aliases: [tech-debt, technical-debt, debt-management]
tags: [roadmap, tech-debt, maintenance, leader]
category: leader/roadmap
created: 2026-08-18
updated: 2026-08-18
last_verified: 2026-08-18
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [leader]
benefit: "Track, prioritize, and reduce technical debt with a structured framework that balances debt reduction against feature delivery"
related:
  - ./plan-tech-roadmap.md
  - ./deprecate-a-feature.md
  - ./decommission-a-service.md
  - ../README.md
  - ../INDEX.md
---

# Manage Tech Debt

> **As a** tech lead, **I want to** track, prioritize, and reduce technical debt, **so that** the team maintains velocity and system reliability over time.

## Definition

Tech debt is any code, architecture, or operational practice that trades short-term speed for long-term cost. Like financial debt, it accrues interest — the longer you defer it, the more it costs to fix.

## Applicable scenarios

- Velocity is declining despite a stable team size
- On-call burden is increasing; incidents are more frequent
- Onboarding new engineers takes too long
- Simple changes require touching many files or services
- Dependencies are years out of date; security patches can't be applied

## Design steps

### Step 1: Identify and log tech debt

Sources of tech debt identification:

| Source | What to look for |
|---|---|
| **Incident postmortems** | Was the root cause a known tech debt item? |
| **Developer friction** | What do engineers complain about in retros? |
| **Code review** | Patterns of "we should fix this later" comments |
| **Dependency audit** | Outdated libraries, unsupported versions, security CVEs |
| **Architecture review** | Components that have outgrown their original design |
| **Onboarding pain** | What do new hires struggle with? |

### Step 2: Classify by type and impact

| Type | Example | Typical interest rate |
|---|---|---|
| **Architecture** | Monolith that should be split; wrong database for the access pattern | High — every feature is harder |
| **Code** | Duplicated logic, unclear naming, missing tests | Medium — slows down changes in that area |
| **Dependency** | Outdated libraries, unsupported frameworks | Medium — security risk grows over time |
| **Operational** | Manual deployments, no monitoring, no runbooks | High — every incident is worse |
| **Knowledge** | Only one person knows how X works | Critical — bus factor of 1 |

### Step 3: Quantify the cost

For each tech debt item, estimate:

| Metric | How to estimate |
|---|---|
| **Current cost** | How much time does it waste per sprint? (slower changes, manual workarounds) |
| **Future cost** | How fast is the cost growing? (linear, exponential?) |
| **Fix cost** | How many person-weeks to resolve? |
| **Risk** | What's the worst that could happen if we don't fix it? |

### Step 4: Prioritize

Use a simple ROI formula:

```
Priority score = (Current cost × Growth rate × Risk factor) / Fix cost
```

Also consider:

| Priority signal | Meaning |
|---|---|
| **Fixing it unlocks a feature** | High priority — debt is blocking value delivery |
| **Fixing it prevents a likely incident** | High priority — the risk is imminent |
| **Fixing it saves time every sprint** | Medium priority — steady ROI |
| **Fixing it would be "nice"** | Low priority — log it, but don't schedule yet |

### Step 5: Allocate capacity

Protect a fixed % of capacity for tech debt reduction:

| Situation | Recommended % |
|---|---|
| Greenfield project (< 6 months old) | 5–10% |
| Growing product (6 months – 2 years) | 15–20% |
| Mature product (2+ years) | 20–25% |
| Post-incident or audit finding | 30%+ temporarily |

If you can't allocate at least 15%, you're borrowing from the future. Document the risk.

### Step 6: Track reduction

| Metric | Why it matters |
|---|---|
| **Tech debt backlog size** | Is it growing or shrinking? |
| **Average age of debt items** | Are old items being resolved or ignored? |
| **% of capacity spent on debt** | Are you protecting the allocation? |
| **Incidents caused by known debt** | Are you paying the interest? |
| **Velocity trend** | Is debt reduction improving velocity? |

## Key outputs

- Tech debt register (backlog with classification, cost, and priority)
- Quarterly tech debt reduction plan (items to be resolved)
- Capacity allocation commitment (% of roadmap)
- Trend report: debt backlog size and age over time

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Tech debt sprint (once a year) | Debt accrues continuously; a once-a-year sprint doesn't keep up | Protect a fixed % every sprint |
| "We'll fix it in the next project" | The next project has its own deadlines and its own debt | Fix debt in the area you're already changing |
| Tracking debt but never prioritizing it | The backlog grows into a graveyard | Monthly review; if an item is never going to be fixed, delete it |
| Only tracking code debt | Operational and knowledge debt are equally damaging | Use the 5-type classification; audit all types |
| No visibility to stakeholders | Product doesn't understand why velocity is declining | Report tech debt cost in terms product understands: slower features, more incidents |

## This product's landing instance

*To be filled in with the current tech debt register. Include a link to the backlog, the top 5 items by priority, and the current % of capacity allocated to tech debt reduction.*