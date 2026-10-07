<template>
  <div class="pl page">
    <PageHeaderCard
      :icon="Tickets"
      icon-bg="linear-gradient(135deg, #409eff, #1d4ed8)"
      :title="$t('project.list.title')"
      :description="$t('project.list.description')"
      :pills="headerPills"
      :show-date-nav="true"
      :filter-date="filterDate"
      :filter-date-label="filterDateLabel"
      :is-filter-today="isFilterToday"
      @prev="goToPrevDay"
      @next="goToNextDay"
      @today="goToFilterToday"
      @clear="clearFilterDate"
    >
      <template #title-tags>
        <el-tag size="small" type="info" round>{{ countLabel }}</el-tag>
        <el-tag v-if="filterDate" size="small" type="warning" round effect="dark">
          {{ filterDateLabel }}
        </el-tag>
      </template>
    </PageHeaderCard>

    <ProjectStatTiles :tiles="tiles" :date-label="filterDate ? filterDateLabel : ''" @select="onTileSelect" />

    <div v-if="filterDate" class="pl-date-banner">
      <el-icon><Calendar /></el-icon>
      <span>{{ $t("project.list.dateBanner.showing", { date: filterDateLabel }) }}</span>
      <el-button size="small" text type="primary" @click="clearFilterDate">{{ $t("project.list.dateBanner.clear") }}</el-button>
    </div>

    <ProjectAnalytics
      v-model:expanded="analyticsExpanded"
      class="pl-analytics"
      :statuses="viewRollup.statuses"
      :open-priorities="viewRollup.openPriorities"
      :types="viewRollup.types"
      :top-projects="topProjects"
      :activity="activitySeries"
      :active-filter="activeFilter"
      :total-issues="viewRollup.issues"
      :project-count="filteredProjects.length"
      :date-label="filterDate ? filterDateLabel : ''"
      :health-counts="healthCounts"
      :efficiency="dashboard?.efficiency ?? null"
      :quality="dashboard?.quality ?? null"
      @filter="setFilter"
    />

    <ProjectAttention
      :counts="riskCounts"
      :flagged-projects="flaggedCount"
      :total-projects="projects.length"
      :active-risk="activeFilter.risk"
      @select="r => setFilter('risk', r)"
    />

    <ProjectFilterPills
      :pills="activeFilterPills"
      :has-active-filter="hasActiveFilter"
      :can-undo="canUndo"
      :match-count="filteredProjects.length"
      :total-count="projects.length"
      @remove="removeFilter"
      @undo="undoLastFilter"
      @clear-all="clearAllFilters"
    />

    <div class="pl-toolbar">
      <el-input
        ref="searchRef"
        v-model="searchText"
        class="pl-search"
        size="small"
        clearable
        :placeholder="$t('project.list.searchPlaceholder') + ' (⌘K)'"
        :prefix-icon="Search"
      />
      <div class="pl-sort-group">
        <el-select v-model="sortBy" class="pl-sort" size="small">
          <el-option :label="$t('project.list.sortBy.updated')" value="updated" />
          <el-option :label="$t('project.list.sortBy.name')" value="name" />
          <el-option :label="$t('project.list.sortBy.issues')" value="issues" />
          <el-option :label="$t('project.list.sortBy.done')" value="done" />
          <el-option :label="$t('project.list.sortBy.risk')" value="risk" />
        </el-select>
        <el-button
          class="pl-sort-dir"
          size="small"
          :icon="sortDir === 'asc' ? SortUp : SortDown"
          :title="sortDir === 'asc' ? 'Ascending' : 'Descending'"
          @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'"
        />
      </div>
      <el-select v-model="statusFilter" class="pl-status" size="small">
        <el-option :label="$t('project.list.statusFilter.all')" value="" />
        <el-option :label="$t('project.list.statusFilter.active')" value="active" />
        <el-option :label="$t('project.list.statusFilter.archived')" value="archived" />
      </el-select>
      <el-button
        :type="showStarredOnly ? 'warning' : ''"
        size="small"
        :icon="Star"
        :title="$t('project.list.starTooltip')"
        @click="showStarredOnly = !showStarredOnly"
      >
        {{ $t("project.list.starred") }}
      </el-button>
      <div class="pl-toolbar-right">
        <span v-if="lastUpdated" class="pl-updated">
          {{ $t("project.list.updated", { time: lastUpdated }) }}
          <span v-if="relativeUpdated" class="pl-updated-rel"> ({{ relativeUpdated }})</span>
          <el-tooltip v-if="dashboardGeneratedAt" :content="$t('project.list.serverComputed') + ': ' + serverFreshness" placement="top">
            <span class="pl-fresh-dot" :class="freshnessDotClass" />
          </el-tooltip>
        </span>
        <el-button size="small" :icon="Refresh" :loading="loading" :title="$t('project.list.refresh')" @click="refreshAll" />
        <el-dropdown trigger="click">
          <el-button size="small" :title="$t('project.list.more')">
            <el-icon :size="14"><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <div class="pl-more-section">
                <span class="pl-more-label">{{ $t('project.list.liveHint') }}</span>
                <el-select :model-value="pollInterval" size="small" @change="setPollInterval">
                  <el-option v-for="opt in pollOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </el-select>
              </div>
              <el-dropdown-item
                v-for="h in healthItems"
                :key="h.key"
                :command="h.key"
                @click="setFilter('health', h.key)"
              >
                <el-badge :value="h.count" :type="h.badgeType" />
                <span style="margin-left: 4px">{{ h.label }}</span>
              </el-dropdown-item>
              <el-dropdown-item
                :disabled="!displayedProjects.length"
                @click="exportCSV"
              >
                <el-icon><Download /></el-icon>
                <span style="margin-left: 4px">{{ $t('project.list.export') }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" size="small" :icon="Plus" @click="openCreate">{{ $t("project.list.newProject") }}</el-button>
        <el-radio-group v-model="viewMode" size="small">
          <el-radio-button value="grid"
            ><el-icon><Grid /></el-icon
          ></el-radio-button>
          <el-radio-button value="list"
            ><el-icon><List /></el-icon
          ></el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="pl-results">
      <!-- Skeleton loading on first load — once data is in, v-loading handles refreshes. -->
      <div v-if="loading && !projects.length" class="pl-grid">
        <div v-for="n in 6" :key="n" class="pl-skeleton-card">
          <div class="pl-skeleton-cover" />
          <div class="pl-skeleton-body">
            <div class="pl-skeleton-line pl-skeleton-line--title" />
            <div class="pl-skeleton-line" />
            <div class="pl-skeleton-line pl-skeleton-line--short" />
            <div class="pl-skeleton-line" />
            <div class="pl-skeleton-line pl-skeleton-line--short" />
          </div>
        </div>
      </div>

      <div v-else-if="viewMode === 'grid' && displayedProjects.length" v-loading="loading" class="pl-grid">
        <ProjectCard
          v-for="p in displayedProjects"
          :key="p.key"
          :project="p"
          :stats="statsFor(p.key)"
          :risks="risksFor(p.key)"
          :health="healthFor(p.key)"
          :desc-html="descHtml(p)"
          :knowledge-count="knowledgeCount(p.key)"
          :starred="starredKeys.has(p.key)"
          :selected="selectedKeys.has(p.key)"
          :deleting="deletingKeys.has(p.key)"
          @open="goDetail(p.key)"
          @edit="openEdit(p)"
          @archive="setStatus([p.key], 'archived')"
          @restore="setStatus([p.key], 'active')"
          @delete="deleteSingleProject(p.key, p.name)"
          @toggle-star="toggleStar(p.key)"
          @toggle-select="toggleSelect(p.key)"
          @copy-id="copyIdentifier(p)"
          @filter-risk="r => setFilter('risk', r)"
          @tab="tab => goTab(p.key, tab)"
        />
      </div>

      <div v-else-if="viewMode === 'list' && displayedProjects.length" v-loading="loading" class="pl-list">
        <ProjectRow
          v-for="p in displayedProjects"
          :key="p.key"
          :project="p"
          :stats="statsFor(p.key)"
          :risks="risksFor(p.key)"
          :health="healthFor(p.key)"
          :starred="starredKeys.has(p.key)"
          :selected="selectedKeys.has(p.key)"
          :deleting="deletingKeys.has(p.key)"
          @open="goDetail(p.key)"
          @edit="openEdit(p)"
          @archive="setStatus([p.key], 'archived')"
          @restore="setStatus([p.key], 'active')"
          @delete="deleteSingleProject(p.key, p.name)"
          @toggle-star="toggleStar(p.key)"
          @toggle-select="toggleSelect(p.key)"
          @copy-id="copyIdentifier(p)"
          @filter-risk="r => setFilter('risk', r)"
          @tab="tab => goTab(p.key, tab)"
        />
      </div>

      <!-- Two-tier empty state: nothing exists yet vs. nothing matches. -->
      <div v-else-if="!loading && !projects.length" class="pl-empty">
        <el-empty :description="$t('project.list.empty.noProjects')">
          <el-button type="primary" @click="openCreate">{{ $t("project.list.empty.createFirst") }}</el-button>
        </el-empty>
      </div>
      <div v-else-if="!loading" class="pl-empty">
        <el-empty :description="emptyDescription">
          <el-button v-if="searchText" size="small" @click="searchText = ''">{{
            $t("project.list.empty.clearSearch")
          }}</el-button>
          <el-button v-else size="small" @click="resetView">{{ $t("project.list.empty.clearFilters") }}</el-button>
        </el-empty>
      </div>
    </div>

    <!-- Batch bar -->
    <Transition name="pl-batch">
      <div v-if="selectedKeys.size" class="pl-batch">
        <span class="pl-batch-count">{{ $t("project.list.batch.selected", { n: selectedKeys.size }) }}</span>
        <el-button size="small" type="warning" plain @click="setStatus([...selectedKeys], 'archived')">{{
          $t("project.list.batch.archive")
        }}</el-button>
        <el-button size="small" type="success" plain @click="setStatus([...selectedKeys], 'active')">{{
          $t("project.list.batch.restore")
        }}</el-button>
        <el-button size="small" type="danger" plain @click="batchDeleteProjects([...selectedKeys])">Delete</el-button>
        <el-button size="small" text @click="selectedKeys.clear()">{{ $t("project.list.batch.clear") }}</el-button>
      </div>
    </Transition>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? $t('project.dialog.editTitle') : $t('project.dialog.createTitle')"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('project.dialog.name')" prop="name">
          <el-input
            v-model="dialog.form.name"
            :placeholder="$t('project.dialog.namePlaceholder')"
            maxlength="80"
            show-word-limit
            autofocus
          />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.identifier')" prop="identifier">
          <el-input v-model="dialog.form.identifier" :placeholder="$t('project.dialog.identifierPlaceholder')" maxlength="12" />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.description')">
          <el-input
            v-model="dialog.form.description"
            type="textarea"
            :rows="3"
            :placeholder="$t('project.dialog.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="$t('project.dialog.status')">
          <el-radio-group v-model="dialog.form.status">
            <el-radio value="active">{{ $t("project.dialog.statusActive") }}</el-radio>
            <el-radio value="archived">{{ $t("project.dialog.statusArchived") }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t("project.dialog.cancel") }}</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">{{ $t("project.dialog.save") }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="projectList">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  Calendar,
  Document,
  Download,
  Grid,
  List,
  MoreFilled,
  Plus,
  Refresh,
  Search,
  SortDown,
  SortUp,
  Star,
  Tickets,
  TrendCharts,
  Warning,
  WarningFilled
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useProjectStore } from "@/stores/modules/project";
import { useMarkdown } from "@/hooks/useMarkdown";
import { loadBool, loadStr, saveBool, saveStr } from "@/utils/storage";
import { createProject, updateProject, deleteProject } from "@/api/modules/projectService";
import type { Project, ProjectMember } from "@/api/modules/projectService";
import { useProjectInsights } from "./composables/useProjectInsights";
import type { StatTile } from "./types";
import { confirm } from "@/hooks/useConfirmAction";
import ProjectStatTiles from "./components/ProjectStatTiles.vue";
import ProjectAnalytics from "./components/ProjectAnalytics.vue";
import ProjectAttention from "./components/ProjectAttention.vue";
import ProjectFilterPills from "./components/ProjectFilterPills.vue";
import ProjectCard from "./components/ProjectCard.vue";
import ProjectRow from "./components/ProjectRow.vue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { HeaderPill } from "@/components/PageHeaderCard/PageHeaderCard.vue";
import { useDateFilter } from "@/hooks/useDateFilter";

