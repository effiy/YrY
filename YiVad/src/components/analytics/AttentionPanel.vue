<template>
  <div class="attention-panel">
    <div class="ap-item" :class="{ 'ap-item--critical': criticalOpen > 0 }">
      <span class="ap-item__value">{{ criticalOpen }}</span>
      <span class="ap-item__label">Critical</span>
    </div>
    <div class="ap-item" :class="{ 'ap-item--warn': unassignedOpen > 0 }">
      <span class="ap-item__value">{{ unassignedOpen }}</span>
      <span class="ap-item__label">Unassigned</span>
    </div>
    <div class="ap-item" :class="{ 'ap-item--warn': staleOpen > 0 }">
      <span class="ap-item__value">{{ staleOpen }}</span>
      <span class="ap-item__label">Stale &gt;30d</span>
    </div>
    <div class="ap-item ap-item--activity">
      <span class="ap-item__value">
        <span class="ap-activity__in">+{{ recentActivity.created_24h }}</span>
        <span class="ap-activity__sep">/</span>
        <span class="ap-activity__out">-{{ recentActivity.resolved_24h }}</span>
      </span>
      <span class="ap-item__label">24h In / Out</span>
    </div>
    <div v-if="resolutionVelocity > 0" class="ap-item ap-item--neutral">
      <span class="ap-item__value">{{ resolutionVelocity }}<span class="ap-item__unit">/d</span></span>
      <span class="ap-item__label">Resolve Rate</span>
    </div>
    <div class="ap-item ap-item--neutral">
      <span class="ap-item__value">{{ completenessScore }}<span class="ap-item__unit">%</span></span>
      <span class="ap-item__label">Data Quality</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface RecentActivity {
  created_24h: number;
  resolved_24h: number;
}

interface Completeness {
  total: number;
  description_pct: number;
  assignee_pct: number;
  environment_pct: number;
  fixedVersion_pct: number;
}

interface Props {
  criticalOpen: number;
  unassignedOpen: number;
  staleOpen: number;
  recentActivity: RecentActivity;
  resolutionVelocity: number;
  completeness: Completeness | null;
}

const props = defineProps<Props>();

const completenessScore = computed(() => {
  const c = props.completeness;
  if (!c) return 0;
  return Math.round(
    (c.description_pct + c.assignee_pct + c.environment_pct + c.fixedVersion_pct) / 4
  );
});
</script>

<style scoped lang="scss">
.attention-panel {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px 20px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}

.ap-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 8px;
  border-left: 2px solid var(--el-border-color-lighter);
  border-radius: 2px;

  &--critical { border-left-color: #f56c6c; }
  &--warn { border-left-color: #e6a23c; }
  &--neutral { border-left-color: #409eff; }

  &__value {
    font-size: 20px;
    font-weight: 700;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
  }

  &__label {
    font-size: 11px;
    color: var(--el-text-color-secondary);
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }

  &__unit {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }
}

.ap-item--critical .ap-item__value { color: #f56c6c; }
.ap-item--warn .ap-item__value { color: #e6a23c; }

.ap-activity {
  &__in { color: #f56c6c; }
  &__sep { color: var(--el-text-color-placeholder); margin: 0 2px; }
  &__out { color: #67c23a; }
}
</style>