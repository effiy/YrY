#!/usr/bin/env node
/**
 * rui-report-files · analyzer
 * ----------------------------------------------------------------------
 * Six-stage analysis pipeline implementing the rui-report-files
 * skill (SKILL.md, methodology.md, analysis-contracts.md,
 * scoring.md). Emits window.REPORT_DATA containing the full records
 * and adjacency map in a single data.js.
 *
 * Architecture
 * ------------
 * This file is the orchestrator. Pure helpers live in `./lib/utils.mjs`
 * (exclusion globs, type map, formatting, numeric summaries, score
 * helpers) and `./lib/alerts.mjs` (alert-enrichment templates + push).
 *
 * Usage:  node scripts/analyze.mjs <scope> <outDir>
 *         scope  — absolute path to walk
 *         outDir — absolute path to write data.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import {
    resolveExcludes, isExcluded, typeOf, humanBytes,
    pct, mean, median, rate, gradeOf,
} from './lib/utils.mjs';
import { pushAlert } from './lib/alerts.mjs';

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

const { dirs: EXCLUDE_DIRS, files: EXCLUDE_FILES, globs: EXCLUDES } = resolveExcludes();

/* ── Stage 1: walk + per-file metrics ───────────────────────────────── */
console.log('[stage1] walking scope…');
const t0 = Date.now();
const findRoot = absScope;
let filePaths = [];
try {
    // Use -print0 for safe handling, then split on \0.
    // find(1) matches on path substrings; EXCLUDE_DIRS provides the segments.
    const findArgs = [findRoot, '-type', 'f'];
    for (const d of EXCLUDE_DIRS) {
        findArgs.push('-not', '-path', `*/${d}/*`);
    }
    for (const f of EXCLUDE_FILES) {
        findArgs.push('-not', '-name', f);
    }
    findArgs.push('-print0');
    const out = execFileSync('find', findArgs, { maxBuffer: 256 * 1024 * 1024 });
    filePaths = out.toString('utf8').split('\0').filter(Boolean);
} catch (e) {
    console.error('find failed:', e.message);
    process.exit(4);
}
console.log(`  ${filePaths.length} files in ${Date.now() - t0}ms`);

/* Filter (just in case find missed something) */
filePaths = filePaths.filter(p => !isExcluded(path.relative(absScope, p), EXCLUDES));

/* Batch stat: bytes + mtime in one call per file via stat -f */
const statMap = new Map();
for (const p of filePaths) {
    try {
        const st = fs.statSync(p);
        statMap.set(p, { bytes: st.size, mtime: Math.floor(st.mtimeMs / 1000) });
    } catch (e) {
        /* skip permission / missing */
    }
}

/* Batch line counting via wc -l */
console.log('[stage1] counting lines…');
const wcOut = execFileSync('xargs', ['-0', 'wc', '-l'], {
    input: Buffer.from(filePaths.join('\0') + '\0'),
    maxBuffer: 256 * 1024 * 1024,
}).toString('utf8');
const lineMap = new Map();
for (const line of wcOut.split('\n')) {
    if (!line.trim()) continue;
    const m = line.match(/^\s*(\d+)\s+(.+)$/);
    if (!m) continue;
    lineMap.set(m[2].trim(), parseInt(m[1], 10));
}

/* Build records */
const records = [];
for (const abs of filePaths) {
    const s = statMap.get(abs);
    if (!s) continue;
    const rel = path.relative(absScope, abs).split(path.sep).join('/');
    records.push({
        path: rel,
        absPath: abs,
        bytes: s.bytes,
        lines: lineMap.get(abs) || 0,
        type: typeOf(abs),
        lastModified: s.mtime,
    });
}
records.sort((a, b) => a.path.localeCompare(b.path));
console.log(`  ${records.length} records`);

/* ── Stage 2: size distribution ─────────────────────────────────────── */
console.log('[stage2] size distribution…');
const totalBytes = records.reduce((s, r) => s + r.bytes, 0);
const totalLines = records.reduce((s, r) => s + r.lines, 0);

/* Treemap: aggregate per directory (recursive) */
const dirBytes = new Map();
for (const r of records) {
    const parts = r.path.split('/');
    for (let i = 0; i < parts.length; i++) {
        const d = parts.slice(0, i).join('/') + '/';
        if (!d || d === '/') continue;
        dirBytes.set(d, (dirBytes.get(d) || 0) + r.bytes);
    }
    // Also root scope
    dirBytes.set('(root)', (dirBytes.get('(root)') || 0) + r.bytes);
}
const treemap = Array.from(dirBytes.entries())
    .map(([name, bytes]) => ({ name, bytes, humanBytes: humanBytes(bytes) }))
    .filter(t => t.name !== '(root)' || dirBytes.size === 1)
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 50);

/* Largest files (top-N=20) */
const largest = records
    .slice()
    .sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path))
    .slice(0, 20)
    .map(r => ({
        path: r.path,
        bytes: r.bytes,
        bytesHuman: humanBytes(r.bytes),
        lines: r.lines,
        type: '.' + r.type,
        depth: 0,   // filled later
        fanIn: 0,   // filled later
        fanOut: 0,  // filled later
    }));

