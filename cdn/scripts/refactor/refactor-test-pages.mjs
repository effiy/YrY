#!/usr/bin/env node
/**
 * Batch refactor 測試面板.html: replace entire inline <style> block
 * with <link> to cdn/yry-test/index.css (block is identical across all files).
 *
 * Usage: node cdn/js/refactor-test-pages.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

/** Unique marker at start of common test base */
const STYLE_START = '<style>\n:root{';

function findTestFiles() {
  const files = [];
  for (const p of ['docs/故事任务面板/**/测试面板.html', 'cdn/故事任务面板/**/测试面板.html']) {
    files.push(...globSync(resolve(root, p)));
  }
  return files;
}

function refactorFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');

  const startIdx = raw.indexOf(STYLE_START);
  if (startIdx === -1) return { file: filePath, replaced: false, reason: 'no <style> with :root{' };

  const endIdx = raw.indexOf('</style>', startIdx);
  if (endIdx === -1) return { file: filePath, replaced: false, reason: 'no </style>' };

  const cssPath = relative(dirname(filePath), resolve(root, 'cdn/yry-test/index.css'));
  const before = raw.slice(0, startIdx);
  const after = raw.slice(endIdx + '</style>'.length);
  const newRaw = before + `<link rel="stylesheet" href="${cssPath}">` + after;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, filePath)} (saved ${raw.length - newRaw.length}B)`);
    return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
  }

  writeFileSync(filePath, newRaw, 'utf-8');
  return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
}

const files = findTestFiles();
console.log(`Found ${files.length} 測試面板.html files`);
if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

let totalSaved = 0;
let replaced = 0;
for (const f of files) {
  const r = refactorFile(f);
  if (r.replaced) { replaced++; totalSaved += r.saved; }
  else console.log(`  ✗ ${relative(root, r.file)} — ${r.reason}`);
}

console.log(`\nReplaced: ${replaced}/${files.length}, ${totalSaved}B saved (~${Math.round(totalSaved / files.length)}B/file)`);
