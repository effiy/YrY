---
title: Executiver
tags: [leaf, executiver, strategy, industry, roadmap, reading-list]
category: executiver
created: 2026-08-06
updated: 2026-08-12
last_verified: 2026-08-12
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [executiver]
benefit: "Executives find strategy frameworks, industry intelligence, roadmaps, and learning resources organized by domain"
acceptance_criteria:
  - "4 subdirectories: strategy, industry, roadmap, reading-list"
  - "Each subdirectory has a README with categorized file listings"
  - "Max 3 directory levels"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../producter/strategy/
---

# Executiver

> **Pipeline layer: Business Strategy (cross-cutting)** — Provides `Business strategy` input chip to Stage 1 (Requirements). Spans the entire pipeline.
>
> **As an** executiver, **I want to** find business strategy frameworks, industry intelligence, and organizational planning guides, **so that** I can make informed strategic decisions.
>
> Executiver provides BUSINESS context. It does not define product strategy (→ [producter/](../producter/)), make technical decisions (→ [leader/](../leader/)), or implement anything (→ [engineer/](../engineer/)).

## Pipeline chip contract

| Chip | Type | Description | Knowledge area |
|---|---|---|---|
| `market-intel` | Output → | Market trends, competitor landscape, industry reports | [industry/](./industry/) |
| `org-strategy` | Output → | Business strategy frameworks, org design, competitive positioning | [strategy/](./strategy/) |
| `reading-list` | Output → | Curated executive readings with distilled insights | [reading-list/](./reading-list/) |

## Scope

### In scope (executiver OWNS)

**`market-intel` chip:**
- Market trend analysis and semi-annual retrospectives → [industry/market-trends/](./industry/market-trends/)
- Competitor analysis and landscape mapping → [industry/competitors/](./industry/competitors/)
- Third-party industry report summaries (Gartner, McKinsey, a16z, CAICT, IDC) → [industry/reports/](./industry/reports/)

**`org-strategy` chip:**
- Business and corporate strategy frameworks (Porter, Blue Ocean, VRIO, SWOT) → [strategy/](./strategy/)
- Business model design and value proposition → [strategy/business-model-canvas.md](./strategy/business-model-canvas.md)
- Organizational roadmap and strategic planning (annual, quarterly, OKR) → [roadmap/](./roadmap/)
- Headcount and budget planning → [roadmap/headcount-budget-planning.md](./roadmap/headcount-budget-planning.md)
- Regulatory compliance and data retention strategy → [strategy/handle-a-regulatory-change.md](./strategy/handle-a-regulatory-change.md)

**`reading-list` chip:**
- Monthly curated reading list with rolling updates → [reading-list/reading-list.md](./reading-list/reading-list.md)
- Executive book notes with actionable takeaways → [reading-list/reading-note-high-output-management.md](./reading-list/reading-note-high-output-management.md)

### Out of scope (delegated to other roles)

- Product strategy and positioning → **[producter/strategy/](../producter/strategy/)**
- Product roadmap (what features when) → **[producter/strategy/](../producter/strategy/)**
- Technical roadmap (what tech when) → **[leader/roadmap/](../leader/roadmap/)**
- PM frameworks and discovery tools → **[producter/](../producter/)**
- Architecture decisions → **[leader/decisions/](../leader/decisions/)**
- Implementation patterns → **[engineer/](../engineer/)**
- Incident response → **[srer/](../srer/)**
- KB governance → **[curator/](../curator/)**

## Decision rules for boundary cases

| When content involves... | Route to | Because |
|---|---|---|
| Market trend analysis | [executiver/industry/](./industry/) | Business intelligence |
| Product competitive analysis | [producter/strategy/](../producter/strategy/) | Product-level analysis |
| Corporate strategy framework | [executiver/strategy/](./strategy/) | Business strategy |
| Product positioning strategy | [producter/strategy/](../producter/strategy/) | Product strategy |
| Organizational roadmap (business goals) | [executiver/roadmap/](./roadmap/) | Business planning |
| Technical roadmap (tech milestones) | [leader/roadmap/](../leader/roadmap/) | Technical planning |
| Industry report summary | [executiver/industry/reports/](./industry/reports/) | Business intelligence |
| Competitor feature comparison | [producter/strategy/](../producter/strategy/) | Product analysis |
| Org structure and team topology | [executiver/strategy/](./strategy/) | Organizational design |
| Team workflow and process | [engineer/run/](../engineer/run/) | Engineering operations |
| Regulatory compliance strategy | [executiver/strategy/](./strategy/) | Business risk management |
| Data compliance implementation | [engineer/quality/](../engineer/quality/) | Engineering execution |
| Budget and headcount planning | [executiver/roadmap/](./roadmap/) | Business planning |
| Hiring and team growth | [leader/roadmap/](../leader/roadmap/) | Technical leadership |

