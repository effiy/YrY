---
title: Competitor Analysis Template
aliases:
- competitor-analysis-template
- competitor-profile-template
tags:
- competitor-analysis
- template
- product-management
- SWOT
category: executive/industry/competitors
created: 2024-01-15
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: yearly
roles:
- executive
- product-manager
benefit: industry visible
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./llm-vendor-landscape.md
- ../README.md
- ../../strategy/README.md
tacit: false
---

# Competitor Analysis Template

> **As an** executive, **I want to** run competitor analysis, **so that** we gain industry visibility.

> Copy to `competitors/{competitor-name}-analysis.md` and fill in each field. Recommend refreshing once per quarter.

## Summary

- Eight-section competitor profile: basic information → feature comparison → SWOT → pricing → reputation → technology → action items → tracking.
- Enforces quantitative scoring (5-star scale) and executable action items (owner + due date + priority) to avoid vague descriptions.
- Complements the "LLM Vendor Landscape": use this template for deep dives on a single competitor, and the landscape for horizontal overview.

## Core viewpoints

- **Structured comparison precedes subjective judgment** — feature matrix + SWOT + pricing tables are the minimum information density for competitor analysis.
- **Action items must be trackable** — each one has an ID, owner, due date, and priority; otherwise nothing gets fixed in the half-year retrospective.
- **Quarterly refresh is a hard cadence** — competitor features, pricing, and reputation change fast; annual updates are effectively stale.

## Key information

### 1. Basic information

| dimension | content |
|------|------|
| Competitor name | (e.g. Cursor) |
| company | (e.g. Anysphere) |
| Target user | (e.g. developer / IDE user) |
| Pricing model | (e.g. $20/month Pro; $40/month Business) |
| Estimated size | (e.g. ARR $100M / 10M users / 200-person team) |
| Launch date | (e.g. 2023-03) |
| Latest version | (e.g. v0.42) |
| Analysis date | (e.g. 2026-07-30) |
| Analyst | (e.g. John Smith) |

### 2. Feature comparison

| feature | ours | competitor A | competitor B | notes |
|------|------|--------|--------|------|
| core feature 1 | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | |
| core feature 2 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | |
| differentiating feature | ✅ | ❌ | ❌ | |
| ecosystem integrations | 5 | 30 | 10 | |

(scoring: ⭐ failing / ⭐⭐ fair / ⭐⭐⭐ average / ⭐⭐⭐⭐ good / ⭐⭐⭐⭐⭐ industry-leading)

### 3. SWOT analysis (competitor perspective)

- **Strengths**: (e.g. brand recognition, capital, technology lead)
- **Weaknesses**: (e.g. pricing too high, no private deployment, slow response)
- **Opportunities**: (e.g. vertical industry not covered, compliance gaps)
- **Threats**: (e.g. upstream LLM vendor entering the same space, open-source replacement)

### 4. Pricing and business model

| dimension | ours | competitor A | competitor B |
|------|------|--------|--------|
| billing model | subscription | subscription | usage-based |
| entry price | | | |
| enterprise price | | | |
| free tier | | | |
| ROI cadence | | | |

### 5. User reputation (NPS / app stores / communities)

| channel | score | frequent praise | frequent complaints |
|------|------|---------|---------|
| G2 | | | |
| Capterra | | | |
| App Store | | | |
| Reddit / X | | | |

### 6. Technology and architecture (if public information available)

- Base model / in-house development
- Deployment mode (cloud / private / open source)
- Context window, speed, price
- Integration ecosystem (MCP / plugin / API)

### 7. Conclusions and action items

| ID | action item | owner | due date | priority |
|------|--------|--------|----------|--------|
| 1 | (e.g. close feature gap X) | | | P0 |
| 2 | (e.g. pitch differentiator Y) | | | P1 |
| 3 | (e.g. follow up on integration Z) | | | P2 |

### 8. Follow-up tracking

- [ ] Monthly refresh of feature comparison
- [ ] Quarterly refresh of pricing and reputation
- [ ] Update within 7 days of major version release

## Action recommendations

1. Copy this template to `competitors/{competitor-name}-analysis.md` and start with basic information and feature comparison.
2. Use the 5-star quantitative scale; avoid vague phrasing like "about the same" or "fairly good".
3. Action items must have an owner + due date + priority; enter them into the task system for tracking.
4. Refresh features monthly, pricing and reputation quarterly, and update within 7 days of any major version.

## Anti-patterns

- **Only qualitative, no quantitative** — "strong brand" or "high price" without data is unusable for decisions.
- **Action items without owners** — "team follows up" means no one follows up.
- **Compared once, never refreshed** — competitors change every six months; an annually updated profile is effectively stale.
- **SWOT as self-talk** — without data and user reputation, SWOT degrades into subjective judgment.

## Related

- Same category: [llm-vendor-landscape-summary.md](./llm-vendor-landscape.md) — horizontal panorama of LLM vendors
- Upstream: [../README.md](../README.md) — competitors leaf entry
- Downstream: [../../strategy/README.md](../../strategy/README.md) — strategy framework implementation
