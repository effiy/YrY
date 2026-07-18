/**
 * rui-init · Dashboard data template (shape reference)
 * --------------------------------------------------------------------------
 * This file is the **shape template** for the dashboard data model.
 * rui-init-generate (step ③ of the rui-init pipeline) reads the
 * project's CLAUDE.md + README.md and emits a project-specific
 * docs/data.js whose body mirrors the breadcrumb / stats / sections
 * shape shown below. The items here are intentionally minimal
 * placeholders — replace them with your project's real modules when
 * regenerating.
 *
 * The data is consumed by:
 *   - index.html (Vue 3 template references · v-cloak hides it until
 *     the Vue app + all CDN components resolve)
 *   - index.js  (reads window.HELP_CONFIG and creates the Vue app;
 *                sceneCardFor() in index.js maps each group kind to
 *                <rui-scene-card> props)
 *
 * Top-level field reference:
 *   titleIcon     — small symbol rendered before the H1 title
 *   title         — page H1 (also exposed via document.title in index.js)
 *   tagline       — one-line summary shown under the title
 *   backTopLabel  — aria-label for the floating back-to-top button
 *   breadcrumb    — top-of-page context bar; the last item is the
 *                   current page (omit `href` to render as plain text)
 *   stats         — high-level KPIs; rendered by <rui-stats-grid> (CDN)
 *   panelHub      — cross-report navigation toolbar; rendered by
 *                   <rui-panel-hub> (CDN). `urls` is keyed by `panel`
 *   sections      — content sections; each contains `groups[]` whose
 *                   `kind` selects the rui-scene-card shape (see below)
 *   footerLinks   — links shown in the page footer
 *   footerNote    — small caption rendered below the footer links
 *
 * Section group kinds (consumed by index.js · sceneCardFor):
 *   items   → { icon, iconTone, title, description, meta?,
 *               href?, targetBlank?, demoHref?, demoLabel? }
 *   stories → { icon, title, description, badge?,
 *               sceneLinks?: [{label, href}],
 *               links?:      [{label, href, target?}],
 *               meta? }
 *   scenes  → { index, title, description,
 *               href?, previewHref?, previewLabel? }
 *
 * Stat modifier vocabulary (consumed by <rui-stats-grid>):
 *   accent | cyan | pass | fail | warn | info | health
 *   (defaults to "accent" — or "cyan" if the legacy `tone: "secondary"`
 *   field is present, which index.js maps automatically)
 *
 * @typedef {'accent'|'cyan'|'pass'|'fail'|'warn'|'info'|'health'} StatModifier
 * @typedef {'items'|'stories'|'scenes'}                            GroupKind
 */
