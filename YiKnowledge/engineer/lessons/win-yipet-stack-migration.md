---
title: YiPet stack migration success case
aliases: [yipet-stack-migration-win, yipet-react-antd-migration, yipet-biome-migration]
tags: [success-case, YiPet, stack, migration, React, Ant-Design, Biome, ESLint]
category: engineer/lessons
created: 2026-08-03
updated: 2026-08-07
last_verified: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: quarterly
tacit: true
roles: [engineer, tech-lead]
benefit: "success is reproducible"
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified
related:
---

# YiPet stack migration success case

> **As an** engineer, **I want to** yipet stack migration, **so that** success is reproducible.

> YiPet 2026-07-28 one-shot stack switch: React 15 + Bootstrap → React 18.3 + Ant Design 5.21; ESLint → Biome 2.5. 3 domains 5 phases, full run 0 P0 bugs, lint speed -91%.

## Summary

- **5 phases**: dependency switch → component library mapping → lint tool switch → TSX structure normalization → dev/build regression
- **key success factors**: stack version alignment (React 18 + TS 5.5 + Biome 2.5 same minor) + component library 1:1 mapping table + lint single-tool + TSX co-location + dev/build dual-track verification
- **quantified effect**: lint speed 12s → 1.1s (-91%); config files 3 → 1; rule conflicts 0; post-launch 0 P0 bugs
- **reusable experience**: migration = full-stack alignment + 1:1 mapping table + single-tool + dual-track verification; cannot split batches for stack switch

## Core viewpoints

- **Stack version alignment is the prerequisite for migration** — React 18 + TS 5.5 + Biome 2.5 must be same minor, otherwise JSX transform / decorator metadata / lint rules will explode.
- **Component library 1:1 mapping table > rewrite** — Bootstrap `Card` / `Modal` / `Button` → Ant Design equivalents; table first, component rewrite avoids rework.
- **lint single-tool (Biome) is a sub-decision of stack migration** — ESLint + Prettier switched to Biome 2.5; config 3 → 1, rule conflicts zeroed.
- **TSX co-location is the best pairing for React + Biome** — `Component.tsx` + `Component.styles.css` + `Component.test.tsx` same directory; Biome import sort + Vitest same-directory discovery.
- **dev/build dual-track verification** — dev mode runs HMR; `--mode production` build runs output regression; chat bundle separate dev script `--mode production` to avoid jsxDEV mismatch ([react-jsxdev-mismatch gotcha](gotcha-react-jsxdev-mismatch.md)).

## Key information

### Background

YiPet original React 15 + Bootstrap + ESLint + Prettier; pain points:

- React 15 hooks missing; Ant Design 5.x requires React 18
- ESLint + Prettier two configs, rule conflicts frequent
- Full lint run 12s
- Stack not aligned with YiVad (Vue 3.5 + Rsbuild 1)

### 5-phase split

| Phase | Content |
|---|---|
| 1 | Dependency switch: React 18.3 + Ant Design 5.21 + Biome 2.5 + TS 5.5 |
| 2 | Component library mapping: Bootstrap → Ant Design 1:1 mapping table |
| 3 | Lint tool switch: ESLint + Prettier → Biome 2.5 |
| 4 | TSX structure normalization: SFC structure + co-location |
| 5 | dev/build regression: HMR + production build dual-track |

### key success factors

1. **Stack version alignment**: React 18 + TS 5.5 + Biome 2.5 same minor; JSX transform / decorator metadata / lint rules do not clash
2. **Component library 1:1 mapping table**: Bootstrap `Card` / `Modal` / `Button` → Ant Design equivalents; table first, component rewrite no rework
3. **lint single-tool**: Biome 2.5 unified lint + format; single config; speed -91%
4. **TSX co-location**: `Component.tsx` + `Component.styles.css` + `Component.test.tsx` same directory
5. **dev/build dual-track**: HMR runs dev experience; `--mode production` runs build regression
6. **chat bundle special handling**: dev script `--mode production` avoids jsxDEV mismatch ([gotcha](gotcha-react-jsxdev-mismatch.md))
7. **Biome + Vitest same-directory discovery**: Biome import sort + Vitest glob same-directory convention, no config needed

### Quantified effect

| Metric | Pre-launch | Post-launch | Change |
|---|---|---|---|
| lint full run duration | 12s | 1.1s | -91% |
| config files count | 3 (eslint + prettier + eslint-config-prettier) | 1 (biome.json) | -2 |
| rule conflict count | frequent | 0 | zeroed |
| pre-commit hook time | 4s | 0.4s | -90% |
| React hooks available | no | yes | — |
| Ant Design 5.x compatible | no | yes | — |
| post-launch P0 bugs | — | 0 | — |

### Reusable experience

- **Migration decision model**: stack version alignment → component library 1:1 mapping → lint single-tool → file structure → dev/build regression; cannot skip order
- **Biome 2.5 replaces ESLint+Prettier**: single-tool + single-config + 10x speed; prerequisite is React 18 + TS 5.5
- **1:1 mapping table drives component library switch**: write mapping table first, then switch components; do not look up while switching
- **dev/build dual-track verification**: HMR runs dev; production build runs regression; both pass then switch complete
- **Special bundles get special handling**: chat bundle due to jsxDEV mismatch uses separate `--mode production`; special cases do not force uniformity

