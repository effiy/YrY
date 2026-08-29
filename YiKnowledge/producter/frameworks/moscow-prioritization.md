---
title: MoSCoW Prioritization
tags: [framework, moscow, prioritization, producter]
category: producter/frameworks
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "PMs use MoSCoW to scope releases by categorizing features into Must/Should/Could/Won't, forcing explicit trade-off decisions"
related:
  - ./README.md
  - ./rice-ice-prioritization.md
---

# MoSCoW Prioritization

> **MoSCoW forces explicit scope decisions by categorizing every feature into one of four buckets.** It's the simplest prioritization framework — no numbers, no formulas, just clear categories.

## The 4 categories

| Category | Meaning | Rule of thumb | Example |
|----------|---------|--------------|---------|
| **Must have** | Non-negotiable for this release. Without it, the release is a failure. | ≤60% of total effort | BRD generation from case data |
| **Should have** | Important but not critical. Can be delayed if necessary. | ~20% of effort | Multi-language BRD output |
| **Could have** | Nice to have. Include only if time permits. | ~20% of effort | BRD source citations |
| **Won't have** | Explicitly excluded from this release. Not "maybe later" — "not now." | Documented for clarity | BRD approval workflow |

## How to apply

1. **List all features** — everything anyone has suggested
2. **Must-have first** — what makes this release a failure if missing?
3. **Apply the 60% rule** — if Must-haves exceed 60% of total effort, some are actually Should-haves
4. **Won't-have explicitly** — every feature NOT in Must/Should/Could goes to Won't-have. Be explicit about what's excluded.
5. **Review with stakeholders** — MoSCoW is a conversation tool, not a solo exercise

## Must-have test

Ask: "If we shipped without this feature, would we delay the release?"

- Yes → Must have
- No → Should have or lower

## Anti-patterns

- **Everything is a Must-have.** If everything is critical, nothing is. Apply the 60% rule ruthlessly.
- **Won't-have is empty.** An empty Won't-have column means you haven't made real trade-offs. Every release has things you're not doing.
- **Using MoSCoW alone for ranking.** MoSCoW gives you 4 buckets, not an ordered list within each bucket. Pair with RICE for intra-bucket ordering.
- **Stakeholders define Must-have without engineering input.** A feature that takes 80% of the budget can't be Must-have unless it's the only feature. Effort estimates constrain the Must-have bucket.