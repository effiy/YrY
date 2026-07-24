# yry-code dispatcher evals

Each case asserts the dispatcher routes to the correct leaf. A
pass requires: (1) the named leaf exists, (2) no cross-cutting
misroute (e.g. test questions do not stay in yry-code).

| # | Prompt | Expected leaf | Notes |
|---|--------|---------------|-------|
| 1 | "How does Vue 3 reactivity track nested objects?" | `vue` | core reactivity |
| 2 | "Configure Vite to split vendor chunks" | `vite` | build config, not vue |
| 3 | "FastAPI dependency injection with Depends" | `fastapi` | python backend |
| 4 | "Node stream backpressure" | `nodejs` | runtime |
| 5 | "CSS cascade layers @layer" | `css` | style system |
| 6 | "H5 viewport meta for iOS notch" | `h5` | mobile adaptation |
| 7 | "Tauri invoke IPC from frontend" | `tauri` | desktop |
| 8 | "Nginx location block priority" | `nginx` | proxy |
| 9 | "Chrome extension manifest v3 service worker" | `chrome` | browser ext |
| 10 | "How do I test a Vue component?" | hand off → `yry-test` | cross-cutting, must NOT answer in yry-code |
| 11 | "Create a PR for this branch" | hand off → `yry-tools/github` | ops, not framework |
| 12 | "yry-code foobar" | ask user (unknown leaf) | unknown leaf → refuse to guess |

## Pass criteria

- Cases 1–9: routed to the named leaf; leaf `SKILL.md` exists.
- Cases 10–11: dispatcher detects cross-cutting intent and hands
  off to the sibling skill; does not answer inline.
- Case 12: dispatcher refuses to invent a leaf; asks user.

## Failure behavior

Any case failing → the dispatcher `SKILL.md` rules section is
ambiguous; revise the rules and re-run. Failures also flow to
`yry-reports/feedback/<date>.md` for the next `yry-init` cycle.
