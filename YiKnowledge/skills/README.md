---
title: "Claude Code Skills"
tags: [index, skills, claude-code, ai-tools]
category: aier/skills
created: 2026-08-10
updated: 2026-08-10
last_verified: 2026-08-10
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
roles: [aier]
benefit: "AI engineers find Claude Code skill definitions and development tool references in one index"
acceptance_criteria:
  - "23 skill directories cataloged across 5 categories"
  - "All SKILL.md files have KB-standard frontmatter with roles/tags/category/lifecycle"
  - "yivad/ project-specific config directory documented"
related:
  - ../INDEX.md
  - ../README.md
  - ../methodology/agent-architecture-patterns.md
---

# Claude Code Skills

> **As an** AI engineer, **I want to** reference Claude Code skill definitions and development tool conventions, **so that** I can work effectively across the full stack.

## Skill categories

### Frontend (7)

| Skill | Description | Files |
|---|---|---|
| [vue/](./vue/) | Vue 3 Composition API, Pinia, Vue Router, Element Plus, SFC conventions | 10 |
| [vite/](./vite/) | Vite.js build tool, plugins, framework integrations, SSR/SSG | 3 |
| [css/](./css/) | Modern CSS: cascade layers, container queries, custom properties, Grid/Flexbox | 1 |
| [h5/](./h5/) | H5 mobile web development: viewport, touch events, responsive design | 1 |
| [ui-ux/](./ui-ux/) | UI/UX design: logos, icons, banners, slides, CIP, design systems | 51 |
| [chrome/](./chrome/) | Chrome Extension MV3: service workers, content scripts, Chrome APIs | 1 |
| [tauri/](./tauri/) | Tauri ecosystem: templates, plugins, integrations, showcase apps | 2 |

### Backend (4)

| Skill | Description | Files |
|---|---|---|
| [fastapi/](./fastapi/) | FastAPI: dependency injection, middleware, Pydantic, WebSocket, testing | 1 |
| [nodejs/](./nodejs/) | Node.js best practices: 100+ vetted practices by category | 2 |
| [nginx/](./nginx/) | Nginx operations: config, tuning, security, logging | 2 |
| [public-api/](./public-api/) | Public API probing: curl, endpoint discovery, OpenAPI scraping | 1 |

### Platform & Tools (5)

| Skill | Description | Files |
|---|---|---|
| [git/](./git/) | Git: branch, merge, rebase, stash, cherry-pick, hooks, workflows | 1 |
| [github/](./github/) | GitHub: issues, PRs, code search, repo operations, security | 4 |
| [npm/](./npm/) | Personal npm package management: search, install, publish | 7 |
| [lighthouse/](./lighthouse/) | Lighthouse: performance audits, CI integration, DevTools | 3 |
| [tmux/](./tmux/) | Tmux: tutorials, cheat sheets, themes, plugins, session management | 3 |

### AI & Claude Code (5)

| Skill | Description | Files |
|---|---|---|
| [skill-creator/](./skill-creator/) | Create, improve, evaluate, and package Claude Code skills | 10 |
| [init/](./init/) | Project initialization pipeline: detect -> explore -> generate -> verify | 45 |
| [import/](./import/) | Document import/sync to remote API | 2 |
| [gen-brd/](./gen-brd/) | Generate BRD (Business Requirements Document) entries | 1 |
| [mermaid/](./mermaid/) | Mermaid diagram rendering: 15+ themes, 5 diagram types | 4 |

### Business & Strategy (3)

| Skill | Description | Files |
|---|---|---|
| [market-research/](./market-research/) | Full research lifecycle: landscape surveys, single-project evaluation, head-to-head comparison, YiKnowledge output | 1 |
| [code-quality-research/](./code-quality-research/) | Evaluate and select AI-powered code quality tools across 4 key paths: review, test generation, refactoring, style alignment | 1 |
| [business-strategy/](./business-strategy/) | Define organizational strategy: market intelligence, competitive analysis, OKRs, roadmaps, build-vs-buy decisions | 1 |

### Project-specific config

| Directory | Description | Files |
|---|---|---|
| [yivad/](./yivad/) | YiVad project Claude Code config: agents, commands, rules, settings (no SKILL.md) | 9 |