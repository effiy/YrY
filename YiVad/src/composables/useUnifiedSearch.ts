/**
 * useUnifiedSearch — 命令面板（⌘K）与 /search 页的**统一搜索 composable**。
 *
 * 设计意图（对齐 YiVad 工程硬约束）：
 *   1. **SSOT 数据源**：命令面板不得手写 `getIssueList + projectStore.xxx` 临时拼装。任何搜索入口都必须
 *      通过 YiAi 的 `/search/unified?v=2` endpoint 取结果，保证面板和全局搜索页排序/评分/过滤逻辑
 *      一致，消除历史的"⌘K 搜不到 Bug，/search 搜得到"漂移。
 *   2. **AbortSignal 全链路 + 不乱序**：每次新 query 都产生新的 internal AbortController；
 *      同时使用 `AbortSignal.any([external, internal])` 联合外部超时控制器，**不覆盖**外部 signal
 *      （对齐 YiVad Axios 拦截器硬约束）。`searchSeq` 丢弃晚到响应。
 *   3. **DisposerBag 语义**：容器复用（同一 composable 连续多次 query）用 `reset()` 清条目保留容器，
 *      避免 dispose() 把容器 `disposed=true` 导致后续 AbortController 被立即 abort（参见
 *      useProjectDetail 历史竞态事故 — disposer.ts 的 Hard Constraint）。
 *   4. **双 Watchdog**：12s Hook Watchdog（内部逻辑强制退出 loading），22s UI Watchdog（
 *      内部 Promise 被吞时兜底）。任何 guard 分支都必须显式 `loading=false`。
 */

import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { DisposerBag } from "@/utils/disposer";
import { unifiedSearch, type UnifiedSearchBadge, type UnifiedSearchTiming } from "@/api/modules/searchService";
import { ElNotification } from "element-plus";
import { pushReliabilityEvent } from "@/utils/reliability/reliabilityMetrics";

/* -------------------------------------------------------------------------- */
/*  Public types — 与 YiAi /search/unified v2 envelope 对齐                    */
/* -------------------------------------------------------------------------- */

export interface UnifiedSearchItemV2 {
  id: string;
  type: "issue" | "project" | "module" | "bug" | "page" | string;
  /** 业务主键（后端 v2 契约保证非空） */
  key: string;
  title: string;
  subtitle: string;
  detail?: string;
  project: string;
  badges: UnifiedSearchBadge[];
  date: string;
  score: number;
  _ts: number;
  _status: "active" | "archived" | "pending_delete" | "tombstone" | string;
  _acl?: { roles?: string[]; users?: string[]; isHide?: boolean };
  /** 为了兼容历史消费侧的 v1 代码，后端在 version<2 时填；v2 不使用。类型上允许但**本 composable 忽略**。 */
  link?: never;
}

export interface UnifiedSearchMeta {
  index_version: number;
  ghost_filtered_count?: number;
  schema_missing?: number;
}

export interface UnifiedSearchResponseV2 {
  results: UnifiedSearchItemV2[];
  timing: UnifiedSearchTiming;
  meta?: UnifiedSearchMeta;
}

export interface UseUnifiedSearchOptions {
  collections?: string[];
  limit?: number;
  /** debounce 延迟（ms）；默认 200（避免每次击键都打后端） */
  debounceMs?: number;
  /** HTTP 超时（ms）；默认 15_000 */
  timeoutMs?: number;
  /** composable 内部 LRU 的 TTL（ms）；默认 10s */
  cacheTtlMs?: number;
  /** 外部注入的 AbortSignal。会与内部去重 controller 用 AbortSignal.any 联合。 */
  externalSignal?: AbortSignal;
  /** 是否在 onMounted 时如果 queryRef 非空就立即执行一次；默认 true */
  immediate?: boolean;
  /** 版本号，传给后端决定 envelope 结构。固定 v2，禁止改。 */
  version?: 2;
}

/* -------------------------------------------------------------------------- */
/*  LRU cache（进程级单例，命令面板 & /search 共享）                            */
/* -------------------------------------------------------------------------- */

interface CacheEntry {
  ts: number;
  data: UnifiedSearchResponseV2;
}
const _GLOBAL_CACHE = new Map<string, CacheEntry>();
const _GLOBAL_CACHE_MAX = 200;

function _cachePut(key: string, val: CacheEntry) {
  if (_GLOBAL_CACHE.size >= _GLOBAL_CACHE_MAX) {
    // LRU：删除最老的一条（插入序 Map）
    const oldest = _GLOBAL_CACHE.keys().next().value;
    if (oldest != null) _GLOBAL_CACHE.delete(oldest);
  }
  _GLOBAL_CACHE.set(key, val);
}

