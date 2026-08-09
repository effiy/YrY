---
title: Build a recommendation system
aliases:
- I want tobuildrecommendationsystem
- recommendation-system-journey
- recsys-journey
- personalization-journey
- recommendationsystementry
tags:
- journeys
- recommendation-system
- recsys
- personalization
- retrieval-ranking
- ml
category: engineer/projects
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
- tech-lead
benefit: system is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./build-a-rag-pipeline.md
- ./build-an-eval-harness.md
- ../processes/run-an-a-b-test.md
- ../../ai-engineer/methodology/rag-design-patterns.md
review_cycle: quarterly
tacit: false
---

# I want to build a recommendation system

> **As an** engineer, **I want to** build a recommendation system, **so that** system is reproducible. 

> "recall + ranking + reorder + evaluation + cold start + feedback + monitoring + retrospective" reachable within 2 hops across Process + Thinking + Case study.

## Summary

- Process: see [data-governance-process.md](../../ai-engineer/data/data-governance.md) + [monitoring-governance-process.md](../process/monitoring-governance.md) + [iteration-pm-handbook-process.md](../process/iteration-pm-handbook.md)
- Thinking: see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md)
- Platform: see [eval-driven](../engineering/evaluation-driven-development.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md)
- Case study: see [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) + [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md)

## Core viewpoints

**A recommendation system is only as good as its evaluation, and evaluation is harder than the model.** It is easy to build a recall pipeline that returns plausible-looking results. It is much harder to build an evaluation framework that measures whether those results are actually good. Offline metrics (NDCG, Recall@K) and online metrics (CTR, retention, GMV) measure different things and can diverge. A system that optimizes only offline metrics will disappoint in production.

**Cold start is not an edge case; it is the default state for new users and new items.** Every recommendation system looks great on power users with rich histories. The real test is what happens on day one for a new user or a new item. A cold-start strategy (popular, content-based, multi-armed bandit, LLM summary) is not a nice-to-have; it is the first thing users experience.

**Diversity beats accuracy in the long run.** A system that optimizes purely for click-through rate converges to a narrow set of popular items, creating filter bubbles and user fatigue. Intentional diversity (category sampling, freshness boosting, business rule injection) trades a small amount of short-term CTR for long-term user retention and discovery.

**The feedback loop is the product; the recommendation is just the output.** What users click, ignore, and dwell on is the most valuable data the system produces. A recommendation system that does not close the feedback loop (collect interactions, retrain, re-evaluate) is a static ranker, not a learning system. The quality of the feedback instrumentation determines the ceiling of the system.

## Key info

