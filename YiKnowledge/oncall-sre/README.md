---
title: Oncall SRE
tags: [leaf, oncall-sre, incident-response, observability, release]
category: oncall-sre
created: 2026-08-06
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [oncall-sre, engineer]
benefit: "Oncall SREs find incident response, observability, and release procedures organized by problem domain"
acceptance_criteria:
  - "3 problem-domain subdirectories: incident-response, observability, release"
  - "Each subdirectory has a README with categorized file listings"
  - "Max 3 directory levels"
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../engineer/SECURITY.md
  - ../engineer/infrastructure/
---

# Oncall SRE

> **As an** oncall SRE, **I want to** find incident response procedures, observability guides, and release management processes, **so that** I can keep systems reliable and respond to incidents effectively.

## Problem domains

| Domain | Solves | Files |
|---|---|---|
| [incident-response/](./incident-response/) | How do I respond to and manage incidents? | ~24 |
| [observability/](./observability/) | How do I monitor and observe systems? | ~15 |
| [release/](./release/) | How do I release and rollback safely? | ~5 |

## Quick reference

| I want to... | Go to |
|---|---|
| Respond to an incident | [incident-response/respond-to-an-incident.md](./incident-response/respond-to-an-incident.md) |
| Write a postmortem | [incident-response/write-a-postmortem.md](./incident-response/write-a-postmortem.md) |
| Set up observability | [observability/set-up-observability.md](./observability/set-up-observability.md) |
| Ship a release | [release/ship-a-release.md](./release/ship-a-release.md) |
| Do a rollback | [release/do-a-rollback.md](./release/do-a-rollback.md) |

## Cross-references

- [../engineer/SECURITY.md](../engineer/SECURITY.md) — Security domain index
- [../engineer/infrastructure/](../engineer/infrastructure/) — CI/CD and deployment patterns