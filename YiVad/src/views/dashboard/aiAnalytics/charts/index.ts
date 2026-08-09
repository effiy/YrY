/**
 * Chart option factories for the AI Analytics dashboard.
 * Each factory is a pure function: data in → ECOption out.
 */
import type { AiDailyStats, AiModelUsage } from "@/api/interface/yiweb";
import type { ECOption } from "@/components/ECharts/config";

export const CHART_PALETTE = [
  "#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de",
  "#3ba272", "#fc8452", "#9a60b4", "#ea7ccc", "#5ab1ef",
  "#ff99cc", "#99ccff", "#cc99ff", "#ffcc99", "#99ff99",
];

// ── Daily Activity (bar + line combo) ──

export function buildDailyActivity(daily: AiDailyStats[]): ECOption {
  if (!daily.length) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross", crossStyle: { color: "#999" } },
    },
    legend: {
      data: ["Sessions", "Messages"],
      top: 0,
      textStyle: { fontSize: 11 },
    },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "15%", containLabel: true },
    xAxis: {
      type: "category",
      data: daily.map(d => d.date.slice(5)),
      axisLabel: { rotate: 45, fontSize: 10 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: [
      {
        type: "value",
        name: "Sessions",
        minInterval: 1,
        axisLabel: { fontSize: 10 },
        splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
      },
      {
        type: "value",
        name: "Messages",
        minInterval: 1,
        axisLabel: { fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: "Sessions",
        type: "bar",
        data: daily.map(d => d.sessions),
        barWidth: "50%",
        itemStyle: {
          color: newEchartsGraphicLinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#6B9DFE" },
            { offset: 1, color: "#4A7DE0" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
        emphasis: {
          itemStyle: { color: "#5470c6" },
        },
      },
      {
        name: "Messages",
        type: "line",
        yAxisIndex: 1,
        data: daily.map(d => d.messages),
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: { color: "#ee6666", width: 2.5 },
        itemStyle: { color: "#ee6666" },
        areaStyle: {
          color: newEchartsGraphicLinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(238,102,102,0.25)" },
            { offset: 1, color: "rgba(238,102,102,0.02)" },
          ]),
        },
      },
    ],
  };
}

// Need a helper for linear gradient since we're in pure option land
function newEchartsGraphicLinearGradient(
  x0: number, y0: number, x1: number, y1: number,
  stops: { offset: number; color: string }[],
) {
  return {
    type: "linear",
    x: x0, y: y0, x2: x1, y2: y1,
    colorStops: stops,
  } as any;
}

// ── Model Usage Donut ──

export function buildModelDonut(models: AiModelUsage[]): ECOption {
  if (!models.length) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  const total = models.reduce((s, m) => s + m.count, 0);
  return {
    tooltip: {
      trigger: "item",
      formatter: (p: any) => `${p.name}: ${p.value} calls (${p.percent}%)`,
    },
    legend: {
      orient: "vertical",
      left: 0,
      top: "center",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { fontSize: 10 },
      type: "scroll",
    },
    series: [{
      type: "pie",
      radius: ["50%", "78%"],
      center: ["58%", "50%"],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 3, borderColor: "#fff", borderWidth: 2 },
      label: {
        show: true,
        fontSize: 10,
        formatter: (p: any) => `${p.name}\n${p.percent}%`,
      },
      emphasis: {
        label: { fontSize: 14, fontWeight: "bold" },
        scaleSize: 8,
      },
      data: models.map((m, i) => ({
        value: m.count,
        name: m.model,
        itemStyle: { color: CHART_PALETTE[i % CHART_PALETTE.length] },
      })),
    }],
  };
}

// ── Model Usage Horizontal Bar ──

export function buildModelBar(models: AiModelUsage[]): ECOption {
  if (!models.length) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  const sorted = [...models].sort((a, b) => a.count - b.count);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "8%", top: "3%", bottom: "3%", containLabel: true },
    xAxis: { type: "value", axisLabel: { fontSize: 10 } },
    yAxis: {
      type: "category",
      data: sorted.map(m => m.model),
      axisLabel: { fontSize: 10, width: 100, overflow: "truncate" },
    },
    series: [{
      type: "bar",
      barWidth: "60%",
      data: sorted.map((m, i) => ({
        value: m.count,
        itemStyle: {
          color: CHART_PALETTE[i % CHART_PALETTE.length],
          borderRadius: [0, 4, 4, 0],
        },
      })),
    }],
  };
}

