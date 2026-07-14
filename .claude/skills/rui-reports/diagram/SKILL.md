---
name: rui-report-diagram
description: >
  Create polished dark-themed architecture diagrams as self-contained HTML+SVG files,
  with optional codebase-driven analysis. Use this skill when the user wants to
  create an architecture diagram, system design diagram, or technical overview
  — either from a written description of the system OR from an existing codebase
  (the skill will analyze the code, build a knowledge graph, and render the
  architecture). Also triggers for "draw my system", "show me the architecture",
  "generate diagram from this code", "visualize this codebase", "tech stack diagram".
  Trigger words: architecture diagram, system architecture, technical diagram,
  system design, component diagram, tech diagram, codebase overview, code structure
  diagram, knowledge graph, understand codebase, dark-themed diagram, SVG architecture.
lifecycle: default-pipeline
user_invocable: true
---

# rui-report-diagram

> Architecture diagrams — produce professional dark-themed system diagrams from a written brief or directly from a codebase.

## Quick Start

```
/rui-report-diagram create                          → Diagram from your requirements (default)
/rui-report-diagram create --from-codebase [path]   → Diagram derived from a real codebase
/rui-report-diagram create --full                   → Full codebase analysis (deeper knowledge graph + tour + layers)
/rui-report-diagram create --out diagram.html      → Custom output path
```

## What This Skill Does

- Produces a single self-contained `architecture-diagram.html` file with inline SVG, dark theme, CSS animations, and built-in export (PNG, PDF, clipboard).
- Works in two modes: **from requirements** (you describe the system) or **from a codebase** (the skill scans, builds a knowledge graph, and derives the diagram).
- In `--from-codebase` mode, runs a 7-phase analysis (scan → analyze → assemble → architecture → tour → review → save) and uses the resulting layers + key components as the diagram's structure.
- In `--full` mode, runs every analysis phase including tour generation and LLM graph review.
- Always saves a partial knowledge graph on interruption — a partial diagram is better than none.

## What This Skill Does NOT Do

- Does NOT create UML, sequence, or class diagrams — this is for high-level system architecture overviews.
- Does NOT modify the analyzed codebase. Codebase analysis output lives in `<OUTPUT_DIR>/` (the same directory as the generated `architecture-diagram.html`).
- Does NOT guarantee pixel-perfect accuracy — diagrams reflect the analysis model's interpretation.
- Does NOT require a particular language or framework — quality varies by stack depth.

## Output Contract

The single artifact is `templates/architecture-diagram.html`. Read its header block (placeholders, sections, design rules) before customizing. The contract requires:

- **Header** — title, subtitle, pulsing indicator, export toolbar
- **Main SVG** — drawn in this order: defs → background grid → arrows → opaque masks → component boxes → boundaries → legend
- **Summary cards** — exactly 3 cards, each with a colored dot, title, and 3–5 bullet items
- **Footer** — minimal metadata line

Any section that has no data is omitted entirely. Never write "N/A" or pad with placeholder text.

### Quality Standards

When generating diagrams, ensure:

| Dimension | Standard |
|-----------|----------|
| **Professionalism** | Use clear, descriptive labels; avoid generic names like "Component 1" or "Service A" |
| **Completeness** | Include all major system components, data stores, external services, and infrastructure |
| **Visual hierarchy** | Larger boxes for critical/gateway services (80-130px height); standard boxes for leaf services (50-60px) |
| **Flow clarity** | Every arrow has a label describing the protocol or data type (REST, gRPC, TLS, JWT, WSS) |
| **Boundary usage** | Group related components with security groups (rose dashed) and cloud regions (amber dashed) |
| **Color semantics** | Strictly follow the palette — don't mix colors for the same component type |
| **Legend accuracy** | Only include entries for component types AND line styles actually used in the diagram |
| **Summary depth** | Each card covers a distinct dimension: Architecture overview, Data flow, Infrastructure/Ops |
| **Export readiness** | Include CDN links for html2canvas and jsPDF; test all three export buttons |

## Workflow

