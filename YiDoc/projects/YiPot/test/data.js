/**
 * yry-report-test — YiPot test coverage / self-check report
 * ----------------------------------------------------------------------
 * Project: YiPot (Tauri 1.8 + React 18 desktop translation tool)
 * Source: /Users/ruiyi/Downloads/YrY/YiPot
 * Generated: 2026-07-24
 *
 * Schema source: YiDoc/templates/test/data.js (@data_shape).
 * The shell lives in YiDoc/templates/test/ — referenced from this
 * directory; only data.js varies per project.
 *
 * Note: YiPot ships no automated test framework (no vitest/jest config,
 * 0 test files). The 6 scenes under test/scene-N are manual self-check
 * protocols that read the source tree + docs catalog. Composite score
 * reflects the absence of executable coverage — every scene is a manual
 * procedure, none can be auto-run.
 */
window.REPORT_CONFIG = {
    options: {
        scope: '/Users/ruiyi/Downloads/YrY/YiPot',
        scopeTitle: 'YiPot',
        generatedAt: '2026-07-24T15:45:00.000Z',
        theme: 'dark',
        mergeScenes: true,
        version: '1.0',
    },
    constants: {
        sceneCount: 6,
        passThreshold: 0.9,
        partialThreshold: 0.5,
        exclusionDirs: [
            'node_modules', '.git', 'dist', 'build', '.next', '.turbo',
            'coverage', '.memory', '.claude', 'target', 'intermediate',
            'src-tauri/target',
        ],
    },
    labels: {
        compositeScoreLabel: 'Composite Test Score',
        gradeLabel: 'Grade',
        verdictLabel: 'Verdict',
        coverageLabel: 'Coverage',
        passCountLabel: 'Scenes Passed',
        partialCountLabel: 'Scenes Partial',
        failCountLabel: 'Scenes Failed',
    },
};

