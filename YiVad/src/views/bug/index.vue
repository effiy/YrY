<template>
  <div class="bug-page">
    <!-- Header -->
    <div class="bug-header">
      <div class="bug-header__left">
        <h2 class="bug-header__title">Bugs</h2>
        <span class="bug-header__count">{{ allBugs.length }}</span>
      </div>
      <div class="bug-header__right">
        <div class="bug-header__date-nav">
          <el-button size="small" :icon="ArrowLeft" @click="goToPrevDay" />
          <el-popover placement="bottom" :width="180" trigger="click">
            <template #reference>
              <span class="bug-header__date-label" :class="{ 'bug-header__date-label--muted': !filterDateStr }">
                {{ filterDateStr ? filterDateLabel : "All dates" }}
              </span>
            </template>
            <el-date-picker
              v-model="filterDate"
              type="date"
              placeholder="Pick a day"
              size="small"
              style="width: 100%"
              @change="filterDateStr"
            />
            <div style="margin-top:8px;display:flex;gap:6px;justify-content:flex-end">
              <el-button size="small" link @click="goToFilterToday">Today</el-button>
              <el-button v-if="filterDateStr" size="small" link type="danger" @click="clearFilterDate">Clear</el-button>
            </div>
          </el-popover>
          <el-button size="small" :icon="ArrowRight" @click="goToNextDay" />
        </div>
        <el-button size="small" :icon="Refresh" @click="refresh" :loading="loading" />
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="bug-stats">
      <div
        v-for="stat in quickStats"
        :key="stat.key"
        class="bug-stat"
        :class="`bug-stat--${stat.level}`"
        @click="applyStatFilter(stat)"
      >
        <span class="bug-stat__icon">
          <el-icon v-if="stat.key === 'critical'"><WarningFilled /></el-icon>
          <el-icon v-else-if="stat.key === 'open'"><CircleCloseFilled /></el-icon>
          <el-icon v-else-if="stat.key === 'in_progress'"><Loading /></el-icon>
          <el-icon v-else-if="stat.key === 'resolved'"><CircleCheckFilled /></el-icon>
          <el-icon v-else><TrendCharts /></el-icon>
        </span>
        <div class="bug-stat__body">
          <span class="bug-stat__value">{{ stat.value }}</span>
          <span class="bug-stat__label">{{ stat.label }}</span>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="bug-action-bar">
      <div class="bug-filters">
        <el-input
          v-model="searchText"
          placeholder="Search..."
          :prefix-icon="Search"
          clearable
          size="small"
          class="bug-filters__search"
        />
        <el-select v-model="filterStatus" placeholder="Status" multiple collapse-tags clearable size="small" class="bug-filters__select">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="filterSeverity" placeholder="Severity" multiple collapse-tags clearable size="small" class="bug-filters__select">
          <el-option v-for="s in severityOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="filterAssignee" placeholder="Assignee" clearable filterable size="small" class="bug-filters__select">
          <el-option v-for="a in assigneeOptions" :key="a" :label="a" :value="a" />
        </el-select>
        <template v-if="!projectKey">
          <el-select v-model="filterProject" placeholder="Project" clearable size="small" class="bug-filters__select">
            <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
          </el-select>
        </template>
      </div>
      <div class="bug-toolbar-actions">
        <el-button type="primary" size="small" :icon="Plus" @click="store.openCreateDialog(projectKey ? projectName(projectKey) : '', projectKey)">New Bug</el-button>
        <el-dropdown v-if="selection.length" trigger="click" @command="handleBatchCommand">
          <el-button size="small" plain>Batch ({{ selection.length }})</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="status">Change Status</el-dropdown-item>
              <el-dropdown-item command="assign">Assign</el-dropdown-item>
              <el-dropdown-item command="delete" divided>Delete</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button size="small" :icon="Download" plain @click="exportCSV" />
      </div>
    </div>

    <!-- Active Filter Chips -->
    <div v-if="activeFilterChips.length" class="bug-filter-chips">
      <TransitionGroup name="chip">
        <el-tag v-for="chip in activeFilterChips" :key="chip.key" closable size="small" effect="plain" type="info" @close="removeFilterChip(chip)">{{ chip.label }}</el-tag>
      </TransitionGroup>
      <el-button link size="small" type="primary" @click="clearAllFilters">Clear All</el-button>
    </div>

    <!-- Table View -->
    <div class="bug-table-wrap">
      <ProTable ref="proTable" title="" :columns="columns" :request-api="fetchBugs" :pagination="true" row-key="key" @selection-change="onSelectionChange">
        <template #key="scope">
          <code class="bug-key">{{ scope.row.key }}</code>
        </template>
        <template #title="scope">
          <el-button link type="primary" @click="openTitlePreview(scope.row)">{{ scope.row.title }}</el-button>
        </template>
        <template #severity="scope">
          <el-tag :type="severityTagType(scope.row.severity)" size="small" effect="dark">{{ scope.row.severity }}</el-tag>
        </template>
        <template #priority="scope">
          <el-tag :type="priorityTagType(scope.row.priority)" size="small">{{ scope.row.priority }}</el-tag>
        </template>
        <template #status="scope">
          <el-tag :type="statusTagType(scope.row.status)" size="small" effect="dark">{{ scope.row.status }}</el-tag>
        </template>
        <template #type="scope">
          <el-tag size="small" effect="plain" :type="typeTagColor(scope.row.type)">{{ scope.row.type }}</el-tag>
        </template>
        <template #module="scope">
          <span v-if="scope.row.module" class="bug-module">{{ scope.row.module }}</span>
          <span v-else class="bug-na">—</span>
        </template>
        <template #project="scope">
          <el-button v-if="scope.row.project_key" link type="primary" size="small" @click="goProject(scope.row.project_key)">
            {{ projectName(scope.row.project_key) || scope.row.project || scope.row.project_key }}
          </el-button>
          <span v-else>{{ scope.row.project || '—' }}</span>
        </template>
        <template #assignee="scope">
          <span v-if="scope.row.assignee" class="bug-assignee">{{ scope.row.assignee }}</span>
          <span v-else class="bug-na">—</span>
        </template>
        <template #reporter="scope">
          <span v-if="scope.row.reporter" class="bug-reporter">{{ scope.row.reporter }}</span>
          <span v-else class="bug-na">—</span>
        </template>
        <template #createdAt="scope">
          {{ formatAbsolute(scope.row.createdAt) }}
        </template>
        <template #updatedAt="scope">
          {{ formatAbsolute(scope.row.updatedAt) }}
        </template>
        <template #operation="scope">
          <div class="bug-actions">
            <el-tooltip content="Change Status" placement="top" :show-after="500">
              <el-dropdown trigger="click" @command="(cmd: string) => quickChangeStatus(scope.row, cmd)">
                <el-button size="small" :icon="CircleCheck" class="bug-action-btn" />
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-for="s in quickStatuses(scope.row.status)" :key="s.value" :command="s.value">{{ s.label }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </el-tooltip>
            <el-tooltip content="View Detail" placement="top" :show-after="500">
              <el-button size="small" :icon="View" class="bug-action-btn" @click="goDetail(scope.row.key)" />
            </el-tooltip>
            <el-tooltip content="Edit" placement="top" :show-after="500">
              <el-button size="small" :icon="Edit" class="bug-action-btn" @click="openEdit(scope.row)" />
            </el-tooltip>
            <el-popconfirm
              :title="`Delete bug 「${scope.row.title}」?`"
              confirm-button-text="Delete"
              cancel-button-text="Cancel"
              confirm-button-type="danger"
              @confirm="handleDeleteRow(scope.row)"
            >
              <template #reference>
                <el-button size="small" type="danger" :icon="Delete" class="bug-action-btn" :loading="deletingKeys.has(scope.row.key)" />
              </template>
            </el-popconfirm>
          </div>
        </template>
      </ProTable>
    </div>

    <!-- Analytics -->
    <div class="bug-analytics">
      <div class="bug-analytics__toggle" @click="analyticsOpen = !analyticsOpen">
        <el-icon><component :is="analyticsOpen ? ArrowUp : ArrowDown" /></el-icon>
        <span>Analytics</span>
        <span class="bug-analytics__summary">{{ allBugs.length }} bugs · 5 charts</span>
      </div>
      <div v-show="analyticsOpen" class="bug-analytics__body">
          <div class="bug-charts">
          <div class="bug-chart">
            <div class="bug-chart__title">Inflow vs Outflow</div>
            <div class="bug-chart__body">
              <BugInflowOutflowChart v-if="allBugs.length" :data="inflowOutflow" />
            </div>
          </div>
          <div class="bug-chart">
            <div class="bug-chart__title">MTTR Trend (daily)</div>
            <div class="bug-chart__body">
              <MttrTrendChart v-if="allBugs.length" :data="mttrTrend" :target-hours="24" />
            </div>
          </div>
          <div class="bug-chart">
            <div class="bug-chart__title">Severity Distribution</div>
            <div class="bug-chart__body">
              <SeverityDonut v-if="allBugs.length" :data="severityDistribution" />
            </div>
          </div>
          <div class="bug-chart">
            <div class="bug-chart__title">Bug Age (Open)</div>
            <div class="bug-chart__body">
              <BugAgeChart v-if="allBugs.length" :data="bugAgeDistribution" />
            </div>
          </div>
          <div class="bug-chart">
            <div class="bug-chart__title">Status Breakdown</div>
            <div class="bug-chart__body">
              <StatusBreakdown v-if="allBugs.length" :data="statusBreakdown" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dialogs -->
    <KnowledgePreviewDialog ref="titlePreviewRef" />
    <BugFormDialog ref="dialogRef" @saved="proTable?.getTableList(); loadAllBugs()" />
  </div>
</template>

<script setup lang="ts" name="bugList">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Plus, Delete, View, Edit, Refresh,
  ArrowDown, ArrowUp, ArrowLeft, ArrowRight,
  Download, Search, CircleCheck,
  WarningFilled, CircleCloseFilled, Loading,
  CircleCheckFilled, TrendCharts
} from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";

