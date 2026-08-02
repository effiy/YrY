/**
 * Web search service — calls YiAi's /web-search endpoint.
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

/**
 * Search the web via YiAi's DuckDuckGo-backed /web-search endpoint.
 */
export async function webSearch(query: string, maxResults = 6): Promise<WebSearchResponse> {
  const url = buildYiAiUrl("/web-search");
  const resp = await fetch(url, {
    method: "POST",
    headers: yiAiAuthHeaders(),
    body: JSON.stringify({ query, max_results: maxResults }),
  });
  if (!resp.ok) {
    throw new Error(`Web search failed: HTTP ${resp.status}`);
  }
  const data = (await resp.json()) as YiAiEnvelope<WebSearchResponse>;
  if (data.code !== 0) {
    throw new Error(data.message || "Web search failed");
  }
  return data.data;
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