import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const store = useProjectStore();
const { render: renderMarkdown } = useMarkdown();

// ── Date filter (must be before useProjectInsights so it can filter by date) ──
const filterDate = ref<Date | null>(null);
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  filterDateStr,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate
} = useDateFilter(filterDate);

// Destructured so the template gets auto-unwrapped refs instead of `x.value`.
const {
  loading,
  lastUpdated,
  projects,
  knowledgeStats,
  dashboard,
  serverStatsByKey,
  dashboardGeneratedAt,
  load: loadInsights,
  startPolling,
  stopPolling,
  statsFor,
  completionPct,
  risksFor,
  healthFor,
  riskCounts,
  flaggedCount,
  activeFilter,
  setFilter,
  removeFilter,
  clearAllFilters,
  undoLastFilter,
  hasActiveFilter,
  canUndo,
  matchesFilter,
  activeFilterPills,
  rollup,
  activitySeries: buildActivitySeries
} = useProjectInsights(filterDateStr);

// ── User preferences (persisted) ──────────────────────────────────────────
const PREF = {
  view: "project.viewMode",
  sort: "project.sortBy",
  starred: "project.starredOnly",
  analytics: "project.analyticsExpanded"
};

const viewMode = ref<"grid" | "list">(loadStr(PREF.view, "grid") === "list" ? "list" : "grid");
const sortBy = ref(loadStr(PREF.sort, "updated"));
const sortDir = ref<"asc" | "desc">("desc");
const showStarredOnly = ref(loadBool(PREF.starred, false));
const analyticsExpanded = ref(loadBool(PREF.analytics, true));

