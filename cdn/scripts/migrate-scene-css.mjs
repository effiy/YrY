#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   Migrate cdn/故事任务面板/cdn/ scene HTML files to use base CSS files
   Replaces inline <style> blocks with <link> to shared base CSS.

   Usage: node cdn/scripts/migrate-scene-css.mjs [--dry-run]
   ═══════════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const BASE = resolve(ROOT, 'cdn/故事任务面板/cdn');

function findHtmlFiles(dir) {
  const results = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = resolve(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findHtmlFiles(full));
    } else if (e.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const dryRun = process.argv.includes('--dry-run');

const TYPE_MAP = {
  '架构图': { css: 'yry-arch-base.css',    mono: true },
  '知识图谱': { css: 'yry-graph-base.css',   mono: true },
  '源码':   { css: 'yry-source-base.css',  mono: false },
  '计划清单': { css: 'yry-plan-base.css',    mono: false },
  '测试面板': { css: 'yry-test-base.css',    mono: false },
  '审查':   { css: 'yry-review-base.css',  mono: false },
  '演示':   { css: 'yry-demo.css',         mono: false },
};

function classify(filePath) {
  const base = filePath.split('/').pop();
  for (const [key, val] of Object.entries(TYPE_MAP)) {
    if (base.includes(key)) return { key, ...val };
  }
  return null;
}

function migrateFile(filePath) {
  const info = classify(filePath);
  if (!info) return { skipped: true, reason: 'unknown type' };

  let html = readFileSync(filePath, 'utf-8');

  // Check if already migrated (has base CSS link)
  if (html.includes(info.css)) {
    return { skipped: true, reason: `already has ${info.css}` };
  }

  const original = html;

  // 1. Remove inline <style>...</style> block (supports multiline)
  html = html.replace(/<style>[\s\S]*?<\/style>\s*/g, '');

  // 2. Remove yry-inline-helpers.css link (if present)
  html = html.replace(
    /<link\s+rel="stylesheet"\s+href="[^"]*yry-inline-helpers\.css"[^>]*>\s*/g,
    ''
  );

  // 3. Add base CSS link after the last existing <link> or before </head>
  const cssHref = `../../../../cdn/${info.css}`;
  const linkTag = `<link rel="stylesheet" href="${cssHref}">`;

  if (html.includes('<link rel="stylesheet"')) {
    // Insert after the last <link> tag
    html = html.replace(
      /(.*<link\s+rel="stylesheet"[^>]*>)/s,
      `$1\n${linkTag}`
    );
  } else {
    // Insert before </head>
    html = html.replace('</head>', `\n${linkTag}\n</head>`);
  }

  if (html === original) {
    return { skipped: true, reason: 'no changes detected' };
  }

  if (!dryRun) {
    writeFileSync(filePath, html, 'utf-8');
  }

  return {
    migrated: true,
    type: info.key,
    css: info.css,
    path: filePath.replace(ROOT + '/', ''),
  };
}

const files = findHtmlFiles(BASE);

console.log(`Found ${files.length} files\n`);

if (dryRun) console.log('🔍 DRY RUN — no files will be modified\n');

let migrated = 0;
let skipped = 0;

for (const f of files) {
  const result = migrateFile(f);
  if (result.migrated) {
    migrated++;
    console.log(`✅ [${result.type}] → ${result.css}  ${result.path}`);
  } else {
    skipped++;
    if (result.reason !== 'already has base CSS') {
      console.log(`⏭️  ${result.reason}: ${f.replace(ROOT + '/', '')}`);
    }
  }
}

console.log(`\n${migrated} migrated, ${skipped} skipped`);

if (dryRun) {
  console.log('\nRun without --dry-run to apply changes.');
}