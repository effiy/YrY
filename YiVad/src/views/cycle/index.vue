<template>
  <div class="cycle-list">
    <!-- Header Card -->
    <div v-if="!props.projectKey" class="cycle-list__header">
      <div class="cycle-list__header-icon">
        <el-icon><Refresh /></el-icon>
      </div>
      <div class="cycle-list__header-text">
        <h2 class="cycle-list__header-title">Cycles</h2>
        <p class="cycle-list__header-desc">Plan and track development sprints and iterations</p>
      </div>
      <div class="cycle-list__header-pills">
        <div class="cycle-list__header-pill">
          <span class="cycle-list__header-pill-val">{{ store.total }}</span>
          <span class="cycle-list__header-pill-lbl">Total</span>
        </div>
        <div class="cycle-list__header-pill">
          <span class="cycle-list__header-pill-val">{{ activeCount }}</span>
          <span class="cycle-list__header-pill-lbl">Active</span>
        </div>
        <div class="cycle-list__header-pill">
          <span class="cycle-list__header-pill-val">{{ completedCount }}</span>
          <span class="cycle-list__header-pill-lbl">Done</span>
        </div>
        <div class="cycle-list__header-pill cycle-list__header-pill--accent">
          <span class="cycle-list__header-pill-val">{{ overallCompletion }}%</span>
          <span class="cycle-list__header-pill-lbl">Completed</span>
        </div>
      </div>
      <div class="cycle-list__header-right">
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

    <!-- Charts -->
    <div v-if="!props.projectKey" class="cycle-list__charts">
      <div class="cycle-chart" :class="{ 'cycle-chart--active': statusFilter }">
        <div class="cycle-chart__title">
          Status
          <span v-if="statusFilter" class="cycle-chart__badge">filtered</span>
        </div>
        <div class="cycle-chart__body">
          <ECharts :option="statusDonutOption" height="200" @chart-click="onStatusChartClick" />
        </div>
      </div>
      <div class="cycle-chart">
        <div class="cycle-chart__title">Progress Distribution</div>
        <div class="cycle-chart__body">
          <ECharts :option="progressBarOption" height="200" />
        </div>
      </div>
      <div class="cycle-chart">
        <div class="cycle-chart__title">Created · 14d</div>
        <div class="cycle-chart__body">
          <ECharts :option="trendOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div v-if="!props.projectKey && recentlyViewed.length" class="cycle-list__recent">
      <span class="cycle-list__recent-label">Recently viewed</span>
      <button
        v-for="r in recentlyViewed"
        :key="r.key"
        type="button"
        class="cycle-list__recent-chip"
        :title="r.name"
        @click="goDetail(r.key)"
      >
        <span class="cycle-list__recent-dot" :style="{ background: statusColor(r.status) }" />
        <span class="cycle-list__recent-key">{{ r.key }}</span>
        <span class="cycle-list__recent-name">{{ r.name }}</span>
      </button>
      <button type="button" class="cycle-list__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activePills.length" class="cycle-list__pills">
      <span class="cycle-list__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="p.clear()">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    <!-- Body -->
    <div class="cycle-list__body">
      <div class="cycle-list__sidebar">
        <div class="cycle-list__props">
          <div class="cycle-list__prop">
            <span class="cycle-list__prop-label">Overview</span>
          </div>
          <div class="cycle-list__prop">
            <div class="cycle-list__stat">
              <div class="cycle-list__stat-icon" style="background:linear-gradient(135deg,#5470c6,#4460b0)"><el-icon><Calendar /></el-icon></div>
              <div class="cycle-list__stat-info">
                <div class="cycle-list__stat-value">{{ store.total }}</div>
                <div class="cycle-list__stat-label">Total</div>
              </div>
            </div>
          </div>
          <div class="cycle-list__prop">
            <div class="cycle-list__stat">
              <div class="cycle-list__stat-icon" style="background:linear-gradient(135deg,#5ab1ef,#3a90d0)"><el-icon><Loading /></el-icon></div>
              <div class="cycle-list__stat-info">
                <div class="cycle-list__stat-value">{{ activeCount }}</div>
                <div class="cycle-list__stat-label">Active</div>
              </div>
            </div>
          </div>
          <div class="cycle-list__prop">
            <div class="cycle-list__stat">
              <div class="cycle-list__stat-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><CircleCheckFilled /></el-icon></div>
              <div class="cycle-list__stat-info">
                <div class="cycle-list__stat-value">{{ completedCount }}</div>
                <div class="cycle-list__stat-label">Done</div>
              </div>
            </div>
          </div>
          <div class="cycle-list__prop">
            <span class="cycle-list__prop-label">Completion</span>
            <el-progress :percentage="overallCompletion" :stroke-width="6" :show-text="true" />
          </div>
        </div>
        <div class="cycle-list__props" style="margin-top:12px">
          <div class="cycle-list__prop">
            <span class="cycle-list__prop-label">Needs Attention</span>
          </div>
          <div class="cycle-list__prop">
            <div class="cycle-list__attention-item cycle-list__attention-item--overdue">
              <el-icon><Clock /></el-icon>
              <span class="cycle-list__attention-count">{{ attention.overdue }}</span>
              <span class="cycle-list__attention-label">Overdue</span>
            </div>
          </div>
          <div class="cycle-list__prop">
            <div class="cycle-list__attention-item cycle-list__attention-item--empty">
              <el-icon><Folder /></el-icon>
              <span class="cycle-list__attention-count">{{ attention.empty }}</span>
              <span class="cycle-list__attention-label">No Issues</span>
            </div>
          </div>
          <div class="cycle-list__prop">
            <div class="cycle-list__attention-item cycle-list__attention-item--stalled">
              <el-icon><WarningFilled /></el-icon>
              <span class="cycle-list__attention-count">{{ attention.stalled }}</span>
              <span class="cycle-list__attention-label">Stalled</span>
            </div>
          </div>
        </div>
        <div class="cycle-list__props" style="margin-top:12px">
          <div class="cycle-list__prop">
            <span class="cycle-list__prop-label">Data Quality</span>
            <span class="cycle-list__prop-hint">{{ store.cycles.length }} cycles</span>
          </div>
          <div v-for="c in completeness" :key="c.key" class="cycle-list__prop">
            <div class="cycle-list__quality-row">
              <span class="cycle-list__quality-label">{{ c.label }}</span>
              <span class="cycle-list__quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
            </div>
            <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
          </div>
        </div>
      </div>

      <div class="cycle-list__main">
        <div class="cycle-list__head">
          <div class="cycle-list__head-left">
            <span class="cycle-list__head-count">{{ countLabel }}</span>
          </div>
          <div class="cycle-list__head-actions">
            <template v-if="!props.projectKey">
              <el-input
                v-model="searchText"
                class="cycle-list__search"
                size="small"
                clearable
                placeholder="Search cycles…"
                :prefix-icon="Search"
              />
              <el-select v-model="statusFilter" class="cycle-list__status" size="small" placeholder="Status">
                <el-option label="All" value="" />
                <el-option label="Upcoming" value="upcoming" />
                <el-option label="Active" value="active" />
                <el-option label="Completed" value="completed" />
              </el-select>
              <el-select v-model="sortBy" class="cycle-list__sort" size="small">
                <el-option label="End date" value="end" />
                <el-option label="Name A–Z" value="name" />
                <el-option label="Most issues" value="issues" />
                <el-option label="Most done" value="progress" />
              </el-select>
            </template>
            <el-button type="primary" :icon="Plus" @click="openCreate">New Cycle</el-button>
          </div>
        </div>

        <div v-loading="store.loading" class="cycle-list__grid">
          <el-card
            v-for="cycle in displayedCycles"
            :key="cycle.key"
            class="cycle-card"
            shadow="hover"
            :class="{ 'cycle-card--active': cycle.status === 'active', 'cycle-card--completed': cycle.status === 'completed' }"
            @click="goDetail(cycle.key)"
          >
            <div class="cycle-card__status-bar" :style="{ background: statusColor(cycle.status) }" />
            <div class="cycle-card__body">
              <div class="cycle-card__name-row">
                <span class="cycle-card__name" :title="cycle.name">{{ cycle.name }}</span>
                <el-tag :type="statusTagType(cycle.status)" size="small">{{ statusLabel(cycle.status) }}</el-tag>
              </div>

              <button
                v-if="!props.projectKey && cycle.project_key"
                type="button"
                class="cycle-card__project"
                title="Open project"
                @click.stop="goProject(cycle.project_key)"
              >
                <el-icon><Folder /></el-icon>
                <span>{{ projectName(cycle.project_key) }}</span>
              </button>

              <div v-if="cycle.goal" class="cycle-card__goal">{{ cycle.goal }}</div>

              <div class="cycle-card__dates">
                <el-icon><Calendar /></el-icon>
                <span>{{ formatDate(cycle.start_date) }} — {{ formatDate(cycle.end_date) }}</span>
                <span class="cycle-card__time-hint" :class="timeHintClass(cycle)">{{ timeHint(cycle) }}</span>
              </div>

              <div v-if="issueCount(cycle)" class="cycle-card__progress">
                <div class="cycle-card__progress-row">
                  <span>{{ doneCount(cycle) }} / {{ issueCount(cycle) }} done</span>
                  <span>{{ progressPct(cycle) }}%</span>
                </div>
                <el-progress :percentage="progressPct(cycle)" :stroke-width="6" :show-text="false" :color="progressColor(cycle)" />
              </div>

              <div class="cycle-card__footer">
                <div class="cycle-card__footer-left">
                  <span class="cycle-card__issues">{{ issueCount(cycle) }} issues</span>
                  <span class="cycle-card__updated">Updated {{ formatRelativeTime(cycle.updated_at) }}</span>
                </div>
                <div class="cycle-card__actions">
                  <el-button link size="small" type="primary" @click.stop="goDetail(cycle.key)">Open</el-button>
                  <el-button link size="small" @click.stop="openEdit(cycle)">Edit</el-button>
                  <el-button link size="small" type="success" @click.stop="openPlanning(cycle)">Plan</el-button>
                </div>
              </div>
            </div>
          </el-card>

          <div v-if="!store.loading && !store.cycles.length" class="cycle-list__empty">
            <el-empty description="No cycles yet">
              <el-button type="primary" @click="openCreate">Create your first cycle</el-button>
            </el-empty>
          </div>
          <div v-else-if="!store.loading && store.cycles.length && !displayedCycles.length" class="cycle-list__empty">
            <el-empty description="No matching cycles" />
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? 'Edit Cycle' : 'New Cycle'"
      width="560px"
      destroy-on-close
    >
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="e.g. Sprint 1" maxlength="100" />
        </el-form-item>
        <el-form-item label="Goal">
          <el-input v-model="dialog.form.goal" type="textarea" :rows="2" placeholder="Cycle goal" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Start Date" prop="start_date">
              <el-date-picker v-model="dialog.form.start_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="End Date" prop="end_date">
              <el-date-picker v-model="dialog.form.end_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Status">
          <el-radio-group v-model="dialog.form.status">
            <el-radio v-for="(label, val) in CYCLE_STATUS_MAP" :key="val" :value="val">{{ label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="!props.projectKey" label="Project" prop="project_key">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>

    <IssuePlanningPanel v-model="planningVisible" :cycle="planningCycle" @closed="store.fetchCycles({ project_key: props.projectKey })" />
  </div>
</template>

<script setup lang="ts" name="cycleList">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Calendar, Search, Folder, Loading, CircleCheckFilled, Refresh, Clock, WarningFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useCycleStore } from "@/stores/modules/cycle";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import type { Cycle, CycleStatus } from "@/api/modules/cycleService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { getProjectList } from "@/api/modules/projectService";
import type { Project } from "@/api/modules/projectService";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import IssuePlanningPanel from "./components/IssuePlanningPanel.vue";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { useDateFilter } from "@/hooks/useDateFilter";

const props = defineProps<{ projectKey?: string }>();

const router = useRouter();
const store = useCycleStore();
const formRef = ref<FormInstance>();

const planningVisible = ref(false);
const planningCycle = ref<Cycle | null>(null);
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"end" | "name" | "issues" | "progress">("end");

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

// ── Per-cycle issue stats ──
const statsByKey = ref<Map<string, { issues: number; done: number }>>(new Map());
const projectNameByKey = ref<Map<string, string>>(new Map());
const recentlyViewed = ref<Cycle[]>([]);

async function loadStats() {
  try {
    const res = await getIssueList({ project_key: props.projectKey || undefined, pageSize: 1000 });
    const issues = (res.data?.list as Issue[]) ?? [];
    const map = new Map<string, { issues: number; done: number }>();
    for (const i of issues) {
      if (!i.cycle_key) continue;
      let s = map.get(i.cycle_key);
      if (!s) { s = { issues: 0, done: 0 }; map.set(i.cycle_key, s); }
      s.issues++;
      if (i.status === "done") s.done++;
    }
    statsByKey.value = map;
  } catch { /* best-effort */ }
}

async function loadProjects() {
  if (props.projectKey) return;
  try {
    const res = await getProjectList({ pageSize: 500 });
    const projects = (res.data?.list as Project[]) ?? [];
    projectNameByKey.value = new Map(projects.map(p => [p.key, p.name]));
  } catch { /* best-effort */ }
}

function issueCount(cycle: Cycle): number {
  const s = statsByKey.value.get(cycle.key);
  return s?.issues ?? (cycle.issue_keys?.length || 0);
}

function doneCount(cycle: Cycle): number {
  return statsByKey.value.get(cycle.key)?.done ?? 0;
}

function progressPct(cycle: Cycle): number {
  if (cycle.status === "completed") return 100;
  const total = issueCount(cycle);
  if (!total) return 0;
  return Math.round((doneCount(cycle) / total) * 100);
}

function progressColor(cycle: Cycle): string {
  const pct = progressPct(cycle);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

function projectName(key: string): string {
  return projectNameByKey.value.get(key) || key;
}

function daysLeft(cycle: Cycle): number {
  if (cycle.status === "completed") return 0;
  const ms = new Date(cycle.end_date).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function timeHint(cycle: Cycle): string {
  if (cycle.status === "completed") return "Completed";
  if (cycle.status === "upcoming") return `Starts ${formatDate(cycle.start_date)}`;
  const d = daysLeft(cycle);
  return d > 0 ? `${d}d left` : "Ended";
}

function timeHintClass(cycle: Cycle): string {
  if (cycle.status === "completed") return "cycle-card__time-hint--done";
  if (cycle.status === "upcoming") return "cycle-card__time-hint--upcoming";
  const d = daysLeft(cycle);
  if (d <= 0) return "cycle-card__time-hint--ended";
  if (d <= 3) return "cycle-card__time-hint--soon";
  return "cycle-card__time-hint--ok";
}

function setStatusFilter(status: string) {
  statusFilter.value = statusFilter.value === status ? "" : status;
}

// ── Displayed cycles ──
const displayedCycles = computed(() => {
  let list = store.cycles;
  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        (c.goal || "").toLowerCase().includes(q) ||
        projectName(c.project_key).toLowerCase().includes(q)
    );
  }
  if (statusFilter.value) list = list.filter(c => c.status === statusFilter.value);
  const sorted = [...list];
  if (sortBy.value === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy.value === "issues") {
    sorted.sort((a, b) => issueCount(b) - issueCount(a));
  } else if (sortBy.value === "progress") {
    sorted.sort((a, b) => progressPct(b) - progressPct(a));
  } else {
    sorted.sort((a, b) => (b.end_date || "").localeCompare(a.end_date || ""));
  }
  return sorted;
});

// ── Counts ──
const upcomingCount = computed(() => store.cycles.filter(c => c.status === "upcoming").length);
const activeCount = computed(() => store.cycles.filter(c => c.status === "active").length);
const completedCount = computed(() => store.cycles.filter(c => c.status === "completed").length);
const totalIssues = computed(() => store.cycles.reduce((s, c) => s + issueCount(c), 0));
const totalDone = computed(() => store.cycles.reduce((s, c) => s + doneCount(c), 0));
const overallCompletion = computed(() => (totalIssues.value ? Math.round((totalDone.value / totalIssues.value) * 100) : 0));
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!statusFilter.value;
  return isFiltered ? `${displayedCycles.value.length} of ${store.total} cycles` : `${store.total} cycles`;
});

