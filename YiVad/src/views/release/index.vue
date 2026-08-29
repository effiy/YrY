<template>
  <div class="release-list">
    <!-- Header Card -->
    <div v-if="!props.projectKey" class="release-list__header">
      <div class="release-list__header-icon">
        <el-icon><Promotion /></el-icon>
      </div>
      <div class="release-list__header-text">
        <h2 class="release-list__header-title">Releases</h2>
        <p class="release-list__header-desc">Manage software versions and deployment milestones</p>
      </div>
      <div class="release-list__header-pills">
        <div class="release-list__header-pill">
          <span class="release-list__header-pill-val">{{ store.total }}</span>
          <span class="release-list__header-pill-lbl">Total</span>
        </div>
        <div class="release-list__header-pill">
          <span class="release-list__header-pill-val">{{ inProgressCount }}</span>
          <span class="release-list__header-pill-lbl">Active</span>
        </div>
        <div class="release-list__header-pill">
          <span class="release-list__header-pill-val">{{ releasedCount }}</span>
          <span class="release-list__header-pill-lbl">Released</span>
        </div>
        <div class="release-list__header-pill release-list__header-pill--accent">
          <span class="release-list__header-pill-val">{{ overallCompletion }}%</span>
          <span class="release-list__header-pill-lbl">Completed</span>
        </div>
      </div>
      <div class="release-list__header-right">
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
    <div v-if="!props.projectKey" class="release-list__charts">
      <div class="release-chart" :class="{ 'release-chart--active': statusFilter }">
        <div class="release-chart__title">
          Status
          <span v-if="statusFilter" class="release-chart__badge">filtered</span>
        </div>
        <div class="release-chart__body">
          <ECharts :option="statusDonutOption" height="200" @chart-click="onStatusChartClick" />
        </div>
      </div>
      <div class="release-chart">
        <div class="release-chart__title">Progress Distribution</div>
        <div class="release-chart__body">
          <ECharts :option="progressBarOption" height="200" />
        </div>
      </div>
      <div class="release-chart">
        <div class="release-chart__title">Created · 14d</div>
        <div class="release-chart__body">
          <ECharts :option="trendOption" height="200" />
        </div>
      </div>
    </div>

    <!-- Recently Viewed -->
    <div v-if="!props.projectKey && recentlyViewed.length" class="release-list__recent">
      <span class="release-list__recent-label">Recently viewed</span>
      <button
        v-for="r in recentlyViewed"
        :key="r.key"
        type="button"
        class="release-list__recent-chip"
        :title="r.version"
        @click="goDetail(r.key)"
      >
        <span class="release-list__recent-dot" :style="{ background: statusColor(r.status) }" />
        <span class="release-list__recent-key">{{ r.version }}</span>
        <span class="release-list__recent-name">{{ r.name }}</span>
      </button>
      <button type="button" class="release-list__recent-clear" @click="recentlyViewed = []">✕</button>
    </div>

    <!-- Active Filter Pills -->
    <div v-if="activePills.length" class="release-list__pills">
      <span class="release-list__pills-label">Filters</span>
      <el-tag v-for="p in activePills" :key="p.id" closable size="small" @close="p.clear()">{{ p.label }}</el-tag>
      <el-button size="small" text type="primary" @click="clearAllFilters">Clear all</el-button>
    </div>

    <!-- Body -->
    <div class="release-list__body">
      <div class="release-list__sidebar">
        <div class="release-list__props">
          <div class="release-list__prop">
            <span class="release-list__prop-label">Overview</span>
          </div>
          <div class="release-list__prop">
            <div class="release-list__stat">
              <div class="release-list__stat-icon" style="background:linear-gradient(135deg,#5470c6,#4460b0)"><el-icon><Promotion /></el-icon></div>
              <div class="release-list__stat-info">
                <div class="release-list__stat-value">{{ store.total }}</div>
                <div class="release-list__stat-label">Total</div>
              </div>
            </div>
          </div>
          <div class="release-list__prop">
            <div class="release-list__stat">
              <div class="release-list__stat-icon" style="background:linear-gradient(135deg,#5ab1ef,#3a90d0)"><el-icon><Loading /></el-icon></div>
              <div class="release-list__stat-info">
                <div class="release-list__stat-value">{{ inProgressCount }}</div>
                <div class="release-list__stat-label">In Progress</div>
              </div>
            </div>
          </div>
          <div class="release-list__prop">
            <div class="release-list__stat">
              <div class="release-list__stat-icon" style="background:linear-gradient(135deg,#91cc75,#7ab85e)"><el-icon><CircleCheckFilled /></el-icon></div>
              <div class="release-list__stat-info">
                <div class="release-list__stat-value">{{ releasedCount }}</div>
                <div class="release-list__stat-label">Released</div>
              </div>
            </div>
          </div>
          <div class="release-list__prop">
            <span class="release-list__prop-label">Completion</span>
            <el-progress :percentage="overallCompletion" :stroke-width="6" :show-text="true" />
          </div>
        </div>
        <div class="release-list__props" style="margin-top:12px">
          <div class="release-list__prop">
            <span class="release-list__prop-label">Needs Attention</span>
          </div>
          <div class="release-list__prop">
            <div class="release-list__attention-item release-list__attention-item--overdue">
              <el-icon><Clock /></el-icon>
              <span class="release-list__attention-count">{{ attention.overdue }}</span>
              <span class="release-list__attention-label">Overdue</span>
            </div>
          </div>
          <div class="release-list__prop">
            <div class="release-list__attention-item release-list__attention-item--empty">
              <el-icon><Folder /></el-icon>
              <span class="release-list__attention-count">{{ attention.empty }}</span>
              <span class="release-list__attention-label">No Issues</span>
            </div>
          </div>
          <div class="release-list__prop">
            <div class="release-list__attention-item release-list__attention-item--stalled">
              <el-icon><WarningFilled /></el-icon>
              <span class="release-list__attention-count">{{ attention.stalled }}</span>
              <span class="release-list__attention-label">Stalled</span>
            </div>
          </div>
        </div>
        <div class="release-list__props" style="margin-top:12px">
          <div class="release-list__prop">
            <span class="release-list__prop-label">Data Quality</span>
            <span class="release-list__prop-hint">{{ store.releases.length }} releases</span>
          </div>
          <div v-for="c in completeness" :key="c.key" class="release-list__prop">
            <div class="release-list__quality-row">
              <span class="release-list__quality-label">{{ c.label }}</span>
              <span class="release-list__quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
            </div>
            <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
          </div>
        </div>
      </div>

      <div class="release-list__main">
        <div class="release-list__head">
          <div class="release-list__head-left">
            <span class="release-list__head-count">{{ countLabel }}</span>
          </div>
          <div class="release-list__head-actions">
            <template v-if="!props.projectKey">
              <el-input
                v-model="searchText"
                class="release-list__search"
                size="small"
                clearable
                placeholder="Search releases…"
                :prefix-icon="Search"
              />
              <el-select v-model="statusFilter" class="release-list__status" size="small" placeholder="Status">
                <el-option label="All" value="" />
                <el-option label="Planned" value="planned" />
                <el-option label="In Progress" value="in_progress" />
                <el-option label="Released" value="released" />
              </el-select>
              <el-select v-model="sortBy" class="release-list__sort" size="small">
                <el-option label="Target date" value="date" />
                <el-option label="Version" value="version" />
                <el-option label="Most issues" value="issues" />
                <el-option label="Most done" value="progress" />
              </el-select>
              <el-select v-model="projectFilter" placeholder="Project" clearable class="release-list__project" size="small" @change="loadData">
                <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
              </el-select>
            </template>
            <el-button type="primary" :icon="Plus" @click="openCreate">New Release</el-button>
          </div>
        </div>

        <div v-loading="store.loading" class="release-list__grid">
          <el-card
            v-for="r in displayedReleases"
            :key="r.key"
            class="release-card"
            :class="{ 'release-card--muted': r.status === 'released' }"
            shadow="hover"
            @click="goDetail(r.key)"
          >
            <div class="release-card__status-bar" :style="{ background: statusColor(r.status) }" />
            <div class="release-card__body">
              <div class="release-card__top">
                <code class="release-card__version" title="Copy version" @click.stop="copyVersion(r)">{{ r.version }}</code>
                <el-tag :type="statusTagType(r.status)" size="small">{{ statusLabel(r.status) }}</el-tag>
              </div>
              <div class="release-card__name">{{ r.name }}</div>

              <button
                v-if="!props.projectKey && r.project_key"
                type="button"
                class="release-card__project"
                title="Open project"
                @click.stop="goProject(r.project_key)"
              >
                <el-icon><Folder /></el-icon>
                <span>{{ projectName(r.project_key) }}</span>
              </button>

              <div v-if="r.notes" class="release-card__notes" v-html="notesHtml(r)" />

              <div class="release-card__meta">
                <span class="release-card__time" :class="timeHintClass(r)">{{ timeHint(r) }}</span>
              </div>

              <div v-if="issueCount(r)" class="release-card__progress">
                <div class="release-card__progress-row">
                  <span>{{ doneCount(r) }} / {{ issueCount(r) }} done</span>
                  <span>{{ progressPct(r) }}%</span>
                </div>
                <el-progress :percentage="progressPct(r)" :stroke-width="6" :show-text="false" :color="progressColor(r)" />
              </div>

              <div class="release-card__footer">
                <div class="release-card__footer-left">
                  <span class="release-card__issues">{{ issueCount(r) }} issues</span>
                  <span class="release-card__updated">Updated {{ formatRelativeTime(r.updated_at) }}</span>
                </div>
                <div class="release-card__actions">
                  <el-button link size="small" type="primary" @click.stop="goDetail(r.key)">Open</el-button>
                  <el-button link size="small" @click.stop="openEdit(r)">Edit</el-button>
                  <el-button link size="small" type="danger" @click.stop="handleDelete(r)">Delete</el-button>
                </div>
              </div>
            </div>
          </el-card>

          <div v-if="!store.loading && !store.releases.length" class="release-list__empty">
            <el-empty description="No releases yet">
              <el-button type="primary" @click="openCreate">Create your first release</el-button>
            </el-empty>
          </div>
          <div v-else-if="!store.loading && store.releases.length && !displayedReleases.length" class="release-list__empty">
            <el-empty description="No matching releases" />
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? 'Edit Release' : 'New Release'" width="560px" destroy-on-close>
      <el-form ref="formRef" :model="dialog.form" :rules="rules" label-width="100px">
        <el-form-item label="Version" prop="version">
          <el-input v-model="dialog.form.version" placeholder="e.g. v1.2.0" maxlength="30" />
        </el-form-item>
        <el-form-item label="Name" prop="name">
          <el-input v-model="dialog.form.name" placeholder="Release name" maxlength="100" />
        </el-form-item>
        <el-form-item label="Notes">
          <el-input v-model="dialog.form.notes" type="textarea" :rows="3" placeholder="Release notes (Markdown)" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Status">
              <el-select v-model="dialog.form.status" style="width: 100%">
                <el-option v-for="(label, val) in RELEASE_STATUS_MAP" :key="val" :label="label" :value="val" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Target Date">
              <el-date-picker v-model="dialog.form.target_date" type="date" style="width: 100%" value-format="YYYY-MM-DD" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="!projectFilter" label="Project">
          <el-input v-model="dialog.form.project_key" placeholder="Project key" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">Cancel</el-button>
        <el-button type="primary" :loading="dialog.submitting" @click="submit">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="releaseManagement">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Plus, Search, Folder, Promotion, Loading, CircleCheckFilled, Clock, WarningFilled } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance, FormRules } from "element-plus";
