(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — 03-generate",
    "scope": "skills/rui-init/steps/03-generate/",
    "scopeShort": "03-generate",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — 03-generate",
    "tagline": "Grounded newcomer orientation for the \"03-generate\" docs card. Built from homepage metadata, linked artifacts, and local report paths.",
    "scope": "skills/rui-init/steps/03-generate/",
    "audience": "Contributors navigating the 03-generate card",
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
      "summary": "03-generate is a docs-home card under \"skills/rui-init — Initialization Pipeline\" in the \"Main Source Code\" section. Root docs and docs home generator backed by the standalone template. Metadata: Step · skills/rui-init/steps/03-generate/. The closest local artifact is `skills/rui-init/steps/03-generate/`.",
      "hero": {
        "eyebrow": "skills/rui-init — Initialization Pipeline",
        "title": "Understand 03-generate in about 9 min",
        "subtitle": "This walkthrough stays grounded in the docs-home card metadata, linked artifacts, and the closest local report or source path.",
        "totalMinutes": 9,
        "cta": "Start walkthrough",
        "ctaHint": "Cmd + Enter marks this card walkthrough as reviewed.",
        "timeStatLabel": "Time to first context",
        "timeCaption": "minutes to first context",
        "scopeStatLabel": "Grounded refs",
        "scopeStatSuffix": "refs",
        "gapsHint": "Open the linked local artifacts before editing this surface.",
        "gaps": [
          {
            "id": "artifact",
            "label": "Primary artifact",
            "coverage": 100
          }
        ],
        "steps": [
          {
            "id": "home",
            "n": 1,
            "name": "Locate",
            "minutes": 2,
            "color": "cyan",
            "type": "view",
            "ref": "docs/index.html",
            "outcome": "Open the docs home and review the original card context, grouping, and neighboring cards."
          },
          {
            "id": "quickstart",
            "n": 2,
            "name": "Read",
            "minutes": 2,
            "color": "accent",
            "type": "read",
            "ref": "docs/quickstart/src-rui-init-03-generate/index.html",
            "outcome": "Use this quickstart page to collect the grounded paths, links, and first actions for 03-generate."
          },
          {
            "id": "artifact",
            "n": 3,
            "name": "Inspect",
            "minutes": 3,
            "color": "pass",
            "type": "read",
            "ref": "skills/rui-init/steps/03-generate/",
            "outcome": "Inspect the closest local artifact tied to the card before making changes."
          },
          {
            "id": "verify",
            "n": 4,
            "name": "Verify",
            "minutes": 2,
            "color": "fail",
            "type": "run",
            "ref": "open '/Users/yi/YrY/.claude/docs/index.html'",
            "outcome": "Re-open the docs home and verify the card links still point to the expected report and quickstart surfaces."
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
            "top": "src-rui-init-03-generate",
            "accent": "accent",
            "blurb": "This per-card newcomer page under docs/quickstart/."
          },
          {
            "id": "local",
            "name": "local",
            "count": 1,
            "share": 25,
            "top": "skills/rui-init/steps/03-generate/",
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
                "name": "03-generate",
                "sub": "skills/rui-init — Initialization Pipeline",
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
            "items": [
              {
                "name": "skills/rui-init/steps/03-generate/",
                "sub": "local",
                "token": "qs-pass"
              }
            ]
          },
          {
            "tier": 4,
            "role": "Output",
            "items": [
              {
                "name": "quickstart/src-rui-init-03-generate",
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
          "value": "1",
          "suffix": "refs",
          "label": "grounded",
          "accent": "accent",
          "blurb": "Local and external references linked from this card."
        },
        {
          "value": "1",
          "suffix": "local",
          "label": "artifacts",
          "accent": "cyan",
          "blurb": "Docs or source paths you can open from this workspace."
        },
        {
          "value": "1",
          "suffix": "next",
          "label": "jumps",
          "accent": "pass",
          "blurb": "Scene, report, or supporting links carried by the card."
        }
      ],
      "whatYoullShip": [
        {
          "tag": "context",
          "title": "A grounded reading path",
          "body": "You can move from the homepage card to the nearest doc, report, or source artifact without guesswork."
        },
        {
          "tag": "links",
          "title": "A stable quickstart entry",
          "body": "This card now owns its own quickstart directory under docs/quickstart/."
        },
        {
          "tag": "verify",
          "title": "A repeatable check",
          "body": "You can reopen the homepage and confirm the card-level quickstart link stays wired."
        }
      ],
      "tiles": [
        {
          "label": "Section",
          "value": "Main Source Code"
        },
        {
          "label": "Group",
          "value": "skills/rui-init — Initialization Pipeline"
        },
        {
          "label": "Card kind",
          "value": "items"
        },
        {
          "label": "Primary scope",
          "value": "skills/rui-init/steps/03-generate/"
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
          "value": 4,
          "trend": [
            2,
            2,
            3,
            4,
            4,
            4
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
          "name": "03-generate",
          "role": "card",
          "description": "Root docs and docs home generator backed by the standalone template.",
          "file": "docs/index.html",
          "line": 1
        },
        {
          "name": "skills/rui-init — Initialization Pipeline",
          "role": "group",
          "description": "The immediate group that renders this card on the docs home.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "Main Source Code",
          "role": "section",
          "description": "The top-level documentation section that owns the card group.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "Primary artifact",
          "role": "location",
          "description": "Closest local file, report, or page tied to the card metadata.",
          "file": "skills/rui-init/steps/03-generate/",
          "line": 1
        },
        {
          "name": "Metadata cue",
          "role": "meta",
          "description": "Step · skills/rui-init/steps/03-generate/",
          "file": "skills/rui-init/steps/03-generate/",
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
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── src-rui-init-03-generate/index.html\n├── skills/rui-init/steps/03-generate/",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/src-rui-init-03-generate/index.html",
          "note": "Per-card quickstart page generated for this card."
        },
        {
          "path": "skills/rui-init/steps/03-generate/",
          "note": "Closest local artifact carried by the card metadata or links."
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
          "action": "Open the docs home and jump back to the original card.",
          "outcome": "You see how 03-generate is grouped and what related cards sit nearby.",
          "command": "open '/Users/yi/YrY/.claude/docs/index.html'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Read this per-card quickstart page from top to bottom.",
          "outcome": "You collect the grounded artifacts, commands, and follow-up reading for this card.",
          "command": "open '/Users/yi/YrY/.claude/docs/quickstart/src-rui-init-03-generate/index.html'"
        },
        {
          "order": 3,
          "type": "read",
          "minutes": 3,
          "action": "Inspect the closest local artifact linked by the card.",
          "outcome": "You move from summary copy into the actual page, report, or source path behind the card.",
          "file": "skills/rui-init/steps/03-generate/",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-init/steps/03-generate/'"
        },
        {
          "order": 4,
          "type": "run",
          "minutes": 2,
          "action": "Re-open the homepage and verify the quickstart link for this card.",
          "outcome": "The card now exposes both its report/demo surface and its own quickstart directory.",
          "command": "open '/Users/yi/YrY/.claude/docs/index.html'"
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
          "name": "open-home",
          "command": "open '/Users/yi/YrY/.claude/docs/index.html'",
          "description": "Open the docs homepage where the original card is rendered.",
          "source": "docs/index.html"
        },
        {
          "name": "open-quickstart",
          "command": "open '/Users/yi/YrY/.claude/docs/quickstart/src-rui-init-03-generate/index.html'",
          "description": "Open this per-card quickstart page directly.",
          "source": "docs/quickstart/src-rui-init-03-generate/index.html"
        },
        {
          "name": "open-artifact",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-init/steps/03-generate/'",
          "description": "Open the closest local artifact attached to the card metadata or links.",
          "source": "skills/rui-init/steps/03-generate/"
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
          "question": "What does this card summarize?",
          "answer": "Root docs and docs home generator backed by the standalone template.",
          "source": "docs/data.js"
        },
        {
          "question": "Where is the closest local artifact for this card?",
          "answer": "The nearest local artifact is `skills/rui-init/steps/03-generate/`.",
          "source": "skills/rui-init/steps/03-generate/"
        },
        {
          "question": "Which group owns this card on the homepage?",
          "answer": "The card is rendered in the group \"skills/rui-init — Initialization Pipeline\" inside the section \"Main Source Code\".",
          "source": "docs/data.js"
        },
        {
          "question": "What should I open next after reading this page?",
          "answer": "Open `skills/rui-init/steps/03-generate/` first, then return to docs/index.html to verify the homepage link path.",
          "source": "skills/rui-init/steps/03-generate/"
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
          "title": "docs/index.html",
          "href": "../../index.html",
          "description": "Homepage entry where this card is rendered in context.",
          "kind": "doc"
        },
        {
          "title": "docs/quickstart/index.html",
          "href": "../index.html",
          "description": "The root quickstart page used as the shared template baseline.",
          "kind": "doc"
        },
        {
          "title": "skills/rui-init/steps/03-generate/",
          "href": "../../skills/rui-init/steps/03-generate",
          "description": "Closest local artifact carried by the card.",
          "kind": "directory"
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
    datasets: [{ key: "src-rui-init-03-generate", label: "03-generate", data: dataset }],
    default: dataset
  };
})();
