---
title: Run an A/B test
aliases:
- I want to run an A/B test
- ab-test-journey
- experiment-journey
- a-b-test-journey
- Experiment entry
tags:
- journeys
- ab-test
- experiment
- hypothesis-testing
- growth
- statistics
- product-analytics
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../tools/set-up-a-tracking-plan.md
- ./measure-product-metrics.md
- ./run-an-experiment.md
- ../../product-manager/discovery/metrics/ai-product-metrics.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to run an A/B test

> **As an** engineer, **I want to** run an a b test, **so that** process is repeatable. 

> "Hypothesis + metrics + split + significance + decision + retrospective + bias guards" reaches process + thinking + cases in 2 hops.

## Summary

- Process follows [requirement-review.md](../../product-manager/delivery/requirement-review.md) + [design-review.md](../../product-manager/delivery/design-review.md) + [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md)
- Data follows [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) + [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) + [data-governance-summary.md](../../ai-engineer/data/data-governance.md)
- Cases follow [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) + [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md)

## Core viewpoints

**An A/B test without a pre-registered hypothesis is a fishing expedition, not an experiment.** If the hypothesis ("if we change X, then Y metric will move by Z") is not written down before the experiment starts, the team will inevitably peek at the data, find a statistically significant metric by chance, and retroactively construct a narrative. Pre-registration prevents this by locking the success criteria before any data is collected.

**Sample ratio mismatch (SRM) is the canary for broken randomization.** If the control and treatment groups are not evenly split, the experiment is invalid regardless of the p-value. SRM checks must run continuously throughout the experiment, not just at the start. A mid-experiment SRM failure can indicate a bug in the flag system, a deployment that broke the hash function, or user behavior that defeats the randomization.

**Statistical significance without practical significance is noise.** A p-value of 0.001 on a 0.1% metric improvement is a well-measured nothing. Every experiment must define a minimum detectable effect (MDE) that represents a meaningful business impact before the experiment starts. If the effect size is below the MDE, the correct decision is to ship or kill based on other factors, not to wait for a larger sample.

**The experiment duration must cover at least one full user cycle.** A 2-day experiment on a product with weekly usage patterns will capture only the most engaged users and miss the weekend effect, the novelty effect, and the learning effect. The minimum duration is one full cycle (typically 7-14 days), and the decision should only be made after the metrics stabilize.

**Experiments measure the average, but the average hides segments.** A feature that improves the overall metric by 5% but harms power users by 20% is a net negative for the business. Every experiment must segment results by user cohort (new vs. returning, power vs. casual, platform, geography) before declaring a winner.

## Key info

- **A/B test pre-registration template (6 fields, must be written before experiment starts)**: (1) Hypothesis — "If we [change], then [metric] will [direction] by [amount] because [rationale]"; (2) Primary metric — the single metric that determines success/failure; (3) Secondary metrics — guardrail metrics that must not regress (e.g., latency, error rate, P0 bugs); (4) Minimum Detectable Effect (MDE) — the smallest effect size that represents meaningful business impact; (5) Required sample size — calculated from baseline conversion rate, MDE, significance level (α=0.05), and power (1-β=0.80); (6) Duration — minimum 1 full user cycle (typically 7-14 days). Pre-registration prevents peeking, p-hacking, and retroactive narrative construction. If the hypothesis is not written down before the experiment starts, the team will inevitably find a statistically significant metric by chance.
- **Sample size calculation formula and common pitfalls**: Required sample size per variant: n = (Z_α/2 + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₂-p₁)², where p₁ = baseline conversion rate, p₂ = expected conversion rate, Z_α/2 = 1.96 (for α=0.05), Z_β = 0.84 (for 80% power). Common pitfalls: (1) Underpowered — stopping early because "it looks significant"; (2) Peeking — checking results daily and stopping when p < 0.05 (inflates false positive rate from 5% to 30%+); (3) Multiple comparisons — testing 20 metrics and reporting the one that's significant (use Bonferroni correction: α/n). Sample Ratio Mismatch (SRM) — if control: treatment ratio ≠ 50:50, the experiment is invalid regardless of p-value. SRM checks must run continuously throughout the experiment.
- **Experiment duration and novelty effect management**: Minimum duration = 1 full user cycle (typically 7-14 days). A 2-day experiment captures only the most engaged users and misses: (1) Novelty effect — users engage more with anything new, inflating initial metrics by 10-30%; (2) Learning effect — users take time to discover and adopt new features; (3) Weekend/weekday effect — usage patterns differ significantly. The decision should only be made after metrics stabilize (typically day 7-14). For products with weekly usage patterns, extend to 14-21 days to capture 2 full cycles. Novelty effect can be measured by comparing Day 1-3 metrics vs. Day 7-14 metrics.
- **Segmentation analysis requirements (5 mandatory segments)**: Every experiment result must be segmented by: (1) New vs. returning users — features often help one group and harm the other; (2) Power vs. casual users — top 20% of users by activity vs. bottom 80%; (3) Platform — web vs. mobile vs. desktop; (4) Geography — different regions may respond differently; (5) User acquisition source — organic vs. paid vs. referral. A feature that improves overall metric by 5% but harms power users by 20% is a net negative for the business. Segment-level statistical tests require larger sample sizes; if segments are underpowered, report direction and magnitude (not significance) with appropriate caveats.
- **A/B test decision framework (4 outcomes)**: (1) Significant positive, practically meaningful → ship to 100%; (2) Significant positive, not practically meaningful → ship or kill based on other factors (engineering cost, strategic alignment), do not wait for larger sample; (3) Significant negative → kill, investigate why; (4) Not significant (underpowered) → extend duration if business allows, otherwise kill (default to no change). The correct decision for a flat experiment is to ship or kill based on non-metric factors — waiting for a larger sample when the effect size is below MDE wastes experiment capacity. The retrospective must be written regardless of outcome: what did we learn, what would we do differently.
- **Yi-family A/B test practices (2026-08)**: No formal A/B testing framework. YiVad aiChat uses thumbs up/down as lightweight feedback (not controlled experiment). The A/B test framework is documented for when products face external users and controlled experiments become necessary. The tracking plan ([set-up-a-tracking-plan.md](../engineering/set-up-a-tracking-plan.md)) and product metrics framework ([measure-product-metrics.md](../process/measure-product-metrics.md)) are the prerequisite infrastructure.