import { useReleaseStore } from "@/stores/modules/release";
import { formatDate, formatRelativeTime } from "@/utils/datetime";
import { useProjectStore } from "@/stores/modules/project";
import { RELEASE_STATUS_MAP } from "@/api/modules/releaseService";
import type { ReleaseStatus, Release } from "@/api/modules/releaseService";
import { getIssueList } from "@/api/modules/issueService";
import type { Issue } from "@/api/modules/issueService";
import { useMarkdown } from "@/hooks/useMarkdown";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";
import { useDateFilter } from "@/hooks/useDateFilter";

const props = defineProps<{ projectKey?: string }>();

const store = useReleaseStore();
const projectStore = useProjectStore();
const router = useRouter();
const { render: renderMarkdown } = useMarkdown();

const projectFilter = ref(props.projectKey || "");
const formRef = ref<FormInstance>();
const projects = ref<{ key: string; name: string }[]>([]);
const searchText = ref("");
const statusFilter = ref("");
const sortBy = ref<"date" | "version" | "issues" | "progress">("date");
const recentlyViewed = ref<Release[]>([]);

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);

// ── Per-release issue stats ──
const statsByKey = ref<Map<string, { issues: number; done: number }>>(new Map());

async function loadStats() {
  try {
    const res = await getIssueList({ project_key: projectFilter.value || undefined, pageSize: 1000 });
    const issues = (res.data?.list as Issue[]) ?? [];
    const map = new Map<string, { issues: number; done: number }>();
    for (const i of issues) {
      if (!i.release_key) continue;
      let s = map.get(i.release_key);
      if (!s) { s = { issues: 0, done: 0 }; map.set(i.release_key, s); }
      s.issues++;
      if (i.status === "done") s.done++;
    }
    statsByKey.value = map;
  } catch { /* best-effort */ }
}

