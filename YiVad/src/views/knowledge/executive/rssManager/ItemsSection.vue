<template>
  <section class="rss-role__section">
    <div class="rss-role__section-head">
      <h2 class="rss-role__section-title">{{ t("rss.manager.items.title") }}</h2>
      <span class="rss-role__result-count">{{
        t("rss.manager.items.resultCount", { filtered: filteredItems.length, total: totalItems })
      }}</span>
      <span class="rss-role__toolbar-right">
        <el-button v-if="selectedItems.length" type="danger" size="small" @click="onBatchDelete">{{
          t("rss.manager.items.batchDelete", { n: selectedItems.length })
        }}</el-button>
        <el-button v-if="hasActiveFilters" size="small" text @click="clearFilters">{{
          t("rss.manager.items.clearFilters")
        }}</el-button>
        <el-button size="small" text :icon="Download" :loading="exportingItems" @click="exportItems">{{
          t("rss.manager.items.exportBtn")
        }}</el-button>
        <el-button size="small" text :icon="Refresh" @click="loadItems">{{ t("rss.manager.items.refresh") }}</el-button>
      </span>
    </div>

    <div class="rss-role__section-body">
      <div class="rss-role__toolbar">
        <el-input
          v-model="itemSearch"
          :placeholder="t('rss.manager.items.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 180px"
          @clear="onItemFilterChange"
          @keyup.enter="onItemFilterChange"
        />
        <el-select
          v-model="itemCategoryFilter"
          :placeholder="t('rss.manager.items.categoryAll')"
          clearable
          style="width: 160px"
          @change="onItemFilterChange"
        >
          <el-option v-for="c in categoryOptions" :key="c.value" :label="`${c.icon} ${c.label}`" :value="c.value" />
        </el-select>
        <el-select
          v-model="itemSourceFilter"
          :placeholder="t('rss.manager.items.sourceAll')"
          clearable
          style="width: 140px"
          @change="onItemFilterChange"
        >
          <el-option v-for="s in seedOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-radio-group v-model="timePreset" size="small" @change="setTimePreset">
          <el-radio-button value="all">{{ t("rss.manager.items.timePreset.all") }}</el-radio-button>
          <el-radio-button value="today">{{ t("rss.manager.items.timePreset.today") }}</el-radio-button>
          <el-radio-button value="week">{{ t("rss.manager.items.timePreset.week") }}</el-radio-button>
          <el-radio-button value="month">{{ t("rss.manager.items.timePreset.month") }}</el-radio-button>
        </el-radio-group>
        <el-date-picker
          v-model="itemDateRange"
          type="daterange"
          range-separator="~"
          :start-placeholder="t('rss.manager.items.dateRange.from')"
          :end-placeholder="t('rss.manager.items.dateRange.to')"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 220px"
          @change="
            timePreset = '';
            onItemFilterChange();
          "
        />
        <el-select v-model="itemSortKey" style="width: 110px" @change="onItemFilterChange">
          <el-option :label="t('rss.manager.items.sort.newest')" value="published_parsed" />
          <el-option :label="t('rss.manager.items.sort.oldest')" value="published_parsed-asc" />
          <el-option :label="t('rss.manager.items.sort.source')" value="source_name" />
          <el-option :label="t('rss.manager.items.sort.category')" value="category_path" />
        </el-select>
      </div>

      <div v-if="hasActiveFilters" class="rss-role__active-filters">
        <el-tag
          v-if="itemSearch"
          size="small"
          closable
          @close="
            itemSearch = '';
            onItemFilterChange();
          "
          >{{ t("rss.manager.items.activeFilters.search", { value: itemSearch }) }}</el-tag
        >
        <el-tag
          v-if="itemCategoryFilter"
          size="small"
          closable
          @close="
            itemCategoryFilter = '';
            onItemFilterChange();
          "
          >{{ t("rss.manager.items.activeFilters.category", { value: itemCategoryFilter }) }}</el-tag
        >
        <el-tag
          v-if="itemSourceFilter"
          size="small"
          closable
          @close="
            itemSourceFilter = '';
            onItemFilterChange();
          "
          >{{ t("rss.manager.items.activeFilters.source", { value: itemSourceFilter }) }}</el-tag
        >
        <el-tag
          v-if="itemDateRange"
          size="small"
          closable
          @close="
            itemDateRange = null;
            timePreset = 'all';
            onItemFilterChange();
          "
          >{{ t("rss.manager.items.activeFilters.date", { from: itemDateRange[0], to: itemDateRange[1] }) }}</el-tag
        >
      </div>

      <div v-if="recentArticles.length" class="rss-role__recent-strip">
        <span class="rss-role__recent-label">{{ t("rss.manager.items.recent.label") }}</span>
        <button
          v-for="a in recentArticles"
          :key="a.key ?? a.link"
          class="rss-role__recent-chip"
          :title="a.link"
          @click="openArticleLink(a)"
        >
          <span class="rss-role__recent-dot" :style="{ background: roleColor(a.category_path) }"></span>
          {{ a.title }}
        </button>
        <button
          class="rss-role__recent-clear"
          :title="t('rss.manager.items.recent.clearTitle')"
          @click="clearRecentArticles"
        >
          {{ t("rss.manager.items.recent.clear") }}
        </button>
      </div>

      <!-- Table view -->
      <el-table
        v-if="viewMode === 'table'"
        :data="filteredItems"
        v-loading="itemsLoading"
        stripe
        border
        style="width: 100%"
        row-key="key"
        :empty-text="
          itemsLoading
            ? ''
            : items.length || hasActiveFilters
              ? t('rss.manager.items.table.noData.filtered')
              : t('rss.manager.items.table.noData.empty')
        "
        highlight-current-row
        @selection-change="onSelectionChange"
        @row-click="onArticleRowClick"
      >
        <el-table-column type="selection" width="40" />
        <el-table-column :label="t('rss.manager.items.table.title')" min-width="340">
          <template #default="{ row }">
            <div class="rss-role__item-title">
              <a
                :href="(row as RssItemDocument).link"
                target="_blank"
                rel="noopener noreferrer"
                class="rss-role__item-link"
                @click.stop
              >
                {{ (row as RssItemDocument).title }}
              </a>
              <div class="rss-role__item-meta">
                <span class="rss-role__item-source">{{ (row as RssItemDocument).source_name }}</span>
                <template v-if="(row as RssItemDocument).author"> · {{ (row as RssItemDocument).author }}</template>
                <span v-if="(row as RssItemDocument).summary" class="rss-role__item-summary-inline">
                  · {{ trimSummary((row as RssItemDocument).summary!) }}</span
                >
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.items.table.published')" width="130" align="center">
          <template #default="{ row }">
            <el-tooltip :content="formatDate((row as RssItemDocument).published)" placement="top" :show-after="400">
              <span class="rss-role__date">{{ formatRelativeTime((row as RssItemDocument).published) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.items.table.category')" width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="subCategory((row as RssItemDocument).category_path)" class="rss-role__cat-chip">
              <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssItemDocument).category_path) }"></span
              >{{ subCategory((row as RssItemDocument).category_path) }}
            </span>
            <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('rss.manager.items.table.actions')" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              text
              :icon="View"
              :title="t('rss.manager.items.table.detail')"
              @click.stop="onViewDetail(row as RssItemDocument)"
            />
            <el-popconfirm
              :title="t('rss.manager.items.table.deleteConfirm')"
              @confirm="onDeleteItem(row as RssItemDocument)"
            >
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Card view -->
      <div v-else-if="viewMode === 'card'" v-loading="itemsLoading" class="rss-role__items-grid">
        <div v-if="!itemsLoading && !filteredItems.length" class="rss-role__items-empty">
          <template v-if="items.length || hasActiveFilters">
            <p>{{ t("rss.manager.items.empty.noMatch") }}</p>
            <p class="rss-role__items-empty-hint">{{ t("rss.manager.items.empty.noMatchHint") }}</p>
            <el-button v-if="hasActiveFilters" size="small" text type="primary" @click="clearFilters">{{
              t("rss.manager.items.empty.clearFilters")
            }}</el-button>
          </template>
          <template v-else>
            <p>{{ t("rss.manager.items.empty.noItems") }}</p>
          </template>
        </div>
        <el-card
          v-for="item in filteredItems"
          :key="item.key"
          class="rss-role__item-card"
          shadow="hover"
          @click="onArticleRowClick(item)"
        >
          <div class="rss-role__item-card-top">
            <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
          </div>
          <p class="rss-role__item-card-title">
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="rss-role__item-link"
              @click.stop
              >{{ item.title }}</a
            >
            <span v-else>{{ item.title }}</span>
          </p>
          <div class="rss-role__item-card-meta">
            <span class="rss-role__item-source">{{ item.source_name }}</span>
            <template v-if="item.author"> · {{ item.author }}</template>
            <template v-if="subCategory(item.category_path)">
              · <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span
              >{{ subCategory(item.category_path) }}</template
            >
          </div>
          <p v-if="item.summary" class="rss-role__item-card-summary">{{ trimSummary(item.summary) }}</p>
          <div class="rss-role__item-card-actions">
            <el-button
              size="small"
              text
              :icon="View"
              :title="t('rss.manager.items.table.detail')"
              @click.stop="onViewDetail(item)"
            />
            <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="onDeleteItem(item)">
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>

      <!-- List view -->
      <div v-else v-loading="itemsLoading" class="rss-role__items-list">
        <div v-if="!itemsLoading && !filteredItems.length" class="rss-role__items-empty">
          <template v-if="items.length || hasActiveFilters">
            <p>{{ t("rss.manager.items.empty.noMatch") }}</p>
            <p class="rss-role__items-empty-hint">{{ t("rss.manager.items.empty.noMatchHint") }}</p>
            <el-button v-if="hasActiveFilters" size="small" text type="primary" @click="clearFilters">{{
              t("rss.manager.items.empty.clearFilters")
            }}</el-button>
          </template>
          <template v-else>
            <p>{{ t("rss.manager.items.empty.noItems") }}</p>
          </template>
        </div>
        <div
          v-for="item in filteredItems"
          :key="item.key"
          class="rss-role__items-list-row"
          @click="onArticleRowClick(item)"
        >
          <span class="rss-role__items-list-source">{{ item.source_name }}</span>
          <span class="rss-role__items-list-title">
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              rel="noopener noreferrer"
              class="rss-role__item-link"
              @click.stop
              >{{ item.title }}</a
            >
            <span v-else>{{ item.title }}</span>
          </span>
          <span class="rss-role__items-list-date">{{ formatRelativeTime(item.published) }}</span>
          <div class="rss-role__items-list-actions">
            <el-button
              size="small"
              text
              :icon="View"
              :title="t('rss.manager.items.table.detail')"
              @click.stop="onViewDetail(item)"
            />
            <el-popconfirm :title="t('rss.manager.items.table.deleteConfirm')" @confirm="onDeleteItem(item)">
              <template #reference>
                <el-button size="small" text type="danger" :icon="Delete" @click.stop />
              </template>
            </el-popconfirm>
          </div>
        </div>
      </div>

      <div class="rss-role__pagination">
        <el-pagination
          v-model:current-page="itemPage"
          :page-size="itemPageSize"
          :total="totalItems"
          layout="prev,pager,next,total"
          background
          @current-change="loadItems"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch, ref, computed } from "vue";