// ── Filter pills ──
const activePills = computed(() => {
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (searchText.value.trim()) {
    pills.push({ id: "search", label: `Search: ${searchText.value.trim()}`, clear: () => { searchText.value = ""; } });
  }
  if (statusFilter.value) {
    pills.push({ id: "status", label: `Status: ${CYCLE_STATUS_MAP[statusFilter.value as CycleStatus] || statusFilter.value}`, clear: () => { statusFilter.value = ""; } });
  }
  if (sortBy.value !== "end") {
    const labels: Record<string, string> = { name: "Name A–Z", issues: "Most issues", progress: "Most done" };
    pills.push({ id: "sort", label: `Sort: ${labels[sortBy.value] || sortBy.value}`, clear: () => { sortBy.value = "end"; } });
  }
  return pills;
});

function clearAllFilters() {
  searchText.value = "";
  statusFilter.value = "";
  sortBy.value = "end";
}

// ── Charts ──
const STATUS_COLOR: Record<CycleStatus, string> = {
  upcoming: "#909399",
  active: "#409eff",
  completed: "#67c23a"
};

const statusDonutOption = computed<ECOption>(() => {
  const order: CycleStatus[] = ["upcoming", "active", "completed"];
  const data = order
    .map(s => ({ name: s, value: store.cycles.filter(c => c.status === s).length, itemStyle: { color: STATUS_COLOR[s] } }))
    .filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 }, formatter: (n: string) => CYCLE_STATUS_MAP[n as CycleStatus] ?? n },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const progressBarOption = computed<ECOption>(() => {
  const buckets = { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0 };
  for (const c of store.cycles) {
    const p = progressPct(c);
    if (p < 25) buckets["0-25%"]++;
    else if (p < 50) buckets["25-50%"]++;
    else if (p < 75) buckets["50-75%"]++;
    else buckets["75-100%"]++;
  }
  const categories = Object.keys(buckets);
  const values = Object.values(buckets);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: categories, axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color: "#73c0de", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
});

