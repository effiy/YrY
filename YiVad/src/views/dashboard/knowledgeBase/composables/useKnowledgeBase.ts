/**
 * Knowledge base dashboard composable — all reactive state, computeds, and actions.
 * Extracted from the page component so index.vue stays an orchestrator.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { getKnowledgeStats, searchKnowledge } from "@/api/modules/dashboard";
import type { KnowledgeStatsData, KnowledgeFileSummary, KnowledgeModuleStats } from "@/api/interface/yiweb";
import type { ECOption } from "@/components/ECharts/config";
import { useAiChatBridge } from "@/hooks/useAiChatBridge";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import {
  buildReviewCycleDonut, buildTypeBar, buildStatusBar, buildSizeDist,
  buildFileAge, buildLifecycleBar, buildModuleBar, buildRolesBar,
  buildClassificationHeatmap, CHART_PALETTE,
} from "../charts";
import {
  formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
  isStaleFile, fileHealthLevel, countByField, getModuleClassSummary,
  catColor, statusColor, statusTagType, lifecycleColor, lifecycleTagType, reviewCycleTagType,
} from "../utils";

const { openInAiChat } = useAiChatBridge();

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

  // ── File Content Preview ──
  const fileContent = ref("");
  const fileContentLoading = ref(false);
  const showFileContent = ref(false);

  // ── Dialog Preview ──
  const dialogFilePath = ref("");
  const recentlyViewed = ref<KnowledgeFileSummary[]>([]);
  const MAX_RECENTLY_VIEWED = 10;

  // ── Refs for template ──
  const drillDownRef = ref<HTMLElement | null>(null);
  const detailPanelRef = ref<HTMLElement | null>(null);

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
    return new Set(modules.filter(m => m.name !== "__root__").map(m => `${m.category}/${m.name}`)).size;
  });

  const totalSizeFormatted = computed(() => {
    const files = knowledgeData.value?.files ?? [];
    const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
    if (totalBytes < 1024) return totalBytes + " B";
    if (totalBytes < 1048576) return (totalBytes / 1024).toFixed(1) + " KB";
    return (totalBytes / 1048576).toFixed(1) + " MB";
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
      .filter(m => m.name !== "__root__")
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
    if (activeSubCategory.value) {
      result = result.filter(f => f.module === activeSubCategory.value);
    }
    return result;
  });

  const drillTableData = computed(() => {
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
      statuses.set(f.status || "unknown", (statuses.get(f.status) || 0) + 1);
      types.set(f.type || "unknown", (types.get(f.type) || 0) + 1);
      lifecycles.set(f.lifecycle || "unknown", (lifecycles.get(f.lifecycle) || 0) + 1);
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

  // ── Computed: File Classification Stats ──
  const fileClassificationStats = computed(() => {
    const files = drillTableData.value;
    const countBy = (field: string) => {
      const m = new Map<string, number>();
      for (const f of files) {
        const v = (f as any)[field] || "unknown";
        if (v === "__root__") continue;
        m.set(v, (m.get(v) || 0) + 1);
      }
      return Array.from(m.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6);
    };
    return {
      statuses: countBy("status"),
      types: countBy("type"),
      lifecycles: countBy("lifecycle"),
      reviewCycles: countBy("review_cycle"),
    };
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

  const classificationHeatmapOption = computed<ECOption>(() => {
    const modules = knowledgeData.value?.modules ?? [];
    return buildClassificationHeatmap(modules, activeFilter.value.category);
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
          else if (key === "role") { if (!f.roles?.includes(val)) return false; }
          else if (key === "tag") { if (!f.tags?.includes(val)) return false; }
          else if (key === "review_cycle") {
            if (val === "__missing__") { if (f.review_cycle) return false; }
            else if (!val) { if (!f.review_cycle) return false; }
            else { if (f.review_cycle !== val) return false; }
          } else if (key === "status" || key === "type" || key === "tags" || key === "roles") {
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
    if (activeFilter.value[key] === val && val !== "") delete activeFilter.value[key];
    else activeFilter.value[key] = val;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    browseAllFiles.value = false;
    selectedFile.value = null;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function toggleNoReviewFilter() {
    if (activeFilter.value.review_cycle === "__missing__") delete activeFilter.value.review_cycle;
    else activeFilter.value.review_cycle = "__missing__";
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    activeTimeFilter.value = "";
    browseAllFiles.value = false;
    setTimeout(() => scrollToDrillDown(), 100);
  }

  function backToCategory() {
    const cat = activeFilter.value.category;
    activeFilter.value = cat ? { category: cat } : {};
    activeSubCategory.value = "";
    drillPage.value = 1;
  }

  function removeFilter(key: string) {
    delete activeFilter.value[key];
    activeSubCategory.value = "";
    drillPage.value = 1;
  }

  function clearAllFilters() {
    activeFilter.value = {};
    activeSubCategory.value = "";
    drillView.value = "all";
    viewMode.value = "files";
    drillPage.value = 1;
    searchText.value = "";
    activeTimeFilter.value = "";
    browseAllFiles.value = false;
    searchMode.value = "title";
    contentSearchResults.value = [];
    selectedFile.value = null;
    dialogFilePath.value = "";
    expandedModuleKeys.value = [];
    moduleDrillSearch.value = "";
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
      delete activeFilter.value.sub_module;
    } else {
      activeFilter.value.sub_module = subdir;
    }
    drillPage.value = 1;
  }

  function drillFromModule(cat: string, mod: string, subdir: string) {
    activeFilter.value = { category: cat, module: mod };
    if (subdir !== "__root__") activeFilter.value.sub_module = subdir;
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
    activeFilter.value = { [dim]: val };
    if (cat) activeFilter.value.category = cat;
    drillView.value = "all";
    drillPage.value = 1;
    searchText.value = "";
    activeTimeFilter.value = "";
    browseAllFiles.value = false;
  }

  function toggleTimeFilter(period: string) {
    activeTimeFilter.value = activeTimeFilter.value === period ? "" : period;
    activeSubCategory.value = "";
    drillView.value = "all";
    drillPage.value = 1;
    browseAllFiles.value = false;
    setTimeout(() => scrollToDrillDown(), 100);
  }

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
  }

  function clearRecentlyViewed() { recentlyViewed.value = []; }

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

  // ── Heatmap Click ──
  function onHeatmapClick(event: any) {
    const d = event.data;
    if (!d || d.length < 3) return;
    const modules = knowledgeData.value?.modules ?? [];
    const cat = activeFilter.value.category;
    let filtered = modules.filter(m => m.name !== "__root__");
    if (cat) filtered = filtered.filter(m => m.category === cat);
    const topMods = filtered.sort((a, b) => b.count - a.count).slice(0, 12);
    const modName = topMods[d[0]]?.name;
    const statusSet = new Set<string>();
    for (const m of topMods) {
      for (const s of (m.statuses || [])) statusSet.add(s.name);
    }
    const statuses = Array.from(statusSet).sort();
    const statusName = statuses[d[1]];
    if (modName && statusName) {
      navigateToModule(cat || topMods[d[0]]?.category || "", modName);
      setFilter("status", statusName);
    }
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

  // ── Lifecycle ──
  onMounted(async () => {
    await fetchData();
    document.addEventListener("keydown", onGlobalKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("keydown", onGlobalKeydown);
  });

  // ── Return ──
  return {
    // State
    knowledgeData, loading, lastUpdated,
    activeFilter, activeSubCategory, drillView, viewMode, drillPage, drillPageSize,
    searchText, sortField, sortOrder, activeTimeFilter, browseAllFiles,
    searchMode, contentSearchResults, contentSearchLoading,
    selectedFile, showBenefitCol, fileViewMode,
    showSearchSuggestions, moduleDrillSearch, expandedModuleKeys, moduleTableRef,
    fileContent, fileContentLoading, showFileContent,
    dialogFilePath, recentlyViewed,
    drillDownRef, detailPanelRef,
    // Computed
    hasActiveFilter, showSubModuleGrid, isShowingTreeView,
    topCategory, tacitPct, topRole, totalModules, totalSizeFormatted,
    moduleDrillData, filteredModuleDrillData,
    subCategories, categoryReviewCoverage, categoryStaleCount, categoryTacitCount,
    moduleDetail, subdirectoryBreakdown, topModuleFiles,
    filteredFiles, drillTableData, sortedDrillTableData, paginatedDrillFiles,
    staleFiles, todayFiles, weekFiles, monthFiles,
    selectedFileIndex, prevFile, nextFile, resolvedRelatedFiles,
    sameModuleCount, sameSubModuleCount,
    dialogFileIndex, prevDialogFile, nextDialogFile,
    drillSummary, fileClassificationStats,
    enrichedSearchResults, searchSuggestions,
    // Chart options
    reviewCycleDonutOption, typeBarOption, statusBarOption,
    sizeDistOption, fileAgeOption, lifecycleBarOption,
    moduleBarOption, rolesBarOption, classificationHeatmapOption,
    // Methods
    setFilter, toggleNoReviewFilter, backToCategory, removeFilter, clearAllFilters,
    drillToModule, drillToSubdir, drillFromModule, onModuleExpandChange,
    navigateToModule, crossFilterSubModule,
    toggleTimeFilter, onTableSortChange, scrollToDrillDown,
    openFilePreview, addRecentlyViewed, clearRecentlyViewed,
    openFileInDialog, navigateDialogFile, navigateToFile,
    resolveRelatedNames, getModuleStats,
    discussInAiChat, discussSearchResult,
    exportCSV, doContentSearch, onSearchInput, onHeatmapClick,
    onDetailKeydown, fetchData,
    // Re-exported utils (used in template)
    formatNumber, formatFileSize, formatRelativeTime, highlightSnippet,
    isStaleFile, fileHealthLevel, countByField, getModuleClassSummary,
    catColor, statusColor, statusTagType, lifecycleColor, lifecycleTagType, reviewCycleTagType,
  };
}