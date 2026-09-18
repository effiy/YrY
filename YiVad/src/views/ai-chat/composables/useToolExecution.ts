import type { Ref } from "vue";
import { formatSearchResults, rankByReputation, deduplicateByDomain } from "@/api/modules/searchService";
import type { WebSearchResult } from "@/api/modules/searchService";
import type { ChatMessage } from "@/api/interface/yiAi";
import type { AiChatStreamingType } from "@/views/ai-chat/types";

interface ToolResult {
  content: string;
  details?: Record<string, unknown>;
  error?: string;
}

interface ToolExecutionDeps {
  webSearchEnabled: Ref<boolean>;
  webSearchResults: Ref<WebSearchResult[]>;
  webSearching: Ref<boolean>;
  streamingPhase: Ref<string>;
  executeTool: (name: string, args: Record<string, unknown>, signal?: AbortSignal) => Promise<ToolResult | null>;
  setActiveMessages: (updater: (msgs: ChatMessage[]) => ChatMessage[]) => void;
  activeConversation: Ref<{
    messages?: ChatMessage[];
    key?: string;
    tags?: string[];
    pageContent?: string;
    title?: string;
    [key: string]: unknown;
  } | null>;
  persistActive: () => Promise<boolean>;
  runStream: (upToIdx: number, petTimestamp: number, type: AiChatStreamingType, searchContext?: string) => Promise<void>;
}

/** Result of the pre-stream tool execution phase. */
export interface PreStreamResult {
  /** Search context ready at the deadline (may be empty if search was slow). */
  initialContext: string;
  /** The refined query that was actually searched. */
  searchQuery: string;
  /** Search timing in ms (0 = cache hit or no search). */
  timingMs: number;
  /** Promise that resolves with late-arriving search context + results.
   *  Resolves with `null` if search completed before the deadline or was never started. */
  pendingSearch: Promise<{ context: string; results: WebSearchResult[]; timingMs: number } | null>;
}

const SEARCH_TIMEOUT_MS = 8_000;
/** Stream waits up to this deadline for search results.
 *  Most DuckDuckGo searches complete in 300-500ms. Results that arrive
 *  after the deadline are injected as a follow-up exchange via pendingSearch. */
const HARD_DEADLINE_MS = 500;
/** Frontend cache TTL matches the backend's 300s cache for consistency. */
const SEARCH_CACHE_TTL_MS = 300_000;
const SEARCH_CACHE_MAX_SIZE = 100;
const _searchCache = new Map<string, { ts: number; results: WebSearchResult[] }>();

function executeWithTimeout(
  name: string,
  executeTool: (name: string, args: Record<string, unknown>, signal?: AbortSignal) => Promise<ToolResult | null>,
  args: Record<string, unknown>,
  parentSignal: AbortSignal,
  timeoutMs: number
): Promise<ToolResult | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  const onParentAbort = () => ctrl.abort();
  parentSignal.addEventListener("abort", onParentAbort, { once: true });

  return executeTool(name, args, ctrl.signal).finally(() => {
    clearTimeout(timer);
    parentSignal.removeEventListener("abort", onParentAbort);
  });
}

