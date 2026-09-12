import { computed } from "vue";
import { useModuleStore } from "@/stores/modules/module";
import { MODULE_STATUS_MAP } from "@/api/modules/moduleService";
import type { ModuleStatus } from "@/api/modules/moduleService";
import type { ECOption } from "@/components/ECharts/config";

export const STATUS_COLOR: Record<string, string> = {
  planned: "#909399",
  in_progress: "#409eff",
  completed: "#67c23a",
  cancelled: "#f56c6c"
};

export function useModuleCharts(deps: {
  progressPct: (m: any) => number;
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
      series: [{ type: "bar", data: Object.values(buckets), itemStyle: { color: "#5470c6", borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
    };
  });

  const trendOption = computed<ECOption>(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const today = new Date();
    const createdByDay: Record<string, number> = {};
    for (const m of store.modules) {
      const day = (m.created_at || "").slice(0, 10);
      if (day) createdByDay[day] = (createdByDay[day] ?? 0) + 1;
    }
    for (let d = 13; d >= 0; d--) {
      const dt = new Date(today.getTime() - d * 86400000);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
      values.push(createdByDay[key] ?? 0);
    }
    return {
      tooltip: { trigger: "axis" },
      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, interval: 3 } },
      yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
      series: [{ type: "bar", data: values, itemStyle: { color: "#91cc75", borderRadius: [3, 3, 0, 0] } }]
    };
  });

  return { statusDonutOption, progressBarOption, trendOption };
}