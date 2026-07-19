(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — diagram · algorithmic SVG architecture generator",
    "scope": "diagram",
    "scopeShort": "diagram",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — diagram · 9×7 grid + Manhattan routing",
    "tagline": "Algorithmic SVG architecture diagram generator — turns a written system brief into a self-contained HTML+SVG page. 9×7 grid, orthogonal Manhattan routing, 23 components, 7 swim lanes, 2px strokes, textLength auto-fit. The only package-managed code module in rui-reports.",
    "scope": "diagram",
    "audience": "Contributors authoring dark-themed architecture diagrams from a system brief",
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
      "summary": "diagram is a docs-home card under \"skills/rui-reports — Report Generators\" in the \"Main Source Code\" section. It is the only package-managed code module in the rui-reports catalog (package.json + vitest) and turns a written system brief into a self-contained HTML+SVG architecture diagram. The 4-file template (`data.js` + `index.html` + `index.css` + `index.js`) reads `window.REPORT_DATA` and renders with a 9×7 grid, orthogonal Manhattan routing, 23 components, 7 swim lanes, 2px strokes, and textLength auto-fit. Metadata: ESM package · 9 languages + 10 framework configs.",
      "hero": {
        "eyebrow": "skills/rui-reports — diagram (algorithmic SVG)",
        "title": "Author a dark-themed architecture diagram in about 6 min",
        "subtitle": "Walk the requirements-driven flow: brief → window.REPORT_DATA → 4-file template → 9×7 grid + Manhattan routing → auto-fitting SVG.",
        "totalMinutes": 6,
        "cta": "Start walkthrough",
        "ctaHint": "Cmd + Enter marks this card walkthrough as reviewed.",
        "timeStatLabel": "Time to first diagram",
        "timeCaption": "minutes to first diagram",
        "scopeStatLabel": "Engine refs",
        "scopeStatSuffix": "refs",
        "gapsHint": "Read the 4 template headers and the design-system rubric before authoring.",
        "gaps": [
          {
            "id": "svg-order",
            "label": "SVG document order",
            "coverage": 70
          },
          {
            "id": "label-fit",
            "label": "textLength label fit",
            "coverage": 72
          }
        ],
        "steps": [
          {
            "id": "read-brief",
            "n": 1,
            "name": "Brief",
            "minutes": 1,
            "color": "cyan",
            "type": "read",
            "ref": "skills/rui-reports/diagram/commands/create.md",
            "outcome": "Outline the components, swim lanes, and connections in your system brief."
          },
          {
            "id": "data-shape",
            "n": 2,
            "name": "REPORT_DATA",
            "minutes": 2,
            "color": "accent",
            "type": "read",
            "ref": "skills/rui-reports/diagram/templates/data.js",
            "outcome": "Fill in `meta`, `executiveSummary`, `toc`, `metrics`, `svgDiagram`, `summaryCards`, `pipeline`, `securityCards`, `trace`, `scalingTiles`, `ownership`, `apiTable`, `stack`, `schemaTiles`, `roadmap`, `glossary`."
          },
          {
            "id": "render",
            "n": 3,
            "name": "Render",
            "minutes": 2,
            "color": "pass",
            "type": "run",
            "ref": "open '<out>/index.html'",
            "outcome": "Mount the Vue app and verify the 2px strokes, textLength labels, and the auto-computed outermost wireframe wrap every element."
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
            "top": "src-rui-reports-diagram",
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
                "name": "diagram",
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
                "name": "quickstart/src-rui-reports-diagram",
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
          "value": "9×7",
          "suffix": "grid",
          "label": "layout engine",
          "accent": "accent",
          "blurb": "Orthogonal Manhattan routing snaps to 10px intersections; boundaries pad to 18px around contents."
        },
        {
          "value": "23 / 7",
          "suffix": "components / lanes",
          "label": "taxonomy",
          "accent": "cyan",
          "blurb": "23 components across 7 swim lanes: Client · Edge · App · API · Data · Async · Ops."
        },
        {
          "value": "2px + textLength",
          "suffix": "render rules",
          "label": "visual contract",
          "accent": "pass",
          "blurb": "Main strokes are 2px; every label uses textLength + lengthAdjust to fit its slot — never wrap a label."
        }
      ],
      "whatYoullShip": [
        {
          "tag": "engine",
          "title": "Self-contained HTML+SVG page",
          "body": "A 4-file page (data.js + index.html + index.css + index.js) with no public CDN dependencies, all styles and fonts inlined."
        },
        {
          "tag": "render",
          "title": "Algorithmic layout (no hand-placement)",
          "body": "Every coordinate, boundary, arrow path, and label is computed by the embedded engine from `window.REPORT_DATA`."
        },
        {
          "tag": "rubric",
          "title": "Quality gate via quality-rubric.md",
          "body": "Publish only after line weight, label fit, wireframe completeness, and swim-lane contrast all pass the rubric."
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
          "value": "diagram"
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
          "name": "diagram",
          "role": "card",
          "description": "Algorithmic SVG architecture diagram generator — sole ESM package; 9×7 grid + Manhattan routing; 23 components · 7 swim lanes; 2px strokes + textLength auto-fit.",
          "file": "skills/rui-reports/diagram/SKILL.md",
          "line": 1
        },
        {
          "name": "templates/ (4 files)",
          "role": "template",
          "description": "Page template: index.html (DOM), index.css (layered tokens), data.js (REPORT_DATA), index.js (Vue 3 + interactions).",
          "file": "skills/rui-reports/diagram/templates/data.js",
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
          "name": "window.REPORT_DATA",
          "role": "data-shape",
          "description": "meta · executiveSummary · toc · metrics · svgDiagram · summaryCards · pipeline · securityCards · trace · scalingTiles · ownership · apiTable · stack · schemaTiles · roadmap · glossary.",
          "file": "skills/rui-reports/diagram/templates/data.js",
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
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── src-rui-reports-diagram/index.html",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/src-rui-reports-diagram/index.html",
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
          "action": "Read the diagram SKILL.md and lock in the 4-file output contract.",
          "outcome": "You know the algorithm: 9×7 grid, orthogonal Manhattan routing, 2px strokes, textLength labels, auto-computed outermost wireframe.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/diagram/SKILL.md'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Skim design-system.md and quality-rubric.md to lock the visual contract.",
          "outcome": "You can name the line weight, label-fit, wireframe-completeness, and swim-lane-contrast gates every page must pass.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/diagram/references/design-system.md'"
        },
        {
          "order": 3,
          "type": "run",
          "minutes": 2,
          "action": "Author a system brief, copy the 4 template files, and fill in window.REPORT_DATA.",
          "outcome": "A self-contained, dark-themed HTML+SVG page renders correctly with no public CDN dependencies.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/diagram/commands/create.md'"
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
          "name": "create",
          "command": "/rui-report-diagram create --out diagram.html",
          "description": "Requirements-driven generation; copies the 4 template files and fills `window.REPORT_DATA` from your system brief.",
          "source": "skills/rui-reports/diagram/commands/create.md"
        },
        {
          "name": "open-template",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/diagram/templates/data.js'",
          "description": "Open the data.js shape (REPORT_DATA) to author your own diagram from a system brief.",
          "source": "skills/rui-reports/diagram/templates/data.js"
        },
        {
          "name": "open-design-system",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/diagram/references/design-system.md'",
          "description": "Lock in the visual contract: 2px strokes, textLength labels, 9×7 grid, 7 swim lanes, auto-fit boundaries.",
          "source": "skills/rui-reports/diagram/references/design-system.md"
        },
        {
          "name": "open-quality-rubric",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/diagram/references/quality-rubric.md'",
          "description": "Publish gate — line weight, label fit, wireframe completeness, swim-lane contrast.",
          "source": "skills/rui-reports/diagram/references/quality-rubric.md"
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
          "question": "Why is diagram the only package-managed code module in rui-reports?",
          "answer": "Because the other 4 sub-skills are static reference bundles (templates / references / rules), while diagram is a real algorithmic generator with non-trivial code paths. It ships its own `package.json` and `vitest` test suite, and is the only entry that has a `package-lock.json` in the catalog.",
          "source": "skills/rui-reports/diagram/SKILL.md"
        },
        {
          "question": "What does the 9×7 grid + Manhattan routing give me?",
          "answer": "It gives you deterministic, retina-clean layout without any hand-tuning. Every coordinate snaps to a 10px intersection; connections bend on grid points; boundaries pad to 18px around their contents; the outermost wireframe wraps every element (components, boundaries, AND legend) with auto-computed padding.",
          "source": "skills/rui-reports/diagram/references/design-system.md"
        },
        {
          "question": "What must I do before I call a diagram publishable?",
          "answer": "Walk the quality rubric: 2px main strokes (never 1px); every label uses `textLength` + `lengthAdjust`; the document order is `defs → grid → arrows → masks → boxes → boundaries → legend`; no empty placeholder sections; every connection has a protocol label; the outermost wireframe wraps the legend.",
          "source": "skills/rui-reports/diagram/references/quality-rubric.md"
        },
        {
          "question": "Can I still scan a codebase to author a diagram?",
          "answer": "The old `--from-codebase` flow and the bundled scan / extract / batch / merge scripts were intentionally removed. The supported path is requirements-driven: write the system brief, then author the diagram from it. Retained source lives under `engine/core/src/` for future replacement work, not for direct use.",
          "source": "skills/rui-reports/diagram/SKILL.md"
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
          "title": "skills/rui-reports/diagram/SKILL.md",
          "href": "../../../../skills/rui-reports/diagram/SKILL.md",
          "description": "Manifest + output contract + 4-file rule and the rationale for the 2px + textLength visual contract.",
          "kind": "doc"
        },
        {
          "title": "references/design-system.md",
          "href": "../../../../skills/rui-reports/diagram/references/design-system.md",
          "description": "Palette, line weight, label fit, swim-lane rules and the visual language shared with deps/shared/diagram.",
          "kind": "doc"
        },
        {
          "title": "references/quality-rubric.md",
          "href": "../../../../skills/rui-reports/diagram/references/quality-rubric.md",
          "description": "Publish gate: line weight, label fit, wireframe completeness, swim-lane contrast.",
          "kind": "doc"
        },
        {
          "title": "engine/core/src/languages/ + frameworks/",
          "href": "../../../../skills/rui-reports/diagram/engine/core/src/languages/index.js",
          "description": "9 language packs + 10 framework configs that fed the analysis engine (retained source).",
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
    datasets: [{ key: "src-rui-reports-diagram", label: "diagram", data: dataset }],
    default: dataset
  };
})();
