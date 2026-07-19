window.REPORT_DATA = {
  "meta": {
    "pageTitle": "daily · four-mode developer assistant",
    "subtitle": "ask grounded answers · call daily.dev API · generate offline CTO report · build 30d/90d/long-term plan",
    "upstream": "rui-reports/daily",
    "footer": "rui-reports/daily — ask / api / report / plan · daily.dev article search + REST proxy + offline git-only CTO daily + three-horizon planning checklist · rebuilt 2026-07-19"
  },
  "metrics": [
    {
      "label": "Mode",
      "value": "4",
      "sub": "ask · api · report · plan",
      "tone": "cyan"
    },
    {
      "label": "Network",
      "value": "hybrid",
      "sub": "ask/api online · report/plan offline",
      "tone": "green"
    },
    {
      "label": "Auth",
      "value": "$DAILY_DEV_TOKEN",
      "sub": "dda_ prefix · keychain",
      "tone": "amber"
    },
    {
      "label": "Templates",
      "value": "4 files",
      "sub": "data.js + index.html + index.css + index.js",
      "tone": "violet"
    },
    {
      "label": "Horizons",
      "value": "3 tiers",
      "sub": "30d sprint · 90d quarter · long-term bet",
      "tone": "rose"
    }
  ],
  "summaryCards": [
    {
      "tone": "cyan",
      "title": "What it actually does",
      "items": [
        "Picks one of four modes from the first argument: `ask` / `api` / `report` / `plan`.",
        "`ask` grounds a developer question in real daily.dev articles (keyword + semantic + dedupe + upvote/comment weighting).",
        "`api` proxies daily.dev REST calls (feeds, posts, tags, sources, bookmarks, custom feeds, search) with bearer-token auth.",
        "`report` reads a local git repo offline and emits a 4-file CTO daily HTML page under `~/.claude/reports/<project>/<date>/`.",
        "`plan` builds a 30d/90d/long-term planning checklist (milestones, WBS, risks, capacity, assumptions, decisions) for a local project."
      ]
    },
    {
      "tone": "violet",
      "title": "Grounded evidence",
      "items": [
        "SKILL.md declares `default-pipeline` lifecycle + `user_invocable: true`; first arg is the mode selector.",
        "`templates/` ships 4 files: `index.html` (page shell), `index.js` (Vue 3 + `planToMarkdown` exporter), `index.css` (9-layer styles), `data.js` (PLAN_DATA schema).",
        "`templates/report/` ships a second 4-file layout dedicated to `report` mode, mirroring the deps catalog.",
        "23 references cover `ask-workflow`, `api-reference`, `security`, `token-storage`, `project-report-workflow`, `plan-workflow`, examples, validation, scenarios, metrics, capacity, assumptions, diff, review, decisions, render.",
        "Rule #11 enforces the 4-file output layout for `report`; rules #13–23 enforce schema + horizon + roll-up + draft-label invariants for `plan`."
      ]
    },
    {
      "tone": "green",
      "title": "How to invoke",
      "items": [
        "`/daily ask <question>` — search daily.dev articles and return cited answer.",
        "`/daily api <operation>` — call api.daily.dev with bearer token (60 req/min shared).",
        "`/daily report --project <path>` — emit 4-file CTO daily HTML (offline, git-only).",
        "`/daily plan --project <path> [--format md] [--tiers 30d,90d] [--horizon 30d]` — emit 4-file planning HTML or markdown via `window.planToMarkdown()`.",
        "Output paths default to `~/.claude/reports/<project>/<date>/` and `~/.claude/plans/<project>/<date>-plan.{html,md}`."
      ]
    }
  ],
  "anchors": [
    {
      "match": "rui-reports/daily/SKILL.md",
      "mode": "exact",
      "reason": "manifest + mode-selection table"
    },
    {
      "match": "rui-reports/daily/templates/",
      "mode": "prefix",
      "reason": "plan mode 4-file template (PLAN_DATA + Vue 3 app + planToMarkdown)"
    },
    {
      "match": "rui-reports/daily/templates/report/",
      "mode": "prefix",
      "reason": "report mode 4-file template (REPORT_DATA + 4 sections)"
    },
    {
      "match": "rui-reports/daily/references/api-reference.md",
      "mode": "exact",
      "reason": "daily.dev REST endpoint catalog (ask + api modes)"
    },
    {
      "match": "rui-reports/daily/references/plan-workflow.md",
      "mode": "exact",
      "reason": "30d / 90d / long-term planning workflow"
    }
  ],
  "links": [
    { "label": "daily report (2026-07-18)", "href": "../daily/2026-07-18/index.html" },
    { "label": "daily report (2026-07-17)", "href": "../daily/2026-07-17/index.html" }
  ],
  "notes": [
    "Mode selection is explicit, not guessed — when the prompt is a question with no verb, default to `ask`; when it mentions an endpoint or imperative, default to `api`; mention of `--project` or status cues routes to `report`; `plan` / `roadmap` / `WBS` / `DoD` keywords route to `plan`.",
    "`ask` and `api` modes require `DAILY_DEV_TOKEN` (dda_ prefix); token is resolved from keychain, never embedded in commands, never logged.",
    "`report` and `plan` modes are entirely offline + git-only — no network calls, never run the project under report.",
    "`plan` mode proposes, never commits — milestone dates use T+Nd relative offsets; the plan is labelled `DRAFT — <YYYY-MM-DD>` until the user confirms.",
    "Three-horizon model: 30d (S/M/L work items with file guesses) → 90d (XL epics with themes) → long-term (bets with kill criteria). 30d milestones roll up into 90d themes, which roll up into long-term bets. No orphan work.",
    "Composite capacity is computed as `committers × workingDays × focus` minus work + meetings + oncall + 15% buffer; verdict green/amber/red; red refuses to write unless `--allow-overcommit`.",
    "Cross-mode `Sources:` block: every claim in `ask` mode cites the source article URL; `report` and `plan` cite nothing because they are offline + git-only."
  ],
  "diagram": {
    "mode": "catalog",
    "package": {
      "title": "daily",
      "desc": [
        "ask / api / report / plan",
        "four-mode developer assistant"
      ],
      "stats": [
        "4 templates · 23 references · 4 evals",
        "ask + api online · report + plan offline"
      ]
    },
    "dashboard": {
      "title": "Docs Home",
      "sub": "card source",
      "hint": "catalog card"
    },
    "anchor": {
      "title": "Anchors",
      "lines": [
        "SKILL.md · mode selection",
        "templates/ · 4-file plan layout",
        "templates/report/ · 4-file report layout",
        "api-reference.md · REST catalog",
        "plan-workflow.md · 3 horizons"
      ],
      "hint": "5 grounded hints"
    },
    "context": {
      "title": "Main Source Code",
      "sub": "skills/rui-reports"
    },
    "evidence": {
      "title": "Primary evidence",
      "sub": "4 templates + 23 references + 4 evals",
      "hint": "manifest + schema + workflow"
    },
    "report": {
      "title": "Report page",
      "sub": "docs/deps/src-rui-reports-daily/index.html",
      "hint": "rebuilt 2026-07-19"
    }
  }
};
