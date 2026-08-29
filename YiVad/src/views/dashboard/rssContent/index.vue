<template>
  <div class="rss-content-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">RSS Content Overview</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button size="small" :icon="Setting" @click="goManageFeeds">Manage Feeds</el-button>
          <el-button :icon="Refresh" size="small" @click="refreshAll" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-total" @click="clearAllFilters">
              <div class="stat-icon"><el-icon><Reading /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.total ?? 0 }}</div>
                <div class="stat-label">Total Articles</div>
                <div class="stat-sub">{{ avgArticlesPerSource }} avg / source</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-sources">
              <div class="stat-icon"><el-icon><Connection /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.sources.length ?? 0 }}</div>
                <div class="stat-label">RSS Sources</div>
                <div class="stat-sub">{{ topSourceName }} leads</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-categories">
              <div class="stat-icon"><el-icon><Collection /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.categories.length ?? 0 }}</div>
                <div class="stat-label">Categories</div>
                <div class="stat-sub">{{ avgArticlesPerCategory }} avg / category</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-missing">
              <div class="stat-icon"><el-icon><WarningFilled /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ rssData?.body_missing ?? 0 }}</div>
                <div class="stat-label">No Body</div>
                <div class="stat-sub">{{ bodyMissingPct }}% metadata-only</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card chart-row">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">
              Source Distribution
              <span class="chart-hint">click to filter</span>
            </div>
            <div class="chart-body">
              <ECharts :option="sourcePieOption" @chartClick="onSourceChartClick" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">
              Category Distribution
              <span class="chart-hint">click to filter</span>
            </div>
            <div class="chart-body">
              <ECharts :option="categoryBarOption" @chartClick="onCategoryChartClick" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card articles-box">
      <div class="articles-header">
        <div class="articles-title">
          Articles
          <span class="articles-count">{{ total }}</span>
        </div>
        <div class="articles-toolbar">
          <el-input
            v-model="search"
            class="toolbar-search"
            :prefix-icon="Search"
            placeholder="Search title / author"
            clearable
            @input="onSearchInput"
          />
          <el-select v-model="sourceFilter" class="toolbar-select" placeholder="All sources" clearable filterable @change="onFilterChange">
            <el-option v-for="s in rssData?.sources ?? []" :key="s.name" :label="`${s.name} (${s.count})`" :value="s.name" />
          </el-select>
          <el-select v-model="categoryFilter" class="toolbar-select" placeholder="All categories" clearable filterable @change="onFilterChange">
            <el-option v-for="c in rssData?.categories ?? []" :key="c.name" :label="`${c.name} (${c.count})`" :value="c.name" />
          </el-select>
          <el-radio-group v-model="quickRange" size="small" @change="onQuickRangeChange">
            <el-radio-button value="all">All</el-radio-button>
            <el-radio-button value="today">Today</el-radio-button>
            <el-radio-button value="7d">7 days</el-radio-button>
            <el-radio-button value="30d">30 days</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <div class="filter-pills" v-if="activeFilters.length">
        <el-tag
          v-for="f in activeFilters"
          :key="f.key"
          class="filter-pill"
          closable
          :type="f.type"
          @close="clearFilter(f.key)"
        >
          {{ f.label }}
        </el-tag>
        <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="articles"
        stripe
        size="small"
        max-height="560"
        empty-text="No articles match the current filters"
        @sort-change="onSortChange"
      >
        <el-table-column label="Title" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="article-title" @click="openDetail(row as RssItemDocument)">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Source" width="160" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="source-badge" :style="{ background: sourceColor(row.source_name) }">{{ row.source_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="Category" width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag v-if="row.category_path" size="small" class="chip-chip" @click="setCategoryFilter(row.category_path)">{{ row.category_path }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Tags" width="200">
          <template #default="{ row }">
            <template v-if="row.tags?.length">
              <el-tag
                v-for="t in (row.tags || []).slice(0, 3)"
                :key="t"
                size="small"
                effect="plain"
                class="tag-chip"
                @click="setTagFilter(t)"
              >
                {{ t }}
              </el-tag>
            </template>
            <span v-else class="cell-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="Published" width="120" prop="published_parsed" sortable="custom">
          <template #default="{ row }">
            <span class="cell-date">{{ formatDate(row.published) }}</span>
          </template>
        </el-table-column>
        <el-table-column width="100" align="right">
          <template #default="{ row }">
            <el-button size="small" text type="primary" @click="openDetail(row as RssItemDocument)">Read</el-button>
            <el-tooltip content="Open original" placement="top">
              <el-button size="small" text @click="openOriginal(row as RssItemDocument)">
                <el-icon><TopRight /></el-icon>
              </el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadArticles"
          @size-change="onSizeChange"
        />
      </div>
    </div>

    <el-drawer v-model="detailVisible" :title="detail?.title ?? ''" size="56%" destroy-on-close>
      <template v-if="detail">
        <div class="detail-meta">
          <span class="source-badge" :style="{ background: sourceColor(detail.source_name) }">{{ detail.source_name }}</span>
          <el-tag v-if="detail.category_path" size="small" class="chip-chip">{{ detail.category_path }}</el-tag>
          <span class="detail-meta-item" v-if="detail.author">By {{ detail.author }}</span>
          <span class="detail-meta-item" v-if="detail.published">{{ formatDate(detail.published) }}</span>
        </div>
        <div class="detail-actions">
          <el-button type="primary" :icon="TopRight" @click="openOriginal(detail)">Open Original</el-button>
          <el-button :icon="CopyDocument" @click="copyLink(detail)">Copy Link</el-button>
          <el-button v-if="detail.category_path" :icon="FolderOpened" @click="goToRoleManager(detail.category_path)">View Feeds</el-button>
        </div>
        <div class="detail-tags" v-if="detail.tags?.length">
          <el-tag v-for="t in detail.tags || []" :key="t" size="small" effect="plain" class="tag-chip">{{ t }}</el-tag>
        </div>
        <el-divider />
        <div class="detail-body" v-loading="detailLoading">
          <div v-if="detailBodyMissing && !detailHtml" class="detail-body__notice">
            <span>📭 Body file missing — metadata-only record</span>
            <span v-if="detail.file_path" class="detail-body__notice-path">{{ detail.file_path }}</span>
          </div>
          <div v-if="detailHtml" class="detail-body__markdown markdown-body" v-html="detailHtml" />
          <div v-else-if="detailSummary" class="detail-body__summary">{{ detailSummary }}</div>
          <el-empty v-else-if="!detailBodyMissing" description="No content — open the original article." />
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts" name="rssContent">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import { Reading, Connection, Collection, Calendar, Refresh, Search, TopRight, CopyDocument, Setting, FolderOpened, WarningFilled } from "@element-plus/icons-vue";
import { getRssStats } from "@/api/modules/dashboard";
import { getRssList, type RssItemDocument } from "@/api/modules/rssService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import type { RssStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import type { ECElementEvent } from "echarts/core";
import ECharts from "@/components/ECharts/index.vue";

