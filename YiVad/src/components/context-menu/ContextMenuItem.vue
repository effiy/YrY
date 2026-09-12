<template>
  <div
    class="context-menu__item"
    :class="{
      'context-menu__item--disabled': item.disabled,
      'context-menu__item--danger': (item as any).danger,
      'context-menu__item--active': active,
    }"
    :title="(item as any).disabledReason || ''"
  >
    <span class="context-menu__item-label">{{ item.label }}</span>
    <span v-if="(item as any).shortcut" class="context-menu__shortcut">{{ (item as any).shortcut }}</span>
    <span v-if="item.type === 'submenu'" class="context-menu__submenu-arrow">▶</span>
  </div>
</template>

<script setup lang="ts">
import type { MenuItem, MenuContext } from "./types";

defineProps<{
  item: MenuItem;
  active: boolean;
  context: MenuContext | null;
}>();
</script>

<style scoped lang="scss">
.context-menu__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: background-color 100ms;

  &:hover:not(&--disabled) {
    background: var(--el-fill-color-light);
  }

  &--active {
    background: var(--el-fill-color-light);
  }

  &--disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
  }

  &--danger {
    color: var(--el-color-danger);
  }
}

.context-menu__item-label {
  flex: 1;
}

.context-menu__shortcut {
  margin-left: 24px;
  font-size: 11px;
  color: var(--el-text-color-secondary);
}

.context-menu__submenu-arrow {
  margin-left: 8px;
  font-size: 10px;
}
</style>