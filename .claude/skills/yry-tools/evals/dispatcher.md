# yry-tools dispatcher evals

Each case asserts the dispatcher routes to the correct leaf and
that cross-cutting requests are handed off to sibling skills.

| # | Prompt | Expected leaf | Notes |
|---|--------|---------------|-------|
| 1 | "Create a PR for this branch" | `github` (shells to `git`) | co-fire git+github |
| 2 | "Resolve a merge conflict" | `git` | vcs op |
| 3 | "Add bq permission to global settings" | `cc` | Claude Code config |
| 4 | "Render a mermaid sequence diagram" | `mermaid` | diagram gen |
| 5 | "Run lighthouse audit on localhost:3000" | `lighthouse` | perf audit |
| 6 | "Probe the public GitHub REST API" | `public-api` | API probe |
| 7 | "Start a tmux session named build" | `tmux` | terminal session |
| 8 | "Import a CSV into the project" | `import` | external resource |
| 9 | "Review the UI for accessibility" | `ui-ux` | interaction / visual |
| 10 | "Scaffold a new skill" | `skill` | meta-tool |
| 11 | "How does Vue 3 reactivity work?" | hand off → `yry-code/vue` | framework, not tooling |
| 12 | "Generate a daily CTO report" | hand off → `yry-reports/daily` | artifact, not tooling |
| 13 | "yry-tools foobar" | ask user (unknown leaf) | unknown leaf → refuse to guess |
| 14 | `gh` not installed on PATH | refuse with one-line error; exit 2 | network tool unavailable |
| 15 | `git` not on PATH | refuse with one-line error; exit 2 | vcs tool unavailable |

## Pass criteria

- Cases 1–10: routed to the named leaf; leaf `SKILL.md` exists.
- Cases 11–12: dispatcher detects cross-cutting intent and hands
  off to the sibling skill; does not answer inline.
- Case 13: dispatcher refuses to invent a leaf; asks user.
- Cases 14–15: dispatcher surfaces the missing binary; does not
  attempt a fallback that could silently behave differently.

## Failure behavior

Any case failing → revise `SKILL.md` dispatcher rules; re-run.
Failures flow to `yry-reports/feedback/<date>.md`.
