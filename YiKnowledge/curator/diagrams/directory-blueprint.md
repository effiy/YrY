---
title: Directory Blueprint — How Users Find Things
aliases: [directory-blueprint, dir-blueprint, navigation-blueprint]
tags: [curator, diagrams, blueprint, directory, navigation]
category: curator/diagrams
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Curators maintain a visual directory blueprint so users can find any content within 2 hops"
acceptance_criteria:
  - "role × problem domain matrix"
  - "max 3 levels per directory"
  - "every subdirectory has a one-liner description"
related:
  - ./README.md
  - ./knowledge-map.md
  - ./user-journey.md
  - ../../INDEX.md
  - ../../MEMORY.md
---

# Directory Blueprint

> **Purpose:** A visual map of the YiKnowledge directory tree. Every directory labeled with its purpose. Users should reach any content within 2 hops.

## Top-Level Layout

```
YiKnowledge/
├── INDEX.md              ← Start here. Role tree + pipeline overview.
├── README.md             ← Pipeline narrative. How roles connect.
├── MEMORY.md             ← Rulebook. Naming, frontmatter, conventions.
├── QUICKSTART.md         ← 5-minute onboarding.
│
├── executiver/           ← Business Strategy (cross-cutting)
├── producter/            ← Stage 1: Requirements
├── leader/               ← Stage 2: Decisions
├── engineer/             ← Stage 3: Design + Build
├── srer/                 ← Stage 4+5: Ship + Operate
├── aier/                 ← AI Enablement (cross-cutting)
├── curator/              ← Knowledge Governance (meta)
│
├── demos/                ← Example projects (YiVad instantiable)
├── skills/               ← Claude Code skills
├── okr/                  ← OKR tracking
├── bugs/                 ← Bug reports
├── rss/                  ← RSS feed archives
├── websites/             ← Web content archives
└── static/               ← Static assets
```

## Role × Problem Domain Matrix

| Role | Subdirectory | Purpose | Files |
|---|---|---|---|
| **executiver** | strategy/ | Corporate strategy frameworks | 10 |
| | industry/ | Market intel, competitors, reports | 5 |
| | roadmap/ | Org goals, OKR tracking, QBR | 5 |
| | reading-list/ | Executive learning resources | 4 |
| **producter** | frameworks/ | PM frameworks (RICE, JTBD, Kano) | 9 |
| | discovery/ | PRDs, metrics, UX, user research | 7 |
| | delivery/ | Sprint management, agile process | 2 |
| | strategy/ | AI product strategy, cases | 2 |
| | projects/ | Project-specific PM docs | 4 |
| **leader** | architecture/ | Architecture patterns, maturity models | 7 |
| | decisions/ | ADRs by project (yiai/yivad/yipet) | 15 |
| | roadmap/ | Tech roadmap, tech selection, capacity | 12 |
| | risk/ | Postmortem methodology, launch risk | 3 |
| | capacity/ | FinOps, capacity planning | 2 |
| **engineer** | build/ | API design, dev tools, patterns | 25 |
| | ship/ | Quality, security, data, reliability | 15 |
| | learn/ | Lessons learned (wins/failures/gotchas) | 5 |
| | run/ | Collaboration, onboarding, retrospectives | 5 |
| **srer** | incident-response/ | Incident procedures, postmortems, on-call | 6 |
| | observability/ | Monitoring, CI/CD, capacity, infra | 8 |
| | release/ | Release, canary, hotfix, rollback | 6 |
| **aier** | 基础/ | LLM basics, RAG patterns | 3 |
| | 方法/ | Agent architecture, prompt engineering, eval | 8 |
| | 平台/ | LLM comparison, vector DB, embedding models | 4 |
| | 机器学习/ | Traditional ML patterns | 2 |
| **curator** | governance/ | Lifecycle, readiness checklist, standards | 5 |
| | diagrams/ | Knowledge map, journey, blueprint | 5 |
| | templates/ | PRD, ADR, tech design, retrospective | 13 |
| | archive/ | Deprecated content index | 2 |

## Navigation Rule: 2 Hops Max

```
Hop 1: Role directory (e.g., engineer/)
Hop 2: Problem domain (e.g., engineer/build/)
  → File found: engineer/build/implement-an-api.md
```

**Violation:** If a user needs 3+ hops, the directory is too deep. Restructure.

## Finding Content by Task

| I want to... | Go to |
|---|---|
| Write a PRD | curator/templates/prd.md |
| Make a technical decision | leader/decisions/ + curator/templates/adr.md |
| Implement an API | engineer/build/implement-an-api.md |
| Set up observability | srer/observability/set-up-observability.md |
| Respond to an incident | srer/incident-response/respond-to-an-incident.md |
| Choose an LLM | aier/基础/大模型基础.md |
| Run a sprint | producter/delivery/run-a-sprint.md |
| Do user research | producter/frameworks/do-user-research.md |
| Review code with AI | aier/方法/提示词/代码审查.md |
| Write a postmortem | leader/risk/write-a-postmortem.md |
| Review infrastructure costs | leader/capacity/run-a-finops-review.md |
| Start a new project | demos/INDEX.md |

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Directory > 3 levels deep | Users can't find content; navigation breaks the 2-hop rule | Flatten: merge subdirectories or promote content up |
| Two directories with overlapping scope | Content gets filed in the wrong place; duplicates appear | Clarify boundaries; use the decision tree in README.md |
| Blueprint never updated | Blueprint shows old structure; new directories are invisible | Update blueprint whenever a directory is added or renamed |