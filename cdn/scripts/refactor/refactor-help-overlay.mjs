#!/usr/bin/env node
/**
 * Batch refactor: help overlay HTML → YrY.renderHelpOverlay()
 * Usage: node cdn/js/refactor-help-overlay.mjs [--dry-run]
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

  // Find the fab-help button
  const fabIdx = raw.indexOf('<button class="fab-help"');
  if (fabIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — fab-help not found`);
    continue;
  }

  // Find the help-overlay opening
  const overlayIdx = raw.indexOf('class="help-overlay"', fabIdx);
  if (overlayIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — help-overlay not found`);
    continue;
  }

  // Track to the end of the help-overlay div
  // Find the outer div that has class="help-overlay"
  const divStart = raw.lastIndexOf('<div', overlayIdx);
  let depth = 1;
  let i = divStart + 4; // skip "<div" to look for >
  // Find end of opening tag
  while (i < raw.length && raw[i] !== '>') i++;
  i++; // skip >
  // Now track nested divs
  while (i < raw.length && depth > 0) {
    // Look for <div or </div
    if (raw.slice(i, i + 5) === '<div ') { depth++; i += 5; }
    else if (raw.slice(i, i + 5) === '<div>') { depth++; i += 5; }
    else if (raw.slice(i, i + 6) === '</div>') { depth--; if (depth === 0) { i += 6; break; } else { i += 6; } }
    else { i++; }
  }
  const overlayEnd = i;

  // Include preceding newlines, comment, and the fab button line
  let start = fabIdx;
  // Absorb preceding blank lines
  while (start > 0 && raw[start - 1] === '\n') start--;
  // Absorb another blank line if present (before comment)
  if (start > 0 && raw[start - 1] === '\n') start--;

  // Check if there's a comment line <!-- Help overlay --> before the overlay
  const commentSearch = raw.lastIndexOf('<!-- Help overlay -->', overlayIdx);
  if (commentSearch !== -1 && commentSearch > start - 200) {
    // The comment is before the overlay div, adjust start if needed
    if (commentSearch < start) start = commentSearch;
    if (start > 0 && raw[start - 1] === '\n') start--;
  }

  // Consume trailing newlines after overlay end
  let end = overlayEnd;
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

  const newCall = '\n<script>YrY.renderHelpOverlay()</script>';
  const newRaw = before + afterBefore + newCall + afterAfter;
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
