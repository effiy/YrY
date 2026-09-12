import { computed, type Ref } from "vue";
import {
  ISSUE_STATUS_MAP,
  ISSUE_PRIORITY_MAP,
  ISSUE_TYPE_MAP
} from "@/api/modules/issueService";
import type { IssueStatus, IssuePriority, IssueType } from "@/api/modules/issueService";
import { STATUS_COLOR, ISSUE_STATUS_ORDER } from "./useIssueStats";
import type { ECOption } from "@/components/ECharts/config";

function barOption(
  categories: string[],
  values: number[],
  color: string,
  label?: (name: string) => string
): ECOption {
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return "";
        const name = label ? label(p.name) : p.name;
        return `${name}: ${p.value}`;
      }
    },
    grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
    xAxis: {
      type: "category",
      data: categories,
      axisLabel: { fontSize: 9, interval: 0, rotate: categories.length > 6 ? 30 : 0, formatter: label }
    },
    yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
    series: [{ type: "bar", data: values, itemStyle: { color, borderRadius: [3, 3, 0, 0] }, barMaxWidth: 26 }]
  };
}

export function useIssueCharts(deps: {
  statusDist: Ref<Record<string, number>>;
  priorityDist: Ref<Record<string, number>>;
  typeDist: Ref<Record<string, number>>;
  assigneeDist: Ref<Record<string, number>>;
  createdByDay: Ref<Record<string, number>>;
}) {
  const statusDonutOption = computed<ECOption>(() => {
    const data = ISSUE_STATUS_ORDER
      .map(s => ({
        name: s,
        value: deps.statusDist.value[s] ?? 0,
        itemStyle: { color: STATUS_COLOR[s] }
      }))
      .filter(d => d.value > 0);
    return {
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, textStyle: { fontSize: 9 }, formatter: (n: string) => ISSUE_STATUS_MAP[n as IssueStatus] ?? n },
      series: [{ type: "pie", radius: ["42%", "68%"], center: ["50%", "42%"], label: { show: false }, data }]
    };
  });

  const priorityBarOption = computed<ECOption>(() => {
    const order: IssuePriority[] = ["urgent", "high", "medium", "low", "none"];
    return barOption(
      order as string[],
      order.map(p => deps.priorityDist.value[p] ?? 0),
      "#e6a23c",
      (n: string) => ISSUE_PRIORITY_MAP[n as IssuePriority] ?? n
    );
  });

  const typeBarOption = computed<ECOption>(() => {
    const order: IssueType[] = ["bug", "task", "feature", "improvement", "requirement"];
    return barOption(
      order as string[],
      order.map(t => deps.typeDist.value[t] ?? 0),
      "#67c23a",
      (n: string) => ISSUE_TYPE_MAP[n as IssueType] ?? n
    );
  });

  const assigneeBarOption = computed<ECOption>(() => {
    const entries = Object.entries(deps.assigneeDist.value)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    return barOption(
      entries.map(e => e[0]),
      entries.map(e => e[1]),
      "#9a60b4"
    );
  });

  const trendOption = computed<ECOption>(() => {
    const labels: string[] = [];
    const values: number[] = [];
    const today = new Date();
    for (let d = 13; d >= 0; d--) {
      const dt = new Date(today.getTime() - d * 86400000);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
      labels.push(`${dt.getMonth() + 1}/${dt.getDate()}`);
      values.push(deps.createdByDay.value[key] ?? 0);
    }
    return {
      tooltip: { trigger: "axis" },
      grid: { left: 8, right: 8, top: 8, bottom: 8, containLabel: true },
      xAxis: { type: "category", data: labels, axisLabel: { fontSize: 9, interval: 3 } },
      yAxis: { type: "value", minInterval: 1, axisLabel: { fontSize: 9 } },
      series: [{ type: "bar", data: values, itemStyle: { color: "#73c0de", borderRadius: [3, 3, 0, 0] } }]
    };
  });

  return { statusDonutOption, priorityBarOption, typeBarOption, assigneeBarOption, trendOption };
}