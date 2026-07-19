window.REPORT_DATA = {
  "meta": {
    "pageTitle": "files · static codebase analysis (size · largest · coupling · risk · health)",
    "subtitle": "6 sections · 18 Vue components · hotspot scoring · cycle detection · fan-in/out ranking · self-improvement tree",
    "upstream": "rui-reports/files",
    "footer": "rui-reports/files — archived static reference bundle · templates / references / rules kept for manual assembly or future replacement · rebuilt 2026-07-19"
  },
  "metrics": [
    {
      "label": "Sections",
      "value": "6",
      "sub": "Summary · Size · Largest · Coupling · Risk · Health",
      "tone": "cyan"
    },
    {
      "label": "Vue components",
      "value": "18",
      "sub": "summary + size + largest + coupling + risk + health + self-improvement",
      "tone": "green"
    },
    {
      "label": "Contracts",
      "value": "6",
      "sub": "analysis-contracts.md · byte-stable schema",
      "tone": "amber"
    },
    {
      "label": "Hotspot formula",
      "value": "0.5 / 0.2 / 0.1 / 0.2",
      "sub": "lines / fanIn / fanOut / depth weights",
      "tone": "violet"
    },
    {
      "label": "Script",
      "value": "archived",
      "sub": "one-off analyzer removed; templates retained",
      "tone": "rose"
    }
  ],
  "summaryCards": [
    {
      "tone": "cyan",
      "title": "What it actually does",
      "items": [
        "Analyzes a local codebase across 6 report sections: Summary, Size, Largest, Coupling, Risk, Health.",
        "Builds a per-file inventory (path, bytes, lines, type, lastModified) and aggregates per-directory size, per-type share, and a 0–2000+ line-count histogram.",
        "Builds an import/dependency graph, then derives fan-in, fan-out, depth, cycles, and a transparent `hotspotScore = 0.5·lines/1000 + 0.2·fanIn + 0.1·fanOut + 0.2·depth` per file.",
        "Surfaces coupling via Fan-in / Fan-out tabs, risk via Hotspots / Orphans / Depth tabs, and health via Cycles / Freshness tabs.",
        "Includes a Self-Improvement tree (P0 jumps, remediation groups, and check items) so the report doubles as an action plan."
      ]
    },
    {
      "tone": "violet",
      "title": "Grounded evidence",
      "items": [
        "SKILL.md is now archived — the one-off analyzer entrypoint and CLI command have been removed; `templates/`, `references/`, and `rules/` are kept as source material for manual assembly or future replacement.",
        "`templates/data.js` is a static configuration file: it exposes `window.REPORT_CONFIG` (options, constants, full label set) plus a `window.REPORT_DATA` shape with sections for size, largest, coupling, risk, health, and the self-improvement tree.",
        "18 Vue components under `templates/components/` — `rui-report-summary`, `rui-report-size` (treemap/types/histogram), `rui-report-largest`, `rui-report-coupling` (fan-in/fan-out), `rui-report-risk` (hotspots/orphans/depth), `rui-report-health` (cycles/freshness), `rui-report-self-improvement`, plus shared primitives (finding-card, remediation-*, risk-*, stale-banner, p0-jump, copy-button, back-to-top-link, meta-item, footer-recap-item).",
        "`references/methodology.md` is a 5-stage execution playbook (Inventory → Size → Graph → Depth → Cycle → Freshness) and is the single source of truth for any re-implementation.",
        "`rules/analysis-contracts.md` is the byte-stable data contract — column names, severity thresholds (lines > 1000 Critical, maxDepth > 15 Critical, hotspotScore ≥ 5.0 Critical), and the CSV header are all defined here."
      ]
    },
    {
      "tone": "green",
      "title": "How to invoke",
      "items": [
        "The skill is no longer a runnable entrypoint; the page you are reading is the artifact, regenerated from external workflow scripts.",
        "The 4-file page lives in `docs/files/{index.html,index.css,index.js,data.js}` plus a `components/` subtree and a small `app/` (actions, lifecycle, mount, state).",
        "The `lib/` directory ships `rui-bytes.js` and `rui-sortable.js` as shared formatters used across the 18 components.",
        "Header / footer chrome (breadcrumb, score gauge, tabs, score legend, export) is implemented in `templates/index.js` and styled by `templates/index.css`.",
        "Future replacement: drop a new analyzer into the rules contract; the components will re-render unchanged because the schema is byte-stable."
      ]
    }
  ],
  "anchors": [
    {
      "match": "rui-reports/files/SKILL.md",
      "mode": "exact",
      "reason": "archived status + what remains"
    },
    {
      "match": "rui-reports/files/templates/data.js",
      "mode": "exact",
      "reason": "REPORT_CONFIG + REPORT_DATA shape"
    },
    {
      "match": "rui-reports/files/templates/components/",
      "mode": "prefix",
      "reason": "18 Vue components grouped by section"
    },
    {
      "match": "rui-reports/files/references/methodology.md",
      "mode": "exact",
      "reason": "5-stage execution playbook"
    },
    {
      "match": "rui-reports/files/references/scoring.md",
      "mode": "exact",
      "reason": "hotspot / orphan / depth / freshness formulas"
    },
    {
      "match": "rui-reports/files/rules/analysis-contracts.md",
      "mode": "exact",
      "reason": "byte-stable column + threshold contract"
    }
  ],
  "links": [
    { "label": "Live files report (docs/files)", "href": "../../files/index.html" },
    { "label": "deps → src-rui-reports-files catalog card", "href": "../src-rui-reports-files/index.html" }
  ],
  "notes": [
    "Status: archived static reference bundle — the one-off analyzer script and the CLI command entry have been removed; future report generation must come from an external workflow or a future replacement implementation.",
    "Six sections, in fixed order: Summary → Size → Largest → Coupling → Risk → Health. Each section has its own Vue component under `templates/components/rui-report-<name>/` and renders as a tabbed subview.",
    "Hotspot formula is intentionally transparent: `hotspotScore = 0.5·lines/1000 + 0.2·fanIn + 0.1·fanOut + 0.2·depth`. Threshold ≥ 2.0 enters the Hotspots table; ≥ 5.0 is Critical, 2.0–5.0 is Warning.",
    "Coupling uses two tabs: Fan-in (most-depended-on, change ripples widely) and Fan-out (most-coupled, hardest to isolate). Orphans (fanIn=0 AND fanOut=0) are surfaced under Risk.",
    "Health ships two tabs: Cycles (3-color DFS, suggested fix = drop edge from the cycle's hottest member to its successor) and Freshness (ageDays vs the newest mtime anchor; ≥ 180d is Stale).",
    "Self-Improvement component groups remediation items, displays P0 jumps, and the `is-done` items disable the copy button (`@click.stop` + `disabled` are both required by the design system).",
    "All visible text lives in `templates/data.js` so the Vue layer is a pure renderer — regeneration rewrites only `data.js`."
  ],
  "diagram": {
    "mode": "catalog",
    "package": {
      "title": "files",
      "desc": [
        "6 sections · 18 components",
        "hotspot · cycles · fan-in/out"
      ],
      "stats": [
        "Summary · Size · Largest · Coupling · Risk · Health",
        "analyzer archived · templates retained"
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
        "SKILL.md · archived status",
        "templates/data.js · REPORT_DATA shape",
        "components/ · 18 Vue components",
        "methodology.md · 5-stage playbook",
        "analysis-contracts.md · byte-stable"
      ],
      "hint": "5 grounded hints"
    },
    "context": {
      "title": "Main Source Code",
      "sub": "skills/rui-reports"
    },
    "evidence": {
      "title": "Primary evidence",
      "sub": "18 components + 6 contracts + methodology",
      "hint": "analyzer archived, templates retained"
    },
    "report": {
      "title": "Report page",
      "sub": "docs/deps/src-rui-reports-files/index.html",
      "hint": "rebuilt 2026-07-19"
    }
  }
};
