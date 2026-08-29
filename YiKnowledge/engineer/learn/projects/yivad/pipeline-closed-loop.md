---
title: YiVad Pipeline Closed-Loop — Requirements to Deployment
tags: [yivad, pipeline, closed-loop, requirements, deployment, pages, data-flow]
category: engineer/learn/projects/yivad
created: 2026-08-21
updated: 2026-08-21
source: internal
type: reference
status: stable
lifecycle: active
review_cycle: quarterly
roles: [engineer, producter, leader, srer]
benefit: "Understand the complete closed-loop page flow from requirements to deployment in YiVad"
acceptance_criteria:
  - "Every pipeline stage maps to at least one YiVad page"
  - "Each page's data model and purpose is documented"
  - "The closed-loop feedback path is clear"
related:
  - ./README.md
  - ./functional-modules.md
  - ./architecture.md
---

# YiVad Pipeline Closed-Loop — Requirements to Deployment

> YiVad's PM module implements a complete software delivery pipeline from requirements gathering through deployment to feedback. Each stage has dedicated pages with specific data models, connected in a closed loop.

## Pipeline Overview

```
Requirements     Planning        Implementation   Release        Monitor/Feedback
────────────     ────────        ──────────────   ───────        ────────────────
Issues           Cycles          Kanban           Releases       Activity
Pages            Sprint Planning Gantt                           Analytics
                 Roadmap         Modules                         Bugs
```

## Stage 1: Requirements — Define what to build

### Issues (`/issue`)
- **Purpose**: Central repository for all work items — user stories, tasks, bugs, features
- **Data model**: `{ key, title, description, issue_type, status, priority, assignee, project_key, cycle_key, labels, created_at, updated_at }`
- **Detail page**: `/issue/:key` — full issue view with comments, attachments, activity log
- **Pipeline role**: Entry point for all work. Issues flow downstream into cycles and sprints.
- **YiKnowledge counterpart**: [producter/](../../../producter/) — PRDs, user stories, prioritization

### Pages (`/page`)
- **Purpose**: Documentation pages — wikis, specs, design docs linked to projects
- **Data model**: `{ key, title, content, project_key, created_at, updated_at }`
- **Pipeline role**: Supporting documentation for requirements and design decisions.

## Stage 2: Planning — Organize work into iterations

### Cycles (`/cycle`)
- **Purpose**: Time-boxed iterations (sprints) that group issues into deliverable batches
- **Data model**: `{ key, name, goal, status (active/upcoming/completed), start_date, end_date, issue_keys, project_key }`
- **Detail page**: `/cycle/:key` — cycle detail with issue planning panel
- **Pipeline role**: Bridges requirements and implementation. Issues are assigned to cycles during sprint planning.

### Sprint Planning (`/sprintPlanning`)
- **Purpose**: Drag-and-drop interface to assign backlog issues to the current cycle
- **Data model**: Consumes `cycles` and `issues` collections. Columns: Backlog → Current Sprint
- **Pipeline role**: The active planning activity. Moves issues from "what" to "when".

### Roadmap (`/roadmap`)
- **Purpose**: High-level timeline view of projects, cycles, and milestones
- **Data model**: Aggregates `projects`, `cycles`, and `releases` into a timeline
- **Pipeline role**: Strategic planning overview. Answers "what's coming when".

### Gantt (`/gantt`)
- **Purpose**: Gantt chart view of issues and their dependencies/timelines
- **Data model**: Consumes `issues` with date ranges and dependency links
- **Pipeline role**: Tactical timeline planning. Visualizes task durations and dependencies.

## Stage 3: Implementation — Build and track

### Kanban (`/kanban`)
- **Purpose**: Board view of issues grouped by status columns
- **Data model**: Consumes `issues` filtered by cycle/project, grouped by `status`
- **Pipeline role**: Primary implementation tracking. Issues move left-to-right as they progress.

### Modules (`/module`)
- **Purpose**: Logical groupings of issues within a project (epics, feature areas)
- **Data model**: `{ key, name, description, project_key, issue_keys }`
- **Detail page**: `/module/:key`
- **Pipeline role**: Organizes implementation work into manageable chunks.

### Projects (`/project`)
- **Purpose**: Top-level containers for all work. Each project has its own issues, cycles, modules, and releases.
- **Data model**: `{ key, name, identifier, description, status (active/archived), cover_image, members, created_at, updated_at }`
- **Detail page**: `/project/:key` — project overview with activity feed, member list, and settings link
- **Pipeline role**: The container for the entire pipeline. All other PM pages filter by project.

## Stage 4: Release — Ship to production

### Releases (`/release`)
- **Purpose**: Versioned releases that bundle completed issues for deployment
- **Data model**: `{ key, name, version, description, status (planned/in_progress/released), release_date, issue_keys, project_key }`
- **Detail page**: `/release/:key`
- **Pipeline role**: The deployment gate. Issues move from "done" to "released" when shipped.
- **YiKnowledge counterpart**: [srer/release/](../../../srer/release/) — release procedures, rollback, canary

