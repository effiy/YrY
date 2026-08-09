---
title: YiKnowledge rulebook and naming conventions
tags: [knowledge-base, rules, naming, frontmatter]
category: root
created: 2026-01-01
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-07
related:
  - ./README.md
  - ./INDEX.md
  - ./knowledge-curator/templates/knowledge-leaf.md
  - ./knowledge-curator/governance/governance.md
---

# YiKnowledge Rulebook

The knowledge management system lives at `~/YiKnowledge`. For full-library navigation see [INDEX.md](./INDEX.md); for the top-level category overview see [README.md](./README.md).

## Directory structure

```
YiKnowledge/
├── INDEX.md                     # Full-library TOC (8 roles × problem domains)
├── README.md                    # Top-level overview + design principles
├── MEMORY.md                    # This file: rulebook, naming conventions, frontmatter spec
│
├── engineer/                    # Code, architecture, quality, security, deployment, data, tools
│   ├── architecture-design/     # API design, system design, design patterns
│   ├── engineering/             # AI/ML + dev tools (merged ai-ml + tools-devx)
│   ├── quality-security/        # Testing, security, a11y, perf (merged quality-testing + security-supply-chain)
│   ├── infrastructure/          # CI/CD, releases, DB, data (merged deployment-operations + data-persistence)
│   ├── process/                 # Team workflows, meetings, journeys (merged collaboration-process + journeys)
│   ├── lessons/                 # Wins, failures, gotchas from real projects
│   ├── projects/                # Per-project engineering docs (YiAi, YiVad, YiPet)
│   ├── SECURITY.md              # Cross-role domain index: security, supply-chain, risk
│   └── ENGINEERING.md           # Cross-role domain index: architecture, quality, deployment
│
├── tech-lead/                   # Architecture decisions, ADRs, capacity, risk, roadmap
│   ├── architecture/            # Tech selection, maturity models, DORA metrics
│   ├── decisions/               # ADRs flat with project prefixes (yiai--, yivad--, yipet--, fde--)
│   ├── capacity/                # Cost tracking, dependency audits, capacity planning
│   ├── risk/                    # Risk register, postmortems, outage communication
│   └── roadmap/                 # Roadmap planning, tech debt, PoC, SLO, deprecation
│
├── product-manager/             # Frameworks, discovery, delivery, strategy, projects
│   ├── frameworks/              # JTBD, Kano, RICE, HEART, dual-track agile
│   ├── discovery/               # User research, PRD, UX, metrics (flat: metrics--, prd--, ux-- prefixes)
│   ├── delivery/                # Sprint, meetings, retros, reports, reviews
│   ├── strategy/                # Industry cases, competitive analysis
│   └── projects/                # Per-project PM docs (flat: yiai--, yipet--, yivad-- prefixes)
│
├── ai-engineer/                 # AI foundations, methodology, platform, data
│   ├── AI-AND-DATA.md           # Cross-role domain index: AI/ML, data engineering
│   ├── foundations/             # Transformers, attention, RAG architectures
│   ├── methodology/             # Prompt engineering, eval, agent patterns (prompts merged in)
│   ├── platform/                # Inference engines, vector DBs, deployment
│   └── data/                    # Datasets, embeddings, data pipelines
│
├── oncall-sre/                  # Incident response, observability, release
│   ├── incident-response/       # Procedures, postmortems, oncall handovers
│   ├── observability/           # Monitoring, alerting, SLO, dashboards
│   └── release/                 # Release coordination, hotfix, rollback
│
├── executive/                   # Strategy, industry, roadmap, reading
│   ├── strategy/                # Business strategy, competitive positioning
│   ├── industry/                # Reports, competitors, market trends (flat: competitors--, market-trends--, reports--)
│   ├── roadmap/                 # Org-level strategic planning
│   └── reading-list/            # Executive learning resources
│
├── knowledge-curator/           # KB governance, diagrams, templates, archive
│   ├── COLLABORATION.md         # Cross-role domain index: teamwork, process, meetings
│   ├── governance/              # Lifecycle, inbox, triage, readiness checklist
│   ├── diagrams/                # 4 diagrams: knowledge-map, user-journey, etc.
│   ├── templates/               # Knowledge leaf template, thinking models (flat: thinking-- prefixes)
│   ├── archive/                 # Archive index (strategies-legacy removed, 2041 files cleaned)
│   ├── people/                  # Experts, stakeholders, team (flat: experts--, stakeholders--, team--)
│   └── notes/                   # Curator working notes
│
├── new-hire/                    # Onboarding and handoff
│   └── onboarding/              # Onboarding checklists (flat: yiai--, yipet--, yivad-- prefixes)
│

```

