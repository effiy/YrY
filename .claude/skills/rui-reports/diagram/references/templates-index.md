# Output Templates — Index

> The `rui-report-diagram` skill produces one self-contained artifact: `templates/architecture-diagram.html`. The knowledge graph (`knowledge-graph.json`) is an intermediate data structure used to derive the diagram in `--from-codebase` mode — it is not a user-facing template.

## Templates

| Template | Format | Produced by | Storage |
|----------|--------|-------------|---------|
| [templates/architecture-diagram.html](../templates/architecture-diagram.html) | self-contained HTML+SVG | `/rui-report-diagram create` | user-specified path (default `./architecture-diagram.html`) |

## Intermediate Data

> `<OUTPUT_DIR>` is the directory containing the generated `architecture-diagram.html` (i.e., the parent directory of the `--out` path, or `./` by default). All intermediate data is colocated with the HTML output — no separate `analysis/` or hidden state directory is created in the analyzed project.

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
| **Self-containment** | The diagram is an HTML file with inline SVG/CSS/JS — no external dependencies except the CDN for export. |
| **Idempotency** | Re-running the same command on the same input produces a deterministic output. |
| **Failure mode** | Always save what's done. A partial artifact beats an exception. |

## Adding a New Template (rare)

If a future requirement needs a second output (e.g., a printable PDF, a slide deck, or a docs page):

1. Add the template file under `templates/` (it is user-facing) **OR** colocate under `commands/<command-name>/<output-name>.md` (if it is an internal contract).
2. Include the header block: `@template`, `@purpose`, `@command`, `@style`, `@sections`, `@placeholders`.
3. Document a Section Contract, a Schema/Template section, and Cross-References.
4. Update the table above.
5. Update the command file in `commands/<command-name>/` to reference the new template by relative path.

> The current scope is intentionally a **single template** (the architecture diagram). Resist the temptation to add a second one until a concrete user need appears.
