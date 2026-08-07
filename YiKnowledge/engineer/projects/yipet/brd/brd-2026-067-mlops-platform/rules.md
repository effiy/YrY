---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-067-mlops-platform
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
---

# BRD-2026-067 MLOps platform and model lifecycle governance — governance rules and compliance requirements

> **As an** engineer, **I want to** rules, **so that** project context preserved.

## 1. Project background and goals
Governance rules: (1) MLflow experiment tracking mandatory — every experiment must record parameters + metrics + artifacts, unrecorded experiments decommissioned within 24h; (2) Model registry mandatory — staging/production/archived stage management, unregistered models cannot deploy; (3) Feature registry mandatory — Feast + shared catalog, unregistered features decommissioned within 24h; (4) Drift detection mandatory — monthly PSI + KS + KL divergence, exception alert + automatic retraining; (5) A/B testing mandatory — new models 5% gradual rollout + 7-day evaluation, not passing means not merged; (6) Docker images unified — training = production; (7) DVC data versioned — training data traceable; (8) Champion mechanism — 5 people for 90 days + quarterly review. Compliance: GDPR / MLPS 2.0 / SOC 2 / ISO 27001 + AI Act.

## 2. Quantitative metrics and data
Rules quantified: MLflow experiment tracking mandatory across SCP 3 accounts + 5 teams, 24h decommission penalty; model registry staging/production/archived, unregistered cannot deploy; Feast feature registry mandatory across 5 teams + 50 features, 24h decommission; drift detection monthly PSI + KS + KL divergence, exception alert + automatic retraining; A/B testing 5% gradual rollout + 7-day evaluation, not passing means not merged; Docker images unified training = production; DVC data versioned training data traceable; Champion 5 people 90 days + quarterly review; quarterly QBR 4 times/year, 4 participants. Compliance: GDPR / MLPS / SOC 2 / ISO 27001 + AI Act, 4 audits/year, 2027-Q1 first SOC 2 Type II + AI Act assessment.

## 3. Advancement path and challenges
Governance advancement: MLflow experiment tracking across SCP 3 accounts + 5 teams, 24h decommission by 2026-09-15; model registry staging/production/archived, unregistered cannot deploy by 2026-09-15; Feast feature registry mandatory across 5 teams + 50 features, 24h decommission by 2026-10-15; drift detection monthly PSI + KS + KL divergence, exception alert + automatic retraining by 2026-11-15; A/B testing 5% gradual rollout + 7-day evaluation, not passing means not merged by 2026-11-15; Docker images unified training = production by 2026-12-31; DVC data versioned training data traceable by 2026-12-31; Champion 5 people 90 days by 2027-03-31; quarterly QBR 4 times/year first by 2026-12-31. Compliance GDPR / MLPS / SOC 2 / ISO 27001 + AI Act, 2027-Q1 first SOC 2 Type II + AI Act assessment.

## 4. Long-term evolution and strategy
Long-term evolution: (1) Rules AI-driven — ML-recommended MLflow + Feast, 2027-H2; (2) Rules tied to business — iteration + drift driven, 2027-Q4; (3) Rules cross-company aligned — MLOps Summit, 2028-H1; (4) Rules automated — CI/CD fully automated, 2027-Q4. 24-month goal: rules 100% automated, ML-recommended 80%+, cross-company alignment 1 per year, iteration + drift driven 100%.
