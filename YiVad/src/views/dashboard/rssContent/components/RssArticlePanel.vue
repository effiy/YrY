<template>
  <div class="ap-box card">
    <div class="ap-header">
      <div class="ap-title">
        Articles
        <span class="ap-count">{{ total }}</span>
      </div>
      <div class="ap-toolbar">
        <el-input
          :model-value="search"
          class="ap-search"
          :prefix-icon="Search"
          placeholder="Search title / author"
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
        v-loading="loading"
        @sort-change="onSortChange"
      >
        <template #title="scope">
          <span class="ap-article-title" @click="emit('open-detail', scope.row)">{{ scope.row.title }}</span>
        </template>
        <template #source_name="scope">
          <span class="ap-source-badge" :style="badgeStyle(scope.row.source_name)">{{ scope.row.source_name }}</span>
        </template>
        <template #category_path="scope">
          <el-tag v-if="scope.row.category_path" size="small" class="ap-chip" @click="emit('set-category', scope.row.category_path)">{{ scope.row.category_path }}</el-tag>
          <span v-else class="ap-muted">—</span>
        </template>
        <template #tags="scope">
          <template v-if="scope.row.tags?.length">
            <el-tag v-for="t in (scope.row.tags || []).slice(0, 3)" :key="t" size="small" effect="plain" class="ap-tag" @click="emit('set-tag', t)">{{ t }}</el-tag>
          </template>
          <span v-else class="ap-muted">—</span>
        </template>
        <template #published_parsed="scope">
          <span class="ap-date">{{ formatDate(scope.row.published) }}</span>
        </template>
        <template #operation="scope">
          <el-tooltip content="Open original" placement="top">
            <el-button size="small" text @click="emit('open-original', scope.row)">
              <el-icon><TopRight /></el-icon>
            </el-button>
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

    <!-- Card View -->
    <template v-else-if="viewMode === 'card'">
      <div class="ap-grid">
        <div v-for="article in cardArticles" :key="article.link || article.key" class="ap-card" @click="emit('open-detail', article)">
          <div class="ap-card__head">
            <span class="ap-card__dot" :style="dotStyle(article.source_name)" />
            <code class="ap-card__key" :title="article.source_name">{{ article.source_name }}</code>
            <div class="ap-card__head-right">
              <el-tag v-if="article.category_path" size="small" effect="plain" class="ap-chip">{{ categoryLeaf(article.category_path) }}</el-tag>
            </div>
          </div>
          <h3 class="ap-card__title">{{ article.title }}</h3>
          <p v-if="article.summary" class="ap-card__desc">{{ truncateSummary(article.summary) }}</p>
          <div class="ap-card__meta">
            <span v-if="article.author" class="ap-card__author">
              <el-icon><User /></el-icon> {{ article.author }}
            </span>
            <span v-if="article.published" class="ap-card__date">{{ formatDate(article.published) }}</span>
          </div>
        </div>
      </div>
      <el-pagination
        v-if="cardTotal > cardPageSize"
        class="ap-pager"
        layout="prev, pager, next"
        :page-size="cardPageSize"
        :total="cardTotal"
        :current-page="cardPage"
        @current-change="onCardPage"
      />
    </template>

    <!-- List View -->
    <template v-else>
      <div class="ap-list">
        <div v-for="article in cardArticles" :key="article.link || article.key" class="ap-list__row" @click="emit('open-detail', article)">
          <span class="ap-list__dot" :style="dotStyle(article.source_name)" />
          <code class="ap-list__key" :title="article.source_name">{{ truncateSource(article.source_name) }}</code>
          <span class="ap-list__title">{{ article.title }}</span>
          <el-tag v-if="article.category_path" size="small" effect="plain" class="ap-chip">{{ categoryLeaf(article.category_path) }}</el-tag>
          <span v-if="article.author" class="ap-list__author">{{ article.author }}</span>
          <span v-if="article.published" class="ap-list__date">{{ formatDate(article.published) }}</span>
        </div>
      </div>
      <el-pagination
        v-if="cardTotal > cardPageSize"
        class="ap-pager"
        layout="prev, pager, next"
        :page-size="cardPageSize"
        :total="cardTotal"
        :current-page="cardPage"
        @current-change="onCardPage"
      />
    </template>

    <div class="ap-pagination" v-if="viewMode === 'table'">
      <el-pagination
        v-model:current-page="pageNum"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="onPageChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="RssArticlePanel">
import { ref, computed } from "vue";
import { Search, TopRight, User } from "@element-plus/icons-vue";
import { ProTable } from "@/components";
import type { ColumnProps } from "@/components";
import type { RssItemDocument } from "@/api/modules/rssService";
import type { RssSourceStats, RssCategoryStats } from "@/api/interface/yiAi";
import { useSourceColor } from "../composables/useSourceColor";
import { toRef } from "vue";

interface Props {
  articles: RssItemDocument[];
  total: number;
  loading: boolean;
  sources: RssSourceStats[];
  categories: RssCategoryStats[];
  sourceFilter: string[];
  categoryFilter: string;
  search: string;
  viewMode: "table" | "card" | "list";
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

const { dotStyle, badgeStyle } = useSourceColor(toRef(() => props.sources));

const columns: ColumnProps<RssItemDocument>[] = [
  { prop: "title", label: "Title", minWidth: 360, showOverflowTooltip: false },
  { prop: "source_name", label: "Source", width: 160, showOverflowTooltip: true },
  { prop: "category_path", label: "Category", width: 180, showOverflowTooltip: true },
  { prop: "tags", label: "Tags", width: 200 },
  { prop: "published_parsed", label: "Published", width: 120, sortable: "custom" },
  { prop: "operation", label: "Actions", width: 100, align: "right", fixed: "right", isSetting: false },
];

// ── Table pagination ──
const pageNum = ref(1);
const pageSize = ref(600);

function onPageChange(p: number) {
  pageNum.value = p;
  emit("page-change", p);
}

function onSizeChange(s: number) {
  pageNum.value = 1;
  emit("size-change", s);
}

// ── Card / List pagination ──
const cardPage = ref(1);
const cardPageSize = 600;

const cardArticles = computed(() => {
  const start = (cardPage.value - 1) * cardPageSize;
  return props.articles.slice(start, start + cardPageSize);
});
const cardTotal = computed(() => props.articles.length);

function onCardPage(p: number) {
  cardPage.value = p;
}

// ── Search debounce ──
let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput(v: string | number) {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => emit("update:search", String(v ?? "")), 350);
}
function onSearchClear() {
  emit("update:search", "");
}

