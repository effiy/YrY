/**
 * Keyboard shortcuts for the aicr chat panel.
 *
 * - Enter (no Shift, IME-aware) → send message
 * - Shift+Enter → newline (browser default)
 * - Escape (when chat textarea focused) → clear input + draft images
 * - Ctrl+S / Cmd+S (document-level) → persist active session
 *
 * Mirrors `useAiChatShortcuts`. IME handling copies YiWeb's
 * `sessionChatContextChatMethods.onSessionChatKeydown`: after
 * `compositionend`, Enter is rejected for `COMPOSITION_END_DELAY` ms so the
 * key used to confirm the IME candidate doesn't also submit the message.
 */
import { onMounted, onUnmounted, ref } from "vue";
import type { useAicrChatStore } from "@/stores/modules/aicr/chat";

const COMPOSITION_END_DELAY = 160;

type Store = ReturnType<typeof useAicrChatStore>;

function isChatTextarea(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && el.tagName === "TEXTAREA" && el.classList.contains("el-textarea__inner");
}

export function useAicrShortcuts(store: Store) {
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

  function onKeydown(e: KeyboardEvent) {
    if (isComposing.value) return;
    if (e.key === "Enter") {
      if (e.isComposing) return;
      const elapsed = Date.now() - compositionEndTime.value;
      if (compositionEndTime.value > 0 && elapsed < COMPOSITION_END_DELAY) return;
      if (!e.shiftKey) {
        e.preventDefault();
        compositionEndTime.value = 0;
        store.sendMessage();
      }
      return;
    }
    if (e.key === "Escape") {
      if (store.input || store.draftImages.length) {
        if (isChatTextarea(e.target)) {
          e.preventDefault();
          store.clearInput();
        }
      }
    }
  }

  function onPaste(e: ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || typeof item.type !== "string" || !item.type.includes("image")) continue;
      const file = item.getAsFile?.();
      if (!file) continue;
      e.preventDefault();
      store.uploadImage(file).then(url => store.addDraftImage(url)).catch(() => {});
      return;
    }
  }

  function onCtrlSave(e: KeyboardEvent) {
    const isSave = (e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S");
    if (!isSave) return;
    e.preventDefault();
    store.persistActive();
  }

  onMounted(() => {
    document.addEventListener("keydown", onCtrlSave, true);
  });

  onUnmounted(() => {
    document.removeEventListener("keydown", onCtrlSave, true);
  });

  return {
    isComposing,
    compositionEndTime,
    onCompositionStart,
    onCompositionEnd,
    onKeydown,
    onPaste
  };
}
