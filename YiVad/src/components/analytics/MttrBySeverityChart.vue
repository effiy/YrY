<template>
  <ECharts height="260" :option="option" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

const SEVERITY_ORDER = ["critical", "major", "minor", "trivial"];
const SEVERITY_COLORS: Record<string, string> = {
  critical: "#f56c6c",
  major: "#e6a23c",
  minor: "#409eff",
  trivial: "#909399"
};
const SLA_TARGETS: Record<string, number> = {
  critical: 24,
  major: 72,
  minor: 168,
  trivial: 336
};

interface Props {
  data: Record<string, number>;
}

const props = defineProps<Props>();

const option = computed<ECOption>(() => {
  const items = SEVERITY_ORDER
    .filter(k => props.data[k] != null)
    .map(k => ({ severity: k, hours: props.data[k] }));

  return {
    tooltip: {
      trigger: "axis" as const,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return "";
        const target = SLA_TARGETS[p.name] || 0;
        const met = p.value <= target;
        return `<strong>${p.name}</strong><br/>MTTR: ${p.value}h<br/>SLA Target: ${target}h<br/>${met ? "Within SLA" : "Exceeds SLA"}`;
      }
    },
    grid: { top: 8, right: 24, bottom: 24, left: 12 },
    xAxis: {
      type: "value" as const,
      name: "hours",
      axisLabel: { fontSize: 11 }
    },
    yAxis: {
      type: "category" as const,
      data: items.map(d => d.severity),
      axisLabel: { fontSize: 11, fontWeight: 500 },
      inverse: true
    },
    series: [{
      type: "bar" as const,
      data: items.map(d => ({
        value: d.hours,
        itemStyle: {
          color: d.hours <= (SLA_TARGETS[d.severity] || 999) ? SEVERITY_COLORS[d.severity] : "#f56c6c",
          borderRadius: [0, 4, 4, 0]
        }
      })),
      barWidth: 20,
      label: {
        show: true,
        position: "right" as const,
        formatter: "{c}h",
        fontSize: 11
      },
      markLine: {
        silent: true,
        symbol: "none",
        lineStyle: { type: "dashed" as const, color: "#909399", width: 1 },
        label: { fontSize: 10, formatter: "SLA {c}h" },
        data: items.map(d => ({ yAxis: d.severity, xAxis: SLA_TARGETS[d.severity] || 0 }))
      }
    }]
  };
});
</script>