window.HELP_CONFIG = {
  titleIcon:     "★",
  title:         "Rui Init",
  tagline:       "Five-step pipeline · detect → explore → generate → arch → verify · full rebuild on every run · /rui-init",
  backTopLabel:  "Back to Top",
  footerNote:    "Refactored from docs/index.html into a rui-html-vue style standalone dashboard template",

  // Top-of-page context bar — delegated to <rui-breadcrumb> (CDN).
  breadcrumb: [
    { label: "Rui Init", href: "../index.html" },
    { label: "Dashboard" }
  ],

  // High-level KPIs — delegated to <rui-stats-grid> (CDN). The CDN
  // component owns the card chrome (border / hover / animation) and
  // the per-modifier color tokens.
  stats: [
    { value: "0", label: "Runtime Deps", modifier: "cyan",   sub: "dependencies" },
    { value: "0", label: "Dev Deps",     modifier: "cyan",   sub: "dependencies" },
    { value: "0", label: "Stories",      modifier: "accent", sub: "scenes" },
    { value: "0", label: "Source Files", modifier: "accent", sub: "modules" }
  ],

  // rui-panel-hub · cross-report navigation toolbar. The component
  // handles the navigation itself when `urls` is passed via Vue props
  // (see index.html). The host page only needs to listen for
  // 'panel-hub-select' as a fallback (e.g. when a panel is not
  // mapped to a URL and is meant to open a floating panel).
  //
  // targetBlank (optional, default false) — open the resolved URL in a
  // new tab. Resolution order inside <rui-panel-hub>:
  //   1. buttons[i].newTab      (per-button override, wins)
  //   2. buttons[i].targetBlank (per-button override, alias of newTab)
  //   3. panelHub.targetBlank   (panelHub-level default)
  //   4. false                  (legacy same-tab behavior)
  // When newtab is on, the component calls
  // window.open(url, '_blank', 'noopener,noreferrer'); otherwise
  // window.location.href = url.
  panelHub: {
    label: { text: '📊', panel: 'reports', title: 'Report Dashboards' },
    targetBlank: true,            // open every panel URL in a new tab by default
    buttons: [
        {icon: '🏛', name: 'Architecture', desc: 'Markdown scenes', color: 'var(--rui-accent)', panel: 'arch'},
        {icon: '📁', name: 'Files Report', desc: 'Codebase analysis', color: 'var(--rui-accent)', panel: 'files'},
        // Per-button override: this one reverts to same-tab even though
        // panelHub.targetBlank is true.
        {icon: '✅', name: 'Self-test', desc: 'Self-check strategy', color: 'var(--rui-cyan)', panel: 'self-test', targetBlank: false},
    ],
    flow: 'File Analysis → Code Review → Health Audit → Tech Trends',
    urls: {
        arch:          'arch/index.html',
        files:         'files/index.html',
        'self-test':   'self-test/index.html',
    },
  },

  // Floating reports panel · opened by the "Reports" button in
  // <rui-panel-hub>. The panel is owned by index.html + index.js; this
  // block is the per-cadence list it reads from. The list shape is
  // mirror-imaged across daily / weekly / monthly, so the same
  // `<rui-scene-card>`-style four-row item renders for every cadence
  // (header · summary · metrics · tags + meta).
  //
  // Per-item fields:
  //   date    YYYY-MM-DD stamp (also used as the list key)
  //   label   displayed date string (kept separately so localisation /
  //           formatting can diverge from `date` later)
  //   title   headline shown in the card header
  //   href    relative path to the generated report
  //   status  one of shipped | verified | in-review | draft
  //           → drives the status-pill tone in the card header
  //   summary 1–2 sentence executive summary
  //   metrics ordered list of {label, value, tone} for the key/value strip
  //   tags    ordered list of {label, tone} chip tokens below the body
  //   meta    single-line trailing context (window · commits · touches)
  //
  // Replace the placeholder entries below with the project's real
  // reports once the rui-reports/daily, rui-reports/weekly and
  // rui-reports/monthly commands start emitting them.
  reportsList: {
    daily: [
      {
        date:    'YYYY-MM-DD',
        label:   'YYYY-MM-DD',
        title:   'Daily Report · <project>',
        href:    'daily/YYYY-MM-DD/index.html',
        status:  'shipped',
        summary: 'Per-day health check: commits landed, file touches, lint / scene regressions, and any sub-skill upgrade that cleared impact review. Replace this stub with the rui-reports/daily output once it lands.',
        metrics: [
          { label: 'Window',   value: '1d',        tone: 'is-neutral' },
          { label: 'Commits',  value: 'n/a',       tone: 'is-neutral' },
          { label: 'Touches',  value: 'n/a',       tone: 'is-neutral' },
          { label: 'Lint',     value: 'n/a',       tone: 'is-neutral' },
          { label: 'Scenes',   value: 'n / n',     tone: 'is-neutral' },
          { label: 'Risk',     value: 'unknown',   tone: 'is-warn'   },
        ],
        tags: [
          { label: 'stub',      tone: 'is-info' },
          { label: 'pipeline',  tone: 'is-info' },
        ],
        meta: 'placeholder · populate via /daily report',
      },
    ],
    weekly: [
      // Populated by the rui-reports/weekly command; empty until the
      // first weekly report lands under `weekly/`.
    ],
    monthly: [
      // Populated by the rui-reports/monthly command; empty until the
      // first monthly report lands under `monthly/`.
    ],
  },
    // ── § 1 · Third-party dependencies & frameworks ────────────────────
  sections: [
    {
      id:    "section-dependencies",
      badge: "1",
      title: "Third-Party Dependencies / Frameworks",
      meta:  "8 runtime · 6 dev deps",
      groups: [
        {
          id:    "deps-runtime",
          kind:  "items",
          icon:  "📦",
          title: "Runtime Dependencies (8)",
          items: [
            {
              icon:        "V",
              iconTone:    "is-module",
              title:       "Vue 3",
              description: "Progressive framework driven by the Composition API · <strong>core reactivity</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^3.4.0"
            },
            {
              icon:        "V",
              iconTone:    "is-module",
              title:       "Vant",
              description: "Mobile UI component library maintained by the Youzan team · <strong>H5 spec</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^4.x"
            },
            {
              icon:        "P",
              iconTone:    "is-module",
              title:       "Pinia",
              description: "Vue's officially recommended state management · <strong>TypeScript Store</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^2.x"
            },
            {
              icon:        "R",
              iconTone:    "is-module",
              title:       "Vue Router",
              description: "Vue's official router · <strong>history mode</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^4.x"
            },
            {
              icon:        "A",
              iconTone:    "is-module",
              title:       "Axios",
              description: "Request interception and unified handling · <strong>base SDK</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^1.x"
            },
            {
              icon:        "C",
              iconTone:    "is-module",
              title:       "CryptoJS",
              description: "Symmetric encryption, AES encrypt/decrypt and hashing · <strong>secure and trusted</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^4.x"
            },
            {
              icon:        "I",
              iconTone:    "is-module",
              title:       "Vue I18n",
              description: "Internationalization + multi-language switching · <strong>supports dynamic loading</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^9.x"
            },
            {
              icon:        "M",
              iconTone:    "is-module",
              title:       "moment-timezone",
              description: "Timezone-aware time handling · <strong>IANA timezone table</strong>",
              meta:        "<span class=\"accent\">Runtime</span> · ^0.5.x"
            }
          ]
        },
        {
          id:    "deps-dev",
          kind:  "items",
          icon:  "🛠",
          title: "Dev Dependencies (6)",
          items: [
            {
              icon:        "⚡",
              iconTone:    "is-module",
              title:       "Vite",
              description: "Fast cold start + HMR · <strong>Vue/Web</strong>",
              meta:        "<span class=\"accent\">Dev</span> · ^5.x"
            },
            {
              icon:        "S",
              iconTone:    "is-module",
              title:       "Sass",
              description: "Variables + nesting + mixins · <strong>modular styles</strong>",
              meta:        "<span class=\"accent\">Dev</span> · ^1.x"
            },
            {
              icon:        "U",
              iconTone:    "is-module",
              title:       "unplugin-vue-components",
              description: "On-demand auto component registration · <strong>no manual imports</strong>",
              meta:        "<span class=\"accent\">Dev</span> · ^0.x"
            },
            {
              icon:        "@",
              iconTone:    "is-module",
              title:       "@vueuse/core",
              description: "Composition API utility set · <strong>reactive utilities</strong>",
              meta:        "<span class=\"accent\">Dev</span> · ^10.x"
            }
          ]
        }
      ]
    },

    // ── § 2 · Story documents & scenes ─────────────────────────────────
    {
      id:    "section-stories",
      badge: "2",
      title: "Story Documents & Scenes",
      meta:  "2 stories · 10 scenes · all self-checks passed",
      groups: [
        {
          kind:  "stories",
          icon:  "📚",
          title: "Story Catalog (arch + self-test)",
          items: [
            {
              icon:        "🏛",
              title:       "System Architecture & Knowledge Codification",
              badge:       "5 scenes",
              description: "End-to-end request trace from entry to persistence · <strong>5 verification scenes</strong> · trust boundary + dependency-change impact",
              sceneLinks: [
                { label: "1. Module Location",          href: "arch/scene-1-module-location/index.md" },
                { label: "2. Data Flow Tracing",         href: "arch/scene-2-data-flow-tracing/index.md" },
                { label: "3. Newcomer Onboarding",      href: "arch/scene-3-newcomer-onboarding/index.md" },
                { label: "4. Dependency Impact",         href: "arch/scene-4-dependency-change-impact/index.md" },
                { label: "5. Security Surface",         href: "arch/scene-5-trust-boundary-security-surface/index.md" }
              ],
              links: [
                { label: "Architecture Dashboard →", href: "arch/index.html" }
              ],
              meta: "5 scenes · risk: medium · 3 planned sub-skills"
            },
            {
              icon:        "✅",
              title:       "Automation Script Suite",
              badge:       "6 scenes",
              description: "Vue + Vitest unit-test coverage · <strong>6 test scenes</strong> · full green suite · cross-story integration",
              sceneLinks: [
                { label: "1. Post-Init Self-Check",    href: "self-test/scene-1-post-init-full-self-check/index.md" },
                { label: "2. Pre-Commit Self-Check",  href: "self-test/scene-2-pre-commit-incremental-self-check/index.md" },
                { label: "3. Doc Consistency",         href: "self-test/scene-3-doc-code-consistency/index.md" },
                { label: "4. Security Regression",     href: "self-test/scene-4-security-surface-regression/index.md" },
                { label: "5. Integration Regression",  href: "self-test/scene-5-cross-story-integration-regression/index.md" },
                { label: "6. Third-Party Services",   href: "self-test/scene-6-third-party-framework-service/index.md" }
              ],
              links: [
                { label: "Self-test Dashboard →", href: "self-test/index.html" }
              ],
              meta: "6 scenes · risk: low · 80% line coverage"
            }
          ]
        }
      ]
    },

    // ── § 3 · Main source code ─────────────────────────────────────────
    {
      id:    "section-source",
      badge: "3",
      title: "Main Source Code",
      meta:  "13 vue · 20 runtime · 5 SCSS · 4 build scripts",
      groups: [
        {
          id:    "src-vue-pages",
          kind:  "items",
          icon:  "🧩",
          title: "Vue Page Core Modules (13)",
          items: [
            { icon: "🏠", iconTone: "is-module", title: "Home.vue",          description: "Home page · route entry",                   meta: "<span class=\"accent\">Example</span> · src/views/Home.vue" },
            { icon: "📐", iconTone: "is-module", title: "layout.vue",        description: "Overall layout · footer + content slot",   meta: "<span class=\"accent\">Example</span> · src/views/layout.vue" },
            { icon: "📊", iconTone: "is-module", title: "dashboard.vue",     description: "Dashboard home · embedded widgets",         meta: "<span class=\"accent\">Example</span> · src/views/dashboard.vue" },
            { icon: "📋", iconTone: "is-module", title: "OrderList/index.vue", description: "Order list · reverse sort + filter",       meta: "<span class=\"accent\">Example</span> · src/views/OrderList/index.vue" },
            { icon: "🔎", iconTone: "is-module", title: "Search.vue",        description: "Search results · hit highlighting",         meta: "<span class=\"accent\">Example</span> · src/views/Search.vue" },
            { icon: "🛒", iconTone: "is-module", title: "settlement-list.vue", description: "Settlement page · reverse freight read",  meta: "<span class=\"accent\">Example</span> · src/views/settlement-list.vue" }
          ]
        },
        {
          id:    "src-runtime",
          kind:  "items",
          icon:  "⚙️",
          title: "Runtime Core Modules (20)",
          items: [
            { icon: "🔗", iconTone: "is-module", title: "utils/request.js", description: "Axios wrapper · interceptors + duplicate-request cancellation", meta: "<span class=\"accent\">Example</span> · src/utils/request.js" },
            { icon: "🛠", iconTone: "is-module", title: "utils/auth.js",    description: "Token storage + redirect to login on expiry",                meta: "<span class=\"accent\">Example</span> · src/utils/auth.js" },
            { icon: "🧰", iconTone: "is-module", title: "utils/hmac.js",    description: "HMAC signing · webcrypto + js-sha256",                       meta: "<span class=\"accent\">Example</span> · src/utils/hmac.js" },
            { icon: "🗂", iconTone: "is-module", title: "utils/index.js",   description: "Utility set · filter, pad, deep clone",                       meta: "<span class=\"accent\">Example</span> · src/utils/index.js" },
            { icon: "🌍", iconTone: "is-module", title: "apiConfig.js",     description: "i18n config · key path rules",                               meta: "<span class=\"accent\">Example</span> · src/apiConfig.js" },
            { icon: "📌", iconTone: "is-module", title: "setting.js",       description: "Environment variables · apiBase + static assets",            meta: "<span class=\"accent\">Example</span> · src/setting.js" },
            { icon: "💾", iconTone: "is-module", title: "store/index.js",   description: "Pinia store · global singleton",                              meta: "<span class=\"accent\">Example</span> · src/store/index.js" },
            { icon: "🏷", iconTone: "is-module", title: "workOrderList.ts", description: "Work-order query · typed results",                           meta: "<span class=\"accent\">Example</span> · src/workOrderList.ts" },
            { icon: "📍", iconTone: "is-module", title: "local/index.js",   description: "Local storage · encrypted cookies",                          meta: "<span class=\"accent\">Example</span> · src/local/index.js" },
            { icon: "🔁", iconTone: "is-module", title: "directives/index.js", description: "Vue custom directives · drag, telemetry",                  meta: "<span class=\"accent\">Example</span> · src/directives/index.js" },
            { icon: "📤", iconTone: "is-module", title: "api/work-order.js", description: "Work-order API · GET/POST/export",                          meta: "<span class=\"accent\">Example</span> · src/api/work-order.js" },
            { icon: "🧩", iconTone: "is-module", title: "api/common.js",    description: "Common API · user/department/dictionary",                     meta: "<span class=\"accent\">Example</span> · src/api/common.js" }
          ]
        },
        {
          id:    "src-scss",
          kind:  "items",
          icon:  "🎨",
          title: "SCSS Style Source Files (5)",
          items: [
            { icon: "🅰", iconTone: "is-module", title: "index.scss",       description: "Entry styles · reset + theme color tokens",                   meta: "<span class=\"accent\">Example</span> · src/styles/index.scss" },
            { icon: "🅱", iconTone: "is-module", title: "variables.scss",   description: "Design tokens · color / spacing / radius",                     meta: "<span class=\"accent\">Example</span> · src/styles/variables.scss" },
            { icon: "🆎", iconTone: "is-module", title: "mixins.scss",      description: "Reusable mixins · cards, buttons, grid",                      meta: "<span class=\"accent\">Example</span> · src/styles/mixins.scss" }
          ]
        },
        {
          id:    "src-entry",
          kind:  "items",
          icon:  "🚀",
          title: "Entry & Build Scripts (4)",
          items: [
            { icon: "🟢", iconTone: "is-module", title: "main.js",          description: "Vue + router + Pinia bootstrap",                              meta: "<span class=\"accent\">Example</span> · src/main.js" },
            { icon: "⚛",  iconTone: "is-module", title: "App.vue",          description: "Root component · <strong>top-level layout</strong>",          meta: "<span class=\"accent\">Example</span> · src/App.vue" },
            { icon: "📦", iconTone: "is-module", title: "router/index.js",  description: "Route table · route guards",                                  meta: "<span class=\"accent\">Example</span> · src/router/index.js" },
            { icon: "🛠", iconTone: "is-module", title: "vite.config.js",   description: "Build config · <strong>proxy + alias</strong>",               meta: "<span class=\"accent\">Example</span> · vite.config.js" }
          ]
        }
      ]
    }
  ],

  footerLinks: [
    { label: "Demo Hub",   href: "../demos/index.html", targetBlank: true },
    { label: "Test Suite", href: "../tests/index.html", targetBlank: true },
    { label: "CLAUDE.md",  href: "../CLAUDE.md",        targetBlank: true },
    { label: "README.md",  href: "../README.md",        targetBlank: true }
  ]
};
