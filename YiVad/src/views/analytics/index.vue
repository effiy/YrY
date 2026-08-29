<template>
  <div class="analytics">
    <!-- Header Card -->
    <div class="analytics__header">
      <div class="analytics__header-icon">
        <el-icon><TrendCharts /></el-icon>
      </div>
      <div class="analytics__header-text">
        <h2 class="analytics__header-title">Analytics</h2>
        <p class="analytics__header-desc">Project metrics, velocity, and team performance insights</p>
      </div>
      <div class="analytics__header-pills">
        <div class="analytics__header-pill">
          <span class="analytics__header-pill-val">{{ stats[0].value }}</span>
          <span class="analytics__header-pill-lbl">Issues</span>
        </div>
        <div class="analytics__header-pill">
          <span class="analytics__header-pill-val">{{ stats[1].value }}</span>
          <span class="analytics__header-pill-lbl">Done</span>
        </div>
        <div class="analytics__header-pill">
          <span class="analytics__header-pill-val">{{ stats[3].value }}</span>
          <span class="analytics__header-pill-lbl">Cycles</span>
        </div>
        <div class="analytics__header-pill analytics__header-pill--accent">
          <span class="analytics__header-pill-val">{{ stats[6].value }}</span>
          <span class="analytics__header-pill-lbl">Bug Rate</span>
        </div>
      </div>
      <div class="analytics__header-right">
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

    <!-- Toolbar -->
    <div class="analytics__head">
      <div class="analytics__head-left">
        <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 200px" @change="loadData">
          <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
        </el-select>
      </div>
      <div class="analytics__head-right">
        <el-button :icon="Refresh" @click="loadData">Refresh</el-button>
        <el-button :icon="Setting" size="small" @click="widgetConfigOpen = !widgetConfigOpen">Widgets</el-button>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          size="small"
          start-placeholder="Start"
          end-placeholder="End"
          style="width: 240px"
          @change="loadData"
        />
      </div>
    </div>

    <!-- Widget Config -->
    <div v-if="widgetConfigOpen" class="analytics__widget-config">
      <el-checkbox v-for="w in widgetDefs" :key="w.key" v-model="w.visible" @change="saveWidgetConfig">
        {{ w.label }}
      </el-checkbox>
    </div>

    <div v-loading="loading" class="analytics__body">
      <!-- Stats Row -->
      <div v-if="widgetDefs[0].visible" class="analytics__stats">
        <div v-for="(stat, i) in stats" :key="stat.label" class="analytics__stat-card" :class="`analytics__stat-card--${statIcons[i].tone}`">
          <div class="analytics__stat-icon">
            <el-icon><component :is="statIcons[i].icon" /></el-icon>
          </div>
          <div class="analytics__stat-value" :style="{ color: statIcons[i].color }">{{ stat.value }}</div>
          <div class="analytics__stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Charts -->
      <div class="analytics__charts">
        <div v-if="widgetDefs[1].visible" class="analytics__chart-card">
          <div class="analytics__chart-head">
            <el-icon><PieChart /></el-icon> Issues by Status
          </div>
          <div ref="statusChartRef" style="width: 100%; height: 300px" />
        </div>
        <div v-if="widgetDefs[2].visible" class="analytics__chart-card">
          <div class="analytics__chart-head">
            <el-icon><Histogram /></el-icon> Issues by Priority
          </div>
          <div ref="priorityChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[3].visible" class="analytics__chart-card">
          <div class="analytics__chart-head">
            <el-icon><PieChart /></el-icon> Issues by Type
          </div>
          <div ref="typeChartRef" style="width: 100%; height: 300px" />
        </div>
        <div v-if="widgetDefs[4].visible" class="analytics__chart-card">
          <div class="analytics__chart-head">
            <el-icon><Histogram /></el-icon> Cycle Progress
          </div>
          <div ref="cycleChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[5].visible" class="analytics__chart-card">
          <div class="analytics__chart-head">
            <el-icon><TrendCharts /></el-icon> Velocity (Completed Cycles)
          </div>
          <div ref="velocityChartRef" style="width: 100%; height: 300px" />
        </div>
        <div v-if="widgetDefs[6].visible" class="analytics__chart-card">
          <div class="analytics__chart-head">
            <el-icon><Timer /></el-icon> Lead Time (Days)
          </div>
          <div ref="leadTimeChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[7].visible" class="analytics__chart-card analytics__chart-card--wide">
          <div class="analytics__chart-head">
            <el-icon><TrendCharts /></el-icon> Cumulative Flow
          </div>
          <div ref="cumulativeChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[8].visible" class="analytics__chart-card analytics__chart-card--wide">
          <div class="analytics__chart-head">
            <el-icon><Histogram /></el-icon> Throughput (Completed per Week)
          </div>
          <div ref="throughputChartRef" style="width: 100%; height: 280px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="analyticsDashboard">
