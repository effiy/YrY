import { onMounted, onBeforeUnmount, type Ref } from "vue";
import type { InputInstance } from "element-plus";

export function useRagKeyboard(inputRef: Ref<InputInstance | undefined>) {
  function focus() {
    inputRef.value?.focus?.();
  }

  function handler(e: KeyboardEvent) {
    if (e.key !== "/") return;
    const target = e.target as HTMLElement | null;
    const tag = target?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable === true) return;
    e.preventDefault();
    focus();
  }

  onMounted(() => window.addEventListener("keydown", handler));
  onBeforeUnmount(() => window.removeEventListener("keydown", handler));

  return { focus };
}