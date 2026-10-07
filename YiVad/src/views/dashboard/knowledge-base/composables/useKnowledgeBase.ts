/**
 * Knowledge base dashboard composable — orchestrator that composes
 * sub-composables for files, search, tree, stats, and import/export.
 *
 * Maintains the original unified API surface so index.vue requires zero changes.
 */
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { getKnowledgeStats } from "@/api/modules/dashboard";
import { getFileAlerts } from "@/api/modules/analyticsService";
import type { KnowledgeStatsData, KnowledgeFileSummary } from "@/api/interface/yiAi";
import type { FileAlertsResponse } from "@/types/analytics";
import type { ECOption } from "@/components/ECharts/config";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import {
  buildReviewCycleDonut,
  buildTypeBar,
  buildStatusBar,
  buildSizeDist,
  buildFileAge,
  buildLifecycleBar,
  buildModuleBar,
  buildRolesBar,
  buildCategoryBar,
  buildTagsBar,
  buildMetadataCompleteness,
  buildTacitDonut,
  CHART_PALETTE
} from "../charts";
import { useCrossFilter } from "./useCrossFilter";
import { useKnowledgeFiles } from "./useKnowledgeFiles";
import { useKnowledgeSearch } from "./useKnowledgeSearch";
import { useKnowledgeTree } from "./useKnowledgeTree";
import { useKnowledgeStats } from "./useKnowledgeStats";
import { useKnowledgeImport } from "./useKnowledgeImport";
import { useAutoRefresh } from "./useAutoRefresh";
import {
  formatNumber,
  formatFileSize,
  formatRelativeTime,
  highlightSnippet,
  isStaleFile,
  fileHealthLevel,
  fileHealthIssues,
  countByField,
  countByFieldWithMissing,
  getModuleClassSummary,
  isMissingField,
  isUnknownField,
  normalizeMetaValue,
  MISSING_LABEL,
  isMarkdownFile,
  isExcludedFromQuality,
  catColor,
  statusColor,
  statusTagType,
  lifecycleColor,
  lifecycleTagType,
  reviewCycleTagType,
  dataQualityColor,
  daysUntilDue,
  moduleHealthScore,
  FILTER_LABEL_MAP
} from "../utils";

const { openInAiChat } = useAiChatBridge();

// ── Chart click drill bucket maps (must mirror charts/index.ts) ──
const SIZE_BUCKETS: Record<string, [number, number]> = {
  "<1KB": [0, 1024],
  "1-5KB": [1024, 5120],
  "5-20KB": [5120, 20480],
  "20-50KB": [20480, 51200],
  "50-100KB": [51200, 102400],
  ">100KB": [102400, Infinity]
};

const AGE_BUCKETS: Record<string, [number, number]> = {
  "<7d": [0, 7],
  "7-30d": [7, 30],
  "1-3mo": [30, 90],
  "3-6mo": [90, 180],
  "6-12mo": [180, 365],
  ">1y": [365, Infinity]
};

