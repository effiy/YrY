---
lifecycle: active
category: engineer/projects/yipet/brd/brd-2026-064-cost-optimization
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

# BRD-2026-064 Cost Optimization and FinOps Platform Build-out — Project Charter and Scope

> **As an** engineer, **I want to** documents, **so that** project context preserved. 

## 1. Project Background and Goals
Project background: In 2026-Q1, the monthly cloud bill surged from $1.2K to $3.8K, with no way to attribute it by business unit, R&D indifferent to cost, and procurement and ops disconnected. The CFO initiated the FinOps Platform build-out, targeting a 50% drop in the monthly bill within 12 months and quantifiable per-unit cost. Scope: Cloudability multi-cloud aggregation + self-built exporter real-time alerts + mandatory Tag enforcement + Cost Center + Champion mechanism + optimization closed loop + quarterly QBR. Not included: multi-cloud onboarding (2027 H1), AI-driven optimization (2027 H1), unit-economics platform (2027 H2). 

## 2. Quantitative Metrics and Data
Quantitative data: 5 teams x 18 people = 90 people; 3 AWS accounts + 217 resources (EC2 48 + RDS 12 + S3 18 + Lambda 35 + ALB 8 + NAT 4 + EBS 30 + CloudWatch Logs 12 + other 50); monthly bill $3.8K (EC2 $1.6K + RDS $800 + S3 $200 + Lambda $400 + ALB $200 + NAT $200 + EBS $100 + CloudWatch $100 + other $200); Tag completeness rate 42%; Cost Center coverage rate 0%; optimization execution rate 30%; Champion 0 people; QBR 0 times. 12-month target: bill $1.9K, Tag 99%+, Cost Center 99%+, optimization 80%+, Champion 5 people, QBR 4 times. 

## 3. Advancement Path and Challenges
Advancement path: (1) 2026-08-04 CFO initiated + CTO joint approval; (2) 2026-08-05 project kick-off, W1 resource inventory; (3) 2026-08-15 SCP Tag enforcement launch; (4) 2026-09-01 Champion 5-person recruitment + Cost Center OKR linkage; (5) 2026-09-30 Cloudability + self-built alert launch; (6) 2026-10-01 first QBR; (7) 2026-12-31 monthly bill < $2K; (8) 2027-06-30 monthly bill < $1K. Challenges: R&D resists Tags (mitigated by SCP + 24h stopgap); finance cares about totals not usage (mitigated by QBR invitations); procurement committee inclusion meets resistance (mitigated by CTO direct intervention). 

## 4. Long-term Evolution and Strategy
Long-term evolution: (1) multi-cloud onboarding - Alibaba Cloud, Tencent Cloud, Huawei Cloud, 2027 H1; (2) AI-driven optimization - ML parses bills + recommends optimization items, 2027 H2; (3) unit-economics platform - cost per request, cost per user, 2027 H2; (4) FinOps Platform team - supports multiple business lines, 2028 H1. 24-month target: monthly bill < $500, per-unit cost reduction 50%+, multi-cloud unified dashboard, FinOps Platform team established. 
