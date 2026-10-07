<template>
  <div class="kpi-card" :class="[`kpi-card--${colorClass}`, `kpi-card--${size}`, { 'kpi-card--clickable': !!clickable }]" @click="handleClick">
    <div class="kpi-card__header">
      <span class="kpi-card__label">{{ label }}</span>
      <el-tag v-if="badge" :type="badge.type" size="small" effect="plain" class="kpi-card__badge">
        {{ badge.text }}
      </el-tag>
      <el-tooltip v-if="tooltip" :content="tooltip" placement="top">
        <el-icon :size="14"><QuestionFilled /></el-icon>
      </el-tooltip>
    </div>
    <div class="kpi-card__body">
      <span class="kpi-card__value">{{ formattedValue }}</span>
      <span v-if="unit" class="kpi-card__unit">{{ unit }}</span>
    </div>
    <div v-if="subtitle" class="kpi-card__subtitle">{{ subtitle }}</div>
    <div class="kpi-card__footer">
      <span v-if="trend != null" class="kpi-card__trend" :class="`kpi-card__trend--${trendDirection}`">
        <el-icon :size="12">
          <component :is="trendDirection === 'up' ? CaretTop : trendDirection === 'down' ? CaretBottom : Minus" />
        </el-icon>
        {{ Math.abs(trend) }}%
      </span>
      <span v-if="comparisonLabel && trend == null" class="kpi-card__comparison">
        {{ comparisonLabel }}
      </span>
      <div v-if="sparkline?.length" ref="sparkRef" class="kpi-card__spark" />
    </div>
    <div v-if="thresholdInfo" class="kpi-card__threshold-bar">
      <div class="kpi-card__threshold-fill" :style="{ width: thresholdInfo.pct + '%', background: thresholdInfo.color }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import { QuestionFilled, CaretTop, CaretBottom, Minus } from "@element-plus/icons-vue";
import * as echarts from "echarts/core";

interface Thresholds {
  good?: number;
  warn?: number;
}

interface Props {
  label: string;
  value: number;
  unit?: string;
  trend?: number;
  trendDirection?: "up" | "down" | "neutral";
  sparkline?: number[];
  tooltip?: string;
  format?: "number" | "percent" | "duration";
  inverted?: boolean;
  threshold?: Thresholds;
  comparisonLabel?: string;
  clickable?: boolean;
  size?: "default" | "large";
  subtitle?: string;
  badge?: { text: string; type: "success" | "warning" | "danger" | "info" };
}

const props = withDefaults(defineProps<Props>(), {
  trendDirection: "neutral",
  format: "number",
  inverted: false,
  clickable: false,
  size: "default"
});

const emit = defineEmits<{ click: [] }>();

const upColor = computed(() => (props.inverted ? "#f56c6c" : "#67c23a"));
const downColor = computed(() => (props.inverted ? "#67c23a" : "#f56c6c"));
const neutralColor = "#909399";

const trendColor = computed(() =>
  props.trendDirection === "up" ? upColor.value : props.trendDirection === "down" ? downColor.value : neutralColor
);

const colorClass = computed(() => {
  if (!props.threshold) return "neutral";
  const { good = 80, warn = 50 } = props.threshold;
  if (props.inverted) {
    if (props.value <= good) return "good";
    if (props.value <= warn) return "warn";
    return "bad";
  }
  if (props.value >= good) return "good";
  if (props.value >= warn) return "warn";
  return "bad";
});

const thresholdInfo = computed(() => {
  if (!props.threshold) return null;
  const { good = 80, warn = 50 } = props.threshold;
  const maxVal = good * 1.25;
  const pct = Math.min(100, (props.value / maxVal) * 100);
  let color = "#67c23a";
  if (props.inverted) {
    color = props.value <= good ? "#67c23a" : props.value <= warn ? "#e6a23c" : "#f56c6c";
  } else {
    color = props.value >= good ? "#67c23a" : props.value >= warn ? "#e6a23c" : "#f56c6c";
  }
  return { pct, color };
});

