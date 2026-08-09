---
title: ADK local eval vs Agent Runtime prod eval drift
aliases: [adk-eval-drift-between-local-and-runtime, eval-drift-gotcha, agents-cli-eval-mismatch]
tags: [gotcha, adk, agents-cli, eval, drift, local-vs-prod, autorater, drift]
category: engineer/lessons
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
tacit: true
roles: [engineer, ai-engineer, tech-lead]
benefit: "same mistake avoided"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
---

# ADK local eval vs Agent Runtime prod eval drift

> **As an** engineer, **I want to** adk eval drift between local and runtime, **so that** same mistake avoided.

> ADK local `adk eval` all green -> after deploying Agent Runtime, prod eval drops sharply; local vs prod drift sources: autorater model version mismatch / golden dataset sampling bias / tool implementation differences / context window differences / temperature default differences. This gotcha is the basis of [ADR Two-loop eval as production gate](../../tech-lead/decisions/fde--two-loop-eval-as-production-gate.md) §risk #2, referring to [two-loop LLM evaluation](../../ai-engineer/methodology/run-a-two-loop-llm-evaluation.md).

## Summary

- **Symptom**: local Inner Loop all green -> prod Outer Loop drops sharply; customer incident
- **Root cause**: autorater version mismatch + golden sampling bias + tool implementation differences + context window differences + temperature default differences
- **Fix**: Inner / Outer share autorater version + golden full sync + tool mock same source + context window anchored + temperature must be explicit
- **Reference**: software engineering "run the code you tested in prod" principle

## Core viewpoints

- **The Inner Loop / Outer Loop distinction is borrowed from software engineering for a reason -- the same code that passes CI can fail in production, and the same eval that passes locally can fail in the runtime**: The five classes of drift (autorater, golden dataset, tools, context window, temperature) are not bugs in the evaluation framework; they are environment differences that exist in every deployment. The fix is not to eliminate drift but to make it visible and measurable through Pairwise comparison.

- **Autorater model version is the most insidious drift source because it corrupts the measurement instrument itself**: When the autorater changes from Gemini 2 to Gemini 3, the scoring scale shifts, not the agent's performance. A drop in Pairwise win rate after an autorater upgrade is indistinguishable from a real regression unless you run Pairwise (new autorater x old run) to quantify the scale drift. Without this, every autorater upgrade triggers a false alarm or, worse, masks a real regression.

- **Golden dataset sampling bias creates a false sense of security that is more dangerous than no evaluation at all**: A local eval on 50 curated samples that reports 100% pass rate is not evidence of quality -- it is evidence that the 50 samples are not representative. The production set of 500 real queries will expose the distribution gap. The only defense is full sync: local and prod must use the same golden dataset.

- **Tool implementation drift is the hardest to detect because it produces plausible-looking results that are subtly wrong**: A mock tool that returns `{"status": "ok"}` will pass every eval, but a real tool that returns `{"status": "ok", "details": {...}}` changes the agent's subsequent reasoning. The trajectory score drops not because the agent is worse but because the environment is different. High-fidelity mocks are not optional -- they are a prerequisite for meaningful eval.

- **Context window differences are a special case of the "develop on a supercomputer, deploy on a phone" anti-pattern**: Developing with 200K context and deploying with 8K is the LLM equivalent of developing on a machine with 64GB RAM and deploying to one with 8GB. The recall collapse is not a bug -- it is the system behaving exactly as configured. Context window must be anchored at the production value during all development and evaluation.


- **Local eval != prod eval** — 5 classes of drift sources; without anchoring, drift is guaranteed
- **Autorater version must be locked** — Gemini 2 vs 3 have different scoring scales; Pairwise comparison must use the same autorater
- **Golden dataset must be fully synced** — local sampling / prod full set -> misjudges Inner as all green
- **Tool implementation must be same source** — local mock / prod real call -> tool_trajectory_avg_score deviation
- **Context window must be anchored** — local 200K / prod 8K -> huge recall difference
- **Temperature must be explicit** — different default values -> output determinism differences

## Key information

### Symptom

- Local `adk eval run` all green (tool_trajectory_avg_score >= 0.85 + response_match_score >= 0.7)
- After deploying Agent Runtime, Pairwise win rate < 50%; Pointwise groundedness < 0.9
- Customer incident: prod hallucination rate > 5%; frequent alerts
- Retrospective found: autorater model version mismatch + golden sampling bias + tool implementation differences + context window differences + temperature default differences

### Root cause

- **Autorater version mismatch**: local uses Gemini 2.5; prod uses Gemini 3 Pro; different scoring scales
- **Golden dataset sampling bias**: local samples 50 cases; prod full set 500 cases; large distribution difference
- **Tool implementation differences**: local mock tool returns fixed values; prod real tool call returns real data
- **Context window differences**: local model context 200K; prod deploy context 8K; huge recall difference
- **Temperature default differences**: local 0.0; prod default 0.7; output determinism differences
- **System prompt drift**: local prompt v1.2; prod deploy prompt v1.1 (CI drift)
- **Embedding model differences**: local bge-large; prod text-embedding-005; semantic recall differences

### Impact scope

- All AI customers of FDE Practice; especially customers that release when Inner is all green
- ADK + Agents CLI lifecycle cadence
- Pairwise / Pointwise RAG triad / Model Monitoring

### Solution

**Inner / Outer must share**:

