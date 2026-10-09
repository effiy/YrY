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
            <div v-if="dailyVolume.length" class="rss-role__sticky-spark" :title="t('rss.manager.sticky.sparkTitle')" @click="scrollToVolumeChart" role="button" tabindex="0">
              <svg viewBox="0 0 140 26" preserveAspectRatio="none" class="rss-role__sticky-spark-svg">
                <defs>
                  <linearGradient id="sparkFillGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="var(--el-color-primary)" stop-opacity="0.35" />
                    <stop offset="100%" stop-color="var(--el-color-primary)" stop-opacity="0" />
                  </linearGradient>
                </defs>
                <path :d="sparkAreaPath" fill="url(#sparkFillGrad)" />
                <path :d="sparkLinePath" fill="none" stroke="var(--el-color-primary)" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
                <circle v-if="sparkLastDot" :cx="sparkLastDot.x" :cy="sparkLastDot.y" r="2.4" fill="var(--el-color-primary)" />
              </svg>
              <span class="rss-role__sticky-spark-meta">
                <span class="rss-role__sticky-spark-peak" :title="t('rss.manager.sticky.peak')">
                  <i class="rss-role__sticky-spark-peak-dot"></i>{{ sparkPeak.date }} · {{ sparkPeak.count }}
                </span>
                <span class="rss-role__sticky-spark-total" :title="t('rss.manager.sticky.fourteenTotal')">
                  Σ{{ sparkFourteenTotal }}
                </span>
              </span>
            </div>
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
              <span class="rss-role__stat-pill-label">{{ t("rss.manager.sticky.feeds") }}</span>
              <span class="rss-role__stat-pill-value">{{ animatedFeeds }}</span>
            </span>
          </div>
          <div
            class="rss-role__stat-pill rss-role__stat-pill--articles"
            :title="t('rss.manager.sticky.viewArticles')"
            @click="switchTab('items')"
          >
            <span class="rss-role__stat-pill-icon">📄</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-label">{{ t("rss.manager.sticky.articles") }}</span>
              <span class="rss-role__stat-pill-value">{{ animatedArticles }}</span>
            </span>
          </div>
          <div
            class="rss-role__stat-pill rss-role__stat-pill--accent"
            :class="{ 'is-empty': todayCount === 0, 'is-parsing': anyParseLoading }"
            :title="anyParseLoading
              ? t('rss.manager.sticky.parsingInProgress')
              : todayCount === 0
                ? t('rss.manager.sticky.backToBriefingEmpty')
                : t('rss.manager.sticky.backToBriefing')"
            @click="goToBriefingToday"
          >
            <span class="rss-role__stat-pill-icon">⚡</span>
            <span class="rss-role__stat-pill-info">
              <span class="rss-role__stat-pill-label">{{ t("rss.manager.sticky.today") }}</span>
              <span class="rss-role__stat-pill-value">
                {{ animatedToday }}
                <span
                  v-if="todayDelta !== 0"
                  class="rss-role__stat-pill-delta"
                  :class="todayDelta > 0 ? 'is-up' : 'is-down'"
                  >{{ todayDelta > 0 ? "+" : "" }}{{ todayDelta }}</span
                >
              </span>
            </span>
            <span v-if="todayCount === 0" class="rss-role__stat-pill-cta" @click.stop="switchTab('seeds')">{{
              t("rss.manager.sticky.todayAddSeeds")
            }}</span>
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
          ref="feedsSectionRef"
          :selected-roles="selectedRoles"
          :view-mode="seedsViewMode"
          @items-changed="onDataChanged"
        />
        <ItemsSection
          v-if="activeTab === 'items'"
          ref="itemsSectionRef"
          :selected-roles="selectedRoles"
          :view-mode="itemsViewMode"
          @view-article="openArticleDetail"
          @items-changed="onDataChanged"
        />
        <BriefingSection
          v-if="activeTab === 'briefing'"
          ref="briefingSectionRef"
          :selected-roles="selectedRoles"
          :view-mode="briefingViewMode"
          :today-count="todayCount"
          @view-article="openArticleDetail"
          @briefing-changed="onDataChanged"
          @jump-tab="(tab) => switchTab(tab as any)"
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, markRaw } from "vue";
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
import { DisposerBag } from "@/utils/disposer";
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
  const names = selectedRoles.value
    .slice(0, 3)
    .map(rid => rolesData[rid]?.name || rid)
    .join(" · ");
  const extra = selectedRoles.value.length - 3;
  return t("rss.manager.sticky.multiRolesDesc", {
    names,
    extra: extra > 0 ? extra : 0,
    feeds: feedsCount.value,
    articles: totalItems.value
  });
});

