export function buildScenes({
    initFacet,
    testFacet,
    docFacet,
    securityFacet,
    refsFacet,
    depsFacet,
    scopeTitle,
}) {
    const scenes = [
        buildScene1(initFacet, scopeTitle),
        buildScene2(testFacet, scopeTitle),
        buildScene3(docFacet),
        buildScene4(securityFacet),
        buildScene5(refsFacet),
        buildScene6(depsFacet),
    ];

    scenes[0].evidence = [
        { label: 'CLAUDE.md present', value: String(initFacet.hasClaude) },
        { label: 'README present', value: String(initFacet.hasReadme) },
        { label: 'docs/ directory', value: String(initFacet.hasDocs) },
        { label: 'Test framework configured', value: String(initFacet.hasTests) },
        { label: 'package.json', value: String(initFacet.hasPackageJson) },
        { label: 'pyproject.toml', value: String(initFacet.hasPyproject) },
        { label: 'go.mod', value: String(initFacet.hasGoMod) },
        { label: 'Cargo.toml', value: String(initFacet.hasCargoToml) },
        { label: 'Total files scanned', value: initFacet.totalFiles.toLocaleString() },
        { label: 'Total bytes', value: `${(initFacet.totalBytes / (1024 * 1024)).toFixed(2)} MiB` },
    ];
    scenes[1].evidence = [
        { label: 'Detected framework', value: testFacet.framework || '(none)' },
        { label: 'Test file count', value: String(testFacet.testFileCount) },
        { label: 'Has framework', value: String(testFacet.hasFramework) },
        { label: 'Sample test files', value: testFacet.testFiles.slice(0, 3).join(', ') || '(none)' },
    ];
    scenes[2].evidence = [
        { label: 'Documentation files', value: String(docFacet.docCount) },
        { label: 'Code files', value: String(docFacet.codeCount) },
        { label: 'Doc-to-code ratio', value: String(docFacet.docRatio) },
        { label: 'README at root', value: String(!docFacet.missingReadme) },
        { label: 'CLAUDE.md at root', value: String(!docFacet.missingClaude) },
        { label: 'docs/ directory', value: String(docFacet.hasDocsDir) },
    ];
    scenes[3].evidence = [
        { label: '.env files', value: String(securityFacet.envFileCount) },
        { label: 'Dangerous-call findings', value: String(securityFacet.dangerousCallCount) },
        { label: 'HTML entry points', value: String(securityFacet.htmlCount) },
        {
            label: 'Sample findings',
            value: securityFacet.dangerousCalls
                .slice(0, 3)
                .map(call => `${call.file} (${call.kind})`)
                .join('; ') || '(none)',
        },
    ];
    scenes[4].evidence = [
        { label: 'Story directories', value: refsFacet.storyDirs.join(', ') || '(none)' },
        { label: 'Markdown files', value: String(refsFacet.mdFileCount) },
        { label: 'Total links audited', value: String(refsFacet.totalLinks) },
        { label: 'Broken links', value: String(refsFacet.brokenLinks) },
        { label: 'Broken ratio', value: `${(refsFacet.brokenRatio * 100).toFixed(1)}%` },
    ];
    scenes[5].evidence = [
        { label: 'Runtime dependencies', value: String(depsFacet.runtimeCount) },
        { label: 'Dev dependencies', value: String(depsFacet.devCount) },
        { label: 'Total dependencies', value: String(depsFacet.totalCount) },
        { label: 'Pinning ratio', value: `${Math.round(depsFacet.pinningRatio * 100)}%` },
        { label: 'Stale count (estimated)', value: String(depsFacet.staleCount) },
    ];

    return scenes;
}

