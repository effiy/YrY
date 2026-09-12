<template>
  <el-dialog v-model="visible" title="Batch Delete" width="440px">
    <p>Are you sure you want to delete {{ count }} items? This action cannot be undone.</p>
    <template #footer>
      <el-button @click="visible = false">Cancel</el-button>
      <el-button type="danger" @click="handleConfirm">Delete {{ count }} items</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{ count: number }>();
const emit = defineEmits<{ confirm: [] }>();

const visible = ref(false);
const open = () => { visible.value = true; };
const close = () => { visible.value = false; };
const handleConfirm = () => { emit("confirm"); visible.value = false; };
defineExpose({ open, close });
</script>