## Scenario

When running A/B tests / split tests / hypothesis testing / growth experiments / gradual rollout comparisons / controlled experiments / experiment design / experiment platforms / CRO conversion optimization / pre-launch experiment validation / long-term effect evaluation / accidental metric fluctuation / multiple-comparison traps / quarterly growth retrospectives, PM + data science + engineering owner + sponsor need to look up process + thinking + cases. This entry aggregates A/B-test-related process + thinking + cases into 2-hop paths, avoiding "hollow hypothesis / scattered metrics / biased splits / small samples / significance misjudgment / delayed decisions / missing retrospective / bias guards skipped".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `work/processes/` | [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [design-review.md](../../product-manager/delivery/design-review.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [iteration-pm-handbook-process.md](../process/iteration-pm-handbook.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md) — essence of experiments · [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md) — reverse-think misjudgments · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) · [dual-track-agile-summary.md](../../product-manager/frameworks/dual-track-agile.md) |
| `methodology/engineering-patterns/` | [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [eval-driven](../engineering/evaluation-driven-development.md) · [contract-test-baseline-pattern.md](contract-test-baseline.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/ai-specific/` | [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics/ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics/retention-and-churn.md) |
| `product/strategy/` | [product-strategy-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-strategy.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [second-curve-summary.md](../../executive/strategy/second-curve.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [weekly-report-prompt.md](../../ai-engineer/methodology/prompts/weekly-report.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts/sql-generation.md) |
| `work/meetings/` | [review-meeting-template.md](../../product-manager/delivery/review-meeting.md) · [retrospective-sample.md](../../product-manager/delivery/retrospective.md) · [weekly-report-sample.md](../../product-manager/delivery/weekly-report.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) |
| `people/stakeholders/` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders/stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) — experiment reporting |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — experiment-failure archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) |
| `projects/` | Each project's `architecture-summary.md` §experiment platform + `dev-standards-summary.md` §experiment conventions |
| `journeys/` | [../tools/set-up-a-tracking-plan.md](../engineering/set-up-a-tracking-plan.md) · [./measure-product-metrics.md](../process/measure-product-metrics.md) · [./run-an-experiment.md](./run-an-experiment.md) · [./roll-out-feature-flags.md](../infrastructure/roll-out-feature-flags.md) |

## Action recommendations

1. **First principles**: First ask "what question should this experiment answer / what happens if not done / ROI / user impact"; don't experiment for the sake of experimenting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
2. **Inversion**: First think "how could this experiment misjudge (biased samples / uneven splits / noisy metrics / multiple comparisons / short-term fluctuation / network effects)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking/inversion.md). 
3. **Second-order effects**: Experiment launches → user behavior changes → long-term retention changes → another experiment; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking/second-order-thinking.md). 
4. **Occam**: The simplest experiment design that satisfies the hypothesis wins; don't pile up metrics; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking/ockhams-razor.md). 
5. **Hypothesis**: Must run a falsifiable hypothesis + write "if X then Y" + pre-estimate effect size + pre-estimate direction; follow [first-principles-summary.md](../../knowledge-curator/templates/thinking/first-principles.md). 
6. **Metrics**: Must have 1 north star + 2-3 guardrails (anti-bias) + 2-3 secondary; follow [north-star-metric-summary.md](../../product-manager/discovery/metrics/north-star-metric.md). 
7. **Sample size**: Must compute MDE + significance + power + estimate experiment cadence; if sample is insufficient, extend the runtime. 
8. **Splits**: Must use random splits + user-level hashing + mutually exclusive experiments + orthogonal layers; follow [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md). 
9. **SRM**: Must scan for SRM (sample ratio mismatch) + run χ² test; follow [data-governance-summary.md](../../ai-engineer/data/data-governance.md). 
10. **Multiple comparisons**: Must apply Bonferroni / Holm correction; multi-metric / multi-variant must correct. 
11. **Network effects**: Social / collaboration products must use cluster-level splits + prevent spillover. 
12. **AI experiments**: LLM product experiments must follow [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + use LLM-as-judge + run eval-set regression. 
13. **Pre-experiment**: Must run A/A tests + verify platform correctness + verify splits + verify metric variance. 
14. **Gradual rollout**: Must follow [roll-out-feature-flags.md](../infrastructure/roll-out-feature-flags.md) for gradual rollout + monitor guardrails. 
15. **Freeze period**: During major promotions follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't touch experiments. 
16. **Decision**: Must follow [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking/strong-opinions-loosely-held.md) with clear stances + post-hoc retrospective. 
17. **Reporting**: Must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders/communication-cadence.md) to report to sponsor + business. 
18. **RACI**: Must follow [raci-matrix-summary.md](../process/raci-matrix.md); PM / data / engineering / sponsor owners. 
19. **Retrospective**: After the experiment must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [review-log.md](../../knowledge-curator/governance/review-log.md). 
20. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the experiment platform is still accurate + whether metrics are still reasonable. 
21. **ADR**: Experiment decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: Good experiments → fast learning → faster product → business growth; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking/flywheel-effect.md).

## Anti-patterns

- **Peeking at the p-value daily and stopping when it crosses 0.05.** Continuous monitoring with the intent to stop early inflates the false positive rate dramatically. A p-value that crosses 0.05 on day 3 has a much higher probability of being a false positive than one that crosses 0.05 on day 14 after the pre-planned duration. The experiment duration must be set in advance and respected.

- **Running too many metrics without correction.** If an experiment tracks 20 metrics, at least one will show p < 0.05 by random chance alone. Without a multiple comparison correction (Bonferroni, Holm, or Benjamini-Hochberg), the team will ship based on noise. Define the north star metric before the experiment and correct for multiplicity on all secondary metrics.

- **Changing the treatment mid-experiment.** If the treatment group receives a different version of the feature halfway through the experiment, the data is now a mix of two different treatments and cannot be interpreted as a single experiment. Any change to the treatment requires restarting the experiment with a new experiment ID.

- **Ignoring the novelty effect.** New features often show an initial spike in engagement that fades as users return to their normal behavior. An experiment that ends during the novelty phase will overestimate the true effect. Extend the duration past the expected novelty window (typically 3-7 days for UI changes) before making a decision.

- **Shipping an experiment that shows significance but has guardrail regressions.** A 2% improvement in the north star metric is not worth shipping if the guardrail metrics (error rate, latency, crash rate) degraded by 5%. The guardrails are non-negotiable; they exist to catch the trade-offs that the north star alone cannot see.

## Related

- Same-category journey: [../tools/set-up-a-tracking-plan.md](../engineering/set-up-a-tracking-plan.md) — tracking plan
- Same-category journey: [./measure-product-metrics.md](../process/measure-product-metrics.md) — product metrics
- Same-category journey: [./run-an-experiment.md](./run-an-experiment.md) — experiment
- Same-category journey: [./roll-out-feature-flags.md](../infrastructure/roll-out-feature-flags.md) — gradual rollout
- Upstream: [../../product-manager/discovery/metrics/README.md](../../product-manager/discovery/metrics/README.md) — metrics leaf entry
