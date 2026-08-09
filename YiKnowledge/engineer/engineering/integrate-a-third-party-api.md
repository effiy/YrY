---
title: Integrate a third-party API
aliases:
- third-party-api-journey
- vendor-api-journey
tags:
- journeys
- third-party-api
- vendor-integration
- oauth
- webhook
- sla
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: outcome is traceable
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./implement-an-api.md
- ../processes/manage-a-vendor-relationship.md
- ./evaluate-a-vendor-saas.md
- ../../engineer/architecture-design/rpc-envelope.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to integrate a third-party API

> **As an** engineer, **I want to** integrate a third party api, **so that** outcome is traceable.

> Reach patterns + process + thinking + cases within 2 hops for "selection + contract + auth + retry + rate limiting + fallback + monitoring + rollback + retrospective".

## Summary

- Patterns: [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) + [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) + [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md)
- Process: [vendor-management-process.md](manage-a-vendor-relationship.md) + [dependency-upgrade-process.md](dependency-upgrade.md) + [monitoring-governance-process.md](../process/monitoring-governance.md)
- Thinking: [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Cases: [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) + [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) + [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md)

## Core viewpoints

**The abstraction layer is the single most important investment in third-party integration.** Building a vendor-specific adapter behind a generic interface (facade pattern) means that switching providers requires changing one file, not every file that calls the API. The cost of building the abstraction layer is paid once; the cost of not building it is paid every time the vendor changes their API, raises prices, or has an outage. The abstraction layer is not over-engineering; it is insurance.

**Retry logic without idempotency is a data corruption machine.** Exponential backoff with jitter is necessary but insufficient. If the retried request is not idempotent (e.g., creating a duplicate charge, sending a duplicate email), the retry logic amplifies the blast radius of the failure instead of containing it. Every retryable endpoint must be proven idempotent before the retry logic is enabled.

**The contract test is the integration's immune system.** A contract test that verifies the vendor's API still matches the expected schema, field types, and enum values is the only way to detect a breaking change before it reaches production. Running the contract test only during integration is insufficient; it must run on a schedule (daily or weekly) because vendors change their APIs without notice. A contract test that is not scheduled is a contract test that will fail when it is needed most.

**Vendor monitoring must track cost, not just availability.** An API that is returning 200 OK responses but has doubled in latency or silently changed its pricing model is a failing integration. The monitoring dashboard must include cost per call, quota utilization, and latency percentiles alongside error rate and availability. Cost monitoring is the dimension that catches the vendor problem that availability monitoring misses.

**The exit plan must be tested before the integration goes live.** An integration without a tested exit plan is a vendor lock-in with a countdown timer. The exit plan (data export, traffic cutover, rollback path) must be exercised during the integration phase, not documented as a theoretical exercise for the future. If the exit plan cannot be executed in under an hour, the integration is a single point of failure.

## Key info

- **Third-party API integration decision checklist (8 gates)**: (1) Business case — what user need does this API serve, and is there a simpler alternative? (2) Vendor assessment — vendor stability (years in business, funding), API maturity (version count, changelog frequency), community size (GitHub stars, Stack Overflow questions); (3) Contract evaluation — rate limits, SLA uptime guarantee, deprecation policy, pricing model (per-call, subscription, usage-based); (4) Technical fit — authentication method (OAuth 2.0, API key, mTLS), data format (JSON, protobuf, XML), SDK availability and quality; (5) Compliance — data residency (where does data go?), regulatory certifications (SOC 2, ISO 27001, GDPR), data processing agreement; (6) Integration cost estimate — initial integration (hours), ongoing maintenance (hours/month), migration cost if the vendor sunsets; (7) Exit plan — data export format and procedure, traffic cutover process, estimated migration time; (8) Go/no-go decision — all 7 preceding gates must pass before integration begins. The Yi-family projects use this checklist for LLM provider selection (Anthropic, OpenAI) and database selection (MongoDB Atlas).
- **Abstraction layer (facade pattern) implementation**: The vendor-specific adapter implements a generic interface. Example: `interface LLMProvider { chat(messages: Message[]): Promise<Response>; stream(messages: Message[]): AsyncIterable<Chunk>; }` — implemented by `AnthropicProvider`, `OpenAIProvider`, etc. The rest of the application calls `LLMProvider.chat()`, never `AnthropicProvider.chat()`. Switching providers requires changing one line of configuration, not every file that calls the LLM. The abstraction layer cost: ~100 lines of interface definition + adapter per provider. The cost of not having it: every file that calls the LLM must be updated when switching providers. The YiAi project uses this pattern for multi-provider LLM routing.
- **Retry strategy with idempotency guarantees**: (1) Exponential backoff with jitter — first retry at 1s, second at 2s, third at 4s, max 30s, with random jitter (±25%) to prevent thundering herd; (2) Max retries — 3 for idempotent operations (GET, PUT), 1 for non-idempotent operations (POST that creates resources), 0 for non-idempotent operations without idempotency keys; (3) Circuit breaker — after 5 consecutive failures, stop calling the API for 30 seconds, then try once (half-open state), resume if successful, stay open if still failing; (4) Idempotency key — for POST operations, generate a unique key per request, pass as `Idempotency-Key` header, the vendor deduplicates requests with the same key. The retry strategy must be proven safe before enabling; an unsafe retry is a data corruption incident waiting to happen.
- **Contract test scheduling and failure response**: Contract tests verify the vendor's API matches the expected schema. Run frequency: daily for critical APIs (LLM, payment, auth), weekly for non-critical APIs. Failure response: (1) Auto-create a Jira ticket with the contract test failure details; (2) Notify the integration owner (the person who owns the vendor relationship); (3) If the failure is a breaking change (field removed, type changed), escalate to tech-lead within 4 hours; (4) If the failure is additive (new field added, new enum value), update the contract test to accept the new schema; (5) If the vendor announced the change via deprecation notice, follow the migration timeline; if unannounced, contact vendor support immediately. The Yi-family projects have contract tests for the Anthropic and OpenAI APIs (LLM response schema) and MongoDB (document schema).
- **Vendor monitoring dashboard (5 dimensions)**: (1) Availability — uptime percentage, error rate by status code (4xx vs 5xx), alert if error rate >1% for 5 minutes; (2) Latency — p50, p95, p99 response time, alert if p95 >2x baseline; (3) Cost — cost per call, daily/monthly spend, quota utilization percentage, alert if approaching 80% of quota; (4) Rate limit — remaining calls in the current window, rate limit hits count, alert if rate limit hits >0; (5) Data quality — schema drift events, unexpected null values, type mismatches, alert on any schema drift. The monitoring dashboard is per-vendor, not aggregate; an aggregate "all APIs healthy" dashboard hides individual vendor problems.
- **Yi-family third-party integrations**: YiAi — Anthropic API (Claude models, primary LLM), OpenAI API (GPT models, secondary LLM), MongoDB Atlas (database), RSS feeds (knowledge ingestion). YiVad — YiAi RPC API (data and LLM access), no external third-party APIs. YiPet — YiAi RPC API (data and LLM access), Chrome APIs (storage, tabs, runtime), no external third-party APIs. The abstraction layer for LLM providers in YiAi enables switching between Anthropic and OpenAI without code changes in YiVad or YiPet.

## Scenario

When integrating third-party APIs / vendor APIs / OAuth / webhooks / SLA negotiation / upstream provider upgrades / third-party traffic switching / multi-provider routing / cross-border calls / data leaving the country, platform + TL + engineer + business owners need to look up patterns + process + thinking + cases. This entry aggregates third-party integration related patterns + process + thinking onto a 2-hop path, avoiding "missing contract / chaotic auth / retry explosion / improper rate limiting / missing fallback / missing monitoring / hard rollback / cross-border data violations".

## 2-hop reachability paths

| Hop 1 (category / leaf) | Hop 2 (specific file) |
|---|---|
| `methodology/engineering-patterns/` | [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) · [supply-chain-hardening-pattern.md](../process/harden-supply-chain.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [sse-streaming-pattern.md](../architecture-design/sse-streaming.md) · [eval-driven](../engineering/evaluation-driven-development.md) · [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — intent of integration · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — imagine gaps · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — upgrade chain reactions · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/ai-specific/` | [prompt-injection-defense-summary.md](../../ai-engineer/methodology/prompt-injection-defense.md) · [rag-design-patterns-summary.md](../../ai-engineer/methodology/rag-design-patterns.md) · [agent-architecture-patterns-summary.md](../../ai-engineer/methodology/agent-architecture-patterns.md) |
| `work/processes/` | [vendor-management-process.md](manage-a-vendor-relationship.md) · [dependency-upgrade-process.md](dependency-upgrade.md) · [shared-client-vendor-rollout-process.md](shared-client-vendor-rollout.md) · [incident-response-process.md](../process/incident-response.md) · [hotfix-release-process.md](../../oncall-sre/release/hotfix-release.md) · [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [data-compliance-process.md](../infrastructure/data-compliance.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) |
| `tech/ai-platform/` | [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) · [inference-engine-comparison-summary.md](../../ai-engineer/platform/inference-engine-comparison.md) · [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [embedding-model-selection-summary.md](../../ai-engineer/platform/embedding-model-selection.md) · [vector-db-comparison-summary.md](../../ai-engineer/platform/vector-db-comparison.md) |
| `tech/infra/` | [capacity-and-cost-summary.md](../../oncall-sre/observability/capacity-and-cost.md) · [tech-debt-inventory-summary.md](../../oncall-sre/observability/tech-debt-inventory.md) |
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) |
| `resources/templates/` | [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [openapi-spec-template.md](./../../knowledge-curator/templates/tech-design.md) |
| `resources/prompts/` | [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [agent-tool-use-prompt.md](../../ai-engineer/methodology/prompts--agent-tool-use.md) |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yiai-supply-chain-hardening-win.md](../lessons/win-yiai-supply-chain-hardening.md) · [yiai-rag-hybrid-retrieval-win.md](../lessons/win-yiai-rag-hybrid-retrieval.md) · [yiai-llm-phase-{two,three,four,five}-win.md](../lessons) |
| `lessons/gotchas/` | [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — integration incident archive |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — vendor communication |
| `people/experts--` | [external-experts-roster.md](../../knowledge-curator/people/experts--external-experts-roster.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) · [cross-timezone-collaboration-summary.md](../process/cross-timezone-collaboration.md) |
| `industry/competitors--` | [llm-vendor-landscape-summary.md](../../executive/industry/competitors--llm-vendor-landscape.md) · [competitor-analysis-template.md](../../executive/industry/competitors--competitor-analysis.md) |
| `brd/reference/` | [countries.md](./../../brd/README.md) · [regulations.md](./../../brd/README.md) — cross-border |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) |
| `projects/YiAi/` | `adr-multi-provider-llm-routing.md` · `adr-llm-multi-provider-rollout.md` · `adr-rag-evaluation-infra.md` · `adr-brd-agent-launch.md` |
| `journeys/` | [./implement-an-api.md](../architecture-design/implement-an-api.md) · [../processes/manage-a-vendor-relationship.md](manage-a-vendor-relationship.md) · [./evaluate-a-vendor-saas.md](../engineering/evaluate-a-vendor-saas.md) · [./harden-supply-chain.md](../process/harden-supply-chain.md) |

## Action recommendations

1. **First principles**: first ask "what integration solves / build vs integrate / ROI / switching cost"; do not integrate for the sake of integrating; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md).
2. **Inversion**: first imagine "how integration can go out of control (vendor down / contract change / auth failure / data leak / cost explosion / lock-in)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md).
3. **Second-order effects**: a vendor upgrade → contract change → cascades to tests / documentation / monitoring / business; see [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md).
4. **Occam**: the simplest integration that meets needs wins; do not pile up SDKs; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md).
5. **Selection**: must run [tech-selection-evaluation-template.md](../../knowledge-curator/templates/tech-selection-evaluation.md) + [i-want-to-do-a-tech-selection.md](../../tech-lead/roadmap/do-a-tech-selection.md); compare multiple candidates.
6. **Contract**: must run [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md); guard against schema / field / enum drift.
7. **RPC envelope**: must run [rpc-envelope-pattern.md](../architecture-design/rpc-envelope.md) + [sse-streaming-pattern.md](../architecture-design/sse-streaming.md); unified encapsulation + error codes.
8. **Auth**: must use OAuth / API key / mTLS / short-lived tokens + must run [i-want-to-handle-secrets-and-config.md](../quality-security/handle-secrets-and-config.md) + secret rotation.
9. **Retry**: must use exponential backoff + must be idempotent + must cap + must distinguish 5xx / 4xx; do not explode retries.
10. **Rate limiting**: must align with vendor quota + must have client-side rate limiting + must queue + must degrade.
11. **Fallback**: must run [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + multi-provider routing + self-hosted vLLM fallback; see [i-want-to-pick-an-llm-provider.md](../../ai-engineer/platform/pick-an-llm-provider.md).
12. **Monitoring**: must run [monitoring-governance-process.md](../process/monitoring-governance.md); call volume / latency / error rate / cost / quota.
13. **Contract test**: must build [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) + must run periodically + must run before vendor upgrades.
14. **Dual world**: switching providers must run [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + dual run + diff; see [i-want-to-handle-a-model-drift.md](../../ai-engineer/foundations/handle-a-model-drift.md).
15. **Webhook**: must verify signatures + must be idempotent + must have replay protection + must have timeouts + must queue.
16. **Data leaving the country**: must run [data-compliance-process.md](../infrastructure/data-compliance.md) + [countries.md](./../../brd/README.md) + [regulations.md](./../../brd/README.md) + DPA + desensitization.
17. **SLA**: must run [contract-negotiation-summary.md](../../knowledge-curator/archive/strategies-legacy/engineer/prepare-a-contract-strategy.md) + must align with business + must monitor actual values.
18. **Rollback**: must be able to switch back to the old provider / fallback in seconds; see [rollback-drill-process.md](../../oncall-sre/release/rollback-drill.md).
19. **Freeze period**: during big promos follow [release-freeze-process.md](../../oncall-sre/release/release-freeze.md); do not switch providers.
20. **Retrospective**: after an incident follow [i-want-to-write-a-postmortem.md](../../tech-lead/risk/write-a-postmortem.md) retrospective + archive under [bugs/](../lessons).
21. **Quarterly audit**: follow [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the vendor is still stable / contract has drifted / cost is still reasonable.
22. **ADR**: integration decisions must land in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md).
23. **Flywheel**: good integration → business up → more integrations → more capabilities; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md).

## Anti-patterns

- **Integrating without an abstraction layer.** Calling the vendor's SDK directly from business logic means every file in the codebase is coupled to the vendor. When the vendor deprecates an endpoint, changes authentication, or raises prices beyond acceptable limits, the migration touches dozens of files. The abstraction layer is not optional; it is the difference between a one-day migration and a one-month migration.

- **Treating the vendor's SLA as a guarantee.** A vendor's SLA defines the compensation you receive when they fail, not the reliability you can expect. The actual reliability is determined by monitoring, not by the contract. Designing the integration to depend on the SLA rather than on your own fallback and circuit breaker mechanisms means the integration fails when the vendor fails, regardless of what the SLA promises.

- **Hardcoding vendor-specific configuration.** Embedding API keys, endpoint URLs, rate limits, and feature flags directly in the code (rather than in configuration) means that changing any of these requires a code deploy. Configuration that changes at the vendor's pace (endpoints, rate limits, feature toggles) must be externalized so that it can change without a deploy.

- **Adding retry logic without a circuit breaker.** Unbounded retries with exponential backoff during a vendor outage turn a single failed request into a self-inflicted DDoS. The retry logic must be paired with a circuit breaker that stops retrying after a threshold of consecutive failures and fails fast. Without the circuit breaker, the retry logic consumes resources that could be used to serve other requests.

- **Skipping the post-integration retrospective.** An integration that goes live without documenting what went wrong, what surprised the team, and what would be done differently next time is a missed opportunity to make the next integration faster. The retrospective is not a post-mortem for a failure; it is a knowledge capture for the next integration. Every integration, successful or not, must produce a retrospective.

## Related

- Similar journey: [./implement-an-api.md](../architecture-design/implement-an-api.md) — implement an API
- Similar journey: [../processes/manage-a-vendor-relationship.md](manage-a-vendor-relationship.md) — vendor management
- Similar journey: [./evaluate-a-vendor-saas.md](./evaluate-a-vendor-saas.md) — SaaS evaluation
- Similar journey: [./harden-supply-chain.md](../process/harden-supply-chain.md) — supply chain hardening
- Upstream: [../../README.md](../../README.md) — engineering-patterns leaf entry
