<template>
  <div class="card content-box">
    <span class="text">ECharts Demo</span>
    <el-alert
      title="ECharts component wraps Apache ECharts 6 for Vue 3. Supports all chart types with reactive options and automatic resize."
      type="warning"
      :closable="false"
    />
    <el-row :gutter="20" class="mt30">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>Column Chart</template>
          <ECharts height="300px" :option="columnOptions" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>Line Chart</template>
          <ECharts height="300px" :option="lineOptions" />
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" class="mt20">
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>Pie Chart</template>
          <ECharts height="300px" :option="pieOptions" />
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover">
          <template #header>Radar Chart</template>
          <ECharts height="300px" :option="radarOptions" />
        </el-card>
      </el-col>
    </el-row>
    <el-descriptions title="Props" :column="1" border class="mt30">
      <el-descriptions-item label="option">EChartsOption — chart configuration object</el-descriptions-item>
      <el-descriptions-item label="height">string — chart height, default "300px"</el-descriptions-item>
      <el-descriptions-item label="width">string — chart width, default "100%"</el-descriptions-item>
      <el-descriptions-item label="theme">string — chart theme</el-descriptions-item>
      <el-descriptions-item label="loading">boolean — show loading state</el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts" name="componentDemoEcharts">
import ECharts from "@/components/ECharts/index.vue";

const columnOptions = {
  xAxis: { type: "category" as const, data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" as const },
  series: [{ data: [120, 200, 150, 80, 70, 110, 130], type: "bar" as const }],
  tooltip: { trigger: "axis" as const },
};

const lineOptions = {
  xAxis: { type: "category" as const, data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
  yAxis: { type: "value" as const },
  series: [{ data: [150, 230, 224, 218, 135, 147, 260], type: "line" as const, smooth: true }],
  tooltip: { trigger: "axis" as const },
};

const pieOptions = {
  series: [{
    type: "pie" as const,
    data: [
      { value: 335, name: "Direct" },
      { value: 310, name: "Email" },
      { value: 234, name: "Affiliate" },
      { value: 135, name: "Video" },
      { value: 548, name: "Search" },
    ],
    radius: "60%",
  }],
  tooltip: { trigger: "item" as const },
};

const radarOptions = {
  radar: {
    indicator: [
      { name: "Sales", max: 100 },
      { name: "Marketing", max: 100 },
      { name: "Development", max: 100 },
      { name: "Support", max: 100 },
      { name: "Admin", max: 100 },
    ],
  },
  series: [{
    type: "radar" as const,
    data: [{ value: [80, 70, 90, 60, 50], name: "Team A" }],
  }],
};
</script>

<style scoped lang="scss">
.mt20 { margin-top: 20px; }
.mt30 { margin-top: 30px; }
</style>