| Dimension | Must share | Drift source |
|---|---|---|
| Autorater version | Same autorater model (e.g. Gemini 3 Pro) | Gemini 2 vs 3 different scoring scales |
| Golden dataset | Full sync; no local sampling | Sampling bias -> local all green prod incident |
| Tool implementation | Local must run real call (or high-fidelity mock) | Mock vs real -> tool_trajectory deviation |
| Context window | Local must anchor prod context (e.g. 8K) | 200K vs 8K -> recall difference |
| Temperature | Must be explicit (e.g. 0.0) | Different defaults -> determinism differences |
| System prompt | CI must lock version; sync local / prod | Prompt drift -> output differences |
| Embedding model | Local / prod same model | bge vs text-embedding-005 -> recall differences |

**Pairwise comparison**: when upgrading autorater, must run Pairwise (new autorater x old run) -> quantify scale drift.

**Model Monitoring**: prod must enable Prediction Drift + Feature Attribution; alert when drift > threshold.

### Similar gotchas

- Local mock tool all green; prod real call fails — tool implementation differences
- Local golden 50 cases all green; prod 500 cases distribution skewed — golden sampling bias
- Local context 200K; prod 8K -> recall collapse — context window differences
- Local temperature 0.0; prod 0.7 -> output uncertainty — temperature default values
- Local prompt v1.2; prod v1.1 -> output drift — CI drift
- Autorater upgrade -> scale changes -> Pairwise not compared -> misjudgment — autorater version

## Action recommendations

1. **Inner / Outer share autorater version**: must lock same autorater (e.g. Gemini 3 Pro); on upgrade run Pairwise comparison ([ADR Two-loop eval gate](../../tech-lead/decisions/fde--two-loop-eval-as-production-gate.md) §decision #7)
2. **Golden dataset full sync**: local no sampling; prod full set runs
3. **Tool implementation same source**: local must run real call; or high-fidelity mock (same schema + same latency + same error rate)
4. **Context window anchored**: local must anchor prod context (e.g. 8K); do not develop on 200K and run prod 8K
5. **Temperature must be explicit**: must be 0.0 (or same prod default); do not rely on default
6. **System prompt CI lock version**: local / prod sync; prompt versioned
7. **Embedding model same source**: local / prod same; do not develop with bge and run prod with text-embedding-005
8. **Pairwise comparison**: autorater upgrade / golden upgrade / prompt upgrade -> must run Pairwise (new x old run)
9. **Model Monitoring must enable**: Prediction Drift + Feature Attribution; threshold alerting
10. **Quarterly re-audit**: 5 classes of drift sources audited; any change triggers Pairwise



- **Releasing when local all green** — 5 classes of drift sources cause prod incident
- **Autorater not locked version** — Gemini 2 vs 3 different scoring scales; Pairwise misjudgment
- **Golden sampling** — local all green prod incident; must full sync
- **Local mock tool not high-fidelity** — tool_trajectory_avg_score false positive
- **Context window not anchored** — 200K vs 8K recall collapse
- **Temperature not explicit** — default value differences cause output uncertainty
- **Prompt not versioned** — CI drift causes output drift
- **No Pairwise run** — autorater upgrade misjudgment; scale drift not quantified

## Anti-patterns

- **Anchoring the context window to the production value but not anchoring the embedding model to the production value at the same time.** The context window and the embedding model are both part of the retrieval pipeline; changing one without the other introduces a second class of drift. Anchoring context to 8K but using `bge-large` locally while production uses `text-embedding-005` means the same query retrieves different documents, and the agent's response quality is confounded by both drift sources simultaneously.
- **Running Pairwise comparison only when the autorater is upgraded, not when the golden dataset is expanded.** Adding 50 new queries to the golden dataset changes the distribution of the evaluation set. A Pairwise run that compares the old autorater on the old dataset vs. the new autorater on the new dataset confounds two changes. The correct sequence is: (1) new autorater x old dataset, (2) old autorater x new dataset, (3) new autorater x new dataset -- three Pairwise runs, not one.
- **Using the same golden dataset for Inner Loop evaluation and Outer Loop monitoring without a holdout split.** If the Inner Loop optimizes the agent against the full golden dataset, the Outer Loop is measuring the agent's performance on data it was trained against, not on unseen data. Split the golden dataset into a dev set (used for Inner Loop optimization) and a holdout set (used for Outer Loop monitoring), and never use the holdout set for development.
- **Assuming that high-fidelity mocks are a one-time effort that does not need maintenance.** The real tool's API changes over time -- new fields are added, response shapes evolve, error codes change. The mock that was high-fidelity three months ago is now stale, and the eval is measuring the agent's performance against a tool that no longer exists. Schedule a monthly sync that compares the mock's schema against the real tool's current API contract and flags any drift.
- **Running the Outer Loop evaluation only at deployment time, not continuously in production.** A deployment-time eval passes when the agent is deployed but cannot detect drift that occurs days or weeks later as the production data distribution shifts. The Outer Loop must run on a schedule (daily or weekly) against live production traffic samples, and a drift alert must fire when Pairwise win rate drops below the threshold between two consecutive runs.

## Related

- Same class: [./no-lockfile-supply-chain-risk.md](gotcha-no-lockfile-supply-chain-risk.md) — version not locked class gotcha
- Contract source: [two-loop LLM evaluation](../../ai-engineer/methodology/run-a-two-loop-llm-evaluation.md) §5 classes of drift sources
- Design basis: [ADR Two-loop eval gate](../../tech-lead/decisions/fde--two-loop-eval-as-production-gate.md) §decision #7 + §risk #2
- Toolchain: [ADK + Agents CLI](../../ai-engineer/platform/orchestrate-agents-with-adk-and-agents-cli.md)
- Upstream: [journeys/i-want-to-check-engineering-gotchas](../process/check-engineering-gotchas.md) — scenario entry
