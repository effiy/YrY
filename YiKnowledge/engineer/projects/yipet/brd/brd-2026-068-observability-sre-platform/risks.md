---
lifecycle: active
title: brd-2026-068-observability-sre-platform: risks
created: 2026-08-07
tags: [yipet, brd]
updated: 2026-08-09
category: engineer/projects/yipet/brd/brd-2026-068-observability-sre-platform
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

# brd-2026-068 Observability & SRE Platform — risk

> **As an** engineer, **I want to** risks, **so that** project context preserved. 

## 1. Technical risk
- Metric cardinality explosion (3.2 million active series)
- Sample rate drift causing SLO misjudgment
- Object storage cost growing 220% annually
- PII log leakage compliance risk

## 2. Organizational risk
- Blurred responsibility boundary between SRE and business development
- Embedded SRE dual-line reporting
- Error Budget business acceptance
- Oncall fatigue and attrition

## 3. Risk mitigation
- Cardinality governance + sampling strategy
- PII desensitization Processor
- RACI matrix + Error Budget negotiation
- Oncall rotation + fatigue monitoring