import { useBugStore } from "@/stores/modules/bug";
import { useProjectStore } from "@/stores/modules/project";
import { getBugList, readBugContent, updateBug } from "@/api/modules/bug";
import type { BugDocument } from "@/api/modules/bug";
import type { SeverityDistribution, BugStatusBreakdown, BugAgeDistribution, InflowOutflowData, TrendDataPoint } from "@/types/analytics";
import { ProTable } from "@/components";
import type { ColumnProps, ProTableInstance } from "@/components";
import KnowledgePreviewDialog from "@/components/KnowledgePreviewDialog/KnowledgePreviewDialog.vue";
import BugInflowOutflowChart from "@/components/analytics/BugInflowOutflowChart.vue";
import MttrTrendChart from "@/components/analytics/MttrTrendChart.vue";
import SeverityDonut from "@/components/analytics/SeverityDonut.vue";
import BugAgeChart from "@/components/analytics/BugAgeChart.vue";
import StatusBreakdown from "@/components/analytics/StatusBreakdown.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import BugFormDialog from "./components/BugFormDialog.vue";
import { severityTagType, priorityTagType, statusTagType } from "@/hooks/useTagHelpers";
import { formatAbsolute } from "@/utils/datetime";
import { readKnowledgeFile } from "@/api/modules/knowledgeService";

