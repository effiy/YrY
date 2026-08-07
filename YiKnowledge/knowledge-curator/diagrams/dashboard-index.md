---
title: dashboard index
aliases:
- dashboards index
- 大盘索引
- 大盘页面
tags:
- dashboard
- index
- navigation
- overview
category: knowledge-curator/diagrams
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: index
status: stable
lifecycle: active
review_cycle: monthly
roles:
- knowledge-curator
- tech-lead
- executive
- engineer
benefit: all dashboard pages discoverable from a single index
acceptance_criteria:
  - "all entries in the index map to existing files"
  - "entries are grouped by logical category or domain"
  - "one-liner descriptions are specific enough to disambiguate"
related:
- ../../INDEX.md
- ../governance/governance.md
- ../governance/dashboard-knowledge-health.md
tacit: false
---

# dashboard index (大盘页面索引)

> **As a** knowledge curator, **I want to** maintain a single index of all dashboard pages, **so that** any role can find the right dashboard within 1 hop.

> This index maps all 117 dashboard pages across the YiKnowledge library. Each dashboard provides a single-pane view of a specific domain with defined metrics, thresholds, and action recommendations.

## Dashboard map (117 dashboards)

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXECUTIVE & STRATEGY (11)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Executive    │ │ Competitive  │ │ Strategic Roadmap        │ │
│  │ KPI          │ │ Intelligence │ │ Initiative execution,    │ │
│  │ Business     │ │ Market,      │ │ alignment, resource     │ │
│  │ health, OKRs │ │ feature parity│ │ allocation, kill criteria│ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Knowledge    │ │ People &     │ │ Sustainability           │ │
│  │ Health       │ │ Expertise    │ │ Carbon footprint, energy │ │
│  │ Coverage,    │ │ Distribution,│ │ efficiency, green arch,  │ │
│  │ freshness    │ │ SPOF, network│ │ resource optimization    │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ OKR Health — OKR adoption, alignment, progress velocity,     ││
│  │ achievement rate, cascade quality, anti-pattern detection    ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Market Growth & Expansion — Market share, TAM/SAM/SOM,       ││
│  │ revenue growth, geographic expansion, CAC, LTV/CAC, NRR     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Sales & GTM Motion — Pipeline health, win rate, sales cycle, ││
│  │ quota attainment, sales efficiency, channel performance      ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Marketing Performance — Demand gen, campaign ROI, content    ││
│  │ marketing, brand health, marketing ops, efficiency           ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Finance & FP&A — Revenue, burn rate, runway, gross margin,   ││
│  │ unit economics, budget variance, cash management             ││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     PRODUCT (14)                                 │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Product      │ │ Product      │ │ Product Delivery         │ │
│  │ Portfolio    │ │ Strategy     │ │ Feature flow, sprint,    │ │
│  │ North star,  │ │ 3 horizons,  │ │ stakeholder, scope       │ │
│  │ retention    │ │ lifecycle    │ │ management               │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ PM           │ │ API          │ │ Innovation Portfolio     │ │
│  │ Frameworks   │ │ Portfolio    │ │ Pipeline, R&D investment,│ │
│  │ JTBD, RICE,  │ │ Lifecycle,   │ │ hackathons, IP, tech    │ │
│  │ OKR adoption │ │ versioning   │ │ exploration radar       │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Feature Adoption — Adoption funnel, time-to-adopt, feature   ││
│  │ retention, PIR (per-investment return), sunset readiness     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Pricing & Packaging — Plan mix, conversion funnel, discount  ││
│  │ effectiveness, WTP, expansion revenue, churn by plan        ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Customer Journey — Journey stages, lifecycle progression,    ││
│  │ stage conversion, time-in-stage, friction, activation health ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ User Engagement & Retention — DAU/MAU, cohort retention,     ││
│  │ churn dynamics, stickiness, activation, resurrection rate    ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Customer Feedback & Satisfaction — NPS/CSAT/CES, feedback    ││
│  │ channels, sentiment analysis, feedback-to-feature, effort    ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Product Discovery & Validation — Discovery pipeline, idea    ││
│  │ validation, assumption testing, prototype velocity, culture  ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Customer Success Health — Health scoring, adoption depth,    ││
│  │ NRR/churn, CSM effectiveness, support health, expansion      ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Billing & Payments — Payment success, billing accuracy,      ││
│  │ revenue leakage, dunning, payment methods, fraud detection   ││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     UX & DESIGN (7)                              │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ UX Health — Usability SUS, WCAG 2.2 AA, design system, UX   ││
│  │ perf, user research pipeline                                ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ User Research Ops — Research pipeline, participant panel,    ││
│  │ insight velocity, research impact, repository health        ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Design System Health — Component adoption, token compliance, ││
│  │ accessibility coverage, versioning, contribution health     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Information Architecture — Navigation efficiency, search     ││
│  │ effectiveness, content structure, findability, taxonomy      ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Content Design & UX Writing — Voice/tone, readability,       ││
│  │ localization, microcopy effectiveness, content accessibility ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Accessibility Compliance — WCAG 2.2 AA/AAA, screen reader,   ││
│  │ keyboard nav, color contrast, AT support, legal risk         ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Usability Testing & Research — Test frequency, task          ││
│  │ completion, SUS scores, heuristic evaluation, insight velocity││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     ENGINEERING DELIVERY (21)                    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ DORA Metrics │ │ Quality      │ │ Team Velocity            │ │
│  │ Delivery     │ │ Metrics      │ │ Sprint, predictability,  │ │
│  │ performance  │ │ Coverage,    │ │ collaboration, reviews   │ │
│  │ 4 key metrics│ │ bugs, health │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Architecture │ │ Developer    │ │ Database                 │ │
│  │ Health       │ │ Experience   │ │ Performance              │ │
│  │ Coupling,    │ │ Build, CI,   │ │ Query perf, replication, │ │
│  │ debt, ADR    │ │ DX survey    │ │ backups, pools          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Project      │ │ Lessons      │ │ Experimentation          │ │
│  │ Health       │ │ Learned      │ │ A/B tests, feature flags,│ │
│  │ Cross-project│ │ Wins/failures│ │ statistical rigor, win   │ │
│  │ consistency  │ │ gotchas      │ │ rate, flag hygiene      │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Developer Productivity — SPACE framework, flow state, deep   ││
│  │ work, interruptions, context switch cost, productivity       ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Test Automation — Test pyramid, flaky tests, execution speed, ││
│  │ coverage effectiveness, test debt, quarantine pipeline       ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Deployment Safety — Canary analysis, progressive delivery,   ││
│  │ rollback readiness, risk scoring, change management          ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Code Review Health — Review turnaround, depth, reviewer load, ││
│  │ review quality, PR size distribution, defect escape analysis││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Team Health & Engagement — Engagement, psychological safety, ││
│  │ burnout risk, meeting health, belonging, team cohesion       ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ CI/CD Pipeline Health — Build performance, pipeline success, ││
│  │ artifact management, environment health, test integration    ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Code Quality — Cyclomatic complexity, duplication, test      ││
│  │ coverage, security hotspots, code smells, reliability rating ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ API Design Quality — Design consistency, breaking changes,   ││
│  │ versioning, documentation, performance, security posture     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Infrastructure as Code — IaC coverage, drift detection,      ││
│  │ module quality, provisioning health, state mgmt, GitOps      ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Documentation Health — Coverage, quality, freshness,         ││
│  │ discoverability, API docs, contribution health, docs-as-code ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Frontend & Mobile Performance — Core Web Vitals, bundle      ││
│  │ health, rendering, mobile perf, resource efficiency, culture ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Open Source & Community — Project health, contributors,      ││
│  │ issue/PR metrics, maintainer health, OSS impact, compliance  ││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     AI & DATA (15)                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ AI           │ │ AI           │ │ AI Maturity              │ │
│  │ Performance  │ │ Methodology  │ │ L1-L5 model, tech radar, │ │
│  │ LLM quality, │ │ Prompt eng,   │ │ adoption, 6 dimensions  │ │
│  │ cost, evals  │ │ eval, RAG     │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Data Pipeline│ │ Data         │ │ ML Operations            │ │
│  │ Pipeline     │ │ Governance   │ │ Model registry, training,│ │
│  │ health, data │ │ Catalog, PII, │ │ deployment, drift       │ │
│  │ quality      │ │ lineage, GDPR│ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ LLM Cost & Efficiency — Token economics, provider mix, cost  ││
│  │ per use case, caching efficiency, optimization levers        ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ AI Safety & Guardrails — Guardrail effectiveness, safety     ││
│  │ incidents, bias & fairness, red-teaming, content filtering   ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Model Explainability — SHAP/LIME coverage, fairness audits,  ││
│  │ transparency docs, regulatory compliance, decision trace     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ RAG Quality — Retrieval precision/recall, chunk quality,     ││
│  │ embedding drift, context relevance, generation faithfulness  ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Data Quality — 6 dimensions: completeness, accuracy,         ││
│  │ consistency, timeliness, uniqueness, validity across datasets││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Vector Database Health — Index performance, query latency,   ││
│  │ recall quality, embedding health, storage efficiency, scaling││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ AI Agent Observability — Agent success rate, tool call       ││
│  │ reliability, orchestration health, latency, cost, safety     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Feature Store Health — Feature registry, freshness, training-││
│  │ serving skew, feature quality, storage, serving performance  ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Model Training & Experiments — Experiment tracking, training ││
│  │ pipeline, GPU utilization, model registry, HPO, reproducibility││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     SRE & OPERATIONS (19)                        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ System       │ │ Incident     │ │ Release                  │ │
│  │ Health       │ │ Trends       │ │ Management               │ │
│  │ SLO, golden  │ │ MTTA/MTTR,   │ │ Cadence, canary,         │ │
│  │ signals      │ │ root cause   │ │ rollback, hotfix         │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Cost &       │ │ Oncall       │ │ Business Continuity      │ │
│  │ Resource     │ │ Health       │ │ RPO/RTO, backup, DR test,│ │
│  │ Cloud FinOps │ │ Alert fatigue│ │ failover, BC plan        │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Capacity Planning — Demand forecasting, resource headroom,   ││
│  │ scaling triggers, cost efficiency, capacity governance       ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Observability Coverage — Logging, metrics, tracing, alerting ││
│  │ coverage, dashboard completeness, observability maturity     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Chaos Engineering — Experiment coverage, failure injection,  ││
│  │ resilience scoring, game days, blast radius control         ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Certificate & Secret Mgmt — TLS expiry, secret rotation,     ││
│  │ key management, credential scanning, PKI health             ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Postmortem Quality — Completion SLA, action item closure,    ││
│  │ severity classification, learning loop, recurrence prevention││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Network Health — Latency, bandwidth, DNS, CDN performance,   ││
│  │ connectivity, topology health, circuit breaker state         ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Incident Command — Command structure, response time,         ││
│  │ communication, escalation, coordination, war room health     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Alert Tuning & Noise Reduction — Alert volume, signal-to-    ││
│  │ noise, false positives, correlation, routing, fatigue impact ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Log Management — Log volume, retention, indexing, structured ││
│  │ logging, log quality, PII safety, cost efficiency           ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Service Mesh Health — Sidecar health, mTLS coverage, traffic ││
│  │ policy, mesh performance, fault injection, topology health   ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ SLO Error Budget — SLO compliance, error budget burn rate,   ││
│  │ SLI quality, dependent service reliability, SLO governance   ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Traffic Management — Load balancer health, CDN performance,  ││
│  │ traffic routing, rate limiting, ingress, global distribution ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Backup & Recovery — Backup success, recovery testing, data   ││
│  │ integrity, retention compliance, backup performance, RPO/RTO ││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     TECH LEAD (11)                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Engineering  │ │ Risk         │ │ Roadmap Progress         │ │
│  │ Capacity     │ │ Management   │ │ Earned value SPI/CPI,    │ │
│  │ Headcount,   │ │ Risk register│ │ milestones, dependencies │ │
│  │ allocation   │ │ mitigation   │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Architecture │ │ Architecture │ │ Talent Retention         │ │
│  │ Decisions    │ │ Review       │ │ Hiring, attrition,       │ │
│  │ ADR stats,   │ │ Findings,    │ │ eNPS, career growth,     │ │
│  │ tech radar   │ │ ARB health   │ │ flight risk             │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Technical Debt — Debt inventory, interest cost, remediation  ││
│  │ velocity, architectural debt, governance, reduction plan     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Technical Strategy — Build vs buy, technology radar,         ││
│  │ innovation portfolio, architecture strategy, roadmap alignment││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Team Topology & Org Design — Team structure, cognitive load, ││
│  │ interaction modes, Conway alignment, autonomy, org evolution ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Stakeholder Communication — Satisfaction, decision velocity, ││
│  │ alignment health, comm effectiveness, escalation, meetings   ││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     PEOPLE & SKILLS (7)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Onboarding   │ │ Skill        │ │ People & Expertise       │ │
│  │ Progress     │ │ Ecosystem    │ │ (see Executive section)  │ │
│  │ 4 phases,    │ │ Skill quality│ │                          │ │
│  │ 30/60/90     │ │ adoption     │ │                          │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
│  ┌──────────────┐ ┌──────────────────────────────────────────────┐│
│  │ Learning &   │ │ Career Development — Career ladder,          ││
│  │ Development  │ │ promotion velocity, mentorship, internal     ││
│  │ Training,    │ │ mobility, skill progression, growth equity   ││
│  │ certs        │ └──────────────────────────────────────────────┘│
│  └──────────────┘                                               │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Hiring & Recruitment — Pipeline health, time-to-hire,        ││
│  │ interview quality, offer acceptance, source, candidate exp   ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Diversity, Equity & Inclusion — Representation, pay equity,  ││
│  │ hiring diversity, inclusion survey, retention equity, ERGs   ││
│  └──────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                     SECURITY (10)                                │
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Security Posture — CVEs, compliance SOC2/ISO27001/GDPR/CIS, ││
│  │ threat detection, SBOM, dependency health                   ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Compliance Readiness — Control effectiveness, audit         ││
│  │ readiness, evidence collection, policy attestation, GRC     ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Vulnerability Management — CVE lifecycle, SLA compliance,    ││
│  │ exploitability scoring, remediation velocity, dependency risk││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Identity & Access Mgmt — User lifecycle, role health, access ││
│  │ reviews, MFA coverage, privilege creep, service account health││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Data Protection & Privacy — DPIA, DSR, encryption posture,  ││
│  │ data retention, privacy-by-design, cross-border governance  ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ API Security — API inventory, authn/z, rate limiting, WAF,  ││
│  │ token security, OWASP API Top 10 compliance, security testing││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Dependency Management — Version health, license compliance,  ││
│  │ vulnerability exposure, transitive risk, SBOM, update cadence││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Threat Detection & Response — MITRE ATT&CK coverage, alert   ││
│  │ fidelity, investigation velocity, MTTC, threat hunting, SOC  ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Cloud Security Posture — Cloud asset inventory, misconfig,   ││
│  │ IAM hygiene, network exposure, data protection, compliance   ││
│  └──────────────────────────────────────────────────────────────┘│
│  ┌──────────────────────────────────────────────────────────────┐│
│  │ Security Awareness & Training — Phishing simulation, training││
│  │ completion, security culture, champions, human risk scoring  ││
│  └──────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Dashboard directory (97 dashboards)

