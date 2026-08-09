---
title: technical strategy dashboard
aliases:
- architecture strategy dashboard
- technology radar dashboard
- build-vs-buy dashboard
- innovation portfolio dashboard
- tech debt dashboard
tags:
- dashboard
- technical-strategy
- architecture
- build-vs-buy
- technology-radar
- innovation
- tech-debt
- roadmap
category: tech-lead/strategy
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
- executive
- engineer
benefit: technical strategy, architecture decisions, and technology investment visible at a glance
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- descriptive verb-phrase filename, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
- build-vs-buy, technology radar, innovation bets, architecture strategy, tech debt, and roadmap health defined
related:
- ../../engineer/architecture-design/apply-domain-driven-design.md
- ../../engineer/architecture-design/decompose-a-monolith.md
- ../../engineer/quality-security/dashboard-dependency-management.md
- ../../product-manager/strategy/dashboard-product-strategy.md
- ../../product-manager/strategy/dashboard-innovation-portfolio.md
- ../../executive/strategy/dashboard-okr-health.md
tacit: false
---

# technical strategy dashboard

> **As a** tech lead, **I want to** track technical strategy and architecture decisions, **so that** every build-vs-buy choice is intentional, the technology radar reflects reality, innovation bets are measured, architecture debt is contained, and the technical roadmap aligns with business goals.

> Technical strategy is the bridge between product vision and engineering execution. This dashboard tracks build-vs-buy decisions, technology radar maturity, innovation portfolio health, architecture strategy, tech debt metrics, and roadmap alignment — turning technical strategy from a slide deck into a continuously measured, data-driven decision framework.

## Summary

