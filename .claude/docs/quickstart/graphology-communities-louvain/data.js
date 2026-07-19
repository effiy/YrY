(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — graphology-communities-louvain",
    "scope": "deps/graphology-communities-louvain/index.html",
    "scopeShort": "graphology-communities-louvain",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — graphology-communities-louvain",
    "tagline": "Grounded newcomer orientation for the \"graphology-communities-louvain\" docs card. Built from homepage metadata, linked artifacts, and local report paths.",
    "scope": "deps/graphology-communities-louvain/index.html",
    "audience": "Contributors navigating the graphology-communities-louvain card",
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
      "summary": "graphology-communities-louvain is a docs-home card under \"Runtime Dependencies (15)\" in the \"Third-Party Dependencies / Frameworks\" section. Community detection for clustered code graphs. Metadata: Runtime · ^2.0.2. The closest local artifact is `deps/graphology-communities-louvain/index.html`. The primary external reference is `https://github.com/graphology/graphology-communities-louvain`.",
      "hero": {
        "eyebrow": "Runtime Dependencies (15)",
        "title": "Understand graphology-communities-louvain in about 11 min",
        "subtitle": "This walkthrough stays grounded in the docs-home card metadata, linked artifacts, and the closest local report or source path.",
        "totalMinutes": 11,
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
            "ref": "docs/quickstart/graphology-communities-louvain/index.html",
            "outcome": "Use this quickstart page to collect the grounded paths, links, and first actions for graphology-communities-louvain."
          },
          {
            "id": "artifact",
            "n": 3,
            "name": "Inspect",
            "minutes": 3,
            "color": "pass",
            "type": "read",
            "ref": "deps/graphology-communities-louvain/index.html",
            "outcome": "Inspect the closest local artifact tied to the card before making changes."
          },
          {
            "id": "reference",
            "n": 4,
            "name": "Reference",
            "minutes": 2,
            "color": "warn",
            "type": "view",
            "ref": "https://github.com/graphology/graphology-communities-louvain",
            "outcome": "Cross-check the upstream documentation or homepage linked from the card."
          },
          {
            "id": "verify",
            "n": 5,
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
        "total": 2,
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
            "top": "graphology-communities-louvain",
            "accent": "accent",
            "blurb": "This per-card newcomer page under docs/quickstart/."
          },
          {
            "id": "local",
            "name": "local",
            "count": 1,
            "share": 25,
            "top": "deps/graphology-communities-louvain/index.html",
            "accent": "pass",
            "blurb": "Local docs or source artifacts linked from the card."
          },
          {
            "id": "external",
            "name": "external",
            "count": 1,
            "share": 25,
            "top": "upstream",
            "accent": "warn",
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
                "name": "graphology-communities-louvain",
                "sub": "Runtime Dependencies (15)",
                "token": "qs-cyan"
              }
            ]
          },
          {
            "tier": 2,
            "role": "Section",
            "items": [
              {
                "name": "Third-Party Dependencies / Frameworks",
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
                "name": "deps/graphology-communities-louvain/index.html",
                "sub": "local",
                "token": "qs-pass"
              },
              {
                "name": "external ref",
                "sub": "https://github.com/graphology/graphology-communities-louvain",
                "token": "qs-warn"
              }
            ]
          },
          {
            "tier": 4,
            "role": "Output",
            "items": [
              {
                "name": "quickstart/graphology-communities-louvain",
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
          "value": "2",
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
          "value": "Third-Party Dependencies / Frameworks"
        },
        {
          "label": "Group",
          "value": "Runtime Dependencies (15)"
        },
        {
          "label": "Card kind",
          "value": "items"
        },
        {
          "label": "Primary scope",
          "value": "deps/graphology-communities-louvain/index.html"
        }
      ],
      "stats": [
        {
          "label": "Grounded refs",
          "value": 2,
          "trend": [
            1,
            1,
            2,
            2,
            3,
            2
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
          "value": 1,
          "trend": [
            0,
            0,
            0,
            1,
            1,
            1
          ]
        },
        {
          "label": "Walkthrough steps",
          "value": 5,
          "trend": [
            2,
            2,
            3,
            4,
            4,
            5
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
          "name": "graphology-communities-louvain",
          "role": "card",
          "description": "Community detection for clustered code graphs.",
          "file": "docs/index.html",
          "line": 1
        },
        {
          "name": "Runtime Dependencies (15)",
          "role": "group",
          "description": "The immediate group that renders this card on the docs home.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "Third-Party Dependencies / Frameworks",
          "role": "section",
          "description": "The top-level documentation section that owns the card group.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "Primary artifact",
          "role": "location",
          "description": "Closest local file, report, or page tied to the card metadata.",
          "file": "deps/graphology-communities-louvain/index.html",
          "line": 1
        },
        {
          "name": "External reference",
          "role": "reference",
          "description": "Upstream documentation or package homepage linked by the card.",
          "file": "https://github.com/graphology/graphology-communities-louvain",
          "line": 1
        },
        {
          "name": "Metadata cue",
          "role": "meta",
          "description": "Runtime · ^2.0.2",
          "file": "deps/graphology-communities-louvain/index.html",
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
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── graphology-communities-louvain/index.html\n├── deps/graphology-communities-louvain/index.html",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/graphology-communities-louvain/index.html",
          "note": "Per-card quickstart page generated for this card."
        },
        {
          "path": "deps/graphology-communities-louvain/index.html",
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
          "outcome": "You see how graphology-communities-louvain is grouped and what related cards sit nearby.",
          "command": "open '/Users/yi/YrY/.claude/docs/index.html'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Read this per-card quickstart page from top to bottom.",
          "outcome": "You collect the grounded artifacts, commands, and follow-up reading for this card.",
          "command": "open '/Users/yi/YrY/.claude/docs/quickstart/graphology-communities-louvain/index.html'"
        },
        {
          "order": 3,
          "type": "read",
          "minutes": 3,
          "action": "Inspect the closest local artifact linked by the card.",
          "outcome": "You move from summary copy into the actual page, report, or source path behind the card.",
          "file": "deps/graphology-communities-louvain/index.html",
          "command": "open '/Users/yi/YrY/.claude/docs/deps/graphology-communities-louvain/index.html'"
        },
        {
          "order": 4,
          "type": "view",
          "minutes": 2,
          "action": "Cross-check the upstream reference linked by the card.",
          "outcome": "You verify naming, version, or API context against the upstream surface.",
          "file": "https://github.com/graphology/graphology-communities-louvain"
        },
        {
          "order": 5,
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
          "command": "open '/Users/yi/YrY/.claude/docs/quickstart/graphology-communities-louvain/index.html'",
          "description": "Open this per-card quickstart page directly.",
          "source": "docs/quickstart/graphology-communities-louvain/index.html"
        },
        {
          "name": "open-artifact",
          "command": "open '/Users/yi/YrY/.claude/docs/deps/graphology-communities-louvain/index.html'",
          "description": "Open the closest local artifact attached to the card metadata or links.",
          "source": "deps/graphology-communities-louvain/index.html"
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
          "answer": "Community detection for clustered code graphs.",
          "source": "docs/data.js"
        },
        {
          "question": "Where is the closest local artifact for this card?",
          "answer": "The nearest local artifact is `deps/graphology-communities-louvain/index.html`.",
          "source": "deps/graphology-communities-louvain/index.html"
        },
        {
          "question": "Which group owns this card on the homepage?",
          "answer": "The card is rendered in the group \"Runtime Dependencies (15)\" inside the section \"Third-Party Dependencies / Frameworks\".",
          "source": "docs/data.js"
        },
        {
          "question": "What should I open next after reading this page?",
          "answer": "Open `deps/graphology-communities-louvain/index.html` first, then return to docs/index.html to verify the homepage link path.",
          "source": "deps/graphology-communities-louvain/index.html"
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
          "title": "deps/graphology-communities-louvain/index.html",
          "href": "../../deps/graphology-communities-louvain/index.html",
          "description": "Closest local artifact carried by the card.",
          "kind": "directory"
        },
        {
          "title": "graphology-communities-louvain upstream",
          "href": "https://github.com/graphology/graphology-communities-louvain",
          "description": "Primary upstream documentation or homepage linked by the card.",
          "kind": "external"
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
    datasets: [{ key: "graphology-communities-louvain", label: "graphology-communities-louvain", data: dataset }],
    default: dataset
  };
})();
