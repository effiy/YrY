/**
 * rui-trends trend-report — HTML report generator for trend snapshots.
 *
 * Generates styled HTML reports in docs/趋势报告/ and updates the reports.json manifest.
 * Follows the same CDN theme pattern as health and loop reports.
 *
 * Usage:
 *   import { generateTrendReport, updateTrendManifest } from './lib/trend-report.mjs';
 *   const r = await generateTrendReport({ source, url, data, trend, findings });
 */

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPORT_DIR = 'docs/趋势报告';
const CDN_DEPTH = '../../';
const MANIFEST_FILE = join(REPORT_DIR, 'reports.json');
const MAX_MANIFEST_ENTRIES = 50;

function nowISO() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimestamp() {
  return Date.now().toString(36);
}

function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const SOURCE_META = {
  'github-trending': { icon: '🐙', label: 'GitHub Trending', url: 'https://github.com/trending' },
  'oss-insight':       { icon: '📊', label: 'OSS Insight', url: 'https://ossinsight.io' },
  'trendshift':         { icon: '📈', label: 'TrendShift', url: 'https://trendshift.io' },
  'top-starred':        { icon: '⭐', label: 'Top-Starred', url: 'https://github.com/search' },
  all:                  { icon: '📡', label: '全量趋势扫描', url: '' },
};

/**
 * Generate an HTML trend snapshot report and save to docs/趋势报告/.
 */
