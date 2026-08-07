---
title: New Hire Onboarding Template
aliases:
- onboarding-template
- project-onboarding-skeleton
tags:
- Template
- new hire
- onboarding
- onboarding
- yi-family
category: new-hire/onboarding
created: 2026-07-31
updated: 2026-08-03
last_verified: 2026-08-07
source: internal
type: template
status: stable
lifecycle: active
review_cycle: yearly
roles:
- new-hire
benefit: onboarded quickly
acceptance_criteria:
  - "all placeholders are annotated with expected content type"
  - "field descriptions include required-vs-optional and format constraints"
  - "usage guidance explains when to use this template and common mistakes"
related:
- ./onboarding-checklist.md
- ../../engineer/projects
- ../../MEMORY.md
tacit: false
---

# New Hire Onboarding Template

> **As a** new hire, **I want to** template, **so that** onboarded quickly. 

> For every Yi family project (YiAi / YiVad / YiPet / future additions), a new-hire onboarding guide should be placed at `YiKnowledge/new-hire/onboarding/<project-name>/onboarding.md`.

## Summary

- This template defines the 8-section structure of `projects/<project-name>/onboarding.md`; copy and fill placeholders to use immediately. 
- 8 sections in fixed order: project positioning / first-day setup / three high-frequency workflows / new-hire pitfalls quick lookup / what to read next / Day-1 task list / owner / common errors quick lookup. 
- Cross-project general pitfalls must be kept: RPC parameters use `filter` not `query`, `/read-file` / `/write-file` use `target_file` not `path`, path alias `@/` points to `src/`. 
- Usage steps: copy this file → replace `{{...}}` placeholders → delete "how to use this template" section → change frontmatter `category` to `projects/<project-name>` → register in `INDEX.md`. 
- The 8-section order and titles must stay consistent for cross-project comparison; entries may be added/removed, sections cannot be missing. 

## Core viewpoints

- The onboarding target is a 30-minute walkthrough of first-day setup — anything beyond 30 minutes of environment issues must have explicit reasons and resolutions written in the template. 
- Three high-frequency workflows are the minimum bar for a new hire to deliver independently — pick UI component / RPC endpoint / cross-module communication, covering 80% of daily changes. 
- Cross-project general pitfalls must be reused — iron rules (`filter` / `target_file` / `@/`) stay consistent across all Yi family projects; keep them inside the template. 
- The 8 sections in fixed order ease cross-project comparison — order and titles cannot change; entries within sections may be added/removed. 

## Key information

### How to use this template

1. Copy this file to `YiKnowledge/new-hire/onboarding/<project-name>/onboarding.md`
2. Replace all `{{...}}` placeholders (project name, ports, commands, URLs, etc.) 
3. Delete the "how to use this template" section
4. In frontmatter, change `category` to `projects/<project-name>`
5. You may add/remove entries within sections for the actual project, but **keep the order and titles of the 8 sections consistent** for cross-project comparison
6. After writing, register a line in the projects section of `YiKnowledge/INDEX.md`

### Template body (copy and use immediately) 

```markdown
# {{Project Name}} New Hire Onboarding

> {{One-line positioning: tech stack + role in the Yi family}}

## 1. Project Positioning

{{Project Name}} is the {{backend / admin console / browser extension / ...}} of the Yi family, {{core responsibility}}. Tech stack: {{language}} + {{framework}} + {{build tool}}. {{External port / load method}}. 

## 2. First-Day Setup (30 minutes to run through) 

### Prerequisites

- {{Node.js 18+ / Python 3.10+ / Chrome 114+}}
- {{Other Yi projects running, e.g. YiAi at `http://localhost:10086`}}
- {{Other external dependencies, e.g. MongoDB / Ollama}}

### Steps

# 1. Clone (skip if already inside the YrY repo) 
cd /path/to/YrY/{{project-name}}

# 2. Install dependencies
{{install_cmd}}   # npm install / pnpm install / pip install -r requirements.txt

# 3. Start service
{{dev_command}}   # npm run dev / pnpm dev / python main.py

# 4. Type check + build (optional, verify environment) 
{{typecheck_cmd}}   # npm run typecheck / pnpm type:check / python -m py_compile

### Verification checklist

- [ ] Open `{{verify_url}}` in browser and see {{expected page}}
- [ ] DevTools Console has no errors
- [ ] {{Key functionality verification, e.g. SSE streaming / extension popup / Swagger visible}}
- [ ] `{{typecheck_cmd}}` exits with code 0

## 3. Three High-Frequency Workflows

### Workflow A: {{Add a UI component / Add an RPC endpoint / Add a menu page}}

