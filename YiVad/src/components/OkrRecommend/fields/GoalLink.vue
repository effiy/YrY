<template>
  <code class="goal-link" @click="navigate">{{ goalId }}</code>
</template>

<script setup lang="ts" name="GoalLink">
import { useRouter } from "vue-router";

const props = defineProps<{ role: string; goalId: string }>();
const router = useRouter();

function navigate() {
  if (props.goalId) router.push(`/executiver/okr/${props.role}?goal=${props.goalId}`);
}
</script>

<style scoped lang="scss">
.goal-link { font-family: monospace; font-size: 11px; color: var(--el-color-primary); cursor: pointer; &:hover { text-decoration: underline; } }
</style>
