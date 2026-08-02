/**
 * Web search & URL fetch service — calls YiAi's /web-search and /web-fetch.
 */

import { buildYiAiUrl, yiAiAuthHeaders } from "@/config/yiweb";
import type { YiAiEnvelope } from "@/api/interface/yiweb";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  error?: string;
}

export interface WebFetchResponse {
  text: string;
  url: string;
  error?: string;
}

/**
 * Search the web via YiAi's DuckDuckGo-backed /web-search endpoint.
 */
export async function webSearch(query: string, maxResults = 6, signal?: AbortSignal): Promise<WebSearchResponse> {
  const url = buildYiAiUrl("/web-search");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ query, max_results: maxResults }),
    signal,
  });
  if (!resp.ok) throw new Error(`Web search failed: HTTP ${resp.status}`);
  const data = (await resp.json()) as YiAiEnvelope<WebSearchResponse>;
  if (data.code !== 0) throw new Error(data.message || "Web search failed");
  return data.data;
}

/**
 * Fetch and extract text from a URL via YiAi's /web-fetch endpoint.
 */
export async function webFetch(targetUrl: string): Promise<WebFetchResponse> {
  const url = buildYiAiUrl("/web-fetch");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ url: targetUrl }),
  });
  if (!resp.ok) throw new Error(`Web fetch failed: HTTP ${resp.status}`);
  const data = (await resp.json()) as YiAiEnvelope<WebFetchResponse>;
  if (data.code !== 0) throw new Error(data.message || "Web fetch failed");
  return data.data;
}

/** Simple regex to extract URLs from text. */
const URL_RE = /https?:\/\/[^\s)]+/g;

/** Extract all URLs found in a text string. */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_RE);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Format web search results into a context string for the LLM.
 */
export function formatSearchResults(results: WebSearchResult[]): string {
  if (!results.length) return "";
  const lines = [
    "## Web Search Results",
    "",
    "The following are recent web search results. Use them to inform your answer. Cite sources using [title](url) format.",
    "",
  ];
  results.forEach((r, i) => {
    lines.push(`### ${i + 1}. ${r.title}`);
    lines.push(`- URL: ${r.url}`);
    lines.push(`- Snippet: ${r.snippet}`);
    lines.push("");
  });
  return lines.join("\n");
}

/**
 * Format a fetched URL's content into a context string for the LLM.
 */
export function formatFetchedContent(targetUrl: string, text: string): string {
  if (!text.trim()) return "";
  return [
    `## Fetched Content from ${targetUrl}`,
    "",
    "The following is the text content extracted from the URL provided by the user. Use this to answer their question.",
    "",
    text,
  ].join("\n");
}

/**
 * Compact a conversation via YiAi's /compact endpoint.
 * Returns the compacted message list (summary + recent messages).
 */
export async function compactConversation(
  messages: Array<{ role?: string; type?: string; message?: string; content?: string }>,
  keepLast = 4,
): Promise<{ messages: Array<{ role: string; content: string }>; original_count: number; compacted_count: number; error?: string }> {
  const url = buildYiAiUrl("/compact");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ messages, keep_last: keepLast }),
  });
  if (!resp.ok) throw new Error(`Compact failed: HTTP ${resp.status}`);
  const data = (await resp.json()) as YiAiEnvelope<any>;
  if (data.code !== 0) throw new Error(data.message || "Compact failed");
  return data.data;
}
