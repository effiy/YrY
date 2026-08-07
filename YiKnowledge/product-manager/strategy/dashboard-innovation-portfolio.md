---
title: innovation portfolio dashboard
aliases:
- R&D portfolio dashboard
- innovation pipeline dashboard
- technology exploration dashboard
- hackathon outcomes dashboard
tags:
- dashboard
- innovation
- research
- hackathon
- patent
- exploration
- incubation
category: product-manager/strategy
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: dashboard
status: stable
lifecycle: active
review_cycle: quarterly
roles:
- product-manager
- executive
- tech-lead
benefit: innovation portfolio and R&D investment visible at a glance
acceptance_criteria:
  - "data source and refresh cadence are documented"
  - "key metrics are defined with thresholds or targets"
  - "visualization choices are explained and accessible"
related:
- ./dashboard-product-strategy.md
- ../../executive/strategy/dashboard-executive-kpi.md
- ../../executive/roadmap/dashboard-strategic-roadmap.md
- ../../ai-engineer/foundations/dashboard-ai-maturity.md
tacit: false
---

# innovation portfolio dashboard

> **As a** product manager, **I want to** track the innovation portfolio and R&D investment, **so that** innovation is systematic, measured, and translates into business impact.

> Innovation is not random creativity — it's a portfolio of bets that needs management, measurement, and discipline. This dashboard tracks the innovation pipeline, R&D investment, hackathon outcomes, IP portfolio, and technology exploration.

## Summary

- 5 innovation dimensions: innovation pipeline, R&D investment, hackathon & ideation, IP portfolio, technology exploration
- Innovation pipeline tracked from idea → exploration → prototype → incubation → integration → launched
- R&D investment measured by dedicated innovation time, exploration budget, and ROI of past innovation bets
- Hackathons tracked by participation, projects shipped, and ideas that graduated to the product roadmap
- Dashboard reviewed quarterly; innovation portfolio review biannually

## Core viewpoints

- Innovation is a portfolio, not a project — manage innovation bets like a VC portfolio: many small bets, a few medium bets, fewer large bets
- The best ideas come from anywhere — hackathons, customer conversations, competitive analysis, and developer frustration are all innovation sources
- Exploration is not failure — an idea that's explored and killed before heavy investment is a success; the failure is investing without exploring
- Innovation needs a path to production — without a clear pipeline from prototype to product, innovation stays in the lab

## Key information

### 5-panel innovation overview