- **Recommendation system pipeline architecture (4 stages)**: (1) Recall — retrieve candidate set from millions of items to thousands; methods: collaborative filtering (user-based/item-based), content-based (embedding similarity), multi-armed bandit (explore-exploit); (2) Ranking — score candidates with a ranking model; methods: learning-to-rank (LambdaMART, XGBoost), deep CTR models (DCN, DeepFM), LLM-based ranking; (3) Reorder — apply business rules and diversity constraints; methods: category sampling (ensure N categories represented), freshness boosting (recent items get +10% score), deduplication; (4) Output — return top-K results with explanations. The Yi-family projects have no recommendation system; the architecture is documented for future use.
- **Cold start strategies comparison (4 methods, ranked by complexity)**: (1) Popularity-based — recommend most popular items globally; simplest, zero personalization, good baseline; (2) Content-based — use item metadata (category, tags, description) to match user's stated preferences; requires onboarding questionnaire; (3) Multi-armed bandit (MAB) — explore random items, exploit those with high engagement; Thompson Sampling or UCB; converges to personalized within 20-50 interactions; (4) LLM summary — use LLM to infer user preferences from sparse signals (job title, department, first query) and generate recommendations; highest cold-start quality but highest latency and cost. Cold start is not an edge case — it is the default state for new users and new items, and it is the first thing users experience.
- **Recommendation evaluation metrics framework (offline vs. online, they measure different things and can diverge)**: Offline metrics — NDCG@K (Normalized Discounted Cumulative Gain, measures ranking quality), Recall@K (% of relevant items in top-K), Precision@K (% of top-K that are relevant), MRR (Mean Reciprocal Rank, position of first relevant item). Online metrics — CTR (Click-Through Rate), CVR (Conversion Rate), retention (D7/D30), GMV (Gross Merchandise Value). A system that optimizes only offline metrics will disappoint in production — offline metrics measure relevance, online metrics measure business impact. Offline-online correlation must be measured quarterly.
- **Diversity-accuracy trade-off and reorder strategies**: Pure accuracy optimization converges to a narrow set of popular items, creating filter bubbles and user fatigue. Diversity strategies: (1) Category sampling — ensure at least N categories represented in top-K results; (2) Freshness boosting — recently published items get +10-20% score boost; (3) Business rule injection — manual overrides for promoted items, compliance requirements, or strategic priorities; (4) Submodular diversification — maximize relevance while minimizing similarity between selected items (MMR algorithm). The trade-off: diversity typically costs 2-5% short-term CTR but improves long-term retention by 10-20%.
- **Feedback loop instrumentation requirements (5 must-track events)**: (1) Impression — item was shown to user; (2) Click — user clicked on item; (3) Dwell time — how long user spent on item after clicking; (4) Conversion — user completed target action (purchase, save, share); (5) Negative signal — user dismissed, hid, or reported item. The quality of the feedback instrumentation determines the ceiling of the system — a recommendation system without closed-loop feedback is a static ranker, not a learning system. Feedback data must be joined with user context (session, device, time) and item context (category, freshness, popularity) for model training.
- **Yi-family recommendation system state (2026-08)**: No recommendation system exists in any Yi-family project. The recommendation system architecture and methodology are documented for future use cases (e.g., YiKnowledge article recommendation, YiVad BRD template recommendation). The closest existing system is YiVad RAG pipeline's hybrid retrieval (vector + BM25), which shares the recall-ranking architecture pattern but targets document retrieval, not personalized recommendation.

## Scenario description

