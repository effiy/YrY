---
title: YiKnowledge personal knowledge base overview
tags: [knowledge-base, index, navigation, role-tree]
category: root
created: 2026-01-01
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [knowledge-curator]
benefit: "New readers see 10 role directories at a glance and locate content by role × problem domain"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
  - ./INDEX.md
  - ./knowledge-curator/governance/user-story-migration-plan.md
  - ./knowledge-curator/diagrams/directory-blueprint.md
---

# YiKnowledge — Personal Knowledge Base

A searchable knowledge base organised by **role tree × problem domain** (8 role directories), overlaid with PARA / lifecycle layers. See [INDEX.md](./INDEX.md) for full-library navigation, and [user-story-migration-plan.md](./knowledge-curator/governance/user-story-migration-plan.md) for the migration history.

> **Cleaned 2026-08-07**: Deleted 3 stale role directories (data-engineer, devops, technical-writer — 24 files confirmed duplicates of engineer/infrastructure/ and engineer/engineering/). Removed empty static/ directory. Fixed 182 broken YAML frontmatter files. 8 role directories, 0 broken links, 0 empty directories, 0 stale duplicates.
>
> **Restructured 2026-08-06**: 19 roles → 10 (merged 11 skeletal roles into engineer/tech-lead). Content-type subdirs (patterns/processes/lessons/strategies) → problem-domain subdirs. 2041 AI-generated prepare-* templates archived. Max 3 directory levels. Engineer subdirs merged 11→7. Root domain indexes moved into role dirs. Underscores in filenames eliminated.
>
> **Pruned 2026-08-09**: Removed brd/ (BRD database export, ~96 files) and skill-author/ (Claude Code skills workspace, ~15 files) as they belong to separate systems.

## Top-level tree (8 role directories)

| Role | Coverage | Key subdirs |
|---|---|---|
| [engineer/](./engineer/) | architecture, engineering, quality-security, infrastructure, process, lessons, projects | architecture-design / engineering / quality-security / infrastructure / process / lessons / projects |
| [tech-lead/](./tech-lead/) | architecture decisions, ADR, capacity, risk, roadmap | architecture / decisions / capacity / risk / roadmap |
| [product-manager/](./product-manager/) | frameworks, discovery, delivery, strategy, projects | frameworks / discovery / delivery / strategy / projects |
| [ai-engineer/](./ai-engineer/) | AI foundations, methodology, platform, data | foundations / methodology / platform / data |
| [oncall-sre/](./oncall-sre/) | incident response, observability, release | incident-response / observability / release |
| [executive/](./executive/) | strategy, industry, roadmap, reading-list | strategy / industry / roadmap / reading-list |
| [knowledge-curator/](./knowledge-curator/) | KB governance, diagrams, archive, templates, people, notes | governance / diagrams / archive / templates / people / notes |
| [new-hire/](./new-hire/) | onboarding, handoff | onboarding |


### Merged & deleted roles (2026-08-06 merged, 2026-08-07 deleted)

These 11 former role directories were merged into engineer/ or tech-lead/ on 2026-08-06 and physically deleted on 2026-08-07:

| Former role | → Merged into |
|---|---|
| accessibility-engineer, code-reviewer, performance-engineer, qa-engineer | engineer/quality-security/ |
| api-designer, designer | engineer/architecture-design/ |
| data-engineer | engineer/infrastructure/ |
| devops | engineer/infrastructure/ |
| security-engineer | engineer/quality-security/ |
| technical-writer | engineer/engineering/ |
| release-manager | tech-lead/decisions/ |

## Design principles (7)

1. **Descriptive hyphenated filenames** — verb-phrase slugs, hyphens only, underscores `_` and digits are forbidden
2. **Multi-role via frontmatter** — filenames are not bound to roles; the frontmatter `roles:` array marks all applicable roles
3. **Dual-copy archival** — external knowledge in two copies: `*-original.md` (original) + `*-summary.md` (summary)
4. **YAML frontmatter required** — `title` / `tags` / `category` / `created` / `updated` / `source` / `type` / `roles` / `benefit` / `acceptance_criteria` are recall signals
5. **Unified body structure** — summary / core viewpoints / key info / action recommendations / anti-patterns / related
6. **Freshness labelling** — external content needs `last_verified` + `review_cycle`; unverified for 6 months is labelled `status: deprecated`
7. **Max 3 directory levels** — role/problem-domain/file.md; no nested sub-sub-directories

## 4 cross-cutting domain indexes

Beyond the 8 role directories, 4 domain indexes aggregate content across roles:

| Domain index | Aggregates |
|---|---|
| [SECURITY.md](./engineer/SECURITY.md) | Supply chain, appsec, risk, incident response, compliance |
| [AI-AND-DATA.md](./ai-engineer/AI-AND-DATA.md) | AI/ML patterns, AI foundations, data engineering |
| [COLLABORATION.md](./knowledge-curator/COLLABORATION.md) | Team process, meetings, knowledge sharing, onboarding, PM |
| [ENGINEERING.md](./engineer/ENGINEERING.md) | Architecture, quality, deployment, data, tools, lessons |

## Mental model

### The 8-4-3 rule

```
8 roles × 4 domains × 3 levels max  =  YiKnowledge

  8 roles (who)           4 domains (cross-cutting)      3 levels (depth)
  ─────────────           ─────────────────────────      ────────────────
  engineer                SECURITY       protect         role/
  tech-lead               AI-AND-DATA    build smart       problem-domain/
  product-manager         COLLABORATION  work together       file.md
  ai-engineer             ENGINEERING    build right
  oncall-sre
  executive              Domain indexes live in their
  knowledge-curator      primary role directory.
  new-hire
```

### Engineer/ subdirectories: Build → Ship → Run → Learn

The 7 subdirectories under `engineer/` follow a software lifecycle. Group them mentally:

```
BUILD                           SHIP
├─ architecture-design          ├─ quality-security
└─ engineering                  └─ infrastructure

RUN                             LEARN
├─ process                      ├─ lessons
                                └─ projects
```

### Quick decision: "I need to..." → where to look

| Task | First stop | Also check |
|---|---|---|
| Design a system / API | engineer/architecture-design/ | tech-lead/architecture/ |
| Write or review code | engineer/quality-security/ | engineer/process/ |
| Harden dependencies / secrets | engineer/quality-security/ | engineer/SECURITY.md |
| Deploy / release / feature-flag | engineer/infrastructure/ | oncall-sre/release/ |
| Migrate data / tune DB | engineer/infrastructure/ | ai-engineer/data/ |
| Run meetings / improve team | engineer/process/ | knowledge-curator/COLLABORATION.md |
| Set up dev tools / reduce cost | engineer/engineering/ | tech-lead/capacity/ |
| Build RAG / eval LLM / vector | engineer/engineering/ | ai-engineer/AI-AND-DATA.md |
| Learn from past mistakes | engineer/lessons/ | knowledge-curator/governance/ |
| Cross-cutting task (lost?) | engineer/process/ | INDEX.md |
| Make architectural decision | tech-lead/decisions/ | engineer/ENGINEERING.md |
| Plan roadmap / capacity | tech-lead/roadmap/ | executive/roadmap/ |
| Define product / write PRD | product-manager/discovery/ | product-manager/frameworks/ |
| Respond to incident | oncall-sre/incident-response/ | engineer/SECURITY.md |
| Onboard new team member | new-hire/onboarding/ | knowledge-curator/COLLABORATION.md |

### Role × Domain coverage

```
                SECURITY  AI&DATA  COLLAB  ENG
engineer           ✓         ✓        ✓      ✓
tech-lead          ✓         —        ✓      ✓
product-manager    —         —        ✓      —
ai-engineer        —         ✓        —      —
oncall-sre         ✓         —        —      ✓
executive          ✓         —        ✓      —
knowledge-curator  —         —        ✓      —
new-hire           —         —        ✓      —
```

## 4 diagrams

Draw these 4 diagrams before extending:

| Diagram | File | Question answered |
|---|---|---|
| Knowledge map | [knowledge-curator/diagrams/knowledge-map.md](./knowledge-curator/diagrams/knowledge-map.md) | What knowledge exists? Explicit vs. tacit? Holders and consumers? |
| User-journey map | [knowledge-curator/diagrams/user-journey.md](./knowledge-curator/diagrams/user-journey.md) | Where is the knowledge? How does it flow? Where are the breakpoints? |
| Directory blueprint | [knowledge-curator/diagrams/directory-blueprint.md](./knowledge-curator/diagrams/directory-blueprint.md) | How do users find things at a glance? Role × problem domain, max 3 levels |
| Governance flow | [knowledge-curator/governance/governance.md](./knowledge-curator/governance/governance.md) | Who maintains? How often? 4 roles, 3 cadences |

Run the [readiness-checklist.md](./knowledge-curator/governance/readiness-checklist.md) 10-question gate before launch.

## Positioning in the AI era

YiKnowledge serves both humans and the YiAi BRD Agent (RAG perspective):

- **Human view** — 8 role directories × problem-domain subdirectories help readers reach content within 2 hops
- **AI view** — Frontmatter `roles` / `benefit` / `acceptance_criteria` / `lifecycle` / `related` / `tacit` / `tags` / `category` are RAG recall signals
- **The knowledge map never goes out of date** — AI consumes structured knowledge; garbage in, garbage out