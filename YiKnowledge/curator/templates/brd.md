---
title: BRD Template — Business Requirements Document
aliases: [brd-template, business-requirements-template]
tags: [template, brd, business, requirements, executiver]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [executiver, producter]
benefit: "Executives and product leaders write consistent business cases that producters can translate into PRDs"
acceptance_criteria:
  - "5 sections: Executive Summary, Business Opportunity, Market Analysis, Financial Projection, Go-to-Market"
  - "distinguishes clearly from PRD (business case vs. product spec)"
  - "includes ROI and success criteria at the business level"
related:
  - ./README.md
  - ./prd.md
  - ./knowledge-leaf.md
  - ../../executiver/strategy/
---

# BRD Template — Business Requirements Document

> **When to use:** Before a PRD. A BRD answers *why* the business should invest in this — market opportunity, financial projection, strategic alignment. The PRD answers *what* to build.

## 1. Executive Summary

> One paragraph that a busy executive can read and understand the opportunity.

{{What is the opportunity? What is the expected outcome? Why now?}}

## 2. Business Opportunity

### Problem Statement

{{What market gap or customer pain point does this address?}}

### Target Market

| Segment | Size | Growth rate | Our addressable share |
|---|---|---|---|
| {{Segment}} | {{TAM/SAM/SOM}} | {{%}} | {{%}} |

### Competitive Landscape

| Competitor | Strengths | Weaknesses | Our advantage |
|---|---|---|---|
| {{Competitor 1}} | {{What they do well}} | {{Where they fall short}} | {{Why we win}} |

## 3. Strategic Alignment

> How does this fit into the org's broader strategy?

- **OKR alignment:** {{Which OKR does this serve?}}
- **Strategic pillar:** {{Which company strategy does this support?}}

## 4. Financial Projection

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Revenue | {{$}} | {{$}} | {{$}} |
| Cost | {{$}} | {{$}} | {{$}} |
| Net | {{$}} | {{$}} | {{$}} |

**Investment required:** {{$ and resources}}

**Breakeven:** {{YYYY-MM-DD or "N months after launch"}}

## 5. Go-to-Market

### Launch Plan

| Phase | Timeline | Key activities |
|---|---|---|
| Alpha | {{dates}} | {{activities}} |
| Beta | {{dates}} | {{activities}} |
| GA | {{dates}} | {{activities}} |

### Success Criteria

| Criterion | Target | Measurement |
|---|---|---|
| {{Business metric (e.g., MAU, revenue)}} | {{Target}} | {{How to measure}} |
| {{Adoption metric}} | {{Target}} | {{How to measure}} |

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {{Business risk}} | Low/Med/High | Low/Med/High | {{Mitigation}} |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| BRD that reads like a PRD | Duplicates product work; confuses business case with feature spec | Keep BRD at the business level: market, money, strategy |
| No financial projection | Can't evaluate if the investment is worth it | At minimum, estimate cost and expected revenue range |
| Vague competitive analysis ("we're better") | Doesn't help producters position the feature | Be specific about competitor weaknesses and our advantages |