/** Normalize a query for cache lookup — strip punctuation, collapse whitespace. */
function normalizeCacheKey(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Smart search trigger ───────────────────────────────────────────────

// Patterns that indicate the user does NOT need web search
const _SKIP_SEARCH_PATTERNS = [
  // English greetings / farewells
  /^(?:hi|hey|hello|yo|sup|good\s*(?:morning|afternoon|evening)|howdy)[\s!.?,]*$/i,
  /^(?:thanks|thank you|thx|ty|ok|okay|bye|goodbye|see ya|later)[\s!.?,]*$/i,
  // Chinese greetings / acknowledgments
  /^(?:你?好|您好|嗨|哈[啰咯]|早(?:上好)?|下午好|晚上好|大家好啊?)[\s!！。，,?.]*$/,
  /^(?:谢谢|多谢|感谢|好的|[好行可以]的?|嗯嗯?|哦|拜拜|再见|明天见|回头聊)[\s!！。，,?.]*$/,
  // Trivia that the model already knows
  /^(?:what\s+is\s+2\s*[+]\s*2|capital\s+of\s+\w+|\w+\s+in\s+(?:french|spanish|german|italian))[\s?.]*$/i,
  // Creative writing / storytelling
  /^write\s+(?:a|me\s+a)\s+(?:poem|story|song|joke|riddle|haiku|limerick)/i,
  /^tell\s+(?:me\s+)?a\s+(?:story|joke|riddle)/i,
  /^(?:写|来)(?:一?[个首篇段]|一下)?(?:诗|故事|笑话|谜语|歌|段子)/,
  // Code-related tasks
  /^(?:debug|fix|refactor|optimize|explain\s+this\s+code|code\s+review)/i,
  /^(?:帮我|请?你?帮?我?)(?:调试|修复|重构|优化|解释|审查|看看)(?:一下|这段|这个)?(?:代码|bug|错误)?/
];

// Patterns that indicate the user DOES need web search regardless of length
const _SEARCH_WORTHY_PATTERNS = [
  // Question words — user is asking for information
  /\b(?:what|who|where|when|why|how|which|whose|whom)\b/i,
  /[什么怎哪谁何为何多少几时]/,
  // Time-sensitive / current events
  /\b(?:latest|newest|current|recent|today|now|this year|this month|this week|20\d{2}|update|announce|release|breaking|news)\b/i,
  /[最新近今明昨本今这去上前]|新闻|消息|动态|进展|发布|公告|热点/,
  // Factual lookups
  /\b(?:price|cost|rate|stock|weather|temperature|population|height|capital|definition|meaning)\b/i,
  /[价格费用率股天气温人口高定义意思]/,
];

function _isSearchWorthy(query: string): boolean {
  const q = query.trim();
  // Code blocks (markdown fence) or shell commands — skip search
  if (/^\s*```/.test(q) || q.startsWith("$ ") || q.startsWith("> ")) return false;
  if (/^(?:def |function |class |import |const |let |var |npm |pip |git |docker )/i.test(q)) return false;

  // Check skip patterns first
  for (const pat of _SKIP_SEARCH_PATTERNS) {
    if (pat.test(q)) return false;
  }

  // Check search-worthy patterns — always trigger regardless of length
  for (const pat of _SEARCH_WORTHY_PATTERNS) {
    if (pat.test(q)) return true;
  }

  // Length heuristic: Chinese chars carry more meaning per character
  const cjkCount = (q.match(/[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]/g) || []).length;
  const effectiveLength = q.length + cjkCount * 2; // each CJK char ≈ 3 Latin chars in info density
  if (effectiveLength < 12) return false;

  return true;
}

export function useToolExecution(deps: ToolExecutionDeps) {
  const { webSearchEnabled, webSearchResults, webSearching, streamingPhase, executeTool } = deps;

  /**
   * Execute web search with a hard deadline. Stream starts after
   * HARD_DEADLINE_MS regardless — search results that arrive late are
   * delivered via `pendingSearch` for post-stream injection.
   */
  async function executePreStreamTools(
    userQuery: string,
    toolSignal: AbortSignal,
    _userTimestamp: number
  ): Promise<PreStreamResult> {
    if (!webSearchEnabled.value || !userQuery) {
      return { initialContext: "", searchQuery: "", timingMs: 0, pendingSearch: Promise.resolve(null) };
    }

    // Smart trigger: skip search for non-search-worthy messages
    if (!_isSearchWorthy(userQuery)) {
      streamingPhase.value = "thinking";
      return { initialContext: "", searchQuery: "", timingMs: 0, pendingSearch: Promise.resolve(null) };
    }

    streamingPhase.value = "fetching";
    webSearching.value = true;
    let deadlineFired = false;

    // Shared state between the racing search and the deadline
    let searchDone = false;
    let lateResults: WebSearchResult[] | null = null;
    let lateContext = "";
    let refinedQuery = userQuery;
    let searchTimingMs = 0;
    let resolvePending!: (value: { context: string; results: WebSearchResult[]; timingMs: number } | null) => void;
    const pendingSearch = new Promise<{ context: string; results: WebSearchResult[]; timingMs: number } | null>(r => {
      resolvePending = r;
    });

    const doSearch = async (): Promise<string> => {
      const searchStart = performance.now();
      try {
        const cacheKey = normalizeCacheKey(userQuery);
        const cached = _searchCache.get(cacheKey);
        let results: WebSearchResult[] = [];

        if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
          results = cached.results;
          searchTimingMs = 0; // cache hit
        } else {
          try {
            const result = await executeWithTimeout(
              "web_search",
              executeTool,
              { query: userQuery, maxResults: 6 },
              toolSignal,
              SEARCH_TIMEOUT_MS
            );
            searchTimingMs = Math.round(performance.now() - searchStart);
            // Tool returns details as { items, query, images } — extract items.
            const items = (result?.details as any)?.items as WebSearchResult[] | undefined;
            refinedQuery = ((result?.details as any)?.query as string) || userQuery;
            if (items?.length) {
              results = items;
              // LRU eviction to prevent unbounded cache growth
              if (_searchCache.size >= SEARCH_CACHE_MAX_SIZE) {
                const oldest = _searchCache.keys().next().value;
                if (oldest) _searchCache.delete(oldest);
              }
              _searchCache.set(cacheKey, { ts: Date.now(), results });
            } else if (result?.content) {
              // No structured results but content was returned (e.g., error message as text)
              webSearchResults.value = [];
              searchDone = true;
              if (deadlineFired) {
                resolvePending(null);
              }
              return result.content;
            }
          } catch {
            searchTimingMs = Math.round(performance.now() - searchStart);
            searchDone = true;
            if (deadlineFired) resolvePending(null);
            return "";
          }
        }

        if (results.length) {
          const ranked = deduplicateByDomain(results);
          const sorted = rankByReputation(ranked);
          const context = formatSearchResults(sorted);

          if (deadlineFired) {
            // Late arrival — deliver via pendingSearch for post-stream injection
            lateResults = sorted;
            lateContext = context;
            webSearchResults.value = sorted;
            resolvePending({ context, results: sorted, timingMs: searchTimingMs });
          } else {
            // On time — use as initial context
            webSearchResults.value = sorted;
          }

          searchDone = true;
          return context;
        }
      } finally {
        webSearching.value = false;
      }
      searchDone = true;
      if (deadlineFired) resolvePending(null);
      return "";
    };

    // Race: search vs deadline
    const deadline = new Promise<string>(resolve =>
      setTimeout(() => {
        deadlineFired = true;
        if (searchDone) {
          // Search already finished — resolve with whatever we got
          resolve(lateContext);
        } else {
          // Search still running — return empty, results will come via pendingSearch
          resolve("");
        }
      }, HARD_DEADLINE_MS)
    );

    const initialContext = await Promise.race([doSearch(), deadline]);
    return { initialContext, searchQuery: refinedQuery, timingMs: searchTimingMs, pendingSearch };
  }

  /**
   * Pre-fetch web search results while the user is still typing.
   * Call this on input pause (~600ms debounce). When the user hits Enter,
   * results are already cached → executePreStreamTools returns them instantly
   * with 0ms latency. Only fetches if:
   * - Web search is enabled
   * - Query looks search-worthy
   * - Cache miss (not recently searched)
   */
  async function preFetchSearch(query: string): Promise<void> {
    if (!webSearchEnabled.value) return;
    const q = query.trim();
    if (!_isSearchWorthy(q)) return;

    const cacheKey = normalizeCacheKey(q);
    // Check cache first — if already fresh, update UI immediately
    const cached = _searchCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < SEARCH_CACHE_TTL_MS) {
      webSearchResults.value = cached.results;
      return;
    }

    try {
      const result = await executeTool("web_search", { query: q, maxResults: 6 });
      if (!result?.details) return;
      const items = (result.details as any)?.items as WebSearchResult[] | undefined;
      if (items?.length) {
        if (_searchCache.size >= SEARCH_CACHE_MAX_SIZE) {
          const oldest = _searchCache.keys().next().value;
          if (oldest) _searchCache.delete(oldest);
        }
        _searchCache.set(cacheKey, { ts: Date.now(), results: items });
        // Show result count in the Web pill immediately
        webSearchResults.value = items;
      }
    } catch {
      // Pre-fetch is best-effort — silent failure is fine
    }
  }

  return { executePreStreamTools, preFetchSearch };
}
