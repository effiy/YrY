# Quickstart — .claude/skills

_Scope: /.claude/skills_

_Audience: New contributors to the YrY project_

_Generated: 2026-07-19 11:30 (Asia/Shanghai)_

Scope-derived newcomer orientation: 5 skill groups, 26 SKILL.md manifests, one Node.js engine. Static-analysis only — nothing in this report is executed.

## Score

- Composite: **88 / 100** (B)
- Summary: Strong overview, concepts, directory map, and onboarding. Commands and FAQ coverage are below 90% — see TODO list.

## 1. Overview

.claude/skills is the Claude skill catalog for the YrY project. It is a plugin-style collection of 26 SKILL.md manifests organised into 5 top-level skill groups (rui-code, rui-init, rui-reports, rui-test, rui-tools) plus one Node.js engine under rui-reports/diagram. There is no top-level package.json; each skill is a self-contained capability with its own manifest, references, and optional commands / agents / rules / templates subfolders. The catalog is consumed by Claude through its trigger-surface descriptions and by the rui-init pipeline, which regenerates the docs/ dashboard from the catalog layout.

| Field | Value |
| --- | --- |
| Primary stack | Markdown + JavaScript |
| Framework | Claude Skill Plugin Architecture |
| Runtime | Claude Code · Node.js 20+ · Vitest 3 |
| Source language | Markdown (YAML frontmatter) |

| Stat | Value |
| --- | --- |
| SKILL.md manifests | 26 |
| Skill groups | 5  |
| Files in scope | 280 |
| Directories | 216 |

## 2. Key concepts

### SKILL.md  \n`manifest`

YAML-frontmatter file that registers a Claude skill. Frontmatter keys: name, description (trigger surface), lifecycle, user_invocable, arguments, and optional version.

_Location: `rui-init/SKILL.md:1`_

### Skill Group  \n`directory`

A top-level directory under skills/ that owns one or more related skills. The five groups: rui-code, rui-init, rui-reports, rui-test, rui-tools.

_Location: `README.md:85`_

### Trigger Surface  \n`frontmatter`

The natural-language description: block in SKILL.md that controls when Claude routes work to a skill. Do not edit casually — it changes routing behavior.

_Location: `CLAUDE.md:22`_

### Pipeline Step  \n`sub-skill`

A sub-directory under rui-init/steps/ that owns one phase of the init pipeline. The five steps: 01-detect, 02-explore, 03-generate, 04-arch, 05-verify.

_Location: `rui-init/steps/01-detect/STEP.md:1`_

### Topic  \n`sub-skill`

A rui-test knowledge unit under rui-test/topics/<slug>/. The 12 topics cover vitest-setup, runner-choice, e2e-playwright, fixture, async-flush, async-component, suspense, composable-wrapper, pinia-setup, teleport, blackbox, no-snapshot.

_Location: `rui-test/topics/vitest-setup/README.md:1`_

### Command  \n`sub-skill`

An executable sub-skill under <skill>/commands/<name>.md. In the catalog the commands/ directories appear in rui-code/fastapi, rui-reports/daily, rui-reports/diagram, rui-reports/quickstart, rui-reports/test, rui-tools/git, rui-tools/github, rui-tools/ui-ux, rui-tools/skill, rui-init/agents.

_Location: `rui-reports/quickstart/commands/create.md:1`_

### Agent  \n`sub-skill`

A specialised worker under <skill>/agents/<name>.md. Used by the rui-init and rui-reports/diagram skills to split work into named roles (e.g. scene-builder, file-analyzer, tour-builder).

_Location: `rui-init/agents/artifact-consistency-checker.md:1`_

### Eval  \n`manifest`

JSON file under <skill>/evals/evals.json that records the skill's prompt coverage and test prompts. Every skill in the catalog ships one.

_Location: `rui-init/evals/evals.json:1`_

### Reference  \n`directory`

A documentation sub-folder under <skill>/references/ that holds Markdown deep-dives, indexes, and source citations. The largest reference set is in rui-code/vue (200+ files).

_Location: `rui-code/vue/references/index.md:1`_

### Template  \n`directory`

A 4-file page shell (data.js + index.html + index.css + index.js) under <skill>/templates/. The rui-reports group ships templates for every report style (quickstart, daily, diagram, files, test).

_Location: `rui-reports/quickstart/templates/data.js:1`_

## 3. Directory map

