<template>
  <div class="engineering-maturity-box" v-loading="loading">
    <div class="card top-box">
      <div class="top-header">
        <span class="top-title">Engineering Maturity</span>
        <div class="top-actions">
          <span class="last-updated" v-if="lastUpdated">Updated {{ lastUpdated }}</span>
          <el-button :icon="Refresh" size="small" @click="fetchAll" :loading="loading">Refresh</el-button>
        </div>
      </div>
      <div class="top-content">
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-knowledge">
              <div class="stat-icon"><el-icon><Document /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.knowledge_files ?? 0 }}</div>
                <div class="stat-label">Knowledge Files</div>
                <div class="stat-sub">{{ knowledgeData?.categories.length ?? 0 }} categories</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-sessions">
              <div class="stat-icon"><el-icon><ChatDotRound /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.sessions ?? 0 }}</div>
                <div class="stat-label">Chat Sessions</div>
                <div class="stat-sub">{{ healthData?.collections.users ?? 0 }} users</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-coverage">
              <div class="stat-icon"><el-icon><TrendCharts /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ knowledgeData?.health.review_coverage_pct ?? 0 }}%</div>
                <div class="stat-label">Review Coverage</div>
                <div class="stat-sub">{{ knowledgeData?.health.tacit_count ?? 0 }} tacit / {{ knowledgeData?.health.stale_count ?? 0 }} stale</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-uptime">
              <div class="stat-icon"><el-icon><Timer /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ formattedUptime }}</div>
                <div class="stat-label">Server Uptime</div>
                <div class="stat-sub">v{{ healthData?.server.version }}</div>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-menus">
              <div class="stat-icon"><el-icon><Menu /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.menus ?? 0 }}</div>
                <div class="stat-label">Menus</div>
                <div class="stat-sub">{{ knowledgeData?.modules.length ?? 0 }} modules</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-users">
              <div class="stat-icon"><el-icon><User /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.users ?? 0 }}</div>
                <div class="stat-label">Users</div>
                <div class="stat-sub">{{ healthData?.collections.roles ?? 0 }} roles defined</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-roles">
              <div class="stat-icon"><el-icon><Avatar /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.roles ?? 0 }}</div>
                <div class="stat-label">Roles</div>
                <div class="stat-sub">{{ healthData?.collections.departments ?? 0 }} departments</div>
              </div>
            </div>
          </el-col>
          <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
            <div class="stat-card stat-depts">
              <div class="stat-icon"><el-icon><OfficeBuilding /></el-icon></div>
              <div class="stat-info">
                <div class="stat-value">{{ healthData?.collections.departments ?? 0 }}</div>
                <div class="stat-label">Departments</div>
                <div class="stat-sub">{{ healthData?.collections.knowledge_files ?? 0 }} knowledge files</div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <div class="card section-box">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Knowledge Health Overview</div>
            <div class="chart-body">
              <ECharts :option="knowledgeHealthOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
          <div class="chart-box">
            <div class="chart-title">Review Cycle Distribution</div>
            <div class="chart-body">
              <ECharts :option="reviewCycleOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card section-box">
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Knowledge by Status</div>
            <div class="chart-body">
              <ECharts :option="knowledgeStatusOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Knowledge by Lifecycle</div>
            <div class="chart-body">
              <ECharts :option="knowledgeLifecycleOption" />
            </div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
          <div class="chart-box">
            <div class="chart-title">Knowledge by Category</div>
            <div class="chart-body">
              <ECharts :option="categoryBarOption" />
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="card system-status-box">
      <div class="section-title">System Status <span class="health-badge" :class="systemHealthClass">{{ systemHealthyCount }}/{{ systemTotalChecks }} Healthy</span></div>
      <el-row :gutter="20">
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="status-card" :class="healthData?.server.running ? 'status-ok' : 'status-err'">
            <div class="status-label">Server</div>
            <el-tag :type="healthData?.server.running ? 'success' : 'danger'" size="small">{{ healthData?.server.running ? 'Running' : 'Stopped' }}</el-tag>
            <div class="status-detail">v{{ healthData?.server.version }} | {{ formattedUptime }}</div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="status-card" :class="healthData?.mongodb.connected ? 'status-ok' : 'status-err'">
            <div class="status-label">MongoDB</div>
            <el-tag :type="healthData?.mongodb.connected ? 'success' : 'danger'" size="small">{{ healthData?.mongodb.connected ? 'Connected' : 'Down' }}</el-tag>
            <div class="status-detail">{{ healthData?.mongodb.database }}</div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="status-card" :class="healthData?.ollama.connected ? 'status-ok' : 'status-err'">
            <div class="status-label">Ollama</div>
            <el-tag :type="healthData?.ollama.connected ? 'success' : 'danger'" size="small">{{ healthData?.ollama.connected ? 'Connected' : 'Down' }}</el-tag>
            <div class="status-detail">{{ healthData?.ollama.model_count ?? 0 }} models</div>
          </div>
        </el-col>
        <el-col class="mb20" :xs="24" :sm="12" :md="6" :lg="6" :xl="6">
          <div class="status-card" :class="healthData?.scheduler.enabled ? 'status-ok' : 'status-warn'">
            <div class="status-label">RSS Scheduler</div>
            <el-tag :type="healthData?.scheduler.enabled ? 'success' : 'warning'" size="small">{{ healthData?.scheduler.enabled ? 'Running' : 'Stopped' }}</el-tag>
            <div class="status-detail">{{ healthData?.scheduler.type }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="engineeringMaturity">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { Menu, User, Avatar, OfficeBuilding, ChatDotRound, Document, Timer, TrendCharts, Refresh } from "@element-plus/icons-vue";
import { getDashboardHealth, getKnowledgeStats } from "@/api/modules/dashboard";
import type { DashboardHealthData, KnowledgeStatsData } from "@/api/interface/yiweb";
import { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";

const healthData = ref<DashboardHealthData | null>(null);
const knowledgeData = ref<KnowledgeStatsData | null>(null);
const loading = ref(true);
const lastUpdated = ref("");
let refreshTimer: ReturnType<typeof setInterval> | null = null;

const colors = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de", "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef"];

const systemTotalChecks = 4;
const systemHealthyCount = computed(() => {
  if (!healthData.value) return 0;
  let n = 0;
  if (healthData.value.server.running) n++;
  if (healthData.value.mongodb.connected) n++;
  if (healthData.value.ollama.connected) n++;
  if (healthData.value.scheduler.enabled) n++;
  return n;
});
const systemHealthClass = computed(() => {
  if (systemHealthyCount.value === systemTotalChecks) return "health-ok";
  if (systemHealthyCount.value >= 2) return "health-warn";
  return "health-err";
});

const formattedUptime = computed(() => {
  if (!healthData.value) return "—";
  const s = healthData.value.server.uptime_seconds;
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  parts.push(`${m}m`);
  return parts.join(" ");
});

const knowledgeHealthOption = computed<ECOption>(() => {
  const h = knowledgeData.value?.health;
  if (!h) return {} as ECOption;
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: { data: ["Count", "Coverage %"], top: 0 },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
    xAxis: { type: "category", data: ["Tacit", "Stale", "No Review"] },
    yAxis: [
      { type: "value", name: "Files", minInterval: 1 },
      { type: "value", name: "%", min: 0, max: 100 },
    ],
    series: [
      {
        name: "Count", type: "bar", data: [h.tacit_count, h.stale_count, h.no_review_cycle_count],
        barWidth: "40%", itemStyle: { color: "#5470c6", borderRadius: [6, 6, 0, 0] },
      },
      {
        name: "Coverage %", type: "line", yAxisIndex: 1,
        data: [h.review_coverage_pct, h.review_coverage_pct, h.review_coverage_pct],
        smooth: true, lineStyle: { color: "#67c23a", width: 3 }, itemStyle: { color: "#67c23a" },
      },
    ],
  };
});

const reviewCycleOption = computed<ECOption>(() => {
  const data = knowledgeData.value?.review_cycles ?? [];
  if (!data.length) return {} as ECOption;
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center", type: "scroll" },
    series: [{
      type: "pie", radius: ["50%", "75%"], center: ["55%", "50%"],
      data: data.map((d, i) => ({ value: d.count, name: d.name, itemStyle: { color: colors[i % colors.length] } })),
      label: { formatter: "{b}: {c}" },
    }],
  };
});