// ── View modes ──
const briefingViewMode = ref<"list" | "card" | "table">("list");
const seedsViewMode = ref<"table" | "card">("table");
const itemsViewMode = ref<"card" | "list" | "table">("table");

// ── Stats & request orchestration ──
const feedsCount = ref(0);
const totalItems = ref(0);
const todayCount = ref(0);

// ── Section refs (for shortcut focusSearch) ──
const briefingSectionRef = ref<InstanceType<typeof BriefingSection> | null>(null);
const feedsSectionRef = ref<InstanceType<typeof FeedsSection> | null>(null);
const itemsSectionRef = ref<InstanceType<typeof ItemsSection> | null>(null);

// J/K list navigation — shared across tabs that render a list of items
const listFocusIndex = ref(-1);
watch(
  [() => activeTab.value, () => itemsViewMode.value, () => briefingViewMode.value],
  () => {
    listFocusIndex.value = -1;
    clearListFocusClass();
  }
);

function clearListFocusClass() {
  document.querySelectorAll<HTMLElement>("[data-rss-row-focus]").forEach(el => {
    el.classList.remove("is-focused");
    el.removeAttribute("data-rss-row-focus");
  });
}
function markListFocus(el?: HTMLElement | null) {
  clearListFocusClass();
  if (el) {
    el.classList.add("is-focused");
    el.setAttribute("data-rss-row-focus", "1");
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }
}

/**
 * 遍历当前 active tab 中可聚焦的列表行，返回 HTMLElement[]。
 * · briefing list mode → .rss-briefing__item
 * · items list mode    → .rss-role__items-list-row
 * · items table mode   → .el-table__body tr
 * · 其他模式           → []
 */
function getCurrentListRows(): HTMLElement[] {
  const content = document.querySelector<HTMLElement>(".rss-role__content");
  if (!content) return [];
  const selector = activeTab.value === "items"
    ? itemsViewMode.value === "list"
      ? ".rss-role__items-list-row"
      : itemsViewMode.value === "table"
        ? ".el-table__body-wrapper .el-table__row"
        : ""
    : activeTab.value === "briefing" && briefingViewMode.value === "list"
      ? ".rss-briefing__item"
      : "";
  if (!selector) return [];
  return Array.from(content.querySelectorAll<HTMLElement>(selector));
}

function moveListFocus(delta: 1 | -1) {
  const rows = getCurrentListRows();
  if (!rows.length) return;
  let next = listFocusIndex.value + delta;
  if (next < 0) next = 0;
  if (next >= rows.length) next = rows.length - 1;
  listFocusIndex.value = next;
  markListFocus(rows[next]);
}

// 每类请求维护一个"最新版本号"控制器，请求返回时若版本号过期则丢弃响应
// （符合 YiVad 竞态治理 Hard Constraints：不允许用外部 signal 直接覆盖内部）
type AbortEntry = { ctrl: AbortController; version: number };
const inflight = new Map<string, AbortEntry>();
const versions = new Map<string, number>();
const bag = markRaw(new DisposerBag());

function beginRequest(key: string): { signal: AbortSignal; version: number; isStale: () => boolean } {
  // 取消同 key 的旧请求
  const prev = inflight.get(key);
  if (prev) {
    try {
      prev.ctrl.abort();
    } catch {
      /* noop */
    }
  }
  const ctrl = new AbortController();
  bag.addAbort(ctrl);
  const version = (versions.get(key) ?? 0) + 1;
  versions.set(key, version);
  inflight.set(key, { ctrl, version });
  return {
    signal: ctrl.signal,
    version,
    isStale: () => (versions.get(key) ?? 0) !== version
  };
}

function endRequest(key: string) {
  const entry = inflight.get(key);
  if (entry) inflight.delete(key);
}

