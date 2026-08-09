---
title: Set up a tracking plan
aliases:
- I want to set up a tracking plan
- tracking-plan-journey
- analytics-event-schema-journey
- tracking-solution-entry
tags:
- journeys
- tracking-plan
- analytics
- telemetry
- event-schema
- data-dictionary
- observability
category: engineer/engineering
created: 2026-08-03
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
roles:
- engineer
benefit: baseline is reproducible
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../processes/run-an-a-b-test.md
- ../../oncall-sre/observability/set-up-observability.md
- ../processes/measure-product-metrics.md
- ../../ai-engineer/data/data-governance.md
review_cycle: quarterly
last_verified: 2026-08-07
tacit: false
---

# I want to set up a tracking plan

> **As an** engineer, **I want to** set up a tracking plan, **so that** baseline is reproducible. 

> "Event + property + naming + validation + integration + docs + monitoring + quarterly audit" reaches Process + Thinking + Case study within 2 hops.

## Summary

- Process follows [data-governance-process.md](../../ai-engineer/data/data-governance.md) + [monitoring-governance-process.md](../process/monitoring-governance.md) + [requirement-review.md](../../product-manager/delivery/requirement-review.md)
- Thinking follows [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) + [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) + [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) + [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md)
- Data follows [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) + [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md)
- Case study follows [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) + [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md)

## Core viewpoints

**The event schema is the SSOT contract between engineering and data consumers.** A tracking plan without a versioned, shared, and validated event schema is a collection of ad-hoc events that cannot be trusted for analysis. The schema must define every event name, every property type, every required field, and every enum value. When the schema is not the SSOT, every downstream consumer (data science, product, exec) builds their own interpretation of what the data means, and those interpretations diverge.

**Naming conventions are the foundation of queryability, not a cosmetic preference.** An event naming convention (snake_case, verb_noun_object, prefix-based) that is inconsistently applied means that querying across events requires manual lookups and guesswork. The convention must be enforced at the SDK level, not at the code review level. A naming convention that relies on human discipline is a naming convention that will fail.

**Instrumentation without a quarterly audit decays into noise.** Events accumulate over time as features are added, deprecated, and modified. Without a quarterly audit that checks whether each event is still used, still accurate, and still aligned with the business questions it was designed to answer, the tracking plan becomes a graveyard of obsolete events. The audit is not a cleanup activity; it is the mechanism that keeps the instrumentation trustworthy.

**PII leakage is an instrumentation failure, not a security incident.** If the tracking plan does not explicitly define which fields may contain PII and how they must be masked, the instrumentation will eventually leak PII. The PII policy must be embedded in the event schema (field-level masking rules) and validated at the SDK level. Security review after the fact is too late; the instrumentation must be PII-safe by construction.

**The tracking plan must be backward-designed from the business questions it answers.** Instrumenting without first defining the business questions (What is the conversion rate? Where do users drop off? Which feature drives retention?) produces a firehose of data that cannot answer any specific question. The tracking plan is not a list of events; it is a mapping from business questions to the events and properties that answer them. Every event must trace back to a business question.

## Key info

