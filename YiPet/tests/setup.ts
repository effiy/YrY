/**
 * Test setup — mock chrome.* APIs and fetch for unit tests.
 * Runs before every test file.
 */

import { vi } from 'vitest';

// ── chrome.storage mock ────────────────────────────────────────────

const storageData: Record<string, unknown> = {};

vi.stubGlobal('chrome', {
  runtime: {
    id: 'test-extension-id',
    getURL: (path: string) => `chrome-extension://test-extension-id/${path}`,
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
    sendMessage: vi.fn(),
    lastError: undefined,
  },

  storage: {
    local: {
      get: vi.fn((keys?: string | string[] | Record<string, unknown>) => {
        if (typeof keys === 'string') {
          return Promise.resolve({ [keys]: storageData[keys] });
        }
        if (Array.isArray(keys)) {
          const result: Record<string, unknown> = {};
          for (const k of keys) result[k] = storageData[k];
          return Promise.resolve(result);
        }
        return Promise.resolve({ ...storageData });
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        Object.assign(storageData, items);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        Object.keys(storageData).forEach((k) => delete storageData[k]);
        return Promise.resolve();
      }),
    },
    onChanged: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },

  tabs: {
    query: vi.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com' }])),
    sendMessage: vi.fn(() => Promise.resolve({ success: true })),
  },

  i18n: {
    getMessage: vi.fn((key: string, substitutions?: string | string[]) => {
      // Simple mock: return the key itself, or with substitutions
      if (substitutions) {
        let result = key;
        if (Array.isArray(substitutions)) {
          for (let i = 0; i < substitutions.length; i++) {
            result = result.replace(`$${i + 1}`, substitutions[i]);
          }
        }
        return result;
      }
      return key;
    }),
    getUILanguage: vi.fn(() => 'en-US'),
  },
});

// ── Clear storage between tests ────────────────────────────────────

export function resetChromeStorage() {
  Object.keys(storageData).forEach((k) => delete storageData[k]);
}
