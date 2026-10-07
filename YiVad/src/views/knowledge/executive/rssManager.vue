<template>
  <div class="rss-role">
    <div class="rss-role__header">
      <el-breadcrumb separator="/" class="rss-role__breadcrumb">
        <el-breadcrumb-item :to="{ path: '/knowledge/executive' }">{{
          t("rss.manager.breadcrumb.executive")
        }}</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/knowledge/executive/rssOverview' }">{{
          t("rss.manager.breadcrumb.rss")
        }}</el-breadcrumb-item>
        <el-breadcrumb-item>{{ roleData.name }}</el-breadcrumb-item>
      </el-breadcrumb>
      <RoleNav v-model="selectedRoles" multiple all :counts="roleCounts" />
    </div>

    <!-- Sticky Header Bar -->
    <div class="rss-role__sticky-bar">
      <div class="rss-role__sticky-top">
        <div class="rss-role__sticky-left">
          <span class="rss-role__sticky-icon">{{ stickyIcon }}</span>
          <div class="rss-role__sticky-info">
            <h1 class="rss-role__sticky-name">{{ stickyTitle }}</h1>
            <p class="rss-role__sticky-desc">{{ stickyDesc }}</p>
          </div>
        </div>
        <div class="rss-role__sticky-right">
          <div
            class="rss-role__stat-pill rss-role__stat-pill--feeds"
            :title="t('rss.manager.sticky.viewFeeds')"
            @click="switchTab('seeds')"
          >
            <span class="rss-role__stat-pill-icon">📡</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-value">{{ animatedFeeds }}</span>
              <span class="rss-role__stat-pill-label">{{ t("rss.manager.sticky.feeds") }}</span>
            </span>
          </div>
          <div
            class="rss-role__stat-pill rss-role__stat-pill--articles"
            :title="t('rss.manager.sticky.viewArticles')"
            @click="switchTab('items')"
          >
            <span class="rss-role__stat-pill-icon">📄</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-value">{{ animatedArticles }}</span>
              <span class="rss-role__stat-pill-label">{{ t("rss.manager.sticky.articles") }}</span>
            </span>
          </div>
          <div
            class="rss-role__stat-pill rss-role__stat-pill--accent"
            :title="t('rss.manager.sticky.backToBriefing')"
            @click="goToBriefingToday"
          >
            <span class="rss-role__stat-pill-icon">⚡</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-value">
                {{ animatedToday }}
                <span
                  v-if="todayDelta !== 0"
                  class="rss-role__stat-pill-delta"
                  :class="todayDelta > 0 ? 'is-up' : 'is-down'"
                  >{{ todayDelta > 0 ? "+" : "" }}{{ todayDelta }}</span
                >
              </span>
              <span class="rss-role__stat-pill-label">{{ t("rss.manager.sticky.today") }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="rss-role__body">
      <nav class="rss-role__sidebar">
        <div class="rss-role__sidebar-title">{{ t("rss.manager.sidebar.sections") }}</div>
        <div class="rss-role__sidebar-view">
          <template v-if="activeTab === 'briefing'">
            <el-radio-group v-model="briefingViewMode" size="small">
              <el-radio-button value="list">{{ t("rss.manager.sidebar.view.list") }}</el-radio-button>
              <el-radio-button value="card">{{ t("rss.manager.sidebar.view.card") }}</el-radio-button>
              <el-radio-button value="table">{{ t("rss.manager.sidebar.view.table") }}</el-radio-button>
            </el-radio-group>
          </template>
          <template v-else-if="activeTab === 'seeds'">
            <el-radio-group v-model="seedsViewMode" size="small">
              <el-radio-button value="table">{{ t("rss.manager.sidebar.view.table") }}</el-radio-button>
              <el-radio-button value="card">{{ t("rss.manager.sidebar.view.card") }}</el-radio-button>
            </el-radio-group>
          </template>
          <template v-else>
            <el-radio-group v-model="itemsViewMode" size="small">
              <el-radio-button value="card">{{ t("rss.manager.sidebar.view.card") }}</el-radio-button>
              <el-radio-button value="list">{{ t("rss.manager.sidebar.view.list") }}</el-radio-button>
              <el-radio-button value="table">{{ t("rss.manager.sidebar.view.table") }}</el-radio-button>
            </el-radio-group>
          </template>
        </div>
        <button
          class="rss-role__sidebar-item"
          :class="{ 'is-active': activeTab === 'briefing' }"
          @click="switchTab('briefing')"
        >
          <span class="rss-role__sidebar-icon">📰</span>
          <span class="rss-role__sidebar-label">{{ t("rss.manager.sidebar.tabs.briefing") }}</span>
          <span class="rss-role__sidebar-badge" :data-count="todayCount">{{ todayCount }}</span>
        </button>
        <button class="rss-role__sidebar-item" :class="{ 'is-active': activeTab === 'seeds' }" @click="switchTab('seeds')">
          <span class="rss-role__sidebar-icon">📡</span>
          <span class="rss-role__sidebar-label">{{ t("rss.manager.sidebar.tabs.seeds") }}</span>
          <span class="rss-role__sidebar-badge" :data-count="feedsCount">{{ feedsCount }}</span>
        </button>
        <button class="rss-role__sidebar-item" :class="{ 'is-active': activeTab === 'items' }" @click="switchTab('items')">
          <span class="rss-role__sidebar-icon">📄</span>
          <span class="rss-role__sidebar-label">{{ t("rss.manager.sidebar.tabs.items") }}</span>
          <span class="rss-role__sidebar-badge" :data-count="totalItems">{{ totalItems }}</span>
        </button>
      </nav>

      <div class="rss-role__content">
        <FeedsSection
          v-if="activeTab === 'seeds'"
          :selected-roles="selectedRoles"
          :view-mode="seedsViewMode"
          @items-changed="onDataChanged"
        />
        <ItemsSection
          v-if="activeTab === 'items'"
          :selected-roles="selectedRoles"
          :view-mode="itemsViewMode"
          @view-article="openArticleDetail"
          @items-changed="onDataChanged"
        />
        <BriefingSection
          v-if="activeTab === 'briefing'"
          :selected-roles="selectedRoles"
          :view-mode="briefingViewMode"
          @view-article="openArticleDetail"
          @briefing-changed="onDataChanged"
        />
      </div>
    </div>

    <!-- Article Detail Dialog -->
    <ArticleDetailDialog
      :visible="articleDetailVisible"
      :detail-article="detailArticle"
      :article-body="articleBody"
      :article-body-loading="articleBodyLoading"
      :article-body-error="articleBodyError"
      :rendered-article-body="renderedArticleBody"
      @update:visible="articleDetailVisible = $event"
      @open-link="onArticleLinkOpen"
    />
  </div>
</template>

<script setup lang="ts" name="rssManager">
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  getSeedList,
  getRssList,
  type RssSeedDocument,
  type RssItemDocument
} from "@/api/modules/rssService";
import RoleNav from "@/views/knowledge/components/RoleNav.vue";
import { ROLE_IDS, rolesData } from "@/views/knowledge/executive/okrData";
import { useCountUp } from "@/hooks/useCountUp";
import FeedsSection from "./rssManager/FeedsSection.vue";
import ItemsSection from "./rssManager/ItemsSection.vue";
import BriefingSection from "./rssManager/BriefingSection.vue";
import ArticleDetailDialog from "./rssManager/ArticleDetailDialog.vue";
import { useArticleViewer } from "./rssManager/useArticleViewer";

