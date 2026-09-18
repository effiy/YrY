/**
 * Register AI chat tools with the tool registry.
 * Each tool has a real execute function that calls YiAi endpoints.
 */

import { webSearch, webFetch, formatSearchResults, formatFetchedContent } from "@/api/modules/searchService";
import type { WebSearchResult, WebImageResult } from "@/api/modules/searchService";
import { ragQuery } from "@/api/modules/ragService";
import type { ToolDefinition } from "@/hooks/useToolRegistry";

interface ToolContext {
  registerTool: (tool: ToolDefinition) => void;
  webSearchResults: { value: WebSearchResult[] };
  webSearchImages: { value: WebImageResult[] };
}

export function registerAiChatTools(ctx: ToolContext): void {
  // ── web_search ───────────────────────────────────────────────────────
  ctx.registerTool({
    name: "web_search",
    label: "Web Search",
    description: "Search the web for current information. Returns titles, URLs, and descriptions.",
    promptSnippet: "answers include internet results",
    promptGuidelines: [
      "If web search results are present in the context, cite them using [title](url) format.",
      "When results are stale or insufficient, acknowledge the limitation rather than pretending.",
      "For time-sensitive questions, mention the search timestamp if visible in results."
    ],
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        maxResults: { type: "integer", description: "Max results (1-10, default 6)" }
      },
      required: ["query"]
    },
    async execute(args, signal) {
      const query = String(args.query ?? "").trim();
      if (!query) return { content: "", error: "No query provided" };
      try {
        const resp = await webSearch(query, (args.maxResults as number) ?? 6, signal);
        if (resp.error) return { content: "", error: resp.error };
        const results = resp.results ?? [];
        const images = resp.images ?? [];
        ctx.webSearchResults.value = results;
        ctx.webSearchImages.value = images;
        return {
          content: formatSearchResults(results),
          details: { items: results, query: resp.query || query, images } as Record<string, unknown>
        };
      } catch (e: any) {
        return { content: "", error: e?.message ?? String(e) };
      }
    },
    preStream: true,
    enabled: false
  });

  // ── web_fetch ────────────────────────────────────────────────────────
  ctx.registerTool({
    name: "web_fetch",
    label: "Web Fetch",
    description: "Fetch and extract text content from a URL.",
    promptSnippet: "fetches page content from URLs",
    parameters: {
      type: "object",
      properties: {
        url: { type: "string", description: "The URL to fetch content from" }
      },
      required: ["url"]
    },
    async execute(args, signal) {
      const url = String(args.url ?? "").trim();
      if (!url) return { content: "", error: "No URL provided" };
      try {
        const resp = await webFetch(url);
        if (resp.error) return { content: "", error: resp.error };
        if (!resp.text?.trim()) return { content: "", error: "Empty response" };
        return {
          content: formatFetchedContent(url, resp.text),
          details: { url, source: "web_fetch", chars: resp.text.length }
        };
      } catch (e: any) {
        return { content: "", error: e?.message ?? String(e) };
      }
    },
    preStream: true,
    enabled: false
  });

  // ── rag_search ───────────────────────────────────────────────────────
  ctx.registerTool({
    name: "rag_search",
    label: "RAG Search",
    description: "Search the internal knowledge base (YiKnowledge) for relevant documents.",
    promptSnippet: "searches internal knowledge base for context",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "The search query" },
        top_k: { type: "integer", description: "Number of results (1-20, default 5)" }
      },
      required: ["query"]
    },
    async execute(args) {
      const query = String(args.query ?? "").trim();
      if (!query) return { content: "", error: "No query provided" };
      try {
        const resp = await ragQuery({
          question: query,
          top_k: (args.top_k as number) ?? 5,
          hybrid: true,
          rerank: false,
          citations: true
        });
        const sources = (resp as any)?.sources ?? [];
        if (!sources.length) return { content: `No relevant documents found for: ${query}` };
        const lines = [`Knowledge base results for '${query}':`];
        for (let i = 0; i < sources.length; i++) {
          const s = sources[i];
          lines.push(`${i + 1}. [${s.file_path || "unknown"}] (score: ${(s.score ?? 0).toFixed(2)})`);
          lines.push(`   ${(s.text ?? "").slice(0, 500)}`);
        }
        return { content: lines.join("\n"), details: sources };
      } catch (e: any) {
        return { content: "", error: e?.message ?? String(e) };
      }
    },
    preStream: true,
    enabled: false
  });

  // ── web_search_toggle (UI-only placeholder) ──────────────────────────
  ctx.registerTool({
    name: "web_search_toggle",
    label: "Web Search Toggle",
    description: "Toggle web search on/off",
    promptSnippet: "",
    parameters: { type: "object", properties: {} },
    async execute() {
      return { content: "" };
    },
    enabled: false // placeholder — no real implementation yet
  });

  // ── context_save (placeholder) ───────────────────────────────────────
  ctx.registerTool({
    name: "context_save",
    label: "Save Context",
    description: "Save current context to YiKnowledge",
    promptSnippet: "",
    parameters: { type: "object", properties: {} },
    async execute() {
      return { content: "" };
    },
    enabled: false
  });
}
