<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="context-menu"
      :style="{ top: y + 'px', left: x + 'px' }"
      role="menu"
      @click.stop
    >
      <div
        v-for="item in items"
        :key="item.key"
        class="context-menu__item"
        :class="{ 'context-menu__item--danger': item.danger, 'context-menu__item--divider': item.divider }"
        role="menuitem"
        @click="handleClick(item)"
      >
        <el-icon v-if="item.icon" class="context-menu__item-icon"><component :is="item.icon" /></el-icon>
        {{ item.label }}
      </div>
    </div>
  </Teleport>
  <div v-if="visible" class="context-menu__backdrop" @click="close" @contextmenu.prevent="close" />
</template>

<script setup lang="ts">
import { ref } from "vue";

export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: any;
  danger?: boolean;
  divider?: boolean;
  onClick: () => void;
}

const visible = ref(false);
const x = ref(0);
const y = ref(0);
const items = ref<ContextMenuItem[]>([]);

const open = (e: MouseEvent, menuItems: ContextMenuItem[]) => {
  e.preventDefault();
  items.value = menuItems.filter((i) => !i.divider);
  x.value = Math.min(e.clientX, window.innerWidth - 200);
  y.value = Math.min(e.clientY, window.innerHeight - items.value.length * 36 - 16);
  visible.value = true;
};

const close = () => { visible.value = false; };

const handleClick = (item: ContextMenuItem) => {
  item.onClick();
  close();
};

defineExpose({ open, close });
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  box-shadow: var(--el-box-shadow);
  padding: 4px 0;
  &__backdrop { position: fixed; inset: 0; z-index: 9998; }
  &__item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
    &:hover { background: var(--el-fill-color-light); }
    &--danger { color: var(--el-color-danger); }
    &--divider { border-top: 1px solid var(--el-border-color-lighter); margin-top: 4px; padding-top: 10px; }
    &-icon { font-size: 14px; }
  }
}
</style>