<template>
  <div class="report-preview">
    <div v-for="comp in components" :key="comp.id" class="report-preview__block">
      <h3 v-if="comp.title" class="report-preview__title">{{ comp.title }}</h3>

      <div v-if="comp.type === 'kpi_card'" class="rp-kpi">
        <div class="rp-kpi__val">--</div>
        <div class="rp-kpi__lbl">{{ comp.title }}</div>
      </div>

      <div v-else-if="comp.type === 'text'" class="rp-text">
        {{ comp.config?.content || "Lorem ipsum dolor sit amet, consectetur adipiscing elit." }}
      </div>

      <div v-else-if="comp.type === 'table'" class="rp-table">
        <el-table :data="mockTableData" size="small" border>
          <el-table-column prop="col1" label="Column 1" />
          <el-table-column prop="col2" label="Column 2" />
          <el-table-column prop="col3" label="Column 3" />
        </el-table>
      </div>

      <div v-else class="rp-chart-placeholder">
        <el-icon :size="24"><DataAnalysis /></el-icon>
        <span>{{ comp.type.replace("_", " ") }} — will render with live data on generation</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis } from "@element-plus/icons-vue";
import type { ReportComponent, DateRange } from "@/types/analytics";

defineProps<{ components: ReportComponent[]; dateRange?: DateRange }>();

const mockTableData = [
  { col1: "Sample 1", col2: "Value A", col3: "100" },
  { col1: "Sample 2", col2: "Value B", col3: "200" },
  { col1: "Sample 3", col2: "Value C", col3: "300" },
];
</script>

<style scoped lang="scss">
.report-preview {
  padding: 24px;
  &__block { margin-bottom: 24px; }
  &__title { margin: 0 0 12px; font-size: 15px; }
}

.rp-kpi { text-align: center; padding: 16px; background: var(--el-fill-color-lighter); border-radius: 8px;
  &__val { font-size: 32px; font-weight: 700; color: var(--el-color-primary); }
  &__lbl { font-size: 13px; color: var(--el-text-color-secondary); margin-top: 4px; }
}

.rp-text { padding: 12px; color: var(--el-text-color-regular); line-height: 1.6; }

.rp-chart-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: var(--el-text-color-secondary); background: var(--el-fill-color-lighter); border-radius: 8px; }
</style>