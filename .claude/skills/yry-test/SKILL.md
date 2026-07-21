---
name: yry-test
description: >
  Unified Vue 3 + HTML test knowledge navigator — consolidates 12
  source skills (vitest-setup, runner-choice, e2e-playwright,
  fixture, async-flush, async-component, suspense, composable-
  wrapper, pinia-setup, teleport, blackbox, no-snapshot) into a
  single, topic-routed reference. Use when setting up Vitest for a
  Vue 3 project, choosing between happy-dom/jsdom and Vitest Browser
  Mode, configuring Playwright E2E for a Vue dev server, scaffolding
  a self-contained test fixture with visual regression, debugging
  flaky tests / race conditions / stale DOM assertions, awaiting
  `defineAsyncComponent` / Suspense / async setup, testing a
  composable that uses `onMounted` or `inject`, configuring
  `createTestingPinia` for a Pinia store test, querying teleported
  modal / tooltip / popover content, refactoring brittle tests
  toward black-box behavior, or stopping the snapshot-only
  anti-pattern. Triggers: "vitest setup", "happy-dom vs jsdom",
  "vitest browser mode", "playwright vue", "playwright webServer",
  "test fixture scaffold", "visual regression", "flaky test", "race
  condition", "flushPromises", "await trigger", "stale DOM
  assertion", "defineAsyncComponent test", "async setup won't
  render", "Suspense wrapper", "mountSuspense helper", "test
  composable", "withSetup helper", "inject undefined in test",
  "createTestingPinia", "setActivePinia", "stubActions", "teleport
  test", "wrapper.html empty teleport", "black-box testing", "test
  public API", "data-testid", "snapshot test anti-pattern",
  "Vitest vs Jest", "fake timers", "vi.mock", "MSW flushPromises",
  "playwright trace viewer", "playwright CI parallel".

  Do NOT trigger for: production code architecture (props / emits /
  reactivity / slots / etc — see `yry-html-vue`), CSS / styling
  decisions, build / bundler setup (Vite config, not test config),
  deployment / CI that is not test-related, or general JavaScript
  testing (non-Vue / non-HTML).
lifecycle: default-pipeline
user_invocable: true
---

# yry-test

> One skill, twelve topics. The twelve `yry-html-test-*` source
> skills are now topics inside this skill — each owns a single
> testing responsibility, each ships a `references/best-practices/`
> canonical guide, and the dispatcher in this file routes any Vue 3
> / HTML testing question to the right topic.
>
> Manual entry: `/yry-test`.

