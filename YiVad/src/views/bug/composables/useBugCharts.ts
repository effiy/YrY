import { computed, type Ref } from "vue";
import type { BugDocument } from "@/api/modules/bug";
import type { ECOption } from "@/components/ECharts/config";

export const SEVERITY_COLOR: Record<string, string> = {
  critical: "#f56c6c",
  major: "#e6a23c",
  minor: "#409eff",
  trivial: "#909399"
};

export const STATUS_COLOR: Record<string, string> = {
  open: "#e6a23c",
  in_progress: "#409eff",
  resolved: "#67c23a",
  closed: "#909399",
  rejected: "#f56c6c",
  reopened: "#e6a23c"
};

export function useBugCharts(allBugs: Ref<BugDocument[]>) {
  const statusDonutOption = computed<ECOption>(() => {
    const order = ["open", "in_progress", "resolved", "closed", "rejected", "reopened"];
    const data = order
      .map(s => ({
        name: s,
        value: allBugs.value.filter(b => b.status === s).length,
        itemStyle: { color: STATUS_COLOR[s] }
      }))
      .filter(d => d.value > 0);
    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, textStyle: { fontSize: 9 } },
      series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
    };
  });

  const severityDonutOption = computed<ECOption>(() => {
    const order = ["critical", "major", "minor", "trivial"];
    const data = order
      .map(s => ({
        name: s,
        value: allBugs.value.filter(b => b.severity === s).length,
        itemStyle: { color: SEVERITY_COLOR[s] }
      }))
      .filter(d => d.value > 0);
    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, textStyle: { fontSize: 9 } },
      series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
    };
  });

  const trendOption = computed<ECOption>(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const today = new Date();
    const createdByDay: Record<string, number> = {};
    for (const b of allBugs.value) {
      const day = b.updatedAt ? new Date(b.updatedAt).toISOString().slice(0, 10) : "";
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
      series: [{ type: "bar", data: values, itemStyle: { color: "#f56c6c", borderRadius: [3, 3, 0, 0] } }]
    };
  });

  return { statusDonutOption, severityDonutOption, trendOption };
}