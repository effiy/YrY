---
title: Product Manager
tags:
- leaf
- producter
- frameworks
- discovery
- delivery
- strategy
- projects
category: producter
created: '2026-08-06'
updated: '2026-08-12'
last_verified: '2026-08-12'
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- producter
- engineer
benefit: Product managers find PM frameworks, discovery tools, delivery processes,
  and strategy guides organized by problem domain
acceptance_criteria:
- '5 problem-domain subdirectories: frameworks, discovery, delivery, strategy, projects'
- Each subdirectory has a README with categorized file listings
- Max 3 directory levels
related:
- ./INDEX.md
- ../INDEX.md
- ../curator/COLLABORATION.md
---

# Product Manager

> **Pipeline stage 1/5: Requirements** — Input chip: `Business strategy` → Output chips: `PRDs`, `user stories`, `priorities`
>
> **As a** product manager, **I want to** find PM frameworks, discovery tools, and delivery processes, **so that** I can define, build, and ship the right product.
> Producter DEFINES what to build. It does not decide how to build (→ [engineer/](../engineer/)), make technical decisions (→ [leader/](../leader/)), or set business strategy (→ [executiver/](../executiver/)).

## Getting started

| I'm new and want to... | Go to |
|---|---|
| Understand the role index | [INDEX.md](./INDEX.md) — full file listing by chip |
| Learn prioritization frameworks | [frameworks/rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) — RICE/ICE scoring |
| Write my first PRD | [discovery/write-a-prd.md](./discovery/write-a-prd.md) — PRD writing guide |
| See how sprints are run | [delivery/run-a-sprint.md](./delivery/run-a-sprint.md) — sprint management |
| Study AI product cases | [strategy/ai-customer-service-cases.md](./strategy/ai-customer-service-cases.md) — AI customer service cases |
| Check project-specific docs | [projects/](./projects/) — YiAi, YiVad, YiPet PM docs |

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| Business strategy | ← Input | Market intelligence, competitive landscape, org-level goals | [executiver/](../executiver/) |
| `prds` | Output → | Product Requirement Documents — what to build, for whom | [discovery/write-a-prd.md](./discovery/write-a-prd.md), [discovery/prd/](./discovery/prd/) |
| `user-stories` | Output → | User stories and JTBD narratives | [frameworks/](./frameworks/), [discovery/](./discovery/) |
| `priorities` | Output → | Prioritization frameworks (RICE/ICE) and north-star metrics | [frameworks/](./frameworks/), [discovery/metrics/](./discovery/metrics/) |

## Scope

### In scope (producter OWNS)

**`prds` chip:**
- [write-a-prd.md](./discovery/write-a-prd.md) — PRD writing methodology and guide
- [discovery/prd/](./discovery/prd/) — Concrete PRD instances (BRD agent, aiChat port)
- [frameworks/write-a-brd.md](./frameworks/write-a-brd.md) — BRD writing guide
- [frameworks/write-a-spec-or-prd.md](./frameworks/write-a-spec-or-prd.md) — Spec/PRD writing

**`user-stories` chip:**
- [frameworks/jobs-to-be-done.md](./frameworks/jobs-to-be-done.md) — Jobs-to-be-Done framework
- [frameworks/kano-model.md](./frameworks/kano-model.md) — Kano model for feature classification
- [frameworks/jtbd-kano.md](./frameworks/jtbd-kano.md) — JTBD + Kano integrated approach
- [frameworks/story-mapping.md](./frameworks/story-mapping.md) — User story mapping
- [frameworks/do-user-research.md](./frameworks/do-user-research.md) — User research methods
- [discovery/ux/](./discovery/ux/) — UX patterns, usability, accessibility (9 files)

**`priorities` chip:**
- [frameworks/rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) — RICE/ICE scoring
- [frameworks/moscow-prioritization.md](./frameworks/moscow-prioritization.md) — MoSCoW method
- [frameworks/heart-aarrr-metrics.md](./frameworks/heart-aarrr-metrics.md) — HEART + AARRR frameworks
- [frameworks/okr-design.md](./frameworks/okr-design.md) — OKR design guide
- [discovery/metrics/north-star-metric.md](./discovery/metrics/north-star-metric.md) — North-star metric definition
- [discovery/metrics/](./discovery/metrics/) — Full metrics catalog (7 files)
- [delivery/run-a-sprint.md](./delivery/run-a-sprint.md) — Sprint management
- [delivery/](./delivery/) — Meetings, retros, planning (15 files)
- [strategy/](./strategy/) — Competitive analysis, industry cases (7 files)
- [projects/](./projects/) — Per-project PM docs (4 files)