[Quick Start](#quick-start) · [Topics](#topics) · [Decision Tree](#decision-tree) · [Layout](#layout) · [Rules](#rules) · [Fallback](#fallback)

## Quick Start

Read `SKILL.md` to route the user's test question to the right topic,
then open the matching `topics/<slug>/references/...` guide. The skill
is specification-only — the implementing agent (Claude) loads the right
topic reference, classifies the test problem, and applies the snippet
to the user's code.

## What this skill does NOT do

- Does NOT cover production code architecture (props / emits / reactivity / slots) — defer to `yry-html-vue`.
- Does NOT cover CSS / styling decisions, build / bundler setup (Vite config that is not test config), or deployment / CI unrelated to tests.
- Does NOT cover general JavaScript testing for non-Vue / non-HTML projects.
- Does NOT run tests, install Vitest, or scaffold a project — recommend the setup, let the user execute.

## Topics

The skill is composed of **twelve topics**, each living in its
own sub-directory under `topics/`. Each topic is a self-contained
canonical guide (the body of the former source skill's SKILL.md)
with its own `references/best-practices/<file>.md` shard. This
file is the single entry point — it reads each topic on demand
and routes the user's question to the right topic.

The topics are ordered to follow the natural reading order of a
Vue 3 test project: **set up the runner → choose a runner →
choose a test layer (E2E / fixture / unit) → write the test
(async / composable / pinia / teleport) → write the assertions
(black-box / no-snapshot)**.

| # | Topic | Directory | Single responsibility | Read this when… |
|---|-------|-----------|------------------------|------------------|
| ① | [vitest-setup](./topics/vitest-setup/references/best-practices/testing-vitest-recommended-for-vue.md) | `topics/vitest-setup/` | Vitest as the canonical runner, vite.config.js `test` block, environment selection, scripts, globals, testing-library integration, fake timers, module mocking | "set up vitest", "vitest config", "happy-dom or jsdom", "@vue/test-utils install", "Vitest vs Jest", "fake timers" |
| ② | [runner-choice](./topics/runner-choice/references/best-practices/testing-browser-vs-node-runners.md) | `topics/runner-choice/` | Vitest (node) with happy-dom/jsdom vs Vitest Browser Mode; tradeoff of speed vs browser fidelity | "happy-dom vs jsdom", "vitest browser mode", "real browser runner", "computed style test", "native dom events test", "cookie test in vitest" |
| ③ | [e2e-playwright](./topics/e2e-playwright/references/best-practices/testing-e2e-playwright-recommended.md) | `topics/e2e-playwright/` | Playwright init, Vue dev server `webServer` config, multi-browser projects, locator strategy, CI parallel, trace viewer / screenshot debugging | "e2e framework", "playwright vs cypress", "vue dev server playwright", "playwright webServer config", "playwright trace viewer", "playwright CI parallel" |
| ④ | [fixture](./topics/fixture/references/fixture-workflow.md) | `topics/fixture/` | Self-contained `file://` test page workflow: scaffold → assert → diff. 5 assertion types (DOM / text / CSS / event / visual). Browser compat (Chrome 90+ / Firefox 90+ / Safari 15+ / Edge 90+) | "test fixture scaffold", "visual regression", "pixel diff", "screenshot baseline", "fixture generator", "visual diff checker", "file:// test page", "browser compat" |
| ⑤ | [async-flush](./topics/async-flush/references/best-practices/testing-async-await-flushpromises.md) | `topics/async-flush/` | When to use `await trigger()` / `await setValue()` / `await nextTick()` / `await flushPromises()`; avoid chained `nextTick`; MSW / API-call flushing | "flaky test", "race condition", "flushPromises", "nextTick", "await trigger", "stale DOM assertion", "MSW flushPromises", "chained nextTick" |
| ⑥ | [async-component](./topics/async-component/references/best-practices/async-component-testing.md) | `topics/async-component/` | `defineAsyncComponent` testing — `await flushPromises()` after mount, loading state before flush, error state via rejected loader promise, `errorComponent` / `loadingComponent` slot testing, stubbing the loader | "defineAsyncComponent test", "async component factory", "loading slot", "error slot", "async loader stub", "rejected loader promise" |
| ⑦ | [suspense](./topics/suspense/references/best-practices/testing-suspense-async-components.md) | `topics/suspense/` | Wrap async-setup components (`<script setup>` with top-level `await` or `async setup()`) in `<Suspense>`; `flushPromises` for resolution; `findComponent` after resolve; fallback / error slots | "async setup won't render", "Suspense wrapper", "async setup component test", "top-level await in script setup", "mountSuspense helper", "Suspense fallback" |
| ⑧ | [composable-wrapper](./topics/composable-wrapper/references/best-practices/testing-composables-helper-wrapper.md) | `topics/composable-wrapper/` | Direct testing for simple composables; host-component wrapper (`withSetup`) for composables using lifecycle hooks or `inject`; `app.provide()`; cleanup via `app.unmount()` | "test composable", "onMounted no active instance", "withSetup helper", "host component wrapper", "inject undefined in test", "composable lifecycle hook" |
| ⑨ | [pinia-setup](./topics/pinia-setup/references/best-practices/testing-pinia-store-setup.md) | `topics/pinia-setup/` | `createTestingPinia` for component tests; `setActivePinia(createPinia())` for store unit tests; `createSpy: vi.fn`; `stubActions: false`; `$patch` / `$state` mocking | "injection Symbol(pinia) not found", "createTestingPinia", "setActivePinia", "pinia store test", "stubActions", "store unit test" |
| ⑩ | [teleport](./topics/teleport/references/best-practices/teleport-testing-complexity.md) | `topics/teleport/` | `wrapper.html()` scopes to component root and misses teleported content; stub Teleport, query `document.body`, or use `getComponent()`; `attachTo: document.body` | "teleport test", "teleported content missing", "wrapper.html empty teleport", "modal teleport test", "tooltip teleport test", "stub teleport" |
| ⑪ | [blackbox](./topics/blackbox/references/best-practices/testing-component-blackbox-approach.md) | `topics/blackbox/` | Test the public API (props / events / slots) not implementation details; query by role / text / testid; simulate user interactions; avoid `wrapper.vm.privateMethod` | "black-box testing", "test public API", "brittle tests", "tests break on refactor", "implementation details", "data-testid", "query by role" |
| ⑫ | [no-snapshot](./topics/no-snapshot/references/best-practices/testing-no-snapshot-only.md) | `topics/no-snapshot/` | Snapshot-only tests verify HTML structure but not functionality; pair with behavioral assertions; keep snapshots small; review diffs; never blindly `-u` | "snapshot test anti-pattern", "snapshot-only test", "tests pass but app broken", "toMatchSnapshot brittleness", "blindly update snapshot" |

Click into any topic to read its full canonical guide.

### Topic → references

| Topic | Canonical guide |
|-------|------------------|
| vitest-setup | `topics/vitest-setup/references/best-practices/testing-vitest-recommended-for-vue.md` |
| runner-choice | `topics/runner-choice/references/best-practices/testing-browser-vs-node-runners.md` |
| e2e-playwright | `topics/e2e-playwright/references/best-practices/testing-e2e-playwright-recommended.md` |
| fixture | `topics/fixture/references/fixture-workflow.md` (+ `agents/`, `rules/`, `templates/`) |
| async-flush | `topics/async-flush/references/best-practices/testing-async-await-flushpromises.md` |
| async-component | `topics/async-component/references/best-practices/async-component-testing.md` |
| suspense | `topics/suspense/references/best-practices/testing-suspense-async-components.md` |
| composable-wrapper | `topics/composable-wrapper/references/best-practices/testing-composables-helper-wrapper.md` |
| pinia-setup | `topics/pinia-setup/references/best-practices/testing-pinia-store-setup.md` |
| teleport | `topics/teleport/references/best-practices/teleport-testing-complexity.md` |
| blackbox | `topics/blackbox/references/best-practices/testing-component-blackbox-approach.md` |
| no-snapshot | `topics/no-snapshot/references/best-practices/testing-no-snapshot-only.md` |

## Decision Tree

Match the user's question to a topic in 30 seconds. The tree
follows the natural test-project reading order: **set up → choose
layer → write the test → write the assertions**.

```
Vue 3 / HTML test question?
│
├─ "How do I set up tests?" / "Vitest vs Jest?" / "happy-dom or jsdom?"
│  → ① vitest-setup
│
├─ "node vs browser runner?" / "Vitest Browser Mode?"
│  → ② runner-choice
│
├─ "E2E framework?" / "Playwright vs Cypress?" / "Playwright config?"
│  → ③ e2e-playwright
│
├─ "Self-contained test fixture?" / "visual regression?" / "pixel diff?"
│  → ④ fixture
│
├─ "Flaky test" / "race condition" / "flushPromises" / "stale DOM" / "MSW"
│  → ⑤ async-flush
│
├─ "defineAsyncComponent test" / "loading slot" / "error slot"
│  → ⑥ async-component
│
├─ "async setup won't render" / "Suspense wrapper" / "top-level await"
│  → ⑦ suspense
│
├─ "onMounted no active instance" / "withSetup helper" / "inject undefined"
│  → ⑧ composable-wrapper
│
├─ "Symbol(pinia) not found" / "createTestingPinia" / "stubActions"
│  → ⑨ pinia-setup
│
├─ "wrapper.html empty teleport" / "modal teleport test" / "stub teleport"
│  → ⑩ teleport
│
├─ "brittle tests" / "tests break on refactor" / "wrapper.vm is brittle"
│  → ⑪ blackbox
│
└─ "snapshot test anti-pattern" / "blindly update snapshot" / "tests pass but app broken"
   → ⑫ no-snapshot
```

When two topics could apply (e.g. "my async test never resolves" — could be
⑤ async-flush or ⑥ async-component), pick the more specific topic first:
async-component / suspense are the wrappers, async-flush is the underlying
mechanism (`flushPromises`).

## Layout

```
yry-test/
├── SKILL.md                                # this file (the only user-invocable entry point)
├── references/
│   ├── index.md                            # human-readable topic table
│   └── index.json                          # machine-readable topic + file index
├── topics/                                 # 12 topic shards (formerly 12 sibling skills)
│   ├── vitest-setup/
│   │   └── references/best-practices/testing-vitest-recommended-for-vue.md
│   ├── runner-choice/
│   │   └── references/best-practices/testing-browser-vs-node-runners.md
│   ├── e2e-playwright/
│   │   └── references/best-practices/testing-e2e-playwright-recommended.md
│   ├── fixture/
│   │   ├── references/fixture-workflow.md
│   │   ├── agents/
│   │   │   ├── test-fixture-generator.md
│   │   │   └── visual-diff-checker.md
│   │   ├── rules/
│   │   │   ├── browser-compat.md
│   │   │   └── test-contracts.md
│   │   └── templates/test-fixture.md
│   ├── async-flush/
│   │   └── references/best-practices/testing-async-await-flushpromises.md
│   ├── async-component/
│   │   └── references/best-practices/async-component-testing.md
│   ├── suspense/
│   │   └── references/best-practices/testing-suspense-async-components.md
│   ├── composable-wrapper/
│   │   └── references/best-practices/testing-composables-helper-wrapper.md
│   ├── pinia-setup/
│   │   └── references/best-practices/testing-pinia-store-setup.md
│   ├── teleport/
│   │   └── references/best-practices/teleport-testing-complexity.md
│   ├── blackbox/
│   │   └── references/best-practices/testing-component-blackbox-approach.md
│   └── no-snapshot/
│       └── references/best-practices/testing-no-snapshot-only.md
└── evals/
    └── evals.json                          # test prompts (created by yry-tools eval step)
```

The twelve `topics/<slug>/` directories are the canonical content
for the formerly-separate sibling skills
(`yry-html-test-{vitest-setup,runner-choice,e2e-playwright,fixture,async-flush,async-component,suspense,composable-wrapper,pinia-setup,teleport,blackbox,no-snapshot}`);
those sibling directories still exist and can still be installed
individually, but this skill supersedes them for daily use.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` (this skill's index files) | read |
| `topics/**` (12 topic shards) | read |
| The user's Vue 3 / HTML test project (any path the user names) | read + write (with user confirmation) |
| Other installed skills | read-only |

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | This skill is the only user-invocable entry point | The 12 topics are skill-internal, not separately invokable from `/command` |
| 2 | Route first, then read | Match the user's question to a topic in the decision tree; don't read every reference doc — load the one that fits |
| 3 | Pick by phase: set up → choose layer → write test → write assertions | Topics are ordered to follow the natural test-project reading order |
| 4 | `await` every `trigger()` / `setValue()` / `flushPromises()` / `nextTick()` | Vue updates asynchronously; missing `await` is the #1 source of flaky tests |
| 5 | Use the right `await`: `trigger` / `setValue` for user events, `nextTick` for programmatic state, `flushPromises` for external async | Each method has a different flush target; chained `nextTick` is an anti-pattern |
| 6 | Wrap async-setup components in `<Suspense>` before mounting | `async setup()` and top-level `await` require a Suspense wrapper; `mountSuspense` is the canonical helper |
| 7 | `defineAsyncComponent` is different from `async setup` | async-component (loader-based) is topic ⑥, async setup (script-level) is topic ⑦ |
| 8 | Stub Teleport, query `document.body`, or use `getComponent()` | `wrapper.find` cannot locate teleported content — pick one of the three query strategies |
| 9 | For Pinia: `createTestingPinia` for component tests, `setActivePinia(createPinia())` for store unit tests | The two patterns are not interchangeable; mixing them causes the `Symbol(pinia) not found` error |
| 10 | Test public API (props / events / slots / rendered output), not `wrapper.vm.<state>` | Black-box tests are refactor-proof; white-box tests break on every refactor |
| 11 | Never use `toMatchSnapshot` as the only assertion | Snapshots prove structure, not behavior; pair with behavioral assertions or drop the snapshot |
| 12 | For cross-browser E2E use Playwright, not Cypress | Playwright is fully open source and supports Chromium / WebKit / Firefox natively |

## Active Markers

| Marker | Verification | Expected behavior |
|--------|--------------|-------------------|
| All 12 topics have a `references/best-practices/<file>.md` (or `references/fixture-workflow.md` for fixture) | `find topics -name '*.md' \| wc -l` → 17 | Consolidation complete |
| The 4 fixture sub-resources are in place | `ls topics/fixture/{agents,rules,templates}/` → 5 files | Fixture deep-assets migrated |
| Topic indexes are in place | `test -f references/index.md && test -f references/index.json` | Human + machine indexes are present |
| This SKILL.md is the only user-invocable entry point | `user_invocable: true` in frontmatter | Single entry point enforced |
| 12 sibling skills still exist | `ls .claude/skills/yry-html-test-* \| wc -l` → 12 | Source skills preserved (not deleted) |

## Fallback

| Situation | Behavior |
|-----------|----------|
| A topic's `references/best-practices/<file>.md` does not answer the question | Follow its "Reference" link at the bottom (Vue Test Utils / Vue.js docs / Playwright docs / Vitest docs / Pinia docs / Kent C. Dodds blog) |
| Two topics could apply (e.g. "async test never resolves" — ⑤ or ⑥) | Pick the more specific topic first; async-component / suspense are the wrappers, async-flush is the mechanism |
| User wants the previous 12-skill split | The 12 source skills still exist under `yry-html-test-*` and can be installed individually. This skill supersedes them for daily use. |
| Stale doc — upstream Vue / Vitest / Playwright changed | Tell the user the snapshot may be stale; suggest re-running the consolidation from the upstream source skills. |
| User asks in a language other than English | Respond in the user's language; keep code / API names in original. |
| Topic decision tree has no match | Ask the user to clarify; do not invent. The 12 topics cover the most common Vue 3 / HTML testing concerns but not every possible one. |