{{One-line scenario}}. 

1. {{Which directory to create which file}}
2. {{Which service / store / API to call}}
3. {{i18n / routing / manifest and other ancillary changes}}
4. {{How to verify}}

### Workflow B: {{Add a service / Add a standalone route / Call a Chrome API}}

{{One-line scenario}}. 

1. {{Step 1}}
2. {{Step 2}}
3. {{Step 3}}

### Workflow C: {{aicr review + RAG chat / trigger RAG rebuild / cross-world communication}}

{{One-line scenario}}. 

1. {{Step 1}}
2. {{Step 2}}
3. {{Step 3}}

## 4. New-Hire Pitfalls Quick Lookup

| Symptom | Cause | Resolution |
|---|---|---|
| {{Symptom}} | {{Cause}} | {{Resolution, point to specific file / iron rule}} |

> Cross-project common pitfalls (must keep) : 
> - RPC parameters use `filter` not `query` (iron rule) 
> - `/read-file` / `/write-file` use `target_file` not `path` (iron rule) 
> - Path alias `@/` points to `src/`

## 5. What to Read Next

| Document | What to look at |
|---|---|
| `{{project-name}}/CLAUDE.md` (repo root)  | Module boundaries, cross-project protocols, iron rules |
| `YiKnowledge/engineer/projects/{{project-name}}/engineering/readme.md` | Architecture diagrams, data flow, directory structure |
| {{Other key files in project}} | {{What to look at}} |

## 6. Day-1 Task List

- [ ] `{{install_cmd}}` + `{{dev_command}}` runs, `{{verify_url}}` is accessible
- [ ] `{{typecheck_cmd}}` exits 0
- [ ] Read the Module Boundaries + Cross-project protocol sections of `{{project-name}}/CLAUDE.md`
- [ ] {{Add a Hello World level minimal change, submit a PR}}
- [ ] {{Run an end-to-end verification, e.g. call an RPC / load the extension / query RAG once}}
- [ ] Find a colleague for a 30-minute walkthrough

## 7. Owner / Contacts

| Role | Name | Contact |
|---|---|---|
| Project primary owner | TBD | TBD |
| {{Architecture / frontend / backend}} | TBD | TBD |
| {{Core module 1}} | TBD | TBD |
| {{Core module 2}} | TBD | TBD |
| Code review | TBD | TBD |

> Placeholder fields; project primary owner please fill in then delete this line. 

## 8. Common Errors Quick Lookup

| Error message | Cause | Resolution |
|---|---|---|
| `{{error}}` | {{Cause}} | {{Resolution, point to specific file}} |
```

### Field writing standards

| Field | Required | Standard |
|---|---|---|
| Project positioning | Yes | One-line positioning + tech stack |
| First-day setup | Yes | Runnable within 30 minutes |
| Three workflows | Yes | Cover UI / service / cross-module categories |
| New-hire pitfalls quick lookup | Yes | Include cross-project general pitfalls (keep iron rules)  |
| Day-1 list | Yes | Checkable + verifiable |
| Owner | Yes | TBD placeholder, filled by project primary owner |
| Common errors | Yes | Error message + cause + resolution |

### Applicable scenarios

- Building a new Yi family project (YiAi / YiVad / YiPet / future additions) 
- Standardizing existing project onboarding documentation
- Cross-project onboarding comparison (8 sections in fixed order) 

## Action recommendations

1. Copy this file to `projects/<project-name>/onboarding.md`
2. Replace all `{{...}}` placeholders (project name, ports, commands, URLs) 
3. Delete the "how to use this template" section
4. Change frontmatter `category` to `projects/<project-name>`
5. Keep the 8-section order and titles consistent; entries within sections may be added/removed
6. Register a line in the projects section of `YiKnowledge/INDEX.md`
7. Project primary owner fills in §7 contacts then deletes the placeholder prompt

## Anti-patterns

- Removing cross-project general pitfalls (iron rules) — new hires repeat pitfalls; must keep `filter` / `target_file` / `@/` three rules
- Changing the section order at will — cross-project comparison becomes invalid; the 8-section fixed order cannot change
- First-day setup exceeds 30 minutes — environment issues should have explicit resolutions written in the template
- Owner field long-term TBD — project primary owner must fill it in
- Day-1 list without verification method — must be checkable + verifiable

## Related

- Same category: [new hire Day-1 task list](./onboarding-checklist.md)
- Upstream: [MEMORY.md](../../MEMORY.md) (naming standards and iron rules source) 
- downstream: `projects/<project-name>/onboarding.md` (instantiated output) 
