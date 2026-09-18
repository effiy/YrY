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
}>();

const emit = defineEmits<{
  (e: "update:viewMode", value: "table" | "card" | "list"): void;
}>();

function qualityBarColor(pct: number) {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
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
        <div v-for="(stat, index) in overviewStats" :key="index" class="issue-list__sidebar-card" @click="stat.onClick?.()">
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
          :class="stat.accentClass"
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
  padding: 12px;
  background: linear-gradient(180deg, var(--el-bg-color) 0%, var(--el-fill-color-lighter) 100%);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.issue-list__sidebar-section {
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
}
.issue-list__sidebar-section-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  padding-left: 10px;
  font-size: 10px;
  font-weight: 700;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-left: 2px solid var(--el-color-primary);
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
  gap: 4px;
  padding: 8px;
}
.issue-list__sidebar-card {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 10px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: all 0.15s;
  &:hover {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.issue-list__sidebar-card-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  font-size: 13px;
  color: #ffffff;
  border-radius: 7px;
}
.issue-list__sidebar-card-info {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
}
.issue-list__sidebar-card-value {
  font-family: DIN, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--el-text-color-primary);
}
.issue-list__sidebar-card-label {
  font-size: 10px;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-card-accent-icon {
  flex-shrink: 0;
  font-size: 14px;
}
.issue-list__sidebar-card-accent-value {
  min-width: 20px;
  font-family: DIN, sans-serif;
  font-size: 16px;
  font-weight: 700;
}
.issue-list__sidebar-card-accent-label {
  flex: 1;
  font-size: 11px;
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
  padding: 0 12px 12px;
}
.issue-list__sidebar-progress-label {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-quality {
  padding: 4px 0;
  & + & {
    padding-top: 8px;
  }
}
.issue-list__sidebar-quality-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 3px;
}
.issue-list__sidebar-quality-label {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
.issue-list__sidebar-quality-pct {
  font-family: DIN, sans-serif;
  font-size: 11px;
  font-weight: 600;
}
.issue-list__sidebar-view {
  padding: 4px 4px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  :deep(.el-radio-group) {
    display: flex;
    width: 100%;
  }
  :deep(.el-radio-button) {
    flex: 1;
  }
  :deep(.el-radio-button__inner) {
    width: 100%;
    padding: 4px 0;
    font-size: 12px;
    text-align: center;
  }
}
</style>