- 6 technical strategy dimensions: build-vs-buy, technology radar, innovation portfolio, architecture strategy, tech debt, roadmap alignment
- 42 services across 8 domains; 285 engineers; 12 technology choices reviewed per quarter; 8 build-vs-buy decisions in last 12 months
- Build-vs-buy: 62% build, 28% buy, 10% adopt open source; 2 buy decisions regretted (25% buyer's remorse); avg decision cycle: 18 days
- Technology radar: 85 technologies tracked; 12 adopt, 28 trial, 22 assess, 18 hold, 5 retire; radar reviewed quarterly
- Innovation portfolio: 15 active bets; 70% core, 20% adjacent, 10% transformational; 2 moonshots; innovation ROI: 1.8× (target 2.5×)
- Tech debt: $4.2M estimated principal; 18% of sprint capacity allocated to debt reduction; debt interest rate: 12% (slowing velocity); 85 critical debt items
- Dashboard reviewed quarterly; technical strategy offsite biannual with engineering leadership, product, and executive team

## Core viewpoints

- Build-vs-buy is a strategy decision, not a cost decision — the spreadsheet always favors buying, but the spreadsheet doesn't capture differentiation, learning, or lock-in; if it's not core to your competitive advantage, buy it; if it is, build it better than anyone
- The technology radar is a compass, not a map — it tells you which direction to explore, not the exact path; over-investing in "adopt" technologies creates monoculture; under-investing in "trial" technologies creates surprise
- Innovation without a portfolio is gambling — you need core bets (70%, predictable returns), adjacent bets (20%, growth), and transformational bets (10%, breakthrough); if you can't afford to lose the bet, it's not a bet, it's a decision
- Tech debt is a financial instrument — you take it on intentionally to accelerate delivery, and you pay it down before the interest compounds; undocumented, unmanaged tech debt is not strategy, it's negligence

## Key information

### 6-panel technical strategy overview

```
┌──────────────────────────────────────────────────────────────────┐
│  BUILD VS BUY                       │  TECHNOLOGY RADAR                   │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Build: 62% (26/42)      │   │  │  Technologies: 85 total   │   │
│  │  Buy/SaaS: 28% (12/42)  │   │  │  Adopt: 12 (14%)          │   │
│  │  Open source: 10% (4/42) │   │  │  Trial: 28 (33%)          │   │
│  │  Decisions/yr: 8         │   │  │  Assess: 22 (26%)         │   │
│  │  Buyer's remorse: 25%    │   │  │  Hold: 18 (21%)           │   │
│  │  Decision cycle: 18 days │   │  │  Retire: 5 (6%)           │   │
│  │  Build score: B+ (82)    │   │  │  Radar health: B (78)     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  INNOVATION PORTFOLIO               │  ARCHITECTURE STRATEGY              │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Active bets: 15         │   │  │  Services: 42 total      │   │
│  │  Core: 70% (10 bets)    │   │  │  Domains: 8 bounded ctx  │   │
│  │  Adjacent: 20% (3 bets) │   │  │  ADRs: 28 decisions      │   │
│  │  Transformational: 10%  │   │  │  Architecture fitness:72 │   │
│  │  Moonshots: 2            │   │  │  Coupling score: C+ (65) │   │
│  │  Innovation ROI: 1.8×    │   │  │  Cohesion score: B (78)  │   │
│  │  Kill rate: 35%          │   │  │  Modularity: B- (72)     │   │
│  │  Portfolio score: B (78) │   │  │  Architecture: B- (72)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  TECH DEBT                          │  ROADMAP ALIGNMENT                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Debt principal: $4.2M   │   │  │  Roadmap items: 85       │   │
│  │  Debt interest: 12%/yr   │   │  │  On-track: 72%            │   │
│  │  Sprint allocation: 18%  │   │  │  At-risk: 18%             │   │
│  │  Critical items: 85      │   │  │  Blocked: 10%             │   │
│  │  Debt density: 8.2/KLOC  │   │  │  Strategy alignment: 82%  │   │
│  │  Remediation velocity:+12│   │  │  Capacity utilization:78% │   │
│  │  Debt score: C (62)      │   │  │  Roadmap health: B (80)   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Build vs buy decision log (last 12 months)

| Decision | Domain | Outcome | Rationale | Cost (3yr TCO) | Time to implement | Regret |
|---|---|---|---|---|---|---|
| **API Gateway** | Infra | **Buy** (Kong) | Commodity, no differentiation | $180K vs $520K build | 4 weeks vs 6 months | No |
| **Real-time chat** | YiVad | **Build** | Core UX differentiator, no good SaaS fit | $320K build vs $240K SaaS | 3 months | No |
| **Search engine** | Platform | **Buy** (Elastic Cloud) | Complex to operate, not core IP | $210K SaaS vs $680K build | 2 weeks | No |
| **Feature flags** | Platform | **Buy** (LaunchDarkly) | Commodity, fast time-to-value | $144K vs $280K build | 1 week | No |
| **PDF generation** | YiPet | **Buy** (PrinceXML) | Edge cases too complex to build | $85K license vs $450K build | 2 weeks | No |
| **Notification system** | Platform | **Build** | Multi-channel complexity, core infrastructure | $380K build vs $520K SaaS | 4 months | **Yes — overbuilt, should have bought** |
| **Analytics pipeline** | Data | **Open source** (dbt + Airbyte) | ELT is commodity, avoid vendor lock-in | $180K ops vs $420K SaaS | 2 months | No |
| **Workflow engine** | YiAi | **Build** | Core IP, no existing engine fits agent loops | $520K build | 6 months | No |

### Build vs buy decision framework

| Criterion | Weight | Build threshold | Buy threshold | Assessment method |
|---|---|---|---|---|
| **Competitive differentiation** | 30% | Core to unique value | Commodity, table-stakes | Product strategy review |
| **Time to market** | 20% | 6+ months runway | < 1 month to integrate | T-shirt sizing + dependency check |
| **Total cost of ownership (3yr)** | 20% | Build < 1.5× buy | Buy < 0.7× build | Engineering + ops cost model |
| **In-house expertise** | 15% | Deep domain expertise | No internal knowledge | Skills matrix + hiring plan |
| **Vendor risk** (lock-in, EOL) | 10% | Unacceptable vendor risk | Acceptable, migration path exists | Vendor assessment scorecard |
| **Integration complexity** | 5% | Simple, well-defined API | Complex, many touchpoints | Architecture review |

### Technology radar (Q3 2026)

| Ring | Technologies | Count | % of total | Review cadence | Movement (from Q2) |
|---|---|---|---|---|---|
| **Adopt** | Rust (services), Temporal (workflows), OpenTelemetry, GraphQL (public API), PostgreSQL, Redis, Kubernetes, ArgoCD, Biome (lint/format), Playwright (E2E), Datadog, LaunchDarkly | 12 | 14% | Quarterly | +2 (OpenTelemetry, Biome) |
| **Trial** | WebAssembly (compute), gRPC (internal), Kafka, ClickHouse, Bun, Dagger (CI/CD), Deno, tRPC, htmx, SST (IaC), Zig (systems), Pixi (Python pkg), Turborepo, Solid.js, Valkey, NATS, PGlite, Cilium, Parquet (analytics), WGPU, Drizzle ORM, Ziggy (API routing), Vite 8, Rsbuild, TanStack Router, Effect.ts, Biome plugins, Zig | 28 | 33% | Monthly | +5 (Dagger, Pixi, Valkey, PGlite, TanStack Router) |
| **Assess** | DuckDB, RisingWave, Bun Macro, Nix (dev env), Oxide (cloud), Svelte 5, Nuxt 4, Grafana Alloy, OpenFeature, CUE (config), KCL (policy), Winglang, Dapr, Spin (Wasm), KubeVela, Backstage, Pulumi, Fermyon, Cilium Service Mesh, Serverless PostgreSQL, Neon, Tigris | 22 | 26% | Quarterly | +3 (Grafana Alloy, CUE, Dapr) |
| **Hold** | MongoDB (analytics), Elasticsearch (self-hosted), Jenkins, Puppet, Chef, Vagrant, Flow (JS), CoffeeScript, Hibernate, SOAP, WCF, XSLT, Silverlight, Flash, Cordova, Ionic, Appium, Protractor | 18 | 21% | Biannual | +2 (Flow, CoffeeScript) |
| **Retire** | AngularJS (1.x), Bootstrap 3, jQuery (new code), Python 2.7, Node.js 14 | 5 | 6% | Annual | 0 (same) |

### Technology evaluation pipeline

| Technology | Ring | Sponsor | Evaluation start | Decision due | Evidence | Recommendation |
|---|---|---|---|---|---|---|
| **Kafka** | Trial | Data team | 2026-05 | 2026-09 | 3 services in trial, 12K msg/s | Likely adopt for event streaming |
| **ClickHouse** | Trial | Analytics | 2026-04 | 2026-08 | 8× faster than Postgres for analytics | Likely adopt for analytics |
| **DuckDB** | Assess | Data team | 2026-06 | 2026-10 | Prototype only, 2 use cases | Needs more evidence |
| **WebAssembly** | Trial | Platform | 2026-03 | 2026-09 | 1 service (image processing), 3× perf | Niche adoption |
| **Nix** | Assess | DevEx | 2026-07 | 2026-12 | 4 engineers dogfooding | Promising for dev env |
| **Pulumi** | Assess | Infra | 2026-05 | 2026-11 | PoC on 1 project | Competing with Terraform CDK |
| **Dapr** | Assess | Platform | 2026-06 | 2026-12 | Research only | Might simplify service mesh |
| **Bun** | Trial | DevEx | 2026-02 | 2026-08 | 2 projects, faster than Node.js | Ready for non-critical services |

### Innovation portfolio

| Bet name | Category | Investment | Stage | Progress | Expected outcome | Kill criteria | Status |
|---|---|---|---|---|---|---|---|
| **YiAi agent loops** | Core | $280K/yr | Growth | V2 shipped, 85% task completion | 50% reduction in manual workflow steps | Task completion < 70% | On-track |
| **Real-time collaboration** | Core | $180K/yr | Validation | Beta with 12 customers | 30% increase in team plan adoption | < 20% beta engagement | On-track |
| **Multi-modal RAG** | Adjacent | $120K/yr | Exploration | PoC: image + text retrieval at 78% precision | New product line (YiVision) | Precision < 70% or no customer demand | On-track |
| **Code generation from designs** | Adjacent | $95K/yr | Ideation | Research phase, 2 papers | Design→code pipeline, 10× faster prototyping | No viable prototype in 6 months | At-risk |
| **Edge AI inference** | Transformational | $65K/yr | Exploration | Prototype on-device LLM at 12 tokens/s | Offline-capable AI features | Inference speed < 5 tokens/s | Early |
| **Self-healing infrastructure** | Transformational | $45K/yr | Ideation | Research, auto-remediation PoC | 80% of P3 incidents auto-resolved | False-positive remediation > 10% | Early |
| **Plugin marketplace** | Core | $150K/yr | Validation | Developer docs published, 8 partner plugins | Ecosystem flywheel, 50+ plugins | < 10 partner plugins in 12 months | On-track |
| **AI-native IDE** | Adjacent | $85K/yr | Ideation | Competitive analysis, 3 prototypes | New developer tool product | No clear differentiation from Copilot | At-risk |

### Innovation portfolio health

| Portfolio metric | Current | 6 months ago | Target | Notes |
|---|---|---|---|---|
| **Active bets** | 15 | 12 | 12-18 | Healthy pipeline |
| **Core bets** (70% allocation) | 10 bets, $1.15M | 8 bets, $920K | 65-75% | Slightly over-allocated |
| **Adjacent bets** (20% allocation) | 3 bets, $300K | 2 bets, $200K | 15-25% | Healthy |
| **Transformational bets** (10% allocation) | 2 bets, $110K | 2 bets, $85K | 5-15% | Under-invested |
| **Moonshots** (high-risk, high-reward) | 2 (Edge AI, Self-healing) | 1 | 2-3 | Good |
| **Innovation ROI** (revenue/cost) | 1.8× | 1.5× | 2.5× | Improving |
| **Kill rate** (bets terminated) | 35% | 40% | 30-50% | Healthy — killing is good |
| **Time from ideation to validation** | 4.5 months | 5.2 months | < 3 months | Too slow |
| **Overall portfolio score** | **B (78)** | **B- (72)** | **B+ (85)** | |

### Architecture decision records (ADRs)

| ADR | Date | Domain | Decision | Status | Review due | Drift |
|---|---|---|---|---|---|---|
| **ADR-001** | 2024-03 | Platform | Monorepo with Turborepo | Accepted | 2026-09 | None |
| **ADR-002** | 2024-05 | All | REST + GraphQL dual API strategy | Accepted | 2026-11 | Minor — considering gRPC for internal |
| **ADR-003** | 2024-06 | Data | PostgreSQL as primary DB | Accepted | 2026-12 | None |
| **ADR-004** | 2024-08 | Infra | Kubernetes (EKS) for orchestration | Accepted | 2027-02 | None |
| **ADR-005** | 2024-09 | YiAi | LangChain → LlamaIndex migration | Superseded by ADR-022 | 2026-03 | Complete |
| **ADR-006** | 2024-10 | All | Event-driven architecture (async boundary) | Accepted | 2027-04 | Drift — 3 services still synchronous |
| **ADR-007** | 2024-11 | Platform | ArgoCD for GitOps | Accepted | 2027-05 | None |
| **ADR-022** | 2026-03 | YiAi | LlamaIndex + custom agent harness | Accepted | 2027-09 | None |
| **ADR-028** | 2026-07 | All | Rsbuild replacing Vite for new projects | Proposed | — | In review |

### Architecture fitness by domain

| Domain | Services | Bounded contexts | ADR coverage | Coupling (lower is better) | Cohesion (higher is better) | Fitness score |
|---|---|---|---|---|---|---|
| **Platform (Infra)** | 8 | 2 | 5/5 ADRs | Low (22) | High (85) | A- (88) |
| **YiAi (AI)** | 6 | 2 | 4/4 ADRs | Medium (38) | High (82) | B+ (82) |
| **YiVad (Collaboration)** | 8 | 2 | 5/5 ADRs | Medium (42) | Medium (75) | B (78) |
| **YiPet (Desktop)** | 4 | 1 | 3/3 ADRs | Low (18) | High (88) | A- (90) |
| **YiWeb (Portal)** | 5 | 1 | 3/3 ADRs | Medium (35) | Medium (78) | B+ (82) |
| **Data Platform** | 5 | 2 | 3/5 ADRs | High (55) | Medium (72) | C+ (68) |
| **Auth/IAM** | 3 | 1 | 2/2 ADRs | Low (15) | High (90) | A (92) |
| **Shared/Common** | 3 | 1 | 3/3 ADRs | Medium (40) | Low (58) | B- (70) |
| **Overall** | **42** | **12** | **28/30** | **Medium (38)** | **Medium (78)** | **B- (72)** |

### Tech debt assessment

| Debt category | Principal ($K) | Interest rate | Sprint impact | Critical items | Remediation effort | Trend |
|---|---|---|---|---|---|---|
| **Code quality** (duplication, complexity) | $1,280 | 8% | 5.2% velocity loss | 28 | 6 months | → |
| **Architecture** (coupling, wrong boundaries) | $1,050 | 15% | 8.5% velocity loss | 22 | 12 months | ↑ |
| **Testing** (missing tests, flaky tests) | $680 | 10% | 4.8% velocity loss | 15 | 4 months | ↓ |
| **Documentation** (outdated, missing) | $420 | 5% | 2.2% velocity loss | 8 | 3 months | → |
| **Dependencies** (stale, vulnerable) | $350 | 18% | 3.5% velocity loss | 12 | 3 months | ↑ |
| **Infrastructure** (manual, unscalable) | $420 | 12% | 4.0% velocity loss | 10 | 8 months | → |
| **Total** | **$4,200** | **12% avg** | **18% sprint allocation** | **85** | **6 months avg** | |

### Tech debt by service

| Service | Debt principal | Debt density (per KLOC) | Age (months) | Interest rate | Repayment status |
|---|---|---|---|---|---|
| **YiWeb (legacy monolith)** | $820K | 12.5 | 28 | 18% | Paying down (15% sprint) |
| **YiAi agent orchestrator** | $520K | 8.8 | 14 | 14% | Paying down (20% sprint) |
| **Data pipeline (ETL)** | $480K | 10.2 | 18 | 16% | Not paying down |
| **YiVad real-time service** | $380K | 7.5 | 12 | 12% | Paying down (10% sprint) |
| **Notification service** | $320K | 9.2 | 15 | 14% | Not paying down |
| **Auth service** | $180K | 4.5 | 8 | 8% | Stable |
| **API Gateway** | $120K | 3.2 | 6 | 6% | Stable |
| **Other (35 services)** | $1,380K | 6.8 avg | 12 avg | 10% avg | Mixed |

### Roadmap alignment

| Roadmap item | Domain | Priority | Target quarter | Status | Strategy alignment | Dependencies |
|---|---|---|---|---|---|---|
| **YiAi V2 agent loops** | AI | P0 | 2026-Q3 | On-track | Core bet | LlamaIndex upgrade |
| **Real-time collab GA** | YiVad | P0 | 2026-Q3 | On-track | Core bet | WebSocket infra |
| **Monolith decomposition (Phase 2)** | YiWeb | P0 | 2026-Q3 | At-risk | Architecture debt | 3 service extractions |
| **Plugin marketplace MVP** | Platform | P1 | 2026-Q4 | On-track | Core bet | API stabilization |
| **Multi-modal RAG prototype** | AI | P1 | 2026-Q4 | On-track | Adjacent bet | Vision model selection |
| **Observability 2.0** (OTel) | Infra | P1 | 2026-Q4 | At-risk | Platform foundation | All service migration |
| **Kafka migration** | Data | P2 | 2027-Q1 | On-track | Architecture improvement | Event schema design |
| **Edge AI PoC** | AI | P2 | 2027-Q1 | At-risk | Moonshot | On-device model |
| **SLSA L2+ rollout** | Security | P2 | 2027-Q1 | On-track | Supply chain security | Build pipeline changes |
| **Self-healing infra** | Infra | P3 | 2027-Q2 | Early | Moonshot | Auto-remediation engine |

### Capacity allocation by strategy pillar

| Strategy pillar | Sprint allocation | Engineers | Quarterly investment | ROI expectation | Alignment with roadmap |
|---|---|---|---|---|---|
| **Core product development** | 52% | 148 | $4.2M | Revenue growth | 85% aligned |
| **Tech debt reduction** | 18% | 51 | $1.45M | Velocity recovery | 72% aligned |
| **Platform & infrastructure** | 12% | 34 | $970K | Foundation for scale | 78% aligned |
| **Innovation bets** | 10% | 29 | $810K | Future revenue | 65% aligned |
| **Security & compliance** | 5% | 14 | $400K | Risk reduction | 90% aligned |
| **Unplanned/urgent** | 3% | 9 | $240K | N/A | 0% aligned |
| **Total** | **100%** | **285** | **$8.07M** | | **82%** |

## Action recommendations

1. **Notification service build regret review**: $380K build, over-engineered; conduct post-mortem, improve build-vs-buy decision framework with "complexity multiplier" for infrastructure services
2. **Technology radar retirement program**: 5 technologies in "retire" ring; create migration timelines for AngularJS, Bootstrap 3, jQuery, Python 2.7, Node.js 14; target 0 active usage by Q4 2026
3. **Innovation kill-rate optimization**: 35% kill rate is healthy but time-to-kill is 4.5 months; implement 90-day "kill or scale" gates for all bets, reduce ideation→validation from 4.5 to 3 months
4. **Architecture coupling reduction**: Data platform domain at 55 coupling (high); extract 2 bounded contexts, implement event-driven integration, target coupling < 35
5. **Tech debt principal reduction**: $4.2M principal, 12% interest; increase sprint allocation from 18% to 25% for 2 quarters, target $3.0M principal by Q4 2026
6. **Data platform ADR coverage**: 3/5 data platform ADRs documented; complete 2 missing ADRs for data pipeline and analytics architecture
7. **YiWeb monolith decomposition**: $820K debt, 28 months old, 18% interest; complete Phase 2 extraction (3 services), target $500K debt by Q4 2026
8. **Roadmap dependency management**: 18% of roadmap items at-risk; resolve top 3 blockers (monolith extraction, OTel migration, Edge AI model selection)
9. **Build-vs-buy cycle time**: 18-day average decision cycle; create lightweight decision template, delegate non-strategic decisions to domain leads, target < 10 days
10. **Quarterly technical strategy review**: review build-vs-buy decisions, technology radar, innovation portfolio, architecture fitness, tech debt, and roadmap alignment with engineering leadership, product, and executive team



- The "we'll build it better" fallacy → assuming your team can build a better version of a commodity tool than the company that has 500 engineers working on it full-time; unless it's core differentiation, you're building a worse version at 10× the cost
- Technology radar as a wishlist → putting every cool technology you saw at a conference into "trial" or "assess" without a clear evaluation plan; the radar reflects what you're actually evaluating, not what you'd like to evaluate
- Innovation theater → running "innovation sprints" that produce slide decks and prototypes nobody intends to ship; real innovation ends with a kill decision or a product, not a PowerPoint
- Tech debt denial → "we don't have tech debt" (you do, you just haven't measured it) or "we'll rewrite it later" (you won't); tech debt is like credit card debt — ignoring it doesn't make it go away, it makes it worse
- Architecture by accident → making architecture decisions implicitly through code reviews and PR comments instead of explicit ADRs; if you can't point to the decision record, the decision wasn't made — it happened to you

## Related

- Same class: [dashboard-dependency-management](../../engineer/quality-security/dashboard-dependency-management.md) — dependency management
- Same class: [dashboard-product-strategy](../../product-manager/strategy/dashboard-product-strategy.md) — product strategy
- Same class: [dashboard-innovation-portfolio](../../product-manager/strategy/dashboard-innovation-portfolio.md) — innovation portfolio
- Same class: [dashboard-okr-health](../../executive/strategy/dashboard-okr-health.md) — OKR health
- Same class: [apply-domain-driven-design](../../engineer/architecture-design/apply-domain-driven-design.md) — DDD application
- References: ThoughtWorks — *Technology Radar*; Neal Ford, Rebecca Parsons, Patrick Kua — *Building Evolutionary Architectures*; Martin Fowler — *Technical Debt Quadrant*; Simon Wardley — *Wardley Mapping*; Geoffrey Moore — *Zone to Win*; McKinsey — *The Developer Coefficient*; Gartner — *Technology Adoption Roadmap*; Stripe — *The Developer Coefficient*