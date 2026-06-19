#!/usr/bin/env node
/**
 * Batch refactor: 计划清单 inline script → yry-plan-checklist.js
 * Usage: node cdn/js/refactor-plan-checklist.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

const MAIN_HASH = '4ac419b6a0e017c8d311a1f1fdb63598';

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set(globSync(resolve(root, 'docs/故事任务面板/*/场景-*/计划清单.html')))
];

console.log(`计划清单.html files: ${files.length} total\n`);

let rep = 0, totalB = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');

  // Find the script block with SCENE_KEY
  const si = raw.indexOf('const SCENE_KEY');
  if (si === -1) {
    // Try alternative: script block before shared.js
    const sharedIdx = raw.indexOf('shared.js');
    if (sharedIdx === -1) {
      console.log(`  ✗ ${relative(root, f)} — SCENE_KEY and shared.js not found`);
      continue;
    }
    // Find inline script before shared.js
    const beforeShared = raw.lastIndexOf('<script>', sharedIdx);
    if (beforeShared === -1) continue;
    const scriptStart = beforeShared;
    const scriptEnd = raw.indexOf('</script>', scriptStart) + '</script>'.length;
    const block = raw.slice(scriptStart, scriptEnd);
    const hash = createHash('md5').update(raw.slice(scriptStart + '<script>'.length, scriptEnd - '</script>'.length)).digest('hex');
    if (hash !== MAIN_HASH) {
      console.log(`  - ${relative(root, f)} — different variant (${hash.substring(0, 8)})`);
      continue;
    }
    // Fall through to replacement logic
    // Actually redirect to clean handling
  }

  const keyIdx = raw.indexOf('const SCENE_KEY');
  if (keyIdx === -1) continue;

  // Find the enclosing <script> tag
  let scriptStart = raw.lastIndexOf('<script>', keyIdx);
  if (scriptStart === -1) continue;
  const scriptEnd = raw.indexOf('</script>', scriptStart) + '</script>'.length;

  const code = raw.slice(scriptStart + '<script>'.length, scriptEnd - '</script>'.length);
  const hash = createHash('md5').update(code).digest('hex');

  if (hash !== MAIN_HASH) {
    console.log(`  - ${relative(root, f)} — different variant (${hash.substring(0, 8)})`);
    continue;
  }

  const jsPath = relative(dirname(f), resolve(root, 'cdn', 'yry-plan-checklist.js'));

  // Absorb trailing newline
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
