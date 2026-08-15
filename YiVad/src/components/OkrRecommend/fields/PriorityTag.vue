<template>
  <el-tag size="small" effect="dark" :type="tagType">{{ priority }}</el-tag>
</template>

<script setup lang="ts" name="PriorityTag">
import { computed } from "vue";
import { priorityType } from "../format";
import type { OkrPriority } from "../okrRecommend";

const props = defineProps<{ priority: OkrPriority }>();

const tagType = computed(() => priorityType(props.priority));
</script>
