(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — daily · four-mode developer assistant",
    "scope": "daily",
    "scopeShort": "daily",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — daily · ask / api / report / plan",
    "tagline": "Four-mode developer assistant — `ask` grounds a question in daily.dev articles, `api` proxies the daily.dev REST, `report` emits an offline git-only CTO daily, and `plan` builds a 30d/90d/long-term planning checklist.",
    "scope": "daily",
    "audience": "Contributors wiring up the daily card for ask / api / report / plan workflows",
    "generatedAt": "2026-07-19 21:00 (Asia/Shanghai)"
  },
  "score": {
    "composite": 89,
    "grade": "B",
    "summary": "Grounded from the docs-home card and its linked artifacts.",
    "verdicts": {
      "overview": "pass",
      "concepts": "partial",
      "directory-map": "pass",
      "onboarding-flow": "pass",
      "commands": "partial",
      "faq": "partial",
      "further-reading": "pass"
    }
  },
  "sections": [
    {
      "id": "overview",
      "kind": "overview",
      "title": "Overview",
      "coverage": 94,
      "verdict": "pass",
      "summary": "daily is a docs-home card under \"skills/rui-reports — Report Generators\" in the \"Main Source Code\" section. It is a four-mode developer assistant skill: `ask` searches daily.dev articles and returns a cited, dedupe-weighted answer; `api` proxies the daily.dev REST with bearer auth; `report` reads a local git repo offline and emits a 4-file CTO HTML report; `plan` builds a 30d/90d/long-term planning checklist with milestones, WBS, capacity, and DoD. Metadata: Sub-skill · 4 templates + 23 references + 4 evals.",
      "hero": {
        "eyebrow": "skills/rui-reports — daily (4 modes)",
        "title": "Understand the four-mode daily skill in about 6 min",
        "subtitle": "Walk the ask / api / report / plan flow from prompt shape → mode selection → grounded answer / offline page / planning checklist.",
        "totalMinutes": 6,
        "cta": "Start walkthrough",
        "ctaHint": "Cmd + Enter marks this card walkthrough as reviewed.",
        "timeStatLabel": "Time to first context",
        "timeCaption": "minutes to first context",
        "scopeStatLabel": "Grounded refs",
        "scopeStatSuffix": "refs",
        "gapsHint": "Open SKILL.md and the 4 templates before editing this surface.",
        "gaps": [
          {
            "id": "ask-mode",
            "label": "ask mode contract",
            "coverage": 72
          },
          {
            "id": "plan-mode",
            "label": "plan 30d/90d/long schema",
            "coverage": 70
          }
        ],
        "steps": [
          {
            "id": "mode-select",
            "n": 1,
            "name": "Pick mode",
            "minutes": 1,
            "color": "cyan",
            "type": "view",
            "ref": "skills/rui-reports/daily/SKILL.md",
            "outcome": "Read the mode-selection table and confirm the right mode for the user's prompt (question → ask, endpoint → api, --project → report, plan/roadmap → plan)."
          },
          {
            "id": "ask-flow",
            "n": 2,
            "name": "ask",
            "minutes": 2,
            "color": "accent",
            "type": "read",
            "ref": "skills/rui-reports/daily/references/ask-workflow.md",
            "outcome": "Understand the keyword + semantic search, dedupe by id, and upvote/comment weighting so every claim cites a source URL."
          },
          {
            "id": "report-plan",
            "n": 3,
            "name": "report / plan",
            "minutes": 2,
            "color": "pass",
            "type": "read",
            "ref": "skills/rui-reports/daily/templates/{report,}/data.js",
            "outcome": "See the 4-file output layout and the 30d/90d/long-term horizon schema that report and plan modes both rely on."
          }
        ]
      },
      "landscape": {
        "total": 1,
        "groups": [
          {
            "id": "home",
            "name": "docs-home",
            "count": 1,
            "share": 25,
            "top": "card",
            "accent": "cyan",
            "blurb": "The original card entry on docs/index.html."
          },
          {
            "id": "quickstart",
            "name": "quickstart",
            "count": 1,
            "share": 25,
            "top": "src-rui-reports-daily",
            "accent": "accent",
            "blurb": "This per-card newcomer page under docs/quickstart/."
          },
          {
            "id": "local",
            "name": "local",
            "count": 1,
            "share": 25,
            "top": "n/a",
            "accent": "pass",
            "blurb": "Local docs or source artifacts linked from the card."
          },
          {
            "id": "external",
            "name": "external",
            "count": 1,
            "share": 25,
            "top": "none",
            "accent": "todo",
            "blurb": "External references such as package homepages or upstream docs."
          }
        ],
        "trend": [
          1,
          1,
          2,
          2,
          3,
          3
        ]
      },
      "stack": {
        "layers": [
          {
            "tier": 1,
            "role": "Card",
            "items": [
              {
                "name": "daily",
                "sub": "skills/rui-reports — Report Generators",
                "token": "qs-cyan"
              }
            ]
          },
          {
            "tier": 2,
            "role": "Section",
            "items": [
              {
                "name": "Main Source Code",
                "sub": "docs/index.html",
                "token": "qs-accent"
              }
            ]
          },
          {
            "tier": 3,
            "role": "Artifacts",
            "items": []
          },
          {
            "tier": 4,
            "role": "Output",
            "items": [
              {
                "name": "quickstart/src-rui-reports-daily",
                "sub": "card directory",
                "token": "qs-todo"
              }
            ]
          }
        ]
      },
      "coverageTrend": [
        74,
        78,
        82,
        86,
        90,
        92,
        94
      ],
      "byTheNumbers": [
        {
          "value": "4",
          "suffix": "modes",
          "label": "ask · api · report · plan",
          "accent": "accent",
          "blurb": "One skill, four modes — the first argument after `/daily` is the mode selector."
        },
        {
          "value": "30d / 90d / long",
          "suffix": "horizons",
          "label": "plan tiers",
          "accent": "cyan",
          "blurb": "Plan mode rolls S/M/L work items up into XL epics and long-term bets, each with a DoD."
        },
        {
          "value": "0 net",
          "suffix": "call",
          "label": "report/plan offline",
          "accent": "pass",
          "blurb": "`report` and `plan` modes never call the network; only `ask` and `api` reach daily.dev."
        }
      ],
      "whatYoullShip": [
        {
          "tag": "ask",
          "title": "Grounded daily.dev answers",
          "body": "A `Sources:` block at the end of every ask-mode reply, with one URL per cited claim and no fabricated content."
        },
        {
          "tag": "report",
          "title": "Offline CTO daily page",
          "body": "A 4-file HTML report under `~/.claude/reports/<project>/<date>/` — summary, risk, health, people, no network calls."
        },
        {
          "tag": "plan",
          "title": "30d/90d/long-term checklist",
          "body": "A draft planning page with milestones, WBS, risks, capacity, and an explicit `DRAFT — <date>` label until the user confirms."
        }
      ],
      "tiles": [
        {
          "label": "Section",
          "value": "Main Source Code"
        },
        {
          "label": "Group",
          "value": "skills/rui-reports — Report Generators"
        },
        {
          "label": "Card kind",
          "value": "items"
        },
        {
          "label": "Primary scope",
          "value": "daily"
        }
      ],
      "stats": [
        {
          "label": "Grounded refs",
          "value": 1,
          "trend": [
            1,
            1,
            2,
            2,
            3,
            1
          ]
        },
        {
          "label": "Local docs",
          "value": 1,
          "trend": [
            1,
            1,
            1,
            2,
            2,
            1
          ]
        },
        {
          "label": "External refs",
          "value": 0,
          "trend": [
            0,
            0,
            0,
            1,
            1,
            0
          ]
        },
        {
          "label": "Walkthrough steps",
          "value": 3,
          "trend": [
            2,
            2,
            3,
            4,
            4,
            3
          ]
        }
      ]
    },
    {
      "id": "concepts",
      "kind": "concepts",
      "title": "Key concepts",
      "coverage": 88,
      "verdict": "partial",
      "items": [
        {
          "name": "daily",
          "role": "card",
          "description": "Four-mode developer assistant: `ask` (grounded daily.dev answers), `api` (REST proxy), `report` (offline CTO daily), `plan` (30d/90d/long-term checklist with DoD).",
          "file": "skills/rui-reports/daily/SKILL.md",
          "line": 1
        },
        {
          "name": "Mode selection table",
          "role": "entrypoint",
          "description": "Question with no verb → `ask`; imperative + endpoint → `api`; mention of --project / status → `report`; plan/roadmap/WBS/DoD → `plan`.",
          "file": "skills/rui-reports/daily/SKILL.md",
          "line": 116
        },
        {
          "name": "templates/ (4 files)",
          "role": "template",
          "description": "Plan-mode 4-file template: index.html (page shell), index.js (Vue 3 + `planToMarkdown`), index.css (9-layer styles), data.js (PLAN_DATA schema).",
          "file": "skills/rui-reports/daily/templates/data.js",
          "line": 1
        },
        {
          "name": "templates/report/ (4 files)",
          "role": "template",
          "description": "Report-mode 4-file template: REPORT_DATA + summary / risk / health / people sections + Vue 3 app.",
          "file": "skills/rui-reports/daily/templates/report/data.js",
          "line": 1
        },
        {
          "name": "DAILY_DEV_TOKEN",
          "role": "auth",
          "description": "Required for `ask` and `api` modes only; dda_ prefix; resolved from keychain; never embedded in commands; never logged.",
          "file": "skills/rui-reports/daily/references/token-storage.md",
          "line": 1
        }
      ]
    },
    {
      "id": "directory-map",
      "kind": "directory-map",
      "title": "Directory map",
      "coverage": 90,
      "verdict": "pass",
      "depth": 3,
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── src-rui-reports-daily/index.html",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/src-rui-reports-daily/index.html",
          "note": "Per-card quickstart page generated for this card."
        }
      ]
    },
    {
      "id": "onboarding-flow",
      "kind": "onboarding-flow",
      "title": "Onboarding flow",
      "coverage": 92,
      "verdict": "pass",
      "steps": [
        {
          "order": 1,
          "type": "view",
          "minutes": 1,
          "action": "Read the daily SKILL.md mode-selection table and identify the right mode for your prompt.",
          "outcome": "You know whether the user is asking, calling an API, requesting a daily report, or asking for a plan.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/daily/SKILL.md'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Skim the matching mode reference (ask-workflow / api-reference / project-report-workflow / plan-workflow).",
          "outcome": "You can name the inputs, outputs, and validation rules for the chosen mode.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/daily/references/ask-workflow.md'"
        },
        {
          "order": 3,
          "type": "run",
          "minutes": 2,
          "action": "Resolve DAILY_DEV_TOKEN from keychain if you are exercising ask or api mode.",
          "outcome": "Token never appears in a transcript; only `$DAILY_DEV_TOKEN` is referenced in commands.",
          "command": "security find-generic-password -s daily.dev -w"
        }
      ]
    },
    {
      "id": "commands",
      "kind": "commands",
      "title": "Command cheatsheet",
      "coverage": 84,
      "verdict": "partial",
      "items": [
        {
          "name": "ask-mode",
          "command": "/daily ask \"Is React Server Components worth adopting for a new SPA in 2026?\"",
          "description": "Default to ask mode for a question with no verb; returns a sources block with one URL per claim.",
          "source": "skills/rui-reports/daily/SKILL.md"
        },
        {
          "name": "api-mode",
          "command": "/daily api feeds/trending --limit 10",
          "description": "Proxy the daily.dev REST with bearer auth; backs off on 429 with Retry-After.",
          "source": "skills/rui-reports/daily/references/api-reference.md"
        },
        {
          "name": "report-mode",
          "command": "/daily report --project /Users/yi/YrY/.claude",
          "description": "Emit a 4-file CTO HTML report under ~/.claude/reports/<project>/<date>/. Offline + git-only.",
          "source": "skills/rui-reports/daily/references/project-report-workflow.md"
        },
        {
          "name": "plan-mode",
          "command": "/daily plan --project /Users/yi/YrY/.claude --horizon 30d --tiers 30d,90d",
          "description": "Emit a 4-file planning HTML (or markdown via planToMarkdown) for the chosen tiers.",
          "source": "skills/rui-reports/daily/commands/plan.md"
        }
      ]
    },
    {
      "id": "faq",
      "kind": "faq",
      "title": "FAQ",
      "coverage": 90,
      "verdict": "pass",
      "items": [
        {
          "question": "How does daily decide between `ask`, `api`, `report`, and `plan`?",
          "answer": "The first arg after `/daily` is the mode selector. The SKILL.md mode-selection table defaults to `ask` for a question with no verb, `api` for an imperative mentioning an endpoint, `report` for `--project` or a status cue, and `plan` for `plan`/`roadmap`/`WBS`/`DoD` keywords. When two modes could apply, the more specific mode wins; when genuinely ambiguous, ask.",
          "source": "skills/rui-reports/daily/SKILL.md"
        },
        {
          "question": "Why does ask-mode always need a `Sources:` block?",
          "answer": "Because ask mode searches the daily.dev article graph and the whole point is a grounded, source-linked answer. The skill dedupes by id, weighs by numUpvotes / numComments, and writes a sources block with one URL per cited claim. A response without sources is incomplete.",
          "source": "skills/rui-reports/daily/references/ask-workflow.md"
        },
        {
          "question": "What is the difference between report and plan modes?",
          "answer": "Both are offline + git-only and both produce a 4-file HTML page. `report` mode reads recent git state and emits a CTO daily (summary, risk, health, people) for a single date. `plan` mode infers 30d/90d/long-term horizons, writes milestones, WBS, capacity, assumptions, and decisions, and labels the output `DRAFT — <date>` until the user confirms.",
          "source": "skills/rui-reports/daily/references/plan-workflow.md"
        },
        {
          "question": "How does plan mode prevent orphan work?",
          "answer": "Every 30d milestone must trace to a 90d theme; every 90d theme must trace to a long-term bet. Every 30d work item gets an owner placeholder (`<unassigned>` is valid) and an S/M/L size estimate. Every long-term bet carries a kill criterion and a decision point. Orphans fail validation and the writer refuses to render.",
          "source": "skills/rui-reports/daily/references/plan-validation.md"
        },
        {
          "question": "Where does the `DAILY_DEV_TOKEN` come from?",
          "answer": "From the OS keychain (macOS Keychain / Windows Credential Manager / Linux Secret Service). The token has a `dda_` prefix and is never embedded in commands the user will share — only `$DAILY_DEV_TOKEN` is referenced, piped through `Authorization: Bearer`. Back off on 429 with the `Retry-After` value (60 req/min shared).",
          "source": "skills/rui-reports/daily/references/token-storage.md"
        }
      ]
    },
    {
      "id": "further-reading",
      "kind": "further-reading",
      "title": "Further reading",
      "coverage": 92,
      "verdict": "pass",
      "items": [
        {
          "title": "skills/rui-reports/daily/SKILL.md",
          "href": "../../../../skills/rui-reports/daily/SKILL.md",
          "description": "Manifest + mode-selection table + 23 rules covering ask / api / report / plan.",
          "kind": "doc"
        },
        {
          "title": "references/ask-workflow.md",
          "href": "../../../../skills/rui-reports/daily/references/ask-workflow.md",
          "description": "Iterative search strategy, dedupe, and synthesis template for ask mode.",
          "kind": "doc"
        },
        {
          "title": "references/api-reference.md",
          "href": "../../../../skills/rui-reports/daily/references/api-reference.md",
          "description": "Full daily.dev REST endpoint catalog with rate-limit and error handling.",
          "kind": "doc"
        },
        {
          "title": "references/plan-workflow.md + 9 supporting refs",
          "href": "../../../../skills/rui-reports/daily/references/plan-workflow.md",
          "description": "plan examples, validation, scenarios, metrics, capacity, assumptions, diff, review, decisions, render.",
          "kind": "doc"
        },
        {
          "title": "docs/index.html",
          "href": "../../index.html",
          "description": "Homepage entry where this card is rendered in context.",
          "kind": "doc"
        }
      ]
    }
  ]
};
  var schema = window.QUICKSTART_DATA_SCHEMA;
  if (schema && typeof schema.computeScore === 'function') {
    var computed = schema.computeScore(dataset.sections);
    dataset.score = Object.assign({}, dataset.score || {}, computed, {
      summary: (dataset.score && dataset.score.summary) || 'Grounded from the docs-home card and its linked artifacts.'
    });
  }
  window.QUICKSTART_DATA = {
    datasets: [{ key: "src-rui-reports-daily", label: "daily", data: dataset }],
    default: dataset
  };
})();