## Stage 5: Monitor & Feedback — Learn and improve

### Activity (`/activity`)
- **Purpose**: Chronological feed of all actions across projects — issue updates, comments, status changes, releases
- **Data model**: Consumes activity log entries: `{ key, type, action, target_type, target_key, user, timestamp, details }`
- **Pipeline role**: Real-time visibility into what's happening across the pipeline.

### Analytics (`/analytics`)
- **Purpose**: Dashboard of pipeline metrics — throughput, cycle time, burndown, velocity
- **Data model**: Aggregates `issues`, `cycles`, and `releases` into charts and metrics
- **Pipeline role**: Data-driven insights. Answers "how fast are we shipping" and "where are the bottlenecks".

### Bugs (`/bug`)
- **Purpose**: Defect tracking with severity, reproduction steps, and resolution status
- **Data model**: `{ key, title, description, severity, status, repro_steps, linked_issue_key, project_key, created_at, updated_at }`
- **Detail page**: `/bug/:key`
- **Pipeline role**: The feedback loop. Bugs found in production flow back into the Issues pipeline, completing the closed loop.

## Supporting Pages

### Search (`/search`)
- **Purpose**: Full-text search across issues, pages, and projects
- **Pipeline role**: Cross-cutting discovery across all pipeline stages.

### Labels (`/label`)
- **Purpose**: Tag management for categorization and filtering
- **Data model**: `{ key, name, color, project_key }`
- **Pipeline role**: Cross-cutting organization. Labels filter issues across all pipeline stages.

## The Closed Loop

```
                    ┌──────────────────────────────────────────┐
                    │                                          │
                    ▼                                          │
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Issues  │──▶│  Cycles  │──▶│  Kanban  │──▶│ Releases │──▶│ Activity │
│  Pages   │   │  Sprint  │   │  Gantt   │   │          │   │ Analytics│
└──────────┘   │ Planning │   │ Modules  │   └──────────┘   └──────────┘
     ▲         └──────────┘   └──────────┘        │              │
     │                                            │              │
     │                                            ▼              ▼
     │         ┌──────────────────────────────────────────────────┘
     │         │
     └─────────┘
        Bugs (feedback → new issues)
```

1. **Requirements** enter as Issues (user stories, tasks, features)
2. **Planning** organizes Issues into Cycles via Sprint Planning, visualized on Roadmap and Gantt
3. **Implementation** tracks progress on Kanban boards, organized by Modules within Projects
4. **Release** bundles completed Issues into versioned Releases for deployment
5. **Monitor** tracks Activity and Analytics for visibility
6. **Feedback** from Bugs found in production creates new Issues, closing the loop

## Configuration & Settings

The Settings menu group (`/settings`) provides workspace-level configuration:

| Page | Path | Purpose |
|------|------|---------|
| Workspace | `/settings` | General workspace settings (name, defaults) |
| Custom Statuses | `/customStatus` | Custom issue status definitions with colors and ordering |
| Custom Views | `/customView` | Saved issue filters (status, priority, assignee, grouping) |
| API Tokens | `/apiToken` | API token generation and management |
| Integrations | `/integration` | Webhook configuration for external service integration |
| Members | `/invite` | Team member invitation and role management |
| Import | `/import` | CSV/JSON import for issues |
| Trash | `/trash` | Soft-deleted items with 30-day auto-purge |

## Data Collections (MongoDB via YiAi)

All PM pages read/write through YiAi's `data_service`:

| Collection | Used By |
|------------|---------|
| `projects` | Projects, Roadmap, Settings |
| `issues` | Issues, Kanban, Cycles, Sprint Planning, Gantt, Search, Releases, Bugs, Activity, Analytics, Trash, Import |
| `cycles` | Cycles, Sprint Planning, Roadmap |
| `modules` | Modules |
| `releases` | Releases, Roadmap, Activity |
| `bugs` | Bugs |
| `pages` | Pages, Search |
| `labels` | Labels |
| `activity` | Activity, Analytics |
| `custom_statuses` | Custom Statuses |
| `custom_views` | Custom Views |
| `api_tokens` | API Tokens |
| `webhooks` | Integrations |
| `members` | Members (Invite) |
| `notifications` | Inbox |
| `favorites` | Favorites |
| `time_entries` | Time Report |

## Page-to-Knowledge Mapping

Each YiVad page has corresponding knowledge in YiKnowledge:

| YiVad Page | Pipeline Stage | YiKnowledge Role |
|------------|---------------|------------------|
| Issues, Pages | Requirements | [producter/](../../../producter/) |
| Roadmap, Gantt | Planning | [leader/](../../../leader/) |
| Kanban, Modules | Implementation | [engineer/](../../../engineer/) |
| Releases | Release | [srer/release/](../../../srer/release/) |
| Activity, Analytics | Monitor | [srer/observability/](../../../srer/observability/) |
| Bugs | Feedback | [engineer/learn/lessons/bugs/](../../../engineer/learn/lessons/bugs/) |