const router = useRouter();
const route = useRoute();
const props = defineProps<{ projectKey?: string; filterDate?: Date | null }>();
const store = useBugStore();
const projectStore = useProjectStore();
const proTable = ref<ProTableInstance>();
const dialogRef = ref<InstanceType<typeof BugFormDialog> | null>(null);
const allBugs = ref<BugDocument[]>([]);
const loading = ref(false);
const deletingKeys = ref(new Set<string>());
const analyticsOpen = ref(false);
const selection = ref<any[]>([]);

// ── Date filter ──
const _filterDate = ref<Date | null>(null);
const filterDate = computed({
  get: () => (props.filterDate !== undefined ? props.filterDate : _filterDate.value),
  set: v => { _filterDate.value = v; }
});
const {
  label: filterDateLabel,
  isToday: isFilterToday,
  filterDateStr,
  goToPrevDay,
  goToNextDay,
  goToFilterToday,
  clearFilterDate
} = useDateFilter(filterDate);

// ── Filter state ──
const searchText = ref("");
let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchText, (val) => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    proTable.value?.getTableList();
  }, 300);
});
const filterStatus = ref<string[]>([]);
const filterSeverity = ref<string[]>([]);
const filterAssignee = ref("");
const filterProject = ref(props.projectKey || "");

