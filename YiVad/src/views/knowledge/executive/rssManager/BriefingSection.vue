<template>
  <section class="rss-role__section">
    <div class="rss-role__section-head">
      <h2 class="rss-role__section-title">{{ t("rss.manager.briefing.title") }}</h2>
      <div class="rss-briefing__date-nav">
        <el-button size="small" :icon="ArrowLeft" text @click="goToPrevDay" :disabled="briefingLoading" />
        <span class="rss-briefing__date">{{ briefingDateLabel }}</span>
        <el-button size="small" :icon="ArrowRight" text @click="goToNextDay" :disabled="isToday" />
        <el-button v-if="!isToday" size="small" text type="primary" @click="goToToday" :disabled="briefingLoading">{{
          t("rss.manager.briefing.goToday")
        }}</el-button>
      </div>
      <el-radio-group v-if="viewMode === 'list'" v-model="briefingGroupBy" size="small">
        <el-radio-button value="source">{{ t("rss.manager.briefing.groupBy.source") }}</el-radio-button>
        <el-radio-button value="category">{{ t("rss.manager.briefing.groupBy.category") }}</el-radio-button>
      </el-radio-group>
      <span class="rss-role__toolbar-right">
        <span v-if="filteredBriefingCount" class="rss-role__result-count">{{
          t("rss.manager.briefing.resultCount", {
            count: filteredBriefingCount,
            groups: briefingGroups.length,
            unit: t("rss.manager.briefing.groupUnit." + briefingGroupBy)
          })
        }}</span>
        <el-button size="small" :icon="Refresh" @click="loadBriefing" :loading="briefingLoading">{{
          t("rss.manager.briefing.refresh")
        }}</el-button>
      </span>
    </div>

    <div v-loading="briefingLoading" class="rss-role__section-body">
      <div class="rss-role__toolbar">
        <el-input
          v-model="briefingSearch"
          :placeholder="t('rss.manager.briefing.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 180px"
        />
        <el-select
          v-model="briefingCategoryFilter"
          :placeholder="t('rss.manager.briefing.categoryAll')"
          clearable
          style="width: 180px"
        >
          <el-option v-for="c in categoryOptions" :key="c.value" :label="`${c.icon} ${c.label}`" :value="c.value" />
        </el-select>
        <el-button v-if="briefingSearch || briefingCategoryFilter" size="small" text @click="clearBriefingFilters">{{
          t("rss.manager.briefing.clear")
        }}</el-button>
      </div>

      <div v-if="briefingSearch || briefingCategoryFilter" class="rss-role__active-filters">
        <el-tag v-if="briefingSearch" size="small" closable @close="briefingSearch = ''">{{
          t("rss.manager.briefing.activeFilters.search", { value: briefingSearch })
        }}</el-tag>
        <el-tag v-if="briefingCategoryFilter" size="small" closable @close="briefingCategoryFilter = ''">{{
          t("rss.manager.briefing.activeFilters.category", { value: briefingCategoryFilter })
        }}</el-tag>
      </div>

      <div v-if="briefingCoverage" class="rss-briefing__coverage">
        <div v-for="c in briefingCoverage" :key="c.key" class="rss-briefing__coverage-item">
          <span class="rss-briefing__coverage-count" :style="{ color: coverageColor(c.pct) }">{{ c.count }}</span>
          <span class="rss-briefing__coverage-label">{{ c.label }}</span>
          <span class="rss-briefing__coverage-pct">{{ c.pct }}%</span>
        </div>
      </div>

      <div v-if="briefingItems.length || dailyVolume.length" class="rss-briefing__charts">
        <div v-if="briefingItems.length" class="rss-briefing__chart">
          <div class="rss-briefing__chart-title">{{ t("rss.manager.briefing.charts.categoryDist") }}</div>
          <ECharts :option="briefingCategoryOption" height="200" />
        </div>
        <div v-if="briefingItems.length" class="rss-briefing__chart">
          <div class="rss-briefing__chart-title">{{ t("rss.manager.briefing.charts.topSources") }}</div>
          <ECharts :option="briefingSourceOption" height="200" />
        </div>
        <div class="rss-briefing__chart rss-briefing__chart--full">
          <div class="rss-briefing__chart-title">
            {{ t("rss.manager.briefing.charts.volumeTrend", { n: dailyVolume.length }) }}
          </div>
          <ECharts :option="briefingVolumeOption" height="180" v-loading="volumeLoading" />
        </div>
      </div>

      <div v-if="!briefingLoading && !briefingItems.length" class="rss-briefing__empty">
        <span class="rss-briefing__empty-icon">{{
          isToday ? t("rss.manager.briefing.empty.todayIcon") : t("rss.manager.briefing.empty.dateIcon")
        }}</span>
        <p class="rss-briefing__empty-title">
          {{ isToday ? t("rss.manager.briefing.empty.todayTitle") : t("rss.manager.briefing.empty.dateTitle") }}
        </p>
        <p class="rss-briefing__empty-hint">
          {{ isToday ? t("rss.manager.briefing.empty.todayHint") : t("rss.manager.briefing.empty.dateHint") }}
        </p>
        <el-button v-if="!isToday" size="small" type="primary" @click="goToToday">{{
          t("rss.manager.briefing.empty.backToday")
        }}</el-button>
      </div>

      <div v-else-if="!briefingLoading && !filteredBriefingCount" class="rss-briefing__empty">
        <span class="rss-briefing__empty-icon">{{ t("rss.manager.briefing.empty.noMatchIcon") }}</span>
        <p class="rss-briefing__empty-title">{{ t("rss.manager.briefing.empty.noMatchTitle") }}</p>
        <p class="rss-briefing__empty-hint">{{ t("rss.manager.briefing.empty.noMatchHint") }}</p>
        <el-button size="small" text type="primary" @click="clearBriefingFilters">{{
          t("rss.manager.briefing.empty.clearFilters")
        }}</el-button>
      </div>

      <div v-else-if="briefingGroups.length" class="rss-briefing__groups">
        <!-- Table view -->
        <el-table
          v-if="viewMode === 'table'"
          :data="allBriefingItems"
          stripe
          border
          style="width: 100%"
          row-key="key"
          :empty-text="t('rss.manager.briefing.table.noData')"
        >
          <el-table-column :label="t('rss.manager.briefing.table.source')" width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="rss-role__item-source">{{ (row as RssItemDocument).source_name }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.title')" min-width="320">
            <template #default="{ row }">
              <a
                :href="(row as RssItemDocument).link"
                target="_blank"
                rel="noopener noreferrer"
                class="rss-role__item-link"
                @click.stop="addRecentArticle(row as RssItemDocument)"
              >
                {{ (row as RssItemDocument).title }}
              </a>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.author')" width="140" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="(row as RssItemDocument).author">{{ (row as RssItemDocument).author }}</span>
              <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.published')" width="120" align="center">
            <template #default="{ row }">
              <el-tooltip :content="formatDate((row as RssItemDocument).published)" placement="top" :show-after="400">
                <span class="rss-role__date">{{ formatRelativeTime((row as RssItemDocument).published) }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.category')" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="subCategory((row as RssItemDocument).category_path)" class="rss-role__cat-chip">
                <span class="rss-role__cat-dot" :style="{ background: roleColor((row as RssItemDocument).category_path) }"></span>
                {{ subCategory((row as RssItemDocument).category_path) }}
              </span>
              <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.summary')" min-width="240" show-overflow-tooltip>
            <template #default="{ row }">
              <span v-if="(row as RssItemDocument).summary">{{ trimSummary((row as RssItemDocument).summary!) }}</span>
              <span v-else class="rss-role__text-muted">{{ t("rss.manager.detail.fields.unknown") }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="t('rss.manager.briefing.table.actions')" width="180" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                size="small"
                text
                :icon="View"
                :title="t('rss.manager.briefing.table.detail')"
                @click.stop="onViewDetail(row as RssItemDocument)"
              />
              <el-popconfirm
                :title="t('rss.manager.briefing.table.deleteConfirm')"
                @confirm="onDeleteItem(row as RssItemDocument)"
              >
                <template #reference>
                  <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <!-- List view -->
        <template v-else-if="viewMode === 'list'">
          <section
            v-for="group in briefingGroups"
            :key="group.key"
            class="rss-briefing__group"
            :class="{ 'is-collapsed': collapsedGroups.has(group.key) }"
          >
            <header class="rss-briefing__group-header" @click="toggleGroup(group.key)">
              <span class="rss-briefing__group-chevron" :class="{ 'is-collapsed': collapsedGroups.has(group.key) }">&#x25B8;</span>
              <span v-if="group.color" class="rss-briefing__group-dot" :style="{ background: group.color }"></span>
              <span v-else class="rss-briefing__group-icon">{{ group.icon }}</span>
              <span class="rss-briefing__group-label">{{ group.label }}</span>
              <span class="rss-briefing__group-count">{{ group.items.length }}</span>
            </header>
            <ul v-show="!collapsedGroups.has(group.key)" class="rss-briefing__list">
              <li
                v-for="item in group.items"
                :key="item.key || item.link"
                class="rss-briefing__item"
                @click="onArticleRowClick(item)"
              >
                <div class="rss-briefing__item-main">
                  <div class="rss-briefing__item-head">
                    <span class="rss-briefing__item-title">{{ item.title }}</span>
                  </div>
                  <div class="rss-briefing__item-meta">
                    <template v-if="item.author">{{ item.author }} · </template>
                    <span>{{ formatRelativeTime(item.published) }}</span>
                    <template v-if="subCategory(item.category_path)">
                      · <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span
                      >{{ subCategory(item.category_path) }}
                    </template>
                  </div>
                  <p v-if="item.summary" class="rss-briefing__item-summary">{{ stripHtml(item.summary) }}</p>
                </div>
                <div class="rss-briefing__item-actions">
                  <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="onDeleteItem(item)">
                    <template #reference>
                      <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                    </template>
                  </el-popconfirm>
                </div>
              </li>
            </ul>
          </section>
        </template>
        <!-- Card view -->
        <div v-else class="rss-role__items-grid">
          <el-card
            v-for="item in allBriefingItems"
            :key="item.key || item.link"
            class="rss-role__item-card"
            shadow="hover"
            @click="onArticleRowClick(item)"
          >
            <div class="rss-role__item-card-top">
              <span class="rss-role__item-card-date">{{ formatRelativeTime(item.published) }}</span>
              <el-popconfirm :title="t('rss.manager.briefing.table.deleteConfirm')" @confirm="onDeleteItem(item)">
                <template #reference>
                  <el-button size="small" text type="danger" :icon="Delete" @click.stop />
                </template>
              </el-popconfirm>
            </div>
            <p class="rss-role__item-card-title">{{ item.title }}</p>
            <div class="rss-role__item-card-meta">
              <span v-if="item.author">{{ item.author }}</span>
              <span v-if="subCategory(item.category_path)" class="rss-role__cat-chip">
                <span class="rss-role__cat-dot" :style="{ background: roleColor(item.category_path) }"></span
                >{{ subCategory(item.category_path) }}
              </span>
            </div>
            <p v-if="item.summary" class="rss-role__item-card-summary">{{ stripHtml(item.summary) }}</p>
          </el-card>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import { Search, Refresh, ArrowLeft, ArrowRight, View, Delete } from "@element-plus/icons-vue";
import { useI18n } from "vue-i18n";
import { toRef } from "vue";
import type { RssItemDocument } from "@/api/modules/rssService";
import { deleteRssItem, getSeedList, type RssSeedDocument } from "@/api/modules/rssService";
import { ElMessage } from "element-plus";
import { roleColor as roleColorFn } from "@/views/knowledge/executive/okrData";
import ECharts from "@/components/ECharts/index.vue";
import { useRssBriefing } from "@/views/knowledge/executive/composables/useRssBriefing";
import { useFormatting } from "./useFormatting";
import { loadJson, saveJson } from "@/utils/storage";

const props = defineProps<{
  selectedRoles: string[];
  viewMode: "list" | "card" | "table";
}>();

const emit = defineEmits<{
  "update:viewMode": [value: "list" | "card" | "table"];
  "viewArticle": [item: RssItemDocument];
  "briefingChanged": [];
}>();

const { t, localeTag, subCategory, formatDate, formatRelativeTime, trimSummary, stripHtml, roleFromCategory, errorMessage } =
  useFormatting();

const roleColor = (cat?: string) => {
  const rid = cat?.split("/")[0] || "";
  return roleColorFn(rid);
};

// ── Seeds for category options ──
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
const categoryOptions = computed(() => {
  const roleSet = rolesRef.value.length ? new Set(rolesRef.value) : null;
  const seen = new Set<string>();
  const opts: { label: string; value: string; icon: string }[] = [];
  for (const s of seeds.value) {
    const cat = s.category || "";
    if (!cat || !cat.includes("/")) continue;
    const rid = roleFromCategory(cat);
    if (roleSet && !roleSet.has(rid)) continue;
    if (seen.has(cat)) continue;
    seen.add(cat);
    const sub = cat.slice(rid.length + 1);
    opts.push({ label: sub, value: cat, icon: "\uD83D\uDCC1" });
  }
  return opts.sort((a, b) => a.label.localeCompare(b.label));
});

// ── Briefing state ──
const briefingGroupBy = ref<"source" | "category">("source");
const collapsedGroups = reactive(new Set<string>());

function toggleGroup(key: string) {
  if (collapsedGroups.has(key)) {
    collapsedGroups.delete(key);
  } else {
    collapsedGroups.add(key);
  }
}

const briefingItems = ref<RssItemDocument[]>([]);

const briefingDateLabel = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  const isTodayVal = d.toDateString() === today.toDateString();
  const dateStr = d.toLocaleDateString(localeTag.value, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
  return isTodayVal ? t("rss.manager.briefing.todayLabel", { date: dateStr }) : dateStr;
});

const isToday = computed(() => {
  const d = briefingDate.value;
  const today = new Date();
  return d.toDateString() === today.toDateString();
});

const {
  briefingLoading,
  briefingDate,
  briefingSearch,
  briefingCategoryFilter,
  coverageColor,
  briefingCategoryOption,
  briefingSourceOption,
  dailyVolume,
  volumeLoading,
  loadDailyVolume,
  briefingVolumeOption,
  todayDelta,
  briefingCoverage,
  clearBriefingFilters,
  loadBriefing
} = useRssBriefing(briefingItems, rolesRef, t, localeTag, subCategory, roleColor);

// ── Briefing groups ──
interface BriefingGroup {
  key: string;
  label: string;
  icon: string;
  color?: string;
  items: RssItemDocument[];
}

const filteredBriefingItems = computed(() => {
  let list = briefingItems.value;
  if (briefingSearch.value) {
    const q = briefingSearch.value.toLowerCase();
    list = list.filter(i => [i.title, i.author, i.summary, i.source_name].some(v => !!v && v.toLowerCase().includes(q)));
  }
  if (briefingCategoryFilter.value) {
    const p = briefingCategoryFilter.value;
    list = list.filter(i => (i.category_path || "").startsWith(p));
  }
  return list;
});

const briefingGroups = computed<BriefingGroup[]>(() => {
  const byCategory = briefingGroupBy.value === "category";
  const groups = new Map<string, BriefingGroup>();
  for (const item of filteredBriefingItems.value) {
    const uncategorized = t("rss.manager.categories.uncategorized");
    const unknownSource = t("rss.manager.categories.unknownSource");
    const key = byCategory ? item.category_path || uncategorized : item.source_name || unknownSource;
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: byCategory ? subCategory(item.category_path) || uncategorized : key,
        icon: byCategory ? "\uD83D\uDCC1" : "\uD83D\uDCE1",
        color: byCategory ? roleColor(item.category_path) : undefined,
        items: []
      });
    }
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()].sort((a, b) => b.items.length - a.items.length);
});

