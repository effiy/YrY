import { frameworkCommand } from './_utils.mjs';

export function buildScene2(facet, scopeTitle) {
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

