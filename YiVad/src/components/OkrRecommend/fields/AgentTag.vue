<template>
  <el-tag size="small" effect="plain">{{ agent }}</el-tag>
</template>

<script setup lang="ts" name="AgentTag">
defineProps<{ agent: string }>();
</script>
