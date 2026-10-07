<script setup lang="ts">
import type { Component } from "vue";
import { Tickets, Loading, View, CircleCheckFilled, Clock, User, Link, Grid, Postcard, List } from "@element-plus/icons-vue";

interface OverviewStat {
  icon: Component;
  iconBg: string;
  value: number;
  label: string;
  onClick?: () => void;
}

interface AttentionStat {
  icon: Component;
  value: number;
  label: string;
  accentClass: string;
  onClick?: () => void;
}

interface QualityItem {
  key: string;
  label: string;
  pct: number;
  filled: number;
  missing: number;
}

const props = defineProps<{
  viewMode: "table" | "card" | "list";
  overviewStats: OverviewStat[];
  completionPct: number;
  attentionStats: AttentionStat[];
  completeness: QualityItem[];
  allIssuesCount: number;
  activeFilter?: { status?: string; priority?: string; issue_type?: string; assignee?: string };
  activeAttention?: string;
}>();

const emit = defineEmits<{
  (e: "update:viewMode", value: "table" | "card" | "list"): void;
}>();

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}

function isOverviewActive(label: string): boolean {
  if (!props.activeFilter?.status) return false;
  const s = props.activeFilter.status.toLowerCase();
  const l = label.toLowerCase();
  if (l === "open") return s.includes("todo") || s.includes("in_progress");
  if (l === "in review") return s.includes("in_review");
  if (l === "done") return s === "done";
  return false;
}

function isAttentionActive(label: string): boolean {
  return props.activeAttention === label.toLowerCase();
}
</script>

