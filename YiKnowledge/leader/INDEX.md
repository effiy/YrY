---
title: "Tech Lead role index"
tags: [index, leader, adr, architecture, capacity, risk, roadmap]
category: leader
created: 2026-08-06
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [leader]
benefit: "Tech leads find architecture decisions, capacity plans, risk register, and roadmap in one index"
acceptance_criteria:
  - "5 subdirectories with README files"
related:
  - ./README.md
  - ../INDEX.md
---

# Tech Lead — Role Index

> **Pipeline stage**: 2. Decisions — Leader DECIDES. For implementation → [engineer/](../engineer/). For incident response → [srer/](../srer/). For product requirements → [producter/](../producter/).

## Subdirectories

| Domain | Content |
|---|---|
| [architecture/](./architecture/) | Architecture patterns, tech selection evaluations, maturity models |
| [decisions/](./decisions/) | ADRs for YiAi, YiVad, YiPet, FDE |
| [capacity/](./capacity/) | Capacity & cost tracking, dependency audits |
| [risk/](./risk/) | Risk register, outage communication, postmortem methodology |
| [roadmap/](./roadmap/) | Roadmap planning, tech debt, PoC, SLO definition |

## Cross-role references

- [../engineer/build/](../engineer/build/) — Design patterns referenced in ADRs
- [../engineer/ship/](../engineer/ship/) — Security decisions
- [../engineer/SECURITY.md](../engineer/SECURITY.md) — Security domain index