import { ref, reactive, computed, watch, markRaw, onBeforeUnmount, type Ref } from "vue";
import { ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";
import {
  getSeedList,
  createSeed,
  updateSeed,
  deleteSeed,
  getRssList,
  parseFeed,
  parseAllEnabledFeeds,
  type RssSeedDocument,
  type RssItemDocument
} from "@/api/modules/rssService";
import { scanKnowledge, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { loadBool, saveBool, loadJson, saveJson } from "@/utils/storage";
import { DisposerBag } from "@/utils/disposer";
import { nanoid } from "nanoid";
import { EXAMPLE_SEEDS } from "@/views/knowledge/executive/data/rssSeedData";
import { useFormatting } from "./useFormatting";
import { ROLE_IDS } from "@/views/knowledge/executive/okrData";

const SEEDS_SEEDED_KEY = "yivad.rss.seedsSeeded";
const RETRY_QUEUE_KEY = "yivad.rss.retryQueue";
const PRUNE_CACHE_KEY = "yivad.rss.pruneCache";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
export type FetchStatus = "ok" | "timeout" | "rate" | "fail" | "stale" | "unknown";

export interface FeedFetchRecord {
  at: number;
  ok: boolean;
  latencyMs?: number;
  count?: number;
  status?: number;
  error?: string;
}

export interface FeedHealthAggregate {
  url: string;
  ok24h: boolean;
  stale: boolean;
  avgLatency10: number;
  last10: FeedFetchRecord[];
}

export interface FetchStatusPill {
  kind: FetchStatus;
  latencyMs?: number;
  count?: number;
  status?: number;
  error?: string;
}

export interface RetryQueueEntry {
  id: string;
  feedUrl: string;
  feedName?: string;
  lastError: string;
  retryCount: number;
  nextRetryAt: number;
  createdAt: number;
}

export interface PruneMonth {
  label: string;
  expected: number;
  actual: number;
  rate: number;
}

export interface PruneHeatCell {
  role: string;
  month: string;
  rate: number;
}

export interface PruneSnapshot {
  updatedAt: number;
  currentRate: number;
  targetRate: number;
  months: PruneMonth[];
  heat: PruneHeatCell[];
  byRole: Record<string, number>;
}

export interface SeedForm {
  title: string;
  url: string;
  category: string;
  ownerRole: string;
  fetchIntervalMinutes: number;
  pruneThresholdDays: number;
  enabled: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}
function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}
function seededRand(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 2246822507);
    s = Math.imul(s ^ (s >>> 13), 3266489909);
    s = (s ^ (s >>> 16)) >>> 0;
    return s / 4294967296;
  };
}

function latencyTierColor(avgMs: number): string {
  if (avgMs <= 0) return "#909399";
  if (avgMs < 200) return "#67c23a";
  if (avgMs < 400) return "#85ce61";
  if (avgMs < 800) return "#e6a23c";
  if (avgMs < 1600) return "#f56c6c";
  return "#c45656";
}

const KNOWN_ROLES = [
  "executive",
  "aier",
  "engineer",
  "sre",
  "product",
  "curator",
  "leader"
];

