---
title: Case study research template
aliases:
- case-study-template
- use-case-template
tags:
- Case study
- Template
- knowledge accumulate
category: product-manager/strategy
created: 2026-08-03
updated: 2026-08-07
source: internal
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
last_verified: 2026-08-07
roles:
- product-manager
- ai-engineer
benefit: case lessons absorbed
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./ai-customer-service-cases.md
- ./ai-after-sales-cases.md
tacit: false
---

# Case study research template

> **As a** product manager, **I want to** case study, **so that** case lessons absorbed. 

> Copy to `use-cases/{company}-{scenario}-case.md`, fill in field by field. Customer-insight class case study `tacit: true`, AI priority recall. 

## Summary

- Five-section case study: background → solution → quantitative effect → insights → source verification. 
- Effects must be quantitative (before / after / improvement), no data equals no case study. 
- Customer-insight class case study tagged `tacit: true`, AI recall priority boosted. 

## Core viewpoints

- **Quantitative is the lifeblood of case study** — without before/after data, case study degenerates into soft article, decision unusable. 
- **Insights split into positive and negative** — "can borrow" and "should not copy" equally important, avoid blind copying. 
- **Source and verification determine credibility** — original link + contact + `last_verified` all indispensable. 

## Key information

### Frontmatter Template

```yaml
---
title: {company} {scenario} landing case
tags: [case, {industry}, {technology}]
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: <original link or internal>
type: summary
lifecycle: active
last_verified: YYYY-MM-DD
review_cycle: monthly
tacit: true          # customer insight class
related:
  - ./ai-after-sales-cases.md
  - ./ai-customer-service-cases.md
  - ./dashboard-innovation-portfolio.md
  - ../README.md
  - ../INDEX.md
---
```

### 1. Background

- Customer business
- Pain points
- Scale (user count / ticket count / ...) 

### 2. Solution

- Tech stack
- Architecture diagram
- Key process

### 3. Effect (quantitative) 

| metric | before | after | improvement |
|---|---|---|---|
| | | | |

### 4. Insights and borrowable points

- What this team can borrow
- Parts that should not be copied

### 5. Source and verification

- Original link
- Contact (if internal) 
- last_verified

## Action recommendations

1. Copy this template to `use-cases/{company}-{scenario}-case.md`, fill background and solution first. 
2. Effect table must fill before / after / improvement three columns; if no data, annotate "to be supplemented" and set `status: draft`. 
3. Insight paragraph must write both sides (borrowable / should not copy), avoid blind copying. 
4. `last_verified` is required; half-year unverified switches to `status: deprecated`. 
5. Customer-insight class case study tagged `tacit: true`, let AI recall priority. 

## Anti-patterns

- **Effect only qualitative** — "efficiency significantly improved" with no data, decision unusable. 
- **Insights only positive** — only say "borrowable" without writing "should not copy", team blindly applies and incidents happen. 
- **No source** — case study becomes fiction story, credibility drops to zero. 


- **Filling in the template from second-hand summaries without verifying the original source** — each retelling introduces errors and omissions; always trace back to the original case study, report, or interview before writing.
- **Writing case studies without defining a target audience** — an executive summary needs different depth and language than an engineering implementation guide; write for a specific reader.
- **Treating `last_verified` as optional metadata** — a case study with outdated data actively misleads decisions; any case study not verified within 6 months must be deprecated.
- **Copying a solution without understanding the context that made it work** — BMW's diagnostic AI works at BMW's scale with BMW's data infrastructure; blindly copying the approach at a different scale breaks.
- **Collecting case studies without connecting each one to a specific product decision** — case studies without action items are shelfware; every case study must explicitly link to at least one decision it informs.

## Related

- Same category: [./ai-customer-service-cases.md](./ai-customer-service-cases.md) — customer service case study
- Same category: [./ai-after-sales-cases.md](./ai-after-sales-cases.md) — after-sales case study
- Upstream: [./README.md](./) — use-cases leaf entry
