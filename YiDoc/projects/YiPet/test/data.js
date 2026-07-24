/**
 * yry-report-test · YiPet — Static configuration & runtime analysis
 * ----------------------------------------------------------------------
 * window.REPORT_CONFIG provides static labels and options. Runtime data
 * (the analysis result) lives in window.REPORT_DATA. Regeneration
 * rewrites only window.REPORT_DATA — the labels and options are stable.
 *
 * Note: the bundled test analyzer (`analyze.mjs`) has been removed and
 * this leaf is archived (`user_invocable: false`). This data.js was
 * synthesized by the yry-reports dispatcher from the 6 scene directories
 * present on disk under test/scene-N/index.md. Verdicts are 'partial'
 * because no analyzer was run — scene existence and §0–§4 structure are
 * verified, but coverage assertions are not measured.
 *
 * Design principles:
 *   - Labels are technical, precise, and self-contained.
 *   - All visible text lives here so the Vue layer is a pure renderer.
 *   - Token references (--yry-*) are preferred over hardcoded values.
 */
window.REPORT_CONFIG = {
    options: {
        scope: '/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiPet',
        scopeTitle: 'YiPet',
        generatedAt: '2026-07-24T15:10:00.000Z',
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
    scope: '/Users/ruiyi/Downloads/YrY/YiDoc/projects/YiPet',
    score: 50,
    grade: 'F',

    summary: {
        totalScenes: 6,
        passCount: 0,
        partialCount: 6,
        failCount: 0,
        coverage: 0.5,
        totalFiles: 6,
        totalBytes: 0,
    },

    facets: {
        init:    { hasClaude: true,  hasReadme: true,  hasDocs: true,  hasTests: true,  hasPackageJson: false, hasPyproject: false, hasGoMod: false, hasCargoToml: false, totalFiles: 2, totalBytes: 0 },
        tests:   { framework: null, testFileCount: 6, testFiles: ['test/scene-1-post-init-full-self-check/index.md','test/scene-2-pre-commit-incremental-self-check/index.md','test/scene-3-doc-code-consistency/index.md','test/scene-4-security-surface-regression/index.md','test/scene-5-cross-story-integration-regression/index.md','test/scene-6-third-party-framework-service/index.md'], hasFramework: false },
        docs:    { docCount: 6, codeCount: 0, docRatio: 1.0, files: [], missingReadme: false, missingClaude: false, hasDocsDir: true },
        security:{ envFileCount: 0, envFiles: [], dangerousCallCount: 0, dangerousCalls: [], hasEnvFile: false },
        refs:    { storyDirCount: 6, totalLinks: 0, brokenLinks: 0, brokenLinkDetails: [] },
        deps:    { runtimeCount: 0, devCount: 0, totalCount: 0, pinningRatio: 0, pinned: [], unpinned: [], stale: [] },
    },

    inventory: {
        totalFiles: 6,
        totalBytes: 0,
        items: [
            { group: 'Markdown', count: 6, pct: 100, bytes: 0 },
        ],
    },

    compliance: [],
    riskRegister: [
        { id: 'R1', severity: 'medium', likelihood: 'medium', effort: 'medium', title: 'Test analyzer removed — no coverage measurement', description: 'The bundled test analyzer was archived; scene verdicts are partial because no §3 report was produced by an analyzer run.', sceneIndex: 1, mitigation: 'Re-introduce a replacement analyzer workflow that reads scene index.md files and produces a §3 report.' },
    ],
    glossary: [
        { term: 'Post-Init Self-Check', definition: 'Full 7-item self-check run after yry-init pipeline completes — verifies CLAUDE.md, README.md, data.js, arch/, test/ artifacts exist and stay in sync.' },
        { term: 'Pre-Commit Self-Check', definition: 'Incremental self-check run before each commit — verifies only the touched artifacts, faster than the post-init full check.' },
        { term: 'Doc-Code Consistency', definition: 'Cross-reference check ensuring docs claims (e.g. endpoint counts, file counts) match the actual codebase state.' },
    ],
    roadmap: [],

    metrics: {
        totalFiles: 6,
        totalBytes: 0,
        avgBytes: 0,
        medianBytes: 0,
        sizeBuckets: [
            { label: '< 4 KB', count: 6, bytes: 0, filePct: 100, bytesPct: 100 },
        ],
        largest: [],
        topDirs: [
            { dir: 'test/', count: 6, bytes: 0, pct: 100 },
        ],
    },

    activity: {
        recentFileCount: 6,
        recentByteRatio: 1.0,
        buckets: [
            { label: '< 7 days', count: 6, bytes: 0, filePct: 100, bytesPct: 100 },
        ],
        freshest: [
            { path: 'test/scene-1-post-init-full-self-check/index.md', ageDays: 0, mtime: '2026-07-24' },
            { path: 'test/scene-2-pre-commit-incremental-self-check/index.md', ageDays: 0, mtime: '2026-07-24' },
            { path: 'test/scene-3-doc-code-consistency/index.md', ageDays: 0, mtime: '2026-07-24' },
            { path: 'test/scene-4-security-surface-regression/index.md', ageDays: 0, mtime: '2026-07-24' },
            { path: 'test/scene-5-cross-story-integration-regression/index.md', ageDays: 0, mtime: '2026-07-24' },
            { path: 'test/scene-6-third-party-framework-service/index.md', ageDays: 0, mtime: '2026-07-24' },
        ],
    },

    scenes: [
        {
            index: 1, slug: 'post-init-full-self-check', title: 'Post-Init Full Self-Check',
            icon: '🚀', facet: 'init', coverage: 0.5, verdict: 'partial',
            section0: {
                effect: '完成 yry-init 流水线后，对 YiPet 项目执行一次完整的 7 项自检——确认所有生成的文档工件（CLAUDE.md、README.md、data.js、arch/*/index.md、test/*/index.md）都存在、格式正确，且内容与代码库保持同步。',
                matters: 'yry-init 流水线的输出是后续所有开发活动的基础文档。如果 CLAUDE.md 中的项目类型标注错误，或 README.md 缺少 Domain Language 章节，或某个 arch 场景的 index.md 为空，都将导致 AI 辅助开发产生偏差。post-init 检查是工程门禁。',
                mermaid: 'graph LR\n    C1[Check 1: CLAUDE.md 含项目名] --> PASS\n    C2[Check 2: README.md 含项目名] --> PASS\n    C3[Check 3: Domain Language ≥ 3 术语] --> PASS\n    C4[Check 4: docs 首页四文件齐全] --> PASS\n    C5[Check 5: arch/ 每场景有 index.md] --> PASS\n    C6[Check 6: test/ 每场景有 index.md] --> PASS\n    C7[Check 7: arch ≥ 5 场景, test ≥ 6 场景] --> PASS',
            },
            section1: { steps: [
                { title: '检查 CLAUDE.md', action: '读取 CLAUDE.md，grep YiPet', expected: '文件存在，包含项目名 YiPet，包含 Iron laws 和 Foundational beliefs 章节', file: 'CLAUDE.md' },
                { title: '检查 README.md', action: '读取 README.md，检查 ## Domain Language 章节', expected: '至少 4 个术语定义', file: 'README.md' },
            ] },
            section2: { outputs: [
                { path: 'CLAUDE.md', type: 'doc', description: 'Project profile + foundational beliefs + iron laws' },
                { path: 'README.md', type: 'doc', description: 'Domain language + project overview' },
                { path: 'data.js', type: 'data', description: 'Dashboard 4-file set' },
            ] },
            section3: { report: [
                { step: 1, result: 'partial', notes: 'Scene index.md exists; analyzer not run — full §3 report deferred.' },
            ], overall: 'partial' },
            section4: { edgeCases: [], improvements: ['Re-introduce analyzer to produce authoritative §3 report.'], limitations: ['No analyzer run — verdict is partial by default.'] },
            evidence: [
                { label: 'Scene index.md', value: 'present' },
                { label: '§0–§4 sections', value: 'present' },
            ],
        },
        {
            index: 2, slug: 'pre-commit-incremental-self-check', title: 'Pre-Commit Incremental Self-Check',
            icon: '⚡', facet: 'init', coverage: 0.5, verdict: 'partial',
            section0: { effect: 'Pre-commit incremental self-check — verifies only touched artifacts before each commit.', matters: 'Faster than post-init; catches drift before it lands on main.', mermaid: 'graph LR\n    T[Touched Files] --> C[Incremental Check] --> PASS\n    C --> FAIL[Block Commit]' },
            section1: { steps: [{ title: 'Identify touched files', action: 'git diff --name-only', expected: 'List of modified paths', file: '.git' }] },
            section2: { outputs: [{ path: 'test/scene-2-pre-commit-incremental-self-check/index.md', type: 'doc', description: 'Scene lifecycle doc' }] },
            section3: { report: [{ step: 1, result: 'partial', notes: 'Scene doc present; analyzer not run.' }], overall: 'partial' },
            section4: { edgeCases: [], improvements: [], limitations: ['No analyzer run.'] },
            evidence: [{ label: 'Scene index.md', value: 'present' }],
        },
        {
            index: 3, slug: 'doc-code-consistency', title: 'Doc-Code Consistency',
            icon: '🔍', facet: 'docs', coverage: 0.5, verdict: 'partial',
            section0: { effect: 'Cross-reference check ensuring docs claims match the actual codebase state.', matters: 'Stale docs mislead AI assistants and reviewers.', mermaid: 'graph LR\n    D[Docs Claim] --> V[Verify vs Code] --> PASS\n    V --> FAIL[Drift Detected]' },
            section1: { steps: [{ title: 'Sample doc claims', action: 'grep counts in data.js', expected: 'Counts match file inventory', file: 'data.js' }] },
            section2: { outputs: [{ path: 'test/scene-3-doc-code-consistency/index.md', type: 'doc', description: 'Scene lifecycle doc' }] },
            section3: { report: [{ step: 1, result: 'partial', notes: 'Scene doc present; analyzer not run.' }], overall: 'partial' },
            section4: { edgeCases: [], improvements: [], limitations: ['No analyzer run.'] },
            evidence: [{ label: 'Scene index.md', value: 'present' }],
        },
        {
            index: 4, slug: 'security-surface-regression', title: 'Security Surface Regression',
            icon: '🛡', facet: 'security', coverage: 0.5, verdict: 'partial',
            section0: { effect: 'Security surface regression check — verifies auth coverage, validation, and rate limiting claims still hold.', matters: 'Silent security regressions leak user data.', mermaid: 'graph LR\n    S[Security Claims] --> V[Re-verify] --> PASS\n    V --> FAIL[Regression]' },
            section1: { steps: [{ title: 'Re-scan auth middleware', action: 'grep auth patterns', expected: 'No missing-auth regressions', file: 'src/' }] },
            section2: { outputs: [{ path: 'test/scene-4-security-surface-regression/index.md', type: 'doc', description: 'Scene lifecycle doc' }] },
            section3: { report: [{ step: 1, result: 'partial', notes: 'Scene doc present; analyzer not run.' }], overall: 'partial' },
            section4: { edgeCases: [], improvements: [], limitations: ['No analyzer run.'] },
            evidence: [{ label: 'Scene index.md', value: 'present' }],
        },
        {
            index: 5, slug: 'cross-story-integration-regression', title: 'Cross-Story Integration Regression',
            icon: '🔗', facet: 'refs', coverage: 0.5, verdict: 'partial',
            section0: { effect: 'Cross-story integration regression — verifies links between arch/ and test/ stories still resolve.', matters: 'Broken cross-references strand readers.', mermaid: 'graph LR\n    A[arch story] --> L[Link] --> T[test story]\n    L --> BROKEN[404]' },
            section1: { steps: [{ title: 'Crawl cross-links', action: 'grep relative links', expected: 'All resolve', file: 'arch/' }] },
            section2: { outputs: [{ path: 'test/scene-5-cross-story-integration-regression/index.md', type: 'doc', description: 'Scene lifecycle doc' }] },
            section3: { report: [{ step: 1, result: 'partial', notes: 'Scene doc present; analyzer not run.' }], overall: 'partial' },
            section4: { edgeCases: [], improvements: [], limitations: ['No analyzer run.'] },
            evidence: [{ label: 'Scene index.md', value: 'present' }],
        },
        {
            index: 6, slug: 'third-party-framework-service', title: 'Third-Party Framework & Service Health',
            icon: '🌐', facet: 'deps', coverage: 0.5, verdict: 'partial',
            section0: { effect: 'Third-party framework & service health — verifies CDN components, vendored libs, and external service endpoints are pinned and reachable.', matters: 'Unpinned or stale third-party deps break offline mode and reproducibility.', mermaid: 'graph LR\n    CD[CDN Component] --> P[Pinned?] --> OK\n    P --> STALE[Upgrade Needed]' },
            section1: { steps: [{ title: 'Inventory CDN components', action: 'ls cdn/', expected: '26 self-hosted components', file: 'cdn/' }] },
            section2: { outputs: [{ path: 'test/scene-6-third-party-framework-service/index.md', type: 'doc', description: 'Scene lifecycle doc' }] },
            section3: { report: [{ step: 1, result: 'partial', notes: 'Scene doc present; analyzer not run.' }], overall: 'partial' },
            section4: { edgeCases: [], improvements: [], limitations: ['No analyzer run.'] },
            evidence: [{ label: 'Scene index.md', value: 'present' }],
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
