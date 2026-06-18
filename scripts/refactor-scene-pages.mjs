#!/usr/bin/env node
/**
 * YrY — Batch refactor scene 演示.html pages: replace inline common styles
 * with <link> to cdn/yry-scene-base.css
 *
 * Usage: node cdn/js/refactor-scene-pages.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { resolve, relative, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const DRY_RUN = process.argv.includes('--dry-run');

/** Common inline style prefix shared by ALL 演示.html files (lines 9-98 of the <style> block) */
const COMMON_PREFIX_START = ':root{--bg:rgba(22,22,32,1);--bg-card:linear-gradient(159deg,rgba(38,38,52,1) 0%,rgba(34,34,46,1) 100%);--bg-flat:rgba(34,34,46,1);--bg-raised:rgba(42,42,56,1);--accent:#FFC107;--cyan:#22d3ee;--pass:#22c55e;--fail:#ef4444;--text:rgba(250,250,252,1);--text2:rgba(160,160,164,1);--text3:rgba(110,110,114,1);--shadow:0 4px 20px rgba(0,0,0,0.3);--shadow-lg:0 12px 32px rgba(0,0,0,0.45);--warn:#f59e0b;--info:#6b7280;--purple:#a78bfa;--pink:#f472b6;--blue:#60a5fa;--radius:12px;--border:1px solid rgba(255,255,255,0.06)}';

/** Marker string that appears at the end of the common block (last common style before page-specific) */
const COMMON_BLOCK_END = '.speed-select:focus{border-color:rgba(255,193,7,.3)}';

/**
 * Find all scene 演示.html files that contain the inline style block.
 */
function findDemoFiles() {
  const patterns = [
    'docs/故事任务面板/**/演示.html',
    'cdn/故事任务面板/**/演示.html',
  ];
  const files = [];
  for (const p of patterns) {
    const matches = globSync(resolve(root, p));
    files.push(...matches);
  }
  return files;
}

/**
 * Calculate relative path from file to cdn/yry-scene-base.css.
 * e.g., docs/故事任务面板/首页/scene/演示.html → ../../../../cdn/yry-scene-base.css
 */
function relCdn(filePath) {
  const dir = dirname(filePath);
  const cdnCss = resolve(root, 'cdn/yry-scene-base.css');
  return relative(dir, cdnCss);
}

/**
 * Refactor a single file: replace inline common styles with <link> to CDN.
 * Returns { file, replaced: true/false, saved: bytes_saved }
 */
function refactorFile(filePath) {
  const raw = readFileSync(filePath, 'utf-8');

  if (!raw.includes(COMMON_PREFIX_START)) {
    return { file: filePath, replaced: false, reason: 'no matching common block' };
  }

  const linkPath = relCdn(filePath);

  // Find from <style> through end of common block
  const styleTag = '<style>\n' + COMMON_PREFIX_START;
  const styleIdx = raw.indexOf(styleTag);
  if (styleIdx === -1) {
    return { file: filePath, replaced: false, reason: 'no <style> followed by common block' };
  }

  const startIdx = styleIdx + '<style>\n'.length;
  const endMarkerIdx = raw.indexOf(COMMON_BLOCK_END, startIdx);

  if (endMarkerIdx === -1) {
    return { file: filePath, replaced: false, reason: 'end marker not found' };
  }

  const endIdx = endMarkerIdx + COMMON_BLOCK_END.length;
  const before = raw.slice(0, styleIdx);
  const after = raw.slice(endIdx);

  const bytesBefore = raw.length;

  // Replace <style> + common block with <link to cdn css> + <style>
  const replacement = `<link rel="stylesheet" href="${linkPath}">\n<style>`;
  const newRaw = before + replacement + after;

  if (DRY_RUN) {
    console.log(`[DRY-RUN] ${relative(root, filePath)} (saved ${raw.length - newRaw.length} bytes)`);
    return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
  }

  writeFileSync(filePath, newRaw, 'utf-8');
  return { file: filePath, replaced: true, saved: raw.length - newRaw.length };
}

// ── Main ────────────────────────────────────────────────────────────────────

const files = findDemoFiles();
console.log(`Found ${files.length} 演示.html files`);

let totalSaved = 0;
let replacedCount = 0;
const skipped = [];

for (const f of files) {
  const result = refactorFile(f);
  if (result.replaced) {
    replacedCount++;
    totalSaved += result.saved || 0;
    if (!DRY_RUN) console.log(`  ✓ ${relative(root, f)} (${result.saved}B saved)`);
  } else {
    skipped.push(result);
  }
}

console.log(`\nReplaced: ${replacedCount}/${files.length} files, ${totalSaved} bytes saved`);
if (skipped.length > 0) {
  console.log('Skipped:');
  for (const s of skipped) {
    console.log(`  ✗ ${relative(root, s.file)} — ${s.reason}`);
  }
}
if (DRY_RUN) console.log('[DRY-RUN] No files were modified.');
