#!/usr/bin/env node
/**
 * transform-breadcrumb-scenes.mjs
 *
 * Transforms CDN breadcrumb scene HTML files from static HTML blocks
 * (scene-header, scene-nav, cross-nav, stat-grid, back-top) to Vue 3
 * component mount points, matching the reference pattern in
 * docs/故事任务面板/计划清单/.
 *
 * Usage:
 *   node scripts/transform-breadcrumb-scenes.mjs --dry-run
 *   node scripts/transform-breadcrumb-scenes.mjs --file <path>
 *   node scripts/transform-breadcrumb-scenes.mjs
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, dirname, basename, relative, resolve } from 'path';
import { argv, exit } from 'process';

// ═══ CLI flags ═══
const DRY_RUN = argv.includes('--dry-run');
const FILE_IDX = argv.indexOf('--file');
const SINGLE_FILE = FILE_IDX !== -1 ? argv[FILE_IDX + 1] : null;

const SCENE_BASE = resolve('cdn/故事任务面板/yry-breadcrumb');

// ═══ Scene metadata ═══
const SCENE_META = {
  '场景-1-需求与设计':   { prefix: '场景 1', accent: ' · 需求与设计',   bcLabel: '场景 1 · 需求与设计' },
  '场景-2-模板与样式':   { prefix: '场景 2', accent: ' · 模板与样式',   bcLabel: '场景 2 · 模板与样式' },
  '场景-3-Loader实现':  { prefix: '场景 3', accent: ' · Loader 实现',  bcLabel: '场景 3 · Loader 实现' },
  '场景-4-页面集成':     { prefix: '场景 4', accent: ' · 页面集成',     bcLabel: '场景 4 · 页面集成' },
  '场景-5-测试与发布':   { prefix: '场景 5', accent: ' · 测试与发布',   bcLabel: '场景 5 · 测试与发布' },
};

const PAGE_ICONS = {
  '计划清单': '📋', '架构图': '📐', '知识图谱': '🔗',
  '源码': '📄', '测试面板': '🧪', '演示': '💡', '审查': '📝',
};

// ═══ A11y style block ═══
const A11Y_STYLES = `
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
[role="main"] { scroll-margin-top: 16px; }
`;

// ═══ Loader script tags (inserted at body end, before mount scripts) ═══
function loaderScripts(prefix) {
  return [
    `<script src="${prefix}shared.js"></script>`,
    `<!-- ═══ CDN: YrySceneNav 组件 loader ═══ -->`,
    `<script src="${prefix}yry-scene-nav/index.js"></script>`,
    `<!-- ═══ CDN: YryCrossNav 组件 loader ═══ -->`,
    `<script src="${prefix}yry-cross-nav/index.js"></script>`,
    `<!-- ═══ CDN: YryBackTop (零配置自初始化) ═══ -->`,
    `<script src="${prefix}yry-back-top/index.js"></script>`,
    `<!-- ═══ CDN: YryBreadcrumb 组件 loader ═══ -->`,
    `<script src="${prefix}yry-breadcrumb/index.js"></script>`,
    `<!-- ═══ CDN: YrySceneHeader 组件 loader ═══ -->`,
    `<script src="${prefix}yry-scene-header/index.js"></script>`,
    `<!-- ═══ CDN: YryStatsGrid 组件 loader ═══ -->`,
    `<script src="${prefix}yry-stats-grid/index.js"></script>`,
  ].join('\n');
}

// ═══ Mount divs ═══
const MOUNT_DIVS = [
  '  <!-- ═══ YryBreadcrumb Vue 3 组件 · 挂载点 ═══ -->',
  '  <div id="breadcrumb-app"></div>',
  '',
  '  <!-- ═══ YrySceneNav Vue 3 组件 · 挂载点 ═══ -->',
  '  <div id="scene-nav-app"></div>',
  '',
  '  <!-- ═══ YryCrossNav Vue 3 组件 · 挂载点 ═══ -->',
  '  <div id="cross-nav-app"></div>',
  '',
  '  <!-- ═══ YrySceneHeader Vue 3 组件 · 挂载点 ═══ -->',
  '  <div id="scene-header-app"></div>',
].join('\n');

// ═══ Helpers ═══

/** Extract text content from first regex match group */
function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

