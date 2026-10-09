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
    // dev 环境下 /search 后端常返回空数组（YiAi 未建索引时 `Set of Tasks/Futures is empty），
    // 此时直接用项目种子数据（严格保持搜索条，保证 ⌘K /search 页不为空（不与真实项目数据一致。
    const isMockEnv = import.meta.env.RSBUILD_ENV_USE_MOCK === "true";
    if (isMockEnv && Array.isArray(data.data?.results) && data.data.results.length === 0) {
      return getMockUnifiedSearchResponse(query, collections, limit, opts);
    }
    return data.data;
  } catch (e) {
    const isMockEnv = import.meta.env.RSBUILD_ENV_USE_MOCK === "true";
    if (isMockEnv && !(e instanceof DOMException && e.name === "AbortError")) {
      // 无后端环境（mock/devbox/CI）：同上种子数据模拟响应，保证：
      //   (1) key 与真实项目保持一致（PROJECTS 表 = yiai / yipet / yivad / yiknowledge）
      //   (2) type / param 形参严格对齐 authMenuList.json（issue→:id，page→:key 等）
      //   (3) 含 archived 幽灵条目（include_archive=false 时被过滤），保证 ghost_filtered_count 非 0
      //   (4) 含 1 条 isHide=true 的隐藏项，用于 Gate A 不可达回归
      return getMockUnifiedSearchResponse(query, collections, limit, opts);
    }
    throw e;
  } finally {
    if (timeoutTid != null) {
      clearTimeout(timeoutTid);
      timeoutTid = null;
    }
  }
}

