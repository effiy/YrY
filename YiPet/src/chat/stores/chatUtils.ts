/**
 * YiPet Chat — Pure utility functions extracted from the chat store.
 * No Vue/Pinia dependencies — these are standalone helpers.
 */
import type { ChatMessage, RagSource, WebSearchResult } from '@/api/types';
import type { Message } from '../types';
import { redactUrlCredentials } from '@/utils/url';

// ── Page info ──────────────────────────────────────────────────────────────

export function readPageInfo() {
  return {
    title: document.title || '',
    url: redactUrlCredentials(window.location.href || ''),
    iconUrl: (document.querySelector('link[rel*="icon"]') as HTMLLinkElement)?.href || '',
  };
}

export function slugifyUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '').replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '').replace(/[^a-zA-Z0-9/._-]/g, '_');
    const slug = path ? `${host}${path}` : host;
    return slug.slice(0, 80) || 'unknown';
  } catch {
    return url.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80);
  }
}

export function formatPageMarkdown(title: string, url: string, content: string): string {
  const now = new Date().toISOString();
  return [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `url: "${url}"`,
    `captured_at: ${now}`,
    `source: YiPet`,
    '---',
    '',
    `# ${title}`,
    '',
    content,
  ].join('\n');
}

export function capturePageMarkdown(): string {
  const body = document.body;
  if (!body) return '';

  const TurndownService = (window as unknown as Record<string, unknown>).TurndownService as
    | (new (opts?: Record<string, unknown>) => { turndown: (html: string) => string })
    | undefined;
  if (TurndownService) {
    try {
      const clone = body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(
        'script, style, noscript, iframe, nav, footer, ' +
        '#yipet-overlay, #yipet-chat-root, [aria-hidden="true"]',
      ).forEach((el) => el.remove());
      const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
      let md = td.turndown(clone.innerHTML);
      md = md.replace(/\n{3,}/g, '\n\n').trim();
      return md.slice(0, 8000);
    } catch {
      // fall through to innerText
    }
  }

  return body.innerText?.slice(0, 8000) || '';
}

// ── Message mapping ────────────────────────────────────────────────────────

export function mapMessages(raw: ChatMessage[]): Message[] {
  return raw.map((m) => ({
    type: m.type === 'user' ? 'user' : 'pet',
    content: m.content || m.message || '',
    timestamp: m.timestamp || Date.now(),
    imageDataUrl: m.imageDataUrl,
    imageDataUrls: Array.isArray(m.imageDataUrls) ? m.imageDataUrls : undefined,
    toolCalls: (m as any).toolCalls,
    searchResults: (m as any).searchResults,
    searchImages: (m as any).searchImages,
    searchGrounded: (m as any).searchGrounded,
    searchQuery: (m as any).searchQuery,
    searchTimingMs: (m as any).searchTimingMs,
    retrievalGrade: (m as any).retrievalGrade,
    ragContentSummary: (m as any).ragContentSummary,
    sources: (m as any).sources,
    ragMeta: (m as any).ragMeta,
    firstTokenLatencyMs: (m as any).firstTokenLatencyMs,
  }));
}

// ── Search utilities ───────────────────────────────────────────────────────

export function isSearchWorthy(query: string): boolean {
  const q = query.trim();
  if (q.length < 4) return false;
  if (/^(hi|hello|hey|thanks|thank you|你好|嗨|谢谢)[!.? ]*$/i.test(q)) return false;
  if (q.startsWith('/')) return false;
  return true;
}

const HIGH_REPUTATION_DOMAINS = new Set([
  'en.wikipedia.org', 'github.com', 'stackoverflow.com', 'developer.mozilla.org',
  'arxiv.org', 'ieeexplore.ieee.org', 'dl.acm.org', 'semanticscholar.org',
  'docs.python.org', 'nodejs.org', 'react.dev', 'vuejs.org', 'typescriptlang.org',
  'aws.amazon.com', 'cloud.google.com', 'learn.microsoft.com', 'nature.com',
  'science.org', 'w3.org', 'whatwg.org', 'ecma-international.org',
]);
const LOW_REPUTATION_DOMAINS = new Set(['pinterest.com', 'quora.com', 'answers.com', 'exampledomain.com']);

export function getDomain(url: string): string {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, '').toLowerCase();
  } catch { return ''; }
}

