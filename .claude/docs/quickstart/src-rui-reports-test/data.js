(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — test · six-scene self-check strategy",
    "scope": "test",
    "scopeShort": "test",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — test · 6 scenes · 6 facets · A–F",
    "tagline": "Six-scene self-check strategy for any project — post-init, pre-commit, doc-code consistency, security surface, cross-story integration, third-party framework — graded A–F with OWASP / NIST / CIS / SLSA compliance and a 4-sprint remediation roadmap. Archived analyzer; templates retained.",
    "scope": "test",
    "audience": "Contributors exercising the 6-scene self-check strategy with A–F grading",
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
      "summary": "test is a docs-home card under \"skills/rui-reports — Report Generators\" in the \"Main Source Code\" section. It is an archived static reference bundle for a six-scene self-check strategy on any project: post-init full self-check, pre-commit incremental self-check, doc-code consistency, security surface regression, cross-story integration regression, third-party framework service. The 6 scenes map to 6 facets (init / tests / docs / security / refs / deps) and are scored against a composite 0–100 with grades A–F; the `compliance` block links every scene to OWASP / NIST / CIS / SLSA. The one-off analyzer is removed; `templates/` (data.js shape template), `references/` (scene-catalog, methodology), and `rules/` (self-test-contracts) are retained. Metadata: Sub-skill · 6 scenes + 6 facets + 4-framework compliance.",
      "hero": {
        "eyebrow": "skills/rui-reports — test (6 scenes, archived)",
        "title": "Run a six-scene self-check in about 6 min",
        "subtitle": "Walk scene-1 → scene-6 in fixed order: post-init → pre-commit → doc-code → security → cross-story → third-party, then read the composite score and A–F grade.",
        "totalMinutes": 6,
        "cta": "Start walkthrough",
        "ctaHint": "Cmd + Enter marks this card walkthrough as reviewed.",
        "timeStatLabel": "Time to grade",
        "timeCaption": "minutes to grade",
        "scopeStatLabel": "Compliance",
        "scopeStatSuffix": "frameworks",
        "gapsHint": "Read scene-catalog.md and the byte-stable self-test-contracts.md before changing any threshold.",
        "gaps": [
          {
            "id": "scene-order",
            "label": "scene index order",
            "coverage": 70
          },
          {
            "id": "grade-thresholds",
            "label": "A–F grade thresholds",
            "coverage": 72
          }
        ],
        "steps": [
          {
            "id": "scene-catalog",
            "n": 1,
            "name": "Scenes",
            "minutes": 1,
            "color": "cyan",
            "type": "read",
            "ref": "skills/rui-reports/test/references/scene-catalog.md",
            "outcome": "Lock in the 6 scene slugs, titles, icons, facets, and §0–§4 payload shape."
          },
          {
            "id": "methodology",
            "n": 2,
            "name": "Lifecycle",
            "minutes": 2,
            "color": "accent",
            "type": "read",
            "ref": "skills/rui-reports/test/references/methodology.md",
            "outcome": "Apply the 5-stage §0–§4 lifecycle (effect → steps → outputs → report → edge cases) to each scene."
          },
          {
            "id": "grade",
            "n": 3,
            "name": "Grade",
            "minutes": 2,
            "color": "pass",
            "type": "read",
            "ref": "skills/rui-reports/test/rules/self-test-contracts.md",
            "outcome": "Apply the A–F grading (A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40) and link the scene to OWASP / NIST / CIS / SLSA via the compliance block."
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
            "top": "src-rui-reports-test",
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
                "name": "test",
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
                "name": "quickstart/src-rui-reports-test",
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
          "value": "6 / 6",
          "suffix": "scenes / facets",
          "label": "fixed pairing",
          "accent": "accent",
          "blurb": "1 scene per facet — post-init→init, pre-commit→tests, doc-code→docs, security→security, cross-story→refs, third-party→deps."
        },
        {
          "value": "A–F",
          "suffix": "grade",
          "label": "composite",
          "accent": "cyan",
          "blurb": "Composite = mean(coverage) × 100. A ≥ 90 · B ≥ 75 · C ≥ 60 · D ≥ 40 · F < 40. Per-scene: pass ≥ 0.9, partial 0.5–0.89, fail < 0.5."
        },
        {
          "value": "4",
          "suffix": "frameworks",
          "label": "compliance",
          "accent": "pass",
          "blurb": "OWASP Top 10 · NIST SSDF · CIS Controls · SLSA — a grade-A project is also audit-ready."
        }
      ],
      "whatYoullShip": [
        {
          "tag": "scenes",
          "title": "6 scene pages in fixed order",
          "body": "Five §0–§4 sections per scene: effect → steps → outputs → report → edge cases, each with `title` / `action` / `expected` / `file` fields."
        },
        {
          "tag": "grade",
          "title": "Composite score + A–F grade",
          "body": "Per-scene coverage feeds a composite score, an A–F grade, and a `verdict` per scene; a 4-sprint remediation plan is computed after the score gate."
        },
        {
          "tag": "risk",
          "title": "Compliance map + risk register",
          "body": "Each scene links to OWASP / NIST / CIS / SLSA; a risk register ranks findings by severity / likelihood / effort and is surfaced alongside the roadmap."
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
          "value": "test"
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
          "name": "test",
          "role": "card",
          "description": "Six-scene self-check strategy (post-init · pre-commit · doc-code · security · cross-story · third-party) graded A–F with OWASP/NIST/CIS/SLSA compliance + 4-sprint roadmap; analyzer archived, templates retained.",
          "file": "skills/rui-reports/test/SKILL.md",
          "line": 1
        },
        {
          "name": "templates/data.js",
          "role": "template",
          "description": "Shape: REPORT_CONFIG (options, constants) + REPORT_DATA (scope, score 0–100, grade A–F, summary, facets, inventory, 6 scenes, gradeScale, compliance, riskRegister, glossary, roadmap, metrics, activity).",
          "file": "skills/rui-reports/test/templates/data.js",
          "line": 1
        },
        {
          "name": "Main Source Code",
          "role": "section",
          "description": "Top-level documentation section that owns this card group.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "scene-catalog.md",
          "role": "catalog",
          "description": "Pins the 6 scene slugs, titles, icons, facets, and the §0–§4 payload shape. Reordering is not allowed.",
          "file": "skills/rui-reports/test/references/scene-catalog.md",
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
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── src-rui-reports-test/index.html",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/src-rui-reports-test/index.html",
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
          "type": "read",
          "minutes": 1,
          "action": "Read the archived SKILL.md and confirm user_invocable: false (this skill runs as part of the broader rui-init pipeline).",
          "outcome": "You know templates/, references/, and rules/ are retained; the one-off analyzer is removed.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/SKILL.md'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Lock the 6 scene slugs in scene-catalog.md and the §0–§4 lifecycle in methodology.md.",
          "outcome": "You can name the effect → steps → outputs → report → edge cases lifecycle for every scene.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/references/scene-catalog.md'"
        },
        {
          "order": 3,
          "type": "run",
          "minutes": 2,
          "action": "Apply the byte-stable contracts.md thresholds and the A–F grade ladder (A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40).",
          "outcome": "You can plug the per-scene coverage, compliance map, and risk register into a single scope-wide score.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/rules/self-test-contracts.md'"
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
          "name": "open-skill",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/SKILL.md'",
          "description": "Read the archived SKILL.md and confirm `user_invocable: false` (the skill runs via the rui-init pipeline).",
          "source": "skills/rui-reports/test/SKILL.md"
        },
        {
          "name": "open-scene-catalog",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/references/scene-catalog.md'",
          "description": "Lock the 6 scene slugs, titles, icons, facets, and the §0–§4 payload shape.",
          "source": "skills/rui-reports/test/references/scene-catalog.md"
        },
        {
          "name": "open-methodology",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/references/methodology.md'",
          "description": "5-stage §0–§4 lifecycle (effect → steps → outputs → report → edge cases) + verdict/coverage rules.",
          "source": "skills/rui-reports/test/references/methodology.md"
        },
        {
          "name": "open-contracts",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/test/rules/self-test-contracts.md'",
          "description": "Byte-stable payload contract — column names, severity thresholds, per-facet probe lists.",
          "source": "skills/rui-reports/test/rules/self-test-contracts.md"
        }
      ]
    },
    {
      "id": "faq",
      "kind": "faq",
      "title": "FAQ",
      "coverage": 82,
      "verdict": "partial",
      "items": [
        {
          "question": "What are the 6 fixed scenes?",
          "answer": "In order: post-init full self-check (init facet) · pre-commit incremental self-check (tests facet) · doc-code consistency (docs facet) · security surface regression (security facet) · cross-story integration regression (refs facet) · third-party framework service (deps facet). The 6 facets map 1:1 onto the 6 scenes; the order is fixed by `scene-catalog.md` and reordering is not allowed.",
          "source": "skills/rui-reports/test/references/scene-catalog.md"
        },
        {
          "question": "How is the composite score and A–F grade computed?",
          "answer": "Each scene has a `coverage` between 0 and 1 (pass ≥ 0.9, partial 0.5–0.89, fail < 0.5). Composite = mean(coverage) × 100, rounded. Grade A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, F < 40. When `REPORT_CONFIG.options.mergeScenes` is true, per-scene evidence is merged into a single scope-wide inventory before scoring.",
          "source": "skills/rui-reports/test/rules/self-test-contracts.md"
        },
        {
          "question": "What is the compliance map?",
          "answer": "Each scene exposes a `compliance` block that links the scene payload to OWASP Top 10, NIST SSDF, CIS Controls, and SLSA levels. The intent is that a grade-A project is also audit-ready — security and supply-chain controls are not bolted on after the score is computed.",
          "source": "skills/rui-reports/test/references/methodology.md"
        },
        {
          "question": "Why is this skill archived?",
          "answer": "The one-off analyzer and CLI command have been removed; the skill now runs as part of the broader `rui-init` pipeline (step 05-verify) and via manual assembly. `templates/data.js` (REPORT_CONFIG + REPORT_DATA shape), `references/scene-catalog.md` and `methodology.md`, and `rules/self-test-contracts.md` are retained as the contract for any future replacement implementation.",
          "source": "skills/rui-reports/test/SKILL.md"
        }
      ]
    },
    {
      "id": "further-reading",
      "kind": "further-reading",
      "title": "Further reading",
      "coverage": 90,
      "verdict": "pass",
      "items": [
        {
          "title": "skills/rui-reports/test/SKILL.md",
          "href": "../../../../skills/rui-reports/test/SKILL.md",
          "description": "Archived status + what is retained; `user_invocable: false`.",
          "kind": "doc"
        },
        {
          "title": "references/scene-catalog.md",
          "href": "../../../../skills/rui-reports/test/references/scene-catalog.md",
          "description": "6 scene slugs + §0–§4 payload shape; reordering is not allowed.",
          "kind": "doc"
        },
        {
          "title": "references/methodology.md",
          "href": "../../../../skills/rui-reports/test/references/methodology.md",
          "description": "5-stage §0–§4 lifecycle per scene + verdict/coverage rules + compliance block rules.",
          "kind": "doc"
        },
        {
          "title": "rules/self-test-contracts.md",
          "href": "../../../../skills/rui-reports/test/rules/self-test-contracts.md",
          "description": "Byte-stable payload contract — column names, severity thresholds, per-facet probe lists.",
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
    datasets: [{ key: "src-rui-reports-test", label: "test", data: dataset }],
    default: dataset
  };
})();