function issueCount(r: Release): number {
  const s = statsByKey.value.get(r.key);
  return s?.issues ?? (r.issue_keys?.length || 0);
}

function doneCount(r: Release): number {
  return statsByKey.value.get(r.key)?.done ?? 0;
}

function progressPct(r: Release): number {
  if (r.status === "released") return 100;
  const total = issueCount(r);
  if (!total) return 0;
  return Math.round((doneCount(r) / total) * 100);
}

function progressColor(r: Release): string {
  const pct = progressPct(r);
  if (pct >= 100) return "#67c23a";
  if (pct >= 50) return "#409eff";
  return "#e6a23c";
}

function projectName(key: string): string {
  return projects.value.find(p => p.key === key)?.name || key;
}

function timeHint(r: Release): string {
  if (r.status === "released") return r.release_date ? `Released ${formatDate(r.release_date)}` : "Released";
  if (r.status === "in_progress") {
    if (!r.target_date) return "In progress";
    const ms = new Date(r.target_date).getTime() - Date.now();
    if (ms < 0) return "Overdue";
    return `${Math.ceil(ms / 86400000)}d to target`;
  }
  return r.target_date ? `Target ${formatDate(r.target_date)}` : "Planned";
}

function timeHintClass(r: Release): string {
  if (r.status === "released") return "release-card__time--released";
  if (r.status === "planned") return "release-card__time--planned";
  if (!r.target_date) return "release-card__time--progress";
  const ms = new Date(r.target_date).getTime() - Date.now();
  if (ms < 0) return "release-card__time--overdue";
  if (ms <= 3 * 86400000) return "release-card__time--soon";
  return "release-card__time--progress";
}

