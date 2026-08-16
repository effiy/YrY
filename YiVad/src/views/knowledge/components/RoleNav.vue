<template>
  <div class="role-nav">
    <button
      v-for="rid in ROLE_IDS"
      :key="rid"
      class="role-nav__item"
      :class="{ 'is-active': rid === active }"
      @click="rid !== active && router.push(`/knowledge/${rid}`)"
    >
      <span class="role-nav__icon">{{ rolesData[rid].icon }}</span>
      <span class="role-nav__name">{{ rolesData[rid].name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts" name="RoleNav">
import { useRouter } from "vue-router";
import { rolesData, ROLE_IDS } from "@/views/knowledge/executiver/okrData";

defineProps<{ active: string }>();

const router = useRouter();
</script>

<style scoped lang="scss">
.role-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.role-nav__item { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--el-border-color-lighter); background: var(--el-bg-color); cursor: pointer; font-size: 12px; color: var(--el-text-color-regular); transition: all .15s; &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); } &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; cursor: default; } }
.role-nav__icon { font-size: 13px; }
</style>
