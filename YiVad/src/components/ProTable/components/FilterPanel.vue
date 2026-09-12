<template>
  <div class="filter-panel">
    <div v-for="(cond, idx) in conditions" :key="idx" class="filter-panel__condition">
      <el-select v-if="idx > 0" v-model="cond.logic" size="small" style="width: 70px">
        <el-option label="AND" value="and" />
        <el-option label="OR" value="or" />
      </el-select>
      <el-select v-model="cond.field" size="small" placeholder="Field" style="width: 130px">
        <el-option v-for="f in fields" :key="f.key" :label="f.label" :value="f.key" />
      </el-select>
      <el-select v-model="cond.operator" size="small" style="width: 120px">
        <el-option v-for="op in operators" :key="op.key" :label="op.label" :value="op.key" />
      </el-select>
      <el-input v-if="cond.operator !== 'is_empty' && cond.operator !== 'not_empty'" v-model="cond.value" size="small" placeholder="Value" style="width: 140px" />
      <el-button size="small" text :icon="Delete" @click="removeCondition(idx)" />
    </div>
    <div class="filter-panel__footer">
      <el-button size="small" text @click="addCondition">+ Add condition</el-button>
      <div>
        <el-button size="small" @click="$emit('clear')">Clear</el-button>
        <el-button size="small" type="primary" @click="$emit('apply', conditions)">Apply</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Delete } from "@element-plus/icons-vue";

export interface FilterCondition {
  field: string;
  operator: string;
  value: any;
  logic?: "and" | "or";
}

const props = withDefaults(defineProps<{ conditions: FilterCondition[]; fields: { key: string; label: string }[] }>(), { conditions: () => [] });
const emit = defineEmits<{ "update:conditions": [value: FilterCondition[]]; apply: [value: FilterCondition[]]; clear: [] }>();

const operators = [
  { key: "eq", label: "Equals" },
  { key: "neq", label: "Not equals" },
  { key: "contains", label: "Contains" },
  { key: "not_contains", label: "Not contains" },
  { key: "gt", label: "Greater than" },
  { key: "lt", label: "Less than" },
  { key: "between", label: "Between" },
  { key: "is_empty", label: "Is empty" },
  { key: "not_empty", label: "Not empty" },
  { key: "starts_with", label: "Starts with" },
  { key: "ends_with", label: "Ends with" },
];

const addCondition = () => {
  emit("update:conditions", [...props.conditions, { field: "", operator: "contains", value: "", logic: "and" }]);
};
const removeCondition = (idx: number) => {
  const arr = [...props.conditions]; arr.splice(idx, 1); emit("update:conditions", arr);
};
</script>

<style scoped lang="scss">
.filter-panel {
  padding: 8px;
  &__condition { display: flex; gap: 8px; align-items: center; margin-bottom: 8px; }
  &__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--el-border-color-lighter); }
}
</style>