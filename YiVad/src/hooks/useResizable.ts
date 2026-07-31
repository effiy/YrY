/**
 * Drag-to-resize panel composable.
 *
 * `invert` flips the drag direction — use it for resizers on the panel's LEFT
 * edge (e.g. a right-side chat panel), where dragging the handle right should
 * shrink the panel rather than grow it. Left-edge resizers are the common case
 * (default `invert=false`, drag right = grow).
 *
 * Uses Pointer Events so mouse, touch, and pen all work. While dragging, a
 * full-viewport overlay is shown so iframes / hoverable elements don't swallow
 * events, and `body` gets `cursor: col-resize; user-select: none` so the
 * cursor stays consistent and inner text doesn't get selected.
 */
import { onBeforeUnmount, ref } from "vue";

export function useResizable(
  initialWidth: number,
  minWidth = 200,
  maxWidth = 800,
  storageKey?: string,
  invert = false
) {
  const width = ref(initialWidth);
  const isResizing = ref(false);

  function clamp(v: number) {
    return Math.max(minWidth, Math.min(maxWidth, v));
  }

  function loadWidth() {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) width.value = clamp(parseInt(saved, 10) || initialWidth);
    } catch {
      /* ignore */
    }
  }

  function saveWidth() {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, String(width.value));
    } catch {
      /* ignore */
    }
  }

  let pointerId: number | null = null;
  let startX = 0;
  let startWidth = 0;
  let overlay: HTMLDivElement | null = null;

  function applyBodyStyle(active: boolean) {
    if (active) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }

  function ensureOverlay() {
    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "9999";
    overlay.style.cursor = "col-resize";
    // Overlay must receive pointer events, even though it's transparent.
    overlay.style.background = "transparent";
    document.body.appendChild(overlay);
  }

  function removeOverlay() {
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }
    overlay = null;
  }

  function onPointerMove(ev: PointerEvent) {
    if (!isResizing.value || ev.pointerId !== pointerId) return;
    const delta = ev.clientX - startX;
    width.value = clamp(invert ? startWidth - delta : startWidth + delta);
  }

  function endDrag() {
    if (!isResizing.value) return;
    isResizing.value = false;
    pointerId = null;
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", endDrag);
    document.removeEventListener("pointercancel", endDrag);
    removeOverlay();
    applyBodyStyle(false);
    saveWidth();
  }

  function startResize(e: PointerEvent) {
    isResizing.value = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startWidth = width.value;
    applyBodyStyle(true);
    ensureOverlay();
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);
    e.preventDefault();
  }

  loadWidth();

  onBeforeUnmount(() => {
    // If the component unmounts mid-drag, drop the listeners + body styles.
    if (isResizing.value) {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);
      removeOverlay();
      applyBodyStyle(false);
    }
  });

  return { width, isResizing, startResize };
}
