export type ShortcutScope = "global" | "page" | "component" | "input";
export type ShortcutCategory = "navigation" | "editing" | "view" | "tools" | "accessibility";

export interface ShortcutDefinition {
  id: string;
  keys: string;
  description: string;
  category: ShortcutCategory;
  scope: ShortcutScope;
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
  sequence?: string[];
  sequenceTimeout?: number;
}

const scopeOrder: Record<ShortcutScope, number> = { input: 0, component: 1, page: 2, global: 3 };

class ShortcutRegistry {
  private shortcuts: Map<string, ShortcutDefinition> = new Map();
  private sequenceBuffer: { keys: string[]; timestamp: number }[] = [];
  private sequenceTimer: ReturnType<typeof setTimeout> | null = null;
  private modalOpen = false;

  register(shortcut: ShortcutDefinition): void {
    const existing = this.findConflict(shortcut);
    if (existing) {
      console.warn(
        `[Shortcut] Conflict: "${shortcut.id}" (${shortcut.keys}) ` +
        `conflicts with "${existing.id}" (${existing.keys})`
      );
    }
    this.shortcuts.set(shortcut.id, shortcut);
  }

  unregister(id: string): void {
    this.shortcuts.delete(id);
  }

  private findConflict(shortcut: ShortcutDefinition): ShortcutDefinition | null {
    for (const [, existing] of this.shortcuts) {
      if (
        existing.keys === shortcut.keys &&
        existing.scope === shortcut.scope &&
        existing.id !== shortcut.id
      ) {
        return existing;
      }
    }
    return null;
  }

  handleKeydown(event: KeyboardEvent): void {
    if (this.modalOpen && event.key !== "Escape") return;

    if (this.sequenceBuffer.length > 0) {
      this.handleSequence(event);
      return;
    }

    const keyString = this.buildKeyString(event);
    const matched = this.findMatchedShortcuts(keyString);

    if (matched.length > 0) {
      const best = matched.sort((a, b) => scopeOrder[a.scope] - scopeOrder[b.scope])[0];
      event.preventDefault();
      best.handler(event);
    }
  }

  private findMatchedShortcuts(keyString: string): ShortcutDefinition[] {
    const result: ShortcutDefinition[] = [];
    for (const [, shortcut] of this.shortcuts) {
      if (shortcut.keys === keyString && shortcut.enabled !== false) {
        result.push(shortcut);
      }
    }
    return result;
  }

  private handleSequence(event: KeyboardEvent): void {
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    const lastBuffer = this.sequenceBuffer[this.sequenceBuffer.length - 1];
    if (!lastBuffer) return;

    lastBuffer.keys.push(key);

    for (const [, shortcut] of this.shortcuts) {
      if (!shortcut.sequence || shortcut.enabled === false) continue;
      if (shortcut.sequence.length !== lastBuffer.keys.length) continue;
      if (shortcut.sequence.every((k, i) => lastBuffer.keys[i] === k)) {
        event.preventDefault();
        shortcut.handler(event);
        this.clearSequenceBuffer();
        return;
      }
    }

    if (lastBuffer.keys.length >= 3) {
      this.clearSequenceBuffer();
    }
  }

  startSequence(keys: string[]): void {
    this.sequenceBuffer.push({ keys: [...keys], timestamp: Date.now() });
    if (this.sequenceTimer) clearTimeout(this.sequenceTimer);
    this.sequenceTimer = setTimeout(() => this.clearSequenceBuffer(), 1000);
  }

  private clearSequenceBuffer(): void {
    this.sequenceBuffer = [];
    if (this.sequenceTimer) {
      clearTimeout(this.sequenceTimer);
      this.sequenceTimer = null;
    }
  }

  private buildKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    if (event.ctrlKey || event.metaKey) parts.push("Ctrl");
    if (event.shiftKey) parts.push("Shift");
    if (event.altKey) parts.push("Alt");
    const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
    if (!["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
      parts.push(key);
    }
    return parts.join("+");
  }

  setModalOpen(open: boolean): void {
    this.modalOpen = open;
  }

  getAllShortcuts(): ShortcutDefinition[] {
    return Array.from(this.shortcuts.values());
  }
}

export const shortcutRegistry = new ShortcutRegistry();