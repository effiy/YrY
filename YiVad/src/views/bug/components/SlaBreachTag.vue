<template>
  <el-tag
    size="small"
    type="danger"
    effect="dark"
    round
    class="sla-breach"
    :title="`Severity '${severity}' SLA breached · open ${hours}h (limit: ${limit}h)`"
  >
    <el-icon class="sla-breach__icon"><AlarmClock /></el-icon>
    <span>{{ hours }}h OVER</span>
  </el-tag>
</template>

<script setup lang="ts" name="SlaBreachTag">
import { computed } from "vue";
import { AlarmClock } from "@element-plus/icons-vue";
import type { BugSeverity } from "@/api/modules/bug";

const SLA: Record<BugSeverity, number> = {
  critical: 4,
  major: 24,
  minor: 72,
  trivial: 168
};

const props = defineProps<{
  hours: number;
  severity: BugSeverity | string;
}>();

const limit = computed(() => SLA[(props.severity || "trivial") as BugSeverity] ?? 24);
</script>

<style scoped lang="scss">
.sla-breach {
  animation: sla-breach-pulse 1s ease-in-out infinite;
  font-weight: 700;
  margin-left: 6px;
  padding: 1px 8px 1px 6px;
  font-size: 10.5px;
  letter-spacing: 0.2px;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  gap: 3px;

  &__icon { font-size: 11px; }
}
:deep(.el-tag__content) { display: inline-flex; align-items: center; gap: 3px; }

@keyframes sla-breach-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.5);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 0 3px rgba(245, 108, 108, 0.1);
    transform: scale(1.03);
  }
}
</style>
