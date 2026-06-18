#!/usr/bin/env node
/**
 * Batch refactor: 审查 inline script → yry-review.js
 * Usage: node cdn/js/refactor-review.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const MAIN_HASH = '3e1c405e9ee6a1d084ae2b73625ced09';

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set(globSync(resolve(root, 'docs/故事任务面板/*/场景-*/审查.html')))
];

console.log(`审查.html files: ${files.length} total\n`);

const SEARCH = `document.querySelector('.tabs')`;

let rep = 0, totalB = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');

  const fnIdx = raw.indexOf(SEARCH);
  if (fnIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — tab script not found`);
    continue;
  }

  const scriptStart = raw.lastIndexOf('<script>', fnIdx);
  if (scriptStart === -1) continue;
  const scriptEnd = raw.indexOf('</script>', scriptStart) + '</script>'.length;
  const code = raw.slice(scriptStart + '<script>'.length, scriptEnd - '</script>'.length);
  const hash = createHash('md5').update(code).digest('hex');

  if (hash !== MAIN_HASH) {
    console.log(`  - ${relative(root, f)} — different variant (${hash.substring(0, 8)})`);
    continue;
  }

  const jsPath = relative(dirname(f), resolve(root, 'cdn', 'yry-review.js'));

  let end = scriptEnd;
  if (end < raw.length && raw[end] === '\n') end++;

  const newRaw = raw.slice(0, scriptStart) +
    '<script src="' + jsPath + '"></script>\n' +
    raw.slice(end);
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
