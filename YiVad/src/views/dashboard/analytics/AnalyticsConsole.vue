<template>
  <div class="analytics-console page">
    <!-- Header -->
    <header class="console-header">
      <div class="console-header__title">
        <h1>Analytics Console</h1>
        <div class="health-chip" :class="healthClass">
          <span class="health-chip__score">{{ healthScore }}</span>
          <span class="health-chip__label">Health</span>
        </div>
        <p class="text-muted">
          <template v-if="dataPeriod">{{ dataPeriod }}</template>
          <template v-else>Real-time metrics across all projects</template>
          <span v-if="freshnessLabel" class="data-freshness" :class="`data-freshness--${freshnessClass}`">
            &middot; {{ freshnessLabel }}
          </span>
        </p>
      </div>
      <div class="console-header__controls">
        <el-select
          v-model="selectedProject" placeholder="All Projects" size="small"
          clearable style="width: 180px" @change="fetchAll"
        >
          <el-option label="All Projects" value="" />
          <el-option v-for="p in projectOptions" :key="p.key" :label="p.name" :value="p.key" />
        </el-select>
        <DateRangePicker @change="onDateChange" />
        <el-button
          :type="polling ? 'primary' : 'default'"
          :icon="polling ? VideoPause : VideoPlay"
          size="small" plain @click="togglePolling"
        >
          {{ polling ? 'Live' : 'Paused' }}
        </el-button>
        <el-button :icon="Refresh" size="small" @click="fetchAll" :loading="loading">Refresh</el-button>
        <el-tag v-if="!isFirstLoad" :type="dataFreshness.type" size="small" effect="plain">
          {{ dataFreshness.label }}
        </el-tag>
        <span v-if="lastUpdated" class="last-updated">Updated {{ lastUpdated }}</span>
      </div>
    </header>

    <!-- Error -->
    <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb16">
      <template #default><el-button size="small" @click="fetchAll">Retry</el-button></template>
    </el-alert>

    <!-- Skeleton Loading -->
    <template v-if="isFirstLoad && loading">
      <el-row :gutter="12" class="mb16">
        <el-col v-for="i in 5" :key="i" :xs="12" :sm="6" :md="4" :lg="2.4">
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
      <el-row :gutter="12" class="mb16">
        <el-col :span="8">
          <el-skeleton animated><template #template><el-skeleton-item variant="rect" style="height:320px" /></template></el-skeleton>
        </el-col>
        <el-col :span="16">
          <el-skeleton animated><template #template><el-skeleton-item variant="rect" style="height:320px" /></template></el-skeleton>
        </el-col>
      </el-row>
      <el-row :gutter="12" class="mb16">
        <el-col v-for="i in 3" :key="i" :span="8">
          <el-skeleton animated><template #template><el-skeleton-item variant="rect" style="height:280px" /></template></el-skeleton>
        </el-col>
      </el-row>
    </template>

    <!-- Content -->
    <template v-else>
      <!-- Executive Summary KPI Strip -->
      <div class="kpi-strip">
        <div class="kpi-strip__item">
          <KpiCard
            label="Quality Score"
            :value="qualityScore"
            :trend="Math.abs(qualityTrendDelta)"
            :trend-direction="qualityTrendDirection"
            :threshold="{ good: 80, warn: 60 }"
            tooltip="Multi-dimensional quality score (0-100). Bug rate, rework, severity, MTTR, SLA."
          />
        </div>
        <div class="kpi-strip__item">
          <KpiCard
            label="Open Bugs"
            :value="openBugCount"
            :trend="Math.abs(bugCountTrend)"
            :trend-direction="bugCountTrend > 0 ? 'down' : 'up'"
            :threshold="{ good: 10, warn: 30 }"
            :inverted="true"
            :sparkline="sparkBugTrend"
            tooltip="Total open and in-progress bugs. Lower is better."
          />
        </div>
        <div class="kpi-strip__item">
          <KpiCard
            label="Throughput"
            :value="totalThroughput"
            :trend="Math.abs(throughputTrend ?? 0)"
            :trend-direction="(throughputTrend ?? 0) >= 0 ? 'up' : 'down'"
            :sparkline="sparkThroughput"
            tooltip="Total completed issues in the current period."
          />
        </div>
        <div class="kpi-strip__item">
          <KpiCard
            label="Cycle Time P50"
            :value="cycleTimeP50"
            unit="d"
            :trend="Math.abs(cycleTimeTrendPct ?? 0)"
            :trend-direction="(cycleTimeTrendPct ?? 0) <= 0 ? 'up' : 'down'"
            :threshold="{ good: 3, warn: 7 }"
            :inverted="true"
            :sparkline="sparkCycleTime"
            tooltip="Median time from first commit to merge. Lower is better."
          />
        </div>
        <div class="kpi-strip__item">
          <KpiCard
            label="Lead Time P50"
            :value="leadTimeP50"
            unit="d"
            :threshold="{ good: 5, warn: 14 }"
            :inverted="true"
            tooltip="Median time from creation to delivery. Includes wait/idle time."
          />
        </div>
        <div class="kpi-strip__item">
          <KpiCard
            label="Flow Efficiency"
            :value="flowEfficiency"
            unit="%"
            format="percent"
            :threshold="{ good: 60, warn: 30 }"
            tooltip="Ratio of active work time to total elapsed time."
          />
        </div>
        <div class="kpi-strip__item">
          <KpiCard
            label="Predictability"
            :value="predictability"
            unit="%"
            format="percent"
            :threshold="{ good: 70, warn: 50 }"
            tooltip="Process stability (1 - CV). Higher means more predictable delivery."
          />
        </div>
      </div>

      <!-- Attention Required -->
      <AttentionPanel
        :critical-open="criticalOpen"
        :unassigned-open="unassignedOpen"
        :stale-open="staleOpen"
        :recent-activity="recentActivity"
        :resolution-velocity="resolutionVelocity"
        :completeness="completeness"
      />

      <!-- Key Insights -->
      <InsightsBar
        :quality-trend-delta="qualityTrendDelta"
        :quality-trend-direction="qualityTrendDirection"
        :critical-open="criticalOpen"
        :unassigned-open="unassignedOpen"
        :stale-open="staleOpen"
        :flow-efficiency="flowEfficiency"
        :wip-count="currentWip"
        :cycle-time-p50="cycleTimeP50"
        :cycle-time-p95="cycleTimeP95"
        :cycle-time-ucl="cycleTimeUcl"
        :cycle-time-cv="cycleTimeCv"
        :sla-compliance="slaCompliance"
        :predictability="predictability"
        :completeness-score="dataCompletenessScore"
        :bug-net-change="bugNetChange"
      />

      <!-- ── Quality Section ── -->
      <div class="section-divider" @click="showQuality = !showQuality" style="cursor:pointer">
        <span class="section-divider__toggle">{{ showQuality ? '▾' : '▸' }}</span>
        <span class="section-divider__label">Quality</span>
        <span class="section-divider__stats">
          Score {{ qualityScore }} &middot; {{ openBugCount }} open &middot; MTTR {{ mttrHours }}h &middot; SLA {{ slaCompliance }}%
        </span>
        <span class="section-divider__line" />
      </div>
      <template v-show="showQuality">
      <el-row :gutter="12">
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Quality Score</span>
              <span v-if="qualityTrendLabel" class="card-badge" :class="`card-badge--${qualityTrendClass}`">
                {{ qualityTrendLabel }}
              </span>
            </template>
            <QualityGauge :score="qualityScore" :prev-score="prevQualityScore" :breakdown="scoreBreakdown" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="10" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Net Flow</span>
              <span v-if="bugNetChange != null" class="card-badge" :class="bugNetChange <= 0 ? 'card-badge--good' : 'card-badge--warn'">
                {{ bugNetChange <= 0 ? 'Draining' : `Accumulating +${bugNetChange}` }}
              </span>
            </template>
            <NetFlowChart v-if="hasInflowData" :data="inflowOutflow" />
            <el-empty v-else description="No inflow/outflow data" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="6" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">MTTR Trend</span>
              <span class="card-subtitle">{{ mttrHours }}h avg</span>
            </template>
            <MttrTrendChart v-if="hasMttrData" :data="mttrTrend" :target-hours="24" />
            <el-empty v-else description="No MTTR data" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Row 2: Bug Analysis -->
      <el-row :gutter="12">
        <el-col :xs="24" :md="10" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <el-tabs v-model="trendTab" class="card-tabs">
                <el-tab-pane label="Bug Trend" name="bug" />
                <el-tab-pane label="Rework Trend" name="rework" />
              </el-tabs>
            </template>
            <BugRateChart v-if="trendTab === 'bug'" :data="bugTrend" color="#f56c6c" />
            <ReworkRateChart v-else :data="reworkTrend" />
          </el-card>
        </el-col>
        <el-col :xs="12" :md="7" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="card-title">Bug Severity</span></template>
            <SeverityDonut v-if="hasSeverityData" :data="severityDist" />
            <el-empty v-else description="No severity data" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="12" :md="7" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="card-title">Bug Status</span></template>
            <StatusBreakdown v-if="hasBugStatusData" :data="bugStatusBreakdown" />
            <el-empty v-else description="No bug status data" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
      </template>

      <!-- ── Flow Section ── -->
      <div class="section-divider" @click="showFlow = !showFlow" style="cursor:pointer">
        <span class="section-divider__toggle">{{ showFlow ? '▾' : '▸' }}</span>
        <span class="section-divider__label">Flow</span>
        <span class="section-divider__stats">
          CT P50 {{ cycleTimeP50 }}d &middot; LT P50 {{ leadTimeP50 }}d &middot; Throughput {{ totalThroughput }} &middot; Eff. {{ flowEfficiency }}%
        </span>
        <span class="section-divider__line" />
      </div>
      <template v-show="showFlow">

      <!-- Row 3: Lead Time + Flow -->
      <el-row :gutter="12">
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Lead Time Trend</span>
              <span class="card-subtitle" v-if="leadTimeP50">P50={{ leadTimeP50 }}d P80={{ leadTimeP80 }}d P95={{ leadTimeP95 }}d</span>
            </template>
            <LeadTimeChart v-if="hasLeadTimeData" :data="leadTimeTrend" :show-legend="false" />
            <el-empty v-else description="Insufficient data for lead time analysis" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="card-title">Bug Age Distribution</span></template>
            <BugAgeChart v-if="hasBugAgeData" :data="bugAgeDist" />
            <el-empty v-else description="No age data" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Weekly Throughput</span>
              <span class="card-subtitle">Arrival {{ arrivalRate }}/wk &middot; Velocity {{ velocityPerWeek }}/wk</span>
            </template>
            <ThroughputChart v-if="weeklyThroughput.length" :data="weeklyThroughput" />
            <el-empty v-else description="No throughput data" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Row 4: Cycle Time Scatterplot + Defect Density -->
      <el-row :gutter="12">
        <el-col :xs="24" :md="12" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Cycle Time Scatterplot</span>
              <span class="card-subtitle" v-if="cycleTimeP50">P50={{ cycleTimeP50 }}d P80={{ cycleTimeP80 }}d P95={{ cycleTimeP95 }}d</span>
            </template>
            <CycleTimeScatterplot
              v-if="hasScatterplotData"
              :data="controlChart"
              :p50="cycleTimeP50"
              :p80="cycleTimeP80"
              :p95="cycleTimeP95"
            />
            <el-empty v-else description="Insufficient data for cycle time analysis" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header><span class="card-title">Defect Density by Module</span></template>
            <DefectDensityHeatmap v-if="defectDensity.length" :data="defectDensity" />
            <el-empty v-else description="No defect data" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>
      </template>

      <!-- ── Engineering Section ── -->
      <div class="section-divider" @click="showEngineering = !showEngineering" style="cursor:pointer">
        <span class="section-divider__toggle">{{ showEngineering ? '▾' : '▸' }}</span>
        <span class="section-divider__label">Engineering</span>
        <span class="section-divider__stats">
          {{ moduleQuality.length }} modules &middot; {{ criticalOpen }} critical &middot; Data {{ dataCompletenessScore }}%
        </span>
        <span class="section-divider__line" />
      </div>
      <template v-show="showEngineering">

      <!-- Row 5: Module Quality + MTTR -->
      <el-row :gutter="12">
        <el-col :xs="24" :md="12" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Module Quality Ranking</span>
              <span class="card-subtitle" v-if="moduleQuality.length">{{ moduleQuality.length }} modules</span>
            </template>
            <ModuleQualityTable v-if="hasModuleQualityData" :data="moduleQuality" />
            <el-empty v-else description="No module quality data" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">MTTR by Severity</span>
              <span class="card-subtitle">Resolution time with SLA targets</span>
            </template>
            <MttrBySeverityChart v-if="hasMttrBySeverityData" :data="mttrBySeverity" />
            <el-empty v-else description="No MTTR data by severity" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <!-- Row 6: Flow Metrics -->
      <div class="mb16">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">Flow Analytics</span>
            <span class="card-subtitle">Little's Law, Flow Debt, WIP Aging, Predictability</span>
          </template>
          <FlowMetricsRow
            :wip-count="currentWip"
            :cycle-time-p50="cycleTimeP50"
            :wip-age-p50="wipAgeP50"
            :wip-age-p85="wipAgeP85"
            :wip-age-p95="wipAgeP95"
            :flow-efficiency="flowEfficiency"
            :flow-confidence="flowConfidence"
            :throughput-per-week="throughputPerWeek"
            :cycle-time-std="cycleTimeStd"
            :cycle-time-cv="cycleTimeCv"
            :cycle-time-ucl="cycleTimeUcl"
          />
        </el-card>
      </div>

      <!-- Row 7: WIP Aging + Cycle Time Histogram + Data Quality -->
      <el-row :gutter="12">
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">WIP Aging</span>
              <span v-if="currentWip" class="card-subtitle">{{ currentWip }} items in progress</span>
            </template>
            <WipAgingChart v-if="hasWipAgingData" :data="wipAging" />
            <el-empty v-else description="No WIP aging data" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Cycle Time Histogram</span>
              <span v-if="doneCount" class="card-subtitle">{{ doneCount }} completed</span>
            </template>
            <CycleTimeHistogram v-if="hasCycleTimeHistogramData" :data="cycleTimeHistogram" />
            <el-empty v-else description="No cycle time data" :image-size="80" />
          </el-card>
        </el-col>
        <el-col :xs="24" :md="8" class="mb16">
          <el-card shadow="never" class="chart-card">
            <template #header>
              <span class="card-title">Data Quality</span>
              <span class="card-subtitle">Bug field completeness</span>
            </template>
            <DataQualityPanel :completeness="completeness" />
          </el-card>
        </el-col>
      </el-row>
      </template>

      <!-- Advanced: CFD + Bottleneck (collapsible) -->
      <el-card shadow="never" class="mb16 chart-card">
        <template #header>
          <span class="card-title">Advanced Analysis</span>
          <el-button text size="small" @click="showAdvanced = !showAdvanced">
            {{ showAdvanced ? 'Collapse' : 'Expand' }}
          </el-button>
        </template>
        <template v-if="showAdvanced">
          <el-row :gutter="12">
            <el-col :span="24">
              <h4 class="section-subtitle">Period Comparison</h4>
              <PeriodComparisonTable v-if="comparisonRows.length" :rows="comparisonRows" />
              <el-empty v-else description="No comparison data" :image-size="60" />
            </el-col>
          </el-row>
          <el-row :gutter="12" style="margin-top: 16px">
            <el-col :xs="24" :md="14">
              <h4 class="section-subtitle">Cumulative Flow Diagram</h4>
              <CumulativeFlowDiagram v-if="cfdData.length" :data="cfdData" />
              <el-empty v-else description="No CFD data" :image-size="80" />
            </el-col>
            <el-col :xs="24" :md="10">
              <h4 class="section-subtitle">Bottleneck Analysis</h4>
              <BottleneckAnalysis v-if="bottlenecks.length" :data="bottlenecks" />
              <el-empty v-else description="No bottleneck data" :image-size="80" />
            </el-col>
          </el-row>
          <el-row :gutter="12" style="margin-top: 16px">
            <el-col :span="24">
              <h4 class="section-subtitle">Control Chart (SPC)</h4>
              <ControlChart
                v-if="hasControlChartData"
                :data="controlChart"
                :ucl="cycleTimeUcl"
                :lcl="cycleTimeLcl"
                :mean="avgCycleTime"
              />
              <el-empty v-else description="No control chart data" :image-size="80" />
            </el-col>
          </el-row>
        </template>
      </el-card>

      <!-- File Alerts Summary -->
      <el-card v-if="fileAlerts?.alerts.length" shadow="never" class="mb16 chart-card">
        <template #header>
          <span class="card-title">File Health Alerts</span>
          <span class="card-subtitle">{{ fileAlerts.summary.total }} items across knowledge, data, and code</span>
        </template>
        <div class="console-alerts-strip">
          <span v-if="fileAlerts.summary.critical" class="console-alert-chip console-alert-chip--critical">
            {{ fileAlerts.summary.critical }} critical
          </span>
          <span v-if="fileAlerts.summary.warning" class="console-alert-chip console-alert-chip--warning">
            {{ fileAlerts.summary.warning }} warnings
          </span>
          <span
