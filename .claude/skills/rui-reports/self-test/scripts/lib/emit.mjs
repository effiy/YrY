import fs from 'node:fs';
import path from 'node:path';
import { sceneToMarkdown } from './scenes.mjs';

function toJsArray(items) {
    return JSON.stringify(items);
}

export function emitReportAssets({
    absScope,
    outDir,
    scopeTitle,
    reportConfig,
    reportData,
}) {
    const scriptDir = path.dirname(new URL(import.meta.url).pathname);
    const templatesDir = path.join(scriptDir, '..', '..', 'templates');

    fs.mkdirSync(outDir, { recursive: true });
    const dataJs =
        `window.REPORT_CONFIG = ${JSON.stringify(reportConfig, null, 2)};\n\n` +
        `window.REPORT_DATA = ${JSON.stringify(reportData, null, 2)};\n`;
    fs.writeFileSync(path.join(outDir, 'data.js'), dataJs);

    const sharedRootAbs = path.join(absScope, '.claude', 'shared');
    let sharedRootRel = path.relative(outDir, sharedRootAbs);
    if (!sharedRootRel || (!sharedRootRel.startsWith('..') && !path.isAbsolute(sharedRootRel))) {
        sharedRootRel = '.';
    }

    const projectRoot = absScope;
    const loaderCandidates = [
        './loader.js',
        `${sharedRootRel}/loader.js`,
    ];
    if (projectRoot) {
        const projectSharedAbs = `/${path.relative(projectRoot, sharedRootAbs).split(path.sep).join('/')}`;
        const projectSharedUrl = `${projectSharedAbs}/loader.js`;
        if (projectSharedUrl !== loaderCandidates[1]) loaderCandidates.push(projectSharedUrl);
    }
    const loaderCdn = 'https://cdn.jsdelivr.net/gh/YrY-oss/cdn@main/.claude/shared/loader.js';
    if (!loaderCandidates.includes(loaderCdn)) loaderCandidates.push(loaderCdn);

    const mermaidCandidates = [
        `${sharedRootRel}/vendor/mermaid.min.js`,
        'https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.min.js',
    ];

    const templateSubs = {
        '{{SCOPE_TITLE}}': scopeTitle,
        '{{SHARED_ROOT}}': sharedRootRel,
        '{{SHARED_ROOT_LOADER_JS_ARRAY}}': toJsArray(loaderCandidates),
        '{{SHARED_ROOT_MERMAID_JS_ARRAY}}': toJsArray(mermaidCandidates),
    };

    console.log(`[stage5] shared root: ${sharedRootRel} (${sharedRootAbs})`);
    console.log(`[stage5] loader candidates: ${loaderCandidates.join(', ')}`);
    console.log(`[stage5] mermaid candidates: ${mermaidCandidates.join(', ')}`);

    for (const name of ['index.html', 'index.css', 'index.js']) {
        const src = path.join(templatesDir, name);
        if (!fs.existsSync(src)) {
            console.warn(`  warn: ${name} not found in templates/ — skipping`);
            continue;
        }

        let content = fs.readFileSync(src, 'utf8');
        if (name === 'index.html') {
            for (const [key, value] of Object.entries(templateSubs)) {
                if (content.indexOf(key) === -1) continue;
                content = content.split(key).join(value);
            }
        }
        fs.writeFileSync(path.join(outDir, name), content);
    }

    console.log(`  data.js: ${(dataJs.length / 1024).toFixed(1)} KB`);

    const sharedLoaderSrc = path.join(sharedRootAbs, 'loader.js');
    if (fs.existsSync(sharedLoaderSrc)) {
        const dst = path.join(outDir, 'loader.js');
        fs.copyFileSync(sharedLoaderSrc, dst);
        console.log(`  copied loader.js (${(fs.statSync(dst).size / 1024).toFixed(1)} KB) for IDE-preview mode`);
    } else {
        console.warn(`  warn: shared/loader.js not found at ${sharedLoaderSrc} — IDE preview will fail to load it`);
    }
}

export function mirrorScenesAsMarkdown({
    outDir,
    scenes,
    scopeTitle,
}) {
    const mirrorRoot = path.resolve(outDir, '..', 'self-test');
    fs.mkdirSync(mirrorRoot, { recursive: true });

    for (const scene of scenes) {
        const sceneDir = path.join(mirrorRoot, `scene-${scene.index}-${scene.slug}`);
        fs.mkdirSync(sceneDir, { recursive: true });
        fs.writeFileSync(path.join(sceneDir, 'index.md'), sceneToMarkdown(scene, scopeTitle));
    }

    return mirrorRoot;
}
