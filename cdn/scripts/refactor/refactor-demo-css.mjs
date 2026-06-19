#!/usr/bin/env node
/**
 * Batch refactor: demo inline style → <link> to yry-demo.css
 * Usage: node cdn/js/refactor-demo-css.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

// Hash of the main cluster style (27 files)
const MAIN_HASH = 'b607065a26cea951394b94e534f654a0';

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

  const si = raw.indexOf('<style>');
  if (si === -1) {
    console.log(`  ✗ ${relative(root, f)} — no <style> found`);
    continue;
  }
  const ei = raw.indexOf('</style>');
  if (ei === -1 || ei <= si) {
    console.log(`  ✗ ${relative(root, f)} — no </style> found`);
    continue;
  }

  const end = ei + '</style>'.length;
  const block = raw.slice(si, end);
  const hash = createHash('md5').update(block).digest('hex');

  if (hash !== MAIN_HASH) {
    console.log(`  - ${relative(root, f)} — different variant (${hash.substring(0, 8)})`);
    continue;
  }

  const cssPath = relative(dirname(f), resolve(root, 'cdn', 'yry-demo.css'));

  // Absorb trailing newline
  let actualEnd = end;
  if (actualEnd < raw.length && raw[actualEnd] === '\n') actualEnd++;

  const newRaw = raw.slice(0, si) +
    '<link rel="stylesheet" href="' + cssPath + '">' +
    raw.slice(actualEnd);
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
