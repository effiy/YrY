<template>
  <el-tag size="small" effect="plain" :class="{ 'is-clickable': clickable }" @click="clickable && $emit('open')">{{ agent }}</el-tag>
</template>

<script setup lang="ts" name="AgentTag">
defineProps<{ agent: string; clickable?: boolean }>();
defineEmits<{ open: [] }>();
</script>

<style scoped>
.is-clickable { cursor: pointer; }
.is-clickable:hover { opacity: 0.8; }
</style>