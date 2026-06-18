/**
 * templates.mjs — Template catalog and token definitions for rui-docs
 *
 * Defines:
 * - Available document types and their categories
 * - CDN loading chains per category
 * - Token variable definitions
 * - Page metadata (icons, labels) for each doc type
 */

import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ═══ Document Type Catalog ═══

export const CATEGORY_A = ['架构图', '知识图谱'];
export const CATEGORY_B = ['计划清单', '源码', '测试面板', '演示', '审查'];

// Reference cross-nav order: 清单·架构·图谱·源码·测试·演示·审查
export const DOC_TYPES = ['计划清单', '架构图', '知识图谱', '源码', '测试面板', '演示', '审查'];

/** Page metadata for cross-nav and breadcrumb */
export const PAGE_META = {
  '计划清单':  { icon: '📋', label: '计划清单', shortLabel: '清单', css: 'shared.css + theme.css + yry-checklist.css' },
  '架构图':    { icon: '📐', label: '架构图',   shortLabel: '架构', css: 'fonts.css + shared.css + theme-mono.css' },
  '知识图谱':  { icon: '🔗', label: '知识图谱', shortLabel: '图谱', css: 'fonts.css + shared.css + theme-mono.css' },
  '源码':      { icon: '📄', label: '源码',     shortLabel: '源码', css: 'shared.css + theme.css' },
  '测试面板':  { icon: '🧪', label: '测试面板', shortLabel: '测试', css: 'shared.css + theme.css' },
  '演示':      { icon: '💡', label: '演示',     shortLabel: '演示', css: 'shared.css + theme.css' },
  '审查':      { icon: '📝', label: '审查',     shortLabel: '审查', css: 'shared.css + theme.css' },
};

/** Category determines CSS load chain */
export const CATEGORY_CSS = {
  A: [
    { href: '{{CDN_DEPTH}}cdn/fonts.css', rel: 'stylesheet' },
    { href: '{{CDN_DEPTH}}cdn/shared.css', rel: 'stylesheet' },
    { href: '{{CDN_DEPTH}}cdn/theme-mono.css', rel: 'stylesheet' },
  ],
  B: [
    { href: '{{CDN_DEPTH}}cdn/shared.css', rel: 'stylesheet' },
    { href: '{{CDN_DEPTH}}cdn/theme.css', rel: 'stylesheet' },
  ],
};

/** Category A needs external CDN scripts */
export const CATEGORY_A_SCRIPTS = {
  '架构图': [
    { src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js' },
    { src: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js' },
  ],
  '知识图谱': [
    { src: 'https://cdn.jsdelivr.net/npm/cytoscape@3.28.1/dist/cytoscape.min.js' },
    { src: 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js' },
    { src: 'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js' },
  ],
};


/** Get category for a doc type */
export function getCategory(docType) {
  return CATEGORY_A.includes(docType) ? 'A' : 'B';
}

/** Get the shared token context that applies to all 7 files in a scene */
export function buildSharedContext(ctx) {
  const cdnDepth = '../../../../'; // docs/故事任务面板/<story>/场景-N-<slug>/ → project root
  return {
    ...ctx,
    cdnDepth,
  };
}

/** Generate breadcrumb HTML for a page (legacy CSS approach) */
export function buildBreadcrumb(ctx, docType) {
  const meta = PAGE_META[docType];
  const d = ctx.cdnDepth || '../../../../';
  return `<nav class="yry-breadcrumb"><a href="${d}docs/index.html">📄 文档中心</a><span class="yry-bc-sep">/</span><span class="yry-bc-current">${ctx.storyName} · ${ctx.storyTitle}</span><span class="yry-bc-sep">/</span><span class="yry-bc-current">场景 ${ctx.sceneNum} · ${ctx.sceneSlug}</span><span class="yry-bc-sep">/</span><span class="yry-bc-current">${meta.icon} ${meta.label}</span></nav>`;
}

/** Generate breadcrumb data as JSON array (for YrySceneChrome component) */
export function buildBreadcrumbJSON(ctx, docType) {
  const meta = PAGE_META[docType];
  const d = ctx.cdnDepth || '../../../../';
  return JSON.stringify([
    { label: '📄 文档中心', href: `${d}docs/index.html` },
    { label: `${ctx.storyName} · ${ctx.storyTitle}` },
    { label: `场景 ${ctx.sceneNum} · ${ctx.sceneSlug}` },
    { label: `${meta.icon} ${meta.label}` },
  ]);
}

/** Generate cross-nav HTML for a page (legacy CSS approach) */
export function buildCrossNav(ctx, currentDocType) {
  const parts = ['<div class="yry-cross-nav">'];
  for (let i = 0; i < DOC_TYPES.length; i++) {
    const dt = DOC_TYPES[i];
    const meta = PAGE_META[dt];
    if (i > 0) parts.push('<span class="yry-cross-sep">·</span>');
    if (dt === currentDocType) {
      parts.push(`<span class="yry-cross-link on">${meta.icon} ${meta.shortLabel}</span>`);
    } else {
      parts.push(`<a class="yry-cross-link" href="${dt}.html">${meta.icon} ${meta.shortLabel}</a>`);
    }
  }
  parts.push('</div>');
  return parts.join('');
}

/** Generate cross-nav data as JSON array (for YrySceneChrome component) */
export function buildCrossNavJSON(ctx, currentDocType) {
  const items = DOC_TYPES.map(dt => {
    const meta = PAGE_META[dt];
    return dt === currentDocType
      ? { label: `${meta.icon} ${meta.shortLabel}`, active: true }
      : { label: `${meta.icon} ${meta.shortLabel}`, href: `${dt}.html` };
  });
  return JSON.stringify(items);
}

/** Generate <head> block for a template */
export function buildHeadBlock(ctx, docType) {
  const cat = getCategory(docType);
  const meta = PAGE_META[docType];
  const d = ctx.cdnDepth || '../../../../';

  const head = [
    '<meta charset="UTF-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1.0">',
    `<title>${ctx.sceneSlug} · ${meta.label}</title>`,
  ];

  for (const css of CATEGORY_CSS[cat]) {
    const href = css.href.replace('{{CDN_DEPTH}}', d);
    head.push(`<link rel="stylesheet" href="${href}">`);
  }

  const CAT_B_BASE = {
    '计划清单': 'yry-plan-base.css',
    '源码': 'yry-source-base.css',
    '测试面板': 'yry-test-base.css',
    '演示': 'yry-demo.css',
    '审查': 'yry-review-base.css',
  };
  if (cat === 'B' && CAT_B_BASE[docType]) {
    head.push(`<link rel="stylesheet" href="${d}cdn/${CAT_B_BASE[docType]}">`);
  }

  if (docType === '计划清单') {
    head.push(`<link rel="stylesheet" href="${d}cdn/yry-checklist.css">`);
  }

  const CAT_A_BASE = {
    '架构图': 'yry-arch-base.css',
    '知识图谱': 'yry-graph-base.css',
  };
  if (cat === 'A' && CAT_A_BASE[docType]) {
    head.push(`<link rel="stylesheet" href="${d}cdn/${CAT_A_BASE[docType]}">`);
  }

  const extScripts = cat === 'A' ? (CATEGORY_A_SCRIPTS[docType] || []) : [];
  for (const s of extScripts) {
    head.push(`<script src="${s.src}"></script>`);
  }

  return head.join('\n');
}
