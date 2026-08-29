---
title: YiKnowledge personal knowledge base overview
tags:
- knowledge-base
- index
- navigation
- role-tree
- pipeline
category: root
created: '2026-01-01'
updated: '2026-08-12'
last_verified: '2026-08-12'
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- curator
benefit: New readers see the full software delivery pipeline at a glance and locate
  content by stage × role
acceptance_criteria:
- core ideas are clearly stated and distinguishable from source material
- actionable recommendations are given, not just information
- anti-patterns or when-not-to-use are identified
related:
- ./INDEX.md
- ./curator/governance/user-story-migration-plan.md
- ./curator/diagrams/directory-blueprint.md
---

# YiKnowledge — The Requirements-to-Production Knowledge Pipeline

YiKnowledge is a personal knowledge base organized around the **software delivery pipeline**. Seven role directories span the full journey from requirements to production — each role owns a stage, each stage crystallizes a class of knowledge.

> Not just "organized by role" — organized by the **causal chain of software delivery**. From `executiver`'s *why build it*, to `producter`'s *what to build*, to `leader`'s *which way to build*, to `engineer`'s *how to build*, to `srer`'s *how to run it*. Knowledge lives in exactly one place per stage; cross-role discovery happens via frontmatter `roles:` and domain indexes, never by duplicating content.

## Pipeline overview

```
Business Strategy Layer (spans the entire pipeline)
─────────────────────────────────────────────────────────────────────────────
  executiver/strategy/   executiver/industry/   executiver/roadmap/
  "Why this business"    "What's happening in   "What are the org goals"
                          the market"

Software Delivery Pipeline — 5 stages, input → output chip flow
─────────────────────────────────────────────────────────────────────────────
  Requirements     Decisions        Design+Build      Quality+Release    Operate+Learn
  ────────────     ─────────        ────────────      ───────────────    ─────────────
  producter/       leader/           engineer/         srer/              srer/
  │                │                 │                 │                  │
  INPUT:           INPUT:            INPUT:            INPUT:             INPUT:
  Business         PRDs              ADRs              Working            Running
  strategy         Requirements      PRDs              software           services
  │                │                 │                 │                  │
  OUTPUT:          OUTPUT:           OUTPUT:           OUTPUT:            OUTPUT:
  PRDs             ADRs              Architecture      Release            SLO compliance
  user stories     tech selections   patterns          procedures         Postmortems
  priorities       capacity plans    Dev practices     Incident           Lessons learned
                   │                 Quality &         response
                   │                 security          Observability
                   │                 Data & reliability
                   │                 Lessons learned
                   │                 │                 │                  │
  "What"           "Which way"       "How"             "How to ship"      "How to run
                                                                           & learn"

AI Enablement Layer (spans the entire pipeline)
─────────────────────────────────────────────────────────────────────────────
  aier/foundations/   aier/methodology/   aier/platform/   aier/ml/
  "How AI accelerates every stage"

Knowledge Governance Layer (meta-layer)
─────────────────────────────────────────────────────────────────────────────
  curator/governance/   curator/diagrams/   curator/archive/   curator/templates/
  "How the KB itself is maintained and evolved"
```

## Pipeline stages

### Stage 1: Requirements — Define what to build

**Owner: [producter/](./producter/README.md)** | Pipeline stage 1/5

**Input chips** (from upstream):
- **Business strategy** — Market intelligence, competitive landscape, org-level goals from [executiver/](./executiver/README.md)

**Output chips** (deliverables):
- **PRDs** — Product Requirement Documents: what to build, for whom, and how to measure success
- **user stories** — User stories and JTBD narratives: the user's perspective on feature value
- **priorities** — Prioritization frameworks (RICE/ICE) and north-star metric definitions

Before writing any code, clarify what problem to solve, for whom, and how to measure success.