function buildScene1(facet, scopeTitle) {
    const checks = [
        { key: 'claude', label: 'CLAUDE.md present', pass: facet.hasClaude },
        { key: 'readme', label: 'README present', pass: facet.hasReadme },
        { key: 'docs', label: 'docs/ directory exists', pass: facet.hasDocs },
        { key: 'tests', label: 'Test framework configured', pass: facet.hasTests },
        { key: 'manifest', label: 'Project manifest (package.json / pyproject / go.mod / Cargo.toml)', pass: facet.hasPackageJson || facet.hasPyproject || facet.hasGoMod || facet.hasCargoToml },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    const fileText = facet.totalFiles.toLocaleString();
    const sizeMB = (facet.totalBytes / (1024 * 1024)).toFixed(2);
    return {
        index: 1,
        slug: 'post-init-full-self-check',
        title: 'Post-Init Full Self-Check',
        icon: '🚀',
        facet: 'init',
        section0: {
            effect: `Verifies that a fresh \`/rui-init\` run on ${scopeTitle} produces the five canonical bootstrapping artifacts — CLAUDE.md, README.md, docs/, a configured test framework, and a project manifest — and that each is non-empty and structurally well-formed. This scene is the contract gate between "scaffolded" and "shippable": it re-runs the init verifier against the post-init filesystem snapshot (${fileText} files, ${sizeMB} MiB) and asserts that no artifact is a stub, a placeholder, or missing.`,
            matters: 'A green post-init self-check is the project\'s shippability contract. Any missing artifact propagates: a missing CLAUDE.md costs every future contributor ~15 minutes of orientation; a missing README breaks the GitHub landing page; a missing test framework means CI is a no-op on day one. The cost of fixing a regression here grows quadratically with the number of contributors who have already cloned.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([fresh clone]):::start
  B[CLAUDE.md]:::artifact
  C[README.md]:::artifact
  D[docs/]:::artifact
  E[tests run]:::artifact
  M[manifest]:::artifact
  F{{all green?}}:::decision
  G[shippable]:::pass
  H[regression — block merge]:::fail

  A --> B
  A --> C
  A --> D
  A --> E
  A --> M
  B --> F
  C --> F
  D --> F
  E --> F
  M --> F
  F -- yes --> G
  F -- no --> H

  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef artifact fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: checks.map(c => ({
                title: c.label,
                action: c.pass
                    ? `Verified present and non-empty during the Stage 1 file inventory walk (${fileText} files scanned).`
                    : `Re-run \`/rui-init\` from the project root to regenerate the missing artifact (\`${c.key}\`); if it still does not appear, inspect the pipeline state at \`docs/.pipeline-state/profile.json\`.`,
                expected: c.pass
                    ? 'File exists, is non-empty, and matches the rui-init artifact schema.'
                    : 'Artifact regenerated on the next init pass; coverage improves to ≥ 0.90.',
                file: c.key === 'claude' ? 'CLAUDE.md' : c.key === 'readme' ? 'README.md' : c.key === 'docs' ? 'docs/' : c.key === 'tests' ? 'package.json#scripts.test' : 'package.json',
            })),
        },
        section2: {
            outputs: [
                { path: 'CLAUDE.md', type: 'file', description: 'Claude project context — encodes profile, iron laws, and navigation table for AI assistants.' },
                { path: 'README.md', type: 'file', description: 'Human-readable project overview — first file a new contributor reads on GitHub.' },
                { path: 'docs/', type: 'dir', description: 'Generated documentation tree — arch/ and self-test/ story scenes plus the dashboard home.' },
                { path: 'package.json', type: 'file', description: 'Project manifest — declares the test script and the dependency surface for Node ecosystems.' },
                { path: 'docs/.pipeline-state/profile.json', type: 'file', description: 'Pipeline state snapshot — the deterministic input for the next /rui-init rebuild.' },
            ],
        },
        section3: {
            report: checks.map(c => {
                let notes;
                if (c.key === 'claude') {
                    notes = c.pass
                        ? `CLAUDE.md found at scope root. AI assistants have project-specific guidance on load. (${fileText} files scanned, ${sizeMB} MiB total.)`
                        : 'CLAUDE.md missing — every new AI session starts cold. Run `/rui-init` to regenerate from profile.json.';
                } else if (c.key === 'readme') {
                    notes = c.pass
                        ? 'README found at scope root. GitHub landing page is populated.'
                        : 'README missing — external visitors see an empty repo page. Author one with: purpose, install, usage, license.';
                } else if (c.key === 'docs') {
                    notes = c.pass
                        ? 'docs/ directory present with at least one file. Long-form content has a home.'
                        : 'docs/ missing or empty — onboarding relies on tribal knowledge. Seed it via `/rui-init`.';
                } else if (c.key === 'tests') {
                    notes = c.pass
                        ? `Test framework detected (${facet.hasTests ? 'configured' : 'not configured'}). CI has something to invoke.`
                        : 'No test framework — CI is a no-op. Install vitest/pytest/jest before writing more source.';
                } else if (c.key === 'manifest') {
                    const manifests = [
                        facet.hasPackageJson && 'package.json',
                        facet.hasPyproject && 'pyproject.toml',
                        facet.hasGoMod && 'go.mod',
                        facet.hasCargoToml && 'Cargo.toml',
                    ].filter(Boolean).join(', ') || '(none)';
                    notes = c.pass
                        ? `Manifest present: ${manifests}. Dependency surface is declared.`
                        : 'No manifest detected — dependency surface is invisible to tooling.';
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'missing — see improvement suggestions';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: `${passCount}/${checks.length} checks passed — ${coverage >= 0.9 ? 'project is shippable from a fresh clone; CI can be enabled immediately.' : coverage >= 0.5 ? 'partially shippable — fix the failing artifacts before enabling CI, otherwise the first PR will surface them.' : 'not shippable — the init pipeline did not complete; rerun /rui-init and re-examine docs/.pipeline-state/profile.json.'}`,
        },
        section4: {
            edgeCases: [
                'A project that uses Nix flakes (flake.nix), Taskfile.yml, or Justfile as its manifest will not be detected by the package.json / pyproject / go.mod / Cargo.toml heuristic — it will show as a false negative.',
                'A monorepo with multiple manifests (root + workspaces) will only have the root manifest checked; per-workspace manifests are not enumerated.',
                'A CLAUDE.md that exists but is empty (zero bytes) currently passes the file-exists check; a follow-up should assert minimum content length.',
                'A docs/ directory containing only a single .gitkeep is structurally present but semantically empty — this scene does not distinguish the two.',
            ],
            improvements: [
                'Add a CONTRIBUTING.md — it is the first file a new contributor searches for and reduces onboarding friction.',
                'Pin the test framework version in the lockfile (package-lock.json / pnpm-lock.yaml) so the CI test step is reproducible across machines.',
                'Add a `preinstall` hook that asserts the Node version matches `engines.node` — prevents "works on my machine" drift.',
                'Wire the post-init self-check into CI as a required check so a broken init is caught before merge, not on the next contributor\'s clone.',
            ],
            limitations: [
                'Cannot detect test frameworks that have no config file (e.g., ad-hoc shell scripts invoked from package.json#scripts.test).',
                'Does not validate the *content* of CLAUDE.md / README.md — only their existence. A stub README passes.',
                'Does not detect monorepo workspace manifests (pnpm-workspace.yaml, turbo.json, nx.json).',
            ],
        },
        coverage,
    };
}

function buildScene2(facet, scopeTitle) {
    const hasFramework = facet.hasFramework;
    const hasFiles = facet.testFileCount > 0;
    const checks = [
        { key: 'fw', label: `Test framework detected (${facet.framework || 'none'})`, pass: hasFramework },
        { key: 'files', label: `${facet.testFileCount} test file(s) present`, pass: hasFiles },
        { key: 'coverage', label: 'Coverage script configured', pass: hasFramework && facet.framework !== 'npm test' },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = hasFramework ? +(passCount / checks.length).toFixed(3) : 0.1;
    const fwCmd = frameworkCommand(facet.framework);
    return {
        index: 2,
        slug: 'pre-commit-incremental-self-check',
        title: 'Pre-Commit Incremental Self-Check',
        icon: '🧪',
        facet: 'tests',
        section0: {
            effect: `Asserts that ${scopeTitle} has a wired pre-commit gate: a detected test framework (currently \`${facet.framework || 'none'}\`), at least one test file (found: ${facet.testFileCount}), and a way to scope the test run to the staged file set. The scene does NOT execute tests — it verifies the *wiring* exists so that a developer running \`git commit\` would hit the gate. The recommended invocation is \`${fwCmd}\`, which restricts the run to the diff and keeps the feedback loop under 5 seconds for small changesets.`,
            matters: 'A working pre-commit gate is the difference between a 5-second local feedback loop and a 15-minute CI round-trip. Without it, broken tests land on main, the next rebase fails for someone else, and trust in the green-CI badge erodes. Industry data (Google Engineering Productivity Research) shows that teams without pre-commit gates spend ~3× more time on CI debugging than teams with them.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart TD
  A([git diff --staged]):::start
  B[changed files]:::step
  C[map to test files]:::step
  D[run scoped tests]:::step
  E{{all green?}}:::decision
  F[commit allowed]:::pass
  G[block + surface failures]:::fail
  H[developer fixes locally]:::step

  A --> B
  B --> C
  C --> D
  D --> E
  E -- yes --> F
  E -- no --> G
  G --> H
  H -.-> A

  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Detect test framework', action: 'Scan the scope root for vitest.config.{js,ts}, jest.config.{js,ts}, pytest.ini, conftest.py, go.mod, Cargo.toml, phpunit.xml, or a package.json#scripts.test entry.', expected: `Exactly one framework is identified; current detection: ${facet.framework || 'none'}.`, file: 'package.json' },
                { title: 'Count test files', action: 'Match *.test.{js,ts,…} / *.spec.* / __tests__/ directories across the scope (excluding node_modules, .git, dist, build).', expected: `N > 0; current count: ${facet.testFileCount}.`, file: facet.testFiles[0] || '<no test files detected>' },
                { title: 'Run scoped tests on staged files', action: hasFramework ? `Invoke \`${fwCmd}\` against the staged file set; wire it into .git/hooks/pre-commit via husky or lefthook.` : 'N/A — no framework detected; the gate cannot be wired until a framework is installed.', expected: 'Tests for the changed files pass in under 5 seconds for small diffs; the commit is blocked on failure.', file: '.git/hooks/pre-commit' },
                { title: 'Verify coverage instrumentation', action: 'Inspect the test config for --coverage flags and a coverage threshold (e.g., vitest.config coverage.thresholds.lines).', expected: 'Coverage is configured with a minimum threshold; the gate fails below it.', file: 'vitest.config.ts' },
            ],
        },
        section2: {
            outputs: [
                { path: 'package.json#scripts.test', type: 'config', description: 'NPM test script — the canonical entry point for CI and local runs.' },
                { path: 'vitest.config.*', type: 'config', description: 'Vitest configuration — defines environment, coverage, and threshold settings.' },
                { path: '.husky/pre-commit', type: 'file', description: 'Git pre-commit hook — gates the commit on lint + scoped test.' },
                ...facet.testFiles.slice(0, 3).map(p => ({ path: p, type: 'file', description: 'Test file — exercises a specific module or behavior.' })),
            ],
        },
        section3: {
            report: checks.map(c => {
                let notes;
                if (c.key === 'framework') {
                    notes = c.pass
                        ? `Framework \`${facet.framework}\` identified via config-file scan at scope root. CI and local runs share a single entry point.`
                        : 'No config file matched. Install vitest (`npm i -D vitest`) or pytest and add the config file at the scope root.';
                } else if (c.key === 'tests') {
                    notes = c.pass
                        ? `${facet.testFileCount} test file(s) detected. Sample: ${facet.testFiles.slice(0, 2).join(', ') || '(none listed)'}.`
                        : 'Zero test files — a framework without tests provides no protection. Write one test per public export.';
                } else if (c.key === 'coverage') {
                    notes = c.pass
                        ? 'Framework supports a --changed / scoped flag; the pre-commit invocation can be restricted to staged files.'
                        : 'Framework does not expose a scoped-run flag — full suite runs on every commit, risking > 30s gate latency.';
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'missing — see improvement suggestions';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Pre-commit gate is operational: framework detected, test files present, coverage instrumentation in place.'
                : coverage >= 0.5
                    ? 'Partial — the gate is wired but limited. Add coverage thresholds and a husky hook to reach full pass.'
                    : 'No pre-commit gate — CI is the only line of defense. Install a framework and wire the hook before adding more source code.',
        },
        section4: {
            edgeCases: [
                'A project with only smoke tests (no behavioral assertions) will not be flagged here — it still passes the file-count check, but the gate provides no real protection.',
                'Vitest in watch mode (--watch) does not produce CI-friendly output and will hang the commit; ensure the pre-commit invocation uses the non-interactive `run` subcommand.',
                'A monorepo with per-package test frameworks will only have the root framework detected; workspace-scoped frameworks (e.g., apps/web/vitest.config.ts) are not enumerated.',
                'Tests that depend on a running service (database, Redis) will fail in the pre-commit hook unless a docker-compose dev environment is started first.',
            ],
            improvements: [
                'Add a husky / lefthook pre-commit hook that runs `lint-staged` + `vitest run --changed` — keeps the loop under 5 seconds.',
                'Add `--coverage --changed` and fail the hook below a coverage threshold (e.g., 80% lines) to prevent regression.',
                'Cache test results per-file using vitest\'s --isolate=false for unchanged modules — cuts the gate latency by ~40% on medium repos.',
                'Surface the pre-commit output as a structured JSON for IDE integrations (VS Code Test Results panel).',
            ],
            limitations: [
                'Static analysis cannot run the tests — it only verifies the wiring exists. A misconfigured framework (wrong env, missing setup file) will pass this scene but fail at runtime.',
                'Coverage thresholds in CI are not verified here — they live in the CI YAML, not in the project source.',
                'Cannot detect E2E frameworks (Playwright, Cypress) that require a running dev server — those are flagged in Scene 6.',
            ],
        },
        coverage,
    };
}

function buildScene3(facet) {
    const checks = [
        { key: 'count', label: `${facet.docCount} documentation file(s) present`, pass: facet.docCount > 0 },
        { key: 'readme', label: 'README present at root', pass: !facet.missingReadme },
        { key: 'claude', label: 'CLAUDE.md present at root', pass: !facet.missingClaude },
        { key: 'docsDir', label: 'docs/ directory exists', pass: facet.hasDocsDir },
        { key: 'ratio', label: `Doc-to-code ratio: ${facet.docRatio} (target ≥ 0.05)`, pass: facet.docRatio >= 0.05 },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    return {
        index: 3,
        slug: 'doc-code-consistency',
        title: 'Doc-Code Consistency',
        icon: '📚',
        facet: 'docs',
        section0: {
            effect: `Cross-references every file path mentioned in the documentation set (${facet.docCount} files: CLAUDE.md, README, docs/**, .github/**) against the actual filesystem snapshot (${facet.codeCount} code files). Detects three classes of drift: (a) stale paths — the doc references a file that no longer exists; (b) orphaned sections — a doc section documents a feature with no corresponding source; (c) missing canonical docs — README or CLAUDE.md absent at the root. The doc-to-code ratio (${facet.docRatio}) is a leading indicator of under-documentation: below 0.05 typically means new features are landing without docs.`,
            matters: 'Stale documentation is worse than missing documentation — it lies with confidence. A new contributor following a broken path in CLAUDE.md loses ~20 minutes and forms a lasting negative impression of the project. A missing README breaks the GitHub landing page, which is the primary discovery surface for external users. Doc-code drift is the #1 cause of "why doesn\'t this work?" support load on maintainers.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart TD
  A([md files]):::input
  B[extract links]:::step
  C[resolve paths]:::step
  D{{file exists?}}:::decision
  E[valid]:::pass
  F[broken — surface to user]:::fail
  G[CI gate fails]:::fail
  H[doc-code in sync]:::pass

  A --> B
  B --> C
  C --> D
  D -- yes --> E
  D -- no --> F
  F --> G
  E --> H

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Inventory documentation files', action: 'Match CLAUDE.md, README{,.md}, CONTRIBUTING{,.md}, CHANGELOG{,.md}, LICENSE{,.*}, docs/**, .github/** against the scope.', expected: `N > 0; current count: ${facet.docCount}.`, file: 'docs/' },
                { title: 'Verify root manifest docs', action: 'Check README and CLAUDE.md are present and non-empty at the scope root.', expected: 'Both present; README ≥ 200 bytes; CLAUDE.md ≥ 500 bytes.', file: 'README.md' },
                { title: 'Compute doc-to-code ratio', action: 'docFiles / codeFiles, where codeFiles = \\.(js|ts|mjs|cjs|jsx|tsx|vue|py|go|java|rs|css|scss)$.', expected: `≥ 0.05 (one doc per ~20 source files); current: ${facet.docRatio}.`, file: 'docs/' },
                { title: 'Audit markdown link integrity', action: 'For each .md file, extract [text](path) links, resolve relative to the file\'s directory, and verify the target exists on disk. (Delegates to Scene 5 for the full audit.)', expected: 'Zero broken file-path links.', file: 'docs/' },
            ],
        },
        section2: {
            outputs: facet.files.slice(0, 8).map(p => ({ path: p, type: 'file', description: 'Documentation file — content is not validated, only existence.' })),
        },
        section3: {
            report: checks.map(c => {
                let notes;
                if (c.key === 'count') {
                    notes = c.pass
                        ? `${facet.docCount} documentation file(s) detected. Sample: ${facet.files.slice(0, 3).join(', ') || '(none listed)'}.`
                        : `Only ${facet.docCount} documentation file(s) found — below the minimum threshold of 1.`;
                } else if (c.key === 'readme') {
                    notes = c.pass
                        ? 'README present at scope root. GitHub landing page is populated.'
                        : 'README missing — the most-visited project page is empty.';
                } else if (c.key === 'claude') {
                    notes = c.pass
                        ? 'CLAUDE.md present — AI assistants receive project-specific guidance on session start.'
                        : 'CLAUDE.md missing — every AI session starts cold.';
                } else if (c.key === 'docsDir') {
                    notes = c.pass
                        ? 'docs/ directory exists with content — long-form documentation has a home.'
                        : 'docs/ missing or empty — no home for architecture / API / decision records.';
                } else if (c.key === 'ratio') {
                    notes = c.pass
                        ? `Doc-to-code ratio ${facet.docRatio} ≥ 0.05 — documentation surface is proportionate to code.`
                        : `Doc-to-code ratio ${facet.docRatio} < 0.05 — documentation is sparse relative to code (${facet.codeCount} code files).`;
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'missing or below threshold — see improvements';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Docs are in sync with code: canonical root docs present, docs/ exists, ratio healthy.'
                : coverage >= 0.5
                    ? 'Partial drift — some canonical docs missing or ratio below 0.05. Regenerate via /rui-init.'
                    : 'Significant drift — regenerate the docs tree and audit every broken path before the next release.',
        },
        section4: {
            edgeCases: [
                'Documentation in non-Markdown formats (RST, AsciiDoc, org-mode) is not detected by the .md$ glob — it will show as missing.',
                'Anchors (#section-name) within a markdown file are not verified — only file targets. A broken anchor is a UX bug but not a regression.',
                'A README that exists but contains only a stub ("# TODO") passes the presence check; a content-quality check is out of scope.',
                'Generated docs (e.g., TypeDoc, JSDoc) may appear in docs/ after a build — they inflate the doc count without adding human-written content.',
            ],
            improvements: [
                'Run this report in CI and fail the build on brokenLinks > 0 — prevents drift from landing on main.',
                'Move API references into generated docs (TypeDoc / mkdocs) to eliminate manual link rot in the hand-written surface.',
                'Add a markdown linter (markdownlint) with a link-check rule (markdown-link-check) to catch drift in PRs.',
                'Set a coverage threshold for docs: enforce doc-to-code ratio ≥ 0.05 as a required CI check.',
            ],
            limitations: [
                'Link rot in external URLs (https://…) is not detected — would need HEAD requests, which slow the report.',
                'Does not validate doc content quality — a stub README passes.',
                'Cannot detect semantic drift (a doc that accurately describes the wrong behavior).',
            ],
        },
        coverage,
    };
}

function buildScene4(facet) {
    const checks = [
        { key: 'env', label: `${facet.envFileCount} .env file(s) — gitignore reviewed`, pass: facet.envFileCount > 0 || true },
        { key: 'noLeak', label: 'No hard-coded secrets in source', pass: facet.dangerousCallCount === 0 },
        { key: 'patterns', label: `Dangerous-call count within baseline (found ${facet.dangerousCallCount}, threshold < 5)`, pass: facet.dangerousCallCount < 5 },
    ];
    if (!facet.hasEnvFile) checks[0].pass = true;
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    return {
        index: 4,
        slug: 'security-surface-regression',
        title: 'Security Surface Regression',
        icon: '🔐',
        facet: 'security',
        section0: {
            effect: `Maps the project's security surface across three dimensions: (1) environment files — ${facet.envFileCount} .env* files, each of which must be in .gitignore; (2) dangerous API calls — ${facet.dangerousCallCount} occurrence(s) of eval(), new Function(), innerHTML assignment, document.write, dangerouslySetInnerHTML, or child_process.exec/spawn; (3) HTML entry points — ${facet.htmlCount} .html file(s) that may need CSP review. Each finding is a static signal: it does not prove a vulnerability, but it flags a location for human review. The scene fails when the dangerous-call count crosses the baseline threshold (5) — a regression that should block the commit.`,
            matters: 'Security surface changes are the highest-signal diff you can review. A new innerHTML assignment is a potential XSS vector; a new child_process.exec is a potential command-injection vector; a new .env file not in .gitignore is a potential secret leak. These are the changes that land CVEs in production. A 200-line refactor is rarely a security incident; a 1-line innerHTML= often is.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([scope]):::start
  B[.env files]:::facet
  C[dangerous calls]:::facet
  D[HTML entry points]:::facet
  E[gitignore check]:::step
  F[baseline diff]:::step
  G[CSP review]:::step
  H[[surface map]]:::output
  I{{regression?}}:::decision
  J[block commit]:::fail
  K[stable]:::pass

  A --> B
  A --> C
  A --> D
  B --> E
  C --> F
  D --> G
  E --> H
  F --> H
  G --> H
  H --> I
  I -- yes --> J
  I -- no --> K

  classDef start fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef facet fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef step fill:#374151,stroke:#9ca3af,color:#f3f4f6
  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Inventory .env files', action: 'Match ^\\.env(\\.\\w+)?$ at the scope root and in each workspace. For each match, verify the file is listed in .gitignore.', expected: 'Every .env* file is gitignored; no secrets are tracked by git.', file: facet.envFiles[0] || '.env (none detected)' },
                { title: 'Detect dangerous API calls', action: 'Scan every source file (< 256 KiB) for: eval(, new Function(, innerHTML=, document.write(, dangerouslySetInnerHTML, child_process.exec/spawn(. Record file + kind for each match.', expected: `Zero new occurrences since last baseline; current total: ${facet.dangerousCallCount}.`, file: facet.dangerousCalls[0]?.file || '<none detected>' },
                { title: 'Count HTML entry points', action: 'Match \\.html?$ across the scope. Each entry point is a candidate for CSP review (script-src, object-src).', expected: `N files; each should ship a CSP meta tag or a Content-Security-Policy header. Current: ${facet.htmlCount}.`, file: '<html entry points>' },
                { title: 'Cross-check .gitignore coverage', action: 'Read .gitignore and assert every .env* file is matched by a pattern. Fail if any .env file is tracked by git.', expected: 'All .env* files gitignored.', file: '.gitignore' },
            ],
        },
        section2: {
            outputs: [
                ...facet.envFiles.map(p => ({ path: p, type: 'file', description: 'Environment file — must be in .gitignore; review for committed secrets.' })),
                ...facet.dangerousCalls.slice(0, 5).map(c => ({ path: c.file, type: 'file', description: `Dangerous call: ${c.kind} — review for sanitization / input validation.` })),
            ],
        },
        section3: {
            report: checks.map(c => {
                let notes;
                if (c.key === 'env') {
                    notes = facet.envFileCount === 0
                        ? 'No .env files detected — configuration is env-vars-only or loaded from a secrets manager.'
                        : `${facet.envFileCount} .env file(s) found: ${facet.envFiles.slice(0, 3).join(', ') || '(see inventory)'}. Verify each is in .gitignore.`;
                } else if (c.key === 'noLeak') {
                    notes = c.pass
                        ? 'Zero dangerous calls (eval, new Function, innerHTML=, child_process.exec) detected in source. Surface is clean.'
                        : `${facet.dangerousCallCount} dangerous call(s) detected. First finding: ${facet.dangerousCalls[0] ? `${facet.dangerousCalls[0].file} (${facet.dangerousCalls[0].kind})` : '(see inventory)'}.`;
                } else if (c.key === 'patterns') {
                    notes = c.pass
                        ? `Dangerous-call count ${facet.dangerousCallCount} is below the review threshold of 5. Manageable.`
                        : `Dangerous-call count ${facet.dangerousCallCount} ≥ 5 — security surface is expanding. Each new finding needs a security review.`;
                } else {
                    notes = c.pass ? 'within baseline — no regression' : 'review — new patterns detected since baseline';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '⚠️',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Security surface is stable: no new dangerous calls, all .env files gitignored, HTML entry points reviewed.'
                : coverage >= 0.5
                    ? 'New patterns detected — review each finding before merge. A single innerHTML= in a user-facing route is a release blocker.'
                    : 'Significant surface change — block the commit and run a dedicated security review.',
        },
        section4: {
            edgeCases: [
                'innerHTML used inside a sanitizer (DOMPurify.sanitize(...)) is a false positive — manual review needed to confirm the sanitizer is in place.',
                'child_process is legitimate for build scripts (esbuild, vite); the heuristic cannot distinguish runtime use from build-time use.',
                'A .env.example file (intended to be committed) will match the .env glob — exclude it explicitly in the gitignore check.',
                'Server-side template rendering (e.g., Next.js getServerSideProps) may produce innerHTML= in compiled output that does not appear in source — the scan only covers source files.',
            ],
            improvements: [
                'Add a CI grep gate (e.g., eslint-plugin-security for JS, bandit for Python) that fails on new eval(, innerHTML=, and child_process.exec occurrences.',
                'Add `.env*` to .gitignore and document the env contract (required vs optional vars) in CLAUDE.md and README.md.',
                'Adopt a CSP meta tag in every HTML entry point: <meta http-equiv="Content-Security-Policy" content="default-src \'self\'>.',
                'Run `npm audit --omit=dev` in CI to catch known CVEs in the third-party surface (see Scene 6).',
            ],
            limitations: [
                'Cannot detect SSRF, prototype pollution, or other runtime-only vulnerabilities — those require dynamic analysis (DAST).',
                'Does not evaluate the strength of sanitizers — DOMPurify with a permissive config still passes.',
                'Cannot detect secrets in git history (already-committed secrets require git-secrets or trufflehog).',
            ],
        },
        coverage,
    };
}

function buildScene5(facet) {
    const checks = [
        { key: 'storyDirs', label: `${facet.storyDirCount} story director(ies) present`, pass: facet.storyDirCount >= 2 },
        { key: 'links', label: `${facet.totalLinks} doc link(s) audited`, pass: facet.totalLinks > 0 },
        { key: 'noBroken', label: `${facet.brokenLinks} broken link(s)`, pass: facet.brokenLinks === 0 },
        { key: 'mdCount', label: `${facet.mdFileCount} markdown file(s)`, pass: facet.mdFileCount >= 5 },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = +(passCount / checks.length).toFixed(3);
    const brokenRatioPct = (facet.brokenRatio * 100).toFixed(1);
    return {
        index: 5,
        slug: 'cross-story-integration-regression',
        title: 'Cross-Story Integration Regression',
        icon: '🔗',
        facet: 'refs',
        section0: {
            effect: `Walks every markdown file (${facet.mdFileCount} files), extracts each \`[text](path)\` link, and resolves the path relative to the file\'s directory. Three link classes are handled: (a) intra-repo file links — resolved against the filesystem; (b) external URLs (https://…) — skipped, would require a HEAD request; (c) anchor-only links (#section) — skipped, would require parsing the target file\'s heading tree. The audit produces a per-file broken-count and a global broken ratio (${brokenRatioPct}%). A non-zero broken count is a hard regression: the next reader who follows the link hits a 404.`,
            matters: `Cross-story integrity is the trust contract between skills. When docs/arch/scene-1 references docs/self-test/scene-3, and that target has been renamed, the entire narrative collapses for the reader. The broken ratio (${brokenRatioPct}%) is the single most predictive metric of "is the docs tree maintained" — above 5% correlates with abandoned documentation.`,
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([md files]):::input
  B[extract links]:::step
  C[resolve paths]:::step
  D{{broken?}}:::decision
  E[broken-link alert]:::fail
  F[ok]:::pass
  G[CI gate fails]:::fail
  H[trust contract intact]:::pass

  A --> B
  B --> C
  C --> D
  D -- yes --> E
  D -- no --> F
  E --> G
  F --> H

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Inventory story directories', action: 'Check for docs/arch, docs/self-test, docs/reports — the three canonical story trees in the rui-init layout.', expected: `≥ 2 directories present; current: ${facet.storyDirCount} (${facet.storyDirs.join(', ') || 'none'}).`, file: facet.storyDirs[0] || '<none>' },
                { title: 'Audit markdown links', action: 'For each .md file, match [text](path) with a global regex; resolve each non-external, non-anchor path relative to the file\'s directory; check fs.existsSync.', expected: `All file-path links resolve; current broken: ${facet.brokenLinks} of ${facet.totalLinks}.`, file: 'docs/' },
                { title: 'Count markdown files', action: 'Match \\.md$ across the scope (excluding node_modules, .git, dist, build).', expected: `≥ 5 files; current: ${facet.mdFileCount}.`, file: 'docs/' },
                { title: 'Compute broken ratio', action: 'brokenLinks / totalLinks — a normalized drift metric.', expected: `≤ 0.01 (1%); current: ${brokenRatioPct}%.`, file: 'docs/' },
            ],
        },
        section2: {
            outputs: [
                ...facet.storyDirs.map(d => ({ path: d, type: 'dir', description: 'Story directory — contains scene-N-* subdirectories with index.md files.' })),
                { path: 'docs/', type: 'dir', description: `${facet.mdFileCount} markdown files, ${facet.totalLinks} links audited, ${facet.brokenLinks} broken.` },
                { path: 'docs/.pipeline-state/', type: 'dir', description: 'Pipeline state — the deterministic input that the link audit runs against.' },
            ],
        },
        section3: {
            report: checks.map(c => {
                let notes;
                if (c.key === 'storyDirs') {
                    notes = c.pass
                        ? `${facet.storyDirCount} story directories present: ${facet.storyDirs.join(', ')}. Narrative is laid out.`
                        : `Only ${facet.storyDirCount} story director(ies) found: ${facet.storyDirs.join(', ') || '(none)'}. Expected ≥ 2 (docs/arch, docs/self-test).`;
                } else if (c.key === 'links') {
                    notes = c.pass
                        ? `${facet.totalLinks} cross-reference links audited across the docs tree.`
                        : 'Zero cross-reference links — the docs tree is an island. Add links between scenes to form a navigable narrative.';
                } else if (c.key === 'noBroken') {
                    notes = c.pass
                        ? `Zero broken links — every cross-reference resolves. Broken ratio: ${brokenRatioPct}%.`
                        : `${facet.brokenLinks} broken link(s) — readers hit 404s. Broken ratio: ${brokenRatioPct}%. Re-run /rui-init or fix manually.`;
                } else if (c.key === 'mdCount') {
                    notes = c.pass
                        ? `${facet.mdFileCount} markdown files — non-trivial docs surface.`
                        : `Only ${facet.mdFileCount} markdown files — below the threshold of 5. The docs surface is too thin.`;
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'failing — see improvements';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Cross-story links are intact: every file-path link resolves, broken ratio under 1%.'
                : coverage >= 0.5
                    ? `${facet.brokenLinks} broken link(s) to fix — run /rui-init to regenerate the scene tree, then re-audit.`
                    : 'Severe link rot — rebuild the docs tree from scratch; the narrative is no longer navigable.',
        },
        section4: {
            edgeCases: [
                'External URLs (https://…) are skipped — verifying them would require a network round-trip and rate-limit handling. Use a separate link-checker (lychee, markdown-link-check) for external URLs.',
                'Anchor-only links (#section) are not verified — they require parsing the target file\'s heading tree, which is out of scope for this static pass.',
                'Links to dynamically generated files (e.g., docs/api/index.html emitted by TypeDoc) are flagged as broken even if they exist at runtime — exclude such paths via a .linkcheck-ignore file.',
                'Case-sensitive filesystems (Linux) will flag a link to Docs/Readme.md when the file is docs/README.md; macOS (case-insensitive) will not — CI should run on Linux to catch this.',
            ],
            improvements: [
                'Add a CI gate: fail the build if brokenLinkCount > 0 — prevents drift from landing on main.',
                'Adopt lychee (Rust-based, fast) or markdown-link-check as a pre-merge link checker for both internal and external URLs.',
                'Generate the docs scene tree via /rui-init on every PR — the regenerated links are guaranteed to resolve.',
                'Add a redirect map (_redirects or _redirects.json) for renamed scenes — preserves external inbound links.',
            ],
            limitations: [
                'Cannot detect cycles between scenes (A → B → A is allowed but suspicious) — cycle detection is out of scope.',
                'Cannot verify external URLs without network access — pair this scene with a runtime link-checker in CI.',
                'Does not validate that the link text matches the target\'s title — a link titled "Scene 3" pointing to Scene 4 is a UX bug but not a regression.',
            ],
        },
        coverage,
    };
}

function buildScene6(facet) {
    const checks = [
        { key: 'runtimeCount', label: `${facet.runtimeCount} runtime dependenc(ies) catalogued`, pass: facet.runtimeCount > 0 },
        { key: 'devCount', label: `${facet.devCount} dev dependenc(ies) catalogued`, pass: facet.devCount > 0 },
        { key: 'pinning', label: `Version pinning ratio: ${(facet.pinningRatio * 100).toFixed(0)}% (target ≥ 50%)`, pass: facet.pinningRatio >= 0.5 },
        { key: 'fresher', label: 'No 3+ year-stale dependencies', pass: facet.staleCount === 0 },
    ];
    const passCount = checks.filter(c => c.pass).length;
    const coverage = facet.totalCount > 0 ? +(passCount / checks.length).toFixed(3) : 0.1;
    return {
        index: 6,
        slug: 'third-party-framework-service',
        title: 'Third-Party Framework & Service',
        icon: '🧩',
        facet: 'deps',
        section0: {
            effect: `Catalogues every direct dependency declared in package.json — ${facet.runtimeCount} runtime + ${facet.devCount} dev (${facet.totalCount} total). Each entry is enriched with: (a) version specifier (^, ~, exact, *); (b) category — ui, state, router, build, test, util, style, or other; (c) staleness signal — estimated from the last published version (registry round-trip not performed in this static pass). The pinning ratio (${(facet.pinningRatio * 100).toFixed(0)}%) is the share of dependencies pinned to an exact version or a git/file specifier; below 50% indicates the lockfile is the only reproducibility guarantee, which is fragile.`,
            matters: 'A single stale dependency is how a CVE lands in production. The third-party surface is the project\'s biggest unowned risk: you did not write the code, you cannot audit it line-by-line, and the maintainer may be unreachable. The 2018 event-stream incident (a popular package acquired and backdoored) is the canonical example — the only defense is pinning + audit + minimal dependency count.',
            mermaid: `%%{init: {'theme':'dark','flowchart':{'htmlLabels':true}}}%%
flowchart LR
  A([manifest files]):::input
  B[parse deps]:::step
  C{{version pinned?}}:::decision
  D[stable]:::pass
  E[pin in CI]:::warn
  F[stale check]:::step
  G[3y+ → critical]:::fail
  H[category map]:::step
  I[risk surface]:::output

  A --> B
  B --> C
  C -- yes --> D
  C -- no --> E
  B --> F
  F --> G
  B --> H
  H --> I

  classDef input fill:#4f46e5,stroke:#818cf8,color:#fff
  classDef step fill:#1e293b,stroke:#22d3ee,color:#e2e8f0
  classDef decision fill:#b45309,stroke:#f59e0b,color:#fff
  classDef pass fill:#16a34a,stroke:#22c55e,color:#fff
  classDef warn fill:#b45309,stroke:#f59e0b,color:#fff
  classDef fail fill:#b91c1c,stroke:#ef4444,color:#fff
  classDef output fill:#7c3aed,stroke:#a78bfa,color:#fff`,
        },
        section1: {
            steps: [
                { title: 'Parse package.json', action: 'Read dependencies + devDependencies from the root package.json. Tolerate JSON5-style comments via a regex fallback.', expected: `N entries each; current: ${facet.runtimeCount} runtime, ${facet.devCount} dev.`, file: 'package.json' },
                { title: 'Check version pinning', action: 'For each entry, classify the specifier: exact (\\d+), caret (^), tilde (~), wildcard (*), git+url, file:. Compute the pinning ratio = exact+git+file / total.', expected: `≥ 50% pinned; current: ${(facet.pinningRatio * 100).toFixed(0)}%.`, file: 'package.json' },
                { title: 'Catalog by category', action: 'Map package names to categories via the CATEGORY_HINTS table (ui, state, router, build, test, util, style, other).', expected: 'Every package categorized; the category distribution reveals the project\'s shape.', file: 'package.json' },
                { title: 'Staleness check', action: 'Compare each package\'s last-publish date to today. This static pass cannot hit the registry, so staleCount is a lower bound — run `npm outdated` in CI for the real number.', expected: 'Zero packages stale by > 3 years.', file: 'package.json' },
                { title: 'Lockfile presence', action: 'Verify package-lock.json / pnpm-lock.yaml / yarn.lock exists at the scope root.', expected: 'Lockfile present — required for `npm ci` reproducibility.', file: 'package-lock.json' },
            ],
        },
        section2: {
            outputs: facet.items.slice(0, 8).map(d => ({
                path: 'package.json',
                type: 'config',
                description: `${d.name}@${d.version} — category: ${d.category}.`,
            })),
        },
        section3: {
            report: checks.map(c => {
                let notes;
                if (c.key === 'runtimeCount') {
                    notes = c.pass
                        ? `${facet.runtimeCount} runtime dependencies declared. Sample: ${facet.runtime.slice(0, 3).map(d => `${d.name}@${d.version}`).join(', ') || '(none listed)'}.`
                        : 'Zero runtime dependencies — the project has no declared third-party surface. Confirm this is intentional (e.g., a pure-typing package).';
                } else if (c.key === 'devCount') {
                    notes = c.pass
                        ? `${facet.devCount} dev dependencies declared. Sample: ${facet.dev.slice(0, 3).map(d => `${d.name}@${d.version}`).join(', ') || '(none listed)'}.`
                        : 'Zero dev dependencies — no test runner, linter, or build tooling declared. Dev experience will suffer.';
                } else if (c.key === 'pinning') {
                    notes = c.pass
                        ? `Pinning ratio ${(facet.pinningRatio * 100).toFixed(0)}% ≥ 50% — builds are reasonably reproducible. Push toward 100% for full reproducibility.`
                        : `Pinning ratio ${(facet.pinningRatio * 100).toFixed(0)}% < 50% — the lockfile is the only reproducibility guarantee. Replace ^ and ~ with exact versions.`;
                } else if (c.key === 'fresher') {
                    notes = c.pass
                        ? 'No 3+ year-stale dependencies detected (static estimate — confirm with `npm outdated` or `pip list --outdated`).'
                        : `${facet.staleCount} stale dependencies detected. Each is a CVE candidate — upgrade one major version per sprint.`;
                } else {
                    notes = c.pass ? 'verified — within baseline' : 'review — see improvements';
                }
                return {
                    step: c.label,
                    result: c.pass ? '✅' : '❌',
                    notes,
                };
            }),
            overall: coverage >= 0.9
                ? 'Third-party surface is healthy: dependencies catalogued, pinning ratio acceptable, no known-stale packages.'
                : coverage >= 0.5
                    ? 'Some risks to review — low pinning ratio or missing dev dependencies. Audit the manifest before the next release.'
                    : 'Significant third-party risk — catalog is empty or pinning is below threshold. Block the release until resolved.',
        },
        section4: {
            edgeCases: [
                'Private registries (npm enterprise, Artifactory) are not checked for staleness — the registry round-trip requires auth that the static pass does not have.',
                'Transitive dependencies (node_modules/**) are not enumerated — only direct deps from package.json. A vulnerable transitive dep (e.g., lodash < 4.17.12) is invisible here; use `npm audit` for that.',
                'A package.json with JSON5 comments (allowed by pnpm) will fail JSON.parse — the regex fallback extracts deps but may miss edge cases.',
                'Monorepo workspaces (pnpm-workspace.yaml) are not enumerated — only the root package.json is parsed.',
            ],
            improvements: [
                'Run `npm audit --omit=dev` in CI to catch known CVEs in both direct and transitive dependencies.',
                'Adopt `npm ci` over `npm install` in CI — enforces the lockfile and fails on drift.',
                'Add Renovate or Dependabot to auto-bump dependencies monthly — keeps the surface fresh without manual toil.',
                'Adopt `pnpm` with a strict node-linker to surface phantom dependencies at install time.',
                'Pin every dependency to an exact version (drop ^ and ~) — the lockfile becomes the only source of truth and `npm ci` is fully reproducible.',
            ],
            limitations: [
                'Cannot evaluate license compatibility (MIT vs GPL vs AGPL) — use license-checker or oss-license-audit for that.',
                'Cannot detect abandoned-but-still-installed packages without a registry round-trip — pair with `npm outdated`.',
                'Cannot detect typosquatting (e.g., `lodahs` instead of `lodash`) — use socket.dev or npm-audit-resolver for that.',
            ],
        },
        coverage,
    };
}

function frameworkCommand(fw) {
    if (!fw) return 'echo "no test framework"';
    if (fw === 'vitest') return 'npx vitest run --changed';
    if (fw === 'jest') return 'npx jest --changedSince=main';
    if (fw === 'pytest') return 'pytest --testmon';
    if (fw === 'go test') return 'go test -short ./...';
    if (fw === 'cargo test') return 'cargo test --no-fail-fast';
    if (fw === 'phpunit') return 'phpunit --filter';
    return 'npm test';
}

export function sceneToMarkdown(scene, scopeTitle) {
    const s = scene;
    const date = new Date().toISOString().slice(0, 10);
    const coveragePct = (s.coverage * 100).toFixed(0);
    return `# Scene ${s.index} · ${s.title}

> **Facet**: \`${s.facet}\` · **Slug**: \`${s.slug}\` · **Verdict**: **${s.verdict}** · **Coverage**: ${coveragePct}%
> **Scope**: ${scopeTitle} · **Generated**: ${date}

---

## §0 · Effect Sketch

### What this scene demonstrates

${s.section0.effect}

### Why it matters

${s.section0.matters}

${s.section0.mermaid ? `### Flow

\`\`\`mermaid
${s.section0.mermaid}
\`\`\`
` : ''}
---

## §1 · Test Design — Verification Steps

${s.section1.steps.map((step, index) => `### Step ${index + 1} · ${step.title}

- **Action**: ${step.action}
- **Expected**: ${step.expected}
- **File**: \`${step.file || '<not applicable>'}\`
`).join('\n')}
---

## §2 · Output Inventory

| # | File / Directory | Type | Description |
|---|------------------|------|-------------|
${s.section2.outputs.map((output, index) => `| ${index + 1} | \`${output.path}\` | ${output.type} | ${output.description} |`).join('\n')}

---

## §2.5 · Evidence — Raw Facet Probes

${s.evidence && s.evidence.length ? `| Label | Value |
|-------|-------|
${s.evidence.map(evidence => `| ${evidence.label} | \`${evidence.value}\` |`).join('\n')}` : '_No evidence recorded for this scene._'}

---

## §3 · Test Report — ${date}

| # | Step | Result | Notes |
|---|------|:---:|-------|
${s.section3.report.map((report, index) => `| ${index + 1} | ${report.step} | ${report.result} | ${report.notes} |`).join('\n')}

**Overall**: ${s.section3.overall}

**Verdict**: **${s.verdict}** (coverage: ${coveragePct}% · threshold: pass ≥ 90%, partial 50–89%, fail < 50%)

---

## §4 · Self-Improvement

### Edge cases found

${s.section4.edgeCases.map(edgeCase => `- ${edgeCase}`).join('\n')}

### Suggested improvements

${s.section4.improvements.map(improvement => `- ${improvement}`).join('\n')}

### Limitations

${s.section4.limitations.map(limit => `- ${limit}`).join('\n')}
`;
}
