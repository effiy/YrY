<template>
  <UniversalContextMenu
    :visible="cm.visible.value"
    :position="cm.position.value"
    :items="itemsBridge"
    :context="(cm.context.value as any) ?? null"
    @hide="cm.hide()"
  />
</template>

<script setup lang="ts">
/**
 * RowActions/ContextMenu — 行级右键菜单（兼容层）。
 *
 * 薄封装：底层统一复用 components/context-menu（通用 a11y 实现，支持子菜单/键盘导航/防溢出定位）。
 * 本层只做一件事：
 *   旧 API（{ key/label/icon/danger/divider/onClick }）→  桥接 →  新 API（MenuItem 联合类型）
 *
 * 对外 API 保持 100% 向下兼容：
 *   const ref = ref<InstanceType<typeof RowActionsContextMenu>>()
 *   ref.value?.open(event, items)
 *   ref.value?.close()
 *
 * @deprecated 新代码建议直接使用：
 *   import { useContextMenu } from "@/composables/menu/useContextMenu"
 *   const cm = useContextMenu()
 *   + <ContextMenu :visible :position :items :context />
 */
import { computed } from "vue";
import UniversalContextMenu from "@/components/context-menu/ContextMenu.vue";
import { useContextMenu } from "@/composables/menu/useContextMenu";
import type { MenuItem, MenuContext } from "@/components/context-menu/types";

/**
 * 旧版行操作菜单项契约。
 * @deprecated 新代码使用 MenuItem（通用联合类型）。
 */
export interface ContextMenuItem {
  key: string;
  label: string;
  icon?: any;
  danger?: boolean;
  divider?: boolean;
  onClick: () => void;
}

const cm = useContextMenu();

/** 把旧契约数组 → MenuItem 数组。通用 ContextMenu 原生支持 divider/action/disabled/danger/submenu/键盘导航。 */
const itemsBridge = computed<MenuItem[]>(() =>
  cm.items.value.map(raw => {
    const i = raw as unknown as ContextMenuItem;
    return i.divider
      ? { id: i.key, type: "divider" as const }
      : ({
          id: i.key,
          type: "action" as const,
          label: i.label,
          danger: i.danger,
          icon: i.icon,
          action: () => i.onClick?.()
        } as Extract<MenuItem, { type: "action" }>);
  })
);

defineExpose({
  /** 与旧 API 100% 同签名：打开行右键菜单。 */
  open: (event: MouseEvent, menuItems: ContextMenuItem[]) =>
    cm.show(event, menuItems as unknown as Parameters<typeof cm.show>[1]),
  close: cm.hide
});
</script>
