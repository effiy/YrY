#!/usr/bin/env node
/**
 * Batch refactor: 计划清单.html → yry-plan-base.css
 *                 源码.html → yry-source-base.css
 *                 知识图谱.html → yry-graph-base.css
 *
 * Usage: node cdn/js/refactor-remaining-pages.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../..');
const DRY_RUN = process.argv.includes('--dry-run');

const TYPES = [
  { name: '计划清单', css: 'yry-plan-base.css' },
  { name: '源码',     css: 'yry-source-base.css' },
  { name: '知识图谱', css: 'yry-graph-base.css' },
];

function refactorFile(filePath, cssName) {
  const raw = readFileSync(filePath, 'utf-8');

  const startIdx = raw.indexOf('<style>');
  if (startIdx === -1) return { file: filePath, replaced: false, reason: 'no <style>' };

  const endIdx = raw.indexOf('</style>', startIdx);
  if (endIdx === -1) return { file: filePath, replaced: false, reason: 'no </style>' };

  const cssPath = relative(dirname(filePath), resolve(root, 'cdn', cssName));
  const before = raw.slice(0, startIdx);
  const after = raw.slice(endIdx + '</style>'.length);
  const newRaw = before + `<link rel="stylesheet" href="${cssPath}">` + after;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, filePath)} (${raw.length - newRaw.length}B)`);
    return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
  }

  writeFileSync(filePath, newRaw, 'utf-8');
  return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
}

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

let grandTotal = 0;
let grandReplaced = 0;

for (const { name, css } of TYPES) {
  const files = globSync(resolve(root, `docs/故事任务面板/**/${name}.html`));
  console.log(`\n── ${name}.html (${files.length} files) → ${css}`);

  let total = 0, rep = 0;
  for (const f of files) {
    const r = refactorFile(f, css);
    if (r.replaced) { rep++; total += r.saved; }
    else console.log(`  ✗ ${relative(root, r.file)} — ${r.reason}`);
  }
  console.log(`  ${rep}/${files.length} replaced, ${total}B saved (~${Math.round(total / Math.max(1, rep))}B/file)`);
  grandReplaced += rep;
  grandTotal += total;
}

console.log(`\n═══ Total: ${grandReplaced} files, ${grandTotal}B saved (${Math.round(grandTotal / 1024)}KB) ═══`);