const rgbaMap: Record<string, string> = {
  "#67c23a": "rgba(103,194,58,0.2)",
  "#f56c6c": "rgba(245,108,108,0.2)",
  "#e6a23c": "rgba(230,162,60,0.2)",
  "#909399": "rgba(144,147,153,0.2)",
};

const trendAreaColor = computed(() => rgbaMap[trendColor.value] ?? "rgba(64,158,255,0.2)");

const sparkRef = ref<HTMLDivElement>();
let sparkInst: echarts.ECharts | null = null;

const formattedValue = computed(() => {
  if (props.format === "percent") return `${props.value.toFixed(1)}%`;
  if (props.format === "duration") {
    if (props.value >= 1) return `${props.value.toFixed(1)}d`;
    const h = props.value * 24;
    return `${h.toFixed(1)}h`;
  }
  if (props.value >= 10000) return `${(props.value / 1000).toFixed(1)}k`;
  return props.value % 1 === 0 ? props.value.toLocaleString() : props.value.toFixed(1);
});

function renderSparkline() {
  if (!sparkRef.value || !props.sparkline?.length || props.sparkline.length < 2) return;
  if (sparkInst) { sparkInst.dispose(); sparkInst = null; }
  sparkInst = echarts.init(sparkRef.value);
  const values = props.sparkline;
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const pad = (maxVal - minVal) * 0.1 || 1;
  sparkInst.setOption({
    grid: { top: 2, right: 0, bottom: 2, left: 0 },
    xAxis: { type: "category", show: false, data: values.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: minVal - pad, max: maxVal + pad },
    series: [{
      data: values,
      type: "line",
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 2, color: trendColor.value },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: trendAreaColor.value },
          { offset: 1, color: "rgba(255,255,255,0)" }
        ])
      }
    }]
  });
}

function handleResize() { sparkInst?.resize(); }
function handleClick() { if (props.clickable) emit("click"); }

onMounted(() => {
  nextTick(() => renderSparkline());
  window.addEventListener("resize", handleResize);
});
onUnmounted(() => {
  sparkInst?.dispose();
  window.removeEventListener("resize", handleResize);
});
watch(
  [() => props.sparkline, () => props.trendDirection, () => props.inverted],
  () => nextTick(() => renderSparkline())
);
</script>

<style scoped lang="scss">
.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  cursor: default;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  transition: box-shadow 0.2s, border-color 0.2s;
  position: relative;
  overflow: hidden;

  &:hover { box-shadow: 0 2px 12px rgb(0 0 0 / 6%); }

  &--good { border-left: 3px solid #67c23a; }
  &--warn { border-left: 3px solid #e6a23c; }
  &--bad { border-left: 3px solid #f56c6c; }
  &--clickable { cursor: pointer; }

  &--large {
    padding: 24px;
    gap: 8px;
    .kpi-card__value { font-size: 36px; letter-spacing: -1px; }
    .kpi-card__label { font-size: 14px; }
    .kpi-card__footer { min-height: 36px; }
    .kpi-card__spark { height: 40px; }
  }

  &__badge {
    margin-left: auto;
  }

  &__header {
    display: flex;
    gap: 4px;
    align-items: center;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  &__body {
    display: flex;
    gap: 4px;
    align-items: baseline;
  }
  &__value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--el-text-color-primary);
    letter-spacing: -0.5px;
  }
  &__unit {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  &__subtitle {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    margin-top: -2px;
  }
  &__footer {
    display: flex;
    gap: 8px;
    align-items: center;
    min-height: 32px;
  }
  &__trend {
    display: flex;
    gap: 2px;
    align-items: center;
    font-size: 12px;
    font-weight: 500;
    &--up { color: #67c23a; }
    &--down { color: #f56c6c; }
    &--neutral { color: var(--el-text-color-secondary); }
  }
  &__comparison {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
  &__spark {
    flex: 1;
    height: 32px;
  }
  &__threshold-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--el-border-color-lighter);
  }
  &__threshold-fill {
    height: 100%;
    border-radius: 0 2px 0 0;
    transition: width 0.6s ease;
  }
}
</style>