- **Event schema specification format (8 required fields per event)**: (1) Event name — `verb_noun_object` format in snake_case (e.g., `click_checkout_button`, `view_search_results`); (2) Description — what user action triggers this event; (3) Trigger — specific UI element, API endpoint, or system condition; (4) Properties — name, type (string/number/boolean/enum), required/optional, description, example value; (5) Business question — which business question does this event help answer? (6) Owner — which team owns this event? (7) Retention — how long is this event data retained? (8) PII classification — does this event contain PII? If yes, what masking is applied? The Yi-family tracking plan uses this 8-field schema format.
- **Event naming convention (verb_noun_object with prefixes)**: Format: `{category}_{verb}_{noun}_{object}`. Categories: `screen_` (page/screen views), `click_` (user interactions), `api_` (API calls), `error_` (errors/exceptions), `perf_` (performance metrics), `ai_` (AI-specific events like `ai_rag_query`, `ai_brd_generate`). Verbs: `view`, `click`, `submit`, `search`, `select`, `dismiss`, `complete`, `fail`. Objects: specific UI element or feature name. Examples: `click_navbar_knowledge_tab`, `ai_rag_query_submit`, `error_api_timeout`. The convention must be enforced at the SDK level (TypeScript enum or Python Enum) so that incorrect names are compile-time errors, not runtime surprises.
- **PII field-level masking rules (4 levels)**: Level 0 (No PII) — event name, timestamp, session ID, feature flags; no masking needed. Level 1 (Pseudonymous) — user ID (hashed), device ID; store hashed, never raw. Level 2 (Potentially PII) — IP address (truncate to /24), user agent (store as-is), geolocation (city-level only, not coordinates); truncate or aggregate. Level 3 (Definitely PII) — email, phone, name, address, payment info; NEVER send to analytics. The SDK must reject events containing Level 3 fields at build time. The Yi-family tracking plan: all events are Level 0-1 (internal tools, no external users); PII policy is in place for when external users are onboarded.
- **Tracking plan validation and testing (4 gates)**: (1) Schema validation — CI validates that all emitted events match the schema (correct name, correct property types, required fields present); (2) Sampling validation — QA samples 1% of production events and manually verifies property values against the UI; (3) Business question validation — quarterly review verifies that each business question can be answered with the current events; (4) PII audit — automated scan of event data for patterns matching PII (email regex, phone regex, credit card regex). The Yi-family projects: gate 1 is partially implemented (TypeScript types enforce event schema), gates 2-4 are not yet implemented.
- **Tracking plan lifecycle management (5 phases)**: (1) Propose — PM or data science proposes a new event with the business question it answers; (2) Review — engineering reviews for feasibility, data engineering reviews for schema compliance; (3) Implement — engineer adds the event to the SDK with the schema definition; (4) Deprecate — when an event is no longer needed, mark as deprecated with a sunset date (minimum 30 days notice); (5) Remove — after the sunset date, remove the event from the SDK and mark as archived in the schema registry. The Yi-family tracking plan is in the proposal/implementation phase; no formal deprecation process exists yet.
- **Yi-family tracking plan state (2026-08)**: YiAi — basic API-level tracking (request count, error rate, latency) via FastAPI middleware; no user-level event tracking. YiVad — basic page view tracking (Vue Router navigation events); no user interaction tracking. YiPet — no tracking infrastructure (Chrome extension). The gap: no project has a formal tracking plan with event schema, business question mapping, or PII policy. The tracking plan template and process are in place for when production user-facing features are deployed.

## Scenario description

When building tracking solutions / tracking plans / event schemas / data dictionaries / instrumentation specs / analytics events / product analytics instrumentation / telemetry design / SDK integration / instrumentation QA / event validation / instrumentation documentation / instrumentation monitoring / instrumentation drift fixes / quarterly instrumentation audits, PM + data science + engineering owner + data engineering need to look up Process + Thinking + Case study. This entry aggregates tracking-solution-related Process + Thinking + Case study into 2-hop paths, avoiding "scattered events / missing properties / messy naming / missing validation / integration drift / scattered docs / missing monitoring / no quarterly audit".

## 2-hop reachability path