const { t, locale } = useI18n();
const localeTag = computed(() => (locale.value === "zh" ? "zh-CN" : "en-US"));

const props = withDefaults(defineProps<{ roleId?: string }>(), { roleId: "executive" });
const roleData = computed(() => rolesData[props.roleId] || rolesData.executive);

const activeTab = ref("briefing");

/** Role-based filtering. */
const selectedRoles = ref<string[]>([props.roleId]);

const stickyIcon = computed(() => {
  if (selectedRoles.value.length === 0) return "🌐";
  if (selectedRoles.value.length === 1) return rolesData[selectedRoles.value[0]]?.icon || "📡";
  return "📡";
});
const stickyTitle = computed(() => {
  if (selectedRoles.value.length === 0) return t("rss.manager.sticky.allRolesTitle");
  if (selectedRoles.value.length === 1)
    return t("rss.manager.sticky.singleRoleTitle", { name: rolesData[selectedRoles.value[0]]?.name || "" });
  return t("rss.manager.sticky.multiRoleTitle", { n: selectedRoles.value.length });
});
const stickyDesc = computed(() => {
  if (selectedRoles.value.length === 0)
    return t("rss.manager.sticky.allRolesDesc", {
      feeds: feedsCount.value,
      articles: totalItems.value,
      today: todayCount.value
    });
  if (selectedRoles.value.length === 1) return rolesData[selectedRoles.value[0]]?.description || "";
  return rolesData[selectedRoles.value[0]]?.description || "";
});

