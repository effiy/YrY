export function buildScene3(facet) {
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

