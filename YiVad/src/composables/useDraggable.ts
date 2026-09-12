import { ref, onMounted, onUnmounted, type Ref } from "vue";

interface DraggableOptions {
  handle?: string;
  axis?: "vertical" | "horizontal" | "both";
  cancel?: string;
  group?: string;
  data?: Record<string, unknown>;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  sourceElement: HTMLElement | null;
}

export function useDraggable(
  elementRef: Ref<HTMLElement | null>,
  options: DraggableOptions = {}
) {
  const { handle, axis = "both", cancel, group = "default", data = {} } = options;

  const state = ref<DragState>({
    isDragging: false, startX: 0, startY: 0,
    currentX: 0, currentY: 0, deltaX: 0, deltaY: 0, sourceElement: null,
  });

  const onDragStartHandlers: Array<(e: PointerEvent) => void> = [];
  const onDragMoveHandlers: Array<(e: PointerEvent, state: DragState) => void> = [];
  const onDragEndHandlers: Array<(e: PointerEvent, state: DragState) => void> = [];

  function onPointerDown(e: PointerEvent) {
    const el = elementRef.value;
    if (!el) return;
    if (handle) {
      const target = e.target as HTMLElement;
      if (!target.closest(handle)) return;
    }
    if (cancel) {
      const target = e.target as HTMLElement;
      if (target.closest(cancel)) return;
    }

    e.preventDefault();
    el.setPointerCapture(e.pointerId);

    state.value = {
      isDragging: true,
      startX: e.clientX, startY: e.clientY,
      currentX: e.clientX, currentY: e.clientY,
      deltaX: 0, deltaY: 0,
      sourceElement: el,
    };

    onDragStartHandlers.forEach((fn) => fn(e));
  }

  function onPointerMove(e: PointerEvent) {
    if (!state.value.isDragging) return;
    const dx = axis !== "vertical" ? e.clientX - state.value.startX : 0;
    const dy = axis !== "horizontal" ? e.clientY - state.value.startY : 0;

    state.value = {
      ...state.value,
      currentX: e.clientX, currentY: e.clientY,
      deltaX: dx, deltaY: dy,
    };

    onDragMoveHandlers.forEach((fn) => fn(e, state.value));
  }

  function onPointerUp(e: PointerEvent) {
    if (!state.value.isDragging) return;
    onDragEndHandlers.forEach((fn) => fn(e, state.value));
    state.value = {
      isDragging: false, startX: 0, startY: 0,
      currentX: 0, currentY: 0, deltaX: 0, deltaY: 0, sourceElement: null,
    };
  }

  function onDragStart(fn: (e: PointerEvent) => void) { onDragStartHandlers.push(fn); }
  function onDragMove(fn: (e: PointerEvent, state: DragState) => void) { onDragMoveHandlers.push(fn); }
  function onDragEnd(fn: (e: PointerEvent, state: DragState) => void) { onDragEndHandlers.push(fn); }

  onMounted(() => {
    const el = elementRef.value;
    if (!el) return;
    el.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
  });

  onUnmounted(() => {
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  });

  return { state, onDragStart, onDragMove, onDragEnd };
}