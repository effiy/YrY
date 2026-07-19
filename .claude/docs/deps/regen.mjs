import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../..');
const docsDataPath = path.join(root, '.claude/docs/data.js');
const generatedAt = '2026-07-19';

const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Catalog Report</title>
  <link rel="stylesheet" href="index.css">
  <script src="data.js"></script>
  <script defer src="index.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>
`;

const pageCss = `@layer reset, tokens, base, layout, components, utilities, responsive;
@layer reset {
  *, *::before, *::after { box-sizing: border-box; }
  html, body, h1, h2, h3, p, ul, ol, table { margin: 0; }
  ul { padding: 0; list-style: none; }
  table { border-collapse: collapse; }
  a { color: inherit; }
}
@layer tokens {
  :root {
    --bg: #020617;
    --panel: rgba(15, 23, 42, 0.72);
    --border: #1e293b;
    --border-strong: #334155;
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --text-dim: #64748b;
    --cyan: #22d3ee;
    --green: #34d399;
    --amber: #fbbf24;
    --violet: #a78bfa;
    --rose: #fb7185;
    --font: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    --content-max: 1180px;
    --radius: 18px;
  }
}
@layer base {
  html { color-scheme: dark; scroll-behavior: smooth; }
  body {
    min-height: 100vh;
    background:
      radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 28%),
      radial-gradient(circle at top right, rgba(167, 139, 250, 0.08), transparent 24%),
      var(--bg);
    color: var(--text);
    font-family: var(--font);
    padding: 32px 20px 56px;
    line-height: 1.6;
  }
  code { color: var(--cyan); }
  :focus-visible { outline: 2px solid var(--cyan); outline-offset: 2px; }
}
@layer layout {
  .page { max-width: var(--content-max); margin: 0 auto; }
  .header { display: grid; gap: 12px; margin-bottom: 22px; }
  .header-top { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
  .pulse { width: 12px; height: 12px; border-radius: 999px; background: var(--cyan); box-shadow: 0 0 12px rgba(34, 211, 238, 0.55); }
  .title-wrap { display: grid; gap: 6px; min-width: 0; }
  .title { font-size: clamp(24px, 3vw, 34px); line-height: 1.2; }
  .subtitle { color: var(--text-muted); font-size: 14px; }
  .header-links { margin-left: auto; display: flex; gap: 10px; flex-wrap: wrap; }
  .header-links a {
    padding: 8px 12px; border: 1px solid var(--border); border-radius: 999px;
    background: rgba(15, 23, 42, 0.6); text-decoration: none; color: var(--text-muted); font-size: 12px;
  }
  .header-links a:hover { border-color: var(--border-strong); color: var(--text); }
  .grid { display: grid; gap: 16px; }
  .metrics { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); margin-bottom: 18px; }
  .cards { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
  .split { display: grid; grid-template-columns: 1.2fr 0.9fr; gap: 16px; margin-top: 18px; }
  .section { margin-top: 18px; }
}
@layer components {
  .panel {
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    box-shadow: 0 18px 48px rgba(2, 6, 23, 0.25);
  }
  .panel-title { font-size: 14px; margin-bottom: 10px; }
  .panel-sub { color: var(--text-muted); font-size: 12px; margin-bottom: 14px; }
  .metric { display: grid; gap: 6px; }
  .metric-label { color: var(--text-dim); font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; }
  .metric-value { font-size: 22px; font-weight: 700; }
  .metric-sub { color: var(--text-muted); font-size: 12px; }
  .tone-cyan { color: var(--cyan); }
  .tone-green { color: var(--green); }
  .tone-amber { color: var(--amber); }
  .tone-violet { color: var(--violet); }
  .tone-rose { color: var(--rose); }
  .summary-list li { color: var(--text-muted); font-size: 13px; padding-left: 14px; position: relative; margin-top: 8px; }
  .summary-list li::before { content: ''; position: absolute; left: 0; top: 9px; width: 6px; height: 6px; border-radius: 999px; background: var(--text-dim); }
  .table-wrap { overflow-x: auto; }
  .table { width: 100%; font-size: 12px; }
  .table th { text-align: left; color: var(--text-dim); border-bottom: 1px solid var(--border); padding: 10px 8px; font-weight: 600; }
  .table td { padding: 10px 8px; border-bottom: 1px solid rgba(51, 65, 85, 0.4); vertical-align: top; color: var(--text-muted); }
  .footer { margin-top: 20px; color: var(--text-dim); font-size: 12px; text-align: center; }
  .svg-shell { overflow-x: auto; }
  .svg-shell svg { width: 100%; min-width: 960px; height: auto; display: block; }
  .toc { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
  .toc a {
    color: var(--text-muted); text-decoration: none; border: 1px solid var(--border);
    background: rgba(15, 23, 42, 0.55); border-radius: 999px; padding: 6px 10px; font-size: 12px;
  }
  .toc a:hover { color: var(--text); border-color: var(--border-strong); }
  .link-list { display: grid; gap: 10px; }
  .link-list a {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 10px 12px; border: 1px solid var(--border); border-radius: 12px;
    text-decoration: none; background: rgba(15, 23, 42, 0.48);
  }
  .link-list a:hover { border-color: var(--border-strong); }
  .link-label { color: var(--text); }
  .link-href { color: var(--text-dim); font-size: 11px; }
}
@layer utilities {
  .muted { color: var(--text-muted); }
}
@layer responsive {
  @media (max-width: 920px) {
    .split { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    body { padding: 20px 14px 40px; }
    .header-links { margin-left: 0; }
    .metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 480px) {
    .metrics { grid-template-columns: 1fr; }
  }
}
`;

const pageJs = `(function () {
  'use strict';
  var data = window.REPORT_DATA || {};
  var app = document.getElementById('app');
  if (!app) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function metricCard(metric) {
    return '<article class="panel metric">' +
      '<div class="metric-label">' + esc(metric.label) + '</div>' +
      '<div class="metric-value tone-' + esc(metric.tone || 'cyan') + '">' + esc(metric.value) + '</div>' +
      '<div class="metric-sub">' + esc(metric.sub || '') + '</div>' +
    '</article>';
  }

  function summaryCard(card) {
    return '<article class="panel">' +
      '<div class="panel-title tone-' + esc(card.tone || 'cyan') + '">' + esc(card.title) + '</div>' +
      '<ul class="summary-list">' +
        (card.items || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
      '</ul>' +
    '</article>';
  }

  function anchorRow(row) {
    return '<tr>' +
      '<td><code>' + esc(row.match) + '</code></td>' +
      '<td>' + esc(row.mode) + '</td>' +
      '<td>' + esc(row.reason || '') + '</td>' +
    '</tr>';
  }

  function linkItem(link) {
    return '<a href="' + esc(link.href) + '"' + (link.external ? ' target="_blank" rel="noreferrer noopener"' : '') + '>' +
      '<span class="link-label">' + esc(link.label) + '</span>' +
      '<span class="link-href">' + esc(link.href) + '</span>' +
    '</a>';
  }

  app.innerHTML = '' +
    '<div class="page">' +
      '<header class="header">' +
        '<div class="header-top">' +
          '<span class="pulse" aria-hidden="true"></span>' +
          '<div class="title-wrap">' +
            '<h1 class="title">' + esc(data.meta.pageTitle) + '</h1>' +
            '<p class="subtitle">' + esc(data.meta.subtitle) + '</p>' +
          '</div>' +
          '<nav class="header-links">' +
            '<a href="../index.html">Back to deps</a>' +
            (data.meta.upstream ? '<a href="' + esc(data.meta.upstream) + '" target="_blank" rel="noreferrer noopener">Primary link</a>' : '') +
            '<a href="#anchors">Path anchors</a>' +
          '</nav>' +
        '</div>' +
        '<div class="toc">' +
          '<a href="#overview">Overview</a>' +
          '<a href="#diagram">Diagram</a>' +
          '<a href="#anchors">Anchors</a>' +
          '<a href="#links">Links</a>' +
        '</div>' +
      '</header>' +
      '<section id="overview" class="grid metrics">' +
        (data.metrics || []).map(metricCard).join('') +
      '</section>' +
      '<section id="diagram" class="panel svg-shell">' +
        '<div class="panel-title">Diagram-style report</div>' +
        '<div class="panel-sub">Generated from the docs card inventory using the visual language of <code>rui-reports/diagram</code>.</div>' +
        (data.svgDiagram || '') +
      '</section>' +
      '<section class="grid cards section">' +
        (data.summaryCards || []).map(summaryCard).join('') +
      '</section>' +
      '<section class="split section">' +
        '<article id="anchors" class="panel">' +
          '<div class="panel-title">Path anchors</div>' +
          '<div class="panel-sub">Used by <code>docs/files/index.html</code> to jump from file-level findings back to this card report.</div>' +
          '<div class="table-wrap"><table class="table"><thead><tr><th>Match</th><th>Mode</th><th>Reason</th></tr></thead><tbody>' +
            ((data.anchors || []).length ? data.anchors.map(anchorRow).join('') : '<tr><td colspan="3">No direct file-path anchor was derived for this card.</td></tr>') +
          '</tbody></table></div>' +
        '</article>' +
        '<article id="links" class="panel">' +
          '<div class="panel-title">Related links</div>' +
          '<div class="panel-sub">Original destinations referenced by the home-page card.</div>' +
          '<div class="link-list">' +
            ((data.links || []).length ? data.links.map(linkItem).join('') : '<p class="muted">No extra links were attached to this card.</p>') +
          '</div>' +
        '</article>' +
      '</section>' +
      '<section class="panel section">' +
        '<div class="panel-title">Notes</div>' +
        '<ul class="summary-list">' +
          (data.notes || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
        '</ul>' +
      '</section>' +
      '<p class="footer">' + esc(data.meta.footer || '') + '</p>' +
    '</div>';
}());
`;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(value) {
  return String(value == null ? '' : value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(value) {
  return String(value == null ? '' : value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadHelpConfig() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(docsDataPath, 'utf8'), sandbox, { filename: docsDataPath });
  return sandbox.window.HELP_CONFIG || {};
}

function normalizeHint(value) {
  let normalized = String(value == null ? '' : value).trim();
  normalized = normalized.replace(/^\.?\//, '');
  normalized = normalized.replace(/^\.claude\//, '');
  normalized = normalized.replace(/^skills\//, '');
  return normalized;
}

function pathModeFor(hint) {
  return /\/$/.test(hint) ? 'prefix' : 'exact';
}

function extractPathLikeTokens(text) {
  const source = String(text == null ? '' : text);
  const matches = source.match(/(?:\.claude\/)?(?:skills\/|shared\/|arch\/|test\/|quickstart\/|daily\/|weekly\/|monthly\/|\.pipeline-state\/)[A-Za-z0-9@._/-]+/g);
  return matches || [];
}

function pushHint(target, value) {
  const normalized = normalizeHint(value);
  if (!normalized) return;
  target.add(normalized);
}

function deriveHints(section, group, item, metaText) {
  const hints = new Set();
  extractPathLikeTokens(metaText).forEach((token) => pushHint(hints, token));
  [item.href].concat(
    Array.isArray(item.links) ? item.links.map((link) => link.href) : [],
    Array.isArray(item.sceneLinks) ? item.sceneLinks.map((link) => link.href) : []
  ).forEach((href) => {
    if (href && !/^https?:\/\//i.test(href)) {
      pushHint(hints, href);
    }
  });

  const groupTitle = String(group.title || '');
  const skillMatch = groupTitle.match(/skills\/(rui-[a-z-]+)/i);
  const skillRoot = skillMatch ? skillMatch[1] : '';

  if (group.id === 'src-shared') {
    if (item.title === 'loader.js') pushHint(hints, 'shared/loader.js');
    if (item.title === 'rui-scene-card') pushHint(hints, 'shared/components/rui-scene-card/');
    if (item.title === 'rui-stats-grid') pushHint(hints, 'shared/components/rui-stats-grid/');
    if (item.title === 'vendor/') pushHint(hints, 'shared/vendor/');
  }

  if (skillRoot) {
    if (item.title === 'SKILL.md') {
      pushHint(hints, `${skillRoot}/SKILL.md`);
    } else if (/^\d\d-/.test(item.title)) {
      pushHint(hints, `${skillRoot}/steps/${item.title}/`);
    } else if (item.title === 'topics/') {
      pushHint(hints, `${skillRoot}/topics/`);
    } else if (/^[a-z0-9-]+$/i.test(item.title)) {
      pushHint(hints, `${skillRoot}/${item.title}/`);
    }
  }

  if (section.id === 'section-stories') {
    if (/Architecture Story/i.test(item.title)) pushHint(hints, 'arch/');
    if (/test Story/i.test(item.title)) pushHint(hints, 'test/');
  }

  return [...hints];
}

function buildRelatedLinks(item, reportHref) {
  const seen = new Set();
  const links = [];

  function addLink(label, href, external) {
    const safeHref = String(href || '').trim();
    if (!safeHref || seen.has(safeHref) || safeHref === reportHref) return;
    seen.add(safeHref);
    links.push({ label, href: safeHref, external: Boolean(external || /^https?:\/\//i.test(safeHref)) });
  }

  if (item.href) addLink('Primary destination', item.href, item.targetBlank);
  if (Array.isArray(item.links)) {
    item.links.forEach((link, index) => addLink(link.label || `Related link ${index + 1}`, link.href, link.target === '_blank'));
  }
  if (Array.isArray(item.sceneLinks)) {
    item.sceneLinks.forEach((link, index) => addLink(link.label || `Scene ${index + 1}`, link.href, false));
  }
  return links;
}

function buildSvg(card) {
  const anchor = card.pathHints[0] || card.groupKey;
  const secondary = card.pathHints[1] || card.sectionId;
  const descA = card.description.slice(0, 58);
  const descB = card.description.slice(58, 116);

  return [
    `<svg viewBox="0 0 1120 560" role="img" aria-label="${escapeHtml(card.title)} catalog report" xmlns="http://www.w3.org/2000/svg">`,
    '  <defs>',
    '    <marker id="arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22d3ee"/></marker>',
    '    <marker id="arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#34d399"/></marker>',
    '    <marker id="arrow-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#fbbf24"/></marker>',
    '    <marker id="arrow-violet" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#a78bfa"/></marker>',
    '    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e293b" stroke-width="0.5"/></pattern>',
    '  </defs>',
    '  <rect width="100%" height="100%" fill="url(#grid)"/>',
    '  <rect x="36" y="36" width="1048" height="488" rx="20" fill="rgba(251,191,36,0.04)" stroke="#334155" stroke-dasharray="8,4"/>',
    '  <text x="56" y="60" fill="#94a3b8" font-size="11">diagram-style catalog drill-down</text>',
    '  <line x1="210" y1="150" x2="350" y2="220" stroke="#22d3ee" stroke-width="1.4" marker-end="url(#arrow-cyan)"/>',
    '  <text x="280" y="170" fill="#94a3b8" font-size="9" text-anchor="middle">dashboard card</text>',
    '  <line x1="210" y1="310" x2="350" y2="290" stroke="#fbbf24" stroke-width="1.4" marker-end="url(#arrow-amber)"/>',
    '  <text x="280" y="302" fill="#fbbf24" font-size="9" text-anchor="middle">path anchor</text>',
    '  <line x1="520" y1="326" x2="520" y2="430" stroke="#a78bfa" stroke-width="1.4" marker-end="url(#arrow-violet)"/>',
    '  <text x="535" y="383" fill="#a78bfa" font-size="9">evidence</text>',
    '  <line x1="760" y1="240" x2="900" y2="150" stroke="#34d399" stroke-width="1.4" marker-end="url(#arrow-green)"/>',
    '  <text x="838" y="180" fill="#34d399" font-size="9" text-anchor="middle">section context</text>',
    '  <line x1="875" y1="320" x2="875" y2="432" stroke="#22d3ee" stroke-width="1.4" marker-end="url(#arrow-cyan)"/>',
    '  <text x="888" y="382" fill="#22d3ee" font-size="9">report output</text>',
    '  <rect x="70" y="108" width="140" height="76" rx="10" fill="#0f172a"/>',
    '  <rect x="70" y="108" width="140" height="76" rx="10" fill="rgba(30,41,59,0.55)" stroke="#22d3ee" stroke-width="1.4"/>',
    '  <text x="140" y="136" fill="white" font-size="12" font-weight="600" text-anchor="middle">Docs Home</text>',
    '  <text x="140" y="154" fill="#94a3b8" font-size="9" text-anchor="middle">card source</text>',
    `  <text x="140" y="169" fill="#22d3ee" font-size="8" text-anchor="middle">${escapeHtml(card.groupKindLabel)}</text>`,
    '  <rect x="70" y="272" width="140" height="84" rx="10" fill="#0f172a"/>',
    '  <rect x="70" y="272" width="140" height="84" rx="10" fill="rgba(120,53,15,0.3)" stroke="#fbbf24" stroke-width="1.4"/>',
    '  <text x="140" y="298" fill="white" font-size="12" font-weight="600" text-anchor="middle">Anchor</text>',
    `  <text x="140" y="318" fill="#94a3b8" font-size="8" text-anchor="middle">${escapeHtml(anchor.slice(0, 26))}</text>`,
    `  <text x="140" y="332" fill="#94a3b8" font-size="8" text-anchor="middle">${escapeHtml(secondary.slice(0, 26))}</text>`,
    `  <text x="140" y="348" fill="#fbbf24" font-size="8" text-anchor="middle">${escapeHtml(card.pathHints.length + ' mapped hints')}</text>`,
    '  <rect x="350" y="186" width="340" height="132" rx="16" fill="#0f172a"/>',
    '  <rect x="350" y="186" width="340" height="132" rx="16" fill="rgba(6,78,59,0.24)" stroke="#34d399" stroke-width="1.8"/>',
    `  <text x="520" y="220" fill="white" font-size="20" font-weight="700" text-anchor="middle">${escapeHtml(card.title)}</text>`,
    `  <text x="520" y="246" fill="#94a3b8" font-size="10" text-anchor="middle">${escapeHtml(descA)}</text>`,
    `  <text x="520" y="262" fill="#94a3b8" font-size="10" text-anchor="middle">${escapeHtml(descB)}</text>`,
    `  <text x="520" y="284" fill="#34d399" font-size="9" text-anchor="middle">${escapeHtml(card.sectionTitle)} · ${escapeHtml(card.groupTitle)}</text>`,
    `  <text x="520" y="300" fill="#a78bfa" font-size="8" text-anchor="middle">${escapeHtml(card.relatedLinks.length + ' related links')} · ${escapeHtml(card.pathHints.length + ' path anchors')}</text>`,
    '  <rect x="780" y="106" width="190" height="72" rx="10" fill="#0f172a"/>',
    '  <rect x="780" y="106" width="190" height="72" rx="10" fill="rgba(6,78,59,0.28)" stroke="#34d399" stroke-width="1.4"/>',
    `  <text x="875" y="132" fill="white" font-size="12" font-weight="600" text-anchor="middle">${escapeHtml(card.sectionTitle.slice(0, 24))}</text>`,
    `  <text x="875" y="150" fill="#94a3b8" font-size="9" text-anchor="middle">${escapeHtml(card.groupTitle.slice(0, 28))}</text>`,
    '  <rect x="340" y="430" width="360" height="76" rx="10" fill="#0f172a"/>',
    '  <rect x="340" y="430" width="360" height="76" rx="10" fill="rgba(76,29,149,0.28)" stroke="#a78bfa" stroke-width="1.4"/>',
    '  <text x="520" y="456" fill="white" font-size="12" font-weight="600" text-anchor="middle">Primary evidence</text>',
    `  <text x="520" y="478" fill="#94a3b8" font-size="9" text-anchor="middle">${escapeHtml((card.metaText || card.description || card.groupTitle).slice(0, 58))}</text>`,
    `  <text x="520" y="494" fill="#a78bfa" font-size="8" text-anchor="middle">${escapeHtml(card.metaText ? 'card metadata retained' : 'description-only evidence')}</text>`,
    '  <rect x="780" y="430" width="190" height="76" rx="10" fill="#0f172a"/>',
    '  <rect x="780" y="430" width="190" height="76" rx="10" fill="rgba(30,41,59,0.45)" stroke="#22d3ee" stroke-width="1.4"/>',
    '  <text x="875" y="456" fill="white" font-size="12" font-weight="600" text-anchor="middle">Report page</text>',
    `  <text x="875" y="478" fill="#94a3b8" font-size="9" text-anchor="middle">docs/deps/${escapeHtml(card.slug)}/index.html</text>`,
    `  <text x="875" y="494" fill="#22d3ee" font-size="8" text-anchor="middle">rebuilt ${generatedAt}</text>`,
    '</svg>'
  ].join('');
}

function uniqueSlug(baseSlug, used) {
  let slug = baseSlug || 'card-report';
  let index = 2;
  while (used.has(slug)) {
    slug = `${baseSlug}-${index}`;
    index += 1;
  }
  used.add(slug);
  return slug;
}

function buildCardReports(helpConfig) {
  const reports = [];
  const usedSlugs = new Set();

  (helpConfig.sections || []).forEach((section) => {
    (section.groups || []).forEach((group) => {
      (group.items || []).forEach((item) => {
        const groupKey = group.id || group.title || 'group';
        const isDependencyCard = section.id === 'section-dependencies';
        const baseSlug = isDependencyCard
          ? slugify(item.title)
          : slugify(`${groupKey}-${item.title}`);
        const slug = uniqueSlug(baseSlug, usedSlugs);
        const reportHref = `deps/${slug}/index.html`;
        const metaText = stripHtml(item.meta || '');
        const pathHints = deriveHints(section, group, item, metaText);
        const relatedLinks = buildRelatedLinks(item, reportHref);
        const description = String(item.description || '').trim();
        const badge = String(item.badge || '').trim();
        const groupKindLabel = group.kind === 'stories' ? 'story card' : group.kind === 'scenes' ? 'scene card' : 'catalog card';
        const notes = [
          `Belongs to "${section.title}" under "${group.title}".`,
          metaText ? `Card metadata: ${metaText}.` : 'No extra metadata string was attached to the original card.',
          pathHints.length
            ? `Files-report deep links can target this card via ${pathHints.length} derived path anchor(s).`
            : 'No direct file-path anchor could be derived, so this report is discoverable from the docs home and deps index only.'
        ];
        if (badge) notes.push(`Badge context retained from the original card: ${badge}.`);
        if (relatedLinks.length) notes.push(`Original card exposed ${relatedLinks.length} related navigation link(s).`);

        reports.push({
          slug,
          href: reportHref,
          cardKey: `${groupKey}::${item.title}`,
          title: String(item.title || ''),
          description,
          badge,
          sectionId: String(section.id || ''),
          sectionTitle: String(section.title || ''),
          groupKey,
          groupTitle: String(group.title || ''),
          groupKind: String(group.kind || ''),
          groupKindLabel,
          metaText,
          upstream: item.href && /^https?:\/\//i.test(item.href) ? item.href : '',
          pathHints,
          relatedLinks,
          notes
        });
      });
    });
  });

  return reports;
}

function buildReportData(card) {
  const summaryCards = [
    {
      tone: 'cyan',
      title: 'Snapshot',
      items: [
        card.description || 'The home-page card did not include a standalone description.',
        card.badge ? `Badge: ${card.badge}.` : `Card type: ${card.groupKindLabel}.`,
        `${card.relatedLinks.length} related links and ${card.pathHints.length} path anchors retained for drill-down.`
      ]
    },
    {
      tone: 'violet',
      title: 'Evidence',
      items: [
        card.metaText || 'No metadata string was attached to the card.',
        card.pathHints[0] ? `Primary anchor: ${card.pathHints[0]}` : 'No primary file anchor available.',
        card.pathHints[1] ? `Secondary anchor: ${card.pathHints[1]}` : `Fallback group key: ${card.groupKey}`
      ]
    },
    {
      tone: 'green',
      title: 'Navigation',
      items: [
        `Home-page report link: ${card.href}`,
        card.relatedLinks[0] ? `Primary related link: ${card.relatedLinks[0].href}` : 'No extra destination was attached to this card.',
        `Section context: ${card.sectionTitle} -> ${card.groupTitle}`
      ]
    }
  ];

  const anchors = card.pathHints.map((hint) => ({
    match: hint,
    mode: pathModeFor(hint),
    reason: hint === card.pathHints[0] ? 'primary derived hint' : 'secondary derived hint'
  }));

  return {
    meta: {
      pageTitle: `${card.title} report`,
      subtitle: `${card.sectionTitle} · ${card.groupTitle}`,
      upstream: card.upstream,
      footer: `Generated for .claude/docs/deps/${card.slug}/index.html from docs/index card "${card.title}" · rebuilt ${generatedAt}`
    },
    metrics: [
      { label: 'Section', value: card.sectionId || 'n/a', sub: card.sectionTitle, tone: 'cyan' },
      { label: 'Group', value: card.groupKind || 'items', sub: card.groupTitle, tone: 'green' },
      { label: 'Links', value: String(card.relatedLinks.length), sub: 'related destinations', tone: 'amber' },
      { label: 'Anchors', value: String(card.pathHints.length), sub: 'files-report deep links', tone: 'violet' },
      { label: 'Badge', value: card.badge || 'n/a', sub: 'card badge / count', tone: 'rose' }
    ],
    svgDiagram: buildSvg(card),
    summaryCards,
    anchors,
    links: card.relatedLinks,
    notes: card.notes
  };
}

function writeReport(card) {
  const dir = path.join(__dirname, card.slug);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml);
  fs.writeFileSync(path.join(dir, 'index.css'), pageCss);
  fs.writeFileSync(path.join(dir, 'index.js'), pageJs);
  fs.writeFileSync(path.join(dir, 'data.js'), `window.REPORT_DATA = ${JSON.stringify(buildReportData(card), null, 2)};\n`);
}

function writeRootIndex(reports) {
  const bySection = new Map();
  reports.forEach((report) => {
    const bucket = bySection.get(report.sectionTitle) || [];
    bucket.push(report);
    bySection.set(report.sectionTitle, bucket);
  });

  const sectionsHtml = [...bySection.entries()].map(([sectionTitle, cards]) => {
    const cardsHtml = cards.map((card) => {
      return `<a class="card" href="${escapeHtml(card.slug)}/index.html">
        <div class="card-top">
          <strong>${escapeHtml(card.title)}</strong>
          <span>${escapeHtml(card.groupKindLabel)}</span>
        </div>
        <div class="card-meta">${escapeHtml(card.groupTitle)} · ${escapeHtml(card.pathHints.length + ' anchors')}</div>
        <p>${escapeHtml((card.description || card.metaText || 'Catalog drill-down report').slice(0, 120))}</p>
        <div class="card-sub">${escapeHtml(card.relatedLinks.length + ' related links')} · ${escapeHtml(card.slug)}</div>
      </a>`;
    }).join('\n');

    return `<section class="section-block">
      <div class="section-head">
        <h2>${escapeHtml(sectionTitle)}</h2>
        <span>${cards.length} cards</span>
      </div>
      <div class="grid">${cardsHtml}</div>
    </section>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Catalog Reports</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #020617;
      --panel: rgba(15, 23, 42, 0.76);
      --border: #1e293b;
      --border-strong: #334155;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --dim: #64748b;
      --cyan: #22d3ee;
      --font: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: var(--font);
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 26%),
        radial-gradient(circle at top right, rgba(167, 139, 250, 0.08), transparent 20%),
        var(--bg);
      padding: 32px 20px 48px;
    }
    main { max-width: 1180px; margin: 0 auto; }
    h1 { margin: 0 0 10px; font-size: clamp(28px, 4vw, 40px); }
    p { margin: 0; color: var(--muted); line-height: 1.7; }
    .meta { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
    .pill {
      padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border);
      background: rgba(15, 23, 42, 0.55); color: var(--muted); font-size: 12px;
    }
    .section-block { margin-top: 28px; }
    .section-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
    .section-head h2 { margin: 0; font-size: 18px; }
    .section-head span { color: var(--dim); font-size: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
    .card {
      display: grid; gap: 10px; padding: 18px; border-radius: 18px; text-decoration: none; color: inherit;
      background: var(--panel); border: 1px solid var(--border); box-shadow: 0 18px 48px rgba(2, 6, 23, 0.24);
    }
    .card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
    .card-top { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .card-top strong { font-size: 16px; }
    .card-top span { font-size: 11px; color: var(--muted); }
    .card-meta { font-size: 12px; color: var(--cyan); }
    .card-sub { font-size: 12px; color: var(--dim); }
    .footer { margin-top: 24px; font-size: 12px; color: var(--dim); }
  </style>
</head>
<body>
  <main>
    <h1>Catalog Drill-Down Reports</h1>
    <p>Generated from <code>.claude/docs/index.html</code> card content. Each report keeps the home-page description, metadata, related links, and any derived path anchors, then renders them as a diagram-style drill-down page inspired by <code>rui-reports/diagram</code>.</p>
    <div class="meta">
      <span class="pill">${reports.length} reports</span>
      <span class="pill">${new Set(reports.map((report) => report.sectionTitle)).size} sections</span>
      <span class="pill">source: <code>docs/data.js</code></span>
      <span class="pill">rebuilt ${generatedAt}</span>
    </div>
    ${sectionsHtml}
    <p class="footer">Generated under <code>.claude/docs/deps</code> from the current documentation catalog.</p>
  </main>
</body>
</html>
`;

  fs.writeFileSync(path.join(__dirname, 'index.html'), html);
}

function writeReportLinks(reports) {
  const cardLinks = {};
  const ruleMap = new Map();

  reports.forEach((report) => {
    cardLinks[report.cardKey] = report.slug;
    report.pathHints.forEach((hint) => {
      const normalized = normalizeHint(hint);
      const key = `${pathModeFor(normalized)}::${normalized}`;
      if (!ruleMap.has(key)) {
        ruleMap.set(key, {
          match: normalized,
          mode: pathModeFor(normalized),
          slug: report.slug,
          title: report.title
        });
      }
    });
  });

  const pathRules = [...ruleMap.values()].sort((a, b) => b.match.length - a.match.length || a.match.localeCompare(b.match));
  const payload = {
    generatedAt,
    cardLinks,
    pathRules
  };

  fs.writeFileSync(path.join(__dirname, 'report-links.js'), `window.RUI_DOC_REPORTS = ${JSON.stringify(payload, null, 2)};\n`);
}

function main() {
  ensureDir(__dirname);
  const helpConfig = loadHelpConfig();
  const reports = buildCardReports(helpConfig);

  reports.forEach(writeReport);
  writeRootIndex(reports);
  writeReportLinks(reports);

  console.log(`Regenerated ${reports.length} catalog reports.`);
  reports.forEach((report) => {
    console.log(`- ${report.slug}: ${report.title} (${report.pathHints.length} anchors, ${report.relatedLinks.length} links)`);
  });
}

main();
