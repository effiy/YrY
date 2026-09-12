<template>
  <DemoLayout active="export" title="导出系统演示" description="展示CSV/Excel/JSON/PDF四格式导出，模板管理和导出历史" @select="$emit('select', $event)">
    <div class="controls">
      <el-select v-model="format" style="width:120px">
        <el-option value="csv" label="CSV" />
        <el-option value="xlsx" label="Excel" />
        <el-option value="json" label="JSON" />
        <el-option value="pdf" label="PDF" />
      </el-select>
      <el-select v-model="scope" style="width:140px">
        <el-option value="all" label="全部数据" />
        <el-option value="selected" label="选中行" :disabled="selectedIds.length===0" />
        <el-option value="view" label="当前视图" />
      </el-select>
      <el-button type="primary" :loading="exporting" @click="doExport">
        {{ exporting ? '导出中...' : '导出' }}
      </el-button>
      <el-progress v-if="exporting" :percentage="progress" style="width:200px" />
    </div>

    <ProTable
      ref="tableRef"
      :columns="tableColumns"
      :data="DEMO_DATA_SMALL"
      :pagination="false"
      @selection-change="onSelectionChange"
    />

    <el-divider />

    <h4>导出模板</h4>
    <div class="template-bar">
      <el-tag v-for="t in templates" :key="t.name" closable :disable-transitions @close="removeTemplate(t.name)" @click="applyTemplate(t)" style="cursor:pointer;margin-right:8px">
        {{ t.name }} ({{ t.format }})
      </el-tag>
      <el-button size="small" @click="saveTemplate">保存当前配置</el-button>
    </div>

    <h4 style="margin-top:16px">导出历史 (最近10条)</h4>
    <el-table :data="exportHistory" size="small">
      <el-table-column prop="fileName" label="文件名" />
      <el-table-column prop="format" label="格式" width="70" />
      <el-table-column prop="rowCount" label="行数" width="80" />
      <el-table-column prop="exportedAt" label="时间" width="160" />
    </el-table>
  </DemoLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DemoLayout from "./shared/DemoLayout.vue";
import ProTable from "@/components/ProTable/index.vue";
import { DEMO_DATA_SMALL, DEMO_COLUMNS } from "./shared/mockData";
import { useTableExport } from "@/hooks/useTableExport";
import type { ExportFormat, ExportTemplate } from "@/utils/export/types";

defineEmits<{ select: [key: string] }>();

const format = ref<ExportFormat>("csv");
const scope = ref("all");
const selectedIds = ref<string[]>([]);
const exportHistory = ref<Array<{ fileName: string; format: string; rowCount: number; exportedAt: string }>>([]);
const templates = ref<Array<ExportTemplate>>([
  { id: "t1", name: "缺陷周报", entityType: "bugs", format: "csv", columns: DEMO_COLUMNS.slice(0, 6), createdAt: "2026-01-01" },
  { id: "t2", name: "用户概览", entityType: "users", format: "xlsx", columns: DEMO_COLUMNS.slice(0, 5), createdAt: "2026-01-02" },
]);

const { exportData, exporting, exportProgress: progress } = useTableExport();

const tableColumns = [
  { type: "selection", width: 50 },
  { prop: "id", label: "ID", width: 100 },
  { prop: "name", label: "姓名", width: 120 },
  { prop: "department", label: "部门", width: 140 },
  { prop: "status", label: "状态", width: 100 },
  { prop: "priority", label: "优先级", width: 100 },
  { prop: "amount", label: "金额", width: 120 },
];

const onSelectionChange = (rows: Record<string, any>[]) => { selectedIds.value = rows.map((r) => r.id); };

const doExport = async () => {
  let data = DEMO_DATA_SMALL;
  if (scope.value === "selected") data = DEMO_DATA_SMALL.filter((r) => selectedIds.value.includes(r.id));
  await exportData({ data, columns: DEMO_COLUMNS, format: format.value, fileName: `export-${Date.now()}` });
  exportHistory.value.unshift({
    fileName: `export-${Date.now()}.${format.value}`,
    format: format.value,
    rowCount: data.length,
    exportedAt: new Date().toLocaleString(),
  });
  if (exportHistory.value.length > 10) exportHistory.value.pop();
};

const saveTemplate = () => {
  templates.value.push({ id: `t${Date.now()}`, name: `模板-${templates.value.length + 1}`, entityType: "demo", format: format.value, columns: DEMO_COLUMNS, createdAt: new Date().toISOString() });
};

const applyTemplate = (t: ExportTemplate) => { format.value = t.format; };
const removeTemplate = (name: string) => { templates.value = templates.value.filter((t) => t.name !== name); };
</script>

<style scoped>
.controls { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap; }
.template-bar { display: flex; align-items: center; gap: 8px; }
</style>