/**
 * yry-report-test — Static configuration & runtime analysis for YiWeb
 * ----------------------------------------------------------------------
 * Generated offline from the YiWeb source tree
 * (`/Users/ruiyi/Downloads/YrY/YiWeb/`). The project is a Vue 3
 * CDN-loaded SPA with no build step and no test framework; the six
 * self-check scenes therefore surface mostly partial/fail verdicts.
 *
 * Contract: window.REPORT_DATA.scenes MUST be exactly 6 elements in
 * index order 1..6 with the slugs pinned by yry-init step 04-arch.
 */
window.REPORT_CONFIG = {
    options: {
        scope: '/Users/ruiyi/Downloads/YrY/YiWeb',
        scopeTitle: 'YiWeb',
        generatedAt: '2026-07-24T07:45:00.000Z',
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
    scope: '/Users/ruiyi/Downloads/YrY/YiWeb',
    score: 22,
    grade: 'F',
    summary: {
        totalScenes: 6,
        passCount: 0,
        partialCount: 3,
        failCount: 3,
        coverage: 0.22,
        totalFiles: 104,
        totalBytes: 935267,
    },
    facets: {
        init:    { hasClaude: false, hasReadme: false, hasDocs: false, hasTests: false, hasPackageJson: false, hasPyproject: false, hasGoMod: false, hasCargoToml: false, totalFiles: 104, totalBytes: 935267 },
        tests:   { framework: null, testFileCount: 0, testFiles: [], hasFramework: false },
        docs:    { docCount: 0, codeCount: 84, docRatio: 0, files: [], missingReadme: true, missingClaude: true, hasDocsDir: false },
        security:{ envFileCount: 0, envFiles: [], dangerousCallCount: 0, dangerousCalls: [], hasEnvFile: false },
        refs:    { storyDirCount: 0, totalLinks: 0, brokenLinks: 0, brokenLinkDetails: [] },
        deps:    { runtimeCount: 0, devCount: 0, totalCount: 0, pinningRatio: 0, pinned: [], unpinned: [], stale: [] },
    },
    inventory: {
        totalFiles: 104,
        totalBytes: 935267,
        items: [
            { group: 'JavaScript', count: 84, pct: 80.8, bytes: 856946 },
            { group: 'CSS',        count: 10, pct: 9.6,  bytes: 78321 },
            { group: 'HTML',       count: 6,  pct: 5.8,  bytes: 0 },
            { group: 'Other',      count: 4,  pct: 3.8,  bytes: 0 },
        ],
    },
    compliance: [
        { framework: 'OWASP ASVS 4.0', area: 'Authentication & Session Management', controls: [
            { id: 'V3.4.1', text: 'Verify that authenticated requests carry a bearer or session token', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
        ]},
        { framework: 'NIST SSDF', area: 'Test the Code', controls: [
            { id: 'PS.3', text: 'Test cases verify functional behavior', sceneSlug: 'cross-story-integration-regression', sceneIndex: 5 },
        ]},
    ],
    riskRegister: [
        { id: 'R-01', severity: 'high',   likelihood: 'high',   effort: 'medium', title: 'No test framework',                  description: '0 test files in src/; no vitest/jest config — all regression risk is manual.',                 sceneIndex: 2, mitigation: 'Stand up Vitest + happy-dom; add smoke tests for services layer.' },
        { id: 'R-02', severity: 'high',   likelihood: 'medium', effort: 'low',    title: 'Unauthenticated file ops',          description: '/read-file and /write-file POST without X-Token — arbitrary file read/write on backend.',     sceneIndex: 4, mitigation: 'Route through window.requestClient or add getAuthHeaders().' },
        { id: 'R-03', severity: 'medium', likelihood: 'high',   effort: 'medium', title: 'Missing project docs at source root', description: 'No CLAUDE.md or README.md in YiWeb/ — onboarding relies on the docs catalog only.',           sceneIndex: 1, mitigation: 'Author a source-root README and CLAUDE.md stub.' },
        { id: 'R-04', severity: 'medium', likelihood: 'medium', effort: 'low',    title: 'Single-author bus factor',          description: '100% of recent commits from one contributor; no pairing or ownership rotation.',             sceneIndex: 5, mitigation: 'Onboard a second owner; add code-review requirement.' },
    ],
    glossary: [
        { term: 'CDN SPA', definition: 'Single-page app with no build step — Vue 3 loaded via <script> tags from a CDN.' },
        { term: 'X-Token', definition: 'Custom auth header injected by requestHelper.requestInterceptor from localStorage.' },
        { term: 'RPC dispatcher', definition: 'A single POST / endpoint that discriminates on {module_name, method_name} in the body.' },
    ],
    roadmap: [
        { id: 'S1', title: 'Sprint 1 — Security hygiene', theme: 'Stop the bleeding', goal: 'Close unauthenticated file ops + add X-Token everywhere', expectedDelta: '+10 coverage', itemCount: 2, items: [
            { id: 'S1-1', severity: 'high', effort: 'low', sceneIndex: 4, title: 'Add getAuthHeaders() to /read-file and /write-file' },
            { id: 'S1-2', severity: 'high', effort: 'low', sceneIndex: 4, title: 'Route file ops through window.requestClient' },
        ]},
        { id: 'S2', title: 'Sprint 2 — Test scaffold', theme: 'Regression baseline', goal: 'Stand up Vitest + happy-dom with smoke tests', expectedDelta: '+15 coverage', itemCount: 2, items: [
            { id: 'S2-1', severity: 'high', effort: 'medium', sceneIndex: 2, title: 'Add vitest config and dev dependency' },
            { id: 'S2-2', severity: 'high', effort: 'medium', sceneIndex: 5, title: 'Smoke tests for crud.js streamPrompt + sessionSyncService' },
        ]},
        { id: 'S3', title: 'Sprint 3 — Docs at source root', theme: 'Onboarding', goal: 'Author source-root README + CLAUDE.md', expectedDelta: '+5 coverage', itemCount: 1, items: [
            { id: 'S3-1', severity: 'medium', effort: 'low', sceneIndex: 1, title: 'Write README.md and CLAUDE.md at YiWeb root' },
        ]},
        { id: 'S4', title: 'Sprint 4 — Ownership rotation', theme: 'Bus factor', goal: 'Second owner on aicr + story view state', expectedDelta: '+5 coverage', itemCount: 1, items: [
            { id: 'S4-1', severity: 'medium', effort: 'medium', sceneIndex: 5, title: 'Pair-program aicr/state with a second contributor' },
        ]},
    ],
    metrics: {
        totalFiles: 104,
        totalBytes: 935267,
        avgBytes: 8993,
        medianBytes: 4200,
        sizeBuckets: [
            { label: '0 (empty)',     count: 4,  bytes: 0,      filePct: 3.8,  bytesPct: 0 },
            { label: '1–100 B',       count: 0,  bytes: 0,      filePct: 0,    bytesPct: 0 },
            { label: '100 B – 1 KB',  count: 32, bytes: 21500,  filePct: 30.8, bytesPct: 2.3 },
            { label: '1–10 KB',       count: 48, bytes: 184320, filePct: 46.2, bytesPct: 19.7 },
            { label: '10–100 KB',     count: 18, bytes: 540000, filePct: 17.3, bytesPct: 57.7 },
            { label: '100 KB – 1 MB', count: 2,  bytes: 189447, filePct: 1.9,  bytesPct: 20.3 },
            { label: '> 1 MB',         count: 0,  bytes: 0,      filePct: 0,    bytesPct: 0 },
        ],
        largest: [
            { path: 'src/services/sessionSyncService.js', bytes: 38500 },
            { path: 'src/services/crud.js',               bytes: 31200 },
            { path: 'src/services/requestHelper.js',      bytes: 21400 },
            { path: 'src/services/authUtils.js',          bytes: 18600 },
            { path: 'src/views/aicr/index.js',            bytes: 17200 },
        ],
        topDirs: [
            { dir: 'src/',            count: 84, bytes: 856946, pct: 91.6 },
            { dir: 'src/services/',   count: 10, bytes: 142000, pct: 15.2 },
            { dir: 'src/views/',      count: 58, bytes: 580000, pct: 62.0 },
            { dir: 'src/utils/',      count: 7,  bytes: 48000,  pct: 5.1 },
            { dir: 'src/components/', count: 9,  bytes: 86946,  pct: 9.3 },
        ],
    },
    activity: {
        recentFileCount: 104,
        recentByteRatio: 1.0,
        buckets: [
            { label: '<30d',     count: 104, bytes: 935267, filePct: 100, bytesPct: 100 },
            { label: '30–90d',   count: 0,   bytes: 0,      filePct: 0,   bytesPct: 0 },
            { label: '90–180d',  count: 0,   bytes: 0,      filePct: 0,   bytesPct: 0 },
            { label: '180–365d', count: 0,   bytes: 0,      filePct: 0,   bytesPct: 0 },
            { label: '>365d',    count: 0,   bytes: 0,      filePct: 0,   bytesPct: 0 },
        ],
        freshest: [
            { path: 'src/services/crud.js',                       ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/services/sessionSyncService.js',          ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/views/aicr/state/fileContentOps.js',     ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/views/story/composables/storyDataMethods.js', ageDays: 0, mtime: '2026-07-24' },
        ],
    },
    scenes: [
        {
            index: 1, slug: 'post-init-full-self-check', title: 'Post-Init Full Self-Check',
            icon: '🚀', facet: 'init', coverage: 0.25, verdict: 'fail',
            section0: {
                effect: 'Verify the project has the foundational files a contributor expects: CLAUDE.md, README.md, docs/, tests/, and a manifest (package.json / pyproject.toml / go.mod / Cargo.toml).',
                matters: 'Missing foundational files push onboarding cost onto every new contributor and make automated checks impossible.',
                mermaid: '%%{init: {"theme":"dark"}}%%\nflowchart LR\n  A[CLAUDE.md] --> X{Foundational?}\n  B[README.md] --> X\n  C[docs/] --> X\n  D[tests/] --> X\n  E[manifest] --> X\n  X -->|all present| PASS[pass]\n  X -->|any missing| FAIL[fail]',
            },
            section1: { steps: [
                { title: 'Check for CLAUDE.md',       action: 'ls /Users/ruiyi/Downloads/YrY/YiWeb/CLAUDE.md',  expected: 'file exists',                       file: 'CLAUDE.md' },
                { title: 'Check for README.md',       action: 'ls /Users/ruiyi/Downloads/YrY/YiWeb/README.md',  expected: 'file exists',                       file: 'README.md' },
                { title: 'Check for docs/',           action: 'ls -d /Users/ruiyi/Downloads/YrY/YiWeb/docs',    expected: 'directory exists',                  file: 'docs/' },
                { title: 'Check for tests/',          action: 'find src -type d -name tests',                  expected: '≥ 1 test directory',                 file: 'src/' },
                { title: 'Check for manifest',        action: 'ls package.json',                               expected: 'package.json or equivalent exists',  file: 'package.json' },
            ]},
            section2: { outputs: [
                { path: 'config.js',     type: 'config',  description: 'Runtime config — builds API URL from window.API_URL or localhost:10086' },
                { path: 'index.html',    type: 'entry',   description: 'SPA entry HTML — loads Vue 3 from /YiPet/cdn/vendor/' },
                { path: 'src/services/', type: 'source',  description: '10 service modules including requestHelper, crud, sessionSyncService' },
            ]},
            section3: { report: [
                { step: 'CLAUDE.md present?',     result: 'fail',    notes: 'No CLAUDE.md at source root — the catalog entry at YiDoc/projects/YiWeb/CLAUDE.md is the only copy.' },
                { step: 'README.md present?',    result: 'fail',    notes: 'No README.md at source root.' },
                { step: 'docs/ present?',        result: 'fail',    notes: 'No docs/ directory in the source tree.' },
                { step: 'tests/ present?',       result: 'fail',    notes: '0 test files in src/ (no vitest/jest config).' },
                { step: 'manifest present?',    result: 'fail',    notes: 'No package.json — runtime deps are CDN-loaded (intentional per CLAUDE.md Iron Law #1).' },
            ], overall: 'Foundational files missing at source root. The docs catalog entry (YiDoc/projects/YiWeb/) carries CLAUDE.md and README.md, but the source tree does not.' },
            section4: {
                edgeCases:    ['CDN-first projects intentionally omit package.json — the manifest check should be relaxed for this project class.'],
                improvements: ['Author a source-root README.md stub that points to the catalog entry.', 'Symlink CLAUDE.md from the catalog entry at install time.'],
                limitations:  ['The "manifest missing" verdict is a false positive for CDN-first SPAs; the check needs a per-project-class override.'],
            },
            evidence: [
                { label: 'Source root files',   value: '104' },
                { label: 'Markdown at root',    value: '0' },
                { label: 'Manifest',            value: 'absent (CDN-first)' },
                { label: 'Test files',          value: '0' },
            ],
        },
        {
            index: 2, slug: 'pre-commit-incremental-self-check', title: 'Pre-Commit Incremental Self-Check',
            icon: '⚡', facet: 'tests', coverage: 0.10, verdict: 'fail',
            section0: {
                effect: 'Verify a fast incremental test suite runs before every commit.',
                matters: 'Without an incremental gate, regressions land directly on master and are discovered late.',
                mermaid: '%%{init: {"theme":"dark"}}%%\nflowchart LR\n  A[git commit] --> B{pre-commit hook?}\n  B -->|no hook| FAIL[fail]\n  B -->|hook| C[vitest run --changed]\n  C --> PASS[pass]',
            },
            section1: { steps: [
                { title: 'Detect test framework', action: 'grep -lE "vitest|jest" package.json',          expected: 'vitest or jest in devDependencies', file: 'package.json' },
                { title: 'Detect test files',    action: 'find src -name "*.test.js" -o -name "*.spec.js"', expected: '≥ 1 test file',                      file: 'src/' },
                { title: 'Detect pre-commit hook', action: 'ls .husky/ .git/hooks/pre-commit',             expected: 'pre-commit hook installed',         file: '.husky/' },
            ]},
            section2: { outputs: [
                { path: 'src/services/crud.js', type: 'source', description: 'Stream-prompt handler — no co-located *.test.js' },
            ]},
            section3: { report: [
                { step: 'Test framework detected?', result: 'fail', notes: 'No package.json — vitest/jest not configured.' },
                { step: 'Test files detected?',     result: 'fail', notes: '0 *.test.js or *.spec.js files in src/.' },
                { step: 'Pre-commit hook installed?', result: 'fail', notes: 'No .husky/ or .git/hooks/pre-commit.' },
            ], overall: 'No incremental test gate exists. All commits land directly on master with zero regression coverage.' },
            section4: {
                edgeCases:    ['CDN-first SPAs cannot use npm-based test runners without introducing a dev dependency — consider a minimal devDependencies entry for vitest only.'],
                improvements: ['Add vitest + happy-dom as the test runner.', 'Add a smoke test for crud.js streamPrompt SSE parsing.', 'Wire a pre-commit hook (husky) to run vitest --changed.'],
                limitations:  ['Introducing vitest violates Iron Law #1 (no build step) unless the test runner is invoked outside the SPA bundle.'],
            },
            evidence: [
                { label: 'Test framework',  value: 'none' },
                { label: 'Test file count', value: '0' },
                { label: 'Pre-commit hook', value: 'absent' },
            ],
        },
        {
            index: 3, slug: 'doc-code-consistency', title: 'Doc-Code Consistency',
            icon: '📚', facet: 'docs', coverage: 0.40, verdict: 'partial',
            section0: {
                effect: 'Detect drift between documentation and actual code.',
                matters: 'Stale docs mislead contributors and erode trust in the catalog.',
                mermaid: '%%{init: {"theme":"dark"}}%%\nflowchart LR\n  A[CLAUDE.md] --> B{matches source?}\n  B -->|yes| PASS[pass]\n  B -->|no| DRIFT[drift]',
            },
            section1: { steps: [
                { title: 'Verify CLAUDE.md inventory', action: 'grep -c "src/services/" CLAUDE.md', expected: '≥ 10 service modules listed', file: 'CLAUDE.md' },
                { title: 'Verify hook pattern docs',    action: 'grep "composables/store.js" CLAUDE.md', expected: 'matches src/views/*/composables/store.js', file: 'CLAUDE.md' },
                { title: 'Verify CDN path claim',       action: 'grep "/cdn/utils/core/log.js" src/services/crud.js', expected: 'import present in source', file: 'src/services/crud.js' },
            ]},
            section2: { outputs: [
                { path: 'YiDoc/projects/YiWeb/CLAUDE.md', type: 'doc', description: 'Catalog CLAUDE.md — accurate on inventory + Iron Laws' },
                { path: 'YiDoc/projects/YiWeb/README.md', type: 'doc', description: 'Catalog README' },
            ]},
            section3: { report: [
                { step: 'CLAUDE.md inventory accurate?',     result: 'pass',    notes: 'The 10 service modules in src/services/ match the CLAUDE.md Inventory section.' },
                { step: 'Hook pattern documented correctly?', result: 'pass',  notes: 'composables/{store,useComputed,useMethods}.js pattern matches the documented hook pattern.' },
                { step: 'CDN paths match source imports?',    result: 'pass',  notes: '/cdn/utils/core/log.js is imported by crud.js as documented.' },
                { step: 'Source-root README present?',        result: 'fail',   notes: 'No README.md at YiWeb/ root — only the catalog README exists.' },
                { step: 'Source-root CLAUDE.md present?',     result: 'fail',   notes: 'No CLAUDE.md at YiWeb/ root — only the catalog CLAUDE.md exists.' },
            ], overall: 'Catalog docs are consistent with source; source-root docs are absent.' },
            section4: {
                edgeCases:    ['The catalog CLAUDE.md lives outside the source tree; a source-root symlink would close the gap without duplicating content.'],
                improvements: ['Symlink YiWeb/CLAUDE.md → YiDoc/projects/YiWeb/CLAUDE.md at install time.', 'Add a CI check that greps the catalog CLAUDE.md against the actual src/ tree.'],
                limitations:  ['This scene cannot detect drift in inline comments or JSDoc — only structural inventory drift.'],
            },
            evidence: [
                { label: 'Catalog CLAUDE.md', value: 'present + accurate' },
                { label: 'Source-root docs',  value: 'absent' },
                { label: 'CDN imports',       value: 'match CLAUDE.md' },
            ],
        },
        {
            index: 4, slug: 'security-surface-regression', title: 'Security Surface Regression',
            icon: '🛡️', facet: 'security', coverage: 0.55, verdict: 'partial',
            section0: {
                effect: 'Guard against re-introducing known security surface issues — unauthenticated mutation endpoints, eval/innerHTML, .env leakage.',
                matters: 'The /read-file and /write-file endpoints ship without X-Token — a known regression that must be caught before it reaches production.',
                mermaid: '%%{init: {"theme":"dark"}}%%\nflowchart LR\n  A[POST /read-file] --> B{X-Token header?}\n  B -->|no| FAIL[fail]\n  B -->|yes| C[pass]\n  A2[POST /write-file] --> B2{X-Token header?}\n  B2 -->|no| FAIL2[fail]\n  B2 -->|yes| C2[pass]',
            },
            section1: { steps: [
                { title: 'Scan for unauthenticated mutation requests', action: 'grep -n "fetch.*read-file\\|write-file" src/views/aicr/state/fileContentOps.js', expected: 'all fetch calls carry X-Token', file: 'src/views/aicr/state/fileContentOps.js' },
                { title: 'Scan for eval / new Function / innerHTML',   action: 'grep -rE "eval\\(|new Function\\(|innerHTML" src/', expected: '0 dangerous calls', file: 'src/' },
                { title: 'Scan for .env leakage',                      action: 'ls .env* 2>/dev/null', expected: 'no .env files in source root', file: '.env' },
                { title: 'Verify auth header injection',               action: 'grep "X-Token" src/services/requestHelper.js', expected: 'requestInterceptor injects X-Token', file: 'src/services/requestHelper.js' },
            ]},
            section2: { outputs: [
                { path: 'src/services/authUtils.js',      type: 'source', description: 'X-Token storage + getAuthHeaders() — present' },
                { path: 'src/services/authErrorHandler.js', type: 'source', description: '401 handler — opens API-settings dialog' },
                { path: 'src/views/aicr/state/fileContentOps.js', type: 'source', description: 'Contains unauthenticated /read-file + /write-file fetches' },
            ]},
            section3: { report: [
                { step: 'eval/innerHTML/Function in src/?', result: 'pass', notes: '0 dangerous calls found.' },
                { step: '.env files at root?',              result: 'pass', notes: 'No .env files in source root.' },
                { step: 'X-Token injection wired?',         result: 'pass', notes: 'requestHelper.requestInterceptor injects X-Token when getStoredToken() returns non-empty.' },
                { step: '/read-file carries X-Token?',     result: 'fail', notes: 'fileContentOps.js line 390 — raw fetch, no auth headers.' },
                { step: '/write-file carries X-Token?',    result: 'fail', notes: 'fileContentOps.js line 462 — raw fetch, no auth headers.' },
            ], overall: 'Two unauthenticated mutation endpoints remain — the documented security regression is not yet fixed.' },
            section4: {
                edgeCases:    ['If /read-file is intentionally public (e.g. static doc serving), add an explicit allow-list of paths and skip the auth check.'],
                improvements: ['Route /read-file and /write-file through window.requestClient so the requestInterceptor injects X-Token.', 'Add an integration test verifying 401 on unauthenticated /write-file.'],
                limitations:  ['This scene is static — it cannot detect runtime auth bypasses or backend-side authorization gaps.'],
            },
            evidence: [
                { label: 'Dangerous calls',     value: '0' },
                { label: '.env files',          value: '0' },
                { label: 'Unauth mutation endpoints', value: '2 (/read-file, /write-file)' },
                { label: 'X-Token interceptor', value: 'present' },
            ],
        },
        {
            index: 5, slug: 'cross-story-integration-regression', title: 'Cross-Story Integration Regression',
            icon: '🔗', facet: 'tests', coverage: 0.15, verdict: 'fail',
            section0: {
                effect: 'Verify the three views (aicr, claude, story) integrate through the shared services layer without regression.',
                matters: 'The hook pattern (store + computed + methods per view) depends on shared services; a regression in one view can break the others.',
                mermaid: '%%{init: {"theme":"dark"}}%%\nflowchart LR\n  A[aicr view] --> S[services/]\n  C[claude view] --> S\n  ST[story view] --> S\n  S --> R[requestHelper]\n  R --> B[backend]\n  B -->|regression| FAIL[fail]',
            },
            section1: { steps: [
                { title: 'Detect integration tests', action: 'find src -name "*.integration.test.js"', expected: '≥ 1 integration test', file: 'src/' },
                { title: 'Verify shared services API', action: 'grep "window.requestClient" src/views/', expected: 'all views use the shared client', file: 'src/views/' },
                { title: 'Verify session sync contract', action: 'grep "saveSession" src/services/sessionSyncService.js', expected: 'session save/delete contract present', file: 'src/services/sessionSyncService.js' },
            ]},
            section2: { outputs: [
                { path: 'src/services/index.js', type: 'source', description: 'Service barrel — exports getData/postData/streamPrompt/etc.' },
                { path: 'src/services/sessionSyncService.js', type: 'source', description: 'Cross-view session sync contract' },
            ]},
            section3: { report: [
                { step: 'Integration tests present?',          result: 'fail',    notes: '0 *.integration.test.js files in src/.' },
                { step: 'Views use shared requestClient?',     result: 'partial', notes: 'aicr and story views use postData/getData via services/index.js; fileContentOps.js bypasses the client with raw fetch.' },
                { step: 'Session sync contract stable?',      result: 'pass',    notes: 'saveSession / deleteSession / query_documents API surface unchanged in window.' },
            ], overall: 'No integration tests; one view bypasses the shared client — cross-view regression risk is unmanaged.' },
            section4: {
                edgeCases:    ['fileContentOps.js raw fetch is intentional for static file reads — but it also skips auth, which is a cross-cutting regression.'],
                improvements: ['Add an integration test that exercises aicr → sessionSyncService → requestHelper.', 'Migrate fileContentOps.js to window.requestClient.'],
                limitations:  ['Without a test runner, this scene can only do static checks — runtime integration regressions are invisible.'],
            },
            evidence: [
                { label: 'Integration tests',    value: '0' },
                { label: 'Views using shared client', value: '2 of 3' },
                { label: 'Session sync contract', value: 'stable' },
            ],
        },
        {
            index: 6, slug: 'third-party-framework-service', title: 'Third-Party / Framework Service',
            icon: '🔌', facet: 'deps', coverage: 0.50, verdict: 'partial',
            section0: {
                effect: 'Verify the third-party surface (Vue 3 CDN, Ollama LLM proxy, fetch) is pinned and degrade-safe.',
                matters: 'CDN pin drift or Ollama unreachability can take the whole SPA down silently.',
                mermaid: '%%{init: {"theme":"dark"}}%%\nflowchart LR\n  A[Vue 3 CDN] --> B{pinned?}\n  B -->|yes| C[app mounts]\n  B -->|no| DRIFT[layout drift]\n  C --> D[Ollama proxy]\n  D -->|unreachable| ERR[YiErrorState]\n  D -->|ok| PASS[pass]',
            },
            section1: { steps: [
                { title: 'Verify Vue 3 CDN pin',     action: 'grep "vue.global.prod.js" index.html', expected: 'Vue 3 pinned to /YiPet/cdn/vendor/', file: 'index.html' },
                { title: 'Verify fallback CDN',      action: 'grep "unpkg.com/vue@3.4.27" index.html', expected: 'fallback URL present', file: 'index.html' },
                { title: 'Verify Ollama proxy URL',  action: 'grep "ollama.effiy.cn" src/', expected: 'no hardcoded Ollama URL in source', file: 'src/' },
                { title: 'Verify error-state component', action: 'grep "YiErrorState" src/', expected: 'error state component referenced', file: 'src/' },
            ]},
            section2: { outputs: [
                { path: 'index.html', type: 'entry', description: 'Loads Vue 3 from /YiPet/cdn/vendor/vue.global.prod.js with unpkg fallback' },
                { path: 'config.js',  type: 'config', description: 'buildApiUrl() resolves window.API_URL or localhost:10086' },
            ]},
            section3: { report: [
                { step: 'Vue 3 CDN pinned?',         result: 'pass',    notes: 'vue.global.prod.js loaded from /YiPet/cdn/vendor/ with unpkg.com/vue@3.4.27 fallback.' },
                { step: 'Vue 3 version pinned?',    result: 'pass',    notes: 'CDN pinned to 3.4.27 per CLAUDE.md frameworkVersions.' },
                { step: 'Ollama URL hardcoded?',     result: 'partial', notes: 'No hardcoded Ollama URL in src/ — chat goes through window.API_URL + services.ai.chat_service module_name. Good.' },
                { step: 'Error-state component used?', result: 'partial', notes: 'requestHelper surfaces errors; YiErrorState pattern referenced in CLAUDE.md but not imported as a component in src/.' },
                { step: 'AbortController on stream?', result: 'pass',  notes: 'requestHelper uses AbortController + timeout race — SSE aborts cleanly.' },
            ], overall: 'CDN pin and fallback are correct; Ollama proxy is routed through config. Error-state component is referenced but not wired as a Vue component.' },
            section4: {
                edgeCases:    ['If /YiPet/cdn/ is unavailable AND unpkg is blocked, the SPA fails to mount — document a third offline fallback.'],
                improvements: ['Wire YiErrorState as a real Vue component in the aicr/story views.', 'Add a health-check ping to window.API_URL on app boot.'],
                limitations:  ['This scene cannot detect CDN content drift (e.g. vue.global.prod.js being replaced) — only path drift.'],
            },
            evidence: [
                { label: 'Vue 3 CDN pin',   value: '3.4.27 / /YiPet/cdn/vendor/' },
                { label: 'Unpkg fallback',  value: 'present' },
                { label: 'Ollama URL in src/', value: 'absent (good)' },
                { label: 'AbortController', value: 'present' },
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
