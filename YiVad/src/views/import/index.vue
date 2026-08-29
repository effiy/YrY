<template>
  <div class="import-page">
    <div class="import-page__head">
      <h1 class="import-page__title">Import Issues</h1>
    </div>

    <div class="import-page__body">
      <!-- Step 1: Upload -->
      <div class="import-page__step">
        <h3>1. Upload File</h3>
        <el-upload
          drag
          :auto-upload="false"
          :on-change="handleFile"
          :limit="1"
          accept=".csv,.json"
          class="import-page__upload"
        >
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">Drop CSV or JSON file here or <em>click to browse</em></div>
        </el-upload>
        <div v-if="fileName" class="import-page__file-info">
          <el-tag>{{ fileName }}</el-tag>
          <span>{{ previewRows.length }} rows detected</span>
        </div>
      </div>

      <!-- Step 2: Map Columns -->
      <div v-if="previewRows.length" class="import-page__step">
        <h3>2. Map Columns</h3>
        <div class="import-page__mapping">
          <div v-for="field in importFields" :key="field.key" class="import-page__map-row">
            <span class="import-page__map-label">{{ field.label }}</span>
            <el-select v-model="field.mapped" clearable style="width: 200px" size="small">
              <el-option v-for="col in csvHeaders" :key="col" :label="col" :value="col" />
            </el-select>
          </div>
        </div>
      </div>

      <!-- Step 3: Preview -->
      <div v-if="previewRows.length" class="import-page__step">
        <h3>3. Preview (first 5 rows)</h3>
        <div class="import-page__preview">
          <table>
            <thead>
              <tr>
                <th v-for="f in importFields.filter(f => f.mapped)" :key="f.key">{{ f.label }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in previewRows.slice(0, 5)" :key="ri">
                <td v-for="f in importFields.filter(f => f.mapped)" :key="f.key">
                  {{ row[f.mapped] || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Step 4: Import -->
      <div v-if="previewRows.length" class="import-page__step">
        <h3>4. Import</h3>
        <div class="import-page__actions">
          <el-input v-model="targetProject" placeholder="Target project key" style="width: 200px" />
          <el-button type="primary" :icon="Upload" :loading="importing" @click="doImport">
            Import {{ previewRows.length }} issues
          </el-button>
        </div>
        <div v-if="importResult" class="import-page__result">
          <el-tag type="success">{{ importResult.success }} imported</el-tag>
          <el-tag v-if="importResult.errors" type="danger">{{ importResult.errors }} failed</el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="importIssues">
import { reactive, ref } from "vue";
import { Upload, UploadFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import type { IssuePriority, IssueType } from "@/api/modules/issueService";

const issueStore = useIssueStore();

const fileName = ref("");
const csvHeaders = ref<string[]>([]);
const previewRows = ref<Record<string, string>[]>([]);
const targetProject = ref("");
const importing = ref(false);
const importResult = ref<{ success: number; errors: number } | null>(null);

const importFields = reactive([
  { key: "title", label: "Title", mapped: "" },
  { key: "description", label: "Description", mapped: "" },
  { key: "issue_type", label: "Type", mapped: "" },
  { key: "priority", label: "Priority", mapped: "" },
  { key: "status", label: "Status", mapped: "" },
  { key: "assignee", label: "Assignee", mapped: "" },
  { key: "due_date", label: "Due Date", mapped: "" }
]);

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map(line => {
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = cols[i] || ""; });
    return row;
  });
  return { headers, rows };
}

function parseJSON(text: string): { headers: string[]; rows: Record<string, string>[] } {
  try {
    const data = JSON.parse(text);
    const arr = Array.isArray(data) ? data : [data];
    if (!arr.length) return { headers: [], rows: [] };
    const headers = Object.keys(arr[0]);
    const rows = arr.map((item: any) => {
      const row: Record<string, string> = {};
      headers.forEach(h => { row[h] = String(item[h] ?? ""); });
      return row;
    });
    return { headers, rows };
  } catch {
    return { headers: [], rows: [] };
  }
}

function handleFile(file: any) {
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result as string;
    const isJSON = file.name.endsWith(".json");
    const result = isJSON ? parseJSON(text) : parseCSV(text);
    fileName.value = file.name;
    csvHeaders.value = result.headers;
    previewRows.value = result.rows;
    // Auto-map matching columns
    importFields.forEach(f => {
      const match = result.headers.find(h => h.toLowerCase() === f.key.toLowerCase() || h.toLowerCase().includes(f.key.toLowerCase()));
      f.mapped = match || "";
    });
    ElMessage.success(`Parsed ${result.rows.length} rows`);
  };
  reader.readAsText(file.raw);
}

async function doImport() {
  if (!previewRows.value.length) return;
  importing.value = true;
  let success = 0;
  let errors = 0;
  for (const row of previewRows.value) {
    try {
      const title = row[importFields.find(f => f.key === "title")?.mapped || ""] || "Untitled";
      const mapped = (key: string) => row[importFields.find(f => f.key === key)?.mapped || ""];
      await issueStore.addIssue({
        key: `ISS-${Date.now().toString(36).toUpperCase()}${success}`,
        project_key: targetProject.value || "default",
        sequence_id: Date.now(),
        title,
        description: mapped("description") || "",
        status: (mapped("status") || "todo") as any,
        priority: (mapped("priority") || "medium") as IssuePriority,
        issue_type: (mapped("issue_type") || "task") as IssueType,
        assignee: mapped("assignee") || "",
        labels: [],
        due_date: mapped("due_date") || ""
      });
      success++;
    } catch { errors++; }
  }
  importResult.value = { success, errors };
  importing.value = false;
  ElMessage.success(`Imported ${success} issues, ${errors} failed`);
}
</script>

<style scoped lang="scss">
.import-page {
  padding: 24px;
  height: calc(100vh - 95px);
  overflow: auto;
  background: var(--el-bg-color-page);
}
.import-page__head { margin-bottom: 24px; }
.import-page__title { margin: 0; font-size: 20px; font-weight: 600; }
.import-page__body { max-width: 700px; }
.import-page__step {
  margin-bottom: 28px;
  h3 { margin: 0 0 12px; font-size: 15px; }
}
.import-page__upload { width: 100%; }
.import-page__file-info {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.import-page__mapping {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.import-page__map-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.import-page__map-label {
  font-size: 13px;
  font-weight: 500;
  width: 80px;
}
.import-page__preview {
  overflow-x: auto;
  table {
    border-collapse: collapse;
    font-size: 13px;
    width: 100%;
  }
  th, td {
    padding: 6px 10px;
    border: 1px solid var(--el-border-color-lighter);
    text-align: left;
    max-width: 180px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  th { background: var(--el-fill-color-lighter); }
}
.import-page__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.import-page__result {
  margin-top: 10px;
  display: flex;
  gap: 8px;
}
</style>