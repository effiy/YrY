<template>
  <div class="metrics-panel">
    <div class="metric" v-for="m in metrics" :key="m.label">
      <span class="metric-label">{{ m.label }}</span>
      <span class="metric-value" :class="m.status">{{ m.value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Metric {
  label: string;
  value: string | number;
  status?: "good" | "warn" | "bad";
}

defineProps<{ metrics: Metric[] }>();
</script>

<style scoped>
.metrics-panel {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.metric-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.metric-value {
  font-size: 18px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.metric-value.good { color: var(--el-color-success); }
.metric-value.warn { color: var(--el-color-warning); }
.metric-value.bad { color: var(--el-color-danger); }
</style>