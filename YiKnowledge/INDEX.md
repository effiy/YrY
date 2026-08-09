---
title: YiKnowledge full-library index
aliases: [yi-knowledge-index, kb-toc, full-library-toc]
tags: [index, navigation, toc, role-tree]
category: root
created: 2026-01-01
updated: 2026-08-09
last_verified: 2026-08-09
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "New readers locate content by 10 role directories, reaching a leaf within 2 hops"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./README.md
  - ./knowledge-curator/governance/user-story-migration-plan.md
  - ./knowledge-curator/diagrams/directory-blueprint.md
---

# YiKnowledge Index

> **As a** knowledge-curator, **I want to** give the library a TOC organised by 8 role directories × problem domains, **so that** new readers locate content by role, reaching a leaf within 2 hops.

> **Flattened** (2026-08-09): All 8 role directories flattened to max 3 levels. Removed 2041 archived prepare-* legacy templates, 3 stale role directories (data-engineer, devops, technical-writer), 11 empty directories, and 4 placeholder/duplicate files. Flattened sub-sub-directories across all roles (stories, decisions, discovery, industry, people, onboarding, methodology, templates). Also removed brd/ (~96 files) and skill-author/ (~15 files) as separate-system directories.

## Role tree (8 roles)

| Role | Problem domains | Files | Detail index |
|---|---|---|---|
| [engineer/](./engineer/) | architecture-design, engineering, quality-security, infrastructure, process, lessons, projects | ~432 | [INDEX](./engineer/INDEX.md) |
| [tech-lead/](./tech-lead/) | architecture, decisions, capacity, risk, roadmap | ~59 | [INDEX](./tech-lead/INDEX.md) |
| [product-manager/](./product-manager/) | frameworks, discovery, delivery, strategy, projects | ~95 | [INDEX](./product-manager/INDEX.md) |
| [ai-engineer/](./ai-engineer/) | foundations, methodology, platform, data | ~108 | [INDEX](./ai-engineer/INDEX.md) |
| [oncall-sre/](./oncall-sre/) | incident-response, observability, release | ~64 | [INDEX](./oncall-sre/INDEX.md) |
| [executive/](./executive/) | strategy, industry, roadmap, reading-list | ~59 | [INDEX](./executive/INDEX.md) |
| [knowledge-curator/](./knowledge-curator/) | governance, diagrams, archive, templates, people, notes | ~60 active | [INDEX](./knowledge-curator/INDEX.md) |
| [new-hire/](./new-hire/) | onboarding | ~19 | [INDEX](./new-hire/INDEX.md) |


## 4 cross-cutting domain indexes

| Domain index | Aggregates |
|---|---|
| [SECURITY.md](./engineer/SECURITY.md) | Supply chain, appsec, risk, incident response, compliance |
| [AI-AND-DATA.md](./ai-engineer/AI-AND-DATA.md) | AI/ML patterns, AI foundations, data engineering |
| [COLLABORATION.md](./knowledge-curator/COLLABORATION.md) | Team process, meetings, knowledge sharing, onboarding, PM |
| [ENGINEERING.md](./engineer/ENGINEERING.md) | Architecture, quality, deployment, data, tools, lessons |

## Problem-domain cross-reference

Content is also discoverable by problem domain across roles:

| Domain | Primary role | Cross-role content |
|---|---|---|
| Architecture & Design | engineer/architecture-design/ | tech-lead/architecture/, tech-lead/decisions/ |
| Engineering & Tools | engineer/engineering/ | ai-engineer/ (all) |
| Quality & Security | engineer/quality-security/ | tech-lead/risk/, oncall-sre/incident-response/ |
| Infrastructure & Data | engineer/infrastructure/ | ai-engineer/data/, oncall-sre/release/ |
| Process & Collaboration | engineer/process/ | product-manager/delivery/, knowledge-curator/governance/ |
| Strategy & Industry | executive/strategy/ | product-manager/strategy/ |
| Engineering (broad) | engineer/ (all) | tech-lead/, oncall-sre/, ENGINEERING.md |

## Lifecycle navigation (PARA)

| Entry | Purpose |
|---|---|
| [knowledge-curator/governance/inbox.md](./knowledge-curator/governance/inbox.md) | Catch-all / knowledge transit station for unclassified content |
| [knowledge-curator/governance/triage.md](./knowledge-curator/governance/triage.md) | Queue of classified-but-not-yet-summarised source files |
| [knowledge-curator/archive/archive.md](./knowledge-curator/archive/archive.md) | Index of deprecated files |
| [knowledge-curator/archive/strategies-legacy/](./knowledge-curator/archive/strategies-legacy/) | 2041 archived AI-generated prepare-* template files |

## 4 diagrams + 4 domain indexes

| Diagram | File | Question answered |
|---|---|---|
| Knowledge map | [knowledge-curator/diagrams/knowledge-map.md](./knowledge-curator/diagrams/knowledge-map.md) | What knowledge exists? Explicit vs. tacit? Holders and consumers? |
| User-journey map | [knowledge-curator/diagrams/user-journey.md](./knowledge-curator/diagrams/user-journey.md) | Where is the knowledge? How does it flow? Where are the breakpoints? |
| Directory blueprint | [knowledge-curator/diagrams/directory-blueprint.md](./knowledge-curator/diagrams/directory-blueprint.md) | How do users find things at a glance? Role × problem domain, max 3 levels |
| Governance flow | [knowledge-curator/governance/governance.md](./knowledge-curator/governance/governance.md) | Who maintains? How often? 4 roles, 3 cadences |

| Domain index | File | Question answered |
|---|---|---|
| Security | [SECURITY.md](./engineer/SECURITY.md) | Where is all security, supply-chain, and risk content? |
| AI & Data | [AI-AND-DATA.md](./ai-engineer/AI-AND-DATA.md) | Where is all AI/ML and data engineering content? |
| Collaboration | [COLLABORATION.md](./knowledge-curator/COLLABORATION.md) | Where is all team process and collaboration content? |
| Engineering | [ENGINEERING.md](./engineer/ENGINEERING.md) | Where is all architecture, quality, deployment, and tools content? |

Run the [readiness-checklist.md](./knowledge-curator/governance/readiness-checklist.md) 10-question gate before launch.

## Retrieval strategy

1. **Role first** — start from the role directory matching your need, reach files within 2 hops
2. **Domain index** — for cross-cutting topics, start from engineer/SECURITY.md, ai-engineer/AI-AND-DATA.md, knowledge-curator/COLLABORATION.md, or engineer/ENGINEERING.md
3. **Problem domain** — each role's subdirectories are named by the problem they solve
4. **Read per-role INDEX** — each major role has an INDEX.md with subdirectory maps and file listings
5. **Read frontmatter** — `head -15 file.md` to read YAML, judge relevance before full read
6. **grep keywords** — `rg "^tags:.*keyword" YiKnowledge -l` for quick filtering
7. **Cross-role** — use frontmatter `roles:` field and problem-domain cross-reference table above