```
Requirements mode:  Gather brief → Plan layout → Build SVG → Embed cards → Save
Codebase mode:      Phase 0 Pre-flight → Phase 1 SCAN → Phase 2 ANALYZE
                    → Phase 3 ASSEMBLE → Phase 4 ARCHITECTURE → Phase 5 TOUR (--full only)
                    → Phase 6 REVIEW (inline) → Phase 7 SAVE → Build SVG
```

Key principles:

1. **Read the template header before writing the artifact.** The Section Contract is enforced; don't improvise structure.
2. **Draw arrows first in the SVG document order.** SVGs paint in document order; arrows must render behind boxes.
3. **Use opaque background rects behind semi-transparent boxes.** Prevents arrows from bleeding through transparent fills.
4. **Place legends outside all boundary boxes.** Expand the viewBox if needed; never crop content.
5. **Maintain ≥40px vertical gap between components.** Prevents crowding.
6. **Always save partial knowledge-graph.json on interruption.** Mark `meta.partial = true`.
7. **Report progress at every phase transition** during codebase analysis. Keeps the user informed during long-running operations.
8. **Trust bundled scripts for deterministic work** (file scanning, import extraction, batch merging). Don't reimplement them.
9. **Retry failed subagent dispatches once** before continuing. Balances reliability with execution time.

## Borders

| Boundary | Permission |
|----------|-----------|
| `<skill-path>/**` (this skill) | read-only |
| `<OUTPUT_DIR>/**` (same directory as generated `architecture-diagram.html`) | read + write (codebase mode only) |
| Source code under analysis | read-only |
| `engine/**` (core, dashboard, src, WASM) | read + write (install/build) |
| Output `<output-path>` | read + write |

> `<OUTPUT_DIR>` is the directory containing the generated `architecture-diagram.html` (e.g., when `--out ./diagram.html` is used, `<OUTPUT_DIR>` is `./`). All knowledge-graph, meta, scan-result, intermediate, and tmp files are colocated with the HTML output.

## Rules

| # | Rule | Rationale |
|---|------|-----------|
| 1 | Read the template's header block before producing the artifact | The Section Contract and placeholder list are documented there |
| 2 | Output is a single self-contained HTML file | No external stylesheets or scripts (CDN for export lib is OK) |
| 3 | SVG document order: defs → grid → arrows → masks → boxes → boundaries → legend | Ensures correct z-stacking without z-index hacks |
| 4 | Each component box needs an opaque background rect (`fill="#0f172a"`) | Semi-transparent fills otherwise let arrows bleed through |
| 5 | Place legend outside all boundary boxes; expand viewBox if needed | Avoids visual clutter and overlap; minimum 20px clearance |
| 6 | Maintain ≥40px vertical gap between components | Prevents crowding in dense diagrams |
| 7 | Save partial knowledge graph on interruption with `meta.partial = true` | A partial graph is better than no graph |
| 8 | Trust bundled scripts for scanning, import extraction, batch merging | Determinism, language coverage, and concurrency safety |
| 9 | Use consistent node/edge ID conventions across all phases | Enables correct merging and incremental updates |
| 10 | Report progress at every phase transition | Keeps the user informed during long-running operations |
| 11 | Generate a deterministic layout for repeated runs | Same input → same diagram; aids diff-review |
| 12 | Use distinct colored arrow markers per connection type | Visually distinguishes sync (solid), async (dashed), auth (dotted), infra (long dash) |
| 13 | Add gradient definitions in `<defs>` for large boundary/region fills | Smooths the visual transition and avoids harsh solid- color blocks |
| 14 | Label every arrow with protocol/type (REST, gRPC, TLS, JWT, WSS, SMTP) | Makes the diagram self-documenting without needing external reference |
| 15 | Include line-style entries in the legend | Users need to decode dashed vs dotted vs solid arrow semantics |

## Commands

- [create.md](./commands/create.md) — Create a polished architecture diagram (the single command, supports requirements or codebase modes).

## Supporting Resources

- [agents/](./agents/) — Subagent instructions for codebase analysis phases:
  - `project-scanner.md` — file inventory + language/framework detection
  - `file-analyzer.md` — batch file analysis → nodes + edges
  - `assemble-reviewer.md` — semantic review of merged batches
  - `architecture-analyzer.md` — derives architectural layers from the graph
  - `tour-builder.md` — designs guided learning tour (`--full` only)
  - `graph-reviewer.md` — validates the final knowledge graph
