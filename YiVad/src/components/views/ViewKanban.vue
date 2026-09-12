<template>
  <div class="view-kanban">
    <div v-for="col in kanbanColumns" :key="col.key" class="view-kanban__column">
      <div class="view-kanban__column-header">
        <span>{{ col.label }}</span>
        <el-tag size="small" round>{{ col.items.length }}</el-tag>
      </div>
      <div class="view-kanban__column-body">
        <div v-for="item in col.items" :key="item[rowKey]" class="view-kanban__card" @click="$emit('rowClick', item)">
          <slot name="card" :item="item">
            <div class="view-kanban__card-title">{{ item.title ?? item.name ?? item.key }}</div>
            <div v-for="f in displayFields" :key="f" class="view-kanban__card-field">{{ item[f] ?? "" }}</div>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  data: Record<string, any>[];
  groupBy: string;
  displayFields: string[];
  rowKey: string;
}>();

defineEmits<{ rowClick: [row: Record<string, any>] }>();

interface KanbanColumn { key: string; label: string; items: Record<string, any>[] }

const kanbanColumns = computed<KanbanColumn[]>(() => {
  const groups = new Map<string, Record<string, any>[]>();
  props.data.forEach((row) => {
    const key = String(row[props.groupBy] ?? "Other");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  });
  return Array.from(groups.entries()).map(([key, items]) => ({ key, label: key, items }));
});
</script>

<style scoped lang="scss">
.view-kanban {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  min-height: 200px;
  &__column {
    flex: 0 0 260px;
    background: var(--el-fill-color-lighter);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    &-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      font-weight: 600;
      font-size: 13px;
    }
    &-body {
      flex: 1;
      padding: 0 8px 8px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }
  &__card {
    background: var(--el-bg-color);
    border-radius: 6px;
    padding: 10px 12px;
    cursor: pointer;
    border: 1px solid var(--el-border-color-lighter);
    &:hover { border-color: var(--el-color-primary); }
    &-title { font-weight: 500; font-size: 13px; margin-bottom: 4px; }
    &-field { font-size: 12px; color: var(--el-text-color-secondary); }
  }
}
</style>