const statusOptions = [
  { label: "Open", value: "open" }, { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" }, { label: "Closed", value: "closed" },
  { label: "Rejected", value: "rejected" }, { label: "Reopened", value: "reopened" }
];
const severityOptions = [
  { label: "Critical", value: "critical" }, { label: "Major", value: "major" },
  { label: "Minor", value: "minor" }, { label: "Trivial", value: "trivial" }
];

// ── Filter chips ──
const activeFilterChips = computed(() => {
  const chips: Array<{ key: string; label: string }> = [];
  for (const s of filterStatus.value) {
    const opt = statusOptions.find(o => o.value === s);
    chips.push({ key: `status:${s}`, label: `Status: ${opt?.label || s}` });
  }
  for (const s of filterSeverity.value) {
    const opt = severityOptions.find(o => o.value === s);
    chips.push({ key: `severity:${s}`, label: `Severity: ${opt?.label || s}` });
  }
  if (filterAssignee.value) chips.push({ key: `assignee:${filterAssignee.value}`, label: `Assignee: ${filterAssignee.value}` });
  if (filterProject.value && !props.projectKey) chips.push({ key: `project:${filterProject.value}`, label: `Project: ${projectName(filterProject.value) || filterProject.value}` });
  return chips;
});

function removeFilterChip(chip: { key: string; label: string }) {
  const [dim, val] = chip.key.split(":");
  if (dim === "status") filterStatus.value = filterStatus.value.filter(v => v !== val);
  else if (dim === "severity") filterSeverity.value = filterSeverity.value.filter(v => v !== val);
  else if (dim === "assignee") filterAssignee.value = "";
  else if (dim === "project") filterProject.value = "";
  proTable.value?.getTableList();
}

function clearAllFilters() {
  searchText.value = "";
  filterStatus.value = [];
  filterSeverity.value = [];
  filterAssignee.value = "";
  if (!props.projectKey) filterProject.value = "";
  proTable.value?.getTableList();
}

// ── Status helpers ──
const DONE_STATUSES = new Set(["resolved", "closed"]);
const OPEN_STATUSES = new Set(["open", "in_progress", "reopened"]);

// ── Quick stats ──
const quickStats = computed(() => {
  const bugs = allBugs.value;
  const open = bugs.filter(b => OPEN_STATUSES.has(b.status));
  const resolved = bugs.filter(b => DONE_STATUSES.has(b.status));
  const pct = bugs.length ? Math.round((resolved.length / bugs.length) * 100) : 0;
  return [
    { key: "critical", label: "Critical", value: open.filter(b => b.severity === "critical").length, level: "danger", filter: { severity: "critical" } },
    { key: "open", label: "Open", value: open.length, level: "warning", filter: { status: "open" } },
    { key: "in_progress", label: "In Progress", value: bugs.filter(b => b.status === "in_progress").length, level: "primary", filter: { status: "in_progress" } },
    { key: "resolved", label: "Resolved", value: resolved.length, level: "success", filter: { status: "resolved" } },
    { key: "rate", label: "Resolve Rate", value: pct + "%", level: pct >= 80 ? "success" : "warning", filter: {} }
  ];
});

function applyStatFilter(stat: { key: string; filter: Record<string, any> }) {
  if (stat.filter.status) {
    if (stat.filter.status === "open") filterStatus.value = ["open", "reopened"];
    else if (stat.filter.status === "resolved") filterStatus.value = ["resolved", "closed"];
    else filterStatus.value = [stat.filter.status];
  }
  if (stat.filter.severity) filterSeverity.value = [stat.filter.severity];
  proTable.value?.getTableList();
}

const assigneeOptions = computed(() => {
  const names = new Set<string>();
  for (const b of allBugs.value) { if (b.assignee) names.add(b.assignee); if (b.reporter) names.add(b.reporter); }
  return [...names].sort();
});

// ── Chart data ──
const CHART_DAYS = 30;

const severityDistribution = computed((): SeverityDistribution => {
  const dist: SeverityDistribution = { critical: 0, major: 0, minor: 0, trivial: 0 };
  for (const b of allBugs.value) { const s = (b.severity || "trivial") as keyof SeverityDistribution; if (s in dist) dist[s]++; }
  return dist;
});

const statusBreakdown = computed((): BugStatusBreakdown => {
  const dist: BugStatusBreakdown = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
  for (const b of allBugs.value) {
    const s = (b.status || "open") as keyof BugStatusBreakdown;
    if (s in dist) dist[s]++; else (dist as Record<string, number>)[s] = 1;
  }
  return dist;
});

const bugAgeDistribution = computed((): BugAgeDistribution => {
  const now = Date.now();
  const buckets: BugAgeDistribution = { lt_1d: 0, "1_3d": 0, "3_7d": 0, "7_30d": 0, gt_30d: 0 };
  for (const b of allBugs.value) {
    if (DONE_STATUSES.has(b.status)) continue;
    const h = (now - (b.createdAt || now)) / 3600000;
    if (h < 24) buckets.lt_1d++; else if (h < 72) buckets["1_3d"]++; else if (h < 168) buckets["3_7d"]++; else if (h < 720) buckets["7_30d"]++; else buckets.gt_30d++;
  }
  return buckets;
});

function chartDates(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dates.push(d.toISOString().slice(0, 10)); }
  return dates;
}