### Executive & Strategy (11)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 1 | Executive KPI | [executive/strategy/dashboard-executive-kpi.md](../../executive/strategy/dashboard-executive-kpi.md) | Executive | MRR, ARR, NPS, runway, headcount, OKR progress |
| 2 | Competitive Intelligence | [executive/industry/dashboard-competitive-intelligence.md](../../executive/industry/dashboard-competitive-intelligence.md) | Executive, PM | Competitor profiles, feature parity, market share, win/loss |
| 3 | Strategic Roadmap | [executive/roadmap/dashboard-strategic-roadmap.md](../../executive/roadmap/dashboard-strategic-roadmap.md) | Executive | Initiative execution, org alignment, resource allocation, kill criteria |
| 4 | Sustainability | [executive/strategy/dashboard-sustainability.md](../../executive/strategy/dashboard-sustainability.md) | Executive, TL, SRE | Carbon footprint, energy efficiency, resource waste, green architecture |
| 5 | Knowledge Health | [knowledge-curator/governance/dashboard-knowledge-health.md](../../knowledge-curator/governance/dashboard-knowledge-health.md) | Curator | Coverage, freshness, quality, tacitness, retrieval |
| 6 | People & Expertise | [knowledge-curator/people/dashboard-people-expertise.md](../../knowledge-curator/people/dashboard-people-expertise.md) | Executive, TL | Expertise distribution, skill coverage, SPOF, knowledge network |
| 7 | OKR Health | [executive/strategy/dashboard-okr-health.md](../../executive/strategy/dashboard-okr-health.md) | Executive, TL, PM | OKR adoption, alignment, progress velocity, achievement rate, cascade quality |
| 8 | Market Growth & Expansion | [executive/strategy/dashboard-market-growth.md](../../executive/strategy/dashboard-market-growth.md) | Executive, PM, TL | Market share, TAM/SAM/SOM, revenue growth, geographic expansion, CAC, LTV/CAC, NRR |
| 9 | Sales & GTM Motion | [executive/strategy/dashboard-sales-gtm-motion.md](../../executive/strategy/dashboard-sales-gtm-motion.md) | Executive, PM, TL | Pipeline health, win rate, sales cycle, quota attainment, sales efficiency, channel performance |
| 10 | Marketing Performance | [executive/strategy/dashboard-marketing-performance.md](../../executive/strategy/dashboard-marketing-performance.md) | Executive, PM, TL | Demand generation, campaign ROI, content marketing, brand health, marketing ops, marketing efficiency |
| 11 | Finance & FP&A Health | [executive/strategy/dashboard-finance-fp-and-a.md](../../executive/strategy/dashboard-finance-fp-and-a.md) | Executive, TL | Revenue, burn rate, runway, gross margin, unit economics, budget variance, cash management |

