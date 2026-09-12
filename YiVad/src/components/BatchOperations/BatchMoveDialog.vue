<template>
  <el-dialog v-model="visible" title="Batch Move" width="480px">
    <el-tree-select
      v-model="targetId"
      :data="treeData"
      :props="{ label: 'label', children: 'children' }"
      check-strictly
      filterable
      placeholder="Select destination"
      style="width: 100%"
    />
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" :disabled="!targetId" @click="handleConfirm">Move {{ count }} items</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{ count: number; treeData: { label: string; value: string; children?: any[] }[] }>();
const emit = defineEmits<{ confirm: [targetId: string] }>();

const visible = ref(false);
const targetId = ref<string | null>(null);
const open = () => { visible.value = true; targetId.value = null; };
const close = () => { visible.value = false; };
const handleConfirm = () => { if (targetId.value) emit("confirm", targetId.value); visible.value = false; };
defineExpose({ open, close });
</script>