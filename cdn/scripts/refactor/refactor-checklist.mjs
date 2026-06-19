#!/usr/bin/env node
/**
 * Batch refactor: initChecklist IIFE → YrY.initChecklist()
 * Replaces the inline checklist IIFE with a deferred call after shared.js.
 *
 * Usage: node cdn/js/refactor-checklist.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

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

  // Find initChecklist IIFE
  const iifeIdx = raw.indexOf('(function initChecklist(){');
  if (iifeIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — initChecklist not found`);
    continue;
  }

  // Find end: })(); — find closing after initChecklist
  let depth = 1;
  let i = raw.indexOf('{', iifeIdx) + 1;
  while (i < raw.length && depth > 0) {
    if (raw[i] === '{') depth++;
    else if (raw[i] === '}') depth--;
    i++;
  }
  // Now at position after the final }
  const iifeEnd = i; // position after the IIFE's closing }
  // Check for the call parens: )()
  let end = i;
  if (raw[end] === ')') end++;
  if (raw[end] === '(') end++;
  if (raw[end] === ')') end++;
  if (raw[end] === ';') end++;

  const iifeBody = raw.slice(iifeIdx, end);

  // Extract CK_KEY
  const keyM = iifeBody.match(/var CK_KEY='([^']+)'/);
  if (!keyM) {
    console.log(`  ✗ ${relative(root, f)} — CK_KEY not found`);
    continue;
  }

  // Extract export title: lines=['# 新人上手任务清单进度',...
  const titleM = iifeBody.match(/lines=\['# ([^']+)'/);
  const exportTitle = titleM ? titleM[1] : '任务清单进度';

  // Remove the IIFE from main block
  // Find shared.js to place the call after it
  const sharedSearch = raw.indexOf('shared.js', end);
  if (sharedSearch === -1) {
    console.log(`  ✗ ${relative(root, f)} — shared.js not found`);
    continue;
  }
  const sharedTagEnd = raw.indexOf('</script>', sharedSearch) + '</script>'.length;

  // Absorb preceding newline and blank line
  let start = iifeIdx;
  if (start > 0 && raw[start - 1] === '\n') {
    start--;
    // Also absorb blank line if present
    if (start > 0 && raw[start - 1] === '\n') start--;
  }

  // Consume trailing newlines
  while (end < raw.length && raw[end] === '\n') end++;

  const before = raw.slice(0, start);
  const after = raw.slice(end);
  const afterBefore = after.slice(0, sharedTagEnd);
  const afterAfter = after.slice(sharedTagEnd);

  const escTitle = exportTitle.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const newCall = '\n<script>YrY.initChecklist({storageKey:\'' + keyM[1] + '\',exportTitle:\'' + escTitle + '\'})</script>';
  const newRaw = before + afterBefore + newCall + afterAfter;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} key=${keyM[1]} title="${exportTitle.substring(0,20)}" (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  totalB += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${totalB}B saved (~${Math.round(totalB / 1024)}KB)`);
