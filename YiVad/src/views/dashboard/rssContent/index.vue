<template>
  <div class="rss-content-box" v-loading="loading">
    <!-- Header Card -->
    <div class="issue-list__header rss-header">
      <div class="issue-list__header-icon icon-gradient--primary">
        <el-icon><Reading /></el-icon>
      </div>
      <div class="issue-list__header-text">
        <h2 class="issue-list__header-title">RSS Content</h2>
        <p class="issue-list__header-desc">Aggregated articles from configured feeds</p>
      </div>
      <StatPills
        :total="rssData?.total ?? 0"
        :sources-count="rssData?.sources.length ?? 0"
        :categories-count="rssData?.categories.length ?? 0"
        :body-missing-pct="bodyMissingPct"
        @clear-all="clearAllFilters"
      />
      <div class="issue-list__header-right">
        <HeroDateNav
          :filter-date="filterDate"
          :label="filterDateLabel"
          :is-today="isFilterToday"
          @prev="goToPrevDay"
          @next="goToNextDay"
          @today="goToFilterToday"
          @clear="clearFilterDate"
        />
      </div>
    </div>

    <!-- Analytics Charts -->
    <div class="issue-list__charts rss-charts">
      <div class="issue-chart" :class="{ 'issue-chart--active': sourceFilter }">
        <div class="issue-chart__title">
          Sources
          <span v-if="sourceFilter" class="issue-chart__badge">filtered</span>
        </div>
        <div class="issue-chart__body">
          <ECharts :option="sourcePieOption" height="200" @chart-click="onSourceChartClick" />
        </div>
      </div>
      <div class="issue-chart" :class="{ 'issue-chart--active': categoryFilter }">
        <div class="issue-chart__title">
          Categories
          <span v-if="categoryFilter" class="issue-chart__badge">filtered</span>
        </div>
        <div class="issue-chart__body">
          <ECharts :option="categoryBarOption" height="200" @chart-click="onCategoryChartClick" />
        </div>
      </div>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activeFilters.length" class="issue-list__pills">
      <span class="issue-list__pills-label">Filters</span>
      <el-tag v-for="f in activeFilters" :key="f.key" closable size="small" :type="f.type" @close="clearFilter(f.key)">{{ f.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    <div class="issue-list__body">
      <RssSidebar
        v-model:view-mode="viewMode"
        :sources="rssData?.sources ?? []"
        :source-filter="sourceFilter"
        @toggle-source="toggleSource"
        @clear-source-filter="clearSourceFilter"
      />
      <div class="issue-list__main">
        <div class="articles-box card">
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
              <el-select v-model="sourceFilter" class="toolbar-select" placeholder="All sources" clearable filterable multiple collapse-tags collapse-tags-tooltip @change="onFilterChange">
                <el-option v-for="s in rssData?.sources ?? []" :key="s.name" :label="`${s.name} (${s.count})`" :value="s.name" />
              </el-select>
              <el-select v-model="categoryFilter" class="toolbar-select" placeholder="All categories" clearable filterable @change="onFilterChange">
                <el-option v-for="c in rssData?.categories ?? []" :key="c.name" :label="`${c.name} (${c.count})`" :value="c.name" />
              </el-select>
            </div>
          </div>

          <!-- Table View -->
          <template v-if="viewMode === 'table'">
            <ProTable
              ref="proTable"
              :columns="columns"
              :data="articles"
              :pagination="false"
              :border="false"
              :tool-button="false"
              stripe
              size="small"
              v-loading="listLoading"
              @sort-change="onSortChange"
            >
              <template #title="scope">
                <span class="article-title" @click="openDetail(scope.row as RssItemDocument)">{{ scope.row.title }}</span>
              </template>
              <template #source_name="scope">
                <span class="source-badge" :style="{ background: sourceColor(scope.row.source_name) }">{{ scope.row.source_name }}</span>
              </template>
              <template #category_path="scope">
                <el-tag v-if="scope.row.category_path" size="small" class="chip-chip" @click="setCategoryFilter(scope.row.category_path)">{{ scope.row.category_path }}</el-tag>
                <span v-else class="cell-muted">—</span>
              </template>
              <template #tags="scope">
                <template v-if="scope.row.tags?.length">
                  <el-tag
                    v-for="t in (scope.row.tags || []).slice(0, 3)"
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
              <template #published_parsed="scope">
                <span class="cell-date">{{ formatDate(scope.row.published) }}</span>
              </template>
              <template #operation="scope">
                <el-tooltip content="Open original" placement="top">
                  <el-button size="small" text @click="openOriginal(scope.row as RssItemDocument)">
                    <el-icon><TopRight /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
              <template #empty>
                <div class="table-empty">
                  <img src="@/assets/images/notData.png" alt="notData" />
                  <div>No articles match the current filters</div>
                </div>
              </template>
            </ProTable>
          </template>

          <!-- Card View -->
          <template v-else-if="viewMode === 'card'">
            <div class="issue-grid">
              <div
                v-for="article in cardArticles"
                :key="article.link || article.key"
                class="issue-card"
                @click="openDetail(article)"
              >
                <div class="issue-card__head">
                  <span class="issue-card__dot" :style="{ background: sourceColor(article.source_name) }" />
                  <code class="issue-card__key" :title="article.source_name">{{ article.source_name }}</code>
                  <div class="issue-card__head-right">
                    <el-tag v-if="article.category_path" size="small" effect="plain" class="chip-chip">{{ article.category_path.split('/').pop() }}</el-tag>
                  </div>
                </div>
                <h3 class="issue-card__title">{{ article.title }}</h3>
                <p v-if="article.summary" class="issue-card__desc">{{ truncateSummary(article.summary) }}</p>
                <div class="issue-card__meta">
                  <span class="source-badge" :style="{ background: sourceColor(article.source_name) }">{{ article.source_name }}</span>
                  <span v-if="article.author" class="issue-card__assignee">
                    <el-icon><User /></el-icon> {{ article.author }}
                  </span>
                  <span v-if="article.published" class="issue-card__due">
                    {{ formatDate(article.published) }}
                  </span>
                </div>
                <div v-if="article.tags?.length" class="issue-card__labels">
                  <el-tag v-for="t in (article.tags || []).slice(0, 4)" :key="t" size="small" round effect="plain" class="tag-chip">{{ t }}</el-tag>
                </div>
              </div>
            </div>
            <el-pagination
              v-if="cardTotal > cardPageSize"
              class="issue-grid__pager"
              layout="prev, pager, next"
              :page-size="cardPageSize"
              :total="cardTotal"
              :current-page="cardPage"
              @current-change="onCardPage"
            />
          </template>

          <!-- List View -->
          <template v-else>
            <div class="issue-list-view">
              <div
                v-for="article in cardArticles"
                :key="article.link || article.key"
                class="issue-list-view__row"
                @click="openDetail(article)"
              >
                <span class="issue-list-view__dot" :style="{ background: sourceColor(article.source_name) }" />
                <code class="issue-list-view__key" :title="article.source_name">{{ truncateSource(article.source_name) }}</code>
                <span class="issue-list-view__title">{{ article.title }}</span>
                <el-tag v-if="article.category_path" size="small" effect="plain" class="chip-chip">{{ article.category_path.split('/').pop() }}</el-tag>
                <span v-if="article.author" class="issue-list-view__assignee">{{ article.author }}</span>
                <span v-if="article.published" class="issue-list-view__due">{{ formatDate(article.published) }}</span>
              </div>
            </div>
            <el-pagination
              v-if="cardTotal > cardPageSize"
              class="issue-grid__pager"
              layout="prev, pager, next"
              :page-size="cardPageSize"
              :total="cardTotal"
              :current-page="cardPage"
              @current-change="onCardPage"
            />
          </template>

          <div class="pagination-row" v-if="viewMode === 'table'">
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
      </div>
    </div>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="rssContent">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import {
  Reading,
  Search,
  TopRight,
  User
} from "@element-plus/icons-vue";
import { getRssStats } from "@/api/modules/dashboard";
import { getRssList, updateRssItem, type RssItemDocument } from "@/api/modules/rssService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useDateFilter } from "@/hooks/useDateFilter";
import type { RssStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import type { ECElementEvent } from "echarts/core";
import ECharts from "@/components/ECharts/index.vue";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { KnowledgePreviewDialog, ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import StatPills from "./components/StatPills.vue";
import RssSidebar from "./components/RssSidebar.vue";
import type { KnowledgeMeta } from "@/api/interface/yiweb";

const rssData = ref<RssStatsData | null>(null);
const loading = ref(true);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const proTable = ref<InstanceType<typeof ProTable> | null>(null);

const columns: ColumnProps<RssItemDocument>[] = [
  { prop: "title", label: "Title", minWidth: 320 },
  { prop: "source_name", label: "Source", width: 160, showOverflowTooltip: true },
  { prop: "category_path", label: "Category", width: 180, showOverflowTooltip: true },
  { prop: "tags", label: "Tags", width: 200 },
  { prop: "published_parsed", label: "Published", width: 120, sortable: "custom" },
  { prop: "operation", label: "Actions", width: 100, align: "right", fixed: "right", isSetting: false }
];

// ── View mode ──
const viewMode = ref<"table" | "card" | "list">("table");
const cardPage = ref(1);
const cardPageSize = 20;
const cardArticlesAll = ref<RssItemDocument[]>([]);

const cardArticles = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize;
  return cardArticlesAll.value.slice(start, start + cardPageSize);
});
const cardTotal = computed(() => cardArticlesAll.value.length);

function onCardPage(p: number) {
  cardPage.value = p;
}

function truncateSummary(text: string): string {
  const plain = stripHtml(text);
  return plain.length > 160 ? plain.slice(0, 160) + "..." : plain;
}

function truncateSource(name: string): string {
  if (!name) return "—";
  return name.length > 10 ? name.slice(0, 10) + "…" : name;
}

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

watch(filterDateStr, () => {
  monthRange.value = null;
  resetAndLoad();
});

// ── Article list state ──

const articles = ref<RssItemDocument[]>([]);
const total = ref(0);
const listLoading = ref(false);
const pageNum = ref(1);
const pageSize = ref(20);

const search = ref("");
const sourceFilter = ref<string[]>([]);
const categoryFilter = ref("");
const tagFilter = ref("");
const monthRange = ref<{ start: number; end: number } | null>(null);
const orderBy = ref("published_parsed");
const orderType = ref<"asc" | "desc">("desc");

let searchTimer: ReturnType<typeof setTimeout> | null = null;

// ── Preview dialog ref ──

const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

// ── Colors ──

const SOURCE_PALETTE = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];

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
    yAxis: { type: "category", data: data.map(d => d.name).reverse(), axisLabel: { fontSize: 9 } },
    series: [{
      type: "bar",
      data: data.map(d => ({ value: d.count, itemStyle: { color: d.name === active ? "#ee6666" : "#6B9DFE", borderRadius: [0, 6, 6, 0] } })).reverse(),
      barWidth: "60%",
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
  if (filterDateStr.value) list.push({ key: "date_nav", label: `Date: ${filterDateLabel.value}`, type: "danger" });
  if (search.value) list.push({ key: "search", label: `Search: ${search.value}`, type: "info" });
  if (sourceFilter.value.length) list.push({ key: "source", label: `Sources: ${sourceFilter.value.join(", ")}`, type: "primary" });
  if (categoryFilter.value) list.push({ key: "category", label: `Category: ${categoryFilter.value}`, type: "success" });
  if (tagFilter.value) list.push({ key: "tag", label: `Tag: ${tagFilter.value}`, type: "warning" });
  if (monthRange.value) list.push({ key: "month", label: `Month: ${monthLabel(monthRange.value.start)}`, type: "danger" });
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
  toggleSource(name);
}

function onCategoryChartClick(e: ECElementEvent) {
  const name = e.name as string;
  if (!name) return;
  if (categoryFilter.value === name) categoryFilter.value = "";
  else categoryFilter.value = name;
  resetAndLoad();
}

// ── Filter helpers ──

function toggleSource(name: string) {
  const idx = sourceFilter.value.indexOf(name);
  if (idx >= 0) sourceFilter.value.splice(idx, 1);
  else sourceFilter.value.push(name);
  resetAndLoad();
}

function isSourceActive(name: string): boolean {
  return sourceFilter.value.indexOf(name) >= 0;
}

function clearSourceFilter() {
  sourceFilter.value = [];
  resetAndLoad();
}

function setCategoryFilter(name: string) {
  categoryFilter.value = name;
  resetAndLoad();
}

function setTagFilter(tag: string) {
  tagFilter.value = tag;
  resetAndLoad();
}

function clearFilter(key: string) {
  if (key === "date_nav") clearFilterDate();
  else if (key === "search") search.value = "";
  else if (key === "source") sourceFilter.value = [];
  else if (key === "category") categoryFilter.value = "";
  else if (key === "tag") tagFilter.value = "";
  else if (key === "month") monthRange.value = null;
  resetAndLoad();
}

function clearAllFilters() {
  filterDate.value = null;
  search.value = "";
  sourceFilter.value = [];
  categoryFilter.value = "";
  tagFilter.value = "";
  monthRange.value = null;
  resetAndLoad();
}

function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => resetAndLoad(), 350);
}

