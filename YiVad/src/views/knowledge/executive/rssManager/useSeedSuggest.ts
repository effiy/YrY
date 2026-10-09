// ═══════════════════════════════════════════════════════════
// 共享：RSS 推荐种子（suggested seeds）逻辑
//
// 被 BriefingSection.vue 与 FeedsSection.vue 同时复用：
//   · 基于 selectedRoles 过滤 EXAMPLE_SEEDS
//   · 排除已存在的 key / url（防止重复）
//   · 通过 createSeed 落盘并 best-effort 解析
//   · 返回可直接用于模板的 computed（categoryOptions / suggestedSeeds）
// ═══════════════════════════════════════════════════════════

import { computed, reactive, ref, type ComputedRef, type Ref } from "vue";
import type { RssSeedDocument, RssParseResult } from "@/api/modules/rssService";
import { createSeed, getSeedList, parseFeed } from "@/api/modules/rssService";
import { ElMessage } from "element-plus";
import { EXAMPLE_SEEDS, type ExampleRssSeed } from "../data/rssSeedData";

export type SuggestT = (key: string, args?: Record<string, unknown>) => string;

export interface UseSeedSuggestApi {
  /** 真实 seeds（来自数据库），用于过滤"已存在"与生成 categoryOptions */
  seedOptions: Ref<RssSeedDocument[]>;
  /** 刷新 seedOptions */
  loadSeedsForOptions: (opts?: { timeout?: number; signal?: AbortSignal }) => Promise<void>;
  /** 形如 [{label,value,icon}] 的分类 select 选项（按 selectedRoles 过滤） */
  categoryOptions: ComputedRef<Array<{ label: string; value: string; icon: string }>>;
  /** 本次推荐的种子列表（≤6，去重，按 selectedRoles 过滤，否则跨角色兜底） */
  suggestedSeeds: ComputedRef<ExampleRssSeed[]>;
  /** 已标记为"添加过"的 key（避免重复请求） */
  suggestedAdded: Set<string>;
  /** 当前正在添加的单卡 key 或 null */
  suggestedLoading: Ref<string | null>;
  /** "全部添加"按钮 loading */
  addAllLoading: Ref<boolean>;
  /** 添加单颗种子 + 立即 mirror 到 seedOptions + best-effort parse */
  addSuggestedSeed: (seed: ExampleRssSeed) => Promise<boolean>;
  /** 批量添加当前 suggestedSeeds（串行，避免后端并发限流） */
  addAllSuggestedSeeds: (onDone?: () => void | Promise<void>) => Promise<void>;
  /** 带显式超时的 parse 包装（因为 RPC parseFeed 不接受 signal） */
  parseOneSeed: (url: string, opts?: { name?: string; timeout?: number }) => Promise<RssParseResult>;
}

/** 从 category 中取顶层 role，如 "executive/industry" → "executive" */
function roleFromCategory(cat: string): string {
  return (cat || "").split("/")[0] || "";
}

