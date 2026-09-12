import { onMounted, onUnmounted } from "vue";
import { useUndoRedoStore } from "@/stores/modules/undoRedo";

export function useUndoKeyboard() {
  const undoRedoStore = useUndoRedoStore();

  function handleKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    const isFormElement =
      tagName === "input" ||
      tagName === "textarea" ||
      tagName === "select" ||
      isEditable;

    const { ctrlKey, metaKey, shiftKey, key } = event;
    const modKey = ctrlKey || metaKey;

    if (modKey && !shiftKey && (key === "z" || key === "Z")) {
      if (isFormElement) {
        if (tagName === "input" || tagName === "textarea") {
          const inputEl = target as HTMLInputElement;
          if (inputEl.value.length > 0) return;
        }
        if (isEditable) return;
      }
      event.preventDefault();
      undoRedoStore.undoCurrentScope();
    }

    if (
      (modKey && shiftKey && (key === "z" || key === "Z")) ||
      (modKey && !shiftKey && (key === "y" || key === "Y"))
    ) {
      if (isFormElement) return;
      event.preventDefault();
      undoRedoStore.redoCurrentScope();
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeydown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeydown);
  });
}