---
name: diagram-create
description: >
  Create a polished dark-themed architecture diagram as a self-contained HTML+SVG
  file. Two modes: from-requirements (default — user describes the system) or
  --from-codebase (analyze a real codebase, build a knowledge graph, and derive
  the diagram from layers and key components).
---

# Architecture Diagram — Create

Create a single self-contained `architecture-diagram.html` file with inline SVG, dark theme, and built-in PNG/PDF/clipboard export.

> **Output contract**: [../../templates/architecture-diagram.html](../../templates/architecture-diagram.html)
> Read the template's header block (placeholders, sections, design rules) before customizing.
> **Design system reference**: [../../references/design-system.md](../../references/design-system.md)
> **Knowledge graph schema (codebase mode)**: [../../references/knowledge-graph-schema.md](../../references/knowledge-graph-schema.md)

## Available Tools

| Tool | Purpose |
|------|---------|
| `Read` | Read the template, knowledge graph, or project files |
| `Write` | Produce the diagram HTML file |
| `Task` (subagent) | Parallel dispatch for codebase-mode analysis phases |
| `RunCommand` | Run bundled scripts (`scan-project.mjs`, `extract-import-map.mjs`, `merge-batch-graphs.py`) |
| `Grep` | Search the knowledge graph for affected nodes |

## Options

- `$ARGUMENTS` may contain:
  - `--from-codebase [path]` — Analyze a real codebase instead of taking a requirements brief. Defaults path to CWD.
  - `--full` — Run the deeper codebase analysis (full scan, all batches, LLM graph review, tour generation). Requires `--from-codebase`.
  - `--out <path>` — Output file path. Defaults to `./architecture-diagram.html` in CWD.
  - `--language <lang>` — Generate all textual content in the specified language (e.g. `zh`, `ja`, `ko`, `en`). Defaults to `en`.
  - `--review` — Run the full `graph-reviewer` agent in codebase mode (default: inline deterministic validation only).
  - `--auto-update` / `--no-auto-update` — Toggle the on-save auto-update hook. In `--from-codebase` mode, when enabled, an in-process hook re-runs the analysis after the user edits source files (no extra commands needed). Disabled by default.

---

## Mode 1 — From Requirements (default)

The user describes the system in natural language. You translate the description into the diagram.

### Step 1: Gather Requirements

If the user has not provided a brief, ask 3–5 targeted questions:

- What system or architecture does the diagram represent?
- What components are involved? (frontends, backends, databases, cloud services, message buses, security components)
- How do components connect? (data flows, auth flows, API calls)
- Any specific boundaries? (AWS regions, VPCs, security groups)
- What level of detail? (high-level overview vs. detailed component view)

If the brief is already detailed enough, skip the questions and proceed.

### Step 2: Plan the Layout

Sketch the layout mentally before writing SVG. Use the **Hybrid (Cloud-Native)** pattern as the default for production systems:

```
┌──────────────────────────────────────────────────────┐
│ AWS Region: us-east-1                                │
│ ┌──────────┐  ┌────────────────────────────────────┐│
│ │ CI/CD    │  │ Edge → WAF → ALB → API Gateway      ││
│ │ (left    │  │                                     ││
│ │  column) │  │ ┌──────────┐ ┌──────────┐          ││
│ │          │  │ │ Auth Svc  │ │ Services │          ││
│ │ GitHub   │  │ │ (security │ │ User     │          ││
│ │ Actions  │  │ │  group)   │ │ Order    │          ││
│ │ → ECR    │  │ │           │ │ Payment  │          ││
│ │          │  │ └──────────┘ └──────────┘          ││
│ │ S3       │  │                                     ││
│ │ buckets  │  │ ┌──────────────────────────────┐    ││
│ │          │  │ │ Data Layer (Redis + PG + Kafka)│   ││
│ └──────────┘  │ └──────────────────────────────┘    ││
│               │                                     ││
│               │ External: SendGrid, Stripe           ││
│               └────────────────────────────────────┘│
│                                    ┌──────────────┐  │
│                                    │ Observability│  │
│                                    │ (right col)  │  │
│                                    └──────────────┘  │
└──────────────────────────────────────────────────────┘
Legend (below region)
```