function isCancel(e: unknown): boolean {
  if (!e) return false;
  const name = (e as any)?.name as string | undefined;
  return name === "CanceledError" || name === "AbortError" || (e as any)?.code === "ERR_CANCELED";
}

async function loadStats() {
  const req = beginRequest("stats");
  try {
    const [seedRes, itemRes] = await Promise.all([
      getSeedList({ pageSize: 1 }, { timeout: 8000, signal: req.signal }),
      getRssList({ pageSize: 1 }, { timeout: 8000, signal: req.signal })
    ]);
    if (req.isStale()) return;
    feedsCount.value = seedRes.data?.total ?? 0;
    totalItems.value = itemRes.data?.total ?? 0;
  } catch (e) {
    if (isCancel(e)) return;
    feedsCount.value = 0;
    totalItems.value = 0;
  } finally {
    if (!req.isStale()) endRequest("stats");
  }
  loadTodayCount();
}

async function loadTodayCount() {
  const req = beginRequest("todayCount");
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    const base = { pageNum: 1, pageSize: 1, publishedStart: startOfDay.getTime(), publishedEnd: endOfDay.getTime() };
    const roles = selectedRoles.value.length ? selectedRoles.value : [];
    let count = 0;
    if (!roles.length) {
      const res = await getRssList(base, { timeout: 8000, signal: req.signal });
      count = res.data?.total ?? 0;
    } else if (roles.length === 1) {
      const res = await getRssList({ ...base, categoryPrefix: roles[0] }, { timeout: 8000, signal: req.signal });
      count = res.data?.total ?? 0;
    } else {
      const results = await Promise.allSettled(
        roles.map(rid => getRssList({ ...base, categoryPrefix: rid }, { timeout: 8000, signal: req.signal }))
      );
      count = results.reduce((sum, r) => sum + (r.status === "fulfilled" ? (r.value.data?.total ?? 0) : 0), 0);
    }
    if (!req.isStale()) todayCount.value = count;
  } catch (e) {
    if (isCancel(e)) return;
    todayCount.value = 0;
  } finally {
    if (!req.isStale()) endRequest("todayCount");
  }
}

// Volume for todayDelta
const VOLUME_DAYS = 14;
const dailyVolume = ref<{ date: string; count: number }[]>([]);

async function loadDailyVolume() {
  const req = beginRequest("dailyVolume");
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
        if (!roles.length)
          return (await getRssList(base, { timeout: 10000, signal: req.signal })).data?.total ?? 0;
        if (roles.length === 1)
          return (
            await getRssList({ ...base, categoryPrefix: roles[0] }, { timeout: 10000, signal: req.signal })
          ).data?.total ?? 0;
        const per = await Promise.allSettled(
          roles.map(rid =>
            getRssList({ ...base, categoryPrefix: rid }, { timeout: 10000, signal: req.signal })
          )
        );
        return per.reduce((sum, r) => sum + (r.status === "fulfilled" ? (r.value.data?.total ?? 0) : 0), 0);
      })
    );
    if (req.isStale()) return;
    dailyVolume.value = days.map((day, i) => ({
      date: day.date,
      count: results[i].status === "fulfilled" ? results[i].value : 0
    }));
  } catch (e) {
    if (isCancel(e)) return;
    dailyVolume.value = days.map(d => ({ date: d.date, count: 0 }));
  } finally {
    if (!req.isStale()) endRequest("dailyVolume");
  }
}

const todayDelta = computed(() => {
  const v = dailyVolume.value;
  if (v.length < 2) return 0;
  return v[v.length - 1].count - v[v.length - 2].count;
});

// ── Sparkline (SVG path, 140 × 26 viewBox) ──
const SPARK_W = 140;
const SPARK_H = 26;
const SPARK_PAD_Y = 2;

const sparkStats = computed(() => {
  const v = dailyVolume.value;
  if (!v.length) return { max: 0, sum: 0, peak: { date: "", count: 0 } };
  let max = 0;
  let sum = 0;
  let peakIdx = 0;
  for (let i = 0; i < v.length; i++) {
    const c = v[i].count || 0;
    sum += c;
    if (c > max) {
      max = c;
      peakIdx = i;
    }
  }
  return { max, sum, peak: { date: v[peakIdx].date.slice(5), count: v[peakIdx].count } };
});