### Follow-up evolution

- Vitest introduction: same rhythm as [ADR Vitest](../../tech-lead/decisions/yivad--vitest-introduction.md) (YiPet version ADR to be added)
- MV3 dual-world boundary enforcement: see [ADR MV3 dual world](../../tech-lead/decisions/yipet--chrome-manifest-dual-world-boundary.md)
- React 19 tracking: quarterly scan React release notes; do not chase minor versions
- Ant Design 5.22+ tracking: run Vitest regression before minor upgrade

## Action recommendations

1. Before stack migration, do a version alignment matrix (React + TS + Biome + component library + builder); only proceed if same minor.
2. Component library switch: first write a 1:1 mapping table (old component → new component + props differences + behavior differences).
3. Switch lint tool to Biome 2.5 in the same PR as component library switch; do not split batches, avoid ESLint config churn.
4. TSX file structure normalization: SFC structure (template + script + style same file) + co-location (test + styles).
5. dev/build dual-track verification: HMR runs dev; production build runs regression; both pass then switch complete.
6. Special bundles (containing jsxDEV etc dev-only dependencies) use separate `--mode production` dev script.
7. Biome import sort + Vitest glob same-directory convention, no extra config.
8. After stack switch, run 1 week stability monitoring, watch P0 bugs and lint speed changes.



- **Stack version not aligned then switch** — JSX transform / decorator metadata / lint rules explode, rollback cost high.
- **Switch while looking up component mapping** — component library API differences cause repeated rework; must have 1:1 mapping table first.
- **ESLint+Prettier and component library split batches** — config churn; switch Biome in same PR as component library.
- **dev passes then launch** — dev mode does not expose jsxDEV mismatch; production build does; must dual-track.
- **chat bundle uses dev default config** — triggers jsxDEV mismatch; separate `--mode production`.
- **TSX not co-located** — `Component.tsx` in components/, `Component.css` in styles/, `Component.test.tsx` in tests/, hard to maintain; must co-locate.

## Anti-patterns

- **Writing the 1:1 component mapping table by reading the Ant Design documentation rather than by reading the actual Bootstrap component usage in the codebase.** The Bootstrap `Card` component in the YiPet codebase may be used with a specific set of props and in a specific nesting pattern that does not match the Ant Design `Card` API. A mapping table written from documentation maps concepts to concepts; a mapping table written from code maps usage patterns to usage patterns. Grep every Bootstrap component name in the codebase, catalog its actual props, and map each usage pattern to its Ant Design equivalent.
- **Replacing ESLint rules with Biome rules one-to-one without running the linter on the full codebase to surface rule conflicts.** Biome's rule set is not a superset of ESLint's. Some ESLint rules have no Biome equivalent, and some Biome rules have no ESLint equivalent. A one-to-one replacement that ignores the delta produces a codebase that was clean under ESLint but has hundreds of Biome warnings on first run. Run Biome on the full codebase before the switch, triage every rule, and add `// biome-ignore` comments only for intentional exceptions.
- **Upgrading React and Ant Design in the same commit as switching to Biome.** If the production build fails after the combined commit, it is impossible to tell whether the failure is caused by the React upgrade, the Ant Design upgrade, or the Biome configuration. Split the migration into atomic commits: (1) React upgrade, (2) Ant Design upgrade, (3) Biome switch. Each commit must pass the production build independently.
- **Running the production build only on the developer's machine and not in CI as part of the migration PR.** A production build that passes on a macOS machine with a warm node_modules cache may fail on a Linux CI runner with a clean install. The migration PR must include a CI step that runs the production build from a clean checkout, catching environment-specific failures before the PR is merged.
- **Declaring the migration complete after the production build passes, without a 1-week stability monitoring period.** The stack migration touches every file in the codebase. Bugs that were not caught by the build or by tests will surface gradually as users exercise edge cases. A 1-week monitoring period with P0 bug tracking, lint speed measurement, and bundle size comparison is the only way to confirm that the migration did not introduce regressions.

## Related

- Same category: [./README.md](./) — wins leaf entry
- Same category: [./yivad-aicr-phase-port.md](win-yivad-aicr-phase-port.md) — YiVad 7-phase port
- Same category: [./yiai-brd-agent-launch.md](win-yiai-brd-agent-launch.md) — YiAi BRD agent launch
- Upstream: [YiPet architecture overview](../projects/yivad/architecture.md) — post-switch stack
- Upstream: [YiPet dev standards](../projects/yivad/dev-standards.md) — §Biome / §TSX / §Vitest
- ADR: [YiPet ADR Biome lint](../../tech-lead/decisions/yipet--biome-lint-format.md)
- gotcha: [react-jsxdev-mismatch](gotcha-react-jsxdev-mismatch.md) — chat bundle special handling basis
- gotcha: [macos-fsevents-silent-drop](gotcha-macos-fsevents-silent-drop.md) — FSEvents fallback during dev
- scenario entry: [../../processes/review-lessons.md](../process/review-lessons.md)
