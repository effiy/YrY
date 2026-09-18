<template>
  <div class="rss-content-box">
    <RssSkeleton v-if="loading && !stats" />
    <RssError v-else-if="error" :message="error" @retry="retry" />

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
            :body-missing-active="bodyMissingActive"
            @clear-all="() => clearAllFilters(clearFilterDate)"
            @filter-body-missing="bodyMissingActive = !bodyMissingActive"
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

      <div v-if="recentArticles.length" class="rss-recent">
        <div class="rss-recent__title">Recent Articles</div>
        <div class="rss-recent__list">
          <div
            v-for="a in recentArticles"
            :key="a.link"
            class="rss-recent__item"
            :title="a.title"
            @click="openOriginal({ link: a.link } as any)"
          >
            <span class="rss-recent__source">{{ a.source_name }}</span>
            <span class="rss-recent__item-title">{{ a.title }}</span>
            <span class="rss-recent__date">{{ formatDate(a.published) }}</span>
          </div>
        </div>
      </div>

      <div v-if="activeFilters.length" class="issue-list__pills">
        <span class="issue-list__pills-label">Filters</span>
        <el-tag
          v-for="f in activeFilters"
          :key="f.key"
          closable
          size="small"
          :type="f.type"
          @close="clearFilter(f.key, clearFilterDate)"
          >{{ f.label }}</el-tag
        >
        <el-button size="small" text type="primary" @click="clearAllFilters(clearFilterDate)">Clear all</el-button>
      </div>

      <div class="issue-list__body">
        <el-tooltip :content="sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'" placement="right">
          <div class="issue-list__sidebar-toggle" @click="sidebarOpen = !sidebarOpen">
            <el-icon :size="12"><component :is="sidebarOpen ? DArrowLeft : DArrowRight" /></el-icon>
          </div>
        </el-tooltip>
        <Transition name="sidebar-slide">
          <RssSidebar
            v-if="sidebarOpen"
            v-model:view-mode="viewMode"
            :sources="stats?.sources ?? []"
            :source-filter="sourceFilter"
            @toggle-source="toggleSource"
            @clear-source-filter="clearSourceFilter"
            @select-all-sources="onSelectAllSources"
          />
        </Transition>
        <div class="issue-list__main">
          <RssArticlePanel
            :articles="displayedArticles"
            :total="displayedTotal"
            :loading="articlesLoading"
            :sources="stats?.sources ?? []"
            :categories="stats?.categories ?? []"
            :source-filter="sourceFilter"
            :category-filter="categoryFilter"
            :search="search"
            :view-mode="viewMode"
            :last-updated="lastUpdated"
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
import { ref, computed, watch, nextTick } from "vue";
import { Reading, DArrowLeft, DArrowRight } from "@element-plus/icons-vue";
import { PageHeaderCard, KnowledgePreviewDialog } from "@/components";
import { updateRssItem, type RssItemDocument } from "@/api/modules/rssService";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";
import { useRssContent } from "./composables/useRssContent";
import { useArticleFilters } from "./composables/useArticleFilters";
import StatPills from "./components/StatPills.vue";
import RssSidebar from "./components/RssSidebar.vue";
import RssCharts from "./components/RssCharts.vue";
import RssArticlePanel from "./components/RssArticlePanel.vue";
import RssSkeleton from "./components/RssSkeleton.vue";
import RssError from "./components/RssError.vue";
import { formatDate, buildFallbackContent } from "./utils";
import type { KnowledgeMeta } from "@/api/interface/yiAi";

const {
  stats,
  loading,
  error,
  articles,
  articlesTotal,
  articlesLoading,
  filterDate,
  filterDateLabel,
  isFilterToday,
  filterDateStr,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate,
  retry,
  reloadArticles
} = useRssContent();

const {
  search,
  sourceFilter,
  categoryFilter,
  tagFilter,
  orderType,
  activeFilters,
  onSourceFilterChange,
  onCategoryFilterChange,
  onSearchChange,
  toggleSource,
  clearSourceFilter,
  onSelectAllSources,
  setCategoryFilter,
  setTagFilter,
  clearFilter,
  clearAllFilters,
  onSortChange
} = useArticleFilters(reloadArticles, filterDateLabel, filterDateStr);

const viewMode = ref<"table" | "card" | "list">("table");
const sidebarOpen = ref(true);
const lastUpdated = ref<number | null>(null);
const bodyMissingActive = ref(false);

const bodyMissingPct = computed(() => {
  const t = stats.value?.total ?? 0;
  return t ? Math.round(((stats.value?.body_missing ?? 0) / t) * 100) : 0;
});

const recentArticles = computed(() => stats.value?.recent ?? []);

// Client-side body-missing filter
const displayedArticles = computed(() => (bodyMissingActive.value ? articles.value.filter(a => a.body_missing) : articles.value));
const displayedTotal = computed(() => (bodyMissingActive.value ? displayedArticles.value.length : articlesTotal.value));

watch(articles, () => {
  lastUpdated.value = Date.now();
});

function onPageChange(_page: number) {}
function onSizeChange(_size: number) {}

// ── Preview ──
const previewDlg = ref<InstanceType<typeof KnowledgePreviewDialog> | null>(null);

function patchRssItemLocally(key: string, patch: Partial<RssItemDocument>) {
  for (const it of articles.value) if (it.key === key) Object.assign(it, patch);
}

async function openDetail(row: RssItemDocument) {
  if (!row) return;
  if (!previewDlg.value) {
    await nextTick();
    if (!previewDlg.value) return;
  }
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
  previewDlg.value.openFile({
    path: actualPath,
    title: row.title || "Untitled",
    content,
    onSave: async () => {}
  });
}

function openOriginal(row?: RssItemDocument | null) {
  if (row?.link) window.open(row.link, "_blank", "noopener,noreferrer");
}
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>
