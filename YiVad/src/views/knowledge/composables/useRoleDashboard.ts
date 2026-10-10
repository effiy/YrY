/**
 * useRoleDashboard
 * ──────────────────────────────────────────────────────────────
 * Universal composable for every role-specific knowledge page.
 *
 * Responsibilities
 *  1. Scan knowledge files for the given role category (SSOT call)
 *  2. Derive deterministic stats (total / stable / draft / deprecated /
 *     review compliance / staleness) — the same algorithm across pages
 *  3. Build filesByDir / flatFiles / filteredFiles against the
 *     canonical subdir list defined in `roleConfig.ts`
 *  4. Manage view mode (card / list / table), sidebar active state,
 *     collapsed sections, search filters, scroll-to-anchor navigation
 *  5. Provide a unified `refresh()` + auto-poll (60s default) with
 *     proper cleanup on unmount (DisposerBag pattern)
 *
 * Design notes
 *  • No UI — just reactive state + pure-computed derivations.
 *  • Every role page that previously re-implemented these 250 lines
 *    of duplicate logic now imports this one composable.
 *  • SSR / offline safe: catches 408 / CORS silently and keeps the
 *    last known data.
 */
import { ref, computed, reactive, onUnmounted, watch, type Ref } from "vue";
import { scanKnowledge, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import type { KnowledgeFileEntry } from "@/api/interface/yiAi";
import { getRole, type SubdirDef, type RoleDef } from "../roleConfig";

/* ──────────────────────────────────────────────────────────────────
 * Public types
 * ────────────────────────────────────────────────────────────────── */
export interface FlatFileRow {
  file: KnowledgeFileEntry;
  path: string;
  name: string;
  title: string;
  size: number;
  domain: string;          // label like "Foundations"
  domainId: string;        // id    like "foundations"
  domainIcon: string;
  domainColor: string;
}

export interface RoleStats {
  total: number;
  stable: number;
  active: number;
  evolving: number;
  draft: number;
  deprecated: number;
  archived: number;
  reviewOk: number;
  reviewStale: number;
  /** percentage 0..100 — review_ok / review_total */
  reviewCompliance: number;
  /** human friendly, e.g. "3:42:18 PM" */
  lastUpdatedAt: string;
}

export type ViewMode = "card" | "list" | "table";

/* ──────────────────────────────────────────────────────────────────
 * Internal helpers
 * ────────────────────────────────────────────────────────────────── */
const STATUS_ORDER: Record<string, number> = {
  stable: 0, active: 0, evolving: 1, draft: 2, deprecated: 3, archived: 3
};
const LIFECYCLE_ORDER: Record<string, number> = {
  stable: 0, active: 0, evolving: 1, draft: 2, "in-review": 2, deprecated: 3
};
const REVIEW_CYCLE_DAYS: Record<string, number> = {
  weekly: 7, biweekly: 14, monthly: 30, quarterly: 90,
  "half-yearly": 182, yearly: 365, annual: 365
};

function compareByMaturity(a: KnowledgeFileEntry, b: KnowledgeFileEntry): number {
  const sa = STATUS_ORDER[a.meta?.status ?? ""] ?? 99;
  const sb = STATUS_ORDER[b.meta?.status ?? ""] ?? 99;
  if (sa !== sb) return sa - sb;
  const la = LIFECYCLE_ORDER[a.meta?.lifecycle ?? ""] ?? 99;
  const lb = LIFECYCLE_ORDER[b.meta?.lifecycle ?? ""] ?? 99;
  if (la !== lb) return la - lb;
  return a.name.localeCompare(b.name);
}

/* ──────────────────────────────────────────────────────────────────
 * Main composable
 * ────────────────────────────────────────────────────────────────── */
export interface UseRoleDashboardOptions {
  /** Polling interval in ms; pass 0 / Infinity to disable */
  pollIntervalMs?: number;
  /** Start loading on composable creation (default true) */
  autoLoad?: boolean;
}

export function useRoleDashboard(
  roleIdRef: string | Ref<string>,
  options: UseRoleDashboardOptions = {}
) {
  const { pollIntervalMs = 60_000, autoLoad = true } = options;
  const roleId: Ref<string> =
    typeof roleIdRef === "string" ? ref(roleIdRef) : (roleIdRef as Ref<string>);

  const role: Ref<RoleDef> = computed(() => getRole(roleId.value));
  const subdirs: Ref<SubdirDef[]> = computed(() => role.value.subdirs);

  /* ── Core state ─────────────────────────────────────────────── */
  const allFiles = ref<KnowledgeFileEntry[]>([]);
  const loading = ref(false);
  const error = ref<string>("");
  const lastScanAt = ref<Date | null>(null);
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  /* ── UI state (shared between card/list/table) ──────────────── */
  const viewMode = ref<ViewMode>("table");
  const collapsedSections = ref<Set<string>>(new Set());
  const cardActiveDomain = ref<string | null>(null);
  const filters = reactive({
    title: "",
    domain: [] as string[],
    domainText: "",
    type: "",
    status: "",
    lifecycle: "",
    review: ""
  });

  /* ── Side-effects: reset collapsed / filters on role change ── */
  watch(roleId, () => {
    collapsedSections.value = new Set(
      subdirs.value.slice(1).map(d => d.id)
    );
    filters.title = "";
    filters.domain = [];
    filters.domainText = "";
    filters.type = "";
    filters.status = "";
    filters.lifecycle = "";
    filters.review = "";
    cardActiveDomain.value = null;
    if (autoLoad) void refresh({ silent: false });
  });

  /* ── Derivations: filesByDir ───────────────────────────────── */
  const filesByDir = computed<Record<string, KnowledgeFileEntry[]>>(() => {
    const map: Record<string, KnowledgeFileEntry[]> = {};
    for (const dir of subdirs.value) map[dir.id] = [];
    const cat = role.value.id;
    for (const f of allFiles.value) {
      const dirName = f.path.replace(new RegExp(`^${cat}/`), "").split("/")[0];
      if (map[dirName]) map[dirName].push(f);
    }
    for (const dir of subdirs.value) map[dir.id].sort(compareByMaturity);
    return map;
  });

  const fileCounts = computed<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const dir of subdirs.value) counts[dir.id] = filesByDir.value[dir.id]?.length ?? 0;
    return counts;
  });

  /* ── Derivations: flat files (for list / table views) ──────── */
  const flatFiles = computed<FlatFileRow[]>(() => {
    const rows: FlatFileRow[] = [];
    for (const dir of subdirs.value) {
      for (const f of filesByDir.value[dir.id]) {
        rows.push({
          file: f,
          path: f.path,
          name: f.name,
          title: f.meta?.title || f.name,
          size: f.size,
          domain: dir.label,
          domainId: dir.id,
          domainIcon: dir.icon,
          domainColor: dir.color
        });
      }
    }
    return rows;
  });

  const filteredFiles = computed<FlatFileRow[]>(() => {
    return flatFiles.value.filter(row => {
      const ft = filters.title.toLowerCase();
      if (ft) {
        const hay = `${row.title} ${row.file.meta?.title ?? ""} ${row.name}`.toLowerCase();
        if (!hay.includes(ft)) return false;
      }
      if (filters.domain.length && !filters.domain.includes(row.domain)) return false;
      const fd = filters.domainText.toLowerCase();
      if (fd && !row.domain.toLowerCase().includes(fd)) return false;
      const fty = filters.type.toLowerCase();
      if (fty && !(row.file.meta?.type ?? "").toLowerCase().includes(fty)) return false;
      const fs = filters.status.toLowerCase();
      if (fs && !(row.file.meta?.status ?? "").toLowerCase().includes(fs)) return false;
      const fl = filters.lifecycle.toLowerCase();
      if (fl && !(row.file.meta?.lifecycle ?? "").toLowerCase().includes(fl)) return false;
      const fr = filters.review.toLowerCase();
      if (fr && !(row.file.meta?.review_cycle ?? "").toLowerCase().includes(fr)) return false;
      return true;
    });
  });

  /* ── Derivations: stats cards ──────────────────────────────── */
  const stats = computed<RoleStats>(() => {
    const arr = allFiles.value;
    const byStatus = (s: string) => arr.filter(f => f.meta?.status === s).length;
    const now = Date.now();
    let reviewOk = 0;
    let reviewStale = 0;
    for (const f of arr) {
      const cycle = f.meta?.review_cycle;
      const updated = f.updatedAt;
      if (cycle && updated) {
        const days = (now - updated * 1000) / 86_400_000;
        const threshold = REVIEW_CYCLE_DAYS[cycle] ?? 90;
        if (days <= threshold) reviewOk++;
        else reviewStale++;
      }
    }
    const reviewTotal = reviewOk + reviewStale;
    return {
      total: arr.length,
      stable: byStatus("stable"),
      active: byStatus("active"),
      evolving: byStatus("evolving"),
      draft: byStatus("draft"),
      deprecated: byStatus("deprecated"),
      archived: byStatus("archived"),
      reviewOk,
      reviewStale,
      reviewCompliance: reviewTotal ? Math.round((reviewOk / reviewTotal) * 100) : 100,
      lastUpdatedAt: lastScanAt.value ? lastScanAt.value.toLocaleTimeString() : "--"
    };
  });

  /* ── Derivations: distribution for charts ──────────────────── */
  const statusDistribution = computed<Array<{ name: string; value: number }>>(() => {
    const map = new Map<string, number>();
    for (const f of allFiles.value) {
      const s = f.meta?.status ?? "missing";
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  });

  const lifecycleDistribution = computed<Array<{ name: string; value: number }>>(() => {
    const map = new Map<string, number>();
    for (const f of allFiles.value) {
      const s = f.meta?.lifecycle ?? "missing";
      map.set(s, (map.get(s) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  });

  /* ── Load / refresh ────────────────────────────────────────── */
  async function refresh(opts: { silent?: boolean } = {}) {
    const { silent = false } = opts;
    if (!silent) loading.value = true;
    error.value = "";
    try {
      const res = await scanKnowledge(role.value.id);
      const files = (res.categories?.flatMap(c => c.files) ?? []).filter(
        f => f.meta?.type !== "rss"
      );
      allFiles.value = files;
      lastScanAt.value = new Date();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load knowledge";
      if (allFiles.value.length === 0) error.value = msg;
      // otherwise keep last known data, error goes to console only
       
      console.warn("[useRoleDashboard]", msg);
    } finally {
      if (!silent) loading.value = false;
    }
  }

  async function load() {
    // Initial load = not silent
    await refresh({ silent: false });
    // Then start polling
    if (pollIntervalMs > 0 && Number.isFinite(pollIntervalMs)) {
      stopPoll();
      pollTimer = setInterval(() => {
        void refresh({ silent: true });
      }, pollIntervalMs);
    }
  }

  function stopPoll() {
    if (pollTimer !== null) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  onUnmounted(() => stopPoll());

  if (autoLoad) void load();

  /* ── Mutations: UI actions ─────────────────────────────────── */
  function toggleSection(id: string) {
    const next = new Set(collapsedSections.value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    collapsedSections.value = next;
  }

  function scrollTo(dirId: string) {
    if (viewMode.value === "table" || viewMode.value === "list") {
      const dir = subdirs.value.find(d => d.id === dirId);
      if (!dir) return;
      const idx = filters.domain.indexOf(dir.label);
      if (idx >= 0) filters.domain.splice(idx, 1);
      else filters.domain.push(dir.label);
      return;
    }
    // card view: scroll anchor + toggle active
    cardActiveDomain.value = cardActiveDomain.value === dirId ? null : dirId;
    if (collapsedSections.value.has(dirId)) toggleSection(dirId);
    // next tick so DOM is expanded
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>(`[data-section="${dirId}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function isSidebarActive(dir: SubdirDef): boolean {
    if (viewMode.value === "table") return filters.domain.includes(dir.label);
    return cardActiveDomain.value === dir.id;
  }

  /** Utility: given a relative file ref like "foundations/001-基础-LLM基础.md"
   *  return the matched KnowledgeFileEntry, or undefined if it doesn't exist
   *  on disk yet. */
  function resolveFile(fileRef: string): KnowledgeFileEntry | undefined {
    const fullPath = `${role.value.id}/${fileRef}`;
    return allFiles.value.find(f => f.path === fullPath);
  }

  async function removeFile(file: KnowledgeFileEntry): Promise<boolean> {
    try {
      await deleteKnowledgeFile(file.path);
      allFiles.value = allFiles.value.filter(f => f.path !== file.path);
      return true;
    } catch {
      return false;
    }
  }

  /* ── Reset filters when switching from table/list back to card */
  watch(viewMode, (mode) => {
    if (mode === "card") {
      filters.title = "";
      filters.domain = [];
      filters.domainText = "";
      filters.type = "";
      filters.status = "";
      filters.lifecycle = "";
      filters.review = "";
    }
  });

  return {
    /* state */
    role,
    subdirs,
    allFiles,
    loading,
    error,
    lastScanAt,
    viewMode,
    collapsedSections,
    cardActiveDomain,
    filters,
    /* derivations */
    filesByDir,
    fileCounts,
    flatFiles,
    filteredFiles,
    stats,
    statusDistribution,
    lifecycleDistribution,
    /* actions */
    load,
    refresh,
    stopPoll,
    toggleSection,
    scrollTo,
    isSidebarActive,
    resolveFile,
    removeFile
  };
}

export default useRoleDashboard;
