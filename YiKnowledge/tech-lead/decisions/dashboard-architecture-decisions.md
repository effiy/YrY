---
title: architecture decision dashboard
aliases:
- ADR dashboard
- decision log dashboard
- tech radar dashboard
- architecture governance dashboard
tags:
- dashboard
- adr
- architecture-decision
- tech-radar
- decision-quality
- governance
category: tech-lead/decisions
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- tech-lead
- engineer
- architect
benefit: architecture decision velocity and quality visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ../architecture/architecture-review.md
- ../../engineer/architecture-design/dashboard-architecture-health.md
- ../risk/dashboard-risk-management.md
- ./yiai/
- ./yivad/
- ./yipet/
tacit: false
---

# architecture decision dashboard

> **As a** tech lead, **I want to** track architecture decision velocity and quality, **so that** decision debt is visible and the technology portfolio is actively managed.

> Architecture decisions are the building blocks of your system. This dashboard tracks ADR statistics, decision quality, technology radar, compliance with past decisions, and decision velocity.

## Summary

- 5 ADR dimensions: decision statistics, decision quality, technology radar, compliance tracking, decision velocity
- ADRs tracked per project, per status (proposed → accepted → superseded → deprecated), per decision type
- Technology radar maps technologies across adopt → trial → assess → hold
- Decision compliance measured against actual code; superseded decisions tracked for migration progress
- Dashboard reviewed quarterly; tech radar updated biannually

## Core viewpoints

- ADRs are not documentation — they are a decision log that captures context, options, and rationale
- Every ADR has a shelf life — technology decisions that were right 2 years ago may be wrong today
- Decision debt is real — unmade decisions accumulate and slow down every subsequent decision
- The tech radar is a forward-looking tool — it signals intent, not just current state

## Key information

### 5-panel ADR overview