const notesHtmlMap = computed(() => {
  const map = new Map<string, string>();
  for (const r of store.releases) {
    if (r.notes) map.set(r.key, renderMarkdown(r.notes));
  }
  return map;
});

function notesHtml(r: Release): string {
  return notesHtmlMap.value.get(r.key) || "";
}

// ── Displayed releases ──
const displayedReleases = computed(() => {
  let list = store.releases;
  const q = searchText.value.trim().toLowerCase();
  if (q) {
    list = list.filter(r => r.version.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || projectName(r.project_key).toLowerCase().includes(q));
  }
  if (statusFilter.value) list = list.filter(r => r.status === statusFilter.value);
  const sorted = [...list];
  if (sortBy.value === "version") {
    sorted.sort((a, b) => a.version.localeCompare(b.version, undefined, { numeric: true }));
  } else if (sortBy.value === "issues") {
    sorted.sort((a, b) => issueCount(b) - issueCount(a));
  } else if (sortBy.value === "progress") {
    sorted.sort((a, b) => progressPct(b) - progressPct(a));
  } else {
    sorted.sort((a, b) => (b.target_date || b.release_date || "").localeCompare(a.target_date || a.release_date || ""));
  }
  return sorted;
});

// ── Counts ──
const plannedCount = computed(() => store.releases.filter(r => r.status === "planned").length);
const inProgressCount = computed(() => store.releases.filter(r => r.status === "in_progress").length);
const releasedCount = computed(() => store.releases.filter(r => r.status === "released").length);
const totalIssues = computed(() => store.releases.reduce((s, r) => s + issueCount(r), 0));
const totalDone = computed(() => store.releases.reduce((s, r) => s + doneCount(r), 0));
const overallCompletion = computed(() => (totalIssues.value ? Math.round((totalDone.value / totalIssues.value) * 100) : 0));
const countLabel = computed(() => {
  const isFiltered = !!searchText.value.trim() || !!statusFilter.value;
  return isFiltered ? `${displayedReleases.value.length} of ${store.total} releases` : `${store.total} releases`;
});

