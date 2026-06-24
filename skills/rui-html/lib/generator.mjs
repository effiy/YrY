/**
 * generator.mjs — Template rendering engine for rui-docs
 *
 * Reads HTML templates, replaces {{TOKEN}} placeholders with extracted data,
 * and writes output files to scene directories.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildSharedContext,
  buildBreadcrumb,
  buildCrossNav,
  buildBreadcrumbJSON,
  buildCrossNavJSON,
  buildHeadBlock,
  getCategory,
} from './templates.mjs';
import { markdownToHtml, escapeHtml } from './extractor.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', 'templates');

/**
 * Generate a single HTML document for a scene.
 *
 * @param {Object} ctx - Scene context from extractor
 * @param {string} docType - One of the 7 doc type names
 * @param {string} scenePath - Absolute path to the scene directory
 * @returns {{ generated: boolean, skipped: boolean, error?: string }}
 */
export function generateSceneDocs(ctx, docType, scenePath) {
  const outputPath = join(scenePath, `${docType}.html`);

  // Safety: skip if exists and not forced
  if (existsSync(outputPath) && !ctx.force) {
    return { generated: false, skipped: true };
  }

  // Backup existing file if forcing
  if (existsSync(outputPath) && ctx.force) {
    const bakPath = outputPath + '.bak';
    copyFileSync(outputPath, bakPath);
  }

  // Build shared context
  const sharedCtx = buildSharedContext(ctx);

  // Read and render template
  const templatePath = getTemplatePath(docType);
  if (!existsSync(templatePath)) {
    return { generated: false, error: `模板文件不存在: ${templatePath}` };
  }

  let template = readFileSync(templatePath, 'utf-8');

  // Replace all tokens
  const html = renderTemplate(template, sharedCtx, docType);

  // Write output
  writeFileSync(outputPath, html, 'utf-8');

  return { generated: true, skipped: false };
}

/**
 * Get the template file path for a document type.
 */
function getTemplatePath(docType) {
  const cat = getCategory(docType);
  const catDir = cat === 'A' ? 'cat-a' : 'cat-b';
  return join(TEMPLATES_DIR, catDir, `${docType}.html`);
}

/**
 * Render a template by replacing all {{TOKEN}} placeholders.
 */
function renderTemplate(template, ctx, docType) {
  // Build dynamic fragments
  const breadcrumb = buildBreadcrumb(ctx, docType);
  const crossNav = buildCrossNav(ctx, docType);
  const breadcrumbJSON = buildBreadcrumbJSON(ctx, docType);
  const crossNavJSON = buildCrossNavJSON(ctx, docType);
  const headBlock = buildHeadBlock(ctx, docType);

  // Section content converted to HTML
  const sec0Html = ctx.sections?.sec0 ? markdownToHtml(ctx.sections.sec0) : placeholderHtml();
  const sec1Html = ctx.sections?.sec1 ? markdownToHtml(ctx.sections.sec1) : placeholderHtml();
  const sec2Html = ctx.sections?.sec2 ? markdownToHtml(ctx.sections.sec2) : placeholderHtml();
  const sec3Html = ctx.sections?.sec3 ? markdownToHtml(ctx.sections.sec3) : placeholderHtml();
  const sec4Html = ctx.sections?.sec4 ? markdownToHtml(ctx.sections.sec4) : placeholderHtml();

  // Mermaid blocks
  const mermaidHtml = ctx.mermaidBlocks?.length
    ? ctx.mermaidBlocks.map(b => `<pre class="mermaid">${escapeHtml(b.code)}</pre>`).join('\n')
    : '';

  // Stats data
  const statsGridJSON = buildStatsGridJSON(ctx, docType);
  const healthBarJSON = buildHealthBarJSON(ctx, docType);

  // Replace tokens
  const replacements = {
    '{{STORY_NAME}}':     ctx.storyName,
    '{{STORY_TITLE}}':    ctx.storyTitle,
    '{{SCENE_NUM}}':      String(ctx.sceneNum),
    '{{SCENE_SLUG}}':     ctx.sceneSlug,
    '{{SCENE_TITLE}}':    ctx.sceneTitle,
    '{{PAGE_TITLE}}':     `${ctx.sceneSlug} · ${docType}`,
    '{{VERSION}}':        ctx.version,
    '{{DATE}}':           ctx.date,
    '{{CDN_DEPTH}}':      ctx.cdnDepth,
    '{{BREADCRUMB}}':     breadcrumb,
    '{{CROSS_NAV}}':      crossNav,
    '{{BREADCRUMB_JSON}}': breadcrumbJSON,
    '{{CROSS_NAV_JSON}}':  crossNavJSON,
    '{{HEAD_BLOCK}}':     headBlock,
    '{{MERMAID_BLOCKS}}': mermaidHtml,
    '{{SEC0_HTML}}':      sec0Html,
    '{{SEC1_HTML}}':      sec1Html,
    '{{SEC2_HTML}}':      sec2Html,
    '{{SEC3_HTML}}':      sec3Html,
    '{{SEC4_HTML}}':      sec4Html,
    '{{STATS_GRID_JSON}}': statsGridJSON,
    '{{HEALTH_BAR_JSON}}': healthBarJSON,
    '{{OVERVIEW}}':       ctx.overview ? markdownToHtml(ctx.overview) : '',
  };

  for (const [token, value] of Object.entries(replacements)) {
    template = template.split(token).join(value);
  }

  return template;
}