```
┌──────────────────────────────────────────────────────────────────┐
│  DECISION STATISTICS             │  DECISION QUALITY               │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Total:     48 ADRs     │   │  │  Context:    92% ✓      │   │
│  │  Accepted:  38 (79%)    │   │  │  Options:    88% ✓      │   │
│  │  Proposed:   3 (6%)     │   │  │  Rationale:  95% ✓      │   │
│  │  Superseded: 5 (10%)    │   │  │  Consequences: 82% ✓     │   │
│  │  Deprecated: 2 (4%)     │   │  │  Migration:   65% ✓      │   │
│  │  This Q:     4 new      │   │  │  Quality:    84% (B)    │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TECHNOLOGY RADAR               │  COMPLIANCE & MIGRATION         │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Adopt:     12 tech     │   │  │  Compliant: 85% ████    │   │
│  │  Trial:      5 tech     │   │  │  At risk:     8% ▍      │   │
│  │  Assess:     4 tech     │   │  │  Violated:    4% ▏      │   │
│  │  Hold:       3 tech     │   │  │  Superseded:  3 pending │   │
│  │  New:        2 this Q   │   │  │  Migration:   2 active  │   │
│  │  Moved:      3 this Q   │   │  │  Deprecated:  2 to clean│   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### ADR statistics by project

| Project | Total | Accepted | Proposed | Superseded | Deprecated | This Q | Last ADR |
|---|---|---|---|---|---|---|---|
| YiVad (Web) | 18 | 14 | 1 | 2 | 1 | 1 | Jul 28 |
| YiAi (API) | 14 | 12 | 1 | 1 | 0 | 2 | Aug 2 |
| YiPet (Extension) | 10 | 8 | 0 | 1 | 1 | 1 | Jul 15 |
| Shared/Platform | 6 | 4 | 1 | 1 | 0 | 0 | Jun 20 |
| **Total** | **48** | **38** | **3** | **5** | **2** | **4** | |

### ADR by decision type

| Type | Count | Example |
|---|---|---|
| Technology selection | 18 | ADR-001: React vs Vue, ADR-022: Biome vs ESLint |
| Architecture pattern | 10 | ADR-003: Event-driven, ADR-005: DB per service |
| API design | 6 | ADR-001: RESTful, ADR-022: API versioning |
| Testing strategy | 5 | ADR-015: Contract testing, ADR-008: Pytest vs Vitest |
| Infrastructure | 4 | ADR-012: Docker Compose, ADR-020: Rsbuild vs Vite |
| Security | 3 | ADR-008: OAuth 2.0, ADR-018: Circuit breaker |
| Process | 2 | ADR-010: Code review, ADR-016: Branching strategy |

### Decision quality assessment

| Quality dimension | % Compliant | Target | Description |
|---|---|---|---|
| Context (why now?) | 92% | > 90% | Decision context, problem statement, constraints |
| Options considered | 88% | > 85% | Alternatives evaluated, trade-offs analyzed |
| Rationale (why this?) | 95% | > 90% | Clear reasoning for the chosen option |
| Consequences | 82% | > 85% | Positive and negative consequences documented |
| Migration plan | 65% | > 80% | Migration path for superseded decisions |
| Stakeholders | 90% | > 90% | Decision authors and reviewers identified |
| **Overall quality** | **84% (B)** | **> 85% (A)** | |

### Technology radar

```
                        ADOPT (12)
        ┌──────────────────────────────────────────┐
        │  TypeScript    React 18     Rsbuild       │
        │  Vitest        Biome         Pytest       │
        │  PostgreSQL    Redis         FastAPI      │
        │  Claude API    Playwright    Docker       │
        └──────────────────────────────────────────┘

                    TRIAL (5)
        ┌──────────────────────────────────────────┐
        │  Temporal      OpenTelemetry  Bun         │
        │  LangGraph     Mistral API                │
        └──────────────────────────────────────────┘

                    ASSESS (4)
        ┌──────────────────────────────────────────┐
        │  Rust (for perf)  GraphQL    gRPC         │
        │  Qdrant (vector DB)                       │
        └──────────────────────────────────────────┘

                    HOLD (3)
        ┌──────────────────────────────────────────┐
        │  Webpack       ESLint       Vite          │
        │  (migrating away)                          │
        └──────────────────────────────────────────┘
