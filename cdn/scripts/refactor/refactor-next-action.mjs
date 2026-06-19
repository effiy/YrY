#!/usr/bin/env node
/**
 * Batch refactor: Next-Action Callout IIFE → YrY.initNextAction()
 * Usage: node cdn/js/refactor-next-action.mjs [--dry-run]
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

  // Find the IIFE start
  const iifeIdx = raw.indexOf('(function(){var stepIdx=0;var steps=[');
  if (iifeIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — Next-Action IIFE not found`);
    continue;
  }

  // Find where the steps array ends: ];window.goNextStep=
  const stepsEnd = raw.indexOf('];window.goNextStep=', iifeIdx);
  if (stepsEnd === -1) {
    console.log(`  ✗ ${relative(root, f)} — steps array end not found`);
    continue;
  }
  const stepsArray = raw.slice(iifeIdx + '(function(){var stepIdx=0;var steps='.length, stepsEnd + 1);

  // Find the end: the IIFE closes with })(); after jumpStep function
  // jumpStep has a unique pattern: setTimeout(function(){step.style.background=''},1500)
  // after that comes: }}})();
  // Find jumpStep first
  const jumpIdx = raw.indexOf('window.jumpStep=function(n){', stepsEnd);
  if (jumpIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — jumpStep not found`);
    continue;
  }

  // Find })(); that closes the IIFE — it comes after the jumpStep function end
  // The IIFE structure is: (function(){...})();
  // Find the last })(); after jumpIdx
  const endPattern = '})();';
  const iifeEnd = raw.indexOf(endPattern, jumpIdx);
  if (iifeEnd === -1) {
    console.log(`  ✗ ${relative(root, f)} — IIFE end not found`);
    continue;
  }
  let end = iifeEnd + endPattern.length;

  // Check that this is really the IIFE closing (next char should be \n or end)
  // If there's a comment after, absorb the newline

  // Absorb preceding comment: /* ─── Next-Action Callout ─── */
  let start = iifeIdx;
  // Search backwards for the comment
  const beforeIife = raw.slice(Math.max(0, start - 60), start);
  const commentMatch = beforeIife.match(/\/\* ─── Next-Action Callout ─── \*\/\s*$/);
  if (commentMatch) {
    start -= commentMatch[0].length;
  }
  // Absorb preceding newlines
  while (start > 0 && raw[start - 1] === '\n') start--;

  // Consume trailing newlines
  while (end < raw.length && raw[end] === '\n') end++;

  // Find shared.js to place the call after it
  const sharedSearch = raw.indexOf('shared.js', end);
  if (sharedSearch === -1) {
    console.log(`  ✗ ${relative(root, f)} — shared.js not found`);
    continue;
  }
  const sharedTagEnd = raw.indexOf('</script>', sharedSearch) + '</script>'.length;

  const before = raw.slice(0, start);
  const after = raw.slice(end);
  const afterBefore = after.slice(0, sharedTagEnd);
  const afterAfter = after.slice(sharedTagEnd);

  const newCall = '\n<script>YrY.initNextAction(' + stepsArray + ')</script>';
  const newRaw = before + afterBefore + newCall + afterAfter;
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    const stepCount = (stepsArray.match(/\{t:'/g) || []).length;
    console.log(`[DRY-RUN] ${relative(root, f)} steps=${stepCount} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  totalB += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${totalB}B saved (~${Math.round(totalB / 1024)}KB)`);
