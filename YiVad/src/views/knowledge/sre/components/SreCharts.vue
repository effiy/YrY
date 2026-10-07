<template>
  <div class="sre-charts">
    <div class="sre-charts__grid">
      <div class="sre-charts__panel">
        <h3 class="sre-charts__title">{{ $t("knowledge.sre.bugTrend") }}</h3>
        <ECharts v-if="bugTrendOption" :option="bugTrendOption" height="220" />
        <div v-else class="sre-charts__empty">{{ $t("knowledge.common.noData") }}</div>
      </div>

      <div class="sre-charts__panel">
        <h3 class="sre-charts__title">{{ $t("knowledge.sre.severityDist") }}</h3>
        <ECharts v-if="severityOption" :option="severityOption" height="220" />
        <div v-else class="sre-charts__empty">{{ $t("knowledge.common.noData") }}</div>
      </div>

      <div class="sre-charts__panel">
        <h3 class="sre-charts__title">{{ $t("knowledge.sre.moduleQuality") }}</h3>
        <ECharts v-if="moduleQualityOption" :option="moduleQualityOption" height="220" />
        <div v-else class="sre-charts__empty">{{ $t("knowledge.common.noData") }}</div>
      </div>

      <div class="sre-charts__panel">
        <h3 class="sre-charts__title">{{ $t("knowledge.sre.bugAge") }}</h3>
        <ECharts v-if="bugAgeOption" :option="bugAgeOption" height="220" />
        <div v-else class="sre-charts__empty">{{ $t("knowledge.common.noData") }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="SreCharts">
import { computed } from "vue";
import type { ECOption } from "@/components/ECharts/config";
import ECharts from "@/components/ECharts/index.vue";
import type { QualityMetrics } from "@/types/analytics";

const props = defineProps<{
  quality: QualityMetrics | null;
}>();

const bugTrendOption = computed<ECOption | null>(() => {
  const trend = props.quality?.bug_trend;
  if (!trend?.length) return null;
  return {
    grid: { top: 8, right: 12, bottom: 24, left: 36 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: trend.map(d => d.date.slice(5)),
      axisLabel: { fontSize: 10, rotate: 45 }
    },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 10 } },
    series: [{
      type: "line",
      data: trend.map(d => d.value),
      smooth: true,
      symbol: "none",
      lineStyle: { color: "#3b82f6", width: 2 },
      areaStyle: { color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: "rgba(59,130,246,0.2)" }, { offset: 1, color: "rgba(59,130,246,0.02)" }] } }
    }]
  };
});

const severityOption = computed<ECOption | null>(() => {
  const dist = props.quality?.severity_distribution;
  if (!dist) return null;
  const entries = Object.entries(dist).filter(([, v]) => v > 0);
  if (!entries.length) return null;

  const colors: Record<string, string> = { critical: "#ef4444", major: "#f59e0b", minor: "#3b82f6", trivial: "#9ca3af" };

  return {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: { bottom: 0, textStyle: { fontSize: 10 } },
    series: [{
      type: "pie",
      radius: ["50%", "75%"],
      center: ["50%", "48%"],
      itemStyle: { borderRadius: 4, borderColor: "var(--el-bg-color)", borderWidth: 2 },
      label: { fontSize: 10 },
      data: entries.map(([k, v]) => ({ name: k, value: v, itemStyle: { color: colors[k] || "#6b7280" } }))
    }]
  };
});

const moduleQualityOption = computed<ECOption | null>(() => {
  const mods = props.quality?.module_quality;
  if (!mods?.length) return null;
  const top = [...mods].sort((a, b) => a.quality_score - b.quality_score).slice(0, 10);

  return {
    grid: { top: 8, right: 16, bottom: 24, left: 100 },
    tooltip: { trigger: "axis", formatter: (p: any) => `${p[0].name}<br/>Score: ${p[0].value}<br/>Bugs: ${top[p[0].dataIndex].bugs}` },
    xAxis: { type: "value", max: 100, axisLabel: { fontSize: 10 } },
    yAxis: {
      type: "category",
      data: top.map(m => m.module.length > 16 ? m.module.slice(0, 15) + "…" : m.module),
      axisLabel: { fontSize: 10 },
      inverse: true
    },
    series: [{
      type: "bar",
      data: top.map(m => ({
        value: m.quality_score,
        itemStyle: {
          color: m.quality_score >= 80 ? "#22c55e" : m.quality_score >= 60 ? "#f59e0b" : "#ef4444",
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: 16
    }]
  };
});

const bugAgeOption = computed<ECOption | null>(() => {
  const age = props.quality?.bug_age_distribution;
  if (!age) return null;
  const labels: Record<string, string> = { lt_1d: "< 1d", "1_3d": "1-3d", "3_7d": "3-7d", "7_30d": "7-30d", gt_30d: "> 30d" };

  return {
    grid: { top: 8, right: 12, bottom: 24, left: 36 },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: Object.keys(age).map(k => labels[k] || k),
      axisLabel: { fontSize: 10 }
    },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 10 } },
    series: [{
      type: "bar",
      data: Object.values(age).map((v, i) => {
        const colors = ["#22c55e", "#84cc16", "#f59e0b", "#f97316", "#ef4444"];
        return { value: v, itemStyle: { color: colors[i] || "#6b7280", borderRadius: [4, 4, 0, 0] } };
      }),
      barWidth: 24
    }]
  };
});
</script>

<style scoped lang="scss">
.sre-charts__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.sre-charts__panel {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 14px 16px 8px;
}

.sre-charts__title {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.sre-charts__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 220px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>