<template>
  <el-dialog v-model="visible" title="Export Templates" width="520px">
    <div v-if="templates.length === 0" class="export-templates__empty">
      <p>No saved templates yet. Configure your export and save it as a template.</p>
    </div>
    <div v-for="tpl in templates" :key="tpl.id" class="export-templates__item">
      <div class="export-templates__item-info">
        <span class="export-templates__item-name">{{ tpl.name }}</span>
        <span class="export-templates__item-meta">{{ tpl.format.toUpperCase() }} · {{ tpl.columns.length }} columns · {{ tpl.createdAt.slice(0, 10) }}</span>
      </div>
      <div class="export-templates__item-actions">
        <el-button size="small" @click="$emit('apply', tpl)">Apply</el-button>
        <el-button size="small" text type="danger" @click="$emit('delete', tpl.id)">Delete</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { ExportTemplate } from "@/utils/export/types";

defineProps<{ templates: ExportTemplate[] }>();
defineEmits<{ apply: [template: ExportTemplate]; delete: [id: string] }>();

const visible = ref(false);
const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
defineExpose({ open, close });
</script>

<style scoped lang="scss">
.export-templates {
  &__empty { padding: 24px; text-align: center; color: var(--el-text-color-secondary); }
  &__item {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 0; border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
    &-name { font-size: 13px; font-weight: 500; }
    &-meta { font-size: 11px; color: var(--el-text-color-secondary); display: block; margin-top: 2px; }
  }
}
</style>