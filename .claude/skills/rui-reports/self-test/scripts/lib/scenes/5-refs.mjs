export function buildScene5(facet) {
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
            matters: `Cross-story integrity is the trust contract between skills. When docs/arch/scene-1 references docs/test/scene-3, and that target has been renamed, the entire narrative collapses for the reader. The broken ratio (${brokenRatioPct}%) is the single most predictive metric of "is the docs tree maintained" — above 5% correlates with abandoned documentation.`,
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
                { title: 'Inventory story directories', action: 'Check for docs/arch, docs/test, docs/reports — the three canonical story trees in the rui-init layout.', expected: `≥ 2 directories present; current: ${facet.storyDirCount} (${facet.storyDirs.join(', ') || 'none'}).`, file: facet.storyDirs[0] || '<none>' },
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
                        : `Only ${facet.storyDirCount} story director(ies) found: ${facet.storyDirs.join(', ') || '(none)'}. Expected ≥ 2 (docs/arch, docs/test).`;
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

