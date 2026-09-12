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
  type TopProjectRow
} from "../charts";

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
</style>
