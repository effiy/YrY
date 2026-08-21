---
title: PRD Template — Product Requirement Document
tags: [template, prd, producter, requirements]
category: producter/discovery/prd
created: 2026-08-21
updated: 2026-08-21
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "PMs use this template to write consistent, reviewable Product Requirement Documents"
acceptance_criteria:
  - "8 sections covering problem, users, scope, success metrics, and acceptance criteria"
  - "Each section has a concrete example"
  - "Frontmatter spec for PRD files included"
related:
  - ./README.md
  - ../../frameworks/README.md
  - ../../INDEX.md
---

# PRD Template

> **PRD = Problem + Users + Scope + Success.** A PRD defines what to build, for whom, and how to measure success. It does NOT define how to build (→ engineer/) or which technology to use (→ leader/).

## Frontmatter

```yaml
---
title: "PRD: <feature name>"
tags: [prd, <project>, <domain>]
category: producter/discovery/prd
created: YYYY-MM-DD
updated: YYYY-MM-DD
source: internal
type: prd
status: draft | review | approved | implemented
lifecycle: active
review_cycle: quarterly
roles: [producter]
benefit: "<one sentence: what user need does this address?>"
related:
  - <links to related ADRs, engineering docs, or other PRDs>
---
```

## Template

### 1. Problem Statement

What problem does this solve? One paragraph. Be specific about the pain point.

**Example**: "Overseas after-sales teams spend 4-6 hours per BRD writing and formatting documents manually. The BRD format is standardized but the content varies per case. Automating the draft generation would reduce this to 15 minutes of review."

### 2. Users

Who has this problem? Be specific about roles and contexts.

| User | Role | Context | Current behavior |
|---|---|---|---|
| After-sales engineer | BRD author | Receives a case, needs to produce a BRD | Manually writes BRD in Word |
| BRD reviewer | Manager | Reviews BRDs for approval | Reads Word docs, comments inline |

### 3. Scope

What is in scope and out of scope for this feature?

**In scope**:
- BRD draft generation from case data + knowledge base
- Multi-language BRD output (Chinese + English)
- Editable output before finalization

**Out of scope**:
- BRD approval workflow (separate feature)
- BRD template customization (v2)
- Integration with external BRD systems

### 4. Success Metrics

How will we know this is successful? Each metric must be measurable.

| Metric | Target | Measurement |
|---|---|---|
| BRD draft time | ≤15 min (from 4-6 hours) | Time from case open to BRD draft ready |
| Draft acceptance rate | ≥80% of drafts accepted with ≤2 edits | Edit count per draft |
| User adoption | ≥70% of after-sales engineers use it | Usage tracking |

### 5. User Stories

Each story follows the format: "As a [role], I want to [action], so that [benefit]."

1. As an after-sales engineer, I want to generate a BRD draft from case data, so that I don't spend hours formatting documents manually.
2. As an after-sales engineer, I want to edit the generated draft before finalizing, so that I can correct any inaccuracies.
3. As a BRD reviewer, I want to see the source data alongside the draft, so that I can verify the draft's accuracy.

### 6. Functional Requirements

What must the system do? Each requirement is testable.

| ID | Requirement | Priority |
|---|---|---|
| F1 | Accept case data as input (case number, customer, product, issue description) | P0 |
| F2 | Retrieve relevant knowledge from YiKnowledge via RAG | P0 |
| F3 | Generate BRD draft in standard format with all required sections | P0 |
| F4 | Support Chinese and English output | P1 |
| F5 | Allow inline editing of the generated draft | P1 |
| F6 | Show source references for each generated section | P2 |

### 7. Acceptance Criteria

What must be true for this feature to be considered done?

- [ ] A case with complete input data produces a BRD draft with all required sections within 60 seconds
- [ ] The draft includes citations to source knowledge files
- [ ] The user can edit any section of the draft before finalizing
- [ ] Chinese and English output produce equivalent content (not machine-translated)
- [ ] The draft matches the standard BRD format (sections, order, terminology)

### 8. Dependencies

What must exist before this can be built?

| Dependency | Status | Owner |
|---|---|---|
| YiKnowledge BRD content (RAG source) | Active | curator |
| RAG hybrid retrieval (vector + BM25) | Done | engineer (YiAi) |
| BRD standard format definition | Needed | producter |
| LLM with sufficient context window | Done (Ollama, configurable model) | engineer (YiAi) |

## Anti-patterns

- **Writing implementation details in the PRD.** "Use a MongoDB aggregation pipeline" belongs in the technical review, not the PRD. The PRD describes what the user needs, not how to build it.
- **Vague success metrics.** "Better user experience" is not measurable. "Time to complete BRD reduced from 4 hours to 15 minutes" is.
- **No out-of-scope section.** Without clear boundaries, scope creeps. List what you're explicitly NOT building.