const { render: renderMarkdown } = useMarkdown();
const router = useRouter();

const rssData = ref<RssStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

// ── Article list state ──

const articles = ref<RssItemDocument[]>([]);
const total = ref(0);
const listLoading = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);

const search = ref("");
const sourceFilter = ref("");
const categoryFilter = ref("");
const tagFilter = ref("");
const monthRange = ref<{ start: number; end: number } | null>(null);
const quickRange = ref<"all" | "today" | "7d" | "30d">("all");
const orderBy = ref("published_parsed");
const orderType = ref<"asc" | "desc">("desc");

let searchTimer: ReturnType<typeof setTimeout> | null = null;

// ── Detail drawer state ──

const detailVisible = ref(false);
const detail = ref<RssItemDocument | null>(null);
const detailLoading = ref(false);
const detailHtml = ref("");
const detailBodyMissing = ref(false);

// ── Colors ──

const SOURCE_PALETTE = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];

/** Top-level RSS roles — first segment of ``category_path`` (see ``/executiver/rss``). */
const RSS_ROLES = ["executiver", "producter", "leader", "engineer", "srer", "aier", "curator"];

const QUICK_RANGE_LABELS: Record<string, string> = { today: "Today", "7d": "7 days", "30d": "30 days" };

/** Stable source → color map, matching the pie chart's slice colors. */
const sourceColorMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {};
  (rssData.value?.sources ?? []).forEach((s, i) => {
    map[s.name] = SOURCE_PALETTE[i % SOURCE_PALETTE.length];
  });
  return map;
});

function hashColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return SOURCE_PALETTE[h % SOURCE_PALETTE.length];
}

function sourceColor(name: string): string {
  return sourceColorMap.value[name] ?? hashColor(name || "unknown");
}

// ── Stat card derived values ──

const avgArticlesPerSource = computed(() => {
  const sources = rssData.value?.sources ?? [];
  const total_ = rssData.value?.total ?? 0;
  if (!sources.length) return 0;
  return Math.round(total_ / sources.length);
});

const avgArticlesPerCategory = computed(() => {
  const cats = rssData.value?.categories ?? [];
  const total_ = rssData.value?.total ?? 0;
  if (!cats.length) return 0;
  return Math.round(total_ / cats.length);
});

