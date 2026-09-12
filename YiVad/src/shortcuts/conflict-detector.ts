import type { ShortcutDefinition, ShortcutScope } from "@/shortcuts/registry";
import { shortcutRegistry } from "@/shortcuts/registry";

export function detectConflict(
  keys: string,
  scope: ShortcutScope,
  excludeId?: string
): ShortcutDefinition | null {
  const all = shortcutRegistry.getAllShortcuts();
  return all.find(
    (s) => s.keys === keys && s.scope === scope && s.id !== excludeId
  ) || null;
}