# plan-render — Template rendering pipeline

> The contract for turning the 4-file template (`templates/index.html`
> + `data.js` + `index.css` + `index.js`) into a finished plan file.
> Read this before writing the renderer — the Vue 3 app and the
> `planToMarkdown()` exporter are the contract, not a suggestion.

## Why this changed

The old pipeline was a 6-stage placeholder substitution:

1. Read `templates/plan-report.html` (page shell)
2. Read `templates/partials/*.html` (one per section)
3. Collect data
4. Expand inner rows
5. Splice partials → page
6. Validate + write

It had a real cost: 13 partial files, ~50 placeholders, a
custom `{{*_BLOCK}}` → empty-string convention, and a separate
`plan-checklist.md` for the markdown output. The renderer had to
maintain all four contracts (HTML page + 13 partials + markdown
template + README placeholder reference) in sync.

The new pipeline is data-driven:

1. Read `templates/data.js` (schema + defaults + example)
2. Collect data
3. Validate
4. Write

The Vue 3 app in `templates/index.js` is the single source of
truth for what the page can render. `planToMarkdown()` in the
same file is the single source of truth for what the markdown
can render. They read the same `window.PLAN_DATA` shape, so
the schema lives in exactly one place.

## Pipeline (4 stages)

```
1. Read schema           → templates/data.js (window.PLAN_DATA_SCHEMA)
2. Collect data          → git + filesystem (offline, same as report mode)
3. Validate              → references/plan-validation.md rules
4. Write                 → ~/.claude/plans/<project>/<YYYY-MM-DD>-plan.{html,md}
```

## Stage 1 — Read the schema

`templates/data.js` is the contract. It exports:

```js
window.PLAN_DATA_SCHEMA = {
  defaults: { /* empty values for every field */ },
  example:  { /* illustrative fixture */ },
  merge:    function (input) { /* deep-merge input over defaults */ },
  version:  1
};
window.PLAN_DATA = mergeWithDefaults(window.PLAN_DATA || EXAMPLE);
```

The merge function makes the renderer robust: any field the
caller forgets to fill still renders as a sensible empty value
(`—` for scalars, `[]` for arrays) rather than crashing Vue.

Read `templates/data.js` to see the full shape. The
`@data_shape` JSDoc block at the top is the authoritative
reference; the section-by-section rendering rules below are
the operational contract.

## Stage 2 — Collect data

Offline + git-only. Same contract as `report` mode. See
`plan-workflow.md` §"Data collection" for the exact commands.

The shape the renderer needs (matches the schema in
`templates/data.js`):

```js
{
  meta:     { project, date, timestamp, horizon, format },
  tiers:    { '30d': true, '90d': true, long: true },
  context:  { paragraph, lastCommit, activeBranches, todoCount, testRatio, medianCommits },
  diff:     { enabled, verdict, verdictUpper, verdictLabel, priorDate, counts, changed, added, removed, assumptionChanges },
  assumptions: { open, validated, invalidated, rows },
  decisions:   { made, superseded, reversed, rows },
  tier30d:  { milestones, workItems },
  tier90d:  { themes, epics },
  tierLong: { bets, shifts, northStars },
  traceability: [...],
  capacity: { verdict, available, committers, workingDays, focus, demand, breakdown, suggestedCuts, ... },
  risks:    { actionBlock, rows },
  team:     { roster, alloc30d, alloc90d },
  review:   { author, peer, stakeholder, date, peerDate, stakeholderDate, nextDate }
}
```

If a field is empty (no risks, no decisions, empty repo),
the Vue template renders `—` via the `dash()` helper. Empty
arrays produce no rows (v-for handles it). The old
`{{*_BLOCK}}` → `''` convention is now `v-if` — no orphan
`<h3>` headers ever appear in the output.

## Stage 3 — Validate

After data collection, before writing:

1. Run the validation rules in `references/plan-validation.md`.
2. If any **Refuse** rule fails, do not write the file. Print
   one line per failure: `[VALIDATION] <rule-id>: <message>`.
   Exit 2.
3. If any **Warn** rule fails, print the warning but continue.
4. If `--no-validate` is passed, skip all checks and label the
   header `DRAFT — UNVALIDATED — <YYYY-MM-DD>`.

## Stage 4 — Write

Two output formats:

### HTML output (default)

The Vue app reads `window.PLAN_DATA` and renders the page
client-side. To produce a self-contained file:

1. Concatenate, in order: `index.html` shell,
   `data.js` (with the collected data injected as
   `window.PLAN_DATA` and the `EXAMPLE_DATA` stripped), the
   minified Vue 3 runtime, `index.css`, and the `TEMPLATE`
   literal from `index.js`.
2. Substitute `<title>{{PROJECT}} — Engineering Plan — {{DATE}}</title>`
   with the real project + date (Vue doesn't render `<title>`
   in the body).
3. Remove the `shared/loader.js` script tag — the
   rendered file is offline, no loader needed.
4. Remove the `<div v-cloak></div>` shell from the body.
5. Write to `~/.claude/plans/<project>/<YYYY-MM-DD>-plan.html`.

The result is a single HTML file with no external resources.
Open it in any browser; the Vue app boots and renders.

### Markdown output (`--format md`)

Call `window.planToMarkdown(plan)` from `templates/index.js`.
The function is pure — it has no Vue dependency, reads the
same `window.PLAN_DATA` shape, and returns a string. Write
the string to
`~/.claude/plans/<project>/<YYYY-MM-DD>-plan.md`.

The function is exported on `window` so the rendering command
can call it directly without booting a browser:

```js
const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
// Load data.js + index.js in a JSDOM context, then:
const md = window.planToMarkdown(plan);
writeFileSync(outPath, md);
```

## Render helpers (in `templates/index.js`)

The Vue app uses these helpers for tag-style content:

### Size tag

```js
function sizeTag(size) {
  const cls = { S: 'tag-s', M: 'tag-m', L: 'tag-l', XL: 'tag-xl' }[size];
  return cls ? `<span class="tag ${cls}">${size}</span>` : dash(size);
}
```

### Risk tag

```js
function riskTag(risk) {
  const cls = { low: 'risk-low', medium: 'risk-medium', high: 'risk-high' }[risk];
  return cls ? `<span class="${cls}">${risk}</span>` : dash(risk);
}
```

### Status tag (assumptions / decisions)

```js
function statusTag(status) {
  const cls = {
    open:         'status-open',
    validated:    'status-validated',
    invalidated:  'status-invalidated',
    made:         'status-made',
    superseded:   'status-superseded',
    reversed:     'status-reversed'
  }[status];
  return cls ? `<span class="${cls}">${status}</span>` : dash(status);
}
```

### Reversibility tag (decisions only)

```js
function reversibilityTag(rev) {
  const cls = {
    'reversible':      'rev-reversible',
    'hard to reverse': 'rev-hard',
    'irreversible':    'rev-irreversible'
  }[rev];
  return cls ? `<span class="${cls}">${rev}</span>` : dash(rev);
}
```

### Tier badge

```js
function tierBadge(tier) {
  const cls = { '30d': 'tier-30d', '90d': 'tier-90d', long: 'tier-long' }[tier];
  return cls ? `<span class="tier-badge ${cls}">${tier.toUpperCase()}</span>` : dash(tier);
}
```

### Roll-up cell (traceability)

```js
function rollupCell(parent) {
  return parent ? parent : '<span class="orphan">— ORPHAN —</span>';
}
```

The `.orphan` class renders red — validation rule R6 refuses
to write the file if any cell is orphaned.

### Inferred tag

```js
function inferredTag(inferred) {
  return inferred ? ' <code>[inferred]</code>' : '';
}
```

Append to IDs for assumptions and decisions that were inferred
from the plan rather than explicitly stated by the user.

All helpers are also exposed on `window.planHelpers` so the
`--format md` exporter can use them without booting Vue.

## Composables (in `templates/index.js`)

The Vue app wires up two composables after mount:

### `useRiskMatrixFilter()`

Click a cell in the 3×3 risk matrix to filter the risk table
by likelihood × impact. Click the same cell again to clear.
Single-cell selection at a time; no multi-select (per the
original template).

### `useToolbar(plan)`

Wires up the four toolbar buttons:

- **Expand all** — removes `.collapsed` from every `<section>`
- **Collapse all** — adds `.collapsed` to every `<section>`
- **Copy as Markdown** — calls `planToMarkdown(plan)`, writes
  to the clipboard via `navigator.clipboard.writeText` with
  a `document.execCommand('copy')` fallback for older
  browsers. Shows "Copied!" for 1.5s.