const sparkPeak = computed(() => sparkStats.value.peak);
const sparkFourteenTotal = computed(() => sparkStats.value.sum);

function sparkY(v: number, max: number): number {
  if (max <= 0) return SPARK_H - SPARK_PAD_Y;
  const ratio = v / max;
  const usableH = SPARK_H - SPARK_PAD_Y * 2;
  return SPARK_H - SPARK_PAD_Y - ratio * usableH;
}

const sparkLinePath = computed(() => {
  const v = dailyVolume.value;
  if (!v.length) return "";
  const n = v.length;
  const stepX = n > 1 ? SPARK_W / (n - 1) : SPARK_W;
  const { max } = sparkStats.value;
  return v
    .map((p, i) => {
      const x = i * stepX;
      const y = sparkY(p.count || 0, max);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
});

const sparkAreaPath = computed(() => {
  const line = sparkLinePath.value;
  if (!line) return "";
  const v = dailyVolume.value;
  const n = v.length;
  const stepX = n > 1 ? SPARK_W / (n - 1) : SPARK_W;
  const lastX = (n - 1) * stepX;
  const baseY = SPARK_H;
  return `${line} L${lastX.toFixed(1)},${baseY} L0,${baseY} Z`;
});

const sparkLastDot = computed(() => {
  const v = dailyVolume.value;
  if (!v.length) return null;
  const n = v.length;
  const stepX = n > 1 ? SPARK_W / (n - 1) : SPARK_W;
  const { max } = sparkStats.value;
  const x = (n - 1) * stepX;
  const y = sparkY(v[n - 1].count || 0, max);
  return { x, y };
});

const animatedFeeds = useCountUp(() => feedsCount.value);
const animatedArticles = useCountUp(() => totalItems.value);
const animatedToday = useCountUp(() => todayCount.value);

// ── Role counts for RoleNav (fetch full seeds list instead of a single 100-page slice) ──
const seedsCache = ref<RssSeedDocument[]>([]);
const seedsCountsLoading = ref(false);
async function loadSeedsForCounts() {
  if (seedsCountsLoading.value) return;
  const req = beginRequest("seedsCounts");
  seedsCountsLoading.value = true;
  try {
    const first = await getSeedList({ pageNum: 1, pageSize: 500 }, { timeout: 12000, signal: req.signal });
    if (req.isStale()) return;
    const total = first.data?.total ?? 0;
    const list: RssSeedDocument[] = [...(first.data?.list ?? [])];
    const pageSize = 500;
    const fetched = list.length;
    if (total > fetched && !req.isStale()) {
      const pages = Math.ceil(total / pageSize);
      const remainders = await Promise.allSettled(
        Array.from({ length: pages - 1 }, (_, k) =>
          getSeedList({ pageNum: k + 2, pageSize }, { timeout: 12000, signal: req.signal })
        )
      );
      if (!req.isStale()) {
        for (const r of remainders) {
          if (r.status === "fulfilled") list.push(...(r.value.data?.list ?? []));
        }
      }
    }
    if (!req.isStale()) seedsCache.value = list;
  } catch (e) {
    if (isCancel(e)) return;
    seedsCache.value = [];
  } finally {
    seedsCountsLoading.value = false;
    if (!req.isStale()) endRequest("seedsCounts");
  }
}

function roleFromCategory(cat?: string): string {
  if (!cat) return "";
  return cat.split("/")[0] || "";
}

const roleCounts = computed(() => {
  const counts: Record<string, number> = { all: 0 };
  let categorizedTotal = 0;
  for (const rid of ROLE_IDS) {
    const c = seedsCache.value.filter(s => roleFromCategory(s.category) === rid).length;
    counts[rid] = c;
    categorizedTotal += c;
  }
  counts.all = categorizedTotal + seedsCache.value.filter(s => !ROLE_IDS.includes(roleFromCategory(s.category) as typeof ROLE_IDS[number])).length;
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
  nextTick(() => {
    const content = document.querySelector<HTMLElement>(".rss-role__content");
    if (content) content.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function goToBriefingToday() {
  switchTab("briefing");
}

/**
 * P2-7：从 sticky sparkline 点击跳转回 Briefing → 滚动到 Volume 图并临时高亮。
 */
function scrollToVolumeChart() {
  switchTab("briefing");
  nextTick(() => {
    const target = document.querySelector<HTMLElement>(".rss-briefing__chart--full");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    target.style.outline = "2px solid var(--el-color-primary)";
    target.style.outlineOffset = "2px";
    target.style.borderRadius = "12px";
    target.style.transition = "box-shadow 180ms ease, outline-color 180ms ease";
    target.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--el-color-primary) 20%, transparent)";
    bag.addTimer?.(setTimeout(() => {
      try {
        target.style.outline = "";
        target.style.outlineOffset = "";
        target.style.boxShadow = "";
        target.style.borderRadius = "";
      } catch { /* noop */ }
    }, 2000));
  });
}

/**
 * P2-8：FeedsSection 的 parseAllLoading（或各 seed 的 parse-one）会让 Today pill pulsate。
 * FeedsSection ref 可能为 null（未切到 seeds tab），所以需空保护。
 * BriefingSection / Feeds 的 addSuggestedSeed 内部 parseOneSeed 最佳 effort，不单独列在这里（UI 用按钮 loading 提示）。
 */
const anyParseLoading = computed<boolean>(
  () => feedsSectionRef.value?.parseAllLoading === true
);


// ── Data changed handler ──
function onDataChanged() {
  loadTodayCount();
  loadStats();
  loadSeedsForCounts();
  loadDailyVolume();
}

let rolesWatchTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleReloadAll() {
  if (rolesWatchTimer !== null) {
    clearTimeout(rolesWatchTimer);
    rolesWatchTimer = null;
  }
  // Cancel ongoing requests before issuing fresh ones to avoid stale overrides
  for (const key of ["todayCount", "dailyVolume", "seedsCounts", "stats"]) {
    const entry = inflight.get(key);
    if (entry) {
      try {
        entry.ctrl.abort();
      } catch {
        /* noop */
      }
      inflight.delete(key);
    }
  }
  rolesWatchTimer = setTimeout(() => {
    rolesWatchTimer = null;
    loadTodayCount();
    loadDailyVolume();
    loadSeedsForCounts();
    loadStats();
  }, 180);
}

onMounted(() => {
  loadSeedsForCounts();
  loadStats();
  loadDailyVolume();

  // ── Global shortcuts ──
  const isEditable = (el: EventTarget | null) => {
    if (!(el instanceof HTMLElement)) return false;
    const tag = el.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || el.isContentEditable) return true;
    // element-plus select / date-picker 激活态内的 input 也会被 tag 匹配
    return false;
  };

  const focusActiveTabSearch = () => {
    nextTick(() => {
      if (activeTab.value === "briefing") {
        const el = document.querySelector<HTMLElement>(
          ".rss-briefing__toolbar .el-input__inner"
        ) ?? document.querySelector<HTMLElement>(
          ".rss-role__section:first-of-type .rss-role__toolbar .el-input__inner"
        );
        el?.focus?.();
      } else if (activeTab.value === "seeds") {
        const el = document.querySelector<HTMLElement>(
          ".rss-role__content .rss-role__section:nth-of-type(1) .rss-role__toolbar .el-input__inner"
        );
        el?.focus?.();
      } else {
        const el = document.querySelector<HTMLElement>(
          ".rss-role__content .rss-role__section:nth-of-type(1) .rss-role__toolbar .el-input__inner"
        );
        el?.focus?.();
      }
    });
  };

  const onKey = (e: KeyboardEvent) => {
    // Cmd/Ctrl + K → focus search of the active tab
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      e.stopPropagation();
      focusActiveTabSearch();
      return;
    }
    if (isEditable(e.target)) return;
    if (e.key === "1") { switchTab("briefing"); }
    else if (e.key === "2") { switchTab("seeds"); }
    else if (e.key === "3") { switchTab("items"); }
    else if (e.key === "j" || e.key === "J") { moveListFocus(1); }
    else if (e.key === "k" || e.key === "K") { moveListFocus(-1); }
    else if (e.key === "Enter") {
      const focused = document.querySelector<HTMLElement>("[data-rss-row-focus='1']");
      if (focused) {
        focused.click();
      }
    }
  };

  window.addEventListener("keydown", onKey, true);
  bag.addFn(() => window.removeEventListener("keydown", onKey, true));
});

onBeforeUnmount(() => {
  if (rolesWatchTimer !== null) {
    clearTimeout(rolesWatchTimer);
    rolesWatchTimer = null;
  }
  bag.dispose();
});

watch(selectedRoles, () => {
  scheduleReloadAll();
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
  background:
    radial-gradient(1200px 360px at 10% -120%, var(--el-color-primary-light-9), transparent 70%),
    var(--el-bg-color-page);
  scroll-behavior: smooth;

  // Scrollbar polish
  &::-webkit-scrollbar { width: 10px; height: 10px; }
  &::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--el-text-color-secondary) 18%, transparent);
    border-radius: 999px;
  }
}

