<template>
  <div class="flow-metrics">
    <div class="fm-card">
      <div class="fm-card__value">{{ flowDebt }}<span class="fm-card__unit"> item-days</span></div>
      <div class="fm-card__label">Flow Debt</div>
      <div class="fm-card__hint">WIP &times; Cycle Time</div>
    </div>
    <div class="fm-card">
      <div class="fm-card__value">{{ wipAgeP50 }}<span class="fm-card__unit">d</span></div>
      <div class="fm-card__label">WIP Age P50</div>
      <div class="fm-card__hint">P85: {{ wipAgeP85 }}d &middot; P95: {{ wipAgeP95 }}d</div>
    </div>
    <div class="fm-card">
      <div class="fm-card__value">{{ flowEfficiency }}<span class="fm-card__unit">%</span></div>
      <div class="fm-card__label">Flow Efficiency</div>
      <div class="fm-card__hint">Confidence: {{ flowConfidence }}</div>
    </div>
    <div class="fm-card" :class="{ 'fm-card--warn': littlesGap > 30 }">
      <div class="fm-card__value">{{ littlesGap }}<span class="fm-card__unit">%</span></div>
      <div class="fm-card__label">Little's Law Gap</div>
      <div class="fm-card__hint">
        Expected: {{ littlesExpected }} &middot; Actual: {{ littlesActual }}
      </div>
    </div>
    <div class="fm-card">
      <div class="fm-card__value">{{ cycleTimeCv }}<span class="fm-card__unit">CV</span></div>
      <div class="fm-card__label">Cycle Time Var.</div>
      <div class="fm-card__hint">&#963;={{ cycleTimeStd }}d &middot; UCL={{ cycleTimeUcl }}d</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  wipCount: number;
  cycleTimeP50: number;
  wipAgeP50: number;
  wipAgeP85: number;
  wipAgeP95: number;
  flowEfficiency: number;
  flowConfidence: string;
  throughputPerWeek: number;
  cycleTimeStd: number;
  cycleTimeCv: number;
  cycleTimeUcl: number;
}

const props = defineProps<Props>();

const flowDebt = computed(() => Math.round(props.wipCount * props.cycleTimeP50));

const littlesExpected = computed(() =>
  Math.round(props.throughputPerWeek * props.cycleTimeP50 / 7)
);
const littlesActual = computed(() => props.wipCount);
const littlesGap = computed(() => {
  if (littlesExpected.value === 0) return 0;
  return Math.round(
    Math.abs(littlesActual.value - littlesExpected.value) / littlesExpected.value * 100
  );
});
</script>

<style scoped lang="scss">
.flow-metrics {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;

  @media (max-width: 1100px) { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}

.fm-card {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border-left: 3px solid var(--el-border-color-light);

  &--warn {
    border-left-color: #e6a23c;
    background: rgba(230, 162, 60, 0.06);
  }

  &__value {
    font-size: 22px;
    font-weight: 700;
    line-height: 1.2;
    font-variant-numeric: tabular-nums;
    color: var(--el-text-color-primary);
  }

  &__unit {
    font-size: 13px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
  }

  &__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  &__hint {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
    font-variant-numeric: tabular-nums;
  }
}
</style>