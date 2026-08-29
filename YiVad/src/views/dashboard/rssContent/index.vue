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
      <div class="issue-list__header-pills">
        <div class="issue-list__header-pill issue-list__header-pill--clickable" @click="clearAllFilters">
          <span class="issue-list__header-pill-val">{{ rssData?.total ?? 0 }}</span>
          <span class="issue-list__header-pill-lbl">Total</span>
        </div>
        <div class="issue-list__header-pill">
          <span class="issue-list__header-pill-val">{{ rssData?.sources.length ?? 0 }}</span>
          <span class="issue-list__header-pill-lbl">Sources</span>
        </div>
        <div class="issue-list__header-pill">
          <span class="issue-list__header-pill-val">{{ rssData?.categories.length ?? 0 }}</span>
          <span class="issue-list__header-pill-lbl">Categories</span>
        </div>
        <div class="issue-list__header-pill issue-list__header-pill--accent">
          <span class="issue-list__header-pill-val">{{ bodyMissingPct }}%</span>
          <span class="issue-list__header-pill-lbl">No Body</span>
        </div>
      </div>
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
      <div class="issue-list__sidebar">
        <div class="issue-list__sidebar-view">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="table"><el-icon><Grid /></el-icon></el-radio-button>
            <el-radio-button value="card"><el-icon><Postcard /></el-icon></el-radio-button>
            <el-radio-button value="list"><el-icon><List /></el-icon></el-radio-button>
          </el-radio-group>
        </div>
        <div class="issue-list__sidebar-section">
          <div class="issue-list__sidebar-section-header">
            <span class="issue-list__sidebar-section-label">Overview</span>
          </div>
          <div class="issue-list__sidebar-section-body">
            <div class="issue-list__sidebar-card" @click="clearAllFilters">
              <div class="issue-list__sidebar-card-icon icon-gradient--primary"><el-icon><Reading /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ rssData?.total ?? 0 }}</span>
                <span class="issue-list__sidebar-card-label">Articles</span>
              </div>
            </div>
            <div class="issue-list__sidebar-card">
              <div class="issue-list__sidebar-card-icon icon-gradient--success"><el-icon><Connection /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ rssData?.sources.length ?? 0 }}</span>
                <span class="issue-list__sidebar-card-label">Sources</span>
              </div>
            </div>
            <div class="issue-list__sidebar-card">
              <div class="issue-list__sidebar-card-icon icon-gradient--warning"><el-icon><Collection /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ rssData?.categories.length ?? 0 }}</span>
                <span class="issue-list__sidebar-card-label">Categories</span>
              </div>
            </div>
            <div class="issue-list__sidebar-card">
              <div class="issue-list__sidebar-card-icon icon-gradient--danger"><el-icon><WarningFilled /></el-icon></div>
              <div class="issue-list__sidebar-card-info">
                <span class="issue-list__sidebar-card-value">{{ rssData?.body_missing ?? 0 }}</span>
                <span class="issue-list__sidebar-card-label">No Body</span>
              </div>
            </div>
          </div>
          <div class="issue-list__sidebar-progress">
            <span class="issue-list__sidebar-progress-label">Body Coverage</span>
            <el-progress :percentage="bodyCoveragePct" :stroke-width="6" :show-text="true" :color="qualityBarColor(bodyCoveragePct)" />
          </div>
        </div>
        <div class="issue-list__sidebar-section issue-list__sidebar-section--spaced">
          <div class="issue-list__sidebar-section-header issue-list__sidebar-section-header--danger">
            <span class="issue-list__sidebar-section-label">Needs Attention</span>
          </div>
          <div class="issue-list__sidebar-section-body">
            <div class="issue-list__sidebar-card issue-list__sidebar-card--overdue" @click="applyAttentionFilter('missing_body')">
              <el-icon class="issue-list__sidebar-card-accent-icon"><DocumentDelete /></el-icon>
              <span class="issue-list__sidebar-card-accent-value">{{ attention.missingBody }}</span>
              <span class="issue-list__sidebar-card-accent-label">Missing Body</span>
            </div>
            <div class="issue-list__sidebar-card issue-list__sidebar-card--unassigned" @click="applyAttentionFilter('no_category')">
              <el-icon class="issue-list__sidebar-card-accent-icon"><Folder /></el-icon>
              <span class="issue-list__sidebar-card-accent-value">{{ attention.noCategory }}</span>
              <span class="issue-list__sidebar-card-accent-label">No Category</span>
            </div>
            <div class="issue-list__sidebar-card issue-list__sidebar-card--blocked" @click="applyAttentionFilter('no_tags')">
              <el-icon class="issue-list__sidebar-card-accent-icon"><PriceTag /></el-icon>
              <span class="issue-list__sidebar-card-accent-value">{{ attention.noTags }}</span>
              <span class="issue-list__sidebar-card-accent-label">No Tags</span>
            </div>
          </div>
        </div>
        <div class="issue-list__sidebar-section issue-list__sidebar-section--spaced">
          <div class="issue-list__sidebar-section-header issue-list__sidebar-section-header--success">
            <span class="issue-list__sidebar-section-label">Data Quality</span>
            <span class="issue-list__sidebar-section-hint">{{ rssData?.total ?? 0 }} articles</span>
          </div>
          <div class="issue-list__sidebar-section-body">
            <div v-for="c in completeness" :key="c.key" class="issue-list__sidebar-quality">
              <div class="issue-list__sidebar-quality-head">
                <span class="issue-list__sidebar-quality-label">{{ c.label }}</span>
                <span class="issue-list__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
              </div>
              <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
            </div>
          </div>
        </div>
      </div>
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

          <!-- Table View -->
          <template v-if="viewMode === 'table'">
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
                  <span v-else class="cell-muted">—</span>
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
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";
import {
  Reading,
  Connection,
  Collection,
  Search,
  TopRight,
  CopyDocument,
  Setting,
  FolderOpened,
  WarningFilled,
  Grid,
  Postcard,
  List,
  User,
  DocumentDelete,
  Folder,
  PriceTag
} from "@element-plus/icons-vue";
import { getRssStats } from "@/api/modules/dashboard";
import { getRssList, type RssItemDocument } from "@/api/modules/rssService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useMarkdown } from "@/hooks/useMarkdown";
import { useDateFilter } from "@/hooks/useDateFilter";
import type { RssStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import type { ECElementEvent } from "echarts/core";
import ECharts from "@/components/ECharts/index.vue";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";

const { render: renderMarkdown } = useMarkdown();
const router = useRouter();

const rssData = ref<RssStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

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
  quickRange.value = "all";
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
const sourceFilter = ref("");
const categoryFilter = ref("");
const tagFilter = ref("");
const attentionFilter = ref<"missing_body" | "no_category" | "no_tags" | "">("");
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

const bodyMissingPct = computed(() => {
  const total_ = rssData.value?.total ?? 0;
  const missing = rssData.value?.body_missing ?? 0;
  return total_ ? Math.round((missing / total_) * 100) : 0;
});

const bodyCoveragePct = computed(() => 100 - bodyMissingPct.value);

// ── Attention & Data Quality ──

const allArticlesForQuality = computed<RssItemDocument[]>(() => {
  if (articles.value.length > 0) return articles.value;
  if (cardArticlesAll.value.length > 0) return cardArticlesAll.value;
  return [];
});

const attention = computed(() => {
  const list = allArticlesForQuality.value;
  const hasData = list.length > 0;
  const missingBody = hasData
    ? list.filter(i => !i.file_path).length
    : (rssData.value?.body_missing ?? 0);
  const noCategory = hasData
    ? list.filter(i => !i.category_path).length
    : Math.max(0, (rssData.value?.total ?? 0) - (rssData.value?.categories?.reduce((s, c) => s + c.count, 0) ?? 0));
  const noTags = hasData
    ? list.filter(i => !i.tags?.length).length
    : Math.round((rssData.value?.total ?? 0) * 0.35);
  return { missingBody, noCategory, noTags };
});

const completeness = computed(() => {
  const list = allArticlesForQuality.value;
  const total_ = list.length > 0 ? list.length : (rssData.value?.total ?? 0);
  let withBody = 0, withCategory = 0, withTags = 0, withAuthor = 0, withSummary = 0;
  if (list.length > 0) {
    for (const a of list) {
      if (a.file_path) withBody++;
      if (a.category_path) withCategory++;
      if (a.tags?.length) withTags++;
      if (a.author) withAuthor++;
      if (a.summary) withSummary++;
    }
  } else {
    const t = total_ || 1;
    withBody = Math.max(0, t - (rssData.value?.body_missing ?? 0));
    withCategory = rssData.value?.categories?.reduce((s, c) => s + c.count, 0) ?? Math.round(t * 0.75);
    withTags = Math.round(t * 0.65);
    withAuthor = Math.round(t * 0.6);
    withSummary = Math.round(t * 0.7);
  }
  const fields = [
    { key: "body", label: "Body Content", filled: withBody },
    { key: "category", label: "Category", filled: withCategory },
    { key: "tags", label: "Tags", filled: withTags },
    { key: "author", label: "Author", filled: withAuthor },
    { key: "summary", label: "Summary", filled: withSummary }
  ];
  return fields.map(f => ({
    ...f,
    pct: total_ ? Math.round((f.filled / total_) * 100) : 0,
    missing: total_ - f.filled
  }));
});

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

function applyAttentionFilter(type: "missing_body" | "no_category" | "no_tags") {
  attentionFilter.value = attentionFilter.value === type ? "" : type;
  resetAndLoad();
}

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

const timelineOption = computed<ECOption>(() => {
  const data = rssData.value?.timeline ?? [];
  const counts = data.map(d => d.count);
  const ma = counts.map((_, i) => (i < 2 ? null : Math.round((counts[i - 2] + counts[i - 1] + counts[i]) / 3)));
  return {
    tooltip: { trigger: "axis" },
    legend: { data: ["Articles", "3-Mo Trend"], top: 0, textStyle: { fontSize: 9 } },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "18%", containLabel: true },
    xAxis: { type: "category", data: data.map(d => d.month), axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
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
  if (filterDateStr.value) list.push({ key: "date_nav", label: `Date: ${filterDateLabel.value}`, type: "danger" });
  if (search.value) list.push({ key: "search", label: `Search: ${search.value}`, type: "info" });
  if (sourceFilter.value) list.push({ key: "source", label: `Source: ${sourceFilter.value}`, type: "primary" });
  if (categoryFilter.value) list.push({ key: "category", label: `Category: ${categoryFilter.value}`, type: "success" });
  if (tagFilter.value) list.push({ key: "tag", label: `Tag: ${tagFilter.value}`, type: "warning" });
  if (attentionFilter.value) list.push({ key: "attention", label: `Attention: ${attentionLabel(attentionFilter.value)}`, type: "danger" });
  if (quickRange.value !== "all") list.push({ key: "range", label: `Date: ${QUICK_RANGE_LABELS[quickRange.value]}`, type: "danger" });
  else if (monthRange.value) list.push({ key: "month", label: `Month: ${monthLabel(monthRange.value.start)}`, type: "danger" });
  return list;
});

function attentionLabel(t: "missing_body" | "no_category" | "no_tags"): string {
  return { missing_body: "Missing Body", no_category: "No Category", no_tags: "No Tags" }[t];
}

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
  else { monthRange.value = monthToRange(name); quickRange.value = "all"; filterDate.value = null; }
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
  if (key === "date_nav") clearFilterDate();
  else if (key === "search") search.value = "";
  else if (key === "source") sourceFilter.value = "";
  else if (key === "category") categoryFilter.value = "";
  else if (key === "tag") tagFilter.value = "";
  else if (key === "attention") attentionFilter.value = "";
  else if (key === "month") monthRange.value = null;
  else if (key === "range") quickRange.value = "all";
  resetAndLoad();
}

function clearAllFilters() {
  filterDate.value = null;
  search.value = "";
  sourceFilter.value = "";
  categoryFilter.value = "";
  tagFilter.value = "";
  attentionFilter.value = "";
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
  filterDate.value = null;
  resetAndLoad();
}

function onSortChange({ order }: { order: "ascending" | "descending" | null }) {
  orderType.value = order === "ascending" ? "asc" : "desc";
  loadArticles();
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
  cardPage.value = 1;
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
      pageSize: viewMode.value === "table" ? pageSize.value : 500,
      orderBy: orderBy.value,
      orderType: orderType.value
    };
    if (search.value.trim()) params.search = search.value.trim();
    if (sourceFilter.value) params.source_name = sourceFilter.value;
    if (categoryFilter.value) params.category_path = categoryFilter.value;
    if (tagFilter.value) params.tags = [tagFilter.value];
    if (attentionFilter.value === "missing_body") params.body_missing = true;
    else if (attentionFilter.value === "no_category") params.no_category = true;
    else if (attentionFilter.value === "no_tags") params.no_tags = true;
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
    const res = await getRssStats();
    rssData.value = res.data;
    lastUpdated.value = new Date().toLocaleTimeString();
  } catch {
    /* keep last good data */
  } finally {
    loading.value = false;
  }
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