export function generateTrendReport({ source, url, data, trend, findings, ok }) {
  const meta = SOURCE_META[source] || { icon: '📡', label: source, url: '' };
  const ts = nowISO();
  const filename = `trend-${source}-${nowDate()}-${nowTimestamp()}.html`;

  const statusBadge = ok
    ? '<span class="yry-badge pass">✅ 可达</span>'
    : '<span class="yry-badge fail">🚫 不可达</span>';

  const trendIcon = trend === 'rise' ? '↑' : trend === 'fall' ? '↓' : '→';
  const trendLabel = trend === 'rise' ? '上升' : trend === 'fall' ? '下降' : '持平';
  const trendClass = trend === 'rise' ? 'pass' : trend === 'fall' ? 'fail' : '';

  const dataRows = (data || []).slice(0, 20).map((r, i) =>
    `<tr>
      <td>${i + 1}</td>
      <td>${escHtml(r.repo || r.name || '—')}</td>
      <td>${r.stars ? '⭐ ' + r.stars : '—'}</td>
      <td>${escHtml(r.language || r.title || '—')}</td>
      <td>${(r.description || '').slice(0, 80)}</td>
    </tr>`
  ).join('\n');

  const findingsHtml = (findings || []).map((f, i) =>
    `<div class="yry-finding ${f.level || 'info'}">
      <div class="yry-finding-head">${i + 1}. ${escHtml(f.title || f.message)}</div>
      ${f.detail ? `<div class="yry-finding-body">${escHtml(f.detail)}</div>` : ''}
    </div>`
  ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>趋势报告 · ${meta.label}</title>
<link rel="stylesheet" href="${CDN_DEPTH}cdn/shared.css">
<link rel="stylesheet" href="${CDN_DEPTH}cdn/theme.css">
<style>
:root {
  --yry-bg: rgba(22,22,32,1);
  --yry-bg-card: linear-gradient(159deg, rgba(38,38,52,1) 0%, rgba(34,34,46,1) 100%);
  --yry-accent: #FFC107;
  --yry-pass: #22c55e; --yry-fail: #ef4444; --yry-warn: #f59e0b;
  --yry-text: rgba(250,250,252,1); --yry-text2: rgba(160,160,164,1); --yry-text3: rgba(110,110,114,1);
  --yry-radius: 12px; --yry-border: 1px solid rgba(255,255,255,0.06);
  --yry-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--yry-bg); color: var(--yry-text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif; line-height: 1.6; min-height: 100vh; }
.yry-container { max-width: 800px; margin: 0 auto; padding: 48px 24px 80px; }
.yry-header { text-align: center; margin-bottom: 32px; }
.yry-header .icon { font-size: 2.5rem; }
.yry-header h1 { font-size: 1.6rem; margin: 12px 0 6px; }
.yry-header .meta { color: var(--yry-text3); font-size: .82rem; }
.yry-card { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 24px; box-shadow: var(--yry-shadow); margin-bottom: 20px; }
.yry-card h2 { font-size: 1.1rem; margin-bottom: 12px; color: var(--yry-accent); }
.yry-stats { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
.yry-stat { background: var(--yry-bg-card); border: var(--yry-border); border-radius: var(--yry-radius); padding: 16px 20px; text-align: center; box-shadow: var(--yry-shadow); flex: 1; min-width: 100px; }
.yry-stat .yry-val { font-size: 1.6rem; font-weight: 700; }
.yry-stat .yry-val.pass { color: var(--yry-pass); }
.yry-stat .yry-val.warn { color: var(--yry-warn); }
.yry-stat .yry-val.fail { color: var(--yry-fail); }
.yry-stat .yry-lbl { font-size: .72rem; color: var(--yry-text3); margin-top: 4px; }
.yry-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: .85rem; font-weight: 600; }
.yry-badge.pass { background: rgba(34,197,94,.15); color: var(--yry-pass); }
.yry-badge.warn { background: rgba(245,158,11,.15); color: var(--yry-warn); }
.yry-badge.fail { background: rgba(239,68,68,.15); color: var(--yry-fail); }
.yry-summary { padding: 16px; border-left: 3px solid var(--yry-accent); background: rgba(255,193,7,.04); border-radius: 0 var(--yry-radius) var(--yry-radius) 0; margin-bottom: 20px; color: var(--yry-text2); font-size: .9rem; }
.yry-finding { padding: 14px 18px; margin-bottom: 8px; border-radius: 8px; border: var(--yry-border); }
.yry-finding.info { background: rgba(59,130,246,.04); }
.yry-finding.warn { background: rgba(245,158,11,.04); border-left: 3px solid var(--yry-warn); }
.yry-finding.fail { background: rgba(239,68,68,.04); border-left: 3px solid var(--yry-fail); }
.yry-finding-head { font-weight: 600; font-size: .9rem; }
.yry-finding-body { margin-top: 6px; color: var(--yry-text2); font-size: .82rem; }
.yry-footer { text-align: center; color: var(--yry-text3); font-size: .74rem; margin-top: 48px; padding-top: 20px; border-top: var(--yry-border); }
.yry-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; font-size: .76rem; }
.yry-breadcrumb a { color: #7aa2f7; text-decoration: none; }
.yry-breadcrumb .yry-bc-sep { color: #53576c; opacity: .5; }
.yry-breadcrumb .yry-bc-current { color: #94a3b8; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px 12px; text-align: left; border-bottom: var(--yry-border); font-size: .84rem; }
th { color: var(--yry-text3); font-size: .74rem; }
</style>
</head>
<body>
<div class="yry-container">

<nav class="yry-breadcrumb">
  <a href="${CDN_DEPTH}docs/index.html">📄 文档中心</a>
  <span class="yry-bc-sep">/</span>
  <a href="${CDN_DEPTH}docs/趋势报告/">📡 趋势报告</a>
  <span class="yry-bc-sep">/</span>
  <span class="yry-bc-current">${meta.label}</span>
</nav>

<div class="yry-header">
  <div class="icon">${meta.icon}</div>
  <h1>趋势报告 · ${meta.label}</h1>
  <div class="meta">${ts} · ${statusBadge} · ${meta.url ? `<a href="${meta.url}" target="_blank" style="color:#7aa2f7">源</a>` : ''}</div>
</div>

<div class="yry-stats">
  <div class="yry-stat">
    <div class="yry-val ${ok ? 'pass' : 'fail'}">${ok ? '✓' : '✗'}</div>
    <div class="yry-lbl">数据源</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val pass">${(data || []).length}</div>
    <div class="yry-lbl">条目</div>
  </div>
  <div class="yry-stat">
    <div class="yry-val ${trendClass}">${trendIcon}</div>
    <div class="yry-lbl">趋势 ${trendLabel}</div>
  </div>
</div>

${findingsHtml ? `
<div class="yry-card">
  <h2>📋 关键发现</h2>
  ${findingsHtml}
</div>
` : ''}

<div class="yry-card">
  <h2>📊 数据详情</h2>
  ${dataRows ? `<table><thead><tr><th>#</th><th>仓库</th><th>⭐</th><th>语言</th><th>描述</th></tr></thead><tbody>${dataRows}</tbody></table>` : '<p style="color:var(--yry-text3)">无数据</p>'}
</div>

<div class="yry-footer">
  趋势报告 · ${source} · ${ts}<br>
  <span style="color:var(--yry-text3)">由 rui-trends trend-report 自动生成</span>
</div>

</div>
</body>
</html>`;

  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  const filePath = join(REPORT_DIR, filename);
  writeFileSync(filePath, html, 'utf-8');

  return { filePath, filename };
}

/**
 * Update the reports.json manifest for the trend index page.
 */
export function updateTrendManifest(entry) {
  if (!existsSync(REPORT_DIR)) {
    mkdirSync(REPORT_DIR, { recursive: true });
  }

  let manifest = [];
  if (existsSync(MANIFEST_FILE)) {
    try {
      manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'));
    } catch { manifest = []; }
  }

  manifest.unshift(entry);
  if (manifest.length > MAX_MANIFEST_ENTRIES) {
    manifest = manifest.slice(0, MAX_MANIFEST_ENTRIES);
  }

  writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}

/**
 * Generate a full trend report from a fetch result and save it.
 * Returns { filePath, filename, manifestEntry }.
 */
export function saveTrendSnapshot(result) {
  const { source, ok, data, url } = result;

  const itemCount = (data || []).length;
  const trend = !ok ? 'flat' : itemCount > 15 ? 'rise' : itemCount > 5 ? 'flat' : 'fall';

  const findings = [];
  if (!ok) {
    findings.push({ level: 'fail', title: `${source} 不可达`, detail: result.error || '未知错误' });
  } else if (itemCount === 0) {
    findings.push({ level: 'warn', title: `${source} 返回空数据`, detail: '页面结构可能已变更，HTML 解析未提取到条目' });
  } else {
    findings.push({ level: 'info', title: `${source} 正常响应`, detail: `提取到 ${itemCount} 条记录` });
  }

  const { filePath, filename } = generateTrendReport({ source, url, data, trend, findings, ok });

  const entry = {
    date: nowDate(),
    time: nowISO(),
    source,
    ok,
    trend: trend === 'rise' ? 'rise' : trend === 'fall' ? 'fall' : 'flat',
    items: itemCount,
    file: filename,
  };
  updateTrendManifest(entry);

  return { filePath, filename, entry };
}

/**
 * Generate a combined "all sources" report.
 */
export function saveAllTrendSnapshot(results) {
  const allData = [];
  const findings = [];
  let reachable = 0;
  let total = 0;

  for (const [source, r] of Object.entries(results.sources || {})) {
    total++;
    const ok = r.ok;
    const count = (r.data || []).length;
    if (ok) reachable++;

    if (!ok) {
      findings.push({ level: 'fail', title: `${source} 不可达`, detail: r.error || '未知错误' });
    } else if (count === 0) {
      findings.push({ level: 'warn', title: `${source} 返回空数据` });
    } else {
      findings.push({ level: 'info', title: `${source}: ${count} 条记录` });
    }

    allData.push(...(r.data || []).map(d => ({ ...d, _source: source })));
  }

  const trend = reachable >= 3 ? 'rise' : reachable >= 2 ? 'flat' : 'fall';
  const ok = reachable > 0;

  const { filePath, filename } = generateTrendReport({
    source: 'all',
    url: '',
    data: allData,
    trend,
    findings,
    ok,
  });

  const entry = {
    date: nowDate(),
    time: nowISO(),
    source: 'all',
    ok,
    trend,
    items: allData.length,
    reachable,
    total,
    file: filename,
  };
  updateTrendManifest(entry);

  return { filePath, filename, entry };
}