const allBriefingItems = computed(() => briefingGroups.value.flatMap(g => g.items));
const filteredBriefingCount = computed(() => filteredBriefingItems.value.length);

// ── Date navigation ──
function goToPrevDay() {
  const d = new Date(briefingDate.value);
  d.setDate(d.getDate() - 1);
  briefingDate.value = d;
  loadBriefing();
}

function goToNextDay() {
  const d = new Date(briefingDate.value);
  d.setDate(d.getDate() + 1);
  briefingDate.value = d;
  loadBriefing();
}

function goToToday() {
  briefingDate.value = new Date();
  loadBriefing();
}

// ── Article actions ──
const RECENT_ARTICLES_KEY = "rss.recentArticles";
const MAX_RECENT_ARTICLES = 8;
const recentArticles = ref<RssItemDocument[]>(loadJson<RssItemDocument[]>(RECENT_ARTICLES_KEY, []));

function addRecentArticle(row: RssItemDocument) {
  const id = row.key ?? row.link;
  recentArticles.value = [row, ...recentArticles.value.filter(a => (a.key ?? a.link) !== id)].slice(0, MAX_RECENT_ARTICLES);
  saveJson(RECENT_ARTICLES_KEY, recentArticles.value);
}

function onArticleRowClick(row: RssItemDocument) {
  if (row.link) window.open(row.link, "_blank", "noopener,noreferrer");
  addRecentArticle(row);
}

function onViewDetail(row: RssItemDocument) {
  emit("viewArticle", row);
}

async function onDeleteItem(row: RssItemDocument) {
  if (!row.key) return;
  try {
    await deleteRssItem(row.key);
    ElMessage.success(t("rss.manager.items.delete.ok"));
    await loadBriefing();
    emit("briefingChanged");
  } catch (e) {
    ElMessage.error(errorMessage(e) || t("rss.manager.items.delete.fail"));
  }
}

onMounted(() => {
  loadBriefing();
  loadDailyVolume();
  loadSeedsForOptions();
});

watch(rolesRef, () => {
  loadBriefing();
  loadDailyVolume();
  loadSeedsForOptions();
}, { deep: true });
</script>


<style scoped lang="scss">
@use "./BriefingSection.scss";
</style>
