<script setup lang="ts" name="ScoreBar">
/**
 * Reusable relevance-score progress bar with optional text label.
 *
 * Used across retrieval results, source chips, history tables, and
 * comparison panels to display 0–1 relevance scores consistently.
 */
import { computed } from "vue";

function scorePercent(score: number | undefined | null): number {
  if (score == null || isNaN(score)) return 0;
  return Math.round(score * 100);
}

function scoreLabel(score: number | undefined | null): string {
  if (score == null || isNaN(score)) return "\u2014";
  return (score * 100).toFixed(1) + "%";
}

function scoreColor(score: number | undefined | null): string {
  if (score == null || isNaN(score)) return "#909399";
  if (score >= 0.7) return "#67c23a";
  if (score >= 0.4) return "#e6a23c";
  return "#f56c6c";
}

const props = withDefaults(
  defineProps<{
    score: number;
    barWidth?: number;
    strokeWidth?: number;
    showLabel?: boolean;
    textOnly?: boolean;
  }>(),
  {
    barWidth: 50,
    strokeWidth: 6,
    showLabel: true,
    textOnly: false,
  }
);

const pct = computed(() => scorePercent(props.score));
const color = computed(() => scoreColor(props.score));
const label = computed(() => scoreLabel(props.score));
</script>

<template>
  <span class="score-bar" :class="{ 'score-bar--text-only': textOnly }">
    <el-progress
      v-if="!textOnly"
      :percentage="pct"
      :stroke-width="strokeWidth"
      :color="color"
      :show-text="false"
      :style="{ width: barWidth + 'px', flexShrink: 0 }"
    />
    <span v-if="showLabel" class="score-bar__label" :style="{ color }">{{ label }}</span>
  </span>
</template>

<style scoped lang="scss">
.score-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  vertical-align: middle;

  &--text-only {
    gap: 0;
  }

  &__label {
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
}
</style>