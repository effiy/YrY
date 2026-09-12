<template>
  <el-dialog v-model="visible" title="Batch Copy" width="440px">
    <p>Copy {{ count }} items to another project?</p>
    <el-checkbox v-model="copyAssociations">Include associated data</el-checkbox>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="primary" @click="handleConfirm">Copy {{ count }} items</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{ count: number }>();
const emit = defineEmits<{ confirm: [includeAssociations: boolean] }>();

const visible = ref(false);
const copyAssociations = ref(false);
const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
const handleConfirm = () => { emit("confirm", copyAssociations.value); visible.value = false; };
defineExpose({ open, close });
</script>