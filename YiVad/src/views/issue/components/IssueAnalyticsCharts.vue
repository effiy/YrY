<template>
  <div class="issue-list__charts">
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.status }">
      <div class="issue-chart__title">
        Status
        <span v-if="activeFilter.status" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="statusDonutOption" height="200" @chart-click="onChartClick('status', $event)" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.priority }">
      <div class="issue-chart__title">
        Priority
        <span v-if="activeFilter.priority" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="priorityBarOption" height="200" @chart-click="onChartClick('priority', $event)" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.issue_type }">
      <div class="issue-chart__title">
        Type
        <span v-if="activeFilter.issue_type" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="typeBarOption" height="200" @chart-click="onChartClick('issue_type', $event)" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.assignee }">
      <div class="issue-chart__title">
        Assignee
        <span v-if="activeFilter.assignee" class="issue-chart__badge">filtered</span>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="assigneeBarOption" height="200" @chart-click="onChartClick('assignee', $event)" />
      </div>
    </div>
    <div class="issue-chart">
      <div class="issue-chart__title">Created · 14d</div>
      <div class="issue-chart__body"><ECharts :option="trendOption" height="200" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ECharts } from "@/components";
import type { ECOption } from "@/components";

interface ActiveFilter {
  status?: string;
  priority?: string;
  issue_type?: string;
  assignee?: string;
}

defineProps<{
  activeFilter: ActiveFilter;
  statusDonutOption: ECOption;
  priorityBarOption: ECOption;
  typeBarOption: ECOption;
  assigneeBarOption: ECOption;
  trendOption: ECOption;
}>();

const emit = defineEmits<{
  (e: "chart-click", dim: "status" | "priority" | "issue_type" | "assignee", event: { name?: string }): void;
}>();

function onChartClick(dim: "status" | "priority" | "issue_type" | "assignee", event: { name?: string }) {
  emit("chart-click", dim, event);
}
</script>

<style scoped lang="scss">
.issue-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.issue-chart {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}
.issue-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}
.issue-chart__title {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  flex-shrink: 0;
}
.issue-chart__badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  text-transform: none;
}
.issue-chart__body {
  flex: 1;
  min-height: 0;
  padding: 8px;
}
</style>