// ── View modes ──
const briefingViewMode = ref<"list" | "card" | "table">("list");
const seedsViewMode = ref<"table" | "card">("table");
const itemsViewMode = ref<"card" | "list" | "table">("table");

// ── Stats ──
const feedsCount = ref(0);
const totalItems = ref(0);
const todayCount = ref(0);

async function loadStats() {
  try {
    const [seedRes, itemRes] = await Promise.all([
      getSeedList({ pageSize: 1 }),
      getRssList({ pageSize: 1 })
    ]);
    feedsCount.value = seedRes.data?.total ?? 0;
    totalItems.value = itemRes.data?.total ?? 0;
  } catch {
    feedsCount.value = 0;
    totalItems.value = 0;
  }
  loadTodayCount();
}

async function loadTodayCount() {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const base = { pageNum: 1, pageSize: 1, publishedStart: startOfDay.getTime(), publishedEnd: endOfDay.getTime() };
    const roles = selectedRoles.value.length ? selectedRoles.value : [];
    if (!roles.length) {
      const res = await getRssList(base);
      todayCount.value = res.data?.total ?? 0;
    } else if (roles.length === 1) {
      const res = await getRssList({ ...base, categoryPrefix: roles[0] });
      todayCount.value = res.data?.total ?? 0;
    } else {
      const results = await Promise.allSettled(roles.map(rid => getRssList({ ...base, categoryPrefix: rid })));
      todayCount.value = results.reduce((sum, r) => sum + (r.status === "fulfilled" ? (r.value.data?.total ?? 0) : 0), 0);
    }
  } catch {
    todayCount.value = 0;
  }
}

// Volume for todayDelta
const VOLUME_DAYS = 14;
const dailyVolume = ref<{ date: string; count: number }[]>([]);

async function loadDailyVolume() {
  const roles = selectedRoles.value.length ? selectedRoles.value : [];
  const days: { date: string; start: number; end: number }[] = [];
  for (let i = VOLUME_DAYS - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
    days.push({
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      start,
      end
    });
  }
  try {
    const results = await Promise.allSettled(
      days.map(async day => {
        const base = { pageNum: 1, pageSize: 1, publishedStart: day.start, publishedEnd: day.end };
        if (!roles.length) return (await getRssList(base)).data?.total ?? 0;
        if (roles.length === 1) return (await getRssList({ ...base, categoryPrefix: roles[0] })).data?.total ?? 0;
        const per = await Promise.allSettled(roles.map(rid => getRssList({ ...base, categoryPrefix: rid })));
        return per.reduce((sum, r) => sum + (r.status === "fulfilled" ? (r.value.data?.total ?? 0) : 0), 0);
      })
    );
    dailyVolume.value = days.map((day, i) => ({
      date: day.date,
      count: results[i].status === "fulfilled" ? results[i].value : 0
    }));
  } catch {
    dailyVolume.value = days.map(d => ({ date: d.date, count: 0 }));
  }
}

const todayDelta = computed(() => {
  const v = dailyVolume.value;
  if (v.length < 2) return 0;
  return v[v.length - 1].count - v[v.length - 2].count;
});

const animatedFeeds = useCountUp(() => feedsCount.value);
const animatedArticles = useCountUp(() => totalItems.value);
const animatedToday = useCountUp(() => todayCount.value);

// ── Role counts for RoleNav ──
const seedsCache = ref<RssSeedDocument[]>([]);
async function loadSeedsForCounts() {
  try {
    const res = await getSeedList({ pageSize: 100 });
    seedsCache.value = res.data?.list ?? [];
  } catch {
    seedsCache.value = [];
  }
}

function roleFromCategory(cat?: string): string {
  if (!cat) return "";
  return cat.split("/")[0] || "";
}

