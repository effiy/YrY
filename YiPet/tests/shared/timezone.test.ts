import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSystemTimezone,
  getUserTimezone,
  resolveTimezone,
  setUserTimezone,
} from '../../src/shared/i18n/timezone';
import { resetChromeStorage, setStorageData } from '../setup';

// kv.ts routes reads through `chrome.storage.local.get([key])`, whose
// setup.ts mock implementation pulls from a shared storageData dictionary.
// We seed that dict directly via setStorageData() exported from setup.ts.
// We also reset call counts (not implementations!) between tests so
// `toHaveBeenCalledWith` assertions remain deterministic.

beforeEach(() => {
  resetChromeStorage();
  vi.clearAllMocks();
});

describe('timezone', () => {
  describe('getSystemTimezone()', () => {
    it('returns the browser timezone from Intl.DateTimeFormat', () => {
      const tz = getSystemTimezone();
      expect(typeof tz).toBe('string');
      expect(tz.length).toBeGreaterThan(0);
      // Should contain a slash — IANA timezone format
      expect(tz).toContain('/');
    });

    it('falls back to UTC if Intl is unavailable', () => {
      const original = Intl.DateTimeFormat;
      // @ts-expect-error — testing fallback
      delete globalThis.Intl;
      try {
        expect(getSystemTimezone()).toBe('UTC');
      } finally {
        globalThis.Intl = original;
      }
    });
  });

  describe('getUserTimezone()', () => {
    it('returns null when no preference stored', async () => {
      expect(await getUserTimezone()).toBeNull();
    });

    it('returns stored timezone', async () => {
      setStorageData({ user_timezone: 'Asia/Tokyo' });
      expect(await getUserTimezone()).toBe('Asia/Tokyo');
    });
  });

  describe('setUserTimezone()', () => {
    it('persists timezone to chrome.storage', async () => {
      await setUserTimezone('Asia/Shanghai');
      const writes = (chrome.storage.local.set as any).mock.calls.map((c: any[]) => c[0]);
      // kv.writeKV writes as { [key]: value } — same shape as pre-refactor
      expect(writes).toContainEqual({ user_timezone: 'Asia/Shanghai' });
    });
  });

  describe('resolveTimezone()', () => {
    it('returns user override when set', async () => {
      setStorageData({ user_timezone: 'Asia/Tokyo' });
      const result = await resolveTimezone();
      expect(result.timeZone).toBe('Asia/Tokyo');
      expect(result.isUserOverride).toBe(true);
    });

    it('returns system timezone when no override', async () => {
      const result = await resolveTimezone();
      // jsdom may return 'UTC' instead of an IANA timezone
      expect(typeof result.timeZone).toBe('string');
      expect(result.timeZone.length).toBeGreaterThan(0);
      expect(result.isUserOverride).toBe(false);
    });
  });
});
