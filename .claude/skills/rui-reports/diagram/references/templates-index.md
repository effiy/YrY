# Output Templates — Index

> The `rui-report-diagram` skill produces a self-contained architecture-diagram page. The rendered artifact is **one** browser-viewable HTML; its **sources** are a 4-file split under `templates/`. The knowledge graph (`knowledge-graph.json`) is an intermediate data structure used to derive the diagram in `--from-codebase` mode — it is not a user-facing template.

## Templates

| Template | Format | Purpose | Produced by | Storage |
|----------|--------|---------|-------------|---------|
| [templates/index.html](../templates/index.html) | HTML (entry point) | DOM skeleton, script wiring, inline favicon | `/rui-report-diagram create` | Stays in the skill directory |
| [templates/index.css](../templates/index.css) | CSS (layered) | Reset → tokens → base → layout → components → utilities → responsive → print | `/rui-report-diagram create` | Stays in the skill directory |
| [templates/data.js](../templates/data.js) | JS (data) | Pure data: `meta`, `svgDiagram` SVG markup string, all section arrays, exposed as `window.REPORT_DATA` | `/rui-report-diagram create` | Stays in the skill directory |
| [templates/index.js](../templates/index.js) | JS (runtime) | Vue 3 app, `useSvgInteractions` composable, `useExport` composable | `/rui-report-diagram create` | Stays in the skill directory |
| `<OUTPUT_DIR>/index.html` | self-contained HTML+SVG | **Rendered artifact** (the user-facing deliverable) | `/rui-report-diagram create` | user-specified path (default `./index.html`) |

> The 4 `templates/` files together compose the rendered artifact. To customize the page, edit the appropriate file by responsibility (see SKILL.md **Output Contract** for the header-block map). The rendered HTML is what the user opens in a browser; the 4 sources are checked into the skill.

## Intermediate Data

> `<OUTPUT_DIR>` is the directory containing the generated `index.html` (i.e., the parent directory of the `--out` path, or `./` by default). All intermediate data is colocated with the HTML output — no separate `analysis/` or hidden state directory is created in the analyzed project.

| File | Format | Produced by | Storage |
|------|--------|-------------|---------|
| `knowledge-graph.json` | JSON | `create --from-codebase` analysis pipeline | `<OUTPUT_DIR>/knowledge-graph.json` |
| `meta.json` | JSON | `create --from-codebase` analysis pipeline | `<OUTPUT_DIR>/meta.json` |
| `scan-result.json` | JSON | `create --from-codebase` Phase 1 (SCAN) | `<OUTPUT_DIR>/intermediate/scan-result.json` |
| `batches.json` | JSON | `create --from-codebase` Phase 2 (ANALYZE pre-batch) | `<OUTPUT_DIR>/intermediate/batches.json` |
| `assembled-graph.json` | JSON | `merge-batch-graphs.py` | `<OUTPUT_DIR>/intermediate/assembled-graph.json` |
| `ua-*` tmp files | JSON | per-phase scratch data | `<OUTPUT_DIR>/tmp/ua-*` |

## How to Use

1. **Read the template header before producing the artifact.** Each template has a `@template`, `@purpose`, `@command`, `@style`, `@sections`, `@placeholders` block at the top — that's the contract.
2. **Follow the Section Contract.** If a section is listed, include it in that order. If a section doesn't apply, **omit it entirely** — don't write "N/A".
3. **Respect the placeholders** in square brackets: `[PROJECT NAME]`, `[DIAGRAM TITLE]`, `[SUBTITLE]`, `[VIEWBOX_W]`, `[VIEWBOX_H]`, etc. These are the only allowed sentinel tokens.
4. **Cite graph nodes** with the `[type:path]` format when working from a knowledge graph.
5. **Save partial results** rather than failing silently. Mark `meta.partial = true` in JSON, or add a `> ⚠️ Partial` banner at the top of the diagram.

## Conventions Shared Across All Templates

| Convention | Rule |
|------------|------|
| **Language** | Follow the `--language` flag (defaults to `en`). Consult `locales/<lang>.md` for tone. |
| **Citations** | Use `[type:path]` to reference graph nodes; use full file paths with backticks in prose. |
| **Timestamps** | ISO 8601, UTC, e.g. `2026-07-13T10:00:00Z`. |
| **Self-containment** | The diagram is an HTML file with inline SVG/CSS/JS — the only external resources are `/.claude/shared/...` (Vue, html2canvas, jsPDF, rui-back-top, rui-toast). Public CDNs are forbidden. |
| **Idempotency** | Re-running the same command on the same input produces a deterministic output. |
| **Failure mode** | Always save what's done. A partial artifact beats an exception. |

### Quality Checklist

Before delivering any diagram artifact, verify:

