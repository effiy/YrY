/**
 * useHelpSearch — HelpOS 统一搜索 Composable。
 *
 * 搜索范围（对齐 PRD FR-07）：
 *   - 页面帮助 sections（title + heading + content）
 *   - 快捷键速查（keys + description + category）
 *   - FAQ（question + answer + tags，静态 20 条 兜底 + 远端）
 *   - Changelog（summary + description）
 *
 * ⚠️ 硬闸：每次新 query 产生都 abort 上次请求（AC-07.1）；
 * 所有请求透传 { timeout, signal } 并使用 AbortSignal.any 联合。
 * LRU 缓存最近 20 条 query → 结果。
 */
import { computed, onBeforeUnmount, ref, watch, reactive, type Ref } from "vue";
import { fuzzySearch } from "@/utils/fuzzySearch";
import { shortcutRegistry } from "@/shortcuts/registry";
import { SHORTCUT_CATEGORIES } from "@/shortcuts/categories";
import { STATIC_FAQ } from "@/data/help/faq-static";
import { CHANGELOG_DATA } from "@/data/help/changelog-generated";
import { listPageHelp } from "@/data/help/page-help-content";
import { DisposerBag } from "@/utils/disposer";
import { searchFAQ } from "./helpServices";
import type {
  HelpSearchResult,
  HelpTabId,
  ShortcutReference,
  FAQItem,
  PageHelpContent,
  ChangelogEntry,
  HelpRequestOptions
} from "./types";

interface Scope {
  tab: HelpTabId;
  prefix: "@" | "";
  value: "all" | "shortcuts" | "faq" | "changelog" | "page-help";
}

export interface UseHelpSearchAPI {
  readonly query: Ref<string>;
  readonly results: Ref<HelpSearchResult[]>;
  readonly loading: Ref<boolean>;
  readonly scope: Ref<Scope["value"]>;
  /** 立即取消所有在途请求（不清空结果） */
  readonly abortAll: () => void;
}

/** 脚本侧：返回 ref；模板侧：通过 reactive 自动解 ref 一层（vue-tsc 会把 reactive<{query:Ref<string>}> 视作 {query: string}）。
 * 导出两种类型供调用方选择：
 *   - UseHelpSearchAPI      → 供 composable 内部/类型契约使用（Ref）
 *   - UseHelpSearchRuntime  → 供组件模板 + 脚本直接读取非 Ref 值使用
 */
export interface UseHelpSearchRuntime {
  query: string;
  results: HelpSearchResult[];
  loading: boolean;
  scope: Scope["value"];
  /** 脚本侧访问原始 ref（避免模板/脚本歧义） */
  readonly $: UseHelpSearchAPI;
  readonly abortAll: () => void;
}

const LRU_CACHE = new Map<string, HelpSearchResult[]>();
const LRU_MAX = 20;

export function useHelpSearch(opts: HelpRequestOptions = {}): UseHelpSearchRuntime {
  const query = ref("");
  const results = ref<HelpSearchResult[]>([]);
  const loading = ref(false);
  const scope = ref<Scope["value"]>("all");
  const bag = new DisposerBag();

  let lastAbort: AbortController | null = null;

  const parsed = computed(() => parseScope(query.value));
  watch(parsed, async ({ realQuery, scopeVal, scopeChanged }) => {
    if (scopeChanged) scope.value = scopeVal;
    const cacheKey = `${scope.value}:${realQuery}`;
    if (!realQuery.trim()) {
      results.value = [];
      loading.value = false;
      return;
    }
    if (LRU_CACHE.has(cacheKey)) {
      results.value = LRU_CACHE.get(cacheKey) ?? [];
      loading.value = false;
      return;
    }
    // abort previous
    if (lastAbort) lastAbort.abort("new-query");
    const ctrl = new AbortController();
    lastAbort = ctrl;
    bag.addAbort(ctrl);
    loading.value = true;

    try {
      const combined =
        opts.signal instanceof AbortSignal && typeof (AbortSignal as any).any === "function"
          ? (AbortSignal as any).any([opts.signal, ctrl.signal])
          : ctrl.signal;
      const out = await runSearch(realQuery, scope.value, { timeout: opts.timeout, signal: combined });
      if (!ctrl.signal.aborted) {
        results.value = out;
        putCache(cacheKey, out);
      }
    } catch {
      /* ctrl.aborted 情况无需处理 */
    } finally {
      if (!ctrl.signal.aborted) loading.value = false;
    }
  });

  onBeforeUnmount(() => {
    // ⚠️ reset, not dispose
    bag.reset();
  });

  const api: UseHelpSearchAPI = {
    query, results, loading, scope,
    abortAll: () => { if (lastAbort) lastAbort.abort("manual"); loading.value = false; }
  };
  const runtime = reactive({
    get query() { return query.value; },
    set query(v: string) { query.value = v; },
    get results() { return results.value; },
    get loading() { return loading.value; },
    get scope() { return scope.value; },
    get $() { return api; },
    abortAll: api.abortAll
  });
  // 显式返回 runtime（禁止 tsc 尝试把 reactive 与上方 UseHelpSearchAPI 返回类型强关联——此 composable 永远返回 UseHelpSearchRuntime）
  return runtime as unknown as UseHelpSearchRuntime;
} // 函数结束


