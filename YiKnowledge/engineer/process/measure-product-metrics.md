---
title: Measure product metrics
aliases:
- I want to view product metrics
- metrics-journey
- north-star-journey
- product measurement entry
tags:
- journeys
- product-metrics
- north-star
- AARRR
- retention
- churn
category: engineer/process
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: findings are actionable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../lessons/learn-pm-frameworks.md
- ../../tech-lead/roadmap/plan-tech-roadmap.md
- ../../product-manager/discovery/metrics--README.md
review_cycle: quarterly
tacit: false
---

# I want to measure product metrics

> **As an** engineer, **I want to** measure product metrics, **so that** findings are actionable. 

> "North Star / AARRR / retention / AI product metrics / capacity cost" 2-hop reach covers product measurement + north star + retention + AI metrics + capacity.

## Summary

- North Star: [north-star-metrics-summary.md](../../product-manager/discovery/metrics--north-star-metric.md): a single core metric + 3 supporting metrics
- Framework: [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md): HEART / AARRR / GQM
- Retention: [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md): D1/D7/D30 + churn attribution
- AI metrics: [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md): recall / faithfulness / latency / cost
- Capacity cost: [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md): ROI / cost per user

## Core viewpoints

- **The North Star metric is not a goal -- it is a hypothesis about what drives sustainable growth, and it must be falsifiable.** A North Star like "daily active users" is a vanity metric masquerading as strategy. A real North Star predicts that if users achieve a specific outcome (e.g., "complete their first AI-assisted code review within 7 days"), retention and revenue will follow. If the prediction is wrong, the North Star must change -- the metric serves the strategy, not the other way around.

- **Vanity metrics are not harmless -- they are actively destructive because they create the illusion of progress while masking real problems.** A graph showing "total registered users" going up and to the right feels good, but if activation rate is flat and churn is accelerating, the business is dying behind a beautiful dashboard. Every metric in a leadership report must be paired with its counter-metric: DAU with D1 retention, revenue with cost per acquired user, NPS with churn rate.

- **AI product metrics require a fundamentally different framework than traditional SaaS metrics, and teams that use only accuracy are measuring the wrong thing.** An AI product with 99% accuracy but 10-second latency and $0.50 per call will fail in production. The AI metrics framework must include recall, faithfulness, P95 latency, per-call cost, and user reuse rate -- and the threshold for each is determined by the use case, not by the model's benchmark scores.

- **Retention measurement must be tiered by time horizon because the reasons users stay change over time.** D1 retention measures whether the user perceived value in their first session (onboarding quality). D7 retention measures whether the product became a habit (core loop quality). D30 retention measures whether the product is irreplaceable (switching cost and network effects). Each tier requires a different intervention, and treating them as a single "retention" number obscures which lever to pull.

- **Metric governance is the practice of periodically asking whether your metrics still measure what matters, and it is the most neglected activity in product management.** A metric defined in 2024 to track "search queries per session" becomes meaningless in 2026 when an AI assistant answers questions without requiring a search. Every quarter, the metrics portfolio must be reviewed with a single question: "if this metric moved 50% in either direction, would we change our strategy?" If the answer is no, the metric is decoration, not instrumentation.

## Key info

