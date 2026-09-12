import { ref, onMounted, onUnmounted, type Ref } from "vue";

export function useKeyboardSortable(
  items: Ref<{ id: string; [key: string]: any }[]>,
  options: { onSort?: (newItems: any[]) => void } = {}
) {
  const isActive = ref(false);
  const activeIndex = ref(-1);

  function activate(index: number) {
    isActive.value = true;
    activeIndex.value = index;
  }

  function deactivate() {
    isActive.value = false;
    activeIndex.value = -1;
  }

  function moveUp() {
    if (!isActive.value || activeIndex.value <= 0) return;
    const newItems = [...items.value];
    [newItems[activeIndex.value - 1], newItems[activeIndex.value]] =
      [newItems[activeIndex.value], newItems[activeIndex.value - 1]];
    activeIndex.value--;
    options.onSort?.(newItems);
  }

  function moveDown() {
    if (!isActive.value || activeIndex.value >= items.value.length - 1) return;
    const newItems = [...items.value];
    [newItems[activeIndex.value], newItems[activeIndex.value + 1]] =
      [newItems[activeIndex.value + 1], newItems[activeIndex.value]];
    activeIndex.value++;
    options.onSort?.(newItems);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") deactivate();
  }

  onMounted(() => document.addEventListener("keydown", handleKeydown));
  onUnmounted(() => document.removeEventListener("keydown", handleKeydown));

  return { isActive, activeIndex, activate, deactivate, moveUp, moveDown };
}