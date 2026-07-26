/**
 * Drag-to-resize panel composable.
 */
import { ref } from "vue";

export function useResizable(initialWidth: number, minWidth = 200, maxWidth = 800, storageKey?: string) {
  const width = ref(initialWidth);
  const isResizing = ref(false);

  function loadWidth() {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) width.value = parseInt(saved, 10) || initialWidth;
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

  function startResize(e: MouseEvent) {
    isResizing.value = true;
    const startX = e.clientX;
    const startWidth = width.value;

    function onMove(ev: MouseEvent) {
      if (!isResizing.value) return;
      const delta = ev.clientX - startX;
      const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + delta));
      width.value = newWidth;
    }

    function onUp() {
      isResizing.value = false;
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      saveWidth();
    }

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    e.preventDefault();
  }

  loadWidth();

  return { width, isResizing, startResize };
}
