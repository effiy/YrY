<script setup lang="ts" name="ScoreBar">
/**
 * Reusable relevance-score progress bar with optional text label.
 *
 * Used across retrieval results, source chips, history tables, and
 * comparison panels to display 0–1 relevance scores consistently.
 */
import { computed } from "vue";
import { scorePercent, scoreLabel, scoreColor } from "@/views/rag/constants";

const props = withDefaults(
  defineProps<{
    score: number;
    /** Bar width in pixels (default 50). */
    barWidth?: number;
    /** Stroke height in pixels (default 6). */
    strokeWidth?: number;
    /** Show "%" text label to the right of the bar. */
    showLabel?: boolean;
    /** Show text-only (no bar). */
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
