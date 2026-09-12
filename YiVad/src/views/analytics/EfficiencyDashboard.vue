<template>
  <div class="efficiency-page">
    <header class="page-header">
      <div>
        <h1>Efficiency Dashboard</h1>
        <p class="text-muted">Cycle time, lead time, throughput, and cumulative flow analysis.</p>
      </div>
      <div class="page-header__actions">
        <DateRangePicker @change="onDateChange" />
        <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
      </div>
    </header>

    <el-row :gutter="16">
      <el-col :span="8" class="mb16">
        <KpiCard label="Avg Cycle Time" :value="metrics.cycle_time ?? 0" unit="days" format="duration" />
      </el-col>
      <el-col :span="8" class="mb16">
        <KpiCard label="Throughput (period)" :value="metrics.throughput" unit="issues" />
      </el-col>
      <el-col :span="8" class="mb16">
        <KpiCard label="WIP" :value="Object.values(metrics.wip ?? {}).reduce((a, b) => a + b, 0)" unit="issues" />
      </el-col>
    </el-row>

    <el-card shadow="never" class="mb16">
      <template #header><span>Cycle Time Distribution (P50/P80/P95)</span></template>
      <CycleTimeChart :data="cycleTimeData" />
    </el-card>

    <el-row :gutter="16">
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Cumulative Flow Diagram</span></template>
          <CumulativeFlowDiagram :data="cfdData" />
        </el-card>
      </el-col>
      <el-col :span="12" class="mb16">
        <el-card shadow="never">
          <template #header><span>Weekly Throughput</span></template>
          <ThroughputChart :data="throughputData" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never">
      <template #header><span>Bottleneck Analysis</span></template>
      <BottleneckAnalysis :data="bottleneckData" :threshold="3" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import KpiCard from "@/components/analytics/KpiCard.vue";
import DateRangePicker from "@/components/analytics/DateRangePicker.vue";
import CycleTimeChart from "@/components/analytics/CycleTimeChart.vue";
import CumulativeFlowDiagram from "@/components/analytics/CumulativeFlowDiagram.vue";
import ThroughputChart from "@/components/analytics/ThroughputChart.vue";
import BottleneckAnalysis from "@/components/analytics/BottleneckAnalysis.vue";
import { getEfficiencyMetrics } from "@/api/modules/analyticsService";
import type { DateRange, ThroughputData } from "@/types/analytics";

const loading = ref(false);
const dateRange = ref<DateRange>({ start: "", end: "" });

const metrics = ref({ cycle_time: null as number | null, throughput: 0, wip: {} as Record<string, number> });
const cycleTimeData = ref<{ label: string; p50: number; p80: number; p95: number }[]>([]);
const cfdData = ref<any[]>([]);
const throughputData = ref<ThroughputData[]>([]);
const bottleneckData = ref<{ status: string; avgDays: number; count: number }[]>([]);

function onDateChange(range: DateRange) { dateRange.value = range; fetchData(); }

async function fetchData() {
  loading.value = true;
  try {
    const res = await getEfficiencyMetrics({ dateRange: dateRange.value });
    if (res.code === 0) {
      const d = res.data;
      metrics.value = { cycle_time: d.cycle_time, throughput: d.throughput, wip: d.wip ?? {} };
      cfdData.value = d.cfd ?? [];

      // Derive bottleneck data from WIP breakdown
      const wip = d.wip ?? {};
      bottleneckData.value = Object.entries(wip).map(([status, count]) => ({
        status, avgDays: count > 0 ? Math.round(count * 1.5) : 0, count,
      }));
    }
  } finally {
    loading.value = false;
  }
}

onMounted(() => fetchData());
</script>

<style scoped lang="scss">
.efficiency-page { padding: 20px; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;
  h1 { margin: 0 0 4px; font-size: 22px; }
  &__actions { display: flex; align-items: center; gap: 12px; }
}
.mb16 { margin-bottom: 16px; }
.text-muted { color: var(--el-text-color-secondary); font-size: 13px; }
</style>