#!/usr/bin/env node
/**
 * Batch refactor: test panel inline JS → yry-test/index.js
 * Usage: node cdn/js/refactor-test-panel.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

// Hash of the main cluster JS (28 files)
const MAIN_HASH = 'd74b3eb27555cd4ecffe863798041e15';
// Hash of the CDN variant JS (5 files)
const CDN_HASH = '3442bd9f6cbfce99a44975380274cd19';

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set([
    ...globSync(resolve(root, 'docs/故事任务面板/*/场景-*/测试面板.html')),
    ...globSync(resolve(root, 'cdn/故事任务面板/cdn/场景-*/测试面板.html')),
    ...globSync(resolve(root, 'cdn/故事任务面板/yry-breadcrumb/场景-*/测试面板.html')),
  ])
];

console.log(`测试面板.html files: ${files.length} total\n`);

function getJsBlock(raw) {
  const si = raw.indexOf('<script>');
  if (si === -1) return null;
  const se = raw.lastIndexOf('</script>');
  if (se === -1 || se <= si) return null;
  return { start: si, end: se + '</script>'.length, content: raw.slice(si, se + '</script>'.length) };
}

let repMain = 0, repCdn = 0, totalB = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');
  const block = getJsBlock(raw);
  if (!block) {
    console.log(`  ✗ ${relative(root, f)} — no inline script found`);
    continue;
  }

  const hash = createHash('md5').update(block.content).digest('hex');

  if (hash !== MAIN_HASH && hash !== CDN_HASH) {
    console.log(`  - ${relative(root, f)} — different variant (${hash.substring(0, 8)})`);
    continue;
  }

  const srcPath = relative(dirname(f), resolve(root, 'cdn', 'yry-test/index.js'));

  // Remove the inline script block
  let start = block.start;
  // Absorb newlines around the script tag
  if (start > 0 && raw[start - 1] === '\n') start--;
  let end = block.end;
  if (end < raw.length && raw[end] === '\n') end++;

  const newRaw = raw.slice(0, start) +
    '<script src="' + srcPath + '"></script>\n' +
    raw.slice(end);
  const saved = raw.length - newRaw.length;

  if (DRY_RUN) {
    const label = hash === MAIN_HASH ? 'main' : 'cdn';
    console.log(`[DRY-RUN] ${relative(root, f)} [${label}] (${saved}B)`);
  } else {
    writeFileSync(f, newRaw, 'utf-8');
  }
  if (hash === MAIN_HASH) repMain++; else repCdn++;
  totalB += saved;
}

console.log(`\nMain cluster: ${repMain}, CDN variant: ${repCdn}`);
console.log(`Total: ${repMain + repCdn} replaced, ${totalB}B saved (~${Math.round(totalB / 1024)}KB)`);
