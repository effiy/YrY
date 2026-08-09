---
lifecycle: active
title: brd-2026-061-zero-trust: documents
created: 2026-08-07
tags: [yipet, brd]
updated: 2026-08-09
category: engineer/projects/yipet/brd/brd-2026-061-zero-trust
source: internal
roles:
- engineer
benefit: project context preserved
acceptance_criteria:
- frontmatter roles + benefit + acceptance_criteria present
- Filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user-story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: brd
---

# BRD-2026-061 Zero Trust platform and network security governance - documentation overview

> **As an** engineer, **I want to** documents, **so that** project context preserved.

## 1. Project background and goals
Project background: currently the company has 5 teams each implementing their own authentication, trust domains are fragmented, 8 security incidents per year, MTTR 52 minutes; business need: unified zero trust platform, supporting 20+ business domains with mTLS + short-lived tokens + OPA; strategy goal: within 3 years evolve to self-healing identity, 0 security incidents, MTTR 10 minutes.

## 2. Quantitative metrics and data
Documentation scope: this BRD covers the 3-year evolution of the zero trust platform from L2 identity authentication to L5 self-healing identity; related documentation: architecture design docs, tech selection report, capacity assessment, risk register, oncall manual, trust domain graph portal PRD, OPA policy library PRD; readers: CTO, platform team, business teams, SRE.

## 3. Advancement path and challenges
Advancement path: Y1 centralisation (SPIFFE + trust domain graph portal MVP + approval process); Y2 platformisation (mTLS + OPA policy + short-lived tokens + legacy refactoring); Y3 self-healing identity (key auto-rotation + exception detection); key blockers: hiring progress, legacy refactoring resistance, chaos engineering promotion; key opportunities: company strategy emphasises zero trust.

## 4. Long-term evolution and strategy
Long-term evolution: within 3 years L3 platformisation 100% achieved + L4 trust domain 60% + L5 self-healing 20%; within 5 years L5 60%; key metrics: 0 security incidents, MTTR 10 minutes, 0 lateral movement, 0 key leakage; sustained investment in zero trust platform team 6-8 FTE; key opportunity: AI-driven self-healing identity.
