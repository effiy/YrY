---
title: New hire Day-1 task checklist template
aliases:
- onboarding-checklist
- day-1-checklist
- new-hire-task-list
tags:
- template
- new-hire
- Day-1
- checklist
- onboarding
- verifiable
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
- ./template.md
- ../../engineer/projects
tacit: false
---

# New hire Day-1 task checklist template

> **As a** new hire,**I want to** onboarding checklist,**so that** onboarded quickly.

> Extracted from `template.md` §6; can be printed standalone or pasted into the onboarding ticket. Every item must be checkable and verifiable.

## Summary

- 5-layer checklist: environment / build / functional / reading / hands-on, each verifiable within 30 minutes for completion status.
- Cross-project iron rules must be verified in the functional layer: RPC parameters use `filter` not `query`, `/read-file` field uses `target_file` not `path`.
- Completion criteria: all [ ] checked, or blocked items explicitly labelled with "blocked reason" for discussion in walkthrough.
- Usage: copy to onboarding ticket / Notion / Feishu, replace `{{...}}` placeholders.
- Required reading: `<project>/CLAUDE.md` Module Boundaries + Cross-project protocol sections.

## Core viewpoints

- Every checklist item must be verifiable — actions like "run" / "read" must have observable exit conditions (port reachable / exit code 0 / CI passing).
- Iron-rule verification goes in the functional layer — Day-1 lets new hires use `filter` / `target_file` instead of `query` / `path`, avoiding future bad habits.
- Hands-on layer is the minimum bar — Day-1 must have a Hello-World-level PR + 30-minute walkthrough, verifying the new hire can independently submit.
- Blockers must be labelled not hidden — label blocked items with the reason, discuss in walkthrough, avoid silent blocking and delay.

## Key information

### Environment layer

- [ ] Repo cloned locally, `cd /path/to/YrY/{{project}}`
- [ ] `{{install_cmd}}` exits 0, no peer dep warnings (or already accepted by project)
- [ ] Other Yi projects it depends on are running (e.g. YiAi `http://localhost:10086` `/health/observer` 200)
- [ ] Other external dependencies ready (MongoDB / Ollama / Chrome 114+ etc.)

### Build layer

- [ ] `{{dev_command}}` starts successfully, port `{{port}}` reachable
- [ ] Browser opens `{{verify_url}}` and sees {{expected page}}
- [ ] DevTools Console has no errors
- [ ] `{{typecheck_cmd}}` exits 0
- [ ] (Optional) `{{build_cmd}}` exits 0, artifact at `{{dist_path}}` generated

### Functional layer (end-to-end, includes iron-rule verification)

- [ ] Run through one core feature ({{SSE streaming dialogue / list query / extension popup / RAG query}})
- [ ] Run through one RPC call with parameters using `filter` not `query` (iron rule)
- [ ] Run through one `/read-file` or equivalent operation, field using `target_file` not `path` (iron rule)
- [ ] DevTools / Swagger / `YiPet.help()` etc. developer entry points usable

### Reading layer

- [ ] Read `{{project}}/CLAUDE.md` Module Boundaries
- [ ] Read `{{project}}/CLAUDE.md` Cross-project protocol (iron-rule hub)
- [ ] Browse `YiKnowledge/engineer/projects/{{project}}/engineering/readme.md` architecture diagram
- [ ] Know where `YiKnowledge/new-hire/onboarding/{{project}}/onboarding.md` §4 and §8 are

### Hands-on layer

- [ ] Add a Hello-World-level change ({{add `/hello` page / add `/ping` endpoint / add `HelloBox` component}})
- [ ] Submit PR, CI passes
- [ ] Have a colleague do a 30-minute walkthrough, ask about unclear points

### Completion criteria

- All [ ] above checked off
- Or: explicitly blocked items labelled with `🚫 blocked reason`, discussed in walkthrough

### Applicable scenarios

- New hire Day-1 onboarding ticket
- Cross-project onboarding standardization
- New hire 30-minute environment acceptance
- Mentor self-check before walkthrough

## Action recommendations

1. Copy this checklist to the new hire's onboarding ticket / Notion / Feishu
2. Replace `{{...}}` placeholders (project name, port, commands)
3. Verify item by item in 5-layer order: environment → build → functional → reading → hands-on
4. Every item must produce a completion status (pass / blocked) within 30 minutes
5. Iron-rule verification in the functional layer (`filter` / `target_file`) is mandatory
6. Hands-on layer Hello World PR + 30-minute walkthrough is the Day-1 closing
7. Label blocked items with the reason, discuss in walkthrough

## Anti-patterns / common misuse

- Checklist not verifiable (e.g. "familiarize with project") — must be checkable + observable exit condition
- Skipping iron-rule verification — Day-1 lets new hires use `filter` / `target_file`
- Hands-on layer PR missing — Day-1 must have a Hello-World-level PR
- Walkthrough skipped — 30-minute walkthrough is the last gate to surface unclear points
- Blocked items silently delayed — label the reason, discuss in walkthrough

## Related

- Similar: [new hire onboarding template](./template.md) (master template of the checklist, extracted from §6)
- Upstream: [new hire onboarding template](./template.md)
- Downstream: `projects/<project>/onboarding.md` (instantiation)
