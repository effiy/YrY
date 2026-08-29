---
title: Technical Design Template
aliases: [tech-design-template, design-doc-template]
tags: [template, tech-design, architecture, engineer]
category: curator/templates
created: 2026-08-24
updated: 2026-08-24
source: internal
type: template
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, leader]
benefit: "Engineers write consistent technical designs that cover business context, architecture, implementation detail, and non-functional requirements"
acceptance_criteria:
  - "4 sections: Business Context, Architecture, Implementation Detail, Non-functional Requirements"
  - "includes diagram placeholder and API contract section"
  - "covers deployment, observability, and testing considerations"
related:
  - ./README.md
  - ./knowledge-leaf.md
  - ./adr.md
  - ../../engineer/build/implement-an-api.md
---

# Technical Design Template

> **When to use:** For features that span multiple services, introduce new patterns, or have significant implementation complexity. A tech design bridges the gap between a PRD (*what*) and the code (*how*).

## 1. Business Context

> What problem does this solve, and for whom? Link to the PRD.

{{2-3 sentences. Reference the PRD. State the business value in one sentence.}}

**PRD:** {{link to PRD}}

## 2. Architecture

### System Diagram

> Describe the components and their interactions. Use ASCII art or reference a diagram.

```
{{ASCII diagram showing services, data flow, and external dependencies}}
```

### Components

| Component | Responsibility | Technology | Owner |
|---|---|---|---|
| {{Component name}} | {{What it does}} | {{Stack}} | {{Team/person}} |

### API Contract

> If this design introduces or changes APIs, specify the contract.

```
POST /{{endpoint}}
Request:  { {{fields}} }
Response: { {{fields}} }
Errors:   {{error codes and meanings}}
```

### Data Model

> If this design introduces new data stores or changes schemas.

```
{{Table/Collection name}}:
  - {{field}}: {{type}} — {{description}}
  - {{field}}: {{type}} — {{description}}
```

## 3. Implementation Detail

### Key Implementation Steps

1. {{Step 1 — what gets built first}}
2. {{Step 2}}
3. {{Step 3}}

### Edge Cases

| Scenario | Expected behavior |
|---|---|
| {{Edge case 1}} | {{How the system handles it}} |
| {{Edge case 2}} | {{How the system handles it}} |

### Testing Strategy

- **Unit tests:** {{what to unit-test}}
- **Integration tests:** {{what integration points to test}}
- **E2E tests:** {{critical user journeys}}

## 4. Non-functional Requirements

### Performance

| Metric | Target | Measurement |
|---|---|---|
| P50 latency | {{ms}} | {{How to measure}} |
| P99 latency | {{ms}} | {{How to measure}} |
| Throughput | {{req/s}} | {{How to measure}} |

### Security

- {{Security consideration 1}}
- {{Security consideration 2}}

### Observability

- **Metrics:** {{key metrics to track}}
- **Alerts:** {{alert conditions}}
- **Logs:** {{what to log, at what level}}

### Deployment

- **Rollout strategy:** {{canary/blue-green/rolling}}
- **Rollback plan:** {{how to undo if something goes wrong}}
- **Feature flags:** {{flags to wrap this feature}}

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| Design doc that's just code snippets | Misses the architectural reasoning; reviewers can't evaluate tradeoffs | Start with architecture and data flow; code comes last |
| No edge cases | Implementation hits unexpected states and breaks | List at least 3 edge cases and expected behavior |
| Skipping non-functional requirements | Performance, security, and observability are afterthoughts | Define NFRs before implementation starts |
| Design doc as a waterfall artifact | Team spends a week writing, then a week reviewing, then starts coding | Write just enough to de-risk; iterate during implementation |