---
title: yry-skill family — 5 custom skills + skill-creator design and contract
tags:
- skill
- claude-code
- yry
- skill-creator
- automation
category: skill-author/patterns
created: 2026-08-05
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: monthly
roles:
- skill-author
- engineer
- ai-engineer
benefit: When designing new skills or upgrading existing ones, the yry-* family's frontmatter and invocation contract can be found in one place without breaking backward compatibility
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ../../../.claude/skills/yry-npm/SKILL.md
- ../../../.claude/skills/yry-init/SKILL.md
- ../../../.claude/skills/yry-gen-brd/SKILL.md
- ../../../.claude/skills/yry-optimize-meta-columns/SKILL.md
- ../../../.claude/skills/import/SKILL.md
- ../../../.claude/skills/skill-creator/SKILL.md
- ../README.md
tacit: false
---

# yry-skill family — 5 custom skills + skill-creator design and contract

> **As a** skill-author, **I want to** a record of the yry-* custom skill family's frontmatter fields, invocation contract and lifecycle conventions, **so that** new skill design has a standard template and existing skill upgrades do not break backward compatibility.

> The YrY project has 5 custom skills (yry-npm / yry-init / yry-gen-brd / yry-optimize-meta-columns / import) and 1 meta skill (skill-creator) under `.claude/skills/`. This article is recorded after verifying the current SKILL.md on 2026-08-05.

## Summary

| Skill | Trigger | Invocation | lifecycle | Purpose |
|---|---|---|---|---|
| yry-npm | `/rui-npm` | `node skills/rui-npm/rui-npm.mjs [command]` | default-pipeline | Personal npm packages management (search/install/publish/npx) |
| yry-init | `/yry-init` | 4-step pipeline (01-detect → 02-explore → 03-generate → 05-verify) | default-pipeline | Project initialization end-to-end pipeline (full rebuild of CLAUDE.md + README.md) |
| yry-gen-brd | `/yry-gen-brd` | Reads BRD template + meta-schemas, generates structured fields + markdown body, via TopicEntry API | default-pipeline | Generate a single BRD entry into the YiVad BRD system |
| yry-optimize-meta-columns | (auto-triggered) | Optimize `MetaColumn[]` width/minWidth based on label character length | default-pipeline | Make column headers display on a single line without wrapping |
| import | (manual) | `node .claude/yry-import/sync.mjs [options]` | default-pipeline | Batch sync local documents to the remote document API |
| skill-creator | (meta) | Create/modify/test skills themselves, provides frontmatter template + body 7-section structure | — | New skill skeleton generation + performance testing |

## Core viewpoints

- **yry-* prefix only for project-specific skills** — yry-npm / yry-init / yry-gen-brd / yry-optimize-meta-columns / yry-import are YrY project-specific, distinguished from public skills (nodejs / vite / vue etc.); `/rui-npm` is an alias command of yry-npm (legacy naming, do not clean up)
- **lifecycle: default-pipeline is this project's unified convention** — All yry-* skills use `default-pipeline`, meaning they follow the standard detect → explore → generate → verify flow; yry-init is the canonical sample of this flow (4 step sub-directories sharing the `pipelineState` object)
- **description writes "when to invoke" not "what it does"** — `description` is the AI recall signal; write trigger scenarios (`Invoke when...` / `Triggered by...`) not feature descriptions; `Invoke when metaColumns have hardcoded widths that cause label wrapping` in `yry-optimize-meta-columns` is a good example
- **skill-creator is a meta-skill** — It does not directly produce business value but provides a harness for generating / modifying / performance testing other skills; new skills go through it to generate the skeleton, not hand-write empty SKILL.md files
- **import naming exception without yry- prefix** — `import` is a project-level document sync skill with a generic name, but its implementation path is still in `.claude/yry-import/` (directory name has yry-, skill name does not); do not rename to avoid breaking registered commands

## Key information

### SKILL.md frontmatter 4 required fields