v-for="a in fileAlerts.alerts.slice(0, 4)" :key="a.title"
            class="console-alert-chip" :class="`console-alert-chip--${a.severity}`"
          >
            <span class="console-alert-chip__domain">{{ a.domain }}</span>
            {{ a.title }}
            <span class="console-alert-chip__count">{{ a.count }}</span>
          </span>
        </div>
      </el-card>

      <!-- Summary & Actions -->
      <el-card shadow="never" class="mb16 chart-card">
        <template #header>
          <span class="card-title">Summary &amp; Actions</span>
          <span class="card-subtitle">Auto-generated analysis and recommendations</span>
        </template>
        <SummaryActions
          :health-score="healthScore"
          :quality-score="qualityScore"
          :quality-trend-delta="qualityTrendDelta"
          :predictability="predictability"
          :sla-compliance="slaCompliance"
          :flow-efficiency="flowEfficiency"
          :cycle-time-p50="cycleTimeP50"
          :cycle-time-p95="cycleTimeP95"
          :cycle-time-ucl="cycleTimeUcl"
          :cycle-time-cv="cycleTimeCv"
          :critical-open="criticalOpen"
          :unassigned-open="unassignedOpen"
          :stale-open="staleOpen"
          :wip-count="currentWip"
          :bug-net-change="bugNetChange"
          :throughput-per-week="throughputPerWeek"
          :arrival-rate="arrivalRate"
          :completeness-score="dataCompletenessScore"
          :mttr-hours="mttrHours"
        />
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts" name="dashAnalyticsConsole">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { Refresh, VideoPlay, VideoPause } from "@element-plus/icons-vue";
import KpiCard from "@/components/analytics/KpiCard.vue";
import DateRangePicker from "@/components/analytics/DateRangePicker.vue";
import QualityGauge from "@/components/analytics/QualityGauge.vue";
import ThroughputChart from "@/components/analytics/ThroughputChart.vue";
import DefectDensityHeatmap from "@/components/analytics/DefectDensityHeatmap.vue";
import BugRateChart from "@/components/analytics/BugRateChart.vue";
import ReworkRateChart from "@/components/analytics/ReworkRateChart.vue";
import SeverityDonut from "@/components/analytics/SeverityDonut.vue";
import BugAgeChart from "@/components/analytics/BugAgeChart.vue";
import StatusBreakdown from "@/components/analytics/StatusBreakdown.vue";
import CycleTimeHistogram from "@/components/analytics/CycleTimeHistogram.vue";
import WipAgingChart from "@/components/analytics/WipAgingChart.vue";
import CumulativeFlowDiagram from "@/components/analytics/CumulativeFlowDiagram.vue";
import BottleneckAnalysis from "@/components/analytics/BottleneckAnalysis.vue";
import MttrTrendChart from "@/components/analytics/MttrTrendChart.vue";
import LeadTimeChart from "@/components/analytics/LeadTimeChart.vue";
import ModuleQualityTable from "@/components/analytics/ModuleQualityTable.vue";
import MttrBySeverityChart from "@/components/analytics/MttrBySeverityChart.vue";
import ControlChart from "@/components/analytics/ControlChart.vue";
import AttentionPanel from "@/components/analytics/AttentionPanel.vue";
import DataQualityPanel from "@/components/analytics/DataQualityPanel.vue";
import CycleTimeScatterplot from "@/components/analytics/CycleTimeScatterplot.vue";
import NetFlowChart from "@/components/analytics/NetFlowChart.vue";
import FlowMetricsRow from "@/components/analytics/FlowMetricsRow.vue";
import InsightsBar from "@/components/analytics/InsightsBar.vue";
import PeriodComparisonTable from "@/components/analytics/PeriodComparisonTable.vue";
import SummaryActions from "@/components/analytics/SummaryActions.vue";
import { getConsoleMetrics, getFileAlerts } from "@/api/modules/analyticsService";
import { useProjectStore } from "@/stores/modules/project";
import type {
  DateRange, TrendDataPoint, SeverityDistribution,
  BugStatusBreakdown, BugAgeDistribution, ThroughputData, InflowOutflowData,
  FileAlertsResponse, ModuleQuality, QualityScoreBreakdown, PeriodComparison,
} from "@/types/analytics";