// ── Header ──
.rss-role__header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px 10px;
  background: color-mix(in srgb, var(--el-bg-color-page) 92%, transparent);
  backdrop-filter: saturate(1.2) blur(8px);
  -webkit-backdrop-filter: saturate(1.2) blur(8px);
  border-bottom: 1px solid color-mix(in srgb, var(--el-border-color-lighter) 80%, transparent);
}
.rss-role__breadcrumb {
  flex-shrink: 0;
  font-size: 13px;
}

// ── Sticky Header Bar ──
.rss-role__sticky-bar {
  position: sticky;
  top: 52px;
  z-index: 15;
  padding: 14px 18px 16px;
  margin: 10px 24px 0;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--el-color-primary) 5%, var(--el-bg-color)), var(--el-bg-color));
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 16px;
  box-shadow:
    0 1px 0 color-mix(in srgb, var(--el-bg-color) 90%, #ffffff 10%) inset,
    0 10px 30px -22px color-mix(in srgb, var(--el-color-primary) 55%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  &:hover {
    border-color: color-mix(in srgb, var(--el-color-primary) 25%, var(--el-border-color-lighter));
  }
}
.rss-role__sticky-top {
  display: flex;
  gap: 14px;
  align-items: stretch;
  justify-content: space-between;
}
.rss-role__sticky-left {
  display: flex;
  flex: 1;
  gap: 14px;
  align-items: flex-start;
  min-width: 0;
}
.rss-role__sticky-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 24px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 14px;
  box-shadow: 0 6px 18px -10px color-mix(in srgb, var(--el-color-primary) 60%, transparent);
}
.rss-role__sticky-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
}
.rss-role__sticky-name {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.01em;
  background: linear-gradient(90deg, var(--el-text-color-primary), color-mix(in srgb, var(--el-color-primary) 65%, var(--el-text-color-primary)));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.rss-role__sticky-desc {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-line-clamp: 2;
  max-width: 680px;
  font-size: 12px;
  line-height: 1.55;
  color: var(--el-text-color-secondary);
  -webkit-box-orient: vertical;
}

// ── Sparkline ──
.rss-role__sticky-spark {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 8px 12px;
  margin-top: 2px;
  background: color-mix(in srgb, var(--el-fill-color-light) 70%, transparent);
  border: 1px dashed var(--el-border-color-lighter);
  border-radius: 12px;
  cursor: pointer;
  user-select: none;
  transition: border-color 0.2s ease, background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  outline: none;
  &:hover,
  &:focus-visible {
    border-color: color-mix(in srgb, var(--el-color-primary) 45%, var(--el-border-color-lighter));
    background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
    transform: translateY(-1px);
    box-shadow: 0 6px 16px -10px color-mix(in srgb, var(--el-color-primary) 55%, transparent);
  }
}
.rss-role__sticky-spark-svg {
  flex-shrink: 0;
  width: 180px;
  height: 34px;
  min-width: 0;
}
.rss-role__sticky-spark-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  font-size: 11px;
  line-height: 1.3;
}
.rss-role__sticky-spark-peak {
  display: inline-flex;
  gap: 5px;
  align-items: center;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}