export function domainReputation(url: string): 'high' | 'medium' | 'low' {
  const domain = getDomain(url);
  if (!domain) return 'medium';
  if (HIGH_REPUTATION_DOMAINS.has(domain)) return 'high';
  if (LOW_REPUTATION_DOMAINS.has(domain)) return 'low';
  if (domain.endsWith('.gov') || domain.endsWith('.edu')) return 'high';
  return 'medium';
}

export function deduplicateByDomain(results: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  const out: WebSearchResult[] = [];
  for (const item of results) {
    const domain = getDomain(item.url);
    const key = domain || item.url;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function rankByReputation(results: WebSearchResult[]): WebSearchResult[] {
  const tiers = {
    high: [] as WebSearchResult[],
    medium: [] as WebSearchResult[],
    low: [] as WebSearchResult[],
  };
  for (const item of results) {
    tiers[domainReputation(item.url)].push(item);
  }
  return [...tiers.high, ...tiers.medium, ...tiers.low];
}

export function formatSearchResults(results: WebSearchResult[]): string {
  if (!results.length) return '';
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const lines = [
    `## Web Search (${results.length} results, ${now})`,
    'Cite as `[N](url)` matching the numbers. Distinguish web sources from your own knowledge.',
    '',
  ];
  results.forEach((item, idx) => {
    const domain = getDomain(item.url);
    const rep = domainReputation(item.url);
    const badge = rep === 'high' ? 'STAR' : rep === 'low' ? 'WARN' : '';
    const quality = item.quality ? `${'★'.repeat(Math.min(item.quality, 5))}` : '';
    const qualityText = quality ? ` ${quality}` : '';
    const dateText = item.date ? ` [${item.date}]` : '';
    const snippet = item.snippet && item.snippet.length > 200
      ? `${item.snippet.slice(0, 197)}...`
      : (item.snippet || '');
    lines.push(
      `[${idx + 1}] ${badge}${qualityText} **${item.title}**${dateText} — ${snippet} → ${item.url} (${domain})`,
    );
  });
  return lines.join('\n');
}

// ── RAG utilities ──────────────────────────────────────────────────────────

export function formatRagSources(query: string, sources: RagSource[]): string {
  if (!sources.length) return `No relevant knowledge documents found for: ${query}`;
  const lines = [`Knowledge base results for "${query}":`];
  sources.forEach((source, idx) => {
    const path = source.path || 'unknown';
    lines.push(`${idx + 1}. [${path}] (score: ${(source.score ?? 0).toFixed(2)})`);
    if (source.snippet) lines.push(`   ${source.snippet.slice(0, 320)}`);
  });
  return lines.join('\n');
}

export function buildRagSummary(sources: RagSource[]): { grade?: 'A' | 'B' | 'C' | 'D'; summary?: string } {
  if (!sources.length) return {};
  const scores = sources
    .map((source) => source.score)
    .filter((score): score is number => typeof score === 'number');
  const top = scores.length ? Math.max(...scores) : 0;
  const grade = top >= 0.85 ? 'A' : top >= 0.70 ? 'B' : top >= 0.50 ? 'C' : 'D';
  const topSource = sources[0];
  const title = String(topSource?.metadata?.title || topSource?.path?.split('/').pop() || '').replace(/\.md$/, '');
  const fileCount = new Set(sources.map((source) => source.path)).size;
  const summary = `Retrieved ${sources.length} fragments from ${fileCount} files${title ? `, best match: ${title}` : ''}`;
  return { grade, summary };
}

// ── Text similarity ────────────────────────────────────────────────────────

export function ngrams(s: string, n: number): Set<string> {
  const set = new Set<string>();
  if (!s) return set;
  const pad = Math.floor(n / 2);
  const str = ' '.repeat(pad) + s.toLowerCase() + ' '.repeat(pad);
  for (let i = 0; i <= str.length - n; i++) set.add(str.slice(i, i + n));
  return set;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

// ── Session matching ────────────────────────────────────────────────────────

/** Find a session whose `url` field matches the given URL. Pure function, no side effects. */
export function findSessionByUrl<T extends { url: string }>(sessions: T[], url: string): T | undefined {
  if (!url) return undefined;
  return sessions.find((s) => s.url === url);
}