Key layout decisions:
- **Group related components** into regions or clusters (security groups, VPCs, cloud regions)
- **Flow direction**: entry at left/top → processing in center → storage at bottom → external at bottom-right
- **Assign semantic colors** per component type — see [design-system.md](../../references/design-system.md)
- **Calculate positions** with ≥40px vertical gaps, ≥20px horizontal gaps
- **Plan the SVG document order**: arrows → opaque masks → component boxes → boundaries → legend
- **Size hierarchy**: gateways 80-130px tall, standard services 50-60px, message buses 20-30px

### Step 3: Build the Diagram

Copy the template from `templates/architecture-diagram.html` and customize. The template header documents all placeholders, sections, and design rules — **read it before writing any code**.

#### 3.1 — Header & Metadata
- Replace `<title>`, `h1`, and subtitle with specific, descriptive text
- Set the SVG `viewBox` — start at `0 0 1200 800`, expand based on actual content
- Pro tip: calculate viewBox = max(all x+w) + 40, max(all y+h) + legend_height + 60

#### 3.2 — Arrow Markers (in `<defs>`)
Define one `<marker>` per arrow color used. Minimum set for a production diagram:
```svg
<marker id="arrow-cyan" ... fill="#22d3ee"/>     <!-- frontend/CDN traffic -->
<marker id="arrow-emerald" ... fill="#34d399"/>   <!-- sync service calls -->
<marker id="arrow-violet" ... fill="#a78bfa"/>    <!-- data read/write -->
<marker id="arrow-amber" ... fill="#fbbf24"/>     <!-- infra/deploy -->
<marker id="arrow-rose" ... fill="#fb7185"/>      <!-- auth flows -->
<marker id="arrow-orange" ... fill="#fb923c"/>    <!-- async/pub-sub -->
<marker id="arrow-slate" ... fill="#64748b"/>     <!-- telemetry/external -->
```

#### 3.3 — Connection Arrows (drawn FIRST)
For each connection between components:
1. Draw the `<line>` or `<path>` element with the correct `marker-end` and `stroke-dasharray`
2. Add a `<text>` label adjacent to the line describing the protocol or data type
3. Solid lines (`stroke-dasharray` none) = synchronous, dashed = async, dotted = auth

Arrow label conventions:
- **Protocols**: REST, gRPC, GraphQL, WSS, SMTP, HTTPS/TLS
- **Auth**: JWT, OAuth2, OIDC, PKCE, mTLS
- **Async**: publish, consume, events
- **Infra**: deploy, push, provision, trigger
- **Data**: R/W, TLS, read, write

#### 3.4 — Opaque Masks (drawn SECOND)
For EVERY component box, add a preceding `<rect>` with `fill="#0f172a"` at the exact same position and dimensions. This prevents arrows from bleeding through semi-transparent fills. Match the `rx` value to the component's `rx`.

#### 3.5 — Component Boxes (drawn THIRD)
For each component:
1. Main `<rect>` with type-appropriate fill/stroke from the design system palette
2. Primary `<text>` label: 11-12px bold, centered, placed at `y + height/2 - 8`
3. Secondary `<text>` label: 9px, centered, placed at `y + height/2 + 8`
4. For complex components (gateways, DB clusters): add bullet `<text>` lines at 8px
5. For multi-line components: use 7px footer annotation in the stroke color

Component sizing reference:
| Type | Width | Height | rx |
|------|-------|--------|----|
| Standard service | 100px | 50px | 6 |
| Gateway | 100px | 80-130px | 8 |
| DB cluster | 160-200px | 40px | 8 |
| Message bus | 120-200px | 20-30px | 4 |
| External API | 100-120px | 50px | 6 |
| Observability | 100px | 140-180px | 8 |

#### 3.6 — Boundaries (drawn FOURTH)
- **Security groups**: dashed rose (`stroke-dasharray="4,4"`), 12px padding around enclosed components
- **Region boundaries**: dashed amber (`stroke-dasharray="8,4"`), 20px padding, 0.04-alpha fill
- Draw outermost boundaries first, then inner boundaries
- Labels at top-left inside each boundary