Build a recommendation system / recsys / personalized recommendation / recall + ranking + reorder / cold start / multi-objective optimization / recommendation evaluation / recommendation experiment / recommendation feedback loop / recommendation monitoring / recommendation drift / quarterly recommendation retrospective / big-promo recommendation strategy / multi-scenario recommendation — when platform + data science + PM + sponsor need to look up Process + Thinking + Case study. This entry aggregates recommendation-system-related Process + Thinking + Case study into 2-hop paths, avoiding "missed recall / biased ranking / missing reorder / hollow evaluation / cold-start dragging / slow feedback / missing monitoring / drift ignored".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/ai-specific/` | [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) — recall · [llm-evaluation-summary.md](../../ai-engineer/methodology/llm-evaluation-methods.md) — evaluation · [hallucination-mitigation-summary.md](../../ai-engineer/methodology/hallucination-mitigation.md) · [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) |
| `methodology/engineering-patterns/` | [eval-driven](../engineering/evaluation-driven-development.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — essence of recommendation · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — inversion thinking · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [rice-ice-prioritization-summary.md](../../product-manager/frameworks/rice-ice-prioritization.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) |
| `work/processes/` | [data-governance-process.md](../../ai-engineer/data/data-governance.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [iteration-pm-handbook-process.md](../process/iteration-pm-handbook.md) · [sprint-retrospective-process.md](../../product-manager/delivery/retrospective.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) |
| `tech/ai-platform/` | [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) · [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) — recommendation north star |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — recommendation communication |
| `people/team--` | [team-overview.md](../../knowledge-curator/people/team--team-overview.md) · [roster.md](../../knowledge-curator/people/team--roster.md) — recommendation team |
| `lessons/wins/` | [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) |
| `lessons/failures/` | [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [bugs/](../lessons) — recommendation incident archive |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | each project `architecture-summary.md` §recommendation + `adr-*` §recommendation |
| `journeys/` | [./build-a-rag-pipeline.md](./build-a-rag-pipeline.md) · [./build-an-eval-harness.md](./build-an-eval-harness.md) · [../processes/run-an-a-b-test.md](../quality-security/run-an-a-b-test.md) · [../../ai-engineer/methodology/finetune-a-model.md](../../ai-engineer/methodology/finetune-a-model.md) |

## Action recommendations

1. **First principles**: first ask "what business does the recommendation serve / what happens if we don't build it / ROI / user impact"; do not push it for the sake of pushing; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: first imagine "how the recommendation can fail (bias / filter bubble / cold start / drift / trust collapse)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: recommend once → user behavior changes → recommend again; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam's razor**: the simplest recall that satisfies the business wins; do not pile up models; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **Recall**: do multi-path recall (collaborative / content / vector / popular / LLM) + must dedup + must budget. 
6. **Ranking**: do ranking (LTR / DNN / GBDT) + must multi-objective + must calibrate. 
7. **Reorder**: do reorder (diversity / freshness / business rule / fairness) + must business fallback. 
8. **Embedding**: do [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) + must evaluate + must version. 
9. **Vector DB**: do [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) + must ANN + must recall evaluation. 
10. **Cold start**: do cold-start strategy (popular / content / multi-armed bandit / LLM summary) + must migrate quickly. 
11. **Evaluation**: do [eval-driven](../engineering/evaluation-driven-development.md) + must offline (NDCG / Recall / Hit) + must online (CTR / retention / GMV).
12. **Experiment**: do [i-want-to-run-an-a-b-test.md](../quality-security/run-an-a-b-test.md) + must guardrail + must multiple-comparison correction. 
13. **Dual world**: model upgrade must do [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + dual-run + diff. 
14. **Data**: do [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + must instrument + must feature engineering + must version. 
15. **AI governance**: model must do [i-want-to-prepare-a-model-governance-policy.md](../../knowledge-curator/archive/strategies-legacy/ai-engineer/prepare-a-model-governance-policy.md) + must drift monitoring + must hallucination fallback. 
16. **RACI**: do [raci-matrix-summary.md](../process/raci-matrix.md); data science / platform / sponsor owner. 
17. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not move recommendation models. 
18. **Communication**: do [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md); communicate with sponsor + business. 
19. **Monitoring**: do [monitoring-governance-process.md](../process/monitoring-governance.md) dashboards + thresholds + alerts (CTR / recall rate / latency / drift).
20. **Retrospective**: after recommendation incidents, do [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive under [bugs/](../lessons). 
21. **Quarterly audit**: follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md); scan whether the model is still accurate + whether recall still covers. 
22. **ADR**: recommendation decisions must land as ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
23. **Flywheel**: recommendation improves → retention grows → data grows → recommendation improves further; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Optimizing only for CTR.** Click-through rate is the most available metric, but it rewards clickbait and popular items. A system optimized purely for CTR will show the same 10 items to everyone, destroying discovery and long-term retention. Add diversity, freshness, and session-level metrics to the objective function.

- **Ignoring cold start because "most users have history."** Even if 80% of users have history, the 20% who do not are your future power users. A bad cold-start experience causes new users to churn before they generate any history. Invest in cold-start as a first-class feature, not a fallback.

- **No offline evaluation before online A/B testing.** Launching a new ranking model directly into an A/B test without offline evaluation on a golden set is gambling with user experience. Offline evaluation catches regressions before they reach users. The eval harness must run and pass before any experiment goes live.

- **Deploying without a fallback strategy.** When a model update degrades key metrics, the system must be able to revert to the previous model within minutes. A dual-world boundary pattern (dual-run both models, diff the outputs, switch with a feature flag) is not optional; it is the safety net that allows aggressive experimentation.

- **Treating the recommendation system as a one-time build.** A recommendation system that is built once and not iterated on will be worse than no recommendation system within six months, because user behavior and content catalogs drift. Schedule quarterly model retraining, evaluation reruns, and architecture reviews.

## Related

- Related journey: [./build-a-rag-pipeline.md](./build-a-rag-pipeline.md) — RAG
- Related journey: [./build-an-eval-harness.md](./build-an-eval-harness.md) — evaluation
- Related journey: [../processes/run-an-a-b-test.md](../quality-security/run-an-a-b-test.md) — A/B
- Related journey: [../../ai-engineer/methodology/finetune-a-model.md](../../ai-engineer/methodology/finetune-a-model.md) — fine-tune
- Upstream: [../../ai-engineer/methodology/README.md](../../ai-engineer/methodology/README.md) — ai-specific leaf entry
