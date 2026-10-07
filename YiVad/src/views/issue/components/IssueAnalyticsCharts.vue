<template>
  <div class="issue-list__charts">
    <div v-if="hasActiveFilter" class="issue-charts__filter-bar">
      <span class="issue-charts__filter-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
      </span>
      <span class="issue-charts__filter-label">Active filters:</span>
      <span v-if="activeFilter.status" class="issue-charts__filter-chip">
        Status: {{ statusLabel(activeFilter.status) }}
        <button class="issue-charts__filter-chip-close" @click.stop="emit('clear-filter', 'status')">&times;</button>
      </span>
      <span v-if="activeFilter.priority" class="issue-charts__filter-chip">
        Priority: {{ priorityLabel(activeFilter.priority) }}
        <button class="issue-charts__filter-chip-close" @click.stop="emit('clear-filter', 'priority')">&times;</button>
      </span>
      <span v-if="activeFilter.issue_type" class="issue-charts__filter-chip">
        Type: {{ typeLabel(activeFilter.issue_type) }}
        <button class="issue-charts__filter-chip-close" @click.stop="emit('clear-filter', 'issue_type')">&times;</button>
      </span>
      <span v-if="activeFilter.assignee" class="issue-charts__filter-chip">
        Assignee: {{ activeFilter.assignee }}
        <button class="issue-charts__filter-chip-close" @click.stop="emit('clear-filter', 'assignee')">&times;</button>
      </span>
      <span class="issue-charts__filter-meta">{{ filteredCount }} of {{ totalCount }} issues</span>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.status }">
      <div class="issue-chart__title">
        Status
        <button
          v-if="activeFilter.status"
          class="issue-chart__badge issue-chart__badge--clear"
          title="Clear status filter"
          @click.stop="emit('clear-filter', 'status')"
        >filtered &times;</button>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="statusDonutOption" height="200" @chart-click="onChartClick('status', $event)" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.priority }">
      <div class="issue-chart__title">
        Priority
        <button
          v-if="activeFilter.priority"
          class="issue-chart__badge issue-chart__badge--clear"
          title="Clear priority filter"
          @click.stop="emit('clear-filter', 'priority')"
        >filtered &times;</button>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="priorityBarOption" height="200" @chart-click="onChartClick('priority', $event)" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.issue_type }">
      <div class="issue-chart__title">
        Type
        <button
          v-if="activeFilter.issue_type"
          class="issue-chart__badge issue-chart__badge--clear"
          title="Clear type filter"
          @click.stop="emit('clear-filter', 'issue_type')"
        >filtered &times;</button>
      </div>
      <div class="issue-chart__body">
        <ECharts :option="typeBarOption" height="200" @chart-click="onChartClick('issue_type', $event)" />
      </div>
    </div>
    <div class="issue-chart" :class="{ 'issue-chart--active': activeFilter.assignee }">
      <div class="issue-chart__title">
        Assignee
        <button
          v-if="activeFilter.assignee"
          class="issue-chart__badge issue-chart__badge--clear"
          title="Clear assignee filter"
          @click.stop="emit('clear-filter', 'assignee')"
        >filtered &times;</button>
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
import { ISSUE_STATUS_MAP, ISSUE_PRIORITY_MAP, ISSUE_TYPE_MAP } from "@/api/modules/issueService";
import type { IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";

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
  hasActiveFilter?: boolean;
  filteredCount?: number;
  totalCount?: number;
}>();

const statusLabel = (s: string) => ISSUE_STATUS_MAP[s as IssueStatus] || s;
const priorityLabel = (p: string) => ISSUE_PRIORITY_MAP[p as IssuePriority] || p;
const typeLabel = (t: string) => ISSUE_TYPE_MAP[t as IssueType] || t;

const emit = defineEmits<{
  (e: "chart-click", dim: "status" | "priority" | "issue_type" | "assignee", event: { name?: string }): void;
  (e: "clear-filter", dim: "status" | "priority" | "issue_type" | "assignee"): void;
}>();

function onChartClick(dim: "status" | "priority" | "issue_type" | "assignee", event: { name?: string }) {
  emit("chart-click", dim, event);
}
</script>

<style scoped lang="scss">
/* ── Filter context bar ── */
.issue-charts__filter-bar {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 8px;
}
.issue-charts__filter-icon {
  display: flex;
  align-items: center;
  color: var(--el-color-primary);
}
.issue-charts__filter-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--el-color-primary);
}
.issue-charts__filter-chip {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 1px 8px;
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  background: var(--el-color-primary);
  border-radius: 10px;
}
.issue-charts__filter-chip-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  padding: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  cursor: pointer;
  background: none;
  border: none;
  border-radius: 50%;
  opacity: 0.75;
  transition: opacity 0.15s;
  &:hover {
    opacity: 1;
  }
}
.issue-charts__filter-meta {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-primary);
}

.issue-list__charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
}
.issue-chart {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  transition: all 0.2s;
  &:hover {
    border-color: var(--el-border-color-lighter);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
  }
}
.issue-chart--active {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
  &:hover {
    border-color: var(--el-color-primary);
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%), 0 0 0 1px var(--el-color-primary-light-5);
  }
}
.issue-chart__title {
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  align-items: center;
  padding: 9px 14px;
  font-size: 11px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.issue-chart__badge {
  padding: 0 5px;
  font-size: 9px;
  font-weight: 600;
  line-height: 15px;
  color: var(--el-color-primary);
  text-transform: none;
  background: var(--el-color-primary-light-9);
  border-radius: 3px;
  &--clear {
    cursor: pointer;
    border: none;
    transition: background 0.15s;
    &:hover {
      background: var(--el-color-primary-light-7);
      color: #fff;
    }
  }
}
.issue-chart__body {
  flex: 1;
  min-height: 0;
  padding: 10px;
}
</style>
