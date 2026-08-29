---
title: Tech Lead — Architecture Decisions / Tech Selection / Capacity / Roadmap / Risk Workspace
aliases: [leader-readme, leader-index]
tags: [category, leader, architecture, adr, capacity, roadmap, risk]
category: leader
created: 2026-08-05
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: monthly
roles: [leader, engineer, aier]
benefit: "Architecture decisions / ADR / tech selection / capacity planning / roadmap / risk registry centralized; cross-sub-project technical decisions are traceable"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../INDEX.md
  - ../README.md
  - ../engineer/ship/README.md
  - ./INDEX.md
---

# Tech Lead — Architecture Decisions / Tech Selection / Capacity / Roadmap / Risk Workspace

> **Pipeline stage 2/5: Decisions** — Input chips: `PRDs`, `requirements` → Output chips: `ADRs`, `tech selections`, `capacity plans`
>
> **As a** tech lead, **I want to** understand and apply tech lead — architecture decisions / tech selection / capacity / roadmap / risk workspace, **so that** I can cross-project technical decisions are traceable and new leads don't re-derive existing conclusions.
>
> Leader DECIDES the technical direction. It does not implement patterns (→ [engineer/](../engineer/)), respond to incidents (→ [srer/](../srer/)), or define product requirements (→ [producter/](../producter/)).

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| PRDs | ← Input | Product Requirement Documents from producter/ | [producter/discovery/prd/](../producter/discovery/prd/) |
| requirements | ← Input | Functional and non-functional requirements | [producter/discovery/](../producter/discovery/) |
| `adrs` | Output → | Architecture Decision Records — Context/Decision/Consequences | [decisions/](./decisions/), [architecture/](./architecture/) |
| `tech-selections` | Output → | Technology stack evaluations, comparison matrices | [architecture/](./architecture/), [roadmap/](./roadmap/) |
| `capacity-plans` | Output → | Capacity planning, FinOps reviews, infrastructure sizing | [capacity/](./capacity/), [roadmap/](./roadmap/) |

## Subdirectories (by pipeline chip)

| Chip | Domain | Content | Files |
|---|---|---|---|
| `adrs` | [architecture/](./architecture/) | Architecture decision framework, tech selection evaluations, maturity models | 7 |
| `adrs` | [decisions/](./decisions/) | ADRs organized by project: YiAi (6), YiVad (3), YiPet (3), FDE (4) + cross-project | 18 |
| `adrs` | [risk/](./risk/) | Risk register, postmortem methodology, outage communication, dependency risk | 5 |
| `capacity-plans` | [capacity/](./capacity/) | Capacity & cost tracking, FinOps reviews, dependency audits, cost overrun handling | 7 |
| `tech-selections`, `capacity-plans` | [roadmap/](./roadmap/) | Roadmap planning, tech debt management, tech selection, PoC, SLO, deprecation, decommissioning | 11 |

## Scope

### In scope (leader OWNS)

**`adrs` chip:**
- Architecture decisions with tradeoffs and consequences (ADRs) → [decisions/](./decisions/)
- Architecture decision framework, maturity models → [architecture/](./architecture/)
- Risk register and pre-incident risk assessment → [risk/](./risk/)
- Cross-project technical decision alignment

**`tech-selections` chip:**
- Tech selection and vendor evaluation decisions → [architecture/](./architecture/)
- Technical roadmap and quarterly planning → [roadmap/](./roadmap/)

**`capacity-plans` chip:**
- Capacity planning and FinOps strategy → [capacity/](./capacity/)
- SLO definition and infrastructure sizing → [roadmap/](./roadmap/)

### Out of scope (delegated to other roles)
- Implementation patterns and how-to guides → **[engineer/](../engineer/)**
- Incident response procedures → **[srer/incident-response/](../srer/incident-response/)**
- Post-incident postmortems → **[srer/incident-response/](../srer/incident-response/)** (leader/risk/ has the methodology, srer/ has the actual postmortems)
- Cost monitoring and dashboards → **[srer/observability/](../srer/observability/)**
- Product requirements and PRDs → **[producter/discovery/](../producter/discovery/)**
- Business strategy and market analysis → **[executiver/](../executiver/)**
- Organizational (non-technical) roadmap → **[executiver/roadmap/](../executiver/roadmap/)**

## Decision rules for boundary cases

