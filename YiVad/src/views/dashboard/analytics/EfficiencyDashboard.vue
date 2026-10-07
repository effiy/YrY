<template>
  <div class="efficiency-page page">
    <!-- Header -->
    <header class="page-header">
      <div class="page-header__left">
        <div class="page-header__title-row">
          <h1>Efficiency Analytics</h1>
          <span class="freshness-dot" :class="`freshness-dot--${freshnessState}`" :title="freshnessLabel" />
          <span class="freshness-text">{{ freshnessLabel }}</span>
        </div>
        <p class="text-muted">
          {{ totalIssues }} issues · {{ doneCount }} completed
          · {{ dataPeriodDays }}d data window
        </p>
      </div>
      <div class="page-header__actions">
        <el-select v-model="refreshInterval" size="small" style="width:120px" @change="startAutoRefresh">
          <el-option label="Auto: 30s" :value="30" />
          <el-option label="Auto: 60s" :value="60" />
          <el-option label="Auto: 5min" :value="300" />
          <el-option label="Manual" :value="0" />
        </el-select>
        <DateRangePicker @change="onDateChange" />
        <el-button :icon="Refresh" size="small" @click="fetchData" :loading="loading">Refresh</el-button>
      </div>
    </header>

    <!-- Error -->
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb16">
      <template #default>
        <el-button size="small" @click="fetchData">Retry</el-button>
      </template>
    </el-alert>

    <!-- Skeleton (first load) -->
    <template v-if="isFirstLoad && loading">
      <el-row :gutter="16" class="mb16">
        <el-col v-for="i in 4" :key="i" :span="6">
          <el-skeleton animated>
            <template #template>
              <div style="padding:24px">
                <el-skeleton-item variant="text" style="width:50%" />
                <el-skeleton-item variant="text" style="width:45%;height:36px;margin:12px 0" />
                <el-skeleton-item variant="text" style="width:70%" />
              </div>
            </template>
          </el-skeleton>
        </el-col>
      </el-row>
      <el-row :gutter="16" class="mb16">
        <el-col v-for="i in 6" :key="i" :span="4">
          <el-skeleton animated>
            <template #template>
              <div style="padding:16px">
                <el-skeleton-item variant="text" style="width:60%" />
                <el-skeleton-item variant="text" style="width:40%;height:28px;margin:8px 0" />
                <el-skeleton-item variant="text" style="width:30%" />
              </div>
            </template>
          </el-skeleton>
        </el-col>
      </el-row>
      <el-row :gutter="16" class="mb16">
        <el-col :span="24">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" style="height:380px" />
            </template>
          </el-skeleton>
        </el-col>
      </el-row>
      <el-row :gutter="16" class="mb16">
        <el-col :span="15">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" style="height:340px" />
            </template>
          </el-skeleton>
        </el-col>
        <el-col :span="9">
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="rect" style="height:340px" />
            </template>
          </el-skeleton>
        </el-col>
      </el-row>
    </template>

    <!-- Empty -->
    <el-empty
      v-else-if="!loading && !hasData"
      description="No efficiency data available for the selected period"
    />

    <!-- Data -->
    <template v-else>
      <!-- Section 1: Hero Bar -->
      <el-row :gutter="16" class="mb20">
        <el-col :span="6">
          <KpiCard
            label="Avg Cycle Time"
            :value="metrics.avg_cycle_time"
            unit="days"
            :trend="cycleTimeTrendVal"
            :trend-direction="cycleTimeTrendDir"
            :sparkline="cycleTimeSparkline"
            :tooltip="`P50: ${metrics.cycle_time_p50}d · P80: ${metrics.cycle_time_p80}d · P95: ${metrics.cycle_time_p95}d · σ=${metrics.cycle_time_std}d`"
            :threshold="{ good: 5, warn: 14 }"
            inverted
            size="large"
            :badge="metrics.cycle_time_source === 'estimated' ? { text: 'estimated', type: 'info' } : undefined"
          />
        </el-col>
        <el-col :span="6">
          <KpiCard
            label="Throughput"
            :value="metrics.throughput_per_week"
            unit="per week"
            :trend="throughputTrendVal"
            :trend-direction="throughputTrendDir"
            :sparkline="throughputSparkline"
            :tooltip="`${metrics.throughput} total · ${metrics.throughput_per_day.toFixed(2)}/day · σ=${metrics.throughput_std.toFixed(1)}`"
            :subtitle="`${metrics.velocity_per_week.toFixed(1)}/wk recent velocity`"
            size="large"
          />
        </el-col>
        <el-col :span="6">
          <KpiCard
            label="Flow Efficiency"
            :value="metrics.flow_efficiency"
            unit="%"
            format="percent"
            :tooltip="'Estimated active work time / total elapsed time. Based on 70% activity assumption.'"
            :threshold="{ good: 60, warn: 30 }"
            :badge="{ text: 'estimated', type: 'info' }"
            size="large"
          />
        </el-col>
        <el-col :span="6">
          <KpiCard
            label="Predictability"
            :value="metrics.predictability"
            unit="%"
            format="percent"
            :tooltip="'1 − CV(cycle time). Higher = more consistent delivery. Green > 70%, Yellow > 40%.'"
            :threshold="{ good: 70, warn: 40 }"
            :comparison-label="predictabilityLabel"
            size="large"
          />
        </el-col>
      </el-row>

      <!-- Section 2: Stats Grid (3x2) -->
      <el-row :gutter="16" class="mb20">
        <el-col :span="4">
          <KpiCard
            label="Current WIP"
            :value="metrics.current_wip"
            unit="issues"
            :tooltip="`${wipStatusCount} statuses · ${staleWipCount} stale >14d`"
            :badge="staleWipCount > 0 ? { text: `${staleWipCount} stale`, type: 'warning' } : undefined"
            inverted
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            label="Completed"
            :value="metrics.done_count"
            unit="issues"
            :tooltip="`${metrics.total_issues} total · ${completionRate}% rate`"
            :subtitle="`${completionRate}% completion`"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            label="Avg Lead Time"
            :value="metrics.avg_lead_time"
            unit="days"
            :tooltip="`P50: ${metrics.lead_time_p50}d · P95: ${metrics.lead_time_p95}d · σ=${metrics.lead_time_std}d`"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            label="Arrival Rate"
            :value="metrics.arrival_rate_per_week"
            unit="per week"
            :tooltip="'New issues created per week in the selected period'"
            :comparison-label="arrivalDepartureLabel"
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            label="Cycle Time CV"
            :value="metrics.cycle_time_cv * 100"
            unit="%"
            format="percent"
            :tooltip="'Coefficient of variation. Lower = more predictable. < 30% is healthy.'"
            :threshold="{ good: 30, warn: 60 }"
            inverted
          />
        </el-col>
        <el-col :span="4">
          <KpiCard
            label="WIP Age P85"
            :value="metrics.wip_age_p85"
            unit="days"
            :tooltip="`P50: ${metrics.wip_age_p50}d · P95: ${metrics.wip_age_p95}d. 85% of WIP is ≤ this age.`"
            :threshold="{ good: 7, warn: 14 }"
            inverted
          />
        </el-col>
      </el-row>

      <!-- Section 3: Control Chart -->
      <el-card shadow="never" class="mb20">
        <template #header>
          <div class="card-header">
            <div class="card-header__left">
              <span>Control Chart</span>
              <el-tag v-if="controlChartInfo" :type="controlChartInfoType" size="small" effect="plain">
                {{ controlChartInfo }}
              </el-tag>
            </div>
            <div class="card-header__right">
              <span class="card-header__stat">UCL {{ metrics.cycle_time_ucl }}d · Mean {{ metrics.avg_cycle_time }}d · LCL {{ metrics.cycle_time_lcl }}d</span>
            </div>
          </div>
        </template>
        <ControlChart
          v-if="metrics.control_chart.length >= 2"
          :data="metrics.control_chart"
          :ucl="metrics.cycle_time_ucl"
          :lcl="metrics.cycle_time_lcl"
          :mean="metrics.avg_cycle_time"
        />
        <el-empty v-else description="Need at least 2 completed issues for a control chart" :image-size="80" />
      </el-card>

      <!-- Section 4: CFD + Weekly Throughput -->
      <el-row :gutter="16" class="mb20">
        <el-col :span="15">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <div class="card-header__left">
                  <span>Cumulative Flow</span>
                  <el-tag type="info" size="small" effect="plain">estimated</el-tag>
                </div>
                <span class="card-header__stat">{{ cfdDayCount }} days</span>
              </div>
            </template>
            <CumulativeFlowDiagram
              v-if="metrics.cfd.length"
              :data="metrics.cfd"
              :confidence="metrics.cfd_confidence"
            />
            <el-empty v-else description="Insufficient data for cumulative flow" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :span="9">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>Weekly Throughput</span>
                <span class="card-header__stat card-header__stat--mono">
                  μ={{ avgWeeklyThroughput.toFixed(1) }} σ={{ weeklyStdDev.toFixed(1) }}
                </span>
              </div>
            </template>
            <ThroughputChart
              v-if="metrics.weekly_throughput.length"
              :data="metrics.weekly_throughput"
              :rolling-avg="true"
            />
            <el-empty v-else description="No throughput data" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Section 5: Histogram + WIP Aging -->
      <el-row :gutter="16" class="mb20">
        <el-col :span="14">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>Cycle Time Distribution</span>
                <span class="card-header__stat">{{ doneCount }} issues</span>
              </div>
            </template>
            <CycleTimeHistogram
              v-if="hasCtHistogram"
              :data="metrics.cycle_time_histogram"
              :mean="metrics.avg_cycle_time"
            />
            <el-empty v-else description="No completed issues" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :span="10">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>WIP Aging</span>
                <el-tag v-if="staleWipCount > 0" type="danger" size="small" effect="plain">
                  {{ staleWipCount }} stale &gt;14d
                </el-tag>
              </div>
            </template>
            <WipAgingChart v-if="hasWipAging" :data="metrics.wip_aging" />
            <el-empty v-else description="No WIP items" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Section 6: Bottleneck Analysis -->
      <el-card shadow="never" class="mb20">
        <template #header>
          <div class="card-header">
            <span>Bottleneck Analysis</span>
            <span class="card-header__stat">{{ bottleneckCount }} bottlenecks</span>
          </div>
        </template>
        <BottleneckAnalysis v-if="metrics.bottlenecks.length" :data="metrics.bottlenecks" />
        <el-empty v-else description="No WIP data available" :image-size="80" />
      </el-card>

      <!-- Section 7: Little's Law + Flow Health -->
      <el-row :gutter="16" class="mb20">
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>Little's Law Validation</span>
                <el-tag
                  :type="littlesLawDiff < 20 ? 'success' : littlesLawDiff < 50 ? 'warning' : 'danger'"
                  size="small"
                  effect="plain"
                >
                  {{ littlesLawDiff < 20 ? 'Consistent' : littlesLawDiff < 50 ? 'Deviation' : 'Anomaly' }}
                </el-tag>
              </div>
            </template>
            <div class="littles-law">
              <div class="littles-law__formula">
                <span class="littles-law__eq">Cycle Time ≈ WIP ÷ Throughput</span>
              </div>
              <div class="littles-law__calc">
                <div class="littles-law__item">
                  <span class="littles-law__label">Observed CT</span>
                  <span class="littles-law__val">{{ metrics.avg_cycle_time }}d</span>
                </div>
                <span class="littles-law__op">≈</span>
                <div class="littles-law__item">
                  <span class="littles-law__label">Predicted CT</span>
                  <span class="littles-law__val">{{ littlesLawPrediction }}d</span>
                </div>
                <span class="littles-law__detail">
                  ({{ metrics.current_wip }} WIP ÷ {{ metrics.throughput_per_day.toFixed(2) }}/day)
                </span>
              </div>
              <div class="littles-law__insight">
                <el-icon><component :is="littlesLawDiff < 20 ? SuccessFilled : WarningFilled" /></el-icon>
                {{ littlesLawInsight }}
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card shadow="never">
            <template #header>
              <div class="card-header">
                <span>Flow Health</span>
              </div>
            </template>
            <div class="flow-health-grid">
              <div class="flow-health-item">
                <span class="flow-health-item__label">Cycle Time</span>
                <span class="flow-health-item__value">{{ metrics.avg_cycle_time }}d</span>
                <el-tag :type="ctHealthType" size="small" effect="plain">{{ ctHealthLabel }}</el-tag>
              </div>
              <div class="flow-health-item">
                <span class="flow-health-item__label">Throughput</span>
                <span class="flow-health-item__value">{{ metrics.throughput_per_week.toFixed(1) }}/wk</span>
                <el-tag :type="tpHealthType" size="small" effect="plain">{{ tpHealthLabel }}</el-tag>
              </div>
              <div class="flow-health-item">
                <span class="flow-health-item__label">WIP Level</span>
                <span class="flow-health-item__value">{{ metrics.current_wip }} items</span>
                <el-tag :type="wipHealthType" size="small" effect="plain">{{ wipHealthLabel }}</el-tag>
              </div>
              <div class="flow-health-item">
                <span class="flow-health-item__label">Predictability</span>
                <span class="flow-health-item__value">{{ metrics.predictability }}%</span>
                <el-tag :type="predHealthType" size="small" effect="plain">{{ predHealthLabel }}</el-tag>
              </div>
              <div class="flow-health-item">
                <span class="flow-health-item__label">Flow Efficiency</span>
                <span class="flow-health-item__value">{{ metrics.flow_efficiency }}%</span>
                <el-tag type="info" size="small" effect="plain">estimated</el-tag>
              </div>
              <div class="flow-health-item">
                <span class="flow-health-item__label">Arrival vs Departure</span>
                <span class="flow-health-item__value">
                  {{ metrics.arrival_rate_per_week.toFixed(1) }} → {{ metrics.throughput_per_week.toFixed(1) }}/wk
                </span>
                <el-tag :type="arrivalExceedsDeparture ? 'warning' : 'success'" size="small" effect="plain">
                  {{ arrivalExceedsDeparture ? 'Accumulating' : 'Stable' }}
                </el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </template>
  </div>
