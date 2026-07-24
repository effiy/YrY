#!/usr/bin/env node
/**
 * yry-report-files analyzer — single-project file/asset report generator.
 *
 * Implements the methodology in references/methodology.md and emits a
 * data.js + copies the Vue 3 page assets into <outDir>/.
 *
 * Usage:
 *   node analyze.js <projectRoot> <outDir> [--scope <relScope>] [--top <n>]
 *
 * Output layout (written into <outDir>):
 *   index.html   (copied from templates/, paths rewritten to reach YiPet/cdn)
 *   index.css    (copied)
 *   index.js     (copied)
 *   app/*.js     (copied)
 *   data.js      (generated — window.REPORT_CONFIG + window.REPORT_DATA)
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ── CLI ────────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
if (argv.length < 2) {
    console.error('Usage: node analyze.js <projectRoot> <outDir> [--scope <relScope>] [--top <n>]');
    process.exit(2);
}
const projectRoot = path.resolve(argv[0]);
const outDir = path.resolve(argv[1]);
let scope = '.';
let topN = 20;
for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--scope' && argv[i + 1]) { scope = argv[++i]; }
    else if (argv[i] === '--top' && argv[i + 1]) { topN = parseInt(argv[++i], 10); }
}

if (!fs.existsSync(projectRoot)) {
    console.error('Project root not found: ' + projectRoot);
    process.exit(2);
}
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(outDir, 'app'), { recursive: true });

// ── Templates source ────────────────────────────────────────────────────────
const TEMPLATES_DIR = __dirname + '/templates';   // .../yry-reports/files/templates
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');  // YrY/

// Relative path from <outDir> (which lives under YiDoc/projects/<p>/files/)
// to the repo root, used to rewrite CDN paths in index.html.
// outDir = YrY/YiDoc/projects/<p>/files/  →  ../../../../  = YrY/
const TO_ROOT = '../../../..';

// ── Exclusion set (from rules/analysis-contracts.md) ────────────────────────
const EXCLUDE_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next', '.turbo',
    'coverage', '.memory', '.claude', '.vscode', '.idea',
    '__pycache__', '.pytest_cache', '.venv', 'venv', 'env',
    '.svelte-kit', '.output', '.nuxt', '.cache',
]);
const EXCLUDE_FILES = new Set(['.DS_Store', 'Thumbs.db']);

// ── Extension → type map ────────────────────────────────────────────────────
const EXT_TYPE = {
    '.js': 'js', '.mjs': 'js', '.cjs': 'js', '.jsx': 'jsx',
    '.ts': 'ts', '.tsx': 'tsx',
    '.vue': 'vue',
    '.py': 'py',
    '.go': 'go',
    '.rs': 'rust',
    '.css': 'css', '.scss': 'css', '.less': 'css', '.styl': 'css',
    '.html': 'html', '.htm': 'html',
    '.json': 'json',
    '.md': 'md', '.markdown': 'md',
};

function fileType(ext) {
    return EXT_TYPE[ext.toLowerCase()] || 'other';
}

// ── Import regex per language (anchored, non-greedy, last group = specifier)
// Each regex returns the specifier string per import statement ──────────────
const IMPORT_PATTERNS = [
    // JS / TS / JSX / TSX / Vue <script>
    { types: ['js', 'jsx', 'ts', 'tsx', 'vue'],
      re: /^\s*(?:import\s+(?:[\s\S]*?from\s+|[^'"]*from\s+)?|export\s+(?:[\s\S]*?from\s+)?|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/gm,
      // also @import in CSS handled below separately
    },
];

const CSS_IMPORT_RE = /^\s*@import\s+(?:url\()?['"]([^'"]+)['"]\)?/gm;

// Vue <script> may be plain JS or lang="ts". We extract imports from the
// <script> block only (template/style sections are not real dependencies).
function extractVueScriptSrc(content) {
    const m = content.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    return m ? m[1] : '';
}

// ── Stage 1: File inventory ────────────────────────────────────────────────
function walk(dir, out) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const e of entries) {
        const name = e.name;
        if (e.isDirectory()) {
            if (EXCLUDE_DIRS.has(name) || name.startsWith('.')) continue;
            walk(path.join(dir, name), out);
        } else if (e.isFile()) {
            if (EXCLUDE_FILES.has(name)) continue;
            out.push(path.join(dir, name));
        }
    }
}

const allFiles = [];
walk(projectRoot, allFiles);

const records = [];
const statBatch = allFiles.map(f => {
    const st = fs.statSync(f);
    return { f, st };
});

// Line count via batched read (small repos — fine to read each file)
for (const { f, st } of statBatch) {
    if (!st.isFile()) continue;
    const ext = path.extname(f).toLowerCase();
    const type = fileType(ext);
    // Only count source-ish files; skip binaries by extension
    if (type === 'other' && !/\.(json|md|html?)$/i.test(ext)) {
        // still list but don't analyze imports
    }
    let lines = 0;
    if (st.size > 0) {
        try {
            const buf = fs.readFileSync(f);
            lines = buf.toString('utf8').split('\n').length;
        } catch { lines = 0; }
    }
    records.push({
        absPath: f,
        path: path.relative(projectRoot, f).split(path.sep).join('/'),
        bytes: st.size,
        lines,
        type,
        ext,
        lastModified: Math.floor(st.mtimeMs / 1000),
    });
}

records.sort((a, b) => a.path.localeCompare(b.path));

// ── Stage 2: Size distribution ─────────────────────────────────────────────
const totalFiles = records.length;
const totalBytes = records.reduce((s, r) => s + r.bytes, 0);
const totalLines = records.reduce((s, r) => s + r.lines, 0);

// Treemap: top-10 directories by recursive bytes
const dirBytesMap = new Map();
for (const r of records) {
    const dir = path.posix.dirname(r.path) || '.';
    const segs = dir.split('/');
    for (let i = 1; i <= segs.length; i++) {
        const prefix = segs.slice(0, i).join('/') + (i < segs.length ? '' : '');
        // count each ancestor directory
    }
}
// Simpler: group by immediate parent and aggregate recursively
function dirRecursiveBytes() {
    const map = new Map();  // dirPath → bytes
    for (const r of records) {
        const dir = path.posix.dirname(r.path);
        const segs = dir === '.' ? [] : dir.split('/');
        let acc = '';
        for (let i = 0; i <= segs.length; i++) {
            const key = i === 0 ? '.' : segs.slice(0, i).join('/');
            // include file in its immediate parent and all ancestors
            if (i === segs.length) {
                map.set(key, (map.get(key) || 0) + r.bytes);
            } else {
                // ensure ancestor exists
                if (!map.has(segs.slice(0, i + 1).join('/'))) {
                    map.set(segs.slice(0, i + 1).join('/'), 0);
                }
            }
        }
        // add bytes to immediate parent only (parent aggregates via children)
        map.set(dir, (map.get(dir) || 0) + r.bytes);
    }
    // now aggregate ancestor = sum of children
    const all = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
    for (const [k] of all) {
        // accumulate into ancestors
        const segs = k === '.' ? [] : k.split('/');
        for (let i = 0; i < segs.length; i++) {
            const anc = segs.slice(0, i + 1).join('/');
            if (anc !== k) map.set(anc, (map.get(anc) || 0) + (map.get(k) || 0));
        }
    }
    return map;
}
const dirMap = dirRecursiveBytes();
const treemap = [...dirMap.entries()]
    .filter(([k]) => k !== '.')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, bytes]) => ({ name: name + '/', bytes, humanBytes: humanBytes(bytes) }));

// Type breakdown
const typeAgg = new Map();
for (const r of records) {
    const key = r.ext || '(none)';
    if (!typeAgg.has(key)) typeAgg.set(key, { type: key, fileCount: 0, totalBytes: 0, totalLines: 0 });
    const t = typeAgg.get(key);
    t.fileCount++;
    t.totalBytes += r.bytes;
    t.totalLines += r.lines;
}
const types = [...typeAgg.values()]
    .map(t => ({
        type: t.type,
        fileCount: t.fileCount,
        pctFiles: pct(t.fileCount, totalFiles),
        totalBytes: t.totalBytes,
        totalBytesHuman: humanBytes(t.totalBytes),
        pctBytes: pct(t.totalBytes, totalBytes),
        totalLines: t.totalLines,
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

// Histogram (fixed buckets from methodology Stage 2.6)
const histBuckets = [
    { bucket: '0',          test: l => l === 0 },
    { bucket: '1-50',       test: l => l >= 1 && l <= 50 },
    { bucket: '51-100',     test: l => l >= 51 && l <= 100 },
    { bucket: '101-250',    test: l => l >= 101 && l <= 250 },
    { bucket: '251-500',    test: l => l >= 251 && l <= 500 },
    { bucket: '501-1000',   test: l => l >= 501 && l <= 1000 },
    { bucket: '1001-2000',  test: l => l >= 1001 && l <= 2000 },
    { bucket: '2000+',      test: l => l >= 2001 },
];
const histogram = histBuckets.map(b => {
    const count = records.filter(r => b.test(r.lines)).length;
    return { bucket: b.bucket, count, pctFiles: pct(count, totalFiles) };
});

// Largest files
const largest = [...records]
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, topN)
    .map(r => ({
        path: r.path, bytes: r.bytes, bytesHuman: humanBytes(r.bytes),
        lines: r.lines, type: r.ext, depth: 0, fanIn: 0, fanOut: 0,
    }));

// ── Stage 3: Dependency graph ──────────────────────────────────────────────
const absPathToRecord = new Map(records.map(r => [r.absPath, r]));
const adjacency = new Map();        // absPath → Set<absPath>
const externalDeps = new Map();     // absPath → number
const fanIn = new Map();             // absPath → number

function tryResolve(specifier, fromFileDir) {
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) return null;
    const base = path.resolve(fromFileDir, specifier);
    const candidates = [base];
    const exts = ['.js', '.ts', '.mjs', '.cjs', '.jsx', '.tsx', '.vue', '.json'];
    for (const ext of exts) {
        candidates.push(base + ext);
        candidates.push(path.join(base, 'index' + ext));
    }
    for (const c of candidates) {
        if (absPathToRecord.has(c)) return c;
    }
    return null;
}

for (const r of records) {
    let src = '';
    if (r.type === 'vue') {
        src = extractVueScriptSrc(fs.readFileSync(r.absPath, 'utf8'));
    } else if (['js', 'jsx', 'ts', 'tsx'].includes(r.type)) {
        if (r.bytes > 256_000) {
            const buf = Buffer.alloc(Math.min(65536, r.bytes));
            const fd = fs.openSync(r.absPath, 'r');
            fs.readSync(fd, buf, 0, buf.length, 0);
            fs.closeSync(fd);
            src = buf.toString('utf8');
        } else {
            try { src = fs.readFileSync(r.absPath, 'utf8'); } catch { src = ''; }
        }
    } else if (r.type === 'css') {
        try { src = fs.readFileSync(r.absPath, 'utf8'); } catch { src = ''; }
    } else {
        continue;
    }

    const out = new Set();
    let extCount = 0;
    // JS-family import scan
    if (['js', 'jsx', 'ts', 'tsx', 'vue'].includes(r.type)) {
        const re = /^\s*(?:import\s+(?:[\s\S]*?from\s+)?|export\s+(?:[\s\S]*?from\s+)?|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/gm;
        let m;
        while ((m = re.exec(src)) !== null) {
            const spec = m[1];
            if (!spec.startsWith('.') && !spec.startsWith('/')) {
                extCount++;
                continue;
            }
            const resolved = tryResolve(spec, path.dirname(r.absPath));
            if (resolved && resolved !== r.absPath) out.add(resolved);
        }
    }
    if (r.type === 'css') {
        let m;
        while ((m = CSS_IMPORT_RE.exec(src)) !== null) {
            const spec = m[1];
            if (!spec.startsWith('.')) { extCount++; continue; }
            const resolved = tryResolve(spec, path.dirname(r.absPath));
            if (resolved && resolved !== r.absPath) out.add(resolved);
        }
    }
    if (out.size > 0 || extCount > 0) {
        adjacency.set(r.absPath, out);
        externalDeps.set(r.absPath, extCount);
    }
}

// Fan-in
for (const [src, deps] of adjacency) {
    for (const dep of deps) {
        fanIn.set(dep, (fanIn.get(dep) || 0) + 1);
    }
}

// Fan-out ranking & fan-in ranking (top-20)
const fanOutList = [...adjacency.entries()].map(([abs, deps]) => {
    const r = absPathToRecord.get(abs);
    return {
        path: r.path,
        fanIn: fanIn.get(abs) || 0,
        fanOut: deps.size,
        extDeps: externalDeps.get(abs) || 0,
        lines: r.lines,
        type: r.ext,
    };
}).sort((a, b) => b.fanOut - a.fanOut || a.path.localeCompare(b.path)).slice(0, topN);

const fanInList = [...adjacency.entries()].map(([abs, deps]) => {
    const r = absPathToRecord.get(abs);
    return {
        path: r.path,
        fanIn: fanIn.get(abs) || 0,
        fanOut: deps.size,
        extDeps: externalDeps.get(abs) || 0,
        lines: r.lines,
        type: r.ext,
    };
}).sort((a, b) => b.fanIn - a.fanIn || a.path.localeCompare(b.path)).slice(0, topN);

// ── Stage 4: Depth (DFS with memoization, iterative) ──────────────────────
const maxDepthMap = new Map();
function computeDepth(root) {
    const stack = [{ node: root, state: 'enter' }];
    const visited = new Map();  // absPath → 'gray' | 'black'
    while (stack.length) {
        const frame = stack[stack.length - 1];
        if (frame.state === 'enter') {
            if (maxDepthMap.has(frame.node)) { stack.pop(); continue; }
            if (visited.get(frame.node) === 'black') { stack.pop(); continue; }
            if (visited.get(frame.node) === 'gray') { stack.pop(); continue; }  // cycle
            visited.set(frame.node, 'gray');
            frame.state = 'exit';
            const deps = adjacency.get(frame.node);
            if (!deps || deps.size === 0) {
                maxDepthMap.set(frame.node, 0);
                visited.set(frame.node, 'black');
                stack.pop();
                continue;
            }
            frame.it = deps.values();
        } else {
            // exit state — try next child
            const next = frame.it.next();
            if (next.done) {
                let max = 0;
                const deps = adjacency.get(frame.node);
                for (const dep of deps) {
                    const d = maxDepthMap.get(dep);
                    if (typeof d === 'number' && d > max) max = d;
                }
                maxDepthMap.set(frame.node, max + (deps.size > 0 ? 1 : 0));
                if (maxDepthMap.get(frame.node) === 1 && deps.size > 0) {
                    // ok
                }
                visited.set(frame.node, 'black');
                stack.pop();
            } else {
                const child = next.value;
                if (maxDepthMap.has(child) || visited.get(child) === 'gray') {
                    // skip — already computed or in-progress
                } else {
                    stack.push({ node: child, state: 'enter' });
                }
            }
        }
    }
    return maxDepthMap.get(root) || 0;
}
for (const r of records) {
    computeDepth(r.absPath);
}
// Edge case: nodes with no out-edges get depth 0 (already set above)

// Depth stats over P = files with ≥ 1 resolvable out-edge
const depthPop = [...adjacency.entries()].map(([abs]) => maxDepthMap.get(abs) || 0);
depthPop.sort((a, b) => a - b);
const depthStats = depthPop.length === 0
    ? { max: 0, mean: 0, median: 0, p90: 0, filesAtMax: 0 }
    : {
        max: Math.max(...depthPop),
        mean: round2(depthPop.reduce((s, v) => s + v, 0) / depthPop.length),
        median: median(depthPop),
        p90: percentileNearestRank(depthPop, 0.9),
        filesAtMax: depthPop.filter(v => v === Math.max(...depthPop)).length,
    };

const depthRanking = [...records]
    .map(r => ({
        path: r.path, bytes: r.bytes, bytesHuman: humanBytes(r.bytes),
        lines: r.lines, type: r.ext,
        fanIn: fanIn.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
        maxDepth: maxDepthMap.get(r.absPath) || 0,
        score: 0,
    }))
    .filter(r => r.maxDepth > 0)
    .sort((a, b) => b.maxDepth - a.maxDepth || a.path.localeCompare(b.path))
    .slice(0, topN);

// ── Stage 5: Cycle detection (3-color DFS) ────────────────────────────────
const cycles = [];
const seenCycleKeys = new Set();
const MAX_CYCLES = 200;

function detectCycles() {
    const color = new Map();  // abs → 0 white, 1 gray, 2 black
    const stack = [];

    function dfs(node) {
        if (cycles.length >= MAX_CYCLES) return;
        color.set(node, 1);
        stack.push(node);
        const deps = adjacency.get(node);
        if (deps) {
            for (const dep of deps) {
                if (dep === node) continue;  // self-edge
                const c = color.get(dep) || 0;
                if (c === 1) {
                    // cycle: slice stack from first occurrence of dep
                    const idx = stack.indexOf(dep);
                    const cyc = stack.slice(idx);
                    const key = cyc.slice().sort().join('|');
                    if (!seenCycleKeys.has(key)) {
                        seenCycleKeys.add(key);
                        const pathArr = cyc.concat([dep]);
                        const length = pathArr.length - 1;
                        const severity = length === 2 ? 'critical'
                            : (length >= 3 && length <= 4 ? 'critical' : 'critical');
                        cycles.push({
                            severity,
                            path: pathArr.map(abs => absPathToRecord.get(abs)?.path || abs).join(' → '),
                            length,
                            suggestedFix: 'extract shared interface/types to break the edge',
                        });
                        if (cycles.length >= MAX_CYCLES) return;
                    }
                } else if (c === 0) {
                    dfs(dep);
                    if (cycles.length >= MAX_CYCLES) return;
                }
            }
        }
        stack.pop();
        color.set(node, 2);
    }

    for (const r of records) {
        if ((color.get(r.absPath) || 0) === 0) {
            dfs(r.absPath);
            if (cycles.length >= MAX_CYCLES) break;
        }
    }
}
detectCycles();
cycles.sort((a, b) => b.length - a.length || a.path.localeCompare(b.path));

// ── Stage 5.5: Freshness ───────────────────────────────────────────────────
const asOf = records.length ? Math.max(...records.map(r => r.lastModified)) : 0;
const ageArr = records.map(r => ({
    path: r.path, ageDays: asOf ? Math.max(0, Math.floor((asOf - r.lastModified) / 86400)) : 0,
    lastModified: r.lastModified, type: r.ext, bytes: r.bytes, lines: r.lines,
}));
const freshness = ageArr
    .filter(a => a.ageDays > 0)
    .sort((a, b) => b.ageDays - a.ageDays || a.path.localeCompare(b.path))
    .slice(0, topN)
    .map(a => ({
        path: a.path, ageDays: a.ageDays,
        lastModified: unixToISO(a.lastModified),
        lastModifiedHuman: unixToISO(a.lastModified),
        type: a.type, lines: a.lines,
    }));

const ageBuckets = [
    { bucket: '<30d',    test: a => a <= 29 },
    { bucket: '30-90d',  test: a => a >= 30 && a <= 90 },
    { bucket: '90-180d', test: a => a >= 91 && a <= 180 },
    { bucket: '180-365d',test: a => a >= 181 && a <= 365 },
    { bucket: '>365d',   test: a => a >= 366 },
];
const allAges = ageArr.map(a => a.ageDays).sort((a, b) => a - b);
const freshnessBuckets = ageBuckets.map(b => {
    const count = allAges.filter(b.test).length;
    return { bucket: b.bucket, count, pctFiles: pct(count, totalFiles) };
});
const freshnessStats = {
    asOf: asOf * 1000,
    asOfHuman: unixToISO(asOf),
    maxAge: allAges.length ? allAges[allAges.length - 1] : 0,
    median: allAges.length ? median(allAges) : 0,
    p90: allAges.length ? percentileNearestRank(allAges, 0.9) : 0,
    staleCount: allAges.filter(a => a >= 180).length,
    criticalCount: allAges.filter(a => a >= 365).length,
};

// ── Stage 3.6: Hotspot score ───────────────────────────────────────────────
// hotspotScore(f) = lines/1000*0.5 + fanIn*0.2 + fanOut*0.1 + maxDepth*0.2
function hotspotScore(r) {
    const fin = fanIn.get(r.absPath) || 0;
    const fout = (adjacency.get(r.absPath) || new Set()).size;
    const depth = maxDepthMap.get(r.absPath) || 0;
    return round2(r.lines / 1000 * 0.5 + fin * 0.2 + fout * 0.1 + depth * 0.2);
}

const hotspots = [...records]
    .map(r => ({
        path: r.path, bytes: r.bytes, bytesHuman: humanBytes(r.bytes),
        lines: r.lines, type: r.ext,
        fanIn: fanIn.get(r.absPath) || 0,
        fanOut: (adjacency.get(r.absPath) || new Set()).size,
        maxDepth: maxDepthMap.get(r.absPath) || 0,
        score: hotspotScore(r),
    }))
    .filter(r => r.score >= 2.0)
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path))
    .slice(0, topN);

// Orphans
const orphans = [...records]
    .filter(r => {
        const fin = fanIn.get(r.absPath) || 0;
        const fout = (adjacency.get(r.absPath) || new Set()).size;
        return fin === 0 && fout === 0;
    })
    .map(r => ({
        path: r.path, bytes: r.bytes, bytesHuman: humanBytes(r.bytes),
        lines: r.lines, type: r.ext,
        fanIn: 0, fanOut: 0,
        maxDepth: maxDepthMap.get(r.absPath) || 0,
        score: hotspotScore(r),
    }))
    .sort((a, b) => b.bytes - a.bytes || a.path.localeCompare(b.path))
    .slice(0, topN);

// Attach fanIn/fanOut/depth to largest rows
for (const l of largest) {
    const r = records.find(rr => rr.path === l.path);
    if (r) {
        l.fanIn = fanIn.get(r.absPath) || 0;
        l.fanOut = (adjacency.get(r.absPath) || new Set()).size;
        l.depth = maxDepthMap.get(r.absPath) || 0;
    }
}

// ── Stage 5.6: Alerts ──────────────────────────────────────────────────────
const alerts = [];
function addAlert(severity, category, file, line, message, extra = {}) {
    alerts.push(Object.assign({
        severity, marker: severity, category, file, line, message,
    }, extra));
}
for (const r of records) {
    const fin = fanIn.get(r.absPath) || 0;
    const fout = (adjacency.get(r.absPath) || new Set()).size;
    const depth = maxDepthMap.get(r.absPath) || 0;
    const score = hotspotScore(r);

    if (r.lines > 1000) {
        addAlert('P0', 'bloat', r.path, 1,
            `File exceeds 1000 LOC (${r.lines} lines) — split candidate`,
            { metric: `${r.lines} LOC`, effort: 'high', scoreUplift: 8,
              recommendations: [
                  'Split by responsibility into cohesive submodules and re-export from a barrel index.',
                  'Move pure helpers into a sibling utils file and unit-test in isolation.',
                  'Add a LOC budget to lint or CI so the file cannot silently regress.',
                  'After the split, re-run this report and confirm fan-out / depth drop.',
              ] });
    } else if (r.lines > 500) {
        addAlert('P2', 'size', r.path, 1,
            `File exceeds 500 LOC (${r.lines} lines)`,
            { metric: `${r.lines} LOC`, effort: 'medium', scoreUplift: 4,
              recommendations: ['Split by responsibility into cohesive submodules.',
                                'Add a LOC budget to lint or CI.'] });
    }
    if (fout >= 20) {
        addAlert('P1', 'coupling', r.path, 1,
            `High fan-out (${fout}) — god object candidate`,
            { metric: `fan-out ${fout}`, effort: 'high', scoreUplift: 6,
              recommendations: ['Cluster dependents by domain and split into façades.',
                                'Apply Interface Segregation Principle.',
                                'Add module-boundary lint (dependency-cruiser).'] });
    }
    if (depth > 15) {
        addAlert('P0', 'depth', r.path, 1,
            `Max depth ${depth} — coupling chain exceeds 15 levels`,
            { metric: `depth ${depth}`, effort: 'medium', scoreUplift: 6,
              recommendations: ['Flatten by grouping intermediate layers into a façade.',
                                'Introduce interfaces at the boundary.',
                                'Cap max-depth in CI.'] });
    } else if (depth >= 8 && depth <= 15) {
        addAlert('P1', 'depth', r.path, 1,
            `Max depth ${depth} — deep coupling chain`,
            { metric: `depth ${depth}`, effort: 'medium', scoreUplift: 5,
              recommendations: ['Flatten by grouping intermediate layers into a façade.',
                                'Hoist shared utilities to a top-level lib/.'] });
    }
    if (score >= 5.0) {
        addAlert('P1', 'hotspot', r.path, 1,
            `Hotspot score ${score} — high size+coupling combo`,
            { metric: `hotspot ${score}`, effort: 'medium', scoreUplift: 5,
              recommendations: ['Split the file by responsibility.',
                                'Introduce a façade for callers.',
                                'Add a CODEOWNERS entry + PR-size guardrail.'] });
    }
    // Freshness
    const age = ageArr.find(a => a.path === r.path);
    if (age && age.ageDays >= 365) {
        addAlert('P1', 'freshness', r.path, null,
            `Stale file (${age.ageDays}d) — review or remove`,
            { metric: `${age.ageDays}d stale`, effort: 'low', scoreUplift: 4,
              recommendations: ['Run coverage + typecheck; if green, bump mtime.',
                                'Open an ADR proposing deletion vs. revival.',
                                'Verify no dynamic references via grep.'] });
    } else if (age && age.ageDays >= 180) {
        addAlert('P2', 'freshness', r.path, null,
            `Stale file (${age.ageDays}d) — review`,
            { metric: `${age.ageDays}d stale`, effort: 'low', scoreUplift: 3,
              recommendations: ['Run coverage + typecheck pass.',
                                'If no owner, open an ADR for deletion vs. revival.'] });
    }
}
// Cycle alerts
for (const c of cycles) {
    const firstFile = c.path.split(' → ')[0];
    addAlert('P0', 'cycle', firstFile, null,
        `Cycle detected (length ${c.length}): ${c.path.length > 100 ? c.path.slice(0, 100) + '…' : c.path}`,
        { metric: `cycle len ${c.length}`, effort: 'medium', scoreUplift: 6,
          cyclePath: c.path,
          recommendations: ['Extract shared dependency into a lower-level module.',
                            'Invert one edge via DI / event bus / callback registry.',
                            'For TS: use `import type` to split runtime vs type cycles.',
                            `Break the edge from ${firstFile} first — highest hotspot.`] });
}
// Orphan alerts (top 10 by size)
for (const o of orphans.slice(0, 10)) {
    addAlert('P2', 'orphan', o.path, null,
        `Orphan file: 0 inbound references (${o.lines} lines)`,
        { metric: '0 inbound refs', effort: 'low', scoreUplift: 3,
          recommendations: ['Grep for dynamic imports / reflection before deletion.',
                            'Check `git log -- ' + o.path + '` for prior authors.',
                            'Delete in a dedicated PR; `git revert` is cheap.',
                            'If kept as a script entry, exclude from scope via .ruiignore.'] });
}
alerts.sort((a, b) => severityRank(a.severity) - severityRank(b.severity) || a.file.localeCompare(b.file));
const truncated = alerts.length > 200;
const trimmedAlerts = truncated ? alerts.slice(0, 200) : alerts;

// ── Self-Improvement section (derived) ─────────────────────────────────────
const p0 = alerts.filter(a => a.severity === 'P0').length;
const p1 = alerts.filter(a => a.severity === 'P1').length;
const p2 = alerts.filter(a => a.severity === 'P2').length;
const score = clampScore(100 - p0 * 6 - p1 * 4 - p2 * 2);

const riskVectors = [
    { dimension: 'Depth',       score: clampScore(100 - depthStats.max * 5), weight: 0.15,
      p0: alerts.filter(a => a.category === 'depth' && a.severity === 'P0').length,
      p1: alerts.filter(a => a.category === 'depth' && a.severity === 'P1').length,
      p2: alerts.filter(a => a.category === 'depth' && a.severity === 'P2').length },
    { dimension: 'Size',        score: clampScore(100 - (types.reduce((s,t)=> s + (t.fileCount > 0 && t.totalLines / t.fileCount > 500 ? 5 : 0), 0))),
      weight: 0.20,
      p0: alerts.filter(a => a.category === 'bloat' && a.severity === 'P0').length,
      p1: alerts.filter(a => a.category === 'size' && a.severity === 'P1').length,
      p2: alerts.filter(a => a.category === 'size' && a.severity === 'P2').length },
    { dimension: 'Coupling',    score: clampScore(100 - cycles.length * 10 - (fanOutList[0]?.fanOut || 0) * 2), weight: 0.20,
      p0: alerts.filter(a => a.category === 'cycle' && a.severity === 'P0').length,
      p1: alerts.filter(a => a.category === 'coupling' && a.severity === 'P1').length,
      p2: alerts.filter(a => a.category === 'coupling' && a.severity === 'P2').length },
    { dimension: 'Duplication', score: 80, weight: 0.10, p0: 0, p1: 0, p2: 0 },
    { dimension: 'Complexity',  score: clampScore(100 - (hotspots[0]?.score || 0) * 8), weight: 0.15, p0: 0, p1: 0, p2: 0 },
    { dimension: 'Staleness',   score: clampScore(100 - freshnessStats.criticalCount * 5 - freshnessStats.staleCount * 2), weight: 0.20,
      p0: 0,
      p1: alerts.filter(a => a.category === 'freshness' && a.severity === 'P1').length,
      p2: alerts.filter(a => a.category === 'freshness' && a.severity === 'P2').length },
];

const levers = [];
let rank = 1;
const topHotspots = hotspots.slice(0, 5);
for (const h of topHotspots) {
    levers.push({
        rank: rank++, dimension: h.score >= 5 ? 'Coupling' : 'Size',
        severity: h.score >= 5 ? 'P1' : 'P2',
        kind: 'refactor',
        action: `Refactor ${h.path} (hotspot ${h.score}, ${h.lines} LOC, fan-out ${h.fanOut})`,
        file: h.path, line: 1,
        scoreUplift: Math.min(20, Math.round(h.score * 2)),
        effort: h.lines > 1000 ? 'high' : 'medium',
    });
}
for (const c of cycles.slice(0, 3)) {
    levers.push({
        rank: rank++, dimension: 'Coupling', severity: 'P0', kind: 'refactor',
        action: `Break cycle (len ${c.length}): ${c.path.length > 60 ? c.path.slice(0, 60) + '…' : c.path}`,
        file: c.path.split(' → ')[0], line: null,
        scoreUplift: 6, effort: 'medium',
    });
}
if (freshnessStats.staleCount > 0) {
    levers.push({
        rank: rank++, dimension: 'Staleness', severity: 'P1', kind: 'cleanup',
        action: `Review and archive ${freshnessStats.staleCount} stale files (180d+)`,
        file: freshness[0]?.path, line: null,
        scoreUplift: 8, effort: 'low',
    });
}

const narrative = [
    `Overall health at ${score}/100 — ${score >= 80 ? 'low' : score >= 60 ? 'moderate' : 'high'} risk.`,
    `${p0} critical (P0), ${p1} major (P1), ${p2} minor (P2) alerts active.`,
    `Top lever: ${levers[0]?.action || 'n/a'} (+${levers[0]?.scoreUplift || 0} pts).`,
    `Score ${score} | gap ${Math.max(0, 80 - score)} pts to next grade | decay risk without action: -2 pts/quarter`,
];

const selfImprovement = {
    topP0: alerts.filter(a => a.severity === 'P0').slice(0, 5).map(a => ({
        action: a.message, file: a.file, line: a.line, severity: 'P0',
    })),
    focusArea: {
        dimName: riskVectors.slice().sort((a, b) => a.score - b.score)[0]?.dimension || '—',
        score: Math.min(...riskVectors.map(v => v.score)),
        why: `Lowest-scoring risk dimension drives overall health drag.`,
        hint: `Invest 2-3 days addressing top alerts in this dimension. Expected uplift: +10-15 pts.`,
    },
    trendInsight: `Score ${score}/100 at generation. ${p0} P0 alerts require immediate attention.`,
    weightsHint: 'Weights follow methodology.md Stage 3.6. Coupling and Staleness carry 0.20 each.',
    narrative,
    severityDonut: { p0, p1, p2, total: p0 + p1 + p2 },
    riskVectors,
    levers: levers.slice(0, 8),
    benchmarks: {
        currentGrade: grade(score), currentValue: score,
        targetGrade: grade(Math.min(100, score + 20)), targetValue: Math.min(100, score + 20),
        gapToNext: Math.max(0, 80 - score),
    },
    remediationPlan: {
        phases: [
            { phase: 'P0 Critical', severity: 'P0', itemCount: p0, estUplift: p0 * 6, projected: score + p0 * 6, deadline: '7 days' },
            { phase: 'P1 Major',     severity: 'P1', itemCount: p1, estUplift: p1 * 4, projected: score + p0 * 6 + p1 * 4, deadline: '30 days' },
            { phase: 'P2 Minor',     severity: 'P2', itemCount: p2, estUplift: p2 * 2, projected: score + p0 * 6 + p1 * 4 + p2 * 2, deadline: '90 days' },
        ],
        currentScore: score,
        projectedScoreIfAllP0P1Remediated: clampScore(score + p0 * 6 + p1 * 4),
    },
    decayForecast: {
        currentScore: score,
        projectedNext: clampScore(score - 2),
        delta: -2,
        rationale: 'Without active remediation, coupling decay and staleness trend -2 pts/quarter on average.',
    },
};

// ── Summary block ───────────────────────────────────────────────────────────
const summary = {
    totalFiles,
    totalBytes,
    totalBytesHuman: humanBytes(totalBytes),
    totalLines,
    maxDepth: depthStats.max,
    criticalCount: p0,
    hotspotCount: hotspots.length,
    cycleCount: cycles.length,
    staleCount: freshnessStats.staleCount,
};

// ── Records (for Export JSON / CSV) ────────────────────────────────────────
const recordsOut = records.map(r => ({
    path: r.path,
    bytes: r.bytes,
    lines: r.lines,
    type: r.ext,
    fanIn: fanIn.get(r.absPath) || 0,
    fanOut: (adjacency.get(r.absPath) || new Set()).size,
    extDeps: externalDeps.get(r.absPath) || 0,
    maxDepth: maxDepthMap.get(r.absPath) || 0,
    lastModified: r.lastModified,
    ageDays: asOf ? Math.max(0, Math.floor((asOf - r.lastModified) / 86400)) : 0,
}));

const adjacencyOut = {};
for (const [abs, deps] of adjacency) {
    const r = absPathToRecord.get(abs);
    if (!r) continue;
    adjacencyOut[r.path] = [...deps].map(d => absPathToRecord.get(d)?.path || d);
}

// ── Compose REPORT_DATA ────────────────────────────────────────────────────
const REPORT_DATA = {
    scope,
    score,
    alerts: trimmedAlerts,
    summary,
    treemap,
    types,
    histogram,
    largest,
    fanin: fanInList,
    fanout: fanOutList,
    hotspots,
    orphans,
    depthStats,
    depthRanking,
    cycles,
    freshness,
    freshnessBuckets,
    freshnessStats,
    selfImprovement,
    records: recordsOut,
    adjacency: adjacencyOut,
};
if (truncated) REPORT_DATA.truncated = { alerts: true };

// ── Copy template assets ───────────────────────────────────────────────────
function copyFile(src, dst) {
    fs.copyFileSync(src, dst);
}
function copyDir(src, dst) {
    fs.mkdirSync(dst, { recursive: true });
    for (const e of fs.readdirSync(src, { withFileTypes: true })) {
        if (e.isDirectory()) copyDir(path.join(src, e.name), path.join(dst, e.name));
        else fs.copyFileSync(path.join(src, e.name), path.join(dst, e.name));
    }
}

// index.html — rewrite ../../YiPet/cdn/ paths to ../../../../YiPet/cdn/
let indexHtml = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf8');
indexHtml = indexHtml.replace(/\.\.\/\.\.\/YiPet\/cdn\//g, TO_ROOT + '/YiPet/cdn/');
fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

copyFile(path.join(TEMPLATES_DIR, 'index.css'), path.join(outDir, 'index.css'));
copyFile(path.join(TEMPLATES_DIR, 'index.js'), path.join(outDir, 'index.js'));
copyDir(path.join(TEMPLATES_DIR, 'app'), path.join(outDir, 'app'));

// ── Compose data.js ────────────────────────────────────────────────────────
// Load the template data.js to reuse REPORT_CONFIG (static labels) and the
// trailing IIFE that post-processes alerts (byCategory + risk enrichment).
const templateDataJs = fs.readFileSync(path.join(TEMPLATES_DIR, 'data.js'), 'utf8');
const dataAnchor = templateDataJs.indexOf('window.REPORT_DATA = {');
const configBlock = templateDataJs.slice(0, dataAnchor);

// Trailing helper: from the first `(function () {` AFTER the REPORT_DATA
// assignment to end-of-file. This is the byCategory alert-enrichment IIFE.
const afterData = templateDataJs.slice(dataAnchor);
const helperStart = afterData.indexOf('(function () {');
const helperBlock = helperStart >= 0 ? afterData.slice(helperStart) : '';

const generatedAt = new Date().toISOString();
const dataJs =
    configBlock.replace(/generatedAt:\s*null/, `generatedAt: ${JSON.stringify(generatedAt)}`) +
    '\nwindow.REPORT_DATA = ' + JSON.stringify(REPORT_DATA, null, 2) + ';\n' +
    '\n/* Alert-enrichment IIFE preserved from template. */\n' +
    helperBlock;