// ── Filter pills ──
const activePills = computed(() => {
  const pills: Array<{ id: string; label: string; clear: () => void }> = [];
  if (searchText.value.trim()) {
    pills.push({ id: "search", label: `Search: ${searchText.value.trim()}`, clear: () => { searchText.value = ""; } });
  }
  if (statusFilter.value) {
    pills.push({ id: "status", label: `Status: ${RELEASE_STATUS_MAP[statusFilter.value as ReleaseStatus] || statusFilter.value}`, clear: () => { statusFilter.value = ""; } });
  }
  if (sortBy.value !== "date") {
    const labels: Record<string, string> = { version: "Version", issues: "Most issues", progress: "Most done" };
    pills.push({ id: "sort", label: `Sort: ${labels[sortBy.value] || sortBy.value}`, clear: () => { sortBy.value = "date"; } });
  }
  if (projectFilter.value && !props.projectKey) {
    pills.push({ id: "project", label: `Project: ${projectName(projectFilter.value)}`, clear: () => { projectFilter.value = ""; loadData(); } });
  }
  return pills;
});

function clearAllFilters() {
  searchText.value = "";
  statusFilter.value = "";
  sortBy.value = "date";
  if (!props.projectKey) projectFilter.value = "";
  loadData();
}

// ── Charts ──
const STATUS_COLOR: Record<ReleaseStatus, string> = {
  planned: "#909399",
  in_progress: "#409eff",
  released: "#67c23a"
};

const statusDonutOption = computed<ECOption>(() => {
  const order: ReleaseStatus[] = ["planned", "in_progress", "released"];
  const data = order
    .map(s => ({ name: s, value: store.releases.filter(r => r.status === s).length, itemStyle: { color: STATUS_COLOR[s] } }))
    .filter(d => d.value > 0);
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 9 }, formatter: (n: string) => RELEASE_STATUS_MAP[n as ReleaseStatus] ?? n },
    series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
  };
});

