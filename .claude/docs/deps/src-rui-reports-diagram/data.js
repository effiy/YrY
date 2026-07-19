window.REPORT_DATA = {
  "meta": {
    "pageTitle": "diagram · algorithmic SVG architecture generator",
    "subtitle": "9×7 grid · orthogonal Manhattan routing · 23 components · 7 swim lanes · 2px strokes · textLength auto-fit",
    "upstream": "rui-reports/diagram",
    "footer": "rui-reports/diagram — sole ESM package in the catalog (package.json + vitest) · self-contained HTML+SVG · no public CDN · rebuilt 2026-07-19"
  },
  "metrics": [
    {
      "label": "Layout",
      "value": "9×7",
      "sub": "grid + Manhattan routing",
      "tone": "cyan"
    },
    {
      "label": "Components",
      "value": "23",
      "sub": "frontend / backend / data / cloud / security / async",
      "tone": "green"
    },
    {
      "label": "Swim lanes",
      "value": "7",
      "sub": "Client → Edge → App → API → Data → Async → Ops",
      "tone": "amber"
    },
    {
      "label": "Languages",
      "value": "9 + 10",
      "sub": "languages + framework configs",
      "tone": "violet"
    },
    {
      "label": "Package",
      "value": "ESM",
      "sub": "package.json + vitest — only one in the catalog",
      "tone": "rose"
    }
  ],
  "summaryCards": [
    {
      "tone": "cyan",
      "title": "What it actually does",
      "items": [
        "Turns a written system brief into a self-contained, dark-themed architecture-diagram HTML page.",
        "Output is 4 files only: `index.html` (DOM + script wiring), `index.css` (layered tokens), `data.js` (diagram content on `window.REPORT_DATA`), `index.js` (Vue 3 app + interactions).",
        "SVG is no longer hand-positioned — every coordinate, boundary, arrow path, and label is computed by the embedded layout engine.",
        "Boundaries auto-size around contained components; arrows route orthogonally with deterministic bend points; the outermost wireframe wraps every element (components, boundaries, AND legend) with auto-computed padding.",
        "Line strokes are 2px for crystal-clear rendering on retina + print; markers are larger; labels use `textLength` + `lengthAdjust` so they fit their slot."
      ]
    },
    {
      "tone": "violet",
      "title": "Grounded evidence",
      "items": [
        "SKILL.md locks the requirements-driven flow: read the 4 template headers, draw in document order (defs → grid → arrows → masks → boxes → boundaries → legend), omit empty sections, give every connection a protocol label.",
        "`templates/data.js` defines the diagram shape (`meta`, `executiveSummary`, `toc`, `metrics`, `svgDiagram`, `summaryCards`, `pipeline`, `securityCards`, `trace`, `scalingTiles`, `ownership`, `apiTable`, `stack`, `schemaTiles`, `roadmap`, `glossary`) and consumes `window.ruiDiagramPrimitives` for the visual language.",
        "`engine/core/src/` keeps the algorithmic generator (graph-builder, normalize-graph, layer-detector, llm-analyzer, tour-generator) and 36 language/framework configs as retained source for future replacement work.",
        "9 language packs (c, cpp, go, java, javascript, python, ruby, rust, typescript) + 10 framework packs (django, express, fastapi, flask, gin, nextjs, rails, react, spring, vue) feed the analysis engine.",
        "Bundled codebase-scan / extraction / batching / merge scripts have been intentionally removed; the skill no longer supports the legacy `--from-codebase` workflow."
      ]
    },
    {
      "tone": "green",
      "title": "How to invoke",
      "items": [
        "`/rui-report-diagram create` — requirements-driven generation, no flags required.",
        "`/rui-report-diagram create --out diagram.html` — write the page to a chosen path (default name still `index.html`).",
        "Author a brief, then copy the bundled template into a working dir; the Vue app reads `window.REPORT_DATA` and renders everything from there.",
        "Output stays self-contained and free of public CDN dependencies — all styles, fonts, and helpers ship with the page.",
        "Design rubric: see `references/quality-rubric.md` (line weight, label fit, wireframe completeness, swim-lane contrast) before publishing."
      ]
    }
  ],
  "anchors": [
    {
      "match": "rui-reports/diagram/SKILL.md",
      "mode": "exact",
      "reason": "manifest + output contract + rules"
    },
    {
      "match": "rui-reports/diagram/templates/",
      "mode": "prefix",
      "reason": "4-file page template (data.js / index.html / index.css / index.js)"
    },
    {
      "match": "rui-reports/diagram/references/design-system.md",
      "mode": "exact",
      "reason": "palette, line weight, text fit, swim-lane rules"
    },
    {
      "match": "rui-reports/diagram/references/quality-rubric.md",
      "mode": "exact",
      "reason": "publishable quality checklist"
    },
    {
      "match": "rui-reports/diagram/engine/core/src/languages/",
      "mode": "prefix",
      "reason": "9 languages + 10 framework configs feeding the engine"
    },
    {
      "match": "rui-reports/diagram/package.json",
      "mode": "exact",
      "reason": "only ESM package in the rui-reports catalog"
    }
  ],
  "links": [
    { "label": "Architecture Dashboard (5 scenes)", "href": "../../arch/index.html" },
    { "label": "deps → src-rui-reports-diagram catalog card", "href": "../src-rui-reports-diagram/index.html" }
  ],
  "notes": [
    "The only package-managed code module in the entire `rui-reports` skill group — has its own `package.json` and `vitest` test suite.",
    "Algorithm: 9×7 grid + orthogonal Manhattan routing. Coordinates snap to a 10px grid; connections bend on grid intersections; boundaries pad to 18px around their contents; outermost wireframe is auto-computed so the legend never overflows.",
    "Document order in the SVG is fixed: `defs → grid → arrows → masks → boxes → boundaries → legend`. Omit empty sections instead of rendering placeholders.",
    "Two upgraded visual rules: main line stroke is 2px (up from 1px) for retina + print clarity, and every label uses `textLength` + `lengthAdjust` to fit its slot — never wrap a label outside its component box.",
    "Visual language is shared with `deps/shared/diagram` (the per-dep page generator) via `window.ruiDiagramPrimitives` — a tweak in `primitives.js` updates both surfaces simultaneously.",
    "Component taxonomy covers frontend, backend, database, cloud, security, message, external, and ops; the most-used security primitives include WAF, IdP, Secrets Manager; common async primitives include Kafka, Redis Cluster, SQS.",
    "The skill used to bundle codebase-scan / extract / batch / merge scripts. Those have been removed — the requirements-driven flow is the only supported authoring path."
  ],
  "diagram": {
    "mode": "catalog",
    "package": {
      "title": "diagram",
      "desc": [
        "algorithmic SVG generator",
        "9×7 grid + Manhattan routing"
      ],
      "stats": [
        "23 components · 7 swim lanes",
        "ESM package · 9 langs + 10 frameworks"
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
        "SKILL.md · output contract",
        "templates/ · 4-file page",
        "design-system.md · visual rules",
        "quality-rubric.md · publish gate",
        "engine/ · retained source"
      ],
      "hint": "5 grounded hints"
    },
    "context": {
      "title": "Main Source Code",
      "sub": "skills/rui-reports"
    },
    "evidence": {
      "title": "Primary evidence",
      "sub": "templates + engine + 9 langs + 10 frameworks",
      "hint": "the only package-managed module"
    },
    "report": {
      "title": "Report page",
      "sub": "docs/deps/src-rui-reports-diagram/index.html",
      "hint": "rebuilt 2026-07-19"
    }
  }
};
