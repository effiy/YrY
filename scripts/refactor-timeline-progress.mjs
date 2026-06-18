#!/usr/bin/env node
/**
 * Batch refactor: Timeline Progress IIFE → YrY.initTimelineProgress()
 * Usage: node cdn/js/refactor-timeline-progress.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

// Hash of the main cluster Timeline Progress IIFE (28 files)
const MAIN_HASH = '39ed245944b99d317eff807dedb1adce';

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set([
    ...globSync(resolve(root, 'docs/故事任务面板/*/场景-*/演示.html')),
    ...globSync(resolve(root, 'cdn/故事任务面板/cdn/场景-*/演示.html')),
  ])
];

console.log(`演示.html files: ${files.length} total\n`);

let rep = 0, totalB = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');

  // Find the IIFE start
  const iifeStart = raw.indexOf('(function(){var completed={};try{var raw=localStorage.getItem');
  if (iifeStart === -1) {
    console.log(`  ✗ ${relative(root, f)} — Timeline Progress IIFE not found`);
    continue;
  }

  // Find the end
  const iifeEnd = raw.indexOf('})();', iifeStart);
  if (iifeEnd === -1) {
    console.log(`  ✗ ${relative(root, f)} — IIFE end not found`);
    continue;
  }
  const end = iifeEnd + 5;

  const block = raw.slice(iifeStart, end);
  const hash = createHash('md5').update(block).digest('hex');

  if (hash !== MAIN_HASH) {
    console.log(`  - ${relative(root, f)} — different variant (${hash.substring(0, 8)})`);
    continue;
  }

  // Absorb preceding newline + comment
  let start = iifeStart;
  // Check for comment /* ─── Timeline Progress ─── */
  const before = raw.slice(Math.max(0, start - 60), start);
  const commentMatch = before.match(/\/\* ─── Timeline Progress ─── \*\/\s*$/);
  if (commentMatch) {
    start -= commentMatch[0].length;
  }
  while (start > 0 && raw[start - 1] === '\n') start--;

  // Absorb trailing newline
  let actualEnd = end;
  while (actualEnd < raw.length && raw[actualEnd] === '\n') actualEnd++;

  // Find shared.js to place the call after it
  const sharedSearch = raw.indexOf('shared.js', actualEnd);
  if (sharedSearch === -1) {
    console.log(`  ✗ ${relative(root, f)} — shared.js not found`);
    continue;
  }
  const sharedTagEnd = raw.indexOf('</script>', sharedSearch) + '</script>'.length;

  const rawBefore = raw.slice(0, start);
  const rawAfter = raw.slice(actualEnd);
  const afterBeforeShared = rawAfter.slice(0, sharedTagEnd);
  const afterAfterShared = rawAfter.slice(sharedTagEnd);

  const newCall = '\n<script>YrY.initTimelineProgress()</script>';
  const newRaw = rawBefore + afterBeforeShared + newCall + afterAfterShared;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  totalB += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${totalB}B saved (~${Math.round(totalB / 1024)}KB)`);
