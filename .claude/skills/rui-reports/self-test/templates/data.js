/**
 * rui-report-test · data.js shape reference
 * ----------------------------------------------------------------------
 * This file is the **shape template** for the report's runtime data.
 * analyze.mjs reads the project's source tree, builds the six
 * test scenes (per the §0–§4 lifecycle), and writes a
 * project-specific data.js whose body matches the fields below.
 *
 * The data is consumed by:
 *   - index.html (Vue 3 template references · v-cloak hides it
 *     until the Vue app + all shared rui-* components resolve)
 *   - index.js  (reads window.REPORT_CONFIG + window.REPORT_DATA
 *     and creates the Vue app)
 *
 * IMPORTANT: This file is a documentation-only artifact. The actual
 * `data.js` written into the report's OUT_DIR is generated entirely
 * by `scripts/analyze.mjs` Stage 5 (`REPORT_CONFIG` + `REPORT_DATA`
 * serialized via JSON.stringify). The byte-stable copy in Stage 5
 * loops over [index.html, index.css, index.js] only — data.js is
 * never copied from this template. Keep this file in sync with the
 * analyzer's payload whenever you add or rename a top-level field.
 *
 * Top-level field reference:
 *   REPORT_CONFIG.options       — scope, scopeTitle, generatedAt, theme
 *   REPORT_CONFIG.constants     — sceneCount, passThreshold, partialThreshold
 *   REPORT_CONFIG.labels        — user-visible labels
 *   REPORT_DATA.scope           — absolute scope path
 *   REPORT_DATA.score           — composite score (0-100)
 *   REPORT_DATA.grade           — A | B | C | D | F
 *   REPORT_DATA.summary         — pass/partial/fail counts, coverage
 *   REPORT_DATA.facets          — init/tests/docs/security/refs/deps
 *   REPORT_DATA.inventory       — file inventory breakdown by type group
 *   REPORT_DATA.scenes          — exactly 6 scenes, in index order
 *   REPORT_DATA.gradeScale      — A/B/C/D/F mapping for the score gauge
 *   REPORT_DATA.compliance      — framework control mappings (OWASP/NIST/CIS/SLSA)
 *   REPORT_DATA.riskRegister    — prioritized risk list (severity/likelihood/effort)
 *   REPORT_DATA.glossary        — term → definition table
 *   REPORT_DATA.roadmap         — 4-sprint remediation plan (computed post-pass)
 *   REPORT_DATA.metrics         — size-bucket + top-files + top-dirs
 *   REPORT_DATA.activity        — modification-time histogram + freshest files
 *
 * Scene payload (per the §0–§4 lifecycle):
 *   index         1..6
 *   slug          kebab-case identifier
 *   title         user-visible
 *   icon          single emoji
 *   facet         'init' | 'tests' | 'docs' | 'security' | 'refs' | 'deps'
 *   section0      { effect, matters, mermaid? }
 *   section1      { steps: [{ title, action, expected, file? }] }
 *   section2      { outputs: [{ path, type, description }] }
 *   section3      { report: [{ step, result, notes }], overall }
 *   section4      { edgeCases, improvements, limitations }
 *   evidence      [{ label, value }]                 — §2.5 evidence block
 *   verdict       'pass' | 'partial' | 'fail'
 *   coverage      0..1
 */
window.REPORT_CONFIG = {
    options: {
        scope: '/abs/path/to/project',
        scopeTitle: 'project',
        generatedAt: '2026-07-17T00:00:00.000Z',
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
        ],
    },
    labels: {
        compositeScoreLabel: 'Composite test Score',
        gradeLabel: 'Grade',
        verdictLabel: 'Verdict',
        coverageLabel: 'Coverage',
        passCountLabel: 'Scenes Passed',
        partialCountLabel: 'Scenes Partial',
        failCountLabel: 'Scenes Failed',
    },
};