### Product (14)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 12 | Product Portfolio | [product-manager/discovery/metrics/dashboard-product-portfolio.md](../../product-manager/discovery/metrics/dashboard-product-portfolio.md) | Product Manager | North star, feature adoption, retention, funnel, NPS |
| 13 | Product Strategy | [product-manager/strategy/dashboard-product-strategy.md](../../product-manager/strategy/dashboard-product-strategy.md) | PM, Executive | 3 horizons, lifecycle, innovation pipeline, strategic bets |
| 14 | Product Delivery | [product-manager/delivery/dashboard-product-delivery.md](../../product-manager/delivery/dashboard-product-delivery.md) | PM, Tech Lead | Feature flow, sprint execution, stakeholder, scope creep |
| 15 | PM Frameworks | [product-manager/frameworks/dashboard-pm-frameworks.md](../../product-manager/frameworks/dashboard-pm-frameworks.md) | PM | JTBD, RICE, Kano, OKR adoption, effectiveness, maturity |
| 16 | API Portfolio | [product-manager/discovery/prd/dashboard-api-portfolio.md](../../product-manager/discovery/prd/dashboard-api-portfolio.md) | PM, Engineer | API lifecycle, versioning, quality, adoption, deprecation |
| 17 | Innovation Portfolio | [product-manager/strategy/dashboard-innovation-portfolio.md](../../product-manager/strategy/dashboard-innovation-portfolio.md) | PM, Executive, TL | Pipeline, R&D investment, hackathons, IP portfolio, tech radar |
| 18 | Customer Health | [product-manager/discovery/metrics/dashboard-customer-health.md](../../product-manager/discovery/metrics/dashboard-customer-health.md) | PM, Executive | Customer health score, tickets, adoption, NPS, churn risk |
| 19 | Feature Adoption | [product-manager/discovery/metrics/dashboard-feature-adoption.md](../../product-manager/discovery/metrics/dashboard-feature-adoption.md) | PM, Executive, TL | Adoption funnel, time-to-adopt, feature retention, PIR, sunset readiness |
| 20 | Pricing & Packaging | [product-manager/strategy/dashboard-pricing-packaging.md](../../product-manager/strategy/dashboard-pricing-packaging.md) | PM, Executive | Plan mix, conversion funnel, discount effectiveness, WTP, expansion revenue, churn by plan |
| 21 | Customer Journey | [product-manager/discovery/metrics/dashboard-customer-journey.md](../../product-manager/discovery/metrics/dashboard-customer-journey.md) | PM, Executive, Engineer | Journey stages, lifecycle progression, stage conversion, time-in-stage, friction, activation |
| 22 | User Engagement & Retention | [product-manager/discovery/metrics/dashboard-user-engagement-retention.md](../../product-manager/discovery/metrics/dashboard-user-engagement-retention.md) | PM, Executive, Engineer | DAU/MAU, cohort retention, churn dynamics, stickiness, activation, resurrection |
| 23 | Customer Feedback & Satisfaction | [product-manager/discovery/metrics/dashboard-customer-feedback-satisfaction.md](../../product-manager/discovery/metrics/dashboard-customer-feedback-satisfaction.md) | PM, Executive, Engineer, TL | NPS, CSAT, CES, feedback channels, sentiment analysis, feedback-to-feature, customer effort |
| 24 | Product Discovery & Validation | [product-manager/discovery/dashboard-product-discovery-validation.md](../../product-manager/discovery/dashboard-product-discovery-validation.md) | PM, Executive, Engineer, TL | Discovery pipeline, idea validation, assumption testing, prototype velocity, discovery-to-delivery, discovery culture |
| 25 | Customer Success Health | [product-manager/discovery/metrics/dashboard-customer-success-health.md](../../product-manager/discovery/metrics/dashboard-customer-success-health.md) | PM, Executive, TL | Customer health scoring, adoption depth, NRR/churn, CSM effectiveness, support health, expansion pipeline |
| 26 | Billing & Payments | [product-manager/discovery/metrics/dashboard-billing-payments.md](../../product-manager/discovery/metrics/dashboard-billing-payments.md) | PM, Engineer, Executive, TL | Payment success, billing accuracy, revenue leakage, dunning, payment methods, fraud detection |

