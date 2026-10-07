<template>
  <div class="roadmap page">
    <div class="roadmap__head">
      <div class="roadmap__head-left">
        <div class="roadmap__head-stat" :class="{ 'is-active': !hasFilter }" @click="clearFilters">
          <span class="roadmap__head-stat-value">{{ totalItems }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.total") }}</span>
        </div>
        <div
          class="roadmap__head-stat"
          :class="{ 'is-active': statusFilter === 'in_progress' }"
          @click="toggleStatusFilter('in_progress')"
        >
          <span class="roadmap__head-stat-value is-progress">{{ statusCounts.in_progress }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.inProgress") }}</span>
        </div>
        <div
          class="roadmap__head-stat"
          :class="{ 'is-active': riskFilter === 'overdue' }"
          @click="toggleRiskFilter('overdue')"
        >
          <span class="roadmap__head-stat-value is-overdue">{{ riskCounts.overdue }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.overdue") }}</span>
        </div>
        <div
          class="roadmap__head-stat"
          :class="{ 'is-active': riskFilter === 'dueSoon' }"
          @click="toggleRiskFilter('dueSoon')"
        >
          <span class="roadmap__head-stat-value is-risk">{{ riskCounts.dueSoon }}</span>
          <span class="roadmap__head-stat-label">{{ t("roadmap.atRisk") }}</span>
        </div>
      </div>
      <div class="roadmap__head-right">
        <div v-if="autoRefresh" class="roadmap__head-countdown">
          <span class="roadmap__head-countdown-dot" />
          {{ t("roadmap.nextRefresh", { n: nextRefreshIn }) }}
        </div>
        <span v-if="lastRefreshed && !autoRefresh" class="roadmap__head-freshness">
          {{ t("roadmap.refreshed") }} {{ freshnessText }}
        </span>
        <el-tooltip :content="autoRefresh ? t('roadmap.autoRefreshOn') : t('roadmap.autoRefreshOff')" :show-after="300">
          <el-button size="small" text :type="autoRefresh ? 'primary' : 'info'" @click="toggleAutoRefresh">
            {{ autoRefresh ? t("roadmap.autoRefreshOn") : t("roadmap.autoRefreshOff") }}
          </el-button>
        </el-tooltip>
        <el-button size="small" text :loading="loading" :icon="Refresh" @click="loadData">
          {{ loading ? t("roadmap.refreshing") : t("roadmap.refresh") }}
        </el-button>
        <el-input
          v-model="search"
          :placeholder="t('roadmap.searchPlaceholder')"
          size="small"
          clearable
          style="width: 200px"
          @update:model-value="onSearchInput"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
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

    <div v-if="partialError" class="roadmap__warning">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ t("roadmap.partialError") }}</span>
    </div>

    <div v-if="hasKindFilter || statusFilter || riskFilter" class="roadmap__filters">
      <div class="roadmap__filter-row">
        <span class="roadmap__filter-label">{{ t("roadmap.filters.status") }}</span>
        <el-check-tag
          v-for="s in statusOptions"
          :key="s.value"
          :checked="statusFilter === s.value"
          size="small"
          @change="() => toggleStatusFilter(s.value)"
        >
          {{ s.label }}
        </el-check-tag>
      </div>
    </div>

    <div v-if="totalItems > 0 && healthIssues.length" class="roadmap__health">
      <el-icon :size="12"><WarningFilled /></el-icon>
      <span class="roadmap__health-label">{{ t("roadmap.health.label") }}</span>
      <span v-for="h in healthIssues" :key="h" class="roadmap__health-item">{{ h }}</span>
    </div>

    <div v-if="isStale" class="roadmap__stale">
      <el-icon :size="12"><Clock /></el-icon>
      <span>{{ t("roadmap.staleWarning") }}</span>
      <el-button link size="small" type="primary" @click="loadData">{{ t("roadmap.refresh") }}</el-button>
    </div>

    <div v-if="totalItems > 0" class="roadmap__stats">
      <div
        v-for="seg in kindSegments"
        :key="seg.label"
        class="roadmap__stat-segment"
        :style="{ width: seg.width + '%', background: seg.color }"
        :title="`${seg.label}: ${seg.count}`"
      />
    </div>

    <div v-if="initialLoading" class="roadmap__skeleton">
      <div v-for="n in 3" :key="n" class="roadmap__col roadmap__col--skeleton">
        <div class="roadmap__col-head-skeleton" />
        <div v-for="m in 4" :key="m" class="roadmap__item-skeleton" />
      </div>
    </div>
    <div v-else v-loading="loading" class="roadmap__board">
      <div v-for="col in columns" :key="col.projectKey" class="roadmap__col">
        <div class="roadmap__col-head" :style="{ background: col.headerBg }">
          <div class="roadmap__col-head-row">
            <span class="roadmap__col-title" @click="goProject(col.projectKey)">{{ col.project }}</span>
            <div class="roadmap__col-head-actions">
              <el-tag size="small" round :type="col.countTagType">{{ col.items.length }}</el-tag>
              <el-dropdown trigger="click" @command="(cmd: string) => sortColumn(col, cmd)">
                <el-button size="small" text style="padding: 2px 4px; margin-left: 2px">
                  <el-icon><Sort /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="date">{{ t("roadmap.sort.byDate") }}</el-dropdown-item>
                    <el-dropdown-item command="progress">{{ t("roadmap.sort.byProgress") }}</el-dropdown-item>
                    <el-dropdown-item command="name">{{ t("roadmap.sort.byName") }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <div class="roadmap__col-progress">
            <span class="roadmap__col-progress-bar" :title="`Done: ${colProgress(col).done} | Active: ${colProgress(col).inProgress} | Total: ${colProgress(col).total}`">
              <span class="roadmap__col-progress-done" :style="{ width: colProgress(col).pct + '%' }" />
              <span class="roadmap__col-progress-active" :style="{ width: colProgress(col).activePct + '%', marginLeft: colProgress(col).pct + '%' }" />
            </span>
            <span>{{ t("roadmap.progress.ofTotal", colProgress(col)) }}</span>
          </div>
        </div>
        <div class="roadmap__col-body">
          <div
            v-for="item in col.items"
            :key="item.id"
            class="roadmap__item"
            :class="riskClass(item)"
            @click="goTo(item.link)"
            @contextmenu.prevent="openContextMenu($event, item)"
          >
            <div class="roadmap__item-accent" :style="{ background: item.color }" />
            <div class="roadmap__item-head">
              <code class="roadmap__item-key">{{ item.id }}</code>
              <span v-if="item.issueType" class="roadmap__item-issue-type" :class="`roadmap__item-issue-type--${item.issueType}`">{{ item.issueType }}</span>
              <span v-if="item.ykModulePath" class="roadmap__item-doc-icon" title="查看知识库文档" @click.stop="goToKnowledge(item.ykModulePath)">📄</span>
              <span v-if="riskLabel(item)" class="roadmap__item-risk" :class="`roadmap__item-risk--${riskLevel(item)}`">
                {{ riskLabel(item) }}
              </span>
              <span class="roadmap__item-status" :style="{ color: item.color }">{{ item.statusLabel }}</span>
            </div>
            <div class="roadmap__item-title" @click.stop="openPreview(item)">{{ item.name }}</div>
            <div class="roadmap__item-foot">
              <span class="roadmap__item-foot-item" :class="riskFootClass(item)">
                <el-icon><Clock /></el-icon>{{ item.dates }}
              </span>
              <span v-if="item.lead" class="roadmap__item-foot-item">
                <el-icon><User /></el-icon>{{ item.lead }}
              </span>
              <span v-else class="roadmap__item-foot-item roadmap__item-foot-item--muted">
                <el-icon><User /></el-icon>{{ t("roadmap.noLead") }}
              </span>
              <span v-if="item.total > 0" class="roadmap__item-foot-item">
                <span class="roadmap__item-progress-bar">
                  <span class="roadmap__item-progress-done" :style="{ width: donePct(item) + '%' }" />
                  <span class="roadmap__item-progress-active" :style="{ width: inProgressPct(item) + '%' }" />
                </span>
                <span>{{ item.done }}<span v-if="item.inProgress > 0" class="roadmap__item-progress-active-text">+{{ item.inProgress }}</span>/{{ item.total }}</span>
              </span>
              <span v-else-if="item.issueKeys.length === 0" class="roadmap__item-foot-item roadmap__item-foot-item--muted">
                {{ t("roadmap.noIssues") }}
              </span>
            </div>
            <div v-if="item.lastUpdated" class="roadmap__item-updated" :title="fmtAbsolute(item.lastUpdated)">
              {{ t("roadmap.updated", { time: fmtRelative(item.lastUpdated) }) }}
            </div>
            <div v-if="item.detail" class="roadmap__item-detail">{{ item.detail }}</div>
            <div v-if="item.issueKeys.length > 0" class="roadmap__item-issues">
              <div v-for="key in item.issueKeys" :key="key" class="roadmap__item-issue-row" @click.stop="openIssuePreview(key)">
                <span class="roadmap__item-issue-key">{{ key }}</span>
                <span class="roadmap__item-issue-title">{{ issueTitle(key) }}</span>
              </div>
            </div>
          </div>
          <div v-if="col.items.length === 0" class="roadmap__col-empty">
            <el-icon :size="28"><Folder /></el-icon>
            <span>{{ t("roadmap.empty.noItems") }}</span>
          </div>
        </div>
      </div>
      <el-empty v-if="!loading && !columns.length" :description="t('roadmap.empty.noRoadmapItems')" :image-size="60" />
    </div>

    <teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="roadmap-ctxmenu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <template v-if="contextMenu.item">
          <div class="roadmap-ctxmenu__item" @click="ctxOpen">
            <el-icon><View /></el-icon>{{ t("roadmap.ctxMenu.open") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxPreview">
            <el-icon><Document /></el-icon>{{ t("roadmap.ctxMenu.preview") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxCopyId">
            <el-icon><CopyDocument /></el-icon>{{ t("roadmap.ctxMenu.copyId") }}
          </div>
          <div class="roadmap-ctxmenu__divider" />
          <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('planned')">
            <el-icon><Calendar /></el-icon>{{ t("roadmap.ctxMenu.markPlanned") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('in_progress')">
            <el-icon><Loading /></el-icon>{{ t("roadmap.ctxMenu.markInProgress") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('completed')">
            <el-icon><CircleCheck /></el-icon>{{ t("roadmap.ctxMenu.markCompleted") }}
          </div>
          <div class="roadmap-ctxmenu__item" @click="ctxQuickStatus('cancelled')">
            <el-icon><CircleClose /></el-icon>{{ t("roadmap.ctxMenu.markCancelled") }}
          </div>
          <div class="roadmap-ctxmenu__divider" />
          <div class="roadmap-ctxmenu__item roadmap-ctxmenu__item--danger" @click="ctxDelete">
            <el-icon><Delete /></el-icon>{{ t("roadmap.ctxMenu.delete") }}
          </div>
        </template>
      </div>
    </teleport>

    <KnowledgePreviewDialog ref="descDialogRef" />
  </div>
</template>

<script setup lang="ts" name="roadmapView">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { ElMessage } from "element-plus";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import { confirm, tryAction } from "@/hooks/useConfirmAction";
import {
  Search,
  Folder,
  User,
  Sort,
  Clock,
  View,
  Document,
  CopyDocument,
  CircleCheck,
  Calendar,
  Loading,
  CircleClose,
  Delete,
  Refresh,
  WarningFilled
} from "@element-plus/icons-vue";
import { useModuleStore } from "@/stores/modules/module";
import { useProjectStore } from "@/stores/modules/project";
import { useIssueStore } from "@/stores/modules/issue";
import { MODULE_STATUS_MAP, type ModuleStatus } from "@/api/modules/moduleService";
import type { IssueStatus } from "@/api/modules/issueService";
import { readKnowledgeFile, writeKnowledgeFile } from "@/api/modules/knowledgeService";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import dayjs from "dayjs";
import { formatRelativeTime, formatAbsolute } from "@/utils/datetime";

const { t } = useI18n();
const router = useRouter();
const moduleStore = useModuleStore();
const projectStore = useProjectStore();
const issueStore = useIssueStore();

const loading = ref(false);
const initialLoading = ref(true);
const partialError = ref(false);
const lastRefreshed = ref<Date | null>(null);

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

const search = ref("");
let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onSearchInput() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadData(), 250);
}

// -- Status filter (click stat pills to toggle) --
const statusFilter = ref<string>("");

const statusOptions = computed(() => [
  { value: "planned", label: t("roadmap.status.planned") },
  { value: "in_progress", label: t("roadmap.status.active") },
  { value: "completed", label: t("roadmap.status.completed") },
  { value: "cancelled", label: t("roadmap.status.cancelled") }
]);

function toggleStatusFilter(val: string) {
  statusFilter.value = statusFilter.value === val ? "" : val;
  riskFilter.value = "";
}

// -- Risk filter --
const riskFilter = ref<string>("");

function toggleRiskFilter(val: string) {
  riskFilter.value = riskFilter.value === val ? "" : val;
  statusFilter.value = "";
}

// -- Kind filter --
type RoadmapKind = "module" | "issue";
const kindFilter = ref(new Set<RoadmapKind>());
const kindOptions = computed<{ value: RoadmapKind; label: string }[]>(() => [
  { value: "module", label: t("roadmap.kind.modules") },
  { value: "issue", label: t("roadmap.kind.issues") }
]);
function toggleKind(val: RoadmapKind) {
  if (kindFilter.value.has(val)) kindFilter.value.delete(val);
  else kindFilter.value.add(val);
  kindFilter.value = new Set(kindFilter.value);
}
const hasKindFilter = computed(() => kindFilter.value.size > 0);

const hasFilter = computed(() => hasKindFilter.value || !!statusFilter.value || !!riskFilter.value);

// -- Freshness --
const freshnessText = computed(() => {
  if (!lastRefreshed.value) return "";
  return formatRelativeTime(lastRefreshed.value);
});

const isStale = computed(() => {
  if (!lastRefreshed.value || autoRefresh.value) return false;
  return Date.now() - lastRefreshed.value.getTime() > 300_000;
});

  // -- Auto-refresh polling --
  const REFRESH_INTERVAL = 60;
  const autoRefresh = ref(true);
  const nextRefreshIn = ref(REFRESH_INTERVAL);
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;

  function startPolling() {
    stopPolling();
    nextRefreshIn.value = REFRESH_INTERVAL;
    countdownTimer = setInterval(() => {
      nextRefreshIn.value = Math.max(0, nextRefreshIn.value - 1);
    }, 1000);
    pollTimer = setInterval(() => {
      loadData();
      nextRefreshIn.value = REFRESH_INTERVAL;
    }, REFRESH_INTERVAL * 1000);
  }

  function stopPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  }

  function toggleAutoRefresh() {
    autoRefresh.value = !autoRefresh.value;
    if (autoRefresh.value) {
      loadData();
      startPolling();
    } else {
      stopPolling();
    }
  }

  // -- Data model --
type TagType = "success" | "warning" | "info" | "primary" | "danger";

interface RoadmapItem {
  id: string;
  name: string;
  kind: RoadmapKind;
  kindLabel: string;
  status: string;
  statusLabel: string;
  tagType: TagType;
  color: string;
  dates: string;
  sortDate: string;
  startDate: string;
  endDate: string;
  detail?: string;
  lead?: string;
  link: string;
  done: number;
  inProgress: number;
  total: number;
  issueKeys: string[];
  lastUpdated?: string;
  ykModulePath?: string;
  issueType?: string;
}

interface RoadmapColumn {
  project: string;
  projectKey: string;
  headerBg: string;
  countTagType: "info" | "primary" | "warning" | "success" | "danger";
  items: RoadmapItem[];
}

const COL_HEADER_STYLES = [
  { headerBg: "linear-gradient(180deg, #ecf5ff 0%, #d9ecff 100%)", countTagType: "primary" as const },
  { headerBg: "linear-gradient(180deg, #fdf6ec 0%, #faecd8 100%)", countTagType: "warning" as const },
  { headerBg: "linear-gradient(180deg, #f5f0ff 0%, #ede0ff 100%)", countTagType: "warning" as const },
  { headerBg: "linear-gradient(180deg, #f0f9eb 0%, #e1f3d8 100%)", countTagType: "success" as const },
  { headerBg: "linear-gradient(180deg, #f0f2f5 0%, #e4e7ed 100%)", countTagType: "info" as const }
];

const KIND_LABEL = computed<Record<RoadmapKind, string>>(() => ({
  module: t("roadmap.kind.moduleLabel"),
  issue: t("roadmap.kind.issueLabel")
}));

const STATUS_META: Record<string, { tag: TagType; color: string }> = {
  planned: { tag: "info", color: "#909399" },
  in_progress: { tag: "warning", color: "#e6a23c" },
  completed: { tag: "success", color: "#67c23a" },
  cancelled: { tag: "danger", color: "#f56c6c" }
};

const ISSUE_STATUS_META: Record<string, { tag: TagType; color: string }> = {
  backlog: { tag: "info", color: "#909399" },
  todo: { tag: "info", color: "#67c23a" },
  in_progress: { tag: "primary", color: "#409eff" },
  in_review: { tag: "warning", color: "#e6a23c" },
  done: { tag: "success", color: "#67c23a" },
  cancelled: { tag: "danger", color: "#f56c6c" }
};

const FINAL_STATUS = new Set(["completed", "cancelled", "done"]);

function statusLabel(s: string): string {
  const key = `roadmap.status.${s}` as any;
  const translated = t(key);
  return translated !== key ? translated : MODULE_STATUS_MAP[s as ModuleStatus] ?? s;
}

function issueStatusLabel(s: string): string {
  const key = `roadmap.status.issue.${s}` as any;
  const translated = t(key);
  return translated !== key ? translated : s;
}

const columns = ref<RoadmapColumn[]>([]);
const allItems = ref<RoadmapItem[]>([]);

const projects = computed(() => projectStore.projects.map(p => ({ key: p.key, name: p.name })));
const projectNames = computed(() => new Map(projectStore.projects.map(p => [p.key, p.name])));

// -- Risk helpers --
type RiskLevel = "overdue" | "dueSoon" | "none";

function riskLevel(item: RoadmapItem): RiskLevel {
  if (!item.endDate || FINAL_STATUS.has(item.status)) return "none";
  const today = dayjs().startOf("day");
  const end = dayjs(item.endDate).startOf("day");
  if (!end.isValid()) return "none";
  if (end.isBefore(today)) return "overdue";
  const daysLeft = end.diff(today, "day");
  if (daysLeft <= 3) return "dueSoon";
  return "none";
}

function riskLabel(item: RoadmapItem): string {
  const level = riskLevel(item);
  if (level === "overdue") return t("roadmap.overdue");
  if (level === "dueSoon") return t("roadmap.dueSoon");
  return "";
}

function riskClass(item: RoadmapItem) {
  const level = riskLevel(item);
  return {
    "roadmap__item--overdue": level === "overdue",
    "roadmap__item--due-soon": level === "dueSoon"
  };
}

function riskFootClass(item: RoadmapItem) {
  const level = riskLevel(item);
  return {
    "roadmap__item-foot-item--overdue": level === "overdue",
    "roadmap__item-foot-item--due-soon": level === "dueSoon"
  };
}

// -- Filtered items --
const filteredItems = computed(() => {
  let items = allItems.value;
  if (hasKindFilter.value) {
    items = items.filter(i => kindFilter.value.has(i.kind));
  }
  if (search.value) {
    const q = search.value.toLowerCase();
    items = items.filter(i => i.name.toLowerCase().includes(q) || (i.detail && i.detail.toLowerCase().includes(q)));
  }
  if (statusFilter.value) {
    items = items.filter(i => i.status === statusFilter.value);
  }
  if (riskFilter.value) {
    items = items.filter(i => riskLevel(i) === riskFilter.value);
  }
  return items;
});

const filteredColumns = computed(() => {
  const byProject: Record<string, RoadmapItem[]> = {};
  for (const item of filteredItems.value) {
    (byProject[item.id.split("-")[0]] ??= []).push(item);
  }
  return Object.entries(byProject)
    .map(([projectKey, items], i) => ({
      project: projectNames.value.get(projectKey) ?? projectKey,
      projectKey,
      ...COL_HEADER_STYLES[i % COL_HEADER_STYLES.length],
      items: items.sort((a, b) => a.sortDate.localeCompare(b.sortDate))
    }))
    .sort((a, b) => a.project.localeCompare(b.project));
});

// -- Stats --
const totalItems = computed(() => filteredItems.value.length);

const statusCounts = computed(() => {
  const counts: Record<string, number> = { planned: 0, in_progress: 0, completed: 0, cancelled: 0 };
  allItems.value.forEach(i => {
    if (counts[i.status] !== undefined) counts[i.status]++;
  });
  return counts;
});

const riskCounts = computed(() => {
  let overdue = 0;
  let dueSoon = 0;
  allItems.value.forEach(i => {
    const level = riskLevel(i);
    if (level === "overdue") overdue++;
    else if (level === "dueSoon") dueSoon++;
  });
  return { overdue, dueSoon };
});

const kindSegments = computed(() => {
  const kindColors: Record<string, string> = { module: "#9b59b6", issue: "#409eff" };
  const groups = new Map<string, { count: number; color: string }>();
  for (const item of allItems.value) {
    const k = item.kind;
    if (!groups.has(k)) groups.set(k, { count: 0, color: kindColors[k] || "#909399" });
    groups.get(k)!.count++;
  }
  const total = allItems.value.length || 1;
  return Array.from(groups.entries()).map(([label, { count, color }]) => ({
    label,
    count,
    width: Math.round((count / total) * 100) || 0,
    color
  }));
});

// -- Health stats --
const healthIssues = computed(() => {
  const issues: string[] = [];
  const active = allItems.value.filter(i => !FINAL_STATUS.has(i.status));
  const missingDates = active.filter(i => !i.startDate || !i.endDate).length;
  const missingLead = active.filter(i => !i.lead).length;
  const missingIssues = active.filter(i => i.kind === "module" && i.issueKeys.length === 0).length;
  if (missingDates > 0) issues.push(t("roadmap.health.missingDates", { n: missingDates }));
  if (missingLead > 0) issues.push(t("roadmap.health.missingLead", { n: missingLead }));
  if (missingIssues > 0) issues.push(t("roadmap.health.missingIssues", { n: missingIssues }));
  return issues;
});

// -- Helpers --
function colProgress(col: RoadmapColumn) {
  let done = 0;
  let inProgress = 0;
  let total = 0;
  col.items.forEach(i => {
    done += i.done;
    inProgress += i.inProgress;
    total += i.total;
  });
  return { done, inProgress, total, pct: total ? Math.round((done / total) * 100) : 0, activePct: total ? Math.round((inProgress / total) * 100) : 0 };
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = dayjs(iso);
  return d.isValid() ? d.format("M/D") : "—";
}

function fmtRelative(iso?: string) {
  if (!iso) return "";
  return formatRelativeTime(iso);
}

function fmtAbsolute(iso?: string) {
  if (!iso) return "";
  return formatAbsolute(iso);
}

function pct(item: RoadmapItem) {
  return item.total ? Math.round((item.done / item.total) * 100) : 0;
}

function progressColor(item: RoadmapItem) {
  const v = pct(item);
  if (v >= 100) return "#67c23a";
  if (v >= 75) return "#409eff";
  if (v >= 50) return "#e6a23c";
  return "#f56c6c";
}

function donePct(item: RoadmapItem) {
  return item.total ? Math.round((item.done / item.total) * 100) : 0;
}

function inProgressPct(item: RoadmapItem) {
  return item.total ? Math.round((item.inProgress / item.total) * 100) : 0;
}

function sortColumn(col: RoadmapColumn, cmd: string) {
  if (cmd === "date") {
    col.items.sort((a, b) => a.sortDate.localeCompare(b.sortDate));
  } else if (cmd === "progress") {
    col.items.sort((a, b) => pct(b) - pct(a));
  } else if (cmd === "name") {
    col.items.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// -- Data loading --
async function loadData() {
  loading.value = true;
  partialError.value = false;
  try {
    const [modResult, issResult] = await Promise.allSettled([
      moduleStore.fetchModules({ pageSize: 500 }),
      issueStore.fetchIssues({ pageSize: 5000 })
    ]);

    if (modResult.status === "rejected") {
      console.error("[Roadmap] fetchModules failed:", modResult.reason);
      partialError.value = true;
    }
    if (issResult.status === "rejected") {
      console.error("[Roadmap] fetchIssues failed:", issResult.reason);
      partialError.value = true;
    }

    const issueStatus = new Map<string, string>();
    const issuePoints = new Map<string, number>();
    if (issResult.status === "fulfilled") {
      issueStore.issues.forEach(i => {
        issueStatus.set(i.key, i.status);
        if (i.story_points) issuePoints.set(i.key, i.story_points);
      });
    }

    const items: RoadmapItem[] = [];
    const dateTarget = filterDateStr.value;
    const kindLabelMap = KIND_LABEL.value;

    if (modResult.status === "fulfilled") {
      moduleStore.modules.forEach(m => {
        if (dateTarget && !inDateRange(m.start_date ?? "", m.due_date ?? "", dateTarget)) return;
        const status = m.status ?? "planned";
        const meta = STATUS_META[status] ?? { tag: "info" as TagType, color: "#909399" };
        const { done, inProgress, total } = progressOf(m.issue_keys ?? [], issueStatus, issuePoints);
        items.push({
          id: m.key,
          name: m.name,
          kind: "module",
          kindLabel: kindLabelMap.module,
          status,
          statusLabel: statusLabel(status),
          tagType: meta.tag,
          color: meta.color,
          dates: `${fmtDate(m.start_date)} → ${fmtDate(m.due_date)}`,
          sortDate: m.start_date || "9999",
          startDate: m.start_date ?? "",
          endDate: m.due_date ?? "",
          detail: m.description,
          lead: m.lead,
          link: `/module/${m.key}`,
          done,
          inProgress,
          total,
          issueKeys: m.issue_keys ?? [],
          lastUpdated: m.updated_at,
          ykModulePath: m.yk_module_path
        });
      });
    }

    // Collect linked issue keys for standalone detection
    const linkedIssueKeys = new Set<string>();
    if (modResult.status === "fulfilled") {
      moduleStore.modules.forEach(m => {
        (m.issue_keys ?? []).forEach(k => linkedIssueKeys.add(k));
      });
    }

    // Standalone (unlinked) issues as roadmap items
    if (issResult.status === "fulfilled") {
      issueStore.issues.forEach(iss => {
        if (linkedIssueKeys.has(iss.key)) return;
        if (dateTarget && !inDateRange(iss.start_date ?? "", iss.due_date ?? "", dateTarget)) return;
        if (iss.status === "cancelled") return;

        const status = iss.status ?? "backlog";
        const meta = ISSUE_STATUS_META[status] ?? { tag: "info" as TagType, color: "#909399" };
        const sortDate = iss.due_date || iss.start_date || iss.created_at?.slice(0, 10) || "9999";

        items.push({
          id: iss.key,
          name: iss.title,
          kind: "issue",
          kindLabel: kindLabelMap.issue,
          status,
          statusLabel: issueStatusLabel(status),
          tagType: meta.tag,
          color: meta.color,
          dates: `${fmtDate(iss.start_date)} → ${fmtDate(iss.due_date)}`,
          sortDate,
          startDate: iss.start_date ?? "",
          endDate: iss.due_date ?? "",
          detail: iss.description,
          lead: iss.assignee,
          link: `/issue/${iss.key}`,
          done: status === "done" ? 1 : 0,
          inProgress: ACTIVE_STATUSES.has(status) ? 1 : 0,
          total: 1,
          issueKeys: [],
          lastUpdated: iss.updated_at,
          issueType: iss.issue_type
        });
      });
    }

    allItems.value = items;
    columns.value = filteredColumns.value;
    lastRefreshed.value = new Date();
    initialLoading.value = false;
  } finally {
    loading.value = false;
  }
}

const ACTIVE_STATUSES = new Set(["in_progress", "in_review"]);

function progressOf(keys: string[], issueStatus: Map<string, string>, issuePoints: Map<string, number>) {
  let done = 0;
  let inProgress = 0;
  let total = 0;
  for (const key of keys) {
    const status = issueStatus.get(key);
    if (status === undefined || status === "cancelled") continue;
    const points = issuePoints.get(key) || 1;
    total += points;
    if (status === "done") done += points;
    else if (ACTIVE_STATUSES.has(status)) inProgress += points;
  }
  return { done, inProgress, total };
}

function inDateRange(start: string, end: string, target: string): boolean {
  if (!target) return true;
  return (!start || start <= target) && (!end || end >= target);
}

watch(filteredColumns, v => {
  columns.value = v;
});

// -- Navigation --
function goTo(link: string) {
  router.push(link);
}
function goProject(key: string) {
  if (key) router.push(`/project/${key}`);
}
async function goToKnowledge(filePath: string) {
  if (!filePath) return;
  let content = "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || "";
  } catch {
    /* empty */
  }
  descDialogRef.value?.openFile({
    path: filePath,
    title: filePath.split("/").pop() || filePath,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, { type: "module-doc" });
    }
  });
}
function clearFilters() {
  search.value = "";
  statusFilter.value = "";
  riskFilter.value = "";
  kindFilter.value = new Set();
  filterDate.value = null;
  loadData();
}

// -- Issue helpers --
const issueTitleMap = computed(() => {
  const m = new Map<string, string>();
  issueStore.issues.forEach(i => m.set(i.key, i.title));
  return m;
});
function issueTitle(key: string) {
  return issueTitleMap.value.get(key) || key;
}

async function openIssuePreview(key: string) {
  const issue = issueStore.issues.find(i => i.key === key);
  if (!issue) return;
  const date = (issue.created_at || "").slice(0, 10);
  const type = issue.issue_type || "task";
  const filePath = `issues/${date}/${type}/${key}.md`;
  let content = issue.description || "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || content;
  } catch {
    /* use issue.description as fallback */
  }
  descDialogRef.value?.openFile({
    path: filePath,
    title: issue.title,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, {
        title: issue.title,
        type: "issue-description",
        status: issue.status,
        created: date
      });
    }
  });
}

// -- Preview --
const descDialogRef = ref<{
  openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void;
} | null>(null);

async function openPreview(item: RoadmapItem) {
  const date = (item.startDate || "").slice(0, 10);
  const filePath = `roadmap/${item.kind}/${item.id}.md`;
  let content = item.detail || "";
  try {
    const res = await readKnowledgeFile(filePath);
    content = res.content || content;
  } catch {
    /* use item.detail as fallback */
  }
  descDialogRef.value?.openFile({
    path: filePath,
    title: item.name,
    content,
    onSave: async (newContent: string) => {
      await writeKnowledgeFile(filePath, newContent, {
        title: item.name,
        type: "roadmap-item",
        status: item.statusLabel,
        kind: item.kind,
        created: date
      });
    }
  });
}

// -- Context menu --
const contextMenu = reactive<{
  visible: boolean;
  x: number;
  y: number;
  item: RoadmapItem | null;
}>({ visible: false, x: 0, y: 0, item: null });

function openContextMenu(e: MouseEvent, item: RoadmapItem) {
  contextMenu.x = Math.min(e.clientX, window.innerWidth - 200);
  contextMenu.y = Math.min(e.clientY, window.innerHeight - 320);
  contextMenu.item = item;
  contextMenu.visible = true;
}

function closeContextMenu() {
  contextMenu.visible = false;
  contextMenu.item = null;
}

function ctxOpen() {
  const item = contextMenu.item;
  closeContextMenu();
  if (item) goTo(item.link);
}

function ctxPreview() {
  const item = contextMenu.item;
  closeContextMenu();
  if (item) openPreview(item);
}

async function ctxCopyId() {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    await navigator.clipboard.writeText(item.id);
    ElMessage.success(t("roadmap.messages.copied", { id: item.id }));
  } catch {
    ElMessage.error(t("roadmap.messages.copyFailed"));
  }
}

async function ctxQuickStatus(status: string) {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  try {
    if (item.kind === "module") {
      await moduleStore.editModule(item.id, { status: status as ModuleStatus });
    } else if (item.kind === "issue") {
      await issueStore.editIssue(item.id, { status: status as IssueStatus });
    }
    ElMessage.success(t("roadmap.messages.statusChanged", { name: item.name, status: statusLabel(status) }));
    loadData();
  } catch {
    loadData();
  }
}

async function ctxDelete() {
  const item = contextMenu.item;
  closeContextMenu();
  if (!item) return;
  const ok = await confirm(
    t("roadmap.confirm.deleteMessage", { kindLabel: item.kindLabel, name: item.name }),
    t("roadmap.confirm.deleteTitle")
  );
  if (!ok) return;
  const projectKey = item.id.split("-")[0];
  if (item.kind === "module") {
    await tryAction(() => moduleStore.removeModule(item.id, projectKey));
  } else if (item.kind === "issue") {
    await tryAction(() => issueStore.removeIssue(item.id, projectKey));
  }
  ElMessage.success(t("roadmap.messages.deleted", { name: item.name }));
  loadData();
}

// -- Lifecycle --
onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  await loadData();
  startPolling();
  document.addEventListener("click", closeContextMenu);
});

onUnmounted(() => {
  stopPolling();
  document.removeEventListener("click", closeContextMenu);
  if (searchTimer) clearTimeout(searchTimer);
});

watch(filterDateStr, () => {
  loadData();
});
</script>

<style scoped lang="scss">
@use "../../styles/index.scss";
</style>