import { onMounted, reactive, ref, nextTick, watch } from "vue";
import { Refresh, Setting, TrendCharts, PieChart, Histogram, Timer, Tickets, CircleCheckFilled, Loading, Clock, WarnTriangleFilled, DataAnalysis } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { useIssueStore } from "@/stores/modules/issue";
import { useCycleStore } from "@/stores/modules/cycle";
import { useProjectStore } from "@/stores/modules/project";
import HeroDateNav from "@/components/HeroDateNav/HeroDateNav.vue";
import { useDateFilter } from "@/hooks/useDateFilter";
import { ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP } from "@/api/modules/issueService";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";

const issueStore = useIssueStore();
const cycleStore = useCycleStore();
const projectStore = useProjectStore();

const loading = ref(false);

// ── Date filter ──
const filterDate = ref<Date | null>(null);
const { label: filterDateLabel, isToday: isFilterToday, filterDateStr, goToPrevDay, goToNextDay, goToFilterToday, clearFilterDate } = useDateFilter(filterDate);
const projectFilter = ref("");
const dateRange = ref<[Date, Date] | null>(null);
const widgetConfigOpen = ref(false);
const projects = ref<{ key: string; name: string }[]>([]);

const widgetDefs = reactive([
  { key: "stats", label: "Stats Cards", visible: true },
  { key: "status", label: "Issues by Status", visible: true },
  { key: "priority", label: "Issues by Priority", visible: true },
  { key: "type", label: "Issues by Type", visible: true },
  { key: "cycle", label: "Cycle Progress", visible: true },
  { key: "velocity", label: "Velocity", visible: true },
  { key: "leadTime", label: "Lead Time", visible: true },
  { key: "cumulative", label: "Cumulative Flow", visible: true },
  { key: "throughput", label: "Throughput", visible: true }
]);

function saveWidgetConfig() {
  localStorage.setItem("analytics_widgets", JSON.stringify(widgetDefs.map(w => ({ key: w.key, visible: w.visible }))));
}

function loadWidgetConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem("analytics_widgets") || "[]");
    saved.forEach((s: any) => {
      const def = widgetDefs.find(w => w.key === s.key);
      if (def) def.visible = s.visible;
    });
  } catch { /* ignore */ }
}

const statusChartRef = ref<HTMLElement | null>(null);
const priorityChartRef = ref<HTMLElement | null>(null);
const typeChartRef = ref<HTMLElement | null>(null);
const cycleChartRef = ref<HTMLElement | null>(null);
const velocityChartRef = ref<HTMLElement | null>(null);
const leadTimeChartRef = ref<HTMLElement | null>(null);
const cumulativeChartRef = ref<HTMLElement | null>(null);
const throughputChartRef = ref<HTMLElement | null>(null);

const stats = reactive([
  { label: "Total Issues", value: 0 },
  { label: "Completed", value: 0 },
  { label: "In Progress", value: 0 },
  { label: "Active Cycles", value: 0 },
  { label: "Avg Lead Time", value: "0d" },
  { label: "Velocity", value: "0 pts" },
  { label: "Bug Rate", value: "0%" },
  { label: "Throughput", value: "0/wk" }
]);

const statIcons = [
  { icon: Tickets, color: "#5470c6", tone: "blue" },
  { icon: CircleCheckFilled, color: "#67c23a", tone: "green" },
  { icon: Loading, color: "#409eff", tone: "blue" },
  { icon: Clock, color: "#e6a23c", tone: "amber" },
  { icon: Timer, color: "#909399", tone: "gray" },
  { icon: TrendCharts, color: "#5470c6", tone: "blue" },
  { icon: WarnTriangleFilled, color: "#f56c6c", tone: "red" },
  { icon: DataAnalysis, color: "#67c23a", tone: "green" }
];

const statusColorMap: Record<string, string> = {
  backlog: "#909399", todo: "#409eff", in_progress: "#e6a23c",
  in_review: "#9b59b6", done: "#67c23a", cancelled: "#f56c6c"
};
const priorityColorMap: Record<string, string> = {
  urgent: "#f56c6c", high: "#e6a23c", medium: "#409eff", low: "#909399", none: "#c0c4cc"
};
const typeColorMap: Record<string, string> = {
  bug: "#f56c6c", task: "#409eff", feature: "#67c23a", improvement: "#e6a23c"
};

