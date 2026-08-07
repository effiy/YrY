---
title: Skill Author — Claude Code skills design and maintenance workspace
tags: [category, skill, claude-code, automation, yry]
category: skill-author
created: 2026-08-05
updated: 2026-08-06
last_verified: 2026-08-07
source: internal
type: leaf-readme
status: stable
lifecycle: reference
review_cycle: monthly
roles: [skill-author, engineer, ai-engineer]
benefit: "yry-* skill family and public skills centralized; new skill design and existing skill maintenance are traceable"
acceptance_criteria:
  - "scope of the leaf directory is clearly bounded"
  - "file inventory table is complete with one-liner descriptions"
  - "cross-references to related leaves and parent INDEX are present
related:
  - ./INDEX.md
  - ../INDEX.md
  - ../engineer/engineering/
  - ../knowledge-curator/templates/README.md
  - ./patterns/yry-skill-family.md
---

# Skill Author — Claude Code skills design and maintenance workspace

> **As a** skill-author, **I want to** centrally collect this project's custom skill family (yry-*) and public skill design patterns, lifecycle and maintenance processes, **so that** new skill design has a standard template and existing skill upgrades do not break backward compatibility.

> Covers Claude Code skill design patterns, the yry-* family (5 custom skills + 1 meta skill), public skill references, skill lifecycle (lifecycle frontmatter field) and maintenance processes.

## Sub-directories

| Leaf | Coverage | File count |
|---|---|---|
| [patterns/](./patterns/) | Skill design patterns, yry-* family, lifecycle field conventions | 1+ |
| `processes/` (planned) | Skill maintenance SOP, version upgrade process, new skill creation checklist | 0 |
| `tools/` (planned) | skill-creator / skill runner / SKILL.md frontmatter tools | 0 |

## Project context

- **5 custom skills + 1 meta skill under YrY project** — All located in `.claude/skills/`, declaring `name` / `description` / `user_invocable` / `lifecycle` fields via SKILL.md frontmatter
- **Public skill library** — `~/.claude/skills/` also has 17+ public skills including chrome / css / fastapi / git / github / h5 / import / lighthouse / mermaid / nginx / nodejs / public-api / skill-creator / tauri / tmux / ui-ux / vite / vue
- **skill-creator is a meta-skill** — Used to create/modify/test skills themselves; all new skills go through it to generate the skeleton
- **yry-* naming prefix** — Project-specific prefix, distinguishing from public skills; `/rui-npm` is an alias command for yry-npm (legacy naming)

## Design principles (project-specific)

1. **SKILL.md frontmatter 4 required fields** — `name` / `description` / `user_invocable` / `lifecycle`; `description` is the recall signal, must clearly state trigger scenarios and invocation boundaries
2. **lifecycle field convention** — All skills in this project use `lifecycle: default-pipeline`, meaning they follow the standard detect → explore → generate → verify flow; yry-init is the canonical sample of this flow
3. **yry- prefix only for project-specific skills** — Public general-purpose skills (nodejs / vite / vue etc.) do not add the prefix; only added when the skill is project-specific (yry-init / yry-gen-brd / yry-npm / yry-optimize-meta-columns / yry-import)
4. **New skills go through skill-creator to generate the skeleton** — Do not hand-write empty SKILL.md files; skill-creator provides frontmatter template + body 7-section structure + test harness
5. **description writes "when to invoke" not "what it does"** — `description` is the AI recall signal; write trigger scenarios (`Invoke when...` / `Triggered by...`) not feature descriptions (`Manages npm packages`); the former aids cross-skill recall, the latter buries the skill

## Frequently referenced (to be added)

- [patterns/yry-skill-family.md](./patterns/yry-skill-family.md) — frontmatter and invocation contracts for the 5 yry-* custom skills + skill-creator

## Related

- [INDEX.md](../INDEX.md) — Full knowledge base navigation
- [engineer/engineering/](../engineer/tools-devx) — Development collaboration tools (some cross-references)
- [knowledge-curator/templates/](../knowledge-curator/templates/) — leaf file structure template (skill SKILL.md and knowledge base leaf share the same origin)
- [skill-creator SKILL.md](../../.claude/skills/skill-creator/SKILL.md) — meta-skill, the canonical source for new skill generation
