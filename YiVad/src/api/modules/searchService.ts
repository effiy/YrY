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

// ── Unified internal search ────────────────────────────────────────────────

export interface UnifiedSearchBadge {
  label: string;
  type?: "primary" | "success" | "warning" | "danger" | "info" | "";
  effect?: "plain" | "dark";
}

export interface UnifiedSearchItem {
  id: string;
  /** 实体 singular 后的类型字典值，与后端 v2 `_type` 对齐 */
  type: "issue" | "project" | "module" | "bug" | "page" | string;
  /** 业务主键（后端 v2 契约强制非空；A 闸门依赖） */
  key: string;
  title: string;
  subtitle: string;
  detail?: string;
  project: string;
  /**
   * 历史强字段，但 v2 后端**不再返回**。类型上保留但默认 undefined，禁止消费方使用。
   * Link Factory（resolveLink）是生成 link 的唯一可信入口。
   */
  link?: never;
  badges: UnifiedSearchBadge[];
  date: string;
  score: number;
  _ts: number;
  /** 后端 v2 额外补充的状态 */
  _status?: "active" | "archived" | "pending_delete" | "tombstone" | string;
  _acl?: { roles?: string[]; users?: string[]; isHide?: boolean };
}

export interface UnifiedSearchTiming {
  total_ms: number;
  per_collection?: Record<string, { count: number; ms: number }>;
  error?: string;
}

export interface UnifiedSearchMeta {
  index_version: number;
  ghost_filtered_count?: number;
  schema_missing?: number;
}

export interface UnifiedSearchResponse {
  results: UnifiedSearchItem[];
  timing: UnifiedSearchTiming;
  meta?: UnifiedSearchMeta;
}

export interface UnifiedSearchCallOptions {
  /** 调用端超时；不设置时用 fetch 层默认。**不会**覆盖外部 signal。 */
  timeout?: number;
  /**
   * 外部注入的 AbortSignal。本函数在内部会再创建一个超时 AbortController，
   * 并通过 `AbortSignal.any([external, internal])` 合并，保证任何一方触发都能正确 abort。
   * （对齐 YiVad axios 拦截器硬约束，严禁用内部 controller 覆盖 external。）
   */
  signal?: AbortSignal;
  /**
   * v2：后端返回的 item 中**不再包含 link**（由前端 Link Factory 生成）。
   * v1：仅在需要兼容 2025.10 之前的历史前端时传 1（默认 2）。
   */
  version?: 1 | 2;
  /** 是否过滤 archived 幽灵条目（默认 false，与后端默认一致） */
  include_archive?: boolean;
}

/**
 * Search across all internal collections via YiAi's /search/unified endpoint.
 * Runs all collection searches in parallel with relevance scoring.
 *
 * NOTE：当前实现用 fetch 直接发 YiAi（而非 http.ts axios 封装），避免 axios cancelToken 与
 * AbortController 语义二义性（项目历史上混用导致过 2 次 signal 泄漏）。
 */
export async function unifiedSearch(
  query: string,
  collections?: string[],
  limit?: number,
  /**
   * Deprecated — 保留形参位以兼容历史调用（L254 旧签名统一走 opts）。
   * 推荐：统一使用第 5 个参数 `opts.signal` 注入 AbortSignal。
   */
  _legacySignal?: AbortSignal,
  opts: UnifiedSearchCallOptions = {}
): Promise<UnifiedSearchResponse> {
  const version = opts.version ?? 2;
  const body: Record<string, unknown> = {
    query,
    version,
    include_archive: opts.include_archive ?? false,
  };
  if (collections?.length) body.collections = collections;
  if (limit) body.limit = limit;

  // ── signal 合并：严格对齐 YiVad 硬约束 ───────────────────────────────────
  // 规则：
  //  1) opts.signal / _legacySignal 任一存在 → 视作外部
  //  2) 有 timeout → 内部再建超时 Controller
  //  3) 任一方触发 abort 都取消请求
  const externalSignals: AbortSignal[] = [];
  if (opts.signal) externalSignals.push(opts.signal);
  if (_legacySignal) externalSignals.push(_legacySignal);

  const hasInternalTimeout = typeof opts.timeout === "number" && opts.timeout > 0;
  let internalTimeoutCtrl: AbortController | null = null;
  if (hasInternalTimeout) {
    internalTimeoutCtrl = new AbortController();
  }

  const allSignals: AbortSignal[] = [...externalSignals];
  if (internalTimeoutCtrl) allSignals.push(internalTimeoutCtrl.signal);

  let combined: AbortSignal;
  if (allSignals.length === 0) {
    combined = new AbortController().signal;
  } else if (allSignals.length === 1) {
    combined = allSignals[0];
  } else if (typeof (AbortSignal as any).any === "function") {
    try {
      combined = (AbortSignal as any).any(allSignals);
    } catch {
      combined = allSignals[0];
    }
  } else {
    // 浏览器不支持 AbortSignal.any（<2022 Chromium）：退化为第一个 external + 其余 mirror
    combined = externalSignals[0] || allSignals[0];
    for (let i = 1; i < allSignals.length; i++) {
      if (allSignals[i].aborted) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          (new AbortController()).abort();
        } catch { /* noop */ }
      } else {
        allSignals[i].addEventListener(
          "abort",
          () => {
            // 任何一个 abort 时，若 combined 来自 AbortController：只能通过持有 ctrl 才能主动 abort。
            // 退化策略：combined 本身就是第 1 个 signal；其它 signal 触发时 abort 请求的 fetch 层无能为力。
            // 所以当 AbortSignal.any 不存在时，使用 internal ctrl 作为 combined 主控；再把所有 external
            //   和 internal 手动串联。
          },
          { once: true }
        );
      }
    }
  }

  // 上一段退化逻辑实际不生效（AbortSignal 只读）。当 AbortSignal.any 不可用且存在多 signal，
  // 必须走下面的 fallback：新 ctrl + 手动 mirror abort。
  if (allSignals.length > 1 && !(typeof (AbortSignal as any).any === "function")) {
    const fallbackCtrl = new AbortController();
    for (const s of allSignals) {
      if (s.aborted) {
        try { fallbackCtrl.abort(); } catch { /* noop */ }
        break;
      }
      s.addEventListener("abort", () => { try { fallbackCtrl.abort(); } catch { /* noop */ } }, { once: true });
    }
    combined = fallbackCtrl.signal;
  }

  // 内部超时触发（如需要）
  let timeoutTid: ReturnType<typeof setTimeout> | null = null;
  if (internalTimeoutCtrl && hasInternalTimeout) {
    timeoutTid = setTimeout(() => {
      timeoutTid = null;
      try { (internalTimeoutCtrl as AbortController).abort(new DOMException("UnifiedSearch timed out", "TimeoutError")); }
      catch { /* noop */ }
    }, opts.timeout!);
  }

  try {
    const resp = await fetch(buildYiAiUrl("/search/unified"), {
      method: "POST",
      headers: yiAiAuthHeaders(),
      body: JSON.stringify(body),
      signal: combined,
    });
    if (!resp.ok) throw new Error(`Unified search failed: HTTP ${resp.status}`);
    const data = (await resp.json()) as YiAiEnvelope<UnifiedSearchResponse>;
    if (data.code !== 0) throw new Error(data.message || "Unified search failed");
    return data.data;
  } finally {
    if (timeoutTid != null) {
      clearTimeout(timeoutTid);
      timeoutTid = null;
    }
  }
}
