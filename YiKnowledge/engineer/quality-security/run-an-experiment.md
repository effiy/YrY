---
title: run an experiment
aliases:
- I want to run an A/B experiment
- experiment-journey
- ab-testing-journey
- experiment entry
tags:
- journeys
- experiment
- ab-testing
- hypothesis
- metrics
- retention
category: engineer/quality-security
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: process is repeatable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./measure-product-metrics.md
- ../../product-manager/discovery/write-a-prd.md
- ../../ai-engineer/platform/evaluate-an-llm-app.md
- ../../product-manager/discovery/metrics--README.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to run an experiment

> **As an** engineer, **I want to** run an experiment, **so that** process is repeatable.

> "A/B hypothesis + minimum sample + canary + measurement + significance + decision" reaches measurement system + PM framework + thinking tools + evaluation + case studies within 2 hops.

## Summary

- Measurement follows [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) + [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) + [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md)
- Frameworks follow [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) + [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md)
- Thinking follows [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Canary follows [canary-release-process.md](../../oncall-sre/release/canary-release.md) + [feature-flag-style rollback]
- Evaluation follows [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) + [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md)

## Core viewpoints

**An experiment is a decision tool, not a measurement tool.** The purpose of an experiment is to make a binary choice (ship or kill), not to produce a precise estimate of the effect. If the experiment cannot produce a clear decision within the planned duration, the hypothesis was too vague, the MDE was too small, or the sample was insufficient. Refine the hypothesis, not the experiment duration.

**The canary is the experiment's safety net, not an afterthought.** A 1% canary that observes error rate, latency, and crash rate for 24 hours before expanding to 5% catches infrastructure regressions that no amount of pre-production testing can surface. The canary tiers (1% -> 5% -> 25% -> 100%) exist to limit the blast radius of a bad change, not to gather statistical evidence.

**For AI/LLM experiments, offline evaluation is necessary but not sufficient.** An eval set that shows a 5% improvement in faithfulness does not guarantee that users will prefer the new model. Online metrics (user retention, engagement, task completion) must be measured alongside offline metrics. The eval set validates the change is safe; the online experiment validates the change is valuable.

**The duration of an experiment is determined by the user cycle, not by the sample size.** If the product has a weekly usage pattern, a 3-day experiment will only capture the behavior of daily active users and miss the weekly active users entirely. The minimum duration must cover at least one full user cycle, and the sample size calculation should use the expected traffic over that duration, not the peak traffic.

**Experiments that show no effect are as valuable as experiments that show an effect.** A null result that kills a bad idea saves the team from building, maintaining, and deprecating a feature that does not work. The knowledge base should archive null results alongside positive results, so the team does not repeat the same failed hypothesis six months later.

## Key info

- **Experiment design template (8 fields)**: (1) Hypothesis — "If we [change], then [metric] will [direction] by [amount] because [reason]"; (2) Metric — the primary metric that determines success, must be measurable within the experiment duration; (3) Guardrail metrics — metrics that must not degrade (error rate, latency, crash rate); (4) Minimum Detectable Effect (MDE) — the smallest effect size worth detecting, determines sample size; (5) Sample size — calculated from MDE, baseline conversion rate, statistical power (80%), significance level (95%); (6) Duration — must cover at least one full user cycle (weekly for weekly-active products, monthly for monthly-active); (7) Variants — control (current behavior) + treatment (new behavior), number of variants ≤3 to avoid sample fragmentation; (8) Decision criteria — what metric value triggers "ship" vs. "kill" vs. "extend experiment".
- **Statistical framework for experiment decisions**: (1) Significance level (α = 0.05) — 5% chance of false positive (shipping a feature that doesn't actually work); (2) Statistical power (1-β = 0.80) — 80% chance of detecting a true effect if it exists; (3) P-value — probability of observing the result if the null hypothesis is true; p < 0.05 → statistically significant; (4) Confidence interval — range of plausible true effect sizes; if CI includes 0, the effect is not significant; (5) Effect size — the magnitude of the difference, not just whether it's significant. A statistically significant result with a tiny effect size (e.g., 0.1% improvement) may not be practically significant. The most common mistake: peeking at results daily and stopping when p < 0.05 (p-hacking) — the experiment must run for the pre-planned duration regardless of interim results.
- **Canary tiers for experiment rollout**: Tier 1 (1% of users, 24-hour observation) — check guardrail metrics (error rate, latency, crash rate); Tier 2 (5%, 48-hour observation) — check primary metrics begin to show directional signal; Tier 3 (25%, run for the full experiment duration) — statistical analysis; Tier 4 (50%, optional) — for high-risk changes, add an intermediate tier. Each tier has a go/no-go decision based on guardrail metrics; the experiment can be killed at any tier if guardrails degrade. The canary is separate from the experiment: the canary validates safety, the experiment validates value.
- **AI/LLM experiment specific considerations**: (1) Offline eval before online — run the eval set (50+ bilingual samples, ragas 4 metrics) before exposing users to the new model; (2) Model blind test — users should not know which model they're interacting with (avoids novelty bias); (3) Latency parity — if the new model is 2x slower, the latency difference (not the quality difference) drives the metric change; (4) Cost-per-quality — measure cost per successful task completion, not just quality; a model that's 10% better but 10x more expensive may not be worth it; (5) Content safety — monitor for increase in harmful outputs, refusals, or hallucinations. The YiAi project uses this framework for LLM provider comparison experiments.
- **Experiment archive requirements**: Every experiment, regardless of outcome, must be archived with: (1) Hypothesis, (2) Results (primary metric, guardrail metrics, statistical tests), (3) Decision (shipped/killed/inconclusive), (4) Learnings (what surprised us, what we'd do differently), (5) Date archived. The archive serves two purposes: (a) prevents repeating failed experiments, (b) builds institutional knowledge about what works and what doesn't. The Yi-family projects currently have no formal experiment archive.
- **Yi-family experiment history**: YiAi LLM multi-provider experiment — tested Claude Opus vs. GPT-4.5 for BRD generation, measured quality (human eval) and cost per BRD, concluded Claude Opus better for BRD but GPT-4.5 acceptable for simpler tasks, led to multi-provider routing by task complexity. YiVad aiChat experiment — tested streaming vs. non-streaming response, measured user engagement (messages per session, session duration), concluded streaming significantly increases engagement, led to default streaming for all AI responses. YiPet — no formal experiments conducted.

## Scenario

When designing A/B / validating hypotheses / canary-launching new features / evaluating LLM changes / deciding full rollout or rollback, PM + data + lead owner need to look up hypothesis design + sample calculation + canary process + measurement system + significance + decision framework. This entry aggregates experiment-related 5 leaves + thinking tools + canary process into a 2-hop path, avoiding "design by intuition / insufficient sample / canary without observation / significance misread / decision by gut feel".

## 2-hop reachability paths

| Hop 1 (category/leaf)  | Hop 2 (specific file)  |
|---|---|
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) |
| `methodology/pm-frameworks/` | [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-framework-summary.md](../../product-manager/frameworks/product-discovery-framework.md) |
| `methodology/thinking/` | [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — think backwards about failure conditions · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — second-order effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) — simplify hypothesis · [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [strong-opinions-loosely-held-summary.md](../../knowledge-curator/templates/thinking--strong-opinions-loosely-held.md) |
| `methodology/ai-specific/` | [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) — AI app evaluation · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) |
| `methodology/engineering-patterns/` | [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) — A/B dual world |
| `work/processes/` | [canary-release-process.md](../../oncall-sre/release/canary-release.md) · [release-process.md](../../oncall-sre/release/release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [engineering-productivity-metrics-summary.md](../process/engineering-productivity-metrics.md) |
| `product/strategy/` | [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) · [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) — strategic alignment |
| `product/ux/` | [ai-product-ux-patterns-summary.md](../../product-manager/discovery/ux--ai-product-ux-patterns.md) · [nielsen-heuristics-summary.md](../../product-manager/discovery/ux--nielsen-heuristics.md) — UX hypothesis |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) — evaluation-driven landing cases |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) — experiment failure lessons |
| `resources/templates/` | [usability-test-report-template.md](../../knowledge-curator/templates/usability-test-report.md) · [user-research-interview-template.md](../../knowledge-curator/templates/user-research-interview.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — capacity evaluation during experiment |

## Action recommendations

1. **Hypothesis first**: write the "if X, then Y" hypothesis + expected effect size + decision threshold first; don't think about the solution first; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: how will the north star change when the experiment fails; think about failure first then design protection; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Sample size**: calculate minimum sample by expected effect + significance level + power; not by gut feel; if sample is insufficient, don't run the experiment.
4. **Metric layering**: north star (core) + guardrails (must not break) + auxiliary (diagnostic); if guardrails break, stop the experiment; see [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md).
5. **Stream split**: user-level hash stream split (same user always in one group); avoid pollution.
6. **Duration**: at least 1 full cycle (7-14 days) covering weekday + weekend effects; don't draw conclusions after 1 day.
7. **Significance**: p-value < 0.05 + effect size + confidence interval; don't only look at p-value; if significant but effect is small, don't ship either.
8. **Second-order effects**: short-term up long-term down? A up B down? Must check second-order; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
9. **Canary**: 1% → 5% → 25% → 100% stepwise; at each step observe core + error rate + latency; see [canary-release-process.md](../../oncall-sre/release/canary-release.md).
10. **Rollback plan**: before the experiment confirm rollback path (feature flag / stream switch / config); see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
11. **Decision**: launch / kill / improve — three choices; don't "wait and see"; conclusions must be archived to [lessons/wins/](../lessons) or [lessons/failures/](../lessons).
12. **AI experiment specifics**: LLM changes must run evaluation set + online canary + user behavior metrics three-pronged; see [llm-evaluation-methods-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) + [evaluation-driven-development-pattern.md](../engineering/evaluation-driven-development.md).

## Anti-patterns

- **Calculating the sample size after the experiment starts.** The required sample size depends on the MDE, significance level, and statistical power, all of which must be fixed before data collection begins. Adjusting these parameters mid-experiment to make the current sample "sufficient" is p-hacking by another name.

- **Using a single metric as the sole decision criterion.** A 3% improvement in the north star metric with a 10% increase in crash rate is a net negative. Every experiment must have guardrail metrics that can veto the north star. If the guardrails degrade, the experiment is killed regardless of the north star result.

- **Letting the experiment run indefinitely because "the data is trending in the right direction."** An experiment that has not reached significance after the planned duration should be stopped and evaluated. Extending the duration in search of significance inflates the false positive rate. The correct response to an inconclusive experiment is to either increase the sample (via a larger rollout) or redesign the hypothesis.

- **Running experiments without a rollback plan.** The feature flag that enables the experiment must be reversible in seconds, not minutes. A rollback drill must be completed before the experiment starts, and the on-call engineer must know the exact command to flip the flag. If the experiment causes a production incident and the rollback takes 30 minutes, the 30 minutes of user impact is a process failure.

- **Comparing experiment results to historical baselines instead of the concurrent control group.** Time-series comparisons (before vs. after) are confounded by seasonality, external events, and other concurrent changes. The only valid comparison is the concurrent control group that experiences the same external conditions. The control group is not optional.

## Related

- Same-category journey: [./measure-product-metrics.md](../process/measure-product-metrics.md) — measurement system
- Same-category journey: [../../product-manager/discovery/write-a-prd.md](../../product-manager/discovery/write-a-prd.md) — requirement hypothesis
- Same-category journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — AI evaluation
- Same-category journey: [./ship-a-release.md](../infrastructure/ship-a-release.md) — canary release
- Upstream: [../../product-manager/discovery/metrics--README.md](../../product-manager/discovery/metrics--README.md) — metrics leaf entry