#### 3.7 — Legend (drawn FIFTH, outside all boundaries)
Two-section legend:
1. **Component types**: colored swatches (`18×12` rects with `rx="3"`) + labels, 2-3 columns
2. **Line styles**: ~50px sample strokes + labels, 2 columns
Place at least 20px below the lowest boundary. Use 9px font for labels.

#### 3.8 — Summary Cards
Exactly 3 cards, each covering a distinct dimension:
1. **Architecture Overview** — system design, component roles, key patterns
2. **Data Flow & Communication** — protocols, data movement, async/sync patterns
3. **Infrastructure & Observability** — deployment, monitoring, CI/CD, scaling

Each card: 3-5 bullet items using full, technically precise sentences. Include specific technologies, protocols, and configurations.

#### 3.9 — Footer
Format: `<Project Name> • <Region/Platform> • <Primary Stack> • <Date>`

### Step 4: Pre-Delivery Checklist

Before saving, verify these 10 points:

| # | Check | How to verify |
|---|-------|---------------|
| 1 | No `[...]` sentinel placeholders remain | Grep for `[A-Z]` in the output |
| 2 | Exactly 3 summary cards, each with 3-5 items | Count `.card` and `li` elements |
| 3 | SVG paint order correct | Visual check: defs→grid→arrows→masks→boxes→boundaries→legend |
| 4 | Every component has an opaque mask rect | Count masks = count components |
| 5 | All arrows have protocol/type labels | Each `<line>`/`<path>` has adjacent `<text>` |
| 6 | Legend only includes actually-used types | Match legend entries to component types in diagram |
| 7 | Line style legend matches arrow styles used | Count distinct dash patterns → 1 legend entry each |
| 8 | viewBox accommodates all content | Rightmost x+w < viewBox width; bottommost y+h + legend < viewBox height |
| 9 | CDN scripts present for export | html2canvas + jsPDF script tags exist |
| 10 | No placeholder or generic text | "Card Title", "Item one", "Component N" should not appear |

### Step 5: Deliver

Save as a single self-contained `.html` file. The user can open it directly in any browser. The built-in export toolbar (three-dot menu in header) supports:
- **📋 Copy** — high-DPI PNG to clipboard (via `html2canvas` + Clipboard API)
- **🖼️ PNG** — download as PNG at 2x resolution
- **📄 PDF** — download as PDF with auto-orientation

Report to the user: output path, component count, arrow count, and a one-line architecture summary.

---

## Mode 2 — From Codebase (`--from-codebase`)

Analyze a real codebase, build a knowledge graph, then derive the architecture diagram from the resulting layers and key components.

### Step 0: Pre-flight

1. **Resolve PROJECT_ROOT** from `$ARGUMENTS` or current working directory. Handle git worktree redirect.
2. **Ensure the engine is built** — run `pnpm install && pnpm --filter @rui-report-diagram/core build` from the skill directory if needed.
3. **Resolve OUTPUT_DIR** — the directory containing the generated `architecture-diagram.html` (defaults to CWD; honors `--out <path>` by using its parent directory). All data files (knowledge-graph.json, meta.json, scan-result.json, intermediate/, tmp/) are colocated in this directory.
4. Get the current git commit hash: `git rev-parse HEAD`
5. Create intermediate directories: `<OUTPUT_DIR>/intermediate/` and `<OUTPUT_DIR>/tmp/`
6. Check for an existing `<OUTPUT_DIR>/knowledge-graph.json` — if present, offer incremental mode; otherwise run full analysis.

### Step 1: SCAN

Dispatch a subagent using [../../agents/project-scanner.md](../../agents/project-scanner.md). It produces `intermediate/scan-result.json` with file inventory, language detection, and the import map.

### Step 2: ANALYZE

Load `intermediate/batches.json`. Dispatch subagents using [../../agents/file-analyzer.md](../../agents/file-analyzer.md) in parallel (up to 5 concurrent).

After batches complete, merge:
```bash
python <SKILL_DIR>/scripts/merge-batch-graphs.py $PROJECT_ROOT $OUTPUT_DIR
```

