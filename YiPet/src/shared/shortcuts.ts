/**
 * Keyboard Shortcuts System — YP-09-36, YP-09-104.
 *
 * Manages keyboard shortcuts with conflict detection, user-customizable
 * bindings, and Chrome extension command integration.
 */
import { ref, type Ref } from 'vue';

export interface ShortcutBinding {
  id: string;
  keys: string;       // e.g. "Ctrl+Shift+X"
  description: string;
  action: () => void;
  /** Category for grouping in settings UI. */
  category: 'chat' | 'pet' | 'navigation' | 'utility';
  /** Whether this shortcut can be customized by the user. */
  customizable: boolean;
}

interface ConflictRecord {
  shortcutId: string;
  conflictingId: string;
  keys: string;
}

const STORAGE_KEY = 'yipet:shortcuts';

class ShortcutManager {
  private _bindings: Map<string, ShortcutBinding> = new Map();
  private _activeKeys: Set<string> = new Set();
  conflicts = ref<ConflictRecord[]>([]);
  private _listening = false;

  /** Register a shortcut binding. */
  register(binding: ShortcutBinding): void {
    const normalized = this._normalizeKeys(binding.keys);
    binding.keys = normalized;

    // Check for conflicts
    for (const [id, existing] of this._bindings) {
      if (existing.keys === normalized && id !== binding.id) {
        this.conflicts.value.push({
          shortcutId: binding.id,
          conflictingId: id,
          keys: normalized,
        });
      }
    }

    this._bindings.set(binding.id, binding);
  }

  /** Unregister a shortcut. */
  unregister(id: string): void {
    this._bindings.delete(id);
    this.conflicts.value = this.conflicts.value.filter(c => c.shortcutId !== id && c.conflictingId !== id);
  }

  /** Get all registered shortcuts. */
  getAll(): ShortcutBinding[] {
    return Array.from(this._bindings.values());
  }

  /** Get shortcuts by category. */
  getByCategory(cat: ShortcutBinding['category']): ShortcutBinding[] {
    return this.getAll().filter(s => s.category === cat);
  }

  /** Start listening for keyboard events. */
  startListening(): void {
    if (this._listening) return;
    document.addEventListener('keydown', this._handleKeyDown);
    this._listening = true;
  }

  /** Stop listening. */
  stopListening(): void {
    document.removeEventListener('keydown', this._handleKeyDown);
    this._listening = false;
  }

  /** Update a binding's keys (persists the change). */
  async updateBinding(id: string, newKeys: string): Promise<void> {
    const binding = this._bindings.get(id);
    if (!binding || !binding.customizable) return;

    binding.keys = this._normalizeKeys(newKeys);
    await this._persist();
    this._recheckConflicts();
  }

  /** Restore defaults. */
  async restoreDefaults(): Promise<void> {
    this._bindings.clear();
    this.conflicts.value = [];
    await this._persist();
  }

  /** Load persisted shortcuts. */
  async loadPersisted(): Promise<void> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        const saved = result[STORAGE_KEY] as Record<string, string>;
        for (const [id, keys] of Object.entries(saved)) {
          const binding = this._bindings.get(id);
          if (binding) binding.keys = keys;
        }
      }
    } catch {
      // chrome.storage may not be available
    }
  }

  private _handleKeyDown = (e: KeyboardEvent): void => {
    const pressed = this._eventToKeyString(e);
    for (const binding of this._bindings.values()) {
      if (binding.keys === pressed) {
        e.preventDefault();
        e.stopPropagation();
        binding.action();
        return;
      }
    }
  };

  private _normalizeKeys(keys: string): string {
    const parts = keys.split('+').map(p => p.trim());
    const modifierOrder = ['Ctrl', 'Alt', 'Shift', 'Meta'];
    const modifiers: string[] = [];
    let mainKey = '';

    for (const part of parts) {
      const normalized = part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      if (modifierOrder.includes(normalized)) {
        modifiers.push(normalized);
      } else {
        mainKey = normalized;
      }
    }

    modifiers.sort((a, b) => modifierOrder.indexOf(a) - modifierOrder.indexOf(b));
    return [...modifiers, mainKey].join('+');
  }

  private _eventToKeyString(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.altKey) parts.push('Alt');
    if (e.shiftKey) parts.push('Shift');

    const key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
    if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
      parts.push(key);
    }

    return parts.join('+');
  }

  private async _persist(): Promise<void> {
    const data: Record<string, string> = {};
    for (const [id, binding] of this._bindings) {
      if (binding.customizable) data[id] = binding.keys;
    }
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: data });
    } catch {
      // best effort
    }
  }

  private _recheckConflicts(): void {
    this.conflicts.value = [];
    const byKeys = new Map<string, string>();
    for (const [id, binding] of this._bindings) {
      const existing = byKeys.get(binding.keys);
      if (existing) {
        this.conflicts.value.push({ shortcutId: id, conflictingId: existing, keys: binding.keys });
      } else {
        byKeys.set(binding.keys, id);
      }
    }
  }
}

export const shortcutManager = new ShortcutManager();