## Domains

| Domain | Solves | Content |
|---|---|---|
| [strategy/](./strategy/) | How do I define and communicate business strategy? | 14 files: strategy frameworks (Porter, Blue Ocean, VRIO, SWOT), business model canvas, value proposition, product strategy instances, regulatory compliance |
| [industry/](./industry/) | What's happening in the market and with competitors? | 19 files: competitor analysis (LLM vendors, SaaS, regional), market trends (H1 retrospective, emerging sectors), industry reports (Gartner, McKinsey, a16z, CAICT, IDC) |
| [roadmap/](./roadmap/) | What's our organizational plan and direction? | 5 files: annual strategic planning, quarterly business review, OKR tracking, headcount/budget planning |
| [reading-list/](./reading-list/) | What should I read to stay informed? | 4 files: monthly reading list, reading notes, book summaries |

## Quick reference

### Strategy frameworks

| I want to... | Go to |
|---|---|
| Define product strategy | [strategy/product-strategy-framework.md](./strategy/product-strategy-framework.md) |
| Design a business model | [strategy/business-model-canvas.md](./strategy/business-model-canvas.md) |
| Analyze competitive forces | [strategy/porter-five-forces.md](./strategy/porter-five-forces.md) |
| Find blue ocean opportunities | [strategy/blue-ocean.md](./strategy/blue-ocean.md) |
| Assess internal capabilities (VRIO) | [strategy/vrio-framework.md](./strategy/vrio-framework.md) |
| Run a SWOT analysis | [strategy/swot-analysis.md](./strategy/swot-analysis.md) |
| Map customer value | [strategy/value-proposition-canvas.md](./strategy/value-proposition-canvas.md) |
| Plan second-curve growth | [strategy/second-curve.md](./strategy/second-curve.md) |
| Design a product roadmap (Now/Next/Later) | [strategy/now-next-later-roadmap.md](./strategy/now-next-later-roadmap.md) |
| See our AI platform strategy instance | [strategy/product-strategy-instance.md](./strategy/product-strategy-instance.md) |

### Industry intelligence

| I want to... | Go to |
|---|---|
| Analyze competitors | [industry/competitors/competitor-analysis.md](./industry/competitors/competitor-analysis.md) |
| Map LLM vendor landscape | [industry/competitors/llm-vendor-landscape.md](./industry/competitors/llm-vendor-landscape.md) |
| Track SaaS top players | [industry/competitors/saas-top-players.md](./industry/competitors/saas-top-players.md) |
| Review regional competitors | [industry/competitors/regional-competitors.md](./industry/competitors/regional-competitors.md) |
| Analyze AI BRD competitors | [industry/competitors/ai-brd-competitors.md](./industry/competitors/ai-brd-competitors.md) |
| Read H1 2026 AI market trends | [industry/market-trends/ai-market-trend-first-half.md](./industry/market-trends/ai-market-trend-first-half.md) |
| Run a half-year retrospective | [industry/market-trends/half-year-retrospective.md](./industry/market-trends/half-year-retrospective.md) |
| Track emerging sectors | [industry/market-trends/emerging-sector-tracking.md](./industry/market-trends/emerging-sector-tracking.md) |
| Observe regional markets | [industry/market-trends/regional-market-observation.md](./industry/market-trends/regional-market-observation.md) |
| Read Gartner AI Hype Cycle | [industry/reports/gartner-ai-hype-cycle.md](./industry/reports/gartner-ai-hype-cycle.md) |
| Read McKinsey AI report | [industry/reports/mckinsey-ai-report.md](./industry/reports/mckinsey-ai-report.md) |
| Read a16z AI outlook | [industry/reports/a16z-ai-outlook.md](./industry/reports/a16z-ai-outlook.md) |
| Read CAICT AI whitepaper | [industry/reports/caict-ai-whitepaper.md](./industry/reports/caict-ai-whitepaper.md) |
| Read IDC customer service report | [industry/reports/idc-customer-service.md](./industry/reports/idc-customer-service.md) |
| Read AI industry report | [industry/reports/ai-industry-report.md](./industry/reports/ai-industry-report.md) |

