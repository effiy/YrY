#!/usr/bin/env node
/**
 * Batch refactor: 演示.html → yry-cdn-detect.js
 * Replaces inline detectCDN IIFE with external <script src> tag.
 *
 * Since detectCDN sits inside the main <script> block, we:
 * 1. Insert <script src> right before the block's opening <script> tag
 * 2. Remove the detectCDN code from within the block
 *
 * Usage: node cdn/js/refactor-cdn-detect.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

const CDN_DETECT_CODE = `(function detectCDN(){var resources=performance.getEntriesByType('resource');var cdnEntries=resources.filter(function(r){return r.name.indexOf('/cdn/')!==-1});var found={css:false,theme:false,js:false};var totalDuration=0;cdnEntries.forEach(function(r){var name=r.name.split('/').pop().split('?')[0];if(name==='shared.css')found.css=r;if(name==='theme.css')found.theme=r;if(name==='shared.js')found.js=r;totalDuration+=r.duration});function updateBadge(elId,entry){var el=document.getElementById(elId);if(entry){el.textContent='✓ '+Math.round(entry.duration)+'ms';el.style.color='var(--pass)'}else{el.textContent='—';el.style.color='var(--text3)'}}updateBadge('lrCss',found.css);updateBadge('lrTheme',found.theme);updateBadge('lrJs',found.js);var timingEl=document.getElementById('statTiming');if(cdnEntries.length>=3){timingEl.textContent=Math.round(totalDuration)+'ms';timingEl.style.color=totalDuration<100?'var(--pass)':'var(--accent)'}else if(cdnEntries.length>0){timingEl.textContent=Math.round(totalDuration)+'ms';timingEl.style.color='var(--cyan)'}else{timingEl.textContent='已缓存';timingEl.style.color='var(--text3)'}})();`;

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
  const idx = raw.indexOf(CDN_DETECT_CODE);
  if (idx === -1) {
    console.log(`  ✗ ${relative(root, f)} — detectCDN not found`);
    continue;
  }

  // Find the nearest preceding <script> tag (the main inline block)
  let scriptStart = -1;
  let searchFrom = idx;
  while (searchFrom > 0) {
    const candidate = raw.lastIndexOf('<script>', searchFrom);
    if (candidate === -1) break;
    if (raw[candidate + 7] !== ' ' && raw[candidate + 7] !== '\t') {
      scriptStart = candidate;
      break;
    }
    searchFrom = candidate - 1;
  }

  if (scriptStart === -1) {
    console.log(`  ✗ ${relative(root, f)} — inline <script> not found`);
    continue;
  }

  const srcPath = relative(dirname(f), resolve(root, 'cdn', 'yry-cdn-detect.js'));

  // Build the new file:
  // ...before script tag...
  // <script src="yry-cdn-detect.js"></script>
  // <script>
  // ...content up to detectCDN...
  // ...content after detectCDN...
  const before = raw.slice(0, scriptStart);
  const afterScriptTag = raw.slice(scriptStart + '<script>'.length);
  const relPos = idx - scriptStart - '<script>'.length;
  const mainBefore = afterScriptTag.slice(0, relPos);
  const mainAfterBlock = afterScriptTag.slice(relPos + CDN_DETECT_CODE.length);

  // Clean up double newlines
  let mainAfter = mainAfterBlock;
  if (mainAfter.startsWith('\n\n')) mainAfter = mainAfter.slice(1);

  const newRaw = before +
    `<script src="${srcPath}"></script>\n` +
    `<script>` +
    mainBefore +
    mainAfter;
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