const roleCounts = computed(() => {
  const counts: Record<string, number> = { all: 0 };
  for (const rid of ROLE_IDS) {
    counts[rid] = seedsCache.value.filter(s => roleFromCategory(s.category) === rid).length;
    counts.all += counts[rid];
  }
  return counts;
});

// ── Article viewer (shared across sections) ──
const {
  articleDetailVisible,
  detailArticle,
  articleBody,
  articleBodyLoading,
  articleBodyError,
  renderedArticleBody,
  openArticleDetail
} = useArticleViewer();

function onArticleLinkOpen(item: RssItemDocument) {
  if (item.link) window.open(item.link, "_blank", "noopener,noreferrer");
}

// ── Tab switching ──
function switchTab(tab: "briefing" | "seeds" | "items") {
  activeTab.value = tab;
}

function goToBriefingToday() {
  switchTab("briefing");
}

// ── Data changed handler ──
function onDataChanged() {
  loadTodayCount();
  loadStats();
}

onMounted(() => {
  loadSeedsForCounts();
  loadStats();
  loadDailyVolume();
});

watch(selectedRoles, () => {
  loadTodayCount();
  loadDailyVolume();
  loadSeedsForCounts();
  loadStats();
}, { deep: true });

watch(
  () => props.roleId,
  () => {
    selectedRoles.value = [props.roleId];
  }
);
</script>

<style scoped lang="scss">
.rss-role {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 95px);
  min-height: 0;
  overflow: auto;
  background: var(--el-bg-color-page);
}

// ── Header ──
.rss-role__header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px 10px;
  background: var(--el-bg-color-page);
}
.rss-role__breadcrumb {
  flex-shrink: 0;
}

// ── Sticky Header Bar ──
.rss-role__sticky-bar {
  position: sticky;
  top: 46px;
  z-index: 9;
  padding: 14px 20px 16px;
  margin: 0 24px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 6%);
  backdrop-filter: blur(8px);
}
.rss-role__sticky-top {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.rss-role__sticky-left {
  display: flex;
  flex: 1;
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}
.rss-role__sticky-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 22px;
  background: var(--el-color-primary-light-9);
  border-radius: 12px;
}
.rss-role__sticky-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.rss-role__sticky-name {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
}
.rss-role__sticky-desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 12px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}
.rss-role__sticky-right {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
}
.rss-role__stat-pill {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 92px;
  padding: 6px 14px;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border-radius: 10px;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover {
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    transform: translateY(-1px);
  }
}
.rss-role__stat-pill--feeds {
  background: var(--el-color-primary-light-9);
}
.rss-role__stat-pill--accent {
  background: var(--el-color-primary-light-8);
}
.rss-role__stat-pill-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  font-size: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
}
.rss-role__stat-pill-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.rss-role__stat-pill-value {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.rss-role__stat-pill--feeds .rss-role__stat-pill-value,
.rss-role__stat-pill--accent .rss-role__stat-pill-value {
  color: var(--el-color-primary);
}
.rss-role__stat-pill-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.rss-role__stat-pill-delta {
  margin-left: 4px;
  font-size: 11px;
  font-weight: 700;
  &.is-up {
    color: #67c23a;
  }
  &.is-down {
    color: #f56c6c;
  }
}

// ── Body ──
.rss-role__body {
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;
  margin: 12px 24px 0;
}

// ── Sidebar ──
.rss-role__sidebar {
  position: sticky;
  top: 170px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  align-self: flex-start;
  width: 200px;
  padding: 8px 10px 12px;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.rss-role__sidebar-title {
  padding: 2px 14px 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.rss-role__sidebar-item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition: all 0.15s;
  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }
  &.is-active {
    font-weight: 600;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    box-shadow: inset 3px 0 0 var(--el-color-primary);
  }
}
.rss-role__sidebar-icon {
  flex-shrink: 0;
  font-size: 18px;
}
.rss-role__sidebar-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}
.rss-role__sidebar-badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 10px;
  .rss-role__sidebar-item.is-active & {
    color: #ffffff;
    background: var(--el-color-primary);
  }
}
.rss-role__sidebar-view {
  padding: 4px 8px 8px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 4px 0;
    font-size: 12px;
    text-align: center;
  }
}

// ── Content ──
.rss-role__content {
  flex: 1;
  min-width: 0;
  margin-left: 16px;
  overflow: auto;
}
</style>