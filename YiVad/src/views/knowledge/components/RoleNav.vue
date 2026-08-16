<template>
  <div class="role-nav">
    <button
      v-if="all"
      class="role-nav__item"
      :class="{ 'is-active': isAllActive }"
      @click="onAll"
    >
      <span class="role-nav__icon">🌐</span>
      <span class="role-nav__name">All</span>
    </button>
    <button
      v-for="rid in ROLE_IDS"
      :key="rid"
      class="role-nav__item"
      :class="{ 'is-active': isActive(rid) }"
      @click="onSelect(rid)"
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
    /** 当前高亮的角色 id（导航模式）。 */
    active?: string;
    /** 多选筛选模式：以 modelValue 数组 toggle（空数组 = 全部）；默认点击导航到 /knowledge/<role>。 */
    multiple?: boolean;
    /** 多选模式下受控的选中角色 id 集合。 */
    modelValue?: string[];
    /** 是否在首位展示「All」选项（用于筛选而非导航）。 */
    all?: boolean;
  }>(),
  { active: "", multiple: false, modelValue: () => [], all: false }
);

const emit = defineEmits<{ (e: "update:modelValue", rids: string[]): void }>();

const router = useRouter();

const ALL_ID = "all";

function isAllActive(): boolean {
  return props.multiple ? props.modelValue.length === 0 : props.active === ALL_ID;
}

function isActive(rid: string): boolean {
  return props.multiple ? props.modelValue.includes(rid) : rid === props.active;
}

function onAll() {
  if (props.multiple) emit("update:modelValue", []);
}

function onSelect(rid: string) {
  if (props.multiple) {
    const next = props.modelValue.includes(rid)
      ? props.modelValue.filter(r => r !== rid)
      : [...props.modelValue, rid];
    emit("update:modelValue", next);
    return;
  }
  if (rid !== props.active) router.push(`/knowledge/${rid}`);
}
</script>

<style scoped lang="scss">
.role-nav { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; }
.role-nav__item { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 16px; border: 1px solid var(--el-border-color-lighter); background: var(--el-bg-color); cursor: pointer; font-size: 12px; color: var(--el-text-color-regular); transition: all .15s; &:hover { border-color: var(--el-color-primary-light-5); color: var(--el-color-primary); } &.is-active { background: var(--el-color-primary); border-color: var(--el-color-primary); color: #fff; cursor: default; } }
.role-nav__icon { font-size: 13px; }
</style>