const knowledgeStatusOption = computed<ECOption>(() => {
  const data = knowledgeData.value?.statuses ?? [];
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center", type: "scroll" },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["55%", "50%"],
      data: data.map((d, i) => ({ value: d.count, name: d.name, itemStyle: { color: colors[i % colors.length] } })),
      label: { formatter: "{b}" },
    }],
  };
});

const knowledgeLifecycleOption = computed<ECOption>(() => {
  const data = knowledgeData.value?.lifecycles ?? [];
  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { orient: "vertical", left: "left", top: "center" },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["55%", "50%"],
      data: data.map((d, i) => ({ value: d.count, name: d.name, itemStyle: { color: colors[i % colors.length] } })),
      label: { formatter: "{b}" },
    }],
  };
});

const categoryBarOption = computed<ECOption>(() => {
  const cats = (knowledgeData.value?.categories ?? []).filter(c => c.count > 0);
  const sorted = [...cats].sort((a, b) => b.count - a.count).slice(0, 10);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", minInterval: 1 },
    yAxis: { type: "category", data: sorted.map(c => c.name).reverse(), axisLabel: { fontSize: 11 } },
    series: [{
      type: "bar",
      data: sorted.map(c => c.count).reverse(),
      barWidth: "60%",
      itemStyle: { color: "#73c0de", borderRadius: [0, 6, 6, 0] },
    }],
  };
});

async function fetchAll() {
  try {
    loading.value = true;
    const [health, knowledge] = await Promise.all([
      getDashboardHealth(),
      getKnowledgeStats(),
    ]);
    healthData.value = health.data;
    knowledgeData.value = knowledge.data;
    lastUpdated.value = new Date().toLocaleTimeString();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchAll();
  refreshTimer = setInterval(fetchAll, 30_000);
});

onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
@use "./index.scss" as *;
</style>