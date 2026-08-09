---
lifecycle: active
title: brd-2026-061-zero-trust: risks
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
- descriptive verb-phrase filename, hyphens only, underscores and digits forbidden
- body contains user-story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: brd
---

# BRD-2026-061 Zero Trust Platform and Network Security Governance - Risk Register

> **As an** engineer, **I want to** risks, **so that** project context preserved.

## 1. Project background and goals
Risk register: 1) zero trust platform team hiring behind (P0); 2) legacy auth refactor resistance (P0); 3) cert expiration incident (P0); 4) key leak (P0); 5) compliance requirements (MLPS 2.0) (P1); 6) budget freeze (P2); each item linked to owner and remediation action.

## 2. Quantified metrics and data
Risk quantification: 1) hiring: Q3 needs 2 FTE, currently 0 offers, probability 60%, impact M2 delayed 1 quarter; 2) legacy refactor: 540 services, done within 2 years, probability 40% not reached; 3) cert expiration: cert-manager auto renewal, probability 90% reached; 4) budget: ¥800K/3 years, probability 90% retained.

## 3. Rollout path and challenges
Risk mitigation: 1) hiring: HR increases investment + outsourcing fallback + internal transfer; 2) legacy refactor: platform team provides migration tool + business-side incentives (OKR bonus); 3) cert expiration: cert-manager auto renewal + 30/7/1 day alerts; 4) compliance: security and compliance early involvement; 5) budget: finance quarterly review + risk reserve; 6) key leak: Vault auto rotation + leak detection.

## 4. Long-term evolution and strategy
Long-term risks: 1) wrong tech selection (SPIFFE vs BeyondCorp), needs continuous evaluation; 2) platform team attrition, needs incentives + rotation; 3) business-side awareness insufficient, needs training; 4) new tech emerging (e.g. AI-driven self-healing), needs tracking; 5) compliance requirements upgraded, needs sustained investment; each item linked to early-warning metric.