export function useSeedSuggest(
  rolesRef: Ref<string[]>,
  deps: {
    t: SuggestT;
    /** (e) => message — 错误摘要（ElMessage.error 使用） */
    errorMessage: (e: unknown) => string | undefined;
    /** 种子添加/解析成功后触发的父级副作用 */
    onSeedAdded?: (seed: ExampleRssSeed) => void | Promise<void>;
  }
): UseSeedSuggestApi {
  const seedOptions = ref<RssSeedDocument[]>([]);

  async function loadSeedsForOptions(opts?: { timeout?: number; signal?: AbortSignal }) {
    try {
      const params: Parameters<typeof getSeedList>[0] = {};
      // Only pass options that the RPC signature actually accepts; extra fields would cause TS strict errors.
      const res = await (getSeedList as unknown as (
        p: typeof params,
        o?: { timeout?: number; signal?: AbortSignal }
      ) => ReturnType<typeof getSeedList>)(params, { timeout: opts?.timeout, signal: opts?.signal });
      seedOptions.value = res.data?.list ?? [];
    } catch {
      seedOptions.value = [];
    }
  }

  const categoryOptions = computed(() => {
    const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
    const seen = new Set<string>();
    const opts: Array<{ label: string; value: string; icon: string }> = [];
    for (const s of seedOptions.value) {
      const cat = s.category || "";
      if (!cat || !cat.includes("/")) continue;
      const rid = roleFromCategory(cat);
      if (roleSet && !roleSet.has(rid)) continue;
      if (seen.has(cat)) continue;
      seen.add(cat);
      const sub = cat.slice(rid.length + 1);
      opts.push({ label: sub, value: cat, icon: "📁" });
    }
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  });

  const existingSeedKeys = computed(() => new Set(seedOptions.value.map(s => s.key).filter(Boolean) as string[]));
  const existingSeedUrls = computed(() => new Set(seedOptions.value.map(s => s.url).filter(Boolean)));

  const suggestedSeeds = computed<ExampleRssSeed[]>(() => {
    const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
    const pool = EXAMPLE_SEEDS.filter(seed => {
      if (existingSeedKeys.value.has(seed.key) || existingSeedUrls.value.has(seed.url)) return false;
      if (!roleSet) return true;
      const rid = roleFromCategory(seed.category);
      return roleSet.has(rid);
    }).slice(0, 6);
    if (pool.length > 0) return pool;
    return EXAMPLE_SEEDS.filter(
      s => !existingSeedKeys.value.has(s.key) && !existingSeedUrls.value.has(s.url)
    ).slice(0, 6);
  });

  const suggestedAdded = reactive(new Set<string>());
  const suggestedLoading = ref<string | null>(null);
  const addAllLoading = ref(false);

  async function parseOneSeed(
    url: string,
    opts?: { name?: string; timeout?: number }
  ): Promise<RssParseResult> {
    const timeout = opts?.timeout ?? 15_000;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    try {
      const res = await Promise.race([
        parseFeed(url, opts?.name),
        new Promise<never>((_, reject) => {
          ctrl.signal.addEventListener("abort", () => {
            const err = new Error("Parse request aborted") as Error & { code?: string; name?: string };
            err.name = "AbortError";
            err.code = "ERR_CANCELED";
            reject(err);
          });
        })
      ]);
      return res.data as RssParseResult;
    } finally {
      clearTimeout(timer);
    }
  }

  async function addSuggestedSeed(seed: ExampleRssSeed): Promise<boolean> {
    if (suggestedAdded.has(seed.key) || suggestedLoading.value) return false;
    suggestedLoading.value = seed.key;
    try {
      await createSeed({
        key: seed.key,
        url: seed.url,
        name: seed.name,
        category: seed.category,
        enabled: seed.enabled !== false
      });
      // Mirror 到 seedOptions，以便 suggestedSeeds 立即隐藏该卡
      seedOptions.value = [
        {
          key: seed.key,
          url: seed.url,
          name: seed.name,
          category: seed.category,
          enabled: seed.enabled !== false
        },
        ...seedOptions.value
      ];
      try {
        await parseOneSeed(seed.url, { name: seed.name, timeout: 15_000 });
      } catch {
        /* parse best-effort — 仍视为添加成功 */
      }
      suggestedAdded.add(seed.key);
      ElMessage.success(deps.t("rss.manager.briefing.suggest.addedOk", { name: seed.name }));
      await deps.onSeedAdded?.(seed);
      return true;
    } catch (e) {
      ElMessage.error(deps.errorMessage(e) || deps.t("rss.manager.briefing.suggest.addFail"));
      return false;
    } finally {
      suggestedLoading.value = null;
    }
  }

  async function addAllSuggestedSeeds(onDone?: () => void | Promise<void>) {
    if (addAllLoading.value) return;
    const pending = suggestedSeeds.value.filter(s => !suggestedAdded.has(s.key));
    if (!pending.length) {
      ElMessage.info(deps.t("rss.manager.briefing.suggest.allAdded"));
      return;
    }
    addAllLoading.value = true;
    try {
      let okCount = 0;
      for (const s of pending) {
        if (await addSuggestedSeed(s)) okCount++;
      }
      ElMessage.success(deps.t("rss.manager.briefing.suggest.addAllOk", { n: okCount, total: pending.length }));
      await loadSeedsForOptions();
      await onDone?.();
    } finally {
      addAllLoading.value = false;
    }
  }

  return {
    seedOptions,
    loadSeedsForOptions,
    categoryOptions,
    suggestedSeeds,
    suggestedAdded,
    suggestedLoading,
    addAllLoading,
    addSuggestedSeed,
    addAllSuggestedSeeds,
    parseOneSeed
  };
}