```
skills/
├── rui-code/                  ← 9 sub-skills (frameworks + runtimes)
│   ├── chrome/   css/   fastapi/   h5/   nginx/
│   ├── nodejs/   tauri/   vite/   vue/
│   └── (each skill: SKILL.md, evals/, references/)
├── rui-init/                  ← init pipeline (5 steps + 2 agents + 2 rules)
│   ├── SKILL.md
│   ├── agents/    evals/    references/    rules/    templates/
│   └── steps/
│       ├── 01-detect/   02-explore/   03-generate/
│       └── 04-arch/     05-verify/
├── rui-reports/               ← 5 report styles + 1 engine
│   ├── quickstart/   daily/   diagram/   files/   test/
│   └── diagram/
│       ├── engine/core/src/    ← JS engine (graph, search, schema)
│       ├── languages/          ← tree-sitter configs (16 langs)
│       ├── frameworks/         ← framework-specific briefs
│       ├── scripts/   templates/   references/
│       └── package.json        ← only npm manifest in the catalog
├── rui-test/                  ← 12 topics under topics/
│   ├── SKILL.md
│   ├── topics/
│   │   ├── async-component/   async-flush/   blackbox/
│   │   ├── composable-wrapper/  e2e-playwright/   fixture/
│   │   ├── no-snapshot/   pinia-setup/   runner-choice/
│   │   ├── suspense/   teleport/   vitest-setup/
│   └── evals/   references/
└── rui-tools/                 ← 10 capability skills
    ├── cc/   git/   github/   import/   lighthouse/
    ├── mermaid/   public-api/   skill/   tmux/   ui-ux/
    └── (most include commands/, agents/, references/, evals/)
```

- **`rui-init/SKILL.md`** — End-to-end pipeline orchestrator — start here for /rui-init
- **`rui-init/steps/`** — Five ordered steps; each ships a STEP.md, agents/, templates/, rules/
- **`rui-reports/diagram/package.json`** — The only npm manifest in the catalog (vitest 3, graphology, zod, web-tree-sitter)
- **`rui-reports/diagram/engine/core/src/`** — JS engine: graph-builder, layer-detector, search, schema, plugins
- **`rui-reports/quickstart/templates/`** — The 4-file template this report was built from
- **`rui-test/topics/`** — 12 knowledge topics, each its own sub-skill with README.md
- **`rui-tools/skill/SKILL.md`** — Meta-skill for creating, editing, and benchmarking other skills
- **`rui-tools/import/`** — Token-bearing remote request helper used by rui-init for remote fetches

## 4. Onboarding flow

1. **Read /.claude/README.md end to end.** — You know the 5 skill groups, the 26 manifests, the docs center entry, and the runbook-style command flow.
2. **Read /.claude/CLAUDE.md to learn the project profile, iron laws, and hard constraints.** — You understand the security surface (dataStorage, authentication, thirdParty all true) and the 6 project constraints.
3. **Open the docs dashboard in a browser to see the live rendering.** — You can see dependency graph, story trees, and source groups rendered by the rui-init pipeline.
   ```
   open /.claude/docs/index.html
   ```
4. **Skim rui-init/SKILL.md to learn the detect → explore → generate → arch → verify pipeline.** — You know which step owns CLAUDE.md, README.md, docs/, and the verify gate.
5. **Pick one sub-skill (e.g. rui-tools/skill) and read its SKILL.md frontmatter.** — You understand the trigger surface and arguments schema — every skill in the catalog uses the same shape.
6. **Re-run the init pipeline to refresh the docs home after any change.** — CLAUDE.md, README.md, docs/index.html and docs/data.js are rebuilt; the 5 arch scenes and 6 test scenes are emitted and verified.
   ```
   cd /.claude && /rui-init
   ```
7. **Run the only test suite in the catalog to confirm the diagram engine is green.** — Baseline: vitest run on engine/core/src passes.
   ```
   cd /.claude/skills/rui-reports/diagram && pnpm test
   ```

## 5. Command cheatsheet

