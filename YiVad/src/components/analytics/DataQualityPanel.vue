<template>
  <div class="dq-panel">
    <div v-if="!completeness || completeness.total === 0" class="dq-empty">No data</div>
    <template v-else>
      <div class="dq-item">
        <span class="dq-item__label">Description</span>
        <span class="dq-item__bar">
          <span class="dq-item__fill" :style="{ width: completeness.description_pct + '%', background: barColor(completeness.description_pct) }" />
        </span>
        <span class="dq-item__value">{{ completeness.description_pct }}%</span>
      </div>
      <div class="dq-item">
        <span class="dq-item__label">Assignee</span>
        <span class="dq-item__bar">
          <span class="dq-item__fill" :style="{ width: completeness.assignee_pct + '%', background: barColor(completeness.assignee_pct) }" />
        </span>
        <span class="dq-item__value">{{ completeness.assignee_pct }}%</span>
      </div>
      <div class="dq-item">
        <span class="dq-item__label">Environment</span>
        <span class="dq-item__bar">
          <span class="dq-item__fill" :style="{ width: completeness.environment_pct + '%', background: barColor(completeness.environment_pct) }" />
        </span>
        <span class="dq-item__value">{{ completeness.environment_pct }}%</span>
      </div>
      <div class="dq-item">
        <span class="dq-item__label">Fix Version</span>
        <span class="dq-item__bar">
          <span class="dq-item__fill" :style="{ width: completeness.fixedVersion_pct + '%', background: barColor(completeness.fixedVersion_pct) }" />
        </span>
        <span class="dq-item__value">{{ completeness.fixedVersion_pct }}%</span>
      </div>
      <div class="dq-total">Based on {{ completeness.total }} bugs</div>
    </template>
  </div>
</template>

<script setup lang="ts">
interface Completeness {
  total: number;
  description_pct: number;
  assignee_pct: number;
  environment_pct: number;
  fixedVersion_pct: number;
}

interface Props {
  completeness: Completeness | null;
}

defineProps<Props>();

function barColor(pct: number): string {
  if (pct >= 80) return "#67c23a";
  if (pct >= 50) return "#e6a23c";
  return "#f56c6c";
}
</script>

<style scoped lang="scss">
.dq-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dq-item {
  display: flex;
  align-items: center;
  gap: 10px;

  &__label {
    width: 88px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: right;
  }

  &__bar {
    flex: 1;
    height: 8px;
    background: var(--el-border-color-lighter);
    border-radius: 4px;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s ease;
    min-width: 2px;
  }

  &__value {
    width: 36px;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-primary);
  }
}

.dq-total {
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  text-align: center;
  margin-top: 4px;
}

.dq-empty {
  text-align: center;
  padding: 32px;
  color: var(--el-text-color-secondary);
}
</style>