<template>
  <span class="dfb" :class="{ 'dfb--stale': dataAge > 120 }" :title="tooltip">
    <span class="dfb__dot" :class="{ 'dfb__dot--live': dataAge < 60 }" />
    <span class="dfb__label">{{ label }}</span>
    <el-button link size="small" class="dfb__refresh" :loading="loading" @click.stop="$emit('refresh')">
      <el-icon><Refresh /></el-icon>
    </el-button>
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Refresh } from "@element-plus/icons-vue";

const props = defineProps<{
  dataAge: number;
  lastRefreshed: Date | null;
  loading?: boolean;
}>();

defineEmits<{ refresh: [] }>();

const label = computed(() => {
  if (props.dataAge < 5) return "just now";
  if (props.dataAge < 60) return `0:${String(props.dataAge).padStart(2, "0")}`;
  const m = Math.floor(props.dataAge / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
});

const tooltip = computed(() =>
  props.lastRefreshed
    ? `Last updated: ${props.lastRefreshed.toLocaleTimeString()}`
    : "Not yet refreshed"
);
</script>

<style scoped>
.dfb {
  display: inline-flex; gap: 5px; align-items: center;
  font-size: 11px; font-variant-numeric: tabular-nums;
  color: var(--el-text-color-placeholder); white-space: nowrap;
}
.dfb--stale { color: var(--el-color-warning); font-weight: 600; }
.dfb__dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--el-text-color-placeholder); transition: background 0.3s;
}
.dfb__dot--live {
  background: var(--el-color-success);
  animation: dfb-pulse 2s ease-in-out infinite;
}
@keyframes dfb-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgb(103 194 58 / 40%); }
  50% { box-shadow: 0 0 0 5px rgb(103 194 58 / 0%); }
}
.dfb__label { min-width: 40px; text-align: left; }
.dfb__refresh { padding: 0; font-size: 13px; }
</style>