const trendOption = computed<ECOption>(() => {
  const labels: string[] = [];
  const values: number[] = [];
  const today = new Date();
  const createdByDay: Record<string, number> = {};
  for (const c of store.cycles) {
    const day = (c.created_at || "").slice(0, 10);
    if (day) createdByDay[day] = (createdByDay[day] ?? 0) + 1;
  }
  for (let d = 13; d >= 0; d--) {
    const dt = new Date(today.getTime() - d * 86400000);
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
    values.push(createdByDay[key] ?? 0);
  }
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, interval: 3 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color: "#91cc75", borderRadius: [3, 3, 0, 0] } }]
  };
});

function onStatusChartClick(e: { name?: string }) {
  if (!e?.name) return;
  setStatusFilter(e.name);
}

// ── Sidebar: attention ──
const attention = computed(() => {
  const now = Date.now();
  const overdue = store.cycles.filter(c => c.status === "active" && new Date(c.end_date).getTime() < now).length;
  const empty = store.cycles.filter(c => !issueCount(c) && c.status !== "completed").length;
  const stalled = store.cycles.filter(c => c.status === "active" && issueCount(c) > 0 && progressPct(c) === 0).length;
  return { overdue, empty, stalled };
});

// ── Sidebar: data quality ──
const completeness = computed(() => {
  const total = store.cycles.length;
  const fields = [
    { key: "goal", label: "Goal", filled: store.cycles.filter(c => c.goal).length },
    { key: "dates", label: "Dates", filled: store.cycles.filter(c => c.start_date && c.end_date).length },
    { key: "issues", label: "Issues", filled: store.cycles.filter(c => issueCount(c) > 0).length }
  ];
  return fields.map(f => ({ ...f, pct: total ? Math.round((f.filled / total) * 100) : 0 }));
});

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

