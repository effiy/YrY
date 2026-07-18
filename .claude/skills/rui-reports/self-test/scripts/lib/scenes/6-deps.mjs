export function buildScene6(facet) {
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