window.REPORT_DATA = {
    scope: '/Users/ruiyi/Downloads/YrY/YiPot',
    score: 25,
    grade: 'F',
    summary: {
        totalScenes: 6,
        passCount: 0,
        partialCount: 4,
        failCount: 2,
        coverage: 0.25,
        totalFiles: 201,
        totalBytes: 0,
        note: 'YiPot has no automated test framework. The 6 scenes are manual self-check protocols; none can be auto-run, so coverage reflects documented procedure coverage, not executed test coverage.',
    },

    facets: {
        init:    { hasClaude: true, hasReadme: true, hasDocs: true, hasTests: false, hasPackageJson: true, hasPyproject: false, hasGoMod: false, hasCargoToml: true, totalFiles: 201, totalBytes: 0 },
        tests:   { framework: null, testFileCount: 0, testFiles: [], hasFramework: false, note: 'package.json has no scripts.test; no vitest/jest config present' },
        docs:    { docCount: 12, codeCount: 201, docRatio: 0.06, files: ['CLAUDE.md', 'README.md', 'docs/', 'arch/scene-1..5', 'test/scene-1..6'], missingReadme: false, missingClaude: false, hasDocsDir: true },
        security:{ envFileCount: 0, envFiles: [], dangerousCallCount: 5, dangerousCalls: ['run_binary (arbitrary exec)', 'install_plugin (zip-slip)', 'webdav (credential IPC)', 'aliyun (SSRF)', 'tiny_http open listener'], hasEnvFile: false },
        refs:    { storyDirCount: 11, totalLinks: 60, brokenLinks: 0, brokenLinkDetails: [], note: '5 arch + 6 test scene dirs all carry index.md' },
        deps:    { runtimeCount: 33, devCount: 7, totalCount: 40, pinningRatio: 1.0, pinned: ['react@^18.3.1', '@tauri-apps/api@^1.6.0', 'tauri-plugin-*-api (v1 GitHub pins)'], unpinned: [], stale: [], note: 'Tauri 1.8 plugin ecosystem frozen by design' },
    },

    inventory: {
        totalFiles: 201,
        totalBytes: 0,
        items: [
            { group: 'JSX (React)', count: 141, pct: 70.1, bytes: 0 },
            { group: 'Rust',        count: 14,  pct: 7.0,  bytes: 0 },
            { group: 'TypeScript',  count: 41,  pct: 20.4, bytes: 0 },
            { group: 'JavaScript',  count: 5,   pct: 2.5,  bytes: 0 },
        ],
    },

    compliance: [
        { framework: 'OWASP ASVS 4.0', area: 'Supply Chain & Configuration', controls: [
            { id: '14.1.1', text: 'Dependency pinning', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
            { id: '14.4.1', text: 'Plugin archive extraction safety (zip-slip)', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
        ]},
        { framework: 'NIST SSDF', area: 'Testing & Verification', controls: [
            { id: 'PS.3.1', text: 'Automated test coverage', sceneSlug: 'pre-commit-incremental-self-check', sceneIndex: 2 },
        ]},
    ],

    riskRegister: [
        { id: 'R1', severity: 'high',   likelihood: 'high',   effort: 'high',   title: 'No automated test framework',     description: 'package.json has no scripts.test; 0 test files; regression risk on Tauri IPC bridge undetected until runtime', sceneIndex: 2, mitigation: 'Stand up Vitest harness around 21 translate engines + Tauri command wrappers' },
        { id: 'R2', severity: 'high',   likelihood: 'medium', effort: 'medium', title: 'Single-author bus factor',       description: '100% of recent commits from one author; no review process', sceneIndex: 5, mitigation: 'Introduce PR review requirement; pair on Tauri IPC changes' },
        { id: 'R3', severity: 'medium', likelihood: 'high',   effort: 'medium', title: 'Local HTTP bridge unauthenticated', description: 'tiny_http on 127.0.0.1:60828 exposes translate/OCR routes with no auth', sceneIndex: 4, mitigation: 'Per-session token in Authorization header or Unix domain socket' },
        { id: 'R4', severity: 'medium', likelihood: 'medium', effort: 'low',    title: 'Updater path fork',             description: 'updater.mjs and updater-for-fix-runtime.mjs coexist', sceneIndex: 6, mitigation: 'Consolidate onto one updater entry; delete the fix-runtime variant' },
        { id: 'R5', severity: 'low',    likelihood: 'medium', effort: 'low',    title: 'Doc-code drift',                description: 'Engine count, module paths, or config keys may drift from CLAUDE.md / README.md', sceneIndex: 3, mitigation: 'Run doc-code consistency scene on every release tag' },
    ],

    glossary: [
        { term: 'Tauri IPC', definition: 'JS → Rust bridge via @tauri-apps/api invoke(); #[tauri::command] handlers registered in main.rs' },
        { term: 'tiny_http bridge', definition: 'Local HTTP server on 127.0.0.1:60828 that OS clipboard / hotkey integrations call into' },
        { term: 'Service engine', definition: 'Self-contained directory under src/services/<kind>/<engine>/ with Config.jsx + index.jsx + info.ts' },
        { term: 'Self-check scene', definition: 'Manual verification protocol documented under test/scene-N-<slug>/index.md; not auto-executable' },
    ],

    roadmap: [
        { id: 'S1', title: 'Vitest harness + engine contract tests', theme: 'Coverage foundation', goal: 'Reach 20% test ratio', expectedDelta: '+15 composite score', itemCount: 3, items: [
            { id: 'S1.1', severity: 'high',   effort: 'medium', sceneIndex: 2, title: 'Install vitest + happy-dom; add scripts.test' },
            { id: 'S1.2', severity: 'high',   effort: 'high',   sceneIndex: 2, title: 'Contract tests for the 21 translate engines (input → output shape)' },
            { id: 'S1.3', severity: 'medium', effort: 'medium', sceneIndex: 4, title: 'Tauri command wrapper tests (mock invoke)' },
        ]},
        { id: 'S2', title: 'Security surface baseline + regression', theme: 'Trust boundary', goal: 'Zero unauth local routes', expectedDelta: '+8 composite score', itemCount: 2, items: [
            { id: 'S2.1', severity: 'high', effort: 'medium', sceneIndex: 4, title: 'Add per-session token to tiny_http server' },
            { id: 'S2.2', severity: 'medium', effort: 'medium', sceneIndex: 4, title: 'Zip-slip guard in install_plugin (canonicalize check)' },
        ]},
        { id: 'S3', title: 'Doc-code consistency CI', theme: 'Drift prevention', goal: '0 broken cross-references', expectedDelta: '+5 composite score', itemCount: 1, items: [
            { id: 'S3.1', severity: 'medium', effort: 'low', sceneIndex: 3, title: 'CI job runs scene-3 checks on every release tag' },
        ]},
        { id: 'S4', title: 'Updater consolidation', theme: 'Maintainability', goal: 'Single updater entry', expectedDelta: '+2 composite score', itemCount: 1, items: [
            { id: 'S4.1', severity: 'low', effort: 'low', sceneIndex: 6, title: 'Delete updater-for-fix-runtime.mjs after runtime patch lands' },
        ]},
    ],

    metrics: {
        totalFiles: 201,
        totalBytes: 0,
        avgBytes: 0,
        medianBytes: 0,
        sizeBuckets: [
            { label: '< 100 LOC',  count: 145, bytes: 0, filePct: 72.1, bytesPct: 0 },
            { label: '100-500 LOC', count: 38,  bytes: 0, filePct: 18.9, bytesPct: 0 },
            { label: '500-1000 LOC',count: 12,  bytes: 0, filePct: 6.0,  bytesPct: 0 },
            { label: '> 1000 LOC',  count: 6,   bytes: 0, filePct: 3.0,  bytesPct: 0 },
        ],
        largest: [
            { path: 'src-tauri/src/system_ocr.rs', bytes: 0 },
            { path: 'src-tauri/src/backup.rs',     bytes: 0 },
            { path: 'src-tauri/src/tray.rs',      bytes: 0 },
            { path: 'src-tauri/src/cmd.rs',       bytes: 0 },
            { path: 'src/App.jsx',                bytes: 0 },
        ],
        topDirs: [
            { dir: 'src/services/translate/',   count: 63, bytes: 0, pct: 31.3 },
            { dir: 'src/services/recognize/',   count: 48, bytes: 0, pct: 23.9 },
            { dir: 'src-tauri/src/',            count: 14, bytes: 0, pct: 7.0 },
            { dir: 'src/window/',               count: 30, bytes: 0, pct: 14.9 },
        ],
    },

    activity: {
        recentFileCount: 10,
        recentByteRatio: 0.05,
        buckets: [
            { label: '< 1 day',     count: 10, bytes: 0, filePct: 5.0, bytesPct: 5.0 },
            { label: '1-7 days',    count: 25, bytes: 0, filePct: 12.4, bytesPct: 12.0 },
            { label: '7-30 days',   count: 50, bytes: 0, filePct: 24.9, bytesPct: 24.0 },
            { label: '> 30 days',   count: 116, bytes: 0, filePct: 57.7, bytesPct: 59.0 },
        ],
        freshest: [
            { path: 'YiPot/index.html', ageDays: 0, mtime: '2026-07-24' },
            { path: 'YiPot/updater/updater.mjs', ageDays: 0, mtime: '2026-07-24' },
            { path: 'YiPot/vite.config.js', ageDays: 0, mtime: '2026-07-24' },
        ],
    },

    scenes: [
        {
            index: 1, slug: 'post-init-full-self-check', title: 'Post-Init Full Self-Check',
            icon: '🚀', facet: 'init', coverage: 0.6, verdict: 'partial',
            section0: {
                effect: 'A comprehensive self-check that runs after a fresh yry-init pipeline execution against YiPot, verifying all generated artifacts (CLAUDE.md, README.md, docs/data.js, arch/x5, test/x6) exist and contain project-specific content.',
                matters: 'Without a post-init self-check, silently partial or placeholder output can be accepted as valid.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  A[yry-init] --> B{artifacts exist?}\n  B -- yes --> C[well-formed?]\n  C -- yes --> D[project-specific?]\n  D -- yes --> E((PASS))\n  B -- no --> F((FAIL))',
            },
            section1: { steps: [
                { title: 'Verify CLAUDE.md',  action: 'stat YiPot/CLAUDE.md', expected: 'File exists, > 2KB, mentions YiPot + Tauri 1.8', file: 'CLAUDE.md' },
                { title: 'Verify README.md', action: 'stat YiPot/README.md', expected: 'File exists, has System View + Domain Language sections', file: 'README.md' },
                { title: 'Verify docs home',  action: 'stat YiDoc/projects/YiPot/{data.js,index.html,index.css,index.js}', expected: 'All 4 files exist', file: 'data.js' },
                { title: 'Verify arch scenes', action: 'ls YiDoc/projects/YiPot/arch/scene-{1..5}/index.md', expected: '5 scene files', file: 'arch/' },
                { title: 'Verify test scenes', action: 'ls YiDoc/projects/YiPot/test/scene-{1..6}/index.md', expected: '6 scene files', file: 'test/' },
            ]},
            section2: { outputs: [
                { path: 'YiPot/CLAUDE.md', type: 'doc', description: 'Project source-of-truth' },
                { path: 'YiDoc/projects/YiPot/data.js', type: 'data', description: 'Dashboard data' },
                { path: 'YiDoc/projects/YiPot/arch/scene-1..5/index.md', type: 'story', description: 'Architecture scenes' },
                { path: 'YiDoc/projects/YiPot/test/scene-1..6/index.md', type: 'story', description: 'Self-check scenes' },
            ]},
            section3: { report: [
                { step: 'Verify CLAUDE.md', result: 'pass', notes: 'Present, 8.5KB, mentions YiPot + Tauri 1.8 + 21 engines' },
                { step: 'Verify README.md', result: 'pass', notes: 'Present with System View + Domain Language' },
                { step: 'Verify docs home', result: 'pass', notes: 'All 4 files present in YiDoc/projects/YiPot/' },
                { step: 'Verify arch scenes', result: 'pass', notes: '5 scenes present' },
                { step: 'Verify test scenes', result: 'partial', notes: '6 scenes present but only index.md — no executable test code' },
            ], overall: 'partial — artifacts present, but no executable tests behind the scenes' },
            section4: { edgeCases: ['Fresh clone with no YiDoc/ catalog yet', 'Partial yry-init that wrote some files then crashed'], improvements: ['Add a checksum compare against last successful init'], limitations: ['Cannot verify semantic correctness, only file presence'] },
            evidence: [
                { label: 'CLAUDE.md size', value: '8.5KB' },
                { label: 'Arch scenes', value: '5' },
                { label: 'Test scenes', value: '6' },
                { label: 'Docs home files', value: '4/4' },
            ],
        },
        {
            index: 2, slug: 'pre-commit-incremental-self-check', title: 'Pre-Commit Incremental Self-Check',
            icon: '⚡', facet: 'tests', coverage: 0.0, verdict: 'fail',
            section0: {
                effect: 'A lightweight self-check that runs before every git commit, focused on what changed in the staging area. Sub-second verification that catches regressions before they land.',
                matters: 'Full self-checks (scene 1) take 30+ seconds; a pre-commit check must be fast enough to run on every commit without disrupting flow.',
            },
            section1: { steps: [
                { title: 'Detect staged files', action: 'git diff --cached --name-only', expected: 'List of staged paths' },
                { title: 'Map to overlapping checks', action: 'match staged paths against scene coverage', expected: 'Subset of scenes to run' },
                { title: 'Run fast-pass', action: 'execute only the overlapping checks', expected: 'Pass or block verdict in < 1s' },
            ]},
            section2: { outputs: [
                { path: '.git/hooks/pre-commit', type: 'hook', description: 'Git hook that runs the incremental check' },
            ]},
            section3: { report: [
                { step: 'Detect staged files', result: 'fail', notes: 'No .git/hooks/pre-commit installed; no scripts.test in package.json' },
                { step: 'Map to overlapping checks', result: 'fail', notes: 'No check registry exists' },
                { step: 'Run fast-pass', result: 'fail', notes: 'Cannot run — no harness' },
            ], overall: 'fail — no pre-commit hook, no test harness, no fast-pass possible' },
            section4: { edgeCases: ['Staged file is a rename', 'Staged file is in node_modules'], improvements: ['Install a pre-commit hook that shells out to vitest --onlyChanged'], limitations: ['Without a test runner the incremental check cannot exist'] },
            evidence: [
                { label: 'pre-commit hook', value: 'absent' },
                { label: 'scripts.test', value: 'absent' },
                { label: 'vitest config', value: 'absent' },
            ],
        },
        {
            index: 3, slug: 'doc-code-consistency', title: 'Doc-Code Consistency',
            icon: '🔍', facet: 'docs', coverage: 0.7, verdict: 'partial',
            section0: {
                effect: 'Systematic check that YiPot documentation (CLAUDE.md, README.md, docs/data.js, arch + test scenes) accurately reflects the current state of the source code.',
                matters: 'Doc-code drift happens silently — a service engine added but not listed in data.js, a Rust module renamed but README.md still references the old name.',
            },
            section1: { steps: [
                { title: 'Engine count match', action: 'count src/services/translate/* vs CLAUDE.md claim', expected: '21 engines in both' },
                { title: 'Rust module list', action: 'compare src-tauri/src/*.rs vs README.md', expected: '14 modules listed' },
                { title: 'Domain language', action: 'verify config store keys vs README.md glossary', expected: 'All keys documented' },
            ]},
            section2: { outputs: [
                { path: 'YiDoc/projects/YiPot/test/scene-3-doc-code-consistency/index.md', type: 'story', description: 'This scene' },
            ]},
            section3: { report: [
                { step: 'Engine count match', result: 'pass', notes: '21 translate engines in src/ and CLAUDE.md' },
                { step: 'Rust module list', result: 'pass', notes: '14 modules in src-tauri/src/ and README' },
                { step: 'Domain language', result: 'partial', notes: 'Most keys documented; some new keys may have drifted since last yry-init' },
            ], overall: 'partial — structure matches; semantic drift not machine-verified' },
            section4: { edgeCases: ['Engine directory exists but info.ts missing', 'Rust module compiled out via cfg'], improvements: ['Generate CLAUDE.md engine list from src/ at build time'], limitations: ['Cannot detect semantic drift without parsing'] },
            evidence: [
                { label: 'Translate engines', value: '21/21' },
                { label: 'Rust modules', value: '14/14' },
                { label: 'Last consistency run', value: 'manual only' },
            ],
        },
        {
            index: 4, slug: 'security-surface-regression', title: 'Security Surface Regression',
            icon: '🛡️', facet: 'security', coverage: 0.4, verdict: 'partial',
            section0: {
                effect: 'Regression test for YiPot security surface. After any code change that touches the Tauri allowlist, HTTP server bridge, clipboard access, or third-party API communication, this scene re-runs the trust boundary audit and compares against baseline.',
                matters: 'Security regressions are silent — a new engine might introduce unauthenticated data exfiltration; a Tauri config change might widen the allowlist.',
            },
            section1: { steps: [
                { title: 'Baseline allowlist', action: 'parse tauri.conf.json allowlist', expected: 'Frozen set of allowed APIs' },
                { title: 'Audit tiny_http routes', action: 'grep server.rs for route → handler mapping', expected: 'All routes require auth' },
                { title: 'Audit engine API calls', action: 'grep src/services/* for fetch() calls', expected: 'No new unauthenticated endpoints' },
            ]},
            section2: { outputs: [
                { path: 'YiDoc/projects/YiPot/test/scene-4-security-surface-regression/index.md', type: 'story', description: 'This scene' },
                { path: 'YiDoc/projects/YiPot/apis/data.js', type: 'data', description: 'API inventory with P0 security alerts' },
            ]},
            section3: { report: [
                { step: 'Baseline allowlist', result: 'pass', notes: 'tauri.conf.json allowlist is frozen; Tauri 1.8 pinned' },
                { step: 'Audit tiny_http routes', result: 'fail', notes: '8 routes on 127.0.0.1:60828 with no auth — P0 in apis/data.js' },
                { step: 'Audit engine API calls', result: 'partial', notes: '21 engines hit remote APIs; some over plain http (alibaba)' },
            ], overall: 'partial — frozen allowlist holds; tiny_http auth gap unfixed; engine API audit is manual' },
            section4: { edgeCases: ['New engine added mid-release', 'tauri.conf.json widened without review'], improvements: ['CI: diff tauri.conf.json allowlist against main'], limitations: ['Cannot detect runtime-only dynamic fetch calls'] },
            evidence: [
                { label: 'tiny_http routes', value: '8 (0 authed)' },
                { label: 'P0 security alerts', value: '5' },
                { label: 'Tauri allowlist', value: 'frozen' },
            ],
        },
        {
            index: 5, slug: 'cross-story-integration-regression', title: 'Cross-Story Integration Regression',
            icon: '🔗', facet: 'refs', coverage: 0.5, verdict: 'partial',
            section0: {
                effect: 'Verification that all 11 scenes (5 arch + 6 test) remain internally consistent with each other. A fix in one scene should not contradict a claim in another.',
                matters: 'Each scene is written independently but references the same codebase. An arch scene saying "15 recognize engines" and a test scene referencing "14 OCR backends" creates confusion.',
            },
            section1: { steps: [
                { title: 'Pairwise scene check', action: 'for each (arch, test) pair, verify shared claims match', expected: 'No contradictions' },
                { title: 'Cross-reference resolution', action: 'verify every scene path reference resolves', expected: '0 broken links' },
            ]},
            section2: { outputs: [
                { path: 'YiDoc/projects/YiPot/test/scene-5-cross-story-integration-regression/index.md', type: 'story', description: 'This scene' },
            ]},
            section3: { report: [
                { step: 'Pairwise scene check', result: 'partial', notes: 'Engine counts consistent across scenes; some qualitative claims drift' },
                { step: 'Cross-reference resolution', result: 'pass', notes: 'All scene path references resolve (11/11)' },
            ], overall: 'partial — structural references resolve; qualitative drift possible' },
            section4: { edgeCases: ['Scene renamed', 'Shared file moved'], improvements: ['Add a scene cross-ref linter'], limitations: ['Cannot detect semantic contradictions without parsing'] },
            evidence: [
                { label: 'Scene pairs checked', value: '11' },
                { label: 'Broken links', value: '0' },
                { label: 'Engine count consistency', value: '21 across scenes' },
            ],
        },
        {
            index: 6, slug: 'third-party-framework-service', title: 'Third-Party Framework & Service Health',
            icon: '🌐', facet: 'deps', coverage: 0.5, verdict: 'partial',
            section0: {
                effect: 'Health monitoring protocol for YiPot third-party dependencies and external services: (1) framework health — React, Tauri, Vite, NextUI, Tailwind, Jotai; (2) service engine health — 21 translate + 16 OCR + 1 TTS + 2 collection engines; (3) infrastructure health — config store, SQLite plugin, fs-watch, HTTP server bridge.',
                matters: 'YiPot aggregates 39 service engines. Each external API has its own uptime SLA, rate limits, and breaking changes.',
            },
            section1: { steps: [
                { title: 'Framework version check', action: 'read package.json deps vs pinned versions', expected: 'All within semver range' },
                { title: 'Engine availability probe', action: 'call check_service_available() per engine', expected: 'Engines with missing keys pruned' },
                { title: 'Plugin ecosystem probe', action: 'verify tauri-plugin-*-api v1 pins load', expected: 'All 6 plugins resolve' },
            ]},
            section2: { outputs: [
                { path: 'YiDoc/projects/YiPot/test/scene-6-third-party-framework-service/index.md', type: 'story', description: 'This scene' },
            ]},
            section3: { report: [
                { step: 'Framework version check', result: 'pass', notes: 'React 18.3.1, Vite 5.4.10, Tauri 1.8 — all pinned' },
                { step: 'Engine availability probe', result: 'partial', notes: 'check_service_available() exists but cannot run offline; manual verification only' },
                { step: 'Plugin ecosystem probe', result: 'pass', notes: '6 tauri-plugin-*-api pins resolve via pnpm-lock.yaml' },
            ], overall: 'partial — versions pinned and resolvable; engine availability requires runtime check the report cannot perform' },
            section4: { edgeCases: ['Engine API key missing at runtime', 'Plugin pin URL 404s'], improvements: ['Add a startup health report written to the config store'], limitations: ['Offline report cannot probe live endpoints'] },
            evidence: [
                { label: 'Runtime deps', value: '33' },
                { label: 'Tauri plugins', value: '6 (v1 pins)' },
                { label: 'Service engines', value: '21T + 16R + 1TTS + 2C' },
            ],
        },
    ],

    gradeScale: [
        { grade: 'A', min: 90, tone: 'pass' },
        { grade: 'B', min: 75, tone: 'pass' },
        { grade: 'C', min: 60, tone: 'warn' },
        { grade: 'D', min: 40, tone: 'warn' },
        { grade: 'F', min: 0,  tone: 'fail' },
    ],
};
