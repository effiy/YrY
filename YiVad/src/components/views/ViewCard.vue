<template>
  <div class="view-card-grid">
    <div v-for="row in data" :key="row[rowKey]" class="view-card" @click="$emit('rowClick', row)">
      <div v-for="col in visibleColumns" :key="col.key" class="view-card__field">
        <span class="view-card__field-label">{{ col.label }}</span>
        <span class="view-card__field-value">{{ row[col.key] ?? "" }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ColumnConfig } from "@/hooks/useColumnManager";

defineProps<{
  data: Record<string, any>[];
  columns: ColumnConfig[];
  visibleColumns: ColumnConfig[];
  rowKey: string;
}>();
defineEmits<{ rowClick: [row: Record<string, any>] }>();
</script>

<style scoped lang="scss">
.view-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
.view-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: var(--el-box-shadow-light); }
  &__field { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
  &__field-label { color: var(--el-text-color-secondary); }
}
</style>