</template>

<script setup lang="ts" name="dashAnalyticsEfficiency">
import { ref, computed, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";
import { Refresh, SuccessFilled, WarningFilled } from "@element-plus/icons-vue";
import KpiCard from "@/components/analytics/KpiCard.vue";
import DateRangePicker from "@/components/analytics/DateRangePicker.vue";
import CycleTimeHistogram from "@/components/analytics/CycleTimeHistogram.vue";
import CumulativeFlowDiagram from "@/components/analytics/CumulativeFlowDiagram.vue";
import ThroughputChart from "@/components/analytics/ThroughputChart.vue";
import WipAgingChart from "@/components/analytics/WipAgingChart.vue";
import BottleneckAnalysis from "@/components/analytics/BottleneckAnalysis.vue";
import ControlChart from "@/components/analytics/ControlChart.vue";
import { getEfficiencyMetrics } from "@/api/modules/analyticsService";
import type { DateRange, EfficiencyMetrics } from "@/types/analytics";

const DEFAULT_METRICS: EfficiencyMetrics = {
  avg_cycle_time: 0, cycle_time_p50: 0, cycle_time_p80: 0, cycle_time_p95: 0,
  cycle_time_std: 0, cycle_time_cv: 0, cycle_time_ucl: 0, cycle_time_lcl: 0,
  cycle_time_histogram: {}, cycle_time_source: "estimated",
  avg_lead_time: 0, lead_time_p50: 0, lead_time_p80: 0, lead_time_p95: 0,
  lead_time_std: 0, lead_time_cv: 0, lead_time_histogram: {},
  throughput: 0, throughput_per_day: 0, throughput_per_week: 0,
  throughput_std: 0, throughput_cv: 0, velocity_per_week: 0, arrival_rate_per_week: 0,
  current_wip: 0, total_issues: 0, done_count: 0,
  wip_breakdown: {}, wip_aging: {},
  wip_age_p50: 0, wip_age_p85: 0, wip_age_p95: 0,
  flow_efficiency: 0, flow_efficiency_confidence: "estimated", predictability: 0,
  cfd: [], cfd_confidence: "estimated", weekly_throughput: [],
  cycle_time_trend: [], lead_time_trend: [],
  control_chart: [], bottlenecks: [],
  trends: { cycle_time_pct: null, throughput_pct: null, wip_pct: null }
};

const loading = ref(false);
const error = ref("");
const hasData = ref(false);
const isFirstLoad = ref(true);
const dateRange = ref<DateRange>({ start: "", end: "" });
const metrics = ref<EfficiencyMetrics>({ ...DEFAULT_METRICS });
const lastFetchTime = ref(0);
const refreshInterval = ref(30);
let refreshTimer: ReturnType<typeof setInterval> | null = null;
let initialFetchDone = false;

// ── Visibility API for smart polling ──
const pageVisible = ref(true);
function handleVisibility() {
  pageVisible.value = document.visibilityState === "visible";
  if (pageVisible.value && refreshInterval.value > 0) {
    startAutoRefresh();
  } else if (!pageVisible.value && refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// ── Data presence ──
const hasCtHistogram = computed(() => Object.keys(metrics.value.cycle_time_histogram).length > 0);
const hasWipAging = computed(() => Object.keys(metrics.value.wip_aging).length > 0);
const doneCount = computed(() => metrics.value.done_count || 0);
const totalIssues = computed(() => metrics.value.total_issues || 0);

// ── Sparklines ──
const cycleTimeSparkline = computed(() =>
  metrics.value.cycle_time_trend.map(d => d.p50)
);
const throughputSparkline = computed(() =>
  metrics.value.weekly_throughput.map(d => d.count)
);

// ── Trend values & directions ──
const cycleTimeTrendVal = computed(() => {
  const t = metrics.value.trends.cycle_time_pct;
  return t == null ? undefined : Math.abs(t);
});
const cycleTimeTrendDir = computed<"up" | "down" | "neutral">(() => {
  const t = metrics.value.trends.cycle_time_pct;
  if (t == null) return "neutral";
  return t > 0 ? "down" : t < 0 ? "up" : "neutral";
});
const throughputTrendVal = computed(() => {
  const t = metrics.value.trends.throughput_pct;
  return t == null ? undefined : Math.abs(t);
});
const throughputTrendDir = computed<"up" | "down" | "neutral">(() => {
  const t = metrics.value.trends.throughput_pct;
  if (t == null) return "neutral";
  return t > 0 ? "up" : t < 0 ? "down" : "neutral";
});
const wipTrendVal = computed(() => {
  const t = metrics.value.trends.wip_pct;
  return t == null ? undefined : Math.abs(t);
});
const wipTrendDir = computed<"up" | "down" | "neutral">(() => {
  const t = metrics.value.trends.wip_pct;
  if (t == null) return "neutral";
  return t > 0 ? "down" : t < 0 ? "up" : "neutral";
});

// ── Freshness ──
const POLL_MS = 30_000;
const freshnessState = computed(() => {
  if (!lastFetchTime.value) return "offline";
  const age = (Date.now() - lastFetchTime.value) / 1000;
  if (refreshInterval.value === 0) return "paused";
  if (age < POLL_MS / 1000 + 10) return "live";
  if (age < POLL_MS / 1000 * 3) return "stale";
  return "offline";
});
const freshnessLabel = computed(() => {
  if (!lastFetchTime.value) return "No data";
  const age = Math.round((Date.now() - lastFetchTime.value) / 1000);
  if (refreshInterval.value === 0) return "Paused";
  if (age < 60) return "Live";
  return `Updated ${dayjs(lastFetchTime.value).format("HH:mm:ss")}`;
});

// ── Chart metadata ──
const cfdDayCount = computed(() => metrics.value.cfd.length);
const wipStatusCount = computed(() => Object.keys(metrics.value.wip_breakdown).length);
const bottleneckCount = computed(() =>
  metrics.value.bottlenecks.filter(b => b.is_bottleneck).length
);

// ── Weekly throughput stats ──
const avgWeeklyThroughput = computed(() => {
  const data = metrics.value.weekly_throughput;
  if (!data.length) return 0;
  return data.reduce((s, d) => s + d.count, 0) / data.length;
});
const weeklyStdDev = computed(() => {
  const data = metrics.value.weekly_throughput;
  if (data.length < 2) return 0;
  const avg = avgWeeklyThroughput.value;
  return Math.sqrt(data.reduce((s, d) => s + (d.count - avg) ** 2, 0) / data.length);
});

// ── Stale WIP ──
const staleWipCount = computed(() => {
  const aging = metrics.value.wip_aging;
  return (aging["14–30d"] ?? 0) + (aging[">30d"] ?? 0) + (aging["7–14d"] ?? 0);
});

// ── Little's Law ──
const littlesLawPrediction = computed(() => {
  if (metrics.value.throughput_per_day <= 0) return 0;
  return (metrics.value.current_wip / metrics.value.throughput_per_day).toFixed(1);
});
const littlesLawDiff = computed(() => {
  const predicted = parseFloat(littlesLawPrediction.value as string);
  if (predicted <= 0) return 0;
  return Math.abs(metrics.value.avg_cycle_time - predicted) / predicted * 100;
});
const littlesLawInsight = computed(() => {
  const obs = metrics.value.avg_cycle_time;
  const pred = parseFloat(littlesLawPrediction.value as string);
  if (pred <= 0) return "Insufficient throughput data to validate Little's Law.";
  const diff = obs - pred;
  if (Math.abs(diff) < 0.5) return "Observed and predicted cycle times are closely aligned — system is stable.";
  if (diff > 0) return `Observed CT ${diff.toFixed(1)}d higher than predicted. Aging WIP or blocked items may inflate averages.`;
  return `Observed CT ${Math.abs(diff).toFixed(1)}d lower than predicted. Team may be prioritizing smaller items.`;
});

// ── Flow metrics ──
const arrivalExceedsDeparture = computed(() =>
  metrics.value.arrival_rate_per_week > metrics.value.throughput_per_week + 0.5
);
const arrivalDepartureLabel = computed(() => {
  const arr = metrics.value.arrival_rate_per_week;
  const dep = metrics.value.throughput_per_week;
  if (arr > dep + 0.5) return `+${(arr - dep).toFixed(1)}/wk accumulating`;
  if (dep > arr + 0.5) return `${(dep - arr).toFixed(1)}/wk burning down`;
  return "Balanced";
});
const completionRate = computed(() => {
  if (metrics.value.total_issues <= 0) return 0;
  return ((metrics.value.done_count / metrics.value.total_issues) * 100).toFixed(0);
});
const dataPeriodDays = computed(() => metrics.value.cfd.length || 0);

// ── Predictability ──
const predictabilityLabel = computed(() => {
  const p = metrics.value.predictability;
  if (p >= 70) return "Consistent delivery";
  if (p >= 40) return "Some variability";
  return "High variability";
});

// ── Control chart ──
const controlChartInfo = computed(() => {
  const n = metrics.value.control_chart.length;
  if (n < 5) return `Low sample (${n})`;
  const outliers = metrics.value.control_chart.filter(
    d => d.cycle_time > metrics.value.cycle_time_ucl
  ).length;
  if (outliers > 0) return `${outliers} points above UCL`;
  return null;
});
const controlChartInfoType = computed(() => {
  if (!controlChartInfo.value) return "info";
  return controlChartInfo.value.includes("above UCL") ? "danger" : "warning";
});

// ── Flow health tags ──
const ctHealthType = computed(() => metrics.value.avg_cycle_time <= 5 ? "success" : metrics.value.avg_cycle_time <= 14 ? "warning" : "danger");
const ctHealthLabel = computed(() => metrics.value.avg_cycle_time <= 5 ? "Healthy" : metrics.value.avg_cycle_time <= 14 ? "Moderate" : "Slow");
const tpHealthType = computed(() => metrics.value.throughput_per_week >= 5 ? "success" : metrics.value.throughput_per_week >= 2 ? "warning" : "danger");
const tpHealthLabel = computed(() => metrics.value.throughput_per_week >= 5 ? "High" : metrics.value.throughput_per_week >= 2 ? "Moderate" : "Low");
const wipHealthType = computed(() => metrics.value.current_wip <= 15 ? "success" : metrics.value.current_wip <= 30 ? "warning" : "danger");
const wipHealthLabel = computed(() => metrics.value.current_wip <= 15 ? "Healthy" : metrics.value.current_wip <= 30 ? "Elevated" : "Overloaded");
const predHealthType = computed(() => metrics.value.predictability >= 70 ? "success" : metrics.value.predictability >= 40 ? "warning" : "danger");
const predHealthLabel = computed(() => metrics.value.predictability >= 70 ? "Consistent" : metrics.value.predictability >= 40 ? "Variable" : "Erratic");

// ── Data fetching ──
function onDateChange(range: DateRange) {
  dateRange.value = range;
  if (initialFetchDone) fetchData();
}

async function fetchData() {
  loading.value = true;
  error.value = "";
  try {
    const res = await getEfficiencyMetrics({ dateRange: dateRange.value });
    if (res.code === 0 && res.data) {
      metrics.value = res.data;
      hasData.value = true;
      lastFetchTime.value = Date.now();
    } else {
      error.value = res.message || "Failed to load efficiency metrics";
    }
  } catch (err: any) {
    error.value = err?.message || "Network error — check if YiAi is running on :10086";
  } finally {
    loading.value = false;
    isFirstLoad.value = false;
  }
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  if (refreshInterval.value > 0 && pageVisible.value) {
    refreshTimer = setInterval(fetchData, refreshInterval.value * 1000);
  }
}

onMounted(() => {
  fetchData();
  initialFetchDone = true;
  startAutoRefresh();
  document.addEventListener("visibilitychange", handleVisibility);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  document.removeEventListener("visibilitychange", handleVisibility);
});
</script>

<style scoped lang="scss">
.efficiency-page {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  &__left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  // h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; }

  &__title-row {
    display: flex;
    align-items: center;
    gap: 10px;

    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
}

// ── Freshness dot ──
.freshness-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;

  &--live {
    background: #67c23a;
    box-shadow: 0 0 6px rgba(103, 194, 58, 0.6);
    animation: pulse 2s infinite;
  }
  &--stale { background: #e6a23c; }
  &--offline { background: #f56c6c; }
  &--paused { background: #909399; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.freshness-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__stat {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);

    &--mono {
      font-family: "SF Mono", "Fira Code", monospace;
    }
  }
}

.mb16 { margin-bottom: 16px; }
.mb20 { margin-bottom: 20px; }

.text-muted {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

// ── Little's Law ──
.littles-law {
  display: flex;
  flex-direction: column;
  gap: 12px;
  &__formula { text-align: center; }
  &__eq {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-color-primary);
    font-family: "SF Mono", "Fira Code", monospace;
  }
  &__calc {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  &__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
  &__label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
  }
  &__val {
    font-size: 20px;
    font-weight: 600;
    font-family: "SF Mono", "Fira Code", monospace;
  }
  &__op { font-size: 16px; color: var(--el-text-color-secondary); }
  &__detail { font-size: 12px; color: var(--el-text-color-placeholder); }
  &__insight {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    background: var(--el-fill-color-light);
    border-radius: 6px;
    .el-icon { margin-top: 2px; flex-shrink: 0; }
  }
}

// ── Flow Health Grid ──
.flow-health-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.flow-health-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;

  &__label {
    width: 130px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }

  &__value {
    flex: 1;
    font-size: 14px;
    font-weight: 500;
    font-family: "SF Mono", "Fira Code", monospace;
  }
}
</style>