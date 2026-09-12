<template>
  <div class="rss-content-box">
    <!-- Loading -->
    <RssSkeleton v-if="loading && !stats" />

    <!-- Error -->
    <RssError v-else-if="error" :message="error" @retry="retry" />

    <!-- Normal -->
    <template v-else>
      <PageHeaderCard
        :icon="Reading"
        icon-bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        title="RSS Content"
        description="Aggregated articles from configured feeds"
        :sticky="true"
        :show-date-nav="true"
        :filter-date="filterDate"
        :filter-date-label="filterDateLabel"
        :is-filter-today="isFilterToday"
        @prev="goToPrevDay"
        @next="goToNextDay"
        @today="goToFilterToday"
        @clear="clearFilterDate"
      >
        <template #pills>
          <StatPills
            :total="stats?.total ?? 0"
            :sources-count="stats?.sources.length ?? 0"
            :categories-count="stats?.categories.length ?? 0"
            :body-missing-pct="bodyMissingPct"
            @clear-all="clearAllFilters"
          />
        </template>
      </PageHeaderCard>

      <RssCharts
        :stats="stats"
        :category-filter="categoryFilter"
        :source-filter="sourceFilter"
        @toggle-source="toggleSource"
        @update:category-filter="setCategoryFilter"
      />

      <div v-if="activeFilters.length" class="issue-list__pills">
        <span class="issue-list__pills-label">Filters</span>
        <el-tag v-for="f in activeFilters" :key="f.key" closable size="small" :type="f.type" @close="clearFilter(f.key)">{{ f.label }}</el-tag>
        <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
      </div>

      <div class="issue-list__body">
        <RssSidebar
          v-model:view-mode="viewMode"
          :sources="stats?.sources ?? []"
          :source-filter="sourceFilter"
          @toggle-source="toggleSource"
          @clear-source-filter="clearSourceFilter"
        />
        <div class="issue-list__main">
          <RssArticlePanel
            :articles="articles"
            :total="articlesTotal"
            :loading="articlesLoading"
            :sources="stats?.sources ?? []"
            :categories="stats?.categories ?? []"
            :source-filter="sourceFilter"
            :category-filter="categoryFilter"
            :search="search"
            :view-mode="viewMode"
            @update:source-filter="onSourceFilterChange"
            @update:category-filter="onCategoryFilterChange"
            @update:search="onSearchChange"
            @open-detail="openDetail"
            @open-original="openOriginal"
            @set-category="setCategoryFilter"
            @set-tag="setTagFilter"
            @sort-change="onSortChange"
            @page-change="onPageChange"
            @size-change="onSizeChange"
          />
        </div>
      </div>
    </template>

    <KnowledgePreviewDialog ref="previewDlg" />
  </div>
</template>

<script setup lang="ts" name="rssContent">
import { ref, computed, nextTick } from "vue";
import { Reading } from "@element-plus/icons-vue";
import { PageHeaderCard, KnowledgePreviewDialog } from "@/components";
import { getRssList, updateRssItem, type RssItemDocument, type RssListParams } from "@/api/modules/rssService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useRssContent } from "./composables/useRssContent";
import StatPills from "./components/StatPills.vue";
import RssSidebar from "./components/RssSidebar.vue";
import RssCharts from "./components/RssCharts.vue";
import RssArticlePanel from "./components/RssArticlePanel.vue";
import RssSkeleton from "./components/RssSkeleton.vue";
import RssError from "./components/RssError.vue";
import type { KnowledgeMeta } from "@/api/interface/yiAi";

// ── Data loading ──
const {
  stats, loading, error,
  articles, articlesTotal, articlesLoading,
  filterDate, filterDateLabel, isFilterToday, filterDateStr,
  goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate,
  retry, reloadArticles,
} = useRssContent();

// ── Filter state ──
const search = ref("");
const sourceFilter = ref<string[]>([]);
const categoryFilter = ref("");
const tagFilter = ref("");
const viewMode = ref<"table" | "card" | "list">("table");
const orderType = ref<"asc" | "desc">("desc");

const bodyMissingPct = computed(() => {
  const total = stats.value?.total ?? 0;
  const missing = stats.value?.body_missing ?? 0;
  return total ? Math.round((missing / total) * 100) : 0;
});

// ── Filter pills ──
interface ActiveFilter { key: string; label: string; type: "primary" | "success" | "warning" | "info" | "danger"; }

const activeFilters = computed<ActiveFilter[]>(() => {
  const list: ActiveFilter[] = [];
  if (filterDateStr.value) list.push({ key: "date", label: `Date: ${filterDateLabel.value}`, type: "danger" });
  if (search.value) list.push({ key: "search", label: `Search: ${search.value}`, type: "info" });
  if (sourceFilter.value.length) list.push({ key: "source", label: `Sources: ${sourceFilter.value.join(", ")}`, type: "primary" });
  if (categoryFilter.value) list.push({ key: "category", label: `Category: ${categoryFilter.value}`, type: "success" });
  if (tagFilter.value) list.push({ key: "tag", label: `Tag: ${tagFilter.value}`, type: "warning" });
  return list;
});

