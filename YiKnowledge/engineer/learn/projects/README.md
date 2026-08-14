---
title: projects/ directory explanation
tags: [projects, MOC, stories, engineering, onboarding]
category: engineer/learn/projects
created: 2026-08-03
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: reference
review_cycle: quarterly
roles: [engineer]
benefit: "Engineers access per-project business and engineering documentation, understanding the context and decisions behind each codebase"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - anti-patterns or when-not-to-use are identified
related:
  - ./INDEX.md
  - ../../run/onboarding/yiai/onboarding.md
  - ../../run/onboarding/yipet/onboarding.md
  - ../../run/onboarding/yivad/onboarding.md
  - ../../run/onboarding/handoff-project.md
---

# projects/ — project business and engineering documentation

"> **As a** engineer, **I want to** understand and apply projects/ directory explanation, **so that** I can I understand the context and decisions behind each codebase.

> Each project co-locates two classes of content: business requirements (stories/) and engineering documentation (engineering/), threaded together by onboarding.md as the ramp-up path. 

## Directory structure

```
projects/
  README.md                       # this file: classification + stories/engineering split
  INDEX.md                        # project index table (leaf overview + key subpaths)
  {project-name}/
    README.md                     # project card: positioning, tech stack, subdirectories
    onboarding.md                 # newer onboarding (8 fixed sections)
    stories/                      # business content (BRD-driven Story/Scene)
      {story-name}/
        story.md
        {scene-name}/scene.md
    engineering/                  # engineering doc mirror (CLAUDE.md / README.md / CHANGELOG.md)
      claude.md
      readme.md
      changelog.md                # only some projects
```

## stories/ vs engineering/ split

| Dimension | stories/ | engineering/ |
|---|---|---|
| Content driver | BRD / user story | architecture and conventions |
| Data relation | DB stores metadata (key, status, etc.); files store rich text | file-system self-contained |
| Update frequency | Iterates with requirements | Evolves with architecture |
| Source | Co-maintained by business and PM | Mirror of project root files |

## Design principles (stories/) 

- **DB stores metadata**: `key`, `name`, `status`, `priority`, `assignee`, `startDate`, `dueDate`, `completedAt`, `sprint`, `scheduleStatus`, `createdAt`, `updatedAt` and other management fields stored in DB
- **File system stores content**: `description`, `background`, `acceptance`, `scenarios[].steps`, `scenarios[].trigger`, all BRD chapters and other rich text content stored in Markdown files
- **Relation**: The `project` field in DB records corresponds to file-system `projects/{project-name}/`; Story directory name is the semantic identifier
- **Progressive read**: Files start with YAML frontmatter, supports reading 15 lines for metadata first, confirm relevance, then read full text

## story.md template

```markdown
---
key: story_1700000000000
name: {name}
status: draft
priority: p2
assignee: Zhang San
startDate: 2025-01-01
dueDate: 2025-01-15
sprint: Sprint 1
scheduleStatus: on_track
project: YiAi
tags: [tag1, tag2]
createdAt: 1700000000000
updatedAt: 1700000000000
---

# {name}

## Background
## Description
## Acceptance criteria

## BRD chapters
### Business objectives
### Core users
### Involved countries
### Involved modules
### Business rules
### Constraints
### Milestones
### Urgency
### Acceptance criteria
### Attachments
### Approval records
```

## scene.md template

```markdown
---
key: sc_1700000000000_abc123
name: {name}
status: draft
priority: p2
createdAt: 1700000000000
updatedAt: 1700000000000
---

# {name}

## Description
## Trigger
## Prerequisites
## Expected result

## Steps

| Order | Action | Description |
|-------|--------|-------------|
| 1     | Given  | ...         |
| 2     | When   | ...         |
| 3     | Then   | ...         |

## Tags
## Related files
- filePath: src/views/foo.vue, fileName: foo.vue
```

## engineering/ sync convention

`engineering/` `claude.md` / `readme.md` / `changelog.md` are mirror copies of the **project root** same-named files, used for centralized lookup within YiKnowledge. The original files are still maintained in each project root directory. 

After modifying the project root `CLAUDE.md` / `README.md` / `CHANGELOG.md`, manually `cp` sync into this directory, or auto-sync via a project-level hook. 

## Project list

- [YiAi](yiai) — AI + BRD agent (FastAPI backend, port 10086) 
- [YiPet](yipet) — browser extension + desktop app (Chrome MV3, React 18 + Ant Design 5) 
- [YiVad](yivad) — main control web app (Vue 3.5 + Rsbuild 1, port 8848) 

For detailed subpaths see [INDEX.md](./INDEX.md). To add a new project card, create `{project-name}/README.md` in this directory and register it in INDEX.md. 
