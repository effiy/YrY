<script setup lang="ts" name="depEditor">
import { ref } from "vue";

defineProps<{ allStories: string[]; availableDirs: string[] }>();
const emit = defineEmits<{ confirm: [depDir: string, relation: string]; cancel: [] }>();

const depDir = ref("");
const relation = ref("blocks");
const relationOptions = [
  { label: "blocks", value: "blocks" },
  { label: "input", value: "input" },
  { label: "reference", value: "reference" }
];

function handleConfirm() {
  if (depDir.value.trim()) {
    emit("confirm", depDir.value.trim(), relation.value);
    depDir.value = "";
  }
}
</script>

<template>
  <div class="dep-editor">
    <el-input v-model="depDir" placeholder="Dependency directory..." size="small" />
    <el-select v-model="relation" size="small"
      ><el-option v-for="o in relationOptions" :key="o.value" :label="o.label" :value="o.value"
    /></el-select>
    <el-button size="small" type="primary" @click="handleConfirm" :disabled="!depDir.trim()">Confirm</el-button>
    <el-button size="small" @click="emit('cancel')">Cancel</el-button>
  </div>
</template>

<style scoped lang="scss">
.dep-editor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  flex-wrap: wrap;
}
</style>
