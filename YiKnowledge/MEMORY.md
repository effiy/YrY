---
title: YiKnowledge rulebook and naming conventions
tags: [knowledge-base, rules, naming, frontmatter]
category: root
created: 2026-01-01
updated: 2026-08-14
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator]
benefit: "Single source of truth for knowledge-base rules, frontmatter schema, and naming conventions"
last_verified: 2026-08-14
related:
  - ./README.md
  - ./INDEX.md
---

# YiKnowledge Rulebook

## Directory structure

7 role directories + 3 cross-cutting domain indexes:

```
YiKnowledge/
├── INDEX.md              # Full-library TOC
├── README.md             # Top-level overview
├── MEMORY.md             # This file: rulebook
├── engineer/             # Implementation: architecture, development, quality, data, reliability, process, lessons, projects
├── leader/               # Decisions: architecture, decisions, capacity, risk, roadmap
├── producter/            # Requirements: frameworks, discovery, delivery, strategy, projects
├── aier/                 # AI: foundations, methodology, platform, ml
├── srer/                 # Operations: incident-response, observability, release
├── executiver/           # Business: strategy, industry, roadmap, reading-list
├── curator/              # Governance: governance, diagrams, templates, archive
└── skills/               # Claude Code skills
```

## Role boundaries

| Role | Core question |
|---|---|
| engineer/ | How to implement? |
| leader/ | How to decide? |
| producter/ | What product to build? |
| aier/ | How to use AI? |
| executiver/ | How to do business? |
| srer/ | How to ensure stability? |
| curator/ | How to manage the KB? |

## Naming conventions

- **Path**: All-English ASCII kebab-case (`lower-case-with-dashes.md`)
- **Chinese semantics**: preserved in frontmatter `title:` and `aliases:`; never in filename
- **Hard constraint**: underscores `_` and digits are forbidden; hyphens only

## YAML frontmatter spec

```yaml
---
title: File title                    # required
aliases: [alias1, alias2]            # recommended
tags: [tag1, tag2, tag3]             # required, 3-5 entries
category: root | <role>/<subdir>     # required
created: YYYY-MM-DD                  # required
updated: YYYY-MM-DD                  # required
source: internal | url               # required
type: summary | original | template | prompt  # required
status: draft | stable | deprecated  # required
lifecycle: inbox | triage | active | reference | archive
review_cycle: weekly | monthly | quarterly | yearly
last_verified: YYYY-MM-DD
roles: [role1, role2]                # recommended
benefit: "short description"         # recommended
acceptance_criteria:                 # recommended
  - "verifiable clause"
related:                             # recommended
  - relative/path/to/file.md
---
```

**Required fields**: `title`, `tags`, `category`, `created`, `updated`, `source`, `type`, `status`
**Recommended fields**: `aliases`, `lifecycle`, `related`, `roles`, `benefit`, `acceptance_criteria`
**Required for external content**: `review_cycle`, `last_verified`

## Progressive-read strategy

1. **Read metadata** — `head -15 file.md` reads frontmatter
2. **Judge relevance** — Use `tags`, `category`, `title`, `lifecycle`
3. **Look at TOC** — `grep "^## " file.md` shows body structure
4. **Full read** — Only when confirmed relevant

```bash
# Filter by tag
rg "^tags:.*keyword" YiKnowledge -l
# Filter by role
rg "^roles:.*engineer" YiKnowledge -l
# Only active content
rg "^lifecycle: active" YiKnowledge -l
```