| Hop 1 (category/leaf) | Hop 2 (specific file) |
|---|---|
| `tech/data/` | [data-governance-summary.md](../../ai-engineer/data/data-governance.md) · [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md) · [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md) · [mongodb-indexing-summary.md](../../ai-engineer/data/mongodb-indexing.md) · [lakehouse-architecture-summary.md](../../ai-engineer/data/lakehouse-architecture.md) |
| `work/processes/` | [data-governance-process.md](../../ai-engineer/data/data-governance.md) · [monitoring-governance-process.md](../process/monitoring-governance.md) · [requirement-review.md](../../product-manager/delivery/requirement-review.md) · [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) · [quarterly-tech-debt-process.md](../quality-security/quarterly-tech-debt.md) |
| `methodology/thinking/` | [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md) — essence of tracking · [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md) — reverse-think dirty data · [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md) — chain effects · [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md) · [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md) |
| `methodology/engineering-patterns/` | [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md) · [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md) · [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) · [eval-driven](../engineering/evaluation-driven-development.md) |
| `methodology/pm-frameworks/` | [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) · [kano-model-summary.md](../../product-manager/frameworks/kano-model.md) · [product-discovery-summary.md](../../knowledge-curator/archive/strategies-legacy/product-manager/prepare-a-product-discovery-strategy.md) |
| `product/metrics/` | [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) · [ai-product-metrics-summary.md](../../product-manager/discovery/metrics--ai-product-metrics.md) · [retention-and-churn-summary.md](../../product-manager/discovery/metrics--retention-and-churn.md) — event source |
| `tech/ai-platform/` | [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) · [llm-comparison-summary.md](../../ai-engineer/platform/llm-comparison.md) |
| `resources/templates/` | [tech-design-template.md](../../knowledge-curator/templates/tech-design.md) · [adr-template.md](../../knowledge-curator/templates/adr.md) · [meeting-notes-template.md](../../knowledge-curator/templates/meeting-notes.md) · [knowledge-leaf-template.md](../../knowledge-curator/templates/knowledge-leaf.md) |
| `resources/prompts/` | [sql-generation-prompt.md](../../ai-engineer/methodology/prompts--sql-generation.md) · [code-review-prompt.md](../../ai-engineer/methodology/prompts--code-review.md) · [rag-system-prompt.md](../../ai-engineer/methodology/prompts--rag-system.md) |
| `work/collaboration/` | [raci-matrix-summary.md](../process/raci-matrix.md) · [async-collaboration-principles-summary.md](../process/async-collaboration-principles.md) |
| `people/stakeholders--` | [stakeholder-map.md](../../knowledge-curator/people/stakeholders--stakeholder-map.md) · [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) — instrumentation communication |
| `lessons/wins/` | [yiai-brd-agent-launch.md](../lessons/win-yiai-brd-agent-launch.md) · [yipet-stack-migration-win.md](../lessons/win-yipet-stack-migration.md) |
| `lessons/failures/` | [incident-postmortem-summary.md](../lessons/failure-incident-postmortem.md) · [ai-product-launch-lessons-summary.md](../lessons/failure-ai-product-launch-lessons.md) · [bugs/](../lessons) — instrumentation incident archive |
| `lessons/gotchas/` | [macos-fsevents-silent-drop.md](../lessons/gotcha-macos-fsevents-silent-drop.md) · [sse-ondone-guard.md](../lessons/gotcha-sse-ondone-guard.md) · [no-lockfile-supply-chain-risk.md](../lessons/gotcha-no-lockfile-supply-chain-risk.md) |
| `lifecycle/` | [governance.md](../../knowledge-curator/governance/governance.md) · [review-log.md](../../knowledge-curator/governance/review-log.md) · [readiness-checklist.md](../../knowledge-curator/governance/readiness-checklist.md) · [tacit-knowledge-backlog.md](../../knowledge-curator/governance/tacit-knowledge-backlog.md) |
| `projects/` | Each project's `architecture-summary.md` §instrumentation + `dev-standards-summary.md` §event conventions |
| `journeys/` | [../processes/run-an-a-b-test.md](../quality-security/run-an-a-b-test.md) · [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) · [../processes/measure-product-metrics.md](../process/measure-product-metrics.md) · [../processes/do-a-data-quality-audit.md](../infrastructure/do-a-data-quality-audit.md) |

## Action recommendations

