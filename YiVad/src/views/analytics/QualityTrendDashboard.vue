<template>
  <div class="quality-page">
    <header class="page-header">
      <div>
        <h1>Quality Trends</h1>
        <p class="text-muted">Bug rate, rework rate, defect density, and quality score trends over time.</p>
      </div>
      <div class="page-header__actions">
        <DateRangePicker @change="onDateChange" />
        <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
      </div>
    </header>

    <el-row :gutter="16">
      <el-col :span="6" class="mb16">
        <KpiCard label="Quality Score" :value="metrics.quality_score" trendDirection="up" format="number" />
      </el-col>
      <el-col :span="6" class="mb16">
        <KpiCard label="Bug Rate" :value="metrics.bug_rate" unit="%" format="percent"
          :trendDirection="metrics.bug_rate > 10 ? 'up' : 'down'" />
      </el-col>
      <el-col :span="6" class="mb16">
        <KpiCard label="Rework Rate" :value="metrics.rework_rate" unit="%" format="percent"
          :trendDirection="metrics.rework_rate > 15 ? 'up' : 'down'" />
      </el-col>
      <el-col :span="6" class="mb16">
        <KpiCard label="Open Bugs" :value="metrics.bug_count" unit="bugs" />
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Bug Rate Trend</span></template>
          <BugRateChart :data="bugTrendData" />
        </el-card>
      </el-col>
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Rework Rate Trend</span></template>
          <ReworkRateChart :data="reworkTrendData" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header><span>Defect Density by Module</span></template>
      <DefectDensityHeatmap :data="metrics.defect_density" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import KpiCard from "@/components/analytics/KpiCard.vue";
import DateRangePicker from "@/components/analytics/DateRangePicker.vue";
import BugRateChart from "@/components/analytics/BugRateChart.vue";
import ReworkRateChart from "@/components/analytics/ReworkRateChart.vue";
import DefectDensityHeatmap from "@/components/analytics/DefectDensityHeatmap.vue";
import { getQualityMetrics } from "@/api/modules/analyticsService";
import type { DateRange, TrendDataPoint } from "@/types/analytics";

const loading = ref(false);
const dateRange = ref<DateRange>({ start: "", end: "" });

const metrics = ref({ quality_score: 0, bug_rate: 0, rework_rate: 0, bug_count: 0, defect_density: [] as { module: string; bugs: number }[] });
const bugTrendData = ref<TrendDataPoint[]>([]);
const reworkTrendData = ref<TrendDataPoint[]>([]);

function onDateChange(range: DateRange) { dateRange.value = range; fetchData(); }

async function fetchData() {
  loading.value = true;
  try {
    const res = await getQualityMetrics({ dateRange: dateRange.value });
    if (res.code === 0) {
      metrics.value = res.data;
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchData());
</script>

<style scoped lang="scss">
.quality-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
  h1 { margin: 0 0 4px; font-size: 22px; }
  &__actions { display: flex; align-items: center; gap: 12px; }
}
.mb16 { margin-bottom: 16px; }
.text-muted { color: var(--el-text-color-secondary); font-size: 13px; }
</style>