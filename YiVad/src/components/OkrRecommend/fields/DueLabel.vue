<template>
  <span class="due-label" :class="{ 'due-label--overdue': overdue }">{{ dueDate }}</span>
</template>

<script setup lang="ts" name="DueLabel">
import { computed } from "vue";
import { isOverdue } from "../format";

const props = defineProps<{ dueDate: string }>();

const overdue = computed(() => isOverdue(props.dueDate));
</script>

<style scoped lang="scss">
.due-label--overdue {
  font-weight: 700;
  color: var(--el-color-danger);
}
</style>