- **North Star metric design workshop (5-step process)**: (1) Define the value exchange — what does the user get? What does the business get? Write both in one sentence; (2) Identify candidate metrics — brainstorm 10-20 metrics that capture the value exchange; (3) Filter by 3 criteria — captures value exchange, actionable within a sprint, not gameable; (4) Select the North Star + 3 supporting metrics — the North Star is the one metric that best captures the value exchange; supporting metrics explain WHY the North Star moved; (5) Validate — does the North Star correlate with long-term business outcomes (retention, revenue)? If not, it's the wrong metric. The Yi-family projects: no North Star defined (internal tools); the workshop process is documented for when products face external users.
- **AARRR funnel metrics (5 stages with Yi-family mapping)**: (1) Acquisition — where users come from; metrics: traffic source, CAC (customer acquisition cost); Yi-family: N/A (internal tools); (2) Activation — the "aha moment" when users experience value; metrics: activation rate, time to activation; Yi-family: first BRD generated (YiAi BRD Agent), first RAG query (YiVad aiChat); (3) Retention — users coming back; metrics: D1/D7/D30 retention; Yi-family: weekly active users of aiChat, monthly BRD generations; (4) Revenue — how you make money; metrics: ARPU, LTV, MRR; Yi-family: N/A (internal tools, no revenue); (5) Referral — users telling others; metrics: NPS, viral coefficient; Yi-family: N/A. The Yi-family projects focus on Activation and Retention metrics; Acquisition, Revenue, and Referral are not applicable.
- **Retention cohort analysis methodology**: Group users by signup week, track what percentage return each subsequent week. D1 retention = % of users who return on day 1 after signup; D7 = % active on day 7; D30 = % active on day 30. The retention curve should flatten: if D1 = 40%, D7 = 20%, D30 = 15%, the curve is flattening (users who get past week 1 tend to stick). If D1 = 40%, D7 = 10%, D30 = 2%, the curve is not flattening (users are churning continuously). The flattening point indicates when the product "sticks." The Yi-family projects: no retention analysis (internal tools, user base is the team itself); the methodology is documented for when external users are onboarded.
- **AI product metrics framework (5 dimensions with thresholds)**: (1) Recall — % of relevant documents retrieved; target: > 80% (ragas context recall); (2) Faithfulness — % of claims grounded in retrieved context; target: > 90% (ragas faithfulness); (3) P95 Latency — time to first token + time to complete; target: < 3 seconds for conversational AI, < 30 seconds for document generation; (4) Per-call cost — average cost per API call; target: < $0.01 for simple queries, < $0.10 for complex generation; (5) User reuse rate — % of users who use the AI feature again within 7 days; target: > 50%. The Yi-family RAG system targets faithfulness > 0.9 and context recall > 0.8; latency and cost are not yet monitored.
- **Metric dashboard design principles (4 rules)**: (1) Every metric must have a counter-metric — DAU paired with D1 retention, revenue paired with cost per user, NPS paired with churn rate; (2) Every metric must have a target and a baseline — "improve engagement" is not a metric; "increase D7 retention from 15% to 25% by Q3" is; (3) Every metric must have a decision threshold — "if this metric drops below X, we will take action Y"; (4) The dashboard must be readable in 60 seconds — the most important metrics are at the top, trends are visible without clicking, and the number of metrics is ≤ 12. The Yi-family projects: no metric dashboard (internal tools); the design principles are documented for when dashboards are built.
- **Yi-family product metrics state (2026-08)**: All 3 projects are internal tools with the team as the only users. Metrics collected: YiAi — API request count, error rate, latency (basic FastAPI middleware); YiVad — page views (Vue Router), thumbs up/down on aiChat responses; YiPet — no metrics. No formal product metrics framework is applied. The product metrics framework (North Star, AARRR, retention, AI metrics) is documented for when products face external users. The BRD Agent tracks BRD generation count and quality scores as internal KPIs.

## Scenario

When setting the North Star / reviewing retention / designing A/B / evaluating AI products / calculating ROI / reporting metrics to leadership, PM + data + owners need to look up the metrics system + frameworks + case comparisons. This entry aggregates all product/metrics leaves, related pm-frameworks, AI metrics, and capacity cost into 2-hop paths, avoiding "fragmented metrics / vanity metrics / AI evaluation that only looks at accuracy".

## 2-hop reachability paths

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) |
| `methodology/pm-frameworks/` | [heart-aarrr-metrics-summary.md](../../product-manager/frameworks/heart-aarrr-metrics.md) · [okr-design-summary.md](../../product-manager/frameworks/okr-design.md) · [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-think which metrics must not break |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) — cost per user / capacity ceiling · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) — metrics debt |
| `work/processes/` | [engineering-productivity-metrics-summary.md](engineering-productivity-metrics.md) · [engineering-productivity-metrics-template.md](engineering-productivity-metrics.md) · [org-productivity-diagnosis-summary.md](org-productivity-diagnosis.md) — team effectiveness metrics |
| `product/strategy/` | [product-strategy-framework-summary.md](../../executive/strategy/product-strategy-framework.md) · [now-next-later-roadmap-summary.md](../../executive/strategy/now-next-later-roadmap.md) — strategy-aligned metrics |
| `industry/reports--` | [ai-industry-report-summary.md](../../executive/industry/reports--ai-industry-report.md) — industry benchmark |
| `lessons/wins/` | [yiai-llm-phase-five-win.md](../lessons/win-yiai-llm-phase-five.md) · [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) — metrics-driven landing cases |

