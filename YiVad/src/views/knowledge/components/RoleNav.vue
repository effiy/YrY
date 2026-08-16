<template>
  <div class="role-nav">
    <button
      v-if="all"
      class="role-nav__item"
      :class="{ 'is-active': active === ALL_ID }"
      @click="select(ALL_ID)"
    >
      <span class="role-nav__icon">🌐</span>
      <span class="role-nav__name">All</span>
    </button>
    <button
      v-for="rid in ROLE_IDS"
      :key="rid"
      class="role-nav__item"
      :class="{ 'is-active': rid === active }"
      @click="select(rid)"
    >
      <span class="role-nav__icon">{{ rolesData[rid].icon }}</span>
      <span class="role-nav__name">{{ rolesData[rid].name }}</span>
    </button>
  </div>
</template>

<script setup lang="ts" name="RoleNav">
import { useRouter } from "vue-router";
import { rolesData, ROLE_IDS } from "@/views/knowledge/executiver/okrData";

const props = withDefaults(
  defineProps<{
    active: string;
    /** 选择模式：点击切换选中并 emit update:active（不导航）；默认点击导航到 /knowledge/<role>。 */
    selectable?: boolean;
    /** 是否在首位展示「All」选项（用于筛选而非导航）。 */
    all?: boolean;
  }>(),
  { selectable: false, all: false }
);

const emit = defineEmits<{ (e: "update:active", rid: string): void }>();

const router = useRouter();

const ALL_ID = "all";

function select(rid: string) {
  if (rid === props.active) return;
  if (props.selectable) emit("update:active", rid);
  else router.push(`/knowledge/${rid}`);
}
</script>

<style scoped lang="scss">
.role-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.role-nav__item { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--el-border-color-lighter); background: var(--el-bg-color); cursor: pointer; font-size: 12px; color: var(--el-text-color-regular); transition: all .15s; &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); } &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; cursor: default; } }
.role-nav__icon { font-size: 13px; }
</style>
