---
title: ADR — YiPet Biome 2.5 unified lint + format
aliases: [adr-biome-lint-format, yi-pet-biome-adr, lint-format-adr]
tags: [adr, yi-pet, biome, lint, format, eslint, prettier, architecture-decision]
category: tech-lead/decisions/yipet
created: 2026-08-03
updated: 2026-08-03
source: internal
type: adr
status: stable
lifecycle: active
review_cycle: quarterly
last_verified: 2026-08-03
tacit: false
roles: [tech-lead, engineer]
benefit: "YiPet Biome adoption decision is documented with ESLint migration trade-offs"
acceptance_criteria:
  - "context, decision, and rationale are clearly documented"
  - "options considered with trade-offs are enumerated"
  - "consequences and reversal path are stated
related:
  - ../../../engineer/projects/yipet/architecture.md
  - ../../../engineer/projects/yipet/dev-standards.md
  - ./chrome-manifest-dual-world-boundary.md
  - ../../../product-manager/projects/yipet--project-management.md
  - ../yivad/vitest-introduction.md
  - ../../../engineer/engineering/biome-eslint-prettier.md
  - ../../../engineer/engineering/pi-agent-harness-evolution.md
  - ../../../product-manager/delivery/retrospective.md
  - ../../../knowledge-curator/templates/adr.md
---

# ADR — YiPet Biome 2.5 unified lint + format

> **As a** tech lead, **I want to** biome lint format, **so that** decision documented and reversible.

> Decision: YiPet uses Biome 2.5 to unify lint + format, removing ESLint + Prettier. Locks in [YiPet dev standards §Biome](../../../engineer/projects/yipet/dev-standards.md) + [stack migration memory](../../../engineer/engineering/biome-eslint-prettier.md) + retrospective [stack migration landing](../../../product-manager/delivery/retrospective.md).

## 1. Basic info

| Field | Content |
|---|---|
| ADR number | ADR-Biome-Lint-Format |
| Title | YiPet uses Biome 2.5 to unify lint + format |
| State | Accepted |
| Date | 2026-08-03 |
| Decision maker | YiPet lead owner + architecture group |
| Reviewer | CTO, frontend lead |
| Related project | YiPet |
| Related PR/Issue | already launched (see [YiPet stack migration win](../../../engineer/lessons/win-yipet-stack-migration.md))  |
| Supersedes | — |
| Superseded by | — |
| Re-review trigger | quarterly review / signal: Biome breaking changes / Biome-unsupported ESLint rules regression / ecosystem far surpassed by ESLint |

## 2. background (Context)

- **Current state**: YiPet originally React 15 + Bootstrap + ESLint + Prettier; after 2026-07-28 stack migration (see [YiPet stack migration win](../../../engineer/lessons/win-yipet-stack-migration.md)) switched to React 18.3 + Ant Design 5.21 + Biome 2.5.
- **Pain points**:
  - ESLint + Prettier two sets of config, rule conflicts frequent (`eslint-config-prettier` turns off ESLint format rules, but missed rules repeatedly trigger).
  - ESLint + Prettier full lint is slow: YiPet 19 chat components + 4 popups + content/background/shared full run 12s.
  - ESLint FlatConfig and Legacy transition period, rule sets unstable.
  - Prettier does not support TS 5.5 decorator metadata formatting.
- **Triggering event**: during stack migration evaluated Biome 1.x -> 2.x stable, decided to switch in one shot.
- **External constraints**: Biome 2.5 supports React 18 + TS 5.5 + JSX transform; Ant Design 5.21 SFC has no decorator; MV3 CSP not affected by lint.

## 3. decision (Decision)

YiPet picks Biome 2.5 to unify lint + format, removing ESLint + Prettier + eslint-config-prettier. Config centralized in `biome.json`; CI + pre-commit + IDE three places aligned.

Landing checklist:

| No. | Change | Impact scope | Launch strategy |
|---|---|---|---|
| 1 | `package.json` devDeps: `@biomejs/biome@2.5` + remove `eslint` / `prettier` / `eslint-config-prettier` | YiPet root | one-shot |
| 2 | `biome.json`: lint + format + import sort + JSX transform rules | YiPet root | one-shot |
| 3 | `.vscode/extensions.json` + `settings.json`: Biome extension + format on save | YiPet IDE | one-shot |
| 4 | `package.json` scripts: `lint` / `format` / `lint:check` all point to Biome | YiPet scripts | one-shot |
| 5 | pre-commit `lint-staged` switch to `biome check --apply` | YiPet git hook | one-shot |
| 6 | CI `pnpm biome ci` blocks | GitHub Actions | one-shot |
| 7 | CLAUDE.md "Lint" section adds "run `pnpm lint`" + config file location | documentation | one-shot |

## 4. alternatives (Options Considered)

