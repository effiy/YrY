<template>
  <el-popover placement="bottom" :width="320" trigger="click">
    <template #reference>
      <el-button size="small" :icon="Sort">Sort</el-button>
    </template>
    <div class="sort-config">
      <div class="sort-config__header">
        <span>Sort Configuration</span>
        <el-button size="small" text @click="addSort">+ Add</el-button>
      </div>
      <div v-for="(sort, idx) in modelValue" :key="idx" class="sort-config__row">
        <el-select v-model="sort.field" size="small" placeholder="Field" style="width: 140px">
          <el-option v-for="c in columns" :key="c.key" :label="c.label" :value="c.key" />
        </el-select>
        <el-select v-model="sort.order" size="small" style="width: 90px">
          <el-option label="Ascending" value="asc" />
          <el-option label="Descending" value="desc" />
        </el-select>
        <el-button size="small" text :icon="Delete" @click="removeSort(idx)" />
      </div>
      <div v-if="modelValue.length === 0" class="sort-config__empty">Click "+ Add" to add sort fields</div>
      <div class="sort-config__footer">
        <el-button size="small" @click="$emit('clear')">Clear</el-button>
        <el-button size="small" type="primary" @click="$emit('apply', modelValue)">Apply</el-button>
      </div>
    </div>
  </el-popover>
</template>

<script setup lang="ts">
import { Sort, Delete } from "@element-plus/icons-vue";

export interface SortField { field: string; order: "asc" | "desc" }

const props = withDefaults(defineProps<{ modelValue: SortField[]; columns: { key: string; label: string }[] }>(), { modelValue: () => [] });
const emit = defineEmits<{ "update:modelValue": [value: SortField[]]; apply: [value: SortField[]]; clear: [] }>();

const addSort = () => emit("update:modelValue", [...props.modelValue, { field: "", order: "asc" as const }]);
const removeSort = (idx: number) => { const arr = [...props.modelValue]; arr.splice(idx, 1); emit("update:modelValue", arr); };
</script>

<style scoped lang="scss">
.sort-config {
  &__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 13px; font-weight: 500; }
  &__row { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  &__empty { padding: 16px; text-align: center; color: var(--el-text-color-secondary); font-size: 12px; }
  &__footer { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--el-border-color-lighter); }
}
</style>