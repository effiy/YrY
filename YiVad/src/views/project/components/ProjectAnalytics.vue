<template>
  <section class="pan-box">
    <header class="pan-head">
      <button type="button" class="pan-toggle" @click="emit('update:expanded', !expanded)">
        <el-icon class="pan-caret" :class="{ 'is-open': expanded }"><CaretRight /></el-icon>
        <span class="pan-title">Analytics</span>
      </button>
      <span class="pan-hint">{{
        expanded
          ? "Click any segment to filter the projects below"
          : `${totalIssues} issues across ${projectCount} projects${dateLabel ? ` · due ${dateLabel}` : ""}`
      }}</span>
    </header>

    <div v-show="expanded" class="pan-body">
      <!-- Health summary strip -->
      <div v-if="healthCounts" class="pan-health-strip">
        <div class="pan-health-bar">
          <div
            class="pan-health-seg pan-health-seg--good"
            :style="{ flex: healthCounts.good || 0.01 }"
            :title="`${healthCounts.good} healthy`"
          />
          <div
            class="pan-health-seg pan-health-seg--warn"
            :style="{ flex: healthCounts.warn || 0.01 }"
            :title="`${healthCounts.warn} need attention`"
          />
          <div
            class="pan-health-seg pan-health-seg--poor"
            :style="{ flex: healthCounts.poor || 0.01 }"
            :title="`${healthCounts.poor} at risk`"
          />
        </div>
        <div class="pan-health-labels">
          <span class="pan-health-label"><span class="pan-health-dot" style="background:#67c23a" />{{ healthCounts.good }} Healthy</span>
          <span class="pan-health-label"><span class="pan-health-dot" style="background:#e6a23c" />{{ healthCounts.warn }} Warn</span>
          <span class="pan-health-label"><span class="pan-health-dot" style="background:#f56c6c" />{{ healthCounts.poor }} At Risk</span>
        </div>
      </div>

      <div class="pan-grid">
        <div class="pan-chart" :class="{ 'pan-chart--on': dimensionOn('issueStatus') }">
          <div class="pan-chart-title">
            Issue status
            <span v-if="dimensionOn('issueStatus')" class="pan-chart-badge">filtered</span>
          </div>
          <div class="pan-chart-body">
            <ECharts v-if="hasStatuses" :option="statusOption" @chart-click="onClick('issueStatus', $event)" />
            <p v-else class="pan-chart-empty">No issues</p>
          </div>
        </div>

        <div class="pan-chart" :class="{ 'pan-chart--on': dimensionOn('priority') }">
          <div class="pan-chart-title">
            Open by priority
            <span v-if="dimensionOn('priority')" class="pan-chart-badge">filtered</span>
          </div>
          <div class="pan-chart-body">
            <ECharts v-if="hasPriorities" :option="priorityOption" @chart-click="onClick('priority', $event)" />
            <p v-else class="pan-chart-empty">Nothing open</p>
          </div>
        </div>

        <div class="pan-chart" :class="{ 'pan-chart--on': dimensionOn('issueType') }">
          <div class="pan-chart-title">
            Issue type
            <span v-if="dimensionOn('issueType')" class="pan-chart-badge">filtered</span>
          </div>
          <div class="pan-chart-body">
            <ECharts v-if="hasTypes" :option="typeOption" @chart-click="onClick('issueType', $event)" />
            <p v-else class="pan-chart-empty">No issues</p>
          </div>
        </div>

        <div class="pan-chart" :class="{ 'pan-chart--on': dimensionOn('project') }">
          <div class="pan-chart-title">
            Workload by project
            <span v-if="dimensionOn('project')" class="pan-chart-badge">filtered</span>
          </div>
          <div class="pan-chart-body">
            <ECharts v-if="topProjects.length" :option="topProjectsOption" @chart-click="onClick('project', $event)" />
            <p v-else class="pan-chart-empty">No projects</p>
          </div>
        </div>
      </div>

      <div class="pan-chart pan-chart--full">
        <div class="pan-chart-title">Issue activity · last 30 days{{ dateLabel ? ` · due ${dateLabel}` : "" }}</div>
        <div class="pan-chart-body pan-chart-body--short">
          <ECharts :option="activityOption" />
        </div>
      </div>

      <!-- Efficiency section -->
      <template v-if="hasEfficiency">
        <div class="pan-grid" style="margin-top: 12px">
          <div class="pan-chart">
            <div class="pan-chart-title">Cycle time trend (days)</div>
            <div class="pan-chart-body">
              <ECharts :option="cycleTimeTrendOption" />
            </div>
          </div>
          <div class="pan-chart">
            <div class="pan-chart-title">
              Weekly throughput
              <span style="font-weight:400;color:var(--el-text-color-placeholder);margin-left:4px">
                {{ efficiency?.throughput_per_week?.toFixed(1) }}/wk
              </span>
            </div>
            <div class="pan-chart-body">
              <ECharts :option="throughputOption" />
            </div>
          </div>
        </div>
      </template>

      <!-- Quality section -->
      <template v-if="hasQuality">
        <div class="pan-grid" :style="{ marginTop: hasEfficiency ? '0' : '12px' }">
          <div class="pan-chart">
            <div class="pan-chart-title">Bug rate trend (%)</div>
            <div class="pan-chart-body">
              <ECharts :option="bugRateOption" />
            </div>
          </div>
          <div class="pan-chart">
            <div class="pan-chart-title">
              Quality score
              <span style="font-weight:400;color:var(--el-text-color-placeholder);margin-left:4px">
                MTTR {{ quality?.mttr_hours ?? 0 }}h · SLA {{ quality?.sla_compliance ?? 0 }}%
              </span>
            </div>
            <div class="pan-chart-body" style="display:flex;align-items:center;justify-content:center;padding:0 24px">
              <ECharts :option="qualityGaugeOption" style="width:100%;height:80px" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts" name="ProjectAnalytics">
