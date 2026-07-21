# Topic Index

Auto-generated from the on-disk `topics/` tree. Each topic folder
contains a `references/best-practices/<file>.md` (or
`references/fixture-workflow.md` for the fixture topic). The
fixture topic also ships `agents/`, `rules/`, and `templates/`.

| # | Topic | Files |
|---|-------|------:|
| ① | [vitest-setup — Vitest as the canonical runner, vite.config.js test block, environment, scripts, globals, testing-library, fake timers](./vitest-setup/references/best-practices/testing-vitest-recommended-for-vue.md) | 1 |
| ② | [runner-choice — node (happy-dom / jsdom) vs Vitest Browser Mode, speed vs browser fidelity](./runner-choice/references/best-practices/testing-browser-vs-node-runners.md) | 1 |
| ③ | [e2e-playwright — Playwright init, Vue dev server webServer, multi-browser projects, locator strategy, CI parallel, trace viewer](./e2e-playwright/references/best-practices/testing-e2e-playwright-recommended.md) | 1 |
| ④ | [fixture — self-contained file:// test pages, 5 assertion types, browser-compat contracts, scaffold→assert→diff workflow, agents, rules, templates](./fixture/references/fixture-workflow.md) | 6 |
| ⑤ | [async-flush — when to use await trigger / nextTick / flushPromises, avoiding chained nextTick, MSW patterns](./async-flush/references/best-practices/testing-async-await-flushpromises.md) | 1 |
| ⑥ | [async-component — defineAsyncComponent testing, loading state, error state, loader stubbing](./async-component/references/best-practices/async-component-testing.md) | 1 |
| ⑦ | [suspense — wrap async-setup components in Suspense, flushPromises for resolution, fallback / error slots](./suspense/references/best-practices/testing-suspense-async-components.md) | 1 |
| ⑧ | [composable-wrapper — direct testing for simple composables, withSetup helper for lifecycle / inject, app.provide, cleanup](./composable-wrapper/references/best-practices/testing-composables-helper-wrapper.md) | 1 |
| ⑨ | [pinia-setup — createTestingPinia for component tests, setActivePinia for store unit tests, createSpy / stubActions](./pinia-setup/references/best-practices/testing-pinia-store-setup.md) | 1 |
| ⑩ | [teleport — stub Teleport, query document.body, getComponent, attachTo, query-strategy checklist](./teleport/references/best-practices/teleport-testing-complexity.md) | 1 |
| ⑪ | [blackbox — test public API (props / events / slots), query by role / text / testid, avoid wrapper.vm internals](./blackbox/references/best-practices/testing-component-blackbox-approach.md) | 1 |
| ⑫ | [no-snapshot — pair snapshots with behavior, keep small, review diffs, never blindly -u](./no-snapshot/references/best-practices/testing-no-snapshot-only.md) | 1 |
| **Total** | | **17** |