const POLL_INTERVAL = 30_000;

const loading = ref(false);
const error = ref("");
const lastUpdated = ref("");
const lastFetchTime = ref(0);
const isFirstLoad = ref(true);
const polling = ref(true);
const showAdvanced = ref(false);
const showQuality = ref(true);
const showFlow = ref(true);
const showEngineering = ref(true);
const fileAlerts = ref<FileAlertsResponse | null>(null);
const selectedProject = ref("");
const dateRange = ref<DateRange>({ start: "", end: "" });
const dataPeriod = ref("");
const trendTab = ref("bug");

// Quality
const qualityScore = ref(0);
const prevQualityScore = ref(0);
const qualityTrendDelta = ref(0);
const qualityTrendDirection = ref<"up" | "down" | "neutral">("neutral");
const qualityTrendLabel = ref("");
const scoreBreakdown = ref<QualityScoreBreakdown>({ bug_rate_score: 0, rework_score: 0, severity_score: 0, mttr_score: 0, sla_score: 0 });
const severityDist = ref<SeverityDistribution>({ critical: 0, major: 0, minor: 0, trivial: 0 });
const bugStatusBreakdown = ref<BugStatusBreakdown>({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
const bugAgeDist = ref<BugAgeDistribution>({ lt_1d: 0, "1_3d": 0, "3_7d": 0, "7_30d": 0, gt_30d: 0 });
const bugTrend = ref<TrendDataPoint[]>([]);
const reworkTrend = ref<TrendDataPoint[]>([]);
const defectDensity = ref<{ module: string; bugs: number }[]>([]);
const bugCountTrend = ref(0);
const bugRate = ref(0);
const inflowOutflow = ref<InflowOutflowData>({ inflow: [], outflow: [] });
const mttrHours = ref(0);
const mttrTrend = ref<TrendDataPoint[]>([]);
const slaCompliance = ref(0);
const resolvedCount = ref(0);
const freshnessLabel = ref("");
const freshnessClass = ref("");
const prevPeriod = ref<PeriodComparison | null>(null);

// Efficiency
const wipBreakdown = ref<Record<string, number>>({});
const weeklyThroughput = ref<ThroughputData[]>([]);
const cycleTimeTrend = ref<{ label: string; p50: number; p80: number; p95: number }[]>([]);
const cycleTimeP50 = ref(0);
const cycleTimeP80 = ref(0);
const cycleTimeP95 = ref(0);
const cfdData = ref<any[]>([]);
const bottlenecks = ref<any[]>([]);
const flowEfficiency = ref(0);
const cycleTimeHistogram = ref<Record<string, number>>({});
const wipAging = ref<Record<string, number>>({});
const doneCount = ref(0);
const throughputTrend = ref<number | null>(null);
const cycleTimeTrendPct = ref<number | null>(null);
const wipTrend = ref<number | null>(null);

// Lead time
const leadTimeP50 = ref(0);
const leadTimeP80 = ref(0);
const leadTimeP95 = ref(0);
const leadTimeTrend = ref<{ label: string; p50: number; p80: number; p95: number }[]>([]);

// Predictability & process
const predictability = ref(0);
const arrivalRate = ref(0);
const velocityPerWeek = ref(0);

// Module quality
const moduleQuality = ref<ModuleQuality[]>([]);

// MTTR by severity
const mttrBySeverity = ref<Record<string, number>>({});

// Attention metrics
const criticalOpen = ref(0);
const unassignedOpen = ref(0);
const staleOpen = ref(0);
const recentActivity = ref({ created_24h: 0, resolved_24h: 0 });
const resolutionVelocity = ref(0);

// Data quality
const completeness = ref<{
  total: number;
  description_pct: number;
  assignee_pct: number;
  environment_pct: number;
  fixedVersion_pct: number;
} | null>(null);

// Control chart
const controlChart = ref<any[]>([]);
const cycleTimeUcl = ref(0);
const cycleTimeLcl = ref(0);
const avgCycleTime = ref(0);

// Flow analytics
const wipAgeP50 = ref(0);
const wipAgeP85 = ref(0);
const wipAgeP95 = ref(0);
const flowConfidence = ref("estimated");
const cycleTimeStd = ref(0);
const cycleTimeCv = ref(0);
const throughputPerWeek = ref(0);

const projectStore = useProjectStore();
const projectOptions = computed(() => projectStore.projects);

const pollSeconds = computed(() => POLL_INTERVAL / 1000);

const hasSeverityData = computed(() => Object.values(severityDist.value).some(v => v > 0));
const hasBugStatusData = computed(() => Object.values(bugStatusBreakdown.value).some(v => v > 0));
const hasBugAgeData = computed(() => Object.values(bugAgeDist.value).some(v => v > 0));
const hasWipAgingData = computed(() => Object.values(wipAging.value).some(v => v > 0));
const hasCycleTimeHistogramData = computed(() => Object.values(cycleTimeHistogram.value).some(v => v > 0));
const hasInflowData = computed(() => inflowOutflow.value.inflow.length > 0);
const hasMttrData = computed(() => mttrTrend.value.some(d => d.value > 0));
const hasControlChartData = computed(() => controlChart.value.length > 0);
const hasModuleQualityData = computed(() => moduleQuality.value.length > 0);
const hasMttrBySeverityData = computed(() => Object.keys(mttrBySeverity.value).length > 0);
const hasLeadTimeData = computed(() => leadTimeTrend.value.length > 0);
const hasScatterplotData = computed(() => controlChart.value.length > 0);
const dataCompletenessScore = computed(() => {
  const c = completeness.value;
  if (!c) return 0;
  return Math.round((c.description_pct + c.assignee_pct + c.environment_pct + c.fixedVersion_pct) / 4);
});

const comparisonRows = computed(() => {
  const prev = prevPeriod.value;
  const rows: any[] = [];

  // Quality metrics
  if (prev) {
    const bugCount = (bugStatusBreakdown.value.open || 0) + (bugStatusBreakdown.value.in_progress || 0);
    const prevBugCount = prev.bug_count ?? 0;
    rows.push({
      icon: "🐛", metric: "Open Bugs",
      current: String(bugCount),
      previous: String(prevBugCount),
      changePct: prevBugCount ? Math.round((bugCount - prevBugCount) / prevBugCount * 100) : null,
      inverted: true,
    });
    rows.push({
      icon: "📊", metric: "Bug Rate",
      current: `${bugRate.value}%`,
      previous: `${prev.bug_rate ?? 0}%`,
      changePct: prev.bug_rate ? Math.round((bugRate.value - prev.bug_rate) / prev.bug_rate * 100 * 10) / 10 : null,
      inverted: true,
    });
    rows.push({
      icon: "🔄", metric: "Rework Rate",
      current: `${(qReworkRate.value).toFixed(1)}%`,
      previous: `${prev.rework_rate ?? 0}%`,
      changePct: prev.rework_rate ? Math.round(((qReworkRate.value) - prev.rework_rate) / prev.rework_rate * 100 * 10) / 10 : null,
      inverted: true,
    });
    rows.push({
      icon: "⏱", metric: "SLA Compliance",
      current: `${slaCompliance.value}%`,
      previous: `${prev.sla_compliance ?? 0}%`,
      changePct: prev.sla_compliance ? Math.round((slaCompliance.value - prev.sla_compliance) / prev.sla_compliance * 100 * 10) / 10 : null,
      inverted: false,
    });
  }

  // Efficiency metrics from trends
  rows.push({
    icon: "🏎", metric: "Cycle Time P50",
    current: `${cycleTimeP50.value}d`,
    previous: cycleTimeTrendPct.value != null ? `${Math.round(cycleTimeP50.value / (1 + cycleTimeTrendPct.value / 100) * 10) / 10}d` : "—",
    changePct: cycleTimeTrendPct.value != null ? -cycleTimeTrendPct.value : null,
    inverted: true,
  });
  rows.push({
    icon: "📦", metric: "Throughput",
    current: String(totalThroughput.value),
    previous: throughputTrend.value != null ? String(Math.round(totalThroughput.value / (1 + throughputTrend.value / 100))) : "—",
    changePct: throughputTrend.value,
    inverted: false,
  });
  rows.push({
    icon: "🔄", metric: "WIP Count",
    current: String(currentWip.value),
    previous: wipTrend.value != null ? String(Math.round(currentWip.value / (1 + wipTrend.value / 100))) : "—",
    changePct: wipTrend.value != null ? -wipTrend.value : null,
    inverted: true,
  });

  return rows;
});

const qReworkRate = computed(() => {
  const prev = prevPeriod.value;
  return prev?.rework_rate ?? 0;
});

const totalThroughput = computed(() => weeklyThroughput.value.reduce((s, w) => s + w.count, 0));
const currentWip = computed(() => Object.values(wipBreakdown.value).reduce((s, v) => s + v, 0));
const openBugCount = computed(() =>
  (bugStatusBreakdown.value.open || 0) + (bugStatusBreakdown.value.in_progress || 0)
);
const bugNetChange = computed(() => {
  if (!inflowOutflow.value.inflow.length) return null;
  const totalIn = inflowOutflow.value.inflow.reduce((s, d) => s + d.value, 0);
  const totalOut = inflowOutflow.value.outflow.reduce((s, d) => s + d.value, 0);
  return totalIn - totalOut;
});

const qualityTrendClass = computed(() => {
  if (qualityTrendDelta.value > 2) return "good";
  if (qualityTrendDelta.value < -2) return "bad";
  return "neutral";
});

const sparkBugTrend = computed(() => bugTrend.value.map(d => d.value));
const sparkThroughput = computed(() => weeklyThroughput.value.slice(-8).map(d => d.count));
const sparkCycleTime = computed(() => cycleTimeTrend.value.map(d => d.p50));

const healthScore = computed(() => {
  const score = qualityScore.value * 0.5 + predictability.value * 0.3 + slaCompliance.value * 0.2;
  return Math.round(score);
});

const healthClass = computed(() => {
  if (healthScore.value >= 80) return "health--good";
  if (healthScore.value >= 60) return "health--warn";
  return "health--bad";
});

const dataFreshness = computed(() => {
  if (!lastFetchTime.value) return { type: "info" as const, label: "Waiting" };
  const age = (Date.now() - lastFetchTime.value) / 1000;
  if (age < POLL_INTERVAL / 1000 + 5) return { type: "success" as const, label: "Live" };
  if (age < POLL_INTERVAL / 1000 * 3) return { type: "warning" as const, label: "Stale" };
  return { type: "danger" as const, label: "Offline" };
});

let pollTimer: ReturnType<typeof setInterval> | null = null;

function togglePolling() { polling.value = !polling.value; }
function onDateChange(range: DateRange) { dateRange.value = range; fetchAll(); }

function buildParams() {
  const params: Record<string, any> = {};
  if (dateRange.value.start) params.dateRange = dateRange.value;
  if (selectedProject.value) params.project_key = selectedProject.value;
  return params;
}

function trendPct(current: number, previous: number): number {
  if (!previous) return 0;
  return parseFloat(((current - previous) / previous * 100).toFixed(1));
}

async function fetchAll() {
  loading.value = true;
  error.value = "";
  try {
    const res = await getConsoleMetrics(buildParams());

    const e = res.efficiency;
    const q = res.quality;

    // Efficiency
    wipBreakdown.value = e.wip_breakdown ?? {};
    weeklyThroughput.value = e.weekly_throughput ?? [];
    cycleTimeTrend.value = e.cycle_time_trend ?? [];
    cycleTimeP50.value = e.cycle_time_p50 ?? 0;
    cycleTimeP80.value = e.cycle_time_p80 ?? 0;
    cycleTimeP95.value = e.cycle_time_p95 ?? 0;
    cfdData.value = e.cfd ?? [];
    bottlenecks.value = e.bottlenecks ?? [];
    doneCount.value = e.done_count ?? 0;
    flowEfficiency.value = e.flow_efficiency ?? 0;
    cycleTimeHistogram.value = e.cycle_time_histogram ?? {};
    wipAging.value = e.wip_aging ?? {};

    // Lead time
    leadTimeP50.value = e.lead_time_p50 ?? 0;
    leadTimeP80.value = e.lead_time_p80 ?? 0;
    leadTimeP95.value = e.lead_time_p95 ?? 0;
    leadTimeTrend.value = e.lead_time_trend ?? [];

    // Predictability & process
    predictability.value = e.predictability ?? 0;
    arrivalRate.value = e.arrival_rate_per_week ?? 0;
    velocityPerWeek.value = e.velocity_per_week ?? 0;
    avgCycleTime.value = e.avg_cycle_time ?? 0;
    cycleTimeUcl.value = e.cycle_time_ucl ?? 0;
    cycleTimeLcl.value = e.cycle_time_lcl ?? 0;

    // Control chart
    controlChart.value = e.control_chart ?? [];

    // Flow analytics
    wipAgeP50.value = e.wip_age_p50 ?? 0;
    wipAgeP85.value = e.wip_age_p85 ?? 0;
    wipAgeP95.value = e.wip_age_p95 ?? 0;
    flowConfidence.value = e.flow_efficiency_confidence ?? "estimated";
    cycleTimeStd.value = e.cycle_time_std ?? 0;
    cycleTimeCv.value = e.cycle_time_cv ?? 0;
    throughputPerWeek.value = e.throughput_per_week ?? 0;

    const et = e.trends ?? {};
    throughputTrend.value = et.throughput_pct ?? null;
    cycleTimeTrendPct.value = et.cycle_time_pct ?? null;
    wipTrend.value = et.wip_pct ?? null;

    // Quality
    qualityScore.value = q.quality_score ?? 0;
    scoreBreakdown.value = q.quality_score_breakdown ?? { bug_rate_score: 0, rework_score: 0, severity_score: 0, mttr_score: 0, sla_score: 0 };
    severityDist.value = q.severity_distribution ?? { critical: 0, major: 0, minor: 0, trivial: 0 };
    bugStatusBreakdown.value = q.status_breakdown ?? { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    bugAgeDist.value = q.bug_age_distribution ?? { lt_1d: 0, "1_3d": 0, "3_7d": 0, "7_30d": 0, gt_30d: 0 };
    bugTrend.value = (q.bug_trend ?? []) as TrendDataPoint[];
    reworkTrend.value = (q.rework_trend ?? []) as TrendDataPoint[];
    defectDensity.value = q.defect_density ?? [];
    bugRate.value = q.bug_rate ?? 0;
    inflowOutflow.value = q.inflow_outflow ?? { inflow: [], outflow: [] };
    mttrHours.value = q.mttr_hours ?? 0;
    mttrTrend.value = q.mttr_trend ?? [];
    slaCompliance.value = q.sla_compliance ?? 0;
    resolvedCount.value = q.resolved_count ?? 0;

    // Module quality & MTTR by severity
    moduleQuality.value = q.module_quality ?? [];
    mttrBySeverity.value = q.mttr_by_severity ?? {};

    // Attention metrics
    criticalOpen.value = q.critical_open ?? 0;
    unassignedOpen.value = q.unassigned_open ?? 0;
    staleOpen.value = q.stale_open ?? 0;
    recentActivity.value = q.recent_activity ?? { created_24h: 0, resolved_24h: 0 };
    resolutionVelocity.value = q.resolution_velocity ?? 0;

    // Data quality
    completeness.value = (q.completeness as any) ?? null;

    // Quality trend
    qualityTrendDelta.value = q.trend_delta ?? 0;
    qualityTrendDirection.value = qualityTrendDelta.value > 2 ? "up" : qualityTrendDelta.value < -2 ? "down" : "neutral";
    qualityTrendLabel.value = qualityTrendDelta.value > 0 ? `+${qualityTrendDelta.value}` : `${qualityTrendDelta.value}`;
    prevQualityScore.value = qualityScore.value - qualityTrendDelta.value;

    // Period comparison for bug count trend
    const prev = q.prev_period;
    if (prev) {
      bugCountTrend.value = trendPct(q.bug_count ?? 0, prev.bug_count ?? 0);
      prevPeriod.value = prev as PeriodComparison;
    }

    // Freshness
    if (q.freshness_seconds != null) {
      const secs = q.freshness_seconds;
      if (secs < 300) { freshnessLabel.value = "Data live"; freshnessClass.value = "live"; }
      else if (secs < 3600) { freshnessLabel.value = `Updated ${Math.round(secs / 60)}m ago`; freshnessClass.value = "recent"; }
      else { freshnessLabel.value = `Updated ${Math.round(secs / 3600)}h ago`; freshnessClass.value = "stale"; }
    }

    // Period
    if (q.period) dataPeriod.value = `${q.period.start} ~ ${q.period.end}`;

    // Fetch file alerts (best-effort, non-blocking)
    getFileAlerts().then(r => { fileAlerts.value = r; }).catch(() => {});

    lastUpdated.value = new Date().toLocaleTimeString();
    lastFetchTime.value = Date.now();
    isFirstLoad.value = false;
  } catch (err: any) {
    error.value = err?.message || "Failed to load analytics data";
  } finally {
    loading.value = false;
  }
}

watch(polling, (val) => {
  if (val) {
    pollTimer = setInterval(fetchAll, POLL_INTERVAL);
  } else {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
  }
});

onMounted(async () => {
  await projectStore.fetchProjects({ pageSize: 100 });
  fetchAll();
  if (polling.value) pollTimer = setInterval(fetchAll, POLL_INTERVAL);
});

onUnmounted(() => {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
});
</script>

<style scoped lang="scss">
.analytics-console {
  padding: 20px;
  background: var(--el-bg-color-page);
  min-height: 100%;
}

.console-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-bg-color) 100%);
  border-radius: 12px;
  border: 1px solid var(--el-border-color-lighter);

  &__title {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 700;
    }
  }

  &__controls {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
  }
}