/* File-type breakdown */
const typeMap = new Map();
for (const r of records) {
    const t = '.' + r.type;
    if (!typeMap.has(t)) typeMap.set(t, { type: t, fileCount: 0, totalBytes: 0, totalLines: 0 });
    const e = typeMap.get(t);
    e.fileCount += 1;
    e.totalBytes += r.bytes;
    e.totalLines += r.lines;
}
const types = Array.from(typeMap.values())
    .map(t => ({
        ...t,
        pctFiles: +(t.fileCount / records.length * 100).toFixed(1),
        pctBytes: +(t.totalBytes / totalBytes * 100).toFixed(1),
        totalBytesHuman: humanBytes(t.totalBytes),
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

/* Size histogram (Stage 2.6) */
const BUCKETS = [
    { name: '0', min: 0, max: 0 },
    { name: '1-50', min: 1, max: 50 },
    { name: '51-100', min: 51, max: 100 },
    { name: '101-250', min: 101, max: 250 },
    { name: '251-500', min: 251, max: 500 },
    { name: '501-1000', min: 501, max: 1000 },
    { name: '1001-2000', min: 1001, max: 2000 },
    { name: '2000+', min: 2001, max: Infinity },
];
const histogram = BUCKETS.map(b => ({ bucket: b.name, count: 0, pctFiles: 0 }));
for (const r of records) {
    for (let i = 0; i < BUCKETS.length; i++) {
        const b = BUCKETS[i];
        if (r.lines >= b.min && r.lines <= b.max) {
            histogram[i].count += 1;
            break;
        }
    }
}
for (const h of histogram) h.pctFiles = +(h.count / records.length * 100).toFixed(1);

/* ── Stage 3: dependency graph ──────────────────────────────────────── */
console.log('[stage3] dependency graph…');
const ESM_IMPORT_REGEX = /^\s*(?:import\s+(?:[^'"]+?\s+from\s+)?|export\s+(?:[^'"]+?\s+from\s+)|require\s*\(\s*)['"]([^'"]+)['"]/m;
const CSS_IMPORT_REGEX = /@import\s+(?:url\()?\s*['"]?([^'")]+)['"]?/m;
const IMPORT_REGEX = {
    js: ESM_IMPORT_REGEX,
    ts: ESM_IMPORT_REGEX,
    tsx: ESM_IMPORT_REGEX,
    jsx: ESM_IMPORT_REGEX,
    mjs: ESM_IMPORT_REGEX,
    cjs: ESM_IMPORT_REGEX,
    vue: ESM_IMPORT_REGEX,
    py: /^\s*(?:from\s+(\S+)\s+import|import\s+(\S+))/m,
    go: /^\s*import\s+\(\s*"([^"]+)"\s*\)/m,
    java: /^\s*import\s+(?:static\s+)?([^;]+);/m,
    rust: /^\s*use\s+([^;]+);/m,
    css: CSS_IMPORT_REGEX,
    scss: CSS_IMPORT_REGEX,
};

const RESOLVABLE_EXTS = ['.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx', '.vue', '/index.js', '/index.ts', '/index.tsx', '/index.vue'];

function resolveImport(fromFile, spec) {
    if (!spec.startsWith('./') && !spec.startsWith('../')) return null; // external
    const dir = path.dirname(fromFile);
    let base = path.resolve(dir, spec);
    if (fs.existsSync(base)) {
        try {
            const st = fs.statSync(base);
            if (st.isFile()) return base;
            if (st.isDirectory()) {
                for (const ext of RESOLVABLE_EXTS.slice(0, 4)) {
                    const p = base + ext;
                    if (fs.existsSync(p)) return p;
                }
            }
        } catch {}
    }
    for (const ext of RESOLVABLE_EXTS) {
        const p = base + ext;
        if (fs.existsSync(p)) return p;
    }
    return null;
}

const recordByAbs = new Map(records.map(r => [r.absPath, r]));
const adjacency = new Map();   // absPath -> Set<absPath>
const externalFanout = new Map();

for (const r of records) {
    if (!IMPORT_REGEX[r.type]) continue;
    if (r.bytes > 256_000) continue; // cap per analysis-contracts
    let content;
    try {
        content = fs.readFileSync(r.absPath, 'utf8');
    } catch { continue; }
    if (content.length > 64 * 1024) content = content.slice(0, 64 * 1024);
    const re = new RegExp(IMPORT_REGEX[r.type].source, 'gm');
    const set = new Set();
    let extCount = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
        const spec = m[1];
        if (!spec) continue;
        if (r.type === 'css' || r.type === 'scss') {
            // CSS @import — only treat relative as resolvable
            if (!spec.startsWith('./') && !spec.startsWith('../')) continue;
        }
        if (r.type === 'py') {
            // Python: from X import Y, import X — X is dotted module name
            const dotted = (spec || '').replace(/^\./, '').split('.')[0];
            if (!dotted) continue;
            // resolve dotted: search workspace
            let found = null;
            for (const cand of records) {
                if (cand.path === dotted + '.py' || cand.path.startsWith(dotted + '/') || cand.path === dotted) {
                    found = cand.absPath; break;
                }
            }
            if (found) { set.add(found); }
            else { extCount += 1; }
            continue;
        }
        if (r.type === 'go' || r.type === 'rust' || r.type === 'java') {
            // For simplicity treat as external
            extCount += 1;
            continue;
        }
        const resolved = resolveImport(r.absPath, spec);
        if (resolved) {
            if (recordByAbs.has(resolved)) set.add(resolved);
            else extCount += 1;
        } else {
            extCount += 1;
        }
    }
    adjacency.set(r.absPath, set);
    externalFanout.set(r.absPath, extCount);
}
console.log(`  ${adjacency.size} files with imports resolved`);

/* Fan-in / fan-out */
const fanInMap = new Map();
for (const r of records) fanInMap.set(r.absPath, 0);
for (const [from, tos] of adjacency.entries()) {
    for (const to of tos) {
        fanInMap.set(to, (fanInMap.get(to) || 0) + 1);
    }
}

/* ── Stage 4: depth via iterative DFS with memoization ─────────────── */
console.log('[stage4] nesting depth…');
const depthCache = new Map(); // computed depths
const VISITING = Symbol('visiting');

/* Iterative post-order DFS to compute maxDepth with cycle short-circuit.
   Stack frame: { node, childIdx, children } */
function maxDepthIter(root) {
    if (depthCache.has(root)) return depthCache.get(root);
    const stack = [{ node: root, childIdx: 0, children: null, computed: false }];
    const onPath = new Set();
    while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.computed) {
            // post-order: compute result now
            let best = 0;
            for (const c of top.children) {
                const d = depthCache.get(c);
                if (typeof d === 'number' && d + 1 > best) best = d + 1;
            }
            depthCache.set(top.node, best);
            onPath.delete(top.node);
            stack.pop();
            continue;
        }
        if (top.children === null) {
            const tos = adjacency.get(top.node);
            if (!tos || tos.size === 0) {
                depthCache.set(top.node, 0);
                onPath.delete(top.node);
                stack.pop();
                continue;
            }
            top.children = Array.from(tos);
            if (onPath.has(top.node)) {
                // cycle on current path: treat as no out-edge for depth
                depthCache.set(top.node, 0);
                onPath.delete(top.node);
                stack.pop();
                continue;
            }
            onPath.add(top.node);
            continue;
        }
        if (top.childIdx >= top.children.length) {
            top.computed = true;
            continue;
        }
        const child = top.children[top.childIdx++];
        if (depthCache.has(child)) continue;
        if (onPath.has(child)) continue; // cycle: skip
        stack.push({ node: child, childIdx: 0, children: null, computed: false });
    }
    return depthCache.get(root);
}

for (const r of records) {
    maxDepthIter(r.absPath);
}
const maxDepths = new Map();
for (const [k, v] of depthCache.entries()) {
    if (typeof v === 'number') maxDepths.set(k, v);
}

const depPop = [];   // files with at least 1 resolvable out-edge
for (const r of records) {
    const tos = adjacency.get(r.absPath);
    if (tos && tos.size > 0) depPop.push(maxDepths.get(r.absPath) || 0);
}
const depthMax = depPop.length ? Math.max(...depPop) : 0;
const depthStats = {
    max: depthMax,
    mean: mean(depPop),
    median: median(depPop),
    p90: pct(depPop, 90),
    filesAtMax: depPop.filter(d => d === depthMax).length,
};

const depthRanking = records
    .map(r => ({
        path: r.path,
        bytes: r.bytes,
        bytesHuman: humanBytes(r.bytes),
        lines: r.lines,
        type: '.' + r.type,
        maxDepth: maxDepths.get(r.absPath) || 0,
        fanIn: fanInMap.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
    }))
    .sort((a, b) => b.maxDepth - a.maxDepth || a.path.localeCompare(b.path))
    .slice(0, 20);

/* ── Stage 5: cycle detection (3-color DFS) ─────────────────────────── */
console.log('[stage5] cycle detection…');
const WHITE = 0, GRAY = 1, BLACK = 2;
const color = new Map();
const cycles = [];
const stack = [];
const stackSet = new Set();

for (const r of records) {
    if (color.get(r.absPath) !== undefined) continue;
    // Iterative DFS
    const callStack = [{ node: r.absPath, idx: 0 }];
    color.set(r.absPath, GRAY);
    stack.push(r.absPath);
    stackSet.add(r.absPath);
    while (callStack.length) {
        const top = callStack[callStack.length - 1];
        const tos = Array.from(adjacency.get(top.node) || []);
        if (top.idx >= tos.length) {
            color.set(top.node, BLACK);
            stack.pop();
            stackSet.delete(top.node);
            callStack.pop();
            continue;
        }
        const next = tos[top.idx++];
        const c = color.get(next);
        if (c === GRAY) {
            // cycle: find path from `next` in stack
            const idx = stack.indexOf(next);
            if (idx >= 0 && stack.length - idx >= 2) {
                const cyclePath = stack.slice(idx);
                cyclePath.push(next); // close the loop
                const rel = cyclePath.map(p => {
                    const rec = recordByAbs.get(p);
                    return rec ? rec.path : p;
                });
                cycles.push({ absPath: cyclePath, relPath: rel });
            }
        } else if (c === undefined) {
            color.set(next, GRAY);
            stack.push(next);
            stackSet.add(next);
            callStack.push({ node: next, idx: 0 });
        }
    }
}

/* Deduplicate by canonical rotation */
const seenCycles = new Set();
const dedupCycles = [];
for (const cyc of cycles) {
    const path = cyc.relPath.slice(0, -1); // drop closing duplicate
    const n = path.length;
    if (n < 2) continue;
    let best = null;
    for (let i = 0; i < n; i++) {
        const rot = path.slice(i).concat(path.slice(0, i));
        const key = rot.join(' → ');
        if (best === null || key < best) best = key;
    }
    if (seenCycles.has(best)) continue;
    seenCycles.add(best);
    dedupCycles.push({ length: n, path: cyc.absPath, relPath: path });
}

const SEVERITY_OF_LEN = L => L >= 3 ? 'critical' : 'warning';
dedupCycles.sort((a, b) => b.length - a.length || a.relPath[0].localeCompare(b.relPath[0]));
const cyclesTop = dedupCycles.slice(0, 200).map(c => {
    // Hottest member by max(fanIn+fanOut+lines/1000)
    let hottest = c.relPath[0];
    let bestScore = -1;
    for (const p of c.path.slice(0, -1)) {
        const rec = recordByAbs.get(p);
        if (!rec) continue;
        const score = (fanInMap.get(p) || 0) + (adjacency.get(p)?.size || 0) + rec.lines / 1000;
        if (score > bestScore) { bestScore = score; hottest = rec.path; }
    }
    return {
        severity: SEVERITY_OF_LEN(c.length),
        path: c.relPath.join(' → '),
        length: c.length,
        suggestedFix: `Break edge from ${hottest} to break the cycle`,
        _absPath: c.path,
        _hottest: hottest,
    };
});

/* ── Stage 5.5: freshness ───────────────────────────────────────────── */
console.log('[stage5.5] freshness…');
const asOf = records.reduce((m, r) => Math.max(m, r.lastModified), 0);
const DAY = 86400;
const ageDays = records.map(r => Math.max(0, Math.floor((asOf - r.lastModified) / DAY)));
const maxAge = ageDays.length ? Math.max(...ageDays) : 0;
const medianAge = median(ageDays);
const p90Age = pct(ageDays, 90);
const staleCount = ageDays.filter(d => d >= 180).length;
const criticalAgeCount = ageDays.filter(d => d >= 365).length;

const FRESH_BUCKETS = [
    { name: '<30d',  min: 0,   max: 29 },
    { name: '30-90d',min: 30,  max: 90 },
    { name: '90-180d', min: 91, max: 180 },
    { name: '180-365d', min: 181, max: 365 },
    { name: '>365d', min: 366, max: Infinity },
];
const freshnessBuckets = FRESH_BUCKETS.map(b => ({ bucket: b.name, count: 0, pctFiles: 0 }));
for (const d of ageDays) {
    for (const b of FRESH_BUCKETS) {
        if (d >= b.min && d <= b.max) {
            const idx = FRESH_BUCKETS.indexOf(b);
            freshnessBuckets[idx].count += 1;
            break;
        }
    }
}
for (const b of freshnessBuckets) b.pctFiles = +(b.count / records.length * 100).toFixed(1);

const freshness = records
    .map((r, i) => ({
        path: r.path,
        ageDays: ageDays[i],
        lastModified: new Date(r.lastModified * 1000).toISOString().slice(0, 10),
        lastModifiedHuman: new Date(r.lastModified * 1000).toISOString().slice(0, 10),
        type: '.' + r.type,
        lines: r.lines,
    }))
    .filter(r => r.ageDays > 0)
    .sort((a, b) => b.ageDays - a.ageDays || a.path.localeCompare(b.path))
    .slice(0, 20);

const freshnessStats = {
    asOf,
    asOfHuman: asOf ? new Date(asOf * 1000).toISOString().slice(0, 10) : '',
    maxAge,
    median: medianAge,
    p90: p90Age,
    staleCount,
    criticalCount: criticalAgeCount,
};

/* ── Top fan-in / fan-out / orphans / hotspots ──────────────────────── */
const fanin = records
    .map(r => ({
        path: r.path,
        fanIn: fanInMap.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
        extDeps: externalFanout.get(r.absPath) || 0,
        lines: r.lines,
        type: '.' + r.type,
    }))
    .filter(r => r.fanIn > 0)
    .sort((a, b) => b.fanIn - a.fanIn || a.path.localeCompare(b.path))
    .slice(0, 20);

const fanout = records
    .map(r => ({
        path: r.path,
        fanIn: fanInMap.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
        extDeps: externalFanout.get(r.absPath) || 0,
        lines: r.lines,
        type: '.' + r.type,
    }))
    .filter(r => r.fanOut > 0)
    .sort((a, b) => b.fanOut - a.fanOut || a.path.localeCompare(b.path))
    .slice(0, 20);

const orphans = records
    .map(r => ({
        path: r.path,
        bytes: r.bytes,
        bytesHuman: humanBytes(r.bytes),
        lines: r.lines,
        type: '.' + r.type,
        fanIn: fanInMap.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
        maxDepth: maxDepths.get(r.absPath) || 0,
        score: +((r.lines / 1000) * 0.5).toFixed(2),
    }))
    .filter(r => r.fanIn === 0 && r.fanOut === 0)
    .sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path))
    .slice(0, 50);

/* Hotspot: lines/1000*0.5 + fanIn*0.2 + fanOut*0.1 + maxDepth*0.2 */
const hotspots = records
    .map(r => {
        const fanIn = fanInMap.get(r.absPath) || 0;
        const fanOut = (adjacency.get(r.absPath) || new Set()).size;
        const md = maxDepths.get(r.absPath) || 0;
        const score = +((r.lines / 1000) * 0.5 + fanIn * 0.2 + fanOut * 0.1 + md * 0.2).toFixed(2);
        return {
            path: r.path,
            bytes: r.bytes,
            bytesHuman: humanBytes(r.bytes),
            lines: r.lines,
            type: '.' + r.type,
            fanIn, fanOut, maxDepth: md, score,
        };
    })
    .filter(r => r.score >= 2.0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, 50);

/* Update `largest` with depth / fanIn / fanOut */
for (const l of largest) {
    const rec = records.find(r => r.path === l.path);
    if (!rec) continue;
    l.depth = maxDepths.get(rec.absPath) || 0;
    l.fanIn = fanInMap.get(rec.absPath) || 0;
    l.fanOut = (adjacency.get(rec.absPath) || new Set()).size;
}

/* ── Score (5-dim weighted, rate-based) ─────────────────────────────── */
const critSizeCount = records.filter(r => r.lines > 1000).length;
const warnSizeCount = records.filter(r => r.lines > 500 && r.lines <= 1000).length;
const depthGt15 = depPop.filter(d => d > 15).length;
const depth8to15 = depPop.filter(d => d >= 8 && d <= 15).length;
const cyclesLenGte3 = cyclesTop.filter(c => c.length >= 3).length;
const cyclesLen2 = cyclesTop.filter(c => c.length === 2).length;
const fanOutGt20 = records.filter(r => (adjacency.get(r.absPath)?.size || 0) > 20).length;
const fanInGt30 = records.filter(r => (fanInMap.get(r.absPath) || 0) > 30).length;
const staleGt365 = records.filter(r => ageDays[records.indexOf(r)] >= 365).length;
const stale180to365 = records.filter(r => {
    const a = ageDays[records.indexOf(r)];
    return a >= 180 && a < 365;
}).length;
const stale90to180 = records.filter(r => {
    const a = ageDays[records.indexOf(r)];
    return a >= 90 && a < 180;
}).length;

const sizeScore = rate(critSizeCount, 50) * 0.5 + rate(warnSizeCount, 100) * 0.5;
const depthScore = rate(depthGt15, 30) * 0.5 + rate(depth8to15, 80) * 0.5;
const cycleScore = rate(cyclesLenGte3, 20) * 0.5 + rate(cyclesLen2, 50) * 0.5;
const couplingScore = rate(fanOutGt20, 40) * 0.5 + rate(fanInGt30, 40) * 0.5;
const freshScore = rate(staleGt365, 50) * 0.4 + rate(stale180to365, 100) * 0.3 + rate(stale90to180, 200) * 0.3;

const filesScore = Math.round(
    sizeScore * 0.30 + depthScore * 0.20 + cycleScore * 0.20 + couplingScore * 0.15 + freshScore * 0.15
);

/* ── Alerts (P0/P1/P2) ──────────────────────────────────────────────── *
 * Enrichment templates and `push()` live in `./lib/alerts.mjs`. The
 * local helpers in this file only feed raw `ctx` payloads — all
 * professional copy (impact, risk, recommendations, etc.) is owned by
 * the lib so the page-facing strings are the single source of truth.
 */
const alerts = [];

for (const r of records) {
    if (r.lines > 1000) {
        const fo = (adjacency.get(r.absPath) || new Set()).size;
        pushAlert(alerts, {
            severity: 'P0', marker: 'P0', category: 'bloat',
            file: r.path, message: `File exceeds 1000 LOC (${r.lines} lines)`,
            ctx: { lines: r.lines, file: r.path, fanOut: fo },
        });
    } else if (r.lines > 500) {
        const fo = (adjacency.get(r.absPath) || new Set()).size;
        pushAlert(alerts, {
            severity: 'P1', marker: 'P1', category: 'bloat',
            file: r.path, message: `File exceeds 500 LOC (${r.lines} lines)`,
            ctx: { lines: r.lines, file: r.path, fanOut: fo },
        });
    }
}
for (const c of cyclesTop) {
    const sev = c.length >= 3 ? 'P0' : 'P1';
    pushAlert(alerts, {
        severity: sev, marker: sev, category: 'cycle',
        file: c._hottest,
        message: c.length >= 3 ? `${c.length}-node cycle detected` : `2-node cycle detected`,
        ctx: { length: c.length, hottest: c._hottest },
        cyclePath: c.path,
    });
}
for (const h of hotspots) {
    if (h.score >= 5.0) {
        pushAlert(alerts, {
            severity: 'P0', marker: 'P0', category: 'hotspot',
            file: h.path, message: `Hotspot score ${h.score} (>= 5.0)`,
            ctx: { score: h.score, fanOut: h.fanOut, fanIn: h.fanIn },
        });
    }
}
/* Sort the alert stream deterministically so the snapshot is diff-able:
   (severity asc, file asc). P0 < P1 < P2. */
alerts.sort((a, b) => {
    const sa = a.severity < b.severity ? -1 : a.severity > b.severity ? 1 : 0;
    if (sa !== 0) return sa;
    return String(a.file).localeCompare(String(b.file));
});

/* ── Self-Improvement Analysis ──────────────────────────────────────── */
const focus = [
    { dimName: 'Oversized files', score: Math.round(sizeScore), weight: 0.30 },
    { dimName: 'Nesting depth', score: Math.round(depthScore), weight: 0.20 },
    { dimName: 'Cycles', score: Math.round(cycleScore), weight: 0.20 },
    { dimName: 'Coupling', score: Math.round(couplingScore), weight: 0.15 },
    { dimName: 'Freshness', score: Math.round(freshScore), weight: 0.15 },
].sort((a, b) => a.score - b.score);

const p0Alerts = alerts.filter(a => a.severity === 'P0');
const p1Alerts = alerts.filter(a => a.severity === 'P1');
const p2Alerts = alerts.filter(a => a.severity === 'P2');

const topP0 = p0Alerts.slice(0, 5).map(a => ({
    action: a.message,
    file: a.file,
    line: a.line,
    severity: a.severity,
}));

const topLever = hotspots[0] ? {
    rank: 1,
    dimension: 'Coupling',
    severity: 'P0',
    kind: 'refactor',
    action: `Refactor ${hotspots[0].path} (${hotspots[0].lines} LOC, fan-out ${hotspots[0].fanOut}) to reduce hotspot score from ${hotspots[0].score}`,
    file: hotspots[0].path,
    line: 1,
    scoreUplift: Math.min(15, Math.round(hotspots[0].score)),
    effort: hotspots[0].fanOut > 5 ? 'high' : 'medium',
} : {
    rank: 1, dimension: 'General', severity: 'P2', kind: 'cleanup',
    action: 'No P0 hotspots detected', file: '', line: null,
    scoreUplift: 0, effort: 'low',
};

const projectedScore = Math.min(100, filesScore + (p0Alerts.length * 5) + (p1Alerts.length * 2));
const decayDelta = p0Alerts.length > 0 ? -Math.min(5, p0Alerts.length) : 0;

const selfImprovement = {
    topP0,
    focusArea: {
        dimName: focus[0].dimName,
        score: focus[0].score,
        why: `${focus[0].dimName} is at ${focus[0].score}/100 with ${p0Alerts.length} P0 and ${p1Alerts.length} P1 alerts. Address to lift composite score.`,
        hint: 'Invest focused effort on top 3 levers for the largest uplift.',
    },
    trendInsight: `Score ${filesScore} (grade ${gradeOf(filesScore)}). ${focus[0].dimName} is the weakest dimension at ${focus[0].score}/100.`,
    weightsHint: `Consider increasing ${focus[0].dimName} weight given its outsized impact on overall health.`,
    narrative: [
        `Overall health at ${filesScore}/100 (grade ${gradeOf(filesScore)}) — ${filesScore >= 75 ? 'good' : filesScore >= 60 ? 'moderate' : 'concerning'} shape with clear remediation path.`,
        `${p0Alerts.length} critical (P0) and ${p1Alerts.length} major (P1) alerts active. Primary risks cluster around ${focus[0].dimName} (score ${focus[0].score}).`,
        `Top lever: refactor ${topLever.file || 'no critical file'} (+${topLever.scoreUplift} pts). Remediation roadmap projects ${projectedScore}/100 after P0+P1 closure.`,
        `Score ${filesScore} | grade ${gradeOf(filesScore)} | gap ${Math.max(0, 75 - filesScore)} pts to B | projected ${projectedScore} after plan | decay risk: ${decayDelta} pts/quarter without action`,
    ],
    severityDonut: {
        p0: p0Alerts.length,
        p1: p1Alerts.length,
        p2: p2Alerts.length,
        total: alerts.length,
    },
    riskVectors: focus.map(f => ({
        dimension: f.dimName,
        score: f.score,
        weight: f.weight,
        p0: f.dimName === 'Oversized files' ? critSizeCount : 0,
        p1: f.dimName === 'Oversized files' ? warnSizeCount
            : f.dimName === 'Nesting depth' ? depth8to15
            : f.dimName === 'Cycles' ? cyclesLen2
            : f.dimName === 'Coupling' ? fanOutGt20
            : f.dimName === 'Freshness' ? stale180to365
            : 0,
        p2: 0,
    })),
    levers: [
        topLever,
        ...hotspots.slice(1, 6).map((h, i) => ({
            rank: i + 2,
            dimension: 'Coupling',
            severity: h.score >= 5.0 ? 'P0' : 'P1',
            kind: 'refactor',
            action: `Refactor ${h.path} (${h.lines} LOC, fan-out ${h.fanOut}) to reduce hotspot score from ${h.score}`,
            file: h.path, line: 1,
            scoreUplift: Math.min(15, Math.round(h.score)),
            effort: h.fanOut > 5 ? 'high' : 'medium',
        })),
    ],
    benchmarks: {
        currentGrade: gradeOf(filesScore),
        currentValue: filesScore,
        targetGrade: filesScore >= 90 ? 'A' : 'B',
        targetValue: filesScore >= 90 ? 100 : 90,
        gapToNext: Math.max(0, (filesScore >= 90 ? 100 : 90) - filesScore),
    },
    remediationPlan: {
        phases: [
            { phase: 'P0 — Blocking fixes (this sprint)', severity: 'P0', itemCount: Math.min(p0Alerts.length, 5), estUplift: Math.min(20, p0Alerts.length * 5), projected: Math.min(100, filesScore + 20), deadline: '2 weeks' },
            { phase: 'P1 — Important (next sprint)', severity: 'P1', itemCount: Math.min(p1Alerts.length, 5), estUplift: Math.min(10, p1Alerts.length * 2), projected: projectedScore, deadline: '4 weeks' },
            { phase: 'P2 — Nice-to-have (this quarter)', severity: 'P2', itemCount: p2Alerts.length, estUplift: 5, projected: 100, deadline: 'this quarter' },
        ],
        currentScore: filesScore,
        projectedScoreIfAllP0P1Remediated: projectedScore,
    },
    decayForecast: {
        currentScore: filesScore,
        projectedNext: Math.max(0, filesScore + decayDelta),
        delta: decayDelta,
        rationale: decayDelta < 0
            ? `Without action, ${focus[0].dimName} debt grows ~1 pt/quarter. Estimated ${decayDelta} pts next run if no remediation.`
            : 'No decay risk detected; current shape is stable.',
    },
};

/* ── Final REPORT_DATA ──────────────────────────────────────────────── */
const scopeDisplay = absScope.endsWith('/') ? absScope : absScope + '/';
const REPORT_DATA = {
    scope: scopeDisplay,
    scopePath: absScope,
    score: filesScore,
    alerts,
    summary: {
        totalFiles: records.length,
        totalBytes,                         /* raw byte count — drives the avg-size key finding */
        totalBytesHuman: humanBytes(totalBytes),
        maxDepth: depthStats.max,
        criticalCount: p0Alerts.length,
        hotspotCount: hotspots.length,
        cycleCount: cyclesTop.length,
        staleCount,
        totalLines,
    },
    treemap,
    types,
    histogram,
    largest,
    fanin,
    fanout,
    hotspots,
    orphans,
    depthStats,
    depthRanking,
    cycles: cyclesTop.map(c => ({
        severity: c.severity,
        path: c.path,
        length: c.length,
        suggestedFix: c.suggestedFix,
    })),
    freshness,
    freshnessBuckets,
    freshnessStats,
    records: [],
    adjacency: {},
    selfImprovement,
    scoreWeights: [
        { dimension: 'Oversized files', weight: 0.30, score: Math.round(sizeScore) },
        { dimension: 'Nesting depth',   weight: 0.20, score: Math.round(depthScore) },
        { dimension: 'Cycles',          weight: 0.20, score: Math.round(cycleScore) },
        { dimension: 'Coupling',        weight: 0.15, score: Math.round(couplingScore) },
        { dimension: 'Freshness',       weight: 0.15, score: Math.round(freshScore) },
    ],
};

/* Truncation guard: with > 50k records drop per-record fanIn/fanOut/maxDepth */
let truncated = false;
let recordsTrunc = records;
let adjTrunc = adjacency;
if (records.length > 100_000) {
    truncated = true;
    recordsTrunc = records.map(r => ({
        path: r.path, bytes: r.bytes, lines: r.lines, type: r.type, lastModified: r.lastModified,
    }));
    /* Replace adjacency with summary */
    const topFanIn = Array.from(fanInMap.entries())
        .map(([abs, c]) => ({ path: recordByAbs.get(abs)?.path || abs, fanIn: c }))
        .filter(x => x.fanIn > 0)
        .sort((a, b) => b.fanIn - a.fanIn)
        .slice(0, 20);
    const topFanOut = records
        .map(r => ({ path: r.path, fanOut: (adjacency.get(r.absPath) || new Set()).size }))
        .filter(x => x.fanOut > 0)
        .sort((a, b) => b.fanOut - a.fanOut)
        .slice(0, 20);
    let edgeCount = 0;
    for (const tos of adjacency.values()) edgeCount += tos.size;
    adjTrunc = { edgeCount, topFanIn, topFanOut };
} else if (records.length > 50_000) {
    truncated = true;
    recordsTrunc = records.map(r => ({
        path: r.path, bytes: r.bytes, lines: r.lines, type: r.type, lastModified: r.lastModified,
    }));
    const adjObj = {};
    for (const [k, v] of adjacency.entries()) {
        const rel = recordByAbs.get(k)?.path || k;
        adjObj[rel] = Array.from(v).map(x => recordByAbs.get(x)?.path || x);
    }
    adjTrunc = adjObj;
} else {
    /* Small repo: full data */
    recordsTrunc = records.map(r => ({
        path: r.path, bytes: r.bytes, lines: r.lines, type: r.type, lastModified: r.lastModified,
        fanIn: fanInMap.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
        extDeps: externalFanout.get(r.absPath) || 0,
        maxDepth: maxDepths.get(r.absPath) || 0,
        ageDays: ageDays[records.indexOf(r)],
    }));
    const adjObj = {};
    for (const [k, v] of adjacency.entries()) {
        const rel = recordByAbs.get(k)?.path || k;
        adjObj[rel] = Array.from(v).map(x => recordByAbs.get(x)?.path || x);
    }
    adjTrunc = adjObj;
}
REPORT_DATA.truncated = truncated;
REPORT_DATA.records = recordsTrunc;
REPORT_DATA.adjacency = adjTrunc;

/* ── Read REPORT_CONFIG (template) and merge ───────────────────────── */
const tplDataJs = fs.readFileSync(
    path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'templates', 'data.js'),
    'utf8'
);

/* Extract REPORT_CONFIG literal from the template */
const configMatch = tplDataJs.match(/window\.REPORT_CONFIG\s*=\s*\{[\s\S]*?\};/);
if (!configMatch) {
    console.error('Could not find REPORT_CONFIG in template data.js');
    process.exit(5);
}

const configText = configMatch[0];

/* Inject the run-time `generatedAt` ISO 8601 UTC timestamp into the
   template's REPORT_CONFIG.options. The template ships with
   `generatedAt: null` as a placeholder; the analyzer must overwrite
   it on every run. This timestamp drives the meta-grid "Generated"
   field, the stale-banner (>7 day check), and the footer recap. */
const generatedAt = new Date().toISOString();
let configWithTs = configText;
/* Match the `generatedAt: null,` line (or any placeholder value) and
   replace it with the literal ISO timestamp. The regex is intentionally
   narrow so we never accidentally rewrite user data. */
configWithTs = configWithTs.replace(
    /generatedAt:\s*null\s*,/,
    `generatedAt: '${generatedAt}',`
);

const out = configWithTs + '\n\n' +
    'window.REPORT_DATA = ' + JSON.stringify(REPORT_DATA, null, 2) + ';\n';

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'data.js'), out);

