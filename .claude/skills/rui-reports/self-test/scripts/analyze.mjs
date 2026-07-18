#!/usr/bin/env node
/**
 * rui-report-self-test · analyzer
 * ----------------------------------------------------------------------
 * Thin pipeline entrypoint. Responsibility-specific logic lives under
 * scripts/lib/ so inventory, facets, scenes, report assembly, and emit
 * can evolve independently.
 *
 * Usage:  node scripts/analyze.mjs <scope> <outDir>
 *         scope  — absolute path to walk
 *         outDir — absolute path to write data.js + page assets
 *
 * Env (optional):
 *   MERGE_SCENES=true  — also emit markdown under <outDir>/../self-test/
 *                        (relative to outDir's parent).
 *   THEME=dark|light   — page theme (default dark).
 *   NO_PDF=true        — skip the PDF/print stylesheet (default false).
 */

import fs from 'node:fs';
import path from 'node:path';
import {
    buildDocFacet,
    buildInitFacet,
    buildRefsFacet,
    buildSecurityFacet,
    buildTestFacet,
    detectDeps,
} from './lib/facets.mjs';
import { mirrorScenesAsMarkdown, emitReportAssets } from './lib/emit.mjs';
import { walkScope } from './lib/inventory.mjs';
import {
    applySceneVerdicts,
    buildReportConfig,
    buildReportData,
    gradeOf,
} from './lib/report.mjs';
import { buildScenes } from './lib/scenes.mjs';

const [, , SCOPE, OUT_DIR] = process.argv;
if (!SCOPE || !OUT_DIR) {
    console.error('Usage: node analyze.mjs <scope> <outDir>');
    process.exit(2);
}

const absScope = path.resolve(SCOPE);
if (!fs.existsSync(absScope)) {
    console.error('scope-not-found:', absScope);
    process.exit(3);
}

const mergeScenes = process.env.MERGE_SCENES !== 'false';
const theme = process.env.THEME === 'light' ? 'light' : 'dark';
const startedAt = Date.now();

console.log('[stage1] walking scope…');
let records = [];
try {
    const inventory = walkScope(absScope);
    records = inventory.records;
} catch (error) {
    console.error('find failed:', error.message);
    process.exit(4);
}
console.log(`  ${records.length} files`);

console.log('[stage2] detecting facets…');
const testFacet = buildTestFacet(records);
const docFacet = buildDocFacet(records);
const securityFacet = buildSecurityFacet(records);
const refsFacet = buildRefsFacet(records);
const depsFacet = detectDeps(records);
const initFacet = buildInitFacet(records, docFacet, testFacet);

console.log('[stage3] assembling scenes…');
const scopeTitle = path.basename(absScope) || 'project';
const scenes = buildScenes({
    initFacet,
    testFacet,
    docFacet,
    securityFacet,
    refsFacet,
    depsFacet,
    scopeTitle,
});

console.log('[stage4] computing verdicts…');
const verdictSummary = applySceneVerdicts(scenes);

console.log('[stage5] emitting data.js…');
const generatedAt = new Date().toISOString();
const reportConfig = buildReportConfig({
    absScope,
    scopeTitle,
    generatedAt,
    theme,
    mergeScenes,
});
const reportData = buildReportData({
    absScope,
    records,
    scenes,
    verdictSummary,
    facets: {
        initFacet,
        testFacet,
        docFacet,
        securityFacet,
        refsFacet,
        depsFacet,
    },
});

emitReportAssets({
    absScope,
    outDir: OUT_DIR,
    scopeTitle,
    reportConfig,
    reportData,
});

if (mergeScenes) {
    console.log('[stage6] mirroring scenes as markdown…');
    try {
        const mirrorRoot = mirrorScenesAsMarkdown({
            outDir: OUT_DIR,
            scenes,
            scopeTitle,
        });
        console.log(`  ${scenes.length} scenes written under ${mirrorRoot}`);
    } catch (error) {
        console.warn(`  warn: markdown mirror failed: ${error.message}`);
    }
}

console.log(
    `[done] score=${verdictSummary.compositeScore} (${gradeOf(verdictSummary.compositeScore)}) verdicts: pass=${verdictSummary.passCount} partial=${verdictSummary.partialCount} fail=${verdictSummary.failCount}`
);
console.log(`[done] total elapsed: ${(Date.now() - startedAt) / 1000}s`);