```
┌──────────────────────────────────────────────────────────────────┐
│  INNOVATION PIPELINE             │  R&D INVESTMENT                  │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Ideas:       45 active │   │  │  R&D budget:  $0.5M/yr  │   │
│  │  Exploring:   12 ideas  │   │  │  Innovation time: 10%    │   │
│  │  Prototyping:  6 ideas  │   │  │  Exploration:  $180K     │   │
│  │  Incubating:   3 ideas  │   │  │  Prototyping:   $150K    │   │
│  │  Integrating:  2 ideas  │   │  │  Incubation:    $120K    │   │
│  │  Launched:     4 this Yr│   │  │  Integration:    $50K    │   │
│  │  Killed:       8 this Yr│   │  │  ROI (trailing): 2.8x   │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────────┤
│  HACKATHON & IDEATION            │  IP PORTFOLIO                    │
│  ┌─────────────────────────┐   │  ┌─────────────────────────┐   │
│  │  Hackathons:   2/yr     │   │  │  Patents:      3 filed   │   │
│  │  Participants: 85%      │   │  │  Pending:      2         │   │
│  │  Projects:    28/hack   │   │  │  Granted:      1         │   │
│  │  Shipped:      8 (29%)  │   │  │  Trade secrets: 12      │   │
│  │  → Roadmap:    4 (14%)  │   │  │  Defensive pub:  5      │   │
│  │  Idea box:    85 subm.  │   │  │  Open source:   22 repos│   │
│  │  Upvoted:     320 votes │   │  │  IP reviewed:   85%     │   │
│  └─────────────────────────┘   │  └─────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Innovation pipeline stages

| Stage | Description | Count | Avg duration | Entry criteria | Exit criteria |
|---|---|---|---|---|---|
| **Idea** | Submitted concept, awaiting evaluation | 45 | 0-30 days | Problem statement + hypothesis | Evaluation score > 3/5 |
| **Exploring** | Active research, customer validation, feasibility | 12 | 2-4 weeks | Validated problem, initial feasibility | Go/kill decision with prototype plan |
| **Prototyping** | Working prototype, technical validation | 6 | 4-8 weeks | Technical feasibility confirmed | Demo to stakeholders, user feedback |
| **Incubating** | Dedicated team, customer pilot, MVP development | 3 | 2-4 months | Positive user feedback, business case | Product-market fit signal |
| **Integrating** | Merging into core product, GA preparation | 2 | 1-3 months | Integration plan approved, resourced | GA launch |
| **Launched** | Generally available, in market | 4 (YTD) | — | Launch criteria met | Success metrics tracked |
| **Killed** | Discontinued at any stage | 8 (YTD) | — | Kill criteria met | Learnings documented |

### Active innovation bets

| Innovation | Stage | Sponsor | Investment | Hypothesis | Progress | Next milestone |
|---|---|---|---|---|---|---|
| AI Code Review v2 | Incubating | CTO | $45K | Inline AI review increases PR quality 30% | 60% | Beta with 5 teams, Sep 15 |
| Multi-modal Chat (images) | Prototyping | AI Lead | $28K | Image understanding expands chat use cases 3x | 40% | Working prototype, Aug 30 |
| Voice-to-Code | Exploring | Web Lead | $12K | Voice input for code review comments | 25% | User research complete, Sep 15 |
| Autonomous Agent Framework | Incubating | AI Lead | $55K | Multi-step autonomous agents for complex tasks | 45% | Agent loop detection, Sep 30 |
| Knowledge Graph RAG | Prototyping | Platform | $22K | Graph-based retrieval improves answer quality 25% | 35% | GraphRAG prototype, Sep 15 |
| Real-time Collaboration | Exploring | Web Lead | $8K | Multi-user real-time editing of knowledge docs | 20% | Feasibility study, Sep 30 |
| AI-Powered Search | Incubating | Platform | $38K | Semantic search reduces time-to-find 50% | 55% | Beta launch, Oct 15 |
| Mobile-First Redesign | Integrating | Mobile | $30K | Mobile-first UX increases mobile engagement 40% | 75% | GA, Oct 30 |
| Developer API Gateway v2 | Integrating | Platform | $42K | Self-service API gateway for external developers | 80% | GA, Sep 30 |
| AI-Generated Documentation | Prototyping | Knowledge | $12K | AI generates docs from code, 80% accuracy | 30% | Prototype demo, Sep 15 |

### Innovation bet portfolio by horizon

| Horizon | Description | Active bets | Investment | Risk profile | Expected return |
|---|---|---|---|---|---|
| **H1 (12-18 months)** | Near-term, incremental innovation | 5 | $180K | Low-Medium | 3-5x ROI |
| **H2 (18-36 months)** | Adjacent, new capabilities | 4 | $155K | Medium | 5-10x ROI |
| **H3 (36+ months)** | Transformational, moonshots | 3 | $165K | High | 10x+ ROI or zero |
| **Total** | | **12 active** | **$500K** | | |

### Innovation stage conversion funnel

| Stage transition | Conversion rate | Target | Industry benchmark | Bottleneck |
|---|---|---|---|---|
| Idea → Exploring | 27% (12/45) | > 25% | 20-30% | Evaluation capacity |
| Exploring → Prototyping | 50% (6/12) | > 50% | 40-60% | Engineering bandwidth |
| Prototyping → Incubating | 50% (3/6) | > 40% | 30-50% | Business case quality |
| Incubating → Integrating | 67% (2/3) | > 60% | 50-70% | Integration complexity |
| Integrating → Launched | 80% (4/5 YTD) | > 80% | 70-85% | Launch readiness |
| **Idea → Launched (end-to-end)** | **9%** | **> 10%** | **8-12%** | |

### Killed innovations — lessons learned

| Innovation | Stage killed | Investment | Reason killed | Key learning | Knowledge reused in |
|---|---|---|---|---|---|
| Blockchain for Audit Logs | Exploring | $8K | No customer demand, high complexity | Blockchain is not the answer for centralized trust | — |
| AI-Powered Code Generation | Prototyping | $22K | Quality below threshold, IP concerns | Code generation needs human review; focused on code review instead | AI Code Review v2 |
| VR Design Review | Exploring | $5K | Hardware adoption too low, premature | Wait for Apple Vision Pro ecosystem maturity | — |
| P2P Knowledge Sharing | Exploring | $6K | Network effects chicken-and-egg problem | B2B P2P needs a different GTM approach | — |
| AI Meeting Summarizer | Prototyping | $15K | Accuracy insufficient for enterprise use | Speaker diarization + domain jargon = hard problem | AI-Generated Docs |
| Custom ML Model Training | Prototyping | $18K | LLM APIs outperformed custom models | For most use cases, fine-tuned API > custom model | AI Chat, Code Review |
| Social Code Review | Exploring | $4K | Code review is inherently private, not social | Social features don't fit every workflow | — |
| IoT Device Management | Exploring | $7K | Outside our core competency | Stay focused on software tools | — |

### Hackathon outcomes

| Hackathon | Date | Participants | Projects | Demoed | Shipped | → Roadmap | Star project |
|---|---|---|---|---|---|---|---|
| Summer 2026 | Jul 15-16 | 31 (86%) | 28 | 24 | 5 (so far) | 3 | AI Chat Widget (shipped) |
| Winter 2025 | Jan 20-21 | 28 (82%) | 24 | 22 | 8 (33%) | 4 | Semantic Search v2 (in product) |
| Summer 2025 | Jul 10-11 | 25 (78%) | 22 | 20 | 7 (32%) | 3 | Code Review Inline Comments |
| Winter 2024 | Jan 15-16 | 22 (73%) | 18 | 16 | 6 (33%) | 2 | Knowledge Base Tree View |
| **Overall** | | **85% avg** | **23 avg** | | | **12 (13%)** | |

### Idea box statistics

| Metric | Current quarter | Previous quarter | Trend |
|---|---|---|---|
| Ideas submitted | 22 | 18 | ↑ |
| Votes cast | 85 | 72 | ↑ |
| Comments | 48 | 38 | ↑ |
| Top-voted idea | "AI-powered search with source attribution" (28 votes) | "Dark mode for all products" (22 votes) | |
| Ideas promoted to exploration | 3 | 2 | ↑ |
| Avg time from submission to review | 12 days | 15 days | ↓ |
| Submission by team: AI/ML | 8 (36%) | 6 (33%) | |
| Submission by team: Web | 5 (23%) | 4 (22%) | |
| Submission by team: Platform | 4 (18%) | 3 (17%) | |
| Submission by team: Other | 5 (23%) | 5 (28%) | |

### IP portfolio

| IP type | Filed | Pending | Granted | Commercialized | Revenue impact |
|---|---|---|---|---|---|
| **Patents** | 3 | 2 | 1 | 1 | $0 (defensive) |
| — AI Model Routing (patent) | 2026-03 | Yes | — | — | N/A |
| — Semantic Code Search (patent) | 2025-11 | Yes | — | — | N/A |
| — Context-Aware Prompt Assembly (patent) | 2025-06 | No | 2026-06 | Yes | Defensive |
| **Trade secrets** | 12 documented | N/A | N/A | 8 | Core IP |
| — Model evaluation methodology | ✓ | | | ✓ | Competitive advantage |
| — Prompt engineering framework | ✓ | | | ✓ | Competitive advantage |
| — RAG optimization techniques | ✓ | | | ✓ | Product quality |
| **Defensive publications** | 5 | N/A | N/A | N/A | Prevents competitor patents |
| **Open source** | 22 repos | N/A | N/A | 22 | Community engagement |
| — API client SDKs | ✓ | | | ✓ | Developer adoption |

### Technology exploration radar

| Technology | Stage | Relevance | Potential impact | Exploration started | Decision |
|---|---|---|---|---|---|
| **WebAssembly (WASM)** | Exploring | Medium | Client-side AI inference | 2026-06 | Evaluate for mobile AI |
| **GraphQL Federation** | Prototyping | High | API composition for microservices | 2026-04 | Likely adopt for v2 API |
| **Rust (performance-critical)** | Exploring | Medium | Replace Python in hot paths | 2026-07 | Monitor ecosystem |
| **WebGPU** | Exploring | Low | Browser-based ML training | 2026-05 | Premature, revisit 2027 |
| **eBPF (observability)** | Exploring | Medium | Kernel-level observability | 2026-06 | Evaluate for SRE team |
| **DuckDB (embedded analytics)** | Prototyping | High | In-process analytics, no ETL | 2026-03 | Likely adopt for analytics |
| **SolidJS (frontend)** | Exploring | Low | Alternative to React | 2026-07 | Monitor, not switching |
| **Zig (build tooling)** | Exploring | Low | Faster C/C++ compilation | 2026-06 | Premature |

### Innovation culture metrics

| Metric | Current | Target | Assessment |
|---|---|---|---|
| % of engineers who submitted an idea (last 6 months) | 42% | > 60% | Needs improvement |
| % of engineers who participated in hackathon | 85% | > 80% | Good |
| Innovation time actually used (% of 10% allocation) | 62% | > 80% | Needs improvement |
| Cross-team innovation projects | 8 | > 12 | Needs improvement |
| External inspiration (conferences, papers, talks) | 18/year | > 24 | Needs improvement |
| Innovation awards/recognition | 4/year | > 6 | Needs improvement |
| Failed innovation celebrated (learning shared) | 2/year | > 6 | Needs improvement |
| **Overall innovation culture score** | **62/100** | **> 75** | |

## Action recommendations

1. **Increase idea-to-exploration conversion**: 27% conversion, 12-day review time; add dedicated innovation reviewer, reduce review time to 5 days
2. **Protect innovation time**: 62% utilization of 10% allocation; create innovation time guidelines, reduce BAU encroachment
3. **Celebrate failure**: 2 failed innovations shared/year; create "failure forum" quarterly, document learnings from every killed project
4. **Improve idea submission diversity**: 59% of ideas from AI/ML + Web teams; run idea workshops for Platform, Mobile, Data teams
5. **Hackathon → roadmap pipeline**: 14% conversion; create hackathon-to-roadmap review board, fast-track top projects
6. **IP review process**: 85% IP reviewed; implement pre-release IP review, identify patentable innovations earlier
7. **Technology radar refresh**: update quarterly; formalize technology evaluation criteria, document decision rationale
8. **Innovation budget allocation**: $500K total; benchmark against industry (10-15% of R&D), adjust to 12% of engineering budget
9. **External inspiration**: 18 external inputs/year; sponsor conference attendance, create research paper reading group
10. **Biannual innovation review**: review portfolio, conversion rates, ROI, and culture metrics; adjust innovation strategy



- Innovation theater → hackathons, idea boxes, and innovation labs that produce slides but no shipped products; innovation is measured by what reaches customers
- Pet project protection → keeping ideas alive because an executive likes them, not because they have validated customer demand; kill criteria must be non-negotiable
- Innovation as 10% time → allocating 10% time but measuring and rewarding only 100% time work; innovation time must be protected and recognized
- Copy-paste innovation → "competitor X has feature Y, let's build it too"; innovation is differentiation, not imitation
- Moonshot obsession → only funding H3 transformational bets while neglecting H1 incremental innovation; a balanced portfolio needs all three horizons

## Related

- Same class: [dashboard-product-strategy](dashboard-product-strategy.md) — product strategy
- Same class: [dashboard-executive-kpi](../../executive/strategy/dashboard-executive-kpi.md) — executive KPIs
- Same class: [dashboard-strategic-roadmap](../../executive/roadmap/dashboard-strategic-roadmap.md) — strategic roadmap
- Same class: [dashboard-ai-maturity](../../ai-engineer/foundations/dashboard-ai-maturity.md) — AI maturity
- References: Clayton Christensen — *The Innovator's Dilemma*; Alexander Osterwalder — *Business Model Generation*; Google — *OKR and Innovation*; McKinsey — *Three Horizons of Growth*; IDEO — *Design Thinking*