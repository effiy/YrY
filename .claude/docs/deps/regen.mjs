import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '../../..');
const skillsDir = path.join(root, '.claude/skills');
const docsDataPath = path.join(root, '.claude/docs/data.js');
const manifestPath = path.join(root, '.claude/skills/rui-reports/diagram/package.json');
const generatedAt = '2026-07-19';

const textExts = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.md', '.txt', '.yaml', '.yml',
  '.css', '.html', '.xml', '.toml', '.sh', '.sql', '.py', '.rb', '.java', '.go', '.rs',
  '.php', '.swift', '.kt', '.kts', '.graphql', '.proto', '.env'
]);

const directExts = new Set([
  '.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.json', '.yaml', '.yml', '.toml', '.sh',
  '.sql', '.py', '.rb', '.java', '.go', '.rs', '.php', '.swift', '.kt', '.kts', '.graphql',
  '.proto', '.env'
]);

const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Dependency Footprint</title>
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
  .split { display: grid; grid-template-columns: 1.25fr 0.95fr; gap: 16px; margin-top: 18px; }
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

  function ownershipRow(row) {
    return '<tr>' +
      '<td><code>' + esc(row.skillRoot) + '</code></td>' +
      '<td>' + esc(row.fileCount) + '</td>' +
      '<td>' + esc(row.occurrences) + '</td>' +
      '<td><code>' + esc(row.primaryFile) + '</code></td>' +
      '<td>' + esc(row.usageType) + '</td>' +
    '</tr>';
  }

  function hitRow(row) {
    return '<tr>' +
      '<td><code>' + esc(row.path) + '</code></td>' +
      '<td>' + esc(row.fileKind) + '</td>' +
      '<td>' + esc(row.usageType) + '</td>' +
      '<td>' + esc(row.occurrences) + '</td>' +
      '<td><code>' + esc(row.skillRoot) + '</code></td>' +
    '</tr>';
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
            (data.meta.upstream ? '<a href="' + esc(data.meta.upstream) + '" target="_blank" rel="noreferrer">Upstream</a>' : '') +
            '<a href="#hits">Hit files</a>' +
          '</nav>' +
        '</div>' +
        '<div class="toc">' +
          '<a href="#overview">Overview</a>' +
          '<a href="#diagram">Diagram</a>' +
          '<a href="#ownership">Ownership</a>' +
          '<a href="#hits">Trace</a>' +
        '</div>' +
      '</header>' +
      '<section id="overview" class="grid metrics">' +
        (data.metrics || []).map(metricCard).join('') +
      '</section>' +
      '<section id="diagram" class="panel svg-shell">' +
        '<div class="panel-title">Diagram-style footprint</div>' +
        '<div class="panel-sub">Rebuilt from the current <code>.claude/skills</code> inventory using the visual language of <code>rui-reports/diagram</code>.</div>' +
        (data.svgDiagram || '') +
      '</section>' +
      '<section class="grid cards section">' +
        (data.summaryCards || []).map(summaryCard).join('') +
      '</section>' +
      '<section class="split section">' +
        '<article id="ownership" class="panel">' +
          '<div class="panel-title">Ownership spread</div>' +
          '<div class="panel-sub">Nearest <code>SKILL.md</code> boundary for each matching file.</div>' +
          '<div class="table-wrap"><table class="table"><thead><tr><th>Skill root</th><th>Files</th><th>Occurrences</th><th>Primary file</th><th>Usage</th></tr></thead><tbody>' +
            (data.ownership || []).map(ownershipRow).join('') +
          '</tbody></table></div>' +
        '</article>' +
        '<article class="panel">' +
          '<div class="panel-title">Review notes</div>' +
          '<div class="panel-sub">Why this package matters right now.</div>' +
          '<ul class="summary-list">' +
            (data.reviewNotes || []).map(function (item) { return '<li>' + esc(item) + '</li>'; }).join('') +
          '</ul>' +
        '</article>' +
      '</section>' +
      '<section id="hits" class="panel section">' +
        '<div class="panel-title">Hit files</div>' +
        '<div class="panel-sub">Sorted by literal match count inside the skills catalog.</div>' +
        '<div class="table-wrap"><table class="table"><thead><tr><th>File</th><th>Kind</th><th>Usage</th><th>Matches</th><th>Skill root</th></tr></thead><tbody>' +
          (data.hitFiles || []).map(hitRow).join('') +
        '</tbody></table></div>' +
      '</section>' +
      '<p class="footer">' + esc(data.meta.footer || '') + '</p>' +
    '</div>';
}());
`;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function countOccurrences(content, needle) {
  let count = 0;
  let index = 0;
  while (true) {
    index = content.indexOf(needle, index);
    if (index === -1) return count;
    count += 1;
    index += needle.length;
  }
}

function walk(dir, bucket = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, bucket);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (textExts.has(ext) || entry.name === 'pnpm-lock.yaml' || entry.name === 'package-lock.json' || entry.name === 'SKILL.md') {
      bucket.push(full);
    }
  }
  return bucket;
}

function findSkillRoot(filePath) {
  let dir = path.dirname(filePath);
  while (dir.startsWith(skillsDir)) {
    if (fs.existsSync(path.join(dir, 'SKILL.md'))) {
      return path.relative(skillsDir, dir).replaceAll(path.sep, '/');
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return 'unscoped';
}

function detectFileKind(relPath) {
  const base = path.basename(relPath);
  const ext = path.extname(relPath).toLowerCase();
  if (base === 'package.json') return 'manifest';
  if (base === 'pnpm-lock.yaml' || base === 'package-lock.json') return 'lockfile';
  if (ext === '.md') return 'docs';
  if (ext === '.json' || ext === '.yaml' || ext === '.yml' || ext === '.toml' || ext === '.env') return 'config';
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs' || ext === '.ts' || ext === '.tsx' || ext === '.jsx') return 'source';
  return 'text';
}

function detectUsageType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const base = path.basename(filePath);
  if (base === 'package.json') return 'manifest';
  if (base === 'pnpm-lock.yaml' || base === 'package-lock.json') return 'lockfile';
  if (directExts.has(ext)) return 'direct';
  return 'reference';
}

function labelForKind(kind) {
  if (kind === 'runtime') return 'Runtime dependency';
  if (kind === 'dev') return 'Dev dependency';
  return 'Docs-only dependency';
}

function toneForKind(kind) {
  if (kind === 'runtime') return 'green';
  if (kind === 'dev') return 'amber';
  return 'cyan';
}

function buildSvg(report) {
  const topFile = report.hits[0] ? report.hits[0].path.replace('.claude/', '') : 'n/a';
  const manifestSource = report.manifestHits[0]
    ? report.manifestHits[0].path.replace('.claude/', '')
    : (report.kind === 'docs' ? 'docs-only references' : 'no manifest');
  const topSkill = report.topConsumer ? report.topConsumer.skillRoot : 'unscoped';
  const host = report.href ? new URL(report.href).host : 'n/a';
  const tone = report.kind === 'runtime' ? '#34d399' : report.kind === 'dev' ? '#fbbf24' : '#22d3ee';
  const manifestParts = manifestSource.split('/');
  const manifestLineA = manifestParts.slice(0, 2).join('/');
  const manifestLineB = manifestParts.slice(2).join('/').slice(0, 30);

  return [
    `<svg viewBox="0 0 1120 560" role="img" aria-label="${escapeHtml(report.name)} dependency footprint" xmlns="http://www.w3.org/2000/svg">`,
    '  <defs>',
    '    <marker id="arrow-cyan" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#22d3ee"/></marker>',
    '    <marker id="arrow-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#34d399"/></marker>',
    '    <marker id="arrow-amber" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#fbbf24"/></marker>',
    '    <marker id="arrow-violet" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#a78bfa"/></marker>',
    '    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e293b" stroke-width="0.5"/></pattern>',
    '  </defs>',
    '  <rect width="100%" height="100%" fill="url(#grid)"/>',
    '  <rect x="36" y="36" width="1048" height="488" rx="20" fill="rgba(251,191,36,0.04)" stroke="#334155" stroke-dasharray="8,4"/>',
    '  <text x="56" y="60" fill="#94a3b8" font-size="11">diagram-style dependency footprint</text>',
    '  <line x1="210" y1="150" x2="350" y2="220" stroke="#22d3ee" stroke-width="1.4" marker-end="url(#arrow-cyan)"/>',
    '  <text x="280" y="170" fill="#94a3b8" font-size="9" text-anchor="middle">catalog context</text>',
    '  <line x1="210" y1="310" x2="350" y2="290" stroke="#fbbf24" stroke-width="1.4" marker-end="url(#arrow-amber)"/>',
    '  <text x="280" y="302" fill="#fbbf24" font-size="9" text-anchor="middle">source of truth</text>',
    '  <line x1="520" y1="326" x2="520" y2="430" stroke="#a78bfa" stroke-width="1.4" marker-end="url(#arrow-violet)"/>',
    '  <text x="535" y="383" fill="#a78bfa" font-size="9">hottest file</text>',
    '  <line x1="760" y1="240" x2="900" y2="150" stroke="#34d399" stroke-width="1.4" marker-end="url(#arrow-green)"/>',
    '  <text x="838" y="180" fill="#34d399" font-size="9" text-anchor="middle">top consumer</text>',
    '  <line x1="875" y1="320" x2="875" y2="432" stroke="#22d3ee" stroke-width="1.4" marker-end="url(#arrow-cyan)"/>',
    '  <text x="888" y="382" fill="#22d3ee" font-size="9">report output</text>',
    '  <rect x="70" y="108" width="140" height="76" rx="10" fill="#0f172a"/>',
    '  <rect x="70" y="108" width="140" height="76" rx="10" fill="rgba(30,41,59,0.55)" stroke="#22d3ee" stroke-width="1.4"/>',
    '  <text x="140" y="136" fill="white" font-size="12" font-weight="600" text-anchor="middle">Docs Dashboard</text>',
    '  <text x="140" y="154" fill="#94a3b8" font-size="9" text-anchor="middle">dependency entry</text>',
    `  <text x="140" y="169" fill="#22d3ee" font-size="8" text-anchor="middle">${escapeHtml(labelForKind(report.kind))}</text>`,
    '  <rect x="70" y="272" width="140" height="84" rx="10" fill="#0f172a"/>',
    '  <rect x="70" y="272" width="140" height="84" rx="10" fill="rgba(120,53,15,0.3)" stroke="#fbbf24" stroke-width="1.4"/>',
    '  <text x="140" y="298" fill="white" font-size="12" font-weight="600" text-anchor="middle">Source</text>',
    `  <text x="140" y="318" fill="#94a3b8" font-size="8" text-anchor="middle">${escapeHtml(manifestLineA)}</text>`,
    `  <text x="140" y="332" fill="#94a3b8" font-size="8" text-anchor="middle">${escapeHtml(manifestLineB)}</text>`,
    `  <text x="140" y="348" fill="#fbbf24" font-size="8" text-anchor="middle">${escapeHtml(report.version)}</text>`,
    '  <rect x="350" y="186" width="340" height="132" rx="16" fill="#0f172a"/>',
    `  <rect x="350" y="186" width="340" height="132" rx="16" fill="rgba(6,78,59,0.24)" stroke="${tone}" stroke-width="1.8"/>`,
    `  <text x="520" y="220" fill="white" font-size="20" font-weight="700" text-anchor="middle">${escapeHtml(report.name)}</text>`,
    `  <text x="520" y="246" fill="#94a3b8" font-size="10" text-anchor="middle">${escapeHtml((report.description || 'Current package footprint').slice(0, 58))}</text>`,
    `  <text x="520" y="262" fill="#94a3b8" font-size="10" text-anchor="middle">${escapeHtml((report.description || '').slice(58, 116))}</text>`,
    `  <text x="520" y="284" fill="${tone}" font-size="9" text-anchor="middle">${escapeHtml(`${report.hits.length} hit files`)} · ${escapeHtml(`${report.directHits.length} direct touchpoints`)} · ${escapeHtml(`${report.ownership.length} skill roots`)}</text>`,
    `  <text x="520" y="300" fill="#a78bfa" font-size="8" text-anchor="middle">upstream ${escapeHtml(host)}</text>`,
    '  <rect x="780" y="106" width="190" height="72" rx="10" fill="#0f172a"/>',
    '  <rect x="780" y="106" width="190" height="72" rx="10" fill="rgba(6,78,59,0.28)" stroke="#34d399" stroke-width="1.4"/>',
    `  <text x="875" y="132" fill="white" font-size="12" font-weight="600" text-anchor="middle">${escapeHtml(topSkill)}</text>`,
    `  <text x="875" y="150" fill="#94a3b8" font-size="9" text-anchor="middle">${escapeHtml(topSkill === 'unscoped' ? 'no skill boundary' : `${report.topConsumer.fileCount} hit files`)}</text>`,
    '  <rect x="340" y="430" width="360" height="76" rx="10" fill="#0f172a"/>',
    '  <rect x="340" y="430" width="360" height="76" rx="10" fill="rgba(76,29,149,0.28)" stroke="#a78bfa" stroke-width="1.4"/>',
    '  <text x="520" y="456" fill="white" font-size="12" font-weight="600" text-anchor="middle">Primary file hotspot</text>',
    `  <text x="520" y="478" fill="#94a3b8" font-size="9" text-anchor="middle">${escapeHtml(topFile.slice(0, 58))}</text>`,
    `  <text x="520" y="494" fill="#a78bfa" font-size="8" text-anchor="middle">${escapeHtml(`${report.hits[0]?.occurrences || 0} literal matches`)}</text>`,
    '  <rect x="780" y="430" width="190" height="76" rx="10" fill="#0f172a"/>',
    '  <rect x="780" y="430" width="190" height="76" rx="10" fill="rgba(30,41,59,0.45)" stroke="#22d3ee" stroke-width="1.4"/>',
    '  <text x="875" y="456" fill="white" font-size="12" font-weight="600" text-anchor="middle">Report page</text>',
    `  <text x="875" y="478" fill="#94a3b8" font-size="9" text-anchor="middle">docs/deps/${escapeHtml(report.slug)}/index.html</text>`,
    `  <text x="875" y="494" fill="#22d3ee" font-size="8" text-anchor="middle">static report rebuilt on ${generatedAt}</text>`,
    '</svg>'
  ].join('');
}

function loadDocsMeta() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(docsDataPath, 'utf8'), sandbox, { filename: docsDataPath });
  const helpConfig = sandbox.window.HELP_CONFIG || {};
  const groups = (((helpConfig.sections || [])[0] || {}).groups || []);
  const depItems = groups.flatMap((group) => group.items || []);
  const map = new Map();
  for (const item of depItems) {
    map.set(item.title, {
      description: item.description || '',
      href: item.href || '',
      icon: item.icon || 'pkg',
      meta: item.meta || ''
    });
  }
  if (!map.has('beautiful-mermaid')) {
    map.set('beautiful-mermaid', {
      description: 'Mermaid rendering helper referenced by the rui-tools/mermaid skill docs and eval guidance.',
      href: 'https://www.npmjs.com/package/beautiful-mermaid',
      icon: 'mermaid',
      meta: 'Docs-only'
    });
  }
  return map;
}

function buildPackageList() {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const map = new Map();
  for (const [name, version] of Object.entries(manifest.dependencies || {})) {
    map.set(name, { name, slug: slugify(name), version, kind: 'runtime' });
  }
  for (const [name, version] of Object.entries(manifest.devDependencies || {})) {
    map.set(name, { name, slug: slugify(name), version, kind: 'dev' });
  }
  map.set('beautiful-mermaid', {
    name: 'beautiful-mermaid',
    slug: 'beautiful-mermaid',
    version: 'docs-only',
    kind: 'docs'
  });
  return [...map.values()];
}

function buildReport(pkg, docsMetaMap, skillFiles) {
  const hits = [];
  for (const filePath of skillFiles) {
    const raw = fs.readFileSync(filePath, 'utf8');
    const occurrences = countOccurrences(raw, pkg.name);
    if (!occurrences) continue;
    const relPath = path.relative(root, filePath).replaceAll(path.sep, '/');
    hits.push({
      path: relPath,
      occurrences,
      skillRoot: findSkillRoot(filePath),
      fileKind: detectFileKind(relPath),
      usageType: detectUsageType(filePath)
    });
  }
  if (!hits.length) return null;

  hits.sort((a, b) => b.occurrences - a.occurrences || a.path.localeCompare(b.path));

  const directHits = hits.filter((item) => item.usageType !== 'reference');
  const referenceHits = hits.filter((item) => item.usageType === 'reference');
  const manifestHits = hits.filter((item) => item.usageType === 'manifest');
  const ownershipMap = new Map();

  for (const hit of hits) {
    const prev = ownershipMap.get(hit.skillRoot) || {
      skillRoot: hit.skillRoot,
      fileCount: 0,
      occurrences: 0,
      primaryFile: hit.path,
      usageType: hit.usageType,
      maxOccurrences: -1
    };
    prev.fileCount += 1;
    prev.occurrences += hit.occurrences;
    if (hit.occurrences > prev.maxOccurrences) {
      prev.primaryFile = hit.path;
      prev.usageType = hit.usageType;
      prev.maxOccurrences = hit.occurrences;
    }
    ownershipMap.set(hit.skillRoot, prev);
  }

  const ownership = [...ownershipMap.values()]
    .map(({ maxOccurrences, ...rest }) => rest)
    .sort((a, b) => b.fileCount - a.fileCount || b.occurrences - a.occurrences || a.skillRoot.localeCompare(b.skillRoot));

  const topConsumer = ownership[0];
  const docsMeta = docsMetaMap.get(pkg.name) || { description: '', href: '', icon: 'pkg', meta: '' };

  return {
    ...pkg,
    description: docsMeta.description,
    href: docsMeta.href,
    icon: docsMeta.icon,
    metaLabel: docsMeta.meta,
    hits,
    directHits,
    referenceHits,
    manifestHits,
    ownership,
    topConsumer,
    totalOccurrences: hits.reduce((sum, item) => sum + item.occurrences, 0)
  };
}

function writeReport(report, scannedCount) {
  const dir = path.join(__dirname, report.slug);
  ensureDir(dir);

  const summaryCards = [
    {
      tone: 'cyan',
      title: 'Adoption footprint',
      items: [
        `${labelForKind(report.kind)} at version ${report.version}.`,
        `${report.ownership.length} skill roots mention it; top consumer is ${report.topConsumer ? report.topConsumer.skillRoot : 'unscoped'}.`,
        `${report.directHits.length} direct files and ${report.referenceHits.length} reference-only files currently match the package string.`
      ]
    },
    {
      tone: 'violet',
      title: 'Where to review first',
      items: report.hits.slice(0, 3).map((item) => `${item.path} (${item.occurrences} matches, ${item.usageType})`)
    },
    {
      tone: toneForKind(report.kind),
      title: 'Change risk',
      items: [
        report.manifestHits.length
          ? 'Manifest-backed package; sync docs after version changes.'
          : 'No active manifest declaration; treat this as a docs-only or reference footprint.',
        report.directHits.some((item) => item.usageType === 'lockfile')
          ? 'Lockfile still references this package, so drift can show up without docs changes.'
          : 'No lockfile hotspot detected for this package in the current catalog.',
        report.href ? `Upstream reference is ${new URL(report.href).host}.` : 'No upstream URL was found in docs/data.js.'
      ]
    }
  ];

  const reviewNotes = [
    `Scanned ${scannedCount} text files under .claude/skills for literal matches.`,
    'Literal matching is intentionally conservative: it catches manifest declarations, lockfile entries, source imports, and documentation mentions.',
    report.kind === 'docs'
      ? 'This package is not in the active diagram package.json; it stays in the report set because the skills catalog still references it.'
      : 'This package remains declared in .claude/skills/rui-reports/diagram/package.json.'
  ];

  const data = {
    meta: {
      pageTitle: `${report.name} footprint`,
      subtitle: `${labelForKind(report.kind)} · ${report.version} · ${report.hits.length} hit files across .claude/skills`,
      upstream: report.href,
      footer: `Generated for .claude/docs/deps/${report.slug}/index.html · package ${report.name} · ${report.hits.length} hit files · ${report.ownership.length} skill roots · rebuilt ${generatedAt}`
    },
    metrics: [
      { label: 'Version', value: report.version, sub: labelForKind(report.kind), tone: toneForKind(report.kind) },
      { label: 'Skill roots', value: String(report.ownership.length), sub: `top ${report.topConsumer ? report.topConsumer.skillRoot : 'unscoped'}`, tone: 'cyan' },
      { label: 'Direct files', value: String(report.directHits.length), sub: 'manifest + lockfile + source', tone: 'violet' },
      { label: 'Hit files', value: String(report.hits.length), sub: 'literal matches in catalog', tone: 'amber' },
      { label: 'Occurrences', value: String(report.totalOccurrences), sub: 'all matches combined', tone: 'rose' }
    ],
    svgDiagram: buildSvg(report),
    summaryCards,
    ownership: report.ownership,
    reviewNotes,
    hitFiles: report.hits
  };

  fs.writeFileSync(path.join(dir, 'index.html'), pageHtml);
  fs.writeFileSync(path.join(dir, 'index.css'), pageCss);
  fs.writeFileSync(path.join(dir, 'index.js'), pageJs);
  fs.writeFileSync(path.join(dir, 'data.js'), `window.REPORT_DATA = ${JSON.stringify(data, null, 2)};\n`);
}

function writeRootIndex(reports, scannedCount) {
  const rootCards = reports.map((report) => {
    const toneClass = report.kind === 'runtime' ? 'runtime' : report.kind === 'dev' ? 'dev' : 'docs';
    return `<a class="card ${toneClass}" href="${escapeHtml(report.slug)}/index.html">
      <div class="card-top"><strong>${escapeHtml(report.name)}</strong><span>${escapeHtml(labelForKind(report.kind))}</span></div>
      <div class="card-meta">${escapeHtml(report.version)} · ${escapeHtml(`${report.hits.length} hit files`)} · ${escapeHtml(`${report.ownership.length} skill roots`)}</div>
      <p>${escapeHtml((report.description || 'Current package footprint inside the skills catalog.').slice(0, 110))}</p>
      <div class="card-sub">top consumer: ${escapeHtml(report.topConsumer ? report.topConsumer.skillRoot : 'unscoped')}</div>
    </a>`;
  }).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="dark">
  <title>Dependency Reports</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #020617;
      --panel: rgba(15, 23, 42, 0.76);
      --border: #1e293b;
      --border-strong: #334155;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --cyan: #22d3ee;
      --green: #34d399;
      --amber: #fbbf24;
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
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 24px; }
    .card {
      display: grid; gap: 10px; padding: 18px; border-radius: 18px; text-decoration: none; color: inherit;
      background: var(--panel); border: 1px solid var(--border); box-shadow: 0 18px 48px rgba(2, 6, 23, 0.24);
    }
    .card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
    .card-top { display: flex; justify-content: space-between; gap: 12px; align-items: center; }
    .card-top strong { font-size: 16px; }
    .card-top span { font-size: 11px; color: var(--muted); }
    .card-meta { font-size: 12px; color: var(--cyan); }
    .card-sub { font-size: 12px; color: var(--muted); }
    .runtime .card-meta { color: var(--green); }
    .dev .card-meta { color: var(--amber); }
    .docs .card-meta { color: var(--cyan); }
    .footer { margin-top: 24px; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <main>
    <h1>Third-Party Dependency Reports</h1>
    <p>Rebuilt from the current <code>.claude/skills</code> inventory. The original <code>rui-reports/diagram</code> scan workflow no longer exists, so this page regenerates the dependency catalog using the current manifest, lockfile, source, and documentation footprints while keeping the same diagram-style drill-down pages.</p>
    <div class="meta">
      <span class="pill">${reports.length} packages tracked</span>
      <span class="pill">${scannedCount} skill files scanned</span>
      <span class="pill">source of truth: <code>skills/rui-reports/diagram/package.json</code></span>
      <span class="pill">rebuilt ${generatedAt}</span>
    </div>
    <section class="grid">${rootCards}</section>
    <p class="footer">Generated under <code>.claude/docs/deps</code> from the current repository state.</p>
  </main>
</body>
</html>
`;

  fs.writeFileSync(path.join(__dirname, 'index.html'), html);
}

function main() {
  ensureDir(__dirname);
  const skillFiles = walk(skillsDir);
  const scannedCount = skillFiles.length;
  const docsMetaMap = loadDocsMeta();
  const reports = buildPackageList()
    .map((pkg) => buildReport(pkg, docsMetaMap, skillFiles))
    .filter(Boolean)
    .sort((a, b) => {
      const order = { runtime: 0, dev: 1, docs: 2 };
      return (order[a.kind] - order[b.kind]) || a.name.localeCompare(b.name);
    });

  for (const report of reports) {
    writeReport(report, scannedCount);
  }
  writeRootIndex(reports, scannedCount);

  console.log(`Regenerated ${reports.length} dependency reports.`);
  for (const report of reports) {
    console.log(`- ${report.slug}: ${report.hits.length} hit files, ${report.ownership.length} skill roots`);
  }
}

main();
