---
title: Write a PRD — Product Requirements Document
aliases: [write-a-prd, prd-guide, prd-methodology]
tags: [producter, discovery, prd, requirements, methodology]
category: producter/discovery
created: 2026-08-24
updated: 2026-08-24
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [producter, leader, engineer]
benefit: "Producters write PRDs that are clear, scoped, and actionable — the single source of truth for what to build"
acceptance_criteria:
  - "explains when to write a PRD and when to skip it"
  - "provides a step-by-step PRD writing process"
  - "includes real examples from YrY projects"
related:
  - ./prd/README.md
  - ./prd/prd-template.md
  - ../delivery/run-a-sprint.md
  - ../../curator/templates/prd.md
  - ../../curator/templates/brd.md
---

# Write a PRD

> **When to use:** Before any significant feature work. A PRD is the contract between product, engineering, and design — it says *what* to build and *why*.

## When to Write a PRD

| Write a PRD | Skip the PRD |
|---|---|
| New feature affecting multiple services | Bug fix (one-line change) |
| User-facing change (new UI, new flow) | Config change, copy update |
| API change that affects frontend consumers | Internal refactoring (no behavior change) |
| Cross-team effort (product + engineering + design) | Solo work with clear requirements |

**Rule of thumb:** If it takes more than a day to build, write a PRD. If it takes more than a week, write a BRD first.

## PRD Writing Process

### 1. Start with the user problem (not the solution)

Bad: "Add a dark mode toggle to the settings page."
Good: "Users who work at night report eye strain and avoid using the app after 8pm."

### 2. Define the user persona

Who has this problem? Be specific:

- **Role:** YiVad admin user
- **Context:** Managing projects late at night; screen brightness is painful
- **Current workaround:** Using browser dev tools to inject dark CSS

### 3. Write the user stories

| Priority | Story | Acceptance criteria |
|---|---|---|
| P0 | As an admin, I can switch to dark mode so I can work comfortably at night | Toggle visible in settings; persists across sessions |
| P1 | As an admin, dark mode applies to all pages so I don't need to re-enable it | Dark mode is global; all pages respect the setting |

### 4. Define scope (in / out)

**In scope:**
- Dark mode toggle in settings
- Dark theme for all YiVad pages
- Persist preference in localStorage

**Out of scope:**
- Auto-switch based on OS preference (future PRD)
- Custom theme colors (future PRD)
- Dark mode for YiPet (separate project)

### 5. Define success metrics

| Metric | Baseline | Target |
|---|---|---|
| Dark mode adoption | 0% | > 20% of users within 30 days |
| Nighttime usage (8pm-6am) | 5% of daily | > 10% of daily |

### 6. Identify risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Some third-party components don't support dark mode | Medium | Audit Ant Design component compatibility first |
| Dark mode increases QA scope | High | Add dark mode to visual regression tests |

## YrY PRD Examples

| PRD | Project | Status |
|---|---|---|
| BRD Agent | YiVad | [prd/brd-agent.md](./prd/brd-agent.md) |
| aiChat Port | YiVad | [prd/aichat-port.md](./prd/aichat-port.md) |

## PRD Lifecycle

```
Draft → Review → Approved → In Development → Shipped → Archived
  │        │         │            │             │
  │        │         │            │             └─ PRD serves as historical reference
  │        │         │            └─ PRD is the source of truth during implementation
  │        │         └─ PRD is locked; changes require a revision
  │        └─ Team reviews for feasibility, scope, and clarity
  └─ Author writes the first draft; shares with PM for feedback
```

## Anti-patterns

| Anti-pattern | Why it fails | What to do instead |
|---|---|---|
| PRD as a 20-page novel | No one reads it; details are wrong by the time engineering starts | Keep it concise (2-5 pages); link to detailed designs separately |
| Solution-first PRD ("We will add a button that...") | Skips the problem; engineers can't evaluate alternatives | Start with the user problem; let engineering propose solutions |
| PRD without acceptance criteria | "Done" is ambiguous; QA doesn't know what to test | Every user story has at least 1 verifiable criterion |
| PRD that sits in draft for weeks | Requirements rot; context is lost | Time-box PRD writing to 2-3 days; ship or kill |