---
lifecycle: active
title: brd-2026-066-developer-experience: rules
created: 2026-08-07
tags: [yipet, brd]
updated: 2026-08-09
category: engineer/projects/yipet/brd/brd-2026-066-developer-experience
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

# BRD-2026-066 Internal Developer Platform and DevEx — Governance Rules and Compliance Requirements

> **As an** engineer, **I want to** rules, **so that** project context preserved.

## 1. Project background and goals
Governance rules: (1) catalog-info.yaml mandatory — each repo declares owner + type + lifecycle, undeclared ones go offline in 24h; (2) scaffolding mandatory — unified yeoman generator, shared by 5 teams; (3) docs mandatory — MkDocs single entry + 30-day staleness alert; (4) self-service mandatory — Scaffolding Template, one-click service creation; (5) plugin governance — usage rate < 30% goes offline, quarterly review; (6) Backstage RBAC — custom plugin + OPA + four layers; (7) Champion program — 5 people 90-day plan + quarterly review; (8) quarterly QBR — adoption + doc health + plugin usage + Top 5 improvements. Compliance: GDPR / MLPS 2.0 / SOC 2 / ISO 27001.

## 2. Quantified metrics and data
Rule quantification: catalog-info.yaml mandatory SCP 3 accounts + 217 resources, 24h-offline penalty; scaffolding yeoman generator shared 100% across 5 teams, new services must use it; docs MkDocs single entry + 30-day staleness alert, owner auto-reminded; self-service Scaffolding Template one-click service creation, shared by 5 teams; plugin governance usage < 30% offline, quarterly review; Backstage RBAC custom plugin + OPA + four layers; 5 Champions 90 days + quarterly review; quarterly QBR 4 times/year, 4 attendees. Compliance: GDPR / MLPS / SOC 2 / ISO 27001, audits 4 times/year, 2027-Q1 first SOC 2 Type II certification.

## 3. Rollout path and challenges
Governance rollout: catalog-info.yaml SCP all accounts live 2026-09-15; scaffolding yeoman 5 teams 100% shared 2026-10-15; docs MkDocs + 30-day alert 2026-11-15; self-service Scaffolding 2026-11-15; plugin governance usage < 30% offline, quarterly review; Backstage RBAC custom plugin + OPA 2026-09-15; 5 Champions 90 days 2027-03-31; quarterly QBR 4 times/year 2026-12-31 first. Compliance: GDPR / MLPS / SOC 2 / ISO 27001, audits 4 times/year, 2027-Q1 first SOC 2 Type II certification.

## 4. Long-term evolution and strategy
Long-term evolution: (1) AI-ified rules — ML recommends catalog + scaffolding, 2027-H2; (2) rules tied to business — new-hire cycle + NPS driven, 2027-Q4; (3) cross-company rule alignment — DevEx Summit, 2028-H1; (4) rule automation — CI/CD fully automated, 2027-Q4. 24-month goals: rules 100% automated, ML recommendation 80%+, cross-company alignment 1 time/year, new-hire cycle + NPS driven 100%.