const inflowOutflow = computed((): InflowOutflowData => {
  const dates = chartDates(CHART_DAYS);
  const inflow: Record<string, number> = {}; const outflow: Record<string, number> = {};
  for (const d of dates) { inflow[d] = 0; outflow[d] = 0; }
  for (const b of allBugs.value) {
    if (b.createdAt == null) continue;
    const cd = new Date(b.createdAt).toISOString().slice(0, 10);
    if (cd in inflow) inflow[cd]++;
    if (b.resolvedAt) { const rd = new Date(b.resolvedAt).toISOString().slice(0, 10); if (rd in outflow) outflow[rd]++; }
  }
  return { inflow: dates.map(d => ({ date: d, value: inflow[d] })), outflow: dates.map(d => ({ date: d, value: outflow[d] })) };
});

const mttrTrend = computed((): TrendDataPoint[] => {
  const dates = chartDates(CHART_DAYS);
  const buckets: Record<string, number[]> = {};
  for (const d of dates) buckets[d] = [];
  for (const b of allBugs.value) {
    if (!b.resolvedAt || !b.createdAt) continue;
    const rd = new Date(b.resolvedAt).toISOString().slice(0, 10);
    if (rd in buckets) buckets[rd].push((b.resolvedAt - b.createdAt) / 3600000);
  }
  return dates.map(d => { const vals = buckets[d]; return { date: d, value: vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0 }; });
});

// ── Table columns ──
const columns = computed<ColumnProps<BugDocument>[]>(() => {
  const cols: ColumnProps<BugDocument>[] = [
    { type: "selection", width: 44 },
    { prop: "key", label: "Key", width: 100 },
    { prop: "title", label: "Title", minWidth: 260 },
    { prop: "status", label: "Status", width: 110 },
    { prop: "severity", label: "Severity", width: 85 },
    { prop: "priority", label: "Priority", width: 75 },
    { prop: "type", label: "Type", width: 110 },
    { prop: "module", label: "Module", width: 120 },
    { prop: "assignee", label: "Assignee", width: 90 },
    { prop: "reporter", label: "Reporter", width: 90 },
    { prop: "createdAt", label: "Created", width: 115 },
    { prop: "updatedAt", label: "Updated", width: 115 },
    { prop: "operation", label: "Actions", width: 170, fixed: "right" }
  ];
  if (!props.projectKey) cols.splice(8, 0, { prop: "project", label: "Project", width: 120 });
  return cols;
});

// ── Fetch ──
function buildDateFilter(filterDateStr: string): Record<string, any> {
  if (!filterDateStr) return {};
  return { createdAtStart: new Date(filterDateStr + "T00:00:00").getTime(), createdAtEnd: new Date(filterDateStr + "T23:59:59").getTime() };
}

