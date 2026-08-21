---
title: YiKnowledge Quick Start
tags: [quick-start, navigation, how-to, guide]
category: root
created: 2026-08-21
updated: 2026-08-21
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [curator, engineer]
benefit: "New users learn how to find, add, and maintain knowledge in YiKnowledge within 2 minutes"
acceptance_criteria:
  - "How to find content (3 methods)"
  - "How to add content (5 steps)"
  - "Key conventions (frontmatter, naming, boundaries)"
  - "Common tasks (update, deprecate, cross-reference)"
related:
  - ./README.md
  - ./INDEX.md
  - ./MEMORY.md
  - ./curator/governance/readiness-checklist.md
  - ../CLAUDE.md
---

# YiKnowledge Quick Start

> **2-minute guide to finding, adding, and maintaining knowledge.**

## Find content

**By pipeline stage** (recommended) — Start from the stage you're in:

| Stage | Role directory | I need to... |
|---|---|---|
| 1. Requirements | [producter/](./producter/) | Define what to build |
| 2. Decisions | [leader/](./leader/) | Choose technical direction |
| 3. Design+Build | [engineer/](./engineer/) | Implement it |
| 4. Ship+Operate | [srer/](./srer/) | Release and run it |

**By search** — Fastest way to find specific content:
```bash
rg "^tags:.*keyword" YiKnowledge -l    # Find by tag
rg "^title:.*keyword" YiKnowledge -l   # Find by title
rg "^roles:.*engineer" YiKnowledge -l  # Find by role
```

**By frontmatter scan** — Judge relevance before reading:
```bash
head -15 YiKnowledge/<role>/<file>.md
```

## Add content

1. **Pick the right directory** — Use the [role boundary decision tree](./README.md#role-boundary-quick-reference)
2. **Name the file** — kebab-case, hyphens only, no underscores or digits: `my-topic-name.md`
3. **Add frontmatter** — Minimum: `title`, `tags` (3-5), `category`, `created`, `updated`, `source`, `type`, `status`
4. **Run the checklist** — [10-question readiness gate](./curator/governance/readiness-checklist.md)
5. **Verify links** — All `related:` paths must resolve to existing files

## Key conventions

| Rule | Example |
|---|---|
| kebab-case filenames | `cross-project-rpc-protocol.md` ✓, `Cross_Project.md` ✗ |
| Required frontmatter | `title`, `tags`, `category`, `created`, `updated`, `source`, `type`, `status` |
| One role per file | File lives in exactly one role directory |
| `related:` links must work | Dead links break trust in the entire KB |
| Max 3 directory levels | `role/problem-domain/file.md` |

## Common tasks

**Update a file**:
```bash
# 1. Edit the file
# 2. Update frontmatter: updated: YYYY-MM-DD, last_verified: YYYY-MM-DD
# 3. Verify cross-references still resolve
```

**Deprecate a file**:
```bash
# 1. Change frontmatter: status: deprecated
# 2. Add a note in the body explaining why
# 3. Update all files that reference it
# 4. After 6 months, move to curator/archive/
```

**Add a cross-reference**:
```yaml
related:
  - ./relative/path/to/file.md    # Same directory
  - ../../other-role/file.md      # Different role
  - ../../../YiVad/CLAUDE.md      # Project file
```

## Where everything lives

| What | Where |
|---|---|
| Full overview | [README.md](./README.md) |
| Navigation index | [INDEX.md](./INDEX.md) |
| Rules & conventions | [MEMORY.md](./MEMORY.md) |
| Governance | [curator/governance/](./curator/governance/) |
| Health dashboard | [curator/governance/dashboard-knowledge-health.md](./curator/governance/dashboard-knowledge-health.md) |
| Monorepo entry point | [../CLAUDE.md](../CLAUDE.md) |
| Project docs | [../YiVad/CLAUDE.md](../YiVad/CLAUDE.md), [../YiAi/CLAUDE.md](../YiAi/CLAUDE.md), [../YiPet/CLAUDE.md](../YiPet/CLAUDE.md) |