watch(viewMode, v => saveStr(PREF.view, v));
watch(sortBy, v => saveStr(PREF.sort, v));
watch(showStarredOnly, v => saveBool(PREF.starred, v));
watch(analyticsExpanded, v => saveBool(PREF.analytics, v));

const searchText = ref("");
const searchRef = ref<{ focus: () => void }>();

// ── Auto-refresh polling ──────────────────────────────────────────────────
const POLL_PREF_KEY = "project.pollIntervalMs";
const pollOptions = [
  { label: t("project.list.liveOff"), value: 0 },
  { label: "30s", value: 30_000 },
  { label: "1m", value: 60_000 },
  { label: "2m", value: 120_000 },
  { label: "5m", value: 300_000 }
];
const pollInterval = ref(Number(localStorage.getItem(POLL_PREF_KEY)) || 0);
const isPolling = computed(() => pollInterval.value > 0);

function setPollInterval(ms: number) {
  pollInterval.value = ms;
  localStorage.setItem(POLL_PREF_KEY, String(ms));
  if (ms > 0) startPolling(ms);
  else stopPolling();
}

// Relative "last updated" display that auto-updates every 15s.
const relativeUpdated = ref("");
let relativeTimer: ReturnType<typeof setInterval> | undefined;

function updateRelativeTime() {
  if (!lastUpdated.value) return;
  const [h, m, s] = lastUpdated.value.split(":").map(Number);
  const then = new Date();
  then.setHours(h, m, s, 0);
  const diff = Math.floor((Date.now() - then.getTime()) / 1000);
  if (diff < 60) relativeUpdated.value = t("project.health.timeJustNow");
  else if (diff < 3600) relativeUpdated.value = t("project.health.timeMinutesAgo", { n: Math.floor(diff / 60) });
  else relativeUpdated.value = t("project.health.timeHoursAgo", { n: Math.floor(diff / 3600) });
}