const progressBarOption = computed<ECOption>(() => {
  const buckets = { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0 };
  for (const r of store.releases) {
    const p = progressPct(r);
    if (p < 25) buckets["0-25%"]++;
    else if (p < 50) buckets["25-50%"]++;
    else if (p < 75) buckets["50-75%"]++;
    else buckets["75-100%"]++;
  }
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: { type: "category", data: Object.keys(buckets), axisLabel: { fontSize: 9 } },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: Object.values(buckets), itemStyle: { color: "#73c0de", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
});

const trendOption = computed<ECOption>(() => {
  const labels: string[] = [];
  const values: number[] = [];
  const today = new Date();
  const createdByDay: Record<string, number> = {};
  for (const r of store.releases) {
    const day = (r.created_at || "").slice(0, 10);
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
  statusFilter.value = statusFilter.value === e.name ? "" : e.name;
}

// ── Sidebar: attention ──
const attention = computed(() => {
  const now = Date.now();
  const overdue = store.releases.filter(r => r.status === "in_progress" && r.target_date && new Date(r.target_date).getTime() < now).length;
  const empty = store.releases.filter(r => !issueCount(r) && r.status !== "released").length;
  const stalled = store.releases.filter(r => r.status === "in_progress" && issueCount(r) > 0 && progressPct(r) === 0).length;
  return { overdue, empty, stalled };
});

// ── Sidebar: data quality ──
const completeness = computed(() => {
  const total = store.releases.length;
  const fields = [
    { key: "notes", label: "Notes", filled: store.releases.filter(r => r.notes).length },
    { key: "target", label: "Target Date", filled: store.releases.filter(r => r.target_date).length },
    { key: "issues", label: "Issues", filled: store.releases.filter(r => issueCount(r) > 0).length }
  ];
  return fields.map(f => ({ ...f, pct: total ? Math.round((f.filled / total) * 100) : 0 }));
});

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

// ── Recently viewed ──
function trackRecent(release: Release) {
  recentlyViewed.value = [release, ...recentlyViewed.value.filter(r => r.key !== release.key)].slice(0, 8);
}

// ── Dialog ──
const rules: FormRules = {
  version: [{ required: true, message: "Version is required", trigger: "blur" }],
  name: [{ required: true, message: "Name is required", trigger: "blur" }]
};

const dialog = reactive({
  visible: false, isEdit: false, submitting: false, editKey: "",
  form: {
    version: "", name: "", notes: "", status: "planned" as ReleaseStatus,
    target_date: "", project_key: "", issue_keys: [] as string[]
  }
});

async function loadData() {
  const dateFilter = filterDateStr.value ? { updated_at_start: filterDateStr.value, updated_at_end: filterDateStr.value } : {};
  await store.fetchReleases({ project_key: projectFilter.value || undefined, pageSize: 100, ...dateFilter });
  await loadStats();
}

function openCreate() {
  dialog.isEdit = false; dialog.editKey = "";
  dialog.form = { version: "", name: "", notes: "", status: "planned" as ReleaseStatus, target_date: "", project_key: projectFilter.value || "", issue_keys: [] };
  dialog.visible = true;
}

function openEdit(r: Release) {
  dialog.isEdit = true; dialog.editKey = r.key;
  dialog.form = { version: r.version, name: r.name, notes: r.notes || "", status: r.status, target_date: r.target_date || "", project_key: r.project_key, issue_keys: r.issue_keys || [] };
  dialog.visible = true;
}

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;
  dialog.submitting = true;
  try {
    const data = {
      version: dialog.form.version, name: dialog.form.name,
      notes: dialog.form.notes, status: dialog.form.status,
      target_date: dialog.form.target_date,
      project_key: dialog.form.project_key || projectFilter.value || "",
      issue_keys: dialog.form.issue_keys
    };
    if (dialog.isEdit) {
      await store.editRelease(dialog.editKey, data);
      ElMessage.success("Release updated");
    } else {
      const key = `REL-${Date.now().toString(36).toUpperCase()}`;
      await store.addRelease({ key, ...data });
      ElMessage.success("Release created");
    }
    dialog.visible = false;
  } finally { dialog.submitting = false; }
}

async function handleDelete(r: Release) {
  try {
    await ElMessageBox.confirm(`Delete release "${r.version}"?`, "Delete", { type: "error" });
    await store.removeRelease(r.key, projectFilter.value || undefined);
    ElMessage.success("Release deleted");
    await loadStats();
  } catch { /* cancelled */ }
}

async function copyVersion(r: Release) {
  try {
    await navigator.clipboard.writeText(r.version);
    ElMessage.success(`Copied ${r.version}`);
  } catch {
    ElMessage.warning("Clipboard unavailable");
  }
}

function statusLabel(s: ReleaseStatus) { return RELEASE_STATUS_MAP[s] || s; }
function statusColor(s: ReleaseStatus) { return STATUS_COLOR[s] || "#909399"; }
function statusTagType(s: ReleaseStatus): "success" | "warning" | "info" | "primary" | "danger" {
  const m: Record<ReleaseStatus, "success" | "warning" | "info" | "primary" | "danger"> = { planned: "info", in_progress: "primary", released: "success" };
  return m[s] || "info";
}
function goDetail(key: string) {
  const release = store.releases.find(r => r.key === key);
  if (release) trackRecent(release);
  router.push(`/release/${key}`);
}
function goProject(key: string) { if (key) router.push(`/project/${key}`); }

onMounted(async () => {
  const jobs: Promise<unknown>[] = [
    store.fetchReleases({ project_key: projectFilter.value || undefined, pageSize: 100 })
  ];
  if (!props.projectKey) {
    jobs.push(
      projectStore.fetchProjects({ pageSize: 100 }).then(() => {
        projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
      })
    );
  }
  await Promise.all(jobs);
  await loadStats();
});

watch(filterDateStr, () => {
  loadData();
});
</script>

<style scoped lang="scss">
.release-list {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Header Card ──
.release-list__header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.release-list__header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, #91cc75, #7ab85e);
  flex-shrink: 0;
}
.release-list__header-text {
  min-width: 0;
  flex: 1;
}
.release-list__header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.3;
}
.release-list__header-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.release-list__header-pills {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.release-list__header-pill {
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
.release-list__header-pill-val {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.release-list__header-pill--accent .release-list__header-pill-val {
  color: var(--el-color-primary);
}
.release-list__header-pill-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
}
.release-list__header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  :deep(.ho__hero-date-nav) {
    margin: 0;
  }
}

// ── Charts ──
.release-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.release-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.release-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}
.release-chart__title {
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
.release-chart__badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  text-transform: none;
}
.release-chart__body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}