// ── Sessions Trend Area ──

export function buildSessionsTrend(daily: AiDailyStats[]): ECOption {
  if (!daily.length) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
    xAxis: {
      type: "category",
      data: daily.map(d => d.date.slice(5)),
      axisLabel: { rotate: 45, fontSize: 10 },
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
    },
    series: [{
      type: "line",
      data: daily.map(d => d.sessions),
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      lineStyle: { color: "#5470c6", width: 2.5 },
      itemStyle: { color: "#5470c6" },
      areaStyle: {
        color: newEchartsGraphicLinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(84,112,198,0.3)" },
          { offset: 1, color: "rgba(84,112,198,0.02)" },
        ]),
      },
    }],
  };
}

// ── Messages Trend Area ──

export function buildMessagesTrend(daily: AiDailyStats[]): ECOption {
  if (!daily.length) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  return {
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "cross" },
    },
    grid: { left: "3%", right: "4%", bottom: "3%", top: "10%", containLabel: true },
    xAxis: {
      type: "category",
      data: daily.map(d => d.date.slice(5)),
      axisLabel: { rotate: 45, fontSize: 10 },
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      minInterval: 1,
      axisLabel: { fontSize: 10 },
      splitLine: { lineStyle: { type: "dashed", color: "#eee" } },
    },
    series: [{
      type: "line",
      data: daily.map(d => d.messages),
      smooth: true,
      symbol: "circle",
      symbolSize: 5,
      lineStyle: { color: "#91cc75", width: 2.5 },
      itemStyle: { color: "#91cc75" },
      areaStyle: {
        color: newEchartsGraphicLinearGradient(0, 0, 0, 1, [
          { offset: 0, color: "rgba(145,204,117,0.3)" },
          { offset: 1, color: "rgba(145,204,117,0.02)" },
        ]),
      },
    }],
  };
}

// ── Weekly Heatmap (last 7 days by day-of-week + metric) ──

export function buildWeeklyHeatmap(daily: AiDailyStats[]): ECOption {
  const last7 = daily.slice(-7);
  if (!last7.length) {
    return {
      title: { text: "No data", left: "center", top: "center", textStyle: { color: "#909399", fontSize: 14 } },
    } as ECOption;
  }
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const hours = ["Sessions", "Messages"];
  const maxSessions = Math.max(...last7.map(d => d.sessions), 1);
  const maxMessages = Math.max(...last7.map(d => d.messages), 1);

  const data = last7.flatMap((d, i) => {
    const dow = new Date(d.date).getDay();
    return [
      [i, 0, d.sessions], // row i, col 0
      [i, 1, d.messages], // row i, col 1
    ];
  });

  return {
    tooltip: {
      position: "top",
      formatter: (p: any) => {
        const d = last7[p.data[0]];
        return `${d.date}<br/>${hours[p.data[1]]}: ${p.data[2]}`;
      },
    },
    grid: { left: "15%", right: "5%", top: "5%", bottom: "10%" },
    xAxis: {
      type: "category",
      data: hours,
      axisLabel: { fontSize: 10 },
      axisTick: { show: false },
      axisLine: { show: false },
      splitArea: { show: true, areaStyle: { color: ["rgba(255,255,255,0)", "rgba(0,0,0,0.02)"] } },
    },
    yAxis: {
      type: "category",
      data: last7.map(d => {
        const dow = new Date(d.date).getDay();
        return `${dayNames[dow]} ${d.date.slice(5)}`;
      }),
      axisLabel: { fontSize: 10 },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    visualMap: {
      min: 0,
      max: Math.max(maxSessions, maxMessages),
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: 0,
      inRange: { color: ["#f0f5ff", "#6B9DFE", "#5470c6"] },
      textStyle: { fontSize: 9 },
    },
    series: [{
      type: "heatmap",
      data,
      label: { show: true, fontSize: 10 },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0,0,0,0.25)" } },
    }],
  };
}