| # | Check | How to verify |
|---|-------|---------------|
| 1 | All `[...]` sentinel placeholders replaced | Grep for `[A-Z]` — should only match intentional SVG attribute values |
| 2 | Exactly 3 summary cards present | Count `.card` elements |
| 3 | Each card has 3–5 bullet items | Count `<li>` elements per card |
| 4 | SVG paint order correct (defs→grid→arrows→masks→boxes→boundaries→legend) | Visual inspection of SVG source order |
| 5 | Every component box has an opaque mask BEFORE it | Check for `<rect fill="#0f172a">` preceding each styled rect |
| 6 | Legend placed outside all boundaries | Legend y-coordinate > max boundary bottom edge + 20px |
| 7 | No component overlaps another | Bounding box check: each rect's x+w < next rect's x OR y+h < next rect's y |
| 8 | All arrows have labels describing protocol/data | Each `<line>` or `<path>` element between components has an adjacent `<text>` |
| 9 | Color palette used consistently | Same component type = same fill/stroke colors throughout |
| 10 | Legend entries only for actually-used types | Count legend swatches; should match distinct component types in diagram |
| 11 | Line style legend matches arrow styles used | Count line samples; should match distinct dash patterns used |
| 12 | Shared vendor scripts included for export | `/.claude/shared/vendor/html2canvas@1.4.1/html2canvas.min.js` and `/.claude/shared/vendor/jspdf@2.5.2/jspdf.umd.min.js` are present in `templates/index.html`. NO public CDN `<script src>` tags. |
| 13 | viewBox accommodates all content | Max x+w of rightmost element < viewBox width; max y+h of bottommost element + legend < viewBox height |
| 14 | No placeholder text remains (e.g., Card Title N, Item one) | Text search for common placeholder patterns |
| 15 | Footer metadata line populated | Footer `<p>` text is not the `[...]` sentinel form |
| 16 | Interactive features functional | Open in browser: hover highlights components, click locks focus, Esc resets |
| 17 | SVG filters defined (at minimum `shadow-sm`, `shadow-md`) | Check `<defs>` for `<filter id="shadow-sm">` and `<filter id="shadow-md">` |
| 18 | **Clean browser console** | The rui-tools headless probe (in the rui-report-diagram workspace) reports `consoleMessages: []` and `requestFailures: []`. Three historical offenders to watch for: (a) `rui-toast` losing `callerSrc` — fixed in iteration-1 by snapshotting `document.currentScript.src`; (b) `rui-toast` `defaultConfig` missing top-level `templateId` — also iteration-1; (c) Vue 3 multi-root templates make `$el` a DocumentFragment with no `querySelector` — use template refs in `mounted()`. |

### Common Mistakes to Avoid

| Mistake | Why it's wrong | Fix |
|---------|---------------|-----|
| Using the same arrow color for all connections | Loses semantic distinction between sync/async/auth flows | Use distinct marker colors per connection type |
| Placing legend inside a region boundary | Gets cropped or visually tangled with components | Always place legend at the bottom, outside all boundaries |
| Forgetting opaque masks | Arrows bleed through semi-transparent component fills | Every component rect needs a preceding `fill="#0f172a"` mask rect |
| Hardcoding viewBox="0 0 1000 800" for a large diagram | Content gets cropped | Calculate viewBox dynamically: max(all x+w) + 40, max(all y+h) + legend_h + 60 |
| Using generic labels (Service A, Component 1) | Diagram needs external reference to be understood | Use real, specific names (User Service, API Gateway, PostgreSQL RDS) |
| Skipping arrow labels | Connection purpose is ambiguous | Every arrow gets a label: protocol (REST, gRPC), auth type (JWT), or data direction (R/W) |
| Mixing color semantics | Confuses readers about component roles | One component type = one color palette, strictly enforced |
| Omitting line-style legend | Readers can't decode dashed vs solid arrows | Include both component swatches AND line samples in the legend |
| Too many components (>15) | Diagram becomes unreadable | Merge leaf nodes into composite boxes; use bullet lists for details |

## Adding a New Template (rare)

If a future requirement needs a second output (e.g., a printable PDF, a slide deck, or a docs page):

1. Add the template file under `templates/` (it is user-facing) **OR** colocate under `commands/<command-name>/<output-name>.md` (if it is an internal contract).
2. **Follow the 4-file split pattern** if it is an HTML+CSS+JS page: `index.html` (entry + DOM), `index.css` (styles), `data.js` (pure data), `index.js` (runtime). Skip the split only for very small one-off outputs.
3. Include the header block: `@template`, `@purpose`, `@command`, `@style`, `@sections`, `@placeholders`.
4. Document a Section Contract, a Schema/Template section, and Cross-References.
5. Update the table above.
6. Update the command file in `commands/<command-name>/` to reference the new template by relative path.

> The current scope is intentionally a **single page template** (the architecture diagram, rendered as `<OUTPUT_DIR>/index.html`). Resist the temptation to add a second one until a concrete user need appears.
