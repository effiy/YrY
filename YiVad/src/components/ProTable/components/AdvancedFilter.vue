<template>
  <el-dialog v-model="visible" title="Advanced Filter" width="600px">
    <FilterPanel
      v-model:conditions="conditions"
      :fields="fields"
      @apply="handleApply"
      @clear="$emit('clear')"
    />
    <div class="advanced-filter__preview" v-if="previewCount !== null">
      <span>{{ previewCount }} records match this filter</span>
    </div>
    <template #footer>
      <el-button @click="visible = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";
import FilterPanel, { type FilterCondition } from "./FilterPanel.vue";

defineProps<{ fields: { key: string; label: string }[]; previewCount?: number | null }>();
const emit = defineEmits<{ apply: [conditions: FilterCondition[]]; clear: [] }>();

const visible = ref(false);
const conditions = ref<FilterCondition[]>([]);

const handleApply = (cond: FilterCondition[]) => {
  emit("apply", cond);
  visible.value = false;
};

const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
defineExpose({ open, close });
</script>

<style scoped lang="scss">
.advanced-filter__preview { margin-top: 12px; padding: 8px; background: var(--el-fill-color-light); border-radius: 4px; font-size: 12px; text-align: center; }
</style>