const topSourceName = computed(() => {
  const sources = rssData.value?.sources ?? [];
  if (!sources.length) return "—";
  return [...sources].sort((a, b) => b.count - a.count)[0].name;
});

const latestMonth = computed(() => {
  const tl = rssData.value?.timeline ?? [];
  return tl.length ? tl[tl.length - 1].month : "—";
});

const bodyMissingPct = computed(() => {
  const total_ = rssData.value?.total ?? 0;
  const missing = rssData.value?.body_missing ?? 0;
  return total_ ? Math.round((missing / total_) * 100) : 0;
});

// ── Chart options ──

const sourcePieOption = computed<ECOption>(() => {
  const data = rssData.value?.sources ?? [];
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center", type: "scroll" },
    series: [{
      type: "pie",
      radius: ["40%", "70%"],
      center: ["55%", "50%"],
      data: data.map(d => ({ value: d.count, name: d.name, itemStyle: { color: sourceColor(d.name) } })),
      label: { formatter: "{b}: {c}" },
      emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.5)" } }
    }]
  };
});

const categoryBarOption = computed<ECOption>(() => {
  const data = rssData.value?.categories ?? [];
  const active = categoryFilter.value;
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value" },
    yAxis: { type: "category", data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: "bar",
      data: data.map(d => ({ value: d.count, itemStyle: { color: d.name === active ? "#ee6666" : "#6B9DFE", borderRadius: [0, 6, 6, 0] } })).reverse(),
      barWidth: "60%",
    }]
  };
});

const timelineOption = computed<ECOption>(() => {
  const data = rssData.value?.timeline ?? [];
  const counts = data.map(d => d.count);
  const ma = counts.map((_, i) => (i < 2 ? null : Math.round((counts[i - 2] + counts[i - 1] + counts[i]) / 3)));
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Articles", "3-Mo Trend"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "12%", containLabel: true },
    xAxis: { type: "category", data: data.map(d => d.month) },
    yAxis: { type: "value", minInterval: 1 },
    series: [{
      name: "Articles",
      type: "line",
      data: counts,
      smooth: true,
      lineStyle: { color: "#5470c6", width: 3 },
      itemStyle: { color: "#5470c6" },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(84,112,198,0.3)" }, { offset: 1, color: "rgba(84,112,198,0.05)" }] } }
    }, {
      name: "3-Mo Trend",
      type: "line",
      data: ma,
      smooth: true,
      lineStyle: { color: "#ee6666", width: 2, type: "dashed" },
      itemStyle: { color: "#ee6666" },
      symbol: "none",
    }]
  };
});

// ── Active filter pills ──

interface ActiveFilter {
  key: string;
  label: string;
  type: "primary" | "success" | "warning" | "info" | "danger";
}

const activeFilters = computed<ActiveFilter[]>(() => {
  const list: ActiveFilter[] = [];
  if (search.value) list.push({ key: "search", label: `Search: ${search.value}`, type: "info" });
  if (sourceFilter.value) list.push({ key: "source", label: `Source: ${sourceFilter.value}`, type: "primary" });
  if (categoryFilter.value) list.push({ key: "category", label: `Category: ${categoryFilter.value}`, type: "success" });
  if (tagFilter.value) list.push({ key: "tag", label: `Tag: ${tagFilter.value}`, type: "warning" });
  if (quickRange.value !== "all") list.push({ key: "range", label: `Date: ${QUICK_RANGE_LABELS[quickRange.value]}`, type: "danger" });
  else if (monthRange.value) list.push({ key: "month", label: `Month: ${monthLabel(monthRange.value.start)}`, type: "danger" });
  return list;
});

