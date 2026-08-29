<template>
  <el-tag size="small" effect="light" :type="tagType" :class="{ 'is-clickable': clickable }" @click="clickable && $emit('open')">{{ label }}</el-tag>
</template>

<script setup lang="ts" name="McpTag">
import { computed } from "vue";
import { mcpTagType, mcpLabel } from "../format";

const props = defineProps<{ mcp: string; clickable?: boolean }>();
defineEmits<{ open: [] }>();

const tagType = computed(() => mcpTagType(props.mcp));
const label = computed(() => mcpLabel(props.mcp));
</script>

<style scoped>
.is-clickable { cursor: pointer; }
.is-clickable:hover { opacity: 0.8; }
</style>