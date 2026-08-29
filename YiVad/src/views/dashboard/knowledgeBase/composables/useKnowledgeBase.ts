/**
 * Knowledge base dashboard composable — all reactive state, computeds, and actions.
 * Extracted from the page component so index.vue stays an orchestrator.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { getKnowledgeStats, searchKnowledge } from "@/api/modules/dashboard";
import type { KnowledgeStatsData, KnowledgeFileSummary, KnowledgeModuleStats } from "@/api/interface/yiweb";
import type { ECOption } from "@/components/ECharts/config";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { readKnowledgeFile, deleteKnowledgeFile } from "@/api/modules/knowledgeService";
import { loadJson, saveJson } from "@/utils/storage";
import {
  buildReviewCycleDonut, buildTypeBar, buildStatusBar, buildSizeDist,
  buildFileAge, buildLifecycleBar, buildModuleBar, buildRolesBar,
  buildCategoryBar, buildTagsBar, buildMetadataCompleteness, buildTacitDonut, CHART_PALETTE,
} from "../charts";
import { useCrossFilter } from "./useCrossFilter";
import {
  formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
  isStaleFile, fileHealthLevel, fileHealthIssues, countByField, countByFieldWithMissing,
  getModuleClassSummary, isMissingField, isUnknownField, normalizeMetaValue,
  MISSING_LABEL, aggregateMissingStats, isMarkdownFile, isExcludedFromQuality,
  catColor, statusColor, statusTagType, lifecycleColor, lifecycleTagType, reviewCycleTagType,
  dataQualityColor, daysUntilDue, moduleHealthScore, FILTER_LABEL_MAP,
  topPairs,
} from "../utils";

const { openInAiChat } = useAiChatBridge();

// ── Chart click drill bucket maps (must mirror charts/index.ts) ──
const SIZE_BUCKETS: Record<string, [number, number]> = {
  "<1KB": [0, 1024],
  "1-5KB": [1024, 5120],
  "5-20KB": [5120, 20480],
  "20-50KB": [20480, 51200],
  "50-100KB": [51200, 102400],
  ">100KB": [102400, Infinity],
};

const AGE_BUCKETS: Record<string, [number, number]> = {
  "<7d": [0, 7],
  "7-30d": [7, 30],
  "1-3mo": [30, 90],
  "3-6mo": [90, 180],
  "6-12mo": [180, 365],
  ">1y": [365, Infinity],
};

function daysSinceUpdated(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return (Date.now() - d.getTime()) / 86400000;
  } catch { return null; }
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function useKnowledgeBase() {
  // ── Core State ──
  const knowledgeData = ref<KnowledgeStatsData | null>(null);
  const loading = ref(true);
  const lastUpdated = ref("");

  // ── Filter State ──
  const activeFilter = ref<Record<string, string>>({});
  const activeSubCategory = ref("");
  const drillView = ref<"all" | "recent" | "stale">("all");
  const viewMode = ref<"files" | "modules">("files");
  const drillPage = ref(1);
  const drillPageSize = 20;
  const searchText = ref("");
  const sortField = ref("updated");
  const sortOrder = ref<"asc" | "desc">("desc");
  const activeTimeFilter = ref("");
  const dateFilterDay = ref<string | null>(null); // "YYYY-MM-DD" — files updated on a specific day
  const browseAllFiles = ref(false);
  const searchMode = ref<"title" | "content">("title");
  const contentSearchResults = ref<{ path: string; title: string; snippet: string; size: number }[]>([]);
  const contentSearchLoading = ref(false);
  const selectedFile = ref<KnowledgeFileSummary | null>(null);
  const showBenefitCol = ref(false);
  const fileViewMode = ref<"table" | "gallery">("table");
  const showSearchSuggestions = ref(false);
  const moduleDrillSearch = ref("");
  const expandedModuleKeys = ref<string[]>([]);
  const moduleTableRef = ref<any>(null);
  const viewAttentionFiles = ref(false);

  // ── File Content Preview ──
  const fileContent = ref("");
  const fileContentLoading = ref(false);
  const showFileContent = ref(false);

  // ── Dialog Preview ──
  const dialogFilePath = ref("");
  const RECENTLY_VIEWED_KEY = "kb.recentlyViewed";
  const recentlyViewed = ref<KnowledgeFileSummary[]>(loadJson<KnowledgeFileSummary[]>(RECENTLY_VIEWED_KEY, []));
  const MAX_RECENTLY_VIEWED = 10;

  // ── Refs for template ──
  const drillDownRef = ref<HTMLElement | null>(null);
  const detailPanelRef = ref<HTMLElement | null>(null);

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
  const showTreeView = ref(false);
  const showTagCloud = ref(false);
  const showRoleCloud = ref(false);
  const showReviewCompliance = ref(false);
const showKnowledgeGraph = ref(false);

  // ── Needs Attention collapsible detail ──
  const showAttentionDetail = ref(true);

  // ── Filter history for undo ──
  const filterHistory = ref<Record<string, string>[]>([]);
  const MAX_HISTORY = 20;

  // ── Computed: Overview ──
  const hasActiveFilter = computed(() => Object.keys(activeFilter.value).length > 0);

  const showSubModuleGrid = computed(() =>
    activeFilter.value.category != null && !activeSubCategory.value &&
    subCategories.value.length > 1 && Object.keys(activeFilter.value).length === 1 &&
    !activeTimeFilter.value && !searchText.value && drillView.value === "all"
  );

  const isShowingTreeView = computed(() =>
    !hasActiveFilter.value && !searchText.value && !activeTimeFilter.value &&
    !browseAllFiles.value && drillView.value === "all" && searchMode.value === "title" &&
    viewMode.value === "modules"
  );

  const topCategory = computed(() => {
    const cats = knowledgeData.value?.categories ?? [];
    if (!cats.length) return "-";
    return cats.reduce((a, b) => (a.count > b.count ? a : b)).name;
  });

  const tacitPct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return ((knowledgeData.value?.health.tacit_count ?? 0) / total * 100).toFixed(1);
  });

  const topRole = computed(() => {
    const roles = knowledgeData.value?.roles ?? [];
    if (!roles.length) return "-";
    return roles.reduce((a, b) => (a.count > b.count ? a : b)).name;
  });

  const totalModules = computed(() => {
    const modules = knowledgeData.value?.modules ?? [];
    return modules.length;
  });

  const recentWeekCount = computed(() => weekFiles.value.length);

  const recentWeekPct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return ((recentWeekCount.value / total) * 100).toFixed(1);
  });

  const stalePct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return (((knowledgeData.value?.health.stale_count ?? 0) / total) * 100).toFixed(1);
  });

  /** Review coverage using client-side stats (markdown only, excluding skills). */
  const clientReviewCoveragePct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_review_cycle) / total) * 100);
  });

  // ── Computed: Data Quality ──
  /** Weighted quality score using client-side stats (excludes skill modules).
   *  status(25) + type(25) + lifecycle(25) + review_cycle(15) + roles(5) + tags(5) */
  const dataQualityScore = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    const weights = { status: 25, type: 25, lifecycle: 25, review_cycle: 15, roles: 5, tags: 5 };
    const fields: Array<{ key: string; weight: number }> = [
      { key: "no_status", weight: weights.status },
      { key: "no_type", weight: weights.type },
      { key: "no_lifecycle", weight: weights.lifecycle },
      { key: "no_review_cycle", weight: weights.review_cycle },
      { key: "no_roles", weight: weights.roles },
      { key: "no_tags", weight: weights.tags },
    ];
    let score = 0;
    for (const f of fields) {
      const missing = (s as any)[f.key] ?? 0;
      score += ((total - missing) / total) * f.weight;
    }
    return Math.round(score);
  });

  const missingMetadataCount = computed(() => {
    const s = clientMissingStats.value;
    return s.no_status + s.no_type + s.no_lifecycle + s.no_review_cycle + s.no_roles + s.no_tags;
  });

  /** Per-category data quality breakdown (markdown files only, excluding skill modules). */
  const qualityByCategory = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const cats = knowledgeData.value?.categories ?? [];
    const mdFiles = files.filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f));
    return cats
      .map(cat => {
        const catFiles = mdFiles.filter(f => f.category === cat.name);
        const total = catFiles.length || 1;
        const missing = (field: string) => catFiles.filter(f => isMissingField((f as any)[field])).length;
        const fields = ["status", "type", "lifecycle", "review_cycle", "roles", "tags"] as const;
        let weightedScore = 0;
        const weights: Record<string, number> = { status: 25, type: 25, lifecycle: 25, review_cycle: 15, roles: 5, tags: 5 };
        for (const f of fields) {
          const m = missing(f);
          const fieldPct = (total - m) / total;
          weightedScore += fieldPct * weights[f];
        }
        const totalMissing = fields.reduce((s, f) => s + missing(f), 0);
        return {
          name: cat.name,
          total: catFiles.length,
          score: Math.round(weightedScore),
          totalMissing,
          missingStatus: missing("status"),
          missingType: missing("type"),
          missingLifecycle: missing("lifecycle"),
          missingReviewCycle: missing("review_cycle"),
          missingRoles: missing("roles"),
          missingTags: missing("tags"),
        };
      })
      .sort((a, b) => a.score - b.score);
  });

  /** Categories with the worst data quality (lowest scores first). */
  const worstCategories = computed(() =>
    qualityByCategory.value.filter(c => c.score < 80).slice(0, 5)
  );

  // ── Computed: Needs Attention Files ──
  /** Files that need metadata fixes: only markdown files with missing or unknown fields, or stale. Excludes auto-generated skill files. */
  const needsAttentionFiles = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    return files.filter(f =>
      isMarkdownFile(f.path) && !isExcludedFromQuality(f) && (
        isMissingField(f.status) || isUnknownField(f.status) ||
        isMissingField(f.type) || isUnknownField(f.type) ||
        isMissingField(f.lifecycle) || isUnknownField(f.lifecycle) ||
        isMissingField(f.review_cycle) ||
        isMissingField(f.roles) ||
        isMissingField(f.tags) ||
        isMissingField(f.benefit) ||
        isStaleFile(f)
      )
    );
  });

  /** Files with explicitly unknown (not missing) status. */
  const unknownStatusFiles = computed(() => {
    return (knowledgeData.value?.files ?? []).filter(f => isUnknownField(f.status) || isMissingField(f.status));
  });

  /** Client-side aggregated missing/unknown stats for markdown files only, excluding skill modules. */
  const clientMissingStats = computed(() => {
    const files = (knowledgeData.value?.files ?? []).filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f));
    return aggregateMissingStats(files);
  });

  const attentionPct = computed(() => {
    const total = knowledgeData.value?.total ?? 1;
    return Math.round((needsAttentionFiles.value.length / total) * 100);
  });

  const totalMissingCount = computed(() => {
    const s = clientMissingStats.value;
    return s.no_status + s.no_type + s.no_lifecycle + s.no_review_cycle + s.no_roles + s.no_tags + s.no_benefit;
  });

  const totalUnknownCount = computed(() => {
    const s = clientMissingStats.value;
    return s.unknown_status + s.unknown_type + s.unknown_lifecycle;
  });

  const hasMissingItems = computed(() => totalMissingCount.value > 0);

  const hasUnknownItems = computed(() => totalUnknownCount.value > 0);

  /** Total markdown files eligible for quality checks (excludes skill modules). */
  const qualityEligibleTotal = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    return files.filter(f => isMarkdownFile(f.path) && !isExcludedFromQuality(f)).length || 1;
  });

  const statusCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_status) / total) * 100);
  });

  const typeCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_type) / total) * 100);
  });

  const lifecycleCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_lifecycle) / total) * 100);
  });

  const reviewCycleCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_review_cycle) / total) * 100);
  });

  const rolesCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_roles) / total) * 100);
  });

  const tagsCompletenessPct = computed(() => {
    const s = clientMissingStats.value;
    const total = qualityEligibleTotal.value;
    return Math.round(((total - s.no_tags) / total) * 100);
  });

  // ── Computed: Module Drill Data ──
  const moduleDrillData = computed(() => {
    const modules = knowledgeData.value?.modules ?? [];
    const files = knowledgeData.value?.files ?? [];
    const fileLookup = new Map<string, KnowledgeFileSummary[]>();
    for (const f of files) {
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
        files: (fileLookup.get(`${m.category}/${m.name}`) || []).sort((a, b) => (b.updated || "").localeCompare(a.updated || "")),
        filePage: 30,
      }));
  });

  const filteredModuleDrillData = computed(() => {
    if (!moduleDrillSearch.value) return moduleDrillData.value;
    const q = moduleDrillSearch.value.toLowerCase();
    return moduleDrillData.value.filter(m =>
      m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q)
    );
  });

  // ── Computed: Sub-categories ──
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
        reviewCoveragePct: m.review_coverage_pct,
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

  // ── Computed: Module Detail ──
  const moduleDetail = computed(() => {
    if (!activeSubCategory.value || !activeFilter.value.category) return null;
    const modules = knowledgeData.value?.modules ?? [];
    return modules.find(m => m.category === activeFilter.value.category && m.name === activeSubCategory.value) || null;
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
      reviewCoveragePct: sm.review_coverage_pct,
    }));
  });

  const topModuleFiles = computed(() => {
    if (!activeSubCategory.value || !activeFilter.value.category) return [];
    let files = (knowledgeData.value?.files ?? []).filter(
      f => f.category === activeFilter.value.category && f.module === activeSubCategory.value
    );
    if (activeFilter.value.sub_module) {
      files = files.filter(f => f.sub_module === activeFilter.value.sub_module);
    }
    return files.slice(0, 12);
  });

  // ── Computed: File Filtering ──
  const filteredFiles = computed(() => {
    let result = applyFiltersToList(knowledgeData.value?.files ?? []);
    if (activeTimeFilter.value === "today") result = result.filter(f => todayFiles.value.includes(f));
    else if (activeTimeFilter.value === "week") result = result.filter(f => weekFiles.value.includes(f));
    else if (activeTimeFilter.value === "month") result = result.filter(f => monthFiles.value.includes(f));
    if (dateFilterDay.value) result = result.filter(f => dayFiles.value.includes(f));
    if (activeSubCategory.value) {
      result = result.filter(f => f.module === activeSubCategory.value);
    }
    return result;
  });

  const drillTableData = computed(() => {
    if (viewAttentionFiles.value) {
      return needsAttentionFiles.value;
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
      if (field === "tacit") { va = va ? 1 : 0; vb = vb ? 1 : 0; }
      else if (field === "size") { va = va || 0; vb = vb || 0; }
      else if (field === "roles") { va = (va || []).length; vb = (vb || []).length; }
      else if (field === "tags") { va = (va || []).length; vb = (vb || []).length; }
      if (typeof va === "string") return order === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      return order === "asc" ? va - vb : vb - va;
    });
    return data;
  });

  const paginatedDrillFiles = computed(() => {
    const start = (drillPage.value - 1) * drillPageSize;
    return sortedDrillTableData.value.slice(start, start + drillPageSize);
  });

  const staleFiles = computed(() => {
    return (knowledgeData.value?.files ?? [])
      .filter(f => isStaleFile(f))
      .sort((a, b) => a.updated.localeCompare(b.updated));
  });

  const todayFiles = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try { return new Date(f.updated) >= today; } catch { return false; }
    });
  });

  const weekFiles = computed(() => {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try { return new Date(f.updated) >= weekAgo; } catch { return false; }
    });
  });

  const monthFiles = computed(() => {
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try { return new Date(f.updated) >= monthAgo; } catch { return false; }
    });
  });

  // ── Computed: Day Navigator ──
  /** Files updated on the selected day (dateFilterDay), regardless of other filters. */
  const dayFiles = computed(() => {
    const target = dateFilterDay.value;
    if (!target) return [];
    return (knowledgeData.value?.files ?? []).filter(f => {
      if (!f.updated) return false;
      try { return isoDate(new Date(f.updated)) === target; } catch { return false; }
    });
  });

  const isTodayFilter = computed(() => dateFilterDay.value === isoDate(new Date()));

  const dateFilterLabel = computed(() => {
    if (!dateFilterDay.value) return "All Days";
    const d = new Date(dateFilterDay.value + "T00:00:00");
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return isTodayFilter.value ? `Today · ${dateStr}` : dateStr;
  });

  // ── Computed: Selected File ──
  const selectedFileIndex = computed(() => {
    if (!selectedFile.value) return -1;
    return sortedDrillTableData.value.findIndex(f => f.path === selectedFile.value!.path);
  });

  const prevFile = computed(() => {
    if (selectedFileIndex.value <= 0) return null;
    return sortedDrillTableData.value[selectedFileIndex.value - 1];
  });

  const nextFile = computed(() => {
    if (selectedFileIndex.value < 0 || selectedFileIndex.value >= sortedDrillTableData.value.length - 1) return null;
    return sortedDrillTableData.value[selectedFileIndex.value + 1];
  });

  const resolvedRelatedFiles = computed(() => {
    if (!selectedFile.value || !selectedFile.value.related?.length) return [];
    const fileMap = new Map<string, KnowledgeFileSummary>();
    for (const f of (knowledgeData.value?.files ?? [])) fileMap.set(f.path, f);
    return selectedFile.value.related
      .map(p => fileMap.get(p) || { path: p, title: p.split("/").pop() || p } as KnowledgeFileSummary)
      .filter(Boolean);
  });

  const sameModuleCount = computed(() => {
    if (!selectedFile.value) return 0;
    return (knowledgeData.value?.files ?? []).filter(f =>
      f.category === selectedFile.value!.category && f.module === selectedFile.value!.module
    ).length;
  });

  const sameSubModuleCount = computed(() => {
    if (!selectedFile.value) return 0;
    return (knowledgeData.value?.files ?? []).filter(f =>
      f.category === selectedFile.value!.category &&
      f.module === selectedFile.value!.module &&
      f.sub_module === selectedFile.value!.sub_module
    ).length;
  });

  // ── Computed: Dialog Preview ──
  const dialogFileIndex = computed(() => {
    if (!dialogFilePath.value) return -1;
    return sortedDrillTableData.value.findIndex(f => f.path === dialogFilePath.value);
  });

  const prevDialogFile = computed(() => {
    if (dialogFileIndex.value <= 0) return null;
    return sortedDrillTableData.value[dialogFileIndex.value - 1];
  });

  const nextDialogFile = computed(() => {
    if (dialogFileIndex.value < 0 || dialogFileIndex.value >= sortedDrillTableData.value.length - 1) return null;
    return sortedDrillTableData.value[dialogFileIndex.value + 1];
  });

  // ── Computed: Drill Summary ──
  const drillSummary = computed(() => {
    const files = drillTableData.value;
    if (!files.length) return null;
    const modules = new Map<string, number>();
    const statuses = new Map<string, number>();
    const types = new Map<string, number>();
    const lifecycles = new Map<string, number>();
    for (const f of files) {
      const mod = f.module === "__root__" ? "root" : (f.module || "root");
      modules.set(mod, (modules.get(mod) || 0) + 1);
      statuses.set(normalizeMetaValue(f.status), (statuses.get(normalizeMetaValue(f.status)) || 0) + 1);
      types.set(normalizeMetaValue(f.type), (types.get(normalizeMetaValue(f.type)) || 0) + 1);
      lifecycles.set(normalizeMetaValue(f.lifecycle), (lifecycles.get(normalizeMetaValue(f.lifecycle)) || 0) + 1);
    }
    const top = (m: Map<string, number>, n: number) =>
      Array.from(m.entries()).sort((a, b) => b[1] - a[1]).slice(0, n);
    return {
      total: files.length,
      topModules: top(modules, 5),
      topStatuses: top(statuses, 4),
      topTypes: top(types, 4),
      topLifecycles: top(lifecycles, 4),
    };
  });

  // ── Computed: Category Comparison ──
  const categoryComparisonData = computed(() => {
    const cats = knowledgeData.value?.categories ?? [];
    const modules = knowledgeData.value?.modules ?? [];
    const files = knowledgeData.value?.files ?? [];
    return cats
      .map(cat => {
        const catModules = modules.filter(m => m.category === cat.name);
        const catFiles = files.filter(f => f.category === cat.name);
        const totalFiles = catFiles.length;
        const staleCount = catModules.reduce((s, m) => s + m.stale_count, 0);
        const tacitCount = catModules.reduce((s, m) => s + m.tacit_count, 0);
        const avgCoverage =
          totalFiles > 0
            ? Math.round(catModules.reduce((s, m) => s + m.review_coverage_pct * m.count, 0) / totalFiles)
            : 0;
        const completeFiles = catFiles.filter(
          f => f.status && f.type && f.type !== "unknown" && f.lifecycle && f.lifecycle !== "unknown" && f.review_cycle
        ).length;
        const qualityPct = totalFiles ? Math.round((completeFiles / totalFiles) * 100) : 0;
        const statusCounts = new Map<string, number>();
        catFiles.forEach(f => statusCounts.set(f.status, (statusCounts.get(f.status) || 0) + 1));
        const topStatus = [...statusCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 1)[0];
        const topTypeEntries = countByField(catFiles, "type").slice(0, 1);
        return {
          name: cat.name,
          files: totalFiles,
          modules: catModules.length,
          coverage: avgCoverage,
          stale: staleCount,
          tacit: tacitCount,
          quality: qualityPct,
          topStatus: topStatus?.[0] || "-",
          topType: topTypeEntries[0]?.name || "-",
        };
      })
      .sort((a, b) => b.files - a.files);
  });

  // ── Computed: Cross-Dimensional Heatmap (Status × Lifecycle) ──
  const crossStatusLifecycle = computed(() => {
    const files = activeFilter.value.category
      ? (knowledgeData.value?.files ?? []).filter(f => f.category === activeFilter.value.category)
      : (knowledgeData.value?.files ?? []);
    const map = new Map<string, number>();
    for (const f of files) {
      const key = `${f.status || "unknown"}|${f.lifecycle || "unknown"}`;
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries()).map(([key, count]) => {
      const [status, lifecycle] = key.split("|");
      return { status, lifecycle, count };
    });
  });

  // ── Computed: Stale Risk Buckets ──
  interface StaleRiskBucket {
    label: string;
    severity: "red" | "orange" | "yellow" | "blue";
    files: KnowledgeFileSummary[];
    count: number;
  }

  const staleRiskBuckets = computed((): StaleRiskBucket[] => {
    const allFiles = knowledgeData.value?.files ?? [];
    const withRisk: { file: KnowledgeFileSummary; daysUntilDue: number }[] = [];
    for (const f of allFiles) {
      const d = daysUntilDue(f);
      if (d !== null) withRisk.push({ file: f, daysUntilDue: d });
    }
    withRisk.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
    const buckets: StaleRiskBucket[] = [
      {
        label: "Overdue",
        severity: "red" as const,
        files: withRisk.filter(r => r.daysUntilDue <= 0).map(r => r.file),
        count: 0,
      },
      {
        label: "Due within 7 days",
        severity: "orange" as const,
        files: withRisk.filter(r => r.daysUntilDue > 0 && r.daysUntilDue <= 7).map(r => r.file),
        count: 0,
      },
      {
        label: "Due within 30 days",
        severity: "yellow" as const,
        files: withRisk.filter(r => r.daysUntilDue > 7 && r.daysUntilDue <= 30).map(r => r.file),
        count: 0,
      },
      {
        label: "Due within 90 days",
        severity: "blue" as const,
        files: withRisk.filter(r => r.daysUntilDue > 30 && r.daysUntilDue <= 90).map(r => r.file),
        count: 0,
      },
    ];
    return buckets.map(b => ({ ...b, count: b.files.length }));
  });

  // ── Computed: Coverage Gaps ──
  const coverageGapData = computed(() => {
    const mods = knowledgeData.value?.modules ?? [];
    const files = knowledgeData.value?.files ?? [];
    return mods
      .filter(m => m.name !== "__root__")
      .map(m => {
        const modFiles = files.filter(f => f.category === m.category && f.module === m.name);
        const noStatus = modFiles.filter(f => !f.status).length;
        const noType = modFiles.filter(f => !f.type || f.type === "unknown").length;
        const noLifecycle = modFiles.filter(f => !f.lifecycle || f.lifecycle === "unknown").length;
        const noReview = modFiles.filter(f => !f.review_cycle).length;
        const noRoles = modFiles.filter(f => !f.roles?.length).length;
        const noTags = modFiles.filter(f => !f.tags?.length).length;
        const totalGaps = noStatus + noType + noLifecycle + noReview + noRoles + noTags;
        return {
          module: `${m.category}/${m.name}`,
          category: m.category,
          name: m.name,
          fileCount: m.count,
          noStatus,
          noType,
          noLifecycle,
          noReview,
          noRoles,
          noTags,
          totalGaps,
        };
      })
      .sort((a, b) => b.totalGaps - a.totalGaps);
  });

  // ── Computed: Tag Counts (client-side) ──
  const tagCounts = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const m = new Map<string, number>();
    for (const f of files) {
      for (const t of f.tags || []) m.set(t, (m.get(t) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  const tagPairs = computed(() => {
    const files = activeFilter.value.category
      ? (knowledgeData.value?.files ?? []).filter(f => f.category === activeFilter.value.category)
      : (knowledgeData.value?.files ?? []);
    return topPairs(files, "tags", 10);
  });

  // ── Computed: Role Counts (client-side) ──
  const roleCounts = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const m = new Map<string, number>();
    for (const f of files) {
      for (const r of f.roles || []) m.set(r, (m.get(r) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  });

  const rolePairs = computed(() => {
    const files = activeFilter.value.category
      ? (knowledgeData.value?.files ?? []).filter(f => f.category === activeFilter.value.category)
      : (knowledgeData.value?.files ?? []);
    return topPairs(files, "roles", 10);
  });

  // ── Computed: Review Compliance ──
  const reviewComplianceData = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const m = new Map<string, { total: number; overdue: number }>();
    for (const f of files) {
      const rc = f.review_cycle;
      if (!rc) continue;
      if (!m.has(rc)) m.set(rc, { total: 0, overdue: 0 });
      const entry = m.get(rc)!;
      entry.total++;
      if (isStaleFile(f)) entry.overdue++;
    }
    return Array.from(m.entries())
      .map(([cycle, { total, overdue }]) => ({
        cycle,
        total,
        overdue,
        onTrack: total - overdue,
        compliance: total > 0 ? Math.round(((total - overdue) / total) * 100) : 100,
      }))
      .sort((a, b) => a.compliance - b.compliance);
  });

  // ── Computed: Stat Deltas (baseline vs filtered) ──
  const statDeltas = computed(() => {
    if (!hasActiveFilter.value) return null;
    const allFiles = knowledgeData.value?.files ?? [];
    const filtered = filteredFiles.value;
    const allModules = new Set(allFiles.map(f => `${f.category}/${f.module}`)).size;
    const filtModules = new Set(filtered.map(f => `${f.category}/${f.module}`)).size;
    const allCats = new Set(allFiles.map(f => f.category)).size;
    const filtCats = new Set(filtered.map(f => f.category)).size;
    const allStale = allFiles.filter(f => isStaleFile(f)).length;
    const filtStale = filtered.filter(f => isStaleFile(f)).length;
    const allCov = allFiles.length > 0
      ? Math.round((allFiles.filter(f => f.review_cycle).length / allFiles.length) * 100)
      : 0;
    const filtCov = filtered.length > 0
      ? Math.round((filtered.filter(f => f.review_cycle).length / filtered.length) * 100)
      : 0;
    return {
      total: { baseline: allFiles.length, filtered: filtered.length },
      modules: { baseline: allModules, filtered: filtModules },
      categories: { baseline: allCats, filtered: filtCats },
      stale: { baseline: allStale, filtered: filtStale },
      coverage: { baseline: allCov, filtered: filtCov },
    };
  });

  // ── Computed: Category Tree Data (for el-tree) ──
  const categoryTreeData = computed(() => {
    const cats = knowledgeData.value?.categories ?? [];
    const modules = knowledgeData.value?.modules ?? [];
    return cats.map(cat => ({
      id: cat.name,
      label: `${cat.name} (${cat.count})`,
      children: modules
        .filter(m => m.category === cat.name && m.name !== "__root__")
        .sort((a, b) => b.count - a.count)
        .map(m => ({
          id: `${cat.name}/${m.name}`,
          label: `${m.name} (${m.count})`,
          children: (m.sub_modules || [])
            .filter(sm => sm.name !== "__root__")
            .sort((a, b) => b.count - a.count)
            .map(sm => ({
              id: `${cat.name}/${m.name}/${sm.name}`,
              label: `${sm.name} (${sm.count})`,
            })),
        })),
    }));
  });

  // ── Computed: Search ──
  const enrichedSearchResults = computed(() => {
    const fileMap = new Map<string, KnowledgeFileSummary>();
    for (const f of (knowledgeData.value?.files ?? [])) fileMap.set(f.path, f);
    return contentSearchResults.value.map(r => {
      const file = fileMap.get(r.path);
      return { ...r, category: file?.category, module: file?.module, sub_module: file?.sub_module, status: file?.status, lifecycle: file?.lifecycle, type: file?.type };
    });
  });

  const searchSuggestions = computed(() => {
    if (!searchText.value || searchText.value.length < 2 || searchMode.value !== "title") return [];
    const q = searchText.value.toLowerCase();
    return (knowledgeData.value?.files ?? [])
      .filter(f => f.title.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
      .slice(0, 8);
  });

  // ── Computed: Chart Context ──
  const chartContextFiles = computed(() => {
    const cat = activeFilter.value.category;
    const mod = activeSubCategory.value;
    if (!cat && !mod) return null;
    let files = knowledgeData.value?.files ?? [];
    if (cat) files = files.filter(f => f.category === cat);
    if (mod) files = files.filter(f => f.module === mod);
    return files;
  });

  // ── Chart Options ──
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
    const files = ctx ?? (knowledgeData.value?.files ?? []);
    return buildSizeDist(files);
  });

  const fileAgeOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const files = ctx ?? (knowledgeData.value?.files ?? []);
    return buildFileAge(files);
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
        for (const r of (f.roles || [])) rc.set(r, (rc.get(r) || 0) + 1);
      }
      data = Array.from(rc.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
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
        for (const t of (f.tags || [])) tc.set(t, (tc.get(t) || 0) + 1);
      }
      data = Array.from(tc.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    } else {
      data = tagCounts.value;
    }
    return buildTagsBar(data, CHART_PALETTE);
  });

  // ── Computed: Metadata Completeness Chart ──
  const metadataCompletenessOption = computed<ECOption>(() => {
    const dq = knowledgeData.value?.data_quality;
    const total = knowledgeData.value?.total ?? 1;
    if (!dq) return {};
    return buildMetadataCompleteness([
      { label: "Status", pct: Math.round(((total - dq.no_status) / total) * 100), total, missing: dq.no_status },
      { label: "Type", pct: Math.round(((total - dq.no_type) / total) * 100), total, missing: dq.no_type },
      { label: "Lifecycle", pct: Math.round(((total - dq.no_lifecycle) / total) * 100), total, missing: dq.no_lifecycle },
      { label: "Review Cycle", pct: Math.round(((total - dq.no_review_cycle) / total) * 100), total, missing: dq.no_review_cycle },
      { label: "Roles", pct: Math.round(((total - dq.no_roles) / total) * 100), total, missing: dq.no_roles },
      { label: "Tags", pct: Math.round(((total - dq.no_tags) / total) * 100), total, missing: dq.no_tags },
    ]);
  });

  const tacitDonutOption = computed<ECOption>(() => {
    const ctx = chartContextFiles.value;
    const files = ctx ?? (knowledgeData.value?.files ?? []);
    const tacit = files.filter(f => f.tacit).length;
    return buildTacitDonut(tacit, files.length - tacit);
  });

  // ── Filter Methods ──
  function applyFiltersToList(files: KnowledgeFileSummary[]): KnowledgeFileSummary[] {
    const filters = activeFilter.value;
    let result = files;
    if (Object.keys(filters).length) {
      result = result.filter(f => {
        for (const [key, val] of Object.entries(filters)) {
          if (key === "stale") { if (!isStaleFile(f)) return false; }
          else if (key === "tacit") { if (!f.tacit) return false; }
          else if (key === "module") { if (f.module !== val) return false; }
          else if (key === "sub_module") { if (f.sub_module !== val) return false; }
          else if (key === "size_min") { if ((f.size ?? 0) < Number(val)) return false; }
          else if (key === "size_max") { if ((f.size ?? 0) >= Number(val)) return false; }
          else if (key === "age_min_days") {
            const d = daysSinceUpdated(f.updated);
            if (d === null || d < Number(val)) return false;
          }
          else if (key === "age_max_days") {
            const d = daysSinceUpdated(f.updated);
            if (d === null || d >= Number(val)) return false;
          }
          else if (key === "role") { if (!f.roles?.includes(val)) return false; }
          else if (key === "tag") { if (!f.tags?.includes(val)) return false; }
          else if (key === "review_cycle") {
            if (val === "__missing__") { if (f.review_cycle) return false; }
            else if (!val) { if (!f.review_cycle) return false; }
            else { if (f.review_cycle !== val) return false; }
          } else if (key === "status" || key === "type" || key === "lifecycle" || key === "tags" || key === "roles" || key === "benefit") {
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
    if (searchText.value) {
      const q = searchText.value.toLowerCase();
      result = result.filter(f => f.title.toLowerCase().includes(q) || f.path.toLowerCase().includes(q));
    }
    return result;
  }

  function setFilter(key: string, val: string) {
    // Push current state to history before mutating
    const prev = { ...activeFilter.value };
    const next = { ...activeFilter.value };
    if (next[key] === val && val !== "") { delete next[key]; }
    else { next[key] = val; }
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      filterHistory.value = [...filterHistory.value.slice(-(MAX_HISTORY - 1)), prev];
    }
    activeFilter.value = next;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    browseAllFiles.value = false;
    selectedFile.value = null;
    chartPulseKey.value++;
    pulsingCard.value = "";
    setTimeout(() => {
      drillHighlight.value = true;
      scrollToDrillDown();
      setTimeout(() => { drillHighlight.value = false; }, 1500);
    }, 100);
  }

  /** Undo the last filter change. */
  function undoLastFilter() {
    const prev = filterHistory.value.pop();
    if (prev) {
      activeFilter.value = prev;
      activeSubCategory.value = "";
      drillView.value = "all";
      drillPage.value = 1;
      selectedFile.value = null;
      chartPulseKey.value++;
      setTimeout(() => scrollToDrillDown(), 100);
    }
  }

  /** Navigate from tree node click: set category/module/sub_module filters. */
  function selectTreeNode(category: string, module?: string, sub_module?: string) {
    const next: Record<string, string> = { category };
    if (module) next.module = module;
    if (sub_module) next.sub_module = sub_module;
    activeFilter.value = next;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    browseAllFiles.value = false;
    selectedFile.value = null;
    chartPulseKey.value++;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  /** Remove a single filter key entirely. */
  function removeFilter(key: string) {
    const next = { ...activeFilter.value };
    delete next[key];
    activeFilter.value = next;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    browseAllFiles.value = false;
    selectedFile.value = null;
    chartPulseKey.value++;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function pulseCard(cardKey: string) {
    pulsingCard.value = cardKey;
    setTimeout(() => { pulsingCard.value = ""; }, 400);
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
    searchText.value = "";
    activeTimeFilter.value = "";
    browseAllFiles.value = false;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  /** Filter to files missing a specific metadata field. For status/type/lifecycle, filters to truly missing (not literal "unknown"). */
  function setQualityFilter(field: string) {
    forceFileTableView();
    if (field === "status" || field === "type" || field === "lifecycle") {
      // Use __missing__ to catch files where the field is truly empty
      // (the backend data_quality.no_* counts are about missing values, not literal "unknown")
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

  function showAllAttentionFiles() {
    clearAllFilters();
    viewAttentionFiles.value = true;
    viewMode.value = "files";
    fileViewMode.value = "table";
    drillPage.value = 1;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function clearAllFilters() {
    activeFilter.value = {};
    activeSubCategory.value = "";
    drillView.value = "all";
    viewMode.value = "files";
    drillPage.value = 1;
    searchText.value = "";
    activeTimeFilter.value = "";
    dateFilterDay.value = null;
    browseAllFiles.value = false;
    viewAttentionFiles.value = false;
    searchMode.value = "title";
    contentSearchResults.value = [];
    selectedFile.value = null;
    dialogFilePath.value = "";
    expandedModuleKeys.value = [];
    moduleDrillSearch.value = "";
    chartPulseKey.value++;
    pulsingCard.value = "";
    drillHighlight.value = false;
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
    activeFilter.value = { category: cat, module: mod, ...(subdir !== "__root__" ? { sub_module: subdir } : {}) };
    drillPage.value = 1;
  }

  function onModuleExpandChange(_row: any, expandedRows: any) {
    expandedModuleKeys.value = (expandedRows || []).map((r: any) => r.key);
  }

  async function navigateToModule(catName: string, moduleName: string) {
    clearAllFilters();
    viewMode.value = "modules";
    moduleDrillSearch.value = moduleName;
    await new Promise(r => setTimeout(r, 50));
    const target = moduleDrillData.value.find(m => m.name === moduleName && m.category === catName);
    if (target) {
      expandedModuleKeys.value = [target.key];
      await new Promise(r => setTimeout(r, 50));
      moduleTableRef.value?.$el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function crossFilterSubModule(moduleName: string, dim: string, val: string) {
    const cat = activeFilter.value.category;
    activeSubCategory.value = moduleName;
    activeFilter.value = { [dim]: val, ...(cat ? { category: cat } : {}) };
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    activeTimeFilter.value = "";
    browseAllFiles.value = false;
  }

  function resetDrillState() {
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    browseAllFiles.value = false;
    selectedFile.value = null;
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
    const base = dateFilterDay.value ? new Date(dateFilterDay.value + "T00:00:00") : new Date();
    base.setDate(base.getDate() + offset);
    setDateFilterDay(isoDate(base));
  }

  function goToPrevDay() { shiftDateFilterDay(-1); }
  function goToNextDay() { shiftDateFilterDay(1); }
  function goToTodayFilter() { setDateFilterDay(isoDate(new Date())); }
  function clearDateFilter() { setDateFilterDay(null); }

  function onTableSortChange({ prop, order }: { prop: string | null; order: string | null; column?: any }) {
    if (order && prop) {
      sortField.value = prop;
      sortOrder.value = order === "ascending" ? "asc" : "desc";
    } else {
      sortField.value = "updated";
      sortOrder.value = "desc";
    }
    drillPage.value = 1;
  }

  function scrollToDrillDown() {
    drillDownRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // ── File Preview ──
  function openFilePreview(row: KnowledgeFileSummary) {
    selectedFile.value = row;
    addRecentlyViewed(row);
  }

  function addRecentlyViewed(row: KnowledgeFileSummary) {
    recentlyViewed.value = [
      row,
      ...recentlyViewed.value.filter(f => f.path !== row.path),
    ].slice(0, MAX_RECENTLY_VIEWED);
    saveJson(RECENTLY_VIEWED_KEY, recentlyViewed.value);
  }

  function clearRecentlyViewed() {
    recentlyViewed.value = [];
    saveJson(RECENTLY_VIEWED_KEY, []);
  }

  function openFileInDialog(row: KnowledgeFileSummary) {
    dialogFilePath.value = row.path;
    addRecentlyViewed(row);
    // previewDialogRef is handled by the template via ref
    return row.path;
  }

  function navigateDialogFile(direction: "prev" | "next") {
    const target = direction === "prev" ? prevDialogFile.value : nextDialogFile.value;
    if (target) return openFileInDialog(target);
  }

  function navigateToFile(file: KnowledgeFileSummary) {
    selectedFile.value = file;
    const idx = sortedDrillTableData.value.findIndex(f => f.path === file.path);
    if (idx >= 0) {
      const page = Math.floor(idx / drillPageSize) + 1;
      if (page !== drillPage.value) drillPage.value = page;
    }
  }

  function resolveRelatedNames(row: KnowledgeFileSummary): { path: string; title: string }[] {
    if (!row.related?.length) return [];
    const fileMap = new Map<string, KnowledgeFileSummary>();
    for (const f of (knowledgeData.value?.files ?? [])) fileMap.set(f.path, f);
    return row.related.slice(0, 8).map(p => {
      const found = fileMap.get(p);
      return { path: p, title: found?.title || p.split("/").pop() || p };
    });
  }

  function getModuleStats(cat: string, mod: string): KnowledgeModuleStats | undefined {
    return (knowledgeData.value?.modules ?? []).find(m => m.category === cat && m.name === mod);
  }

  // ── AI Chat Bridge ──
  async function discussInAiChat(row: KnowledgeFileSummary) {
    if (!row.path) return;
    await openInAiChat({
      title: row.title || row.path.split("/").pop() || "Knowledge file",
      pageContent: `File: ${row.path}\nCategory: ${row.category}\nModule: ${row.module}\nStatus: ${row.status}\nLifecycle: ${row.lifecycle}\nType: ${row.type}`,
      tags: [`ctx:${row.path}`, `file:${row.path}`, "knowledge", `cat:${row.category}`, `mod:${row.module}`],
      sourceUrl: `/dashboard/knowledgeBase`,
    });
  }

  /** Open aiChat with a pre-filled prompt to fix missing metadata on the filtered files. */
  async function fixMetadataWithAgent() {
    const dq = knowledgeData.value?.data_quality;
    const files = needsAttentionFiles.value.slice(0, 20);
    const missingSummary = [
      dq?.no_status ? `- ${dq.no_status} files missing status` : "",
      dq?.no_type ? `- ${dq.no_type} files missing type` : "",
      dq?.no_lifecycle ? `- ${dq.no_lifecycle} files missing lifecycle` : "",
      dq?.no_review_cycle ? `- ${dq.no_review_cycle} files missing review_cycle` : "",
      dq?.no_roles ? `- ${dq.no_roles} files missing roles` : "",
      dq?.no_tags ? `- ${dq.no_tags} files missing tags` : "",
      dq?.no_benefit ? `- ${dq.no_benefit} files missing benefit` : "",
    ].filter(Boolean).join("\n");
    const fileList = files.map(f => `- ${f.path} (missing: ${fileHealthIssues(f).join(", ")})`).join("\n");
    await openInAiChat({
      title: "Fix knowledge base metadata",
      pageContent: `Help me fix missing metadata in the knowledge base.\n\nCurrent Data Quality: ${dataQualityScore.value}%\n\nMissing fields:\n${missingSummary}\n\nAffected files (first ${files.length}):\n${fileList}\n\nFor each file, read its content, determine appropriate frontmatter values, and use db_update on the knowledge_files collection to add the missing fields.`,
      tags: ["knowledge", "metadata-fix", "data-quality"],
      sourceUrl: `/dashboard/knowledgeBase`,
    });
  }

  async function discussSearchResult(r: { path: string; title: string; category?: string; module?: string }) {
    await openInAiChat({
      title: r.title || r.path.split("/").pop() || "Search result",
      pageContent: `File: ${r.path}\nCategory: ${r.category || ""}\nModule: ${r.module || ""}`,
      tags: [`ctx:${r.path}`, `file:${r.path}`, "knowledge", `cat:${r.category || ""}`, `mod:${r.module || ""}`],
      sourceUrl: `/dashboard/knowledgeBase`,
    });
  }

  // ── CSV Export ──
  function exportCSV() {
    const data = sortedDrillTableData.value;
    if (!data.length) return;
    const headers = ["title", "path", "category", "module", "sub_module", "status", "lifecycle", "type", "review_cycle", "tacit", "roles", "tags", "benefit", "related_count", "size", "updated"];
    const rows = data.map(f => headers.map(h => {
      const v = (f as any)[h];
      if (Array.isArray(v)) return v.join("; ");
      if (h === "tacit") return v ? "Y" : "";
      return v ?? "";
    }));
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `knowledge-files-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Content Search ──
  async function doContentSearch() {
    if (!searchText.value || searchText.value.length < 2) {
      contentSearchResults.value = [];
      return;
    }
    contentSearchLoading.value = true;
    try {
      const res = await searchKnowledge(searchText.value, activeFilter.value.category, 50);
      contentSearchResults.value = res.data.results;
      browseAllFiles.value = false;
    } finally {
      contentSearchLoading.value = false;
    }
  }

  let contentSearchTimer: ReturnType<typeof setTimeout> | null = null;
  function onSearchInput() {
    if (searchMode.value === "content") {
      if (contentSearchTimer) clearTimeout(contentSearchTimer);
      contentSearchTimer = setTimeout(() => doContentSearch(), 300);
    }
  }

  // Chart drill-down always lands on the file table view (not module
  // classification / gallery / content search), so the filtered rows are visible.
  function forceFileTableView() {
    viewMode.value = "files";
    fileViewMode.value = "table";
    searchMode.value = "title";
    contentSearchResults.value = [];
    activeTimeFilter.value = "";
  }

  // Reset navigation state after a chart drill and scroll to the drill-down panel.
  function resetChartDrill() {
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    browseAllFiles.value = false;
    selectedFile.value = null;
    forceFileTableView();
    setTimeout(() => scrollToDrillDown(), 100);
  }

  // ── Chart Click Drill ──
  function onChartClick(dimension: string, event: any) {
    const name = typeof event?.name === "string" && event.name ? event.name : event?.data?.name;
    if (typeof name !== "string" || !name) return;

    // Top Modules: replace filter with { category, module } so the breadcrumb path is coherent
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

    // File Size: click a bucket → size_min / size_max filter
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

    // File Age: click a bucket → age_min_days / age_max_days filter
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

    // Tacit knowledge donut: "Tacit" → filter tacit=true, "Explicit" → clear
    if (dimension === "tacit") {
      if (name === "Tacit") setFilter("tacit", "true");
      else removeFilter("tacit");
      forceFileTableView();
      return;
    }

    // Field-based charts: status / type / lifecycle / role / review_cycle / category.
    // Review cycle's "__missing__" segment filters files without a review_cycle.
    setFilter(dimension, name);
    forceFileTableView();
  }

  // ── Keyboard ──
  function onGlobalKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      const input = (drillDownRef.value?.querySelector(".el-input__inner") as HTMLInputElement | null);
      input?.focus();
    }
  }

  function onDetailKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" && prevFile.value) {
      e.preventDefault();
      navigateToFile(prevFile.value);
    } else if (e.key === "ArrowRight" && nextFile.value) {
      e.preventDefault();
      navigateToFile(nextFile.value);
    }
  }

  // ── Data Fetching ──
  async function fetchData() {
    try {
      loading.value = true;
      const res = await getKnowledgeStats();
      knowledgeData.value = res.data;
      lastUpdated.value = new Date().toLocaleTimeString();
    } finally { loading.value = false; }
  }

  // ── Watchers ──
  watch(selectedFile, async (f) => {
    fileContent.value = "";
    showFileContent.value = false;
    if (!f?.path) return;
    fileContentLoading.value = true;
    try {
      const res = await readKnowledgeFile(f.path);
      fileContent.value = res.content || "";
      showFileContent.value = true;
    } catch { fileContent.value = ""; }
    finally { fileContentLoading.value = false; }
    setTimeout(() => detailPanelRef.value?.focus(), 50);
  });

  // ── Delete ──
  async function deleteFile(file: any) {
    const { ElMessageBox, ElMessage } = await import("element-plus");
    try {
      await ElMessageBox.confirm(
        `Delete "${file.title || file.path.split("/").pop()}"? This action cannot be undone.`,
        "Delete knowledge file",
        { confirmButtonText: "Delete", cancelButtonText: "Cancel", type: "warning" }
      );
    } catch {
      return; // user cancelled
    }
    try {
      const res = await deleteKnowledgeFile(file.path);
      if (res.deleted) {
        ElMessage.success(`Deleted: ${file.path}`);
      } else {
        ElMessage.info(`File not found (may already be removed): ${file.path}`);
      }
      // If the deleted file is the current selection, clear it
      if (selectedFile.value?.path === file.path) {
        selectedFile.value = null;
      }
      // Refresh the full dataset
      await fetchData();
    } catch (e: any) {
      ElMessage.error(e?.message || "Delete failed");
    }
  }

  // ── Lifecycle ──
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

  // ── Return ──
  return {
    // State
    knowledgeData, loading, lastUpdated,
    activeFilter, activeSubCategory, drillView, viewMode, drillPage, drillPageSize,
    searchText, sortField, sortOrder, activeTimeFilter, dateFilterDay, browseAllFiles,
    searchMode, contentSearchResults, contentSearchLoading,
    selectedFile, showBenefitCol, fileViewMode,
    showSearchSuggestions, moduleDrillSearch, expandedModuleKeys, moduleTableRef,
    fileContent, fileContentLoading, showFileContent,
    dialogFilePath, recentlyViewed,
    drillDownRef, detailPanelRef,
    chartPulseKey, drillHighlight, pulsingCard,
    showCategoryComparison, showCrossHeatmap, showStaleRisk, showCoverageGaps,
    showTreeView, showTagCloud, showRoleCloud, showReviewCompliance, showKnowledgeGraph, showAttentionDetail,
    filterHistory, viewAttentionFiles,
    // Cross-filter
    ...xf,
    // Computed
    hasActiveFilter, showSubModuleGrid, isShowingTreeView,
    topCategory, tacitPct, topRole, totalModules, recentWeekCount, recentWeekPct, stalePct, clientReviewCoveragePct,
    dataQualityScore, missingMetadataCount,
    qualityEligibleTotal, qualityByCategory, worstCategories,
    needsAttentionFiles, unknownStatusFiles, clientMissingStats,
    attentionPct, totalMissingCount, totalUnknownCount, hasMissingItems, hasUnknownItems,
    statusCompletenessPct, typeCompletenessPct, lifecycleCompletenessPct,
    reviewCycleCompletenessPct, rolesCompletenessPct, tagsCompletenessPct,
    moduleDrillData, filteredModuleDrillData,
    subCategories, categoryReviewCoverage, categoryStaleCount, categoryTacitCount,
    moduleDetail, subdirectoryBreakdown, topModuleFiles,
    filteredFiles, drillTableData, sortedDrillTableData, paginatedDrillFiles,
    staleFiles, todayFiles, weekFiles, monthFiles, dayFiles, isTodayFilter, dateFilterLabel,
    selectedFileIndex, prevFile, nextFile, resolvedRelatedFiles,
    sameModuleCount, sameSubModuleCount,
    dialogFileIndex, prevDialogFile, nextDialogFile,
    drillSummary,
    enrichedSearchResults, searchSuggestions,
    categoryComparisonData, crossStatusLifecycle, staleRiskBuckets, coverageGapData,
    tagCounts, tagPairs, roleCounts, rolePairs,
    reviewComplianceData, statDeltas,
    categoryTreeData,
    chartContextFiles,
    // Chart options
    reviewCycleDonutOption, typeBarOption, statusBarOption,
    sizeDistOption, fileAgeOption, lifecycleBarOption,
    moduleBarOption, rolesBarOption, categoryBarOption, tagsBarOption,
    metadataCompletenessOption, tacitDonutOption,
    // Methods
    setFilter, removeFilter, undoLastFilter, selectTreeNode,
    pulseCard, toggleNoReviewFilter, setQualityFilter,
    backToCategory, clearAllFilters, showAllAttentionFiles,
    drillToModule, drillToSubdir, drillFromModule, onModuleExpandChange,
    navigateToModule, crossFilterSubModule,
    onTimeFilterChange, onTableSortChange, scrollToDrillDown,
    goToPrevDay, goToNextDay, goToTodayFilter, clearDateFilter,
    openFilePreview, addRecentlyViewed, clearRecentlyViewed,
    openFileInDialog, navigateDialogFile, navigateToFile,
    resolveRelatedNames, getModuleStats,
    discussInAiChat, discussSearchResult, fixMetadataWithAgent,
    deleteFile,
    exportCSV, onSearchInput, onChartClick,
    onDetailKeydown, fetchData,
    // Re-exported utils (used in template)
    formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
    isStaleFile, fileHealthLevel, fileHealthIssues, countByField, countByFieldWithMissing,
    getModuleClassSummary, isMissingField, isUnknownField, normalizeMetaValue, MISSING_LABEL,
    isMarkdownFile, isExcludedFromQuality,
    catColor, statusColor, statusTagType, lifecycleColor, lifecycleTagType, reviewCycleTagType,
    dataQualityColor, daysUntilDue, moduleHealthScore, FILTER_LABEL_MAP,
    qualityCardClass,
  };
}