// ── Recently viewed ──
function trackRecent(cycle: Cycle) {
  recentlyViewed.value = [cycle, ...recentlyViewed.value.filter(r => r.key !== cycle.key)].slice(0, 8);
}

// ── Dialog ──
const rules: FormRules = {
  name: [{ required: true, message: "Cycle name is required", trigger: "blur" }],
  start_date: [{ required: true, message: "Start date is required", trigger: "change" }],
  end_date: [{ required: true, message: "End date is required", trigger: "change" }]
};

const dialog = reactive({
  visible: false,
  isEdit: false,
  submitting: false,
  editKey: "",
  form: {
    name: "",
    goal: "",
    start_date: "",
    end_date: "",
    status: "upcoming" as CycleStatus,
    project_key: props.projectKey || "",
    issue_keys: [] as string[]
  }
});

function openCreate() {
  dialog.isEdit = false;
  dialog.editKey = "";
  dialog.form = { name: "", goal: "", start_date: "", end_date: "", status: "upcoming", project_key: props.projectKey || "", issue_keys: [] };
  dialog.visible = true;
}

function openEdit(cycle: Cycle) {
  dialog.isEdit = true;
  dialog.editKey = cycle.key;
  dialog.form = { name: cycle.name, goal: cycle.goal || "", start_date: cycle.start_date, end_date: cycle.end_date, status: cycle.status, project_key: cycle.project_key, issue_keys: cycle.issue_keys || [] };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    if (dialog.isEdit) {
      await store.editCycle(dialog.editKey, { name: dialog.form.name, goal: dialog.form.goal, start_date: dialog.form.start_date, end_date: dialog.form.end_date, status: dialog.form.status });
      ElMessage.success("Cycle updated");
    } else {
      const key = `CYC-${Date.now().toString(36).toUpperCase()}`;
      await store.addCycle({ key, project_key: dialog.form.project_key || props.projectKey || "", name: dialog.form.name, goal: dialog.form.goal, start_date: dialog.form.start_date, end_date: dialog.form.end_date, status: dialog.form.status, issue_keys: [] });
      ElMessage.success("Cycle created");
    }
    dialog.visible = false;
  } finally {
    dialog.submitting = false;
  }
}