function daysSinceUpdated(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return (Date.now() - d.getTime()) / 86400000;
  } catch {
    return null;
  }
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useKnowledgeBase() {
  // ═══════════════════════════════════════════════
  // Core State
  // ═══════════════════════════════════════════════
  const knowledgeData = ref<KnowledgeStatsData | null>(null);
  const previousSnapshot = ref<KnowledgeStatsData | null>(null);
  const fileAlerts = ref<FileAlertsResponse | null>(null);
  const loading = ref(true);
  const lastUpdated = ref("");

  // ── Tab State ──
  const activeTab = ref("overview");

  // ── Filter State ──
  const activeFilter = ref<Record<string, string>>({});
  const activeSubCategory = ref("");
  const drillView = ref<"all" | "recent" | "stale">("all");
  const viewMode = ref<"files" | "modules">("files");
  const drillPage = ref(1);
  const drillPageSize = 20;
  const sortField = ref("updated");
  const sortOrder = ref<"asc" | "desc">("desc");
  const activeTimeFilter = ref("");
  const dateFilterDay = ref<string | null>(null);
  const fileViewMode = ref<"table" | "gallery">("table");
  const viewAttentionFiles = ref(false);

  // ── Refs for template ──
  const drillDownRef = ref<HTMLElement | null>(null);

  // ── Cross-Filter ──
  const xf = useCrossFilter(activeFilter);
  const chartPulseKey = ref(0);
  const drillHighlight = ref(false);
  const pulsingCard = ref("");

  // ── Collapsible section toggles ──
  const showCategoryComparison = ref(false);
  const showCrossHeatmap = ref(false);
  const showStaleRisk = ref(false);
  const showCoverageGaps = ref(false);
  const showTagCloud = ref(false);
  const showRoleCloud = ref(false);
  const showReviewCompliance = ref(false);
  const showKnowledgeGraph = ref(false);

  // ── Needs Attention collapsible detail ──
  const showAttentionDetail = ref(true);

  // ── Filter history for undo ──
  const filterHistory = ref<Record<string, string>[]>([]);
  const MAX_HISTORY = 20;

  // ═══════════════════════════════════════════════
  // Data Fetching (must be defined early — passed to sub-composables)
  // ═══════════════════════════════════════════════
  async function fetchData() {
    try {
      loading.value = true;
      if (knowledgeData.value) {
        previousSnapshot.value = JSON.parse(JSON.stringify(knowledgeData.value));
      }
      const [statsRes, alertsRes] = await Promise.all([
        getKnowledgeStats(),
        getFileAlerts().catch(() => null),
      ]);
      knowledgeData.value = statsRes.data;
      fileAlerts.value = alertsRes;
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally {
      loading.value = false;
    }
  }

  // ── Auto-Refresh ──
  const autoRefresh = useAutoRefresh(fetchData);

  // ═══════════════════════════════════════════════
  // Sub-Composables (phase 1 — independent of filteredFiles)
  // ═══════════════════════════════════════════════
  const search = useKnowledgeSearch(knowledgeData, activeFilter);
  const tree = useKnowledgeTree(knowledgeData);

  // ── Time-filtered file lists (lazy computed) ──
  function applyFiltersToList(files: KnowledgeFileSummary[]): KnowledgeFileSummary[] {
    const filters = activeFilter.value;
    let result = files;
    if (Object.keys(filters).length) {
      result = result.filter(f => {
        for (const [key, val] of Object.entries(filters)) {
          if (key === "stale") {
            if (!isStaleFile(f)) return false;
          } else if (key === "tacit") {
            if (!f.tacit) return false;
          } else if (key === "module") {
            if (f.module !== val) return false;
          } else if (key === "sub_module") {
            if (f.sub_module !== val) return false;
          } else if (key === "size_min") {
            if ((f.size ?? 0) < Number(val)) return false;
          } else if (key === "size_max") {
            if ((f.size ?? 0) >= Number(val)) return false;
          } else if (key === "age_min_days") {
            const d = daysSinceUpdated(f.updated);
            if (d === null || d < Number(val)) return false;
          } else if (key === "age_max_days") {
            const d = daysSinceUpdated(f.updated);
            if (d === null || d >= Number(val)) return false;
          } else if (key === "role") {
            if (!f.roles?.includes(val)) return false;
          } else if (key === "tag") {
            if (!f.tags?.includes(val)) return false;
          } else if (key === "review_cycle") {
            if (val === "__missing__") {
              if (f.review_cycle) return false;
            } else if (!val) {
              if (!f.review_cycle) return false;
            } else {
              if (f.review_cycle !== val) return false;
            }
          } else if (
            key === "status" ||
            key === "type" ||
            key === "lifecycle" ||
            key === "tags" ||
            key === "roles" ||
            key === "benefit"
          ) {
            if (val === "__missing__") {
              const v = (f as any)[key];
              if (Array.isArray(v) ? v.length > 0 : !!v) return false;
            } else if (key === "tags" || key === "roles") {
              if (!(f as any)[key]?.includes(val)) return false;
            } else {
              if ((f as any)[key] !== val) return false;
            }
          }
        }
        return true;
      });
    }
    if (search.searchText.value) {
      const q = search.searchText.value.toLowerCase();
      result = result.filter(
        f => f.title.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)
      );
    }
    return result;
  }

  // ── Time-filtered file lists (populated lazily via computed) ──
  const weekFilesComputed = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try {
        return new Date(f.updated) >= weekAgo;
      } catch {
        return false;
      }
    });
  });

  const monthFilesComputed = computed(() => {
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try {
        return new Date(f.updated) >= monthAgo;
      } catch {
        return false;
      }
    });
  });

  // ── Day Navigator files ──
  const dayFiles = computed(() => {
    const target = dateFilterDay.value;
    if (!target) return [];
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try {
        return isoDate(new Date(f.updated)) === target;
      } catch {
        return false;
      }
    });
  });

  const isTodayFilter = computed(() => dateFilterDay.value === isoDate(new Date()));

  const dateFilterLabel = computed(() => {
    if (!dateFilterDay.value) return "All Days";
    const d = new Date(dateFilterDay.value + "T00:00:00");
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return isTodayFilter.value ? `Today \u00b7 ${dateStr}` : dateStr;
  });

  // ── Filtered file list (core pipeline) ──
  const filteredFiles = computed(() => {
    let result = applyFiltersToList(knowledgeData.value?.files ?? []);
    if (activeTimeFilter.value === "today") result = result.filter(f => dayFiles.value.includes(f));
    else if (activeTimeFilter.value === "week") result = result.filter(f => weekFilesComputed.value.includes(f));
    else if (activeTimeFilter.value === "month") result = result.filter(f => monthFilesComputed.value.includes(f));
    if (dateFilterDay.value) result = result.filter(f => dayFiles.value.includes(f));
    if (activeSubCategory.value) {
      result = result.filter(f => f.module === activeSubCategory.value);
    }
    return result;
  });

  // ═══════════════════════════════════════════════
  // Stats (depends on filteredFiles)
  // ═══════════════════════════════════════════════
  const stats = useKnowledgeStats(knowledgeData, previousSnapshot, activeFilter, filteredFiles);

  // ═══════════════════════════════════════════════
  // Drill Table Computeds (depends on stats.needsAttentionFiles)
  // ═══════════════════════════════════════════════
  const drillTableData = computed(() => {
    if (viewAttentionFiles.value) {
      return stats.needsAttentionFiles.value;
    }
    if (drillView.value === "recent") {
      return filteredFiles.value
        .filter(f => f.updated)
        .sort((a, b) => b.updated.localeCompare(a.updated))
        .slice(0, 50);
    }
    if (drillView.value === "stale") {
      return filteredFiles.value
        .filter(f => isStaleFile(f))
        .sort((a, b) => a.updated.localeCompare(b.updated));
    }
    return filteredFiles.value;
  });

  const sortedDrillTableData = computed(() => {
    const data = [...drillTableData.value];
    const field = sortField.value;
    const order = sortOrder.value;
    data.sort((a, b) => {
      let va: any = (a as any)[field] ?? "";
      let vb: any = (b as any)[field] ?? "";
      if (field === "tacit") {
        va = va ? 1 : 0;
        vb = vb ? 1 : 0;
      } else if (field === "size") {
        va = va || 0;
        vb = vb || 0;
      } else if (field === "roles") {
        va = (va || []).length;
        vb = (vb || []).length;
      } else if (field === "tags") {
        va = (va || []).length;
        vb = (vb || []).length;
      }
      if (typeof va === "string") return order === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return order === "asc" ? va - vb : vb - va;
    });
    return data;
  });

  const paginatedDrillFiles = computed(() => {
    const start = (drillPage.value - 1) * drillPageSize;
    return sortedDrillTableData.value.slice(start, start + drillPageSize);
  });

  // ═══════════════════════════════════════════════
  // Files & Import (depend on sortedDrillTableData)
  // ═══════════════════════════════════════════════
  const files = useKnowledgeFiles({
    knowledgeData,
    sortedDrillTableData,
    drillPage,
    drillPageSize,
    fetchData,
    openInAiChat,
    dataQualityScore: stats.dataQualityScore,
    needsAttentionFiles: stats.needsAttentionFiles
  });

  const imp = useKnowledgeImport(sortedDrillTableData);

  // ═══════════════════════════════════════════════
  // Module Drill Data & Sub-categories
  // ═══════════════════════════════════════════════
  const moduleDrillData = computed(() => {
    const modules = knowledgeData.value?.modules ?? [];
    const list = knowledgeData.value?.files ?? [];
    const fileLookup = new Map<string, KnowledgeFileSummary[]>();
    for (const f of list) {
      const key = `${f.category}/${f.module}`;
      if (!fileLookup.has(key)) fileLookup.set(key, []);
      fileLookup.get(key)!.push(f);
    }
    return modules
      .sort((a, b) => b.count - a.count)
      .map(m => ({
        key: `${m.category}/${m.name}`,
        name: m.name,
        category: m.category,
        count: m.count,
        statuses: m.statuses || [],
        types: m.types || [],
        lifecycles: m.lifecycles || [],
        sub_modules: m.sub_modules || [],
        stale_count: m.stale_count,
        tacit_count: m.tacit_count,
        review_coverage_pct: m.review_coverage_pct,
        healthScore: moduleHealthScore(m),
        files: (fileLookup.get(`${m.category}/${m.name}`) || []).sort(
          (a, b) => (b.updated || "").localeCompare(a.updated || "")
        ),
        filePage: 30
      }));
  });

  const filteredModuleDrillData = computed(() => {
    if (!tree.moduleDrillSearch.value) return moduleDrillData.value;
    const q = tree.moduleDrillSearch.value.toLowerCase();
    return moduleDrillData.value.filter(
      m => m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  });

  const subCategories = computed(() => {
    const cat = activeFilter.value.category;
    if (!cat) return [];
    const modules = knowledgeData.value?.modules ?? [];
    return modules
      .filter(m => m.category === cat)
      .map(m => ({
        name: m.name,
        count: m.count,
        statuses: m.statuses,
        types: m.types,
        lifecycles: m.lifecycles,
        roles: m.roles,
        staleCount: m.stale_count,
        tacitCount: m.tacit_count,
        reviewCoveragePct: m.review_coverage_pct
      }))
      .sort((a, b) => b.count - a.count);
  });

  const categoryReviewCoverage = computed(() => {
    const mods = subCategories.value;
    if (!mods.length) return 0;
    const total = mods.reduce((s, m) => s + m.count, 0);
    return Math.round(mods.reduce((s, m) => s + m.reviewCoveragePct * m.count, 0) / total);
  });

  const categoryStaleCount = computed(() => subCategories.value.reduce((s, m) => s + m.staleCount, 0));
  const categoryTacitCount = computed(() => subCategories.value.reduce((s, m) => s + m.tacitCount, 0));

  const moduleDetail = computed(() => {
    if (!activeSubCategory.value || !activeFilter.value.category) return null;
    const modules = knowledgeData.value?.modules ?? [];
    return (
      modules.find(
        m => m.category === activeFilter.value.category && m.name === activeSubCategory.value
      ) || null
    );
  });

  const subdirectoryBreakdown = computed(() => {
    if (!moduleDetail.value) return [];
    return (moduleDetail.value.sub_modules || []).map(sm => ({
      name: sm.name,
      count: sm.count,
      statuses: sm.statuses || [],
      types: sm.types || [],
      lifecycles: sm.lifecycles || [],
      staleCount: sm.stale_count,
      tacitCount: sm.tacit_count,
      reviewCoveragePct: sm.review_coverage_pct
    }));
  });

  const topModuleFiles = computed(() => {
    if (!activeSubCategory.value || !activeFilter.value.category) return [];
    let list = (knowledgeData.value?.files ?? []).filter(
      f => f.category === activeFilter.value.category && f.module === activeSubCategory.value
    );
    if (activeFilter.value.sub_module) {
      list = list.filter(f => f.sub_module === activeFilter.value.sub_module);
    }
    return list.slice(0, 12);
  });

  // ═══════════════════════════════════════════════
  // Cross-cutting Computeds
  // ═══════════════════════════════════════════════
  const hasActiveFilter = computed(() => Object.keys(activeFilter.value).length > 0);

  const showSubModuleGrid = computed(
    () =>
      activeFilter.value.category != null &&
      !activeSubCategory.value &&
      subCategories.value.length > 1 &&
      Object.keys(activeFilter.value).length === 1 &&
      !activeTimeFilter.value &&
      !search.searchText.value &&
      drillView.value === "all"
  );

  const isShowingTreeView = computed(
    () =>
      !hasActiveFilter.value &&
      !search.searchText.value &&
      !activeTimeFilter.value &&
      !search.browseAllFiles.value &&
      drillView.value === "all" &&
      search.searchMode.value === "title" &&
      viewMode.value === "modules"
  );

  // ── Drill Summary ──
  const drillSummary = computed(() => {
    const list = drillTableData.value;
    if (!list.length) return null;
    const mods = new Map<string, number>();
    const statuses = new Map<string, number>();
    const types = new Map<string, number>();
    const lifecycles = new Map<string, number>();
    for (const f of list) {
      const mod = f.module === "__root__" ? "root" : f.module || "root";
      mods.set(mod, (mods.get(mod) || 0) + 1);
      statuses.set(normalizeMetaValue(f.status), (statuses.get(normalizeMetaValue(f.status)) || 0) + 1);
      types.set(normalizeMetaValue(f.type), (types.get(normalizeMetaValue(f.type)) || 0) + 1);
      lifecycles.set(normalizeMetaValue(f.lifecycle), (lifecycles.get(normalizeMetaValue(f.lifecycle)) || 0) + 1);
    }
    const top = (m: Map<string, number>, n: number) =>
      Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, n);
    return {
      total: list.length,
      topModules: top(mods, 5),
      topStatuses: top(statuses, 4),
      topTypes: top(types, 4),
      topLifecycles: top(lifecycles, 4)
    };
  });

  // ═══════════════════════════════════════════════
  // Chart Options
  // ═══════════════════════════════════════════════
  const chartContextFiles = computed(() => {
    const cat = activeFilter.value.category;
    const mod = activeSubCategory.value;
    if (!cat && !mod) return null;
    let list = knowledgeData.value?.files ?? [];
    if (cat) list = list.filter(f => f.category === cat);
    if (mod) list = list.filter(f => f.module === mod);
    return list;
  });

  const reviewCycleDonutOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const data = ctx
      ? countByField(ctx, "review_cycle").filter(d => d.name)
      : (knowledgeData.value?.review_cycles ?? []);
    const missing = ctx
      ? ctx.filter(f => !f.review_cycle).length
      : (knowledgeData.value?.health.no_review_cycle_count ?? 0);
    return buildReviewCycleDonut(data, missing);
  });

  const typeBarOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const data = ctx ? countByField(ctx, "type") : (knowledgeData.value?.types ?? []);
    return buildTypeBar(data);
  });

  const statusBarOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const data = ctx ? countByField(ctx, "status") : (knowledgeData.value?.statuses ?? []);
    return buildStatusBar(data);
  });

  const sizeDistOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const list = ctx ?? knowledgeData.value?.files ?? [];
    return buildSizeDist(list);
  });

  const fileAgeOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const list = ctx ?? knowledgeData.value?.files ?? [];
    return buildFileAge(list);
  });

  const lifecycleBarOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const data = ctx ? countByField(ctx, "lifecycle") : (knowledgeData.value?.lifecycles ?? []);
    return buildLifecycleBar(data);
  });

  const moduleBarOption = computed<ECOption>(() => {
    const modules = knowledgeData.value?.modules ?? [];
    return buildModuleBar(modules, activeFilter.value.category, CHART_PALETTE);
  });

  const rolesBarOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    let data: { name: string; count: number }[];
    if (ctx) {
      const rc = new Map<string, number>();
      for (const f of ctx) {
        for (const r of f.roles || []) rc.set(r, (rc.get(r) || 0) + 1);
      }
      data = Array.from(rc.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      data = knowledgeData.value?.roles ?? [];
    }
    return buildRolesBar(data, CHART_PALETTE);
  });

  const categoryBarOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const data = ctx ? countByField(ctx, "category") : (knowledgeData.value?.categories ?? []);
    return buildCategoryBar(data);
  });

  const tagsBarOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    let data: { name: string; count: number }[];
    if (ctx) {
      const tc = new Map<string, number>();
      for (const f of ctx) {
        for (const t of f.tags || []) tc.set(t, (tc.get(t) || 0) + 1);
      }
      data = Array.from(tc.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    } else {
      data = stats.tagCounts.value;
    }
    return buildTagsBar(data, CHART_PALETTE);
  });

  const metadataCompletenessOption = computed<ECOption>(() => {
    const dq = knowledgeData.value?.data_quality;
    const total = knowledgeData.value?.total ?? 1;
    if (!dq) return {};
    return buildMetadataCompleteness([
      {
        label: "Status",
        pct: Math.round(((total - dq.no_status) / total) * 100),
        total,
        missing: dq.no_status
      },
      {
        label: "Type",
        pct: Math.round(((total - dq.no_type) / total) * 100),
        total,
        missing: dq.no_type
      },
      {
        label: "Lifecycle",
        pct: Math.round(((total - dq.no_lifecycle) / total) * 100),
        total,
        missing: dq.no_lifecycle
      },
      {
        label: "Review Cycle",
        pct: Math.round(((total - dq.no_review_cycle) / total) * 100),
        total,
        missing: dq.no_review_cycle
      },
      {
        label: "Roles",
        pct: Math.round(((total - dq.no_roles) / total) * 100),
        total,
        missing: dq.no_roles
      },
      {
        label: "Tags",
        pct: Math.round(((total - dq.no_tags) / total) * 100),
        total,
        missing: dq.no_tags
      }
    ]);
  });

  const tacitDonutOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const list = ctx ?? knowledgeData.value?.files ?? [];
    const tacit = list.filter(f => f.tacit).length;
    return buildTacitDonut(tacit, list.length - tacit);
  });

  // ═══════════════════════════════════════════════
  // Filter & Navigation Methods
  // ═══════════════════════════════════════════════
  function scrollToDrillDown() {
    drillDownRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function forceFileTableView() {
    viewMode.value = "files";
    fileViewMode.value = "table";
    search.searchMode.value = "title";
    search.contentSearchResults.value = [];
    activeTimeFilter.value = "";
  }

  function resetDrillState() {
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    search.browseAllFiles.value = false;
    files.selectedFile.value = null;
  }

  function resetChartDrill() {
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    search.searchText.value = "";
    search.browseAllFiles.value = false;
    files.selectedFile.value = null;
    forceFileTableView();
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function setFilter(key: string, val: string) {
    const prev = { ...activeFilter.value };
    const next = { ...activeFilter.value };
    if (next[key] === val && val !== "") {
      delete next[key];
    } else {
      next[key] = val;
    }
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      filterHistory.value = [...filterHistory.value.slice(-(MAX_HISTORY - 1)), prev];
    }
    activeFilter.value = next;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    search.searchText.value = "";
    search.browseAllFiles.value = false;
    files.selectedFile.value = null;
    chartPulseKey.value++;
    pulsingCard.value = "";
    setTimeout(() => {
      drillHighlight.value = true;
      scrollToDrillDown();
      setTimeout(() => {
        drillHighlight.value = false;
      }, 1500);
    }, 100);
  }

  function undoLastFilter() {
    const prev = filterHistory.value.pop();
    if (prev) {
      activeFilter.value = prev;
      activeSubCategory.value = "";
      drillView.value = "all";
      drillPage.value = 1;
      files.selectedFile.value = null;
      chartPulseKey.value++;
      setTimeout(() => scrollToDrillDown(), 100);
    }
  }

  function selectTreeNode(category: string, module?: string, sub_module?: string) {
    const next: Record<string, string> = { category };
    if (module) next.module = module;
    if (sub_module) next.sub_module = sub_module;
    activeFilter.value = next;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    search.searchText.value = "";
    search.browseAllFiles.value = false;
    files.selectedFile.value = null;
    chartPulseKey.value++;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function removeFilter(key: string) {
    const next = { ...activeFilter.value };
    delete next[key];
    activeFilter.value = next;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    search.searchText.value = "";
    search.browseAllFiles.value = false;
    files.selectedFile.value = null;
    chartPulseKey.value++;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function pulseCard(cardKey: string) {
    pulsingCard.value = cardKey;
    setTimeout(() => {
      pulsingCard.value = "";
    }, 400);
  }

  function toggleNoReviewFilter() {
    if (activeFilter.value.review_cycle === "__missing__") {
      const { review_cycle: _, ...rest } = activeFilter.value;
      activeFilter.value = rest;
    } else {
      activeFilter.value = { ...activeFilter.value, review_cycle: "__missing__" };
    }
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    search.searchText.value = "";
    activeTimeFilter.value = "";
    search.browseAllFiles.value = false;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function setQualityFilter(field: string) {
    forceFileTableView();
    if (field === "status" || field === "type" || field === "lifecycle") {
      setFilter(field, "__missing__");
    } else if (field === "review_cycle") {
      setFilter("review_cycle", "__missing__");
    } else if (field === "roles") {
      setFilter("roles", "__missing__");
    } else if (field === "tags") {
      setFilter("tags", "__missing__");
    } else if (field === "benefit") {
      setFilter("benefit", "__missing__");
    }
  }

  function backToCategory() {
    const cat = activeFilter.value.category;
    activeFilter.value = cat ? { category: cat } : {};
    activeSubCategory.value = "";
    drillPage.value = 1;
  }

  function clearAllFilters() {
    activeFilter.value = {};
    activeSubCategory.value = "";
    drillView.value = "all";
    viewMode.value = "files";
    drillPage.value = 1;
    search.searchText.value = "";
    activeTimeFilter.value = "";
    dateFilterDay.value = null;
    search.browseAllFiles.value = false;
    viewAttentionFiles.value = false;
    search.searchMode.value = "title";
    search.contentSearchResults.value = [];
    files.selectedFile.value = null;
    files.dialogFilePath.value = "";
    tree.expandedModuleKeys.value = [];
    tree.moduleDrillSearch.value = "";
    chartPulseKey.value++;
    pulsingCard.value = "";
    drillHighlight.value = false;
  }

  function showAllAttentionFiles() {
    clearAllFilters();
    viewAttentionFiles.value = true;
    viewMode.value = "files";
    fileViewMode.value = "table";
    drillPage.value = 1;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function drillToModule(moduleName: string) {
    if (showSubModuleGrid.value) {
      activeSubCategory.value = moduleName;
      drillPage.value = 1;
    } else {
      setFilter("module", moduleName);
    }
  }

  function drillToSubdir(subdir: string) {
    if (subdir === "__root__") {
      const { sub_module: _, ...rest } = activeFilter.value;
      activeFilter.value = rest;
    } else {
      activeFilter.value = { ...activeFilter.value, sub_module: subdir };
    }
    drillPage.value = 1;
  }

  function drillFromModule(cat: string, mod: string, subdir: string) {
    activeFilter.value = {
      category: cat,
      module: mod,
      ...(subdir !== "__root__" ? { sub_module: subdir } : {})
    };
    drillPage.value = 1;
  }

  function onModuleExpandChange(_row: any, expandedRows: any) {
    tree.expandedModuleKeys.value = (expandedRows || []).map((r: any) => r.key);
  }

  async function navigateToModule(catName: string, moduleName: string) {
    clearAllFilters();
    viewMode.value = "modules";
    tree.moduleDrillSearch.value = moduleName;
    await new Promise(r => setTimeout(r, 50));
    const target = moduleDrillData.value.find(
      m => m.name === moduleName && m.category === catName
    );
    if (target) {
      tree.expandedModuleKeys.value = [target.key];
      await new Promise(r => setTimeout(r, 50));
      tree.moduleTableRef.value?.$el?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  function crossFilterSubModule(moduleName: string, dim: string, val: string) {
    const cat = activeFilter.value.category;
    activeSubCategory.value = moduleName;
    activeFilter.value = { [dim]: val, ...(cat ? { category: cat } : {}) };
    drillView.value = "all";
    drillPage.value = 1;
    search.searchText.value = "";
    activeTimeFilter.value = "";
    search.browseAllFiles.value = false;
  }

  function onTimeFilterChange(period: string | number | boolean | undefined) {
    activeTimeFilter.value = typeof period === "string" ? period : "";
    dateFilterDay.value = null;
    resetDrillState();
  }

  // ── Day Navigator ──
  function setDateFilterDay(day: string | null) {
    dateFilterDay.value = day;
    activeTimeFilter.value = "";
    viewAttentionFiles.value = false;
    resetDrillState();
  }

  function shiftDateFilterDay(offset: number) {
    const base = dateFilterDay.value
      ? new Date(dateFilterDay.value + "T00:00:00")
      : new Date();
    base.setDate(base.getDate() + offset);
    setDateFilterDay(isoDate(base));
  }

  function goToPrevDay() {
    shiftDateFilterDay(-1);
  }
  function goToNextDay() {
    shiftDateFilterDay(1);
  }
  function goToTodayFilter() {
    setDateFilterDay(isoDate(new Date()));
  }
  function clearDateFilter() {
    setDateFilterDay(null);
  }

  // ── Sort ──
  function onTableSortChange({
    prop,
    order
  }: {
    prop: string | null;
    order: string | null;
    column?: any;
  }) {
    if (order && prop) {
      sortField.value = prop;
      sortOrder.value = order === "ascending" ? "asc" : "desc";
    } else {
      sortField.value = "updated";
      sortOrder.value = "desc";
    }
    drillPage.value = 1;
  }

  // ── Chart Click Drill ──
  function onChartClick(dimension: string, event: any) {
    activeTab.value = "browse";
    const name =
      typeof event?.name === "string" && event.name ? event.name : event?.data?.name;
    if (typeof name !== "string" || !name) return;

    if (dimension === "module") {
      const modules = knowledgeData.value?.modules ?? [];
      let candidates = modules.filter(m => m.name !== "__root__");
      const cat = activeFilter.value.category;
      if (cat) candidates = candidates.filter(m => m.category === cat);
      const mod = candidates.find(m => m.name === name);
      if (!mod) return;
      activeFilter.value = { category: mod.category, module: mod.name };
      resetChartDrill();
      return;
    }

    if (dimension === "size") {
      const range = SIZE_BUCKETS[name];
      if (!range) return;
      const [min, max] = range;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(activeFilter.value)) {
        if (k !== "size_min" && k !== "size_max") next[k] = v;
      }
      if (min > 0) next.size_min = String(min);
      if (max !== Infinity) next.size_max = String(max);
      activeFilter.value = next;
      resetChartDrill();
      return;
    }

    if (dimension === "age") {
      const range = AGE_BUCKETS[name];
      if (!range) return;
      const [min, max] = range;
      const next: Record<string, string> = {};
      for (const [k, v] of Object.entries(activeFilter.value)) {
        if (k !== "age_min_days" && k !== "age_max_days") next[k] = v;
      }
      if (min > 0) next.age_min_days = String(min);
      if (max !== Infinity) next.age_max_days = String(max);
      activeFilter.value = next;
      resetChartDrill();
      return;
    }

    if (dimension === "tacit") {
      if (name === "Tacit") setFilter("tacit", "true");
      else removeFilter("tacit");
      forceFileTableView();
      return;
    }

    setFilter(dimension, name);
    forceFileTableView();
  }

  // ── Keyboard ──
  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const input = drillDownRef.value?.querySelector(".el-input__inner") as HTMLInputElement | null;
      input?.focus();
    }
  }

  // ═══════════════════════════════════════════════
  // Lifecycle
  // ═══════════════════════════════════════════════
  onMounted(async () => {
    await fetchData();
    document.addEventListener("keydown", onGlobalKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", onGlobalKeydown);
  });

  /** CSS class for quality mini-card based on completeness percentage. */
  function qualityCardClass(pct: number): string {
    if (pct >= 80) return "qmc-healthy";
    if (pct >= 50) return "qmc-warn";
    return "qmc-poor";
  }

  // ═══════════════════════════════════════════════
  // Unified Return API (identical to original)
  // ═══════════════════════════════════════════════
  return {
    // Core state
    knowledgeData,
    fileAlerts,
    loading,
    lastUpdated,
    // Filter state
    activeFilter,
    activeSubCategory,
    drillView,
    viewMode,
    drillPage,
    drillPageSize,
    sortField,
    sortOrder,
    activeTimeFilter,
    dateFilterDay,
    fileViewMode,
    viewAttentionFiles,
    filterHistory,
    // Cross-filter state
    chartPulseKey,
    drillHighlight,
    pulsingCard,
    // Collapsible toggles
    showCategoryComparison,
    showCrossHeatmap,
    showStaleRisk,
    showCoverageGaps,
    showTagCloud,
    showRoleCloud,
    showReviewCompliance,
    showKnowledgeGraph,
    showAttentionDetail,
    // Refs
    drillDownRef,
    // Cross-filter spread
    ...xf,
    // Search domain
    searchText: search.searchText,
    searchMode: search.searchMode,
    contentSearchResults: search.contentSearchResults,
    contentSearchLoading: search.contentSearchLoading,
    showSearchSuggestions: search.showSearchSuggestions,
    browseAllFiles: search.browseAllFiles,
    enrichedSearchResults: search.enrichedSearchResults,
    searchSuggestions: search.searchSuggestions,
    doContentSearch: search.doContentSearch,
    onSearchInput: search.onSearchInput,
    // Tree domain
    showTreeView: tree.showTreeView,
    expandedModuleKeys: tree.expandedModuleKeys,
    moduleDrillSearch: tree.moduleDrillSearch,
    moduleTableRef: tree.moduleTableRef,
    categoryTreeData: tree.categoryTreeData,
    // Stats domain
    topCategory: stats.topCategory,
    tacitPct: stats.tacitPct,
    topRole: stats.topRole,
    totalModules: stats.totalModules,
    recentWeekCount: stats.recentWeekCount,
    recentWeekPct: stats.recentWeekPct,
    stalePct: stats.stalePct,
    clientReviewCoveragePct: stats.clientReviewCoveragePct,
    dataQualityScore: stats.dataQualityScore,
    missingMetadataCount: stats.missingMetadataCount,
    qualityEligibleTotal: stats.qualityEligibleTotal,
    qualityByCategory: stats.qualityByCategory,
    worstCategories: stats.worstCategories,
    needsAttentionFiles: stats.needsAttentionFiles,
    unknownStatusFiles: stats.unknownStatusFiles,
    clientMissingStats: stats.clientMissingStats,
    attentionPct: stats.attentionPct,
    totalMissingCount: stats.totalMissingCount,
    totalUnknownCount: stats.totalUnknownCount,
    hasMissingItems: stats.hasMissingItems,
    hasUnknownItems: stats.hasUnknownItems,
    statusCompletenessPct: stats.statusCompletenessPct,
    typeCompletenessPct: stats.typeCompletenessPct,
    lifecycleCompletenessPct: stats.lifecycleCompletenessPct,
    reviewCycleCompletenessPct: stats.reviewCycleCompletenessPct,
    rolesCompletenessPct: stats.rolesCompletenessPct,
    tagsCompletenessPct: stats.tagsCompletenessPct,
    staleFiles: stats.staleFiles,
    todayFiles: stats.todayFiles,
    weekFiles: weekFilesComputed,
    monthFiles: monthFilesComputed,
    staleRiskBuckets: stats.staleRiskBuckets,
    coverageGapData: stats.coverageGapData,
    categoryComparisonData: stats.categoryComparisonData,
    crossStatusLifecycle: stats.crossStatusLifecycle,
    tagCounts: stats.tagCounts,
    tagPairs: stats.tagPairs,
    roleCounts: stats.roleCounts,
    rolePairs: stats.rolePairs,
    reviewComplianceData: stats.reviewComplianceData,
    statDeltas: stats.statDeltas,
    trendDeltas: stats.trendDeltas,
    // Tab state
    activeTab,
    autoRefresh,
    // Files domain
    selectedFile: files.selectedFile,
    fileContent: files.fileContent,
    fileContentLoading: files.fileContentLoading,
    showFileContent: files.showFileContent,
    dialogFilePath: files.dialogFilePath,
    recentlyViewed: files.recentlyViewed,
    detailPanelRef: files.detailPanelRef,
    selectedFileIndex: files.selectedFileIndex,
    prevFile: files.prevFile,
    nextFile: files.nextFile,
    resolvedRelatedFiles: files.resolvedRelatedFiles,
    sameModuleCount: files.sameModuleCount,
    sameSubModuleCount: files.sameSubModuleCount,
    dialogFileIndex: files.dialogFileIndex,
    prevDialogFile: files.prevDialogFile,
    nextDialogFile: files.nextDialogFile,
    openFilePreview: files.openFilePreview,
    addRecentlyViewed: files.addRecentlyViewed,
    clearRecentlyViewed: files.clearRecentlyViewed,
    openFileInDialog: files.openFileInDialog,
    navigateDialogFile: files.navigateDialogFile,
    navigateToFile: files.navigateToFile,
    resolveRelatedNames: files.resolveRelatedNames,
    getModuleStats: files.getModuleStats,
    discussInAiChat: files.discussInAiChat,
    discussSearchResult: files.discussSearchResult,
    fixMetadataWithAgent: files.fixMetadataWithAgent,
    deleteFile: files.deleteFile,
    onDetailKeydown: files.onDetailKeydown,
    // Import/Export domain
    showBenefitCol: imp.showBenefitCol,
    exportCSV: imp.exportCSV,
    // Main computeds
    hasActiveFilter,
    showSubModuleGrid,
    isShowingTreeView,
    drillSummary,
    moduleDrillData,
    filteredModuleDrillData,
    subCategories,
    categoryReviewCoverage,
    categoryStaleCount,
    categoryTacitCount,
    moduleDetail,
    subdirectoryBreakdown,
    topModuleFiles,
    filteredFiles,
    drillTableData,
    sortedDrillTableData,
    paginatedDrillFiles,
    dayFiles,
    isTodayFilter,
    dateFilterLabel,
    chartContextFiles,
    // Chart options
    reviewCycleDonutOption,
    typeBarOption,
    statusBarOption,
    sizeDistOption,
    fileAgeOption,
    lifecycleBarOption,
    moduleBarOption,
    rolesBarOption,
    categoryBarOption,
    tagsBarOption,
    metadataCompletenessOption,
    tacitDonutOption,
    // Methods
    setFilter,
    removeFilter,
    undoLastFilter,
    selectTreeNode,
    pulseCard,
    toggleNoReviewFilter,
    setQualityFilter,
    backToCategory,
    clearAllFilters,
    showAllAttentionFiles,
    drillToModule,
    drillToSubdir,
    drillFromModule,
    onModuleExpandChange,
    navigateToModule,
    crossFilterSubModule,
    onTimeFilterChange,
    onTableSortChange,
    scrollToDrillDown,
    goToPrevDay,
    goToNextDay,
    goToTodayFilter,
    clearDateFilter,
    onChartClick,
    fetchData,
    // Re-exported utils (used in template)
    formatNumber,
    formatFileSize,
    formatRelativeTime,
    highlightSnippet,
    isStaleFile,
    fileHealthLevel,
    fileHealthIssues,
    countByField,
    countByFieldWithMissing,
    getModuleClassSummary,
    isMissingField,
    isUnknownField,
    normalizeMetaValue,
    MISSING_LABEL,
    isMarkdownFile,
    isExcludedFromQuality,
    catColor,
    statusColor,
    statusTagType,
    lifecycleColor,
    lifecycleTagType,
    reviewCycleTagType,
    dataQualityColor,
    daysUntilDue,
    moduleHealthScore,
    FILTER_LABEL_MAP,
    qualityCardClass
  };
}