// ── Sort ──
function onSortChange({ order }: { order: "ascending" | "descending" | null }) {
  emit("sort-change", order === "ascending" ? "asc" : "desc");
}

// ── Utils ──
function truncateSummary(text: string): string {
  const plain = stripHtml(text);
  return plain.length > 160 ? plain.slice(0, 160) + "..." : plain;
}

function truncateSource(name: string): string {
  if (!name) return "—";
  return name.length > 10 ? name.slice(0, 10) + "…" : name;
}

function categoryLeaf(path: string): string {
  return path.split("/").pop() || path;
}

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
</script>

<style scoped lang="scss">
.ap-box {
  padding: 20px 24px 24px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  box-shadow: 0 2px 12px -6px rgba(0, 0, 0, 0.04);
}

.ap-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.ap-title {
  font-family: DIN, sans-serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  position: relative;
  padding-left: 10px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 16px;
    background: linear-gradient(180deg, var(--el-color-primary), var(--el-color-primary-light-3));
    border-radius: 2px;
  }
}

.ap-count {
  display: inline-block;
  margin-left: 10px;
  padding: 2px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-color-primary);
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border-radius: 12px;
  border: 1px solid var(--el-color-primary-light-7);
  box-shadow: 0 2px 6px -2px var(--el-color-primary-light-5);
}

.ap-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.ap-search { width: 260px; }
.ap-select { width: 200px; }

.ap-article-title {
  color: var(--el-text-color-primary);
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: var(--el-color-primary);
    text-decoration: none;
    text-shadow: 0 0 1px var(--el-color-primary-light-3);
  }
}

.ap-source-badge {
  --badge-bg: #5470c6;
  --badge-shadow: rgba(84, 112, 198, 0.25);
  display: inline-block;
  padding: 3px 12px;
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
  background: var(--badge-bg);
  box-shadow: 0 2px 6px -2px var(--badge-shadow);
  position: relative;
  transition: transform 0.15s ease, box-shadow 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.18), transparent);
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px -3px var(--badge-shadow);
  }
}

.ap-chip {
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.08);
  }
}

.ap-tag {
  margin-right: 4px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease !important;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.08);
  }
}

.ap-muted { color: var(--el-text-color-placeholder); }
.ap-date { color: var(--el-text-color-secondary); font-size: 12px; font-family: DIN, sans-serif; }

.ap-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;

  img {
    width: 120px;
    margin-bottom: 8px;
    opacity: 0.6;
  }
}

// ── Card Grid ──
.ap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 12px;
}

.ap-pager {
  margin-top: 16px;
  justify-content: center;
}

.ap-card {
  --dot-color: #909399;
  padding: 16px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-light) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--dot-color);
    opacity: 0;
    transition: opacity 0.25s ease;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.04), 0 12px 24px -8px rgba(0, 0, 0, 0.12);
    border-color: var(--el-border-color);

    &::before { opacity: 1; }
  }
}

.ap-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.ap-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--dot-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dot-color) 15%, transparent);
  flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  .ap-card:hover & {
    transform: scale(1.15);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--dot-color) 20%, transparent);
  }
}

.ap-card__key {
  font-family: "SF Mono", Consolas, Monaco, monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 6px;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid var(--el-border-color-lighter);
}

.ap-card__head-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ap-card__title {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.45;
  color: var(--el-text-color-primary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s ease;

  .ap-card:hover & { color: var(--el-color-primary); }
}

.ap-card__desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ap-card__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 10px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.ap-card__author {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);

  .el-icon { font-size: 13px; }
}

.ap-card__date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-family: DIN, sans-serif;
}

// ── List View ──
.ap-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ap-list__row {
  --dot-color: #909399;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: linear-gradient(90deg, var(--el-bg-color) 0%, var(--el-fill-color-light) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease, background 0.25s ease;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 0;
    border-radius: 0 3px 3px 0;
    background: var(--dot-color);
    transition: height 0.25s ease;
  }

  &:hover {
    box-shadow: 0 4px 16px -6px rgba(0, 0, 0, 0.1);
    transform: translateX(2px);
    border-color: var(--el-border-color);
    background: linear-gradient(90deg, var(--el-fill-color-light) 0%, var(--el-bg-color) 100%);

    &::before { height: 60%; }
  }
}

.ap-list__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--dot-color);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--dot-color) 15%, transparent);
  flex-shrink: 0;
  transition: transform 0.2s ease;

  .ap-list__row:hover & { transform: scale(1.2); }
}

.ap-list__key {
  font-family: "SF Mono", Consolas, Monaco, monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  border: 1px solid var(--el-border-color-lighter);
}

.ap-list__title {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;

  .ap-list__row:hover & { color: var(--el-color-primary); }
}

.ap-list__author {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}

.ap-list__date {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  font-family: DIN, sans-serif;
}

// ── Pagination ──
.ap-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 14px;
  border-top: 1px dashed var(--el-border-color-lighter);
}
</style>