## Merged roles (2026-08-06 restructure)

11 former fine-grained roles were merged into engineer/ and tech-lead/ problem domains:

| Former role | Merged into |
|---|---|
| accessibility-engineer, code-reviewer, performance-engineer, qa-engineer | engineer/quality-security/ |
| api-designer, designer | engineer/architecture-design/ |
| data-engineer | engineer/infrastructure/ |
| devops | engineer/infrastructure/ |
| security-engineer | engineer/quality-security/ |
| technical-writer | engineer/engineering/ |
| release-manager | tech-lead/decisions/ |

## projects/ depth exception

`engineer/projects/` uses flat story filenames with `--` separators (e.g. `engineer/projects/yiai/stories/ai-chat-function--user-send-message.md`). The yipet/brd/ sub-tree preserves its structured DB-export layout. Max depth is now 3 within YiKnowledge for all role directories except projects/.

## Mnemonic: Build → Ship → Run → Learn

The 7 subdirectories under `engineer/` follow a software lifecycle. Use this 4-word mnemonic to remember them:

| Phase | Subdirectories | Memory hook |
|---|---|---|
| BUILD | architecture-design, engineering | Design and build the system |
| SHIP | quality-security, infrastructure | Verify, secure, and ship |
| RUN | process | Work together |
| LEARN | lessons, projects | Learn from experience |

## Naming conventions

### Filenames

- **Path**: All-English ASCII kebab-case (`lower-case-with-dashes.md`)
- **Chinese semantics**: preserved in the frontmatter `title:` field and `aliases:`; never enter the filename
- **Hard constraint**: underscores `_` and digits are forbidden; hyphens only

### File-type suffixes

| type | Filename suffix | Purpose |
|---|---|---|
| `summary` | `{topic}-summary.md` | Distilled digest, structured via the 7-section template |
| `original` | `{topic}-original.md` | Raw source backup, untouched |
| `template` | `{topic}-template.md` | Reusable template |
| `prompt` | `{topic}-prompt.md` | Prompt |

## Archival rules

### Dual-copy archival principle

When external knowledge content is received, archive **two copies**:

1. **Original** — `web_fetch`-pulled markdown or direct file copy, stored at `YiKnowledge/{role}/{topic}-original.md`
2. **Summary** — rewritten per the 7-section template, stored at `YiKnowledge/{role}/{topic}-summary.md`
   - The summary's frontmatter `source:` must point to the original URL or `*-original.md` path
   - 7 body sections: Summary / Core ideas / Key info / Action recommendations / Anti-patterns / Related (see [knowledge-leaf.md](./knowledge-curator/templates/knowledge-leaf.md))

A single-file structure (a `{topic}.md` containing both an "Original" and a "Summary" section) is only used when the original is < 200 lines.

### Archival flow

1. Decide the topic and target role directory
2. Save original → `{role}/{topic}-original.md`
3. Write summary → `{role}/{topic}-summary.md` (per the 7-section template)
4. Summary frontmatter `source:` retains the original link/path
5. If classification is uncertain, place in [inbox.md](./knowledge-curator/governance/inbox.md) first

## YAML frontmatter spec