| When you need to... | Chip | Go here |
|---|---|---|
| Write a PRD | `prds` | [producter/discovery/prd/](./producter/discovery/prd/) |
| Define user stories / JTBD | `user-stories` | [producter/frameworks/jobs-to-be-done.md](./producter/frameworks/jobs-to-be-done.md) |
| Prioritize features (RICE/ICE) | `priorities` | [producter/frameworks/rice-ice-prioritization.md](./producter/frameworks/rice-ice-prioritization.md) |
| Define a north-star metric | `priorities` | [producter/discovery/metrics/north-star-metric.md](./producter/discovery/metrics/north-star-metric.md) |
| Do user research | `user-stories` | [producter/frameworks/do-user-research.md](./producter/frameworks/do-user-research.md) |
| Run a sprint | `priorities` | [producter/delivery/run-a-sprint.md](./producter/delivery/run-a-sprint.md) |

**Upstream input**: [executiver/strategy/](./executiver/strategy/) defines business strategy and competitive positioning; [executiver/industry/](./executiver/industry/) provides market intelligence. These are *context* for requirements, not requirements themselves.

**Boundary rule**: producter defines *what feature to build*, not *how to implement it* (→ engineer/) or *which technology to use* (→ leader/).

### Stage 2: Decisions — Choose the technical direction

**Owner: [leader/](./leader/README.md)** | Pipeline stage 2/5

**Input chips** (from upstream):
- **PRDs** — Product Requirement Documents from [producter/](./producter/README.md) — the feature definitions to make decisions about
- **requirements** — Functional and non-functional requirements that constrain technical decisions

**Output chips** (deliverables):
- **ADRs** — Architecture Decision Records: Context/Decision/Consequences for every significant technical choice
- **tech selections** — Technology stack evaluations, comparison matrices, and selection rationale
- **capacity plans** — Capacity planning, FinOps reviews, and infrastructure sizing decisions

Once requirements are clear, the leader makes technical decisions — which architecture, which stack, how much capacity, where the risks are.

| When you need to... | Chip | Go here |
|---|---|---|
| Write an architecture decision (ADR) | `adrs` | [leader/architecture/design-architecture-decision.md](./leader/architecture/design-architecture-decision.md) |
| Evaluate a technology choice | `tech-selections` | [leader/roadmap/do-a-tech-selection.md](./leader/roadmap/do-a-tech-selection.md) |
| Plan capacity / FinOps | `capacity-plans` | [leader/capacity/run-a-finops-review.md](./leader/capacity/run-a-finops-review.md) |
| Manage tech debt | `tech-selections` | [leader/roadmap/manage-tech-debt.md](./leader/roadmap/manage-tech-debt.md) |
| Assess launch risks | `adrs` | [leader/risk/](./leader/risk/) |
| Browse existing ADRs | `adrs` | [leader/decisions/](./leader/decisions/) — organized by project subdirectory |

**Boundary rule**: leader makes *decisions with tradeoffs*, not *implementation patterns* (→ engineer/build/) or *operational procedures* (→ srer/). The key distinction: **decision = why we chose A over B** (leader/), **pattern = how to implement A** (engineer/).

### Stage 3: Design + Build — Turn decisions into code

**Owner: [engineer/](./engineer/README.md)** | Pipeline stage 3/5

**Input chips** (from upstream):
- **ADRs** — Architecture Decision Records from [leader/](./leader/README.md) — the technical direction to implement
- **PRDs** — Product Requirement Documents from [producter/](./producter/README.md) — the feature specifications to build

**Output chips** (deliverables):
- **Architecture patterns** — Implementation-level patterns: CQRS, Saga, Event-Driven, API Gateway, BFF
- **Dev practices** — Development practices, tooling, DX improvements, and dependency management
- **Quality & security** — Code quality standards, security hardening, testing strategies, and supply-chain audits
- **Data & reliability** — Data patterns (migrations, caching, pipelines) and reliability patterns (retry, backpressure, idempotency)
- **Lessons learned** — Wins, failures, gotchas, and bugs: field notes from real implementation experience