<template>
  <div class="issue-list__sidebar">
    <div class="issue-list__sidebar-view">
      <el-radio-group
        :model-value="viewMode"
        @update:model-value="emit('update:viewMode', $event as 'table' | 'card' | 'list')"
        size="small"
      >
        <el-radio-button value="table"
          ><el-icon><Grid /></el-icon
        ></el-radio-button>
        <el-radio-button value="card"
          ><el-icon><Postcard /></el-icon
        ></el-radio-button>
        <el-radio-button value="list"
          ><el-icon><List /></el-icon
        ></el-radio-button>
      </el-radio-group>
    </div>
    <div class="issue-list__sidebar-section">
      <div class="issue-list__sidebar-section-header">
        <span class="issue-list__sidebar-section-label">Overview</span>
      </div>
      <div class="issue-list__sidebar-section-body">
        <div v-for="(stat, index) in overviewStats" :key="index" class="issue-list__sidebar-card" :class="{ 'issue-list__sidebar-card--active': isOverviewActive(stat.label) }" @click="stat.onClick?.()">
          <div class="issue-list__sidebar-card-icon" :style="{ background: stat.iconBg }">
            <el-icon><component :is="stat.icon" /></el-icon>
          </div>
          <div class="issue-list__sidebar-card-info">
            <span class="issue-list__sidebar-card-value">{{ stat.value }}</span>
            <span class="issue-list__sidebar-card-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
      <div class="issue-list__sidebar-progress">
        <span class="issue-list__sidebar-progress-label">Completion</span>
        <el-progress :percentage="completionPct" :stroke-width="6" :show-text="true" />
      </div>
    </div>
    <div class="issue-list__sidebar-section" style="margin-top: 12px">
      <div class="issue-list__sidebar-section-header" style="border-left-color: var(--el-color-danger)">
        <span class="issue-list__sidebar-section-label">Needs Attention</span>
      </div>
      <div class="issue-list__sidebar-section-body">
        <div
          v-for="(stat, index) in attentionStats"
          :key="index"
          class="issue-list__sidebar-card"
          :class="[stat.accentClass, { 'issue-list__sidebar-card--active': isAttentionActive(stat.label) }]"
          @click="stat.onClick?.()"
        >
          <el-icon class="issue-list__sidebar-card-accent-icon"><component :is="stat.icon" /></el-icon>
          <span class="issue-list__sidebar-card-accent-value">{{ stat.value }}</span>
          <span class="issue-list__sidebar-card-accent-label">{{ stat.label }}</span>
        </div>
      </div>
    </div>
    <div class="issue-list__sidebar-section" style="margin-top: 12px">
      <div class="issue-list__sidebar-section-header" style="border-left-color: var(--el-color-success)">
        <span class="issue-list__sidebar-section-label">Data Quality</span>
        <span class="issue-list__sidebar-section-hint">{{ allIssuesCount }} issues</span>
      </div>
      <div class="issue-list__sidebar-section-body">
        <div v-for="c in completeness" :key="c.key" class="issue-list__sidebar-quality">
          <div class="issue-list__sidebar-quality-head">
            <span class="issue-list__sidebar-quality-label">{{ c.label }}</span>
            <span class="issue-list__sidebar-quality-pct" :style="{ color: qualityBarColor(c.pct) }">{{ c.pct }}%</span>
          </div>
          <el-progress :percentage="c.pct" :stroke-width="4" :show-text="false" :color="qualityBarColor(c.pct)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.issue-list__sidebar {
  position: sticky;
  top: 24px;
  flex-shrink: 0;
  align-self: flex-start;
  width: 240px;
  border-radius: 12px;
  overflow: hidden;
}
.issue-list__sidebar-section {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  & + & {
    margin-top: 12px;
  }
}
.issue-list__sidebar-section-header {
  display: flex;
  align-items: center;
  padding: 9px 12px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 3px solid var(--el-color-primary);
}
.issue-list__sidebar-section-label {
  flex: 1;
}
.issue-list__sidebar-section-hint {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  text-transform: none;
  letter-spacing: 0;
}
.issue-list__sidebar-section-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
}
.issue-list__sidebar-card {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  background: var(--el-fill-color-lighter);
  border: 1px solid transparent;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 1px 4px rgb(0 0 0 / 6%);
  }
  &:active {
    transform: scale(0.98);
  }
  &--active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
  }
}
.issue-list__sidebar-card-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 14px;
  color: #ffffff;
  border-radius: 8px;
}
.issue-list__sidebar-card-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}
.issue-list__sidebar-card-value {
  font-family: DIN, sans-serif;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.15;
  color: var(--el-text-color-primary);
}
.issue-list__sidebar-card-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-card-accent-icon {
  flex-shrink: 0;
  font-size: 15px;
}
.issue-list__sidebar-card-accent-value {
  min-width: 22px;
  font-family: DIN, sans-serif;
  font-size: 18px;
  font-weight: 700;
}
.issue-list__sidebar-card-accent-label {
  flex: 1;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-card--overdue {
  .issue-list__sidebar-card-accent-icon,
  .issue-list__sidebar-card-accent-value {
    color: var(--el-color-danger);
  }
}
.issue-list__sidebar-card--unassigned {
  .issue-list__sidebar-card-accent-icon,
  .issue-list__sidebar-card-accent-value {
    color: var(--el-color-warning);
  }
}
.issue-list__sidebar-card--blocked {
  .issue-list__sidebar-card-accent-icon,
  .issue-list__sidebar-card-accent-value {
    color: var(--el-color-primary);
  }
}
.issue-list__sidebar-progress {
  padding: 4px 12px 14px;
}
.issue-list__sidebar-progress-label {
  display: block;
  margin-bottom: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-quality {
  padding: 5px 0;
  & + & {
    border-top: 1px solid var(--el-border-color-lighter);
    padding-top: 9px;
  }
}
.issue-list__sidebar-quality-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.issue-list__sidebar-quality-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-quality-pct {
  font-family: DIN, sans-serif;
  font-size: 12px;
  font-weight: 600;
}
.issue-list__sidebar-view {
  padding: 6px;
  margin-bottom: 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 5px 0;
    font-size: 13px;
    text-align: center;
    border-radius: 7px;
  }
}
</style>