| When content involves... | Chip | Route to | Because |
|---|---|---|---|
| ADR (why we chose X over Y) | `adrs` | [leader/decisions/](./decisions/) | Decision with tradeoffs |
| How to implement X pattern | `architecture-patterns` | [engineer/build/](../engineer/build/) | Implementation know-how |
| Tech selection evaluation | `tech-selections` | [leader/architecture/](./architecture/) | Strategic technology choice |
| Pre-incident risk assessment | `adrs` | [leader/risk/](./risk/) | Proactive risk management |
| During-incident response | `incident-response` | [srer/incident-response/](../srer/incident-response/) | Operational procedure |
| Post-incident postmortem | `postmortems` | [srer/incident-response/](../srer/incident-response/) | Operational record |
| Capacity planning (how much, how much $) | `capacity-plans` | [leader/capacity/](./capacity/) | Strategic planning |
| Capacity monitoring (current usage) | `observability` | [srer/observability/](../srer/observability/) | Operational monitoring |
| Technical roadmap (what tech when) | `tech-selections` | [leader/roadmap/](./roadmap/) | Tech leadership |
| Business roadmap (what business goals) | — | [executiver/roadmap/](../executiver/roadmap/) | Business leadership |

## Subdirectory descriptions

### architecture/
Architecture decision framework, tech selection evaluations, and maturity assessments. Covers: ADR framework and 12-section template, LLM provider selection, React state management selection, architecture maturity model, documentation maturity model, YiVad test framework tech debt.

Key files:
- [design-architecture-decision.md](./architecture/design-architecture-decision.md) — ADR framework and 12-section template
- [tl-tech-selection-llm-provider.md](./architecture/tl-tech-selection-llm-provider.md) — LLM provider selection criteria
- [tl-tech-selection-react-state-management.md](./architecture/tl-tech-selection-react-state-management.md) — React state management selection
- [tl-maturity-model-arch-2026-08.md](./architecture/tl-maturity-model-arch-2026-08.md) — Architecture maturity assessment
- [tl-maturity-model-docs-2026-08.md](./architecture/tl-maturity-model-docs-2026-08.md) — Documentation maturity assessment
- [tl-tech-debt-yivad-no-test-framework.md](./architecture/tl-tech-debt-yivad-no-test-framework.md) — YiVad test framework tech debt

### decisions/
Architecture Decision Records organized by project subtree. Each ADR follows the 12-section template from [architecture/design-architecture-decision.md](./architecture/design-architecture-decision.md). ADR template at [../curator/templates/adr.md](../curator/templates/adr.md).

**YiAi (6 ADRs):**
- [route-llm-traffic-across-providers.md](./decisions/yiai/route-llm-traffic-across-providers.md) — Multi-provider LLM traffic routing strategy
- [llm-multi-provider-rollout.md](./decisions/yiai/llm-multi-provider-rollout.md) — LLM multi-provider phased rollout
- [rag-evaluation-infra.md](./decisions/yiai/rag-evaluation-infra.md) — RAG evaluation infrastructure
- [brd-agent-launch.md](./decisions/yiai/brd-agent-launch.md) — BRD agent launch decision
- [pytest-introduction.md](./decisions/yiai/pytest-introduction.md) — Pytest test framework adoption
- [knowledge-watcher-deployment.md](./decisions/yiai/knowledge-watcher-deployment.md) — Knowledge watcher deployment

**YiVad (3 ADRs):**
- [vitest-introduction.md](./decisions/yivad/vitest-introduction.md) — Vitest test framework adoption
- [vitest-rollout.md](./decisions/yivad/vitest-rollout.md) — Vitest phased rollout plan
- [aicr-phase-port.md](./decisions/yivad/aicr-phase-port.md) — AiCR port phases

**YiPet (3 ADRs):**
- [biome-lint-format.md](./decisions/yipet/biome-lint-format.md) — ESLint → Biome 2.5 migration
- [chrome-manifest-dual-world-boundary.md](./decisions/yipet/chrome-manifest-dual-world-boundary.md) — MV3 dual-world boundary design
- [aicr-port-rollout.md](./decisions/yipet/aicr-port-rollout.md) — AiCR port rollout

