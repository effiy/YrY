<script setup lang="ts">
import { ref, computed } from "vue";

interface ColumnMapping {
  sourceCol: string;
  targetField: string;
}

const props = defineProps<{
  fields: { name: string; label: string; required?: boolean }[];
}>();

const emit = defineEmits<{
  (e: "submit", data: Record<string, any>[]): void;
  (e: "cancel"): void;
}>();

const inputMode = ref<"paste" | "file">("paste");
const rawText = ref("");
const rawRows = ref<string[][]>([]);
const headers = ref<string[]>([]);
const mappings = ref<ColumnMapping[]>([]);
const previewData = ref<Record<string, any>[]>([]);
const errors = ref<{ row: number; field: string; message: string }[]>([]);
const currentStep = ref<"input" | "map" | "preview">("input");

function detectDelimiter(text: string): string {
  const firstLine = text.split("\n")[0];
  const counts = { ",": 0, "\t": 0, "|": 0 };
  for (const ch of firstLine) {
    if (ch in counts) counts[ch as keyof typeof counts]++;
  }
  const max = Math.max(...Object.values(counts));
  if (max === 0) return ",";
  return (Object.entries(counts).find(([, v]) => v === max) as [string, number])[0];
}

function parseText() {
  const delimiter = detectDelimiter(rawText.value);
  const lines = rawText.value.trim().split("\n").filter((l) => l.trim());
  if (lines.length < 1) return;

  rawRows.value = lines.map((line) => {
    // Handle quoted values
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  });

  // First row as headers
  if (rawRows.value.length > 0) {
    headers.value = rawRows.value[0];
    rawRows.value = rawRows.value.slice(1);
  }

  // Auto-map by name similarity
  mappings.value = headers.value.map((header) => {
    const match = props.fields.find(
      (f) => f.name.toLowerCase() === header.toLowerCase() || f.label.toLowerCase() === header.toLowerCase()
    );
    return { sourceCol: header, targetField: match?.name || "" };
  });

  currentStep.value = "map";
}

function handleFileUpload(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    rawText.value = e.target?.result as string;
    parseText();
  };
  reader.readAsText(file);
}

function applyMapping() {
  previewData.value = rawRows.value.map((row, rowIdx) => {
    const record: Record<string, any> = {};
    for (const mapping of mappings.value) {
      if (!mapping.targetField) continue;
      const colIdx = headers.value.indexOf(mapping.sourceCol);
      if (colIdx >= 0) {
        record[mapping.targetField] = row[colIdx];
      }
    }
    return record;
  });

  // Validate each row
  errors.value = [];
  for (let i = 0; i < previewData.value.length; i++) {
    const row = previewData.value[i];
    for (const field of props.fields.filter((f) => f.required)) {
      const mapped = mappings.value.find((m) => m.targetField === field.name);
      if (mapped && (!row[field.name] || row[field.name].toString().trim() === "")) {
        errors.value.push({ row: i + 1, field: field.name, message: `${field.label} 为必填` });
      }
    }
  }

  currentStep.value = "preview";
}

function submit() {
  emit("submit", previewData.value);
}

function reset() {
  rawText.value = "";
  rawRows.value = [];
  headers.value = [];
  mappings.value = [];
  previewData.value = [];
  errors.value = [];
  currentStep.value = "input";
}
</script>

<template>
  <div class="form-batch-input">
    <!-- Step 1: Input -->
    <div v-if="currentStep === 'input'" class="form-batch-input__input">
      <el-radio-group v-model="inputMode">
        <el-radio value="paste">粘贴数据</el-radio>
        <el-radio value="file">上传文件</el-radio>
      </el-radio-group>

      <div v-if="inputMode === 'paste'" class="form-batch-input__paste">
        <el-input
          v-model="rawText"
          type="textarea"
          :rows="8"
          placeholder="从 Excel/Google Sheets 复制数据并粘贴到此处&#10;支持 CSV/TSV 格式&#10;第一行为标题行"
        />
      </div>

      <div v-else class="form-batch-input__file">
        <input
          type="file"
          accept=".csv,.tsv,.txt"
          @change="(e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFileUpload(f); }"
        />
      </div>

      <div class="form-batch-input__actions">
        <el-button @click="emit('cancel')">取消</el-button>
        <el-button type="primary" :disabled="!rawText.trim()" @click="parseText">
          解析数据
        </el-button>
      </div>
    </div>

    <!-- Step 2: Column Mapping -->
    <div v-if="currentStep === 'map'" class="form-batch-input__map">
      <h4>列映射</h4>
      <p class="form-batch-input__hint">将数据列映射到表单字段</p>

      <el-table :data="mappings" size="small">
        <el-table-column prop="sourceCol" label="数据列" />
        <el-table-column label="目标字段">
          <template #default="{ row }">
            <el-select v-model="row.targetField" placeholder="选择字段" size="small">
              <el-option value="" label="-- 跳过 --" />
              <el-option v-for="f in fields" :key="f.name" :label="`${f.label} (${f.name})`" :value="f.name" />
            </el-select>
          </template>
        </el-table-column>
      </el-table>

      <div class="form-batch-input__actions">
        <el-button @click="currentStep = 'input'">返回</el-button>
        <el-button type="primary" @click="applyMapping">预览数据</el-button>
      </div>
    </div>

    <!-- Step 3: Preview -->
    <div v-if="currentStep === 'preview'" class="form-batch-input__preview">
      <h4>数据预览 ({{ previewData.length }} 行)</h4>

      <el-alert
        v-if="errors.length > 0"
        :title="`${errors.length} 个验证错误`"
        type="warning"
        show-icon
        :closable="false"
        style="margin-bottom: 12px"
      />

      <el-table :data="previewData.slice(0, 10)" size="small" max-height="320">
        <el-table-column
          v-for="field in fields"
          :key="field.name"
          :prop="field.name"
          :label="field.label"
        />
      </el-table>

      <p v-if="previewData.length > 10" class="form-batch-input__more">
        仅显示前 10 行，共 {{ previewData.length }} 行
      </p>

      <div class="form-batch-input__actions">
        <el-button @click="currentStep = 'map'">返回修改</el-button>
        <el-button type="primary" :disabled="errors.length > 0" @click="submit">
          批量提交 ({{ previewData.length }} 条)
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.form-batch-input {
  &__paste {
    margin-top: 12px;
  }

  &__file {
    margin-top: 12px;
  }

  &__hint {
    margin: 4px 0 12px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 16px;
  }

  &__more {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }

  h4 {
    margin: 0 0 4px;
    font-size: 15px;
  }
}
</style>