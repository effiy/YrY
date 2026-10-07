<template>
  <div class="import-page page">
    <PageHeaderCard
      :icon="UploadFilled"
      icon-bg="linear-gradient(135deg, #409eff, #2563eb)"
      :title="$t('common.import.title')"
      :description="$t('common.import.description')"
    />

    <div class="import-page__body">
      <!-- Step 1: Upload -->
      <div class="import-page__step">
        <h3>1. {{ $t("common.import.upload") }}</h3>
        <el-upload drag :auto-upload="false" :on-change="handleFile" :limit="1" accept=".csv,.json" class="import-page__upload">
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">{{ $t("common.import.dragHint") }}</div>
        </el-upload>
        <div v-if="fileLoading" class="import-page__file-info">
          <el-icon class="is-loading"><Loading /></el-icon>
          <span>{{ $t("common.loading") }}</span>
        </div>
        <div v-else-if="fileError" class="import-page__file-info" style="color: var(--el-color-danger)">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ fileError }}</span>
        </div>
        <div v-else-if="fileName" class="import-page__file-info">
          <el-tag>{{ fileName }}</el-tag>
          <span>{{ $t("common.import.previewHint") }}</span>
          <span>{{ previewRows.length }} {{ $t("common.rows").toLowerCase() }} {{ $t("common.import.detected") }}</span>
        </div>
      </div>

      <!-- Step 2: Map Columns -->
      <div v-if="previewRows.length" class="import-page__step">
        <h3>2. {{ $t("common.import.mapping") }}</h3>
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
        <h3>3. {{ $t("common.import.preview") }}</h3>
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
                  {{ row[f.mapped] || "-" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Step 4: Import -->
      <div v-if="previewRows.length" class="import-page__step">
        <h3>4. {{ $t("common.import.startImport") }}</h3>
        <div class="import-page__actions">
          <el-select v-model="targetCollection" placeholder="Target Collection" style="width: 180px">
            <el-option v-for="c in availableCollections" :key="c" :label="c" :value="c" />
          </el-select>
          <el-input v-model="targetProject" :placeholder="$t('issue.dialog.projectPlaceholder')" style="width: 200px" />
          <el-button type="primary" :icon="Upload" :loading="importing" :disabled="!targetProject || !targetCollection" @click="doImport">
            {{ importing ? $t("common.import.importing") : $t("common.import.startImport") }} {{ previewRows.length }} rows
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
import { useI18n } from "vue-i18n";
import { Upload, UploadFilled, Loading, WarningFilled } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useIssueStore } from "@/stores/modules/issue";
import PageHeaderCard from "@/components/PageHeaderCard/PageHeaderCard.vue";
import type { IssuePriority, IssueType } from "@/api/modules/issueService";

const { t } = useI18n();
const issueStore = useIssueStore();

const fileName = ref("");
const csvHeaders = ref<string[]>([]);
const previewRows = ref<Record<string, string>[]>([]);
const targetProject = ref("");
const targetCollection = ref("issues");
const availableCollections = ["issues", "bugs", "projects", "modules", "sessions", "faqs", "departments", "dict_items"];
const importing = ref(false);
const importResult = ref<{ success: number; errors: number } | null>(null);
const fileLoading = ref(false);
const fileError = ref("");

const importFields = reactive([
  { key: "title", label: t("issue.dialog.title"), mapped: "" },
  { key: "description", label: t("issue.dialog.description"), mapped: "" },
  { key: "issue_type", label: t("issue.table.type"), mapped: "" },
  { key: "priority", label: t("issue.table.priority"), mapped: "" },
  { key: "status", label: t("issue.table.status"), mapped: "" },
  { key: "assignee", label: t("issue.table.assignee"), mapped: "" },
  { key: "due_date", label: t("issue.table.due"), mapped: "" }
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
  fileError.value = "";
  fileLoading.value = true;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result as string;
    const isJSON = file.name.endsWith(".json");
    const result = isJSON ? parseJSON(text) : parseCSV(text);
    if (!result.rows.length) {
      fileError.value = isJSON ? "Invalid JSON format" : "Invalid CSV format";
      fileLoading.value = false;
      return;
    }
    fileName.value = file.name;
    csvHeaders.value = result.headers;
    previewRows.value = result.rows;
    importFields.forEach(f => {
      const match = result.headers.find(
        h => h.toLowerCase() === f.key.toLowerCase() || h.toLowerCase().includes(f.key.toLowerCase())
      );
      f.mapped = match || "";
    });
    fileLoading.value = false;
    ElMessage.success(t("common.import.success", { count: result.rows.length }));
  };
  reader.onerror = () => {
    fileError.value = t("common.import.failed");
    fileLoading.value = false;
  };
  reader.readAsText(file.raw);
}

async function doImport() {
  if (!previewRows.value.length || !targetProject.value) return;
  importing.value = true;
  let success = 0;
  let errors = 0;
  for (const row of previewRows.value) {
    try {
      const title = row[importFields.find(f => f.key === "title")?.mapped || ""] || "Untitled";
      const mapped = (key: string) => row[importFields.find(f => f.key === key)?.mapped || ""];
      await issueStore.addIssue({
        key: `ISS-${Date.now().toString(36).toUpperCase()}${success}`,
        project_key: targetProject.value,
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
    } catch {
      errors++;
    }
  }
  importResult.value = { success, errors };
  importing.value = false;
  if (errors) {
    ElMessage.warning(t("common.import.partialSuccess", { success, failed: errors }));
  } else {
    ElMessage.success(t("common.import.success", { count: success }));
  }
}
</script>

<style scoped lang="scss">
.import-page {
  min-height: 100%;
  // padding + background come from global .page class
}
.import-page__body {
  max-width: 700px;
  margin-top: 24px;
}
.import-page__step {
  margin-bottom: 28px;
  h3 { margin: 0 0 12px; font-size: 15px; }
}
.import-page__upload { width: 100%; }
.import-page__file-info {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
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
  gap: 10px;
  align-items: center;
}
.import-page__map-label {
  width: 80px;
  font-size: 13px;
  font-weight: 500;
}
.import-page__preview {
  overflow-x: auto;
  table {
    width: 100%;
    font-size: 13px;
    border-collapse: collapse;
  }
  th, td {
    max-width: 180px;
    padding: 6px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
    white-space: nowrap;
    border: 1px solid var(--el-border-color-lighter);
  }
  th { background: var(--el-fill-color-lighter); }
}
.import-page__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.import-page__result {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
</style>