## Action recommendations

1. **Set the North Star**: a single metric reflecting user value (not revenue / DAU); 3 supporting metrics covering breadth / depth / retention; see [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md). 
2. **Choose a framework**: HEART (experience) / AARRR (growth) / GQM (Goal-Question-Metric) by scenario; do not mix. 
3. **Tiered retention**: D1 (first value perception) / D7 (habit formation) / D30 (long-term value); churn must be attributed (product / experience / price / season). 
4. **AI metrics**: recall / faithfulness / P95 latency / per-call cost / user reuse rate; do not only look at accuracy; must look at user behavior metrics. 
5. **A/B**: first write the assumption → calculate minimum sample → run 7-14 days → look at p-value + actual effect → decision to launch. 
6. **ROI**: revenue per user - cost per user = value; cost via [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md). 
7. **Reporting**: North Star + 3 supporting + anomaly attribution + next action; do not pile up 20 metrics for leadership to interpret themselves. 
8. **Metrics governance**: each quarter retrospective whether metrics still reflect user value, to avoid metric ossification; see [org-productivity-diagnosis-summary.md](org-productivity-diagnosis.md).

## Anti-patterns

- **Choosing a North Star metric by committee vote rather than by hypothesis testing.** When the leadership team picks a North Star because it "feels right" or because a competitor uses it, the metric is untethered from the actual value drivers of the business. The North Star must be derived from data: what behavior correlates with long-term retention? What outcome predicts upgrade to paid? The North Star is discovered, not chosen.

- **Reporting 20 metrics to leadership and expecting them to find the signal.** A dashboard with 20 metrics is a data dump, not a report. The leadership report should surface the North Star, the 3 supporting metrics, and a narrative that explains the relationship between them: "North Star is up 5% because D1 retention improved after the onboarding redesign, but D30 retention is flat because the core loop hasn't changed." The narrative is the product; the metrics are the evidence.

- **Running A/B tests without pre-registering the hypothesis and minimum sample size.** When a team runs an A/B test, sees a 2% lift in conversion, and declares victory without checking whether the result is statistically significant or whether the sample size was sufficient, they are making decisions on noise. The hypothesis (what we expect to change and by how much), the minimum sample size (calculated before the test starts), and the success criteria (p-value threshold and practical significance) must be written down before the test begins.

- **Using NPS as a standalone metric without segmenting by user cohort.** An NPS of 40 could mean "promoters love us, detractors are leaving" (healthy) or "everyone is lukewarm" (dying). NPS must be segmented by cohort (new users vs. power users), by plan (free vs. paid), and by behavior (active vs. churned) to reveal the underlying dynamics. Aggregate NPS is a Rorschach test -- it shows whatever the interpreter wants to see.

- **Treating metrics as a dashboard that runs itself rather than an instrument that requires calibration.** A metric pipeline that silently breaks (tracking code removed, event schema changed, sampling rate misconfigured) produces garbage data that looks like valid data. Every quarter, the metrics infrastructure must be audited: are the events still firing? Are the calculations still correct? Are the segments still meaningful? Uncalibrated instruments produce confident-looking numbers that are wrong. 

## Related

- similar journey: [../lessons/learn-pm-frameworks.md](../lessons/learn-pm-frameworks.md) — PM framework comparison
- similar journey: [../../tech-lead/roadmap/plan-tech-roadmap.md](../../tech-lead/roadmap/plan-tech-roadmap.md) — metrics-driven planning
- similar journey: [../../ai-engineer/platform/evaluate-an-llm-app.md](../../ai-engineer/platform/evaluate-an-llm-app.md) — AI metrics in depth
- upstream: [../../product-manager/discovery/metrics--README.md](../../product-manager/discovery/metrics--README.md) — metrics leaf entry
