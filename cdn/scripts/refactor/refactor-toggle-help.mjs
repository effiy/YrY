#!/usr/bin/env node
/**
 * Batch refactor: remove inline window.toggleHelp (moved to shared.js)
 * Usage: node cdn/js/refactor-toggle-help.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

const TOGGLE_HELP = "window.toggleHelp=function(){var h=document.getElementById('helpOverlay');if(h)h.classList.toggle('show')};";

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set([
    ...globSync(resolve(root, 'docs/故事任务面板/*/场景-*/演示.html')),
    ...globSync(resolve(root, 'cdn/故事任务面板/cdn/场景-*/演示.html')),
  ])
];

console.log(`演示.html files: ${files.length} total\n`);

let rep = 0, total = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');
  const idx = raw.indexOf(TOGGLE_HELP);
  if (idx === -1) {
    console.log(`  ✗ ${relative(root, f)} — toggleHelp not found`);
    continue;
  }

  // Remove the toggleHelp line and surrounding newlines
  let start = idx;
  let end = idx + TOGGLE_HELP.length;

  // Absorb preceding newline
  if (start > 0 && raw[start - 1] === '\n') start--;
  // Absorb trailing newline (the line break after the statement)
  if (end < raw.length && raw[end] === '\n') end++;

  const newRaw = raw.slice(0, start) + raw.slice(end);
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, f)} (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  rep++;
  total += saved;
}

console.log(`\n${rep}/${files.length} replaced, ${total}B saved (~${Math.round(total / 1024)}KB)`);
