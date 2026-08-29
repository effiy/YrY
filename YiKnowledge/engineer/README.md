---
title: Engineer role
tags: [engineer, role, index]
category: engineer
created: 2026-08-03
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles: [engineer]
benefit: "Engineers find content by problem domain within 2 hops"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "cross-references to related leaves and parent INDEX are present"
related:
  - ./INDEX.md
  - ./ENGINEERING.md
  - ./SECURITY.md
  - ../README.md
  - ../INDEX.md
---

# Engineer

> **Pipeline stage 3: Design + Build** — Engineer IMPLEMENTS. It does not make architecture decisions (→ [leader/](../leader/)), define product requirements (→ [producter/](../producter/)), or operate production (→ [srer/](../srer/)).

## Problem domains

| Phase | Domain | Solves |
|---|---|---|
| BUILD | [build/](./build/) | How do I design and set up this system? |
| SHIP | [ship/](./ship/) | How do I test, secure, persist, and make it resilient? |
| RUN | [run/](./run/) | How do we work together and onboard? |
| LEARN | [learn/](./learn/) | Lessons learned and project-specific docs |

## Scope

### In scope (engineer OWNS)
- System design, API design, dev tools, DX → [build/](./build/)
- Code quality, testing, security, data, resilience, observability → [ship/](./ship/)
- Team workflows, onboarding, cross-cutting scenarios → [run/](./run/)
- Wins, failures, gotchas, project-specific docs → [learn/](./learn/)

### Out of scope (delegated to other roles)
- Architecture decisions with tradeoffs → [leader/decisions/](../leader/decisions/)
- Tech selection evaluations → [leader/architecture/](../leader/architecture/)
- Incident response procedures → [srer/incident-response/](../srer/incident-response/)
- AI theory and foundations → [aier/foundations/](../aier/foundations/)
- Product requirements and PRDs → [producter/discovery/](../producter/discovery/)
- KB governance and structure → [curator/governance/](../curator/governance/)

## Core viewpoints

- **Problem-domain first** — content is organized by the problem you're solving (Build → Ship → Run → Learn)
- **Implement, don't decide** — engineer/ documents how to build; leader/ documents why we chose that approach
- **Lessons are first-class artifacts** — every win, failure, and gotcha is worth capturing

## Cross-role references

- [../leader/](../leader/) — Architecture decisions, capacity, risk, roadmap
- [../aier/](../aier/) — AI foundations, methodology, platform
- [../producter/](../producter/) — PM frameworks, discovery, delivery
- [../srer/](../srer/) — Incident response, observability, release
- [../projects/](../projects/) — Project operational artifacts (bugs, issues, demos)
- [./ENGINEERING.md](./ENGINEERING.md) — Cross-role engineering domain index
- [./SECURITY.md](./SECURITY.md) — Cross-role security domain index
- [./learn/INDEX.md](./learn/INDEX.md) — Learn phase index (lessons + projects)