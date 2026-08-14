---
title: product requirement doc / PRD
tags: [leaf, product, prd]
category: producter/discovery/prd
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: reference
status: stable
review_cycle: quarterly
roles: [producter]
benefit: "PMs can understand and apply product requirement doc / prd with clear frameworks, actionable recommendations, and anti-pattern awareness"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - cross-references to related leaves and parent INDEX are present
related:
  - ../../../curator/templates/prd.md
  - ../../frameworks/README.md
---

# product requirement doc / PRD (product knowledge base) 

"> **As a** product manager, **I want to** discover user needs and validate product decisions, **so that** we build the right things for the right reasons.

Collects concrete product PRD instances. 

> Template see [../../../curator/templates/prd.md](../../../curator/templates/prd.md); this directory holds instances. 

## Included scope

- Each project PRD instance (by-requirement naming) 
- Cross-project general-requirement PRDs

## File type and naming

- `{requirement-name}-prd.md`: single-requirement PRD
- `{year}-{requirement-name}-prd.md`: by-year archive
- Naming uses English kebab-case

## Frontmatter Template

```yaml
---
title: Some Requirement PRD
tags: [PRD, project, requirement]
created: YYYY-MM-DD
updated: YYYY-MM-DD
last_verified: 2026-08-07
source: internal
type: summary
lifecycle: active
review_cycle: quarterly
related: [<related story or process>]
---
```

## Recommended writing structure

Reference [../../../curator/templates/prd.md](../../../curator/templates/prd.md) template: 

1. Background and target
2. User and scenario
3. Functional requirement
4. Non-functional requirement
5. Milestone
6. Measurement metric
7. Risk and dependency

## Already included

| file | content | status |
|---|---|---|
| [brd-agent-prd.md](./brd-agent-prd.md) | BRD Agent PRD — AI-assisted BRD generation with structured output, iterative refinement, and source traceability | active |
| [aichat-port-prd.md](./aichat-port-prd.md) | aiChat Port PRD — YiWeb sessionChat to YiVad migration with full feature parity and YiVad-native agent loop enhancements | active |
| [aicr-file-tree-prd.md](./aicr-file-tree-prd.md) | aicr File Tree PRD — hierarchical code navigation for AI code review with shared FileTree baseline component | active |
| [dashboard-api-portfolio.md](./dashboard-api-portfolio.md) | API portfolio dashboard — API lifecycle and governance visibility | active |

## Related leaf

- [../../../curator/templates/prd.md](../../../curator/templates/prd.md) — PRD template
- [../../frameworks](../../frameworks) — PM framework
- [../../projects/](../../projects/) — project stories
- [../../../engineer/learn/lessons/learn-pm-frameworks.md](../../../engineer/learn/lessons/learn-pm-frameworks.md) — scenario entry
