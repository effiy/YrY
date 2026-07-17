/**
 * YiPet · Dashboard data model
 * --------------------------------------------------------------------------
 * Emitted by rui-init-generate (step ③ of the rui-init pipeline) from
 * the freshly rebuilt CLAUDE.md + README.md. Consumed by index.html
 * (Vue 3 template) and index.js (sceneCardFor dispatch).
 *
 * Shape reference: /Users/ruiyi/YrY/.claude/skills/rui-init/templates/data.js
 */
window.HELP_CONFIG = {
    titleIcon:    '🌙',
    title:        'YiPet',
    tagline:      'A customized fork of Dark Reader — MV2/MV3 browser extension that analyzes web pages and generates a dark theme to reduce eyestrain.',
    backTopLabel: 'Back to Top',
    footerNote:   'Initialized by rui-init · detect → explore → generate → arch → verify',

    breadcrumb: [
        {label: 'YiPet', href: '../README.md'},
        {label: 'Documentation Center'},
    ],

    stats: [
        {value: '1', label: 'Runtime Deps', modifier: 'cyan', sub: 'malevic 0.20.2'},
        {value: '41', label: 'Dev Deps', modifier: 'cyan', sub: 'jest · rollup · ts · eslint'},
        {value: '5', label: 'Arch scenes', modifier: 'accent', sub: 'docs/arch/'},
        {value: '6', label: 'Self-test scenes', modifier: 'accent', sub: 'docs/self-test/'},
        {value: '11', label: 'Top-level modules', modifier: 'cyan', sub: 'src/<dir>/'},
        {value: '8', label: 'rui-report pages', modifier: 'accent', sub: 'docs/files/'},
    ],

    panelHub: {
        label: {text: '📊', panel: 'reports', title: 'Story directories'},
        targetBlank: true,
        buttons: [
            {icon: '🏛', name: 'Architecture', desc: 'Markdown scenes', color: 'var(--rui-accent)', panel: 'arch'},
            {icon: '📁', name: 'Files Report', desc: 'Codebase analysis', color: 'var(--rui-accent)', panel: 'files'},
            {icon: '✅', name: 'Self-test', desc: 'Self-check strategy', color: 'var(--rui-cyan)', panel: 'self-test', targetBlank: false},
        ],
        flow: 'Codebase scan → Knowledge graph → Scene stories → Self-test gates',
        urls: {
            arch:          'arch/index.html',
            files:         'files/index.html',
            'self-test':   'self-test/index.html',
        },
    },

    // ────────────────────────────────────────────────────────────────────
    // Three sections are emitted in this fixed order (verify §3.2):
    //   § 1 section-dependencies  — runtime + dev
    //   § 2 section-stories       — arch + self-test
    //   § 3 section-source        — src/<dir>/ grouped
    // ────────────────────────────────────────────────────────────────────
    sections: [
        // ── § 1 · Third-party dependencies & frameworks ────────────────
        {
            id:    'section-dependencies',
            badge: '1',
            title: 'Third-Party Dependencies / Frameworks',
            meta:  '1 runtime · 41 dev deps',
            groups: [
                {
                    id:    'deps-runtime',
                    kind:  'items',
                    icon:  '📦',
                    title: 'Runtime Dependencies (1)',
                    items: [
                        {
                            icon:        'M',
                            iconTone:    'is-module',
                            title:       'malevic 0.20.2',
                            description: 'Lightweight declarative UI library · <strong>Extension UI</strong>',
                            meta:        '<span class="accent">Runtime</span> · 0.20.2',
                        },
                    ],
                },
                {
                    id:    'deps-dev',
                    kind:  'items',
                    icon:  '🛠',
                    title: 'Dev Dependencies (top 10)',
                    items: [
                        {icon: 'J', iconTone: 'is-module', title: 'jest 30.4.2', description: 'Unit testing · ts-jest integration', meta: '<span class="accent">Dev</span> · 30.4.2'},
                        {icon: 'T', iconTone: 'is-module', title: 'typescript 6.0.3', description: 'Type system · strict mode', meta: '<span class="accent">Dev</span> · 6.0.3'},
                        {icon: 'R', iconTone: 'is-module', title: 'rollup 4.60.4', description: 'Bundler · multi-manifest variant output', meta: '<span class="accent">Dev</span> · 4.60.4'},
                        {icon: 'E', iconTone: 'is-module', title: 'eslint + typescript-eslint', description: 'Code style · typescript-eslint 8.60.0', meta: '<span class="accent">Dev</span> · 9.x'},
                        {icon: 'K', iconTone: 'is-module', title: 'karma 6.4.4', description: 'Inject-script testing · multi-browser launcher', meta: '<span class="accent">Dev</span> · 6.4.4'},
                        {icon: 'P', iconTone: 'is-module', title: 'puppeteer-core 25.1.0', description: 'Browser e2e · remote/headless reuse', meta: '<span class="accent">Dev</span> · 25.1.0'},
                        {icon: 'L', iconTone: 'is-module', title: 'less 4.6.4', description: 'UI style preprocessor · popup/options/devtools', meta: '<span class="accent">Dev</span> · 4.6.4'},
                        {icon: 'W', iconTone: 'is-module', title: 'ws 8.21.0', description: 'WebSocket · test echo server', meta: '<span class="accent">Dev</span> · 8.21.0'},
                        {icon: 'C', iconTone: 'is-module', title: 'chokidar 5.0.0', description: 'File watcher · watch-mode build', meta: '<span class="accent">Dev</span> · 5.0.0'},
                        {icon: 'I', iconTone: 'is-module', title: 'prettier 3.8.3', description: 'Code formatter · integrates with ESLint', meta: '<span class="accent">Dev</span> · 3.8.3'},
                    ],
                },
            ],
        },

        // ── § 2 · Story documents & scenes ─────────────────────────────
        {
            id:    'section-stories',
            badge: '2',
            title: 'Story Documents & Scenes',
            meta:  '2 stories · 11 scenes · verify 7/7 passed',
            groups: [
                {
                    kind:  'stories',
                    icon:  '📚',
                    title: 'Story Catalog (arch + self-test)',
                    items: [
                        {
                            icon:        '🏛',
                            title:       'System Architecture & Knowledge Codification',
                            badge:       '5 scenes',
                            description: 'End-to-end request trace from entry to persistence · <strong>5 verification scenes</strong> · trust boundary + dependency-change impact',
                            sceneLinks: [
                                {label: '1. Module Location', href: 'arch/scene-1-module-location/index.md'},
                                {label: '2. Data Flow Tracing', href: 'arch/scene-2-data-flow-tracing/index.md'},
                                {label: '3. Newcomer Onboarding', href: 'arch/scene-3-newcomer-onboarding/index.md'},
                                {label: '4. Dependency Impact', href: 'arch/scene-4-dependency-change-impact/index.md'},
                                {label: '5. Security Surface', href: 'arch/scene-5-trust-boundary-security-surface/index.md'},
                            ],
                            links: [
                                {label: 'Architecture Dashboard →', href: 'arch/index.html'},
                            ],
                            meta: '5 scenes · risk: medium · MV2/MV3 multi-manifest matrix',
                        },
                        {
                            icon:        '✅',
                            title:       'Automated Self-Check Suite',
                            badge:       '6 scenes',
                            description: 'rui-init verify 7-point gate · <strong>6 test scenes</strong> · cross-story integration + third-party service health',
                            sceneLinks: [
                                {label: '1. Post-Init Self-Check', href: 'self-test/scene-1-post-init-full-self-check/index.md'},
                                {label: '2. Pre-Commit Self-Check', href: 'self-test/scene-2-pre-commit-incremental-self-check/index.md'},
                                {label: '3. Doc Consistency', href: 'self-test/scene-3-doc-code-consistency/index.md'},
                                {label: '4. Security Regression', href: 'self-test/scene-4-security-surface-regression/index.md'},
                                {label: '5. Integration Regression', href: 'self-test/scene-5-cross-story-integration-regression/index.md'},
                                {label: '6. Third-Party Services', href: 'self-test/scene-6-third-party-framework-service/index.md'},
                            ],
                            links: [
                                {label: 'Self-test Dashboard →', href: 'self-test/index.html'},
                            ],
                            meta: '6 scenes · risk: low · 4 manifests × 3 browsers',
                        },
                    ],
                },
            ],
        },

        // ── § 3 · Main source code ─────────────────────────────────────
        {
            id:    'section-source',
            badge: '3',
            title: 'Main Source Code',
            meta:  '11 top-level modules · 4 manifest variants',
            groups: [
                {
                    id:    'src-background',
                    kind:  'items',
                    icon:  '⚙️',
                    title: 'background — service worker (1)',
                    items: [
                        {icon: '🟢', iconTone: 'is-module', title: 'extension.ts', description: 'Extension class · lifecycle + tab state machine', meta: '<span class="accent">Entry</span> · src/background/extension.ts'},
                        {icon: '🟢', iconTone: 'is-module', title: 'index.ts', description: 'BG page entry · MV2/MV3 adaptation', meta: '<span class="accent">Entry</span> · src/background/index.ts'},
                        {icon: '📨', iconTone: 'is-module', title: 'messenger.ts', description: 'Typed message bridge · UI ↔ BG ↔ CS', meta: '<span class="accent">Core</span> · src/background/messenger.ts'},
                        {icon: '💾', iconTone: 'is-module', title: 'user-storage.ts', description: 'chrome.storage persistence · config management', meta: '<span class="accent">Core</span> · src/background/user-storage.ts'},
                        {icon: '🪟', iconTone: 'is-module', title: 'window-theme.ts', description: 'Browser theme color sync · manifest theme', meta: '<span class="accent">Core</span> · src/background/window-theme.ts'},
                    ],
                },
                {
                    id:    'src-inject',
                    kind:  'items',
                    icon:  '💉',
                    title: 'inject — content script (1)',
                    items: [
                        {icon: '🟢', iconTone: 'is-module', title: 'index.ts', description: 'Content script entry · document_start', meta: '<span class="accent">Entry</span> · src/inject/index.ts'},
                        {icon: '🎨', iconTone: 'is-module', title: 'dynamic-theme/', description: 'Dynamic theme engine · CSS parsing + color regeneration', meta: '<span class="accent">Core</span> · src/inject/dynamic-theme/index.ts'},
                        {icon: '🖼', iconTone: 'is-module', title: 'image.ts', description: 'Image processing · invert/brightness/grayscale', meta: '<span class="accent">Core</span> · src/inject/dynamic-theme/image.ts'},
                        {icon: '🔍', iconTone: 'is-module', title: 'selectors.ts', description: 'CSS selector parsing + invert-color matching', meta: '<span class="accent">Core</span> · src/inject/dynamic-theme/selectors.ts'},
                        {icon: '🛡', iconTone: 'is-module', title: 'mv3-proxy.ts', description: 'MV3 resource proxy · cross-origin fonts/CORS', meta: '<span class="accent">Core</span> · src/inject/dynamic-theme/mv3-proxy.ts'},
                        {icon: '🪞', iconTone: 'is-module', title: 'svg-filter.ts', description: 'SVG filter fallback · invert matrix', meta: '<span class="accent">Core</span> · src/inject/svg-filter.ts'},
                        {icon: '🎯', iconTone: 'is-module', title: 'detector.ts', description: 'Page state detection · dark/dynamic/sensitive', meta: '<span class="accent">Core</span> · src/inject/detector.ts'},
                    ],
                },
                {
                    id:    'src-ui',
                    kind:  'items',
                    icon:  '🖥',
                    title: 'ui — popup / options / devtools (1)',
                    items: [
                        {icon: '🪟', iconTone: 'is-module', title: 'popup/', description: 'Toolbar popup · theme/site toggle', meta: '<span class="accent">UI</span> · src/ui/popup/index.tsx'},
                        {icon: '⚙️', iconTone: 'is-module', title: 'options/', description: 'Full settings page · about/activation/advanced/...', meta: '<span class="accent">UI</span> · src/ui/options/index.tsx'},
                        {icon: '🧪', iconTone: 'is-module', title: 'devtools/', description: 'DevTools panel · per-site config editor', meta: '<span class="accent">UI</span> · src/ui/devtools/index.tsx'},
                        {icon: '✏️', iconTone: 'is-module', title: 'stylesheet-editor/', description: 'CSS override editor · devtools subpage', meta: '<span class="accent">UI</span> · src/ui/stylesheet-editor/index.tsx'},
                        {icon: '🧩', iconTone: 'is-module', title: 'controls/', description: 'Shared controls · button/slider/color-picker', meta: '<span class="accent">UI</span> · src/ui/controls/index.ts'},
                        {icon: '🔌', iconTone: 'is-module', title: 'connect/', description: 'UI ↔ background bridge · connector', meta: '<span class="accent">UI</span> · src/ui/connect/connector.ts'},
                    ],
                },
                {
                    id:    'src-generators-api',
                    kind:  'items',
                    icon:  '🧬',
                    title: 'generators + api (2)',
                    items: [
                        {icon: '🧬', iconTone: 'is-module', title: 'generators/', description: 'Theme generators · dynamic/static/svg-filter/css-filter', meta: '<span class="accent">Core</span> · src/generators/theme-engines.ts'},
                        {icon: '🌐', iconTone: 'is-module', title: 'api/', description: 'Public Dark Reader API · third-party page mounting', meta: '<span class="accent">Public</span> · src/api/index.ts'},
                        {icon: '🪙', iconTone: 'is-module', title: 'api/fetch.ts', description: 'Fetch interception · custom fetch method', meta: '<span class="accent">Public</span> · src/api/fetch.ts'},
                        {icon: '🧩', iconTone: 'is-module', title: 'api/chrome.ts', description: 'chrome.* adapter · for api bundle', meta: '<span class="accent">Public</span> · src/api/chrome.ts'},
                    ],
                },
                {
                    id:    'src-config-utils-locales',
                    kind:  'items',
                    icon:  '🗂',
                    title: 'config + utils + _locales + stubs (4)',
                    items: [
                        {icon: '🗂', iconTone: 'is-module', title: 'config/', description: 'Per-site fix config · dynamic-theme/inversion/dark-sites', meta: '<span class="accent">Data</span> · src/config/'},
                        {icon: '🛠', iconTone: 'is-module', title: 'utils/', description: 'Shared utils · state-manager/platform/media-query/network', meta: '<span class="accent">Util</span> · src/utils/'},
                        {icon: '🌍', iconTone: 'is-module', title: '_locales/', description: 'i18n message store · en / zh-CN', meta: '<span class="accent">i18n</span> · src/_locales/'},
                        {icon: '🧱', iconTone: 'is-module', title: 'stubs/', description: 'Build-time placeholders · MV2/MV3/Plus platform differences', meta: '<span class="accent">Stub</span> · src/stubs/'},
                        {icon: '🟢', iconTone: 'is-module', title: 'defaults.ts', description: 'Default Theme + UserSettings', meta: '<span class="accent">Entry</span> · src/defaults.ts'},
                        {icon: '🟢', iconTone: 'is-module', title: 'manifest*.json', description: '4 manifest variants · MV2/MV3/Firefox/Thunderbird', meta: '<span class="accent">Entry</span> · src/manifest*.json'},
                    ],
                },
            ],
        },
    ],

    footerLinks: [
        {label: 'CLAUDE.md', href: '../CLAUDE.md', targetBlank: true},
        {label: 'README.md', href: '../README.md', targetBlank: true},
        {label: 'CHANGELOG.md', href: '../CHANGELOG.md', targetBlank: true},
        {label: 'CONTRIBUTING.md', href: '../CONTRIBUTING.md', targetBlank: true},
    ],
};
