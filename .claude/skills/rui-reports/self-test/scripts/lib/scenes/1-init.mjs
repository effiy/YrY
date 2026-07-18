export function buildScene1(facet, scopeTitle) {
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

