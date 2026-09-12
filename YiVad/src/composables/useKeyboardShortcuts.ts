import { onMounted, onUnmounted, watch, ref, type Ref } from "vue";
import { shortcutRegistry } from "@/shortcuts/registry";
import type { ShortcutDefinition, ShortcutScope } from "@/shortcuts/registry";

interface UseKeyboardShortcutsOptions {
  scope: Ref<ShortcutScope> | ShortcutScope;
  enabled?: Ref<boolean> | boolean;
}

export function useKeyboardShortcuts(
  shortcuts: Omit<ShortcutDefinition, "scope">[],
  options: UseKeyboardShortcutsOptions
) {
  const scope = ref(typeof options.scope === "string" ? options.scope : options.scope.value);
  const isEnabled = ref(
    typeof options.enabled === "boolean"
      ? options.enabled
      : options.enabled?.value ?? true
  );

  function registerAll() {
    shortcuts.forEach((s) => {
      shortcutRegistry.register({
        ...s,
        scope: scope.value,
        handler: (event) => {
          if (!isEnabled.value) return;
          s.handler(event);
        },
      });
    });
  }

  function unregisterAll() {
    shortcuts.forEach((s) => shortcutRegistry.unregister(s.id));
  }

  onMounted(() => registerAll());
  onUnmounted(() => unregisterAll());

  if (typeof options.scope !== "string") {
    watch(options.scope, () => {
      unregisterAll();
      scope.value = options.scope.value;
      registerAll();
    });
  }

  return { isEnabled };
}