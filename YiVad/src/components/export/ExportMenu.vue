<template>
  <el-popover placement="bottom" :width="240" trigger="click">
    <template #reference>
      <el-button size="small" :icon="Download">Export</el-button>
    </template>
    <div class="export-menu">
      <div
        v-for="fmt in formats"
        :key="fmt.key"
        class="export-menu__item"
        @click="$emit('export', fmt.key)"
      >
        <el-icon><component :is="fmt.icon" /></el-icon>
        <div class="export-menu__item-info">
          <span class="export-menu__item-label">{{ fmt.label }}</span>
          <span class="export-menu__item-desc">{{ fmt.desc }}</span>
        </div>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { Download, Document, DataBoard, DataAnalysis } from "@element-plus/icons-vue";
import type { ExportFormat } from "@/utils/export/types";

defineEmits<{ export: [format: ExportFormat] }>();

const formats = [
  { key: "csv" as ExportFormat, label: "CSV", desc: "Comma-separated, UTF-8", icon: Document },
  { key: "xlsx" as ExportFormat, label: "Excel", desc: ".xlsx with auto-fit columns", icon: DataBoard },
  { key: "json" as ExportFormat, label: "JSON", desc: "Pretty-printed with metadata", icon: DataAnalysis },
  { key: "pdf" as ExportFormat, label: "PDF", desc: "Landscape A4, paginated", icon: Document },
];
</script>

<style scoped lang="scss">
.export-menu {
  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    &:hover { background: var(--el-fill-color-light); }
    &-info { display: flex; flex-direction: column; }
    &-label { font-size: 13px; font-weight: 500; }
    &-desc { font-size: 11px; color: var(--el-text-color-secondary); }
  }
}
</style>