<template>
  <div class="quality-page page">
    <!-- Header -->
    <header class="page-header">
      <div class="page-header__left">
        <h1>Quality Dashboard</h1>
        <p class="page-header__subtitle">
          {{ metrics.period.start }} → {{ metrics.period.end }}
          <span class="page-header__dot">·</span>
          {{ metrics.issue_count }} issues
          <span class="page-header__dot">·</span>
          {{ metrics.bug_count }} bugs
        </p>
      </div>
      <div class="page-header__actions">
        <div v-if="freshnessLabel" class="freshness-badge" :class="`freshness-badge--${freshnessLevel}`">
          <span class="freshness-badge__dot" />
          {{ freshnessLabel }}
        </div>
        <el-select v-model="refreshInterval" size="small" style="width:110px" @change="startAutoRefresh">
          <el-option label="Auto: 10s" :value="10" />
          <el-option label="Auto: 30s" :value="30" />
          <el-option label="Auto: 60s" :value="60" />
          <el-option label="Manual" :value="0" />
        </el-select>
        <DateRangePicker @change="onDateChange" />
        <el-button :icon="Refresh" size="small" @click="fetchData(true)" :loading="loading">Refresh</el-button>
      </div>
    </header>

    <div v-loading="loading && !hasData" class="quality-page__body">
      <!-- Hero: Quality Score + Trend + Recent Activity -->
      <section class="hero">
        <div class="hero__gauge">
          <div class="hero__gauge-header">
            <span class="hero__label">Quality Score</span>
            <span class="hero__trend" :class="`hero__trend--${trendClass}`">
              <el-icon><component :is="trendIcon" /></el-icon>
              {{ trendText }}
            </span>
          </div>
          <QualityGauge :score="metrics.quality_score" :prev-score="prevQualityScore" />
        </div>
        <div class="hero__realtime">
          <div class="realtime-card">
            <div class="realtime-card__header">Last 24 Hours</div>
            <div class="realtime-card__metrics">
              <div class="realtime-metric">
                <span class="realtime-metric__value" style="color:#f56c6c">{{ recentActivity.created_24h }}</span>
                <span class="realtime-metric__label">New Bugs</span>
              </div>
              <div class="realtime-metric">
                <span class="realtime-metric__value" style="color:#67c23a">{{ recentActivity.resolved_24h }}</span>
                <span class="realtime-metric__label">Resolved</span>
              </div>
              <div class="realtime-metric">
                <span class="realtime-metric__value" :style="{ color: resolutionVelocity > 0 ? '#409eff' : 'var(--el-text-color-secondary)' }">
                  {{ resolutionVelocity }}
                </span>
                <span class="realtime-metric__label">Velocity/day</span>
              </div>
            </div>
          </div>
          <div class="realtime-card">
            <div class="realtime-card__header">Action Items</div>
            <div class="realtime-card__body action-items">
              <div class="action-item" :class="{ 'action-item--danger': criticalOpen > 0 }">
                <span class="action-item__value">{{ criticalOpen }}</span>
                <span class="action-item__label">Critical Open</span>
              </div>
              <div class="action-item" :class="{ 'action-item--warn': unassignedCount > 0 }">
                <span class="action-item__value">{{ unassignedCount }}</span>
                <span class="action-item__label">Unassigned</span>
              </div>
              <div class="action-item" :class="{ 'action-item--warn': staleCount > 0 }">
                <span class="action-item__value">{{ staleCount }}</span>
                <span class="action-item__label">Stale (&gt;30d)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- KPI Row -->
      <section class="kpi-section">
        <KpiCard
          label="Bug Rate"
          :value="metrics.bug_rate"
          unit="%"
          format="percent"
          :trend="bugRateTrend"
          :trend-direction="bugRateTrend !== undefined ? (bugRateTrend > 0 ? 'down' : 'up') : 'neutral'"
          :tooltip="`${metrics.bug_count} bugs / ${metrics.issue_count} issues`"
          :sparkline="bugSparkline"
        />
        <KpiCard
          label="Rework Rate"
          :value="metrics.rework_rate"
          unit="%"
          format="percent"
          :trend="reworkRateTrend"
          :trend-direction="reworkRateTrend !== undefined ? (reworkRateTrend > 0 ? 'down' : 'up') : 'neutral'"
          :tooltip="`${metrics.reopened_count} reopened / ${metrics.issue_count} issues`"
          :sparkline="reworkSparkline"
        />
        <KpiCard
          label="Open Bugs"
          :value="openBugCount"
          unit="bugs"
          :tooltip="openSeverityBreakdown"
        />
        <KpiCard
          label="MTTR"
          :value="avgResolution"
          unit="hours"
          :trend="mttrTrend"
          :trend-direction="mttrTrend !== undefined ? (mttrTrend > 0 ? 'down' : 'up') : 'neutral'"
          :tooltip="`${metrics.resolved_count} resolved`"
          :sparkline="mttrSparkline"
        />
        <KpiCard
          label="SLA Compliance"
          :value="metrics.sla_compliance"
          unit="%"
          format="percent"
          :trend-direction="slaDir"
          :tooltip="`% bugs resolved within SLA target`"
        />
        <KpiCard
          label="Change Fail Rate"
          :value="changeFailureRate"
          unit="%"
          format="percent"
          :trend-direction="changeFailureRate > 10 ? 'down' : 'up'"
          :tooltip="`${metrics.reopened_count} reopened / ${metrics.resolved_count + metrics.reopened_count} fixes`"
        />
      </section>

      <!-- Data Completeness -->
      <section class="charts-row" v-if="completeness.total > 0">
        <div class="chart-card chart-card--full">
          <div class="chart-card__header">
            <span class="chart-card__title">Data Completeness</span>
            <span class="chart-card__stat">{{ completeness.total }} bugs analyzed</span>
          </div>
          <div class="chart-card__body chart-card__body--xs">
            <div class="completeness-grid">
              <div class="comp-item" v-for="field in completenessFields" :key="field.key" :class="`comp-item--${completenessClass(field.pct)}`">
                <div class="comp-item__header">
                  <span class="comp-item__label">{{ field.label }}</span>
                  <span class="comp-item__pct" :style="{ color: completenessColor(field.pct) }">{{ field.pct }}%</span>
                </div>
                <div class="comp-item__bar">
                  <div class="comp-item__fill" :style="{ width: field.pct + '%', background: completenessColor(field.pct) }" />
                </div>
                <span class="comp-item__hint">{{ field.missing }} missing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Flow Analysis: Bug Inflow/Outflow + MTTR Trend -->
      <section class="charts-row">
        <div class="chart-card chart-card--wide">
          <div class="chart-card__header">
            <span class="chart-card__title">Bug Inflow vs Outflow</span>
            <span class="chart-card__stat">{{ flowStats }}</span>
          </div>
          <div class="chart-card__body">
            <BugInflowOutflowChart :data="metrics.inflow_outflow" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card__header">
            <span class="chart-card__title">MTTR Daily Trend</span>
            <span class="chart-card__stat">avg {{ avgResolution }}h</span>
          </div>
          <div class="chart-card__body">
            <MttrTrendChart :data="metrics.mttr_trend" :target-hours="24" />
          </div>
        </div>
      </section>

      <!-- Distributions: Severity + Age + Status -->
      <section class="charts-row charts-row--3col">
        <div class="chart-card">
          <div class="chart-card__header">
            <span class="chart-card__title">Severity Distribution</span>
            <span class="chart-card__stat">{{ totalBugsBySeverity }} bugs</span>
          </div>
          <div class="chart-card__body chart-card__body--sm">
            <SeverityDonut :data="metrics.severity_distribution" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card__header">
            <span class="chart-card__title">Bug Age (Open)</span>
          </div>
          <div class="chart-card__body chart-card__body--sm">
            <BugAgeChart :data="metrics.bug_age_distribution" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card__header">
            <span class="chart-card__title">Status Breakdown</span>
            <span class="chart-card__stat">{{ metrics.bug_count }} total</span>
          </div>
          <div class="chart-card__body chart-card__body--sm">
            <StatusBreakdown :data="metrics.status_breakdown" />
          </div>
        </div>
      </section>

      <!-- MTTR by Severity + Reopen by Module -->
      <section class="charts-row">
        <div class="chart-card">
          <div class="chart-card__header">
            <span class="chart-card__title">MTTR by Severity</span>
            <span class="chart-card__stat">vs SLA target</span>
          </div>
          <div class="chart-card__body chart-card__body--sm">
            <div class="mttr-severity-table">
              <div class="mttr-row mttr-row--header">
                <span class="mttr-cell">Severity</span>
                <span class="mttr-cell">Resolved</span>
                <span class="mttr-cell">SLA Target</span>
              </div>
              <div v-for="sev in severities" :key="sev" class="mttr-row" :class="{ 'mttr-row--violation': mttrBySeverity[sev] > slaTargets[sev] }">
                <span class="mttr-cell mttr-cell--label">{{ sev }}</span>
                <span class="mttr-cell mttr-cell--value">{{ mttrBySeverity[sev] ? formatMttr(mttrBySeverity[sev]) : "—" }}</span>
                <span class="mttr-cell mttr-cell--target">&le; {{ formatMttr(slaTargets[sev]) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chart-card" v-if="reopenByModule.length > 0">
          <div class="chart-card__header">
            <span class="chart-card__title">Reopen by Module</span>
            <span class="chart-card__stat">{{ reopenTotal }} total</span>
          </div>
          <div class="chart-card__body chart-card__body--sm">
            <div class="reopen-list">
              <div v-for="item in reopenByModule" :key="item.module" class="reopen-item">
                <span class="reopen-item__module">{{ item.module }}</span>
                <div class="reopen-item__bar">
                  <div class="reopen-item__fill" :style="{ width: reopenBarPct(item.count) + '%' }" />
                </div>
                <span class="reopen-item__count">{{ item.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Module Quality + Score Breakdown -->
      <section class="charts-row">
        <div class="chart-card chart-card--wide">
          <div class="chart-card__header">
            <span class="chart-card__title">Module Quality</span>
            <span class="chart-card__stat">{{ moduleQuality.length }} modules</span>
          </div>
          <div class="chart-card__body">
            <ModuleQualityTable :data="moduleQuality" />
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-card__header">
            <span class="chart-card__title">Score Breakdown</span>
            <span class="chart-card__stat">Weighted 5-factor</span>
          </div>
          <div class="chart-card__body">
            <ECharts :option="scoreRadarOption" />
          </div>
        </div>
      </section>

      <!-- Defect Density -->
      <section class="charts-row">
        <div class="chart-card chart-card--full">
          <div class="chart-card__header">
            <span class="chart-card__title">Defect Density by Module</span>
            <span class="chart-card__stat">{{ metrics.defect_density.length }} modules</span>
          </div>
          <div class="chart-card__body">
            <DefectDensityHeatmap :data="metrics.defect_density" />
          </div>
        </div>
      </section>

      <!-- Knowledge File Health Alerts -->
      <section class="charts-row">
        <div class="chart-card chart-card--full">
          <div class="chart-card__header">
            <span class="chart-card__title">Knowledge File Health</span>
            <span class="chart-card__stat">Cross-project alerts</span>
          </div>
          <div class="chart-card__body chart-card__body--sm" style="height:auto;max-height:400px;overflow-y:auto">
            <FileHealthAlerts />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts" name="dashAnalyticsQuality">
import { ref, computed, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";
import { Refresh, Top, Bottom, Minus } from "@element-plus/icons-vue";
import KpiCard from "@/components/analytics/KpiCard.vue";
import DateRangePicker from "@/components/analytics/DateRangePicker.vue";
import BugInflowOutflowChart from "@/components/analytics/BugInflowOutflowChart.vue";
import MttrTrendChart from "@/components/analytics/MttrTrendChart.vue";
import DefectDensityHeatmap from "@/components/analytics/DefectDensityHeatmap.vue";
import QualityGauge from "@/components/analytics/QualityGauge.vue";
import SeverityDonut from "@/components/analytics/SeverityDonut.vue";
import BugAgeChart from "@/components/analytics/BugAgeChart.vue";
import StatusBreakdown from "@/components/analytics/StatusBreakdown.vue";
import ModuleQualityTable from "@/components/analytics/ModuleQualityTable.vue";
import FileHealthAlerts from "@/components/analytics/FileHealthAlerts.vue";
import ECharts from "@/components/ECharts/index.vue";
import { getQualityMetrics } from "@/api/modules/analyticsService";
import type { DateRange, QualityMetrics } from "@/types/analytics";
import type { ECOption } from "@/components/ECharts/config";

const DEFAULT_METRICS: QualityMetrics = {
  bug_rate: 0, bug_count: 0, rework_rate: 0, reopened_count: 0, issue_count: 0,
  defect_density: [], quality_score: 0,
  quality_score_breakdown: { bug_rate_score: 0, rework_score: 0, severity_score: 0, mttr_score: 0, sla_score: 0 },
  severity_distribution: { critical: 0, major: 0, minor: 0, trivial: 0 },
  status_breakdown: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
  bug_age_distribution: { lt_1d: 0, "1_3d": 0, "3_7d": 0, "7_30d": 0, gt_30d: 0 },
  avg_resolution_hours: null, resolved_count: 0,
  bug_trend: [], rework_trend: [],
  inflow_outflow: { inflow: [], outflow: [] },
  mttr_hours: 0, mttr_trend: [], sla_compliance: 0,
  prev_period: { bug_count: 0, bug_rate: 0, rework_rate: 0, reopened_count: 0 },
  period: { start: "", end: "" }, generated_at: "",
  freshness_seconds: null, trend_direction: "stable", trend_delta: 0,
  critical_open: 0, module_quality: [],
  recent_activity: { created_24h: 0, resolved_24h: 0 },
  resolution_velocity: 0,
  mttr_by_severity: {},
  reopen_by_module: [],
  unassigned_open: 0,
  stale_open: 0,
  completeness: { total: 0, description_pct: 0, assignee_pct: 0, environment_pct: 0, fixedVersion_pct: 0 }
};

const loading = ref(false);
const hasData = ref(false);
const dateRange = ref<DateRange>({ start: "", end: "" });
const metrics = ref<QualityMetrics>({ ...DEFAULT_METRICS });
const lastUpdated = ref("");
const refreshInterval = ref(0);
let refreshTimer: ReturnType<typeof setInterval> | null = null;

// ── Freshness ──

const freshnessLevel = computed(() => {
  const s = metrics.value.freshness_seconds;
  if (s == null) return "unknown";
  if (s < 300) return "live";
  if (s < 3600) return "recent";
  if (s < 86400) return "stale";
  return "old";
});

const freshnessLabel = computed(() => {
  const s = metrics.value.freshness_seconds;
  if (s == null) return "";
  if (s < 60) return "Live";
  if (s < 300) return `${Math.floor(s / 60)}m ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
});

// ── Trend ──

const trendClass = computed(() => metrics.value.trend_direction ?? "stable");
const trendIcon = computed(() =>
  trendClass.value === "improving" ? Top : trendClass.value === "declining" ? Bottom : Minus
);
const trendText = computed(() => {
  const delta = metrics.value.trend_delta ?? 0;
  if (delta > 0) return `+${delta} pts`;
  if (delta < 0) return `${delta} pts`;
  return "No change";
});

// ── Recent activity ──

const recentActivity = computed(() => metrics.value.recent_activity ?? { created_24h: 0, resolved_24h: 0 });
const resolutionVelocity = computed(() => metrics.value.resolution_velocity ?? 0);
const criticalOpen = computed(() => metrics.value.critical_open ?? 0);
const unassignedCount = computed(() => metrics.value.unassigned_open ?? 0);
const staleCount = computed(() => metrics.value.stale_open ?? 0);
const completeness = computed(() => metrics.value.completeness ?? { total: 0, description_pct: 0, assignee_pct: 0, environment_pct: 0, fixedVersion_pct: 0 });

// ── Computed values (same logic as before) ──

const openBugCount = computed(() =>
  (metrics.value.status_breakdown.open ?? 0) + (metrics.value.status_breakdown.in_progress ?? 0)
);

const avgResolution = computed(() => metrics.value.mttr_hours || (metrics.value.avg_resolution_hours ?? 0));

const changeFailureRate = computed(() => {
  const total = metrics.value.resolved_count + metrics.value.reopened_count;
  if (!total) return 0;
  return +(metrics.value.reopened_count / total * 100).toFixed(1);
});

const bugSparkline = computed(() => metrics.value.bug_trend.map(d => d.value));
const reworkSparkline = computed(() => metrics.value.rework_trend.map(d => d.value));
const mttrSparkline = computed(() => metrics.value.mttr_trend.map(d => d.value));

const openSeverityBreakdown = computed(() => {
  const s = metrics.value.severity_distribution;
  return `Critical:${s.critical ?? 0} Major:${s.major ?? 0} Minor:${s.minor ?? 0} Trivial:${s.trivial ?? 0}`;
});

const totalBugsBySeverity = computed(() => {
  const s = metrics.value.severity_distribution;
  return (s.critical ?? 0) + (s.major ?? 0) + (s.minor ?? 0) + (s.trivial ?? 0);
});

const flowStats = computed(() => {
  const inflow = metrics.value.inflow_outflow.inflow.reduce((s, d) => s + d.value, 0);
  const outflow = metrics.value.inflow_outflow.outflow.reduce((s, d) => s + d.value, 0);
  const net = inflow - outflow;
  const sign = net > 0 ? "+" : "";
  return `in ${inflow} · out ${outflow} · net ${sign}${net}`;
});

const slaDir = computed(() =>
  metrics.value.sla_compliance >= 90 ? "up" : metrics.value.sla_compliance >= 70 ? "neutral" : "down"
);

const prevQualityScore = computed(() => {
  const prev = metrics.value.prev_period;
  if (!prev.bug_rate && !prev.rework_rate) return undefined;
  const s = metrics.value.severity_distribution;
  const critical = s.critical ?? 0;
  const total = ((s.critical ?? 0) + (s.major ?? 0) + (s.minor ?? 0) + (s.trivial ?? 0)) || 1;
  let score = 100.0;
  score -= Math.min(prev.bug_rate * 5, 40);
  score -= Math.min(prev.rework_rate * 3, 30);
  score -= Math.min((critical / total) * 20, 15);
  return Math.round(Math.max(0.0, score) * 10) / 10;
});

const bugRateTrend = computed<number | undefined>(() => {
  const curr = metrics.value.bug_rate;
  const prev = metrics.value.prev_period.bug_rate;
  if (!prev) return undefined;
  return Math.round(((curr - prev) / prev) * 100);
});

const reworkRateTrend = computed<number | undefined>(() => {
  const curr = metrics.value.rework_rate;
  const prev = metrics.value.prev_period.rework_rate;
  if (!prev) return undefined;
  return Math.round(((curr - prev) / prev) * 100);
});

const mttrTrend = computed<number | undefined>(() => {
  if (!metrics.value.mttr_trend.length) return undefined;
  const recent = metrics.value.mttr_trend.slice(-7);
  const vals = recent.map(d => d.value).filter(v => v > 0);
  if (vals.length < 3) return undefined;
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length;
  const curr = metrics.value.mttr_hours || metrics.value.avg_resolution_hours || avg;
  if (!curr || !avg) return undefined;
  return Math.round(((curr - avg) / avg) * 100);
});

const moduleQuality = computed(() => metrics.value.module_quality ?? []);

const completenessFields = computed(() => {
  const c = completeness.value;
  return [
    { key: "description", label: "Description", pct: c.description_pct, missing: c.total - Math.round(c.total * c.description_pct / 100) },
    { key: "assignee", label: "Assignee", pct: c.assignee_pct, missing: c.total - Math.round(c.total * c.assignee_pct / 100) },
    { key: "environment", label: "Environment", pct: c.environment_pct, missing: c.total - Math.round(c.total * c.environment_pct / 100) },
    { key: "fixedVersion", label: "Fixed Version", pct: c.fixedVersion_pct, missing: c.total - Math.round(c.total * c.fixedVersion_pct / 100) },
  ];
});

function completenessColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

function completenessClass(pct: number): string {
  if (pct >= 80) return "good";
  if (pct >= 50) return "warn";
  return "poor";
}

const mttrBySeverity = computed(() => metrics.value.mttr_by_severity ?? {});

const slaTargets: Record<string, number> = { critical: 24, major: 72, minor: 168, trivial: 336 };

function formatMttr(hours: number): string {
  if (hours >= 24) return `${(hours / 24).toFixed(1)}d`;
  return `${hours.toFixed(1)}h`;
}

const severities = ["critical", "major", "minor", "trivial"] as const;

const reopenByModule = computed(() => metrics.value.reopen_by_module ?? []);

const reopenTotal = computed(() => reopenByModule.value.reduce((s, i) => s + i.count, 0));

const reopenMax = computed(() => {
  const max = reopenByModule.value.reduce((m, i) => Math.max(m, i.count), 0);
  return max || 1;
});

function reopenBarPct(count: number): number {
  return Math.round((count / reopenMax.value) * 100);
}

// ── Radar chart for score breakdown ──

const scoreRadarOption = computed<ECOption>(() => {
  const bd = metrics.value.quality_score_breakdown;
  const indicators = [
    { name: "Bug Rate", max: 100 },
    { name: "Rework", max: 100 },
    { name: "Severity", max: 100 },
    { name: "MTTR", max: 100 },
    { name: "SLA", max: 100 }
  ];
  const values = [bd.bug_rate_score, bd.rework_score, bd.severity_score, bd.mttr_score, bd.sla_score];

  return {
    tooltip: { trigger: "item" },
    legend: { bottom: 0, data: ["Current"], textStyle: { fontSize: 12 } },
    radar: {
      center: ["50%", "48%"],
      radius: "65%",
      indicator: indicators,
      axisName: { color: "var(--el-text-color-secondary)", fontSize: 11 }
    },
    series: [{
      type: "radar",
      data: [{
        value: values,
        name: "Current",
        areaStyle: { color: "rgba(64,158,255,0.15)" },
        lineStyle: { color: "#409eff", width: 2 },
        itemStyle: { color: "#409eff" },
        symbol: "circle",
        symbolSize: 5
      }]
    }]
  };
});

// ── Data fetching ──

function onDateChange(range: DateRange) {
  dateRange.value = range;
  fetchData();
}

async function fetchData(manual = false) {
  loading.value = true;
  try {
    const res = await getQualityMetrics({ dateRange: dateRange.value, _nocache: manual } as any);
    if (res.code === 0 && res.data) {
      metrics.value = { ...DEFAULT_METRICS, ...res.data };
      hasData.value = true;
      lastUpdated.value = dayjs().format("HH:mm:ss");
    }
  } finally {
    loading.value = false;
  }
}

function startAutoRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  if (refreshInterval.value > 0) {
    refreshTimer = setInterval(() => fetchData(false), refreshInterval.value * 1000);
  }
}

onMounted(() => {
  fetchData();
  startAutoRefresh();
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<style scoped lang="scss">
.quality-page {
  padding: 24px;
  max-width: 1440px;
  margin: 0 auto;

  &__body {
    min-height: 400px;
  }
}

// ── Header ──

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  &__left h1 {
    margin: 0 0 6px;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.3px;
  }

  &__subtitle {
    margin: 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__dot {
    margin: 0 6px;
    color: var(--el-border-color);
  }

  &__actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }
}

// ── Freshness badge ──

.freshness-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;

  &--live {
    background: rgba(103,194,58,.1);
    color: #67c23a;
  }

  &--recent {
    background: rgba(64,158,255,.1);
    color: #409eff;
  }

  &--stale {
    background: rgba(230,162,60,.1);
    color: #e6a23c;
  }

  &--old, &--unknown {
    background: rgba(144,147,153,.1);
    color: #909399;
  }

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}

// ── Hero ──

.hero {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  &__gauge {
    flex: 1;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    min-height: 320px;
  }

  &__gauge-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__label {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__trend {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 6px;

    &--improving {
      color: #67c23a;
      background: rgba(103,194,58,.08);
    }

    &--declining {
      color: #f56c6c;
      background: rgba(245,108,108,.08);
    }

    &--stable {
      color: var(--el-text-color-secondary);
      background: rgba(144,147,153,.08);
    }
  }

  &__realtime {
    flex: 0 0 300px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
}

// ── Realtime cards ──

.realtime-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  padding: 16px 20px;

  &__header {
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  &__metrics {
    display: flex;
    gap: 16px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
}

.realtime-metric {
  flex: 1;
  text-align: center;

  &__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }
}

.critical-count {
  font-size: 40px;
  font-weight: 800;
  color: var(--el-text-color-secondary);
  line-height: 1.1;

  &--danger {
    color: #f56c6c;
    animation: pulse 2s ease-in-out infinite;
  }
}

.critical-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

// ── KPI section ──

.kpi-section {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 1400px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

// ── Chart cards ──

.charts-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  &--3col {
    .chart-card {
      flex: 1;
    }
  }
}

.chart-card {
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;

  &--wide {
    flex: 1.4;
  }

  &--full {
    flex: none;
    width: 100%;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 0;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__stat {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__body {
    height: 300px;
    padding: 8px 12px 12px;

    &--sm {
      height: 250px;
    }

    &--xs {
      height: auto;
      padding: 12px 20px 16px;
    }
  }
}

// ── Action Items ──

.action-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--el-fill-color-light);

  &--danger {
    background: rgba(245,108,108,.08);
    .action-item__value { color: #f56c6c; }
  }

  &--warn {
    background: rgba(230,162,60,.08);
    .action-item__value { color: #e6a23c; }
  }

  &__value {
    font-size: 20px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
  }

  &__label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// ── Data Completeness ──

.completeness-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
}

.comp-item {
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  &--good { border-left: 3px solid #67c23a; }
  &--warn { border-left: 3px solid #e6a23c; }
  &--poor { border-left: 3px solid #f56c6c; }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  &__pct {
    font-size: 16px;
    font-weight: 700;
  }

  &__bar {
    height: 6px;
    background: var(--el-fill-color);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 4px;
  }

  &__fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.4s ease;
  }

  &__hint {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}

// ── MTTR by Severity ──

.mttr-severity-table {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.mttr-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;

  &--header {
    .mttr-cell {
      font-size: 11px;
      font-weight: 600;
      color: var(--el-text-color-placeholder);
      text-transform: uppercase;
    }
  }

  &--violation {
    background: rgba(245,108,108,.06);
    .mttr-cell--value { color: #f56c6c; font-weight: 700; }
  }
}

.mttr-cell {
  font-size: 13px;
  color: var(--el-text-color-primary);

  &--label {
    text-transform: capitalize;
    font-weight: 500;
  }

  &--value {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }

  &--target {
    color: var(--el-text-color-placeholder);
    font-size: 12px;
  }
}

// ── Reopen by Module ──

.reopen-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reopen-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 4px;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &__module {
    min-width: 80px;
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__bar {
    flex: 1;
    height: 8px;
    background: var(--el-fill-color);
    border-radius: 4px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    background: #e6a23c;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  &__count {
    min-width: 24px;
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-secondary);
    text-align: right;
  }
}

// ── Responsive stack ──

@media (max-width: 1100px) {
  .hero {
    flex-direction: column;
    &__realtime {
      flex: none;
      flex-direction: row;
      .realtime-card {
        flex: 1;
      }
    }
  }
  .charts-row {
    flex-direction: column;
    .chart-card--wide {
      flex: none;
    }
  }
}
</style>