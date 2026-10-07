/**
 * useImeComposition — Shared IME composition handling for chat inputs.
 * Prevents Enter-to-send from firing during IME composition (e.g. Chinese/Japanese input).
 */
import { ref } from "vue";

const COMPOSITION_END_DELAY = 160;

export function useImeComposition() {
  const isComposing = ref(false);
  const compositionEndTime = ref(0);

  function onCompositionStart() {
    isComposing.value = true;
    compositionEndTime.value = 0;
  }

  function onCompositionEnd() {
    isComposing.value = false;
    compositionEndTime.value = Date.now();
  }

  /** Call in keydown handler: if true, ignore the Enter key. */
  function shouldSuppressEnter(e: KeyboardEvent): boolean {
    if (e.key !== "Enter" || e.shiftKey) return false;
    if (e.isComposing) return true;
    const elapsed = Date.now() - compositionEndTime.value;
    if (compositionEndTime.value > 0 && elapsed < COMPOSITION_END_DELAY) return true;
    return false;
  }

  return { isComposing, compositionEndTime, onCompositionStart, onCompositionEnd, shouldSuppressEnter };
}