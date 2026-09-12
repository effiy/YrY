<template>
  <div class="export-wizard">
    <header class="page-header">
      <div><h1>Export Wizard</h1><p class="text-muted">Export data from any collection to CSV, JSON, or Excel format.</p></div>
    </header>

    <el-steps :active="step" align-center class="mb24">
      <el-step title="Select Source" />
      <el-step title="Choose Fields" />
      <el-step title="Format & Export" />
    </el-steps>

    <!-- Step 1: Select Collection -->
    <el-card v-if="step === 0" shadow="never">
      <template #header><span>Select Data Source</span></template>
      <el-form label-position="top">
        <el-form-item label="Collection">
          <el-select v-model="form.cname" placeholder="Select a collection" style="width: 100%">
            <el-option v-for="c in collections" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="Filter (optional)">
          <el-input v-model="filterJson" type="textarea" :rows="3" placeholder='{"status": "Done"}' />
        </el-form-item>
        <el-form-item label="Max Rows">
          <el-input-number v-model="form.limit" :min="100" :max="100000" :step="1000" />
        </el-form-item>
      </el-form>
      <div class="step-actions">
        <el-button type="primary" @click="step = 1" :disabled="!form.cname">Next: Choose Fields</el-button>
      </div>
    </el-card>

    <!-- Step 2: Choose Fields -->
    <el-card v-if="step === 1" shadow="never">
      <template #header><span>Choose Fields to Export</span></template>
      <el-checkbox-group v-model="form.fields" class="field-grid">
        <el-checkbox v-for="f in availableFields" :key="f" :label="f" :value="f" border />
      </el-checkbox-group>
      <div class="step-actions">
        <el-button @click="step = 0">Back</el-button>
        <el-button type="primary" @click="step = 2" :disabled="!form.fields.length">Next: Export</el-button>
      </div>
    </el-card>

    <!-- Step 3: Format & Execute -->
    <el-card v-if="step === 2" shadow="never">
      <template #header><span>Export Format</span></template>
      <el-radio-group v-model="form.format">
        <el-radio-button value="csv">CSV</el-radio-button>
        <el-radio-button value="json">JSON</el-radio-button>
        <el-radio-button value="xlsx">Excel</el-radio-button>
      </el-radio-group>

      <div class="export-summary mt16">
        <p>Collection: <strong>{{ form.cname }}</strong></p>
        <p>Fields: <strong>{{ form.fields.length }}</strong> selected</p>
        <p>Format: <strong>{{ form.format.toUpperCase() }}</strong></p>
        <p>Max rows: <strong>{{ form.limit.toLocaleString() }}</strong></p>
      </div>

      <div class="step-actions">
        <el-button @click="step = 1">Back</el-button>
        <el-button type="primary" :icon="Download" :loading="exporting" @click="doExport">
          {{ exporting ? "Exporting..." : "Export" }}
        </el-button>
      </div>

      <!-- Export Result -->
      <el-alert v-if="exportResult" :title="exportResult" type="success" class="mt16" closable />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Download } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { createExportTask } from "@/api/modules/exportService";
import { exportCSV } from "@/utils/export/csv";

const step = ref(0);
const exporting = ref(false);
const exportResult = ref("");
const filterJson = ref("");

const form = ref({
  cname: "",
  fields: [] as string[],
  format: "csv" as string,
  limit: 10000,
});

const collections = ["issues", "bugs", "projects", "sessions", "users", "modules", "knowledge_files"];

const availableFields: Record<string, string[]> = {
  issues: ["key", "title", "status", "priority", "type", "assignee", "project_key", "createdAt", "updatedAt", "cycle_time", "lead_time"],
  bugs: ["key", "title", "status", "severity", "priority", "assignee", "project_key", "createdAt", "updatedAt"],
  projects: ["key", "name", "status", "owner", "createdAt", "updatedAt"],
  sessions: ["key", "title", "tags", "createdAt", "updatedAt", "lastAccessTime"],
  users: ["key", "username", "email", "gender", "roles", "createdTime"],
  modules: ["key", "name", "project_key", "createdAt"],
  knowledge_files: ["path", "title", "category", "tags", "status", "type", "createdAt", "updatedAt"],
};

const currentFields = computed(() => availableFields[form.value.cname] ?? []);

async function doExport() {
  exporting.value = true;
  try {
    let filter: Record<string, any> | undefined;
    if (filterJson.value.trim()) {
      try { filter = JSON.parse(filterJson.value); }
      catch { ElMessage.warning("Invalid filter JSON"); return; }
    }

    const res = await createExportTask({
      cname: form.value.cname,
      fields: form.value.fields,
      format: form.value.format,
      filter,
      limit: form.value.limit,
    });

    if (res.code === 0 && res.data.file_content) {
      // Trigger download via existing export utilities
      const blob = new Blob([res.data.file_content], { type: res.data.format === "json" ? "application/json" : "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.file_name ?? `export.${form.value.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      exportResult.value = `Exported ${res.data.row_count?.toLocaleString() ?? "0"} rows to ${res.data.file_name}`;
    }
  } catch {
    ElMessage.error("Export failed");
  } finally {
    exporting.value = false;
  }
}

// Watch collection change to reset fields
import { watch } from "vue";
watch(() => form.value.cname, () => { form.value.fields = []; });
</script>

<style scoped lang="scss">
.export-wizard { padding: 20px; max-width: 900px; }
.page-header { margin-bottom: 20px; h1 { margin: 0 0 4px; font-size: 22px; } }
.mb24 { margin-bottom: 24px; }
.mt16 { margin-top: 16px; }
.text-muted { color: var(--el-text-color-secondary); font-size: 13px; }
.step-actions { display: flex; gap: 12px; margin-top: 20px; }
.field-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.export-summary p { margin: 4px 0; }
</style>