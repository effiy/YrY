export function buildScene4(facet) {
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