function _cacheGet(key: string, ttl: number): CacheEntry | null {
  const entry = _GLOBAL_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttl) {
    _GLOBAL_CACHE.delete(key);
    return null;
  }
  return entry;
}

export function invalidateUnifiedSearchCache() {
  _GLOBAL_CACHE.clear();
}

/* -------------------------------------------------------------------------- */
/*  Watchdog（项目级还未独立成模块时的 Gold Copy）                              */
/* -------------------------------------------------------------------------- */

interface WatchdogHandle {
  feed(): void;
  stop(): void;
}

function _createWatchdog(timeoutMs: number, onFire: () => void): WatchdogHandle {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const clear = () => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
    }
  };
  const schedule = () => {
    clear();
    timer = setTimeout(() => {
      timer = null;
      try { onFire(); } catch { /* noop */ }
    }, timeoutMs);
  };
  return { feed: schedule, stop: clear };
}

/* -------------------------------------------------------------------------- */
/*  Composable                                                                 */
/* -------------------------------------------------------------------------- */

export function useUnifiedSearch(
  queryRef: Ref<string>,
  options: UseUnifiedSearchOptions = {}
) {
  const opts: Required<Omit<UseUnifiedSearchOptions, "externalSignal" | "version">> & {
    externalSignal?: AbortSignal;
    version: 2;
  } = {
    collections: options.collections ?? [],
    limit: options.limit ?? 40,
    debounceMs: options.debounceMs ?? 200,
    timeoutMs: options.timeoutMs ?? 15_000,
    cacheTtlMs: options.cacheTtlMs ?? 10_000,
    externalSignal: options.externalSignal,
    immediate: options.immediate ?? true,
    version: options.version ?? 2,
  };

  const results = ref<UnifiedSearchItemV2[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<UnifiedSearchMeta | null>(null);
  const timing = ref<UnifiedSearchTiming | null>(null);
  const disposer = new DisposerBag();
  // 序号：丢弃乱序响应
  let seq = 0;

  // ── Hook Watchdog 12s ──────────────────────────────────────────────────
  // 内部死循环 / Promise 被吞时，强制跳出 loading 并上报。
  const hookWatchdog = _createWatchdog(12_000, () => {
    loading.value = false;
    error.value = error.value || "Search internal timeout (hook watchdog 12s)";
    disposer.reset();
    pushReliabilityEvent({
      id: `use-unified-search-hook-wd-${Date.now()}`,
      projectKey: "",
      phase: "search_query",
      stage: "watchdog",
      subStage: "hook_12s",
      errorType: "timeout",
      latencyMs: 12_000,
      tags: {}
    });
  });

  // ── UI Watchdog 22s ────────────────────────────────────────────────────
  // 兜底：用户视角 loading 永远不挂死（对齐 useProjectDetail 规范）。
  const uiWatchdog = _createWatchdog(22_000, () => {
    if (loading.value) {
      loading.value = false;
      error.value = error.value || "Search UI watchdog timeout (22s)";
      disposer.reset();
      try {
        ElNotification({
          title: "搜索超时",
          message: "搜索服务响应较慢，可稍后重试或在搜索页查看。",
          type: "warning",
          duration: 3000
        });
      } catch { /* noop */ }
    }
  });

  const _validateResult = (raw: any): UnifiedSearchItemV2 | null => {
    if (!raw || typeof raw !== "object") return null;
    if (typeof raw.type !== "string" || !raw.type) return null;
    if (typeof raw.key !== "string" || raw.key.length === 0) return null;
    if (typeof raw.title !== "string") return null;
    return raw as UnifiedSearchItemV2;
  };

  const _doSearch = async (rawQ: string) => {
    const q = rawQ.trim();
    if (!q) {
      results.value = [];
      loading.value = false;
      error.value = null;
      meta.value = null;
      timing.value = null;
      hookWatchdog.stop();
      uiWatchdog.stop();
      return;
    }

    seq += 1;
    const mySeq = seq;
    // 容器保留，仅清条目 — 严格 Hard Constraint：不要 dispose()！
    disposer.reset();

    const internalCtrl = new AbortController();
    disposer.addAbort(internalCtrl);
    hookWatchdog.feed();
    uiWatchdog.feed();

    // ── 联合 signal：对齐 YiVad Axios 拦截器硬约束 ──────────────────────
    const combinedSignal = ((): AbortSignal => {
      const external = opts.externalSignal;
      if (!external) return internalCtrl.signal;
      if (typeof (AbortSignal as any).any === "function") {
        try { return (AbortSignal as any).any([internalCtrl.signal, external]); }
        catch { /* fallthrough */ }
      }
      // AbortSignal.any 不可用时，退化为内部 signal + 外部 onabort 钩子镜像
      external.addEventListener("abort", () => { try { internalCtrl.abort(); } catch { /* noop */ } }, { once: true });
      return internalCtrl.signal;
    })();

    // ── 缓存命中：10s TTL，避免短时间大量重搜 ──────────────────────────────
    const cacheKey = [
      q, opts.collections.join(","), String(opts.limit), String(opts.version)
    ].join("|");
    const cached = _cacheGet(cacheKey, opts.cacheTtlMs);
    if (cached) {
      results.value = cached.data.results;
      timing.value = cached.data.timing;
      meta.value = cached.data.meta ?? null;
      loading.value = false;
      error.value = null;
      hookWatchdog.stop();
      uiWatchdog.stop();
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const raw = (await unifiedSearch(
        q,
        opts.collections.length ? opts.collections : undefined,
        opts.limit,
        combinedSignal,
        { timeout: opts.timeoutMs, signal: combinedSignal, version: opts.version }
      )) as unknown as UnifiedSearchResponseV2;

      // 乱序丢弃（用户快速输入，晚到响应覆盖新响应的竞态）
      if (mySeq !== seq) return;

      const arr = Array.isArray(raw?.results) ? raw.results : [];
      const valid: UnifiedSearchItemV2[] = [];
      for (const item of arr) {
        const ok = _validateResult(item);
        if (ok) valid.push(ok);
      }
      results.value = valid;
      timing.value = raw?.timing ?? null;
      meta.value = raw?.meta ?? null;
      _cachePut(cacheKey, { ts: Date.now(), data: { results: valid, timing: timing.value ?? { total_ms: 0 }, meta: meta.value ?? undefined } });
    } catch (e: any) {
      if (mySeq !== seq) return;
      // 主动 abort 的请求不算错误（用户连续输入时很常见）
      if (e && (e.name === "AbortError" || e?.code === "ERR_CANCELED" || (e.message && /cancel|abort/i.test(e.message)))) {
        // loading 仍需设为 false，避免骨架屏挂死
        loading.value = false;
        hookWatchdog.stop();
        uiWatchdog.stop();
        return;
      }
      error.value = (e && (e.message || e.code)) ? String(e.message || e.code) : "搜索服务不可用";
      results.value = [];
      try {
        pushReliabilityEvent({
          id: `use-unified-search-err-${Date.now()}`,
          projectKey: "",
          phase: "search_query",
          stage: "http",
          subStage: "error",
          errorType: (e?.name === "TimeoutError" || /timeout/i.test(error.value || "")) ? "timeout" : "network",
          latencyMs: 0,
          tags: { msg: error.value || "" }
        });
      } catch { /* noop */ }
    } finally {
      if (mySeq === seq) {
        loading.value = false;
        hookWatchdog.stop();
        uiWatchdog.stop();
      }
    }
  };

  const debouncedSearch = useDebounceFn(
    (q: string) => _doSearch(q),
    opts.debounceMs,
    { maxWait: Math.max(opts.debounceMs * 4, 800) }
  );

  // Watchdog 的启停要与 loading 严格联动：任何 loading=true 都重喂，false 才停。
  watch(
    loading,
    (l) => {
      if (l) {
        hookWatchdog.feed();
        uiWatchdog.feed();
      } else {
        hookWatchdog.stop();
        uiWatchdog.stop();
      }
    },
    { flush: "post" }
  );

  // 主驱动：query 变化触发 debounced 搜索
  watch(
    queryRef,
    (q) => debouncedSearch(q ?? ""),
    { flush: "post" }
  );

  const refresh = async () => {
    // refresh 强制跳过缓存 → 删除 key；走 debounced 立即 fire
    invalidateUnifiedSearchCache();
    await _doSearch(queryRef.value ?? "");
  };

  onMounted(() => {
    if (opts.immediate && (queryRef.value || "").trim()) {
      _doSearch(queryRef.value);
    }
  });

  onBeforeUnmount(() => {
    hookWatchdog.stop();
    uiWatchdog.stop();
    debouncedSearch.cancel();
    disposer.dispose();
  });

  return {
    /** 搜索结果（v2 契约，已过滤缺 key/缺 type 的脏条目） */
    results,
    loading,
    error,
    timing,
    meta,
    /** 手动触发一次完整刷新（跳过缓存） */
    refresh,
    /** 主动失效 LRU */
    invalidateCache: invalidateUnifiedSearchCache,
    /** 内部 disposer（供命令面板关闭时 / AiSnippet 关闭时 add 清理函数） */
    disposer,
    /** 序号（用于 UI 层检测乱序/挂死） */
    seq: computed(() => seq),
  };
}

export default useUnifiedSearch;
