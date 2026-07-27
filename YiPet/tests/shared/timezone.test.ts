import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSystemTimezone,
  getUserTimezone,
  resolveTimezone,
  setUserTimezone,
} from '../../src/shared/i18n/timezone';
import { resetChromeStorage } from '../setup';

describe('timezone', () => {
  beforeEach(() => {
    resetChromeStorage();
    vi.restoreAllMocks();
  });

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
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
      expect(await getUserTimezone()).toBeNull();
    });

    it('returns stored timezone', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({ user_timezone: 'Asia/Tokyo' });
      expect(await getUserTimezone()).toBe('Asia/Tokyo');
    });
  });

  describe('setUserTimezone()', () => {
    it('persists timezone to chrome.storage', async () => {
      const spy = vi.mocked(chrome.storage.local.set);
      await setUserTimezone('Asia/Shanghai');
      expect(spy).toHaveBeenCalledWith({ user_timezone: 'Asia/Shanghai' });
    });
  });

  describe('resolveTimezone()', () => {
    it('returns user override when set', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({ user_timezone: 'Asia/Tokyo' });
      const result = await resolveTimezone();
      expect(result.timeZone).toBe('Asia/Tokyo');
      expect(result.isUserOverride).toBe(true);
    });

    it('returns system timezone when no override', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
      const result = await resolveTimezone();
      // jsdom may return 'UTC' instead of an IANA timezone
      expect(typeof result.timeZone).toBe('string');
      expect(result.timeZone.length).toBeGreaterThan(0);
      expect(result.isUserOverride).toBe(false);
    });
  });
});