```

| Ring | Definition | Count | Review cycle |
|---|---|---|---|
| **Adopt** | Use by default for new projects | 12 | Quarterly |
| **Trial** | Use in low-risk projects, gather data | 5 | Monthly |
| **Assess** | Explore, prototype, evaluate | 4 | Monthly |
| **Hold** | Avoid for new projects; migrate away | 3 | Quarterly |

### Recent radar changes

| Technology | From | To | Date | Rationale |
|---|---|---|---|---|
| Rsbuild | Trial | Adopt | Aug 2026 | YiVad migration successful, build time -26% |
| OpenTelemetry | Assess | Trial | Jul 2026 | Prototype successful, trial in YiAi |
| Temporal | Assess | Trial | Jul 2026 | Evaluating for multi-step workflows |
| Bun | Assess | Trial | Jun 2026 | Testing as Node.js alternative |
| Qdrant | — | Assess | Aug 2026 | Evaluating vector DB alternatives |
| LangGraph | — | Trial | Jul 2026 | Agent orchestration prototype |
| Webpack | Hold | Hold | May 2026 | Migration to Rsbuild in progress |
| Vite | Adopt | Hold | Jun 2026 | Replaced by Rsbuild |

### Superseded decisions — migration status

| ADR | Decision | Superseded by | Date | Migration status | Services remaining |
|---|---|---|---|---|---|
| ADR-002 | Vite as build tool | ADR-020 (Rsbuild) | 2026-06 | 60% complete | YiWeb pending |
| ADR-004 | ESLint for linting | ADR-022 (Biome) | 2026-05 | 85% complete | YiPet pending |
| ADR-007 | REST only | ADR-024 (REST + SSE) | 2026-03 | 100% complete | All migrated |
| ADR-011 | Webpack for YiPet | ADR-020 (Rsbuild) | 2026-06 | 40% complete | YiPet in progress |
| ADR-014 | GPT-4 only | ADR-023 (Multi-model) | 2026-04 | 100% complete | All migrated |

### Decision velocity

| Quarter | ADRs created | ADRs superseded | ADRs deprecated | Decisions/month | Trend |
|---|---|---|---|---|---|
| 2025-Q4 | 8 | 1 | 0 | 2.7 | — |
| 2026-Q1 | 10 | 2 | 1 | 3.3 | ↑ |
| 2026-Q2 | 7 | 1 | 1 | 2.3 | ↓ |
| 2026-Q3 (to date) | 4 | 1 | 0 | 2.7 | → |
| **Avg** | **7.3/Q** | **1.3/Q** | **0.5/Q** | **2.4/mo** | |

### Decision debt — pending decisions

| Topic | Urgency | Blocking | Options | Needed by | Owner |
|---|---|---|---|---|---|
| Event streaming platform | High | Developer Ecosystem | Kafka vs RabbitMQ vs Temporal | Sep 15 | Platform Lead |
| Vector database | Medium | RAG v2 | Pinecone vs Qdrant vs pgvector | Oct 1 | AI Lead |
| Mobile framework (cross-platform) | Medium | Mobile v2 | React Native vs Flutter | Nov 1 | PM Mobile |
| API Gateway v2 | Low | Scale | Kong vs Envoy vs custom | Dec 15 | Platform Lead |

### ADR review cadence compliance

| ADR age | Count | Reviewed on time | Overdue | Action |
|---|---|---|---|---|
| < 6 months | 18 | 17 (94%) | 1 | Review within 30 days |
| 6-12 months | 12 | 10 (83%) | 2 | Schedule review |
| 12-24 months | 10 | 8 (80%) | 2 | Reassess relevance |
| > 24 months | 8 | 5 (63%) | 3 | Prioritize review for staleness |

## Action recommendations

1. **Improve migration plan quality**: 65% — lowest quality dimension; every ADR must include a migration path for superseded decisions
2. **Resolve event streaming decision**: blocking Developer Ecosystem; decide by Sep 15; Kafka vs Temporal recommendation
3. **Complete YiPet migration**: 2 ADRs pending (Webpack → Rsbuild, ESLint → Biome); target Q3 completion
4. **Review 7 overdue ADRs**: ADRs past their review date; schedule review sessions within 30 days
5. **Deprecate 2 hold technologies**: Webpack and ESLint still in use; complete migration, then deprecate
6. **Quarterly tech radar review**: next review Sep 2026; evaluate Trial technologies for promotion to Adopt
7. **ADR quality review**: sample 5 ADRs quarterly for quality assessment; target > 85% overall quality
8. **Decision debt tracking**: 4 pending decisions; add to roadmap sync; escalate if past deadline



- ADR as afterthought → writing the ADR after the decision is implemented; ADR captures the decision process, not the result
- Zombie ADRs → accepted ADRs that no one follows; compliance tracking is essential
- Tech radar as wishlist → putting every trendy technology in Assess; radar should reflect genuine evaluation intent
- Decision monopoly → one person making all architecture decisions; ADRs require at least 2 reviewers
- Never superseding → treating all decisions as permanent; technology evolves, decisions should too

## Related

- Same class: [dashboard-architecture-health](../../engineer/architecture-design/dashboard-architecture-health.md) — architecture health
- Same class: [dashboard-risk-management](../risk/dashboard-risk-management.md) — risk management
- Upstream: [architecture-review](../architecture/architecture-review.md) — architecture review process
- Downstream: ADR repositories in [./yiai/](./yiai/), [./yivad/](./yivad/), [./yipet/](./yipet/)
- References: Michael Nygard — *Architecture Decision Records*; ThoughtWorks — *Technology Radar*; Neal Ford — *Building Evolutionary Architectures*