```yaml
---
title: File title (may contain Chinese)       # required
aliases: [English alias, alias 2]      # recommended
tags: [tag1, tag2, tag3]             # required, 3-5 entries
category: root | <role>/<subdir>            # required
created: YYYY-MM-DD                     # required
updated: YYYY-MM-DD                     # required
source: original link or file path               # required
type: summary | original | template | prompt  # required
status: stable  # valid values: draft | stable | deprecated
lifecycle: inbox | triage | active | reference | archive  # recommended, default active
review_cycle: weekly | monthly | quarterly | yearly       # required for external content
last_verified: YYYY-MM-DD              # required for external content
author: author identifier                        # optional
tacit: false                           # mark true for tacit knowledge; AI prioritises recall
roles: [engineer, tech-lead]                # recommended, multi-role recall signal
benefit: "short description"                         # recommended
acceptance_criteria:                       # recommended
  - "verifiable clause"
related:                               # recommended, cross-file links
  - relative/path/to/file.md
---
```

**Required fields**: `title` / `tags` / `category` / `created` / `updated` / `source` / `type`
**Recommended fields**: `aliases` / `status` / `lifecycle` / `related` / `roles` / `benefit` / `acceptance_criteria`
**Required for external content**: `review_cycle` / `last_verified`
**Required for tacit knowledge**: `tacit: true`

## Progressive-read strategy

Use **progressive reading** when retrieving from the knowledge base to avoid unnecessary full-text reads:

1. **Read metadata** — `head -15 file.md` reads only frontmatter
2. **Judge relevance** — Use `tags` / `category` / `title` / `lifecycle` to decide whether relevant
3. **Look at TOC** — `grep "^## " file.md` shows the 7-section body structure
4. **Full read** — Only when confirmed relevant

```bash
# Read frontmatter only
head -15 path/to/file.md

# Filter by tag across the library
rg "^tags:.*keyword" YiKnowledge -l

# Filter by role (frontmatter roles array)
rg "^roles:.*engineer" YiKnowledge -l

# Only view active content (skip inbox/triage/archive)
rg "^lifecycle: active" YiKnowledge -l
```

## Periodic review

See [knowledge-review.md](engineer/process/knowledge-review.md) and [governance.md](./knowledge-curator/governance/governance.md).

| Cadence | Owner | Duration | Action |
|---|---|---|---|
| Weekly | Ops | 1h | Clear [inbox.md](./knowledge-curator/governance/inbox.md); scan 7-day-new file frontmatter completeness |
| Monthly | Ops | 4h | Sweep `lifecycle: triage` to push summaries; clear `last_verified` overdue external content |
| Quarterly | Knowledge steward rotation | — | Verify external-content updates; architecture adjustments; update [knowledge-map.md](./knowledge-curator/diagrams/knowledge-map.md) and [tacit-knowledge-backlog.md](./knowledge-curator/governance/tacit-knowledge-backlog.md) |
| Yearly | Owner | — | Sweep [archive.md](./knowledge-curator/archive/archive.md) for physical cleanup; pick annual high-value distillations |

File review log at [review-log.md](./knowledge-curator/governance/review-log.md).

## Operating mechanism (4 roles + 3 cadences)

| Role | Responsibility | Time investment |
|---|---|---|
| **Owner** | Strategic direction, cross-category coordination | 1h/week |
| **Ops** | Content review, frontmatter maintenance, reachability analysis | 4h/week |
| **Knowledge steward** | Accuracy and freshness of this leaf | 2h/month |
| **Knowledge contributor** | Write docs, give feedback | Anytime |

Detailed charter: [knowledge-contributor-charter.md](engineer/process/knowledge-contributor-charter.md).

Core idea: **Don't rely on everyone's self-discipline** — replace "everyone is conscientious" with "knowledge steward + periodic review"; replace "add content by feel" with "search/link data-driven content additions".

## Tacit-knowledge capture

**70% of the value is tacit knowledge** — it lives in senior engineers' heads, group chats, and "everyone knows but no one wrote it down" processes.

- Current tacit-knowledge gaps: [tacit-knowledge-backlog.md](./knowledge-curator/governance/tacit-knowledge-backlog.md)
- Knowledge map (explicit + tacit inventory): [knowledge-map.md](./knowledge-curator/diagrams/knowledge-map.md)
- When submitting tacit knowledge, add `tacit: true` to frontmatter so AI prioritises recall

Capture methods: 1-on-1 interviews, workshops, code-comment extraction, process decomposition, customer interviews.
