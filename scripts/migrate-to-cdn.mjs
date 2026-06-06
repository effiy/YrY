#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   migrate-to-cdn.mjs — 将故事面板 HTML 迁移到 YrY CDN 共享资源
   用法: node scripts/migrate-to-cdn.mjs [--dry-run] [story-dir...]
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const BASE = process.cwd();

/* ── Which story dirs to process ────────────────────────────────────────── */
const args = process.argv.slice(2).filter(a => !a.startsWith('--'));
const STORY_DIRS = args.length > 0
  ? args.map(d => join('docs/故事任务面板', d))
  : ['docs/故事任务面板/yry-arch', 'docs/故事任务面板/yry-self-test'];

/* ── Detect page category ───────────────────────────────────────────────── */
function detectCategory(filePath) {
  const name = filePath.toLowerCase();
  if (name.includes('架构图') || name.includes('知识图谱')) return 'A'; // mono
  return 'B'; // system
}

/* ── Compute relative path to cdn/ ──────────────────────────────────────── */
function cdnPrefix(filePath) {
  const rel = relative(dirname(filePath), join(BASE, 'cdn'));
  return rel || '.';
}

/* ── HTML class renames ─────────────────────────────────────────────────── */
const CLASS_RENAMES_B = [
  // Container & layout
  ['class="container"', 'class="yry-container"'],
  ['class="header"', 'class="yry-header"'],
  // Breadcrumb
  ['class="breadcrumb"', 'class="yry-breadcrumb"'],
  ['class="bc-sep"', 'class="yry-bc-sep"'],
  ['class="bc-current"', 'class="yry-bc-current"'],
  // Cross-nav
  ['class="cross-nav"', 'class="yry-cross-nav"'],
  ['class="cross-link"', 'class="yry-cross-link"'],
  ['class="cross-sep"', 'class="yry-cross-sep"'],
  // Stats
  ['class="stats-grid"', 'class="yry-stats"'],
  ['class="stat-card"', 'class="yry-stat"'],
  // Bar
  ['class="bar-wrap"', 'class="yry-bar-wrap"'],
  ['class="bar-outer"', 'class="yry-bar-outer"'],
  // Tabs & panels
  ['class="tabs"', 'class="yry-tabs"'],
  ['class="tab "', 'class="yry-tab "'],
  ['class="tab"', 'class="yry-tab"'],   // catch tab at line end
  ['class="panel "', 'class="yry-panel "'],
  ['class="panel"', 'class="yry-panel"'],
  // Toast
  ['class="toast"', 'class="yry-toast"'],
  // Footer
  ['class="footer"', 'class="yry-footer"'],
  ['class="footer-note"', 'class="yry-footer-note"'],
  // Section
  ['class="section"', 'class="yry-section"'],
  // Suite
  ['class="suite "', 'class="yry-suite "'],
  ['class="suite"', 'class="yry-suite"'],
  ['class="s-head"', 'class="yry-suite-head"'],
  ['class="s-body"', 'class="yry-suite-body"'],
  ['class="s-arrow"', 'class="yry-suite-arrow"'],
  ['class="s-name"', 'class="yry-suite-name"'],
  // Buttons
  ['class="btn "', 'class="yry-btn "'],
  ['class="btn"', 'class="yry-btn"'],
  // Accent / sub
  ['class="accent"', 'class="yry-accent"'],
  ['class="sub"', 'class="yry-sub"'],
  // Cards
  ['class="card"', 'class="yry-card"'],
  // Progress
  ['class="progress-wrap"', 'class="yry-progress-wrap"'],
  ['class="progress-bar"', 'class="yry-progress-bar"'],
  ['class="progress-fill"', 'class="yry-progress-fill"'],
  ['class="progress-text"', 'class="yry-progress-text"'],
  ['class="progress-label"', 'class="yry-progress-label"'],
];

const CLASS_RENAMES_A = [
  // Mono-specific renames
  ['class="header"', 'class="yry-mono-header"'],
  ['class="header-row"', 'class="yry-mono-header-row"'],
  ['class="subtitle"', 'class="yry-mono-subtitle"'],
  ['class="footer"', 'class="yry-mono-footer"'],
  // Breadcrumb
  ['class="breadcrumb"', 'class="yry-breadcrumb"'],
  ['class="bc-sep"', 'class="yry-bc-sep"'],
  ['class="bc-current"', 'class="yry-bc-current"'],
  // Cross-nav
  ['class="cross-nav"', 'class="yry-cross-nav"'],
  ['class="cross-link"', 'class="yry-cross-link"'],
  ['class="cross-sep"', 'class="yry-cross-sep"'],
  // Toolbar
  ['class="toolbar"', 'class="yry-toolbar"'],
  ['class="toolbar-actions"', 'class="yry-toolbar-actions"'],
  ['class="toolbar-toggle"', 'class="yry-toolbar-toggle"'],
  // Cards
  ['class="card"', 'class="yry-mono-card"'],
  ['class="cards"', 'class="yry-mono-cards"'],
  ['class="card-header"', 'class="yry-mono-card-header"'],
  ['class="card-dot"', 'class="yry-mono-dot"'],
];