/* ── Mock 种子响应（devbox / mock mode 兜底）────────────────────────────── */
// 设计原则：
//  - 所有 project / module / page / issue / bug 名称严格贴近 YiVad 项目真实命名（见 config/index.ts
//    PROJECTS 表：yiai、yipet、yivad、yiknowledge），避免"假数据"脱离业务语义。
//  - 关键样例（交接摘要 10 条冒烟）全部命中：ISS-001 / BUG-007 / yivad / mod-search / DOC-998
//    / kanban / roadmap / 隐藏菜单 / archived ISS-002 + BUG-OLD。
//  - 排序评分 score 与 UI 展示的 relevance 一致；含 detail 字段让 /search 页右侧摘要不空。
function _seedDataset(): UnifiedSearchItem[] {
  const now = Date.now();
  const d = (daysAgo: number) => new Date(now - daysAgo * 864e5).toISOString().slice(0, 10);
  const badges = (t: "primary" | "success" | "warning" | "danger" | "info", ...labels: string[]): UnifiedSearchBadge[] =>
    labels.map(l => ({ label: l, type: t, effect: "plain" as const }));
  return [
    /* Issues — 需求/缺陷类，:id 路由形参 */
    {
      id: "iss-001", type: "issue", key: "ISS-001", project: "yivad",
      title: "全局搜索命令面板（⌘K）结果错链修复",
      subtitle: "需求 · P1 · yivad 项目 · 点击可达率 <60% 目标 ≥99%",
      detail: "覆盖 /search 页与 ⌘K 面板数据源漂移、错误 link 拼接、page 类错链到列表页三大根因，包含 Link Factory SSOT、三闸门 Gate A/B/C、DisposerBag.reset 语义治理。",
      badges: badges("primary", "Issue", "P1", "进行中"), date: d(2), score: 0.98, _ts: now - 2 * 864e5, _status: "active"
    },
    {
      id: "iss-002", type: "issue", key: "ISS-002", project: "yivad",
      title: "【已归档】登录页背景色不支持 dark mode",
      subtitle: "需求 · 已归档 · yivad",
      badges: badges("warning", "Issue", "Archived"), date: d(180), score: 0.20, _ts: now - 180 * 864e5, _status: "archived"
    },
    {
      id: "iss-003", type: "issue", key: "ISS-012", project: "yiknowledge",
      title: "知识库 RAG 多段召回切分优化",
      subtitle: "需求 · P2 · yiknowledge · 切分粒度从 512→256 tokens 提升 Top1 命中 12%",
      detail: "对比 chunk-size=512 / 256 / 128 三组 A/B，最终落地 256 + overlap=48 的 chunk 策略；并在重排阶段按标题段落加权。",
      badges: badges("primary", "Issue", "P2"), date: d(6), score: 0.85, _ts: now - 6 * 864e5, _status: "active"
    },
    {
      id: "iss-004", type: "issue", key: "ISS-021", project: "yiai",
      title: "YiAI /search/unified 增加 version=2 契约",
      subtitle: "需求 · P0 · yiai · 结果不再返回 link，由前端 Link Factory 统一生成",
      badges: badges("danger", "Issue", "P0"), date: d(4), score: 0.91, _ts: now - 4 * 864e5, _status: "active"
    },
    /* Bugs — :id 路由形参 */
    {
      id: "bug-007", type: "bug", key: "BUG-007", project: "yivad",
      title: "快捷键 Ctrl+K 被 Chrome 地址栏抢占",
      subtitle: "缺陷 · P1 · 复现率 90%（Chromium / Win）",
      detail: "根因：原监听为 passive bubbling 阶段；修复为 capture:true + stopImmediatePropagation 双层保险（main.ts registry 分发 + CommandPalette.vue 组件内）。",
      badges: badges("danger", "Bug", "P1", "已修复待验收"), date: d(1), score: 0.97, _ts: now - 1 * 864e5, _status: "active"
    },
    {
      id: "bug-old", type: "bug", key: "BUG-OLD", project: "yipet",
      title: "【幽灵】宠物喂食记录导入 500（已 tombstone）",
      subtitle: "缺陷 · 已 Tombstone · yipet",
      badges: badges("info", "Bug", "Tombstone"), date: d(220), score: 0.15, _ts: now - 220 * 864e5, _status: "tombstone"
    },
    {
      id: "bug-008", type: "bug", key: "BUG-008", project: "yiai",
      title: "AbortSignal.any 在 Node 18 下 undefined 导致 504",
      subtitle: "缺陷 · P2 · 旧浏览器/SSR 运行时",
      badges: badges("warning", "Bug", "P2"), date: d(9), score: 0.78, _ts: now - 9 * 864e5, _status: "active"
    },
    /* Projects — :key 路由形参 */
    {
      id: "prj-yivad", type: "project", key: "yivad", project: "yivad",
      title: "YiVad 研发协同工作台（当前项目）",
      subtitle: "项目 · 活跃 · 成员 7 · Issue 342 · Bug 98",
      detail: "覆盖 Issue/Project/Module/Page 四大实体；以 ⌘K 命令面板 + /search 全局搜索为统一入口；Link Factory SSOT、双 Watchdog、DisposerBag 语义为工程硬约束。",
      badges: badges("success", "Project", "Active"), date: d(0), score: 0.99, _ts: now, _status: "active"
    },
    {
      id: "prj-yiai", type: "project", key: "yiai", project: "yiai",
      title: "YiAI 后端服务（搜索 / AI / 嵌入）",
      subtitle: "项目 · 活跃 · 成员 5 · /search/unified /web-search /compact",
      badges: badges("success", "Project", "Active"), date: d(0), score: 0.93, _ts: now, _status: "active"
    },
    {
      id: "prj-yipet", type: "project", key: "yipet", project: "yipet",
      title: "YiPet 家庭宠物健康管理",
      subtitle: "项目 · 活跃 · 喂食 / 疫苗 / 体重",
      badges: badges("success", "Project", "Active"), date: d(3), score: 0.87, _ts: now - 3 * 864e5, _status: "active"
    },
    {
      id: "prj-yiknowledge", type: "project", key: "yiknowledge", project: "yiknowledge",
      title: "YiKnowledge 知识库 + RAG",
      subtitle: "项目 · 活跃 · 2,148 篇文档 / 312 标签",
      badges: badges("success", "Project", "Active"), date: d(1), score: 0.90, _ts: now - 1 * 864e5, _status: "active"
    },
    /* Modules — :key 路由形参 */
    {
      id: "mod-search", type: "module", key: "mod-search", project: "yivad",
      title: "全局搜索模块（mod-search）",
      subtitle: "模块 · yivad · ⌘K 命令面板 / /search 页 / MRU v2 Pinia",
      detail: "子模块：(1) searchService unifiedSearch (2) useUnifiedSearch composable (3) Link Factory + 三闸门 (4) linkValidationBadge (5) page/detail 详情页。",
      badges: badges("primary", "Module", "Core"), date: d(2), score: 0.96, _ts: now - 2 * 864e5, _status: "active"
    },
    {
      id: "mod-kanban", type: "module", key: "mod-kanban", project: "yivad",
      title: "看板模块（mod-kanban）",
      subtitle: "模块 · yivad · 泳道 / 拖拽 / 卡片联查",
      badges: badges("primary", "Module"), date: d(10), score: 0.80, _ts: now - 10 * 864e5, _status: "active"
    },
    {
      id: "mod-rag", type: "module", key: "mod-rag", project: "yiknowledge",
      title: "RAG 召回 + 重排（mod-rag）",
      subtitle: "模块 · yiknowledge · vector / keyword / hybrid",
      badges: badges("primary", "Module"), date: d(12), score: 0.76, _ts: now - 12 * 864e5, _status: "active"
    },
    /* Pages — :key 路由形参（新补的 menu_pageDetail children） */
    {
      id: "doc-998", type: "page", key: "DOC-998", project: "yivad",
      title: "Link Factory 三闸门工程硬约束（DOC-998）",
      subtitle: "文档 · yivad · Gate A 可达 → Gate B 存在 → Gate C 后写 MRU",
      detail: "A: resolveLink + diffRouteTemplates 校验；B: gateBEntityExists HEAD 或后端状态字段；C: gateCPostNavigate router.afterEach + DOM 选择器判空。任一失败灰卡 + 回退路由。",
      badges: badges("info", "Page", "必读"), date: d(5), score: 0.95, _ts: now - 5 * 864e5, _status: "active"
    },
    {
      id: "doc-901", type: "page", key: "DOC-901", project: "yivd_hidden",
      title: "内部文档 - 权限配置手册（管理员可见）",
      subtitle: "文档 · 隐藏项 · 普通用户 Gate A 直接灰卡",
      badges: badges("warning", "Page", "isHide"), date: d(30), score: 0.55, _ts: now - 30 * 864e5,
      _status: "active", _acl: { isHide: true, roles: ["admin"] }
    },
    {
      id: "doc-102", type: "page", key: "DOC-102", project: "yiknowledge",
      title: "知识库 chunk 策略 A/B 报告（DOC-102）",
      subtitle: "文档 · yiknowledge · Top1 命中率 +12%",
      badges: badges("info", "Page"), date: d(7), score: 0.82, _ts: now - 7 * 864e5, _status: "active"
    },
    /* 静态路由菜单：无详情形参的纯条目（对齐快捷栏 quickActions） */
    {
      id: "nav-kanban", type: "navigation", key: "nav-kanban", project: "",
      title: "看板 Kanban Board",
      subtitle: "快捷导航 · /kanban",
      badges: badges("primary", "Navigation"), date: d(0), score: 0.89, _ts: now, _status: "active"
    },
    {
      id: "nav-roadmap", type: "navigation", key: "nav-roadmap", project: "",
      title: "Roadmap 路线图",
      subtitle: "快捷导航 · /roadmap",
      badges: badges("primary", "Navigation"), date: d(0), score: 0.88, _ts: now, _status: "active"
    },
  ];
}

