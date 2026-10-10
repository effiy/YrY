<template>
  <span
    v-if="score > 0"
    class="risk-badge"
    :class="[`risk-badge--${tier}`]"
    :title="`Risk score: ${score} / 16 · tier: ${tier.toUpperCase()}`"
  >
    <span class="risk-badge__bar">
      <span class="risk-badge__fill" :style="{ width: `${Math.min(100, (score / 16) * 100)}%` }" />
    </span>
    <span class="risk-badge__score">R{{ score }}</span>
  </span>
</template>

<script setup lang="ts" name="RiskBadge">
import { computed } from "vue";

const props = defineProps<{ score: number }>();
const tier = computed<"critical" | "high" | "medium" | "low">(() => {
  const s = props.score;
  if (s >= 12) return "critical";
  if (s >= 8) return "high";
  if (s >= 4) return "medium";
  return "low";
});
</script>

<style scoped lang="scss">
.risk-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 1px 6px 1px 2px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  font-family: "SF Mono", "Fira Code", monospace;
  border: 1px solid transparent;
  margin-left: 6px;
  vertical-align: middle;

  &__bar {
    display: inline-block;
    width: 22px;
    height: 4px;
    border-radius: 2px;
    background: var(--el-fill-color-light);
    overflow: hidden;
  }
  &__fill {
    display: block;
    height: 100%;
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  &__score { white-space: nowrap; }

  &--low {
    color: var(--el-text-color-secondary);
    background: rgba(144, 147, 153, 0.12);
    border-color: rgba(144, 147, 153, 0.25);
    .risk-badge__fill { background: var(--el-color-info); }
  }
  &--medium {
    color: #1d6dd4;
    background: rgba(64, 158, 255, 0.12);
    border-color: rgba(64, 158, 255, 0.3);
    .risk-badge__fill { background: linear-gradient(90deg, #409eff 0%, #36cfc9 100%); }
  }
  &--high {
    color: #b88230;
    background: rgba(230, 162, 60, 0.15);
    border-color: rgba(230, 162, 60, 0.4);
    .risk-badge__fill { background: linear-gradient(90deg, #e6a23c 0%, #f56c6c 100%); }
  }
  &--critical {
    color: #c45656;
    background: rgba(245, 108, 108, 0.15);
    border-color: rgba(245, 108, 108, 0.45);
    .risk-badge__fill { background: linear-gradient(90deg, #f56c6c 0%, #b33a3a 100%); }
  }
}
</style>