### Organizational planning

| I want to... | Go to |
|---|---|
| Run annual strategic planning | [roadmap/annual-strategic-planning.md](./roadmap/annual-strategic-planning.md) |
| Run a quarterly business review | [roadmap/quarterly-business-review.md](./roadmap/quarterly-business-review.md) |
| Set up org-level OKR tracking | [roadmap/org-okr-tracking.md](./roadmap/org-okr-tracking.md) |
| Plan headcount and budget | [roadmap/headcount-budget-planning.md](./roadmap/headcount-budget-planning.md) |

### Learning resources

| I want to... | Go to |
|---|---|
| Browse the monthly reading list | [reading-list/reading-list.md](./reading-list/reading-list.md) |
| Use the reading notes template | [reading-list/reading-notes.md](./reading-list/reading-notes.md) |
| Read High Output Management notes | [reading-list/reading-note-high-output-management.md](./reading-list/reading-note-high-output-management.md) |

### Compliance & risk

| I want to... | Go to |
|---|---|
| Handle a regulatory change | [strategy/handle-a-regulatory-change.md](./strategy/handle-a-regulatory-change.md) |
| Plan data compliance strategy | [strategy/handle-data-compliance.md](./strategy/handle-data-compliance.md) |
| Run a data retention review | [strategy/do-a-data-retention-review.md](./strategy/do-a-data-retention-review.md) |

## Cross-references

### Delegated to other roles
- [../producter/strategy/](../producter/strategy/) — Product strategy and competitive positioning
- [../leader/roadmap/](../leader/roadmap/) — Technical roadmap and engineering planning
- [../leader/decisions/](../leader/decisions/) — Architecture decisions
- [../engineer/](../engineer/) — Implementation and engineering practices
- [../srer/](../srer/) — Incident response and operational excellence

### Scenario entries (other roles → executiver)
- [../engineer/run/understand-competitors.md](../engineer/run/understand-competitors.md) — Engineers learning competitor analysis
- [../aier/ml/find-ai-deployment-cases.md](../aier/ml/find-ai-deployment-cases.md) — AI engineers finding deployment cases
- [../curator/diagrams/knowledge-map.md](../curator/diagrams/knowledge-map.md) — Knowledge map of the entire library

### Governance
- [../curator/governance/inbox.md](../curator/governance/inbox.md) — New content enters via inbox before categorization
- [../MEMORY.md](../MEMORY.md) — Library-wide archiving principles and YAML spec

## Pipeline flow

```
┌── executiver/ (Business Strategy — cross-cutting) ──┐
│  Output: market-intel, org-strategy, reading-list     │
└──────────────────────────────────────────────────────┘
    │ market-intel, org-strategy
    ▼
producter/ (Stage 1: Requirements)
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
- [business-model-canvas.md](./strategy/business-model-canvas.md) → [../producter/discovery/write-a-prd.md](../producter/discovery/write-a-prd.md) — Strategy feeds into PRDs
- [product-strategy-framework.md](./strategy/product-strategy-framework.md) → [../producter/strategy/ai-customer-service-cases.md](../producter/strategy/ai-customer-service-cases.md) — Strategy drives product cases
- [competitor-analysis.md](./industry/competitors/competitor-analysis.md) → [../leader/architecture/tl-tech-selection-llm-provider.md](../leader/architecture/tl-tech-selection-llm-provider.md) — Market intel informs tech selection
- [org-okr-tracking.md](./roadmap/org-okr-tracking.md) → [../leader/roadmap/define-an-slo.md](../leader/roadmap/define-an-slo.md) — Business OKRs cascade to technical SLOs
- [headcount-budget-planning.md](./roadmap/headcount-budget-planning.md) → [../leader/capacity/run-a-finops-review.md](../leader/capacity/run-a-finops-review.md) — Budget planning drives FinOps

## Maintenance

- **Monthly**: scan [industry/](./industry/) `last_verified` timestamps; entries older than 6 months → mark `status: deprecated`
- **Quarterly**: review all strategy frameworks for relevance; update [reading-list](./reading-list/) with new publications
- **Semi-annual**: run [half-year-retrospective.md](./industry/market-trends/half-year-retrospective.md) and archive stale market observations