### UX & Design (7)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 27 | UX Health | [product-manager/discovery/ux/dashboard-ux-health.md](../../product-manager/discovery/ux/dashboard-ux-health.md) | PM, Engineer | Usability SUS, WCAG 2.2 AA, design system, UX performance |
| 28 | User Research Ops | [product-manager/discovery/dashboard-user-research.md](../../product-manager/discovery/dashboard-user-research.md) | PM, Executive | Research pipeline, participant panel, insight velocity, research impact |
| 29 | Design System Health | [product-manager/discovery/ux/dashboard-design-system.md](../../product-manager/discovery/ux/dashboard-design-system.md) | PM, Engineer, TL | Component adoption, token compliance, a11y coverage, versioning, contributions |
| 30 | Information Architecture | [product-manager/discovery/ux/dashboard-information-architecture.md](../../product-manager/discovery/ux/dashboard-information-architecture.md) | PM, Engineer | Navigation efficiency, search effectiveness, findability, taxonomy, ROT content |
| 31 | Content Design & UX Writing | [product-manager/discovery/ux/dashboard-content-design.md](../../product-manager/discovery/ux/dashboard-content-design.md) | PM, Engineer | Voice/tone, readability, localization, microcopy, content accessibility |
| 32 | Accessibility Compliance | [product-manager/discovery/ux/dashboard-accessibility-compliance.md](../../product-manager/discovery/ux/dashboard-accessibility-compliance.md) | PM, Engineer, TL, Exec | WCAG 2.2 AA/AAA, screen reader, keyboard nav, color contrast, AT support, legal risk |
| 33 | Usability Testing & Research | [product-manager/discovery/ux/dashboard-usability-testing.md](../../product-manager/discovery/ux/dashboard-usability-testing.md) | PM, Engineer, TL | Test frequency, task completion, SUS scores, heuristic evaluation, research quality, insight velocity |

### Engineering Delivery (21)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 34 | DORA Metrics | [engineer/infrastructure/dashboard-dora-metrics.md](../../engineer/infrastructure/dashboard-dora-metrics.md) | Engineer, Tech Lead | Deployment frequency, lead time, CFR, MTTR |
| 35 | Quality Metrics | [engineer/quality-security/dashboard-quality-metrics.md](../../engineer/quality-security/dashboard-quality-metrics.md) | Engineer | Coverage, bug trends, mutation score, code health |
| 36 | Test Automation | [engineer/quality-security/dashboard-test-automation.md](../../engineer/quality-security/dashboard-test-automation.md) | Engineer, TL | Test pyramid, flaky tests, execution speed, coverage effectiveness |
| 37 | Team Velocity | [engineer/process/dashboard-team-velocity.md](../../engineer/process/dashboard-team-velocity.md) | Engineer, Tech Lead | Sprint velocity, predictability, review health, SPACE |
| 38 | Architecture Health | [engineer/architecture-design/dashboard-architecture-health.md](../../engineer/architecture-design/dashboard-architecture-health.md) | Engineer, Tech Lead | Coupling, tech debt, ADR compliance, fitness functions |
| 39 | Developer Experience | [engineer/engineering/dashboard-developer-experience.md](../../engineer/engineering/dashboard-developer-experience.md) | Engineer | Build time, CI, local dev loop, DX survey |
| 40 | Developer Productivity | [engineer/engineering/dashboard-developer-productivity.md](../../engineer/engineering/dashboard-developer-productivity.md) | Engineer, TL, Exec | SPACE framework, flow state, deep work, interruptions, context switch |
| 41 | Database Performance | [engineer/infrastructure/dashboard-database-performance.md](../../engineer/infrastructure/dashboard-database-performance.md) | Engineer, SRE | Query perf, replication, backups, connection pools |
| 42 | Project Health | [engineer/projects/dashboard-project-health.md](../../engineer/projects/dashboard-project-health.md) | Tech Lead, Engineer | Cross-project health, consistency matrix, version skew |
| 43 | Lessons Learned | [engineer/lessons/dashboard-lessons-learned.md](../../engineer/lessons/dashboard-lessons-learned.md) | Engineer, Tech Lead | Wins/failures/gotchas, learning loop, recurrence, prevention |
| 44 | Experimentation | [engineer/process/dashboard-experimentation.md](../../engineer/process/dashboard-experimentation.md) | Engineer, PM | A/B tests, feature flags, statistical rigor, flag hygiene |
| 45 | Platform Engineering | [engineer/engineering/dashboard-platform-engineering.md](../../engineer/engineering/dashboard-platform-engineering.md) | Engineer, TL | IDP adoption, golden paths, self-service, platform NPS |
| 46 | Deployment Safety | [engineer/infrastructure/dashboard-deployment-safety.md](../../engineer/infrastructure/dashboard-deployment-safety.md) | Engineer, TL, SRE | Canary analysis, progressive delivery, rollback readiness, risk scoring |
| 47 | Code Review Health | [engineer/process/dashboard-code-review-health.md](../../engineer/process/dashboard-code-review-health.md) | Engineer, TL | Review turnaround, depth, reviewer load, quality, PR size, defect escape |
| 48 | Team Health & Engagement | [engineer/process/dashboard-team-health-engagement.md](../../engineer/process/dashboard-team-health-engagement.md) | TL, Engineer, Exec | Engagement, psychological safety, burnout risk, meeting health, belonging |
| 49 | CI/CD Pipeline Health | [engineer/infrastructure/dashboard-cicd-pipeline-health.md](../../engineer/infrastructure/dashboard-cicd-pipeline-health.md) | Engineer, TL, SRE | Build performance, pipeline success, artifact management, environment health, test integration |
| 50 | Code Quality | [engineer/quality-security/dashboard-code-quality.md](../../engineer/quality-security/dashboard-code-quality.md) | Engineer, TL, Security Engineer | Complexity, duplication, coverage, security hotspots, code smells, reliability rating |
| 51 | API Design Quality | [engineer/architecture-design/dashboard-api-design-quality.md](../../engineer/architecture-design/dashboard-api-design-quality.md) | Engineer, TL, PM | Design consistency, breaking changes, versioning, documentation, performance, security |
| 52 | Infrastructure as Code | [engineer/infrastructure/dashboard-infrastructure-as-code.md](../../engineer/infrastructure/dashboard-infrastructure-as-code.md) | Engineer, TL, SRE | IaC coverage, drift detection, module quality, provisioning, state mgmt, GitOps |
| 53 | Documentation Health | [engineer/engineering/dashboard-documentation-health.md](../../engineer/engineering/dashboard-documentation-health.md) | Engineer, TL, PM | Coverage, quality, freshness, discoverability, API docs, contribution health, docs-as-code |
| 54 | Frontend & Mobile Performance | [engineer/infrastructure/dashboard-frontend-mobile-performance.md](../../engineer/infrastructure/dashboard-frontend-mobile-performance.md) | Engineer, TL, PM | Core Web Vitals, bundle health, rendering, mobile perf, resource efficiency, performance culture |
| 55 | Open Source & Community | [engineer/engineering/dashboard-open-source-community.md](../../engineer/engineering/dashboard-open-source-community.md) | Engineer, TL, Executive | Project health, contributor community, issue/PR metrics, maintainer health, OSS impact, license compliance |