async function fetchBugs(params: any) {
  const { pageNum, pageSize } = params;
  const merged: any = { pageNum, pageSize };
  if (searchText.value) merged.title = searchText.value;
  if (filterStatus.value.length) merged.status = filterStatus.value.join(",");
  if (filterSeverity.value.length) merged.severity = filterSeverity.value.join(",");
  if (filterAssignee.value) merged.assignee = filterAssignee.value;
  if (filterProject.value && !props.projectKey) merged.project_key = filterProject.value;
  if (props.projectKey) merged.project_key = props.projectKey;
  const df = buildDateFilter(filterDateStr.value);
  if (df.createdAtStart) merged.createdAtStart = df.createdAtStart;
  if (df.createdAtEnd) merged.createdAtEnd = df.createdAtEnd;
  loadAllBugs();
  return await getBugList(merged);
}

async function loadAllBugs() {
  try {
    const params: any = { pageSize: 1000 };
    if (props.projectKey) params.project_key = props.projectKey;
    if (filterDateStr.value) {
      params.createdAtStart = new Date(filterDateStr.value + "T00:00:00").getTime();
      params.createdAtEnd = new Date(filterDateStr.value + "T23:59:59").getTime();
    }
    const res = await getBugList(params);
    const bugs = (res.data?.list as BugDocument[]) ?? [];
    allBugs.value = bugs.filter(b => b.contentPath);
  } catch { /* best-effort */ }
}

async function refresh() {
  loading.value = true;
  try { await loadAllBugs(); proTable.value?.getTableList(); }
  finally { loading.value = false; }
}

// ── Projects ──
const projects = computed(() => projectStore.projects);
function projectName(key: string): string { return projects.value.find(p => p.key === key)?.name ?? ""; }
function goProject(key: string) { router.push(`/project/${key}`); }

// ── Selection ──
function onSelectionChange(rows: any[]) { selection.value = rows; }

// ── Batch operations ──
async function handleBatchCommand(cmd: string) {
  const ids = selection.value.map((s: any) => s.key);
  if (!ids.length) return;
  if (cmd === "delete") {
    try {
      await ElMessageBox.confirm(`Delete ${ids.length} selected bug(s)? This action cannot be undone.`, "Batch Delete", {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        confirmButtonType: "danger",
        type: "warning"
      });
    } catch { return; }
    let failed = 0;
    for (const id of ids) {
      const bug = allBugs.value.find(b => b.key === id);
      if (!bug) continue;
      try { await store.handleDelete(bug, true); } catch { failed++; }
    }
    ElMessage.success(failed ? `Deleted ${ids.length - failed} bug(s), ${failed} failed` : `Deleted ${ids.length} bug(s)`);
  } else if (cmd === "assign") {
    try {
      const { value } = await ElMessageBox.prompt("Enter assignee name", "Batch Assign", { confirmButtonText: "Assign", inputPlaceholder: "Assignee name" });
      if (!value?.trim()) return;
      for (const id of ids) { try { await updateBug(id, { assignee: value.trim(), updatedAt: Date.now() } as any); } catch { /* continue */ } }
      ElMessage.success(`Assigned ${ids.length} bug(s) to ${value.trim()}`);
    } catch { /* cancelled */ return; }
  } else if (cmd === "status") {
    try {
      const { value } = await ElMessageBox.prompt("Enter target status (open, in_progress, resolved, closed, rejected, reopened)", "Batch Status Change", { confirmButtonText: "Change", inputPlaceholder: "e.g. resolved" });
      const s = value?.trim().toLowerCase(); if (!s) return;
      for (const id of ids) { try { await updateBug(id, { status: s, updatedAt: Date.now() } as any); } catch { /* continue */ } }
      ElMessage.success(`Changed ${ids.length} bug(s) to ${s}`);
    } catch { /* cancelled */ return; }
  }
  proTable.value?.getTableList(); loadAllBugs();
}