The longest stage in the pipeline, spanning BUILD → SHIP. Eight subdirectories organized by problem domain:

```
BUILD                           SHIP
├─ architecture/ (39 files)      ├─ quality-security/ (27 files)
│  System design, API design,     │  Testing, security hardening,
│  event-driven, design           │  supply chain, code review,
│  patterns, BFF, CQRS, Saga      │  chaos engineering, threat
│                                 │  modeling, zero trust
├─ development/ (28 files)       │
│  Dev tools, DX, dependency      ├─ data/ (13 files)
│  management, project            │  Databases, migrations, caching,
│  scaffolding, editor config     │  data pipelines, Outbox,
│                                 │  read replicas, connection pools
│                                 │
                                  └─ reliability/ (13 files)
                                     Resilience, observability,
                                     rate limiting, scaling,
                                     retry/backoff, timeouts, idempotency
```

| When you need to... | Chip | Go here |
|---|---|---|
| Design an API | `architecture-patterns` | [engineer/build/implement-an-api.md](./engineer/build/implement-an-api.md) |
| Design a data model | `data-reliability` | [engineer/ship/](./engineer/ship/) |
| Harden the supply chain | `quality-security` | [engineer/ship/harden-supply-chain.md](./engineer/ship/harden-supply-chain.md) |
| Set up testing infrastructure | `dev-practices` | [engineer/build/set-up-testing-infrastructure.md](./engineer/build/set-up-testing-infrastructure.md) |
| Do a code review | `quality-security` | [engineer/ship/](./engineer/ship/) |
| Review past lessons | `lessons` | [engineer/learn/lessons/](./engineer/learn/lessons/) |
| Share a client across projects | `dev-practices` | [engineer/build/share-client-across-projects.md](./engineer/build/share-client-across-projects.md) |

**Boundary rule**: engineer is the *implementation layer* — it does not substitute for leader's decisions. If an architecture-level issue surfaces during implementation → go back to leader/ and write an ADR; don't "decide on the side" inside engineer/.

### Stage 4: Quality + Release — Ship safely

**Owner: [srer/release/](./srer/release/) + [engineer/ship/](./engineer/ship/)** | Pipeline stage 4/5

**Input chips** (from upstream):
- **Working software** — Implementation artifacts from [engineer/](./engineer/README.md) — code that has passed design and build quality gates

**Output chips** (deliverables):
- **Release procedures** — Release, rollback, canary, and hotfix procedures: how code reaches production safely
- **Incident response** — Incident response procedures, on-call handover, and blameless postmortem templates
- **Observability** — Monitoring, alerting, dashboards, SLO/SLI definitions, and observability triad

Code is written, but shipping is not the finish line. This stage ensures code passes quality gates, security audits, release procedures, and rollback rehearsals.

| When you need to... | Chip | Go here |
|---|---|---|
| Ship a release | `release-procedures` | [srer/release/release.md](./srer/release/release.md) |
| Execute a rollback | `release-procedures` | [srer/release/rollback-drill.md](./srer/release/rollback-drill.md) |
| Run a canary release | `release-procedures` | [srer/release/canary-release.md](./srer/release/canary-release.md) |
| Respond to an incident | `incident-response` | [srer/incident-response/respond-to-an-incident.md](./srer/incident-response/respond-to-an-incident.md) |
| Set up observability | `observability` | [srer/observability/set-up-observability.md](./srer/observability/set-up-observability.md) |
| Do a security audit | `quality-security` | [engineer/ship/](./engineer/ship/) |
| Run performance/load tests | `quality-security` | [engineer/ship/](./engineer/ship/) |

**Boundary rule**: srer/release/ owns *release process and coordination*; engineer/ship/ owns *the technical patterns used for release* (canary implementation, feature flags). Process vs. implementation.