### AI & Data (15)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 56 | AI Performance | [ai-engineer/platform/dashboard-ai-performance.md](../../ai-engineer/platform/dashboard-ai-performance.md) | AI Engineer | Model quality, TTFT/TPOT, token cost, prompt drift |
| 57 | LLM Cost & Efficiency | [ai-engineer/platform/dashboard-llm-cost.md](../../ai-engineer/platform/dashboard-llm-cost.md) | AI Engineer, TL, Exec | Token economics, provider mix, cost per use case, caching, optimization |
| 58 | AI Methodology | [ai-engineer/methodology/dashboard-ai-methodology.md](../../ai-engineer/methodology/dashboard-ai-methodology.md) | AI Engineer | Prompt engineering, eval methodology, RAG, agent orchestration |
| 59 | AI Maturity | [ai-engineer/foundations/dashboard-ai-maturity.md](../../ai-engineer/foundations/dashboard-ai-maturity.md) | AI Engineer, TL | L1-L5 model, 6 dimensions, tech radar, adoption |
| 60 | AI Safety | [ai-engineer/foundations/dashboard-ai-safety.md](../../ai-engineer/foundations/dashboard-ai-safety.md) | AI Engineer, TL, Exec | Guardrail effectiveness, safety incidents, bias, red-teaming, content filtering |
| 61 | Model Explainability | [ai-engineer/foundations/dashboard-model-explainability.md](../../ai-engineer/foundations/dashboard-model-explainability.md) | AI Engineer, TL, Exec | SHAP/LIME coverage, fairness audits, transparency, regulatory compliance |
| 62 | RAG Quality | [ai-engineer/methodology/dashboard-rag-quality.md](../../ai-engineer/methodology/dashboard-rag-quality.md) | AI Engineer, TL | Retrieval precision/recall, chunk quality, embedding drift, hallucination rate |
| 63 | Data Pipeline | [ai-engineer/data/dashboard-data-pipeline.md](../../ai-engineer/data/dashboard-data-pipeline.md) | Data Engineer | Pipeline health, data quality, freshness SLA, lineage |
| 64 | Data Governance | [ai-engineer/data/dashboard-data-governance.md](../../ai-engineer/data/dashboard-data-governance.md) | Data Engineer, TL | Data catalog, classification, lineage, access control, retention |
| 65 | ML Operations | [engineer/engineering/dashboard-ml-operations.md](../../engineer/engineering/dashboard-ml-operations.md) | ML Engineer | Model registry, training, deployment, drift (PSI) |
| 66 | Data Quality | [ai-engineer/data/dashboard-data-quality.md](../../ai-engineer/data/dashboard-data-quality.md) | Data Engineer, AI Engineer, TL | 6 DQ dimensions: completeness, accuracy, consistency, timeliness, uniqueness, validity |
| 67 | Vector Database Health | [ai-engineer/platform/dashboard-vector-database-health.md](../../ai-engineer/platform/dashboard-vector-database-health.md) | AI Engineer, Data Engineer, TL | Index performance, query latency, recall quality, embedding health, storage efficiency, scaling |
| 68 | AI Agent Observability | [ai-engineer/platform/dashboard-ai-agent-observability.md](../../ai-engineer/platform/dashboard-ai-agent-observability.md) | AI Engineer, TL, SRE | Agent success rate, tool call reliability, orchestration health, latency, cost efficiency, safety compliance |
| 69 | Feature Store Health | [ai-engineer/data/dashboard-feature-store-health.md](../../ai-engineer/data/dashboard-feature-store-health.md) | AI Engineer, Data Engineer, ML Engineer | Feature registry, freshness, training-serving skew, feature quality, storage, serving performance |
| 70 | Model Training & Experiments | [ai-engineer/platform/dashboard-model-training-experiments.md](../../ai-engineer/platform/dashboard-model-training-experiments.md) | AI Engineer, ML Engineer, Data Engineer, TL | Experiment tracking, training pipeline, GPU utilization, model registry, HPO, reproducibility |

