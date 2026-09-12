<template>
  <div class="kpi-card" :class="`kpi-card--${trendDirection}`">
    <div class="kpi-card__header">
      <span class="kpi-card__label">{{ label }}</span>
      <el-tooltip v-if="tooltip" :content="tooltip">
        <el-icon><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>
    <div class="kpi-card__body">
      <span class="kpi-card__value">{{ formattedValue }}</span>
      <span v-if="unit" class="kpi-card__unit">{{ unit }}</span>
    </div>
    <div class="kpi-card__footer">
      <span v-if="trend != null" class="kpi-card__trend" :class="`kpi-card__trend--${trendDirection}`">
        <el-icon><component :is="trendDirection === 'up' ? CaretTop : trendDirection === 'down' ? CaretBottom : Minus" /></el-icon>
        {{ Math.abs(trend) }}%
      </span>
      <div v-if="sparkline?.length" ref="sparkRef" class="kpi-card__spark" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from "vue";
import { QuestionFilled, CaretTop, CaretBottom, Minus } from "@element-plus/icons-vue";
import * as echarts from "echarts/core";

interface Props {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  sparkline?: number[];
  tooltip?: string;
  format?: "number" | "percent" | "duration";
}

const props = withDefaults(defineProps<Props>(), {
  trendDirection: "neutral",
  format: "number",
});

const sparkRef = ref<HTMLDivElement>();

const formattedValue = computed(() => {
  if (props.format === "percent") return `${props.value.toFixed(1)}%`;
  if (props.format === "duration") {
    const d = Math.floor(props.value / 86400);
    const h = Math.floor((props.value % 86400) / 3600);
    return d > 0 ? `${d}d ${h}h` : `${h}h`;
  }
  if (props.value >= 10000) return `${(props.value / 1000).toFixed(1)}k`;
  return props.value % 1 === 0 ? props.value.toLocaleString() : props.value.toFixed(1);
});

function renderSparkline() {
  if (!sparkRef.value || !props.sparkline?.length) return;
  const inst = echarts.init(sparkRef.value);
  inst.setOption({
    grid: { top: 2, right: 0, bottom: 2, left: 0 },
    xAxis: { type: "category", show: false, data: props.sparkline.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: Math.min(...props.sparkline) * 0.9 },
    series: [{
      data: props.sparkline,
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: props.trendDirection === "up" ? "#67c23a" : props.trendDirection === "down" ? "#f56c6c" : "#909399" },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: props.trendDirection === "up" ? "rgba(103,194,58,0.2)" : "rgba(245,108,108,0.2)" },
        { offset: 1, color: "rgba(255,255,255,0)" },
      ]) },
    }],
  });
  inst.resize({ width: 80, height: 32 });
}

onMounted(() => renderSparkline());
watch(() => props.sparkline, () => renderSparkline());
</script>

<style scoped lang="scss">
.kpi-card {
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  cursor: default;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  gap: 4px;

  &:hover { box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06); }

  &__header { display: flex; align-items: center; gap: 4px; color: var(--el-text-color-secondary); font-size: 13px; }
  &__body { display: flex; align-items: baseline; gap: 4px; }
  &__value { font-size: 28px; font-weight: 600; color: var(--el-text-color-primary); line-height: 1.2; }
  &__unit { font-size: 13px; color: var(--el-text-color-secondary); }
  &__footer { display: flex; align-items: center; gap: 8px; min-height: 32px; }
  &__trend { font-size: 12px; display: flex; align-items: center; gap: 2px; &--up { color: #67c23a; } &--down { color: #f56c6c; } &--neutral { color: var(--el-text-color-secondary); } }
  &__spark { flex: 1; height: 32px; }
}
</style>