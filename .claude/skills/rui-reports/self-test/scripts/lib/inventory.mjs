import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const EXCLUDE_DIRS = [
    'node_modules', '.git', 'dist', 'build', '.next', '.turbo',
    'coverage', '.memory', '.claude', 'target', 'intermediate',
];

export const EXCLUDE_FILES = ['.DS_Store'];

function typeOf(file) {
    if (file.endsWith('.d.ts')) return 'ts';
    const ext = path.extname(file).toLowerCase();
    return ext.replace(/^\./, '') || 'other';
}

export function walkScope(absScope) {
    let filePaths = [];
    const findArgs = [absScope, '-type', 'f'];
    for (const dirName of EXCLUDE_DIRS) {
        findArgs.push('-not', '-path', `*/${dirName}/*`);
    }
    for (const fileName of EXCLUDE_FILES) {
        findArgs.push('-not', '-name', fileName);
    }
    findArgs.push('-print0');

    const out = execFileSync('find', findArgs, { maxBuffer: 256 * 1024 * 1024 });
    filePaths = out.toString('utf8').split('\0').filter(Boolean);

    const statMap = new Map();
    for (const filePath of filePaths) {
        try {
            const stat = fs.statSync(filePath);
            statMap.set(filePath, {
                bytes: stat.size,
                mtime: Math.floor(stat.mtimeMs / 1000),
            });
        } catch {
            // Ignore files that disappear during the walk.
        }
    }

    const records = [];
    for (const absPath of filePaths) {
        const stat = statMap.get(absPath);
        if (!stat) continue;
        const relPath = path.relative(absScope, absPath).split(path.sep).join('/');
        records.push({
            path: relPath,
            absPath,
            bytes: stat.bytes,
            type: typeOf(absPath),
            lastModified: stat.mtime,
        });
    }

    records.sort((a, b) => a.path.localeCompare(b.path));
    return { filePaths, records };
}

export function computeInventoryBreakdown(records) {
    const TYPE_GROUPS = {
        JavaScript: ['js', 'mjs', 'cjs', 'jsx'],
        TypeScript: ['ts', 'tsx'],
        Vue: ['vue'],
        Python: ['py'],
        Go: ['go'],
        Rust: ['rs'],
        Java: ['java'],
        'CSS/SCSS': ['css', 'scss', 'less'],
        HTML: ['html', 'htm'],
        Markdown: ['md', 'mdx'],
        JSON: ['json'],
        YAML: ['yaml', 'yml'],
        Config: ['toml', 'ini', 'env'],
        Shell: ['sh', 'bash', 'zsh'],
        Image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'],
    };

    const groupCounts = {};
    const groupBytes = {};
    const extToGroup = {};

    for (const [group, exts] of Object.entries(TYPE_GROUPS)) {
        for (const ext of exts) extToGroup[ext] = group;
    }

    for (const record of records) {
        const group = extToGroup[record.type] || 'Other';
        groupCounts[group] = (groupCounts[group] || 0) + 1;
        groupBytes[group] = (groupBytes[group] || 0) + record.bytes;
    }

    const total = records.length;
    const items = Object.entries(groupCounts)
        .map(([group, count]) => ({
            group,
            count,
            bytes: groupBytes[group] || 0,
            pct: total > 0 ? +((count / total) * 100).toFixed(1) : 0,
        }))
        .sort((a, b) => b.count - a.count);

    return {
        totalFiles: total,
        totalBytes: records.reduce((sum, record) => sum + record.bytes, 0),
        typeGroups: TYPE_GROUPS,
        items: items.slice(0, 8),
    };
}
