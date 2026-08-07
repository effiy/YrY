---
title: BRD-2026-064 Cost optimisation and FinOps platform build
lifecycle: active
key: brd_brd-engineer_msfe6wt9lwe2x2
tags:
- engineer
- yipet
- finops
- cost-optimization
- qbr
- l3-maturity
brd_id: BRD-2026-064
project: yipet
domain: Cost Optimization (FinOps)
quarter: 2026 Q3
priority: p1
status: in_progress
owner: FinOps Team
tech_stack: AWS Cost Explorer, Tag Policy, Cost Center OKR, QBR, Champion, AI Predict
key_metrics: monthly bill $3.8K→$1.9K (down 50%); cost attribution rate 42%→99%+ (up 57pp); Tag coverage 42%→99%+; optimisation execution rate
  80%+; quarterly QBR 100% held; unit cost -30%; ROI 1.4x
acceptance_criteria: '1. Monthly bill Q3 end < $2K, Q4 end < $1.5K, 2027-Q2 < $1K

  2. Cost attribution rate 99%+, Tag coverage 99%+

  3. Champion 5-person 90-day plan completed, coverage 100% of team

  4. Optimisation execution rate 80%+, quarterly QBR 100% held

  5. Unit cost down 30% (cost per request)

  6. ROI 1.4x, payback within 12 months'
stakeholders: CTO Office (decision + OKR 15%); FinOps Team 2 FTE (execution); 5 business teams (consumption); SRE/DevOps (ops);
  Finance (budget + tracking); HR (recruiting); Champion 5 people (promotion); AWS TAM (support)
kb_path: engineer/projects/yipet/brd/brd-2026-064-cost-optimization
notes: Through FinOps platform + Cost Center OKR + quarterly QBR + Champion 5-person 90-day plan, reduce monthly bill from $3.8K
  to $1.9K, within 3 years cost attribution rate 99%+, Tag coverage 99%+, unit cost down 30%, ROI 1.4x.
review_cycle: quarterly
tacit: false
related: []
---

# BRD-2026-064 Cost optimisation and FinOps platform build

**BRD ID**: BRD-2026-064  |  **Project**: yipet  |  **Domain**: Cost Optimization (FinOps)  |  **Quarter**: 2026 Q3
**Priority**: P1  |  **Status**: In Progress  |  **Owner**: FinOps Team
**KB Source**: engineer/projects/yipet/brd/brd-2026-064-cost-optimization

## Context
Through FinOps platform + Cost Center OKR + quarterly QBR + Champion 5-person 90-day plan, reduce monthly bill from $3.8K to $1.9K, within 3 years cost attribution rate 99%+, Tag coverage 99%+, unit cost down 30%, ROI 1.4x.

## Objectives & Key Metrics
Monthly bill $3.8K→$1.9K (down 50%); cost attribution rate 42%→99%+ (up 57pp); Tag coverage 42%→99%+; optimisation execution rate 80%+; quarterly QBR 100% held; unit cost -30%; ROI 1.4x

## Acceptance Criteria
1. Monthly bill Q3 end < $2K, Q4 end < $1.5K, 2027-Q2 < $1K
2. Cost attribution rate 99%+, Tag coverage 99%+
3. Champion 5-person 90-day plan completed, coverage 100% of team
4. Optimisation execution rate 80%+, quarterly QBR 100% held
5. Unit cost down 30% (cost per request)
6. ROI 1.4x, payback within 12 months

## Stakeholders
CTO Office (decision + OKR 15%); FinOps Team 2 FTE (execution); 5 business teams (consumption); SRE/DevOps (ops); Finance (budget + tracking); HR (recruiting); Champion 5 people (promotion); AWS TAM (support)

## Milestones
M1 (2026 Q3): FinOps team formed + Champion recruiting + Cost Center OKR launch
M2 (2026 Q4): Tag enforcement + QBR first held + monthly bill < $1.5K
M3 (2027 Q1): Champion 5 people complete W12 + monthly bill < $1K
M4 (2027 Q2): AI prediction pilot + monthly bill < $1K
M5 (2027 Q3-Q4): unit cost down 30% + ROI 1.4x achieved

## Risks
1. Aggressive goal (12-month 50% reduction) (P1) — CTO quarterly OKR weight 15% + team bonus pool
2. Champion development slow (P1) — 90-day plan + 4 workshops
3. Tag enforcement resistance high (P1) — SCP + 30-day alert + Champion training
4. Cost Center OKR linkage resistance (P1) — R&D thinks cost is ops' job
5. First QBR R&D not prepared with data (P2) — Champion submits 2 weeks before quarter end
6. ROI 1.4x not high (P2) — convince via savings amount + long-term value

## Long-term Evolution
After 3 years: monthly bill $1K, cost attribution rate 99%+, Tag coverage 99%+, unit cost down 30%, optimisation execution rate 80%+, quarterly QBR 100% held, Champion coverage 100% of team.

## References
- **KB Source**: `YiKnowledge/engineer/projects/yipet/brd/brd-2026-064-cost-optimization`
- **Sub-files**: objectives / acceptance / milestones / risks / rules / stakeholders / approvals / documents
