---
lifecycle: active
title: "brd-2026-060-chaos-engineering: documents"
created: 2026-08-07
tags: [yipet, brd]
updated: 2026-08-09
category: engineer/projects/yipet/brd/brd-2026-060-chaos-engineering
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
type: summary
---

# BRD-2026-060 Chaos Engineering Platform and Resilience Governance - Documentation Overview

> **As an** engineer, **I want to** documents, **so that** project context preserved.

## 1. Project background and goals
Project background: the company currently has 5 teams each implementing resilience independently, with fragmented awareness, MTTR of 52 minutes, and a change failure rate of 18%; business need: a unified chaos engineering platform supporting 20+ business domains for chaos + game day + self-healing; strategy goal: evolve to a self-healing system within 3 years, with MTTR of 10 minutes and change failure rate of 3%.

## 2. Quantitative metrics and data
Documentation scope: this BRD covers the 3-year evolution of the chaos engineering platform from L2 manual chaos to L5 self-healing system; related documentation: architecture design docs, tech selection report, capacity assessment, risk register, oncall manual, experiment catalog portal PRD, resilience configuration PRD; readers: CTO, platform team, business teams, SRE.

## 3. Advancement path and challenges
Advancement path: Y1 centralized (Chaos Mesh + experiment catalog portal MVP + approval process); Y2 platformization (resilience four-piece set + full-link drill + automated chaos); Y3 self-healing system (failure detection + auto recovery); key blockers: hiring progress, legacy migration resistance, automated chaos promotion; key opportunities: company strategy emphasizes stability.

## 4. Long-term evolution and strategy
Long-term evolution: within 3 years L3 platformization 100% achieved + L4 full-link 60% + L5 self-healing 20%; within 5 years L5 60%; key metrics: MTTR 10 minutes, change failure rate 3%, resilience configuration coverage 100%, game day drill pass rate 100%; sustained investment in resilience platform team 6-8 FTE; key opportunity: AI-driven self-healing system.
