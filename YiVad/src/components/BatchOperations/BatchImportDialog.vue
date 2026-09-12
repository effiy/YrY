<template>
  <el-dialog v-model="visible" title="Batch Import" width="560px">
    <el-upload
      ref="uploadRef"
      :auto-upload="false"
      :on-change="handleFileChange"
      :limit="1"
      accept=".csv,.json,.xlsx,.xls"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
      <template #tip>
        <div class="el-upload__tip">Supports CSV, JSON, Excel files</div>
      </template>
    </el-upload>
    <div v-if="preview.length" class="batch-import__preview">
      <div class="batch-import__preview-header">Preview (first {{ Math.min(preview.length, 10) }} rows)</div>
      <el-table :data="preview.slice(0, 10)" size="small" max-height="200">
        <el-table-column v-for="col in previewColumns" :key="col" :prop="col" :label="col" />
      </el-table>
    </div>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :disabled="!preview.length" @click="handleConfirm">Import</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { UploadFilled } from "@element-plus/icons-vue";

const emit = defineEmits<{ confirm: [data: Record<string, any>[]] }>();

const visible = ref(false);
const preview = ref<Record<string, any>[]>([]);
const previewColumns = ref<string[]>([]);

const handleFileChange = async (file: any) => {
  const raw = file.raw;
  if (!raw) return;
  const text = await raw.text();
  try {
    if (raw.name.endsWith(".json")) {
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : (parsed.data ?? []);
      preview.value = arr;
      if (arr.length) previewColumns.value = Object.keys(arr[0]);
    } else if (raw.name.endsWith(".csv")) {
      const lines = text.split("\n").filter(Boolean);
      const headers = lines[0].split(",");
      previewColumns.value = headers;
      preview.value = lines.slice(1).map((line: string) => {
        const vals = line.split(",");
        const row: Record<string, any> = {};
        headers.forEach((h: string, i: number) => (row[h] = vals[i] ?? ""));
        return row;
      });
    }
  } catch {
    preview.value = [];
  }
};

const open = () => { visible.value = true; preview.value = []; };
const close = () => { visible.value = false; };
const handleConfirm = () => { emit("confirm", preview.value); visible.value = false; };
defineExpose({ open, close });
</script>

<style scoped lang="scss">
.batch-import__preview { margin-top: 16px; &-header { font-size: 13px; font-weight: 500; margin-bottom: 8px; } }
</style>