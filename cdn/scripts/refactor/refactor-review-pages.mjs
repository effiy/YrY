#!/usr/bin/env node
/** Batch refactor 审查.html: replace inline <style> with <link> to yry-review-base.css */
import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

const STYLE_START = '<style>\n:root{\n';

function findFiles() {
  const files = [];
  for (const p of ['docs/故事任务面板/**/审查.html', 'cdn/故事任务面板/**/审查.html']) {
    files.push(...globSync(resolve(root, p)));
  }
  return files;
}

function refactorFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const startIdx = raw.indexOf(STYLE_START);
  if (startIdx === -1) return { file: filePath, replaced: false, reason: 'no match' };
  const endIdx = raw.indexOf('</style>', startIdx);
  if (endIdx === -1) return { file: filePath, replaced: false, reason: 'no </style>' };

  const cssPath = relative(dirname(filePath), resolve(root, 'cdn/yry-review/index.css'));
  const before = raw.slice(0, startIdx);
  const after = raw.slice(endIdx + '</style>'.length);
  const newRaw = before + `<link rel="stylesheet" href="${cssPath}">` + after;

  if (DRY_RUN) { console.log(`[DRY-RUN] ${relative(root, filePath)} (${raw.length - newRaw.length}B)`); return { file: filePath, replaced: true, saved: raw.length - newRaw.length }; }
  writeFileSync(filePath, newRaw, 'utf-8');
  return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
}

const files = findFiles();
console.log(`Found ${files.length} 审查.html files`);
if (DRY_RUN) console.log('[DRY-RUN]\n');

let total = 0, rep = 0;
for (const f of files) {
  const r = refactorFile(f);
  if (r.replaced) { rep++; total += r.saved; }
  else console.log(`  ✗ ${relative(root, r.file)} — ${r.reason}`);
}
console.log(`\nReplaced: ${rep}/${files.length}, ${total}B saved (~${Math.round(total / Math.max(1, rep))}B/file)`);