/** Check if a file already has Vue component mounts (skip if so) */
function alreadyTransformed(html) {
  return html.includes('id="scene-header-app"') &&
         html.includes('id="scene-nav-app"') &&
         html.includes('id="cross-nav-app"');
}

/** Derive page type from filename */
function pageType(filename) {
  const base = basename(filename, '.html');
  const map = {
    '计划清单': '清单', '架构图': '架构', '知识图谱': '图谱',
    '源码': '源码', '测试面板': '测试', '演示': '演示', '审查': '审查',
  };
  return { id: map[base] || base, icon: PAGE_ICONS[base] || '📄', name: base };
}

/** Derive scene dir from file path */
function sceneDir(filePath) {
  const rel = relative(SCENE_BASE, filePath);
  const parts = rel.split('/');
  return parts[0] || '';
}

// ═══ Prop extractors ═══

function extractSceneHeader(html) {
  const tag = extract(html, /<span class="scene-tag">([^<]+)<\/span>/);
  const h1 = extract(html, /<h1 class="scene-title">([^<]+)<\/h1>/);
  const en = extract(html, /<div class="scene-en">([^<]+)<\/div>/);
  const desc = extract(html, /<p class="scene-desc">([^<]+)<\/p>/);

  // Icon: first emoji/symbol in h1, or fall back to page type icon
  const iconMatch = h1.match(/^(\p{Emoji})/u);
  const icon = iconMatch ? iconMatch[1] : '';

  // Prefix: scene-tag text, e.g. "场景 1 · 计划清单" → strip " · 计划清单"
  const prefix = tag.replace(/ · .*$/, '').trim();

  return { icon, prefix, tag, en, desc, h1 };
}