console.log(`[done] data.js: ${(out.length / 1024).toFixed(1)} KB`);

/* ── Build the page (copy assets + inline templates + substitute) ──── */
/* The analyzer is the single entry point: it writes data.js AND assembles
   the full byte-stable page from templates. The page uses the YiPet
   reference layout (absolute `/.claude/shared/...` paths + runtime
   `fetch()` of per-component index.html files) — it requires an http://
   server (the shared loader fetches Vue from the absolute CDN root).

   1. Copies the byte-stable assets (index.html, index.css, index.js,
      app, lib, and each component's index.html + index.js + index.css).
   2. Writes the regenerated data.js (REPORT_CONFIG + REPORT_DATA). */
const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const TEMPLATES_DIR = path.join(SCRIPT_DIR, '..', 'templates');

/* Copy byte-stable assets. fs.cpSync recursive handles subdirectories. */
const ASSETS = ['index.html', 'index.css', 'index.js', 'app', 'lib'];
for (const name of ASSETS) {
    const src = path.join(TEMPLATES_DIR, name);
    if (!fs.existsSync(src)) continue;
    fs.cpSync(src, path.join(OUT_DIR, name), { recursive: true });
}

/* Copy each component's index.html + index.js + index.css. The page
   fetch()s the index.html files at runtime to populate the component
   template registry (see the inline <script> in templates/index.html). */
