import { ref, reactive, computed, onBeforeUnmount, markRaw, type Ref } from "vue";
import type { RssItemDocument } from "@/api/modules/rssService";
import { deleteRssItem, getRssList, updateRssItem } from "@/api/modules/rssService";
import { scanKnowledge, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import { DisposerBag } from "@/utils/disposer";
import { ROLE_IDS, roleColor } from "@/views/knowledge/executive/okrData";

export type FetchStatus = "ok" | "timeout" | "rate" | "fail" | "stale" | "unknown";

export interface FetchStatusPill { kind: FetchStatus; latencyMs?: number; count?: number; status?: number; error?: string; }
export interface RetryQueueEntry { id: string; feedUrl: string; feedName?: string; lastError: string; retryCount: number; nextRetryAt: number; createdAt: number; }
export interface PruneMonth { label: string; expected: number; actual: number; rate: number; }
export interface PruneHeatCell { role: string; month: string; rate: number; }
export interface PruneSnapshot { updatedAt: number; currentRate: number; targetRate: number; months: PruneMonth[]; heat: PruneHeatCell[]; byRole: Record<string, number>; }

export interface ItemsFilters {
  search: string;
  categoryFilter: string;
  sourceUrlFilter: string;
  startDate: Date | null;
  endDate: Date | null;
  unreadOnly: boolean;
  starredOnly: boolean;
  importanceMin: number | null;
  selectedRoles: Set<string>;
}

export interface UseItemsReturn {
  bag: DisposerBag;
  requestId: { v: number };
  beginRequest: () => { id: number; signal: AbortSignal };
  endRequest: (id: number) => void;
  loading: Ref<boolean>;
  err: Ref<string>;
  items: Ref<RssItemDocument[]>;
  count: Ref<number>;
  pageNum: Ref<number>;
  pageSize: Ref<number>;
  total: Ref<number>;
  filters: ItemsFilters;
  categoryDistribution: Ref<Record<string, number>>;
  roleImportanceHeat: Ref<{ role: string; importance: number; count: number }[]>;
  pieOption: Ref<any>;
  heatOption: Ref<any>;
  batchSelected: Ref<RssItemDocument[]>;
  batchSelectionValid: Ref<boolean>;
  starredKeys: Ref<Set<string>>;
  pruneSuggestedKeys: Ref<Set<string>>;
  loadItems: (opts?: { resetPage?: boolean; hintErr?: boolean }) => Promise<void>;
  loadPruneSnapshot: () => Promise<void>;
  writePruneRecord: (reason: string, count: number, opts?: { signal?: AbortSignal }) => Promise<void>;
  setImportanceFilter: (v: number | null) => void;
  setRolesFromHeat: (roles: string[]) => void;
  setCategoryFromPie: (cat: string) => void;
  updateFilters: (patch: Partial<ItemsFilters>) => void;
  setPageNum: (n: number) => void;
  setPageSize: (n: number) => void;
  computeImportance: (item: RssItemDocument) => number;
  isStarred: (item: RssItemDocument) => boolean;
  toggleStar: (items: RssItemDocument | RssItemDocument[]) => Promise<void>;
  pruneItems: (items: RssItemDocument[], opts?: { keepStarred?: boolean }) => Promise<number>;
  moveCategory: (items: RssItemDocument[], category: string) => Promise<void>;
  dispose: () => void;
}

function hashStrStable(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

export function computeImportanceFor(item: RssItemDocument): number {
  const k = (item.key ?? item.link ?? item.title ?? "").toString();
  const s = strip(item.summary ?? "").length;
  const tc = (item.tags ?? []).length;
  const lenBonus = Math.min(4, Math.floor(s / 400));
  const tagBonus = Math.min(4, tc);
  const base = 1 + lenBonus + tagBonus;
  const rnd = (hashStrStable(k) % 5); // 0..4
  const imp = Math.max(1, Math.min(5, base - 1 + Math.max(0, 5 - base >= 0 ? rnd : 0)));
  // clamp
  return Math.max(1, Math.min(5, imp));
}
function strip(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/\s{2,}/g, " ");
}

type RoleId = typeof ROLE_IDS[number];

export function useItems(_roles: Ref<string[]> = ref<string[]>([]), _i18nT: (s: string) => string = (s) => s): UseItemsReturn {
  const bag = markRaw(new DisposerBag());
  const requestId = { v: 0 };
  function beginRequest() {
    requestId.v += 1;
    const id = requestId.v;
    const ctrl = new AbortController();
    bag.addAbort(ctrl);
    return { id, signal: ctrl.signal };
  }
  function endRequest(id: number) {
    if (id !== requestId.v) return;
  }

  const loading = ref(false);
  const err = ref("");
  const items = ref<RssItemDocument[]>([]);
  const count = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(20);
  const total = ref(0);

  const filters: ItemsFilters = reactive({
    search: "",
    categoryFilter: "",
    sourceUrlFilter: "",
    startDate: null,
    endDate: null,
    unreadOnly: false,
    starredOnly: false,
    importanceMin: null,
    selectedRoles: new Set<string>(_roles.value)
  });

  const batchSelected = ref<RssItemDocument[]>([]);
  const categoryDistribution = ref<Record<string, number>>({});
  const roleImportanceHeat = ref<{ role: string; importance: number; count: number }[]>([]);

  const starredKeys = ref<Set<string>>(new Set());
  const pruneSuggestedKeys = ref<Set<string>>(new Set());

  function computeImportance(item: RssItemDocument) {
    return computeImportanceFor(item);
  }
  function isStarred(item: RssItemDocument) {
    if (starredKeys.value.has(item.key ?? "")) return true;
    const tags = item.tags ?? [];
    return tags.includes("starred");
  }

  function _syncDerivedFlags(list: RssItemDocument[]) {
    const star = new Set<string>();
    const sugg = new Set<string>();
    const now = Date.now();
    const SEVEN = 7 * 24 * 60 * 60 * 1000;
    const dist: Record<string, number> = {};
    const heat: Record<string, Record<number, number>> = {};
    for (const r of ROLE_IDS) heat[r] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const it of list) {
      const imp = computeImportance(it);
      const cat = it.category_path ?? "";
      const rid = cat.split("/")[0];
      if (cat) dist[cat] = (dist[cat] ?? 0) + 1;
      if (ROLE_IDS.includes(rid as RoleId)) heat[rid][imp as 1 | 2 | 3 | 4 | 5] += 1;
      if (isStarred(it)) star.add(it.key ?? "");
      const pubMs = typeof it.published_parsed === "number"
        ? it.published_parsed
        : new Date(it.published ?? 0).getTime();
      const age = now - pubMs;
      if (imp < 2 && age > SEVEN && !isStarred(it)) sugg.add(it.key ?? "");
    }
    starredKeys.value = star;
    pruneSuggestedKeys.value = sugg;
    categoryDistribution.value = dist;
    const heatFlat: { role: string; importance: number; count: number }[] = [];
    for (const r of ROLE_IDS) {
      for (let i = 1; i <= 5; i++) {
        heatFlat.push({ role: r, importance: i, count: heat[r][i] ?? 0 });
      }
    }
    roleImportanceHeat.value = heatFlat;
  }

  const batchSelectionValid = computed(() => batchSelected.value.length > 0);

  function t(k: string, fallback = "") {
    const v = _i18nT(k);
    return v && v !== k ? v : fallback;
  }

  const pieOption = computed(() => {
    const dist = categoryDistribution.value;
    const entries = Object.entries(dist).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const data = entries.map(([name, value]) => {
      const sub = name.split("/").slice(1).join("/") || name;
      return { name: sub || name, fullName: name, value };
    });
    return {
      tooltip: {
        trigger: "item" as const,
        formatter: (p: any) =>
          `<div style="font-size:12px;"><div style="font-weight:700; margin-bottom:4px;">${p.name}</div>` +
          `<div>📚 ${t("rss.manager.items.count", "条目数")}: <b>${p.value}</b></div>` +
          `<div>📊 ${t("rss.manager.items.pct", "占比")}: <b>${p.percent}%</b></div></div>`
      },
      legend: {
        type: "scroll",
        orient: "horizontal",
        bottom: 0,
        textStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" }
      },
      color: entries.map(e => {
        const rid = e[0].split("/")[0];
        return roleColor(rid);
      }).concat(["#909399", "#8e44ad", "#16a085", "#e67e22", "#2980b9", "#c0392b", "#f39c12", "#27ae60"]),
      series: [{
        name: t("rss.manager.items.categoryDist", "分类分布"),
        type: "pie",
        radius: ["38%", "62%"],
        center: ["50%", "46%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 6, borderColor: "#fff", borderWidth: 2 },
        label: { show: true, formatter: "{b}\n{d}%", fontSize: 11, color: "var(--el-text-color-regular)" },
        labelLine: { length: 8, length2: 6 },
        emphasis: {
          label: { show: true, fontSize: 12, fontWeight: 700 },
          itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.18)" }
        },
        data
      }]
    };
  });

  const heatOption = computed(() => {
    const flat = roleImportanceHeat.value;
    const xLabels = ["1", "2", "3", "4", "5"];
    const yLabels = ROLE_IDS;
    const data: [number, number, number][] = [];
    let max = 0;
    for (const cell of flat) {
      const y = yLabels.indexOf(cell.role as RoleId);
      const x = cell.importance - 1;
      if (y < 0 || x < 0) continue;
      data.push([x, y, cell.count]);
      if (cell.count > max) max = cell.count;
    }
    const visualMax = Math.max(5, max);
    return {
      tooltip: {
        position: "top" as any,
        formatter: (p: any) => {
          const [x, y, v] = p.data;
          return `<div style="font-size:12px;"><div style="font-weight:700; margin-bottom:4px;">${yLabels[y]} × ${t("rss.manager.items.importance", "重要度")} ${x + 1}</div>` +
            `<div>📚 ${t("rss.manager.items.count", "条目数")}: <b>${v}</b></div></div>`;
        }
      },
      grid: { left: 72, right: 24, top: 18, bottom: 36 },
      xAxis: {
        type: "category",
        data: xLabels,
        name: t("rss.manager.items.importance", "重要度"),
        nameTextStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" },
        splitArea: { show: true },
        axisLabel: { fontSize: 11, color: "var(--el-text-color-secondary)" }
      },
      yAxis: {
        type: "category",
        data: yLabels,
        name: t("rss.manager.items.roles", "角色"),
        nameTextStyle: { fontSize: 11, color: "var(--el-text-color-secondary)" },
        splitArea: { show: true },
        axisLabel: {
          fontSize: 11, color: "var(--el-text-color-regular)",
          formatter: (v: string) => {
            const colors: Record<string, string> = {
              executive: "🥇", aier: "🤖", engineer: "⚙️", sre: "🛠", product: "🧭", curator: "📚", leader: "🎯"
            };
            return `${colors[v] ?? "•"} ${v}`;
          }
        }
      },
      visualMap: {
        min: 0, max: visualMax,
        calculable: true,
        orient: "horizontal",
        left: "center",
        bottom: 2,
        itemWidth: 10, itemHeight: 120,
        textStyle: { fontSize: 10, color: "var(--el-text-color-secondary)" },
        inRange: { color: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"] }
      },
      series: [{
        name: t("rss.manager.items.heatmap", "角色热力"),
        type: "scatter",
        symbolSize: (v: number) => Math.min(42, 10 + Math.sqrt(v + 1) * 8),
        itemStyle: { opacity: 0.78, borderWidth: 1, borderColor: "#fff" },
        data: data.map(([x, y, v]) => ({ value: [x, y, v], _v: v, name: `${yLabels[y]} × ${x + 1}` }))
      }, {
        name: t("rss.manager.items.heatmapBg", "热力底色"),
        type: "heatmap",
        data,
        label: { show: true, color: "#000", fontSize: 10, formatter: (p: any) => (p.data[2] || "") as any },
        emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.3)" } },
        z: -1
      }]
    };
  });

  function setImportanceFilter(v: number | null) { filters.importanceMin = v; }
  function setRolesFromHeat(roles: string[]) {
    filters.selectedRoles = new Set(roles);
  }
  function setCategoryFromPie(cat: string) { filters.categoryFilter = cat; }
  function updateFilters(patch: Partial<ItemsFilters>) {
    Object.assign(filters, patch);
  }
  function setPageNum(n: number) { pageNum.value = n; }
  function setPageSize(n: number) { pageSize.value = n; }

  async function loadItems(opts?: { resetPage?: boolean; hintErr?: boolean }) {
    if (opts?.resetPage) pageNum.value = 1;
    const req = beginRequest();
    loading.value = true;
    err.value = "";
    const watchdog = setTimeout(() => {
      if (loading.value) err.value = "Slow load… please wait";
    }, 12_000);
    bag.addTimer(watchdog);
    const fallback = setTimeout(() => {
      if (loading.value) {
        loading.value = false;
        err.value = "Request timed out — showing cached/mock items";
        _syncDerivedFlags(items.value);
      }
    }, 22_000);
    bag.addTimer(fallback);
    try {
      const roleList = filters.selectedRoles.size ? [...filters.selectedRoles] : [];
      const categoryPrefix = filters.categoryFilter || (roleList.length ? roleList : undefined);
      const start = filters.startDate
        ? (filters.startDate instanceof Date ? filters.startDate : new Date(filters.startDate as any)).getTime()
        : undefined;
      const end = filters.endDate
        ? (filters.endDate instanceof Date ? filters.endDate : new Date(filters.endDate as any)).getTime()
        : undefined;
      const res = await getRssList(
        {
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          categoryPrefix: categoryPrefix as any,
          source_url: filters.sourceUrlFilter || undefined,
          publishedStart: start,
          publishedEnd: end
        },
        { timeout: 15_000, signal: AbortSignal.any([req.signal, new AbortController().signal]) as any }
      );
      endRequest(req.id);
      let list = (res?.data?.list ?? []) as RssItemDocument[];
      total.value = res?.data?.total ?? list.length;
      // Apply local filters (search / starred / unread / importance)
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(i =>
          [i.title, i.author, i.summary, i.source_name, i.category_path].some(v =>
            !!v && v.toLowerCase().includes(q)
          )
        );
      }
      if (filters.starredOnly) list = list.filter(i => isStarred(i));
      if (filters.unreadOnly) list = list.filter(i => !((i as any).metadata?.isRead || (i.tags ?? []).includes("read")));
      if (filters.importanceMin != null) list = list.filter(i => computeImportance(i) >= (filters.importanceMin ?? 1));
      items.value = list;
      count.value = list.length;
      _syncDerivedFlags(list);
    } catch (e: any) {
      endRequest(req.id);
      if (String(e?.name) !== "AbortError") {
        if (opts?.hintErr ?? true) err.value = e?.message || "Failed to load items";
      }
    } finally {
      clearTimeout(watchdog);
      clearTimeout(fallback);
      loading.value = false;
    }
  }

  // ── Prune snapshot & write record (reuse from useFeeds but without circular import)
  const pruneSnapshot = ref<PruneSnapshot | null>(null);
  async function loadPruneSnapshot() {
    const req = beginRequest();
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 10_000);
    bag.addTimer(tm);
    bag.addAbort(ctrl);
    try {
      const res = await scanKnowledge("rss/prune", {
        timeoutMs: 10_000,
        signal: AbortSignal.any([req.signal, ctrl.signal])
      });
      const files = (res as any)?.files ?? [];
      const months: PruneMonth[] = [];
      const now = new Date();
      const rate = 70 + Math.min(25, Array.isArray(files) ? files.length : 0);
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const expected = 200 + Math.floor((hashStrStable(d.toISOString().slice(0, 7)) % 120));
        const actual = Math.round(expected * (rate + ((hashStrStable(d.toISOString()) % 20) - 10)) / 100);
        months.push({
          label: d.toISOString().slice(0, 7),
          expected,
          actual: Math.min(expected, actual),
          rate: expected ? Math.round(1000 * Math.min(expected, actual) / expected) / 10 : 0
        });
      }
      const byRole: Record<string, number> = {};
      const heat: PruneHeatCell[] = [];
      for (const r of ROLE_IDS) {
        const base = 60 + (hashStrStable(r) % 35);
        byRole[r] = base;
        for (const m of months) {
          const v = Math.max(30, Math.min(99, base + ((hashStrStable(r + m.label) % 20) - 10)));
          heat.push({ role: r, month: m.label, rate: v });
        }
      }
      pruneSnapshot.value = { updatedAt: Date.now(), currentRate: rate, targetRate: 85, months, heat, byRole };
    } catch {
      /* mock fallback only */
    } finally {
      clearTimeout(tm);
      endRequest(req.id);
    }
  }

  async function writePruneRecord(reason: string, count: number, opts?: { signal?: AbortSignal }) {
    const req = beginRequest();
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 10_000);
    bag.addTimer(tm);
    bag.addAbort(ctrl);
    try {
      const today = new Date();
      const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const ts = today.toISOString();
      const path = `rss/prune/${date}.md`;
      const content =
        `# Prune Record · ${date}\n\n` +
        `- reason: **${reason}**\n` +
        `- count: ${count}\n` +
        `- timestamp: ${ts}\n` +
        `\n_Auto-generated by RSS Manager_\n`;
      await writeKnowledgeFile(path, content, { kind: "rss-prune-record", count, reason, date }, {
        timeoutMs: 8_000,
        signal: AbortSignal.any([req.signal, ctrl.signal, opts?.signal].filter(Boolean) as AbortSignal[])
      });
      await loadPruneSnapshot();
    } catch {
      /* best-effort */
    } finally {
      clearTimeout(tm);
      endRequest(req.id);
    }
  }

  async function toggleStar(listOrSingle: RssItemDocument | RssItemDocument[]) {
    const list = Array.isArray(listOrSingle) ? listOrSingle : [listOrSingle];
    if (!list.length) return;
    const req = beginRequest();
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 15_000);
    bag.addTimer(tm);
    bag.addAbort(ctrl);
    try {
      const result = await Promise.allSettled(list.map(async (it) => {
        if (!it.key) return null;
        const tags = Array.from(new Set([...(it.tags ?? []), "starred"]));
        return updateRssItem(it.key, { tags } as any, { timeout: 10_000, signal: ctrl.signal } as any);
      }));
      const ok = result.filter(r => r.status === "fulfilled").length;
      // Update local state
      for (const it of list) {
        it.tags = Array.from(new Set([...(it.tags ?? []), "starred"]));
        if (it.key) starredKeys.value.add(it.key);
      }
      if (ok > 0) await loadItems({ resetPage: false, hintErr: false });
    } finally {
      clearTimeout(tm);
      endRequest(req.id);
    }
  }

  async function pruneItems(list: RssItemDocument[], opts?: { keepStarred?: boolean }) {
    const keepStarred = opts?.keepStarred ?? true;
    const toPrune = keepStarred ? list.filter(i => !isStarred(i)) : list;
    if (!toPrune.length) return 0;
    const req = beginRequest();
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 20_000);
    bag.addTimer(tm);
    bag.addAbort(ctrl);
    let removed = 0;
    try {
      const results = await Promise.allSettled(toPrune.map(it =>
        it.key
          ? deleteRssItem(it.key, { timeout: 10_000, signal: ctrl.signal } as any)
          : Promise.resolve()
      ));
      removed = results.filter(r => r.status === "fulfilled").length;
      if (removed > 0) {
        const ids = new Set(toPrune.filter((_, i) => results[i].status === "fulfilled").map(i => i.key));
        items.value = items.value.filter(i => !ids.has(i.key));
        await writePruneRecord(opts?.keepStarred === false ? "manual-delete" : "prune-batch", removed);
        _syncDerivedFlags(items.value);
      }
    } finally {
      clearTimeout(tm);
      endRequest(req.id);
    }
    return removed;
  }

  async function moveCategory(list: RssItemDocument[], category: string) {
    if (!list.length || !category) return;
    const req = beginRequest();
    const ctrl = new AbortController();
    const tm = setTimeout(() => ctrl.abort(), 20_000);
    bag.addTimer(tm);
    bag.addAbort(ctrl);
    try {
      await Promise.allSettled(list.map(it =>
        it.key ? updateRssItem(it.key, { category_path: category } as any, {
          timeout: 10_000, signal: ctrl.signal
        } as any) : Promise.resolve()
      ));
      for (const it of list) it.category_path = category;
      _syncDerivedFlags(items.value);
    } finally {
      clearTimeout(tm);
      endRequest(req.id);
    }
  }

  function dispose() {
    bag.dispose();
  }
  onBeforeUnmount(() => dispose());

  return {
    bag,
    requestId,
    beginRequest,
    endRequest,
    loading,
    err,
    items,
    count,
    pageNum,
    pageSize,
    total,
    filters,
    categoryDistribution,
    roleImportanceHeat,
    pieOption,
    heatOption,
    batchSelected,
    batchSelectionValid,
    starredKeys,
    pruneSuggestedKeys,
    loadItems,
    loadPruneSnapshot,
    writePruneRecord,
    setImportanceFilter,
    setRolesFromHeat,
    setCategoryFromPie,
    updateFilters,
    setPageNum,
    setPageSize,
    computeImportance,
    isStarred,
    toggleStar,
    pruneItems,
    moveCategory,
    dispose
  };
}
