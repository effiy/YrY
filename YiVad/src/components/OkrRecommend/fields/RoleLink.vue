<template>
  <span class="role-link" @click="navigate">{{ roleIcon }} {{ roleName }}</span>
</template>

<script setup lang="ts" name="RoleLink">
import { useRouter } from "vue-router";

const props = defineProps<{ role: string; roleName: string; roleIcon: string }>();
const router = useRouter();

function navigate() {
  if (props.role) router.push(`/executiver/okr/${props.role}`);
}
</script>

<style scoped lang="scss">
.role-link { font-size: 12px; cursor: pointer; transition: color 0.15s; &:hover { color: var(--el-color-primary); } }
</style>