async function loadData() {
  loading.value = true;
  try {
    const params: any = { pageSize: 500 };
    if (projectFilter.value) params.project_key = projectFilter.value;

    await Promise.all([
      issueStore.fetchIssues(params),
      cycleStore.fetchCycles({ pageSize: 100, ...(projectFilter.value ? { project_key: projectFilter.value } : {}) })
    ]);

    const issues = issueStore.issues;
    const cycles = cycleStore.cycles;

    stats[0].value = issues.length;
    stats[1].value = issues.filter(i => i.status === "done").length;
    stats[2].value = issues.filter(i => i.status === "in_progress").length;
    stats[3].value = cycles.filter(c => c.status === "active").length;

    const doneIssues = issues.filter(i => i.status === "done" && i.created_at);
    if (doneIssues.length) {
      const totalDays = doneIssues.reduce((sum, i) => {
        const days = (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / 86400000;
        return sum + Math.max(0, days);
      }, 0);
      stats[4].value = Math.round(totalDays / doneIssues.length) + "d";
    }

    const completedCycles = cycles.filter(c => c.status === "completed");
    if (completedCycles.length) {
      const totalPoints = completedCycles.reduce((sum, c) => {
        const cycleIssues = issues.filter(i => c.issue_keys?.includes(i.key));
        return sum + cycleIssues.reduce((s, i) => s + (i.estimate_points || 0), 0);
      }, 0);
      stats[5].value = Math.round(totalPoints / completedCycles.length) + " pts";
    }

    const bugs = issues.filter(i => i.issue_type === "bug");
    if (issues.length) {
      stats[6].value = Math.round((bugs.length / issues.length) * 100) + "%";
    }

    const fourWeeksAgo = Date.now() - 28 * 86400000;
    const recentDone = issues.filter(i => i.status === "done" && new Date(i.updated_at).getTime() > fourWeeksAgo);
    stats[7].value = Math.round(recentDone.length / 4) + "/wk";

    await nextTick();
    renderStatusChart(issues);
    renderPriorityChart(issues);
    renderTypeChart(issues);
    renderCycleChart(cycles);
    renderVelocityChart(cycles, issues);
    renderLeadTimeChart(issues);
    renderCumulativeChart(issues);
    renderThroughputChart(issues);
  } finally {
    loading.value = false;
  }
}

function renderStatusChart(issues: Issue[]) {
  if (!statusChartRef.value) return;
  const chart = echarts.init(statusChartRef.value);
  const counts: Record<string, number> = {};
  issues.forEach(i => { counts[i.status] = (counts[i.status] || 0) + 1; });
  chart.setOption({
    tooltip: { trigger: "item" },
    legend: { orient: "vertical", right: 10, top: "center" },
    series: [{
      type: "pie", radius: ["40%", "70%"], center: ["40%", "50%"],
      data: Object.entries(ISSUE_STATUS_MAP).map(([k, label]) => ({
        name: label, value: counts[k] || 0,
        itemStyle: { color: statusColorMap[k] }
      })),
      label: { show: false }, emphasis: { label: { show: true } }
    }]
  });
}

function renderPriorityChart(issues: Issue[]) {
  if (!priorityChartRef.value) return;
  const chart = echarts.init(priorityChartRef.value);
  const counts: Record<string, number> = {};
  issues.forEach(i => { counts[i.priority] = (counts[i.priority] || 0) + 1; });
  chart.setOption({
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: Object.values(ISSUE_PRIORITY_MAP) },
    yAxis: { type: "value" },
    series: [{
      type: "bar",
      data: Object.keys(ISSUE_PRIORITY_MAP).map(k => ({
        value: counts[k] || 0,
        itemStyle: { color: priorityColorMap[k], borderRadius: [4, 4, 0, 0] }
      }))
    }]
  });
}

function renderTypeChart(issues: Issue[]) {
  if (!typeChartRef.value) return;
  const chart = echarts.init(typeChartRef.value);
  const counts: Record<string, number> = {};
  issues.forEach(i => { counts[i.issue_type] = (counts[i.issue_type] || 0) + 1; });
  chart.setOption({
    tooltip: { trigger: "item" },
    series: [{
      type: "pie", radius: "70%",
      data: Object.entries(ISSUE_TYPE_MAP).map(([k, label]) => ({
        name: label, value: counts[k] || 0,
        itemStyle: { color: typeColorMap[k] }
      }))
    }]
  });
}

