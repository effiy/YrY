---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-066-developer-experience
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
---

# BRD-2026-066 Internal Developer Platform and DevEx — Approval Flow and Signing Authority

> **As an** engineer, **I want to** approvals, **so that** project context preserved.

## 1. Project background and goals
Approval flow: (1) PR level — Champion + 1 reviewer, required when DevEx score < 80; (2) team level — team lead + Champion review, required for catalog-info.yaml changes; (3) department level — department head + platform team review, required for plugin onboarding; (4) company level — CTO + CFO joint approval, required for platform-architecture changes. Signing authority: Champion for catalog-info.yaml, team lead for scaffolding, department head for plugin onboarding, CTO+CFO for platform architecture. Budget: $20K quarterly budget; overspend needs CTO emergency approval. Contract negotiation: Backstage open-source + Tekton/Argo/Crossplane open-source + Postgres/Redis already owned + CDN $30/month, no contract negotiation.

## 2. Quantified metrics and data
Approval quantification: 4-tier approval, 50+ PRs per month. Thresholds: Champion catalog-info.yaml (15 PR/month) + team lead scaffolding (8 PR/month) + department head plugin onboarding (3 PR/month) + CTO+CFO platform architecture (1 PR/quarter). Signing: 5 Champions, 5 team leads, 3 department heads, 2 CTO+CFO, 1 platform team. Budget: $20K quarterly budget; overspend $5K auto CTO emergency approval. Contract negotiation: Backstage open-source + Tekton/Argo/Crossplane open-source + Postgres/Redis already owned + CDN $30/month, no contract negotiation.

## 3. Rollout path and challenges
Approval rollout: 4-tier approval live 2026-09-01; catalog-info.yaml PR CI auto 2026-09-15; Champion catalog-info.yaml 2026-09-01; team lead scaffolding 2026-09-01; department head plugin onboarding 2026-09-01; CTO+CFO platform architecture 2026-09-01. Budget frozen $20K quarterly, overspend $5K auto CTO emergency approval. Contract negotiation: Backstage open-source no fee, Tekton/Argo/Crossplane open-source, Postgres/Redis already owned, CDN $30/month AWS standard.

## 4. Long-term evolution and strategy
Long-term evolution: (1) approval automation — PR CI + Champion + quarterly review, 2027-Q4; (2) approval AI — ML recommendation + risk detection, 2027-H2; (3) cross-team approval alignment — shared SOP, 2027-Q4; (4) approval tied to business — review-quality adoption-driven, 2027-Q4. 24-month goals: approval 100% automated, AI recommendation 80%+, cross-team alignment 1 time/quarter, review-quality adoption-driven 100%.
