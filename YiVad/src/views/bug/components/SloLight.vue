<template>
  <div
    class="slo-light"
    :class="[`is-${status}`]"
    role="status"
    :aria-label="`SLO ${label} ${status}`"
  >
    <span class="slo-light__dot" />
    <span class="slo-light__label">{{ label }}</span>
    <span v-if="target" class="slo-light__target">{{ target }}</span>
  </div>
</template>

<script setup lang="ts" name="SloLight">
defineProps<{
  status: "ok" | "warn" | "fail" | "na";
  label: string;
  target?: string;
}>();
</script>

<style scoped lang="scss">
.slo-light {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px 3px 7px;
  font-size: 10.5px;
  font-weight: 600;
  border-radius: 999px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  line-height: 1.3;
  letter-spacing: 0.1px;
  border: 1px solid transparent;
  transition: all 0.15s;

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--el-color-info);
    box-shadow: 0 0 0 2px rgba(144, 147, 153, 0.18);
    flex-shrink: 0;
  }
  &__label {
    color: var(--el-text-color-regular);
    white-space: nowrap;
  }
  &__target {
    font-weight: 500;
    color: var(--el-text-color-placeholder);
    padding-left: 4px;
    border-left: 1px solid var(--el-border-color-lighter);
    margin-left: 2px;
  }

  // ── ok ──
  &.is-ok {
    color: var(--el-color-success);
    border-color: rgba(103, 194, 58, 0.25);
    background: rgba(103, 194, 58, 0.08);
    .slo-light__dot {
      background: var(--el-color-success);
      box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.25);
      animation: slo-pulse-ok 2.8s ease-in-out infinite;
    }
    .slo-light__label { color: var(--el-color-success); }
  }
  // ── warn ──
  &.is-warn {
    color: var(--el-color-warning);
    border-color: rgba(230, 162, 60, 0.3);
    background: rgba(230, 162, 60, 0.1);
    .slo-light__dot {
      background: var(--el-color-warning);
      box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.25);
      animation: slo-pulse-warn 1.8s ease-in-out infinite;
    }
    .slo-light__label { color: var(--el-color-warning); }
  }
  // ── fail ──
  &.is-fail {
    color: var(--el-color-danger);
    border-color: rgba(245, 108, 108, 0.35);
    background: rgba(245, 108, 108, 0.1);
    .slo-light__dot {
      background: var(--el-color-danger);
      box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.3);
      animation: slo-pulse-fail 1.1s ease-in-out infinite;
    }
    .slo-light__label { color: var(--el-color-danger); font-weight: 700; }
  }
  // ── na ──
  &.is-na {
    opacity: 0.7;
    .slo-light__dot {
      background: var(--el-color-info-light-5);
      animation: none;
      box-shadow: none;
    }
    .slo-light__label { color: var(--el-text-color-placeholder); font-weight: 500; }
  }
}

@keyframes slo-pulse-ok {
  0%, 100% { box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.15); }
  50% { box-shadow: 0 0 0 4px rgba(103, 194, 58, 0.0); }
}
@keyframes slo-pulse-warn {
  0%, 100% { box-shadow: 0 0 0 2px rgba(230, 162, 60, 0.25); }
  50% { box-shadow: 0 0 0 5px rgba(230, 162, 60, 0); }
}
@keyframes slo-pulse-fail {
  0%, 100% { box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.3); opacity: 1; }
  50% { box-shadow: 0 0 0 6px rgba(245, 108, 108, 0); opacity: 0.8; }
}
</style>
