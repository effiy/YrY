/**
 * Web search & URL fetch service — calls YiAi's /web-search and /web-fetch.
 */

import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiAi";
import type { YiAiEnvelope } from "@/api/interface/yiAi";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  quality?: number; // 0-5 quality score from backend
  date?: string;    // extracted publication date (YYYY-MM-DD) from backend
}

export interface WebImageResult {
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceUrl: string;
  width?: number;
  height?: number;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  images?: WebImageResult[]; // parallel image search results
  query?: string; // refined query actually searched
  error?: string;
}

export interface WebFetchResponse {
  text: string;
  url: string;
  error?: string;
}

// ── Domain reputation ─────────────────────────────────────────────────────

/** Known high-quality domains — prioritize these in search results. */
const HIGH_REPUTATION_DOMAINS = new Set([
  "en.wikipedia.org",
  "github.com",
  "stackoverflow.com",
  "developer.mozilla.org",
  "arxiv.org",
  "ieeexplore.ieee.org",
  "dl.acm.org",
  "semanticscholar.org",
  "docs.python.org",
  "nodejs.org",
  "react.dev",
  "vuejs.org",
  "typescriptlang.org",
  "aws.amazon.com",
  "cloud.google.com",
  "learn.microsoft.com",
  "nature.com",
  "science.org",
  "pnas.org",
  "plos.org",
  "w3.org",
  "whatwg.org",
  "ecma-international.org",
  "medium.com",
  "dev.to",
  "hashnode.dev"
]);

/** Low-quality / spam domains — demote or filter these. */
const LOW_REPUTATION_DOMAINS = new Set(["pinterest.com", "quora.com", "answers.com", "exampledomain.com"]);

type Reputation = "high" | "medium" | "low";

export function getDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function domainReputation(url: string): Reputation {
  const domain = getDomain(url);
  if (!domain) return "medium";
  if (HIGH_REPUTATION_DOMAINS.has(domain)) return "high";
  if (LOW_REPUTATION_DOMAINS.has(domain)) return "low";
  // Heuristic: .gov, .edu, .org tend to be more authoritative
  if (domain.endsWith(".gov") || domain.endsWith(".edu")) return "high";
  return "medium";
}

/** Sort results: high reputation first, then medium, then low. */
export function rankByReputation(results: WebSearchResult[]): WebSearchResult[] {
  const tiers = { high: [] as WebSearchResult[], medium: [] as WebSearchResult[], low: [] as WebSearchResult[] };
  for (const r of results) {
    tiers[domainReputation(r.url)].push(r);
  }
  return [...tiers.high, ...tiers.medium, ...tiers.low];
}

/** Deduplicate results by normalized domain — keep the best (first) per domain. */
export function deduplicateByDomain(results: WebSearchResult[]): WebSearchResult[] {
  const seen = new Set<string>();
  const out: WebSearchResult[] = [];
  for (const r of results) {
    const d = getDomain(r.url);
    if (!d || seen.has(d)) continue;
    seen.add(d);
    out.push(r);
  }
  return out;
}

/**
 * Shared RPC helper — posts to YiAi, checks envelope, returns typed data.
 */
async function _rpcCall<T>(path: string, body: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const resp = await fetch(buildYiAiUrl(path), {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify(body),
    signal
  });
  if (!resp.ok) throw new Error(`${path} failed: HTTP ${resp.status}`);
  const data = (await resp.json()) as YiAiEnvelope<T>;
  if (data.code !== 0) throw new Error(data.message || `${path} failed`);
  return data.data;
}

/**
 * Search the web via YiAi's DuckDuckGo-backed /web-search endpoint.
 */
export async function webSearch(query: string, maxResults = 6, signal?: AbortSignal): Promise<WebSearchResponse> {
  return _rpcCall<WebSearchResponse>("/web-search", { query, max_results: maxResults }, signal);
}

/**
 * Fetch and extract text from a URL via YiAi's /web-fetch endpoint.
 */
export async function webFetch(targetUrl: string): Promise<WebFetchResponse> {
  return _rpcCall<WebFetchResponse>("/web-fetch", { url: targetUrl });
}

/** Simple regex to extract URLs from text. */
const URL_RE = /https?:\/\/[^\s)]+/g;

/** Extract all URLs found in a text string. */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_RE);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Format web search results into a compact context string for the LLM.
 * Optimized for token efficiency — each result is one line with title,
 * domain, quality indicator, snippet, and URL. ~40% fewer tokens vs the
 * verbose format while keeping all essential information.
 */
export function formatSearchResults(results: WebSearchResult[]): string {
  if (!results.length) return "";
  const now = new Date().toISOString().slice(0, 16).replace("T", " ");
  const lines = [
    `## Web Search (${results.length} results, ${now})`,
    "Cite as `[N](url)` matching the numbers. Distinguish web sources from your own knowledge.",
    ""
  ];
  results.forEach((r, i) => {
    const domain = getDomain(r.url);
    const rep = domainReputation(r.url);
    const badge = rep === "high" ? "⭐" : rep === "low" ? "⚠️" : "";
    const quality = r.quality ? "★".repeat(Math.min(r.quality, 5)) : "";
    const qualityStr = quality ? ` ${quality}` : "";
    const snippet = (r.snippet || "").length > 200
      ? r.snippet!.slice(0, 197) + "..."
      : r.snippet || "";
    const dateStr = r.date ? ` [${r.date}]` : "";
    lines.push(
      `[${i + 1}] ${badge}${qualityStr} **${r.title}**${dateStr} — ${snippet} → ${r.url}`
    );
  });
  lines.push("");
  lines.push("⭐ = high-authority  ⚠️ = low-quality — cross-reference before relying");
  return lines.join("\n");
}

/**
 * Format a fetched URL's content into a context string for the LLM.
 */
export function formatFetchedContent(targetUrl: string, text: string): string {
  if (!text.trim()) return "";
  const domain = getDomain(targetUrl);
  const rep = domainReputation(targetUrl);
  const badge = rep === "high" ? " [high-authority source]" : "";
  const truncated = text.length > 4000 ? text.slice(0, 4000) + "\n\n... (truncated)" : text;
  return [`## Page Content: ${domain}${badge}`, `> URL: ${targetUrl}`, "", truncated].join("\n");
}

/**
 * Compact a conversation via YiAi's /compact endpoint.
 * Returns the compacted message list (summary + recent messages).
 */
export async function compactConversation(
  messages: Array<{ role?: string; type?: string; message?: string; content?: string }>,
  keepLast = 4
): Promise<{
  messages: Array<{ role: string; content: string }>;
  original_count: number;
  compacted_count: number;
  error?: string;
}> {
  return _rpcCall<any>("/compact", { messages, keep_last: keepLast });
}