- **Print / PDF** — `window.print()`. The `@media print`
  rules in `index.css` hide the toolbar and nav, and force
  every section to be expanded.

It also wires `<h2>` click → toggle `.collapsed` on the
parent section, matching the original template's behaviour.

## Tier exclusion

When `--tiers 30d,90d` is passed, set
`data.tiers['long'] = false` in the PLAN_DATA. The Vue
template renders the excluded section as:

```html
<p class="rollup">— excluded via --tiers —</p>
```

This keeps the nav anchors stable — they always point to
the same DOM id, just with a single line of text inside.

## Markdown rendering

`planToMarkdown(plan)` (in `templates/index.js`) renders
all 13 sections in the same order as the HTML page:

1. Plan Diff vs Prior
2. Context
3. Assumptions Register
4. Decision Log
5. 30 DAYS — Sprint-tier execution
6. 90 DAYS — Quarter-tier commitments
7. LONG-TERM — Strategic bets
8. Traceability Matrix
9. Capacity vs Demand
10. Risk Mitigations
11. Team Allocation
12. Definition of Done
13. Review Checklist

It uses standard markdown:

- Pipe tables (`| col1 | col2 |` + `| --- | --- |`)
- Unchecked checkboxes (`- [ ]`, never `- [x]`)
- Blockquote for action calls (`> **Action:** …`)
- Pipe-escaped cells (`\|` when content contains `|`)
- Tier badges as `(30d)` parenthetical tags
- Size / risk / status tags as plain text (`S`, `low`, `open`)

Tier exclusion produces the same single line
(`— excluded via --tiers —`) as the HTML.

## Self-test

Run the renderer against `references/plan-examples.md` (the
worked `billing-service` example). The example should:

1. Render without any unexpanded `{{...}}` literals
   (the new pipeline doesn't have placeholders, but if
   you're still seeing them, you're using the old
   `plan-report.html` — delete it).
2. Pass every validation rule in `plan-validation.md`.
3. Produce a file whose section count matches the page
   shell: 13 `<section>` blocks for HTML, 13 `##`
   headers for markdown.

If the example fails to render, either the example or
the renderer is wrong — do not ship one without the other.

## Common bugs

| Bug | Cause | Fix |
|-----|-------|-----|
| `EXAMPLE_DATA` shipped to the user | Renderer concatenated `data.js` without stripping the example | Read `data.js`, keep only the IIFE that sets `window.PLAN_DATA` to the user-supplied data |
| Vue didn't mount | `index.html` shell missing or `data.js` didn't run before `index.js` | Load order in `index.html` is `loader → data → index.css → index.js` |
| Risk matrix cells don't filter the table | `useRiskMatrixFilter()` not called in `mounted()` | The composable is wired in `mounted()` in `index.js` — check it survived the refactor |
| `v-cloak` flash | `index.css` missing the `[v-cloak] { display: none; }` rule | The rule is in the `reset` layer of `index.css` |
| `planToMarkdown` returns `undefined` | Function called before `data.js` ran | `data.js` must execute first to set `window.PLAN_DATA`; `planToMarkdown` reads from `window` or the passed-in argument |
| Unexpanded `{{...}}` in output | Renderer is still using the old `plan-report.html` shell | Delete `plan-report.html` if it's still around; the new pipeline is data-driven |
| Pre-checked review checkbox | Renderer defaulted checkboxes to checked | The DoD + review checklists in `index.js` are static `<input type="checkbox">` (HTML) and `- [ ]` (markdown) — verify they weren't edited |
| Calendar date in output | Renderer converted `T+Nd` to a date | Don't — the skill doesn't know the user's calendar |
| Invented owner name | Renderer pulled a name from git blame without labeling as draft | Use `<unassigned>` or label as `(draft, git-blame)` |
| External resource in HTML | Renderer added a CDN link, font, or image | The HTML is self-contained — strip the resource |
| Red capacity but file written | `--allow-overcommit` not checked, or validation skipped | Refuse by default; only override with the flag |

## Escape rules

- Do **not** escape `<` or `>` in code spans — the templates
  rely on raw HTML in cells.
- Do **not** escape `|` in markdown table cells — use `\|`
  only when the content contains a literal pipe.
- Do **not** HTML-escape project names, file paths, or commit
  subjects. The plan is for local consumption, not for
  embedding in another HTML page.
- If a project name contains `<` or `>` (rare), wrap it in
  `<code>` and let the browser handle it.
