<template>
  <div class="row-actions">
    <slot />
    <el-button v-for="action in primaryActions" :key="action.key" size="small" text :icon="action.icon" @click.stop="action.onClick()">
      {{ action.label }}
    </el-button>
    <el-dropdown v-if="moreActions.length" trigger="click" @command="(key: string) => moreActions.find(a => a.key === key)?.onClick()">
      <el-button size="small" text :icon="MoreFilled" />
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="a in moreActions" :key="a.key" :command="a.key">{{ a.label }}</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { MoreFilled } from "@element-plus/icons-vue";

export interface RowAction {
  key: string;
  label: string;
  icon?: any;
  onClick: () => void;
  primary?: boolean;
}

const props = defineProps<{ actions: RowAction[]; maxPrimary?: number }>();
const max = props.maxPrimary ?? 3;
const primaryActions = computed(() => props.actions.filter((a) => a.primary !== false).slice(0, max));
const moreActions = computed(() => props.actions.filter((a) => a.primary === false || !primaryActions.value.includes(a)));
</script>

<style scoped lang="scss">
.row-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
</style>