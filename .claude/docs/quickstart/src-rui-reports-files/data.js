(function () {
  'use strict';

  var dataset = {
  "meta": {
    "title": "Quickstart — files · static codebase analysis (6 sections)",
    "scope": "files",
    "scopeShort": "files",
    "language": "en",
    "depth": 3,
    "generatedAt": "2026-07-19T21:00:00+08:00",
    "timestamp": "2026-07-19",
    "version": 1
  },
  "header": {
    "kind": "Card Quickstart",
    "title": "Quickstart — files · 6 sections · 18 components",
    "tagline": "Static codebase file analysis across 6 sections — Summary, Size, Largest, Coupling, Risk, Health — with hotspot scoring (0.5·lines + 0.2·fanIn + 0.1·fanOut + 0.2·depth), cycle detection, fan-in/out ranking, and a self-improvement remediation tree. Bundled analyzer archived; templates retained.",
    "scope": "files",
    "audience": "Contributors working with the 6-section file report (archived analyzer + retained templates)",
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
      "summary": "files is a docs-home card under \"skills/rui-reports — Report Generators\" in the \"Main Source Code\" section. It is an archived static reference bundle for static codebase file analysis across 6 sections — Summary, Size, Largest, Coupling, Risk, Health — with hotspot scoring (`0.5·lines/1000 + 0.2·fanIn + 0.1·fanOut + 0.2·depth`), 3-color DFS cycle detection, fan-in/out ranking, and a self-improvement remediation tree. The one-off analyzer and CLI command have been removed; `templates/` (18 Vue components), `references/` (methodology, scoring), and `rules/` (analysis-contracts) are retained for manual assembly or a future replacement. Metadata: Sub-skill · 18 components + 6 contracts + 5-stage methodology.",
      "hero": {
        "eyebrow": "skills/rui-reports — files (6 sections, archived)",
        "title": "Map a codebase across 6 report sections in about 6 min",
        "subtitle": "Walk Inventory → Size → Graph → Depth → Cycle → Freshness, then read the 6 sections in fixed order: Summary · Size · Largest · Coupling · Risk · Health.",
        "totalMinutes": 6,
        "cta": "Start walkthrough",
        "ctaHint": "Cmd + Enter marks this card walkthrough as reviewed.",
        "timeStatLabel": "Time to first report",
        "timeCaption": "minutes to first report",
        "scopeStatLabel": "Components",
        "scopeStatSuffix": "components",
        "gapsHint": "Read the byte-stable analysis-contracts.md and the 5-stage methodology.md before changing any threshold.",
        "gaps": [
          {
            "id": "analyzer-archived",
            "label": "analyzer archived",
            "coverage": 70
          },
          {
            "id": "schema-contracts",
            "label": "byte-stable contracts",
            "coverage": 72
          }
        ],
        "steps": [
          {
            "id": "methodology",
            "n": 1,
            "name": "Methodology",
            "minutes": 1,
            "color": "cyan",
            "type": "read",
            "ref": "skills/rui-reports/files/references/methodology.md",
            "outcome": "Read the 5-stage playbook: Inventory → Size → Graph → Depth → Cycle → Freshness."
          },
          {
            "id": "schema",
            "n": 2,
            "name": "Schema",
            "minutes": 2,
            "color": "accent",
            "type": "read",
            "ref": "skills/rui-reports/files/rules/analysis-contracts.md",
            "outcome": "Lock in the column names, severity thresholds (lines > 1000 Critical, maxDepth > 15 Critical, hotspotScore ≥ 5.0 Critical), and the CSV header."
          },
          {
            "id": "components",
            "n": 3,
            "name": "Components",
            "minutes": 2,
            "color": "pass",
            "type": "read",
            "ref": "skills/rui-reports/files/templates/components/",
            "outcome": "Confirm the 18 Vue components map to the 6 sections (summary + size + largest + coupling + risk + health + self-improvement + shared primitives)."
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
            "top": "src-rui-reports-files",
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
                "name": "files",
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
                "name": "quickstart/src-rui-reports-files",
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
          "value": "6",
          "suffix": "sections",
          "label": "fixed order",
          "accent": "accent",
          "blurb": "Summary → Size → Largest → Coupling → Risk → Health, emitted in fixed order; each backed by a Vue component."
        },
        {
          "value": "18",
          "suffix": "components",
          "label": "Vue toolkit",
          "accent": "cyan",
          "blurb": "summary + size + largest + coupling + risk + health + self-improvement + 11 shared primitives (finding-card, copy-button, …)."
        },
        {
          "value": "0.5 / 0.2 / 0.1 / 0.2",
          "suffix": "weights",
          "label": "hotspot formula",
          "accent": "pass",
          "blurb": "hotspotScore = 0.5·lines/1000 + 0.2·fanIn + 0.1·fanOut + 0.2·depth; ≥ 5.0 Critical, 2.0–5.0 Warning."
        }
      ],
      "whatYoullShip": [
        {
          "tag": "report",
          "title": "6-section HTML report",
          "body": "A page under `docs/files/` rendering Summary, Size, Largest, Coupling, Risk, and Health as tabbed sub-views."
        },
        {
          "tag": "graph",
          "title": "Import-graph + cycles",
          "body": "An import/dependency graph with fan-in / fan-out ranking, depth, and a 3-color DFS cycle list with a suggested fix per cycle."
        },
        {
          "tag": "self-improvement",
          "title": "Remediation tree",
          "body": "P0 jumps + grouped remediation items; `is-done` items disable the copy button (`@click.stop` + `disabled` required)."
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
          "value": "files"
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
          "name": "files",
          "role": "card",
          "description": "Static codebase file analysis across 6 sections (Summary · Size · Largest · Coupling · Risk · Health) with hotspot scoring + 3-color DFS cycles + self-improvement tree; analyzer archived, templates retained.",
          "file": "skills/rui-reports/files/SKILL.md",
          "line": 1
        },
        {
          "name": "templates/ (4 files + 18 components)",
          "role": "template",
          "description": "Page template + 18 Vue components: 6 section components + self-improvement + 11 shared primitives (finding-card, remediation-*, risk-*, copy-button, …).",
          "file": "skills/rui-reports/files/templates/data.js",
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
          "name": "methodology.md",
          "role": "playbook",
          "description": "5-stage execution playbook: Inventory → Size → Graph → Depth → Cycle → Freshness — the single source of truth for any re-implementation.",
          "file": "skills/rui-reports/files/references/methodology.md",
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
      "tree": ".claude/\n├── docs/index.html\n├── docs/quickstart/\n│   ├── index.html\n│   └── src-rui-reports-files/index.html",
      "annotations": [
        {
          "path": "docs/index.html",
          "note": "Homepage card rendering and entry point for this quickstart."
        },
        {
          "path": "docs/quickstart/src-rui-reports-files/index.html",
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
          "action": "Read the archived SKILL.md and confirm the analyzer status before editing.",
          "outcome": "You know templates/, references/, and rules/ are retained; the one-off analyzer and CLI command have been removed.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/SKILL.md'"
        },
        {
          "order": 2,
          "type": "read",
          "minutes": 2,
          "action": "Open methodology.md and lock the 5-stage playbook: Inventory → Size → Graph → Depth → Cycle → Freshness.",
          "outcome": "You can name the byte-stable columns, severity thresholds, and the hotspot formula before re-implementing.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/references/methodology.md'"
        },
        {
          "order": 3,
          "type": "run",
          "minutes": 2,
          "action": "Map the 6 sections (Summary · Size · Largest · Coupling · Risk · Health) to the 18 Vue components.",
          "outcome": "You can regenerate docs/files/ by editing only data.js — components re-render unchanged because the schema is byte-stable.",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/templates/components/'"
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
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/SKILL.md'",
          "description": "Read the archived SKILL.md to confirm analyzer status and what is retained.",
          "source": "skills/rui-reports/files/SKILL.md"
        },
        {
          "name": "open-methodology",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/references/methodology.md'",
          "description": "Open the 5-stage playbook: Inventory → Size → Graph → Depth → Cycle → Freshness.",
          "source": "skills/rui-reports/files/references/methodology.md"
        },
        {
          "name": "open-contracts",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/rules/analysis-contracts.md'",
          "description": "Byte-stable payload: columns, severity thresholds, CSV header — the contract for any re-implementation.",
          "source": "skills/rui-reports/files/rules/analysis-contracts.md"
        },
        {
          "name": "open-scoring",
          "command": "open '/Users/yi/YrY/.claude/skills/rui-reports/files/references/scoring.md'",
          "description": "Hotspot / orphan / depth / freshness formulas and the thresholds that promote a finding from Warning to Critical.",
          "source": "skills/rui-reports/files/references/scoring.md"
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
          "question": "Why is the analyzer archived but the templates retained?",
          "answer": "The one-off analyzer script and the CLI command entry were removed because the report is now regenerated from external workflow scripts. The 4-file template, 18 Vue components, 5-stage methodology, and byte-stable analysis-contracts are kept so the report page can be re-emitted with new data without rewriting the renderer.",
          "source": "skills/rui-reports/files/SKILL.md"
        },
        {
          "question": "How is the hotspot score computed?",
          "answer": "`hotspotScore = 0.5·lines/1000 + 0.2·fanIn + 0.1·fanOut + 0.2·depth`. Thresholds: ≥ 5.0 Critical, 2.0–5.0 Warning, < 2.0 hidden from the Hotspots tab. The 4 weights sum to 1.0 by design so the score stays on a comparable 0–10 scale.",
          "source": "skills/rui-reports/files/references/scoring.md"
        },
        {
          "question": "What is the difference between the Coupling and Risk tabs?",
          "answer": "Coupling surfaces Fan-in (most-depended-on, change ripples widely) and Fan-out (most-coupled, hardest to isolate). Risk surfaces Hotspots (high score), Orphans (fanIn=0 AND fanOut=0), and Depth (deepest import chain). Both sections share the same import graph but rank files by different signals.",
          "source": "skills/rui-reports/files/references/methodology.md"
        },
        {
          "question": "What does the Self-Improvement section do?",
          "answer": "It groups remediation items, displays P0 jumps, and renders the copy button. Items marked `is-done` disable the copy button (`@click.stop` + `disabled`) per the design-system rule, so a single click never copies stale remediation text.",
          "source": "skills/rui-reports/files/references/methodology.md"
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
          "title": "skills/rui-reports/files/SKILL.md",
          "href": "../../../../skills/rui-reports/files/SKILL.md",
          "description": "Archived status note and what remains (templates + references + rules).",
          "kind": "doc"
        },
        {
          "title": "references/methodology.md",
          "href": "../../../../skills/rui-reports/files/references/methodology.md",
          "description": "5-stage execution playbook — Inventory → Size → Graph → Depth → Cycle → Freshness.",
          "kind": "doc"
        },
        {
          "title": "references/scoring.md",
          "href": "../../../../skills/rui-reports/files/references/scoring.md",
          "description": "Hotspot / orphan / depth / freshness formulas and the Warning/Critical thresholds.",
          "kind": "doc"
        },
        {
          "title": "rules/analysis-contracts.md",
          "href": "../../../../skills/rui-reports/files/rules/analysis-contracts.md",
          "description": "Byte-stable payload: column names, severity thresholds, CSV header.",
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
    datasets: [{ key: "src-rui-reports-files", label: "files", data: dataset }],
    default: dataset
  };
})();
