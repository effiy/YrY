---
lifecycle: active
title: "brd-2026-064-cost-optimization: approvals"
created: 2026-08-07
tags: [yipet, brd]
updated: 2026-08-09
category: engineer/projects/yipet/brd/brd-2026-064-cost-optimization
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
type: summary
---

# BRD-2026-064 Cost Optimization and FinOps Platform — Approval Flow and Signing Authority

> **As an** engineer, **I want to** approvals, **so that** project context preserved.

## 1. Project background and goals
Approval flow: (1) PR level — Champion + 1 reviewer, required when Δcost > +$50/month; (2) team level — team lead + Champion review, required when Δcost > +$200/month; (3) department level — department head + CFO review, required when Δcost > +$1K/month; (4) company level — CTO + CFO joint approval, required when Δcost > +$5K/month. Signing authority: Champion $50/month, team lead $200/month, department head $1K/month, CTO+CFO $5K+/month. Budget freeze: $20K quarterly budget; overspend needs CTO+CFO emergency approval.

## 2. Quantified metrics and data
Approval quantification: 4-tier approval, 50+ PRs per month. Thresholds: Champion $50/month (15 PR/month) + team lead $200/month (8 PR/month) + department head $1K/month (3 PR/month) + CTO+CFO $5K+/month (1 PR/quarter). Signing: 5 Champions, 5 team leads, 3 department heads, 2 CTO+CFO. Budget: $20K quarterly budget; overspend $5K auto CTO+CFO approval. Contract negotiation: procurement joins the FinOps committee, 3-year commitment + RI purchase volume, negotiate 8% down with AWS, saving $3K/year.

## 3. Rollout path and challenges
Approval rollout: 4-tier approval live 2026-09-01; Infracost GitHub Actions PR comment auto on all PRs 2026-09-15; Champion $50/month 2026-09-01; team lead $200/month 2026-09-01; department head $1K/month 2026-09-01; CTO+CFO $5K+/month 2026-09-01. Budget freeze $20K quarterly; overspend $5K auto CTO+CFO emergency approval. Contract negotiation: 2026-09-01 procurement joins FinOps committee, 2026-10-01 start 3-year commitment negotiation, 2026-11-01 sign at 8% off.

## 4. Long-term evolution and strategy
Long-term evolution: (1) approval automation — Infracost + Champion + quarterly review; (2) approval AI — ML recommendation + risk detection; (3) cross-team approval alignment — shared SOP; (4) approval tied to business — review-quality cost-driven. 24-month goals: approval 100% automated, AI recommendation 80%+, cross-team alignment 1 time/quarter, review-quality cost-driven 100%.
