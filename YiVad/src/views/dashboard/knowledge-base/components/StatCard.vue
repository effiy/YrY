<script setup lang="ts" name="StatCard">
import { computed } from "vue";
import { Top, Bottom } from "@element-plus/icons-vue";

const props = withDefaults(
  defineProps<{
    label: string;
    value: number | string;
    sub?: string;
    icon: any;
    iconBg: string;
    iconSize?: number;
    trend?: number;
    variant?: "default" | "warn" | "danger";
  }>(),
  { iconSize: 22, variant: "default" }
);

defineEmits<{ click: [] }>();

const formattedValue = computed(() =>
  typeof props.value === "number" && props.value >= 1000
    ? (props.value / 1000).toFixed(1) + "k"
    : String(props.value)
);

const trendClass = computed(() => {
  if (props.trend === undefined) return "";
  return props.trend > 0 ? "trend-up" : props.trend < 0 ? "trend-down" : "trend-flat";
});

const cardClass = computed(() => [
  `stat-${props.variant}`,
  { "stat-pulse": false }
]);
</script>

<template>
  <div class="stat-card" :class="cardClass" @click="$emit('click')">
    <div class="stat-icon" :style="{ background: iconBg }">
      <el-icon :size="iconSize"><component :is="icon" /></el-icon>
    </div>
    <div class="stat-info">
      <div class="stat-value">
        {{ formattedValue }}
        <span v-if="trend !== undefined" class="stat-trend" :class="trendClass">
          <el-icon :size="12"><component :is="trend >= 0 ? Top : Bottom" /></el-icon>
          {{ Math.abs(trend) }}%
        </span>
      </div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="sub" class="stat-sub">{{ sub }}</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 16px 20px;
  cursor: pointer;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: transform 0.15s, box-shadow 0.15s;

  &:hover {
    box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
    transform: translateY(-2px);
  }
}

.stat-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-right: 16px;
  color: #fff;
  border-radius: 12px;
}

.stat-info {
  min-width: 0;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-family: DIN, "DIN Alternate", sans-serif;
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
  color: #1d2129;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;

  &.trend-up {
    color: #67c23a;
  }
  &.trend-down {
    color: #f56c6c;
  }
  &.trend-flat {
    color: #909399;
  }
}

.stat-label {
  margin-top: 2px;
  font-size: 13px;
  font-weight: 500;
  color: #4e5969;
}

.stat-sub {
  margin-top: 2px;
  font-size: 12px;
  color: #86909c;
}

.stat-warn .stat-value {
  color: #e6a23c;
}
.stat-danger .stat-value {
  color: #f56c6c;
}
</style>