1. **First principles**: First ask "what business does the tracking serve / what happens if not built / ROI / user impact"; don't instrument for the sake of instrumenting; see [first-principles-summary.md](../../knowledge-curator/templates/thinking--first-principles.md). 
2. **Inversion**: First think "how could instrumentation go out of control (event drift / missing properties / PII leakage / volume explosion / double-firing / missing fires)" then set guardrails; see [inversion-summary.md](../../knowledge-curator/templates/thinking--inversion.md). 
3. **Second-order effects**: One piece of dirty data → cascades downstream / reports / models / decisions; follow [second-order-thinking-summary.md](../../knowledge-curator/templates/thinking--second-order-thinking.md). 
4. **Occam**: The simplest event set that satisfies the business wins; don't pile up events; see [ockhams-razor-summary.md](../../knowledge-curator/templates/thinking--ockhams-razor.md). 
5. **SSOT**: Event schema must use SSOT + be shared across front/backend + be versioned; follow [ssot-view-layer-pattern.md](../architecture-design/ssot-view-layer.md). 
6. **Naming**: Must use naming spec (snake_case / verb_noun_object) + prefix (app_/web_/server_) + property prefix (user_/page_/session_). 
7. **Properties**: Must define required + optional + type + enum + example; follow [data-modeling-summary.md](../../ai-engineer/data/data-modeling.md). 
8. **JTBD**: Must follow [jobs-to-be-done-summary.md](../../product-manager/frameworks/jobs-to-be-done.md) to understand user journeys + must instrument by funnel. 
9. **Metric**: Must follow [north-star-metric-summary.md](../../product-manager/discovery/metrics--north-star-metric.md) + reverse-derive events + must have guardrails. 
10. **Validation**: Must run SDK validation + schema validation + instrumentation QA + event regression; follow [contract-test-baseline-pattern.md](../quality-security/contract-test-baseline.md). 
11. **Integration**: Must use SDK + event gateway + dual-write (real-time + warehouse) + idempotency; follow [etl-elt-patterns-summary.md](../../ai-engineer/data/etl-elt-patterns.md). 
12. **PII**: Must follow [data-governance-summary.md](../../ai-engineer/data/data-governance.md) + masking + minimize + access audit. 
13. **AI instrumentation**: LLM products must follow [llm-observability-comparison-summary.md](../../ai-engineer/platform/llm-observability-comparison.md) + capture prompt / response / token / latency. 
14. **Dual world**: Instrumentation rebuild must follow [dual-world-boundary-pattern.md](../engineering/dual-world-boundary.md) + dual-run + diff. 
15. **RACI**: Must follow [raci-matrix-summary.md](../process/raci-matrix.md); PM / data / engineering / sponsor owners. 
16. **Freeze period**: During promotions use [release-freeze-process.md](../../oncall-sre/release/release-freeze.md) — don't change the instrumentation schema. 
17. **Monitoring**: Must follow [monitoring-governance-process.md](../process/monitoring-governance.md) dashboards + thresholds + alerts (event volume / missing fires / double fires / validation failures). 
18. **Communication**: Must follow [communication-cadence.md](../../knowledge-curator/people/stakeholders--communication-cadence.md) to communicate to sponsor + business. 
19. **Retrospective**: After instrumentation incidents must run [retrospective-template.md](../../knowledge-curator/templates/retrospective.md) retrospective + archive in [bugs/](../lessons). 
20. **Quarterly audit**: Follow [governance.md](../../knowledge-curator/governance/governance.md) + [review-log.md](../../knowledge-curator/governance/review-log.md) to scan whether the schema is still accurate + whether events are still used. 
21. **ADR**: Instrumentation decisions must be captured in an ADR; see [adr-template.md](../../knowledge-curator/templates/adr.md). 
22. **Flywheel**: Good instrumentation → accurate data → good decisions → business growth; see [flywheel-effect-summary.md](../../knowledge-curator/templates/thinking--flywheel-effect.md). 

## Anti-patterns

- **Instrumenting first and defining the schema later.** Adding tracking events to the codebase without a defined schema, naming convention, or property specification means that the data is inconsistent from the first day. The schema must be defined before the first event is fired. Retrofitting a schema onto existing events is a data migration project that is more expensive than doing it right the first time.

- **Tracking everything because storage is cheap.** Instrumenting every click, every page view, and every state change without a business question that each event answers produces a data swamp. The cost of this anti-pattern is not storage; it is the cognitive load on data consumers who must wade through irrelevant events to find the signal. Storage is cheap; analyst time is expensive.

- **Skipping the instrumentation QA step.** Deploying tracking without validating that events fire correctly, properties are populated, and the schema is enforced means that broken instrumentation reaches production. The instrumentation QA must be part of the CI pipeline (schema validation, event regression tests) and part of the release process (staging validation). A tracking plan without QA is a plan that produces dirty data.

- **Allowing the frontend and backend to define events independently.** When the frontend team defines its events and the backend team defines its events without a shared schema, the two datasets cannot be joined, correlated, or compared. The event schema must be a single source of truth that both frontend and backend teams reference. Independent event definitions are two partial tracking plans pretending to be one.

- **Changing the event schema during a release freeze.** Modifying event definitions, adding new properties, or changing naming conventions during a promotion period or holiday freeze violates the freeze process and introduces unvalidated changes. The downstream impact on dashboards, reports, and models cannot be assessed during a freeze. Event schema changes are code changes and must follow the same freeze rules.

## Related

- Related journey: [../processes/run-an-a-b-test.md](../quality-security/run-an-a-b-test.md) — A/B experiment
- Related journey: [../../oncall-sre/observability/set-up-observability.md](../../oncall-sre/observability/set-up-observability.md) — observability
- Related journey: [../processes/measure-product-metrics.md](../process/measure-product-metrics.md) — metrics
- Related journey: [../processes/do-a-data-quality-audit.md](../infrastructure/do-a-data-quality-audit.md) — data quality
- Upstream: [../../ai-engineer/data/README.md](../../ai-engineer/data/README.md) — data leaf entry
