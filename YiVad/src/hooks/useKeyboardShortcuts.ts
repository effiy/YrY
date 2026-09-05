import { onMounted, onBeforeUnmount, type Ref } from "vue";

export interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  handler: (e: KeyboardEvent) => void;
  disableInInput?: boolean;
  scope?: Ref<boolean>;
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);

    for (const s of shortcuts) {
      if (s.scope && !s.scope.value) continue;
      if (s.disableInInput !== false && isInput) continue;
      if (s.ctrl && !(e.ctrlKey || e.metaKey)) continue;
      if (s.shift && !e.shiftKey) continue;

      if (e.key.toLowerCase() === s.key.toLowerCase()) {
        e.preventDefault();
        s.handler(e);
        return;
      }
    }
  }

  onMounted(() => window.addEventListener("keydown", onKeydown));
  onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));
}