const COMPONENTS_DIR = path.join(TEMPLATES_DIR, 'components');
if (fs.existsSync(COMPONENTS_DIR)) {
    for (const entry of fs.readdirSync(COMPONENTS_DIR)) {
        const srcComp = path.join(COMPONENTS_DIR, entry);
        if (!fs.statSync(srcComp).isDirectory()) continue;
        const dstComp = path.join(OUT_DIR, 'components', entry);
        fs.mkdirSync(dstComp, { recursive: true });
        for (const f of ['index.html', 'index.js', 'index.css']) {
            const p = path.join(srcComp, f);
            if (fs.existsSync(p)) fs.copyFileSync(p, path.join(dstComp, f));
        }
    }
}

/* index.html is a byte-stable copy of templates/index.html — no
   substitutions needed. The template uses Vue interpolation for the
   scope title and absolute `/.claude/shared/` paths. */
console.log(`[done] index.html: ${(fs.statSync(path.join(OUT_DIR, 'index.html')).size / 1024).toFixed(1)} KB`);
console.log(`[done] total elapsed: ${(Date.now() - t0) / 1000}s`);
console.log(`[done] score=${filesScore} (${gradeOf(filesScore)}) alerts: P0=${p0Alerts.length} P1=${p1Alerts.length} P2=${p2Alerts.length}`);
console.log(`[done] cycles: ${cyclesTop.length}, hotspots: ${hotspots.length}, orphans: ${orphans.length}`);