function renderCycleChart(cycles: Cycle[]) {
  if (!cycleChartRef.value) return;
  const chart = echarts.init(cycleChartRef.value);
  const counts: Record<string, number> = {};
  cycles.forEach(c => { counts[c.status] = (counts[c.status] || 0) + 1; });
  chart.setOption({
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: Object.values(CYCLE_STATUS_MAP) },
    yAxis: { type: "value", minInterval: 1 },
    series: [{
      type: "bar",
      data: Object.keys(CYCLE_STATUS_MAP).map((k, i) => ({
        value: counts[k] || 0,
        itemStyle: { color: ["#909399", "#409eff", "#67c23a"][i], borderRadius: [4, 4, 0, 0] }
      }))
    }]
  });
}

function renderVelocityChart(cycles: Cycle[], issues: Issue[]) {
  if (!velocityChartRef.value) return;
  const chart = echarts.init(velocityChartRef.value);
  const sorted = cycles
    .filter(c => c.status === "completed")
    .sort((a, b) => a.end_date.localeCompare(b.end_date))
    .slice(-8);
  const names = sorted.map(c => c.name.length > 10 ? c.name.slice(0, 10) + "..." : c.name);
  const points: number[] = [];
  const doneCounts: number[] = [];
  for (const c of sorted) {
    const cycleIssues = issues.filter(i => c.issue_keys?.includes(i.key));
    points.push(cycleIssues.reduce((s, i) => s + (i.estimate_points || 0), 0));
    doneCounts.push(cycleIssues.filter(i => i.status === "done").length);
  }
  chart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["Points", "Done"], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category", data: names, axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: "value" },
    series: [
      { name: "Points", type: "bar", data: points, itemStyle: { color: "#409eff", borderRadius: [4, 4, 0, 0] } },
      { name: "Done", type: "line", data: doneCounts, smooth: true, itemStyle: { color: "#67c23a" }, lineStyle: { color: "#67c23a" } }
    ]
  });
}

