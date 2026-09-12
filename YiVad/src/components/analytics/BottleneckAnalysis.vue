<template>
  <div class="bottleneck-panel">
    <ECharts height="240" :option="chartOption" />
    <el-table :data="tableData" size="small" class="mt12">
      <el-table-column prop="status" label="Status" />
      <el-table-column prop="avgDays" label="Avg Days" width="100" sortable />
      <el-table-column prop="count" label="Issues" width="80" />
      <el-table-column label="Bottleneck" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.isBottleneck" type="danger" size="small">Bottleneck</el-tag>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

interface Props {
  data: { status: string; avgDays: number; count: number }[];
  threshold?: number;
}

const props = withDefaults(defineProps<Props>(), { threshold: 3 });

const tableData = computed(() =>
  props.data.map(d => ({ ...d, isBottleneck: d.avgDays > props.threshold }))
);

const chartOption = computed<ECOption>(() => ({
  tooltip: { trigger: "axis" as const },
  grid: { top: 8, right: 16, bottom: 8, left: 100 },
  xAxis: { type: "value" as const, name: "days" },
  yAxis: { type: "category" as const, data: props.data.map(d => d.status), inverse: true },
  series: [{
    data: props.data.map(d => d.avgDays),
    type: "bar" as const,
    color: "#f56c6c",
    barMaxWidth: 24,
    label: { show: true, position: "right" as const, formatter: "{c}d" },
  }],
}));
</script>

<style scoped lang="scss">
.bottleneck-panel { .mt12 { margin-top: 12px; } }
</style>