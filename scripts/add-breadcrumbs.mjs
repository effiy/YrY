#!/usr/bin/env node
/**
 * Add breadcrumb navigation to all HTML files under docs/.
 * Run: node scripts/add-breadcrumbs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, '..', 'docs');

// ── Breadcrumb label mappings ──────────────
const SCENE_LABELS = {
  '场景-1-模块定位':           '场景 1 · 模块定位与职责',
  '场景-2-数据流追踪':         '场景 2 · 数据流与追踪',
  '场景-3-新人上手':           '场景 3 · 新人上手与开发指南',
  '场景-4-依赖变更影响':       '场景 4 · 依赖变更影响分析',
  '场景-1-init后全量自检':     '场景 1 · init 后全量自检',
  '场景-2-commit前增量自检':   '场景 2 · commit 前增量自检',
  '场景-3-文档代码一致性校验': '场景 3 · 文档代码一致性校验',
  '场景-4-安全面回归自检':     '场景 4 · 安全面回归自检',
};

const STORY_LABELS = {
  'yry-arch':      'yry-arch · 系统架构知识固化',
  'yry-self-test': 'yry-self-test · 自主测试方案',
};

const PAGE_LABELS = {
  '计划清单': '📋 计划清单',
  '架构图':   '📐 架构图',
  '知识图谱': '🔗 知识图谱',
  '测试面板': '🧪 测试面板',
  '交互示例': '💡 交互示例',
  '计划':     '📋 实施计划',
  'index':    '概览',
};

// ── Breadcrumb CSS (dark theme, matches --bg/#020617) ──
const BREADCRUMB_CSS = `
/* ── Breadcrumb ─────────────────────────── */
.breadcrumb {
  display: flex; align-items: center; flex-wrap: wrap; gap: 6px;
  margin-bottom: 1.25rem; font-size: 0.76rem;
}
.breadcrumb a {
  color: #7aa2f7; text-decoration: none; transition: color 0.15s;
}
.breadcrumb a:hover { color: #fbbf24; text-decoration: underline; }
.breadcrumb .bc-sep { color: #53576c; opacity: 0.5; user-select: none; }
.breadcrumb .bc-current { color: #94a3b8; font-weight: 500; }`;

// ── Helpers ─────────────────────────────────
function findFiles(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full, acc);
    else if (entry.name.endsWith('.html')) acc.push(full);
  }
  return acc;
}

function buildBreadcrumb(filePath) {
  const relative = path.relative(docsDir, filePath);
  const parts = relative.split(path.sep);
  // parts: 故事任务面板 / {story} / [{scene-dir} /] file.html

  const items = [];
  const depth = parts.length; // 3 = story-level, 4 = scene-level

  // Link back to docs/index.html
  const docsIndex = (depth === 3) ? '../../index.html' : '../../../index.html';
  items.push({ label: '📄 文档中心', href: docsIndex });

  if (depth >= 3) {
    // parts[0] = 故事任务面板, parts[1] = story-name
    const storyDir = parts[1]; // yry-arch or yry-self-test
    const storyPlanHref = (depth === 3) ? '计划.html' : '../计划.html';
    items.push({ label: STORY_LABELS[storyDir] || storyDir, href: storyPlanHref });
  }

  if (depth >= 4) {
    // parts[2] = scene-dir
    const sceneDir = parts[2];
    const sceneLabel = SCENE_LABELS[sceneDir] || sceneDir.replace(/^场景-\d+-/, '场景 · ');
    // Link to scene index if it exists, otherwise unlinked
    const sceneIndexPath = path.join(path.dirname(filePath), 'index.html');
    if (fs.existsSync(sceneIndexPath)) {
      items.push({ label: sceneLabel, href: 'index.html' });
    } else {
      // Scene index doesn't exist — show as current-like text (but still navigable)
      // Actually just make it a non-link span
      items.push({ label: sceneLabel, href: null });
    }
  }

  // Current page
  const baseName = path.basename(filePath, '.html');
  if (depth >= 4 || baseName === '计划') {
    const pageLabel = PAGE_LABELS[baseName] || baseName;
    items.push({ label: pageLabel, href: null, current: true });
  }

  // Build HTML
  const parts_html = items.map((item, i) => {
    const isLast = i === items.length - 1;
    if (isLast || item.href === null || item.current) {
      return `<span class="bc-current">${item.label}</span>`;
    }
    return `<a href="${item.href}">${item.label}</a>`;
  });

  // Join with separators
  let html = '<nav class="breadcrumb">';
  for (let i = 0; i < parts_html.length; i++) {
    if (i > 0) html += '<span class="bc-sep">/</span>';
    html += parts_html[i];
  }
  html += '</nav>';
  return html;
}

function addBreadcrumbToFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has breadcrumb
  if (content.includes('class="breadcrumb"')) {
    console.log(`  [skip] already has breadcrumb: ${path.relative(docsDir, filePath)}`);
    return;
  }

  // 1. Add CSS before </style>
  if (!content.includes('/* ── Breadcrumb ──')) {
    content = content.replace('</style>', `${BREADCRUMB_CSS}\n</style>`);
  }

  // 2. Add breadcrumb HTML inside .container, before header/第一内容元素
  const breadcrumbHTML = buildBreadcrumb(filePath);

  // Find .container > (header or .header or first element)
  // Try several insertion patterns — from most specific to most general
  const patterns = [
    // Pattern: <div class="container" id="rc">\n<div class="header">  (architecture diagrams)
    /(<div class="container"[^>]*>\s*)(<div class="header")/s,
    // Pattern: <div class="container">\n    <header>
    /(<div class="container">\s*)(<header)/s,
    // Pattern: <div class="container">\n    <div class="header
    /(<div class="container">\s*)(<div class="header)/s,
    // Pattern: <div class="container">\n    <h1
    /(<div class="container">\s*)(<h1)/s,
    // Pattern: <div class="container">\n    <div
    /(<div class="container">\s*)(<div)/s,
  ];

  let inserted = false;
  for (const pattern of patterns) {
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1${breadcrumbHTML}\n$2`);
      inserted = true;
      break;
    }
  }

  if (!inserted) {
    // Fallback: insert after <body> or after opening container
    if (content.includes('<div class="container">')) {
      content = content.replace(
        /(<div class="container">)/,
        `$1\n${breadcrumbHTML}`
      );
      inserted = true;
    }
  }

  if (!inserted) {
    console.log(`  [WARN] could not find insertion point: ${path.relative(docsDir, filePath)}`);
    return;
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`  [OK] ${path.relative(docsDir, filePath)}`);
}

// ── Main ────────────────────────────────────
console.log('Adding breadcrumbs to HTML files under docs/...\n');

const files = findFiles(docsDir);
console.log(`Found ${files.length} HTML files\n`);

for (const filePath of files) {
  addBreadcrumbToFile(filePath);
}

console.log('\nDone.');