### SRE & Operations (19)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 71 | System Health | [oncall-sre/observability/dashboard-system-health.md](../../oncall-sre/observability/dashboard-system-health.md) | SRE | SLO, golden signals, error budget, burn rate, capacity |
| 72 | Incident Trends | [oncall-sre/incident-response/dashboard-incident-trends.md](../../oncall-sre/incident-response/dashboard-incident-trends.md) | SRE | MTTA, MTTR, severity, root cause, postmortem quality |
| 73 | Postmortem Quality | [oncall-sre/incident-response/dashboard-postmortem-quality.md](../../oncall-sre/incident-response/dashboard-postmortem-quality.md) | SRE, TL, Engineer | Postmortem completion, action items, recurrence, learning loop |
| 74 | Incident Command | [oncall-sre/incident-response/dashboard-incident-command.md](../../oncall-sre/incident-response/dashboard-incident-command.md) | SRE, TL, Engineer | Command structure, response time, communication, escalation, war room |
| 75 | Release Management | [oncall-sre/release/dashboard-release-management.md](../../oncall-sre/release/dashboard-release-management.md) | SRE | Release cadence, canary gates, rollback, hotfix, freeze |
| 76 | Cost & Resource | [oncall-sre/observability/dashboard-cost-and-resource.md](../../oncall-sre/observability/dashboard-cost-and-resource.md) | SRE, Tech Lead | Cloud cost, resource utilization, FinOps, optimization |
| 77 | Oncall Health | [oncall-sre/incident-response/dashboard-oncall-health.md](../../oncall-sre/incident-response/dashboard-oncall-health.md) | SRE | On-call burden, alert fatigue, rotation, pager load |
| 78 | Business Continuity | [oncall-sre/observability/dashboard-business-continuity.md](../../oncall-sre/observability/dashboard-business-continuity.md) | SRE, Executive | RPO/RTO, backup health, DR test, failover, BC plan |
| 79 | Capacity Planning | [oncall-sre/observability/dashboard-capacity-planning.md](../../oncall-sre/observability/dashboard-capacity-planning.md) | SRE, TL, Exec | Demand forecasting, resource headroom, scaling triggers, capacity governance |
| 80 | Observability Coverage | [oncall-sre/observability/dashboard-observability-coverage.md](../../oncall-sre/observability/dashboard-observability-coverage.md) | SRE, TL, Engineer | Logging, metrics, tracing, alerting coverage, observability maturity |
| 81 | Chaos Engineering | [oncall-sre/observability/dashboard-chaos-engineering.md](../../oncall-sre/observability/dashboard-chaos-engineering.md) | SRE, TL, Engineer | Experiment coverage, failure injection, resilience scoring, game days |
| 82 | Certificate & Secret Mgmt | [oncall-sre/observability/dashboard-certificate-secret-management.md](../../oncall-sre/observability/dashboard-certificate-secret-management.md) | SRE, Security Eng, TL | TLS expiry, secret rotation, key management, credential scanning, PKI health |
| 83 | Network Health | [oncall-sre/observability/dashboard-network-health.md](../../oncall-sre/observability/dashboard-network-health.md) | SRE, TL, Engineer | Latency, bandwidth, DNS, CDN, connectivity, topology, circuit breakers |
| 84 | Alert Tuning & Noise Reduction | [oncall-sre/observability/dashboard-alert-tuning.md](../../oncall-sre/observability/dashboard-alert-tuning.md) | SRE, TL, Engineer | Alert volume, SNR, false positive rate, correlation, routing, fatigue impact |
| 85 | Log Management | [oncall-sre/observability/dashboard-log-management.md](../../oncall-sre/observability/dashboard-log-management.md) | SRE, Engineer, TL | Log volume, retention, indexing, structured logging, log quality, PII safety, cost efficiency |
| 86 | Service Mesh Health | [oncall-sre/observability/dashboard-service-mesh-health.md](../../oncall-sre/observability/dashboard-service-mesh-health.md) | SRE, Engineer, TL | Sidecar health, mTLS coverage, traffic policy, mesh performance, fault injection, topology |
| 87 | SLO Error Budget | [oncall-sre/observability/dashboard-slo-error-budget.md](../../oncall-sre/observability/dashboard-slo-error-budget.md) | SRE, TL, Engineer | SLO compliance, error budget burn rate, SLI quality, dependent service reliability, SLO governance |
| 88 | Traffic Management | [oncall-sre/observability/dashboard-traffic-management.md](../../oncall-sre/observability/dashboard-traffic-management.md) | SRE, Engineer, TL | Load balancer health, CDN performance, traffic routing, rate limiting, ingress, global distribution |
| 89 | Backup & Recovery | [oncall-sre/observability/dashboard-backup-recovery.md](../../oncall-sre/observability/dashboard-backup-recovery.md) | SRE, Engineer, TL, Security Eng | Backup success, recovery testing, data integrity, retention compliance, RPO/RTO, corruption events |

### Tech Lead (11)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 90 | Engineering Capacity | [tech-lead/capacity/dashboard-engineering-capacity.md](../../tech-lead/capacity/dashboard-engineering-capacity.md) | Tech Lead | Headcount, allocation, skill coverage, hiring, budget |
| 91 | Risk Management | [tech-lead/risk/dashboard-risk-management.md](../../tech-lead/risk/dashboard-risk-management.md) | Tech Lead, Exec | Risk register (P×I), mitigation, contingency, residual risk |
| 92 | Vendor Management | [tech-lead/risk/dashboard-vendor-management.md](../../tech-lead/risk/dashboard-vendor-management.md) | Tech Lead, Exec | Vendor inventory, risk, SLA, contracts, concentration |
| 93 | Roadmap Progress | [tech-lead/roadmap/dashboard-roadmap-progress.md](../../tech-lead/roadmap/dashboard-roadmap-progress.md) | Tech Lead, PM | Earned value SPI/CPI, milestones, dependencies, resources |
| 94 | Architecture Decisions | [tech-lead/decisions/dashboard-architecture-decisions.md](../../tech-lead/decisions/dashboard-architecture-decisions.md) | Tech Lead | ADR statistics, decision quality, tech radar, migrations |
| 95 | Architecture Review | [tech-lead/architecture/dashboard-architecture-review.md](../../tech-lead/architecture/dashboard-architecture-review.md) | Tech Lead | Review cadence, findings, ARB health, principle compliance |
| 96 | Talent Retention | [tech-lead/capacity/dashboard-talent-retention.md](../../tech-lead/capacity/dashboard-talent-retention.md) | Tech Lead, Exec | Hiring pipeline, retention, engagement, career growth |
| 97 | Technical Debt | [tech-lead/risk/dashboard-technical-debt.md](../../tech-lead/risk/dashboard-technical-debt.md) | Tech Lead, Engineer, Exec | Debt inventory, interest cost, remediation velocity, architectural debt, governance |
| 98 | Technical Strategy | [tech-lead/strategy/dashboard-technical-strategy.md](../../tech-lead/strategy/dashboard-technical-strategy.md) | Tech Lead, Exec, Engineer | Build vs buy, technology radar, innovation portfolio, architecture strategy, roadmap alignment |
| 99 | Team Topology & Org Design | [tech-lead/capacity/dashboard-team-topology-health.md](../../tech-lead/capacity/dashboard-team-topology-health.md) | Tech Lead, Exec, Engineer | Team structure, cognitive load, interaction modes, Conway alignment, autonomy, org evolution |
| 100 | Stakeholder Communication | [tech-lead/capacity/dashboard-stakeholder-communication.md](../../tech-lead/capacity/dashboard-stakeholder-communication.md) | Tech Lead, Executive, PM | Stakeholder satisfaction, decision velocity, alignment health, communication effectiveness, escalation health, meeting quality |