**FDE (4 ADRs):**
- [delta-as-a-contract.md](./decisions/fde/delta-as-a-contract.md) — The Delta as a contract, not a feature
- [air-gap-first-for-regulated-clients.md](./decisions/fde/air-gap-first-for-regulated-clients.md) — Compliance-driven default to air-gap-first
- [two-loop-eval-as-production-gate.md](./decisions/fde/two-loop-eval-as-production-gate.md) — Double-loop eval as production release gate
- [enterprise-rag-hybrid-search-mandatory.md](./decisions/fde/enterprise-rag-hybrid-search-mandatory.md) — Enterprise RAG mandates hybrid search

**Cross-project:**
- [stack-migration-sequencing.md](./decisions/stack-migration-sequencing.md) — Multi-project stack migration sequencing

### capacity/
Capacity planning, cost tracking, FinOps reviews, and dependency audits. Covers: per-project cost breakdowns, trend analysis, quarterly predictions, cost overrun handling, FinOps review process, npm dependency audits.

Key files:
- [tl-capacity-cost-2026-08-trend.md](./capacity/tl-capacity-cost-2026-08-trend.md) — Capacity cost trend analysis
- [tl-capacity-cost-2026-q4-prediction.md](./capacity/tl-capacity-cost-2026-q4-prediction.md) — Q4 2026 cost prediction
- [tl-capacity-cost-yiai-yivad-yipet-2026-06.md](./capacity/tl-capacity-cost-yiai-yivad-yipet-2026-06.md) — Per-project cost breakdown
- [tl-dependency-audit-yipet-npm-2026-08.md](./capacity/tl-dependency-audit-yipet-npm-2026-08.md) — YiPet npm dependency audit
- [run-a-finops-review.md](./capacity/run-a-finops-review.md) — FinOps review methodology
- [handle-a-cost-overrun.md](./capacity/handle-a-cost-overrun.md) — Cost overrun response procedure

### risk/
Risk register, postmortem methodology, outage communication, and dependency risk management. Covers: risk identification and tracking, postmortem writing, outage stakeholder communication, dependency risk assessment.

Key files:
- [tl-risk-register-single-provider-llm-lock-in.md](./risk/tl-risk-register-single-provider-llm-lock-in.md) — Single-provider LLM lock-in risk
- [manage-dependency-risk.md](./risk/manage-dependency-risk.md) — Dependency risk identification, assessment, and mitigation
- [write-a-postmortem.md](./risk/write-a-postmortem.md) — Postmortem writing methodology
- [handle-an-outage-communication.md](./risk/handle-an-outage-communication.md) — Outage communication procedure

### roadmap/
Roadmap planning, tech debt management, technology selection, PoC spikes, SLO definition, feature deprecation, and service decommissioning.

Key files:
- [plan-tech-roadmap.md](./roadmap/plan-tech-roadmap.md) — Tech roadmap planning process
- [tl-roadmap-review-2026-q4-preview.md](./roadmap/tl-roadmap-review-2026-q4-preview.md) — Q4 2026 roadmap preview
- [tl-org-diagnose-yipet-collab-2026-08.md](./roadmap/tl-org-diagnose-yipet-collab-2026-08.md) — YiPet collaboration org diagnosis
- [do-a-tech-selection.md](./roadmap/do-a-tech-selection.md) — Technology selection process
- [do-a-capacity-plan.md](./roadmap/do-a-capacity-plan.md) — Capacity planning methodology
- [do-a-proof-of-concept.md](./roadmap/do-a-proof-of-concept.md) — PoC spike methodology
- [manage-tech-debt.md](./roadmap/manage-tech-debt.md) — Tech debt management framework
- [define-an-slo.md](./roadmap/define-an-slo.md) — SLO definition guide
- [deprecate-a-feature.md](./roadmap/deprecate-a-feature.md) — Feature deprecation procedure
- [decommission-a-service.md](./roadmap/decommission-a-service.md) — Service decommissioning procedure

## Core viewpoints

- **ADR is the decision SSOT** — writing an ADR is not documentation burden, it is a gift to "future reviewers who won't re-derive"; each ADR contains Context / Decision / Consequences
- **Capacity planning links with FinOps** — leader decides not only tech but also cost ceilings; links with [srer/observability/](../srer/observability/) for monitoring
- **Roadmap is a promise** — quarterly roadmap is the leader's promise to PM/executiver; no silent changes
- **Risk registry upfront** — postmortem is after the fact; pre-incident risk assessment goes to `risk/`, post-incident retrospective goes to [srer/incident-response/](../srer/incident-response/)

## Frequently referenced

