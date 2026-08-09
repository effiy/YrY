---
title: Evaluate a build-vs-buy decision
aliases: [i-want-to-evaluate-a-build-vs-buy-decision, build-vs-buy, buy-vs-build, make-or-buy]
tags: [journey, methodology, procurement, strategy, governance, planning]
category: engineer/architecture-design
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: journey
lifecycle: active
status: stable
review_cycle: quarterly
roles: [engineer]
benefit: "findings are actionable"
acceptance_criteria:
  - "user story header defines who, what, and why"
  - "step-by-step guide is complete with prerequisites and expected outcome"
  - "cross-references to related journeys and patterns are present
related:
- ../../tech-lead/roadmap/do-a-proof-of-concept.md
  - ../../tech-lead/roadmap/do-a-tech-selection.md
  - ../../knowledge-curator/templates/thinking--first-principles.md
  - ../../knowledge-curator/templates/thinking--inversion.md
  - ../../knowledge-curator/templates/thinking--second-order-thinking.md
  - ../../knowledge-curator/templates/thinking--ockhams-razor.md
tacit: Build vs buy is not just cost comparison; it is a contract. Strategy + cost + capability + risk + time; anchored by core competitiveness; not by gut feel; measurable
---

# I want to evaluate a build vs buy decision

> **As an** engineer, **I want to** evaluate a build vs buy decision, **so that** findings are actionable.

## Summary

- Build vs buy = contract; not just cost comparison
- Strategy + cost + capability + risk + time; no missing dimension
- Anchored by core competitiveness; not by gut feel
- TCO not unit price; includes hidden and exit costs
- Links with POC + tech selection + RFP + vendor eval + budget + bootstrap
- Publicly queryable; not hidden
- Periodic review; evolution updates
- First principles / inversion / second-order / Occam

## Scenario

Build vs buy is a contract; not just cost comparison. This entry provides the decision full path, covering strategy + cost + capability + risk + time, anchored by core competitiveness not by gut feel, TCO not unit price including hidden and exit costs, linking with POC + tech selection + RFP + vendor eval + budget + bootstrap, publicly queryable, periodic review, and links to do-a-proof-of-concept / do-a-tech-selection / prepare-an-rfp / evaluate-a-vendor-saas / prepare-a-budget / bootstrap-a-new-project and other leaves.

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | POC | [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) |
| 2 hops | tech selection | [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) |
| 2 hops | RFP | [./prepare-an-rfp.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-rfp.md) |
| 2 hops | vendor SaaS | [./evaluate-a-vendor-saas.md](../engineering/evaluate-a-vendor-saas.md) |
| 2 hops | budget | [./prepare-a-budget.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md) |
| 2 hops | bootstrap | [./bootstrap-a-new-project.md](../engineering/bootstrap-a-new-project.md) |
| 2 hops | first-principles | [../../knowledge-curator/templates/thinking--first-principles.md](../../knowledge-curator/templates/thinking--first-principles.md) |
| 2 hops | inversion | [../../knowledge-curator/templates/thinking--inversion.md](../../knowledge-curator/templates/thinking--inversion.md) |
| 2 hops | second-order | [../../knowledge-curator/templates/thinking--second-order-thinking.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) |
| 2 hops | ockhams | [../../knowledge-curator/templates/thinking--ockhams-razor.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |

## Action recommendations

1. **Five dimensions**: strategy + cost + capability + risk + time; no missing dimension
2. **Anchored by core competitiveness**: non-core buy + core build; not by gut feel
3. **Strategy**: differentiation? moat?; do not omit
4. **Cost**: TCO + hidden + exit; not unit price
5. **Capability**: build capability + maintain capability + hiring; do not omit
6. **Risk**: vendor lock-in + data ownership + renewal; do not omit
7. **Time**: build cadence + buy launch time; do not omit
8. **Not unit price**: TCO includes 3-5 year maintenance; not unit price
9. **Not by gut feel**: rubric quantified + weights + judges; not vague
10. **No lock-in**: data exportable + API standard + exit clauses; do not omit
11. **Not binary**: build + buy mixed; can split
12. **POC validation**: build POC + vendor POC; not paper planning
13. **Link with POC**: decision + POC co-build
14. **Link with tech selection**: decision + selection co-build
15. **Link with RFP**: decision + RFP co-build
16. **Link with vendor eval**: decision + evaluation co-build
17. **Link with budget**: decision + budget co-build
18. **Link with bootstrap**: build path + bootstrap co-build
19. **Toolchain**: decision matrix + TCO table + risk register
20. **Publicly queryable**: decision record queryable by all; not hidden
21. **Periodic review**: evolution updates; not one-shot
22. **First principles**: why must decision; worst consequence of not doing it
23. **Inversion thinking**: how much can intuition solve; if solvable, do not introduce a decision framework
24. **Second-order thinking**: second-order consequences after decision (lock-in / cost / capability / extension)
25. **Occam**: decision the simpler the better; cut redundant steps

## Related

- POC: [../../tech-lead/roadmap/do-a-proof-of-concept.md](../../tech-lead/roadmap/do-a-proof-of-concept.md) — validation co-build
- tech selection: [../../tech-lead/roadmap/do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md) — selection co-build
- RFP: [./prepare-an-rfp.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-an-rfp.md) — procurement co-build
- vendor SaaS: [./evaluate-a-vendor-saas.md](../engineering/evaluate-a-vendor-saas.md) — evaluation co-build
- budget: [./prepare-a-budget.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-budget.md) — budget co-build
- bootstrap: [./bootstrap-a-new-project.md](../engineering/bootstrap-a-new-project.md) — bootstrap co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion](../../knowledge-curator/templates/thinking--inversion.md) + [second-order](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking--ockhams-razor.md)