### People & Skills (7)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 101 | Onboarding Progress | [new-hire/onboarding/dashboard-onboarding-progress.md](../../new-hire/onboarding/dashboard-onboarding-progress.md) | New Hire, TL | 4 phases, time-to-productivity, buddy, 30/60/90 |
| 102 | Skill Ecosystem | [skill-author/patterns/dashboard-skill-ecosystem.md](../../skill-author/patterns/dashboard-skill-ecosystem.md) | Skill Author | Skill inventory, quality, adoption, family coherence |
| 103 | Learning & Development | [skill-author/patterns/dashboard-learning-development.md](../../skill-author/patterns/dashboard-learning-development.md) | Tech Lead, Exec, Skill Author | Training completion, skill acquisition, certifications, mentorship, learning culture |
| 104 | Career Development | [skill-author/patterns/dashboard-career-development.md](../../skill-author/patterns/dashboard-career-development.md) | TL, Exec, Engineer | Career ladder, promotion velocity, mentorship, internal mobility, growth equity |
| 105 | People & Expertise | [knowledge-curator/people/dashboard-people-expertise.md](../../knowledge-curator/people/dashboard-people-expertise.md) | Curator, TL | (see Executive section above) |
| 106 | Hiring & Recruitment | [skill-author/patterns/dashboard-hiring-recruitment.md](../../skill-author/patterns/dashboard-hiring-recruitment.md) | TL, Executive, Skill Author | Pipeline health, time-to-hire, interview quality, offer acceptance, source effectiveness, candidate experience |
| 107 | Diversity, Equity & Inclusion | [skill-author/patterns/dashboard-diversity-equity-inclusion.md](../../skill-author/patterns/dashboard-diversity-equity-inclusion.md) | Executive, Tech Lead, Skill Author | Representation, pay equity, hiring diversity, inclusion survey, retention equity, belonging, ERG participation |

### Security (10)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|---|---|
| 108 | Security Posture | [engineer/quality-security/dashboard-security-posture.md](../../engineer/quality-security/dashboard-security-posture.md) | Engineer, SRE | CVEs, compliance SOC2/ISO27001/GDPR/CIS, threat, SBOM |
| 109 | Compliance Readiness | [engineer/quality-security/dashboard-compliance-readiness.md](../../engineer/quality-security/dashboard-compliance-readiness.md) | Engineer, TL, Exec | Control effectiveness, audit readiness, evidence, policy attestation |
| 110 | Vulnerability Management | [engineer/quality-security/dashboard-vulnerability-management.md](../../engineer/quality-security/dashboard-vulnerability-management.md) | Security Engineer, TL, SRE | CVE lifecycle, SLA compliance, EPSS, remediation velocity, dependency risk |
| 111 | Identity & Access Mgmt | [engineer/quality-security/dashboard-identity-access-management.md](../../engineer/quality-security/dashboard-identity-access-management.md) | Security Engineer, TL, SRE | User lifecycle, role health, MFA coverage, access reviews, privilege creep |
| 112 | Data Protection & Privacy | [engineer/quality-security/dashboard-data-protection-privacy.md](../../engineer/quality-security/dashboard-data-protection-privacy.md) | Security Engineer, TL, Exec | DPIA, DSR, encryption posture, data retention, privacy-by-design, cross-border transfer |
| 113 | API Security | [engineer/quality-security/dashboard-api-security.md](../../engineer/quality-security/dashboard-api-security.md) | Security Engineer, TL, Engineer | API inventory, authn/z, rate limiting, WAF, token security, OWASP API Top 10 |
| 114 | Dependency Management | [engineer/quality-security/dashboard-dependency-management.md](../../engineer/quality-security/dashboard-dependency-management.md) | Engineer, TL, Security Engineer | Version health, license compliance, vulnerability exposure, transitive risk, SBOM, update cadence |
| 115 | Threat Detection & Response | [engineer/quality-security/dashboard-threat-detection-response.md](../../engineer/quality-security/dashboard-threat-detection-response.md) | Security Engineer, SRE, TL | MITRE ATT&CK coverage, alert fidelity, investigation velocity, MTTC, threat hunting, SOC effectiveness |
| 116 | Cloud Security Posture | [engineer/quality-security/dashboard-cloud-security-posture.md](../../engineer/quality-security/dashboard-cloud-security-posture.md) | Security Engineer, SRE, TL | Cloud asset inventory, misconfig, IAM hygiene, network exposure, data protection, compliance benchmarks |
| 117 | Security Awareness & Training | [engineer/quality-security/dashboard-security-awareness-training.md](../../engineer/quality-security/dashboard-security-awareness-training.md) | Security Engineer, TL, Exec, Engineer | Phishing simulation, training completion, security culture, champions, human risk scoring |

### Meta (1)

| # | Dashboard | File | Role | Key metrics |
|---|---|---|---|---|---|
| — | Dashboard Index | [knowledge-curator/diagrams/dashboard-index.md](../../knowledge-curator/diagrams/dashboard-index.md) | All roles | This file — master index of all 117 dashboards |

## Retrieval by role

| Role | Primary dashboards (top 7) |
|---|---|
| **Executive** | Executive KPI, Strategic Roadmap, Competitive Intelligence, Sustainability, OKR Health, Product Strategy, Innovation Portfolio |
| **Product Manager** | Product Portfolio, Product Strategy, Product Delivery, PM Frameworks, Feature Adoption, Customer Health, User Engagement & Retention |
| **Tech Lead** | DORA Metrics, Engineering Capacity, Architecture Health, Technical Debt, Technical Strategy, Team Topology & Org Design, Code Review Health |
| **Engineer** | DORA Metrics, Quality Metrics, Test Automation, Developer Experience, CI/CD Pipeline Health, Code Review Health, Code Quality |
| **AI/ML Engineer** | AI Performance, LLM Cost & Efficiency, AI Methodology, AI Maturity, AI Safety, RAG Quality, AI Agent Observability |
| **SRE** | System Health, Incident Trends, Incident Command, Postmortem Quality, Network Health, Alert Tuning & Noise Reduction, SLO Error Budget |
| **Security Engineer** | Security Posture, Vulnerability Management, API Security, Identity & Access Mgmt, Cloud Security Posture, Dependency Management, Threat Detection & Response |
| **Data Engineer** | Data Pipeline, Data Governance, Data Quality, Feature Store Health, Database Performance, ML Operations, Vector Database Health |
| **Design/UX** | UX Health, Design System Health, Information Architecture, Content Design & UX Writing, User Research Ops, Feature Adoption, Customer Journey |
| **Knowledge Curator** | Knowledge Health, People & Expertise, Dashboard Index, Skill Ecosystem, Learning & Development, Career Development, Data Governance |
| **New Hire** | Onboarding Progress, Career Development, Learning & Development, Team Velocity, Developer Experience, CI/CD Pipeline Health, People & Expertise |
| **Skill Author** | Skill Ecosystem, Learning & Development, Career Development, Developer Experience, Knowledge Health, Architecture Decisions, Lessons Learned |

## Retrieval by question

