/**
 * yry-report-test · YiAi · FastAPI + MongoDB backend
 * ----------------------------------------------------------------------
 * Regenerated 2026-07-24 by the yry-reports/test dispatcher.
 * Source scope: /Users/ruiyi/Downloads/YrY/YiAi/ (Python).
 *
 * YiAi declares `testFramework: none` in CLAUDE.md — there is no
 * pytest / unittest config and no test_*.py files anywhere in the
 * tree. The six scenes below are **design-only** self-checks that
 * ship as scene-N/index.md narratives under this directory; each
 * documents a manual verification flow but has no executable
 * automation behind it. The composite score therefore reflects
 * "design complete, automation absent" rather than "tests passing".
 *
 * The scene narratives live at:
 *   YiDoc/projects/YiAi/test/scene-1..6-N/index.md
 * and are linked from this report as the source of truth.
 */
window.REPORT_CONFIG = {
    options: {
        scope: '/Users/ruiyi/Downloads/YrY/YiAi',
        scopeTitle: 'YiAi',
        generatedAt: '2026-07-24T00:00:00Z',
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
            '__pycache__', '.venv', 'venv', 'logs',
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
    scope: '/Users/ruiyi/Downloads/YrY/YiAi',
    score: 58,
    grade: 'C',
    summary: {
        totalScenes: 6,
        passCount: 0,
        partialCount: 6,
        failCount: 0,
        coverage: 0.62,
        totalFiles: 73,
        totalBytes: 228026,
    },
    facets: {
        init: {
            hasClaude: true, hasReadme: true, hasDocs: false, hasTests: false,
            hasPackageJson: false, hasPyproject: false, hasGoMod: false, hasCargoToml: false,
            totalFiles: 73, totalBytes: 228026,
        },
        tests: {
            framework: null, testFileCount: 0, testFiles: [], hasFramework: false,
        },
        docs: {
            docCount: 6, codeCount: 70, docRatio: 0.086,
            files: [
                'test/scene-1-post-init-full-self-check/index.md',
                'test/scene-2-pre-commit-incremental-self-check/index.md',
                'test/scene-3-doc-code-consistency/index.md',
                'test/scene-4-security-surface-regression/index.md',
                'test/scene-5-cross-story-integration-regression/index.md',
                'test/scene-6-third-party-framework-service/index.md',
            ],
            missingReadme: false, missingClaude: false, hasDocsDir: true,
        },
        security: {
            envFileCount: 0, envFiles: [], dangerousCallCount: 1,
            dangerousCalls: [
                { file: 'src/server/middleware.py', line: 71, call: 'auth whitelist on /write-file, /delete-file, /upload, /read-file' },
            ],
            hasEnvFile: false,
        },
        refs: {
            storyDirCount: 6, totalLinks: 24, brokenLinks: 0, brokenLinkDetails: [],
        },
        deps: {
            runtimeCount: 19, devCount: 0, totalCount: 19, pinningRatio: 1.0,
            pinned: ['fastapi>=0.104.0', 'uvicorn>=0.24.0', 'pydantic>=2.0.0', 'motor>=3.3.0', 'apscheduler>=3.10.0'],
            unpinned: [], stale: [],
        },
    },
    inventory: {
        totalFiles: 73,
        totalBytes: 228026,
        items: [
            { group: 'Python',     count: 70, pct: 95.9, bytes: 222612 },
            { group: 'YAML',        count: 1,  pct: 1.4,  bytes: 2296   },
            { group: 'Text',        count: 1,  pct: 1.4,  bytes: 342    },
            { group: 'Markdown',    count: 6,  pct: 8.2,  bytes: 38906   },
            { group: 'Other',       count: 1,  pct: 1.4,  bytes: 1776   },
        ],
    },
    compliance: [
        {
            framework: 'OWASP ASVS 4.0',
            area: 'Authentication & Session Management',
            controls: [
                { id: 'V3.2.1', text: 'Verify that all authentication decisions utilize the X-Token header middleware consistently.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
                { id: 'V3.2.2', text: 'Verify that file-mutation routes (/write-file, /delete-file, /upload) are NOT whitelisted from auth.', sceneSlug: 'security-surface-regression', sceneIndex: 4 },
            ],
        },
        {
            framework: 'NIST SSDF 1.1',
            area: 'Test & Verify',
            controls: [
                { id: 'PW.7', text: 'Verify that automated tests exist for the core API surface (execution, state, files).', sceneSlug: 'pre-commit-incremental-self-check', sceneIndex: 2 },
                { id: 'PW.7.2', text: 'Verify that the project documents a manual self-check flow when no automation exists.', sceneSlug: 'post-init-full-self-check', sceneIndex: 1 },
            ],
        },
        {
            framework: 'CIS SSC v1.0',
            area: 'Documentation & Traceability',
            controls: [
                { id: 'SSC-04', text: 'Verify that doc-code consistency is checked across the 6 test scenes.', sceneSlug: 'doc-code-consistency', sceneIndex: 3 },
            ],
        },
        {
            framework: 'SLSA v1.0',
            area: 'Build Provenance',
            controls: [
                { id: 'Build-L2', text: 'Verify that requirements.txt pins are respected and no floating tags are used.', sceneSlug: 'third-party-framework-service', sceneIndex: 6 },
            ],
        },
    ],
    riskRegister: [
        { id: 'TR-01', severity: 'high',   likelihood: 'high',   effort: 'medium', title: 'No automated test suite',                              description: 'YiAi declares testFramework: none — 0 test_*.py files; all verification is manual.',                              sceneIndex: 2, mitigation: 'Stand up pytest + httpx test suite covering /health/observer, /state/records, and execution POST.' },
        { id: 'TR-02', severity: 'high',   likelihood: 'medium', effort: 'low',    title: 'Auth whitelist on file-mutation routes',              description: 'POST /write-file, /delete-file, /upload, /read-file bypass X-Token auth (src/server/middleware.py:71).', sceneIndex: 4, mitigation: 'Remove the whitelist; require X-Token; gate via signed URLs if SPA needs unauthenticated access.' },
        { id: 'TR-03', severity: 'medium', likelihood: 'high',   effort: 'medium', title: 'Manual self-check flow is non-reproducible',         description: 'Scene 1 documents a 9-step manual flow — no CI gate, no recorded evidence of execution.',                          sceneIndex: 1, mitigation: 'Convert scene 1 steps into scripts/check_env.py + a CI job that runs on every push.' },
        { id: 'TR-04', severity: 'medium', likelihood: 'medium', effort: 'low',    title: 'Dev default auth token in config.yaml',              description: 'middleware.auth_token default is dev-token-change-me; no fail-fast at startup if the placeholder leaks.',     sceneIndex: 4, mitigation: 'Fail fast at startup if auth_token equals the placeholder; move to env var / secret manager.' },
        { id: 'TR-05', severity: 'medium', likelihood: 'medium', effort: 'medium', title: 'No third-party service health probe',                description: 'Scene 6 documents manual probes for MongoDB/Ollama/OSS/RSS/WeWork but no automated probe loop.',                 sceneIndex: 6, mitigation: 'Add a /health/dependencies endpoint that pings all 5 third-party services with timeout + circuit breaker.' },
        { id: 'TR-06', severity: 'low',    likelihood: 'high',   effort: 'low',    title: 'Doc-code drift unmonitored',                          description: 'Scene 3 defines consistency checks but no CI rule enforces the scene → source link.',                             sceneIndex: 3, mitigation: 'Add a CI lint that verifies every scene-*/index.md links to a real file path in src/.' },
    ],
    glossary: [
        { term: 'AC',            definition: 'Acceptance Criterion — a single testable statement in a scene §1 table.' },
        { term: 'Self-check',    definition: 'A manual or automated verification flow run after init or pre-commit.' },
        { term: 'Observer',      definition: 'The FastAPI middleware stack (Throttle / Sampler / Sandbox / Guard) in src/observer/.' },
        { term: 'X-Token',       definition: 'The API-key header verified by src/server/middleware.py against settings.auth_token.' },
        { term: 'BusinessException', definition: 'Project-specific exception type that surfaces ErrorCode via register_exception_handlers.' },
        { term: 'Motor',         definition: 'The async MongoDB driver used by src/data/database.py.' },
    ],
    roadmap: [
        {
            id: 'sprint-1', title: 'Sprint 1 — Test foundation', theme: 'Automation bootstrap',
            goal: 'Lift composite score from 58 → 70', expectedDelta: 12, itemCount: 3,
            items: [
                { id: 'S1-1', severity: 'high',   effort: 'medium', sceneIndex: 2, title: 'Stand up pytest + httpx test suite (test_health.py, test_state.py)' },
                { id: 'S1-2', severity: 'high',   effort: 'low',    sceneIndex: 4, title: 'Remove auth whitelist on /write-file, /delete-file, /upload, /read-file' },
                { id: 'S1-3', severity: 'medium', effort: 'low',    sceneIndex: 1, title: 'Add scripts/check_env.py + CI job to replace scene 1 manual flow' },
            ],
        },
        {
            id: 'sprint-2', title: 'Sprint 2 — Security hardening', theme: 'Defense in depth',
            goal: 'Lift composite score from 70 → 80', expectedDelta: 10, itemCount: 2,
            items: [
                { id: 'S2-1', severity: 'medium', effort: 'low',    sceneIndex: 4, title: 'Fail-fast at startup if auth_token equals dev placeholder' },
                { id: 'S2-2', severity: 'medium', effort: 'medium', sceneIndex: 6, title: 'Add /health/dependencies endpoint probing MongoDB/Ollama/OSS/RSS/WeWork' },
            ],
        },
        {
            id: 'sprint-3', title: 'Sprint 3 — Doc-code consistency gate', theme: 'Drift detection',
            goal: 'Lift composite score from 80 → 86', expectedDelta: 6, itemCount: 2,
            items: [
                { id: 'S3-1', severity: 'medium', effort: 'low', sceneIndex: 3, title: 'CI lint verifying every scene-*/index.md links to a real file path' },
                { id: 'S3-2', severity: 'low',    effort: 'low', sceneIndex: 5, title: 'Cross-story reference graph test — every arch → test link resolves' },
            ],
        },
        {
            id: 'sprint-4', title: 'Sprint 4 — Coverage polish', theme: 'Edge-case coverage',
            goal: 'Lift composite score from 86 → 90', expectedDelta: 4, itemCount: 2,
            items: [
                { id: 'S4-1', severity: 'low', effort: 'medium', sceneIndex: 4, title: 'Negative-path tests for X-Token mismatch + missing token' },
                { id: 'S4-2', severity: 'low', effort: 'low',    sceneIndex: 6, title: 'Circuit-breaker tests for Ollama / OSS / WeWork timeouts' },
            ],
        },
    ],
    metrics: {
        totalFiles: 73,
        totalBytes: 228026,
        avgBytes: 3124,
        medianBytes: 850,
        sizeBuckets: [
            { label: '0-1KB',    count: 62, bytes: 38912,  filePct: 84.9, bytesPct: 17.1 },
            { label: '1-5KB',    count: 7,  bytes: 17928,  filePct: 9.6,  bytesPct: 7.9  },
            { label: '5-10KB',   count: 3,  bytes: 25110,  filePct: 4.1,  bytesPct: 11.0 },
            { label: '10-20KB',  count: 1,  bytes: 19147,  filePct: 1.4,  bytesPct: 8.4  },
            { label: '20KB+',    count: 0,  bytes: 0,      filePct: 0.0,  bytesPct: 0.0  },
        ],
        largest: [
            { path: 'src/server/routes/story_panel.py', bytes: 19147 },
            { path: 'src/data/repository.py',           bytes: 17928 },
            { path: 'src/server/routes/files.py',       bytes: 17576 },
            { path: 'src/data/store.py',                bytes: 15426 },
            { path: 'src/domain/files/storage.py',       bytes: 11811 },
        ],
        topDirs: [
            { dir: 'src/server',  count: 11, bytes: 62923, pct: 27.6 },
            { dir: 'src/domain',  count: 15, bytes: 59403, pct: 26.1 },
            { dir: 'src/data',     count: 5,  bytes: 45231, pct: 19.8 },
            { dir: 'src/shared',   count: 7,  bytes: 21847, pct: 9.6  },
            { dir: 'src/observer', count: 6,  bytes: 13407, pct: 5.9  },
        ],
    },
    activity: {
        recentFileCount: 73,
        recentByteRatio: 1.0,
        buckets: [
            { label: '0-7d',      count: 73, bytes: 228026, filePct: 100.0, bytesPct: 100.0 },
            { label: '7-30d',    count: 0,  bytes: 0,      filePct: 0.0,   bytesPct: 0.0   },
            { label: '30-90d',   count: 0,  bytes: 0,      filePct: 0.0,   bytesPct: 0.0   },
            { label: '90-180d',  count: 0,  bytes: 0,      filePct: 0.0,   bytesPct: 0.0   },
            { label: '180d+',    count: 0,  bytes: 0,      filePct: 0.0,   bytesPct: 0.0   },
        ],
        freshest: [
            { path: 'src/data/repository.py',           ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/data/store.py',                ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/server/routes/files.py',        ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/server/routes/story_panel.py',  ageDays: 0, mtime: '2026-07-24' },
            { path: 'src/shared/config.py',              ageDays: 0, mtime: '2026-07-24' },
        ],
    },
    scenes: [
        {
            index: 1, slug: 'post-init-full-self-check', title: 'Post-Init Full Self-Check',
            icon: '🚀', facet: 'init', coverage: 0.65, verdict: 'partial',
            section0: {
                effect: 'A fresh git clone of YiAi boots into a working FastAPI service on port 10086 with MongoDB connected, Observer middleware registered, and the 3 core API surfaces (execution, state, observer health) responding.',
                matters: 'Without an init self-check, a regression in dependencies, config, or middleware registration surfaces only when a downstream caller fails — typically during an incident.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  clone[git clone] --> deps[pip install]\n  deps --> cfg[config.yaml]\n  cfg --> db[MongoDB ping]\n  db --> start[uvicorn :10086]\n  start --> docs[/docs 200]\n  docs --> obs[/health/observer]\n  obs --> exec[POST / execution]\n  exec --> state[GET /state/records]\n  state --> pass[✅ self-check pass]',
            },
            section1: {
                steps: [
                    { title: 'Install deps',           action: 'pip install -r requirements.txt',                                   expected: 'exit 0; 19 packages installed',                                                          file: 'requirements.txt' },
                    { title: 'Load config',           action: 'python -c "from src.shared.config import settings; print(settings.server_port)"', expected: 'prints 10086',                                                                            file: 'src/shared/config.py' },
                    { title: 'MongoDB ping',           action: 'mongosh --eval "db.runCommand({ping:1})"',                         expected: '{ ok: 1 }',                                                                              file: 'src/data/database.py' },
                    { title: 'Start service',          action: 'python main.py',                                                   expected: 'console shows "Starting server: http://0.0.0.0:10086"',                                  file: 'main.py' },
                    { title: 'Swagger endpoint',       action: 'curl -s -o /dev/null -w \'%{http_code}\' http://localhost:10086/docs', expected: '200',                                                                                    file: 'src/app.py' },
                    { title: 'Observer health',        action: 'curl -s http://localhost:10086/health/observer',                   expected: 'JSON with throttle_enabled, sampler_enabled, sandbox_enabled, guard_enabled',           file: 'src/server/routes/health.py' },
                    { title: 'Execution engine',       action: 'POST / with services.ai.chat_service list_ollama_models',          expected: 'JSON with success field (Ollama unreachable is non-blocking)',                            file: 'src/server/routes/execution.py' },
                    { title: 'State store',             action: 'curl -s http://localhost:10086/state/records?page_size=5',         expected: 'JSON with list + total fields',                                                           file: 'src/server/routes/state.py' },
                ],
            },
            section2: {
                outputs: [
                    { path: 'test/scene-1-post-init-full-self-check/index.md', type: 'markdown', description: '9-step manual self-check flow + report template' },
                    { path: 'src/app.py',                                          type: 'python',  description: 'FastAPI app factory — wires routes, CORS, auth middleware, observer stack' },
                    { path: 'src/shared/config.py',                                type: 'python',  description: 'Settings singleton loaded from config.yaml' },
                    { path: 'src/server/routes/health.py',                        type: 'python',  description: 'GET /health/observer — returns Observer runtime status' },
                ],
            },
            section3: {
                report: [
                    { step: 'AC-1.1', result: 'DESIGN',    notes: 'pip install step defined; 19 pins in requirements.txt' },
                    { step: 'AC-1.2', result: 'DESIGN',    notes: 'config.yaml required segments identified: server, mongodb, logging, observer, startup, cors' },
                    { step: 'AC-1.3', result: 'DESIGN',    notes: '/docs endpoint — FastAPI built-in Swagger UI' },
                    { step: 'AC-1.4', result: 'DESIGN',    notes: '3 core endpoints verified by path: execution POST, state GET, observer health GET' },
                    { step: 'AC-1.5', result: 'DESIGN',    notes: 'Observer health endpoint defined at /health/observer' },
                    { step: 'AC-1.6', result: 'DESIGN',    notes: 'Startup log check standard: no ERROR level' },
                ],
                overall: 'Design complete; no automated execution. Manual flow is reproducible on a clean clone but is not gated by CI.',
            },
            section4: {
                edgeCases: [
                    'Python < 3.10 — motor/apscheduler require 3.10+; pip install will fail with confusing PEP 600 errors.',
                    'config.yaml not in CWD — settings.load() looks at os.getcwd(); running uvicorn from a different dir silently reads the wrong config.',
                    'MongoDB unreachable — db.initialize() raises on startup if startup_init_database=true; otherwise surfaces lazily on first request.',
                ],
                improvements: [
                    'Convert the 9 manual steps into scripts/check_env.py with structured exit codes.',
                    'Add a pytest test_health.py that exercises steps 5-8 via httpx.AsyncClient against a test app instance.',
                    'Add a Dockerfile + docker-compose.yml so the self-check is one command (docker compose up).',
                ],
                limitations: [
                    'No automated test runner — every step is manual.',
                    'No coverage report — the testFramework:none declaration means even line coverage is unmeasured.',
                ],
            },
            evidence: [
                { label: 'Scene source',  value: 'test/scene-1-post-init-full-self-check/index.md (112 lines)' },
                { label: 'App entry',     value: 'main.py + src/app.py' },
                { label: 'Config loader', value: 'src/shared/config.py' },
                { label: 'Health route',  value: 'src/server/routes/health.py:45' },
                { label: 'Verdict',       value: 'partial — design complete, no automation' },
            ],
        },

        {
            index: 2, slug: 'pre-commit-incremental-self-check', title: 'Pre-Commit Incremental Self-Check',
            icon: '⚡', facet: 'tests', coverage: 0.50, verdict: 'partial',
            section0: {
                effect: 'A developer about to commit runs a fast, file-type-targeted verification: if only src/server/routes/*.py changed, only the route smoke tests run; if config.yaml changed, only the config-loader test runs.',
                matters: 'Without a fast pre-commit gate, every commit depends on the author remembering the full manual scene-1 flow — that is unrealistic and rots quickly.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  staged[git add] --> diff[git diff --cached --name-only]\n  diff --> classify{file type?}\n  classify -->|routes| route_smoke[routes smoke test]\n  classify -->|config| config_chk[config loader test]\n  classify -->|services| svc_smoke[services smoke test]\n  classify -->|docs| doc_lint[doc-code lint]\n  route_smoke --> pass{all green?}\n  config_chk --> pass\n  svc_smoke --> pass\n  doc_lint --> pass\n  pass -->|yes| commit[allow commit]\n  pass -->|no| block[block commit]',
            },
            section1: {
                steps: [
                    { title: 'Diff classification',  action: 'git diff --cached --name-only | sort by top-level dir', expected: 'files bucketed into routes / config / services / docs',                                       file: '.git/hooks/pre-commit' },
                    { title: 'Route smoke',          action: 'pytest tests/routes/ -k "$(touched_routes)"',             expected: 'all touched route tests pass',                                                                file: 'tests/routes/' },
                    { title: 'Config loader',        action: 'pytest tests/test_config.py',                              expected: 'config loads without error; required segments present',                                       file: 'src/shared/config.py' },
                    { title: 'Services smoke',       action: 'pytest tests/services/ -k "$(touched_services)"',          expected: 'touched services import + instantiate without error',                                        file: 'src/services/' },
                    { title: 'Doc-code lint',         action: 'scripts/check_doc_refs.py',                                expected: 'every scene-*/index.md links to a real file path',                                            file: 'scripts/check_doc_refs.py' },
                    { title: 'Commit gate',          action: 'exit 1 if any sub-step failed',                              expected: 'commit blocked on failure; allowed on success',                                                file: '.git/hooks/pre-commit' },
                ],
            },
            section2: {
                outputs: [
                    { path: 'test/scene-2-pre-commit-incremental-self-check/index.md', type: 'markdown', description: 'Incremental check strategy + pre-commit hook integration plan' },
                    { path: '.git/hooks/pre-commit',                                    type: 'shell',   description: 'Git pre-commit hook (not yet implemented)' },
                    { path: 'tests/',                                                   type: 'dir',     description: 'pytest test directory (not yet created)' },
                ],
            },
            section3: {
                report: [
                    { step: 'AC-2.1', result: 'DESIGN',    notes: 'Diff classification strategy documented; buckets: routes, config, services, docs' },
                    { step: 'AC-2.2', result: 'MISSING',   notes: 'pytest tests/ directory does not exist; no test runner config' },
                    { step: 'AC-2.3', result: 'MISSING',   notes: 'pre-commit hook is not wired' },
                    { step: 'AC-2.4', result: 'DESIGN',    notes: 'Doc-code lint script specified but not implemented' },
                ],
                overall: 'Strategy is well-defined but unimplemented. Zero automated tests exist; the pre-commit hook is not installed.',
            },
            section4: {
                edgeCases: [
                    'New file with no bucket classification — fall through to a full smoke run rather than silently skipping.',
                    'Merge commit (no staged diff) — pre-commit hook should short-circuit and allow the merge.',
                    'Huge diff (>100 files) — skip classification and run the full scene-1 flow.',
                ],
                improvements: [
                    'Scaffold tests/ with a single test_health.py importing the FastAPI test client.',
                    'Ship .pre-commit-config.yaml with the project so the hook is installed via `pre-commit install`.',
                    'Add a Makefile target `make precommit` that wraps the hook for developers who skip hooks.',
                ],
                limitations: [
                    'No pytest config in requirements.txt or pyproject.toml — testFramework is declared none.',
                    'No CI integration — even if the hook existed, contributors could bypass with --no-verify.',
                ],
            },
            evidence: [
                { label: 'Scene source',  value: 'test/scene-2-pre-commit-incremental-self-check/index.md (128 lines)' },
                { label: 'Test runner',   value: 'none declared (CLAUDE.md testFramework: none)' },
                { label: 'Test files',    value: '0 test_*.py files in src/' },
                { label: 'Pre-commit',    value: 'not wired' },
                { label: 'Verdict',       value: 'partial — strategy designed, automation absent' },
            ],
        },

        {
            index: 3, slug: 'doc-code-consistency', title: 'Doc-Code Consistency',
            icon: '📖', facet: 'docs', coverage: 0.75, verdict: 'partial',
            section0: {
                effect: 'Every scene-*/index.md and arch/scene-*/index.md narrative is checked against the current source tree: file paths referenced in the doc resolve, route paths still exist, line numbers are within range, and the documented middleware chain matches src/app.py.',
                matters: 'Drift between docs and code is the #1 onboarding friction — new contributors follow a doc that points at a file that no longer exists, then lose trust in the rest of the catalog.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  doc[scene-*/index.md] --> parse[extract file paths]\n  parse --> check{path exists?}\n  check -->|yes| next[next reference]\n  check -->|no| drift[flag drift]\n  next --> done[all refs checked]\n  drift --> report[drift report]',
            },
            section1: {
                steps: [
                    { title: 'Extract refs',         action: 'grep -oE \'src/[^ )`]+\' test/scene-*/index.md arch/scene-*/index.md', expected: 'list of file paths referenced in docs', file: 'scripts/check_doc_refs.py' },
                    { title: 'Verify existence',     action: 'for each ref: test -f "$ref"',                                        expected: 'all refs resolve on disk',             file: 'scripts/check_doc_refs.py' },
                    { title: 'Verify route paths',  action: 'grep -E \'@(router|app)\\.(get|post|put|delete)\' src/server/routes/*.py', expected: 'every documented route path still defined', file: 'src/server/routes/' },
                    { title: 'Verify line ranges',   action: 'for each "src/foo.py:NN" ref: sed -n "NNp" src/foo.py',               expected: 'line NN exists and is non-empty',      file: 'scripts/check_doc_refs.py' },
                    { title: 'Report drift',         action: 'exit 1 if any ref failed',                                            expected: 'CI fails with a drift report',          file: 'scripts/check_doc_refs.py' },
                ],
            },
            section2: {
                outputs: [
                    { path: 'test/scene-3-doc-code-consistency/index.md', type: 'markdown', description: 'Doc-code consistency check methodology + drift taxonomy' },
                    { path: 'scripts/check_doc_refs.py',                   type: 'python',  description: 'Drift detector (not yet implemented)' },
                    { path: 'arch/',                                         type: 'dir',     description: 'Architecture scene directory (5 scenes)' },
                ],
            },
            section3: {
                report: [
                    { step: 'AC-3.1', result: 'DESIGN',    notes: 'Ref extraction pattern defined: grep -oE on src/ paths' },
                    { step: 'AC-3.2', result: 'DESIGN',    notes: 'Route path verification pattern defined' },
                    { step: 'AC-3.3', result: 'DESIGN',    notes: 'Line range verification pattern defined' },
                    { step: 'AC-3.4', result: 'MISSING',   notes: 'scripts/check_doc_refs.py not implemented' },
                ],
                overall: 'Methodology is the most detailed of the 6 scenes (167 lines); automation is the gap.',
            },
            section4: {
                edgeCases: [
                    'Dynamic path strings (f-strings, templated) — exclude from drift detection or treat as best-effort.',
                    'Paths that cross into .venv/ or __pycache__/ — excluded by the exclusionDirs constant.',
                    'Renamed files — drift detector flags; a separate "rename suggest" pass would propose the new path.',
                ],
                improvements: [
                    'Implement scripts/check_doc_refs.py and wire it into CI.',
                    'Add a markdown lint rule that flags inline code blocks without a corresponding file path.',
                    'Auto-generate scene TOC from the scene-*/index.md headers so the report stays in sync.',
                ],
                limitations: [
                    'Cannot detect semantic drift (e.g., a route whose path is unchanged but whose contract changed).',
                    'Requires the doc to use literal paths — symbolic refs like "the routes module" are invisible.',
                ],
            },
            evidence: [
                { label: 'Scene source',  value: 'test/scene-3-doc-code-consistency/index.md (167 lines — most detailed scene)' },
                { label: 'Doc count',     value: '6 test scene docs + 5 arch scene docs' },
                { label: 'Drift detector',value: 'not implemented' },
                { label: 'Verdict',       value: 'partial — methodology complete, automation missing' },
            ],
        },

        {
            index: 4, slug: 'security-surface-regression', title: 'Security Surface Regression',
            icon: '🔒', facet: 'security', coverage: 0.65, verdict: 'partial',
            section0: {
                effect: 'A diff that adds a new route, changes middleware, or touches config.yaml is checked for security surface drift: new endpoints must declare auth, removed middleware must not break coverage, and the X-Token whitelist must not grow.',
                matters: 'Security surface drift is the root cause of most "we shipped an unauthenticated endpoint" incidents — the developer did not realize their diff widened the attack surface.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  diff[git diff] --> routes{new routes?}\n  diff --> mw{middleware changed?}\n  diff --> cfg{config.yaml touched?}\n  routes -->|yes| auth_chk[assert auth decorator]\n  mw -->|yes| chain_chk[assert chain intact]\n  cfg -->|yes| token_chk[assert auth_token not placeholder]\n  auth_chk --> pass{all green?}\n  chain_chk --> pass\n  token_chk --> pass\n  pass -->|yes| commit[allow]\n  pass -->|no| block[block]',
            },
            section1: {
                steps: [
                    { title: 'New routes auth check', action: 'for each new @router.* decorator: assert middleware or auth dependency present',  expected: 'no unauthenticated mutation routes added', file: 'src/server/middleware.py' },
                    { title: 'Whitelist growth check', action: 'git diff src/server/middleware.py | grep -E \'^\+.*in \[\'',                   expected: 'no new paths added to the auth whitelist',   file: 'src/server/middleware.py' },
                    { title: 'Token placeholder check', action: 'grep -E "dev-token-change-me" config.yaml',                                  expected: 'placeholder removed before deploy',         file: 'config.yaml' },
                    { title: 'CORS origin check',       action: 'grep -E "allow_origins" config.yaml',                                          expected: 'no wildcard in production',                  file: 'config.yaml' },
                    { title: 'Dangerous call check',    action: 'grep -rE "subprocess|eval|exec\\(" src/',                                     expected: 'no new dangerous calls without review',      file: 'src/' },
                ],
            },
            section2: {
                outputs: [
                    { path: 'test/scene-4-security-surface-regression/index.md', type: 'markdown', description: 'Security drift taxonomy + manual regression flow' },
                    { path: 'src/server/middleware.py',                            type: 'python',  description: 'X-Token middleware + auth whitelist (line 71)' },
                    { path: 'config.yaml',                                            type: 'yaml',    description: 'auth_token + CORS origins' },
                ],
            },
            section3: {
                report: [
                    { step: 'AC-4.1', result: 'FAIL',     notes: '4 file-mutation routes bypass auth (whitelist at middleware.py:71)' },
                    { step: 'AC-4.2', result: 'WARN',    notes: 'auth_token placeholder "dev-token-change-me" present in config.yaml' },
                    { step: 'AC-4.3', result: 'PASS',    notes: 'CORS configured (not wildcard in production path)' },
                    { step: 'AC-4.4', result: 'PASS',    notes: 'No dangerous subprocess/eval/exec calls in src/' },
                ],
                overall: 'Two active findings: auth whitelist on file-mutation routes (high) and dev placeholder token (medium).',
            },
            section4: {
                edgeCases: [
                    'Webhook callback routes that genuinely need to be unauthenticated (e.g., WeWork callback) — should be in a separate "intentional unauth" list, not the bypass whitelist.',
                    'Service-to-service routes — should use mTLS or internal network policy, not a shared X-Token.',
                    'Preflight OPTIONS requests — already short-circuited by middleware; no action needed.',
                ],
                improvements: [
                    'Remove /write-file, /delete-file, /upload, /read-file from the whitelist.',
                    'Add a fail-fast startup check: if settings.auth_token == "dev-token-change-me" and env is production, raise.',
                    'Move auth_token to an environment variable loaded via pydantic-settings.',
                ],
                limitations: [
                    'No SAST tool integrated — the dangerous-call grep is a coarse proxy for semgrep / bandit.',
                    'No dependency vulnerability scanning — pip-audit / safety are not wired.',
                ],
            },
            evidence: [
                { label: 'Scene source',  value: 'test/scene-4-security-surface-regression/index.md (151 lines)' },
                { label: 'Auth whitelist',value: 'src/server/middleware.py:71 — [/write-file, /read-file, /delete-file, /upload]' },
                { label: 'Auth token',    value: 'config.yaml — default "dev-token-change-me"' },
                { label: 'CORS',          value: 'configured via settings.get_cors_origins()' },
                { label: 'Verdict',       value: 'partial — 2 active findings; design complete' },
            ],
        },

        {
            index: 5, slug: 'cross-story-integration-regression', title: 'Cross-Story Integration Regression',
            icon: '🔗', facet: 'refs', coverage: 0.55, verdict: 'partial',
            section0: {
                effect: 'When an arch/scene-N narrative is updated, every test/scene-M that references it is re-verified to still hold: the referenced source paths exist, the referenced contracts are unchanged, and the scene-to-scene link graph has no orphans.',
                matters: 'Cross-story drift is silent — an arch update can invalidate a test scene without either side noticing, leaving the catalog with stale integration guarantees.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  arch_update[arch/scene-N updated] --> find_refs[find test/scene-M referencing N]\n  find_refs --> verify{refs still valid?}\n  verify -->|yes| pass[✅ integration holds]\n  verify -->|no| drift[flag cross-story drift]\n  drift --> report[drift report]',
            },
            section1: {
                steps: [
                    { title: 'Build link graph', action: 'grep -rE "arch/scene-[0-9]" test/scene-*/index.md',                 expected: 'map of test scene → referenced arch scenes', file: 'scripts/check_cross_story.py' },
                    { title: 'Verify arch paths',  action: 'for each ref: test -f "arch/scene-N-*/index.md"',                  expected: 'all referenced arch scenes exist',           file: 'scripts/check_cross_story.py' },
                    { title: 'Detect orphans',     action: 'for each arch scene: is it referenced by at least one test scene?', expected: 'no orphan arch scenes',                      file: 'scripts/check_cross_story.py' },
                    { title: 'Report drift',       action: 'exit 1 on any broken ref or orphan',                                expected: 'CI fails with a cross-story drift report',   file: 'scripts/check_cross_story.py' },
                ],
            },
            section2: {
                outputs: [
                    { path: 'test/scene-5-cross-story-integration-regression/index.md', type: 'markdown', description: 'Cross-story reference graph + drift detection methodology' },
                    { path: 'scripts/check_cross_story.py',                             type: 'python',  description: 'Cross-story linter (not yet implemented)' },
                    { path: 'arch/',                                                   type: 'dir',      description: 'Architecture scene directory (5 scenes)' },
                ],
            },
            section3: {
                report: [
                    { step: 'AC-5.1', result: 'DESIGN',  notes: 'Link graph extraction pattern defined' },
                    { step: 'AC-5.2', result: 'DESIGN',  notes: 'Arch path verification pattern defined' },
                    { step: 'AC-5.3', result: 'DESIGN',  notes: 'Orphan detection pattern defined' },
                    { step: 'AC-5.4', result: 'MISSING', notes: 'scripts/check_cross_story.py not implemented' },
                ],
                overall: 'Methodology complete; automation absent. The 6 test scenes do not yet cross-reference the 5 arch scenes — the link graph is sparse.',
            },
            section4: {
                edgeCases: [
                    'A test scene intentionally orphaned (e.g., a meta scene) — allow an explicit `// orphan: true` marker.',
                    'Renamed arch scene — cross-story linter should propose the rename target.',
                    'Multi-hop references (test → arch → arch) — graph traversal needed, not a flat grep.',
                ],
                improvements: [
                    'Implement scripts/check_cross_story.py and wire into CI.',
                    'Add explicit "Referenced by" footer to every arch scene doc.',
                    'Generate a visual graph (mermaid) of the scene link map for the dashboard.',
                ],
                limitations: [
                    'Currently the test scenes reference the source code directly, not the arch scenes — the cross-story graph has very few edges today.',
                    'No tooling enforces the link — drift is only caught by manual review.',
                ],
            },
            evidence: [
                { label: 'Scene source',  value: 'test/scene-5-cross-story-integration-regression/index.md (120 lines)' },
                { label: 'Arch scenes',  value: '5 (arch/scene-1..5)' },
                { label: 'Test scenes',  value: '6 (test/scene-1..6)' },
                { label: 'Cross-refs',   value: 'sparse — test scenes reference src/ directly, not arch/' },
                { label: 'Verdict',      value: 'partial — methodology complete, graph sparse, no automation' },
            ],
        },

        {
            index: 6, slug: 'third-party-framework-service', title: 'Third-Party Framework & Service Health',
            icon: '🌐', facet: 'deps', coverage: 0.70, verdict: 'partial',
            section0: {
                effect: 'YiAi depends on 5 external services: MongoDB (blocking), Ollama (non-blocking, AI), OSS (non-blocking, has local fallback), RSS (non-blocking, scheduler-paused on failure), WeWork (non-blocking, webhook best-effort). A /health/dependencies endpoint reports each service status with timeout + circuit breaker.',
                matters: 'Without a dependency health probe, the only signal that Ollama is down is a user reporting "AI chat is broken" — by then it has been broken for hours.',
                mermaid: '%%{init: {\"theme\":\"dark\"}}%%\nflowchart LR\n  yiai[YiAi] --> mongo[(MongoDB)]\n  yiai --> ollama[(Ollama)]\n  yiai --> oss[(Aliyun OSS)]\n  yiai --> rss[(RSS feeds)]\n  yiai --> wework[(WeWork webhook)]\n  mongo --> m_chk{ping?}\n  ollama --> o_chk{tags?}\n  oss --> o_chk2{AK/SK?}\n  rss --> r_chk{reachable?}\n  wework --> w_chk{webhook?}\n  m_chk -->|yes| ok[✅]\n  o_chk -->|no| degrade[🟡 AI degraded]\n  o_chk2 -->|no| local[🟡 storage local fallback]\n  r_chk -->|no| paused[🟡 RSS paused]\n  w_chk -->|no| silent[🟡 notifications silent]',
            },
            section1: {
                steps: [
                    { title: 'MongoDB ping',         action: 'await db.db.command("ping")',                                    expected: '{ ok: 1 }',                                  file: 'src/data/database.py' },
                    { title: 'Ollama tags',           action: 'curl -s http://localhost:11434/api/tags',                        expected: 'JSON with models array (empty acceptable)', file: 'src/domain/ai/chat.py' },
                    { title: 'OSS credentials',       action: 'await upload_bytes_to_oss(b"ping", "health-probe.txt")',        expected: 'returns a URL; falls back to local on failure', file: 'src/domain/files/storage.py' },
                    { title: 'RSS feed reachability', action: 'feedparser.parse(feed_url)',                                    expected: 'no exception; entries list may be empty',  file: 'src/domain/rss/feed.py' },
                    { title: 'WeWork webhook',         action: 'POST webhook_url with "health probe" content',                 expected: 'errcode == 0; non-blocking on failure',       file: 'src/server/routes/wework.py' },
                    { title: 'Aggregate endpoint',     action: 'GET /health/dependencies',                                      expected: 'JSON with 5 service statuses + circuit-breaker counters', file: 'src/server/routes/health.py' },
                ],
            },
            section2: {
                outputs: [
                    { path: 'test/scene-6-third-party-framework-service/index.md', type: 'markdown', description: 'Dependency health matrix + circuit-breaker strategy (178 lines — largest scene)' },
                    { path: 'src/data/database.py',                                 type: 'python',  description: 'Motor async MongoDB client + initialize()/close()' },
                    { path: 'src/domain/ai/chat.py',                                 type: 'python',  description: 'Ollama chat client + list_ollama_models' },
                    { path: 'src/domain/files/storage.py',                           type: 'python',  description: 'OSS upload with local-storage fallback' },
                    { path: 'src/domain/rss/feed.py',                                type: 'python',  description: 'feedparser-based RSS fetch' },
                    { path: 'src/server/routes/wework.py',                            type: 'python',  description: 'WeWork webhook forwarder with timeout=10s' },
                ],
            },
            section3: {
                report: [
                    { step: 'AC-6.1', result: 'DESIGN',  notes: 'MongoDB ping defined (blocking)' },
                    { step: 'AC-6.2', result: 'DESIGN',  notes: 'Ollama tags probe defined (non-blocking)' },
                    { step: 'AC-6.3', result: 'DESIGN',  notes: 'OSS credential probe defined (non-blocking, has fallback)' },
                    { step: 'AC-6.4', result: 'DESIGN',  notes: 'RSS reachability probe defined' },
                    { step: 'AC-6.5', result: 'DESIGN',  notes: 'WeWork webhook probe defined' },
                    { step: 'AC-6.6', result: 'MISSING', notes: '/health/dependencies endpoint not yet implemented' },
                ],
                overall: 'Per-service probes are well-designed with explicit blocking/non-blocking classification; the aggregate /health/dependencies endpoint is the gap.',
            },
            section4: {
                edgeCases: [
                    'Ollama slow startup (>5s) — tag list may time out; treat as degraded, not down.',
                    'OSS rate-limited — temporary 429 should not flip the circuit breaker.',
                    'WeWork webhook behind corporate proxy — timeout=10s may be too aggressive; allow override via config.',
                    'RSS feed permanently 404 — should pause the scheduler, not retry forever.',
                ],
                improvements: [
                    'Implement GET /health/dependencies that runs all 5 probes concurrently with asyncio.gather + return_exceptions=True.',
                    'Add a circuit-breaker per service (e.g., pybreaker) so a flapping dependency does not stall every request.',
                    'Wire the dependency health into the Observer health route so /health/observer includes upstream status.',
                ],
                limitations: [
                    'No live probe — only the design exists.',
                    'No circuit breaker library pinned in requirements.txt.',
                ],
            },
            evidence: [
                { label: 'Scene source',  value: 'test/scene-6-third-party-framework-service/index.md (178 lines — largest scene)' },
                { label: 'MongoDB',       value: 'src/data/database.py — Motor async client' },
                { label: 'Ollama',        value: 'src/domain/ai/chat.py — ollama python client' },
                { label: 'OSS',           value: 'src/domain/files/storage.py — oss2 + local fallback' },
                { label: 'RSS',           value: 'src/domain/rss/feed.py — feedparser' },
                { label: 'WeWork',        value: 'src/server/routes/wework.py — aiohttp webhook' },
                { label: 'Verdict',       value: 'partial — probes designed, aggregate endpoint missing' },
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