import { Search, Refresh, Download, View, Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { toRef } from "vue";
import type { RssSeedDocument, RssItemDocument } from "@/api/modules/rssService";
import { roleColor as roleColorFn } from "@/views/knowledge/executive/okrData";
import { getSeedList } from "@/api/modules/rssService";
import { useItems } from "./useItems";

const props = defineProps<{
  selectedRoles: string[];
  viewMode: "card" | "list" | "table";
}>();

const emit = defineEmits<{
  "update:viewMode": [value: "card" | "list" | "table"];
  "viewArticle": [item: RssItemDocument];
  "itemsChanged": [];
}>();

const { t } = useI18n();
const roleColor = (cat?: string) => {
  const rid = cat?.split("/")[0] || "";
  return roleColorFn(rid);
};

// Load seeds for source options
const seeds = ref<RssSeedDocument[]>([]);
async function loadSeedsForOptions() {
  try {
    const res = await getSeedList();
    seeds.value = res.data?.list ?? [];
  } catch {
    seeds.value = [];
  }
}

const rolesRef = toRef(props, "selectedRoles");

const seedOptions = computed(() => {
  const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
  return seeds.value
    .filter(s => s.name && (!roleSet || roleSet.has((s.category || "").split("/")[0] || "")))
    .map(s => ({ label: s.name!, value: s.name! }));
});

const seedRef = ref<RssSeedDocument[]>([]);
watch(seeds, v => { seedRef.value = v as any; }, { immediate: true });

const {
  items,
  itemsLoading,
  itemSearch,
  itemCategoryFilter,
  itemSourceFilter,
  itemDateRange,
  timePreset,
  itemSortKey,
  itemPage,
  itemPageSize,
  totalItems,
  selectedItems,
  exportingItems,
  categoryOptions,
  filteredItems,
  hasActiveFilters,
  onSelectionChange,
  onItemFilterChange,
  clearFilters,
  setTimePreset,
  loadItems,
  exportItems,
  recentArticles,
  addRecentArticle,
  clearRecentArticles,
  onArticleRowClick,
  removeItem,
  removeBriefingItem,
  batchDelete,
  formatDate,
  formatRelativeTime,
  trimSummary,
  subCategory
} = useItems(rolesRef, seedRef);

function openArticleLink(item: RssItemDocument) {
  if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
}

function onViewDetail(row: RssItemDocument) {
  emit("viewArticle", row);
}

async function onDeleteItem(row: RssItemDocument) {
  const ok = await removeItem(row);
  if (ok) emit("itemsChanged");
}

async function onBatchDelete() {
  const ok = await batchDelete();
  if (ok) emit("itemsChanged");
}

onMounted(() => {
  loadSeedsForOptions();
  loadItems();
});

watch(rolesRef, () => {
  itemPage.value = 1;
  loadItems();
  loadSeedsForOptions();
}, { deep: true });
</script>


<style scoped lang="scss">
@use "./ItemsSection.scss";
</style>