**`frameworks` (full catalog — 20 files):**
- [frameworks/dual-track-agile.md](./frameworks/dual-track-agile.md) — Dual-track agile (discovery + delivery)
- [frameworks/agile-product-management.md](./frameworks/agile-product-management.md) — Agile PM methodology
- [frameworks/lean-startup.md](./frameworks/lean-startup.md) — Lean Startup methodology
- [frameworks/product-discovery-framework.md](./frameworks/product-discovery-framework.md) — Product discovery framework
- [frameworks/prioritize-a-backlog.md](./frameworks/prioritize-a-backlog.md) — Backlog prioritization
- [frameworks/handle-an-edge-case-backlog.md](./frameworks/handle-an-edge-case-backlog.md) — Edge case management
- [frameworks/launch-an-ai-product.md](./frameworks/launch-an-ai-product.md) — AI product launch guide
- [frameworks/write-a-weekly-report.md](./frameworks/write-a-weekly-report.md) — Weekly report writing
- [frameworks/README.md](./frameworks/README.md) — Full frameworks index

### Out of scope (delegated to other roles)
- Business/corporate strategy → **[executiver/strategy/](../executiver/strategy/)**
- Market intelligence and industry reports → **[executiver/industry/](../executiver/industry/)**
- Technical implementation patterns → **[engineer/](../engineer/)**
- Architecture decisions → **[leader/decisions/](../leader/decisions/)**
- Technical roadmap → **[leader/roadmap/](../leader/roadmap/)**
- Engineering team process → **[engineer/run/](../engineer/run/)**
- KB governance → **[curator/governance/](../curator/governance/)**

## Decision rules for boundary cases

| When content involves... | Route to | Because |
|---|---|---|
| Product positioning vs competitors | producter/strategy/ | Product-level competitive analysis |
| Market trends and industry reports | executiver/industry/ | Business-level market intelligence |
| Feature prioritization framework | producter/frameworks/ | PM tool |
| Technical feasibility of a feature | engineer/build/ | Engineering assessment |
| Sprint retro format | producter/delivery/ | PM delivery process |
| Engineering team retro format | engineer/run/ | Engineering team workflow |
| Product roadmap (what features when) | producter/strategy/ | Product direction |
| Technical roadmap (what tech when) | leader/roadmap/ | Technical direction |
| User research interview guide | producter/discovery/ | PM discovery tool |
| User research synthesis report | producter/discovery/ | PM deliverable |

## Problem domains

| Domain | Solves | Files | Key entry points |
|---|---|---|---|
| [frameworks/](./frameworks/) | How do I prioritize and structure product decisions? | 20 | [README](./frameworks/README.md), [RICE/ICE](./frameworks/rice-ice-prioritization.md), [JTBD](./frameworks/jobs-to-be-done.md) |
| [discovery/](./discovery/) | How do I understand users and define requirements? | 24 | [INDEX](./discovery/INDEX.md), [write-a-prd](./discovery/write-a-prd.md), [metrics/](./discovery/metrics/), [ux/](./discovery/ux/) |
| [delivery/](./delivery/) | How do I run sprints and ship on time? | 15 | [README](./delivery/README.md), [run-a-sprint](./delivery/run-a-sprint.md), [retrospective](./delivery/retrospective.md) |
| [strategy/](./strategy/) | How do I position the product in the market? | 7 | [README](./strategy/README.md), [overseas-brd](./strategy/overseas-brd-case-study.md), [rag-agent](./strategy/rag-agent-case-study.md) |
| [projects/](./projects/) | Per-project PM docs (YiAi, YiVad, YiPet) | 4 | [README](./projects/README.md) |

## Quick reference

