#!/usr/bin/env node
/**
 * Batch refactor: yry-breadcrumb scene pages → yry-a11y.css
 *
 * 30 files with pure a11y <style> → replace entire block with <link>
 *  5 计划清单 files with mixed a11y + plan-specific → keep plan styles, add <link>
 *
 * Usage: node cdn/js/refactor-breadcrumb-a11y.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

// The a11y block common to all 35 files — exact text from line 21 through 48
const A11Y_BLOCK = `
/* ═══ a11y · prefers-reduced-motion ═══ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
/* ═══ a11y · Skip Link ═══ */
.skip-link {
  position: fixed; top: -100px; left: 8px; z-index: 1000;
  background: var(--accent, #ffc107); color: #000;
  padding: 10px 16px; border-radius: 6px; font-weight: 600;
  text-decoration: none; transition: top .2s cubic-bezier(0.16, 1, 0.3, 1);
  font-size: .85rem; box-shadow: 0 4px 12px rgba(0,0,0,.3);
  border: 2px solid transparent;
}
.skip-link:focus { top: 8px; outline: none; border-color: var(--cyan, #22d3ee); }
.skip-link:focus-visible { top: 8px; outline: 3px solid var(--cyan, #22d3ee); outline-offset: 2px; }
/* ═══ a11y · Focus Ring ═══ */
:focus-visible {
  outline: 2px solid var(--cyan, #22d3ee);
  outline-offset: 2px;
  border-radius: 4px;
}
/* ═══ a11y · Semantic Container ═══ */
[role="main"] { scroll-margin-top: 16px; }`;

function firstStyleLen(raw) {
  const s = raw.indexOf('<style>');
  if (s === -1) return -1;
  const e = raw.indexOf('</style>', s);
  if (e === -1) return -1;
  return e - s - '<style>'.length;
}

function refactorFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');
  const cssPath = relative(dirname(filePath), resolve(root, 'cdn', 'yry-a11y.css'));
  const linkTag = `<link rel="stylesheet" href="${cssPath}">`;

  const startIdx = raw.indexOf('<style>');
  if (startIdx === -1) return { file: filePath, replaced: false, reason: 'no <style>' };
  const endIdx = raw.indexOf('</style>', startIdx);
  if (endIdx === -1) return { file: filePath, replaced: false, reason: 'no </style>' };

  const styleContent = raw.slice(startIdx + '<style>'.length, endIdx);
  const styleLen = styleContent.length;

  // Pure a11y block (1163 bytes) → replace entire <style>...</style>
  if (styleLen === 1163) {
    const before = raw.slice(0, startIdx);
    const after = raw.slice(endIdx + '</style>'.length);
    const newRaw = before + linkTag + after;
    const saved = raw.length - newRaw.length;

    if (!DRY_RUN) writeFileSync(filePath, newRaw, 'utf-8');
    return { file: filePath, replaced: true, saved };
  }

  // Mixed block (计划清单: a11y + plan-specific) → replace just the a11y part
  if (styleContent.includes(A11Y_BLOCK)) {
    // Remove a11y block plus the trailing newline that separates it from plan styles
    const remaining = styleContent.replace(A11Y_BLOCK + '\n', '');
    const before = raw.slice(0, startIdx);
    const after = raw.slice(endIdx + '</style>'.length);

    let newRaw;
    if (remaining.trim()) {
      newRaw = before + linkTag + '\n<style>\n' + remaining + '</style>' + after;
    } else {
      newRaw = before + linkTag + after;
    }
    const saved = raw.length - newRaw.length;

    if (!DRY_RUN) writeFileSync(filePath, newRaw, 'utf-8');
    return { file: filePath, replaced: true, saved, mixed: true };
  }

  return { file: filePath, replaced: false, reason: `unexpected style block (${styleLen}B)` };
}

if (DRY_RUN) console.log('[DRY-RUN] No files will be modified.\n');

const files = globSync(resolve(root, 'cdn/故事任务面板/yry-breadcrumb/场景-*/*.html'));
console.log(`yry-breadcrumb scene pages: ${files.length} total\n`);

let total = 0, rep = 0;
for (const f of files) {
  const r = refactorFile(f);
  if (r.replaced) {
    rep++;
    total += r.saved;
    const tag = r.mixed ? ' [mixed→link+style]' : '';
    console.log(`  ✓ ${relative(root, r.file)} (${r.saved}B)${tag}`);
  } else {
    console.log(`  ✗ ${relative(root, r.file)} — ${r.reason}`);
  }
}

console.log(`\n${rep}/${files.length} replaced, ${total}B saved (~${Math.round(total / 1024)}KB)`);
