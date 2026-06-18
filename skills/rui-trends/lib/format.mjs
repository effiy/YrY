/**
 * rui-trends format — output formatting for trend reports.
 *
 * Generates markdown tables and CLI output per the SKILL.md output format spec.
 */

import { nowISO, fmtDisplay } from '../../../lib/fs.mjs';

const TS = () => fmtDisplay(nowISO()).slice(0, 16);

// ── trend direction ───────────────────────────────────────────────────

function trendIcon(val) {
  if (!val) return '→';
  const n = Number(val);
  if (n > 0) return '↑';
  if (n < 0) return '↓';
  return '→';
}

function fmtStars(n) {
  if (!n) return '—';
  const num = Number(n);
  if (num >= 1000) return `⭐ ${(num / 1000).toFixed(1)}k`;
  return `⭐ ${num}`;
}

// ── report generators ─────────────────────────────────────────────────

export function formatGitHubTrending(result) {
  if (!result.ok) return `## github-trending ❌\n> 不可达：${result.error || '未知错误'}\n`;
  const header = `## GitHub Trending${result.url ? `\n> ${result.url} | ${TS()}` : ''}\n`;
  if (!result.data.length) return header + '\n_无数据_\n';
  let table = header + '\n| # | 仓库 | ⭐ | 语言 | 今日 | 描述 |\n|---|------|-----|------|------|------|\n';
  let i = 1;
  for (const r of result.data.slice(0, 20)) {
    const dir = trendIcon(r.starsToday);
    table += `| ${i} | ${r.repo} | ${fmtStars(r.stars)} | ${r.language || '—'} | ${r.starsToday ? `+${r.starsToday}` : '—'} ${dir} | ${(r.description || '').slice(0, 60)} |\n`;
    i++;
  }
  return table;
}

export function formatOSSInsight(result) {
  if (!result.ok) return `## OSS Insight ❌\n> 不可达：${result.error || '未知错误'}\n`;
  if (result.collections) {
    let out = `## OSS Insight\n> ${TS()}\n`;
    for (const c of result.collections) {
      if (!c.ok) { out += `\n### ${c.url}\n❌ 不可达：${c.error}\n`; continue; }
      out += `\n### ${c.url}\n| # | 仓库 |\n|---|------|\n`;
      c.data.slice(0, 10).forEach((r, i) => { out += `| ${i + 1} | ${r.repo} |\n`; });
    }
    return out;
  }
  let out = `## OSS Insight\n> ${result.url || ''} | ${TS()}\n| # | 仓库 |\n|---|------|\n`;
  (result.data || []).slice(0, 20).forEach((r, i) => { out += `| ${i + 1} | ${r.repo} |\n`; });
  return out;
}

export function formatTrendShift(result) {
  if (!result.ok) return `## TrendShift ❌\n> 不可达：${result.error || '未知错误'}\n`;
  const header = `## TrendShift${result.url ? `\n> ${result.url} | ${TS()}` : ''}\n`;
  if (!result.data.length) return header + '\n_无数据_\n';
  let table = header + '\n| # | 仓库 | ⭐ | 变化 | 描述 |\n|---|------|-----|------|------|\n';
  result.data.slice(0, 20).forEach((r, i) => {
    const chg = r.change ? (Number(r.change) > 0 ? `+${r.change}` : r.change) : '—';
    const dir = trendIcon(r.change);
    table += `| ${i + 1} | ${r.repo} | ${fmtStars(r.stars)} | ${chg} ${dir} | ${(r.description || r.title || '').slice(0, 60)} |\n`;
  });
  return table;
}

export function formatTopStarred(result) {
  if (!result.ok) return `## Top-Starred ❌\n> 不可达：${result.error || '未知错误'}\n`;
  const header = `## Top-Starred${result.url ? `\n> ${result.url} | ${TS()}` : ''}\n`;
  if (!result.data.length) return header + '\n_无数据_\n';
  let table = header + '\n| # | 仓库 |\n|---|------|\n';
  result.data.forEach((r, i) => { table += `| ${i + 1} | ${r.repo} |\n`; });
  return table;
}

export function formatStatus(status) {
  let out = `## rui-trends 数据源探活 — ${TS()}\n\n| 数据源 | 可达 | HTTP |\n|--------|------|------|\n`;
  for (const s of status.sources) {
    out += `| ${s.source} | ${s.reachable ? '✅' : '❌'} | ${s.status || s.error || '—'} |\n`;
  }
  const reachable = status.sources.filter((s) => s.reachable).length;
  out += `\n> ${reachable}/${status.sources.length} 数据源可达\n`;
  return out;
}

export function formatAll(results) {
  let out = `# rui-trends 全量报告 — ${TS()}\n\n`;
  out += formatGitHubTrending(results.sources['github-trending']) + '\n';
  out += formatOSSInsight(results.sources['oss-insight']) + '\n';
  out += formatTrendShift(results.sources.trendshift) + '\n';
  out += formatTopStarred(results.sources['top-starred']) + '\n';
  return out;
}

/** Build §2.1 diagnostic injection template */
export function formatSelfImproveInjection(results) {
  let out = `### §2.1 技术趋势验证\n\n> 数据采集时间：${TS()} | 数据源：github-trending / oss-insight / trendshift / top-starred\n\n`;
  out += '| 数据源 | 可达? | 关键发现 | 诊断触发 |\n|--------|-------|---------|----------|\n';
  const sources = results.sources || {};
  for (const [name, r] of Object.entries(sources)) {
    const reachable = r.ok ? '✅' : '❌';
    const finding = r.ok && r.data?.length ? `top ${Math.min(3, r.data.length)} repos` : (r.error || '无数据');
    out += `| ${name} | ${reachable} | ${finding} | D5 / 待评估 |\n`;
  }
  return out;
}
