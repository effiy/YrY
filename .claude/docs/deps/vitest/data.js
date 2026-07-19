window.REPORT_DATA = {
  "meta": {
    "title": "vitest dependency footprint",
    "pageTitle": "vitest · Skills Dependency Report",
    "subtitle": "Dev dependency · ^3.1.0 · 35 hit files across /Users/yi/YrY/.claude/skills",
    "footer": "Generated for .claude/docs/deps/vitest/index.html · package vitest · 35 hit files · 7 skill roots",
    "traceSub": "Static inventory of manifest declarations, code imports, documentation mentions, and downstream dashboard links."
  },
  "executiveSummary": [
    {
      "color": "cyan",
      "title": "What This Package Does",
      "content": "Vite-native test runner · ESM + watch + coverage"
    },
    {
      "color": "green",
      "title": "Where It Lands",
      "content": "Top consumer skill: rui-test. Consumer count: 7."
    },
    {
      "color": "amber",
      "title": "Why Review It",
      "content": "Manifest + lockfile control runtime drift; review import sites before upgrading."
    }
  ],
  "toc": [
    {
      "href": "#metrics",
      "icon": "📊",
      "label": "Metrics"
    },
    {
      "href": "#diagram",
      "icon": "🗺️",
      "label": "Footprint Map"
    },
    {
      "href": "#summary",
      "icon": "🧾",
      "label": "Summary"
    },
    {
      "href": "#pipeline",
      "icon": "🔄",
      "label": "Lifecycle"
    },
    {
      "href": "#trace",
      "icon": "🔍",
      "label": "Trace"
    },
    {
      "href": "#ownership",
      "icon": "👥",
      "label": "Ownership"
    },
    {
      "href": "#stack",
      "icon": "🧰",
      "label": "Stack"
    },
    {
      "href": "#roadmap",
      "icon": "🔮",
      "label": "Roadmap"
    }
  ],
  "metrics": [
    {
      "label": "Version",
      "status": "green",
      "value": "^3.1.0",
      "valueClass": "green",
      "sub": "Dev dependency"
    },
    {
      "label": "Skill Roots",
      "status": "cyan",
      "value": "7",
      "valueClass": "cyan",
      "sub": "top rui-test"
    },
    {
      "label": "Direct Imports",
      "status": "violet",
      "value": "19",
      "valueClass": "violet",
      "sub": "quoted package references"
    },
    {
      "label": "Total Hits",
      "status": "amber",
      "value": "35",
      "valueClass": "amber",
      "sub": "code + docs + metadata files"
    },
    {
      "label": "Manifest Files",
      "status": "green",
      "value": "1",
      "valueClass": "green",
      "sub": "declared locally"
    }
  ],
  "svgDiagram": "<svg viewBox=\"0 0 1120 680\" role=\"img\" aria-labelledby=\"diagram-title diagram-desc\" xmlns=\"http://www.w3.org/2000/svg\"><title id=\"diagram-title\">vitest dependency footprint</title><desc id=\"diagram-desc\">Dependency footprint report for vitest across the .claude skills catalog.</desc><defs><marker id=\"arrow-cyan\" markerWidth=\"8\" markerHeight=\"6\" refX=\"7\" refY=\"3\" orient=\"auto\"><polygon points=\"0 0, 8 3, 0 6\" fill=\"#22d3ee\"/></marker><marker id=\"arrow-green\" markerWidth=\"8\" markerHeight=\"6\" refX=\"7\" refY=\"3\" orient=\"auto\"><polygon points=\"0 0, 8 3, 0 6\" fill=\"#34d399\"/></marker><marker id=\"arrow-violet\" markerWidth=\"8\" markerHeight=\"6\" refX=\"7\" refY=\"3\" orient=\"auto\"><polygon points=\"0 0, 8 3, 0 6\" fill=\"#a78bfa\"/></marker><marker id=\"arrow-amber\" markerWidth=\"8\" markerHeight=\"6\" refX=\"7\" refY=\"3\" orient=\"auto\"><polygon points=\"0 0, 8 3, 0 6\" fill=\"#fbbf24\"/></marker><pattern id=\"grid\" width=\"32\" height=\"32\" patternUnits=\"userSpaceOnUse\"><path d=\"M 32 0 L 0 0 0 32\" fill=\"none\" stroke=\"#1e293b\" stroke-width=\"0.5\"/></pattern></defs><rect width=\"100%\" height=\"100%\" fill=\"url(#grid)\"/><rect x=\"40\" y=\"40\" width=\"1040\" height=\"520\" rx=\"20\" fill=\"rgba(251, 191, 36, 0.04)\" stroke=\"#fbbf24\" stroke-dasharray=\"8,4\"/><text x=\"60\" y=\"68\" fill=\"#fbbf24\" font-size=\"11\">.claude/skills dependency footprint</text><line x1=\"240\" y1=\"155\" x2=\"360\" y2=\"210\" stroke=\"#22d3ee\" stroke-width=\"1.4\" marker-end=\"url(#arrow-cyan)\"/><text x=\"298\" y=\"172\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">catalog entry</text><line x1=\"240\" y1=\"310\" x2=\"360\" y2=\"290\" stroke=\"#fbbf24\" stroke-width=\"1.4\" marker-end=\"url(#arrow-amber)\"/><text x=\"298\" y=\"302\" fill=\"#fbbf24\" font-size=\"9\" text-anchor=\"middle\">manifest</text><line x1=\"490\" y1=\"340\" x2=\"490\" y2=\"448\" stroke=\"#a78bfa\" stroke-width=\"1.4\" marker-end=\"url(#arrow-violet)\"/><text x=\"504\" y=\"398\" fill=\"#a78bfa\" font-size=\"9\">top files</text><line x1=\"870\" y1=\"400\" x2=\"870\" y2=\"468\" stroke=\"#22d3ee\" stroke-width=\"1.4\" marker-end=\"url(#arrow-cyan)\"/><text x=\"884\" y=\"440\" fill=\"#22d3ee\" font-size=\"9\">report page</text><rect x=\"70\" y=\"110\" width=\"170\" height=\"70\" rx=\"8\" fill=\"rgba(30, 41, 59, 0.45)\" stroke=\"#22d3ee\" stroke-width=\"1.5\"/><text x=\"155\" y=\"138\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">Docs Dashboard</text><text x=\"155\" y=\"156\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">Third-Party card</text><text x=\"155\" y=\"170\" fill=\"#22d3ee\" font-size=\"8\" text-anchor=\"middle\">Dev dependency</text><rect x=\"70\" y=\"270\" width=\"170\" height=\"94\" rx=\"8\" fill=\"rgba(120, 53, 15, 0.3)\" stroke=\"#fbbf24\" stroke-width=\"1.5\"/><text x=\"155\" y=\"296\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">Manifest Source</text><text x=\"155\" y=\"316\" fill=\"#94a3b8\" font-size=\"8\" text-anchor=\"middle\">.claude/skills/</text><text x=\"155\" y=\"328\" fill=\"#94a3b8\" font-size=\"8\" text-anchor=\"middle\">rui-reports/diagram/</text><text x=\"155\" y=\"340\" fill=\"#94a3b8\" font-size=\"8\" text-anchor=\"middle\">package.json</text><text x=\"155\" y=\"356\" fill=\"#fbbf24\" font-size=\"8\" text-anchor=\"middle\">^3.1.0</text><rect x=\"360\" y=\"180\" width=\"260\" height=\"316\" rx=\"12\" fill=\"rgba(6, 78, 59, 0.28)\" stroke=\"#34d399\" stroke-width=\"1.7\"/><text x=\"490\" y=\"214\" fill=\"white\" font-size=\"16\" font-weight=\"700\" text-anchor=\"middle\">vitest</text><text x=\"490\" y=\"230\" fill=\"#94a3b8\" font-size=\"10\" text-anchor=\"middle\">Vite-native test runner</text><text x=\"490\" y=\"250\" fill=\"#94a3b8\" font-size=\"10\" text-anchor=\"middle\">· ESM + watch + coverage</text><text x=\"490\" y=\"268\" fill=\"#34d399\" font-size=\"9\" text-anchor=\"middle\">19 direct import files</text><text x=\"490\" y=\"286\" fill=\"#34d399\" font-size=\"9\" text-anchor=\"middle\">· 35 total hit files · 7 skill roots</text><text x=\"490\" y=\"302\" fill=\"#a78bfa\" font-size=\"8\" text-anchor=\"middle\">Dev dependency declared in manifest</text><rect x=\"760\" y=\"88\" width=\"220\" height=\"62\" rx=\"8\" fill=\"rgba(6, 78, 59, 0.32)\" stroke=\"#34d399\" stroke-width=\"1.5\"/><text x=\"870\" y=\"112\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">rui-test</text><text x=\"870\" y=\"130\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">14 hits</text><line x1=\"620\" y1=\"260\" x2=\"760\" y2=\"119\" stroke=\"#34d399\" stroke-width=\"1.4\" marker-end=\"url(#arrow-green)\"/><rect x=\"760\" y=\"198\" width=\"220\" height=\"62\" rx=\"8\" fill=\"rgba(6, 78, 59, 0.32)\" stroke=\"#34d399\" stroke-width=\"1.5\"/><text x=\"870\" y=\"222\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">rui-reports/diagram</text><text x=\"870\" y=\"240\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">8 hits</text><line x1=\"620\" y1=\"260\" x2=\"760\" y2=\"229\" stroke=\"#34d399\" stroke-width=\"1.4\" marker-end=\"url(#arrow-green)\"/><rect x=\"760\" y=\"308\" width=\"220\" height=\"62\" rx=\"8\" fill=\"rgba(6, 78, 59, 0.32)\" stroke=\"#34d399\" stroke-width=\"1.5\"/><text x=\"870\" y=\"332\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">rui-init</text><text x=\"870\" y=\"350\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">4 hits</text><line x1=\"620\" y1=\"260\" x2=\"760\" y2=\"339\" stroke=\"#34d399\" stroke-width=\"1.4\" marker-end=\"url(#arrow-green)\"/><rect x=\"330\" y=\"468\" width=\"320\" height=\"74\" rx=\"8\" fill=\"rgba(76, 29, 149, 0.28)\" stroke=\"#a78bfa\" stroke-width=\"1.5\"/><text x=\"490\" y=\"494\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">Top File Touchpoints</text><text x=\"490\" y=\"514\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">skills/rui-reports/diagram/pnpm-lock.yaml (36 hits)</text><text x=\"490\" y=\"530\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">skills/rui-test/SKILL.md (18 hits)</text><rect x=\"760\" y=\"500\" width=\"220\" height=\"72\" rx=\"8\" fill=\"rgba(30, 41, 59, 0.45)\" stroke=\"#22d3ee\" stroke-width=\"1.5\"/><text x=\"870\" y=\"528\" fill=\"white\" font-size=\"12\" font-weight=\"600\" text-anchor=\"middle\">Generated Report</text><text x=\"870\" y=\"546\" fill=\"#94a3b8\" font-size=\"9\" text-anchor=\"middle\">docs/deps/{slug}/index.html</text><text x=\"870\" y=\"562\" fill=\"#22d3ee\" font-size=\"8\" text-anchor=\"middle\">linked from docs cards</text></svg>",
  "summaryCards": [
    {
      "color": "cyan",
      "title": "Adoption <span class=\"tile-inline-note\">footprint</span>",
      "items": [
        "Dev dependency in the dashboard catalog with version ^3.1.0.",
        "7 skill roots mention or import this package; top consumer is rui-test.",
        "19 files use the package string directly; 16 more files mention it in docs or metadata."
      ]
    },
    {
      "color": "green",
      "title": "Code <span class=\"tile-inline-note\">touchpoints</span>",
      "items": [
        "skills/rui-reports/diagram/pnpm-lock.yaml is the hottest touchpoint with 36 textual matches.",
        "skills/rui-test/SKILL.md is a secondary touchpoint and should be reviewed when upgrading.",
        ".claude/skills/rui-reports/diagram/package.json remains the source of truth for version drift."
      ]
    },
    {
      "color": "amber",
      "title": "Risk <span class=\"tile-inline-note\">and maintenance</span>",
      "items": [
        "Upgrades should start from the diagram skill manifest and its lockfile to preserve deterministic installs.",
        "Executable usage dominates documentation mentions, so code review should focus on import sites.",
        "Official reference host is vitest.dev; keep the page link aligned with upstream package naming and release history."
      ]
    }
  ],
  "pipeline": [
    {
      "badge": "CATALOG",
      "badgeClass": "cyan",
      "info": "The docs dashboard card defines title, role, version, and upstream reference."
    },
    {
      "badge": "MANIFEST",
      "badgeClass": "amber",
      "info": "1 manifest file(s) declare the package."
    },
    {
      "badge": "USAGE",
      "badgeClass": "green",
      "info": "19 direct import file(s) and 16 reference-only file(s) were found."
    },
    {
      "badge": "REPORT",
      "badgeClass": "violet",
      "info": "The generated dependency page is linked back into the docs dashboard through per-card footer links."
    }
  ],
  "securityCards": [
    {
      "color": "rose",
      "title": "Upgrade Guardrails",
      "items": [
        "Review the package declaration and lockfile together; avoid version drift between package.json and generated docs.",
        "Audit top consumer files before changing major versions; they encode the package contract more reliably than prose.",
        "Prefer small targeted tests around the direct import sites during upgrades."
      ]
    },
    {
      "color": "amber",
      "title": "Supply-Chain Notes",
      "items": [
        "Official reference resolves to vitest.dev.",
        "Pinned or ranged version information comes from the diagram skill package manifest.",
        "Treat docs-only packages as drift candidates during regular dependency review."
      ]
    },
    {
      "color": "cyan",
      "title": "Operational Review",
      "items": [
        "rui-test should be reviewed first because it has the widest footprint for this package.",
        "Primary file hotspot: skills/rui-reports/diagram/pnpm-lock.yaml.",
        "Inventory scan covered 778 text files under .claude/skills."
      ]
    }
  ],
  "trace": [
    {
      "name": "Dashboard",
      "nameClass": "cyan",
      "sub": "docs/data.js card",
      "time": "t0"
    },
    {
      "name": "Manifest",
      "nameClass": "amber",
      "sub": "package.json source",
      "time": "t1"
    },
    {
      "name": "Dependency",
      "nameClass": "green",
      "sub": "vitest",
      "time": "t2"
    },
    {
      "name": "rui-test",
      "nameClass": "violet",
      "sub": "pnpm-lock.yaml",
      "time": "t3"
    },
    {
      "name": "Report",
      "nameClass": "cyan",
      "sub": "deps/vitest/index.html",
      "time": "t4"
    }
  ],
  "scalingTiles": [
    {
      "color": "cyan",
      "title": "Inventory Scope",
      "body": "Scanned <strong>778</strong> text files under <code>.claude/skills</code> for this dependency."
    },
    {
      "color": "green",
      "title": "Consumer Spread",
      "body": "Top spread: <code>rui-test</code> with 14 hit(s)."
    },
    {
      "color": "amber",
      "title": "Drift Signal",
      "body": "Manifest-backed dependency; keep docs and code aligned during upgrades."
    },
    {
      "color": "violet",
      "title": "Review Focus",
      "body": "Start review at <code>skills/rui-reports/diagram/pnpm-lock.yaml</code>."
    }
  ],
  "ownership": {
    "headers": [
      "Skill Root",
      "Hit Files",
      "Primary File",
      "Usage Type"
    ],
    "rows": [
      [
        "<code>rui-test</code>",
        "14",
        "<code>skills/rui-test/SKILL.md</code>",
        "direct import"
      ],
      [
        "<code>rui-reports/diagram</code>",
        "8",
        "<code>skills/rui-reports/diagram/agents/project-scanner.md</code>",
        "direct import"
      ],
      [
        "<code>rui-init</code>",
        "4",
        "<code>skills/rui-init/steps/01-detect/STEP.md</code>",
        "direct import"
      ],
      [
        "<code>rui-reports/test</code>",
        "4",
        "<code>skills/rui-reports/test/evals/evals.json</code>",
        "direct import"
      ],
      [
        "<code>rui-code/chrome</code>",
        "2",
        "<code>skills/rui-code/chrome/SKILL.md</code>",
        "direct import"
      ]
    ]
  },
  "apiTable": {
    "headers": [
      "File",
      "Kind",
      "Hits",
      "Note"
    ],
    "rows": [
      [
        "<code>skills/rui-reports/diagram/pnpm-lock.yaml</code>",
        "code",
        "36",
        "Executable implementation surface"
      ],
      [
        "<code>skills/rui-test/SKILL.md</code>",
        "docs",
        "18",
        "Skill contract or usage guidance"
      ],
      [
        "<code>skills/rui-test/references/index.json</code>",
        "docs",
        "11",
        "Reference or long-form documentation mention"
      ],
      [
        "<code>skills/rui-test/topics/runner-choice/references/best-practices/testing-browser-vs-node-runners.md</code>",
        "docs",
        "10",
        "Reference or long-form documentation mention"
      ],
      [
        "<code>skills/rui-code/vite/references/index.md</code>",
        "docs",
        "9",
        "Reference or long-form documentation mention"
      ],
      [
        "<code>skills/rui-test/topics/vitest-setup/references/best-practices/testing-vitest-recommended-for-vue.md</code>",
        "docs",
        "5",
        "Reference or long-form documentation mention"
      ]
    ]
  },
  "stack": [
    {
      "label": "Package",
      "value": "vitest",
      "valueClass": "green"
    },
    {
      "label": "Version",
      "value": "^3.1.0",
      "valueClass": "cyan"
    },
    {
      "label": "Catalog Class",
      "value": "Dev dependency",
      "valueClass": "amber"
    },
    {
      "label": "Official Host",
      "value": "vitest.dev",
      "valueClass": "violet"
    },
    {
      "label": "Skill Roots",
      "value": "7",
      "valueClass": "green"
    },
    {
      "label": "Direct Imports",
      "value": "19",
      "valueClass": "cyan"
    }
  ],
  "schemaTiles": [
    {
      "title": "Manifest Source",
      "body": ".claude/skills/rui-reports/diagram/package.json"
    },
    {
      "title": "Primary Hotspot",
      "body": "skills/rui-reports/diagram/pnpm-lock.yaml"
    },
    {
      "title": "Consumer Archetype",
      "body": "rui-test"
    },
    {
      "title": "Dashboard Link",
      "body": "docs/deps/vitest/index.html"
    }
  ],
  "roadmap": [
    {
      "tag": "1",
      "tagClass": "cyan",
      "text": "Re-scan after dependency or manifest changes so the dashboard link surface stays current.",
      "textClass": "cyan"
    },
    {
      "tag": "2",
      "tagClass": "amber",
      "text": "Review the top import sites before any version bump.",
      "textClass": "amber"
    },
    {
      "tag": "3",
      "tagClass": "violet",
      "text": "Use the generated page as the canonical drill-down target from the docs dependency card.",
      "textClass": "violet"
    }
  ],
  "glossary": [
    {
      "term": "direct import",
      "termClass": "green",
      "def": "A file that references the package string in executable code or manifest declarations."
    },
    {
      "term": "reference-only",
      "termClass": "amber",
      "def": "A file that mentions the package in documentation, comments, or generated metadata without importing it."
    },
    {
      "term": "skill root",
      "termClass": "cyan",
      "def": "The directory containing a <code>SKILL.md</code> file; used here as the ownership boundary."
    },
    {
      "term": "catalog-only",
      "termClass": "violet",
      "def": "The dependency appears in the docs dashboard but is not declared in the active local package manifest."
    }
  ]
};