function openPlanning(cycle: Cycle) {
  planningCycle.value = cycle;
  planningVisible.value = true;
}

function goDetail(key: string) {
  const cycle = store.cycles.find(c => c.key === key);
  if (cycle) trackRecent(cycle);
  router.push(`/cycle/${key}`);
}

function goProject(key: string) {
  if (key) router.push(`/project/${key}`);
}

function statusLabel(s: CycleStatus) { return CYCLE_STATUS_MAP[s] || s; }
function statusTagType(s: CycleStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<CycleStatus, "success" | "warning" | "info" | "primary" | "danger"> = { upcoming: "info", active: "primary", completed: "success" };
  return m[s] || "info";
}
function statusColor(s: CycleStatus) {
  return STATUS_COLOR[s] || "#909399";
}

onMounted(() => {
  store.fetchCycles({ project_key: props.projectKey });
  loadStats();
  loadProjects();
});

watch(filterDateStr, () => {
  store.fetchCycles({ project_key: props.projectKey });
  loadStats();
});
</script>

<style scoped lang="scss">
.cycle-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Header Card ──
.cycle-list__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.cycle-list__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #5ab1ef, #3a90d0);
  flex-shrink: 0;
}
.cycle-list__header-text {
  min-width: 0;
  flex: 1;
}
.cycle-list__header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}
.cycle-list__header-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cycle-list__header-pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.cycle-list__header-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 16px;
  border-radius: 8px;
  background: var(--el-fill-color-light);
  min-width: 64px;
  &--accent {
    background: var(--el-color-primary-light-9);
  }
}
.cycle-list__header-pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.cycle-list__header-pill--accent .cycle-list__header-pill-val {
  color: var(--el-color-primary);
}
.cycle-list__header-pill-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
}
.cycle-list__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  :deep(.ho__hero-date-nav) {
    margin: 0;
  }
}

