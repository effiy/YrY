import { ref, type Ref } from "vue";
import { useDraggable } from "./useDraggable";

export function useTabDrag(
  tabRef: Ref<HTMLElement | null>,
  onReorder: (fromIndex: number, toIndex: number) => void
) {
  const isDragging = ref(false);
  const dragIndex = ref(-1);

  const { state, onDragStart, onDragEnd } = useDraggable(tabRef, {
    axis: "horizontal",
  });

  onDragStart(() => {
    isDragging.value = true;
  });

  onDragEnd(() => {
    isDragging.value = false;
    dragIndex.value = -1;
  });

  return { isDragging, dragIndex };
}