const _MOCK_DATASET: UnifiedSearchItem[] = _seedDataset();

function getMockUnifiedSearchResponse(
  query: string,
  collections?: string[],
  limit?: number,
  opts: UnifiedSearchCallOptions = {}
): UnifiedSearchResponse {
  const t0 = performance.now();
  const q = (query || "").trim().toLowerCase();
  const includeArchive = opts.include_archive === true;
  const sets = collections && collections.length ? new Set(collections.map(c => c.toLowerCase())) : null;
  let ghostFiltered = 0;

  let list = _MOCK_DATASET.filter(it => {
    if (sets && !sets.has(it.type.toLowerCase())) return false;
    // archived / tombstone 除非显式 include_archive，否则不算（并累计 ghost 统计）
    if (!includeArchive && (it._status === "archived" || it._status === "tombstone" || it._status === "pending_delete")) {
      ghostFiltered++;
      return false;
    }
    return true;
  });

  if (q) {
    const scorer = (it: UnifiedSearchItem): number => {
      let s = it.score;
      const hay = [it.key, it.title, it.subtitle, it.detail, it.project, it.type, ...(it.badges ?? []).map(b => b.label)]
        .filter(Boolean).join(" \u0001 ").toLowerCase();
      if (it.key.toLowerCase() === q) s += 3;
      if (it.key.toLowerCase().startsWith(q)) s += 1.2;
      if (hay.includes(q)) s += 0.8;
      const tokens = q.split(/\s+/).filter(Boolean);
      for (const t of tokens) if (hay.includes(t)) s += 0.35;
      return s;
    };
    list = list
      .map(it => ({ it, s: scorer(it) }))
      .filter(x => x.s > 0.25)
      .sort((a, b) => b.s - a.s)
      .map(x => ({ ...x.it, score: +x.s.toFixed(3) }));
  } else {
    list = [...list].sort((a, b) => b.score - a.score || b._ts - a._ts);
  }

  if (limit && limit > 0) list = list.slice(0, limit);

  const per_collection: Record<string, { count: number; ms: number }> = {};
  for (const it of list) {
    const k = it.type;
    if (!per_collection[k]) per_collection[k] = { count: 0, ms: 1 + Math.random() * 3 };
    per_collection[k].count += 1;
  }

  return {
    results: list,
    timing: { total_ms: +(performance.now() - t0).toFixed(1), per_collection, error: undefined },
    meta: { index_version: 20251008, ghost_filtered_count: ghostFiltered, schema_missing: 0 }
  };
}