/** Human-readable server dashboard freshness. */
function formatServerFreshness(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return t("project.health.timeJustNow");
  if (diff < 3600) return t("project.health.timeMinutesAgo", { n: Math.floor(diff / 60) });
  if (diff < 86400) return t("project.health.timeHoursAgo", { n: Math.floor(diff / 3600) });
  return t("project.health.timeDaysAgo", { n: Math.floor(diff / 86400) });
}

const serverFreshness = computed(() => {
  const ts = dashboardGeneratedAt.value;
  return ts ? formatServerFreshness(ts) : "";
});

const freshnessDotClass = computed(() => {
  if (!dashboardGeneratedAt.value) return "";
  const diff = Math.floor((Date.now() - new Date(dashboardGeneratedAt.value).getTime()) / 1000);
  if (diff < 60) return "pl-fresh-dot--live";
  if (diff < 300) return "pl-fresh-dot--recent";
  return "pl-fresh-dot--stale";
});

const formRef = ref<FormInstance>();
const starredKeys = ref<Set<string>>(new Set(JSON.parse(localStorage.getItem("starred_projects") || "[]")));
const selectedKeys = ref<Set<string>>(new Set());
const deletingKeys = ref<Set<string>>(new Set());

// The status select drives `activeFilter` so the pill bar reflects every narrowing.
const statusFilter = computed<string>({
  get: () => activeFilter.value.status ?? "",
  set: v => {
    if (v === (activeFilter.value.status ?? "")) return;
    if (v) setFilter("status", v);
    else removeFilter("status");
  }
});

