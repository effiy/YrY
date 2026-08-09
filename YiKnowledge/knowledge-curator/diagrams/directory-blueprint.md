---
title: Directory Blueprint
aliases:
- directory-blueprint
- taxonomy
- role-tree-blueprint
tags:
- lifecycle
- directory
- four-diagrams
- role-tree
category: knowledge-curator/diagrams
created: 2026-08-03
updated: 2026-08-06
last_verified: 2026-08-07
source: "internal + reference \"knowledge base directory design: 90% of companies get the first step wrong\""
type: template
status: stable
lifecycle: reference
review_cycle: quarterly
roles:
- knowledge-curator
benefit: diagrams accurate
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
  - "9 role directories present: engineer / tech-lead / product-manager / ai-engineer / new-hire / knowledge-curator / executive / oncall-sre / brd"
  - directory depth does not exceed 3 (BRD story subtree is the exception)
related:
- ./knowledge-map.md
- ./user-journey.md
- ../governance/governance.md
- ../README.md
- ../../INDEX.md
- ../governance/user-story-migration-plan.md
tacit: false
---

# Directory Blueprint

> **As a** knowledge-curator, **I want to** maintain a role-based directory topology with flat problem-domain leaves, **so that** employees can immediately find content relevant to their role without navigating deep hierarchies.

> The third of the four diagrams. This diagram answers "how to let users find things at a glance". This diagram is a current-state snapshot (2026-08-06); the 2026-08-05 14→19 role migration has been consolidated into 10 roles with flat problem-domain subdirectories.

## Summary

- Three rules of directories: no more than 3 levels deep / directory names are role + problem domain / a fallback directory exists.
- 9 top-level directories: 8 active roles (`engineer/` `tech-lead/` `product-manager/` `ai-engineer/` `new-hire/` `knowledge-curator/` `executive/` `oncall-sre/`) + 1 data zone (`brd/`).
- 10 former skeletal roles (accessibility-engineer, api-designer, code-reviewer, data-engineer, designer, devops, performance-engineer, qa-engineer, release-manager, security-engineer, technical-writer) merged into parent roles.
- Filenames = descriptive verb-phrase (`set-up-ci-cd.md`); hyphens only; underscores `_` and digits are forbidden.
- Multi-role is expressed via the frontmatter `roles:` array; a filename is not bound to a single role.
- A file has a unique physical location but can be referenced by many other files via `related:`.
- Quarterly review scans depth + role coverage + frontmatter completeness.

## Core viewpoints

- **Directories are organized by role, not semantic category** — employees see `engineer/` and know whether it relates to them, without first having to understand "what methodology is".
- **Problem domains are flat under each role** — `engineer/architecture-design/`, `engineer/quality-security/`, etc. are siblings, not nested; max 3 levels from root.
- **Filenames are descriptive verb-phrases** — `set-up-ci-cd.md` / `harden-supply-chain.md` describe their own content; the path is short.
- **Multi-role is expressed in frontmatter, not via file copies** — the `roles:` array marks all applicable roles; single source of truth.
- **A fallback directory is the last gate against loss** — without a fallback, "I don't know where to put it" equals "I won't write it".
- **Scenario entries are simulated via INDEX.md sections rather than physical directories** — single source of truth is preserved; cross-role navigation happens via `related:`.

## Key information

### Three rules of directories (from the reference article, upgraded)

1. **No more than 3 levels deep**: deeper than 3 levels and employees won't bother clicking (`projects/<project>/stories/` at 5 levels is the BRD data-driven exception).
2. **Directory names are roles**: `engineer/` `tech-lead/` etc. carry identity (bare slug, no prefix).
3. **Filenames are descriptive verb-phrases**: `set-up-ci-cd.md` self-describes; hyphens only.

### YiKnowledge topology (role tree, current state 2026-08-06)

