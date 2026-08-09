---
title: I want to build a data balancing strategy / Prepare a data-balancing strategy
aliases: [i-want-to-prepare-a-data-balancing-strategy, data-balancing-strategy]
tags: [journey, methodology, data, balancing, planning]
category: engineer/strategies
created: 2026-08-04
updated: 2026-08-04
source: internal
type: journey
lifecycle: active
review_cycle: quarterly
roles: [engineer]
benefit: "launch is safe"
acceptance_criteria:
  - "frontmatter roles + benefit + acceptance_criteria present"
  - "descriptive verb-phrase filename, hyphens only, underscores and digits forbidden"
  - "body contains user-story header + 7 fixed-order sections"
related:
  - ./prepare-a-data-quality-strategy.md
  - ./prepare-a-data-cleaning-strategy.md
  - ./prepare-a-data-augmentation-strategy.md
  - ./prepare-a-data-sampling-strategy.md
  - ./prepare-a-model-training-strategy.md
  - ../../knowledge-curator/templates/thinking/first-principles.md
  - ../../knowledge-curator/templates/thinking/inversion.md
  - ../../knowledge-curator/templates/thinking/second-order-thinking.md
  - ../../knowledge-curator/templates/thinking/ockhams-razor.md
tacit: Data balancing is not just sampling; it is a contract. Sampling + weighting + synthesis + governance + measurement as five dimensions; business-value driven; not one-shot; measurable
status: deprecated
---

# I want to build a data balancing strategy

> **As an** engineer, **I want to** prepare a data balancing, **so that** launch is safe.

## Summary

- data balancing = contract; not just sampling
- sampling + weighting + synthesis + governance + measurement as five dimensions; no missing dimension
- business-value driven; not by gut feel
- covers under-sampling / over-sampling / weighting / SMOTE / synthesis multiple types
- link with data-quality + data-cleaning + data-augmentation + data-sampling + model-training
- publicly queryable; not hidden
- periodic review; evolve and update
- first principles / inversion / second-order / Occam

## Scenario

Data balancing is a contract; not just sampling. This entry provides the full data balancing path, covering sampling + weighting + synthesis + governance + measurement, business-value driven rather than gut-feel, covering under-sampling / over-sampling / weighting / SMOTE / synthesis multiple types, linking prepare-a-data-quality + prepare-a-data-cleaning + prepare-a-data-augmentation + prepare-a-data-sampling + prepare-a-model-training, publicly queryable, periodically reviewed, and linked to leaves such as Data Quality / Data Cleaning / Data Augmentation / Data Sampling / Model Training.

## 2-hop reachability paths

| Hop | Goal | File |
|---|---|---|
| 1 hop | Entry overview | [README.md](./) |
| 1 hop | data-quality | [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) |
| 1 hop | data-cleaning | [./prepare-a-data-cleaning-strategy.md](./prepare-a-data-cleaning-strategy.md) |
| 2 hop | data-augmentation | [./prepare-a-data-augmentation-strategy.md](./prepare-a-data-augmentation-strategy.md) |
| 2 hop | data-sampling | [./prepare-a-data-sampling-strategy.md](./prepare-a-data-sampling-strategy.md) |
| 2 hop | first-principles | [../../knowledge-curator/templates/thinking/first-principles.md](../../knowledge-curator/templates/thinking/first-principles.md) |

## Action recommendations

1. **Five dimensions**: sampling + weighting + synthesis + governance + measurement; no missing dimension
2. **Business-value driven**: prioritize by efficiency + trust + speed + risk + cost; not sloganeering
3. **Sampling**: under / over / stratified; do not omit
4. **Weight**: class / sample / loss; do not omit
5. **Synthetic**: SMOTE / ADASYN / GAN; do not omit
6. **Governance**: owner / cadence / review / documentation / drift; do not omit
7. **Measurement**: balance degree + accuracy + cost + risk + satisfaction; do not omit
8. **Not one-shot**: gradual from sampling → weighting → synthesis → governance → measurement; no skipping
9. **Not report-ized**: balance numbers are only the start; not the end
10. **Not sloganeering**: every principle must have landing evidence; not vague
11. **Versioned**: strategy has versions; evolution is traceable
12. **Link with data-quality**: balancing + data quality co-build
13. **Link with data-cleaning**: balancing + data cleaning co-build
14. **Link with data-augmentation**: balancing + data augmentation co-build
15. **Link with data-sampling**: balancing + data sampling co-build
16. **Link with model-training**: balancing + model training co-build
17. **Toolchain**: imbalanced-learn / SMOTE / ADASYN / Custom / Scikit-learn
18. **Publicly queryable**: everyone can look up the strategy; not hidden
19. **Periodic review**: evolve and update; not one-shot
20. **First principles**: why data balancing is necessary; worst consequence of not doing it
21. **Inversion thinking**: how much can raw data solve; if solvable, do not introduce a heavy strategy
22. **Second-order thinking**: second-order consequences after the strategy (efficiency / trust / speed / risk)
23. **Occam**: simpler data balancing is better; cut redundant layers

## Related

- data-quality: [./prepare-a-data-quality-strategy.md](./prepare-a-data-quality-strategy.md) — Data Quality co-build
- data-cleaning: [./prepare-a-data-cleaning-strategy.md](./prepare-a-data-cleaning-strategy.md) — Data Cleaning co-build
- data-augmentation: [./prepare-a-data-augmentation-strategy.md](./prepare-a-data-augmentation-strategy.md) — Data Augmentation co-build
- data-sampling: [./prepare-a-data-sampling-strategy.md](./prepare-a-data-sampling-strategy.md) — Data Sampling co-build
- Thinking frameworks: [first-principles](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion](../../knowledge-curator/templates/thinking/inversion.md) + [second-order](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams](../../knowledge-curator/templates/thinking/ockhams-razor.md)