// ── Status transitions ──
const STATUS_TRANSITIONS: Record<string, Array<{ value: string; label: string }>> = {
  open: [{ value: "in_progress", label: "Start Progress" }, { value: "resolved", label: "Resolve" }, { value: "closed", label: "Close" }, { value: "rejected", label: "Reject" }],
  in_progress: [{ value: "resolved", label: "Resolve" }, { value: "closed", label: "Close" }, { value: "rejected", label: "Reject" }, { value: "reopened", label: "Reopen" }],
  resolved: [{ value: "closed", label: "Close" }, { value: "reopened", label: "Reopen" }],
  closed: [{ value: "reopened", label: "Reopen" }],
  rejected: [{ value: "open", label: "Reopen" }, { value: "in_progress", label: "Start Progress" }],
  reopened: [{ value: "in_progress", label: "Start Progress" }, { value: "resolved", label: "Resolve" }, { value: "closed", label: "Close" }]
};
function quickStatuses(current: string) { return STATUS_TRANSITIONS[current] || []; }

async function quickChangeStatus(bug: BugDocument, newStatus: string) {
  try {
    await updateBug(bug.key, { status: newStatus, updatedAt: Date.now() } as any);
    ElMessage.success(`Bug ${bug.key} → ${newStatus}`);
    proTable.value?.getTableList(); loadAllBugs();
  } catch (e: any) { ElMessage.error(e?.message || "Status change failed"); }
}

async function handleDeleteRow(bug: BugDocument) {
  deletingKeys.value.add(bug.key);
  try {
    await store.handleDelete(bug, true);
    proTable.value?.getTableList(); loadAllBugs();
  } finally {
    deletingKeys.value.delete(bug.key);
  }
}


// ── Navigation ──
function goDetail(key: string) { router.push(`/bug/${key}`); }
function openEdit(bug: BugDocument) { dialogRef.value?.openEdit(bug); }

// ── Title preview ──
const titlePreviewRef = ref<{
  openFile: (opts: { path: string; title?: string; content: string; onSave: (content: string) => Promise<void> }) => void;
} | null>(null);
async function openTitlePreview(bug: BugDocument) {
  let content = "";
  if (bug.contentPath) {
    try { const res = await readKnowledgeFile(bug.contentPath); content = res.content || ""; }
    catch { try { const c = await readBugContent(bug); content = c.description || ""; } catch { /* use empty */ } }
  }
  titlePreviewRef.value?.openFile({ path: bug.contentPath || "", title: bug.title, content, onSave: async () => {} });
}

// ── Helpers ──
function typeTagColor(t: string): "danger" | "warning" | "primary" | "info" {
  const map: Record<string, "danger" | "warning" | "primary" | "info"> = {
    functional: "danger", logic: "danger", performance: "warning", ui: "primary",
    style: "primary", security: "danger", compatibility: "warning", regression: "info", data: "info", other: "info"
  };
  return map[t] || "info";
}

function exportCSV() {
  const bugs = allBugs.value;
  if (!bugs.length) { ElMessage.info("No bugs to export"); return; }
  const headers = ["Key", "Title", "Type", "Severity", "Priority", "Status", "Assignee", "Reporter", "Module", "Project", "Updated"];
  const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = bugs.map(b => [b.key, b.title, b.type, b.severity, b.priority, b.status, b.assignee || "", b.reporter || "", b.module || "", b.project || "", formatAbsolute(b.updatedAt)].map(escape).join(","));
  const csv = ["\uFEFF" + headers.map(escape).join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `bugs-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  URL.revokeObjectURL(url);
  ElMessage.success(`Exported ${rows.length} bugs`);
}

// ── Init ──
onMounted(async () => {
  const q = route.query;
  if (typeof q.status === "string" && q.status) filterStatus.value = q.status.split(",");
  if (typeof q.severity === "string" && q.severity) filterSeverity.value = [q.severity];
  projectStore.fetchProjects({ pageSize: 100 });
  await loadAllBugs();
});

watch(filterDateStr, () => { loadAllBugs(); proTable.value?.getTableList(); });
watch(() => props.projectKey, () => { filterProject.value = props.projectKey || ""; loadAllBugs(); proTable.value?.getTableList(); });
</script>

<style scoped lang="scss">
@use "./styles/bug.scss";
</style>