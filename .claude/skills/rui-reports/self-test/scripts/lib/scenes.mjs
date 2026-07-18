/**
 * rui-report-self-test · scene registry
 * ----------------------------------------------------------------------
 * Barrel over the per-facet builders. Each scene lives in its own file
 * under `scenes/` (1-init, 2-test, 3-doc, 4-security, 5-refs, 6-deps);
 * the markdown renderer lives in `scenes/_render.mjs`; small shared
 * helpers live in `scenes/_utils.mjs`.
 *
 * Importers should reach for `buildScenes` and `sceneToMarkdown` from
 * here; the per-file functions are implementation details and may
 * move without notice.
 */

import { buildScene1 } from './scenes/1-init.mjs';
import { buildScene2 } from './scenes/2-test.mjs';
import { buildScene3 } from './scenes/3-doc.mjs';
import { buildScene4 } from './scenes/4-security.mjs';
import { buildScene5 } from './scenes/5-refs.mjs';
import { buildScene6 } from './scenes/6-deps.mjs';

export { sceneToMarkdown } from './scenes/_render.mjs';
export { frameworkCommand } from './scenes/_utils.mjs';

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