.data-freshness {
  font-size: 12px;
  &--live { color: #67c23a; }
  &--recent { color: var(--el-text-color-secondary); }
  &--stale { color: #e6a23c; }
}

// Health chip
.health-chip {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-left: 16px;
  flex-shrink: 0;

  &.health--good { background: rgba(103, 194, 58, 0.12); }
  &.health--warn { background: rgba(230, 162, 60, 0.12); }
  &.health--bad  { background: rgba(245, 108, 108, 0.12); }

  &__score {
    font-size: 20px;
    font-weight: 800;
    line-height: 1;

    .health--good & { color: #389e0d; }
    .health--warn & { color: #d46b08; }
    .health--bad  & { color: #cf1322; }
  }

  &__label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-top: 1px;

    .health--good & { color: #389e0d; }
    .health--warn & { color: #d46b08; }
    .health--bad  & { color: #cf1322; }
  }
}

.last-updated {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.kpi-strip {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 12px;

  @media (max-width: 1400px) { grid-template-columns: repeat(4, 1fr); }
  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}

.chart-card {
  border-radius: 8px;
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 2px 12px rgb(0 0 0 / 6%); }

  :deep(.el-card__header) {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  :deep(.el-card__body) { padding: 12px 16px; }
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.card-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 10px;

  &--good { background: #e8f5e9; color: #4caf50; }
  &--bad { background: #fde8e8; color: #e53935; }
  &--warn { background: #fff3e0; color: #ef6c00; }
  &--neutral { background: var(--el-fill-color-light); color: var(--el-text-color-secondary); }
}

.card-subtitle {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-weight: normal;
}

.card-tabs {
  margin: -10px 0 -18px;
  :deep(.el-tabs__header) { margin-bottom: 0; }
  :deep(.el-tabs__nav-wrap::after) { height: 1px; }
}

.section-subtitle {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
}

.mb16 { margin-bottom: 12px; }

.text-muted {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

// Section dividers
.section-divider {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 20px 0 12px;
  user-select: none;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.8;
  }

  &__toggle {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    flex-shrink: 0;
    width: 14px;
    text-align: center;
  }

  &__label {
    font-size: 12px;
    font-weight: 700;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 1px;
    flex-shrink: 0;
  }

  &__stats {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__line {
    flex: 1;
    height: 1px;
    background: var(--el-border-color-lighter);
  }

  &:first-of-type {
    margin-top: 4px;
  }
}

// ── Alerts strip ──
.console-alerts-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.console-alert-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;

  &--critical {
    background: rgba(245,108,108,.1);
    color: #f56c6c;
  }
  &--warning {
    background: rgba(230,162,60,.1);
    color: #e6a23c;
  }
  &--info {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
  }

  &__domain {
    text-transform: uppercase;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.3px;
    padding: 1px 4px;
    border-radius: 3px;
    background: rgba(0,0,0,.06);
  }

  &__count {
    font-weight: 700;
    min-width: 16px;
    text-align: center;
  }
}
</style>