// ── Derived project lists ─────────────────────────────────────────────────
const filteredProjects = computed(() => {
  const q = searchText.value.trim().toLowerCase();
  return projects.value.filter(p => {
    if (!matchesFilter(p)) return false;
    if (showStarredOnly.value && !starredKeys.value.has(p.key)) return false;
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.identifier.toLowerCase().includes(q) ||
      (p.description || "").toLowerCase().includes(q) ||
      (p.members || []).some(m => m.username.toLowerCase().includes(q))
    );
  });
});

const displayedProjects = computed(() => {
  const list = [...filteredProjects.value];
  const asc = sortDir.value === "asc";
  switch (sortBy.value) {
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "issues":
      list.sort((a, b) => statsFor(b.key).issues - statsFor(a.key).issues);
      break;
    case "done":
      list.sort((a, b) => completionPct(b.key) - completionPct(a.key));
      break;
    case "risk":
      list.sort((a, b) => risksFor(b.key).length - risksFor(a.key).length);
      break;
    default:
      list.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      break;
  }
  return asc ? list.reverse() : list;
});

const allRollup = computed(() => rollup(projects.value));
const viewRollup = computed(() => rollup(filteredProjects.value));
const activitySeries = computed(() => buildActivitySeries(filteredProjects.value));

const topProjects = computed(() =>
  filteredProjects.value
    .map(p => {
      const s = statsFor(p.key);
      return { key: p.key, name: p.name, open: s.open, done: s.done };
    })
    .filter(r => r.open + r.done > 0)
    .sort((a, b) => b.open + b.done - (a.open + a.done))
    .slice(0, 8)
);

const criticalCount = computed(() => projects.value.filter(p => healthFor(p.key) === "poor").length);

/** Total YiKnowledge files across all projects. */
const totalKnowledgeFiles = computed(() => {
  if (!knowledgeStats.value?.projects) return 0;
  let total = 0;
  for (const cats of Object.values(knowledgeStats.value.projects)) {
    total += Object.values(cats).reduce((a, b) => a + b, 0);
  }
  return total;
});

const healthCounts = computed(() => {
  const counts = { good: 0, warn: 0, poor: 0 };
  for (const p of projects.value) counts[healthFor(p.key)]++;
  return counts;
});

const healthItems = computed(() => [
  { key: "good", count: healthCounts.value.good, label: t("project.risks.health.good"), badgeType: "success" as const },
  { key: "warn", count: healthCounts.value.warn, label: t("project.risks.health.warn"), badgeType: "warning" as const },
  { key: "poor", count: healthCounts.value.poor, label: t("project.risks.health.poor"), badgeType: "danger" as const },
]);

const countLabel = computed(() =>
  t("project.list.countLabel", { shown: displayedProjects.value.length, total: projects.value.length })
);

const emptyDescription = computed(() => {
  if (searchText.value.trim()) return t("project.list.empty.noMatchSearch", { keyword: searchText.value.trim() });
  return t("project.list.empty.noMatch");
});

