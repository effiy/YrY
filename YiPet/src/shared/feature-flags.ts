/**
 * Feature Flags & A/B Experiment System — YP-09-98.
 *
 * Provides runtime feature toggles for gradual rollouts and A/B testing.
 * Flags persist to chrome.storage.local for cross-session consistency.
 */
import { ref, computed, type Ref } from 'vue';

export interface FlagDefinition {
  key: string;
  description: string;
  defaultValue: boolean;
  /** Percentage rollout (0-100). 100 = fully enabled. */
  rollout: number;
}

const FLAG_DEFS: Record<string, FlagDefinition> = {
  'virtual-scroll': {
    key: 'virtual-scroll',
    description: 'Enable virtual scrolling for chat messages',
    defaultValue: true,
    rollout: 100,
  },
  'performance-monitor': {
    key: 'performance-monitor',
    description: 'Enable Content Script performance monitoring',
    defaultValue: false,
    rollout: 20,
  },
  'new-theme-system': {
    key: 'new-theme-system',
    description: 'Enable enhanced theme system with custom CSS',
    defaultValue: false,
    rollout: 10,
  },
  'bridge-token': {
    key: 'bridge-token',
    description: 'Use one-time bridge tokens instead of URL sessionKey',
    defaultValue: true,
    rollout: 100,
  },
  'offline-mode': {
    key: 'offline-mode',
    description: 'Enable offline chat mode with cached responses',
    defaultValue: false,
    rollout: 5,
  },
};

const STORAGE_KEY = 'yipet:feature-flags';

class FeatureFlags {
  private _flags = ref<Record<string, boolean>>({});
  private _loaded = false;

  /** Initialize flags from storage and rollout randomization. */
  async init(instanceId?: string): Promise<void> {
    if (this._loaded) return;

    // Load persisted overrides
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      if (result[STORAGE_KEY]) {
        this._flags.value = { ...result[STORAGE_KEY] };
      }
    } catch {
      // chrome.storage may not be available
    }

    // Apply rollout for unset flags
    const seed = instanceId ? this._hashCode(instanceId) : Math.random() * 100;
    for (const def of Object.values(FLAG_DEFS)) {
      if (!(def.key in this._flags.value)) {
        const bucket = (seed + this._hashCode(def.key)) % 100;
        this._flags.value[def.key] = bucket < def.rollout;
      }
    }

    this._loaded = true;
  }

  isEnabled(key: string): boolean {
    return this._flags.value[key] ?? FLAG_DEFS[key]?.defaultValue ?? false;
  }

  /** Override a flag (persisted). */
  async setEnabled(key: string, value: boolean): Promise<void> {
    this._flags.value[key] = value;
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: { ...this._flags.value } });
    } catch {
      // best effort
    }
  }

  /** Get all flag definitions for debug panel. */
  getDefinitions(): FlagDefinition[] {
    return Object.values(FLAG_DEFS);
  }

  getAllFlags(): Record<string, boolean> {
    return { ...this._flags.value };
  }

  private _hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}

export const featureFlags = new FeatureFlags();