<script setup lang="ts">
defineProps<{
  selectedModel?: string;
  availableModels?: string[];
  modelsLoading?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:selectedModel", model: string): void;
}>();
</script>

<template>
  <el-select
    :model-value="selectedModel"
    :loading="modelsLoading"
    placeholder="Select model"
    size="default"
    class="ct-model-select"
    @update:model-value="emit('update:selectedModel', $event)"
  >
    <el-option
      v-for="m in (availableModels ?? [])"
      :key="m"
      :label="m"
      :value="m"
    />
  </el-select>
</template>

<style scoped lang="scss">
.ct-model-select {
  width: 180px;
}
</style>