// ── KPI tiles: always describe the whole dataset and act as filter entries.
const tiles = computed<StatTile[]>(() => {
  const all = allRollup.value;
  const completion = all.issues ? Math.round((all.done / all.issues) * 100) : 0;
  const tiles: StatTile[] = [
    {
      key: "issues",
      value: all.issues,
      label: t("project.stats.issues"),
      sub: t("project.stats.done", { n: all.done }),
      hint: "Open the issue list",
      icon: Tickets,
      variant: "issues",
      clickable: true
    },
    {
      key: "open",
      value: all.open,
      label: t("project.stats.open"),
      sub: all.overdue ? t("project.stats.overdue", { n: all.overdue }) : t("project.stats.noneOverdue"),
      hint: "Open the issue list",
      icon: Document,
      variant: "open",
      clickable: true
    },
    {
      key: "progress",
      value: completion,
      suffix: "%",
      label: t("project.stats.completed"),
      sub: `${all.done} ${t("project.stats.of")} ${all.issues}`,
      icon: TrendCharts,
      variant: "progress"
    },
    {
      key: "bugs",
      value: all.totalBugs,
      label: t("project.stats.bugs"),
      sub: t("project.stats.total", { n: all.totalBugs }),
      hint: "Open bugs",
      icon: Warning,
      variant: "bugs",
      clickable: true
    },
    {
      key: "risk",
      value: flaggedCount.value,
      label: t("project.stats.atRisk"),
      sub: criticalCount.value ? t("project.stats.critical", { n: criticalCount.value }) : t("project.stats.noneCritical"),
      hint: "Filter to projects failing a health check",
      icon: WarningFilled,
      variant: "risk",
      clickable: true,
      active: activeFilter.value.flagged === "1"
    },
    {
      key: "docs",
      value: totalKnowledgeFiles.value,
      label: t("project.stats.docs"),
      sub: knowledgeStats.value?.projects
        ? t("project.stats.acrossProjects", { n: Object.keys(knowledgeStats.value.projects).length })
        : t("project.stats.noDocs"),
      icon: Document,
      variant: "docs"
    }
  ];
    return tiles;
});

function onTileSelect(key: string) {
  switch (key) {
    case "risk":
      setFilter("flagged", "1");
      break;
    case "issues":
    case "open":
      router.push("/issue");
      break;
    case "bugs":
      router.push("/bug");
      break;
  }
}

const headerPills = computed<HeaderPill[]>(() => {
  const all = allRollup.value;
  const completion = all.issues ? Math.round((all.done / all.issues) * 100) : 0;
  return [
    { value: projects.value.length, label: t("project.list.title") },
    { value: all.issues, label: t("project.stats.issues") },
    { value: all.open, label: t("project.stats.open") },
    {
      value: completion,
      suffix: "%",
      label: t("project.stats.completed"),
      accent: true,
      accentColor: "var(--el-color-primary-light-9)",
      accentValueColor: "var(--el-color-primary)"
    }
  ];
});

// ── Markdown descriptions, rendered once per data change ──────────────────
const descHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const p of projects.value) {
    if (p.description) map.set(p.key, renderMarkdown(p.description));
  }
  return map;
});

function descHtml(project: Project): string {
  return descHtmlMap.value.get(project.key) || "";
}

/** Total YiKnowledge files for a project across all categories. */
function knowledgeCount(key: string): number {
  if (!knowledgeStats.value?.projects) return 0;
  const cats = knowledgeStats.value.projects[key];
  if (!cats) return 0;
  return Object.values(cats).reduce((a, b) => a + b, 0);
}

