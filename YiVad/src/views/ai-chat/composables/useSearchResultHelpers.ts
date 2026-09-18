/**
 * useSearchResultHelpers — pure helper functions for search result display.
 * Extracted from WebSearchResults.vue for reusability and testability.
 */
import type { WebSearchResult } from "@/api/modules/searchService";
import { getDomain } from "@/api/modules/searchService";

// ── Domain classification ────────────────────────────────────────────────

const SCHOLARLY = new Set([
  "arxiv.org", "ieeexplore.ieee.org", "dl.acm.org", "semanticscholar.org",
  "nature.com", "science.org", "pnas.org", "plos.org", "academia.edu",
  "researchgate.net", "pubmed.ncbi.nlm.nih.gov", "scholar.google.com"
]);

const OFFICIAL = new Set([
  "developer.mozilla.org", "docs.python.org", "nodejs.org", "react.dev",
  "vuejs.org", "typescriptlang.org", "learn.microsoft.com", "aws.amazon.com",
  "cloud.google.com", "w3.org", "whatwg.org", "ecma-international.org",
  "en.wikipedia.org", "github.com", "stackoverflow.com"
]);

const NEWS = new Set([
  "bbc.com", "bbc.co.uk", "cnn.com", "reuters.com", "apnews.com",
  "bloomberg.com", "economist.com", "wsj.com", "nytimes.com",
  "theguardian.com", "wired.com", "techcrunch.com", "theverge.com",
  "arstechnica.com", "hackernews.com", "news.ycombinator.com"
]);

const LOW_DOMAINS = new Set(["pinterest.com", "quora.com", "answers.com"]);

export type DomainTier = "scholarly" | "official" | "news" | "community" | "commercial" | "low";

export function domainTier(url: string): DomainTier {
  const d = getDomain(url);
  if (!d) return "commercial";
  if (SCHOLARLY.has(d) || d.endsWith(".edu") || d.endsWith(".ac.uk") || d.endsWith(".ac.cn")) return "scholarly";
  if (OFFICIAL.has(d) || d.endsWith(".gov")) return "official";
  if (NEWS.has(d)) return "news";
  if (LOW_DOMAINS.has(d)) return "low";
  if (d.endsWith(".org")) return "community";
  return "commercial";
}

export function domainTierLabel(tier: DomainTier): string {
  const map: Record<DomainTier, string> = {
    scholarly: "Scholarly",
    official: "Official",
    news: "News",
    community: "Community",
    commercial: "Commercial",
    low: "Low quality"
  };
  return map[tier];
}

export function domainTierClass(tier: DomainTier): string {
  return `rep-${tier}`;
}

// Keep backward-compatible exports
export function faviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=32`;
}

export function qualityStars(quality?: number): string {
  if (!quality || quality <= 0) return "";
  return "★".repeat(Math.min(quality, 5));
}

export function repClass(url: string): string {
  const t = domainTier(url);
  if (t === "scholarly" || t === "official" || t === "news") return "rep-high";
  if (t === "low") return "rep-low";
  return "rep-mid";
}

export function repLabel(url: string): string {
  const t = domainTier(url);
  if (t === "scholarly" || t === "official" || t === "news") return domainTierLabel(t);
  if (t === "low") return "Low quality";
  return "";
}

// ── Date extraction ────────────────────────────────────────────────────

const DATE_PATTERNS = [
  /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
  /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4})/i,
  /(\d{4}-\d{2}-\d{2})/,
  /(\d{1,2}\/\d{1,2}\/\d{4})/,
  /(\d+)\s+(day|week|month|year)s?\s+ago/i
];

export function extractDate(snippet: string): string {
  if (!snippet) return "";
  for (const pat of DATE_PATTERNS) {
    const m = snippet.match(pat);
    if (m) return m[1];
  }
  return "";
}

export function relativeTime(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 0) return dateStr;
    if (days === 0) return "today";
    if (days === 1) return "1d ago";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  } catch {
    return dateStr;
  }
}

// ── Reading time ───────────────────────────────────────────────────────

export function readingTime(snippet: string, title: string): string {
  const text = `${title} ${snippet || ""}`;
  // CJK: each char ≈ 1 word. Latin: ~5 chars/word.
  const cjkChars = (text.match(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g) || []).length;
  const latinChars = text.length - cjkChars;
  const words = Math.max(1, cjkChars + Math.round(latinChars / 5));
  const mins = Math.max(1, Math.round(words / 200));
  return mins === 1 ? "1 min read" : `~${mins} min read`;
}

// ── Language detection ─────────────────────────────────────────────────

export function detectLang(text: string): string {
  let cjk = 0,
    cyrillic = 0,
    arabic = 0,
    total = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) || 0;
    if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf) || (cp >= 0xf900 && cp <= 0xfaff)) cjk++;
    else if ((cp >= 0x0400 && cp <= 0x04ff) || (cp >= 0x0500 && cp <= 0x052f)) cyrillic++;
    else if ((cp >= 0x0600 && cp <= 0x06ff) || (cp >= 0x0750 && cp <= 0x077f)) arabic++;
    total++;
  }
  if (total < 10) return "";
  if (cjk > total * 0.3) return "ZH";
  if (cyrillic > total * 0.3) return "RU";
  if (arabic > total * 0.3) return "AR";
  const latin = text.replace(/[^a-zA-Z]/g, "").length;
  if (latin > total * 0.5) return "EN";
  return "";
}

// ── Per-result meta (pre-computed for template performance) ────────────

export interface ResultMeta {
  relativeTime: string;
  lang: string;
  readTime: string;
}

export function computeResultMeta(results: WebSearchResult[]): ResultMeta[] {
  return results.map(r => {
    // Prefer backend-extracted date, fall back to regex from snippet
    const dateStr = r.date || extractDate(r.snippet || "");
    const langText = (r.title || "") + (r.snippet || "");
    return {
      relativeTime: relativeTime(dateStr),
      lang: detectLang(langText),
      readTime: readingTime(r.snippet || "", r.title)
    };
  });
}
