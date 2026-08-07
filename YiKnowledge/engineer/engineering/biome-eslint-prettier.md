---
title: Biome / ESLint / Prettier comparison
aliases:
- biome-eslint-prettier
- lint-format-comparison
tags:
- tools
- lint
- formatting
- JavaScript
- Rust
category: engineer/engineering
created: 2026-07-31
updated: 2026-08-07
source: internal
type: summary
status: stable
lifecycle: active
review_cycle: yearly
last_verified: 2026-08-07
roles:
- engineer
benefit: tooling trustworthy
acceptance_criteria:
  - "core ideas are clearly stated and distinguishable from source material"
  - "actionable recommendations are given, not just information"
  - "anti-patterns or when-not-to-use are identified"
related:
- ./claude-code-tips.md
- ./vllm-ollama-deployment.md
tacit: false
---

# Biome / ESLint / Prettier comparison

> **As an** engineer, **I want to** biome eslint prettier, **so that** tooling trustworthy. 

> Code style and quality tools for JavaScript / TypeScript projects; the core is two things: lint + format. 

## Summary

- Lint finds code issues (unused vars / no-eval / React hooks rules) , format unifies code style (indentation / quotes / line breaks) . 
- ESLint + Prettier is the historical golden combo (broad ecosystem, complete Vue/Svelte, slow) ; Biome (formerly Rome) is a single all-in-one tool (Rust implementation, 10x+ faster) . 
- Biome advantages: extremely fast, single all-in-one tool, simple config, monorepo friendly; disadvantages: rules less rich than ESLint, weaker Vue/Svelte support, missing advanced React rules. 
- Selection decision tree: heavy Vue/Svelte → ESLint+Prettier; large monorepo caring about speed → Biome; medium size → either works; team already familiar with ESLint → don't switch. 
- This team's landing: YiAi / YiVad use ESLint+Prettier (legacy) , YiPet uses Biome (migration complete) , new projects default to Biome. 

## Core viewpoints

- **The speed difference is not just about developer patience — it compounds into CI cost and merge delay** — A 5-minute lint run on CI for a 1M-line project means every PR waits 5 minutes before it can merge. Biome's 30-second run saves 4.5 minutes per PR. Across 20 PRs per day, that's 1.5 hours of developer wait time saved daily. The savings compound: faster CI means more frequent merges, smaller merge conflicts, and a faster feedback loop.

- **The real migration cost is not tool config — it's rule semantics divergence** — ESLint rules and Biome rules have different names, different defaults, and subtly different behavior. The `biome migrate eslint` command handles syntax but not semantics. A rule that was a warning in ESLint may become an error in Biome, or vice versa. The migration must include a manual rule-by-rule review, not just a one-click conversion.

- **Lint/formatter choice is a team culture decision, not just a technical one** — Switching from ESLint+Prettier to Biome means every developer must learn a new tool, new CLI flags, and new IDE integration. If the team already has muscle memory for ESLint, the cognitive switching cost can exceed the performance benefit. Only switch if the team is bought in, not because a benchmark says it's faster.

- **The ESLint plugin ecosystem is the real moat, not the core tool** — Plugins for React hooks (`eslint-plugin-react-hooks`), import ordering, and TypeScript strict rules have no Biome equivalents. A project that relies on these plugins simply cannot migrate to Biome without losing lint coverage. The decision tree must account for plugin dependency, not just core tool speed.

- **Pre-commit hooks are the single highest-leverage DX investment** — A 0.5-second `biome check --write` before commit prevents hundreds of CI failures per month. The cost is one line in `lint-staged` config; the return is that no PR ever fails on formatting. This is the rare case where a 1-minute setup yields months of ongoing benefit.


- Lint and format are two different things — lint finds code issues (unused / hooks rules) , format unifies style (indentation / quotes) , they must not be mixed. 
- Biome's speed advantage amplifies in large projects — 10k lines 5s vs 0.5s, 1M lines 5min vs 30s, a 10x+ magnitude. 
- Vue / Svelte support is ESLint+Prettier's moat — Biome may miss SFC `<script>` lint, and advanced React hooks rules are incomplete. 
- Not configuring pre-commit is the root cause of many CI failures — `lint-staged` + `husky` auto-fix before commit; otherwise warnings accumulate. 
- Fixing rules but not code is historical baggage — one-time fix + pre-commit prevention; otherwise warnings pile up. 

## Key information

### Tool comparison

