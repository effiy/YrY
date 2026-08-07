---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-063-api-gateway
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
---

# BRD-2026-063 API gateway platform and edge compute governance — risk register

> **As an** engineer, **I want to** risks, **so that** project context preserved.

## 1. Project background and goals
Risk register: 1) API platform team recruitment progress behind (P0); 2) existing routing migration resistance (P0); 3) rate limiting avalanche (P0); 4) gateway single point of failure (P1); 5) compliance requirements (e.g. MLPS 2.0) (P1); 6) budget frozen (P2); each item has related owner and remediation action.

## 2. Quantitative metrics and data
Risk quantification: 1) Recruitment: Q3 needs 2 FTE, currently 0 offers, probability 60%, impact M2 delayed by 1 quarter; 2) Existing migration: 540 routing rules, 2 years to complete, probability 40% not achieved; 3) Rate limiting avalanche: 2-person approval + load test, probability 90% achieved; 4) Budget: ¥7M / 3 years, probability 90% maintained.

## 3. Advance path and challenges
Risk response: 1) Recruitment: HR increases investment + outsourcing fallback + internal transfer; 2) Existing migration: platform team provides migration tool + business-side incentive (OKR bonus); 3) Rate limiting avalanche: 2-person approval + load test validation; 4) Compliance: security/compliance early involvement; 5) Budget: finance quarterly review + risk reserve fund; 6) Gateway single point: multi-replica + health check.

## 4. Long-term evolution and strategy
Long-term risks: 1) Tech selection error (APISIX vs Kong), need persistent evaluation; 2) Platform team churn, need incentive + rotation; 3) Business-side awareness gap, need training; 4) New tech emerging (e.g. AI-driven self-heal), need tracking; 5) Compliance requirements upgrade, need persistent investment; each item has related warning metric.