### Stage 5: Operate + Learn — Keep running and learn from experience

**Owner: [srer/](./srer/README.md) + [engineer/learn/lessons/](./engineer/learn/lessons/)** | Pipeline stage 5/5

**Input chips** (from upstream):
- **Running services** — Services running in production: the live system that observability monitors and incidents affect

**Output chips** (deliverables):
- **SLO compliance** — SLO compliance tracking, error budget management, and availability reporting
- **Postmortems** — Blameless postmortems with root cause analysis, action items, and timeline reconstruction
- **Lessons learned** — Operational lessons: wins to replicate, failures to learn from, and gotchas to avoid

After launch, srer handles observability and incident response; engineer captures lessons from both successes and failures.

```
RUN                             LEARN
├─ srer/observability/ (13)     ├─ engineer/learn/lessons/ (52)
│  Monitoring, alerting,         │  wins/ (success patterns)
│  dashboards, SLOs,             │  failures/ (failure postmortems)
│  observability triad           │  gotchas/ (pitfalls)
│                                │  bugs/ (defect analyses)
├─ srer/incident-response/ (17)  │
│  Incident response procedures, ├─ engineer/run/ (66)
│  on-call handover, blameless   │  Team collaboration, knowledge
│  postmortems, after-action     │  sharing, retrospectives,
│                                │  onboarding, iteration PM handbook
├─ srer/release/ (6)
│  Release, rollback, hotfix
```

| When you need to... | Chip | Go here |
|---|---|---|
| Respond to a production incident | `incident-response` | [srer/incident-response/respond-to-an-incident.md](./srer/incident-response/respond-to-an-incident.md) |
| Set up observability | `observability` | [srer/observability/set-up-observability.md](./srer/observability/set-up-observability.md) |
| Write a postmortem | `postmortems` | [leader/risk/write-a-postmortem.md](./leader/risk/write-a-postmortem.md) |
| Track SLO/SLI compliance | `slo-compliance` | [srer/observability/](./srer/observability/) |
| Check known gotchas | `lessons-learned` | [engineer/run/check-engineering-gotchas.md](./engineer/run/check-engineering-gotchas.md) |
| Review past lessons | `lessons-learned` | [engineer/learn/lessons/](./engineer/learn/lessons/) |
| Onboard a new team member | `lessons-learned` | [engineer/run/onboarding/](./engineer/run/onboarding/) |

**Boundary rule**: *before* an incident → leader/risk/ (risk assessment); *during* an incident → srer/incident-response/ (response procedures); *after* an incident → leader/risk/ (postmortem methodology), srer/incident-response/ (specific postmortem records).

## Three layers spanning the entire pipeline

### Business Strategy Layer — Why we build

**Owner: [executiver/](./executiver/README.md)** — provides business context for every pipeline stage.

| Subdirectory | Answers | Consumed by |
|---|---|---|
| [strategy/](./executiver/strategy/) | Corporate strategy, org design, SWOT | producter (requirements) |
| [industry/](./executiver/industry/) | Market trends, competitor analysis, reports | producter, leader (product/tech decisions) |
| [roadmap/](./executiver/roadmap/) | Org-level goals and milestones | leader (tech roadmap alignment) |
| [reading-list/](./executiver/reading-list/) | Executive learning resources | All roles |

### AI Enablement Layer — How AI accelerates every stage

**Owner: [aier/](./aier/README.md)** — AI is not a separate pipeline stage; it permeates every stage as an accelerator.

| Subdirectory | Answers | Embedding stage |
|---|---|---|
| [foundations/](./aier/foundations/) | AI fundamentals and theory | Design (understanding AI capability boundaries) |
| [methodology/](./aier/methodology/) | RAG patterns, LLM evaluation, Agent architecture | Build (AI feature implementation) |
| [platform/](./aier/platform/) | Vector DB selection, embedding model selection | Design + Build (AI infrastructure) |
| [ml/](./aier/ml/) | Traditional ML patterns | Build (non-LLM ML needs) |

