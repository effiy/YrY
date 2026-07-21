---
name: yry-tools-lighthouse
description: >
  Curated Lighthouse navigator — pulls the upstream
  GoogleChrome/lighthouse README, indexes its usage guides, internal
  docs, recipes, integrations, plugins, and FAQ locally, and
  recommends the right run mode (Chrome DevTools, Chrome extension,
  Node CLI, Node module), CLI flag, plugin, integration, or doc for
  a given task. Trigger when the user wants to: run a Lighthouse
  audit (URL, DevTools, extension, Node CLI `lighthouse <url>`, or
  programmatic Node module), pass CLI flags / presets (`--preset`,
  `--only-categories`, `--output`, `--chrome-flags`,
  `--throttling-method`, `--config-path`), configure a custom run
  (custom audits / gatherers / config JSON), view reports (HTML /
  JSON / CSV / online Viewer / GitHub Gist), understand scoring
  (performance variability, network/CPU throttling, mobile vs
  desktop, Core Web Vitals, CrUX field data, lantern simulation),
  author or extend Lighthouse (custom audits, gatherers, plugins,
  PWA audits), integrate into CI (GitHub Action, CircleCI Orb,
  Webpack, Gradle, Laravel, Cypress, Jest, lighthouse-ci, lambda),
  pick a third-party integration (Calibre, DebugBear, Treo,
  SpeedCurve, PageVitals), or troubleshoot a run (low score, score
  variance, headless Chrome, `node --inspect-brk`). Trigger words:
  "lighthouse", "lighthouse cli", "lighthouse node", "lighthouse
  chrome devtools", "lighthouse viewer", "lighthouse report",
  "lighthouse score", "lighthouse performance", "lighthouse
  accessibility", "lighthouse seo", "lighthouse core web vitals",
  "lighthouse crux", "lighthouse throttling", "lighthouse
  variability", "lighthouse custom audit", "lighthouse gatherer",
  "lighthouse plugin", "lighthouse ci", "lighthouse-ci", "lighthouse
  github action", "lighthouse batch", "lighthouse lambda",
  "lighthouse webpack", "lighthouse cypress", "lighthouse
  programmatic", "lighthouse node module", "lighthouse json",
  "lighthouse share", "lighthouse gist".

  Do NOT trigger for: non-Lighthouse web performance tools
  (PageSpeed Insights, WebPageTest, GTmetrix, Chrome UX Report
  only, CrUX API only, SpeedCurve only), browser DevTools panels
  other than the Lighthouse panel, Chrome extension development in
  general, raw Chrome DevTools Protocol debugging, or web vitals
  discussions not specifically about running or extending
  Lighthouse.
lifecycle: default-pipeline
user_invocable: true
---

# yry-tools-lighthouse — Curated Lighthouse Navigator

