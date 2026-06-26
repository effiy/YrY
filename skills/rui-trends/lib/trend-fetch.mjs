/**
 * rui-trends trend-fetch — fetch technology trend data from external sources.
 *
 * Supports: GitHub Trending, OSS Insight, TrendShift, Top-Starred (GitHub Search).
 * Each function returns { ok, source, data, error?, ts }.
 */

import { HTTP_TIMEOUT_MS, HTTP_TIMEOUT_SHORT_MS, MAX_RETRIES, RETRY_DELAY_MS } from '../../../lib/constants.mjs';
import { nowISO, fmtDisplay } from '../../../lib/fs.mjs';

// ── helpers ───────────────────────────────────────────────────────────

const sleep = (/** @type {number} */ ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithTimeout(/** @type {string} */ url, /** @type {any} */ opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeout || HTTP_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (e) {
    return { ok: false, status: 0, text: '', error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(/** @type {string} */ url, /** @type {any} */ opts = {}) {
  /** @type {{ ok: boolean, status: number, text: string, error?: string }} */
  let last = { ok: false, status: 0, text: '' };
  for (let i = 0; i < MAX_RETRIES; i++) {
    if (i > 0) await sleep(RETRY_DELAY_MS * i);
    last = await fetchWithTimeout(url, opts);
    if (last.ok) return last;
  }
  return last;
}

function ts() {
  return fmtDisplay(nowISO());
}

// ── HTML extraction helpers ───────────────────────────────────────────

function extractRepoLines(/** @type {string} */ html) {
  const lines = [];
  // GitHub trending article rows: <article class="Box-row">...</article>
  const articles = html.match(/<article[^>]*class="Box-row"[^>]*>[\s\S]*?<\/article>/gi) || [];
  for (const article of articles) {
    const h2 = (article.match(/<h2[^>]*>[\s\S]*?<\/h2>/i) || [''])[0];
    const repoPath = (h2.match(/href="\/([^"]+)"/) || ['', ''])[1].replace(/^\s+|\s+$/g, '');
    const repoName = (h2.match(/>\s*([^<]+)\s*</) || ['', ''])[1].replace(/^\s+|\s+$/g, '');
    const desc = (article.match(/<p[^>]*class="[^"]*col-9[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || ['', ''])[1]
      .replace(/<[^>]+>/g, '').replace(/^\s+|\s+$/g, '');
    const lang = (article.match(/itemprop="programmingLanguage"[^>]*>([^<]+)</) || ['', ''])[1];
    const stars = (article.match(/>\s*([\d,]+)\s*stars?/i) || ['', ''])[1];
    const forks = (article.match(/>\s*([\d,]+)\s*forks?/i) || ['', ''])[1];
    const starsToday = (article.match(/>\s*([\d,]+)\s*stars?\s*today/i) || ['', ''])[1];
    if (repoPath) {
      lines.push({ repo: repoPath, name: repoName, description: desc, language: lang,
        stars: stars.replace(/,/g, ''), forks: forks.replace(/,/g, ''),
        starsToday: starsToday.replace(/,/g, '') });
    }
  }
  return lines;
}

// ── data sources ──────────────────────────────────────────────────────

/** Check reachability of all data sources */
export async function checkStatus() {
  const sources = [
    { name: 'github-trending', url: 'https://github.com/trending' },
    { name: 'oss-insight', url: 'https://ossinsight.io' },
    { name: 'trendshift', url: 'https://trendshift.io' },
    { name: 'top-starred', url: 'https://github.com/search?q=stars:>1000&type=repositories&s=stars&o=desc' },
  ];
  const results = await Promise.all(sources.map(async (s) => {
    const r = await fetchWithTimeout(s.url, { timeout: HTTP_TIMEOUT_SHORT_MS });
    return { source: s.name, reachable: r.ok, status: r.status, error: r.error };
  }));
  return { ok: results.some((r) => r.reachable), sources: results, ts: ts() };
}

/** GitHub Trending
 * @param {{ lang?: string, since?: string }} opts
 */
export async function fetchGitHubTrending({ lang, since } = {}) {
  const params = new URLSearchParams();
  if (since === 'weekly') params.set('since', 'weekly');
  const langPath = lang ? `/${encodeURIComponent(lang)}` : '';
  const qs = params.toString();
  const url = `https://github.com/trending${langPath}${qs ? '?' + qs : ''}`;
  const r = await fetchWithRetry(url);
  if (!r.ok) return { ok: false, source: 'github-trending', error: r.error || `HTTP ${r.status}`, data: [], ts: ts() };
  const data = extractRepoLines(r.text);
  return { ok: true, source: 'github-trending', url, data, ts: ts() };
}

/** OSS Insight — collection pages
 * @param {{ metric?: string }} opts
 */
export async function fetchOSSInsight({ metric: _metric } = {}) {
  const urls = [
    `https://ossinsight.io/collections/trending-repositories/`,
    `https://ossinsight.io/collections/static-site-generator/`,
  ];
  const results = [];
  for (const url of urls) {
    const r = await fetchWithRetry(url);
    if (!r.ok) {
      results.push({ ok: false, source: 'oss-insight', url, error: r.error || `HTTP ${r.status}`, data: [], ts: ts() });
      continue;
    }
    const repos = [];
    const repoMatches = r.text.match(/href="\/analyze\/([^"]+)"/g) || [];
    const seen = new Set();
    for (const m of repoMatches) {
      const repo = m.replace(/href="\/analyze\//, '').replace(/"$/, '');
      if (!seen.has(repo)) { seen.add(repo); repos.push({ repo }); }
    }
    results.push({ ok: true, source: 'oss-insight', url, data: repos, ts: ts() });
  }
  return results.length === 1 ? results[0]
    : { ok: results.some((r) => r.ok), source: 'oss-insight', collections: results, ts: ts() };
}

/** TrendShift — trending repositories with date range filter
 * @param {{ range?: number }} opts
 */
export async function fetchTrendShift({ range } = {}) {
  const rng = range || 30;
  const url = rng === 7
    ? 'https://trendshift.io/github-trending-repositories?trending-range=7'
    : rng === 90
      ? 'https://trendshift.io/github-trending-repositories?trending-range=90'
      : 'https://trendshift.io/github-trending-repositories';
  const r = await fetchWithRetry(url);
  if (!r.ok) return { ok: false, source: 'trendshift', error: r.error || `HTTP ${r.status}`, data: [], ts: ts() };

  const repos = [];
  const cards = r.text.match(/<div[^>]*class="[^"]*card[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi) || [];
  for (const card of cards) {
    const repoPath = (card.match(/href="\/repositories\/([^"]+)"/) || ['', ''])[1];
    const title = (card.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i) || ['', ''])[1].replace(/<[^>]+>/g, '').replace(/^\s+|\s+$/g, '');
    const desc = (card.match(/<p[^>]*class="[^"]*text-muted[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || ['', ''])[1]
      .replace(/<[^>]+>/g, '').replace(/^\s+|\s+$/g, '');
    const stars = (card.match(/>\s*([\d,]+)\s*<[^>]*>\s*(?:total\s*)?stars/i) || ['', ''])[1].replace(/,/g, '');
    const change = (card.match(/>\s*([+-]?\d[\d,]*)\s*stars?\s*(?:this|in)/i) || ['', ''])[1].replace(/,/g, '');
    if (repoPath) repos.push({ repo: repoPath, title, description: desc, stars, change });
  }
  return { ok: true, source: 'trendshift', url, data: repos, ts: ts() };
}

/** GitHub top-starred search
 * @param {{ minStars?: number }} opts
 */
export async function fetchTopStarred({ minStars } = {}) {
  const min = minStars || 1000;
  const url = `https://github.com/search?q=stars:>${min}&type=repositories&s=stars&o=desc`;
  const r = await fetchWithRetry(url);
  if (!r.ok) return { ok: false, source: 'top-starred', error: r.error || `HTTP ${r.status}`, data: [], ts: ts() };

  const repos = [];
  const items = r.text.match(/<div[^>]*data-testid="results-list"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*$/im) || [''];
  const liMatches = (items[0] || r.text).match(/<a[^>]*href="\/([^"]+)"[^>]*data-testid="result-title"[^>]*>/gi) || [];
  for (const a of liMatches) {
    const repoPath = (a.match(/href="\/([^"]+)"/) || ['', ''])[1];
    if (repoPath && repoPath.split('/').length === 2) repos.push({ repo: repoPath });
  }
  return { ok: true, source: 'top-starred', url, data: repos.slice(0, 25), ts: ts() };
}

/** All data sources */
export async function fetchAll(opts = {}) {
  const [gt, oi, ts_, tsr] = await Promise.all([
    fetchGitHubTrending(opts),
    fetchOSSInsight(opts),
    fetchTrendShift(opts),
    fetchTopStarred(opts),
  ]);
  return { ok: [gt, oi, ts_, tsr].some((r) => r.ok), sources: { 'github-trending': gt, 'oss-insight': oi, trendshift: ts_, 'top-starred': tsr }, ts: ts() };
}

/** Check if a GitHub repo is related to agent/skill discovery */
export function isAgentSkillRepo(/** @type {any} */ repo) {
  const keywords = /\b(agent|skill|plugin|tool|cli|sdk|framework|ai|llm|claude|assistant)\b/i;
  return keywords.test(repo.repo) || keywords.test(repo.description || '') || keywords.test(repo.name || '');
}

/** Filter trending repos for agent/skill discoveries */
export function findAgentSkillRepos(/** @type {any} */ data) {
  if (!data?.data) return [];
  return data.data.filter(isAgentSkillRepo);
}
