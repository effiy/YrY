<template>
  <el-tag size="small" effect="light" :type="tagType">{{ label }}</el-tag>
</template>

<script setup lang="ts" name="McpTag">
import { computed } from "vue";
import { mcpTagType, mcpLabel } from "../format";

const props = defineProps<{ mcp: string }>();

const tagType = computed(() => mcpTagType(props.mcp));
const label = computed(() => mcpLabel(props.mcp));
</script>