| Alternative | description | pros | cons | conclusion |
|---|---|---|---|---|
| A. Biome 2.5 unified lint + format | single tool dual responsibility | 10x faster; single config file; stable rule set | ecosystem narrower than ESLint; some rules need self-authoring | selected |
| B. ESLint 9 FlatConfig + Prettier 3 | industry standard | largest ecosystem; most docs | two sets of config; slow; rule conflicts | rejected |
| C. deno_lint | Rust lint | fast | tied to Deno; awkward for non-Deno projects | rejected |
| D. no migration, keep ESLint + Prettier | current state | zero change | slow + persistent conflicts + out of sync with stack migration cadence | rejected |

## 5. evaluation dimensions

| Dimension | A. Biome | B. ESLint+Prettier | C. deno_lint | D. no migration |
|---|---|---|---|---|
| Speed | 5/5 | 2/5 | 5/5 | 2/5 |
| Config simplicity | 5/5 | 2/5 | 3/5 | 3/5 |
| Ecosystem / rule count | 3/5 | 5/5 | 2/5 | 5/5 |
| React 18 + TS 5.5 support | 5/5 | 5/5 | 3/5 | — |
| In sync with stack migration | 5/5 | 2/5 | 2/5 | 1/5 |
| Long-term direction | 4/5 | 3/5 | 2/5 | — |

## 6. risk (Risks)

| risk | probability | impact | mitigation |
|---|---|---|---|
| Biome-unsupported ESLint rules regression need | medium | medium | maintain `eslint-equivalents.md` listing unsupported rules; missing rules explicitly explained in PR description |
| Biome breaking config schema change | low | high | lockfile pin minor; quarterly review + Renovate following minor |
| team ESLint muscle memory migration | high | low | IDE extension one-click install; CLAUDE.md "Lint" section dual-write rule name mapping |
| `lint-staged` hook failure | low | medium | pre-commit runs `biome check --apply --no-errors-on-unmatched` fallback |
| Biome ecosystem far surpassed by ESLint | low | medium | quarterly review of ecosystem; if key rules missing > 3 items, trigger option B evaluation |

## 7. rollback plan (Rollback Plan)

| Trigger | rollback action | owner | estimated recovery time |
|---|---|---|---|
| Biome breaking change blocks upgrade | lock version + evaluate option B (ESLint+Prettier)  | architecture group | 1 workday |
| Biome key rule missing blocks business | add `eslint` locally + Biome main run | YiPet lead owner | 2 h |
| CI `biome ci` blocks release | temporarily turn off gate + run fix PR | YiPet lead owner | 15 min |
| pre-commit `biome check` missed files | add `--staged` explicitly + run `biome check` full | YiPet lead owner | 30 min |

> rollback must be executable within 1 h (except option B evaluation).

## 8. implementation plan

| Phase | Content | Completion date | Owner |
|---|---|---|---|
| Phase 1 | `biome.json` + remove ESLint/Prettier + scripts (#1 #2 #4)  | 2026-07-28 done | YiPet lead owner |
| Phase 2 | IDE integration + pre-commit (#3 #5)  | 2026-07-29 done | YiPet lead owner |
| Phase 3 | CI gate + documentation (#6 #7)  | 2026-07-30 done | YiPet lead owner |
| Phase 4 | eslint-equivalents.md list unsupported rules | 2026-08-10 | YiPet lead owner |
| Phase 5 | quarterly review of Biome ecosystem | 2026-09-01 | architecture group |

## 9. follow-up tracking metrics

| Metric | pre-launch | post-launch | goal |
|---|---|---|---|
| full lint run duration | 12s | 1.1s | <= 2s done |
| config file count | 3 (eslint + prettier + eslint-config-prettier)  | 1 (biome.json)  | 1 done |
| rule conflict count | frequent | 0 | 0 done |
| pre-commit hook duration | 4s | 0.4s | <= 1s done |
| unsupported rule list | — | pending Phase 4 quantification | < 3 items |

## 10. coupling with other ADR / documentation

- **[ADR MV3 dual world](./chrome-manifest-dual-world-boundary.md)**: Biome does not directly guard MV3 boundary, but guards `world: 'MAIN'` / `'ISOLATED'` literal values; TS type branding works with lint.
- **[YiVad Vitest ADR](../yivad/vitest-introduction.md)**: YiVad still uses ESLint + Prettier (not switching to Biome in sync with YiPet); reason see YiVad dev-standards §commitlint + lint.
- **[Biome vs ESLint/Prettier comparison](../../../engineer/engineering/biome-eslint-prettier.md)**: this ADR decision basis.
- **[Pi Agent Harness evolution](../../../engineer/engineering/pi-agent-harness-evolution.md)**: pi also uses Biome (TS project alignment).
- **[YiPet stack migration win](../../../engineer/lessons/win-yipet-stack-migration.md)**: this ADR is a sub-decision of stack migration.

## 11. references

- [YiPet architecture overview](../../../engineer/projects/yipet/architecture.md) — Biome position in the stack
- [YiPet dev standards](../../../engineer/projects/yipet/dev-standards.md) — §Biome / §TSX structure
- [Biome vs ESLint/Prettier comparison](../../../engineer/engineering/biome-eslint-prettier.md)
- [retrospective instance](../../../product-manager/delivery/retrospective.md) — stack migration trigger
- [ADR template](../../../knowledge-curator/templates/adr.md)
