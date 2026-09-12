import { ref, readonly } from "vue";
import type { MenuItem, MenuContext } from "@/components/context-menu/types";

export function useContextMenu() {
  const visible = ref(false);
  const position = ref({ x: 0, y: 0 });
  const items = ref<MenuItem[]>([]);
  const context = ref<MenuContext | null>(null);

  function show(
    event: MouseEvent,
    menuItems: MenuItem[],
    ctx?: Partial<MenuContext>
  ) {
    event.preventDefault();
    event.stopPropagation();
    position.value = { x: event.clientX, y: event.clientY };
    items.value = menuItems;
    context.value = {
      element: event.target as HTMLElement,
      ...ctx,
    };
    visible.value = true;
  }

  function hide() {
    visible.value = false;
    items.value = [];
    context.value = null;
  }

  function showAtTarget(
    target: HTMLElement,
    menuItems: MenuItem[],
    ctx?: Partial<MenuContext>
  ) {
    const rect = target.getBoundingClientRect();
    position.value = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    items.value = menuItems;
    context.value = {
      element: target,
      ...ctx,
    };
    visible.value = true;
  }

  return {
    visible: readonly(visible),
    position: readonly(position),
    items: readonly(items),
    context: readonly(context),
    show,
    hide,
    showAtTarget,
  };
}