import { computed } from "vue";
import { CaretRight } from "@element-plus/icons-vue";
import type { ECElementEvent } from "echarts/core";
import ECharts from "@/components/ECharts/index.vue";
import {
  buildActivityArea,
  buildPriorityDonut,
  buildStatusBar,
  buildTopProjectsBar,
  buildTypeBar,
  buildCycleTimeTrend,
  buildThroughputBar,
  buildBugRateTrend,
  buildQualityGauge,
  type TopProjectRow
} from "../charts";
import type { EfficiencyMetrics, QualityMetrics } from "@/types/analytics";

const props = defineProps<{
  expanded: boolean;
  statuses: Record<string, number>;
  openPriorities: Record<string, number>;
  types: Record<string, number>;
  topProjects: TopProjectRow[];
  activity: Array<{ date: string; count: number }>;
  activeFilter: Record<string, string>;
  totalIssues: number;
  projectCount: number;
  dateLabel?: string;
  healthCounts?: { good: number; warn: number; poor: number };
  efficiency?: EfficiencyMetrics | null;
  quality?: QualityMetrics | null;
}>();

const emit = defineEmits<{
  (e: "update:expanded", v: boolean): void;
  (e: "filter", dimension: string, rawKey: string): void;
}>();

const hasStatuses = computed(() => Object.values(props.statuses).some(v => v > 0));
const hasPriorities = computed(() => Object.values(props.openPriorities).some(v => v > 0));
const hasTypes = computed(() => Object.values(props.types).some(v => v > 0));

const statusOption = computed(() => buildStatusBar(props.statuses));
const priorityOption = computed(() => buildPriorityDonut(props.openPriorities));
const typeOption = computed(() => buildTypeBar(props.types));
const topProjectsOption = computed(() => buildTopProjectsBar(props.topProjects));
const activityOption = computed(() => buildActivityArea(props.activity));

const hasEfficiency = computed(() => props.efficiency && props.efficiency.total_issues > 0);
const hasQuality = computed(() => props.quality && props.quality.issue_count > 0);
const cycleTimeTrendOption = computed(() =>
  props.efficiency ? buildCycleTimeTrend(props.efficiency.cycle_time_trend) : {}
);
const throughputOption = computed(() =>
  props.efficiency ? buildThroughputBar(props.efficiency.weekly_throughput) : {}
);
const bugRateOption = computed(() =>
  props.quality ? buildBugRateTrend(props.quality.bug_trend) : {}
);
const qualityGaugeOption = computed(() =>
  props.quality ? buildQualityGauge(props.quality.quality_score) : {}
);

function dimensionOn(dimension: string): boolean {
  return dimension in props.activeFilter;
}

/** Every clickable segment carries its raw enum value in `data.rawKey`. */
function onClick(dimension: string, event: ECElementEvent) {
  const raw = (event.data as { rawKey?: string } | undefined)?.rawKey;
  if (raw) emit("filter", dimension, raw);
}
</script>

<style scoped lang="scss">
.pan-box {
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.pan-head {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
}
.pan-toggle {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 0;
  color: var(--el-text-color-primary);
  cursor: pointer;
  background: none;
  border: none;
}
.pan-caret {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  transition: transform 0.18s ease;
  &.is-open {
    transform: rotate(90deg);
  }
}
.pan-title {
  font-size: 14px;
  font-weight: 600;
}
.pan-hint {
  margin-left: auto;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.pan-body {
  padding: 0 14px 14px;
}
.pan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}
.pan-chart {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.pan-chart--on {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
  .pan-chart-title {
    color: var(--el-color-primary);
  }
}
.pan-chart--full {
  margin-top: 12px;
}
.pan-chart-title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-regular);
  letter-spacing: 0.2px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.pan-chart-badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
}
.pan-chart-body {
  height: 178px;
}
.pan-chart-body--short {
  height: 132px;
}
.pan-chart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

/* Health summary strip */
.pan-health-strip {
  margin-bottom: 14px;
  padding: 10px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}
.pan-health-bar {
  display: flex;
  height: 6px;
  overflow: hidden;
  background: var(--el-fill-color);
  border-radius: 3px;
}
.pan-health-seg {
  min-width: 2px;
  transition: flex 0.4s ease;
  &--good {
    background: #67c23a;
  }
  &--warn {
    background: #e6a23c;
  }
  &--poor {
    background: #f56c6c;
  }
}
.pan-health-labels {
  display: flex;
  gap: 16px;
  margin-top: 6px;
}
.pan-health-label {
  display: flex;
  gap: 3px;
  align-items: center;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.pan-health-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
