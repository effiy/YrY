/**
 * YiPot · Dashboard data model
 * --------------------------------------------------------------------------
 * Emitted by rui-init-generate (step ③ of the rui-init pipeline) from
 * the freshly rebuilt CLAUDE.md + README.md. Consumed by index.html
 * (Vue 3 template) and index.js (sceneCardFor dispatch).
 *
 * Shape reference: /Users/ruiyi/YrY/.claude/skills/rui-init/templates/data.js
 */
window.HELP_CONFIG = {
    titleIcon:    '🌐',
    title:        'YiPot',
    tagline:      'A cross-platform selection translator — Tauri desktop app for translation, OCR, TTS, and vocabulary collection, with an external HTTP invocation interface and a plugin system.',
    backTopLabel: 'Back to Top',
    footerNote:   'Initialized by rui-init · detect → explore → generate → arch → verify · /rui-init',

    breadcrumb: [
        {label: 'YiPot', href: '../README.md'},
        {label: 'Documentation Center'},
    ],

    stats: [
        {value: '33', label: 'Runtime Deps',  modifier: 'cyan',   sub: 'react · tauri · tesseract.js'},
        {value: '8',  label: 'Dev Deps',      modifier: 'cyan',   sub: 'vite · tailwind · prettier'},
        {value: '5',  label: 'Arch scenes',   modifier: 'accent', sub: 'docs/arch/'},
        {value: '6',  label: 'Self-test scenes', modifier: 'accent', sub: 'docs/self-test/'},
        {value: '40', label: 'Service plugins', modifier: 'cyan', sub: 'translate + ocr + tts + collection'},
        {value: '13', label: 'Tauri commands', modifier: 'accent', sub: 'Rust src-tauri/src/'},
    ],

    panelHub: {
        label: {text: '📊', panel: 'reports', title: 'Story directories'},
        targetBlank: true,
        buttons: [
            {icon: '🏛', name: 'Architecture', desc: 'Markdown scenes', color: 'var(--rui-accent)', panel: 'arch'},
            {icon: '📁', name: 'Files Report', desc: 'Codebase analysis', color: 'var(--rui-accent)', panel: 'files'},
            {icon: '✅', name: 'Self-test',    desc: 'Self-check strategy', color: 'var(--rui-cyan)', panel: 'self-test', targetBlank: false},
        ],
        flow: 'Module location → Data flow → Newcomer onboarding → Dependency impact → Trust boundary',
        urls: {
            arch:        'arch/index.html',
            files:         'files/index.html',
            'self-test': 'self-test/index.html',
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
            meta:  '33 runtime · 8 dev deps',
            groups: [
                {
                    id:    'deps-runtime',
                    kind:  'items',
                    icon:  '📦',
                    title: 'Runtime Dependencies (top 14)',
                    items: [
                        {icon: 'R', iconTone: 'is-module', title: 'react / react-dom 18.3.1',  description: 'UI runtime · <strong>Core UI</strong>', meta: '<span class="accent">Runtime</span> · ^18.3.1'},
                        {icon: 'T', iconTone: 'is-module', title: '@tauri-apps/api 1.6.0',     description: 'JS bridge to Rust shell · <strong>IPC</strong>', meta: '<span class="accent">Runtime</span> · ^1.6.0'},
                        {icon: 'N', iconTone: 'is-module', title: '@nextui-org/react 2.4.8',   description: 'Component library · <strong>HeroUI v2</strong>', meta: '<span class="accent">Runtime</span> · ^2.4.8'},
                        {icon: 'J', iconTone: 'is-module', title: 'jotai 2.10.1',              description: 'Atom-based state · <strong>Lightweight</strong>', meta: '<span class="accent">Runtime</span> · ^2.10.1'},
                        {icon: 'P', iconTone: 'is-module', title: 'react-router-dom 6.27.0',   description: 'In-window routing · <strong>v6 data APIs</strong>', meta: '<span class="accent">Runtime</span> · ^6.27.0'},
                        {icon: 'I', iconTone: 'is-module', title: 'i18next 23.16.4 / react-i18next 15.1', description: 'i18n · <strong>20 locales</strong>', meta: '<span class="accent">Runtime</span> · ^23/^15'},
                        {icon: 'O', iconTone: 'is-module', title: 'tesseract.js 5.1.1',        description: 'WASM OCR fallback · <strong>Browser-side</strong>', meta: '<span class="accent">Runtime</span> · ^5.1.1'},
                        {icon: 'Q', iconTone: 'is-module', title: 'jsqr 1.4.0',                description: 'QR / barcode scan · <strong>image data</strong>', meta: '<span class="accent">Runtime</span> · ^1.4.0'},
                        {icon: 'C', iconTone: 'is-module', title: 'crypto-js 4.2.0',           description: 'Symmetric encryption · <strong>config storage</strong>', meta: '<span class="accent">Runtime</span> · ^4.2.0'},
                        {icon: 'J', iconTone: 'is-module', title: 'jose 5.9.6',                description: 'JOSE / JWT · <strong>openai-like auth</strong>', meta: '<span class="accent">Runtime</span> · ^5.9.6'},
                        {icon: 'M', iconTone: 'is-module', title: 'md5 2.3.0',                 description: 'Hash helper · <strong>lingva TTS</strong>', meta: '<span class="accent">Runtime</span> · ^2.3.0'},
                        {icon: 'R', iconTone: 'is-module', title: 'react-markdown 9.0.1',      description: 'Markdown render · <strong>history view</strong>', meta: '<span class="accent">Runtime</span> · ^9.0.1'},
                        {icon: 'F', iconTone: 'is-module', title: 'framer-motion 11.11.10',    description: 'Animation library · <strong>drives UI motion</strong>', meta: '<span class="accent">Runtime</span> · ^11.11.10'},
                        {icon: 'O', iconTone: 'is-module', title: 'ollama 0.5.9',              description: 'Local LLM client · <strong>offline translation</strong>', meta: '<span class="accent">Runtime</span> · ^0.5.9'},
                    ],
                },
                {
                    id:    'deps-dev',
                    kind:  'items',
                    icon:  '🛠',
                    title: 'Dev Dependencies (8)',
                    items: [
                        {icon: '⚡', iconTone: 'is-module', title: 'vite 5.4.10',                  description: 'Bundler + dev server · <strong>port 1420</strong>', meta: '<span class="accent">Dev</span> · ^5.4.10'},
                        {icon: 'T', iconTone: 'is-module', title: '@tauri-apps/cli 1.6.3',         description: 'Tauri CLI · <strong>desktop build</strong>', meta: '<span class="accent">Dev</span> · ^1.6.3'},
                        {icon: 'T', iconTone: 'is-module', title: 'typescript 5.6.3',              description: 'Type system · <strong>strict</strong>', meta: '<span class="accent">Dev</span> · ^5.6.3'},
                        {icon: 'T', iconTone: 'is-module', title: 'tailwindcss 3.4.14',            description: 'Utility CSS · <strong>PostCSS pipeline</strong>', meta: '<span class="accent">Dev</span> · ^3.4.14'},
                        {icon: 'A', iconTone: 'is-module', title: 'autoprefixer 10.4.20',          description: 'CSS vendor prefixing · <strong>WebView2</strong>', meta: '<span class="accent">Dev</span> · ^10.4.20'},
                        {icon: 'P', iconTone: 'is-module', title: 'postcss 8.4.47',                description: 'CSS transform · <strong>tailwind pipeline</strong>', meta: '<span class="accent">Dev</span> · ^8.4.47'},
                        {icon: 'P', iconTone: 'is-module', title: 'prettier 3.3.2',                description: 'Code formatter · <strong>.prettierrc.json</strong>', meta: '<span class="accent">Dev</span> · 3.3.2'},
                        {icon: 'N', iconTone: 'is-module', title: 'node-fetch 3.3.2 (dev)',        description: 'Updater scripts · <strong>github release fetch</strong>', meta: '<span class="accent">Dev</span> · ^3.3.2'},
                    ],
                },
            ],
        },

        // ── § 2 · Story documents & scenes ─────────────────────────────
        {
            id:    'section-stories',
            badge: '2',
            title: 'Story Documents & Scenes',
            meta:  '2 stories · 11 scenes · rui-init verify 7/7',
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
                            description: 'Tauri + React dual-layer structure · <strong>5 verification scenes</strong> · trust boundary + dependency-change impact',
                            sceneLinks: [
                                {label: '1. Module Location',   href: 'arch/scene-1-module-location/index.md'},
                                {label: '2. Data Flow Tracing',  href: 'arch/scene-2-data-flow-tracing/index.md'},
                                {label: '3. Newcomer Onboarding', href: 'arch/scene-3-newcomer-onboarding/index.md'},
                                {label: '4. Dependency Impact',  href: 'arch/scene-4-dependency-change-impact/index.md'},
                                {label: '5. Security Surface',   href: 'arch/scene-5-trust-boundary-security-surface/index.md'},
                            ],
                            links: [
                                {label: 'Architecture Dashboard →', href: 'arch/index.html'},
                            ],
                            meta: '5 scenes · risk: medium · plugin architecture + 5 windows',
                        },
                        {
                            icon:        '✅',
                            title:       'Automated Self-Check Suite',
                            badge:       '6 scenes',
                            description: 'rui-init verify 7-point gate · <strong>6 test scenes</strong> · cross-story integration + third-party service health',
                            sceneLinks: [
                                {label: '1. Post-Init Self-Check',  href: 'self-test/scene-1-post-init-full-self-check/index.md'},
                                {label: '2. Pre-Commit Self-Check', href: 'self-test/scene-2-pre-commit-incremental-self-check/index.md'},
                                {label: '3. Doc Consistency',      href: 'self-test/scene-3-doc-code-consistency/index.md'},
                                {label: '4. Security Regression',   href: 'self-test/scene-4-security-surface-regression/index.md'},
                                {label: '5. Integration Regression', href: 'self-test/scene-5-cross-story-integration-regression/index.md'},
                                {label: '6. Third-Party Services', href: 'self-test/scene-6-third-party-framework-service/index.md'},
                            ],
                            links: [
                                {label: 'Self-test Dashboard →', href: 'self-test/index.html'},
                            ],
                            meta: '6 scenes · risk: low · 40 service plugins × 3 platforms',
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
            meta:  '12 top-level modules · 40 service plugins · 13 Rust commands',
            groups: [
                {
                    id:    'src-services-translate',
                    kind:  'items',
                    icon:  '🔁',
                    title: 'services/translate — 22 translation plugins',
                    items: [
                        {icon: '🤖', iconTone: 'is-module', title: 'openai / ollama / chatglm / geminipro',  description: 'OpenAI-compatible LLM · 4 plugins', meta: '<span class="accent">LLM</span> · src/services/translate/'},
                        {icon: '🌐', iconTone: 'is-module', title: 'google / bing / deepl / youdao / baidu', description: 'General machine translation · 5 plugins', meta: '<span class="accent">MT</span> · src/services/translate/'},
                        {icon: '📚', iconTone: 'is-module', title: 'baidu_field / cambridge_dict / bing_dict / ecdict / niutrans / transmart / volcengine / yandex / caiyun / alibaba / lingva / tencent', description: 'Domain-specific translation + dictionaries · 13 plugins', meta: '<span class="accent">Domain</span> · src/services/translate/'},
                    ],
                },
                {
                    id:    'src-services-recognize',
                    kind:  'items',
                    icon:  '🔍',
                    title: 'services/recognize — 15 OCR plugins',
                    items: [
                        {icon: '🛰', iconTone: 'is-module', title: 'baidu / baidu_accurate / baidu_img / tencent / tencent_accurate / tencent_img', description: 'China cloud OCR · 6 plugins', meta: '<span class="accent">Cloud</span> · src/services/recognize/'},
                        {icon: '🎙', iconTone: 'is-module', title: 'iflytek / iflytek_intsig / iflytek_latex / volcengine / volcengine_multi_lang', description: 'iFlytek + Volcengine · 5 plugins', meta: '<span class="accent">Speech/IMG</span> · src/services/recognize/'},
                        {icon: '🧮', iconTone: 'is-module', title: 'simple_latex / qrcode / system / tesseract', description: 'Local + formula + QR · 4 plugins', meta: '<span class="accent">Local</span> · src/services/recognize/'},
                    ],
                },
                {
                    id:    'src-services-others',
                    kind:  'items',
                    icon:  '🔌',
                    title: 'services — tts / collection / entry',
                    items: [
                        {icon: '🔊', iconTone: 'is-module', title: 'tts/lingva',  description: 'Speech synthesis · 1 plugin', meta: '<span class="accent">TTS</span> · src/services/tts/'},
                        {icon: '📇', iconTone: 'is-module', title: 'collection/anki / collection/eudic', description: 'Vocabulary books · 2 plugins', meta: '<span class="accent">Vocab</span> · src/services/collection/'},
                        {icon: '📜', iconTone: 'is-module', title: 'services/index.jsx', description: 'Barrel export for the three services · <strong>plugin registration</strong>', meta: '<span class="accent">Index</span> · src/services/{translate,recognize,tts,collection}/index.jsx'},
                        {icon: '🪪', iconTone: 'is-module', title: 'info.ts / Config.jsx', description: 'Per-plugin language table + settings panel', meta: '<span class="accent">Plugin</span> · per-service'},
                    ],
                },
                {
                    id:    'src-utils-hooks-i18n',
                    kind:  'items',
                    icon:  '🧰',
                    title: 'utils / hooks / i18n / components',
                    items: [
                        {icon: '🗄', iconTone: 'is-module', title: 'utils/store.js', description: 'tauri-plugin-store singleton · <strong>fs-watch hot reload</strong>', meta: '<span class="accent">State</span> · src/utils/store.js'},
                        {icon: '🌍', iconTone: 'is-module', title: 'utils/env.js',   description: 'Runtime platform detection (os / arch)', meta: '<span class="accent">Env</span> · src/utils/env.js'},
                        {icon: '🔌', iconTone: 'is-module', title: 'utils/invoke_plugin.js', description: 'Load .potext external plugins', meta: '<span class="accent">Plugin</span> · src/utils/invoke_plugin.js'},
                        {icon: '🈶', iconTone: 'is-module', title: 'utils/lang_detect.js + language.ts', description: 'JS-side language detection · mirrors Rust', meta: '<span class="accent">i18n</span> · src/utils/'},
                        {icon: '🪝', iconTone: 'is-module', title: 'hooks/ — useConfig · useVoice · useSyncAtom · useToastStyle · useTtsPluginInfo · useGetState', description: '6 composition hooks', meta: '<span class="accent">Hook</span> · src/hooks/'},
                        {icon: '🗣', iconTone: 'is-module', title: 'i18n/ — i18next bootstrap + 20 locales', description: 'en_US · zh_CN · ja_JP · ar_AE · fa_IR · ...', meta: '<span class="accent">Locale</span> · src/i18n/'},
                        {icon: '🪟', iconTone: 'is-module', title: 'components/WindowControl', description: 'Window control buttons (min / max / close)', meta: '<span class="accent">UI</span> · src/components/WindowControl/'},
                    ],
                },
                {
                    id:    'src-window',
                    kind:  'items',
                    icon:  '🪟',
                    title: 'window/ — 5 OS windows',
                    items: [
                        {icon: '🟢', iconTone: 'is-module', title: 'Translate/index.jsx',     description: 'Main translate window · drag + blur-to-close', meta: '<span class="accent">Window</span> · src/window/Translate/'},
                        {icon: '🟢', iconTone: 'is-module', title: 'Recognize/index.jsx',     description: 'OCR recognition window · image area + text area', meta: '<span class="accent">Window</span> · src/window/Recognize/'},
                        {icon: '🟢', iconTone: 'is-module', title: 'Screenshot/index.jsx',    description: 'Screenshot annotation window', meta: '<span class="accent">Window</span> · src/window/Screenshot/'},
                        {icon: '🟢', iconTone: 'is-module', title: 'Config/index.jsx',        description: 'Settings window · 8 pages (General/Service/Hotkey/...)', meta: '<span class="accent">Window</span> · src/window/Config/'},
                        {icon: '🟢', iconTone: 'is-module', title: 'Updater/index.jsx',       description: 'Update prompt window', meta: '<span class="accent">Window</span> · src/window/Updater/'},
                        {icon: '🌐', iconTone: 'is-module', title: 'App.jsx + main.jsx',      description: 'windowMap[appWindow.label] routing + React mount', meta: '<span class="accent">Entry</span> · src/'},
                    ],
                },
                {
                    id:    'src-tauri',
                    kind:  'items',
                    icon:  '🦀',
                    title: 'src-tauri/ — Rust backend',
                    items: [
                        {icon: '🟢', iconTone: 'is-module', title: 'main.rs',            description: 'Tauri builder · plugin registration · setup', meta: '<span class="accent">Entry</span> · src-tauri/src/main.rs'},
                        {icon: '🌐', iconTone: 'is-module', title: 'server.rs',          description: 'tiny_http · external invocation service (default :60828)', meta: '<span class="accent">Net</span> · src-tauri/src/server.rs'},
                        {icon: '⚙️', iconTone: 'is-module', title: 'cmd.rs',             description: '13 #[tauri::command] entry points', meta: '<span class="accent">IPC</span> · src-tauri/src/cmd.rs'},
                        {icon: '⌨️', iconTone: 'is-module', title: 'hotkey.rs',          description: 'global-shortcut registration', meta: '<span class="accent">Input</span> · src-tauri/src/hotkey.rs'},
                        {icon: '📋', iconTone: 'is-module', title: 'clipboard.rs',       description: 'arboard · system clipboard read/write', meta: '<span class="accent">OS</span> · src-tauri/src/clipboard.rs'},
                        {icon: '📷', iconTone: 'is-module', title: 'screenshot.rs',      description: 'screenshots crate · full-screen capture', meta: '<span class="accent">OS</span> · src-tauri/src/screenshot.rs'},
                        {icon: '🔤', iconTone: 'is-module', title: 'system_ocr.rs',      description: 'macOS Vision · Windows.Media.Ocr · platform OCR', meta: '<span class="accent">OCR</span> · src-tauri/src/system_ocr.rs'},
                        {icon: '🈶', iconTone: 'is-module', title: 'lang_detect.rs',     description: 'lingua crate · Rust-side language detection', meta: '<span class="accent">NLP</span> · src-tauri/src/lang_detect.rs'},
                        {icon: '📀', iconTone: 'is-module', title: 'backup.rs',          description: 'Aliyun OSS + WebDAV backup', meta: '<span class="accent">Cloud</span> · src-tauri/src/backup.rs'},
                        {icon: '🔼', iconTone: 'is-module', title: 'updater.rs',         description: 'Built-in updater (tauri-plugin)', meta: '<span class="accent">OTA</span> · src-tauri/src/updater.rs'},
                        {icon: '📋', iconTone: 'is-module', title: 'tray.rs / window.rs / config.rs / error.rs', description: 'System tray / multi-window management / config init / error types', meta: '<span class="accent">Misc</span> · src-tauri/src/'},
                    ],
                },
            ],
        },
    ],

    footerLinks: [
        {label: 'CLAUDE.md',     href: '../CLAUDE.md',     targetBlank: true},
        {label: 'README.md',     href: '../README.md',     targetBlank: true},
        {label: 'Architecture',  href: 'arch/index.html',  targetBlank: true},
        {label: 'Self-test',     href: 'self-test/index.html'},
    ],
};
