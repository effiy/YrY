<template>
  <div class="knowledge-error">
    <el-result icon="error" title="Failed to load files" :sub-title="message">
      <template #extra>
        <el-button type="primary" @click="$emit('retry')">Retry</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts" name="KnowledgeError">
defineProps<{ message: string }>();
defineEmits<{ (e: "retry"): void }>();
</script>

<style scoped lang="scss">
.knowledge-error {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
</style>