function onFilterChange() {
  resetAndLoad();
}

function onSortChange({ order }: { order: "ascending" | "descending" | null }) {
  orderType.value = order === "ascending" ? "asc" : "desc";
  loadArticles();
}

function onSizeChange() {
  pageNum.value = 1;
  loadArticles();
}

function resetAndLoad() {
  pageNum.value = 1;
  cardPage.value = 1;
  fetchStats();
  loadArticles();
}

// ── Data loading ──

function currentDateRange(): { start?: number; end?: number } {
  if (filterDateStr.value) {
    const d = new Date(filterDateStr.value);
    d.setHours(0, 0, 0, 0);
    const start = d.getTime();
    d.setHours(23, 59, 59, 999);
    return { start, end: d.getTime() };
  }
  if (monthRange.value) return { start: monthRange.value.start, end: monthRange.value.end };
  return {};
}

async function loadArticles() {
  listLoading.value = true;
  try {
    const params: any = {
      pageNum: pageNum.value,
      pageSize: viewMode.value === "table" ? pageSize.value : 500,
      orderBy: orderBy.value,
      orderType: orderType.value
    };
    if (search.value.trim()) params.search = search.value.trim();
    if (sourceFilter.value.length) params.source_name = sourceFilter.value;
    if (categoryFilter.value) params.category_path = categoryFilter.value;
    if (tagFilter.value) params.tags = [tagFilter.value];
    const range = currentDateRange();
    if (range.start !== undefined) params.publishedStart = range.start;
    if (range.end !== undefined) params.publishedEnd = range.end;
    const res = await getRssList(params);
    const list = res.data?.list ?? [];
    if (viewMode.value === "table") {
      articles.value = list;
      total.value = res.data?.total ?? 0;
      if (articles.value.length > 0) cardArticlesAll.value = articles.value;
    } else {
      cardArticlesAll.value = list;
      total.value = res.data?.total ?? 0;
    }
  } catch (e) {
    articles.value = [];
    cardArticlesAll.value = [];
    total.value = 0;
  } finally {
    listLoading.value = false;
  }
}