// ── Selection + starring ──────────────────────────────────────────────────
function toggleSelect(key: string) {
  const next = new Set(selectedKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  selectedKeys.value = next;
}

function toggleStar(key: string) {
  const next = new Set(starredKeys.value);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  starredKeys.value = next;
  localStorage.setItem("starred_projects", JSON.stringify([...next]));
}

// Never act on a project the user can no longer see.
watch(displayedProjects, list => {
  if (!selectedKeys.value.size) return;
  const visible = new Set(list.map(p => p.key));
  const kept = [...selectedKeys.value].filter(k => visible.has(k));
  if (kept.length !== selectedKeys.value.size) selectedKeys.value = new Set(kept);
});

// ── Mutations ─────────────────────────────────────────────────────────────
async function refreshAll() {
  // The shared store stays on its own paginated fetch so the other 13 pages
  // that read it keep seeing what they always saw.
  await Promise.all([loadInsights(), store.fetchProjects()]);
}

async function setStatus(keys: string[], status: "active" | "archived") {
  const byKey = new Map(projects.value.map(p => [p.key, p]));
  const targets = keys.filter(k => byKey.get(k)?.status !== status);
  if (!targets.length) {
    ElMessage.info(status === "archived" ? t("project.list.alreadyArchived") : t("project.list.alreadyActive"));
    return;
  }
  const verb = status === "archived" ? t("project.list.batch.archive") : t("project.list.batch.restore");
  if (targets.length > 1) {
    const confirmMsg =
      status === "archived"
        ? t("project.list.archiveConfirm", { n: targets.length })
        : t("project.list.restoreConfirm", { n: targets.length });
    const ok = await confirm(confirmMsg, verb);
    if (!ok) return;
  }
  await Promise.all(targets.map(k => updateProject(k, { status })));
  selectedKeys.value = new Set();
  await refreshAll();
  ElMessage.success(
    status === "archived"
      ? t("project.list.archiveSuccess", { n: targets.length })
      : t("project.list.restoreSuccess", { n: targets.length })
  );
}

async function batchDeleteProjects(keys: string[]) {
    if (!keys.length) return;
    const targets = keys.map(k => projects.value.find(p => p.key === k)).filter(Boolean);
    const names = targets.map(p => p!.name).join(", ");
    const ok = await confirm(`Delete ${keys.length} project(s): ${names}? This cannot be undone.`, "Delete Projects", "error");
    if (!ok) return;

    // Mark all as deleting
    const next = new Set(deletingKeys.value);
    for (const k of keys) next.add(k);
    deletingKeys.value = next;

    let successCount = 0;
    let totalDeleted: Record<string, number> = {};
    for (const k of keys) {
      try {
        const res = await deleteProject(k);
        successCount++;
        if (res.data?.deleted) {
          for (const [col, n] of Object.entries(res.data.deleted)) {
            totalDeleted[col] = (totalDeleted[col] || 0) + (n as number);
          }
        }
      } catch { /* continue */ }
    }

    // Remove from deleting set
    const remaining = new Set(deletingKeys.value);
    for (const k of keys) remaining.delete(k);
    deletingKeys.value = remaining;

    selectedKeys.value = new Set();
    await refreshAll();

    const parts: string[] = [];
    if (totalDeleted["issues"]) parts.push(`${totalDeleted["issues"]} issues`);
    if (totalDeleted["bugs"]) parts.push(`${totalDeleted["bugs"]} bugs`);
    if (totalDeleted["modules"]) parts.push(`${totalDeleted["modules"]} modules`);
    if (totalDeleted["milestones"]) parts.push(`${totalDeleted["milestones"]} milestones`);
    if (totalDeleted["knowledge_files"] || totalDeleted["knowledge_stories"]) parts.push("knowledge docs");
    ElMessage.success(`Deleted ${successCount} project(s)${parts.length ? " + " + parts.join(", ") : ""}`);
  }

  async function deleteSingleProject(key: string, name: string) {
    const ok = await confirm(
      `Delete project "${name}" and all related issues, bugs, modules, milestones, and knowledge files? This cannot be undone.`,
      "Delete Project",
      "error"
    );
    if (!ok) return;

    const next = new Set(deletingKeys.value);
    next.add(key);
    deletingKeys.value = next;

    try {
      const res = await deleteProject(key);
      const deleted = res.data?.deleted || {};
      const parts: string[] = [];
      if (deleted["issues"]) parts.push(`${deleted["issues"]} issues`);
      if (deleted["bugs"]) parts.push(`${deleted["bugs"]} bugs`);
      if (deleted["modules"]) parts.push(`${deleted["modules"]} modules`);
      if (deleted["milestones"]) parts.push(`${deleted["milestones"]} milestones`);
      if (deleted["knowledge_files"] || deleted["knowledge_stories"]) parts.push("knowledge docs");
      ElMessage.success(`Deleted "${name}"${parts.length ? " + " + parts.join(", ") : ""}`);
    } catch {
      ElMessage.error(`Failed to delete "${name}"`);
    } finally {
      const remaining = new Set(deletingKeys.value);
      remaining.delete(key);
      deletingKeys.value = remaining;
    }

    selectedKeys.value = new Set();
    await refreshAll();
  }

  function copyAsTemplate(project: Project) {
    dialog.isEdit = false;
    dialog.editKey = "";
    dialog.form = {
      name: `${project.name} (Copy)`,
      identifier: "",
      description: project.description || "",
      status: "active" as const,
      members: [],
      cover_image: project.cover_image || ""
    };
    dialog.visible = true;
  }

  const rules: FormRules = {
  name: [{ required: true, message: t("project.dialog.nameRequired"), trigger: "blur" }],
  identifier: [
    { required: true, message: t("project.dialog.identifierRequired"), trigger: "blur" },
    { pattern: /^[A-Z][A-Z0-9_]{0,11}$/, message: t("project.dialog.identifierPattern"), trigger: "blur" }
  ]
};

interface ProjectForm {
  name: string;
  identifier: string;
  description: string;
  status: "active" | "archived";
  members: ProjectMember[];
  cover_image: string;
}

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: { name: "", identifier: "", description: "", status: "active", members: [], cover_image: "" } as ProjectForm
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", identifier: "", description: "", status: "active", members: [], cover_image: "" };
  dialog.visible = true;
}