.rss-role__sticky-spark-peak-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  background: var(--el-color-primary);
  border-radius: 999px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-primary) 22%, transparent);
}
.rss-role__sticky-spark-total {
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

.rss-role__sticky-right {
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  gap: 8px;
  align-items: stretch;
  justify-content: flex-end;
  max-width: 58%;
}
.rss-role__stat-pill {
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 112px;
  padding: 8px 14px 8px 10px;
  overflow: hidden;
  cursor: pointer;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  transition: transform 0.18s cubic-bezier(0.2, 0.9, 0.3, 1.2), box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(120px 40px at 100% 0%, color-mix(in srgb, var(--el-color-primary) 18%, transparent), transparent 60%);
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  &:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--el-color-primary) 40%, var(--el-border-color-lighter));
    box-shadow: 0 10px 24px -18px color-mix(in srgb, var(--el-color-primary) 70%, transparent);
    &::before { opacity: 1; }
  }
  &:active { transform: translateY(0); }
}
.rss-role__stat-pill--feeds {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), color-mix(in srgb, var(--el-color-primary-light-8) 60%, var(--el-fill-color-light)));
  border-color: var(--el-color-primary-light-7);
}
.rss-role__stat-pill--articles {
  background: linear-gradient(135deg, var(--el-bg-color), var(--el-fill-color-light));
}
.rss-role__stat-pill--accent {
  background: linear-gradient(135deg, var(--el-color-primary-light-9), var(--el-color-primary-light-8));
  border-color: var(--el-color-primary-light-6);
  box-shadow: 0 6px 18px -16px color-mix(in srgb, var(--el-color-primary) 80%, transparent);
}
.rss-role__stat-pill--accent.is-empty {
  background:
    repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--el-color-warning-light-9) 60%, transparent),
      color-mix(in srgb, var(--el-color-warning-light-9) 60%, transparent) 8px,
      color-mix(in srgb, var(--el-color-warning-light-8) 40%, transparent) 8px,
      color-mix(in srgb, var(--el-color-warning-light-8) 40%, transparent) 16px
    );
  border-color: var(--el-color-warning-light-6);
  .rss-role__stat-pill-value { color: var(--el-color-warning); }
  .rss-role__stat-pill-label { color: var(--el-color-warning-dark-2); }
}
.rss-role__stat-pill-icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  font-size: 17px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 3%);
}
.rss-role__stat-pill-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.rss-role__stat-pill-value {
  display: inline-flex;
  align-items: baseline;
  font-family: DIN, ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--el-text-color-primary);
}
.rss-role__stat-pill--feeds .rss-role__stat-pill-value,
.rss-role__stat-pill--accent .rss-role__stat-pill-value {
  color: var(--el-color-primary);
}
.rss-role__stat-pill-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.rss-role__stat-pill-delta {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 700;
  &.is-up {
    color: #67c23a;
    &::before { content: "▲"; margin-right: 1px; }
  }
  &.is-down {
    color: #f56c6c;
    &::before { content: "▼"; margin-right: 1px; }
  }
}
.rss-role__stat-pill-cta {
  align-self: center;
  padding: 4px 8px;
  margin-left: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-color-warning-dark-2);
  white-space: nowrap;
  background: var(--el-bg-color);
  border: 1px solid var(--el-color-warning-light-6);
  border-radius: 999px;
  transition: all 0.15s ease;
  &:hover {
    color: #ffffff;
    background: var(--el-color-warning);
    border-color: var(--el-color-warning);
  }
}

