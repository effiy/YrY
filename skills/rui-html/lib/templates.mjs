/**
 * templates.mjs — Template catalog and token definitions for rui-docs
 *
 * Defines:
 * - Available document types and their categories
 * - CDN loading chains per category
 * - Token variable definitions
 * - Page metadata (icons, labels) for each doc type
 */

import { readFileSync } from "node:fs";
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

/** Category B has no external scripts beyond shared.js */
export const CATEGORY_B_SCRIPTS = {};

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

/** Generate breadcrumb HTML for a page */
export function buildBreadcrumb(ctx, docType) {
  const meta = PAGE_META[docType];
  const d = ctx.cdnDepth || '../../../../';
  return `<nav class="yry-breadcrumb"><a href="${d}docs/index.html">📄 文档中心</a><span class="yry-bc-sep">/</span><span class="yry-bc-current">${ctx.storyName} · ${ctx.storyTitle}</span><span class="yry-bc-sep">/</span><span class="yry-bc-current">场景 ${ctx.sceneNum} · ${ctx.sceneSlug}</span><span class="yry-bc-sep">/</span><span class="yry-bc-current">${meta.icon} ${meta.label}</span></nav>`;
}

/** Generate cross-nav HTML for a page (current page marked as "on") */
export function buildCrossNav(ctx, currentDocType) {
  let html = '<div class="yry-cross-nav">';
  for (let i = 0; i < DOC_TYPES.length; i++) {
    const dt = DOC_TYPES[i];
    const meta = PAGE_META[dt];
    if (i > 0) html += '<span class="yry-cross-sep">·</span>';
    if (dt === currentDocType) {
      html += `<span class="yry-cross-link on">${meta.icon} ${meta.shortLabel}</span>`;
    } else {
      html += `<a class="yry-cross-link" href="${dt}.html">${meta.icon} ${meta.shortLabel}</a>`;
    }
  }
  html += '</div>';
  return html;
}

/** Generate <head> block for a template */
export function buildHeadBlock(ctx, docType) {
  const cat = getCategory(docType);
  const meta = PAGE_META[docType];
  const d = ctx.cdnDepth || '../../../../';

  let head = '<meta charset="UTF-8">\n';
  head += '<meta name="viewport" content="width=device-width,initial-scale=1.0">\n';
  head += `<title>${ctx.sceneSlug} · ${meta.label}</title>\n`;

  // Category-specific CSS
  for (const css of CATEGORY_CSS[cat]) {
    const href = css.href.replace('{{CDN_DEPTH}}', d);
    head += `<link rel="stylesheet" href="${href}">\n`;
  }

  // Category B gets shared inline styles (avoids per-template duplication)
  if (cat === 'B') {
    const sharedCss = readFileSync(join(__dirname, '..', 'templates', 'shared-b.css'), 'utf-8');
    head += `<style>\n${sharedCss}</style>\n`;
  }

  // Category B checklist gets extra CSS
  if (docType === '计划清单') {
    head += `<link rel="stylesheet" href="${d}cdn/yry-checklist.css">\n`;
  }

  // Category A gets shared inline styles (Mono theme, breadcrumb, cross-nav, toolbar, cards)
  if (cat === 'A') {
    const sharedACss = readFileSync(join(__dirname, '..', 'templates', 'shared-a.css'), 'utf-8');
    head += `<style>\n${sharedACss}</style>\n`;
  }

  // External scripts in head
  const extScripts = cat === 'A' ? (CATEGORY_A_SCRIPTS[docType] || []) : [];
  for (const s of extScripts) {
    head += `<script src="${s.src}"></script>\n`;
  }

  return head;
}

/** List all available templates */
export function listTemplates() {
  return DOC_TYPES.map(dt => ({
    name: dt,
    category: getCategory(dt),
    ...PAGE_META[dt],
  }));
}