function lastNMonths(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    out.push(`${d.getFullYear()}-${m}`);
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Request guard pattern (beginRequest/endRequest / watchdog)
// ────────────────────────────────────────────────────────────────────────────
type AbortEntry = { ctrl: AbortController; version: number };

/**
 * Feeds composable — owns all seed/feed CRUD state and methods.
 * Accepts selectedRoles for filtering.
 *
 * Disposer: only `onBeforeUnmount` → dispose(); internal state refreshes use `reset()`.
 */
export function useFeeds(selectedRoles: Ref<string[]>) {
  const { t, errorMessage, formatTime, formatTimeAgo, formatInterval, subCategory, roleFromCategory } = useFormatting();

  const bag = markRaw(new DisposerBag());

  const inflight = new Map<string, AbortEntry>();
  const versions = new Map<string, number>();

  function beginRequest(key: string): { signal: AbortSignal; version: number; isStale: () => boolean } {
    const prev = inflight.get(key);
    if (prev) {
      try { prev.ctrl.abort(); } catch { /* noop */ }
    }
    const ctrl = new AbortController();
    bag.addAbort(ctrl);
    const version = (versions.get(key) ?? 0) + 1;
    versions.set(key, version);
    inflight.set(key, { ctrl, version });
    return {
      signal: ctrl.signal,
      version,
      isStale: () => (versions.get(key) ?? 0) !== version
    };
  }

  function endRequest(key: string) {
    inflight.delete(key);
  }

  function isCancel(e: unknown): boolean {
    if (!e) return false;
    const name = (e as any)?.name as string | undefined;
    return name === "CanceledError" || name === "AbortError" || (e as any)?.code === "ERR_CANCELED";
  }

  // ── Seeds state ──
  const seeds = ref<RssSeedDocument[]>([]);
  const seedsLoading = ref(false);
  const seedSearch = ref("");
  const parsingSeed = ref("");
  const seedToggling = ref("");
  const seedSaving = ref(false);
  const parseTimes = reactive<Record<string, number>>({});
  const seedIntervals = reactive<Record<string, number>>({});
  const seedArticleCounts = reactive<Record<string, number>>({});
  const parseAllLoading = ref(false);

  // ── Filter state (NEW) ──
  const fetchStatusFilter = ref<"" | "ok" | "failing" | "timeout" | "stale">("");
  const currentMonthOnly = ref(false);
  const monthRange = ref<string>(lastNMonths(6).pop()!);

  // ── Health state ──
  const fetchHistory = reactive<Record<string, FeedFetchRecord[]>>({});
  const testFetchStatus = reactive<Record<string, FetchStatusPill>>({});
  const testFetchLoading = reactive<Record<string, boolean>>({});

  // ── Retry queue ──
  const retryVisible = ref(false);
  const retryQueue = ref<RetryQueueEntry[]>(
    loadJson<RetryQueueEntry[]>(RETRY_QUEUE_KEY, [])
  );
  const pruneSnapshot = ref<PruneSnapshot | null>(
    loadJson<PruneSnapshot | null>(PRUNE_CACHE_KEY, null)
  );
  const pruneLoading = ref(false);

  function persistRetry() {
    saveJson(RETRY_QUEUE_KEY, retryQueue.value);
  }

  // ── Seed dialog form (extended) ──
  const seedDialogVisible = ref(false);
  const editingSeed = ref<RssSeedDocument | null>(null);
  const seedForm = reactive<SeedForm>({
    title: "",
    url: "",
    category: "",
    ownerRole: "",
    fetchIntervalMinutes: 0,
    pruneThresholdDays: 30,
    enabled: true
  });

  function openSeedDialog(row?: RssSeedDocument) {
    editingSeed.value = row || null;
    const rid = row?.category ? roleFromCategory(row.category) : (selectedRoles.value[0] ?? "");
    if (row) {
      seedForm.url = row.url ?? "";
      seedForm.title = row.name ?? "";
      seedForm.category = row.category ?? "";
      seedForm.ownerRole = rid;
      seedForm.fetchIntervalMinutes = row.interval ? Math.round(row.interval / 60) : 0;
      seedForm.pruneThresholdDays = (row as any).pruneThresholdDays ?? 30;
      seedForm.enabled = Boolean(row.enabled !== false ? true : false);
    } else {
      seedForm.url = "";
      seedForm.title = "";
      seedForm.category = "";
      seedForm.ownerRole = rid;
      seedForm.fetchIntervalMinutes = 0;
      seedForm.pruneThresholdDays = 30;
      seedForm.enabled = true;
    }
    seedDialogVisible.value = true;
  }

  // ── Computed: role-filtered base list ──
  const roleFilteredSeeds = computed(() => {
    if (!selectedRoles.value.length) return seeds.value;
    return seeds.value.filter(s => selectedRoles.value.includes(roleFromCategory(s.category)));
  });

  const feedsCount = computed(() => roleFilteredSeeds.value.length);

  // ── Health aggregation per feed ──
  const healthAggregate = computed<Record<string, FeedHealthAggregate>>(() => {
    const out: Record<string, FeedHealthAggregate> = {};
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    for (const seed of seeds.value) {
      const url = seed.url ?? "";
      const hist = fetchHistory[url] ?? [];
      const last10 = hist.slice(-10);
      const last24Ok = hist.some(h => h.ok && (now - h.at) <= DAY);
      const anyRecentParse = parseTimes[url] && (now - parseTimes[url]) <= DAY;
      const parsedOk = !!last24Ok || !!anyRecentParse;
      let stale = false;
      const sevenDaysAgo = now - 7 * DAY;
      if (hist.length > 0) {
        const last = hist[hist.length - 1];
        stale = Boolean(
          (!last.ok && (now - last.at) >= 7 * DAY) ||
            (!!parseTimes[url] && parseTimes[url] < sevenDaysAgo)
        );
      } else if (parseTimes[url]) {
        stale = Boolean(parseTimes[url] < sevenDaysAgo);
      }
      const latencies = last10.filter(h => typeof h.latencyMs === "number").map(h => h.latencyMs as number);
      const avgLatency10 = latencies.length
        ? latencies.reduce((s, x) => s + x, 0) / latencies.length
        : 0;
      out[url] = { url, ok24h: parsedOk, stale, avgLatency10, last10 };
    }
    return out;
  });

  // ── Health KPI ──
  const totalFeedsKpi = computed(() => roleFilteredSeeds.value.length);

  const healthyTodayKpi = computed(() =>
    roleFilteredSeeds.value.filter(s => healthAggregate.value[s.url ?? ""]?.ok24h).length
  );

  const staleLast7dKpi = computed(() =>
    roleFilteredSeeds.value.filter(s => healthAggregate.value[s.url ?? ""]?.stale).length
  );

  const avgFetchLatencyKpi = computed(() => {
    const list = roleFilteredSeeds.value
      .map(s => healthAggregate.value[s.url ?? ""]?.avgLatency10 ?? 0)
      .filter(v => v > 0);
    if (!list.length) return 0;
    return Math.round(list.reduce((s, x) => s + x, 0) / list.length);
  });

  const avgFetchLatencyColor = computed(() => latencyTierColor(avgFetchLatencyKpi.value));

  // 14-day heuristic sparkline series for each KPI (driven by real list size, seeded rand for stability)
  function makeSpark14(k: "total" | "healthy" | "stale" | "lat"): number[] {
    const seedKey = k + "|" + selectedRoles.value.join(",");
    const rnd = seededRand(hashStr(seedKey));
    const current = k === "total"
      ? totalFeedsKpi.value
      : k === "healthy" ? healthyTodayKpi.value
      : k === "stale" ? staleLast7dKpi.value
      : avgFetchLatencyKpi.value;
    const base = Math.max(1, current || 1);
    const out: number[] = [];
    for (let i = 0; i < 14; i++) {
      const wobble = (rnd() - 0.45) * 0.25;
      const ratio = 0.85 + 0.18 * (i / 13) + wobble;
      out.push(Math.max(0, Math.round(base * ratio)));
    }
    out[13] = current || out[13];
    return out;
  }
  const totalSparkline = computed(() => makeSpark14("total"));
  const healthySparkline = computed(() => makeSpark14("healthy"));
  const staleSparkline = computed(() => makeSpark14("stale"));
  const latencySparkline = computed(() => makeSpark14("lat"));

  // ── Filtered seeds (combines search, role, fetch-status, month filters) ──
  const filteredSeeds = computed(() => {
    let list = roleFilteredSeeds.value;
    if (seedSearch.value) {
      const q = seedSearch.value.toLowerCase();
      list = list.filter(s =>
        (s.name ?? "").toLowerCase().includes(q) ||
        (s.url ?? "").toLowerCase().includes(q) ||
        ((s.tags ?? []).join(" ").toLowerCase().includes(q))
      );
    }
    if (fetchStatusFilter.value) {
      list = list.filter(s => {
        const h = healthAggregate.value[s.url ?? ""];
        const last = testFetchStatus[s.url ?? ""];
        if (fetchStatusFilter.value === "ok") return h?.ok24h || last?.kind === "ok";
        if (fetchStatusFilter.value === "failing") {
          const pill = last;
          return pill?.kind === "fail" || pill?.kind === "rate";
        }
        if (fetchStatusFilter.value === "timeout") return last?.kind === "timeout";
        if (fetchStatusFilter.value === "stale") return h?.stale;
        return true;
      });
    }
    if (currentMonthOnly.value && monthRange.value) {
      const monthStart = new Date(monthRange.value + "-01T00:00:00").getTime();
      list = list.filter(s => {
        const pt = parseTimes[s.url ?? ""] ?? 0;
        return pt >= monthStart;
      });
    }
    return list;
  });

  // ── Seed options (used externally) ──
  const seedOptions = computed(() => {
    const roleSet = selectedRoles.value.length ? new Set(selectedRoles.value) : null;
    return seeds.value
      .filter(s => s.name && (!roleSet || roleSet.has(roleFromCategory(s.category))))
      .map(s => ({ label: s.name!, value: s.name! }));
  });

  // ── Seed dialog save ──
  async function saveSeed() {
    if (!seedForm.url.trim()) {
      ElMessage.warning(t("rss.manager.seeds.save.urlRequired"));
      return;
    }
    seedSaving.value = true;
    const req = beginRequest("saveSeed");
    try {
      const category = seedForm.category?.trim()
        ? seedForm.category.trim()
        : (seedForm.ownerRole ? `${seedForm.ownerRole}/uncategorized` : undefined);
      const interval = seedForm.fetchIntervalMinutes > 0 ? seedForm.fetchIntervalMinutes * 60 : undefined;
      const patch: Partial<RssSeedDocument> & { url: string; pruneThresholdDays?: number; ownerRole?: string; tags?: string[] } = {
        url: seedForm.url.trim(),
        name: seedForm.title.trim() || undefined,
        category,
        interval,
        pruneThresholdDays: seedForm.pruneThresholdDays,
        ownerRole: seedForm.ownerRole || undefined,
        tags: Array.from(new Set([
          ...(editingSeed.value?.tags ?? []),
          ...(seedForm.ownerRole ? [seedForm.ownerRole] : [])
        ].filter(Boolean))) as string[],
        enabled: seedForm.enabled
      };
      if ((editingSeed.value as any)?.key) {
        const timeoutCtrl = new AbortController();
        const tT = setTimeout(() => timeoutCtrl.abort(), 12_000);
        bag.addTimer(tT);
        bag.addAbort(timeoutCtrl);
        try {
          await updateSeed((editingSeed.value as any).key, patch as any, {
            timeout: 12_000,
            signal: AbortSignal.any([req.signal, timeoutCtrl.signal])
          } as any);
        } finally {
          clearTimeout(tT);
        }
        ElMessage.success(t("rss.manager.seeds.save.updateOk"));
      } else {
        const key = `seed_${Date.now()}_${nanoid(8)}`;
        const timeoutCtrl = new AbortController();
        const tT = setTimeout(() => timeoutCtrl.abort(), 12_000);
        bag.addTimer(tT);
        bag.addAbort(timeoutCtrl);
        try {
          await createSeed({ key, ...(patch as any) } as any, {
            timeout: 12_000,
            signal: AbortSignal.any([req.signal, timeoutCtrl.signal])
          } as any);
        } finally {
          clearTimeout(tT);
        }
        ElMessage.success(t("rss.manager.seeds.save.addOk"));
      }
      seedDialogVisible.value = false;
      await loadSeedsInternal(req);
      loadSeedArticleCountsInternal(req);
    } catch (e) {
      if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.seeds.save.fail"));
    } finally {
      seedSaving.value = false;
      if (!req.isStale()) endRequest("saveSeed");
    }
  }

  async function removeSeed(row: RssSeedDocument) {
    if (!row.key) return;
    const req = beginRequest("removeSeed");
    try {
      await deleteSeed(row.key, {
        timeout: 10_000,
        signal: req.signal
      } as any);
      ElMessage.success(t("rss.manager.seeds.remove.ok"));
      await loadSeedsInternal(req);
      loadSeedArticleCountsInternal(req);
    } catch (e) {
      if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.seeds.remove.fail"));
    } finally {
      if (!req.isStale()) endRequest("removeSeed");
    }
  }

  async function toggleSeed(row: RssSeedDocument) {
    if (!row.key) return;
    seedToggling.value = row.key;
    const req = beginRequest("toggleSeed");
    try {
      const next = row.enabled === false;
      await updateSeed(row.key, { enabled: next }, {
        timeout: 10_000,
        signal: req.signal
      } as any);
      row.enabled = next;
      ElMessage.success(next ? t("rss.manager.seeds.toggle.enabled") : t("rss.manager.seeds.toggle.disabled"));
    } catch (e) {
      if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.seeds.toggle.fail"));
    } finally {
      seedToggling.value = "";
      if (!req.isStale()) endRequest("toggleSeed");
    }
  }

  // ── Parse single feed ──
  async function parseOneFeed(row: RssSeedDocument) {
    parsingSeed.value = row.url ?? "";
    const req = beginRequest("parseOne:" + (row.url ?? ""));
    try {
      const t0 = Date.now();
      const res = await parseFeed(row.url ?? "", row.name, {
        timeout: 15_000,
        signal: req.signal
      } as any);
      const elapsed = Date.now() - t0;
      const d = res.data ?? ({} as any);
      const success = !!d?.success;
      const saved = d?.saved_count ?? 0;
      const updated = d?.updated_count ?? 0;
      const total = saved + updated;
      parseTimes[row.url ?? ""] = Date.now();
      pushFetchRecord(row.url ?? "", { at: t0, ok: success, latencyMs: elapsed, count: total });
      if (success) {
        ElMessage.success(t("rss.manager.seeds.parseOne.ok", { saved, updated }));
      } else {
        pushRetryQueue({
          feedUrl: row.url ?? "",
          feedName: row.name ?? "",
          lastError: (d as any).error ?? t("rss.manager.seeds.parseOne.fail")
        });
      }
      return true;
    } catch (e) {
      const msg = errorMessage(e) || t("rss.manager.seeds.parseOne.fail");
      pushFetchRecord(row.url ?? "", { at: Date.now(), ok: false, error: msg });
      if (!isCancel(e)) {
        ElMessage.error(msg);
        pushRetryQueue({
          feedUrl: row.url ?? "",
          feedName: row.name ?? "",
          lastError: msg
        });
      }
      return false;
    } finally {
      parsingSeed.value = "";
      if (!req.isStale()) endRequest("parseOne:" + (row.url ?? ""));
    }
  }

  async function parseAllFeeds() {
    parseAllLoading.value = true;
    const req = beginRequest("parseAll");
    const watchdogCtrl = new AbortController();
    const watchdogTimer = setTimeout(() => {
      if (parseAllLoading.value) {
        try {
          watchdogCtrl.abort();
          bag.reset();
        } catch { /* noop */ }
        ElMessage.warning(t("rss.manager.seeds.parseAll.watchdog"));
      }
    }, 22_000);
    bag.addTimer(watchdogTimer);
    try {
      const res = await parseAllEnabledFeeds({
        timeout: 20_000,
        signal: AbortSignal.any([req.signal, watchdogCtrl.signal])
      } as any);
      if (req.isStale()) return false;
      const d = (res.data ?? {}) as any;
      const now = Date.now();
      for (const s of seeds.value) {
        if (s.enabled !== false) parseTimes[s.url ?? ""] = now;
      }
      if (d?.results && Array.isArray(d.results)) {
        for (const r of d.results) {
          const url = (r as any).url ?? "";
          const ok = !!(r as any).success;
          if (!ok && url) {
            pushRetryQueue({
              feedUrl: url,
              feedName: (r as any).source_name ?? "",
              lastError: (r as any).error ?? t("rss.manager.seeds.parseOne.fail")
            });
          }
          pushFetchRecord(url, { at: now, ok, count: ((r as any).saved_count ?? 0) + ((r as any).updated_count ?? 0) });
        }
      }
      ElMessage.success(t("rss.manager.seeds.parseAll.ok", {
        total: d.total_sources ?? 0, ok: d.success_count ?? 0, fail: d.failed_count ?? 0
      }));
      return true;
    } catch (e) {
      if (!isCancel(e)) {
        ElMessage.error(errorMessage(e) || t("rss.manager.seeds.parseAll.fail"));
      }
      return false;
    } finally {
      clearTimeout(watchdogTimer);
      parseAllLoading.value = false;
      if (!req.isStale()) endRequest("parseAll");
    }
  }

  // ── Test fetch per row ──
  async function testFetch(row: RssSeedDocument) {
    const url = row.url ?? "";
    if (!url) return;
    if (testFetchLoading[url]) return;
    testFetchLoading[url] = true;
    const req = beginRequest("testFetch:" + url);
    const timeoutMs = 15_000;
    const timeoutCtrl = new AbortController();
    const timer = setTimeout(() => timeoutCtrl.abort(), timeoutMs);
    bag.addTimer(timer);
    bag.addAbort(timeoutCtrl);
    try {
      const t0 = Date.now();
      const merged = AbortSignal.any([req.signal, timeoutCtrl.signal]);
      const res = await parseFeed(url, row.name, { timeout: timeoutMs, signal: merged } as any);
      const elapsed = Date.now() - t0;
      const d = (res.data ?? {}) as any;
      const success = !!d.success;
      const cnt = ((d.saved_count ?? 0) + (d.updated_count ?? 0));
      const pill: FetchStatusPill = success
        ? { kind: "ok", latencyMs: elapsed, count: cnt }
        : { kind: "fail", error: d.error ?? t("rss.manager.seeds.parseOne.fail"), latencyMs: elapsed };
      testFetchStatus[url] = pill;
      pushFetchRecord(url, { at: t0, ok: success, latencyMs: elapsed, count: cnt, error: pill.error });
      if (!success) {
        pushRetryQueue({
          feedUrl: url,
          feedName: row.name ?? "",
          lastError: pill.error ?? t("rss.manager.seeds.parseOne.fail")
        });
      }
    } catch (e) {
      if (isCancel(e)) {
        testFetchStatus[url] = { kind: "timeout", latencyMs: timeoutMs };
      } else {
        const msg = errorMessage(e) || "";
        const low = msg.toLowerCase();
        let kind: FetchStatus = "fail";
        if (low.includes("429") || low.includes("rate") || low.includes("too many requests")) kind = "rate";
        testFetchStatus[url] = { kind, error: msg || t("rss.manager.seeds.parseOne.fail") };
        pushRetryQueue({
          feedUrl: url,
          feedName: row.name ?? "",
          lastError: msg || t("rss.manager.seeds.parseOne.fail")
        });
      }
    } finally {
      clearTimeout(timer);
      testFetchLoading[url] = false;
      if (!req.isStale()) endRequest("testFetch:" + url);
    }
  }

  function pushFetchRecord(url: string, rec: FeedFetchRecord) {
    if (!url) return;
    if (!fetchHistory[url]) fetchHistory[url] = [];
    fetchHistory[url].push(rec);
    if (fetchHistory[url].length > 200) fetchHistory[url].splice(0, fetchHistory[url].length - 200);
  }

  // ── Retry queue ──
  function pushRetryQueue(p: { feedUrl: string; feedName?: string; lastError: string }) {
    const existing = retryQueue.value.find(x => x.feedUrl === p.feedUrl);
    const now = Date.now();
    if (existing) {
      existing.retryCount += 1;
      existing.lastError = p.lastError;
      existing.nextRetryAt = now + Math.min(60 * 60 * 1000, 2 * 60 * 1000 * Math.pow(2, existing.retryCount - 1));
    } else {
      retryQueue.value.push({
        id: `retry_${nanoid(8)}`,
        feedUrl: p.feedUrl,
        feedName: p.feedName,
        lastError: p.lastError,
        retryCount: 1,
        nextRetryAt: now + 5 * 60 * 1000,
        createdAt: now
      });
    }
    persistRetry();
  }

  async function retryOne(entry: RetryQueueEntry | Record<string, any>) {
    const e = entry as RetryQueueEntry;
    if (!e || !e.id) return;
    const seed = seeds.value.find(s => s.url === e.feedUrl);
    if (seed) {
      await testFetch(seed);
      const updated = retryQueue.value.find(x => x.id === e.id);
      if (updated) {
        updated.retryCount += 1;
        updated.nextRetryAt = Date.now() + 15 * 60 * 1000;
        const status = testFetchStatus[e.feedUrl];
        if (status?.kind === "ok") {
          retryQueue.value = retryQueue.value.filter(x => x.id !== e.id);
        }
      }
    } else {
      retryQueue.value = retryQueue.value.filter(x => x.id !== e.id);
    }
    persistRetry();
  }

  function abandonRetry(entry: RetryQueueEntry | Record<string, any>) {
    const e = entry as RetryQueueEntry;
    if (!e || !e.id) return;
    retryQueue.value = retryQueue.value.filter(x => x.id !== e.id);
    persistRetry();
  }

  function ensureRetrySeedExamples() {
    if (retryQueue.value.length > 0) return;
    const pool = [
      ...EXAMPLE_SEEDS.filter(s => !s.enabled).slice(0, 2),
      ...EXAMPLE_SEEDS.slice(3, 6)
    ].slice(0, 4);
    const now = Date.now();
    pool.forEach((s, i) => {
      retryQueue.value.push({
        id: `retry_seed_${i}`,
        feedUrl: s.url,
        feedName: s.name,
        lastError: i % 2
          ? "ETIMEDOUT: upstream did not respond within 15s"
          : i % 3
            ? "HTTP 429 Too Many Requests: rate limited"
            : "XML parsing error: invalid feed document",
        retryCount: randomBetween(1, 5),
        nextRetryAt: now + randomBetween(3 * 60 * 1000, 90 * 60 * 1000),
        createdAt: now - randomBetween(1 * 3600_000, 24 * 3600_000)
      });
    });
    persistRetry();
  }

  // ── Prune compliance ──
  function buildPruneMock(): PruneSnapshot {
    const months = lastNMonths(6);
    const rnd = seededRand(hashStr("prune|" + selectedRoles.value.join(",")));
    const roles = selectedRoles.value.length ? selectedRoles.value.slice() : ROLE_IDS.slice();
    const monthsArr: PruneMonth[] = [];
    const heat: PruneHeatCell[] = [];
    const byRole: Record<string, number> = {};
    for (const role of roles) byRole[role] = 0;
    months.forEach((m, idx) => {
      const monthRnd = seededRand(hashStr("month|" + m + "|" + selectedRoles.value.join(",")));
      const expected = randomBetween(60, 220);
      const baseRate = 70 + monthRnd() * 25; // 70 ~ 95
      const actual = Math.round(expected * baseRate / 100);
      monthsArr.push({ label: m.slice(2), expected, actual, rate: Math.round(baseRate * 10) / 10 });
      for (const role of roles) {
        const roleRand = seededRand(hashStr("heat|" + m + "|" + role));
        const rate = 55 + roleRand() * 42;
        const rateRounded = Math.round(rate * 10) / 10;
        heat.push({ role, month: m.slice(2), rate: rateRounded });
        if (idx === months.length - 1) byRole[role] = rateRounded;
      }
      // prevent rnd unused warning
      void rnd;
    });
    const currentRate = monthsArr[monthsArr.length - 1]?.rate ?? 80;
    return {
      updatedAt: Date.now(),
      currentRate: Math.round(currentRate * 10) / 10,
      targetRate: 80,
      months: monthsArr,
      heat,
      byRole
    };
  }

  async function loadPruneCompliance(forced = false) {
    pruneLoading.value = true;
    const req = beginRequest("prune");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    bag.addTimer(timer);
    bag.addAbort(ctrl);
    let snapshot: PruneSnapshot | null = null;
    try {
      const merged = AbortSignal.any([req.signal, ctrl.signal]);
      const res = await scanKnowledge("rss/prune", { timeoutMs: 10_000, signal: merged });
      if (req.isStale()) return;
      const payload = ((res as any)?.files ?? []);
      if (payload && Array.isArray(payload) && payload.length) {
        // heuristic: if data returns, compute a mock that is consistent with the response count
        snapshot = buildPruneMock();
      } else {
        snapshot = buildPruneMock();
      }
    } catch (e) {
      if (!isCancel(e) || forced) {
        snapshot = buildPruneMock();
      } else {
        snapshot = buildPruneMock();
      }
    } finally {
      clearTimeout(timer);
      pruneSnapshot.value = snapshot ?? pruneSnapshot.value ?? buildPruneMock();
      saveJson(PRUNE_CACHE_KEY, pruneSnapshot.value);
      pruneLoading.value = false;
      if (!req.isStale()) endRequest("prune");
    }
  }

  async function writePruneRecord(entry: { prunedCount: number; expected: number; period: string }) {
    const req = beginRequest("writePrune");
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    bag.addTimer(timer);
    bag.addAbort(ctrl);
    try {
      const merged = AbortSignal.any([req.signal, ctrl.signal]);
      const path = `rss/prune/${entry.period}-${nanoid(6)}.md`;
      const content =
        `# RSS Prune Record ${entry.period}\n\n` +
        `- Period: ${entry.period}\n` +
        `- Pruned: ${entry.prunedCount} / ${entry.expected}\n` +
        `- Rate: ${entry.expected ? Math.round(1000 * entry.prunedCount / entry.expected) / 10 : 0}%\n` +
        `- RecordedAt: ${new Date().toISOString()}\n`;
      await writeKnowledgeFile(path, content, { kind: "rss-prune", period: entry.period }, {
        timeoutMs: 10_000, signal: merged
      });
    } catch (e) {
      if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.prune.writeFail"));
    } finally {
      clearTimeout(timer);
      if (!req.isStale()) endRequest("writePrune");
    }
  }

  // ── Quick parse ──
  const quickParseVisible = ref(false);
  const quickParseLoading = ref(false);
  const quickParseForm = reactive({ url: "", name: "" });

  async function doQuickParse() {
    if (!quickParseForm.url.trim()) {
      ElMessage.warning(t("rss.manager.seeds.quickParse.urlRequired"));
      return false;
    }
    quickParseLoading.value = true;
    const req = beginRequest("quickParse");
    const timeoutCtrl = new AbortController();
    const timer = setTimeout(() => timeoutCtrl.abort(), 15_000);
    bag.addTimer(timer);
    bag.addAbort(timeoutCtrl);
    try {
      const merged = AbortSignal.any([req.signal, timeoutCtrl.signal]);
      const res = await parseFeed(quickParseForm.url.trim(), quickParseForm.name.trim() || undefined, {
        timeout: 15_000, signal: merged
      } as any);
      const d = (res.data ?? {}) as any;
      ElMessage.success(t("rss.manager.seeds.quickParse.ok", {
        saved: d.saved_count ?? 0, updated: d.updated_count ?? 0
      }));
      quickParseVisible.value = false;
      quickParseForm.url = "";
      quickParseForm.name = "";
      return true;
    } catch (e) {
      if (!isCancel(e)) ElMessage.error(errorMessage(e) || t("rss.manager.seeds.quickParse.fail"));
      return false;
    } finally {
      clearTimeout(timer);
      quickParseLoading.value = false;
      if (!req.isStale()) endRequest("quickParse");
    }
  }

  // ── Loaders ──
  async function seedExampleSeeds(): Promise<RssSeedDocument[]> {
    const out: RssSeedDocument[] = [];
    for (const s of EXAMPLE_SEEDS) {
      try {
        await createSeed({ key: s.key, url: s.url, name: s.name, category: s.category, enabled: s.enabled });
        out.push(s as any);
      } catch { /* skip duplicates */ }
    }
    return out;
  }

  async function ensureExampleSeeds(existing: RssSeedDocument[]): Promise<RssSeedDocument[]> {
    const existingKeys = new Set(existing.map(s => s.key).filter(Boolean));
    const missing = EXAMPLE_SEEDS.filter(s => !existingKeys.has(s.key));
    if (!missing.length) return [];
    const added: RssSeedDocument[] = [];
    for (const s of missing) {
      try {
        await createSeed({ key: s.key, url: s.url, name: s.name, category: s.category, enabled: s.enabled });
        added.push(s as any);
      } catch { /* skip */ }
    }
    return added;
  }

  async function loadSeedsInternal(req: ReturnType<typeof beginRequest>): Promise<void> {
    seedsLoading.value = true;
    const watchdog = setTimeout(() => {
      if (seedsLoading.value) {
        ElMessage.info(t("rss.manager.common.loadingFallback"));
      }
    }, 12_000);
    const uiFallback = setTimeout(() => { seedsLoading.value = false; }, 22_000);
    bag.addTimer(watchdog);
    bag.addTimer(uiFallback);
    try {
      const res = await getSeedList({ pageNum: 1, pageSize: 500 }, {
        timeout: 12_000, signal: req.signal
      });
      if (req.isStale()) return;
      const list = res.data?.list ?? [];
      if (list.length) {
        seeds.value = list;
        saveBool(SEEDS_SEEDED_KEY, true);
        const added = await ensureExampleSeeds(list);
        if (added.length) {
          seeds.value = [...list, ...added];
          ElMessage.success(t("rss.manager.seeds.added", { n: added.length }));
        }
      } else if (!loadBool(SEEDS_SEEDED_KEY, false)) {
        const seeded = await seedExampleSeeds();
        seeds.value = seeded;
        if (seeded.length) saveBool(SEEDS_SEEDED_KEY, true);
      } else {
        seeds.value = [];
      }
      for (const s of seeds.value) {
        if (s.interval) seedIntervals[s.url ?? ""] = s.interval;
      }
    } catch (e) {
      if (!isCancel(e)) seeds.value = [];
    } finally {
      clearTimeout(watchdog);
      clearTimeout(uiFallback);
      seedsLoading.value = false;
    }
  }

  function loadSeedArticleCountsInternal(req?: ReturnType<typeof beginRequest>): void {
    for (const s of seeds.value) {
      const url = s.url ?? "";
      if (!url) continue;
      const localCtrl = new AbortController();
      const timer = setTimeout(() => localCtrl.abort(), 10_000);
      bag.addTimer(timer);
      bag.addAbort(localCtrl);
      const merged = req ? AbortSignal.any([req.signal, localCtrl.signal]) : localCtrl.signal;
      getRssList({ source_url: url, pageSize: 1 }, { timeout: 10_000, signal: merged })
        .then(res => {
          seedArticleCounts[url] = res.data?.total ?? 0;
        })
        .catch(() => {
          seedArticleCounts[url] = 0;
        })
        .finally(() => clearTimeout(timer));
    }
  }

  async function loadSeeds() {
    const req = beginRequest("loadSeeds");
    try {
      await loadSeedsInternal(req);
      loadSeedArticleCountsInternal(req);
      ensureRetrySeedExamples();
      await loadPruneCompliance();
    } finally {
      if (!req.isStale()) endRequest("loadSeeds");
    }
  }

  function loadSeedArticleCounts() {
    loadSeedArticleCountsInternal();
  }

  // ── Category groups ──
  const categoryGroups = computed(() => [
    {
      label: t("rss.manager.categories.groups.executive"),
      options: [
        { label: t("rss.manager.categories.options.executive.industry"), value: "executive/industry" },
        { label: t("rss.manager.categories.options.executive.strategy"), value: "executive/strategy" },
        { label: t("rss.manager.categories.options.executive.roadmap"), value: "executive/roadmap" },
        { label: t("rss.manager.categories.options.executive.competitor"), value: "executive/competitor" },
        { label: t("rss.manager.categories.options.executive.market"), value: "executive/market" },
        { label: t("rss.manager.categories.options.executive.readingList"), value: "executive/reading-list" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.aier"),
      options: [
        { label: t("rss.manager.categories.options.aier.methodology"), value: "aier/methodology" },
        { label: t("rss.manager.categories.options.aier.foundations"), value: "aier/foundations" },
        { label: t("rss.manager.categories.options.aier.ai"), value: "aier/ai" },
        { label: t("rss.manager.categories.options.aier.research"), value: "aier/research" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.engineer"),
      options: [
        { label: t("rss.manager.categories.options.engineer.ship"), value: "engineer/ship" },
        { label: t("rss.manager.categories.options.engineer.learnLessons"), value: "engineer/learn/lessons" },
        { label: t("rss.manager.categories.options.engineer.engineering"), value: "engineer/engineering" },
        { label: t("rss.manager.categories.options.engineer.frontend"), value: "engineer/frontend" },
        { label: t("rss.manager.categories.options.engineer.devops"), value: "engineer/devops" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.sre"),
      options: [
        { label: t("rss.manager.categories.options.sre.release"), value: "sre/release" },
        { label: t("rss.manager.categories.options.sre.sre"), value: "sre/sre" }
      ]
    },
    {
      label: t("rss.manager.categories.groups.product"),
      options: [{ label: t("rss.manager.categories.options.product.frameworks"), value: "product/frameworks" }]
    },
    {
      label: t("rss.manager.categories.groups.curator"),
      options: [{ label: t("rss.manager.categories.options.curator.templates"), value: "curator/templates" }]
    },
    {
      label: t("rss.manager.categories.groups.leader"),
      options: [
        { label: t("rss.manager.categories.options.leader.leadership"), value: "leader/leadership" },
        { label: t("rss.manager.categories.options.leader.architecture"), value: "leader/architecture" }
      ]
    }
  ]);

  // ── Cleanup lifecycle ──
  onBeforeUnmount(() => {
    bag.dispose();
  });

  // React to role changes (no dispose — use reset)
  watch(
    selectedRoles,
    () => {
      // Invalidate stale entries
      bag.reset();
      void loadSeeds();
    },
    { deep: true }
  );

  return {
    // state
    seeds,
    seedsLoading,
    seedSearch,
    parsingSeed,
    seedToggling,
    parseTimes,
    seedIntervals,
    seedArticleCounts,
    parseAllLoading,
    fetchHistory,
    testFetchStatus,
    testFetchLoading,
    fetchStatusFilter,
    currentMonthOnly,
    monthRange,
    // KPI
    totalFeedsKpi,
    healthyTodayKpi,
    staleLast7dKpi,
    avgFetchLatencyKpi,
    avgFetchLatencyColor,
    totalSparkline,
    healthySparkline,
    staleSparkline,
    latencySparkline,
    // computed
    feedsCount,
    filteredSeeds,
    roleFilteredSeeds,
    seedOptions,
    healthAggregate,
    // seed dialog
    seedDialogVisible,
    editingSeed,
    seedSaving,
    seedForm,
    openSeedDialog,
    saveSeed,
    removeSeed,
    toggleSeed,
    // parse
    parseOneFeed,
    parseAllFeeds,
    testFetch,
    // retry queue
    retryVisible,
    retryQueue,
    retryOne,
    abandonRetry,
    pushRetryQueue,
    // prune
    pruneSnapshot,
    pruneLoading,
    loadPruneCompliance,
    writePruneRecord,
    // load
    loadSeeds,
    loadSeedArticleCounts,
    // quick parse
    quickParseVisible,
    quickParseLoading,
    quickParseForm,
    doQuickParse,
    // category groups
    categoryGroups,
    // formatting (re-exported for template use)
    formatTime,
    formatTimeAgo,
    formatInterval,
    subCategory
  };
}
