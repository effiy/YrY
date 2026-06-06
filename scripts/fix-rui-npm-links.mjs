#!/usr/bin/env node
/**
 * Fix all breadcrumb and cross-nav links in rui-npm HTML files.
 *
 * Changes:
 * 1. Fix ../../../../index.html → ../../../index.html (broken paths)
 * 2. Fix ../../故事任务.md → ../故事任务.md (broken story links in breadcrumb)
 * 3. Remove "📄 场景" from cross-nav
 * 4. Add "📝 审查" to cross-nav where missing
 * 5. Standardize breadcrumb to have clickable links for all segments
 * 6. Standardize cross-nav to 6 items: 清单·架构·图谱·测试·演示·审查
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = resolve(__dirname, '../docs/故事任务面板/rui-npm');

// Map scene directories to display names for breadcrumbs
const SCENE_META = {
  '场景-1-包搜索与发现': { n: 1, slug: '包搜索与发现', md: '场景-1-包搜索与发现.md' },
  '场景-2-包安装与版本管理': { n: 2, slug: '包安装与版本管理', md: '场景-2-包安装与版本管理.md' },
  '场景-3-本地发布与npx使用': { n: 3, slug: '本地发布与npx使用', md: '场景-3-本地发布与npx使用.md' },
  '场景-4-包信息审计与卸载': { n: 4, slug: '包信息审计与卸载', md: '场景-4-包信息审计与卸载.md' },
};

// Icon and current-page labels per file type
const PAGE_META = {
  '审查.html':       { icon: '📝', label: '审查' },
  '测试面板.html':    { icon: '🧪', label: '测试面板' },
  '演示.html':       { icon: '💡', label: '演示' },
  '知识图谱.html':    { icon: '🔗', label: '知识图谱' },
  '架构图.html':     { icon: '📐', label: '架构图' },
  '计划清单.html':    { icon: '📋', label: '计划清单' },
};

// Cross-nav item definitions (order matters)
const CROSS_NAV_ITEMS = [
  { href: '计划清单.html', icon: '📋', label: '清单' },
  { href: '架构图.html',   icon: '📐', label: '架构' },
  { href: '知识图谱.html',  icon: '🔗', label: '图谱' },
  { href: '测试面板.html',  icon: '🧪', label: '测试' },
  { href: '演示.html',     icon: '💡', label: '演示' },
  { href: '审查.html',     icon: '📝', label: '审查' },
];

/**
 * Build the standard breadcrumb HTML for a scene file.
 */
function buildBreadcrumb(sceneDir, fileName) {
  const meta = SCENE_META[sceneDir];
  const page = PAGE_META[fileName];
  if (!meta || !page) {
    console.warn(`  ⚠️  Unknown scene/file: ${sceneDir}/${fileName}`);
    return null;
  }
  return `<nav class="breadcrumb"><a href="../../../index.html">📄 文档中心</a><span class="bc-sep">/</span><a href="../故事任务.md">rui-npm</a><span class="bc-sep">/</span><a href="${meta.md}">场景 ${meta.n} · ${meta.slug}</a><span class="bc-sep">/</span><span class="bc-current">${page.icon} ${page.label}</span></nav>`;
}

/**
 * Build the standard cross-nav HTML, marking `currentFile` as active.
 */
function buildCrossNav(currentFile) {
  const parts = [];
  for (const item of CROSS_NAV_ITEMS) {
    if (item.href === currentFile) {
      // Current page: no href, "on" class
      parts.push(`<span class="cross-link on">${item.icon} ${item.label}</span>`);
    } else {
      parts.push(`<a class="cross-link" href="${item.href}">${item.icon} ${item.label}</a>`);
    }
  }
  const inner = parts.join('<span class="cross-sep">·</span>');
  return `<nav class="cross-nav">${inner}</nav>`;
}

/**
 * Fix a single HTML file.
 * Returns { changed: boolean, file: string }
 */
function fixFile(filePath, sceneDir) {
  const fileName = filePath.split('/').pop();
  let html = readFileSync(filePath, 'utf-8');
  const original = html;
  let changes = [];

  // ── 1. Fix broken ../../../../index.html → ../../../index.html ──
  if (html.includes('../../../../index.html')) {
    html = html.replaceAll('../../../../index.html', '../../../index.html');
    changes.push('fixed index.html path (4→3 levels)');
  }

  // ── 2. Fix broken ../../故事任务.md → ../故事任务.md (in breadcrumb) ──
  // Only fix in breadcrumb context; don't touch other occurrences
  html = html.replace(
    /(<nav class="breadcrumb">[^<]*)<a href="\.\.\/\.\.\/故事任务\.md"/g,
    '$1<a href="../故事任务.md"'
  );
  if (html !== original && html.includes('../故事任务.md') && original.includes('../../故事任务.md')) {
    changes.push('fixed story link (2→1 level)');
  }

  // ── 3. Remove cross-nav link to scene .md file ("📄 场景") ──
  // Match patterns like: <a class="cross-link" href="场景-N-*.md">📄 场景</a><span class="cross-sep">·</span>
  const sceneLinkRegex = /<a class="cross-link"(?: on)? href="场景-\d-[^"]*\.md">[^<]*<\/a><span class="cross-sep">·<\/span>\s*/g;
  if (sceneLinkRegex.test(html)) {
    html = html.replace(sceneLinkRegex, '');
    changes.push('removed "场景" from cross-nav');
  }

  // ── 4. Replace breadcrumb with standardized version ──
  const newBreadcrumb = buildBreadcrumb(sceneDir, fileName);
  if (newBreadcrumb) {
    // Match the entire breadcrumb nav element
    const bcRegex = /<nav class="breadcrumb">[\s\S]*?<\/nav>/;
    const oldBc = html.match(bcRegex)?.[0];
    if (oldBc && oldBc !== newBreadcrumb) {
      html = html.replace(bcRegex, newBreadcrumb);
      changes.push('standardized breadcrumb');
    }
  }

  // ── 5. Replace cross-nav with standardized version ──
  const newCrossNav = buildCrossNav(fileName);
  // Match both <nav class="cross-nav"> and <div class="cross-nav"> patterns
  const cnRegex = /<(?:nav|div) class="cross-nav">[\s\S]*?<\/(?:nav|div)>/;
  const oldCn = html.match(cnRegex)?.[0];
  if (oldCn && oldCn !== newCrossNav) {
    html = html.replace(cnRegex, newCrossNav);
    changes.push('standardized cross-nav');
  }

  // ── Write back if changed ──
  if (html !== original) {
    writeFileSync(filePath, html, 'utf-8');
    console.log(`  ✅ ${fileName}: ${changes.join(' · ')}`);
    return { changed: true, file: filePath, changes };
  } else {
    console.log(`  ⏭️  ${fileName}: no changes needed`);
    return { changed: false, file: filePath, changes: [] };
  }
}

// ── Main ──────────────────────────────────────────────────────────────
console.log('🔧 Fixing rui-npm HTML links...\n');

let totalChanged = 0;

for (const [sceneDir, meta] of Object.entries(SCENE_META)) {
  const dirPath = resolve(BASE, sceneDir);
  if (!existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dirPath}`);
    continue;
  }
  console.log(`📁 ${sceneDir}/`);
  const files = readdirSync(dirPath).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const result = fixFile(resolve(dirPath, file), sceneDir);
    if (result.changed) totalChanged++;
  }
  console.log('');
}

console.log(`🎉 Done! ${totalChanged} files changed.`);
