---
title: PRD Template — Product Requirements Document
aliases: [prd-template, product-requirements-template]
tags: [template, prd, product, requirements, producter]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, leader, engineer]
benefit: "Producters write consistent PRDs that downstream roles (leader, engineer) can consume directly"
acceptance_criteria:
  - "6 sections: Background, User Problem, Scope, Success Metrics, Risks, Timeline"
  - "every section has a placeholder and a 'why this matters' note"
  - "includes anti-patterns specific to PRD writing"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./brd.md
  - ../../producter/discovery/prd/
---

# PRD Template — Product Requirements Document

> **When to use:** Before any significant feature work begins. A PRD defines *what* to build and *why* — it does not specify *how* to build it (→ tech-design) or *which technology* to use (→ ADR).

## 1. Background

> Why are we doing this? What business problem or user need drives this feature?

{{2-3 sentences on the business context. Link to the BRD if one exists.}}

## 2. User Problem

> Who has this problem, and how do we know?

- **Target user:** {{user persona or role}}
- **Problem statement:** {{one sentence: "As a [user], I want to [goal] so that [reason]"}}
- **Evidence:** {{user research, support tickets, analytics data}}

## 3. Scope

> What's in and what's out? Be explicit about boundaries.

### In scope

- {{Feature/capability 1}}
- {{Feature/capability 2}}

### Out of scope (for this PRD)

- {{Thing we're explicitly NOT building}}
- {{Thing deferred to a future PRD}}

### User stories

| Priority | Story | Acceptance criteria |
|---|---|---|
| P0 | {{As a [user], I can [action]}} | {{Verifiable condition}} |
| P1 | {{As a [user], I can [action]}} | {{Verifiable condition}} |

## 4. Success Metrics

> How will we know this is working? Define measurable outcomes.

| Metric | Baseline | Target | Measurement method |
|---|---|---|---|
| {{Metric name}} | {{Current value}} | {{Target value}} | {{How to measure}} |

## 5. Risks and Dependencies

> What could go wrong, and what do we depend on?

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| {{Risk description}} | Low/Med/High | Low/Med/High | {{How we reduce this risk}} |

**Dependencies:** {{List teams, systems, or external factors this PRD depends on}}

## 6. Timeline

> Target dates. Not commitments — planning assumptions.

| Milestone | Target date | Owner |
|---|---|---|
| Design review | {{YYYY-MM-DD}} | {{Owner}} |
| Dev complete | {{YYYY-MM-DD}} | {{Owner}} |
| QA sign-off | {{YYYY-MM-DD}} | {{Owner}} |
| Release | {{YYYY-MM-DD}} | {{Owner}} |

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Writing implementation details in the PRD | Blurs the product/engineering boundary; engineers tune out | Describe *what* the user experiences, not *how* the code works |
| No out-of-scope section | Stakeholders assume everything is included | Explicitly list what's deferred or excluded |
| Vague success metrics ("better UX") | Can't tell if the feature worked | Define a measurable metric with baseline and target |
| PRD as a novel | No one reads 20-page PRDs | Keep it concise; link to detailed designs separately |