| Dimension | ESLint + Prettier | Biome |
|---|---|---|
| Implementation language | JS / Rust (partial)  | Rust |
| Speed | Slow (tens of seconds on large projects)  | Extremely fast (10x+)  |
| Lint capability | Strong, rich rules | Weaker, but sufficient |
| Format capability | Prettier is the industry standard | Self-developed, high compatibility |
| Config | Complex (two sets)  | Single file |
| Ecosystem | Very broad | Growing |
| IDE integration | Mature | Mature |
| Vue / Svelte support | Complete | Partial |
| Monorepo compatibility | Needs config | Native support |

### Typical ESLint + Prettier config

```json
// .eslintrc.json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react/recommended", "prettier"],
  "rules": { ... }
}

// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

Workflow: `eslint --fix` fixes lint, `prettier --write` fixes format, `lint-staged` + `husky` auto-fixes before commit. 

### Typical Biome config

```json
// biome.json
{
  "linter": {
    "enabled": true,
    "rules": {"recommended": true}
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "organizeImports": {"enabled": true}
}
```

Workflow: `biome check --write` one-shot fix lint + format + imports, `biome ci` CI mode, paired with husky to run before commit. 

### Selection decision tree

```
Does the project use a lot of Vue / Svelte?
├─ Yes → ESLint + Prettier (complete ecosystem support) 
└─ No  → Does the team care about lint speed?
        ├─ Large project / monorepo → Biome (large speed advantage) 
        ├─ Medium project → Either works; Biome is simpler
        └─ Team already familiar with ESLint → ESLint + Prettier (don't switch) 
```

### Performance reference

| Project size | ESLint + Prettier | Biome |
|---|---|---|
| 10k lines | 5s | 0.5s |
| 100k lines | 30s | 3s |
| 1M lines | 5min | 30s |

> Values depend on hardware and config; Biome's advantage is obvious on large projects. 

### Pre-commit / CI integration

```json
// package.json — Pre-commit (lint-staged + husky) 
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["biome check --write"]
}
```

```yaml
# CI
- name: Lint
  run: pnpm biome ci
```

### Migration path (ESLint → Biome) 

1. `biome init` generates config
2. Use `biome migrate eslint` to convert rules
3. Manually adjust incompatible rules
4. Merge after PR review
5. Keep ESLint for a few weeks as a compatibility period, then delete

### Applicable scenarios

- Code style and quality tools for JS / TS projects
- Large monorepos caring about lint speed (Biome) 
- Vue / Svelte projects (ESLint + Prettier) 
- Default selection for new projects (Biome) 

## Action recommendations

1. Pick the tool per the selection decision tree (Vue/Svelte → ESLint+Prettier; monorepo → Biome) 
2. Configure pre-commit: `lint-staged` + `husky` auto-fix before commit
3. Start with `recommended` rules; don't enable all (too strict, annoys the team) 
4. One-time fix of historical warnings + pre-commit prevention
5. Don't run ESLint + Biome in parallel (duplicate tools) 
6. Run `tsc --noEmit` for type checking (in parallel with lint) 
7. Default new projects to Biome (speed + simple config) 

## Anti-patterns

- **Migrating without a rule-by-rule audit** — `biome migrate eslint` handles syntax conversion but not semantic differences. Rules that were warnings may become errors, or rules that were critical may be silently dropped. A manual audit is required to prevent lint coverage regression.

- **Running ESLint and Biome in parallel during migration** — Two tools fighting over the same files creates conflicting fixes, confusing error messages, and doubled CI time. Pick one tool and commit to it; a compatibility period with both tools is false safety.

- **Switching tools without team buy-in** — If the team has muscle memory for ESLint, the cognitive switching cost can exceed the performance benefit. A 10x speed improvement means nothing if developers spend 10x longer debugging unfamiliar rule violations.

- **Ignoring the plugin ecosystem gap** — Projects that rely on `eslint-plugin-react-hooks`, import ordering plugins, or TypeScript strict plugins simply cannot migrate to Biome without losing coverage. The decision must account for plugin dependency, not just core tool speed.

- **Not running `tsc --noEmit` alongside lint** — Biome replaces ESLint+Prettier but does not replace TypeScript type checking. A project that drops `tsc --noEmit` after switching to Biome will silently ship type errors. Always keep type checking as a separate step.

## Related

- Same class: [Claude Code tips](./claude-code-tips.md)
- Upstream: TypeScript (`tsc --noEmit` type checking) 
- Downstream: YiAi / YiVad (ESLint+Prettier) , YiPet (Biome migrated) 
- References: ESLint https://eslint.org, Prettier https://prettier.io, Biome https://biomejs.dev