function extractSceneNav(html, pageName) {
  // Find the scene-nav block
  const navMatch = html.match(/<(?:div|nav)\s+class="scene-nav"[^>]*>([\s\S]*?)<\/(?:div|nav)>/);
  if (!navMatch) return { items: [], html: '' };

  const navHtml = navMatch[0];
  const inner = navMatch[1];

  const items = [];
  // Parse <a> tags
  const linkRe = /<a\s+(?:class="([^"]*)"\s+)?href="([^"]+)">([^<]+)<\/a>/g;
  let m;
  while ((m = linkRe.exec(inner)) !== null) {
    const cls = m[1] || '';
    items.push({
      label: m[3].trim(),
      href: m[2],
      ...(cls ? { class: cls } : {}),
    });
  }

  // Parse <span class="active">
  const activeMatch = inner.match(/<span class="active">([^<]+)<\/span>/);
  if (activeMatch) {
    items.push({ label: activeMatch[1].trim(), active: true });
  }

  return { items, html: navHtml };
}

function extractCrossNav(html) {
  const navMatch = html.match(/<div class="cross-nav">([\s\S]*?)<\/div>/);
  if (!navMatch) return { active: '清单', html: '' };

  const inner = navMatch[1];
  // Find the active (non-link) item
  const onMatch = inner.match(/<span class="cross-link on">([^<]+)<\/span>/);
  let active = '清单';
  if (onMatch) {
    const label = onMatch[1].trim();
    // Map emoji+label to page id
    for (const [name, icon] of Object.entries(PAGE_ICONS)) {
      if (label.startsWith(icon)) {
        const idMap = { '计划清单': '清单', '架构图': '架构', '知识图谱': '图谱', '源码': '源码', '测试面板': '测试', '演示': '演示', '审查': '审查' };
        active = idMap[name] || '清单';
        break;
      }
    }
  }

  return { active, html: navMatch[0] };
}

function extractStatGrid(html) {
  // Find stat-grid (4 stat-cards)
  const gridMatch = html.match(/<div class="stat-grid">([\s\S]*?)<\/div>\s*(?=<h2|<div class="tip-box|<div class="cross-nav|<div class="kpi-grid|$)/);
  if (!gridMatch) return { items: [], html: '' };

  const inner = gridMatch[1];
  const items = [];
  const cardRe = /<div class="stat-card">\s*<div class="val\s+(\w+)">([^<]+)<\/div>\s*<div class="lbl">([^<]+)<\/div>\s*<\/div>/g;
  let m;
  while ((m = cardRe.exec(inner)) !== null) {
    const valClass = m[1];
    const modifier = valClass === 'pass' ? 'health' : valClass === 'warn' ? 'warn-h' : valClass === 'accent' ? 'accent' : undefined;
    items.push({
      value: isNaN(m[2]) ? m[2].trim() : Number(m[2].trim()),
      label: m[3].trim(),
      ...(modifier ? { modifier } : {}),
    });
  }

  return { items, html: gridMatch[0] };
}

function extractBreadcrumb(html) {
  // Find the LAST mountBreadcrumb call (some files have code-block examples before the real one)
  const bcRe = /function mountBreadcrumb\s*\(\s*\)\s*\{[\s\S]*?Vue\.createApp\(window\.YryBreadcrumb,\s*\{([\s\S]*?)\}\)\.mount\('#breadcrumb-app'\)/g;
  let bcMatch, lastMatch;
  while ((bcMatch = bcRe.exec(html)) !== null) lastMatch = bcMatch;
  bcMatch = lastMatch;
  if (!bcMatch) return { ariaLabel: '面包屑导航', items: [] };

  const propsStr = bcMatch[1];
  const ariaLabel = extract(propsStr, /ariaLabel:\s*'([^']*)'/);

  // Parse items array
  const itemsMatch = propsStr.match(/items:\s*\[([\s\S]*?)\]/);
  if (!itemsMatch) return { ariaLabel: ariaLabel || '面包屑导航', items: [] };

  const itemsStr = itemsMatch[1];
  const items = [];
  const itemRe = /\{\s*label:\s*'([^']*)'(?:,\s*href:\s*'([^']*)')?(?:,\s*icon:\s*'([^']*)')?\s*\}/g;
  let m;
  while ((m = itemRe.exec(itemsStr)) !== null) {
    items.push({
      label: m[1],
      ...(m[2] ? { href: m[2] } : {}),
      ...(m[3] ? { icon: m[3] } : {}),
    });
  }

  return { ariaLabel: ariaLabel || '面包屑导航', items };
}

// ═══ Mount script generators ═══

function genSceneHeaderMount(info, page) {
  const icon = info.icon || page.icon;
  return `
  /* ── YrySceneHeader 挂载 ── */
  function mountSceneHeader() {
    if (!window.Vue || !window.YrySceneHeader) return;
    if (!document.getElementById('scene-header-app')) return;
    Vue.createApp(window.YrySceneHeader, {
      icon: '${icon}',
      prefix: '${info.prefix}',
      accent: '${info.accent}',
      meta: '${escHtml(info.en)}',
      desc: '${escHtml(info.desc)}'
    }).mount('#scene-header-app');
  }
  if (window.YrySceneHeader) mountSceneHeader();
  else document.addEventListener('yry-scene-header-ready', mountSceneHeader, { once: true });`;
}

function genSceneNavMount(navItems) {
  const itemsJson = navItems.map(item => {
    const parts = [`label: '${escHtml(item.label)}'`];
    if (item.href) parts.push(`href: '${item.href}'`);
    if (item.active) parts.push('active: true');
    if (item.class) parts.push(`class: '${item.class}'`);
    return `        { ${parts.join(', ')} }`;
  }).join(',\n');

  return `
  /* ── YrySceneNav 挂载 ── */
  function mountSceneNav() {
    if (!window.Vue || !window.YrySceneNav) return;
    if (!document.getElementById('scene-nav-app')) return;
    Vue.createApp(window.YrySceneNav, {
      items: [
${itemsJson}
      ]
    }).mount('#scene-nav-app');
  }
  if (window.YrySceneNav) mountSceneNav();
  else document.addEventListener('yry-scene-nav-ready', mountSceneNav, { once: true });`;
}

function genCrossNavMount(activeId) {
  return `
  /* ── YryCrossNav 挂载 ── */
  function mountCrossNav() {
    if (!window.Vue || !window.YryCrossNav) return;
    if (!document.getElementById('cross-nav-app')) return;
    Vue.createApp(window.YryCrossNav, {
      basePath: './',
      active: '${activeId}',
      pages: [
        { id: '清单', icon: '📋', href: '计划清单.html' },
        { id: '架构', icon: '📐', href: '架构图.html' },
        { id: '图谱', icon: '🔗', href: '知识图谱.html' },
        { id: '源码', icon: '📄', href: '源码.html' },
        { id: '测试', icon: '🧪', href: '测试面板.html' },
        { id: '演示', icon: '💡', href: '演示.html' },
        { id: '审查', icon: '📝', href: '审查.html' }
      ]
    }).mount('#cross-nav-app');
  }
  if (window.YryCrossNav) mountCrossNav();
  else document.addEventListener('yry-cross-nav-ready', mountCrossNav, { once: true });`;
}

function genStatsGridMount(statItems) {
  if (!statItems.length) return '';
  const itemsJson = statItems.map(item => {
    const val = typeof item.value === 'string' ? `'${item.value}'` : item.value;
    const parts = [`value: ${val}`, `label: '${item.label}'`];
    if (item.modifier) parts.push(`modifier: '${item.modifier}'`);
    return `        { ${parts.join(', ')} }`;
  }).join(',\n');

  return `
  /* ── YryStatsGrid 挂载 ── */
  function mountStatsGrid() {
    if (!window.Vue || !window.YryStatsGrid) return;
    if (!document.getElementById('stats-grid-app')) return;
    Vue.createApp(window.YryStatsGrid, {
      items: [
${itemsJson}
      ]
    }).mount('#stats-grid-app');
  }
  if (window.YryStatsGrid) mountStatsGrid();
  else document.addEventListener('yry-stats-grid-ready', mountStatsGrid, { once: true });`;
}

function genBreadcrumbMount(bc, page) {
  const itemsJson = bc.items.map(item => {
    const parts = [`label: '${escHtml(item.label)}'`];
    if (item.href) parts.push(`href: '${item.href}'`);
    if (item.icon) parts.push(`icon: '${item.icon}'`);
    return `        { ${parts.join(', ')} }`;
  }).join(',\n');

  return `
  /* ── YryBreadcrumb 挂载 ── */
  function mountBreadcrumb() {
    if (!window.Vue || !window.YryBreadcrumb) return;
    if (!document.getElementById('breadcrumb-app')) return;
    Vue.createApp(window.YryBreadcrumb, {
      ariaLabel: '${escHtml(bc.ariaLabel)}',
      items: [
${itemsJson}
      ]
    }).mount('#breadcrumb-app');
  }
  if (window.YryBreadcrumb) mountBreadcrumb();
  else document.addEventListener('yry-breadcrumb-ready', mountBreadcrumb, { once: true });`;
}

function escHtml(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// ═══ Remove helpers ═══

/** Find the closing </div> for a <div> at startIdx, respecting nesting depth.
 *  Caller has already found the opening tag — start one level deep. */
function findClosingDiv(html, startIdx) {
  let depth = 1;
  let i = startIdx;
  while (i < html.length) {
    if (html.startsWith('<div', i)) {
      const next = html[i + 4];
      if (next === ' ' || next === '>') { depth++; i += 4; continue; }
    }
    if (html.startsWith('</div>', i)) {
      depth--;
      if (depth === 0) return i + 6;
      i += 6;
      continue;
    }
    i++;
  }
  return -1;
}

/** Remove a <div class="className"> block (with nested divs) from html */
function removeDivBlock(html, className) {
  const marker = `<div class="${className}">`;
  const idx = html.indexOf(marker);
  if (idx === -1) return html;
  const end = findClosingDiv(html, idx + marker.length);
  if (end === -1) return html;
  // Also consume trailing newline
  let trail = end;
  while (trail < html.length && html[trail] === '\n') trail++;
  return html.slice(0, idx) + html.slice(trail);
}

/** Remove the first occurrence of a regex match from html */
function removeBlock(html, re, label) {
  const match = html.match(re);
  if (!match) {
    console.log(`  ⚠ ${label} not found`);
    return html;
  }
  return html.replace(match[0], '');
}

// ═══ Main transform function ═══

function transformFile(filePath) {
  console.log(`\n📄 ${relative(SCENE_BASE, filePath)}`);
  let html = readFileSync(filePath, 'utf-8');

  if (alreadyTransformed(html)) {
    console.log('  ⏭  Already transformed, skipping');
    return { skipped: true };
  }

  const dir = sceneDir(filePath);
  const page = pageType(filePath);
  const smeta = SCENE_META[dir];
  const prefix = '../../../'; // all scene files use this

  if (!smeta) {
    console.log(`  ⚠ Unknown scene dir: ${dir}, skipping`);
    return { skipped: true };
  }

  // ═══ Step 1: Extract props from static HTML ═══
  const sh = extractSceneHeader(html);
  const sn = extractSceneNav(html, page.name);
  const cn = extractCrossNav(html);
  const sg = page.name === '计划清单' ? extractStatGrid(html) : { items: [], html: '' };
  const bc = extractBreadcrumb(html);

  // If scene-header accent not set from h1, use scene metadata
  if (!sh.accent) sh.accent = smeta.accent;
  // Scene 3 h1 is bare "计划清单" without icon — use page icon
  if (!sh.icon) sh.icon = page.icon;

  console.log(`  scene-header: icon="${sh.icon}" prefix="${sh.prefix}"`);
  console.log(`  scene-nav: ${sn.items.length} items`);
  console.log(`  cross-nav: active="${cn.active}"`);
  if (sg.items.length) console.log(`  stat-grid: ${sg.items.length} items`);
  console.log(`  breadcrumb: ${bc.items.length} items`);

  // ═══ Step 2: Remove yry-breadcrumb/index.js from <head> ═══
  html = html.replace(/<script src="\.\.\/\.\.\/\.\.\/yry-breadcrumb\/index\.js"><\/script>\n?/g, '');

  // ═══ Step 3: Add a11y styles ═══
  // Check if a11y styles already exist
  if (!html.includes('prefers-reduced-motion: reduce')) {
    html = html.replace(/(<style>\n?)/, '$1' + A11Y_STYLES);
  }

  // ═══ Step 4: Replace static scene-header with mount div ═══
  // Match: <div class="scene-header"> ... </div> (the closing </div> before scene-nav or next element)
  const shRe = /<div class="scene-header">[\s\S]*?<p class="scene-desc">[^<]*<\/p>\s*<\/div>/;
  if (shRe.test(html)) {
    html = html.replace(shRe, '<div id="scene-header-app"></div>');
    console.log('  ✓ scene-header replaced');
  } else {
    console.log('  ⚠ scene-header pattern not matched');
  }

  // ═══ Step 5: Replace static scene-nav ═══
  const snRe = /<(?:div|nav)\s+class="scene-nav"[^>]*>[\s\S]*?<\/(?:div|nav)>\n?/;
  if (snRe.test(html)) {
    html = html.replace(snRe, '<div id="scene-nav-app"></div>\n');
    console.log('  ✓ scene-nav replaced');
  } else {
    console.log('  ⚠ scene-nav pattern not matched');
  }

  // ═══ Step 6: Replace static cross-nav, or add mount div if missing ═══
  const cnRe = /<div class="cross-nav">[\s\S]*?<\/div>\n?/;
  if (cnRe.test(html)) {
    html = html.replace(cnRe, '<div id="cross-nav-app"></div>\n');
    console.log('  ✓ cross-nav replaced');
  } else {
    // Some source files lack cross-nav entirely — add mount div after scene-nav
    html = html.replace(/(<div id="scene-nav-app"><\/div>\n?)/, '$1\n<div id="cross-nav-app"></div>\n');
    console.log('  ✓ cross-nav mount added (was missing)');
  }

  // ═══ Step 7: Replace stat-grid + kpi-grid with stats-grid mount (计划清单 only) ═══
  if (page.name === '计划清单') {
    // Use depth-counting to remove nested stat-grid and kpi-grid divs
    if (html.includes('<div class="stat-grid">')) {
      html = removeDivBlock(html, 'stat-grid');
      console.log('  ✓ stat-grid removed');
    }
    if (html.includes('<div class="kpi-grid">')) {
      html = removeDivBlock(html, 'kpi-grid');
      html = html.replace(/<h2>KPI 指标<\/h2>\n?/, '<h2>KPI 指标</h2>\n<div id="stats-grid-app"></div>\n');
      console.log('  ✓ kpi-grid → stats-grid-app');
    }
  }

  // ═══ Step 8: Remove back-top button ═══
  const btRe = /<button class="back-top"[^>]*>[\s\S]*?<\/button>\n?/;
  html = html.replace(btRe, '');

  // ═══ Step 9: Remove entire combined <script> block (back-top JS + breadcrumb mount) ═══
  // These share one <script> tag in source files — must be removed together
  // Match: <script>\n...backTopBtn...scrollTo...mountBreadcrumb...yry-breadcrumb-ready...</script>
  const combinedJsRe = /<script>\nconst backTopBtn=[\s\S]*?document\.addEventListener\('yry-breadcrumb-ready',\s*mountBreadcrumb\s*,\s*\{\s*once\s*:\s*true\s*\}\);\n?\s*<\/script>\n?/;
  html = html.replace(combinedJsRe, '');
  console.log('  ✓ back-top button removed');

  // ═══ Step 10: Remove old shared.js script (will re-add in correct order) ═══
  html = html.replace(/<script src="\.\.\/\.\.\/\.\.\/shared\.js"><\/script>\n?/g, '');

  // ═══ Step 11: Insert loader scripts + mount scripts before </body> ═══
  const mountScripts = [
    genBreadcrumbMount(bc, page),
  ];
  // Only add scene-header mount if it was found
  if (sh.tag) mountScripts.unshift(genSceneHeaderMount(sh, page));
  // Only add scene-nav mount if items found
  if (sn.items.length) mountScripts.unshift(genSceneNavMount(sn.items));
  // Always add cross-nav mount (component handles missing mount div)
  mountScripts.unshift(genCrossNavMount(cn.active));
  // Add stats-grid mount for 计划清单 pages
  if (page.name === '计划清单' && sg.items.length) {
    mountScripts.push(genStatsGridMount(sg.items));
  }

  const bodyEndBlock = [
    '',
    loaderScripts(prefix),
    '',
    '  <!-- ════════════════════════════════════════════════════════════',
    '       页面级挂载 · 场景导航 + 交叉导航 + 面包屑 + 统计网格',
    '       index.js 异步加载模板后派发 yry-*-ready 事件',
    '       ════════════════════════════════════════════════════════════ -->',
    '  <script>',
    ...mountScripts.filter(Boolean),
    '  </script>',
    '',
  ].join('\n');

  // Insert before </body>
  html = html.replace('</body>', bodyEndBlock + '\n</body>');

  // ═══ Step 12: Remove duplicate empty lines (cosmetic) ═══
  html = html.replace(/\n{4,}/g, '\n\n\n');

  return { html, skipped: false, page, dir };
}

// ═══ Collect files ═══

function collectSceneFiles() {
  if (SINGLE_FILE) {
    if (!existsSync(SINGLE_FILE)) {
      console.error(`File not found: ${SINGLE_FILE}`);
      exit(1);
    }
    return [resolve(SINGLE_FILE)];
  }

  const files = [];
  const sceneDirs = readdirSync(SCENE_BASE, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('场景-'));

  for (const dir of sceneDirs) {
    const dirPath = join(SCENE_BASE, dir.name);
    const htmlFiles = readdirSync(dirPath)
      .filter(f => f.endsWith('.html'))
      .map(f => join(dirPath, f));
    files.push(...htmlFiles);
  }

  return files.sort();
}

// ═══ Verify ═══

function verify(html, filePath) {
  const checks = [];
  const rel = relative(SCENE_BASE, filePath);

  // Must have mount divs
  if (!html.includes('id="scene-header-app"')) checks.push('✗ missing scene-header-app');
  if (!html.includes('id="scene-nav-app"')) checks.push('✗ missing scene-nav-app');
  if (!html.includes('id="cross-nav-app"')) checks.push('✗ missing cross-nav-app');

  // Must NOT have static blocks
  if (html.includes('class="scene-header"')) checks.push('✗ static scene-header remains');
  if (html.includes('class="scene-nav"')) checks.push('✗ static scene-nav remains');
  if (html.includes('class="cross-nav"')) checks.push('✗ static cross-nav remains');
  if (html.includes('class="back-top"')) checks.push('✗ static back-top remains');

  // Must have loaders in correct order (check only <script src> tags, not page content refs)
  const loaderOrder = ['yry-scene-nav', 'yry-cross-nav', 'yry-back-top', 'yry-breadcrumb', 'yry-scene-header', 'yry-stats-grid'];
  const loaderPositions = loaderOrder.map(name => {
    const re = new RegExp(`<script src="[^"]*${name}/index\\.js"></script>`);
    const m = html.match(re);
    return m ? html.indexOf(m[0]) : Infinity;
  });
  for (let i = 1; i < loaderPositions.length; i++) {
    if (loaderPositions[i - 1] > loaderPositions[i]) {
      checks.push(`✗ loader order wrong: ${loaderOrder[i - 1]} after ${loaderOrder[i]}`);
      break;
    }
  }

  // Must NOT have yry-breadcrumb/index.js in <head>
  const headEnd = html.indexOf('</head>');
  const headContent = html.substring(0, headEnd);
  if (headContent.includes('yry-breadcrumb/index.js')) {
    checks.push('✗ yry-breadcrumb/index.js still in <head>');
  }

  // Must have getElementById guards (e.g. getElementById('breadcrumb-app'))
  const mountFnCount = (html.match(/getElementById\('[^']+-app'\)/g) || []).length;
  if (mountFnCount < 3) checks.push(`✗ only ${mountFnCount} getElementById guards (expected ≥3)`);

  // Must have shared.js
  if (!html.includes('shared.js')) checks.push('✗ missing shared.js');

  // Must have a11y styles
  if (!html.includes('prefers-reduced-motion')) checks.push('✗ missing a11y styles');

  return checks;
}

// ═══ Main ═══

console.log('═'.repeat(60));
console.log('YryBreadcrumb Scene Transformer');
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (.transformed.html)' : SINGLE_FILE ? 'SINGLE FILE' : 'OVERWRITE'}`);
console.log('═'.repeat(60));

const files = collectSceneFiles();
console.log(`\nFound ${files.length} scene file(s)\n`);

let transformed = 0;
let skipped = 0;
const errors = [];

for (const filePath of files) {
  try {
    const result = transformFile(filePath);

    if (result.skipped) {
      skipped++;
      continue;
    }

    // Verify
    const checks = verify(result.html, filePath);
    if (checks.length > 0) {
      console.log('  ⚠ Verification issues:');
      checks.forEach(c => console.log(`    ${c}`));
    } else {
      console.log('  ✅ All checks passed');
    }

    // Write
    const outPath = DRY_RUN ? filePath.replace('.html', '.transformed.html') : filePath;
    writeFileSync(outPath, result.html, 'utf-8');
    transformed++;

  } catch (err) {
    console.error(`  ❌ Error: ${err.message}`);
    errors.push({ file: filePath, error: err.message });
  }
}

console.log(`\n${'═'.repeat(60)}`);
console.log(`Transformed: ${transformed} | Skipped: ${skipped} | Errors: ${errors.length}`);
if (DRY_RUN) console.log('(Dry run — .transformed.html files created)');
console.log('═'.repeat(60));

if (errors.length) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  ❌ ${relative(SCENE_BASE, e.file)}: ${e.error}`));
  exit(1);
}