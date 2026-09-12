import { ref, watch, type Ref } from "vue";
import { useDraggable } from "./useDraggable";

export function useSortable(
  containerRef: Ref<HTMLElement | null>,
  items: Ref<{ id: string; [key: string]: any }[]>,
  options: { handle?: string; group?: string; onSort?: (newItems: any[]) => void } = {}
) {
  const draggedIndex = ref(-1);
  const overIndex = ref(-1);

  function getItemIndex(el: HTMLElement): number {
    const parent = containerRef.value;
    if (!parent) return -1;
    const children = Array.from(parent.children);
    return children.indexOf(el);
  }

  function getItemAtPoint(x: number, y: number): HTMLElement | null {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    return (el as HTMLElement).closest("[data-sortable-id]") as HTMLElement | null;
  }

  function onDragStart(e: PointerEvent) {
    const el = (e.target as HTMLElement).closest("[data-sortable-id]") as HTMLElement;
    if (!el) return;
    draggedIndex.value = getItemIndex(el);
  }

  function onDragMove(e: PointerEvent, state: any) {
    const target = getItemAtPoint(e.clientX, e.clientY);
    if (target) {
      overIndex.value = getItemIndex(target);
    }
  }

  function onDragEnd(_e: PointerEvent, _state: any) {
    if (draggedIndex.value === -1 || overIndex.value === -1) return;
    if (draggedIndex.value === overIndex.value) return;

    const newItems = [...items.value];
    const [moved] = newItems.splice(draggedIndex.value, 1);
    newItems.splice(overIndex.value, 0, moved);
    options.onSort?.(newItems);

    draggedIndex.value = -1;
    overIndex.value = -1;
  }

  return { draggedIndex, overIndex, onDragStart, onDragMove, onDragEnd };
}