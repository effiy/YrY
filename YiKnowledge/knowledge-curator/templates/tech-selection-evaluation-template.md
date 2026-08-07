---
title: tech selection evaluation template
lifecycle: active
tags:
- template
- tech selection
- evaluation
- architecture
- decision
category: knowledge-curator/templates
created: 2026-07-30
updated: 2026-07-30
last_verified: 2026-08-07
source: internal
type: template
status: stable
roles:
- knowledge-curator
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

# tech selection evaluation template

> **As a** knowledge curator, **I want to** tech selection evaluation template, **so that** template reusable. 

> Usage method: create this file when performing tech selection for a capability. Paired with qb-row "Tech selection evaluation" one-click prompt: Candidate options: xxx / Evaluation dimensions: performance / cost / ecosystem / maintainability / Constraints: xxx. This template tabulates these fields for easy horizontal comparison. Copy to `resources/templates/tech-selection-{capability-name}.md`. 

## 1. Basic info

| Field | Content |
|------|------|
| Evaluated capability |  (example: frontend bundler)  |
| Evaluator |  (example: frontend lead)  |
| Reviewer |  (example: architecture team + ops)  |
| Date |  (example: 2026-07-28)  |
| related ADR |  (example: ADR-007)  |
| related project |  (example: YiVad)  |
| Expected conclusion date |  (example: 2026-08-01)  |

## 2. Candidate Options

| No. | Candidate | Source | Version | License |
|---|---|---|---|---|
| C1 | Rsbuild | Rspack-based | 1.0 | MIT |
| C2 | Webpack | Mainstream | 5.93 | MIT |
| C3 | Keep Vite | Current | 8.x | MIT |
| C4 | Turbopack | Rust-based | beta | MIT |

## 3. Evaluation Dimensions

### 3.1 Performance

| Candidate | dev startup (s) | build time (s) | HMR stability | output size (MB) | score |
|---|---|---|---|---|---|
| C1 Rsbuild | 18 | 12 | ⭐⭐⭐⭐ | 4.2 | ⭐⭐⭐⭐⭐ |
| C2 Webpack | 65 | 35 | ⭐⭐⭐⭐ | 4.8 | ⭐⭐ |
| C3 Vite | 90 | 18 | ⭐⭐⭐ | 4.2 | ⭐⭐⭐⭐ |
| C4 Turbopack | 12 | 10 | ⭐⭐ | 4.0 | ⭐⭐⭐ |

### 3.2 Cost

| Candidate | migration cost (person-days) | learning cost | ops cost | score |
|---|---|---|---|---|
| C1 Rsbuild | 12 | low | medium | ⭐⭐⭐⭐ |
| C2 Webpack | 25 | medium | medium | ⭐⭐ |
| C3 Vite | 0 | none | low | ⭐⭐⭐⭐⭐ |
| C4 Turbopack | 20 | medium | high | ⭐⭐⭐ |

### 3.3 Ecosystem

| Candidate | plugin count | community activity | documentation quality | long-term maintenance | score |
|---|---|---|---|---|---|
| C1 Rsbuild | medium | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| C2 Webpack | many | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| C3 Vite | many | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| C4 Turbopack | few | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |

### 3.4 Maintainability

| Candidate | configuration complexity | debug experience | compatibility with current state | score |
|---|---|---|---|---|
| C1 Rsbuild | medium | ⭐⭐⭐⭐ | high (Vite config can downgrade)  | ⭐⭐⭐⭐ |
| C2 Webpack | high | ⭐⭐⭐ | medium | ⭐⭐⭐ |
| C3 Vite | low | ⭐⭐⭐⭐⭐ | — | ⭐⭐⭐⭐⭐ |
| C4 Turbopack | high | ⭐⭐ | low | ⭐⭐ |

### 3.5 Other dimensions (extend as needed)

| Dimension | Candidate C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Security (CVE history)  | — | — | — | — |
| multi-platform support | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| internationalisation (i18n)  | — | — | — | — |

## 4. Constraints

| type | constraint | source | hard constraint |
|---|---|---|---|
| time | complete migration within 2 weeks | business schedule | yes |
| team | only 6 frontend engineers | HR | yes |
| compatibility | must support Vue 3 + svg-sprite | current state | yes |
| environment | Node 22 | infrastructure | yes |
| budget | 0 external procurement cost | finance | no |

## 5. Weighted score summary

| Candidate | performance (30%) | cost (20%) | ecosystem (20%) | maintainability (20%) | other (10%) | total |
|---|---|---|---|---|---|---|
| C1 Rsbuild | 1.50 | 0.80 | 0.60 | 0.80 | 0.40 | **4.10** ✅ |
| C2 Webpack | 0.60 | 0.40 | 1.00 | 0.60 | 0.30 | 2.90 |
| C3 Vite | 1.20 | 1.00 | 0.80 | 1.00 | 0.30 | 4.30 |
| C4 Turbopack | 0.90 | 0.60 | 0.40 | 0.40 | 0.20 | 2.50 |

## 6. Conclusion and recommendation

- **Recommended**: C1 Rsbuild
- **Reason**: clear performance advantage and rapidly growing ecosystem; high Vite compatibility keeps migration cost controlled. 
- **Secondary choice**: C3 keep Vite (zero cost when performance is acceptable) 
- **Not recommended**: C4 Turbopack (high beta risk) 

## 7. Risks and mitigation

| risk | mitigation |
|---|---|
| plugin missing | self-write svg-sprite + views-glob |
| incomplete configuration documentation | ADR-007 keep migration notes |

## 8. Decision

| Item | Content |
|---|---|
| Decision date |  (example: 2026-07-28)  |
| Decision maker |  (example: CTO)  |
| Adopted candidate | C1 Rsbuild |
| related ADR | ADR-007 |
| Implementation period | 2026-07-15 ~ 2026-07-28 |
| acceptance metrics | dev startup < 30s; HMR failure rate < 3% |