/* ── JS function renames ────────────────────────────────────────────────── */
const JS_RENAMES = [
  // Toast
  ['function toast(', 'function yry_toast_legacy('],
  [' toast(', ' YrY.toast('],
  ['yry_toast_legacy(', 'toast('],  // restore if was a local definition
  // Copy
  ['function copyCmd(', 'function yry_copycmd_legacy('],
  [' copyCmd(', ' YrY.copyCmd('],
  ['yry_copycmd_legacy(', 'copyCmd('],
  // Switch panel
  ['function switchPanel(', 'function yry_switch_legacy('],
  [' switchPanel(', ' YrY.switchPanel('],
  ['yry_switch_legacy(', 'switchPanel('],
];

/* ── Counters ───────────────────────────────────────────────────────────── */
let stats = { total: 0, migrated: 0, skipped: 0, errors: 0 };
let details = [];

/* ── Migrate one file ───────────────────────────────────────────────────── */
function migrateFile(filePath) {
  stats.total++;
  const cat = detectCategory(filePath);
  const prefix = cdnPrefix(filePath);
  let html = readFileSync(filePath, 'utf8');
  const orig = html;
  let changes = 0;

  /* ── 1. Add CDN <link> tags ──────────────────────────────────────────── */
  const cdnLinks = cat === 'B'
    ? `<link rel="stylesheet" href="${prefix}/shared.css">\n<link rel="stylesheet" href="${prefix}/theme.css">`
    : `<link rel="stylesheet" href="${prefix}/shared.css">\n<link rel="stylesheet" href="${prefix}/theme-mono.css">`;

  // Insert after <title> or <meta charset> line
  if (!html.includes('cdn/shared.css')) {
    html = html.replace(
      /(<\/title>)/,
      `$1\n<!-- ═══ CDN: YrY 共享样式 ═══ -->\n${cdnLinks}`
    );
    changes++;
  }

  /* ── 2. Add CDN <script> ─────────────────────────────────────────────── */
  if (!html.includes('cdn/shared.js')) {
    // Insert before </body>
    html = html.replace(
      /(<\/body>)/,
      `<script src="${prefix}/shared.js"></script>\n$1`
    );
    changes++;
  }

  /* ── 3. Rename CSS classes ───────────────────────────────────────────── */
  const renames = cat === 'B' ? CLASS_RENAMES_B : CLASS_RENAMES_A;
  for (const [from, to] of renames) {
    if (html.includes(from)) {
      html = html.split(from).join(to);
      changes++;
    }
  }

  /* ── 4. Rename JS functions ──────────────────────────────────────────── */
  for (const [from, to] of JS_RENAMES) {
    // Only rename function CALLS (not definitions that start with 'function')
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const newHtml = html.replace(regex, (match) => {
      // Don't rename if it's a function definition
      return match;
    });
    if (newHtml !== html) {
      html = newHtml;
      changes++;
    }
  }

  /* ── 5. Write result ──────────────────────────────────────────────────── */
  if (changes > 0 && html !== orig) {
    if (!DRY_RUN) {
      writeFileSync(filePath, html, 'utf8');
    }
    stats.migrated++;
    details.push(`  ✓ ${relative(BASE, filePath)} [${cat}] +${changes} changes`);
  } else {
    stats.skipped++;
    details.push(`  → ${relative(BASE, filePath)} [${cat}] (no changes needed)`);
  }
}

/* ── Collect all HTML files ─────────────────────────────────────────────── */
function collectFiles(dir) {
  const files = [];
  function walk(d) {
    for (const entry of readdirSync(d)) {
      const full = join(d, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      } else if (entry.endsWith('.html')) {
        files.push(full);
      }
    }
  }
  walk(dir);
  return files;
}

/* ── Main ───────────────────────────────────────────────────────────────── */
console.log(`╔══════════════════════════════════════════════════════════╗`);
console.log(`║  YrY CDN Migration  —  ${DRY_RUN ? 'DRY RUN' : 'LIVE'}  ║`);
console.log(`╚══════════════════════════════════════════════════════════╝\n`);

for (const dir of STORY_DIRS) {
  const fullDir = join(BASE, dir);
  if (!existsSync(fullDir)) {
    console.log(`⚠  Directory not found: ${dir}`);
    continue;
  }
  const files = collectFiles(fullDir);
  console.log(`📂 ${dir} (${files.length} files)`);
  for (const f of files.sort()) {
    try {
      migrateFile(f);
    } catch (err) {
      stats.errors++;
      details.push(`  ✗ ${relative(BASE, f)} — ${err.message}`);
    }
  }
}

console.log(`\n───────────────────────────────────────────────────────────`);
console.log(`  Total: ${stats.total}  |  Migrated: ${stats.migrated}  |  Skipped: ${stats.skipped}  |  Errors: ${stats.errors}`);
if (DRY_RUN) console.log(`  (DRY RUN — no files were modified)`);
console.log(`───────────────────────────────────────────────────────────`);
for (const d of details) console.log(d);