// ── Recently Viewed ──
.release-list__recent {
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
.release-list__recent-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-right: 2px;
}
.release-list__recent-chip {
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
.release-list__recent-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.release-list__recent-key {
  font-family: monospace;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.release-list__recent-name {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.release-list__recent-clear {
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
.release-list__pills {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.release-list__pills-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}

// ── Body / Main / Sidebar ──
.release-list__body {
  display: flex;
  gap: 24px;
}
.release-list__main {
  flex: 1;
  min-width: 0;
}
.release-list__sidebar {
  width: 240px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
}
.release-list__props {
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  padding: 16px;
}
.release-list__prop {
  padding: 8px 0;
  font-size: 13px;
  & + & { border-top: 1px solid var(--el-border-color-lighter); }
}
.release-list__prop-label {
  display: block;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  margin-bottom: 4px;
}
.release-list__prop-hint {
  float: right;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.release-list__stat {
  display: flex;
  align-items: center;
  gap: 10px;
}
.release-list__stat-icon {
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
.release-list__stat-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.release-list__stat-value {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
  font-family: DIN, sans-serif;
}
.release-list__stat-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.release-list__attention-item {
  display: flex;
  align-items: center;
  gap: 6px;
  .el-icon { font-size: 14px; }
  &--overdue {
    .el-icon, .release-list__attention-count { color: var(--el-color-danger); }
  }
  &--empty {
    .el-icon, .release-list__attention-count { color: var(--el-color-warning); }
  }
  &--stalled {
    .el-icon, .release-list__attention-count { color: var(--el-color-primary); }
  }
}
.release-list__attention-count {
  font-size: 16px;
  font-weight: 700;
  font-family: DIN, sans-serif;
  min-width: 20px;
}
.release-list__attention-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.release-list__quality-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.release-list__quality-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.release-list__quality-pct {
  font-size: 12px;
  font-weight: 600;
  font-family: DIN, sans-serif;
}

// ── Head (search/filter/sort) ──
.release-list__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.release-list__head-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.release-list__head-count {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.release-list__head-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.release-list__search { width: 200px; }
.release-list__status { width: 130px; }
.release-list__sort { width: 140px; }
.release-list__project { width: 190px; }

// ── Card Grid ──
.release-list__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.release-card {
  cursor: pointer;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  :deep(.el-card__body) { padding: 0; }
  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--el-box-shadow-light);
  }
}
.release-card--muted {
  opacity: 0.82;
}
.release-card__status-bar {
  height: 3px;
}
.release-card__body {
  padding: 16px;
}
.release-card__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.release-card__version {
  font-size: 15px;
  font-weight: 700;
  font-family: monospace;
  cursor: pointer;
  transition: color 0.15s;
  &:hover { color: var(--el-color-primary); }
}
.release-card__name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.release-card__project {
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
.release-card__notes {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 10px;
  line-height: 1.55;
  word-break: break-word;
  :deep(p) { margin: 0 0 6px; }
  :deep(p:last-child) { margin-bottom: 0; }
  :deep(strong) { color: var(--el-text-color-primary); font-weight: 600; }
  :deep(code) {
    font-family: monospace;
    font-size: 12px;
    color: var(--el-color-danger);
    background: var(--el-fill-color-light);
    padding: 1px 5px;
    border-radius: 3px;
  }
  :deep(ul), :deep(ol) { margin: 0 0 6px; padding-left: 18px; }
  :deep(li) { margin: 2px 0; }
}
.release-card__meta {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.release-card__time {
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 1px 8px;
  &--released { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &--planned { color: var(--el-color-info); background: var(--el-color-info-light-9); }
  &--progress { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  &--soon { color: #fff; background: var(--el-color-warning); }
  &--overdue { color: #fff; background: var(--el-color-danger); }
}
.release-card__progress {
  margin-bottom: 12px;
}
.release-card__progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.release-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.release-card__issues {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.release-card__footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.release-card__updated {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.release-card__actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.release-list__empty {
  grid-column: 1 / -1;
  padding: 60px 0;
}
</style>