<template>
  <div class="analytics-console">
    <header class="analytics-console__header">
      <div>
        <h1>Analytics Console</h1>
        <p class="text-muted">Centralized analytics overview — monitor KPIs, efficiency, and quality across all projects.</p>
      </div>
      <div class="analytics-console__actions">
        <DateRangePicker @change="onDateChange" />
        <el-button :icon="Refresh" size="small" @click="fetchAll" :loading="loading">Refresh</el-button>
        <el-button :icon="Download" size="small" @click="$router.push('/export')">Export</el-button>
      </div>
    </header>

    <!-- KPI Cards Row -->
    <el-row :gutter="16" class="mb16">
      <el-col v-for="kpi in kpis" :key="kpi.key" :xs="12" :sm="6" :md="4" :lg="3">
        <KpiCard v-bind="kpi" />
      </el-col>
    </el-row>

    <!-- Charts Grid -->
    <el-row :gutter="16">
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Issue Trends</span></template>
          <BugRateChart :data="issueTrends" color="#409eff" />
        </el-card>
      </el-col>
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Bug Rate Trend</span></template>
          <BugRateChart :data="bugTrends" color="#f56c6c" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Throughput (Last 12 Weeks)</span></template>
          <ThroughputChart :data="throughputData" />
        </el-card>
      </el-col>
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Defect Density by Module</span></template>
          <DefectDensityHeatmap :data="defectDensity" />
        </el-card>
      </el-col>
    </el-row>

    <!-- Quick Links -->
    <el-card shadow="never" class="mb16">
      <template #header><span>Quick Access</span></template>
      <div class="quick-links">
        <el-button v-for="link in quickLinks" :key="link.path" @click="$router.push(link.path)">
          <el-icon><component :is="link.icon" /></el-icon> {{ link.label }}
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Refresh, Download, DataAnalysis, TrendCharts, Monitor } from "@element-plus/icons-vue";
import KpiCard from "@/components/analytics/KpiCard.vue";
import DateRangePicker from "@/components/analytics/DateRangePicker.vue";
import BugRateChart from "@/components/analytics/BugRateChart.vue";
import ThroughputChart from "@/components/analytics/ThroughputChart.vue";
import DefectDensityHeatmap from "@/components/analytics/DefectDensityHeatmap.vue";
import { getEfficiencyMetrics, getQualityMetrics } from "@/api/modules/analyticsService";
import type { DateRange, TrendDataPoint, ThroughputData, KpiMetric } from "@/types/analytics";

const loading = ref(false);
const dateRange = ref<DateRange>({ start: "", end: "" });

const kpis = ref<KpiMetric[]>([
  { key: "projects", label: "Projects", value: 0, trend: 0, trendDirection: "neutral", sparkline: [] },
  { key: "issues", label: "Active Issues", value: 0, trend: 0, trendDirection: "neutral", sparkline: [] },
  { key: "bugs", label: "Open Bugs", value: 0, trend: 0, trendDirection: "neutral", sparkline: [] },
  { key: "throughput", label: "Throughput (mo)", value: 0, trend: 0, trendDirection: "neutral", sparkline: [] },
  { key: "bug_rate", label: "Bug Rate", value: 0, unit: "%", trend: 0, trendDirection: "neutral", format: "percent", sparkline: [] },
  { key: "quality", label: "Quality Score", value: 0, trend: 0, trendDirection: "neutral", sparkline: [] },
  { key: "rework", label: "Rework Rate", value: 0, unit: "%", trend: 0, trendDirection: "neutral", format: "percent", sparkline: [] },
  { key: "done", label: "Completed", value: 0, trend: 0, trendDirection: "neutral", sparkline: [] },
]);

const issueTrends = ref<TrendDataPoint[]>([]);
const bugTrends = ref<TrendDataPoint[]>([]);
const throughputData = ref<ThroughputData[]>([]);
const defectDensity = ref<{ module: string; bugs: number }[]>([]);

const quickLinks = [
  { label: "Efficiency Dashboard", path: "/analytics/efficiency", icon: DataAnalysis },
  { label: "Quality Trends", path: "/analytics/quality", icon: TrendCharts },
  { label: "System Health", path: "/monitoring", icon: Monitor },
];

function onDateChange(range: DateRange) { dateRange.value = range; fetchAll(); }

async function fetchAll() {
  loading.value = true;
  try {
    const [effRes, qualRes] = await Promise.all([
      getEfficiencyMetrics({ dateRange: dateRange.value }),
      getQualityMetrics({ dateRange: dateRange.value }),
    ]);

    if (effRes.code === 0) {
      const d = effRes.data;
      kpis.value[3].value = d.throughput;
      kpis.value[7].value = d.done_count;
      kpis.value[1].value = d.total_issues;
    }

    if (qualRes.code === 0) {
      const d = qualRes.data;
      kpis.value[2].value = d.bug_count;
      kpis.value[4].value = d.bug_rate;
      kpis.value[5].value = d.quality_score;
      kpis.value[6].value = d.rework_rate;
      defectDensity.value = d.defect_density;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchAll());
</script>

<style scoped lang="scss">
.analytics-console {
  padding: 20px;
  &__header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
    h1 { margin: 0 0 4px; font-size: 22px; }
  }
  &__actions { display: flex; align-items: center; gap: 12px; }
  .mb16 { margin-bottom: 16px; }
  .text-muted { color: var(--el-text-color-secondary); font-size: 13px; }
  .quick-links { display: flex; gap: 12px; flex-wrap: wrap; }
}
</style>