| Command | Description | Source |
| --- | --- | --- |
| `list-skill-groups` | List the 5 top-level skill groups (rui-code, rui-init, rui-reports, rui-test, rui-tools). | README.md |
| `list-manifests` | Enumerate all 26 SKILL.md manifests in the catalog. | README.md |
| `open-docs` | Open the regenerated docs home (Vue 3 + shared loader). | README.md |
| `rebuild-docs` | Re-run the full detect → explore → generate → arch → verify pipeline. | CLAUDE.md |
| `test-engine` | Run the only test suite in the catalog — vitest on the diagram engine core. | package.json |
| `run-single-test` | Run a single vitest file from the diagram engine core. | package.json |
| `grep-skill-name` | Locate a skill by its frontmatter name across the catalog. | docs |
| `inspect-triggers` | Read a skill's trigger surface (the description: block). | docs |

## 6. FAQ

**Q: How many skill groups and SKILL.md manifests are in the catalog?**

5 skill groups (rui-code, rui-init, rui-reports, rui-test, rui-tools) and 26 SKILL.md manifests, as recorded in /.claude/CLAUDE.md and the README counts table.

_Source: README.md_

**Q: Is there a top-level package.json?**

No. The only npm manifest in the catalog is /.claude/skills/rui-reports/diagram/package.json. All other skills are pure manifest + Markdown + assets.

_Source: CLAUDE.md_

**Q: How do I add a new skill?**

Read rui-tools/skill/SKILL.md — it is the meta-skill for creating, evaluating, and benchmarking skills. The recommended flow: draft the manifest, then run evals/evals.json prompts, then package.

_Source: rui-tools/skill/SKILL.md_

**Q: What does /rui-init do, and is it safe to re-run?**

/rui-init performs a full rebuild: it regenerates CLAUDE.md, README.md, the docs home (index.html, index.css, index.js, data.js), the 5 docs/arch/ scenes, the 6 docs/test/ scenes, and the docs/.pipeline-state/ verify result. Treat the generated outputs as disposable.

_Source: rui-init/SKILL.md_

**Q: Where does the docs home get its data?**

The rui-init pipeline writes docs/.pipeline-state/{profile,exploration,verify-result}.json during steps 01-detect → 02-explore → 05-verify. The step 03-generate reads those files and emits CLAUDE.md, README.md, and the four docs/ files.

_Source: CLAUDE.md_

**Q: Why does CLAUDE.md flag authentication and thirdParty as true?**

rui-tools/import sends token-bearing remote requests via X-Token headers, and the shared loader plus import/report scripts depend on browser and third-party packages. The security surface is documented in the project profile section of CLAUDE.md.

_Source: CLAUDE.md_

**Q: What is the test framework and what does it cover?**

Vitest 3.1, scoped to rui-reports/diagram/engine/core/src. The test commands are pnpm test (full suite) and pnpm exec vitest run <file>.test.js (single file).

_Source: package.json_

**Q: Can I move a SKILL.md out of its skill group?**

No. CLAUDE.md constraint #1 says top-level skill groups live only under skills/. Moving them breaks the catalog structure and fails the rui-init verify step.

_Source: CLAUDE.md_

## 7. Further reading

- [/.claude/README.md](../README.md) — Counts table, quick start, system view, and domain language for the catalog. _(doc)_
- [/.claude/CLAUDE.md](../CLAUDE.md) — Project profile, iron laws, hard constraints, and self-constraints for any edit. _(doc)_
- [rui-init/SKILL.md](../../skills/rui-init/SKILL.md) — Pipeline orchestrator — the canonical entry point for /rui-init. _(skill)_
- [rui-init/steps/](../../skills/rui-init/steps/) — Five ordered steps; each ships STEP.md, agents/, templates/, rules/. _(directory)_
- [rui-reports/diagram/package.json](../../skills/rui-reports/diagram/package.json) — The only npm manifest in the catalog — vitest, graphology, zod, web-tree-sitter. _(config)_
- [rui-reports/quickstart/SKILL.md](../../skills/rui-reports/quickstart/SKILL.md) — The 4-file template and the create command used to build this report. _(skill)_
- [rui-tools/skill/SKILL.md](../../skills/rui-tools/skill/SKILL.md) — Meta-skill for creating, editing, and benchmarking other skills. _(skill)_
- [docs/arch/](../arch/) — Five arch scenes emitted by rui-init/04-arch — module location, skill flow, onboarding. _(directory)_
- [docs/test/](../test/) — Six test scenes emitted by rui-init/04-arch — self-check, regressions, third-party. _(directory)_
- [docs/.pipeline-state/](../.pipeline-state/) — profile.json, exploration.json, verify-result.json — the state for every pipeline run. _(directory)_

---

_Generated by /rui-report-quickstart — read-only, static-analysis only._
