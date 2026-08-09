---
lifecycle: active
title: brd-2026-066-developer-experience: documents
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
- filename is descriptive verb-phrase, hyphens only, no underscores or digits
- body contains user story header + 7 fixed-order sections
review_cycle: quarterly
tacit: false
related: []
status: stable
type: brd
---

# BRD-2026-066 Internal Developer Platform and DevEx build — project charter and scope

> **As an** engineer, **I want to** documents, **so that** project context preserved.

## 1. Project background and target
Project background: In 2026-Q2, new hire onboarding took 14 days (industry P50 5 days), R&D satisfaction NPS was 12 (industry P50 30), documentation scattered across 3 locations, 5 inconsistent scaffolds, no Service Catalog, self-service at 0%. CTO starts DevEx Platform build; target within 12 months: new hire 5 days + NPS 50 + self-service 80%. Scope: Backstage MVP + Service Catalog + unified scaffold (yeoman) + unified documentation (MkDocs) + self-service Scaffolding + Tech Radar + Scorecard + 5 Champions. Excludes: AI assistance (2027-Q2), Multi-cloud IDP (2028-H1), DevEx Platform team (2028-H1).

## 2. Quantitative metrics and data
Quantitative data: 5 teams × 18 people = 90 people; 3 AWS accounts + 217 resources (EC2 48 + RDS 12 + S3 18 + Lambda 35 + ALB 8 + NAT 4 + EBS 30 + CloudWatch Logs 12 + others 50); documentation 280 articles scattered across 3 locations (Wiki 200 + Confluence 50 + README 30), information overlap 40%; 5 inconsistent scaffolds; Service Catalog 0; self-service 20%; new hire 14 days; NPS 12; platform adoption 0%; Champions 0. 12-month target: new hire 5 days (down 64%); NPS 50 (up 317%); self-service 80%; unified documentation in 1 location; unified scaffold 1 set; Catalog 100% coverage; 5 Champions; 95% adoption.

## 3. Advance path and challenges
Advance path: (1) 2026-08-04 CTO initiates + CFO co-approval; (2) 2026-08-05 project kickoff, W1 resource inventory; (3) 2026-09-15 Backstage MVP + Service Catalog launch, 65% adoption; (4) 2026-10-15 unified scaffold yeoman shared by 5 teams; (5) 2026-11-15 unified documentation MkDocs + self-service Scaffolding; (6) 2026-12-31 Tech Radar + 5 Champions recruited; (7) 2027-03-31 Champions complete 90 days + 85% adoption; (8) 2027-12-31 self-service 80% + new hire 5 days + NPS 50. Challenges: R&D resists new tools (resolve via Champion mentoring + Workshop + documentation onboarding); Platform and product disconnect (resolve via Champions + monthly committee); budget approval (resolve via ROI 0.76x + intangible value + long-term value persuading CFO).

## 4. Long-term evolution and strategy
Long-term evolution: (1) AI-assisted DevEx — natural language search + recommendation + self-heal, 2027-Q2; (2) Golden Path full coverage — 80% self-service, 2027-Q3; (3) Multi-cloud IDP — AWS + Aliyun, 2028-H1; (4) DevEx Platform team — supports multiple business lines, 2028-H1. 24-month target: self-service 80% + AI assistance 20% + new hire 3 days + NPS 60 + Multi-cloud IDP piloted on 1 business line.
