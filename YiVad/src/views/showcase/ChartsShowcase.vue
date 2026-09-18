<template>
  <div class="showcase-page">
    <el-page-header @back="$router.back()" title="Showcase" content="Charts" />

    <el-alert
      type="info" :closable="false" show-icon class="sc-alert"
      title="ECharts 6 integration via reusable wrapper components in src/components/ECharts/."
    />

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="sc-section">
          <template #header><h3><el-tag type="primary">Line Chart</el-tag></h3></template>
          <ECharts :option="lineOption" height="280px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="sc-section">
          <template #header><h3><el-tag type="success">Bar Chart</el-tag></h3></template>
          <ECharts :option="barOption" height="280px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="sc-section">
          <template #header><h3><el-tag type="warning">Pie Chart</el-tag></h3></template>
          <ECharts :option="pieOption" height="280px" />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="sc-section">
          <template #header><h3><el-tag type="danger">Radar Chart</el-tag></h3></template>
          <ECharts :option="radarOption" height="280px" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="chartsShowcase">
import ECharts from "@/components/ECharts/index.vue";

// ECharts option types are deeply nested; using `as any` here since this is a showcase page.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _lineOption: any = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" },
  series: [
    {
      name: "Page Views",
      type: "line",
      data: [820, 932, 901, 934, 1290, 1330, 1020],
      smooth: true,
      itemStyle: { color: "#409EFF" },
    },
    {
      name: "Sessions",
      type: "line",
      data: [620, 732, 701, 734, 890, 930, 820],
      smooth: true,
      itemStyle: { color: "#67C23A" },
    },
  ],
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _barOption: any = {
  tooltip: { trigger: "axis" },
  xAxis: { type: "category", data: ["Q1", "Q2", "Q3", "Q4"] },
  yAxis: { type: "value" },
  series: [
    {
      name: "Revenue",
      type: "bar",
      data: [120, 200, 150, 80],
      itemStyle: { color: "#67C23A", borderRadius: 4 },
      barWidth: "50%",
    },
  ],
  grid: { left: 40, right: 20, top: 30, bottom: 30 },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _pieOption: any = {
  tooltip: { trigger: "item" },
  legend: { bottom: 0 },
  series: [
    {
      name: "Source",
      type: "pie",
      radius: ["40%", "70%"],
      data: [
        { value: 1048, name: "Search", itemStyle: { color: "#409EFF" } },
        { value: 735, name: "Direct", itemStyle: { color: "#67C23A" } },
        { value: 580, name: "Social", itemStyle: { color: "#E6A23C" } },
        { value: 484, name: "Referral", itemStyle: { color: "#F56C6C" } },
      ],
    },
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _radarOption: any = {
  tooltip: {},
  legend: { bottom: 0 },
  radar: {
    indicator: [
      { name: "Speed", max: 100 },
      { name: "Quality", max: 100 },
      { name: "Coverage", max: 100 },
      { name: "Stability", max: 100 },
      { name: "UX", max: 100 },
    ],
  },
  series: [
    {
      type: "radar",
      name: "Current",
      data: [{ value: [85, 72, 90, 78, 88], name: "Current" }],
      areaStyle: { color: "rgba(64,158,255,0.2)" },
      lineStyle: { color: "#409EFF" },
      itemStyle: { color: "#409EFF" },
    },
  ],
};

const lineOption = _lineOption;
const barOption = _barOption;
const pieOption = _pieOption;
const radarOption = _radarOption;
</script>

<style scoped lang="scss">
@use "./showcase.scss";