// ── Body ──
.rss-role__body {
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;
  padding: 14px 24px 24px;
}

// ── Sidebar ──
.rss-role__sidebar {
  position: sticky;
  top: 178px;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 4px;
  align-self: flex-start;
  width: 216px;
  padding: 10px 10px 14px;
  overflow: hidden;
  background: linear-gradient(180deg, var(--el-bg-color), color-mix(in srgb, var(--el-bg-color) 85%, var(--el-fill-color-light)));
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  box-shadow: 0 8px 28px -24px rgb(0 0 0 / 14%);
}
.rss-role__sidebar-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px 10px;
  font-size: 11px;
  font-weight: 800;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    margin-left: 10px;
    background: linear-gradient(90deg, var(--el-border-color-lighter), transparent);
  }
}
.rss-role__sidebar-view {
  padding: 4px 8px 12px;
  margin-bottom: 4px;
  border-bottom: 1px dashed var(--el-border-color-lighter);
  /*
   * 注意：避免在 :deep() 选择器上做 BEM 后缀（如 :deep(.el-radio-button) &__inner）
   * 否则 vue sfc scss compiler 会抛 "Selector can't have a suffix"。
   * 这里用并列展开写法，保持 scoped 正确作用到 Element Plus 子组件内部。
   */
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
    padding: 2px;
    background: var(--el-fill-color-lighter);
    border-radius: 10px;
  }
  :deep(.el-radio-button) {
    flex: 1;
    box-shadow: none !important;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 5px 0;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    color: var(--el-text-color-secondary);
    background: transparent !important;
    border: none !important;
    border-radius: 8px !important;
  }
  :deep(.el-radio-button.is-active .el-radio-button__inner) {
    color: var(--el-color-primary);
    background: var(--el-bg-color) !important;
    box-shadow: 0 2px 6px -2px color-mix(in srgb, var(--el-color-primary) 40%, transparent);
  }
}
.rss-role__sidebar-item {
  position: relative;
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
  border-radius: 10px;
  transition: all 0.15s ease;
  &:hover {
    color: var(--el-text-color-primary);
    background: color-mix(in srgb, var(--el-color-primary-light-9) 70%, transparent);
    transform: translateX(2px);
  }
  &.is-active {
    font-weight: 700;
    color: var(--el-color-primary);
    background: linear-gradient(90deg, var(--el-color-primary-light-9), color-mix(in srgb, var(--el-color-primary-light-9) 50%, transparent));
    &::before {
      content: "";
      position: absolute;
      top: 8px;
      bottom: 8px;
      left: 0;
      width: 3px;
      background: linear-gradient(180deg, var(--el-color-primary), color-mix(in srgb, var(--el-color-primary) 50%, transparent));
      border-radius: 999px;
    }
  }
}
.rss-role__sidebar-icon {
  flex-shrink: 0;
  font-size: 17px;
  filter: drop-shadow(0 1px 0 rgb(255 255 255 / 40%));
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
  min-width: 24px;
  height: 20px;
  padding: 0 7px;
  font-family: DIN, ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  font-weight: 800;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  border-radius: 999px;
  transition: all 0.18s ease;
  .rss-role__sidebar-item.is-active & {
    color: #ffffff;
    background: linear-gradient(135deg, var(--el-color-primary), color-mix(in srgb, var(--el-color-primary) 70%, #409EFF 80%));
    box-shadow: 0 4px 10px -4px color-mix(in srgb, var(--el-color-primary) 70%, transparent);
  }
}

// ── Content ──
.rss-role__content {
  flex: 1;
  min-width: 0;
  margin-left: 16px;
  overflow: visible;
  scroll-behavior: smooth;
}

// ── Responsive ──
@media (max-width: 1200px) {
  .rss-role__sticky-right { max-width: 100%; }
  .rss-role__sticky-spark-svg { width: 140px; }
}
@media (max-width: 960px) {
  .rss-role__body {
    flex-direction: column;
    padding: 12px 16px 20px;
  }
  .rss-role__sticky-bar { margin: 8px 16px 0; padding: 12px; }
  .rss-role__sticky-top { flex-direction: column; }
  .rss-role__sticky-right {
    justify-content: flex-start;
    max-width: 100%;
  }
  .rss-role__header { padding: 10px 16px 8px; }
  .rss-role__sidebar {
    position: relative;
    top: 0;
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    margin-bottom: 12px;
    .rss-role__sidebar-title { width: 100%; }
    .rss-role__sidebar-view {
      border-bottom: none;
      border-right: 1px dashed var(--el-border-color-lighter);
      margin-bottom: 0;
      margin-right: 8px;
      width: auto;
      :deep(.el-radio-group) { min-width: 180px; }
    }
    .rss-role__sidebar-item {
      flex: 1 1 auto;
      width: auto;
      min-width: 140px;
    }
  }
  .rss-role__content { margin-left: 0; }
  .rss-role__sticky-spark { display: none; }
}

// ── J/K list focus highlight (global; row selectors cover list/table + briefing) ──
:global(.rss-role__items-list-row.is-focused),
:global(.el-table__body-wrapper .el-table__row.is-focused > td),
:global(.rss-briefing__item.is-focused) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: -1px;
  background-color: var(--el-color-primary-light-9) !important;
  border-radius: 6px;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--el-color-primary) 12%, transparent);
}
</style>