import { ref, type Ref } from "vue";

interface DroppableOptions {
  accept?: string[];
  group?: string;
}

export function useDroppable(
  elementRef: Ref<HTMLElement | null>,
  options: DroppableOptions = {}
) {
  const isOver = ref(false);
  const onDropHandlers: Array<(data: Record<string, unknown>) => void> = [];
  const onDragOverHandlers: Array<() => void> = [];
  const onDragLeaveHandlers: Array<() => void> = [];

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    isOver.value = true;
    onDragOverHandlers.forEach((fn) => fn());
  }

  function handleDragLeave() {
    isOver.value = false;
    onDragLeaveHandlers.forEach((fn) => fn());
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isOver.value = false;
    try {
      const data = JSON.parse(e.dataTransfer?.getData("text/plain") || "{}");
      onDropHandlers.forEach((fn) => fn(data));
    } catch { /* ignore */ }
  }

  function onDrop(fn: (data: Record<string, unknown>) => void) { onDropHandlers.push(fn); }
  function onDragOver(fn: () => void) { onDragOverHandlers.push(fn); }
  function onDragLeave(fn: () => void) { onDragLeaveHandlers.push(fn); }

  return { isOver, handleDragOver, handleDragLeave, handleDrop, onDrop, onDragOver, onDragLeave };
}