window.REPORT_DATA = {
    scope: '/abs/path/to/project',
    score: 0,
    grade: 'F',
    summary: {
        totalScenes: 6,
        passCount: 0,
        partialCount: 0,
        failCount: 6,
        coverage: 0,
        totalFiles: 0,
        totalBytes: 0,
    },
    facets: {
        init:    { hasClaude: false, hasReadme: false, hasDocs: false, hasTests: false, hasPackageJson: false, hasPyproject: false, hasGoMod: false, hasCargoToml: false, totalFiles: 0, totalBytes: 0 },
        tests:   { framework: null, testFileCount: 0, testFiles: [], hasFramework: false },
        docs:    { docCount: 0, codeCount: 0, docRatio: 0, files: [], missingReadme: true, missingClaude: true, hasDocsDir: false },
        security:{ envFileCount: 0, envFiles: [], dangerousCallCount: 0, dangerousCalls: [], hasEnvFile: false },
        refs:    { storyDirCount: 0, totalLinks: 0, brokenLinks: 0, brokenLinkDetails: [] },
        deps:    { runtimeCount: 0, devCount: 0, totalCount: 0, pinningRatio: 0, pinned: [], unpinned: [], stale: [] },
    },
    inventory: {
        totalFiles: 0,
        totalBytes: 0,
        items: [
            // { group: 'JavaScript', count: 0, pct: 0, bytes: 0 },
            // …
        ],
    },
    compliance: [
        // {
        //     framework: 'OWASP ASVS 4.0',
        //     area:       'Supply Chain & Configuration',
        //     controls: [
        //         { id, text, sceneSlug, sceneIndex },
        //         …
        //     ],
        // },
        // …NIST SSDF, CIS SSC, SLSA, …
    ],
    riskRegister: [
        // { id, severity, likelihood, effort, title, description, sceneIndex, mitigation },
    ],
    glossary: [
        // { term, definition },
    ],
    roadmap: [
        // { id, title, theme, goal, expectedDelta, itemCount, items: [{ id, severity, effort, sceneIndex, title }] },
    ],
    metrics: {
        totalFiles: 0,
        totalBytes: 0,
        avgBytes: 0,
        medianBytes: 0,
        sizeBuckets: [
            // { label, count, bytes, filePct, bytesPct },
        ],
        largest: [
            // { path, bytes },
        ],
        topDirs: [
            // { dir, count, bytes, pct },
        ],
    },
    activity: {
        recentFileCount: 0,
        recentByteRatio: 0,
        buckets: [
            // { label, count, bytes, filePct, bytesPct },
        ],
        freshest: [
            // { path, ageDays, mtime },
        ],
    },
    scenes: [
        {
            index: 1, slug: 'post-init-full-self-check', title: 'Post-Init Full Self-Check',
            icon: '🚀', facet: 'init', coverage: 0, verdict: 'fail',
            section0: { effect: '...', matters: '...', mermaid: '%%{init: ...}%%\nflowchart LR\n  ...' },
            section1: { steps: [{ title, action, expected, file? }] },
            section2: { outputs: [{ path, type, description }] },
            section3: { report: [{ step, result, notes }], overall: '...' },
            section4: { edgeCases: [], improvements: [], limitations: [] },
            evidence:  [{ label, value }],   // §2.5 — drives auditability
        },
        // 5 more scenes — emitted by analyze.mjs in §0–§4 lifecycle
        // order: pre-commit-incremental-self-check, doc-code-consistency,
        // security-surface-regression, cross-story-integration-regression,
        // third-party-framework-service.
    ],
    gradeScale: [
        { grade: 'A', min: 90, tone: 'pass' },
        { grade: 'B', min: 75, tone: 'pass' },
        { grade: 'C', min: 60, tone: 'warn' },
        { grade: 'D', min: 40, tone: 'warn' },
        { grade: 'F', min: 0,  tone: 'fail' },
    ],
};