- [templates/architecture-diagram.html](./templates/architecture-diagram.html) — the only template; the single self-contained HTML artifact.
- [references/knowledge-graph-schema.md](./references/knowledge-graph-schema.md) — full node/edge schema (16 node types, 29 edge types) including domain graph extension for business-domain modeling.
- [references/design-system.md](./references/design-system.md) — diagram design system: color palette, typography, spacing, layout patterns.
- [references/templates-index.md](./references/templates-index.md) — catalog of all output templates.
- [references/quality-rubric.md](./references/quality-rubric.md) — self-assessment rubric for diagram quality: 5 dimensions, scoring guide, pass threshold.
- [scripts/](./scripts/) — analysis & merge scripts (scanning, extraction, batching, fingerprinting, merging).
- [engine/](./engine/) — self-contained engine: core (parsing), dashboard (UI), TS helpers, WASM.

## Advanced Diagram Techniques

When generating diagrams, apply these techniques for professional-quality output:

### 1. Curved Connection Routing
For complex flows that must route around other components, use SVG `<path>` with bezier curves:
```svg
<path d="M x1 y1 L xCtrl y1 Q xCtrl yCtrl xCtrl yCtrl L x2 y2" fill="none" .../>
```
Use `Q` (quadratic bezier) for single bends; `C` (cubic) for S-curves.

### 2. Multi-Section Legends
A legend should have two sections: component types (colored swatches) and line styles (sample strokes). Arrange each section in 2-3 columns for compactness.

### 3. Component Nesting
- Security groups can nest inside region boundaries
- Components can nest inside security groups
- Never overlap two security groups or two region boundaries
- Draw outer elements first in SVG document order

### 4. Gradient Fills
Add `<linearGradient>` definitions in `<defs>` for large boundaries and gateway components. Diagonal gradient (`x1="0" y1="0" x2="1" y2="1"`) with opacity stops provides subtle depth.

### 5. Dynamic viewBox
Calculate viewBox from actual content bounds:
- width = max(rightmost-x + rightmost-width) + 40px
- height = max(bottommost-y + bottommost-height) + legend-height + 60px

### 6. Grid Alignment
Snap component positions to 20px grid increments for clean alignment and simpler arrow routing.

### 7. Interactive Diagram Features
The template includes built-in interactivity (no extra code needed):
- **Hover**: hovering over any component highlights it and its connected arrows, dimming everything else
- **Click to focus**: clicking a component locks the focus — the floating bar shows the component name with a Reset button
- **Escape / background click**: resets focus and clears all highlights
- **Arrow indexing**: arrows are automatically associated with their source/target components by endpoint proximity

These features work dynamically — they scan the SVG DOM at load time, so they apply to ANY diagram generated from the template without requiring special markup.

## Fallback

| Situation | Behavior |
|-----------|----------|
| User has not provided a brief | Ask 3–5 clarifying questions: components, flows, boundaries, detail level |
| User asks for codebase mode but no path given | Default to current working directory; respect git worktree redirect |
| Subagent dispatch fails during codebase analysis | Retry once; if it fails again, skip and continue with remaining batches |
| No `knowledge-graph.json` exists in `<OUTPUT_DIR>/` for `--from-codebase` | Run full analysis from scratch; offer `--full` for deeper graph |
| Bundled `scan-project.mjs` exits non-zero | Read stderr, diagnose, retry up to 2 times; do NOT ad-hoc reimplement scanning |
| Diagram layout overflows viewBox | Expand viewBox dynamically based on computed layout; never crop content |
| Output template has no matching section for the data | Omit the section entirely — never write "N/A" or pad with placeholder text |
| User wants something other than an architecture diagram (UML, sequence, ER) | Politely decline; recommend a dedicated tool |
| Generated diagram has >15 components | Merge small leaf nodes into composite boxes; use bullet lists for sub-components |
| Arrow count exceeds 25 | Group related flows; consider using a message bus connector to reduce point-to-point arrows |
| Legend overflows viewBox | Move legend to a second row or reduce font size to 8px |
| Export buttons fail (missing CDN) | Verify html2canvas and jsPDF CDN script tags are present in the HTML |