> Pick the right way to run Lighthouse, the right CLI flag, the right
> doc, the right plugin, or the right integration.
> Pulls from [GoogleChrome/lighthouse](https://github.com/GoogleChrome/lighthouse),
> 91 resources across 7 categories and 32 topics.

## What this skill does

1. **Maps a Lighthouse question to a topic** across the single
   registered source (`lighthouse`).
2. **Recommends how to run Lighthouse** for a given scenario — Chrome
   DevTools panel, Chrome extension, Node CLI (`lighthouse <url>
   --preset=desktop --output=json --view`), or Node module
   (programmatic).
3. **Recommends a CLI flag** — `--preset` (perf, experimental, desktop),
   `--only-categories`, `--output`, `--view`, `--chrome-flags`,
   `--throttling-method` (devtools, provided, simulate),
   `--form-factor`, `--save-assets`, `--config-path`, `--gather-mode`
   / `--audit-mode`.
4. **Recommends a configuration path** — `core/config/lr-desktop-config.js`
   for desktop runs, custom JSON for additional audits/gatherers/thresholds.
5. **Recommends a doc** — `docs/architecture.md`, `docs/variability.md`,
   `docs/throttling.md`, `docs/configuration.md`,
   `docs/authenticated-pages.md`, `docs/plugins.md`, `docs/new-audits.md`,
   `docs/recipes/custom-audit`, `docs/recipes/lighthouse-plugin-example`,
   `docs/error-reporting.md`.
6. **Recommends a plugin** — `lighthouse-plugin-field-performance`
   (CrUX real-user metrics), `lighthouse-plugin-publisher-ads` (ad
   speed/quality), `lighthouse-plugin-crux`.
7. **Recommends an integration** — 26 third-party services (Calibre,
   DebugBear, Treo, SpeedCurve, PageVitals, Screpy, Websu,
   DeploymentHawk, etc.) and 27 related projects (lighthouse-ci,
   auto-lighthouse, Exthouse, Gimbal, lighthouse-badges,
   lighthouse-batch, cypress-audit, jest example, mocha example,
   RSpec matchers, lambda runner, webpack plugin, gradle plugin,
   laravel wrapper).
8. **Recommends an FAQ answer** — 9 questions answered in the upstream
   README (low performance score, score variance, configuration,
   throttling, locale/Intl, custom audits, contributing).
9. **Cites every recommendation** by exact title and URL with the
   `[src:lighthouse]` tag.

## What this skill does NOT do

- Does NOT pull from upstream at answer time — uses a local snapshot
  in `references/`.
- Does NOT teach web performance from scratch — index the upstream
  Lighthouse README and its linked docs.
- Does NOT run Lighthouse for the user — recommend a run mode and
  point at the upstream docs for invocation. Navigator, not executor.
- Does NOT generate Lighthouse reports, HTML/JSON output, or screenshots.
- Does NOT cover non-Lighthouse web performance tools (PageSpeed
  Insights, WebPageTest, GTmetrix, SpeedCurve standalone) as first-class
  products.
- Does NOT cover raw Chrome DevTools Protocol debugging, the Chrome
  DevTools Performance / Network panels, or general browser extension
  development.

## Workflow

1. **Read** `references/sources.json` and `references/index.md`.
2. **Match** the user's intent:
   - "how do I run Lighthouse" → `Using Lighthouse` (DevTools /
     extension / CLI / Node module / Viewing a report).
   - "what's the CLI flag for X" → `Using Lighthouse / CLI options`
     (the `## Using the Node CLI` H3 contains the full `--help` block;
     point at the `#cli-options` anchor and quote the flag).
   - "how do I configure Lighthouse" / "custom audit" / "custom
     gatherer" → `Using Lighthouse / Using the Node module` +
     `Docs & Recipes / Docs` (`docs/configuration.md`,
     `docs/new-audits.md`, `docs/recipes/custom-audit`).
   - "plugin for X" → `Plugins` (3 entries).
   - "service that uses Lighthouse" / "monitoring" / "CI" →
     `Integrations` (26 services) + `Related Projects` (27 projects).
   - "why is my score low" / "why does my score change" /
     "throttling" / "variability" → `FAQ` + `Docs & Recipes`
     (`docs/variability.md`, `docs/throttling.md`).
   - "how do I author a custom audit" → `Docs & Recipes / Docs`
     (`docs/plugins.md`, `docs/new-audits.md`,
     `docs/recipes/lighthouse-plugin-example`,
     `docs/recipes/custom-audit`).
3. **Filter** to 1-3 high-signal picks — prefer fewer, well-chosen
   resources over a dump of 50 links.
4. **Cite** every recommendation with exact title + URL + `[src:…]`.
   For "custom audit" questions, always surface `docs/new-audits.md`,
   `docs/recipes/custom-audit`, and `docs/plugins.md` together — they're
   a chain, not alternatives.

## Borders

| Boundary | Permission |
|----------|-----------|
| `references/**` | read |
| Skill directory | read + write |
| Outside the skill directory | no automatic writes |

## Supporting resources

- [references/index.md](./references/index.md) — unified topic index, start here.
- [references/sources.json](./references/sources.json) — registered sources.
- [references/README-lighthouse.md](./references/README-lighthouse.md) — verbatim upstream README.

## Fallback

| Situation | Behavior |
|-----------|---------|
| `references/index.md` missing | Grep `references/README-lighthouse.md` directly. |
| Topic not in any registered source | State the gap, suggest the closest related topic (e.g. "no Web Vitals docs in the registry — check `web.dev/vitals` upstream"). |
| Stale README (upstream has moved on) | Tell the user the snapshot may be stale; suggest re-fetching from the upstream `GoogleChrome/lighthouse` repo. |
| User asks about the LHR JSON schema | Out of scope; point at upstream `types/lhr.d.ts` and `docs/architecture.md`. |
| User asks about score weighting / audit weights per release | Out of scope; upstream changes weights between releases. Point at `core/config/default-config.js` and the latest `changelog.md`. |
| User asks about Web Vitals in general (LCP, INP, CLS) | Out of scope; point at `web.dev/vitals`. |
| User asks about non-Lighthouse web performance tools | Out of scope; defer to general Claude. |
| User wants me to actually run Lighthouse | Recommend a run mode from the index, then hand off — this skill is a navigator, not an executor. |
| User asks in a language other than English | Respond in the user's language; keep resource titles in original language. |
