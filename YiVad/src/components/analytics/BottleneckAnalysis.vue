<template>
  <div class="bottleneck-panel">
    <ECharts height="260" :option="chartOption" />
    <el-table :data="tableData" size="small" class="mt12">
      <el-table-column prop="status" :label="$t('common.status')" min-width="120" />
      <el-table-column prop="avgDays" :label="$t('analytics.avgDays')" width="100" sortable />
      <el-table-column prop="maxDays" :label="$t('analytics.maxDays')" width="100" />
      <el-table-column prop="count" :label="$t('analytics.issues')" width="80" />
      <el-table-column prop="severity" :label="$t('analytics.severity')" width="90" sortable />
      <el-table-column :label="$t('common.status')" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.isBottleneck" :type="bottleneckType(row.severity)" size="small" effect="dark">
            Bottleneck
          </el-tag>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ECharts from "@/components/ECharts/index.vue";
import type { ECOption } from "@/components/ECharts/config";

const { t } = useI18n();

interface Props {
  data: { status: string; avg_days?: number; avgDays?: number; wip_count?: number; count?: number; is_bottleneck?: boolean; severity?: number; max_days?: number }[];
}

const props = defineProps<Props>();

const tableData = computed(() =>
  props.data.map(d => ({
    status: d.status,
    avgDays: d.avg_days ?? d.avgDays ?? 0,
    maxDays: d.max_days ?? 0,
    count: d.wip_count ?? d.count ?? 0,
    severity: d.severity ?? (d.avg_days ?? d.avgDays ?? 0) * (d.wip_count ?? d.count ?? 0),
    isBottleneck: d.is_bottleneck ?? false
  }))
);

function bottleneckType(severity: number): "danger" | "warning" | "info" {
  if (severity >= 50) return "danger";
  if (severity >= 15) return "warning";
  return "info";
}

const chartOption = computed<ECOption>(() => {
  const items = props.data.map((d, i) => ({
    status: d.status,
    avgDays: d.avg_days ?? d.avgDays ?? 0,
    severity: d.severity ?? (d.avg_days ?? d.avgDays ?? 0) * (d.wip_count ?? d.count ?? 0)
  }));
  return {
    tooltip: { trigger: "axis" as const, formatter: (p: any) => `${p[0].name}: ${p[0].value}d` },
    grid: { top: 8, right: 16, bottom: 8, left: 110 },
    xAxis: { type: "value" as const, name: "days" },
    yAxis: { type: "category" as const, data: items.map(d => d.status), inverse: true },
    series: [{
      data: items.map(d => ({
        value: d.avgDays,
        itemStyle: {
          color: d.severity >= 50 ? "#f56c6c" : d.severity >= 15 ? "#e6a23c" : "#909399"
        }
      })),
      type: "bar" as const,
      barMaxWidth: 24,
      label: { show: true, position: "right" as const, formatter: "{c}d" }
    }]
  };
});
</script>

<style scoped lang="scss">
.bottleneck-panel {
  .mt12 { margin-top: 12px; }
  .text-muted { color: var(--el-text-color-disabled); font-size: 12px; }
}
</style>