// ── Charts ──
.cycle-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.cycle-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cycle-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}
.cycle-chart__title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.cycle-chart__badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  text-transform: none;
}
.cycle-chart__body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

// ── Recently Viewed ──
.cycle-list__recent {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding: 8px 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  border: 1px solid var(--el-border-color-lighter);
}
.cycle-list__recent-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 2px;
}
.cycle-list__recent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 9px;
  font-size: 12px;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  }
}
.cycle-list__recent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cycle-list__recent-key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.cycle-list__recent-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cycle-list__recent-clear {
  margin-left: auto;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  padding: 4px;
  &:hover { color: var(--el-color-danger); }
}

// ── Filter Pills ──
.cycle-list__pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.cycle-list__pills-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Body / Main / Sidebar ──
.cycle-list__body {
  display: flex;
  gap: 24px;
}
.cycle-list__main {
  flex: 1;
  min-width: 0;
}
.cycle-list__sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
}
.cycle-list__props {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 16px;
}
.cycle-list__prop {
  padding: 8px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.cycle-list__prop-label {
  display: block;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  margin-bottom: 4px;
}
.cycle-list__prop-hint {
  float: right;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cycle-list__stat {
  display: flex;
  align-items: center;
  gap: 10px;
}
.cycle-list__stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
}
.cycle-list__stat-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.cycle-list__stat-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.cycle-list__stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.cycle-list__attention-item {
  display: flex;
  align-items: center;
  gap: 6px;
  .el-icon { font-size: 14px; }
  &--overdue {
    .el-icon, .cycle-list__attention-count { color: var(--el-color-danger); }
  }
  &--empty {
    .el-icon, .cycle-list__attention-count { color: var(--el-color-warning); }
  }
  &--stalled {
    .el-icon, .cycle-list__attention-count { color: var(--el-color-primary); }
  }
}
.cycle-list__attention-count {
  font-size: 16px;
  font-weight: 700;
  font-family: DIN, sans-serif;
  min-width: 20px;
}
.cycle-list__attention-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cycle-list__quality-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.cycle-list__quality-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.cycle-list__quality-pct {
  font-size: 12px;
  font-weight: 600;
  font-family: DIN, sans-serif;
}

// ── Head (search/filter/sort) ──
.cycle-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.cycle-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cycle-list__head-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.cycle-list__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cycle-list__search {
  width: 220px;
}
.cycle-list__status {
  width: 130px;
}
.cycle-list__sort {
  width: 140px;
}

// ── Card Grid ──
.cycle-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.cycle-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}
.cycle-card--active {
  border-color: var(--el-color-primary);
}
.cycle-card--completed {
  opacity: 0.82;
}
.cycle-card__status-bar {
  height: 3px;
}
.cycle-card__body {
  padding: 16px;
}
.cycle-card__name-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.cycle-card__name {
  font-size: 16px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cycle-card__project {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border: none;
  border-radius: 6px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: color 0.15s, background 0.15s;
  .el-icon { font-size: 13px; }
  &:hover {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
.cycle-card__goal {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 10px;
  white-space: pre-wrap;
  word-break: break-word;
}
.cycle-card__dates {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.cycle-card__time-hint {
  margin-left: auto;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 1px 8px;
  &--ok { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &--soon { color: #fff; background: var(--el-color-warning); }
  &--ended { color: #fff; background: var(--el-color-danger); }
  &--done { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--upcoming { color: var(--el-color-info); background: var(--el-color-info-light-9); }
}
.cycle-card__progress {
  margin-bottom: 12px;
}
.cycle-card__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.cycle-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.cycle-card__issues {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.cycle-card__footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cycle-card__updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.cycle-card__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.cycle-list__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>