| I want to... | Chip | Go to |
|---|---|---|
| Prioritize features with RICE/ICE | `priorities` | [frameworks/rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) |
| Use MoSCoW prioritization | `priorities` | [frameworks/moscow-prioritization.md](./frameworks/moscow-prioritization.md) |
| Prioritize a backlog | `priorities` | [frameworks/prioritize-a-backlog.md](./frameworks/prioritize-a-backlog.md) |
| Understand user needs (JTBD) | `user-stories` | [frameworks/jobs-to-be-done.md](./frameworks/jobs-to-be-done.md) |
| Classify features with Kano | `user-stories` | [frameworks/kano-model.md](./frameworks/kano-model.md) |
| Combine JTBD + Kano | `user-stories` | [frameworks/jtbd-kano.md](./frameworks/jtbd-kano.md) |
| Create a story map | `user-stories` | [frameworks/story-mapping.md](./frameworks/story-mapping.md) |
| Do user research | `user-stories` | [frameworks/do-user-research.md](./frameworks/do-user-research.md) |
| Write a PRD | `prds` | [discovery/write-a-prd.md](./discovery/write-a-prd.md) |
| Write a BRD | `prds` | [frameworks/write-a-brd.md](./frameworks/write-a-brd.md) |
| Define a north-star metric | `priorities` | [discovery/metrics/north-star-metric.md](./discovery/metrics/north-star-metric.md) |
| Set up product metrics | `priorities` | [discovery/metrics/](./discovery/metrics/) — AARRR, DORA, NPS/CSAT, funnel |
| Design OKRs | `priorities` | [frameworks/okr-design.md](./frameworks/okr-design.md) |
| Run a sprint | `priorities` | [delivery/run-a-sprint.md](./delivery/run-a-sprint.md) |
| Run a sprint retro | `priorities` | [delivery/retrospective.md](./delivery/retrospective.md) |
| Run a retrospective meeting | `priorities` | [delivery/retrospective-meeting.md](./delivery/retrospective-meeting.md) |
| Plan a quarter | `priorities` | [delivery/quarterly-planning.md](./delivery/quarterly-planning.md) |
| Run efficient meetings | `priorities` | [delivery/meeting-efficiency.md](./delivery/meeting-efficiency.md) |
| Write a weekly report | `priorities` | [delivery/weekly-report.md](./delivery/weekly-report.md) |
| Do a design review | `priorities` | [delivery/design-review.md](./delivery/design-review.md) |
| Review UX heuristics | `user-stories` | [discovery/ux/nielsen-heuristics.md](./discovery/ux/nielsen-heuristics.md) |
| Design for AI product UX | `user-stories` | [discovery/ux/ai-product-ux-patterns.md](./discovery/ux/ai-product-ux-patterns.md) |
| Analyze competitors | `priorities` | [strategy/](./strategy/) — case studies, industry insight |
| Study AI implementation cases | `priorities` | [strategy/rag-agent-case-study.md](./strategy/rag-agent-case-study.md) |
| Launch an AI product | `priorities` | [frameworks/launch-an-ai-product.md](./frameworks/launch-an-ai-product.md) |
| Handle edge cases in backlog | `priorities` | [frameworks/handle-an-edge-case-backlog.md](./frameworks/handle-an-edge-case-backlog.md) |

## Cross-references

### Upstream (inputs to producter)
- [../executiver/strategy/](../executiver/strategy/) — Business strategy, market positioning
- [../executiver/industry/](../executiver/industry/) — Market intelligence, industry reports

### Downstream (consumers of producter outputs)
- [../leader/decisions/](../leader/decisions/) — PRDs feed into ADRs
- [../leader/roadmap/](../leader/roadmap/) — Priorities inform technical roadmap
- [../engineer/run/](../engineer/run/) — User stories drive engineering workflow
- [../engineer/learn/lessons/learn-pm-frameworks.md](../engineer/learn/lessons/learn-pm-frameworks.md) — PM methodology learning journey

### Peer roles
- [../curator/COLLABORATION.md](../curator/COLLABORATION.md) — Collaboration domain index
- [../aier/methodology/](../aier/methodology/) — AI methodology (for AI product PMs)

### Internal navigation
- [./INDEX.md](./INDEX.md) — Full role index with all file listings
- [../INDEX.md](../INDEX.md) — Knowledge base top-level index

## Pipeline flow

```
executiver/ (Business Strategy)
    │ market-intel, org-strategy
    ▼
┌── producter/ (Stage 1: Requirements) ──┐
│  Input:  Business strategy              │
│  Output: PRDs, user stories, priorities │
└─────────────────────────────────────────┘
    │ prds, user-stories, priorities
    ▼
leader/ (Stage 2: Decisions)
    │ adrs, tech-selections, capacity-plans
    ▼
engineer/ (Stage 3: Design+Build)
    │ architecture-patterns, dev-practices, quality-security
    ▼
srer/ (Stage 4+5: Quality+Release + Operate+Learn)
```

### Key cross-stage links
- [write-a-prd.md](./discovery/write-a-prd.md) → [leader/decisions/](../leader/decisions/) — PRDs feed into ADRs
- [north-star-metric.md](./discovery/metrics/north-star-metric.md) → [leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) — Metrics drive SLOs
- [rice-ice-prioritization.md](./frameworks/rice-ice-prioritization.md) → [leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — Priorities inform capacity
- [run-a-sprint.md](./delivery/run-a-sprint.md) → [engineer/run/run-a-retrospective.md](../engineer/run/run-a-retrospective.md) — Delivery feeds into retro
- [heart-aarrr-metrics.md](./frameworks/heart-aarrr-metrics.md) → [srer/observability/](../srer/observability/) — Product metrics inform observability
- [discovery/ux/ai-product-ux-patterns.md](./discovery/ux/ai-product-ux-patterns.md) → [aier/methodology/](../aier/methodology/) — AI UX patterns align with AI methodology