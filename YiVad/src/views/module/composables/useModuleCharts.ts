import { computed, type Ref } from "vue";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { ModuleStatus } from "@/api/modules/moduleService";
import type { ModuleDashboardResponse } from "@/types/analytics";
import type { ECOption } from "@/components/ECharts/config";

export const STATUS_COLOR: Record<string, string> = {
  planned: "#909399",
  in_progress: "#409eff",
  completed: "#67c23a",
  cancelled: "#f56c6c"
};

export function useModuleCharts(deps: {
  progressPct: (m: any) => number;
  dashboard: Ref<ModuleDashboardResponse | null>;
}) {
  const store = useModuleStore();

  const statusDonutOption = computed<ECOption>(() => {
    const order = ["planned", "in_progress", "completed", "cancelled"];
    const data = order
      .map(s => ({
        name: s,
        value: store.modules.filter(m => m.status === s).length,
        itemStyle: { color: STATUS_COLOR[s] }
      }))
      .filter(d => d.value > 0);
    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, textStyle: { fontSize: 9 }, formatter: (n: string) => MODULE_STATUS_MAP[n as ModuleStatus] ?? n },
      series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
    };
  });

  const progressBarOption = computed<ECOption>(() => {
    const buckets: Record<string, number> = { "0-25%": 0, "25-50%": 0, "50-75%": 0, "75-100%": 0 };
    for (const m of store.modules) {
      const p = deps.progressPct(m);
      if (p < 25) buckets["0-25%"]++;
      else if (p < 50) buckets["25-50%"]++;
      else if (p < 75) buckets["50-75%"]++;
      else buckets["75-100%"]++;
    }
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: "category", data: Object.keys(buckets), axisLabel: { fontSize: 9 } },
      yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
      series: [
        {
          type: "bar",
          data: Object.values(buckets),
          itemStyle: { color: "#5470c6", borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 26
        }
      ]
    };
  });

  const burndownOption = computed<ECOption>(() => {
    const bd = deps.dashboard.value?.burndown;
    if (!bd?.length) return _emptyChart("No burndown data");
    const dates = bd.map(d => d.date.slice(5));
    const remaining = bd.map(d => d.remaining);
    const ideal = bd.map(d => d.ideal);
    return {
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, textStyle: { fontSize: 9 }, data: ["Remaining", "Ideal"] },
      grid: { left: 8, right: 8, top: 8, bottom: 20, containLabel: true },
      xAxis: { type: "category", data: dates, axisLabel: { fontSize: 9, interval: 3 } },
      yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
      series: [
        {
          name: "Remaining",
          type: "line",
          data: remaining,
          smooth: true,
          lineStyle: { color: "#5470c6", width: 2 },
          itemStyle: { color: "#5470c6" },
          symbol: "none"
        },
        {
          name: "Ideal",
          type: "line",
          data: ideal,
          smooth: true,
          lineStyle: { color: "#91cc75", width: 1, type: "dashed" },
          itemStyle: { color: "#91cc75" },
          symbol: "none"
        }
      ]
    };
  });

  const velocityOption = computed<ECOption>(() => {
    const vel = deps.dashboard.value?.velocity;
    if (!vel?.length) return _emptyChart("No velocity data");
    const weeks = vel.map(v => v.week.slice(6));
    const points = vel.map(v => v.points);
    return {
      tooltip: { trigger: "axis" },
      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: "category", data: weeks, axisLabel: { fontSize: 9 } },
      yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
      series: [
        {
          type: "bar",
          data: points,
          itemStyle: { color: "#fac858", borderRadius: [3, 3, 0, 0] },
          barMaxWidth: 20
        }
      ]
    };
  });

  return { statusDonutOption, progressBarOption, burndownOption, velocityOption };
}

function _emptyChart(msg: string): ECOption {
  return {
    title: { text: msg, left: "center", top: "center", textStyle: { fontSize: 11, color: "#909399" } }
  };
}