- [design-architecture-decision.md](./architecture/design-architecture-decision.md) — ADR framework and 12-section template
- [write-a-postmortem.md](./risk/write-a-postmortem.md) — Postmortem writing methodology
- [do-a-tech-selection.md](./roadmap/do-a-tech-selection.md) — Technology selection process
- [do-a-capacity-plan.md](./roadmap/do-a-capacity-plan.md) — Capacity planning methodology
- [run-a-finops-review.md](./capacity/run-a-finops-review.md) — FinOps review methodology
- [manage-tech-debt.md](./roadmap/manage-tech-debt.md) — Tech debt management framework
- [manage-dependency-risk.md](./risk/manage-dependency-risk.md) — Dependency risk management
- [handle-a-cost-overrun.md](./capacity/handle-a-cost-overrun.md) — Cost overrun response
- [handle-an-outage-communication.md](./risk/handle-an-outage-communication.md) — Outage communication
- [../curator/templates/adr.md](../curator/templates/adr.md) — ADR template (starting point for new ADRs)

## Action recommendations

1. **New decisions go through ADR**: copy [../curator/templates/adr.md](../curator/templates/adr.md) as a starting point; land at `decisions/<project>/<decision-name>.md`
2. **Roadmap synced quarterly**: any roadmap change must go through `roadmap/` update + notify PM/executiver
3. **Risk registered upfront**: identify new risks via [risk/](./risk/) registry; post-incident via [write-a-postmortem.md](./risk/write-a-postmortem.md)
4. **Capacity assessment links with FinOps**: new services must run [capacity/](./capacity/) assessment before launch + set cost ceiling
5. **Cross-sub-project decision alignment**: YiAi/YiVad/YiPet sub-project `engineering/claude.md` must reference this directory's decisions, not duplicate content

## Anti-patterns

- **Silently changing the roadmap** — consequence: PM/executiver lose trust; roadmap is a promise, changes must be synced
- **ADR written but not maintained** — consequence: decision context lost; future reviewers re-derive deprecated solutions
- **Postmortem not registered as risk** — consequence: same-class failures repeat; post-incident must run [risk/](./risk/) registry + improvements
- **Capacity assessment omitted** — consequence: cost overruns after launch; must run [capacity/](./capacity/) assessment + set ceiling

## Related

- Same kind (role directories): [../engineer/README.md](../engineer/README.md) / [../srer/README.md](../srer/README.md) / [../producter/README.md](../producter/README.md) / [../aier/README.md](../aier/README.md)
- Upstream: [../README.md](../README.md) / [../INDEX.md](../INDEX.md)
- Role index: [./INDEX.md](./INDEX.md) — full file listing with counts
- Sub-readmes: [architecture/README.md](./architecture/README.md) / [decisions/README.md](./decisions/README.md) / [capacity/README.md](./capacity/README.md) / [risk/README.md](./risk/README.md) / [roadmap/README.md](./roadmap/README.md)
- Downstream: [../curator/templates/adr.md](../curator/templates/adr.md) — ADR template
- Downstream: [../aier/README.md](../aier/README.md) — AI engineering perspective

## Pipeline flow

```
producter/ (Stage 1: Requirements)
    │ prds, user-stories, priorities
    ▼
┌── leader/ (Stage 2: Decisions) ─────────┐
│  Input:  PRDs, requirements               │
│  Output: ADRs, tech selections, capacity  │
└──────────────────────────────────────────┘
    │ adrs, tech-selections, capacity-plans
    ▼
engineer/ (Stage 3: Design+Build)
    │ architecture-patterns, dev-practices
    ▼
srer/ (Stage 4+5: Quality+Release + Operate+Learn)
```

### Key cross-stage links
- [design-architecture-decision.md](./architecture/design-architecture-decision.md) ← producter/ PRD → [../engineer/build/](../engineer/build/)
- [do-a-tech-selection.md](./roadmap/do-a-tech-selection.md) ← producter/ JTBD → [../engineer/build/](../engineer/build/)
- [run-a-finops-review.md](./capacity/run-a-finops-review.md) ← producter/ prioritization → [../srer/observability/](../srer/observability/)
- [define-an-slo.md](./roadmap/define-an-slo.md) ← producter/ metrics → [../srer/observability/](../srer/observability/)
- [write-a-postmortem.md](./risk/write-a-postmortem.md) ← [../srer/incident-response/](../srer/incident-response/) → [../engineer/learn/lessons/](../engineer/learn/lessons/)