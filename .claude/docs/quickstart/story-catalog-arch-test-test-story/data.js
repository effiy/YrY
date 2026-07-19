(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — test Story",
    "scope": "test/scene-1-post-init-full-self-check/index.md",
    "scopeShort": "test Story",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — test Story",
    "tagline": "Grounded newcomer orientation for the \"test Story\" docs card. Built from homepage metadata, linked artifacts, and local report paths.",
    "scope": "test/scene-1-post-init-full-self-check/index.md",
    "audience": "Contributors navigating the test Story card",
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
      "summary": "test Story is a docs-home card under \"Story Catalog (arch + test)\" in the \"Story Documents & Scenes\" section. Verification tree for post-init checks, incremental checks, doc drift, security regression, cross-story integration, and third-party service health. Metadata: 6 scenes · canonical slug set complete. The closest local artifact is `test/scene-1-post-init-full-self-check/index.md`.",
      "hero": {
        "eyebrow": "Story Catalog (arch + test)",
        "title": "Understand test Story in about 9 min",
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
            "ref": "docs/quickstart/story-catalog-arch-test-test-story/index.html",
            "outcome": "Use this quickstart page to collect the grounded paths, links, and first actions for test Story."
          },
          {
            "id": "artifact",
            "n": 3,
            "name": "Inspect",
            "minutes": 3,
            "color": "pass",
            "type": "read",
            "ref": "test/scene-1-post-init-full-self-check/index.md",
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
        "total": 7,
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
            "top": "story-catalog-arch-test-test-story",
            "accent": "accent",
            "blurb": "This per-card newcomer page under docs/quickstart/."
          },
          {
            "id": "local",
            "name": "local",
            "count": 7,
            "share": 25,
            "top": "test/scene-1-post-init-full-self-check/index.md",
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
          7
        ]
      },
      "stack": {
        "layers": [
          {
            "tier": 1,
            "role": "Card",
            "items": [
              {
                "name": "test Story",
                "sub": "Story Catalog (arch + test)",
                "token": "qs-cyan"
              }
            ]
          },
          {
            "tier": 2,
            "role": "Section",
            "items": [
              {
                "name": "Story Documents & Scenes",
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
                "name": "test/scene-1-post-init-full-self-check/index.md",
                "sub": "local",
                "token": "qs-pass"
              },
              {
                "name": "test/scene-2-pre-commit-incremental-self-check/index.md",
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
                "name": "quickstart/story-catalog-arch-test-test-story",
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
          "value": "7",
          "suffix": "refs",
          "label": "grounded",
          "accent": "accent",
          "blurb": "Local and external references linked from this card."
        },
        {
          "value": "7",
          "suffix": "local",
          "label": "artifacts",
          "accent": "cyan",
          "blurb": "Docs or source paths you can open from this workspace."
        },
        {
          "value": "6",
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
          "value": "Story Documents & Scenes"
        },
        {
          "label": "Group",
          "value": "Story Catalog (arch + test)"
        },
        {
          "label": "Card kind",
          "value": "stories"
        },
        {
          "label": "Primary scope",
          "value": "test/scene-1-post-init-full-self-check/index.md"
        }
      ],
      "stats": [
        {
          "label": "Grounded refs",
          "value": 7,
          "trend": [
            1,
            1,
            2,
            2,
            3,
            7
          ]
        },
        {
          "label": "Local docs",
          "value": 7,
          "trend": [
            1,
            1,
            1,
            2,
            2,
            7
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
          "name": "test Story",
          "role": "card",
          "description": "Verification tree for post-init checks, incremental checks, doc drift, security regression, cross-story integration, and third-party service health.",
          "file": "docs/index.html",
          "line": 1
        },
        {
          "name": "Story Catalog (arch + test)",
          "role": "group",
          "description": "The immediate group that renders this card on the docs home.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "Story Documents & Scenes",
          "role": "section",
          "description": "The top-level documentation section that owns the card group.",
          "file": "docs/data.js",
          "line": 1
        },
        {
          "name": "Primary artifact",
          "role": "location",
          "description": "Closest local file, report, or page tied to the card metadata.",
          "file": "test/scene-1-post-init-full-self-check/index.md",
          "line": 1
        },
        {
          "name": "Metadata cue",
          "role": "meta",
          "description": "6 scenes · canonical slug set complete",
          "file": "test/scene-1-post-init-full-self-check/index.md",
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
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── story-catalog-arch-test-test-story/index.html\n├── test/scene-1-post-init-full-self-check/index.md\n├── test/scene-2-pre-commit-incremental-self-check/index.md\n├── test/scene-3-doc-code-consistency/index.md",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/story-catalog-arch-test-test-story/index.html",
          "note": "Per-card quickstart page generated for this card."
        },
        {
          "path": "test/scene-1-post-init-full-self-check/index.md",
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
          "outcome": "You see how test Story is grouped and what related cards sit nearby.",
          "command": "open '/Users/yi/YrY/.claude/docs/index.html'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Read this per-card quickstart page from top to bottom.",
          "outcome": "You collect the grounded artifacts, commands, and follow-up reading for this card.",
          "command": "open '/Users/yi/YrY/.claude/docs/quickstart/story-catalog-arch-test-test-story/index.html'"
        },
        {
          "order": 3,
          "type": "read",
          "minutes": 3,
          "action": "Inspect the closest local artifact linked by the card.",
          "outcome": "You move from summary copy into the actual page, report, or source path behind the card.",
          "file": "test/scene-1-post-init-full-self-check/index.md",
          "command": "open '/Users/yi/YrY/.claude/docs/test/scene-1-post-init-full-self-check/index.md'"
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
          "command": "open '/Users/yi/YrY/.claude/docs/quickstart/story-catalog-arch-test-test-story/index.html'",
          "description": "Open this per-card quickstart page directly.",
          "source": "docs/quickstart/story-catalog-arch-test-test-story/index.html"
        },
        {
          "name": "open-artifact",
          "command": "open '/Users/yi/YrY/.claude/docs/test/scene-1-post-init-full-self-check/index.md'",
          "description": "Open the closest local artifact attached to the card metadata or links.",
          "source": "test/scene-1-post-init-full-self-check/index.md"
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
          "answer": "Verification tree for post-init checks, incremental checks, doc drift, security regression, cross-story integration, and third-party service health.",
          "source": "docs/data.js"
        },
        {
          "question": "Where is the closest local artifact for this card?",
          "answer": "The nearest local artifact is `test/scene-1-post-init-full-self-check/index.md`.",
          "source": "test/scene-1-post-init-full-self-check/index.md"
        },
        {
          "question": "Which group owns this card on the homepage?",
          "answer": "The card is rendered in the group \"Story Catalog (arch + test)\" inside the section \"Story Documents & Scenes\".",
          "source": "docs/data.js"
        },
        {
          "question": "What should I open next after reading this page?",
          "answer": "Open `test/scene-1-post-init-full-self-check/index.md` first, then return to docs/index.html to verify the homepage link path.",
          "source": "test/scene-1-post-init-full-self-check/index.md"
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
          "title": "test/scene-1-post-init-full-self-check/index.md",
          "href": "../../test/scene-1-post-init-full-self-check/index.md",
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
    datasets: [{ key: "story-catalog-arch-test-test-story", label: "test Story", data: dataset }],
    default: dataset
  };
})();
