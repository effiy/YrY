# HTML Test Fixture Workflow

The cross-cutting skill wires three concerns together into one
fixture-driven workflow: **scaffold → assert → diff**.

## 1. Scaffold — `agents/test-fixture-generator.md`

Given a component directory (`index.html` + `index.js` +
`data.js`), generate `tests/fixtures/<component>/` with:

- `index.html` — test page mounting the component with controlled
  test data (template: `templates/test-fixture.md`)
- `test.js` — assertions for each requested type (DOM presence,
  text content, CSS properties, event handling)
- (Optional) `expected/` — baseline screenshots for visual
  regression

Inputs: `component_dir`, `test_dir`, `assertions` (subset of the
5 assertion types below).

## 2. Assert — `rules/test-contracts.md`

Five canonical assertion types:

| Type | Method | Best for |
|------|--------|----------|
| DOM presence | `querySelector` not null | Component renders |
| Text content | `textContent` match | Data display |
| CSS properties | `getComputedStyle` | Visual styling |
| Event handling | `dispatchEvent` + state check | Interactivity |
| Visual regression | Screenshot comparison | Pixel-perfect rendering |

### Test fixture structure

```
tests/
├── fixtures/
│   └── <component>/
│       ├── index.html     # Test page with component mounted
│       ├── test.js        # Test assertions
│       └── expected/      # Expected outputs (screenshots, DOM snapshots)
└── results/
    └── <component>/
        └── <timestamp>/   # Test run results
```

### Hard constraints (from `rules/test-contracts.md` + `rules/browser-compat.md`)

1. Fixtures must be **self-contained** — no external API dependencies
2. No `localhost` server required — `file://` URLs must work
3. Async components use `waitFor` helpers, not arbitrary `setTimeout`
4. Visual regression baselines generated per OS/browser combination
5. Baseline must be generated on the same OS/browser as the test run

## 3. Diff — `agents/visual-diff-checker.md`

Given a test fixture page and a baseline screenshot, render in a
headless browser (1280×720), capture, compare pixel-by-pixel,
classify:

- `pass` — diff < threshold (default 1%)
- `warning` — diff 1–3%
- `fail` — diff > 3%

Output format (JSON):

```json
{
  "test": "yry-scene-card/basic-render",
  "result": "pass",
  "diff_pct": 0.3,
  "diff_regions": [],
  "baseline_date": "2026-07-01",
  "recommendation": "No visual regression detected"
}
```

## Browser compatibility (from `rules/browser-compat.md`)

| Browser | Minimum version | Testing |
|---------|:---:|---------|
| Chrome | 90+ | Primary |
| Firefox | 90+ | Secondary |
| Safari | 15+ | Secondary |
| Edge | 90+ | Best-effort (Chromium-based) |

Required features (no fallback): CSS Custom Properties, ES Modules,
Web Components, CSS Grid. Supported: `prefers-reduced-motion`
(disable animations). Optional: `prefers-color-scheme` (default
to dark theme).

## When this skill applies

- User asks how to scaffold a self-contained test fixture for a Vue 3 component
- User wants visual regression (pixel-diff) for a Vue 3 component
- User asks what assertion types a fixture should cover (DOM / text / CSS / event / visual)
- User asks which browsers a Vue 3 component must support
- User wants a baseline + diff workflow for screenshots

This skill does NOT cover Vitest setup (see
`yry-html-test-vitest-setup`), E2E Playwright (see
`yry-html-test-e2e-playwright`), or browser-runner unit tests (see
`yry-html-test-runner-choice`). Use those for runtime / behavioral
tests; use this skill for fixture-driven visual / structural
assertions on self-contained `file://` pages.
