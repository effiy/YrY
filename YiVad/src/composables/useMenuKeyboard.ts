import { ref, onMounted, onUnmounted, type Ref } from "vue";
import type { MenuItem } from "@/components/context-menu/types";

export function useMenuKeyboard(
  visible: Ref<boolean>,
  items: Ref<MenuItem[]>,
  onSelect: (index: number) => void,
  onClose: () => void
) {
  const activeIndex = ref(-1);

  function handleKeydown(e: KeyboardEvent) {
    if (!visible.value) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        activeIndex.value = Math.min(activeIndex.value + 1, items.value.length - 1);
        while (
          activeIndex.value < items.value.length &&
          (items.value[activeIndex.value]?.disabled ||
            items.value[activeIndex.value]?.type === "divider")
        ) {
          activeIndex.value++;
        }
        if (activeIndex.value >= items.value.length) activeIndex.value = 0;
        break;

      case "ArrowUp":
        e.preventDefault();
        activeIndex.value = Math.max(activeIndex.value - 1, 0);
        while (
          activeIndex.value > 0 &&
          (items.value[activeIndex.value]?.disabled ||
            items.value[activeIndex.value]?.type === "divider")
        ) {
          activeIndex.value--;
        }
        break;

      case "Enter":
        e.preventDefault();
        if (activeIndex.value >= 0) {
          onSelect(activeIndex.value);
        }
        break;

      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }

  onMounted(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", handleKeydown);
  });

  return { activeIndex };
}