fs.writeFileSync(path.join(outDir, 'data.js'), dataJs);

// ── Helpers ────────────────────────────────────────────────────────────────
function humanBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / (1024 * 1024)).toFixed(1) + ' MB';
}
function pct(num, denom) {
    if (!denom) return 0;
    return Math.round((num / denom) * 1000) / 10;
}
function round2(n) { return Math.round(n * 100) / 100; }
function median(arr) {
    if (!arr.length) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 ? arr[mid] : Math.round((arr[mid - 1] + arr[mid]) / 2);
}
function percentileNearestRank(arr, p) {
    if (!arr.length) return 0;
    const rank = Math.ceil(p * arr.length);
    return arr[Math.min(rank - 1, arr.length - 1)];
}
function unixToISO(secs) {
    if (!secs) return '';
    return new Date(secs * 1000).toISOString().slice(0, 10);
}
function severityRank(s) { return s === 'P0' ? 0 : s === 'P1' ? 1 : 2; }
function clampScore(n) { return Math.max(0, Math.min(100, Math.round(n))); }
function grade(s) {
    if (s >= 90) return 'A';
    if (s >= 80) return 'B';
    if (s >= 70) return 'C';
    if (s >= 60) return 'D';
    return 'F';
}

console.log(`[yry-report-files] wrote ${outDir}`);
console.log(`  files: ${totalFiles}  bytes: ${humanBytes(totalBytes)}  lines: ${totalLines}`);
console.log(`  alerts: ${p0} P0 / ${p1} P1 / ${p2} P2  ·  cycles: ${cycles.length}  ·  score: ${score}`);
