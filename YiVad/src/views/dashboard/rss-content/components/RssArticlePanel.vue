<template>
  <div class="ap-box card" :class="{ 'ap-box--compact': density === 'compact' }">
    <div class="ap-header">
      <div class="ap-title">
        Articles
        <span class="ap-count">{{ fmt(total) }}</span>
        <span v-if="activeFilterCount" class="ap-filter-badge"
          >{{ activeFilterCount }} filter{{ activeFilterCount > 1 ? "s" : "" }}</span
        >
      </div>
      <div class="ap-toolbar">
        <el-input
          ref="searchInputRef"
          :model-value="search"
          class="ap-search"
          :prefix-icon="Search"
          placeholder="Search title / author (/)"
          clearable
          @input="onSearchInput"
          @clear="onSearchClear"
        />
        <el-select
          :model-value="sourceFilter"
          class="ap-select"
          placeholder="All sources"
          clearable
          filterable
          multiple
          collapse-tags
          collapse-tags-tooltip
          @change="emit('update:sourceFilter', $event)"
        >
          <el-option v-for="s in sources" :key="s.name" :label="`${s.name} (${s.count})`" :value="s.name" />
        </el-select>
        <el-select
          :model-value="categoryFilter"
          class="ap-select"
          placeholder="All categories"
          clearable
          filterable
          @change="emit('update:categoryFilter', $event)"
        >
          <el-option v-for="c in categories" :key="c.name" :label="`${c.name} (${c.count})`" :value="c.name" />
        </el-select>
        <el-tooltip content="Export CSV" placement="bottom">
          <el-button size="small" text :icon="Download" @click="exportCsv" />
        </el-tooltip>
      </div>
    </div>

    <div class="ap-summary">
      <span class="ap-summary__text">
        Showing <strong>{{ fmt(pagedArticles.length) }}</strong> of <strong>{{ fmt(total) }}</strong> articles
        <span v-if="total !== articles.length" class="ap-summary__filtered">(filtered from {{ fmt(articles.length) }})</span>
      </span>
      <div class="ap-summary__right">
        <el-tooltip :content="density === 'compact' ? 'Comfortable density' : 'Compact density'" placement="top">
          <el-button size="small" text @click="toggleDensity">
            <el-icon :size="14"><component :is="density === 'compact' ? Grid : List" /></el-icon>
          </el-button>
        </el-tooltip>
        <span v-if="lastUpdated" class="ap-summary__time">Updated {{ timeAgo(lastUpdated) }}</span>
      </div>
    </div>

    <template v-if="viewMode === 'table'">
      <ProTable
        ref="proTable"
        :columns="columns"
        :data="pagedArticles"
        :pagination="false"
        :border="false"
        :tool-button="false"
        stripe
        :size="density === 'compact' ? 'small' : 'default'"
        v-loading="loading"
        @sort-change="onSortChange"
        @row-click="onRowClick"
      >
        <template #title="scope">
          <span class="ap-article-title" @click="emit('open-detail', scope.row)">{{ scope.row.title }}</span>
        </template>
        <template #source_name="scope">
          <span class="ap-source-badge" :style="badgeStyle(scope.row.source_name)">{{ scope.row.source_name }}</span>
        </template>
        <template #category_path="scope">
          <el-tag
            v-if="scope.row.category_path"
            size="small"
            class="ap-chip"
            @click="emit('set-category', scope.row.category_path)"
            >{{ scope.row.category_path }}</el-tag
          >
          <span v-else class="ap-muted">—</span>
        </template>
        <template #tags="scope">
          <template v-if="scope.row.tags?.length">
            <el-tag
              v-for="t in (scope.row.tags || []).slice(0, 3)"
              :key="t"
              size="small"
              effect="plain"
              class="ap-tag"
              @click="emit('set-tag', t)"
              >{{ t }}</el-tag
            >
          </template>
          <span v-else class="ap-muted">—</span>
        </template>
        <template #body_status="scope">
          <el-tooltip :content="scope.row.body_missing ? 'Body file missing' : 'Content available'" placement="top">
            <span class="ap-body-status" :class="scope.row.body_missing ? 'ap-body-status--missing' : 'ap-body-status--ok'">
              <el-icon :size="14"><CircleCheckFilled v-if="!scope.row.body_missing" /><WarningFilled v-else /></el-icon>
            </span>
          </el-tooltip>
        </template>
        <template #published_parsed="scope">
          <span class="ap-date">{{ formatDate(scope.row.published) }}</span>
        </template>
        <template #operation="scope">
          <el-tooltip content="Open original" placement="top">
            <el-button size="small" text @click.stop="emit('open-original', scope.row)"
              ><el-icon><TopRight /></el-icon
            ></el-button>
          </el-tooltip>
          <el-tooltip content="Copy link" placement="top">
            <el-button size="small" text @click.stop="copyLink(scope.row)"
              ><el-icon><Link /></el-icon
            ></el-button>
          </el-tooltip>
        </template>
        <template #empty>
          <div class="ap-empty">
            <img src="@/assets/images/notData.png" alt="notData" />
            <div>No articles match the current filters</div>
          </div>
        </template>
      </ProTable>
    </template>

    <template v-else-if="viewMode === 'card'">
      <div v-if="pagedArticles.length === 0" class="ap-empty">
        <img src="@/assets/images/notData.png" alt="notData" />
        <div>No articles match the current filters</div>
      </div>
      <div v-else class="ap-grid">
        <div v-for="a in pagedArticles" :key="a.link || a.key" class="ap-card" @click="emit('open-detail', a)">
          <div class="ap-card__head">
            <span class="ap-card__dot" :style="dotStyle(a.source_name)" />
            <code class="ap-card__key" :title="a.source_name">{{ a.source_name }}</code>
            <div class="ap-card__head-right">
              <span v-if="a.body_missing" class="ap-card__body-badge" title="Body file missing"
                ><el-icon :size="12"><WarningFilled /></el-icon
              ></span>
              <el-tag v-if="a.category_path" size="small" effect="plain" class="ap-chip">{{
                categoryLeaf(a.category_path)
              }}</el-tag>
            </div>
          </div>
          <h3 class="ap-card__title">{{ a.title }}</h3>
          <p v-if="a.summary" class="ap-card__desc">{{ truncateSummary(a.summary) }}</p>
          <div v-if="a.tags?.length" class="ap-card__tags">
            <el-tag
              v-for="t in (a.tags || []).slice(0, 4)"
              :key="t"
              size="small"
              effect="plain"
              class="ap-tag"
              @click.stop="emit('set-tag', t)"
              >{{ t }}</el-tag
            >
          </div>
          <div class="ap-card__meta">
            <span v-if="a.author" class="ap-card__author"
              ><el-icon><User /></el-icon> {{ a.author }}</span
            >
            <span v-if="a.published" class="ap-card__date">{{ formatDate(a.published) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <div v-if="pagedArticles.length === 0" class="ap-empty">
        <img src="@/assets/images/notData.png" alt="notData" />
        <div>No articles match the current filters</div>
      </div>
      <div v-else class="ap-list">
        <div v-for="a in pagedArticles" :key="a.link || a.key" class="ap-list__row" @click="emit('open-detail', a)">
          <span class="ap-list__dot" :style="dotStyle(a.source_name)" />
          <code class="ap-list__key" :title="a.source_name">{{ truncateSource(a.source_name) }}</code>
          <span class="ap-list__title">{{ a.title }}</span>
          <el-tag v-if="a.category_path" size="small" effect="plain" class="ap-chip">{{ categoryLeaf(a.category_path) }}</el-tag>
          <span v-if="a.body_missing" class="ap-list__body-missing" title="Body file missing">⚠</span>
          <span v-if="a.author" class="ap-list__author">{{ a.author }}</span>
          <span v-if="a.published" class="ap-list__date">{{ formatDate(a.published) }}</span>
        </div>
      </div>
    </template>

    <div class="ap-pagination">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="RssArticlePanel">
import { ref, computed } from "vue";
import { Search, TopRight, User, CircleCheckFilled, WarningFilled, Download, Grid, List, Link } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import type { RssItemDocument } from "@/api/modules/rssService";
import type { RssSourceStats, RssCategoryStats } from "@/api/interface/yiAi";
import { useSourceColor } from "../composables/useSourceColor";
import { useArticlePagination } from "../composables/useArticlePagination";
import { useSearchShortcut } from "../composables/useSearchShortcut";
import { formatDate, truncateSummary, truncateSource, categoryLeaf } from "../utils";

interface Props {
  articles?: RssItemDocument[];
  total?: number;
  loading?: boolean;
  sources?: RssSourceStats[];
  categories?: RssCategoryStats[];
  sourceFilter?: string[];
  categoryFilter?: string;
  search?: string;
  viewMode?: "table" | "card" | "list";
  lastUpdated?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  articles: () => [],
  total: 0,
  loading: false,
  sources: () => [],
  categories: () => [],
  sourceFilter: () => [],
  categoryFilter: "",
  search: "",
  viewMode: "table",
  lastUpdated: null
});

const emit = defineEmits<{
  (e: "update:sourceFilter", v: string[]): void;
  (e: "update:categoryFilter", v: string): void;
  (e: "update:search", v: string): void;
  (e: "open-detail", row: RssItemDocument): void;
  (e: "open-original", row: RssItemDocument): void;
  (e: "set-category", name: string): void;
  (e: "set-tag", tag: string): void;
  (e: "sort-change", order: "asc" | "desc"): void;
  (e: "page-change", page: number): void;
  (e: "size-change", size: number): void;
}>();

const { dotStyle, badgeStyle } = useSourceColor(computed(() => props.sources));
const { pageNum, pageSize, pagedArticles, onPageChange, onSizeChange } = useArticlePagination(
  computed(() => props.articles),
  computed(() => props.viewMode)
);
const { searchInputRef, onSearchInput, onSearchClear } = useSearchShortcut(emit);

const density = ref<"compact" | "comfortable">("comfortable");

const columns: ColumnProps<RssItemDocument>[] = [
  { prop: "title", label: "Title", minWidth: 320, showOverflowTooltip: false },
  { prop: "source_name", label: "Source", width: 150, showOverflowTooltip: true },
  { prop: "category_path", label: "Category", width: 160, showOverflowTooltip: true },
  { prop: "tags", label: "Tags", width: 180 },
  { prop: "body_status", label: "Body", width: 64, align: "center" },
  { prop: "published_parsed", label: "Published", width: 110, sortable: "custom" },
  { prop: "operation", label: "", width: 60, align: "right", fixed: "right", isSetting: false }
];

const activeFilterCount = computed(() => {
  let n = 0;
  if (props.search) n++;
  if (props.sourceFilter.length) n++;
  if (props.categoryFilter) n++;
  return n;
});

function toggleDensity() {
  density.value = density.value === "compact" ? "comfortable" : "compact";
}
function onRowClick(row: RssItemDocument) {
  emit("open-detail", row);
}
function onSortChange({ order }: { order: "ascending" | "descending" | null }) {
  emit("sort-change", order === "ascending" ? "asc" : "desc");
}

function copyLink(row: RssItemDocument) {
  if (!row.link) return;
  navigator.clipboard
    .writeText(row.link)
    .then(() => ElMessage.success("Link copied"))
    .catch(() => ElMessage.error("Failed to copy"));
}

function timeAgo(ts: number | null): string {
  if (!ts) return "";
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmt(n: number): string {
  return n.toLocaleString();
}

function exportCsv() {
  const headers = ["title", "source_name", "category_path", "author", "published", "link", "tags"];
  const rows = props.articles.map(a => [
    `"${(a.title || "").replace(/"/g, '""')}"`,
    `"${(a.source_name || "").replace(/"/g, '""')}"`,
    `"${(a.category_path || "").replace(/"/g, '""')}"`,
    `"${(a.author || "").replace(/"/g, '""')}"`,
    a.published || "",
    a.link || "",
    `"${(a.tags || []).join("; ")}"`
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const aEl = document.createElement("a");
  aEl.href = url;
  aEl.download = `rss-articles-${new Date().toISOString().slice(0, 10)}.csv`;
  aEl.click();
  URL.revokeObjectURL(url);
}
</script>

<style scoped lang="scss">
@use "./RssArticlePanel.scss" as *;
</style>