function placeholderHtml() {
  return '<div class="yry-placeholder" style="padding:2rem;text-align:center;color:var(--yry-text3);background:var(--yry-bg-flat);border-radius:8px;margin:1rem 0">数据待填充 — 运行 /rui code 生成</div>';
}

/** Build stats data as JSON array (for YrySceneStats component) */
function buildStatsGridJSON(ctx, docType) {
  const { tables } = ctx;

  switch (docType) {
    case '测试面板': {
      const totalTests = extractTableValue(tables, '断言总数') || extractTableValue(tables, '断言') || '—';
      const passed = extractTableValue(tables, '通过') || '—';
      const failed = extractTableValue(tables, '失败') || '0';
      const skipped = extractTableValue(tables, '跳过') || '0';
      const duration = extractTableValue(tables, '执行耗时') || '—';
      return JSON.stringify([
        { value: totalTests, label: '总断言', color: 't' },
        { value: passed, label: '通过', color: 'p' },
        { value: failed, label: '失败', color: 'f' },
        { value: skipped, label: '跳过', color: 's' },
        { value: duration, label: '耗时', color: 'info' },
      ]);
    }
    case '审查': {
      const passCount = countDiagnosticPasses(tables);
      return JSON.stringify([
        { value: `${passCount}/8`, label: '诊断通过', color: 'health' },
        { value: 'D0-D8', label: '覆盖范围', color: 't' },
        { value: 8 - passCount, label: '改进建议', color: 'warn-h' },
      ]);
    }
    case '计划清单': {
      const sceneCount = countTableRows(tables, 'TC-');
      return JSON.stringify([
        { value: ctx.sceneNum, label: '场景序号', color: 'health' },
        { value: sceneCount || '—', label: '测试用例', color: 't' },
        { value: `v${ctx.version}`, label: '版本', color: 't' },
      ]);
    }
    case '源码': {
      const artifactCount = countArtifactRows(tables);
      return JSON.stringify([
        { value: artifactCount || '—', label: '产物文件', color: 'info' },
        { value: ctx.sceneNum, label: '场景', color: 't' },
        { value: `v${ctx.version}`, label: '版本', color: 't' },
      ]);
    }
    case '演示': {
      return JSON.stringify([
        { value: ctx.mermaidBlocks?.length || 0, label: '流程图', color: 'info' },
        { value: countTableRows(tables), label: '数据表', color: 't' },
        { value: `v${ctx.version}`, label: '版本', color: 't' },
      ]);
    }
    default:
      return JSON.stringify([
        { value: ctx.sceneNum, label: '场景', color: 't' },
        { value: `v${ctx.version}`, label: '版本', color: 't' },
      ]);
  }
}

function buildHealthBarJSON(ctx, docType) {
  if (docType === '审查') {
    const passCount = countDiagnosticPasses(ctx.tables);
    const pct = Math.round((passCount / 8) * 100);
    return JSON.stringify([
      { pct, cls: 'strength' },
      { pct: 100 - pct, cls: 'gap' },
    ]);
  }
  if (docType === '测试面板') {
    const total = parseInt(extractTableValue(ctx.tables, '断言总数') || '0', 10);
    const passed = parseInt(extractTableValue(ctx.tables, '通过') || '0', 10);
    if (total > 0) {
      const pctP = Math.round((passed / total) * 100);
      return JSON.stringify([
        { pct: pctP, cls: 'p' },
        { pct: 100 - pctP, cls: 'f' },
      ]);
    }
  }
  return '';
}

// ═══ Table extraction helpers ═══

function extractTableValue(tables, label) {
  if (!tables) return null;
  for (const table of tables) {
    for (const row of table.rows) {
      if (row.some(cell => cell.includes(label))) {
        const idx = row.findIndex(cell => cell.includes(label));
        if (idx >= 0 && idx + 1 < row.length) return row[idx + 1] || row[idx];
        return row[1] || row[0];
      }
    }
  }
  return null;
}

function countTableRows(tables, prefix = '') {
  if (!tables) return 0;
  let count = 0;
  for (const table of tables) {
    for (const row of table.rows) {
      if (!prefix || row.some(cell => cell.startsWith(prefix))) {
        count++;
      }
    }
  }
  return count;
}

function countDiagnosticPasses(tables) {
  if (!tables) return 0;
  let passes = 0;
  for (const table of tables) {
    for (const row of table.rows) {
      if (row.some(cell => cell.includes('✅'))) passes++;
    }
  }
  return passes;
}

function countArtifactRows(tables) {
  if (!tables) return 0;
  for (const table of tables) {
    const headerStr = table.headers.join(' ');
    if (headerStr.includes('文件') && (headerStr.includes('行数') || headerStr.includes('职责'))) {
      return table.rows.length;
    }
  }
  return 0;
}
