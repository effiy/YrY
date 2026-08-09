---
lifecycle: active
title: brd-2026-061-zero-trust: rules
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: summary
---

# BRD-2026-061 Zero-Trust Platform and Network Security Governance — business rules

> **As an** engineer, **I want to** rules, **so that** project context preserved.

## 1. Project background and targets
Business rules: 1) mTLS full-chain coverage; 2) short-lived tokens (<1h); 3) least privilege (OPA); 4) audit log (retain 90 days); 5) key management (Vault); 6) certificate auto-renewal (cert-manager); 7) Monitoring coverage of 8 items; 8) cross-business key isolation; 9) sensitive-key encryption; 10) regular permission review.

## 2. Quantitative metrics and data
Rule refinement: 1) mTLS full-chain coverage (service-to-service + database); 2) short-lived tokens (<1h + refresh); 3) least privilege (OPA policy + policy audit); 4) audit log (retain 90 days); 5) key management (Vault + auto-rotation); 6) certificate auto-renewal (cert-manager + 30/7/1 day alerts); 7) Monitoring coverage of 8 items (auth failure / cert expiry / key leak / lateral movement / token replay / permission creep / trust-domain isolation / keystore single point); 8) cross-business key isolation; 9) sensitive-key encryption; 10) regular permission review.

## 3. Advancement path and challenges
Rule implementation: Y1 Q3 complete mTLS mandatory + SPIFFE implementation + certificate auto-renewal; Y1 Q4 complete short-lived tokens + OPA policy + audit log; Y2 Q1 complete cross-business key isolation + sensitive-key encryption + legacy migration kickoff; Y2 Q4 complete legacy migration 100%; Y3 complete self-healing identity. Key constraint: rule implementation must be paired with CI Check + Platform team approval.

## 4. Long-term evolution and strategy
Long-term rule evolution: within 3 years rules 100% implemented + automation checks + cross-language alignment; within 5 years rules evolve to self-heal governance + auto-approval; key metrics: rule violation rate 0, automation coverage 100%; build a zero-trust rule platform with auto-approval; key opportunity: AI-driven rule checks.