/* ─────────────────────────── internal ─────────────────────────── */

function parseScope(q: string): { realQuery: string; scopeVal: Scope["value"]; scopeChanged: boolean } {
  const m = /^@(shortcuts|faq|changelog|page-help|help)\b(.*)$/.exec(q.trim());
  if (!m) return { realQuery: q, scopeVal: "all", scopeChanged: false };
  const raw = m[1] as Exclude<Scope["value"], "all"> | "help";
  const scopeVal: Scope["value"] = raw === "help" ? "page-help" : raw;
  return { realQuery: m[2].trim(), scopeVal, scopeChanged: true };
}

function putCache(k: string, v: HelpSearchResult[]) {
  LRU_CACHE.set(k, v);
  if (LRU_CACHE.size > LRU_MAX) {
    const oldestKey = LRU_CACHE.keys().next().value;
    if (oldestKey !== undefined) LRU_CACHE.delete(oldestKey);
  }
}

async function runSearch(q: string, scope: Scope["value"], opts: HelpRequestOptions): Promise<HelpSearchResult[]> {
  const out: HelpSearchResult[] = [];
  const doShortcuts = scope === "all" || scope === "shortcuts";
  const doPageHelp = scope === "all" || scope === "page-help";
  const doFAQ = scope === "all" || scope === "faq";
  const doChangelog = scope === "all" || scope === "changelog";

  if (doShortcuts) out.push(...searchShortcuts(q));
  if (doPageHelp) out.push(...searchPage(q));
  if (doChangelog) out.push(...searchChangelog(q));
  if (doFAQ) {
    const { items } = await searchFAQ(q, opts);
    for (const f of items) {
      out.push({
        id: `faq-${f.id}`,
        tab: "faq",
        title: f.question,
        snippet: (f.answer.length > 80 ? f.answer.slice(0, 80) + "…" : f.answer),
        score: 0.75,
        open: () => {
          /* 由 Panel 组件接管滚动到对应 FAQ id */
          (window as any).__YIVAD_HELP_OPEN_FAQ__?.(f.id);
        }
      });
    }
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 50);
}

function searchShortcuts(q: string): HelpSearchResult[] {
  const src = shortcutRegistry.getAllShortcuts().map<ShortcutReference>(s => ({
    id: s.id,
    keys: s.keys || (s.sequence || []).join(" "),
    description: s.description,
    category: s.category,
    scope: s.scope,
    enabled: s.enabled !== false,
    sequence: s.sequence
  }));
  const hits = fuzzySearch(src, q, {
    keys: [
      "keys",
      "description",
      { name: "category", weight: 2 }
    ],
    threshold: 0.5,
    minMatchCharLength: 1
  });
  return hits.map(h => ({
    id: `shortcut-${h.item.id}`,
    tab: "shortcuts" as const,
    title: h.item.description,
    snippet: `<kbd>${h.item.keys}</kbd> · ${SHORTCUT_CATEGORIES[h.item.category]?.name ?? h.item.category}`,
    score: 1 - (h.score ?? 0.5),
    open: () => {
      (window as any).__YIVAD_HELP_OPEN_SHORTCUT__?.(h.item.id);
      if (h.item.enabled && typeof h.item.handler === "function") {
        try { h.item.handler(new KeyboardEvent("keydown", { bubbles: true })); } catch { /* noop */ }
      }
    }
  }));
}

function searchPage(q: string): HelpSearchResult[] {
  const pool: PageHelpContent[] = [...listPageHelp("zh"), ...listPageHelp("en")];
  const hits = fuzzySearch(pool, q, {
    keys: [
      "title",
      { name: "sections.content", weight: 1.2 },
      { name: "sections.heading", weight: 2 },
      "routePattern"
    ],
    threshold: 0.55
  });
  return hits.map(h => ({
    id: `page-${h.item.routePattern}-${h.item.locale}`,
    tab: "page-help" as const,
    title: h.item.title,
    snippet: `${h.item.routePattern} · ${h.item.sections[0]?.heading ?? ""}`,
    score: (1 - (h.score ?? 0.5)) * 0.98,
    open: () => (window as any).__YIVAD_HELP_OPEN_PAGE__?.(h.item.routePattern)
  }));
}

function searchChangelog(q: string): HelpSearchResult[] {
  const pool: ChangelogEntry[] = CHANGELOG_DATA.slice(0, 30);
  const hits = fuzzySearch(pool, q, {
    keys: [
      "version",
      "summary",
      "sections.description",
      { name: "sections.type", weight: 2 }
    ],
    threshold: 0.6
  });
  return hits.map(h => ({
    id: `log-${h.item.version}`,
    tab: "changelog" as const,
    title: `v${h.item.version} (${h.item.date})`,
    snippet: h.item.summary,
    score: (1 - (h.score ?? 0.5)) * 0.95,
    open: () => (window as any).__YIVAD_HELP_OPEN_LOG__?.(h.item.version)
  }));
}
