<template>
  <el-drawer v-model="visible" title="Batch Edit" size="480px">
    <div class="batch-edit">
      <div v-for="field in fields" :key="field.key" class="batch-edit__field">
        <label>{{ field.label }}</label>
        <el-input v-if="field.type === 'text'" v-model="edits[field.key]" :placeholder="`New value for ${field.label}`" />
        <el-select v-else-if="field.type === 'select'" v-model="edits[field.key]" :placeholder="`Select ${field.label}`" clearable>
          <el-option v-for="o in field.options" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-input-number v-else-if="field.type === 'number'" v-model="edits[field.key]" />
        <el-date-picker v-else-if="field.type === 'date'" v-model="edits[field.key]" type="date" value-format="YYYY-MM-DD" />
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Apply to {{ count }} items</el-button>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

interface EditField { key: string; label: string; type: "text" | "select" | "number" | "date"; options?: { label: string; value: any }[] }

defineProps<{ count: number; fields: EditField[] }>();
const emit = defineEmits<{ confirm: [edits: Record<string, any>] }>();

const visible = ref(false);
const edits = reactive<Record<string, any>>({});

const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
const handleConfirm = () => { emit("confirm", { ...edits }); visible.value = false; };
defineExpose({ open, close });
</script>

<style scoped lang="scss">
.batch-edit__field { margin-bottom: 16px; label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; } }
</style>