### Step 3: ASSEMBLE REVIEW

Dispatch a subagent using [../../agents/assemble-reviewer.md](../../agents/assemble-reviewer.md) to verify the merged graph and recover anything the script dropped.

### Step 4: ARCHITECTURE

Dispatch a subagent using [../../agents/architecture-analyzer.md](../../agents/architecture-analyzer.md) to derive architectural layers from the graph.

The layer assignments become the diagram's primary structure (one region per layer, or one row per layer for layered systems).

### Step 5: TOUR (only with `--full`)

Dispatch a subagent using [../../agents/tour-builder.md](../../agents/tour-builder.md) to design a 5–15 step guided tour. Tour steps inform the summary cards.

### Step 6: REVIEW

Validate the knowledge graph:
- **Default (inline)**: run the schema checks in-process against `schemaVersion`, node IDs, required fields, and edge consistency.
- **With `--review`**: dispatch a subagent using [../../agents/graph-reviewer.md](../../agents/graph-reviewer.md) for LLM-based semantic review.

### Step 7: SAVE

1. Write final knowledge graph to `<OUTPUT_DIR>/knowledge-graph.json` with `meta.partial` flag reflecting completeness.
2. Write metadata to `<OUTPUT_DIR>/meta.json`.
3. Generate structural fingerprints baseline (incremental update support).
4. Clean up intermediate files (preserve `scan-result.json`).
5. Report summary to user.

### Step 8: Derive the Diagram from the Graph

Translate the knowledge graph into a `templates/architecture-diagram.html` instance:

- **One region per layer** (architecture-analyzer's output). Use distinct colors per layer; the layer color drives the fill of the region boundary.
- **One component box per "service-level" node** in the graph (priority: `service` → `endpoint` → `file` → `schema` → `table` → `resource` → `config`). Filter to keep the diagram readable (5–12 components typical; merge small leaf nodes).
- **Arrows from edges**: use `imports`, `calls`, `reads_from`, `writes_to`, `depends_on` for solid arrows; use `subscribes`, `publishes`, `middleware` for dashed/dotted arrows; use `deploys`, `provisions`, `triggers` for amber.
- **Boundaries**: detect from graph topology — multiple `service` nodes referenced by a `pipeline` → deployment region; multiple `file` nodes inside a security context → security group.
- **Legend**: one entry per (component type, color) pair actually used.
- **Summary cards**: pull from the top 3 layers' descriptions; the tour steps (if any) become the third card's bullets.

This is "Mode 1" with the brief already filled in by the knowledge graph — the rest of the build (Step 3, 4) is identical.

---

## Progress Reporting

Report progress at each phase transition and during batch processing:
- **Phase transitions:** `[Phase N/7] <phase name>...`
- **Batch progress:** `Analyzing batch X/N (files: foo.ts, bar.ts, ...)`
- **Phase completion:** `Phase N complete. <one-line summary>`

## Error Handling

- If any subagent dispatch fails, retry once
- Track all warnings in `$PHASE_WARNINGS`
- ALWAYS save partial results — a partial knowledge graph + partial diagram is better than nothing
- Never silently drop errors

## Node & Edge Types (codebase mode)

See [../../references/knowledge-graph-schema.md](../../references/knowledge-graph-schema.md) for the complete schema: 13 node types and 26 edge types across structural, behavioral, data flow, dependencies, semantic, infrastructure, and schema/data categories.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User has not provided a brief (Mode 1) | Ask 3–5 clarifying questions; do NOT improvise structure |
| User passes `--from-codebase` without a path | Default to CWD; respect git worktree redirect |
| Subagent dispatch fails | Retry once; if it fails again, skip and continue with remaining batches |
| Bundled script exits non-zero | Read stderr, diagnose, retry up to 2 times; never reimplement |
| Existing `knowledge-graph.json` found in incremental mode | Skip unchanged files based on fingerprints; merge new data |
| Diagram layout overflows viewBox | Expand viewBox dynamically; never crop content |
| Output template has no matching section | Omit section entirely — never write "N/A" |
