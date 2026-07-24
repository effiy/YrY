---
name: yry-tools
description: >
  Operational tools dispatcher. Routes a tooling request to one
  of ten leaf skills: cc, git, github, import, lighthouse, mermaid,
  public-api, skill, tmux, ui-ux. Use when the user needs to
  operate on git/github, run lighthouse audits, render mermaid
  diagrams, probe public APIs, configure Claude Code itself, manage
  terminal sessions, import external resources, or apply UI/UX
  conventions. Triggers: "create PR", "merge conflict", "lighthouse
  audit", "mermaid diagram", "public API probe", "tmux session",
  "settings.json", "UI review", "import CSV". Do NOT trigger for:
  framework-specific code patterns (see yry-code), test strategy
  (see yry-test), or report generation (see yry-reports).
lifecycle: default-pipeline
user_invocable: true
---

# yry-tools

> One skill, ten leaves. Each leaf owns one operational tool. This
> file dispatches. Manual entry: `/yry-tools <leaf>`.

## Quick Start

```
/yry-tools git        → version control operations
/yry-tools github     → PR / Issue / Actions
/yry-tools cc         → Claude Code configuration
/yry-tools skill      → skill meta-tool
/yry-tools import     → import external resources
/yry-tools lighthouse → performance audit
/yry-tools mermaid    → diagram generation
/yry-tools public-api → public API probe
/yry-tools tmux       → terminal session
/yry-tools ui-ux      → interaction / visual conventions
```

## Dispatcher rules

1. Match the first arg against the ten leaves. Unknown leaf → ask.
2. If no arg but the prompt contains a tool keyword, route.
3. `git` and `github` frequently co-fire (commit + push + PR);
   route to `github` as the orchestrator and let it shell to `git`.
4. `lighthouse` output flows to `yry-reports/daily` `health.lighthouse`.
5. `mermaid` output flows to `yry-reports/diagram`.

## Leaf inventory

| Leaf | Purpose | Downstream |
|------|---------|------------|
| `git` | vcs ops | yry-reports/daily |
| `github` | PR/Issue/Actions | yry-reports/daily |
| `cc` | Claude Code config | — |
| `skill` | skill meta-tool | self |
| `import` | external resource import | — |
| `lighthouse` | perf audit | yry-reports/daily |
| `mermaid` | diagram | yry-reports/diagram |
| `public-api` | API probe | yry-reports/apis |
| `tmux` | terminal session | — |
| `ui-ux` | interaction / visual | yry-reports/files |

## Borders

| Boundary | Permission |
|----------|-----------|
| Each leaf `SKILL.md` | read |
| Each leaf `references/**` | read |
| Skill directory | read + write |
| Network (github API, lighthouse, public-api) | via Bash + gh/curl |
| Outside the skill directory | no automatic writes |

## Fallback

| Situation | Behavior |
|-----------|----------|
| Unknown leaf name | ask the user to pick from the ten |
| Network tool unavailable (`gh` / `curl` / `lighthouse`) | refuse with one-line error; exit 2 |
| `git` not on PATH | refuse; exit 2 |
| Prompt spans two leaves | route to primary; mention secondary |
