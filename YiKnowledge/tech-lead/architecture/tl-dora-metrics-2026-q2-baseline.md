---
title: DORA 2026 Q2 Baseline
lifecycle: active
status: stable
key: tl_dora-metrics_2026_q2_baseline
tags:
- dora
- baseline
- 2026-q2
metric_type: deploy-freq
current_value: YiVad ~2/week · YiPet 0 · YiAi 0
target_value: 'Q3: +50% / -30% / -25%'
period: 2026 Q2
trend: flat
category: tech-lead/architecture
roles:
- tech-lead
- executive
benefit: Tech leads can evaluate architectural choices with structured criteria, keeping the system coherent as it evolves
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"review_cycle: quarterly
tacit: false
related:
  - ./dashboard-architecture-review.md
  - ./design-architecture-decision.md
  - ./tl-maturity-model-arch-2026-08.md
  - ../README.md
  - ../INDEX.md
---

# DORA Metrics — Yi family 2026 Q2 Baseline

> **As a** tech lead, **I want to** tl_dora metrics_2026_q2_baseline, **so that** architecture stays coherent. 

## Measurement

- **Period: ** 2026 Q2 (2026-04 ~ 2026-06) 
- **Purpose: ** Q3 improvement baseline comparison

## Summary

| Metric | YiVad | YiPet | YiAi | Elite Benchmark |
|--------|-------|-------|------|-----------------|
| Deployment Frequency | ~2/week | 0 (review-gated)  | 0 (manual)  | on-demand |
| Lead Time for Changes | ~5-7 d | ~10-15 d | ~2-3 d | <1 d |
| MTTR | ~60 min | N/A | ~40 min | <1 h |
| Change Failure Rate | ~20% | ~10% | ~30% | 0-15% |

## Trend

→ Flat — Q2 each project shows no significant improvement. YiAi CFR 30% is the highest; lack of tests and lack of reviews are the main causes. 

## Contributing Factors (Q2)

- YiVad: large volume of function ports (aiChat + aicr + knowledge) during this period lengthened lead time. 
- YiPet: Web Store review gate is strict, so lead time is naturally longer. 
- YiAi: any PR merges and is released immediately; CFR is high but lead time is short. 

## Q3 Improvement (vs Q2)

| Metric | Q2 | Q3 (current) | Trend |
|--------|-----|---------------|-------|
| Deploy Freq (YiVad) | ~2/week | ~3/week | ↑ |
| Lead Time (YiVad) | ~5-7 d | ~3-5 d | ↑ |
| MTTR (YiAi) | ~40 min | ~30 min | ↑ |
| CFR (YiVad) | ~20% | ~15% | ↑ |
| CFR (YiAi) | ~30% | ~25% | ↑ |

## Improvement Actions (Q3-Q4)

- Establish CI/CD baseline across all three projects (see maturity-model + roadmap Q4).
- YiAi: introduce pytest (see tech-debt).
- YiVad: add Vitest + SSE contract tests (see tech-debt).

---
> References: YiKnowledge → work/processes/engineering-productivity-metrics-summary.md