**Boundary rule**: general-purpose databases, caching, pipelines → engineer/ship/.

### Knowledge Governance Layer — Who maintains the KB

**Owner: [curator/](./curator/README.md)** — meta-layer. Produces no domain knowledge; maintains the KB's structure and health.

| Subdirectory | Responsibility |
|---|---|
| [governance/](./curator/governance/) | Knowledge lifecycle, classification standards, readiness checklist |
| [diagrams/](./curator/diagrams/) | Knowledge map, user journey, directory blueprint |
| [archive/](./curator/archive/) | Index of deprecated content |
| [templates/](./curator/templates/) | Templates for knowledge leaves, ADRs, BRDs, etc. |

## Role responsibility chain

Roles in the pipeline are not peers — they have a clear upstream/downstream relationship:

```
executiver ──→ producter ──→ leader ──→ engineer ──→ srer
  (why)         (what)       (which)     (how)       (run)

  Business       Product      Tech        Impl        Ops
  strategy       requirements decisions   patterns    procedures
```

- Each role produces only the knowledge its *downstream role* needs
- An upstream change should trigger a review of the corresponding downstream content
- Don't "casually" make a leader-level decision inside engineer/, or settle a tech stack inside producter/

## Role boundary quick reference

When content could belong to multiple roles, use this decision tree (mirrors the Pipeline page's decision tree):

```
Is this content about...
├─ Business strategy, market, competitors? ──→ executiver/
├─ Product requirements, user stories, priorities? ──→ producter/
├─ Technical decisions, architecture choices, ADRs? ──→ leader/
├─ Implementation patterns, dev tools, code? ──→ engineer/
├─ Release procedures, monitoring, incident response? ──→ srer/
├─ AI/ML-specific theory and practice? ──→ aier/
└─ The KB's own structure and rules? ──→ curator/
```

**High-frequency boundary conflicts**:

| Conflict | Owner | Reason |
|---|---|---|
| Architecture decision vs. architecture pattern | leader/ | Decision = why A over B, with tradeoffs and consequences |
| Security hardening vs. security strategy | engineer/ | Hardening = how to implement (code level); strategy = risk assessment (leader/risk/) |
| Incident response vs. risk prevention | srer/ → during, leader/ → before | Timeline distinction: before / during / after |
| Product roadmap vs. technical roadmap | producter/ → features, leader/ → tech | What features vs. what technology |
| Data engineering vs. AI data | engineer/ → general, aier/ → AI-specific | Databases, caching vs. datasets, embeddings |

## Chip-level cross-reference (pipeline__stage-flow-chip)

Each pipeline stage has **input chips** (consumed from upstream) and **output chips** (produced for downstream). The chips form the contract between stages:

| Stage | Input chips | Output chips | Role |
|---|---|---|---|
| 1. Requirements | Business strategy | PRDs, user stories, priorities | [producter/](./producter/README.md) |
| 2. Decisions | PRDs, requirements | ADRs, tech selections, capacity plans | [leader/](./leader/README.md) |
| 3. Design + Build | ADRs, PRDs | Architecture patterns, Dev practices, Quality & security, Data & reliability, Lessons learned | [engineer/](./engineer/README.md) |
| 4. Quality + Release | Working software | Release procedures, Incident response, Observability | [srer/](./srer/README.md) |
| 5. Operate + Learn | Running services | SLO compliance, Postmortems, Lessons learned | [srer/](./srer/README.md) + [engineer/learn/lessons/](./engineer/learn/lessons/) |

> Each chip maps to keyword-based file filtering in the Pipeline UI (`/pipeline/:stageId/:itemId`). Clicking a chip filters the stage's knowledge files by the chip's keywords.

## Design principles

1. **Role-first, boundary-clear** — Every piece of knowledge belongs to exactly one role directory. Multi-role coverage uses frontmatter `roles:`, never content duplication.
2. **Descriptive hyphenated filenames** — Verb-phrase slugs, hyphens only. Underscores and digits are forbidden.
3. **Dual-copy for external knowledge** — `*-original.md` (source) + `*-summary.md` (synthesis), never a blended hybrid.
4. **YAML frontmatter required** — `title` / `tags` / `category` / `created` / `updated` / `source` / `type` / `roles` / `benefit` / `acceptance_criteria` are recall signals.
5. **Unified body structure** — Summary / Core viewpoints / Key information / Action recommendations / Anti-patterns / Related links.
6. **Freshness labeling** — External content requires `last_verified` + `review_cycle`; unverified for 6 months is marked `status: deprecated`.
7. **Max 3 directory levels** — `role/problem-domain/file.md`; no nested sub-sub-directories.

## 3 cross-cutting domain indexes

Beyond the 7 role directories, 3 domain indexes aggregate content across roles by topic:

| Domain index | Aggregates | Answers |
|---|---|---|
| [SECURITY.md](./engineer/SECURITY.md) | Supply chain, appsec, risk, incident response, compliance | Where is all security content across roles? |
| [COLLABORATION.md](./curator/COLLABORATION.md) | Team process, meetings, knowledge sharing, onboarding, PM | Where is all collaboration content across roles? |
| [ENGINEERING.md](./engineer/ENGINEERING.md) | Architecture, quality, data, tools, lessons | Where is all engineering content across roles? |

## 4 architecture diagrams

Draw these 4 diagrams before extending the KB:

| Diagram | Location | Answers |
|---|---|---|
| Knowledge map | [curator/diagrams/knowledge-map.md](./curator/diagrams/knowledge-map.md) | What knowledge exists? Explicit vs. tacit? Holders and consumers? |
| User-journey map | [curator/diagrams/user-journey.md](./curator/diagrams/user-journey.md) | Where is the knowledge? How does it flow? Where are the breakpoints? |
| Directory blueprint | [curator/diagrams/directory-blueprint.md](./curator/diagrams/directory-blueprint.md) | How do users find things at a glance? Role × problem domain, max 3 levels |
| Governance flow | [curator/governance/governance.md](./curator/governance/governance.md) | Who maintains? How often? 4 roles, 3 cadences |

Run the [readiness checklist](./curator/governance/readiness-checklist.md) 10-question gate before extending.

## Navigation strategy

**By pipeline stage** (recommended) — Start from the stage you're in and go to the corresponding role directory. If you're unsure which stage, use the role decision tree above.

**By domain index** — Cross-stage topics (security, AI, collaboration, engineering) start from one of the 4 domain indexes.

**By demo** — Start from a complete example project in [projects/](./projects/) → `<project>/demos/` when you need a populated reference (instantiable in YiVad Project Management).

**By project** — Start from [projects/](./projects/) ([README](./projects/README.md) | [INDEX](./projects/INDEX.md)) for project-specific bugs, issues, docs, and demos across all 4 projects.

**By filename grep** — `rg "^tags:.*keyword" YiKnowledge -l` for quick filtering.

**By frontmatter scan** — `head -15 file.md` to read YAML metadata, judge relevance before reading the full file.

## Positioning in the AI era

YiKnowledge serves both humans and AI (the YiAi BRD Agent's RAG data source):

- **Human view** — 7 role directories × problem-domain subdirectories, reach any content within 2 hops. The pipeline narrative lets newcomers build a mental model quickly.
- **AI view** — Frontmatter `roles` / `benefit` / `acceptance_criteria` / `lifecycle` / `related` / `tags` / `category` are RAG recall signals. Structured knowledge is far more AI-consumable than scattered documents.
- **The knowledge map never goes stale** — AI consumes structured knowledge; garbage in, garbage out. Maintaining the KB is maintaining the AI's cognitive boundary.