function monthLabel(epoch: number): string {
  const d = new Date(epoch);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── Chart click handlers ──

function onSourceChartClick(e: ECElementEvent) {
  const name = e.name as string;
  if (!name) return;
  if (sourceFilter.value === name) sourceFilter.value = "";
  else sourceFilter.value = name;
  resetAndLoad();
}

function onCategoryChartClick(e: ECElementEvent) {
  const name = e.name as string;
  if (!name) return;
  if (categoryFilter.value === name) categoryFilter.value = "";
  else categoryFilter.value = name;
  resetAndLoad();
}

function onTimelineChartClick(e: ECElementEvent) {
  const name = e.name as string;
  if (!name || !/^\d{4}-\d{2}$/.test(name)) return;
  if (monthRange.value && monthLabel(monthRange.value.start) === name) monthRange.value = null;
  else { monthRange.value = monthToRange(name); quickRange.value = "all"; }
  resetAndLoad();
}

function monthToRange(month: string): { start: number; end: number } {
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1).getTime();
  const end = new Date(y, m, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

// ── Filter helpers ──

function setCategoryFilter(name: string) {
  categoryFilter.value = name;
  resetAndLoad();
}

function setTagFilter(tag: string) {
  tagFilter.value = tag;
  resetAndLoad();
}

function clearFilter(key: string) {
  if (key === "search") search.value = "";
  else if (key === "source") sourceFilter.value = "";
  else if (key === "category") categoryFilter.value = "";
  else if (key === "tag") tagFilter.value = "";
  else if (key === "month") monthRange.value = null;
  else if (key === "range") quickRange.value = "all";
  resetAndLoad();
}

function clearAllFilters() {
  search.value = "";
  sourceFilter.value = "";
  categoryFilter.value = "";
  tagFilter.value = "";
  monthRange.value = null;
  quickRange.value = "all";
  resetAndLoad();
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => resetAndLoad(), 350);
}

function onFilterChange() {
  resetAndLoad();
}

function onQuickRangeChange() {
  monthRange.value = null;
  resetAndLoad();
}

function onSortChange({ order }: { order: "ascending" | "descending" | null }) {
  orderType.value = order === "ascending" ? "asc" : "desc";
  loadArticles();
}

// ── Navigation ──

function goManageFeeds() {
  router.push("/executiver/rss");
}

function goToRoleManager(categoryPath?: string) {
  const role = (categoryPath || "").split("/")[0];
  if (role && RSS_ROLES.includes(role)) router.push(`/executiver/rss/${role}`);
  else router.push("/executiver/rss");
}

function onSizeChange() {
  pageNum.value = 1;
  loadArticles();
}

function resetAndLoad() {
  pageNum.value = 1;
  loadArticles();
}

// ── Data loading ──

function currentDateRange(): { start?: number; end?: number } {
  const now = Date.now();
  if (quickRange.value === "today") {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return { start: d.getTime() };
  }
  if (quickRange.value === "7d") return { start: now - 7 * 24 * 3600 * 1000 };
  if (quickRange.value === "30d") return { start: now - 30 * 24 * 3600 * 1000 };
  if (monthRange.value) return { start: monthRange.value.start, end: monthRange.value.end };
  return {};
}

async function loadArticles() {
  listLoading.value = true;
  try {
    const params: any = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      orderBy: orderBy.value,
      orderType: orderType.value
    };
    if (search.value.trim()) params.search = search.value.trim();
    if (sourceFilter.value) params.source_name = sourceFilter.value;
    if (categoryFilter.value) params.category_path = categoryFilter.value;
    if (tagFilter.value) params.tags = [tagFilter.value];
    const range = currentDateRange();
    if (range.start !== undefined) params.publishedStart = range.start;
    if (range.end !== undefined) params.publishedEnd = range.end;
    const res = await getRssList(params);
    articles.value = res.data?.list ?? [];
    total.value = res.data?.total ?? 0;
  } catch (e) {
    articles.value = [];
    total.value = 0;
  } finally {
    listLoading.value = false;
  }
}

async function fetchStats() {
  try {
    const res = await getRssStats();
    rssData.value = res.data;
    lastUpdated.value = new Date().toLocaleTimeString();
  } catch {
    /* keep last good data */
  } finally {
    loading.value = false;
  }
}

async function refreshAll() {
  await Promise.all([fetchStats(), loadArticles()]);
}

// ── Detail drawer ──

async function openDetail(row: RssItemDocument) {
  detail.value = row;
  detailVisible.value = true;
  detailHtml.value = "";
  detailBodyMissing.value = !row.file_path;
  if (!row.file_path) {
    detailLoading.value = false;
    return;
  }
  detailLoading.value = true;
  try {
    const res = await readKnowledgeFile(row.file_path);
    detailHtml.value = renderMarkdown(res.content);
  } catch {
    // Body file missing on disk — surface as metadata-only rather than silently falling back.
    detailBodyMissing.value = true;
  } finally {
    detailLoading.value = false;
  }
}

const detailSummary = computed(() => {
  const s = detail.value?.summary ?? "";
  return stripHtml(s);
});

function openOriginal(row?: RssItemDocument | null) {
  if (row?.link) window.open(row.link, "_blank", "noopener,noreferrer");
}

async function copyLink(row?: RssItemDocument | null) {
  if (!row?.link) return;
  try {
    await navigator.clipboard.writeText(row.link);
    ElMessage.success("Link copied");
  } catch {
    ElMessage.error("Copy failed");
  }
}

// ── Utils ──

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(val?: string): string {
  if (!val) return "";
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return val.slice(0, 10);
    return d.toLocaleDateString();
  } catch {
    return val.slice(0, 10);
  }
}

// ── Lifecycle ──

onMounted(() => {
  fetchStats();
  loadArticles();
  refreshTimer = setInterval(fetchStats, 60_000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
