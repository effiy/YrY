---
title: Plan Tech Roadmap
aliases: [tech-roadmap, engineering-roadmap, roadmap-planning]
tags: [roadmap, planning, engineering, leader]
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
benefit: "Plan the engineering roadmap by translating product priorities and tech investments into a sequenced, capacity-aware execution plan"
related:
  - ./do-a-capacity-plan.md
  - ./manage-tech-debt.md
  - ../../executiver/roadmap/annual-strategic-planning.md
  - ../../executiver/strategy/now-next-later-roadmap.md
  - ../README.md
  - ../INDEX.md
---

# Plan Tech Roadmap

> **As a** tech lead, **I want to** plan the engineering roadmap, **so that** the team has a clear, sequenced plan that balances product features, tech investment, and operational needs.

## Definition

The tech roadmap translates product priorities (from [Now/Next/Later](../../executiver/strategy/now-next-later-roadmap.md)) and tech investments into a sequenced engineering plan with capacity awareness.

It answers: "Given our capacity, what do we work on in what order, and why?"

## Applicable scenarios

- Quarterly engineering planning
- Aligning engineering capacity with product roadmap
- Making trade-offs between feature work and tech investment
- Communicating engineering priorities to product and business stakeholders
- Onboarding new team members to the engineering context

## Design steps

### Step 1: Gather inputs

| Input | Source | What to extract |
|---|---|---|
| Product roadmap | [Now/Next/Later](../../executiver/strategy/now-next-later-roadmap.md) | Prioritized outcomes for the quarter |
| Tech debt backlog | [manage-tech-debt.md](./manage-tech-debt.md) | Top tech debt items with impact and effort |
| Capacity estimate | [do-a-capacity-plan.md](./do-a-capacity-plan.md) | Available person-weeks per team |
| Operational load | Incident history, on-call data | % of capacity consumed by ops |
| Dependencies | Cross-team or external dependencies | Blockers that affect sequencing |

### Step 2: Categorize work

Classify every item into one of four categories:

| Category | What it includes | Target % of capacity |
|---|---|---|
| **Product features** | User-facing features, product outcomes | 50–60% |
| **Tech investment** | Tech debt reduction, platform improvements, architecture upgrades | 20–30% |
| **Operational** | On-call, incidents, support escalations, maintenance | 10–15% |
| **Exploration** | Spikes, PoCs, research, experiments | 5–10% |

If operational load consistently exceeds 15%, flag it — you're underinvesting in reliability or automation.

### Step 3: Size and sequence

For each item in the quarter:

| Attribute | How to determine |
|---|---|
| **Effort** | Person-weeks, based on [capacity plan](./do-a-capacity-plan.md) team estimates |
| **Confidence** | High (done before), Medium (similar work), Low (new territory) |
| **Dependencies** | What must be done first? What's blocked externally? |
| **Risk** | What could go wrong? How likely? What's the mitigation? |

Sequence items considering:
1. Dependencies (what blocks what)
2. Risk (risky items early — more time to recover)
3. Value (highest impact items spread across the quarter, not all at the end)
4. Team morale (mix of exciting and necessary work)

### Step 4: Balance the roadmap

Check for common imbalances:

| Imbalance | Symptom | Fix |
|---|---|---|
| 100% features, 0% tech investment | Tech debt is growing; velocity is declining | Protect 20% minimum for tech investment |
| Everything is high risk | No margin for error; one delay cascades | Break risky items into smaller milestones |
| Key person dependency | One engineer is on every critical path | Spread knowledge; pair on critical items |
| No buffer | Plan uses 100% of capacity | Leave 10–15% buffer for unexpected work |

### Step 5: Communicate the roadmap

Different audiences need different views:

| Audience | What they need | Format |
|---|---|---|
| **Engineering team** | Detailed tasks, who's doing what, timeline | Sprint board + roadmap doc |
| **Product** | What features ship when, what's at risk | Feature-focused roadmap |
| **Executives** | Key outcomes, major milestones, risks | One-pager with timeline |
| **Other teams** | Dependencies on us, what we need from them | Dependency matrix |

## Key outputs

- Sequenced quarterly engineering roadmap
- Capacity allocation breakdown (% per category)
- Risk register with mitigations
- Dependency matrix
- Stakeholder-specific communication artifacts

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Roadmap as a feature list | No consideration of tech investment or ops | Use the 4-category breakdown; protect non-feature work |
| 100% capacity utilization | No buffer for unexpected work; everything slips | Leave 10–15% buffer; track actual vs. planned |
| Dates without confidence levels | Stakeholders treat estimates as commitments | Label every item with confidence: High/Medium/Low |
| Roadmap set in stone | Doesn't adapt to new information | Monthly review; adjust based on actual velocity and new priorities |
| No tech investment visibility | Tech work is invisible to stakeholders | Show tech investment on the roadmap; explain the ROI |

## This product's landing instance

*To be filled in with the current quarter's engineering roadmap. Include a link to the roadmap board, the capacity allocation breakdown, and the top 3 risks.*