async function fetchStats() {
  try {
    const { start, end } = currentDateRange();
    const res = await getRssStats({ start, end });
    rssData.value = res.data;
  } catch {
    /* keep last good data */
  } finally {
    loading.value = false;
  }
}

// ── Detail preview ──

function buildFallbackContent(row: RssItemDocument): string {
  const summary = stripHtml(row.summary || "");
  const contentParts: string[] = [];
  contentParts.push(`# ${row.title || "Untitled"}`);
  contentParts.push("");
  const metaLines: string[] = [];
  if (row.source_name) metaLines.push(`**Source:** ${row.source_name}`);
  if (row.category_path) metaLines.push(`**Category:** ${row.category_path}`);
  if (row.author) metaLines.push(`**Author:** ${row.author}`);
  if (row.published) metaLines.push(`**Published:** ${formatDate(row.published)}`);
  if (row.link) metaLines.push(`**Original:** [Open](${row.link})`);
  if (metaLines.length) {
    contentParts.push(metaLines.join("  \n"));
    contentParts.push("");
  }
  if (row.tags?.length) {
    contentParts.push(`**Tags:** ${row.tags.map(t => `\`${t}\``).join(" ")}`);
    contentParts.push("");
  }
  contentParts.push("---");
  contentParts.push("");
  if (summary) {
    contentParts.push("## Summary");
    contentParts.push("");
    contentParts.push(summary);
    contentParts.push("");
  }
  contentParts.push("> *No body file available — metadata-only record.*");
  return contentParts.join("\n");
}

async function patchRssItemLocally(key: string, patch: Partial<RssItemDocument>) {
  const patchAll = (list: RssItemDocument[]) => {
    for (const it of list) {
      if (it.key === key) Object.assign(it, patch);
    }
  };
  patchAll(articles.value);
  patchAll(cardArticlesAll.value);
}

async function openDetail(row: RssItemDocument) {
  if (!row) return;
  if (!previewDlg.value) {
    await nextTick();
    if (!previewDlg.value) return;
  }
  const filePath = row.file_path;
  let content = "";
  let fileLoaded = false;
  let actualPath = filePath || "";
  if (filePath && !row.body_missing) {
    try {
      const res = await readKnowledgeFile(filePath);
      content = res.content || "";
      fileLoaded = !!content;
    } catch {
      fileLoaded = false;
      if (row.key) {
        const patch: Partial<RssItemDocument> = { file_path: undefined, body_missing: true };
        updateRssItem(row.key, patch).catch(() => { /* ignore */ });
        patchRssItemLocally(row.key, patch);
      }
      actualPath = "";
    }
  }
  if (!fileLoaded) {
    content = buildFallbackContent(row);
  }
  const meta: KnowledgeMeta = {
    type: "rss-article",
    tags: row.tags || [],
    roles: row.category_path ? [row.category_path.split("/")[0]] : []
  };
  try {
    previewDlg.value.openFile({
      path: actualPath,
      title: row.title || "Untitled",
      content,
      onSave: async (_newContent: string) => { /* read-only preview */ }
    });
  } catch {
    /* ignore */
  }
}

function openOriginal(row?: RssItemDocument | null) {
  if (row?.link) window.open(row.link, "_blank", "noopener,noreferrer");
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