function renderLeadTimeChart(issues: Issue[]) {
  if (!leadTimeChartRef.value) return;
  const chart = echarts.init(leadTimeChartRef.value);
  const done = issues.filter(i => i.status === "done" && i.created_at);
  const months: Record<string, number[]> = {};
  done.forEach(i => {
    const m = i.created_at.slice(0, 7);
    if (!months[m]) months[m] = [];
    const days = (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / 86400000;
    months[m].push(Math.max(0, Math.round(days)));
  });
  const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  chart.setOption({
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category", data: sorted.map(([m]) => m), axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: "value", name: "Days" },
    series: [{
      type: "bar",
      data: sorted.map(([, days]) => Math.round(days.reduce((a, b) => a + b, 0) / days.length)),
      itemStyle: { color: "#e6a23c", borderRadius: [4, 4, 0, 0] }
    }]
  });
}

function renderCumulativeChart(issues: Issue[]) {
  if (!cumulativeChartRef.value) return;
  const chart = echarts.init(cumulativeChartRef.value);
  const created = [...issues].sort((a, b) => a.created_at.localeCompare(b.created_at));
  const done = [...issues].filter(i => i.status === "done").sort((a, b) => a.updated_at.localeCompare(b.updated_at));
  if (!created.length) return;
  const start = new Date(created[0].created_at);
  const end = new Date();
  const weeks: string[] = [];
  const cData: number[] = [];
  const dData: number[] = [];
  let cTotal = 0, dTotal = 0, ci = 0, di = 0;
  const current = new Date(start);
  while (current <= end) {
    const w = current.toISOString().slice(0, 10);
    weeks.push(w);
    const weekEnd = new Date(current.getTime() + 7 * 86400000).toISOString().slice(0, 10);
    while (ci < created.length && created[ci].created_at < weekEnd) { cTotal++; ci++; }
    while (di < done.length && done[di].updated_at < weekEnd) { dTotal++; di++; }
    cData.push(cTotal);
    dData.push(dTotal);
    current.setDate(current.getDate() + 7);
  }
  const step = Math.max(1, Math.floor(weeks.length / 20));
  const sampledWeeks = weeks.filter((_, i) => i % step === 0);
  const sampledCreated = cData.filter((_, i) => i % step === 0);
  const sampledDone = dData.filter((_, i) => i % step === 0);
  chart.setOption({
    tooltip: { trigger: "axis" },
    legend: { data: ["Created", "Done"], bottom: 0 },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category", data: sampledWeeks, axisLabel: { rotate: 30, fontSize: 10 } },
    yAxis: { type: "value" },
    series: [
      { name: "Created", type: "line", data: sampledCreated, smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { color: "#409eff" }, itemStyle: { color: "#409eff" } },
      { name: "Done", type: "line", data: sampledDone, smooth: true, areaStyle: { opacity: 0.1 }, lineStyle: { color: "#67c23a" }, itemStyle: { color: "#67c23a" } }
    ]
  });
}

function renderThroughputChart(issues: Issue[]) {
  if (!throughputChartRef.value) return;
  const chart = echarts.init(throughputChartRef.value);
  const done = issues.filter(i => i.status === "done");
  const weeks: Record<string, number> = {};
  done.forEach(i => {
    const d = new Date(i.updated_at);
    const monday = new Date(d);
    monday.setDate(d.getDate() - d.getDay() + 1);
    const w = monday.toISOString().slice(0, 10);
    weeks[w] = (weeks[w] || 0) + 1;
  });
  const sorted = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
  chart.setOption({
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: { type: "category", data: sorted.map(([w]) => w.slice(5)), axisLabel: { rotate: 30, fontSize: 11 } },
    yAxis: { type: "value", name: "Issues" },
    series: [{
      type: "bar",
      data: sorted.map(([, c]) => c),
      itemStyle: { color: "#67c23a", borderRadius: [4, 4, 0, 0] }
    }]
  });
}

onMounted(async () => {
  loadWidgetConfig();
  await projectStore.fetchProjects({ pageSize: 100 });
  projects.value = projectStore.projects.map(p => ({ key: p.key, name: p.name }));
  loadData();
});

watch(filterDateStr, () => { loadData(); });
</script>

<style scoped lang="scss">
.analytics {
  padding: 24px;
  background: var(--el-bg-color-page);
}

// ── Header Card ──
.analytics__header {
  display: flex; align-items: center; gap: 16px;
  padding: 16px 20px; margin-bottom: 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.analytics__header-icon {
  display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 10px;
  font-size: 22px; color: #fff;
  background: linear-gradient(135deg, #fac858, #e0b040);
  flex-shrink: 0;
}
.analytics__header-text { min-width: 0; flex: 1; }
.analytics__header-title { margin: 0; font-size: 18px; font-weight: 700; line-height: 1.3; }
.analytics__header-desc { margin: 2px 0 0; font-size: 12px; color: var(--el-text-color-secondary); }
.analytics__header-right {
  display: flex; align-items: center; gap: 8px; flex-shrink: 0;
  :deep(.ho__hero-date-nav) { margin: 0; }
}
.analytics__header-pills { display: flex; gap: 10px; flex-shrink: 0; }
.analytics__header-pill {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  padding: 6px 16px; border-radius: 8px; background: var(--el-fill-color-light); min-width: 64px;
  &--accent { background: var(--el-color-danger-light-9); }
}
.analytics__header-pill-val { font-size: 18px; font-weight: 700; line-height: 1.1; font-family: DIN, sans-serif; }
.analytics__header-pill--accent .analytics__header-pill-val { color: var(--el-color-danger); }
.analytics__header-pill-lbl { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; color: var(--el-text-color-secondary); }

// ── Toolbar ──
.analytics__head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 20px; gap: 12px;
}
.analytics__head-left { display: flex; align-items: center; gap: 12px; }
.analytics__head-right { display: flex; align-items: center; gap: 10px; }
.analytics__widget-config {
  display: flex; gap: 16px; flex-wrap: wrap;
  padding: 12px 16px; margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

// ── Stats Cards ──
.analytics__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.analytics__stat-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  transition: border-color 0.15s, box-shadow 0.15s;
  &:hover {
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }
}
.analytics__stat-icon {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; margin: 0 auto 8px;
  border-radius: 8px; font-size: 16px; color: #fff;
}
.analytics__stat-card--blue .analytics__stat-icon { background: linear-gradient(135deg, #5470c6, #4460b0); }
.analytics__stat-card--green .analytics__stat-icon { background: linear-gradient(135deg, #91cc75, #7ab85e); }
.analytics__stat-card--amber .analytics__stat-icon { background: linear-gradient(135deg, #e6a23c, #d09020); }
.analytics__stat-card--red .analytics__stat-icon { background: linear-gradient(135deg, #f56c6c, #dc2626); }
.analytics__stat-card--gray .analytics__stat-icon { background: linear-gradient(135deg, #909399, #7a7f87); }
.analytics__stat-value {
  font-size: 28px; font-weight: 700; margin-bottom: 2px; font-family: DIN, sans-serif;
}
.analytics__stat-label { font-size: 12px; color: var(--el-text-color-secondary); }

// ── Charts ──
.analytics__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
.analytics__chart-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 20px;
  &--wide { grid-column: 1 / -1; }
}
.analytics__chart-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 16px; font-size: 14px; font-weight: 600;
  color: var(--el-text-color-primary);
  .el-icon { font-size: 16px; color: var(--el-color-primary); }
}
</style>