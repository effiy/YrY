/**
 * rui-report-files · analyze utilities
 * ----------------------------------------------------------------------
 * Pure helpers shared by the analyzer pipeline. No I/O, no side effects,
 * no module-level state. Importing this file is free.
 */

import path from 'node:path';

/* ── Exclusion globs (rules/analysis-contracts.md) ────────────────────
   Single source of truth: derived into both the find(1) CLI args and
   the in-memory isExcluded() filter.

   Override via env vars (comma-separated, REPLACE the default):
     RUI_EXCLUDE_DIRS   — e.g. RUI_EXCLUDE_DIRS="node_modules,.git,dist"
                          Useful when the scope itself lives under an
                          excluded segment (e.g. analyzing .claude/...).
     RUI_EXCLUDE_FILES  — e.g. RUI_EXCLUDE_FILES=".DS_Store"            */
export const DEFAULT_EXCLUDE_DIRS = [
    'node_modules', '.git', 'dist', 'build', '.next', '.turbo',
    'coverage', '.memory', '.claude', 'target', 'intermediate',
];
export const DEFAULT_EXCLUDE_FILES = ['.DS_Store'];

function parseListEnv(name) {
    const raw = process.env[name];
    if (raw === undefined) return null;
    return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export function resolveExcludes() {
    const dirs = parseListEnv('RUI_EXCLUDE_DIRS') || DEFAULT_EXCLUDE_DIRS;
    const files = parseListEnv('RUI_EXCLUDE_FILES') || DEFAULT_EXCLUDE_FILES;
    return {
        dirs,
        files,
        globs: [
            ...dirs.map(d => `**/${d}/**`),
            ...files.map(f => `**/${f}`),
        ],
    };
}

export function matchGlob(glob, str) {
    // Convert **/x/** to regex
    let re = glob
        .replace(/[.+^${}()|[\]\\]/g, '\\$&')
        .replace(/\*\*/g, '::DOUBLESTAR::')
        .replace(/\*/g, '[^/]*')
        .replace(/::DOUBLESTAR::/g, '.*');
    re = '^' + re + '$';
    return new RegExp(re).test(str);
}

export function isExcluded(relPath, globs) {
    const p = relPath.split(path.sep).join('/');
    for (const g of globs) {
        if (matchGlob(g, p)) return true;
    }
    return false;
}

/* ── Type mapping (Stage 1) ─────────────────────────────────────────── */
export const EXT_TO_TYPE = {
    '.js': 'js', '.mjs': 'mjs', '.cjs': 'cjs', '.jsx': 'jsx',
    '.ts': 'ts', '.tsx': 'tsx',
    '.vue': 'vue', '.py': 'py', '.go': 'go', '.java': 'java',
    '.rs': 'rust', '.css': 'css', '.scss': 'scss',
};

export function typeOf(file) {
    if (file.endsWith('.d.ts')) return 'ts';
    const ext = path.extname(file).toLowerCase();
    return EXT_TO_TYPE[ext] || 'other';
}

/* ── Human-readable sizes ───────────────────────────────────────────── */
export function humanBytes(n) {
    if (n < 1024) return `${n} B`;
    if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
    if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
    return `${(n / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

/* ── Numeric summaries (Stage 4 + Stage 5.5) ────────────────────────── */
export function pct(arr, p) {
    if (arr.length === 0) return 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const rank = Math.max(0, Math.ceil(p / 100 * sorted.length) - 1);
    return sorted[rank];
}

export function mean(arr) {
    if (arr.length === 0) return 0;
    return +(arr.reduce((s, x) => s + x, 0) / arr.length).toFixed(2);
}

export function median(arr) {
    if (arr.length === 0) return 0;
    const sorted = arr.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

/* ── Score helpers (Stage "Score") ─────────────────────────────────── */
export function rate(count, budget) {
    return 100 * (1 - Math.min(1, count / budget));
}

export function gradeOf(v) {
    if (v >= 90) return 'A';
    if (v >= 75) return 'B';
    if (v >= 60) return 'C';
    if (v >= 40) return 'D';
    return 'F';
}