function openEdit(project: Project) {
  dialog.isEdit = true;
  dialog.editKey = project.key;
  dialog.form = {
    name: project.name,
    identifier: project.identifier,
    description: project.description || "",
    status: project.status,
    members: project.members || [],
    cover_image: project.cover_image || ""
  };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await updateProject(dialog.editKey, {
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status
      });
      ElMessage.success(t("project.dialog.updateSuccess"));
    } else {
      await createProject({
        key: dialog.form.identifier.toLowerCase() + "-" + Date.now().toString(36),
        name: dialog.form.name,
        identifier: dialog.form.identifier,
        description: dialog.form.description,
        status: dialog.form.status,
        members: [{ user_id: "admin", username: "Admin", role: "owner" }],
        cover_image: dialog.form.cover_image
      });
      ElMessage.success(t("project.dialog.createSuccess"));
    }
    dialog.visible = false;
    await refreshAll();
  } finally {
    dialog.submitting = false;
  }
}

// ── Navigation + misc actions ─────────────────────────────────────────────
function goDetail(key: string) {
  router.push(`/project/${key}`);
}

function goTab(key: string, tab: "issues" | "members" | "bugs" | "modules") {
  router.push({ path: `/project/${key}`, query: { tab } });
}

async function copyIdentifier(project: Project) {
  try {
    await navigator.clipboard.writeText(project.identifier);
    ElMessage.success(t("project.dialog.copied", { identifier: project.identifier }));
  } catch {
    ElMessage.warning(t("project.dialog.clipboardUnavailable"));
  }
}

function resetView() {
  clearAllFilters();
  searchText.value = "";
  showStarredOnly.value = false;
}

const CSV_HEADERS = [
  "key",
  "name",
  "identifier",
  "status",
  "members",
  "issues",
  "done",
  "open",
  "overdue",
  "completion_pct",
  "health",
  "risks",
  "updated_at"
];

function exportCSV() {
  const rows = displayedProjects.value.map(p => {
    const s = statsFor(p.key);
    return [
      p.key,
      p.name,
      p.identifier,
      p.status,
      String((p.members || []).length),
      String(s.issues),
      String(s.done),
      String(s.open),
      String(s.overdue),
      String(completionPct(p.key)),
      healthFor(p.key),
      risksFor(p.key).join(" | "),
      p.updated_at || ""
    ];
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = [CSV_HEADERS, ...rows].map(r => r.map(escape).join(",")).join("\n");
  // BOM keeps Excel from mangling non-ASCII project names.
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(t("project.list.exportSuccess", { n: rows.length }));
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    searchRef.value?.focus();
  }
}

onMounted(() => {
  refreshAll();
  if (pollInterval.value > 0) startPolling(pollInterval.value);
  updateRelativeTime();
  relativeTimer = setInterval(updateRelativeTime, 15_000);
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  stopPolling();
  if (relativeTimer) clearInterval(relativeTimer);
  window.removeEventListener("keydown", onKeydown);
});

// Starred keys for projects.value that no longer exist would silently accumulate.
watch(projects, list => {
  if (!list.length || !starredKeys.value.size) return;
  const live = new Set(list.map(p => p.key));
  const kept = [...starredKeys.value].filter(k => live.has(k));
  if (kept.length !== starredKeys.value.size) {
    starredKeys.value = new Set(kept);
    localStorage.setItem("starred_projects", JSON.stringify(kept));
  }
});
</script>


<style scoped lang="scss">
@use "./index.scss";
</style>