| Question | Dashboard |
|---|---|
| How fast are we shipping? | DORA Metrics |
| Is our code quality improving? | Code Quality |
| Are our code reviews healthy? | Code Review Health |
| Is our CI/CD pipeline healthy? | CI/CD Pipeline Health |
| Is our team healthy and engaged? | Team Health & Engagement |
| Are engineers growing in their careers? | Career Development |
| Are we secure? | Security Posture |
| Are our APIs secure? | API Security |
| Is our API design consistent? | API Design Quality |
| Are we audit-ready? | Compliance Readiness |
| How's our vulnerability management? | Vulnerability Management |
| Who has access to what? | Identity & Access Mgmt |
| Are we protecting user data? | Data Protection & Privacy |
| Are our dependencies healthy? | Dependency Management |
| Are we detecting and responding to threats? | Threat Detection & Response |
| Is our cloud security posture healthy? | Cloud Security Posture |
| Is the system healthy? | System Health |
| How many incidents? Why? | Incident Trends |
| Are postmortems driving learning? | Postmortem Quality |
| How effective is our incident command? | Incident Command |
| Are releases going smoothly? | Release Management |
| Is on-call sustainable? | Oncall Health |
| Are our alerts effective? | Alert Tuning & Noise Reduction |
| Are our logs healthy? | Log Management |
| Is the network healthy? | Network Health |
| Is our service mesh healthy? | Service Mesh Health |
| Are our SLOs and error budgets healthy? | SLO Error Budget |
| Is our traffic management healthy? | Traffic Management |
| Are our AI models performing? | AI Performance |
| Are our AI agents reliable? | AI Agent Observability |
| Are our AI systems safe? | AI Safety |
| Can we explain our AI decisions? | Model Explainability |
| How's our RAG pipeline quality? | RAG Quality |
| Are our prompts effective? | AI Methodology |
| How mature is our AI practice? | AI Maturity |
| Are our ML models healthy? | ML Operations |
| Is our feature store healthy? | Feature Store Health |
| Is our data reliable? | Data Pipeline |
| Is our data quality good enough? | Data Quality |
| Is our vector database healthy? | Vector Database Health |
| Is our database healthy? | Database Performance |
| Are users adopting our features? | Feature Adoption |
| Are users engaged and retained? | User Engagement & Retention |
| What's our product strategy? | Product Strategy |
| How's our innovation pipeline? | Innovation Portfolio |
| Are we delivering predictably? | Product Delivery |
| Are PM frameworks being used? | PM Frameworks |
| Is our pricing optimized? | Pricing & Packaging |
| How's our customer journey? | Customer Journey |
| Is our UX/accessibility good? | UX Health |
| Are we doing enough user research? | User Research Ops |
| Is our design system healthy? | Design System Health |
| Can users find what they need? | Information Architecture |
| Is our content clear and consistent? | Content Design & UX Writing |
| Is the business healthy? | Executive KPI |
| Are our OKRs effective? | OKR Health |
| Are strategic initiatives on track? | Strategic Roadmap |
| Who are our competitors? | Competitive Intelligence |
| Are we sustainable? | Sustainability |
| Do we have enough people? | Engineering Capacity |
| Is the team collaborating well? | Team Velocity |
| Are developers productive? | Developer Productivity |
| Is our architecture healthy? | Architecture Health |
| Are architecture reviews effective? | Architecture Review |
| Are architecture decisions tracked? | Architecture Decisions |
| Is developer experience good? | Developer Experience |
| Are projects aligned across teams? | Project Health |
| What have we learned? | Lessons Learned |
| What risks do we face? | Risk Management |
| Is the roadmap on track? | Roadmap Progress |
| Are we spending too much on cloud? | Cost & Resource |
| Is our knowledge base healthy? | Knowledge Health |
| Who knows what? | People & Expertise |
| Are new hires ramping well? | Onboarding Progress |
| Are our skills healthy? | Skill Ecosystem |
| Are engineers learning and growing? | Learning & Development |
| Are our APIs well-managed? | API Portfolio |
| Are our data assets governed? | Data Governance |
| Are we experimenting effectively? | Experimentation |
| Are we ready for a disaster? | Business Continuity |
| Are our customers healthy? | Customer Health |
| How's our platform serving developers? | Platform Engineering |
| Are our vendors managed? | Vendor Management |
| Are we retaining our talent? | Talent Retention |
| Are our tests reliable? | Test Automation |
| Is our LLM spend under control? | LLM Cost & Efficiency |
| Do we have enough capacity? | Capacity Planning |
| How much technical debt do we have? | Technical Debt |
| Are our deployments safe? | Deployment Safety |
| Can we see everything in production? | Observability Coverage |
| Are we resilient to failure? | Chaos Engineering |
| Are our certificates and secrets managed? | Certificate & Secret Mgmt |
| Build vs buy? Which technologies? | Technical Strategy |
| Are our teams structured well? | Team Topology & Org Design |
| Where can I find all dashboards? | Dashboard Index |
| Is our product accessible to everyone? | Accessibility Compliance |
| Are customers satisfied and heard? | Customer Feedback & Satisfaction |
| Is our infrastructure defined as code? | Infrastructure as Code |
| Are employees security-aware? | Security Awareness & Training |
| How fast are we growing? | Market Growth & Expansion |
| Are we validating ideas before building? | Product Discovery & Validation |
| Are our model training pipelines healthy? | Model Training & Experiments |
| Is our hiring pipeline healthy? | Hiring & Recruitment |
| Are our backups working? Can we recover? | Backup & Recovery |
| Are we testing usability with real users? | Usability Testing & Research |
| Is our organization diverse, equitable, and inclusive? | Diversity, Equity & Inclusion |
| Are stakeholders aligned and informed? | Stakeholder Communication |
| How fast are we making decisions? | Stakeholder Communication |
| Is our sales pipeline healthy? | Sales & GTM Motion |
| Are our customers successful and growing? | Customer Success Health |
| Is our documentation helping developers? | Documentation Health |
| Is our frontend fast enough for users? | Frontend & Mobile Performance |
| Is our marketing generating real pipeline? | Marketing Performance |
| Are our finances and runway healthy? | Finance & FP&A Health |
| Is our open source community thriving? | Open Source & Community |
| Are we collecting every dollar we earn? | Billing & Payments |

## Dashboard design principles

1. **Single pane**: each dashboard fits on one screen/page; no scrolling required for the overview
2. **5-6 dimensions max**: each dashboard covers 5-6 dimensions with 3-5 key metrics per dimension
3. **Red/Yellow/Green thresholds**: every metric has defined thresholds so status is immediately visible
4. **Drill-down paths**: each dashboard links to detailed guides and related dashboards
5. **Action recommendations**: every dashboard includes concrete, prioritized actions (8-10 items)
6. **Anti-patterns**: every dashboard documents common misuses to prevent metric gaming
7. **Refresh cadence**: each dashboard specifies its refresh rate (realtime, daily, weekly, monthly)
8. **User story header**: every dashboard follows the "As a [role], I want to [goal], so that [benefit]" pattern
9. **Frontmatter complete**: roles, benefit, acceptance_criteria, related links all present
10. **Professional depth**: each dashboard includes industry benchmarks, formula explanations, and reference citations

## Related

- Upstream: [../../INDEX.md](../../INDEX.md) — full library index
- Upstream: [../governance/governance.md](../governance.md) — governance and maintenance
- Upstream: [../governance/dashboard-knowledge-health.md](../governance.md) — knowledge base health dashboard
- References: This dashboard index follows the YiKnowledge 4-diagram framework (knowledge-map, user-journey, directory-blueprint, governance-flow)