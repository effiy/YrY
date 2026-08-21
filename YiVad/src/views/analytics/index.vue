<template>
  <div class="analytics">
    <div class="analytics__head">
      <div class="analytics__head-left">
        <h1 class="analytics__title">Analytics</h1>
        <el-select v-model="projectFilter" placeholder="Filter by project" clearable style="width: 200px" @change="loadData">
          <el-option v-for="p in projects" :key="p.key" :label="p.name" :value="p.key" />
        </el-select>
      </div>
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

    <!-- Widget Config -->
    <div v-if="widgetConfigOpen" class="analytics__widget-config">
      <el-checkbox v-for="w in widgetDefs" :key="w.key" v-model="w.visible" @change="saveWidgetConfig">
        {{ w.label }}
      </el-checkbox>
    </div>

    <div v-loading="loading" class="analytics__body">
      <!-- Stats Row -->
      <div class="analytics__stats">
        <div v-for="stat in stats" :key="stat.label" class="analytics__stat-card">
          <div class="analytics__stat-value">{{ stat.value }}</div>
          <div class="analytics__stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="analytics__charts">
        <div v-if="widgetDefs[1].visible" class="analytics__chart-card">
          <h3>Issues by Status</h3>
          <div ref="statusChartRef" style="width: 100%; height: 300px" />
        </div>
        <div v-if="widgetDefs[2].visible" class="analytics__chart-card">
          <h3>Issues by Priority</h3>
          <div ref="priorityChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[3].visible" class="analytics__chart-card">
          <h3>Issues by Type</h3>
          <div ref="typeChartRef" style="width: 100%; height: 300px" />
        </div>
        <div v-if="widgetDefs[4].visible" class="analytics__chart-card">
          <h3>Cycle Progress</h3>
          <div ref="cycleChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[5].visible" class="analytics__chart-card">
          <h3>Velocity (Completed Cycles)</h3>
          <div ref="velocityChartRef" style="width: 100%; height: 300px" />
        </div>
        <div v-if="widgetDefs[6].visible" class="analytics__chart-card">
          <h3>Lead Time (Days)</h3>
          <div ref="leadTimeChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[7].visible" class="analytics__chart-card analytics__chart-card--wide">
          <h3>Cumulative Flow</h3>
          <div ref="cumulativeChartRef" style="width: 100%; height: 300px" />
        </div>
      </div>

      <div class="analytics__charts">
        <div v-if="widgetDefs[8].visible" class="analytics__chart-card analytics__chart-card--wide">
          <h3>Throughput (Completed per Week)</h3>
          <div ref="throughputChartRef" style="width: 100%; height: 280px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="analyticsDashboard">
import { onMounted, reactive, ref, nextTick } from "vue";
import { Refresh, Setting } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { useIssueStore } from "@/stores/modules/issue";
import { useCycleStore } from "@/stores/modules/cycle";
import { useProjectStore } from "@/stores/modules/project";
import { ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP } from "@/api/modules/issueService";
import { CYCLE_STATUS_MAP } from "@/api/modules/cycleService";
import type { Issue, IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import type { Cycle } from "@/api/modules/cycleService";

const issueStore = useIssueStore();
const cycleStore = useCycleStore();
const projectStore = useProjectStore();

const loading = ref(false);
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

    // Calculate lead time (avg days from created to done for completed issues)
    const doneIssues = issues.filter(i => i.status === "done" && i.created_at);
    if (doneIssues.length) {
      const totalDays = doneIssues.reduce((sum, i) => {
        const days = (new Date(i.updated_at).getTime() - new Date(i.created_at).getTime()) / 86400000;
        return sum + Math.max(0, days);
      }, 0);
      stats[4].value = Math.round(totalDays / doneIssues.length) + "d";
    }

    // Velocity (avg points per completed cycle)
    const completedCycles = cycles.filter(c => c.status === "completed");
    if (completedCycles.length) {
      const totalPoints = completedCycles.reduce((sum, c) => {
        const cycleIssues = issues.filter(i => c.issue_keys?.includes(i.key));
        return sum + cycleIssues.reduce((s, i) => s + (i.estimate_points || 0), 0);
      }, 0);
      stats[5].value = Math.round(totalPoints / completedCycles.length) + " pts";
    }

    // Bug rate
    const bugs = issues.filter(i => i.issue_type === "bug");
    if (issues.length) {
      stats[6].value = Math.round((bugs.length / issues.length) * 100) + "%";
    }

    // Throughput (issues completed per week, last 4 weeks)
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
        itemStyle: {
          color: ["#909399", "#409eff", "#67c23a"][i],
          borderRadius: [4, 4, 0, 0]
        }
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
  // Group by month
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
  // Sample to ~20 points
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
</script>

<style scoped lang="scss">
.analytics {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.analytics__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.analytics__head-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.analytics__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
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
  padding: 20px;
  text-align: center;
}
.analytics__stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-color-primary);
  margin-bottom: 4px;
}
.analytics__stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
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
  h3 {
    margin: 0 0 16px;
    font-size: 15px;
  }
}
</style>