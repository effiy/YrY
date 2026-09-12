<script setup lang="ts">
defineProps<{
  message?: string;
}>();

defineEmits<{
  (e: "retry"): void;
}>();
</script>

<template>
  <div class="chat-error">
    <el-result icon="error" :title="message || 'Failed to load'">
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">Retry</el-button>
      </template>
    </el-result>
  </div>
</template>

<style scoped lang="scss">
.chat-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
}
</style>