#!/usr/bin/env node
/** Batch refactor 架构图.html (105-line main variant only) → yry-arch-base.css */
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');
const CSS_FILE = 'yry-arch-base.css';

function firstStyleLen(raw) {
  const s = raw.indexOf('<style>');
  if (s === -1) return 0;
  const e = raw.indexOf('</style>', s);
  if (e === -1) return 0;
  return e - s - '<style>'.length;
}

const archFiles = globSync(resolve(root, 'docs/故事任务面板/**/架构图.html')).map(f => {
  const raw = readFileSync(f, 'utf-8');
  return { path: f, raw, len: firstStyleLen(raw) };
});

// Only refactor files where first style block matches main variant (10978 ± 100 bytes)
const TARGET = 10978;
const candidates = archFiles.filter(f => Math.abs(f.len - TARGET) < 100);

console.log(`架构图.html: ${archFiles.length} total, ${candidates.length} match 105-line variant`);

let total = 0, rep = 0;
for (const { path, raw } of candidates) {
  const sIdx = raw.indexOf('<style>');
  const eIdx = raw.indexOf('</style>', sIdx);
  const cssPath = relative(dirname(path), resolve(root, 'cdn', CSS_FILE));
  const before = raw.slice(0, sIdx);
  const after = raw.slice(eIdx + '</style>'.length);
  const newRaw = before + `<link rel="stylesheet" href="${cssPath}">` + after;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) { console.log(`[DRY-RUN] ${relative(root, path)} (${saved}B)`); rep++; total += saved; }
  else { writeFileSync(path, newRaw, 'utf-8'); rep++; total += saved; }
}

console.log(`${rep} replaced, ${total}B saved`);
if (candidates.length < archFiles.length) {
  console.log('Skipped (different variant):');
  archFiles.filter(f => Math.abs(f.len - TARGET) >= 100)
    .forEach(f => console.log(`  ${relative(root, f.path)} (block: ${f.len}B)`));
}
