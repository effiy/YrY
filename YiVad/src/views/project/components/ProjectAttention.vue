<template>
  <section class="pat-box">
    <header class="pat-head">
      <el-icon class="pat-head-icon" :class="{ 'is-clear': allClear }">
        <component :is="allClear ? CircleCheckFilled : WarningFilled" />
      </el-icon>
      <span class="pat-title">Needs attention</span>
      <span class="pat-hint">
        {{ allClear ? "Every project passes all health checks" : `${flaggedProjects} of ${totalProjects} projects flagged` }}
      </span>
    </header>

    <div class="pat-grid">
      <button
        v-for="risk in order"
        :key="risk"
        type="button"
        class="pat-card"
        :class="{ 'pat-card--zero': !counts[risk], 'pat-card--on': activeRisk === risk }"
        :style="{ '--risk-color': meta[risk].color }"
        :disabled="!counts[risk]"
        :title="meta[risk].hint"
        @click="emit('select', risk)"
      >
        <span class="pat-card-count">{{ counts[risk] }}</span>
        <span class="pat-card-label">{{ meta[risk].label }}</span>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts" name="ProjectAttention">
import { computed } from "vue";
import { CircleCheckFilled, WarningFilled } from "@element-plus/icons-vue";
import { RISK_META, RISK_ORDER, type RiskKey } from "../types";

const props = defineProps<{
  counts: Record<RiskKey, number>;
  /** Number of distinct projects carrying at least one risk. */
  flaggedProjects: number;
  totalProjects: number;
  activeRisk?: string;
}>();

const emit = defineEmits<{ (e: "select", risk: RiskKey): void }>();

const meta = RISK_META;
const order = RISK_ORDER;
const allClear = computed(() => order.every(r => !props.counts[r]));
</script>

<style scoped lang="scss">
.pat-box {
  padding: 12px 14px;
  margin-bottom: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
}
.pat-head {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}
.pat-head-icon {
  font-size: 15px;
  color: var(--el-color-warning);
  &.is-clear {
    color: var(--el-color-success);
  }
}
.pat-title {
  font-size: 14px;
  font-weight: 600;
}
.pat-hint {
  margin-left: auto;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}
.pat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(112px, 1fr));
  gap: 10px;
}
.pat-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 9px;
  border-top: 3px solid var(--risk-color);
  transition:
    transform 0.15s,
    box-shadow 0.15s;
  &:hover:not(:disabled) {
    box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }
}
.pat-card-count {
  font-size: 19px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  color: var(--risk-color);
}
.pat-card-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-align: center;
}

/* A satisfied check stays visible but recedes — the row reads as a checklist. */
.pat-card--zero {
  cursor: default;
  border-color: var(--el-border-color-lighter);
  border-top-color: var(--el-border-color-lighter);
  opacity: 0.5;
  .pat-card-count {
    color: var(--el-text-color-placeholder);
  }
}
.pat-card--on {
  box-shadow: 0 0 0 2px var(--risk-color);
}
</style>
