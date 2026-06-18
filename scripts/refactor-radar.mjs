#!/usr/bin/env node
/**
 * Batch refactor: radar chart IIFE → YrY.initRadar()
 * Replaces the inline radar rendering IIFE with a deferred call after shared.js.
 *
 * Usage: node cdn/js/refactor-radar.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = [
  ...new Set([
    ...globSync(resolve(root, 'docs/故事任务面板/*/场景-*/演示.html')),
    ...globSync(resolve(root, 'cdn/故事任务面板/cdn/场景-*/演示.html')),
  ])
];

console.log(`演示.html files: ${files.length} total\n`);

function extractArray(str, key) {
  const start = str.indexOf('var ' + key + '=[');
  if (start === -1) return { value: '[]', end: -1 };
  const contentStart = start + ('var ' + key + '=[').length;
  // Find matching ] — be careful of nested brackets in strings
  let depth = 1;
  let inStr = false;
  let esc = false;
  let i = contentStart;
  while (i < str.length && depth > 0) {
    const c = str[i];
    if (esc) { esc = false; i++; continue; }
    if (c === '\\') { esc = true; i++; continue; }
    if (c === "'") { inStr = !inStr; i++; continue; }
    if (!inStr) {
      if (c === '[') depth++;
      else if (c === ']') { depth--; if (depth === 0) break; }
    }
    i++;
  }
  return { value: str.slice(contentStart, i), end: i + 1 };
}

let rep = 0, total = 0;
for (const f of files) {
  const raw = readFileSync(f, 'utf-8');

  // Find radar comment
  const commentIdx = raw.indexOf('/* ─── Radar ─── */');
  if (commentIdx === -1) {
    console.log(`  ✗ ${relative(root, f)} — radar comment not found`);
    continue;
  }

  // Find the IIFE
  const iifeStart = raw.indexOf('(function(){', commentIdx);
  if (iifeStart === -1) {
    console.log(`  ✗ ${relative(root, f)} — radar IIFE not found`);
    continue;
  }
  const iifeEnd = raw.indexOf('})();', iifeStart);
  if (iifeEnd === -1) {
    console.log(`  ✗ ${relative(root, f)} — radar IIFE end not found`);
    continue;
  }
  const iifeBlockEnd = iifeEnd + '})();'.length;

  const iifeBody = raw.slice(iifeStart, iifeBlockEnd);

  // Extract data array
  const dataR = extractArray(iifeBody, 'data');
  if (dataR.end === -1) {
    console.log(`  ✗ ${relative(root, f)} — data array not found`);
    continue;
  }

  // Extract baseData array
  const baseR = extractArray(iifeBody, 'baseData');
  if (baseR.end === -1) {
    console.log(`  ✗ ${relative(root, f)} — baseData array not found`);
    continue;
  }

  // Extract descMap array (strings with commas inside)
  const descR = extractArray(iifeBody, 'descMap');
  if (descR.end === -1) {
    console.log(`  ✗ ${relative(root, f)} — descMap array not found`);
    continue;
  }

  // Extract default hover message
  const hoverMatch = iifeBody.match(/innerHTML='([^']*)'\}\}\);setTimeout\(render,/);
  const defaultMsg = hoverMatch ? hoverMatch[1] : '💡 悬停查看详情';

  // Remove the IIFE block
  let start = commentIdx;
  // Absorb preceding newline
  if (start > 0 && raw[start - 1] === '\n') start--;

  // Consume trailing newlines after IIFE
  let end = iifeBlockEnd;
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

  // Re-escape the default message for JS string
  const escMsg = defaultMsg.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const newCall = '\n<script>YrY.initRadar([' + dataR.value + '],[' + baseR.value + '],[' + descR.value + '],\'' + escMsg + '\')</script>';
  const newRaw = before + afterBefore + newCall + afterAfter;
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
