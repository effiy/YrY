---
title: knowledgelygraph / Knowledge Map
aliases:
- knowledge-map
- tacit-vs-explicit
tags:
- lifecycle
- knowledge-map
- tacit knowledge
- 4 diagrams
category: knowledge-curator/diagrams
created: 2026-08-03
updated: 2026-08-05
last_verified: 2026-08-07
source: "insidepart + reference<Knowledge base directory design: 90% of companies get the first step wrong>"
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: Explicit/tacit knowledge dual inventory, cross-department flow breakpoints made explicit
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"- Landing position column points to the 19 Role directories below true real paths
- Unsinked items must have a tacit-knowledge-backlog entry
related:
- ./user-journey.md
- ./directory-blueprint.md
- ../governance/governance.md
- ../governance/tacit-knowledge-backlog.md
- ../README.md
tacit: false
---

# knowledgelygraph / Knowledge Map

> **As a** knowledge-curator, **I want to** dual-inventory explicit/tacit knowledge across the library and annotate holder/consumer/update-frequency/current state, **so that** cross-department flow breakpoints become explicit and AI recall has an indexing baseline.

> One of the 4 diagrams. In the AI era, the only asset that will not become obsolete.

## Summary

- Explicit vs tacit dual inventory: 70% of value lies in tacit knowledge
- Holder != consumer rows need re-examination to guarantee cross-department flow
- Each knowledge category marked with update frequency and current state (sunked / partially sunked / not sunked)
- Quarterly retrospective scan; newly identified tacit knowledge enters the backlog
- The knowledge map is the indexing baseline for AI cross-directory recall

## Core viewpoints

- **Explicit vs tacit** — Explicit is knowledge already written as docs; tacit is knowledge in senior employees' heads, group chats, "everyone knows but nobody wrote it down" processes. 70% of value lies in tacit.
- **Holder vs consumer** — In many cases the holder and consumer of knowledge are not in the same department; knowledge must flow cross-department. Rows in this table where "holder != consumer" are high-frequency flow breakpoint zones.
- **Update frequency + current state** — Without update frequency, staleness cannot be judged; without current state, the gap location cannot be known.

## Key information

### Design principles (from reference article)

1. **Explicit vs tacit**: 70% of value lies in tacit knowledge
2. **Holder vs consumer**: identify cross-department flow requirements
3. **Update frequency**: mark the update cadence of each knowledge category
4. **Current state**: sunked / partially sunked / not sunked

### YiKnowledge knowledge map (first edition)

| Knowledge category | Explicit/Tacit | Holder | Consumer | Update frequency | Current state | Landing position |
|---|---|---|---|---|---|---|
| Product feature docs | Explicit | Product team | Sales, customer service, YiAi | Each release | Sunked | `product-manager/projects/{proj}/stories/` |
| BRD business requirements | Explicit | PM | Engineering, YiAi | Each iteration | Sunked | `brd/brd-engineer/` |
| AI methodology | Explicit | AI engineering | All staff | Continuous | Sunked | `ai-engineer/methodology/` |
| PM framework | Explicit | PM director | All PMs | Quarterly | Sunked | `product-manager/frameworks/` |
| Engineering lessons learned | Semi-tacit | Senior engineering | All engineering | Each lesson | Partially sunked | `engineer/lessons/gotchas/` + `engineer/lessons/failures/` |
| Customer industry insight | Tacit | Senior sales | All sales, PM | Continuous | Not sunked | TBD `product-manager/strategy/` |
| Customer preferences (e.g. security architecture preferences) | Tacit | Senior sales | Pre-sales, product | Continuous | Not sunked | TBD `tacit-knowledge-backlog` |
| Cross-timezone collaboration conventions | Semi-tacit | Each owner | All staff | Semi-annual | Partially sunked | `engineer/process/` |
| Implementation delivery SOP | Explicit | Implementation team | New hires | Quarterly | Sunked | `oncall-sre/release/` + `engineer/process/` |
| Competitor analysis | Semi-tacit | Market/product | Sales, product | Monthly | Scattered across many people | `executive/industry/competitors--` TBD |
| Tech debt inventory | Semi-tacit | Architects | All engineering | Quarterly | Partially sunked | `tech-lead/architecture/` + `tech-lead/risk/` |
| Capacity and cost | Explicit | SRE | Management | Monthly | Partially sunked | `tech-lead/capacity/` + `oncall-sre/observability/` |
| Team topology and roles | Tacit | Each owner | New hires, cross-team collaboration | Semi-annual | Not sunked | `knowledge-curator/people/team--` TBD |
| External expert network | Tacit | Each owner | Decision makers | Continuous | Not sunked | `knowledge-curator/people/experts--` TBD |
| UI/UX patterns and cross-end parity | Semi-tacit | Designers | Front-end, PM | Monthly | Partially sunked | `designer/patterns/` |

### Tacit knowledge gaps (re-examine)

Below are high-value tacit knowledge items not yet sunked into docs. Each must enter [tacit-knowledge-backlog.md](../governance/tacit-knowledge-backlog.md) for tracking:

- Customer A's CEO cares especially about data security; proposals must lead with the security architecture
- A certain interface has performance problems when concurrency exceeds 500; pre-configure cache
- During weekly reports, the CTO dislikes PPTs longer than 3 pages
- Pre-launch checklist: a senior PM has 20 items in head; the doc only writes 8
- Overseas business compliance differences by region (EU GDPR / Middle East / Southeast Asia)

## Action recommendations

1. Quarterly retrospective scan of this table; update the "current state" column
2. Newly identified tacit knowledge immediately enters [tacit-knowledge-backlog.md](../governance/tacit-knowledge-backlog.md)
3. Rows where "holder != consumer" need re-examination to guarantee permissions and reachability
4. Unsinked rows need a capture plan (interviews / workshops / process decomposition)

## Anti-patterns

- **Only inventorying explicit knowledge** — Consequence: 70% of tacit knowledge value is lost forever
- **No update frequency marked** — Consequence: staleness cannot be judged; AI recalls outdated content
- **Drawn but never reviewed** — Consequence: the map disconnects from reality; breakpoints accumulate

## Related

- Same category (4 diagrams): [user-journey.md](./user-journey.md) / [directory-blueprint.md](./directory-blueprint.md) / [governance.md](../governance/governance.md)
- Upstream: [README.md](../README.md) (Lifecycle view layer overview)
- Downstream: [tacit-knowledge-backlog.md](../governance/tacit-knowledge-backlog.md) (tacit backlog tracking)