// ── Filter actions ──
function applyFilters() {
  const params: Partial<RssListParams> = { orderBy: "published_parsed", orderType: orderType.value };
  if (search.value.trim()) params.search = search.value.trim();
  if (sourceFilter.value.length) params.source_name = sourceFilter.value;
  if (categoryFilter.value) params.category_path = categoryFilter.value;
  if (tagFilter.value) params.tags = [tagFilter.value];
  reloadArticles(params);
}

function onSourceFilterChange(v: string[]) { sourceFilter.value = v; applyFilters(); }
function onCategoryFilterChange(v: string) { categoryFilter.value = v; applyFilters(); }
function onSearchChange(v: string) { search.value = v; applyFilters(); }

function toggleSource(name: string) {
  const idx = sourceFilter.value.indexOf(name);
  if (idx >= 0) sourceFilter.value.splice(idx, 1);
  else sourceFilter.value.push(name);
  applyFilters();
}

function clearSourceFilter() { sourceFilter.value = []; applyFilters(); }
function setCategoryFilter(name: string) { categoryFilter.value = name; applyFilters(); }
function setTagFilter(tag: string) { tagFilter.value = tag; applyFilters(); }

function clearFilter(key: string) {
  if (key === "date") clearFilterDate();
  else if (key === "search") search.value = "";
  else if (key === "source") sourceFilter.value = [];
  else if (key === "category") categoryFilter.value = "";
  else if (key === "tag") tagFilter.value = "";
  applyFilters();
}

function clearAllFilters() {
  filterDate.value = null;
  search.value = "";
  sourceFilter.value = [];
  categoryFilter.value = "";
  tagFilter.value = "";
  applyFilters();
}

function onSortChange(order: "asc" | "desc") {
  orderType.value = order;
  reloadArticles({ orderBy: "published_parsed", orderType: order });
}

function onPageChange(_page: number) {}
function onSizeChange(_size: number) {}

// ── Preview dialog ──
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function buildFallbackContent(row: RssItemDocument): string {
  const summary = stripHtml(row.summary || "");
  const parts: string[] = [];
  parts.push(`# ${row.title || "Untitled"}`);
  parts.push("");
  const meta: string[] = [];
  if (row.source_name) meta.push(`**Source:** ${row.source_name}`);
  if (row.category_path) meta.push(`**Category:** ${row.category_path}`);
  if (row.author) meta.push(`**Author:** ${row.author}`);
  if (row.published) meta.push(`**Published:** ${formatDate(row.published)}`);
  if (row.link) meta.push(`**Original:** [Open](${row.link})`);
  if (meta.length) { parts.push(meta.join("  \n")); parts.push(""); }
  if (row.tags?.length) { parts.push(`**Tags:** ${row.tags.map((t) => `\`${t}\``).join(" ")}`); parts.push(""); }
  parts.push("---");
  parts.push("");
  if (summary) { parts.push("## Summary"); parts.push(""); parts.push(summary); parts.push(""); }
  parts.push("> *No body file available — metadata-only record.*");
  return parts.join("\n");
}

function patchRssItemLocally(key: string, patch: Partial<RssItemDocument>) {
  for (const it of articles.value) { if (it.key === key) Object.assign(it, patch); }
}

async function openDetail(row: RssItemDocument) {
  if (!row) return;
  if (!previewDlg.value) { await nextTick(); if (!previewDlg.value) return; }
  const filePath = row.file_path;
  let content = "";
  let actualPath = filePath || "";
  if (filePath && !row.body_missing) {
    try {
      const res = await readKnowledgeFile(filePath);
      content = res.content || "";
    } catch {
      if (row.key) {
        updateRssItem(row.key, { file_path: undefined, body_missing: true }).catch(() => {});
        patchRssItemLocally(row.key, { file_path: undefined, body_missing: true });
      }
      actualPath = "";
    }
  }
  if (!content) content = buildFallbackContent(row);
  const meta: KnowledgeMeta = { type: "rss-article", tags: row.tags || [], roles: row.category_path ? [row.category_path.split("/")[0]] : [] };
  previewDlg.value.openFile({ path: actualPath, title: row.title || "Untitled", content, onSave: async () => {} });
}

function openOriginal(row?: RssItemDocument | null) {
  if (row?.link) window.open(row.link, "_blank", "noopener,noreferrer");
}

function stripHtml(html: string): string {
  return (html || "").replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(val?: string): string {
  if (!val) return "";
  try { const d = new Date(val); if (isNaN(d.getTime())) return val.slice(0, 10); return d.toLocaleDateString(); } catch { return val.slice(0, 10); }
}
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>