```
YiKnowledge/
├── engineer/                    # writing code / code review / engineering patterns / migration / testing
│   ├── architecture-design/     # system design, API patterns, tech selection (40 files)
│   ├── engineering/             # AI/ML patterns + dev tools + DX (56 files, merged ai-ml + tools-devx)
│   ├── quality-security/        # testing, QA, security, a11y, perf, threat modeling (34 files, merged quality-testing + security-supply-chain)
│   ├── infrastructure/          # CI/CD, releases, feature flags, DB, data migrations (50 files, merged deployment-operations + data-persistence)
│   ├── process/                 # team workflows, meetings, journeys, knowledge sharing (50 files, merged collaboration-process + journeys)
│   ├── lessons/                 # wins, failures, gotchas (flattened, 50 files)
│   └── projects/                # per-project engineering docs (yiai, yivad, yipet)
├── tech-lead/                   # architecture decisions / ADR / tech selection / tech debt / roadmap
│   ├── architecture/            # tech-selection / tech-debt / maturity-model / DORA
│   ├── decisions/<project>/     # project ADRs (yiai 6, yivad 3, yipet 3, fde 4)
│   ├── capacity/                # capacity-cost / dependency-audit / OSS storage
│   ├── risk/                    # risk register / postmortem methodology / outage communication
│   └── roadmap/                 # roadmap planning / tech debt / PoC / SLO / deprecation
├── product-manager/             # BRD / PRD / PM frameworks / sprint / retro / metrics
│   ├── frameworks/              # PM frameworks: JTBD, Kano, RICE/ICE, HEART/AARRR (16 files)
│   ├── discovery/               # user research, PRD templates, UX patterns, product metrics (14 files)
│   ├── delivery/                # sprint management, meetings, retrospectives, iteration (11 files)
│   ├── strategy/                # industry cases, competitive analysis, market positioning (4 files)
│   └── projects/                # per-project PM docs (YiAi, YiVad, YiPet)
├── ai-engineer/                 # RAG / agent / eval / prompt / LLM selection
│   ├── AI-AND-DATA.md           # cross-cutting AI + data domain index
│   ├── foundations/             # AI/ML theory: transformers, attention, RAG architectures (9 files)
│   ├── methodology/             # prompt engineering + evaluation (43 files)
│   ├── platform/                # AI platform + deployment (12 files)
│   └── data/                    # datasets + data pipelines (6 files)
├── new-hire/                    # onboarding / handoff / getting started contributing to the KB
│   └── onboarding/<project>/    # per-project onboarding (YiAi, YiVad, YiPet) + Day-1 checklist
├── knowledge-curator/           # KB governance / 4 diagrams / PARA / deprecation / tacit knowledge
│   ├── COLLABORATION.md         # cross-cutting collaboration domain index
│   ├── governance/              # lifecycle, inbox, triage, readiness checklist, review log
│   ├── diagrams/                # 4 diagrams: knowledge-map, directory-blueprint, user-journey, governance
│   ├── archive/                 # archived content (strategies-legacy: 2042 prepare-* templates)
│   ├── templates/               # content templates
│   ├── people/                  # team / experts / stakeholders
│   └── notes/                   # scratch drafts
├── executive/                   # strategy / competitors / industry reports / market trends
│   ├── strategy/                # product strategy, compliance, regulatory
│   ├── industry/                # competitors, market trends, reports
│   ├── roadmap/                 # org-level strategic planning
│   └── reading-list/            # executive learning resources
├── oncall-sre/                  # incident response / hotfix / rollback / monitoring / SLO
│   ├── incident-response/       # postmortem + oncall-handover (23 files)
│   ├── observability/           # monitoring, alerting, observability patterns
│   └── release/                 # release + rollback procedures
├── brd/                         # BRD data zone (DB export, 8 roles + 10 categories)
├── INDEX.md                     # repository-wide TOC (9 role directories)
├── README.md                    # top-level navigation
└── MEMORY.md                    # rules manual
```

### 10-role classification

| Role slug | Coverage scope |
|---|---|
| `engineer` | writing code / code review / engineering patterns / migration / test / observable / deployment / security / data / AI-ML / collaboration / tools-DX |
| `tech-lead` | architecture decisions / ADR / tech selection / tech debt / capacity / roadmap / risk / postmortem retrospective |
| `product-manager` | BRD / PRD / OKR / JTBD / Kano / RICE / sprint / retro / backlog / metrics / discovery / delivery / strategy |
| `ai-engineer` | RAG / agent / eval / prompt / vector store / LLM selection / fine-tuning decisions / AI platform / data pipelines |
| `new-hire` | onboarding / handoff / getting started contributing to the knowledge base |
| `knowledge-curator` | KB governance / 4 diagrams / PARA / deprecation process / tacit knowledge / content review |
| `executive` | strategy / competitors / industry reports / market trends / compliance |
| `oncall-sre` | incident response / hotfix / rollback drills / monitoring / SLO / oncall handover |
| `brd` | BRD data zone — DB export, auto-generated content, naming convention exempt |

