---
title: Launch Risk Assessment
aliases: [launch-risk, go-no-go, launch-checklist, pre-launch-review]
tags: [leader, risk, launch, assessment, checklist, go-no-go]
category: leader/risk
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader, srer, engineer, producter]
benefit: "Leaders run structured pre-launch risk assessments so no critical failure mode is missed"
acceptance_criteria:
  - "5 risk categories: security, reliability, data, UX, business"
  - "includes go/no-go decision framework"
  - "risk matrix with likelihood × impact scoring"
related:
  - ./write-a-postmortem.md
  - ./README.md
  - ../../srer/release/release-procedure.md
  - ../../srer/release/canary-release.md
---

# Launch Risk Assessment

> **When to use:** Before any significant launch — new feature, infrastructure change, or major version bump. A structured risk assessment surfaces failure modes before they surface in production.

## Risk Categories

| Category | What to assess | Who |
|---|---|---|
| **Security** | Auth, data exposure, injection, dependency CVEs | Engineer + Security |
| **Reliability** | Availability, latency, error budgets, cascading failures | SRE |
| **Data** | Migration safety, backwards compatibility, data loss | Engineer + DBA |
| **UX** | User impact, edge cases, error states, accessibility | Producter + Designer |
| **Business** | Rollback cost, customer communication, SLA impact | Leader + Producter |

## Assessment Process

### 1. Risk Identification (30 min)

Brainstorm every thing that could go wrong. Use this prompt:

> "If this launch fails, what's the most likely reason? What's the most damaging reason?"

### 2. Risk Scoring

Score each risk on likelihood and impact (1-5):

| Score | Likelihood | Impact |
|---|---|---|
| 1 | < 1% chance | No user impact |
| 2 | 1-10% chance | Minor annoyance |
| 3 | 10-30% chance | Feature unusable for some users |
| 4 | 30-60% chance | Feature unusable for all users |
| 5 | > 60% chance | Service outage or data loss |

### 3. Risk Matrix

| Risk | L | I | Score (L×I) | Mitigation | Owner |
|---|---|---|---|---|---|
| DB migration fails, locks table for 10 min | 3 | 4 | 12 | Run migration during low-traffic window; test on staging with production data volume | Engineer |
| New API version breaks YiPet | 2 | 4 | 8 | YiPet integration test in CI; canary YiAi first | Engineer |
| Ollama model not loaded on deploy | 4 | 2 | 8 | Pre-warm model in deploy script; health check before routing traffic | SRE |
| Users can't find the new feature | 3 | 2 | 6 | In-app announcement; release notes; onboarding tooltip | Producter |

### 4. Go/No-Go Decision

| Condition | Decision |
|---|---|
| Any risk score ≥ 15 | **No-go** — must mitigate before launch |
| Any risk score 12-14 | **Conditional go** — requires director approval |
| All risk scores < 12 | **Go** — proceed with standard monitoring |
| No rollback plan for any risk score ≥ 8 | **No-go** — every significant risk needs a rollback plan |

## Pre-Launch Checklist

### Security
- [ ] No new CVEs in dependencies (`npm audit`, `pip audit`)
- [ ] No secrets in code, config, or environment variables
- [ ] Auth/authorization unchanged (or reviewed if changed)
- [ ] No new data exposure paths (new endpoints, new error messages)

### Reliability
- [ ] SLOs defined for new functionality
- [ ] Dashboards and alerts are in place
- [ ] Load tested at expected peak traffic
- [ ] Canary/deploy plan documented
- [ ] Rollback plan documented and tested

### Data
- [ ] Database migrations are backwards-compatible
- [ ] Migration tested on a copy of production data
- [ ] No data loss scenarios identified
- [ ] Backup taken before migration (if applicable)

### UX
- [ ] All user-facing strings reviewed
- [ ] Error states have user-friendly messages
- [ ] Feature works in all supported browsers/languages
- [ ] Accessibility reviewed (keyboard nav, screen reader)

### Business
- [ ] Customer communication drafted (if applicable)
- [ ] Support team briefed on the new feature
- [ ] Launch timing reviewed (not during freeze, not Friday 5pm)
- [ ] Success metrics defined and tracked

## Post-Launch Monitoring

Monitor for the first 24 hours after launch:

| Time | What to check |
|---|---|
| 5 min | Deployment health — all instances up? |
| 15 min | Error rate, latency, throughput — any anomalies? |
| 1 hour | User adoption — are users finding the feature? |
| 4 hours | Business metrics — is the feature driving value? |
| 24 hours | Full review — any delayed issues? |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| "It's a small change, skip the assessment" | Small changes cause big outages (config typos, dependency bumps) | Scale the assessment to the change; a 5-minute checklist is better than nothing |
| Risk assessment as a formality (checking boxes) | Real risks are ignored; assessment is a rubber stamp | Be honest about risks; it's better to delay a launch than to cause an incident |
| Only engineer does the assessment | Misses UX, business, and operational risks | Cross-functional: engineer + SRE + producter + leader |
| No go/no-go criteria | Every launch passes; assessment is meaningless | Define explicit go/no-go thresholds before the assessment |