```yaml
---
name: <skill-name>           # matches directory name; if no yry- prefix, it's a public skill
description: <recall signal>       # write when to invoke, not what it does
user_invocable: true|false   # whether to expose as /<skill-name> command
lifecycle: default-pipeline  # this project's unified convention
---
```

`description` writing comparison:
- ✅ `Invoke when metaColumns have hardcoded widths that cause label wrapping or when adding new metaColumns.` (writes when)
- ❌ `Manages personal npm packages.` (writes what, weak recall signal)

### yry-npm — Personal npm packages management

- **Trigger**: `/rui-npm` (alias command) / `/yry-npm --help`
- **Executable**: `node skills/rui-npm/rui-npm.mjs [command]`
- **Command family**: search / install / update / list / info / uninstall / publish / npx / cdn / account
- **scope**: `@ruiyi/` personal scope
- **Philosophy**: derived from project root CLAUDE.md

### yry-init — Project initialization pipeline

- **Trigger**: `/yry-init`
- **Structure**: 4 sub-directories under `steps/`, executed in strict order:
  - `01-detect/` — infer project type (Vue / React / FastAPI / Chrome ext etc.)
  - `02-explore/` — scan code structure, extract architecture signals
  - `03-generate/` — generate CLAUDE.md + README.md
  - `05-verify/` — type:check / build / lint verification
- **Shared state**: `pipelineState` object passed across steps; steps do not directly invoke each other
- **Full rebuild**: CLAUDE.md fully rewritten; README.md preserves domain-language and rewrites the rest

### yry-gen-brd — BRD entry generation

- **Trigger**: `/yry-gen-brd`
- **Input**: business domain / country / brand / priority / business context
- **Output**: a single BRD entry (structured meta fields + complete markdown body), written to the YiVad BRD system via TopicEntry API
- **Context source**: reads `YiKnowledge` BRD template + `YiVad/src/views/brd/meta-schemas.ts` current schema

### yry-optimize-meta-columns — Column width optimization

- **Trigger**: automatic (when metaColumn labels wrap)
- **Algorithm**: calculate `width` / `minWidth` by label character length, making column headers display on a single line
- **Trigger scenario**: `Invoke when metaColumns have hardcoded widths that cause label wrapping or when adding new metaColumns.`

### import — Local document batch sync

- **Trigger**: manual only
- **Executable**: `node .claude/yry-import/sync.mjs [options]`
- **Behavior spec**: scan / filter / path mapping / API contract / error model in `rules/sync-rules.md`
- **Directory naming exception**: skill name has no yry- prefix, but directory name `.claude/yry-import/` does; do not rename

### skill-creator — meta skill

- **Purpose**: create new skills / modify existing skills / performance testing
- **Provides**: frontmatter template + body 7-section skeleton + eval harness
- **New skill flow**: run skill-creator to generate skeleton → fill description + body → test → register to `available-skills`



- **Do not hand-write empty SKILL.md files** — Go through skill-creator to generate the skeleton; frontmatter 4 fields + body 7-section structure is the standard
- **Do not write feature descriptions in description** — `Manages npm packages` is a weak recall signal; write `Invoke when...` / `Triggered by...` trigger scenarios
- **Do not add yry- prefix to public skills** — yry- is a project-specific prefix; general skills like nodejs / vite / vue do not add it
- **Do not rename the import skill** — Although skill name has no yry- prefix, the command is already registered; renaming would break existing invocations
- **Do not directly invoke between steps** — yry-init's 4 steps are decoupled via the `pipelineState` object; direct invocation breaks the full-rebuild semantics
- **Do not omit the lifecycle field** — All skills in this project use `default-pipeline`; omitting makes the skill follow a non-standard flow

## Action recommendations

When designing a new skill:

1. Run skill-creator to generate the skeleton (`.claude/skills/<new-name>/SKILL.md`)
2. Fill frontmatter 4 fields (`name` matches directory; `description` writes when to invoke; `user_invocable: true`; `lifecycle: default-pipeline`)
3. Decide whether to add yry- prefix (add if project-specific, not if general)
4. Write body following the 7-section structure (summary / core viewpoints / key information / anti-patterns / action recommendations / related)
5. Run skill-creator's eval harness to test recall
6. Register to `available-skills` (skill-creator does this automatically)

When upgrading an existing skill:

1. Modify SKILL.md body, leave frontmatter untouched (unless description trigger scenario changed)
2. Run eval harness to verify recall does not drop
3. Commit, run skill-creator's lint validation
4. Do not break backward compatibility: command name / executable path / lifecycle are not renamed

## Anti-patterns

- **Writing the `description` field of a new skill by copying the `description` from an existing skill and changing the nouns.** "Manages personal npm packages" becomes "Manages project BRD entries." The description is now a feature description, not a recall signal, and the AI will not invoke the skill when the user says "generate a BRD" because the description does not match the user's words. Write the description by imagining the exact phrase a user would say to trigger the skill, and use that phrase verbatim.
- **Adding a new step to the yry-init pipeline by creating a `04-new-step/` directory and expecting it to execute automatically.** The pipeline executes steps in lexicographic order of their directory names. A directory named `04-new-step/` will execute between `03-generate/` and `05-verify/`, but only if the pipeline runner is configured to discover new steps. If the runner has a hardcoded list of step directories, the new step is silently skipped. The pipeline runner must be verified to support dynamic step discovery before adding a new step.
- **Renaming a skill's directory without updating every reference to the old directory name in CLAUDE.md, memory files, and other skills.** The `yry-npm` skill was renamed from an earlier name, but the command `/rui-npm` was preserved for backward compatibility. If the directory is renamed without preserving the alias, every script, document, and muscle-memory reference to the old name breaks. Directory renames must be treated as breaking changes with a migration plan.
- **Testing a new skill's recall by running the eval harness once and declaring it good, without testing against a set of negative examples.** The eval harness confirms that the skill is invoked when the user says the trigger phrase. It does not confirm that the skill is NOT invoked when the user says something unrelated. A skill with a description that is too broad ("Invoke when the user wants to manage packages") will be triggered by unrelated prompts and crowd out the correct skill. The eval must include negative examples that the skill should NOT match.
- **Creating a skill that wraps an existing public skill with a yry- prefix and slightly different behavior.** A `yry-vue` skill that adds YiVad-specific conventions on top of the public `vue` skill creates a fork of the public skill. When the public `vue` skill is updated, the `yry-vue` fork does not inherit the update, and the two skills diverge. YiVad-specific conventions should be added as rules or memory files that the public skill reads, not as a fork of the skill itself.

## Related

- [skill-author/README.md](../README.md) — Skill Author workspace
- [.claude/skills/yry-npm/SKILL.md](../../../.claude/skills/yry-npm/SKILL.md) — yry-npm source of truth
- [.claude/skills/yry-init/SKILL.md](../../../.claude/skills/yry-init/SKILL.md) — yry-init source of truth
- [.claude/skills/yry-gen-brd/SKILL.md](../../../.claude/skills/yry-gen-brd/SKILL.md) — yry-gen-brd source of truth
- [.claude/skills/yry-optimize-meta-columns/SKILL.md](../../../.claude/skills/yry-optimize-meta-columns/SKILL.md) — yry-optimize-meta-columns source of truth
- [.claude/skills/import/SKILL.md](../../../.claude/skills/import/SKILL.md) — import source of truth
- [.claude/skills/skill-creator/SKILL.md](../../../.claude/skills/skill-creator/SKILL.md) — skill-creator (meta) source of truth
- [knowledge-curator/templates/knowledge-leaf.md](../../knowledge-curator/templates/knowledge-leaf.md) — leaf template (SKILL.md body and knowledge base leaf share the same origin)