### Merged roles (2026-08-05 consolidation)

10 former standalone skeletal roles merged into parent roles:

| Former role | Merged into |
|---|---|
| `accessibility-engineer/` | `engineer/quality-security/` |
| `api-designer/` | `engineer/architecture-design/` |
| `code-reviewer/` | `engineer/quality-security/` |
| `data-engineer/` | `engineer/infrastructure/` |
| `designer/` | `engineer/architecture-design/` |
| `devops/` | `engineer/infrastructure/` |
| `performance-engineer/` | `engineer/quality-security/` |
| `qa-engineer/` | `engineer/quality-security/` |
| `release-manager/` | `tech-lead/decisions/` |
| `security-engineer/` | `engineer/quality-security/` |
| `technical-writer/` | `engineer/engineering/` |

### Multi-role principles

- A filename is not bound to a single role.
- The frontmatter `roles:` array marks all applicable roles.
- Example: `harden-supply-chain.md` frontmatter `roles: [engineer, tech-lead, oncall-sre]`.

### Depth checks

| Path | Levels | Compliant | Explanation |
|---|---|---|---|
| `engineer/architecture-design/{file}.md` | 2 | yes | flat problem domain leaf |
| `engineer/engineering/{file}.md` | 2 | yes | merged ai-ml + tools-devx |
| `engineer/lessons/{file}.md` | 2 | yes | flattened lessons (no sub-subdirs) |
| `tech-lead/decisions/yiai--{file}.md` | 3 | yes | project ADR subdirectories |
| `product-manager/projects/yiai/{file}.md` | 3 | yes | per-project PM docs |
| `engineer/projects/yiai/stories/{story}/{scene}/scene.md` | 5 | exception | BRD story subtree is data-driven |
| `knowledge-curator/diagrams/{file}.md` | 2 | yes | standard leaf |
| `new-hire/onboarding/yiai/{file}.md` | 3 | yes | per-project onboarding |

### Fallback directories

| Fallback location | Purpose |
|---|---|
| `knowledge-curator/governance/inbox.md` | staging for new content whose home is unknown |
| `knowledge-curator/governance/triage.md` | raw text that has been classified but not yet summarized |
| `knowledge-curator/notes/` | scratch drafts (not formal knowledge) |

## Action recommendations

1. Before adding a leaf, confirm depth ≤ 3; otherwise, restructure the subcategory.
2. New filenames use descriptive verb-phrases (`set-up-X.md` / `harden-X.md` / `audit-X.md`); hyphens only; `_` and digits are forbidden (brd/ exempt).
3. For multi-role files, list all applicable roles in the frontmatter `roles:` array.
4. Quarterly review: depth compliance, roles field not missed, external content `last_verified` within 6 months.
5. After moving a file, run a repo-wide `grep -rn` for the old path to avoid dead links.



- **Directories organized by semantic category rather than role** — consequence: employees must understand "what methodology is" before finding engineering patterns.
- **Directories deeper than 3 levels** — consequence: employees don't click; deep content is effectively dead.
- **No fallback directory** — consequence: "I don't know where to put it" becomes "I won't write it".
- **Filenames with underscores or digits** — consequence: violates the user's hard constraint; naming consistency is broken.
- **Multi-role expressed by copying files** — consequence: single source of truth is broken; updates get missed; the correct approach is the `roles:` frontmatter.
- **Cross-project references to old 14-category paths** — consequence: 404 links; after migration, grep and replace all.

## Related

- Same class (4 diagrams): [knowledge-map.md](./knowledge-map.md) / [governance.md](../governance/governance.md) / [user-journey.md](./user-journey.md)
- Upstream: [README.md](../README.md) (KB overview), [../../INDEX.md](../../INDEX.md) (repository-wide TOC)
- Downstream: [inbox.md](../governance/inbox.md) / [triage.md](../governance/triage.md) (fallback)
- Migration plan: [../governance/user-story-migration-plan.md](../governance/user-story-migration-plan.md) — 14-category → 10-role-directory mapping + deviation notes