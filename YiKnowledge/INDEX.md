---
title: YiKnowledge Index
aliases: [yi-knowledge-index, kb-toc]
tags: [index, navigation, toc, role-tree]
category: root
created: 2026-01-01
updated: 2026-08-14
last_verified: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Navigate the knowledge base by role directory"
acceptance_criteria:
  - "7 role directories listed with descriptions"
  - "Each role links to its README and INDEX"
related:
  - ./README.md
---

# YiKnowledge Index

> 7 roles, 4 pipeline stages, 3 cross-cutting layers. Each role has a README (overview) and INDEX (navigation).

## Role tree

| Role | Pipeline stage | Overview | Index |
|---|---|---|---|
| [producter/](./producter/) | 1. Requirements | [README](./producter/README.md) | [INDEX](./producter/INDEX.md) |
| [leader/](./leader/) | 2. Decisions | [README](./leader/README.md) | [INDEX](./leader/INDEX.md) |
| [engineer/](./engineer/) | 3. Design + Build | [README](./engineer/README.md) | [INDEX](./engineer/INDEX.md) |
| [srer/](./srer/) | 4. Ship + Operate | [README](./srer/README.md) | [INDEX](./srer/INDEX.md) |
| [executiver/](./executiver/) | Business Strategy (cross-cutting) | [README](./executiver/README.md) | [INDEX](./executiver/INDEX.md) |
| [aier/](./aier/) | AI Enablement (cross-cutting) | [README](./aier/README.md) | [INDEX](./aier/INDEX.md) |
| [curator/](./curator/) | Knowledge Governance (cross-cutting) | [README](./curator/README.md) | [INDEX](./curator/INDEX.md) |

## Cross-cutting domain indexes

| Domain index | Aggregates |
|---|---|
| [SECURITY.md](./engineer/SECURITY.md) | Supply chain, appsec, risk, incident response, compliance |
| [COLLABORATION.md](./curator/COLLABORATION.md) | Team process, meetings, knowledge sharing, onboarding, PM |
| [ENGINEERING.md](./engineer/ENGINEERING.md) | Architecture, quality, data, tools, lessons |

## Retrieval strategy

1. **Pipeline stage first** — start from the pipeline stage you're in: Requirements → Decisions → Design+Build → Ship+Operate
2. **Role directory** — go to the role directory matching your need
3. **Read per-role INDEX** — each role has an INDEX.md with subdirectory navigation
4. **Cross-role** — use domain indexes (SECURITY, COLLABORATION, ENGINEERING) for cross-cutting topics