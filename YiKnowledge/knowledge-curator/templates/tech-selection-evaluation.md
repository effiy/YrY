---
title: tech selectionassessmentTemplate
lifecycle: active
tags:
- Template
- tech selection
- assessment
- Architecture
- Decision
category: knowledge-curator/templates
created: 2026-07-30
updated: 2026-07-30
last_verified: 2026-08-07
source: internal
type: template
status: stable
roles:
- knowledge-curator
- engineer
- product-manager
- tech-lead
- ai-engineer
- new-hire
benefit: template reusable
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
review_cycle: quarterly
tacit: false
related:
  - ./INDEX-resources.md
  - ./README-resources.md
  - ./README-templates.md
  - ../README.md
  - ../INDEX.md
---

# tech selectionassessmentTemplate

> **As a** knowledge curator, **I want to** tech selection evaluation, **so that** template reusable.

> Usage: create a tech selection assessment for an item capability by creating this file. Pairs with qb-row "Tech selection evaluation" one-click prompt: Candidate options: xxx / Evaluation dimensions: performance / cost / ecosystem / maintainability / Constraints: xxx. This template tabulates these fields for horizontal comparison. Copy to `resources/templates/tech-selection-{capability-name}.md`.

## 1. Basic information

| field | content |
|------|------|
| assessment capability | (example: frontend build tool) |
| assessor | (example: frontend lead) |
| reviewer | (example: Architecture team + ops) |
| date | (example: 2026-07-28) |
| Related ADR | (example: ADR-007) |
| Related project | (example: YiVad) |
| expected conclusion date | (example: 2026-08-01) |

## 2. Candidate options (Candidate Options)

| No. | candidate | source | version | License |
|---|---|---|---|---|
| C1 | Rsbuild | Rspack-based | 1.0 | MIT |
| C2 | Webpack | mainstream | 5.93 | MIT |
| C3 | retain Vite | current | 8.x | MIT |
| C4 | Turbopack | Rust-based | beta | MIT |

## 3. assessment dimensions (Evaluation Dimensions)

### 3.1 performance Performance

| candidate | dev startup(s) | buildtime(s) | HMR stability | output size(MB) | scoring |
|---|---|---|---|---|---|
| C1 Rsbuild | 18 | 12 | ⭐⭐⭐⭐ | 4.2 | ⭐⭐⭐⭐⭐ |
| C2 Webpack | 65 | 35 | ⭐⭐⭐⭐ | 4.8 | ⭐⭐ |
| C3 Vite | 90 | 18 | ⭐⭐⭐ | 4.2 | ⭐⭐⭐⭐ |
| C4 Turbopack | 12 | 10 | ⭐⭐ | 4.0 | ⭐⭐⭐ |

### 3.2 cost Cost

| candidate | migration cost(person-days) | learning cost | ops cost | scoring |
|---|---|---|---|---|
| C1 Rsbuild | 12 | low | medium | ⭐⭐⭐⭐ |
| C2 Webpack | 25 | medium | medium | ⭐⭐ |
| C3 Vite | 0 | none | low | ⭐⭐⭐⭐⭐ |
| C4 Turbopack | 20 | medium | high | ⭐⭐⭐ |

### 3.3 ecosystem Ecosystem

| candidate | plugin count | community activity | documentation quality | long-term maintenance | scoring |
|---|---|---|---|---|---|
| C1 Rsbuild | medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| C2 Webpack | many | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| C3 Vite | many | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| C4 Turbopack | few | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

### 3.4 maintainability Maintainability

| candidate | config complexity | debug experience | compatible with current state | scoring |
|---|---|---|---|---|
| C1 Rsbuild | medium | ⭐⭐⭐⭐ | high (Vite config degradable) | ⭐⭐⭐⭐ |
| C2 Webpack | high | ⭐⭐⭐ | medium | ⭐⭐⭐ |
| C3 Vite | low | ⭐⭐⭐⭐⭐ | — | ⭐⭐⭐⭐⭐ |
| C4 Turbopack | high | ⭐⭐ | low | ⭐⭐ |

### 3.5 other dimensions (extend as needed)

| dimension | candidate C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| security (CVE history) | — | — | — | — |
| multi-platform support | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| internationalisation (i18n) | — | — | — | — |

## 4. constraints (Constraints)

| type | constraint | source | hard constraint |
|---|---|---|---|
| time | complete migration within 2 weeks | business schedule | yes |
| team | only 6 frontend people | HR | yes |
| compatibility | must support Vue 3 + svg-sprite | current state | yes |
| environment | Node 22 | infrastructure | yes |
| budget | 0 procurement cost | finance | no |

## 5. weighted scoring summary

| candidate | performance(30%) | cost(20%) | ecosystem(20%) | maintainability(20%) | other(10%) | total |
|---|---|---|---|---|---|---|
| C1 Rsbuild | 1.50 | 0.80 | 0.60 | 0.80 | 0.40 | **4.10** ✅ |
| C2 Webpack | 0.60 | 0.40 | 1.00 | 0.60 | 0.30 | 2.90 |
| C3 Vite | 1.20 | 1.00 | 0.80 | 1.00 | 0.30 | 4.30 |
| C4 Turbopack | 0.90 | 0.60 | 0.40 | 0.40 | 0.20 | 2.50 |

## 6. conclusion and recommendation

- **recommendation**: C1 Rsbuild
- **rationale**: performance advantage is explicit and ecosystem growing fast; Vite compatibility is high so migration cost is controllable.
- **runner-up**: C3 retain Vite (performance acceptable, zero cost)
- **not recommended**: C4 Turbopack (beta risk high)

## 7. Risk and Mitigation

| Risk | Mitigation |
|---|---|
| plugin missing | self-write svg-sprite + views-glob |
| config documentation incomplete | ADR-007 retention migration notes |

## 8. resolution

| item | content |
|---|---|
| resolution date | (example: 2026-07-28) |
| resolver | (example: CTO) |
| adopted candidate | C1 Rsbuild |
| Related ADR | ADR-007 |
| implementation period | 2026-07-15 ~ 2026-07-28 |
| Acceptance metric | dev startup < 30s; HMR failure rate < 3% |
