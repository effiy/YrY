import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getChromeLocale,
  getUserLocale,
  isRTL,
  resolveLocale,
  SUPPORTED_LOCALES,
  setUserLocale,
} from '../../src/shared/i18n/locale';
import { resetChromeStorage } from '../setup';

describe('locale', () => {
  beforeEach(() => {
    resetChromeStorage();
    vi.restoreAllMocks();
  });

  describe('SUPPORTED_LOCALES', () => {
    it('includes en and zh_CN', () => {
      expect(SUPPORTED_LOCALES).toContain('en');
      expect(SUPPORTED_LOCALES).toContain('zh_CN');
    });
  });

  describe('getChromeLocale()', () => {
    it('returns zh_CN when Chrome UI language is zh-CN', () => {
      vi.mocked(chrome.i18n.getUILanguage).mockReturnValue('zh-CN');
      expect(getChromeLocale()).toBe('zh_CN');
    });

    it('returns en when Chrome UI language is en-US', () => {
      vi.mocked(chrome.i18n.getUILanguage).mockReturnValue('en-US');
      expect(getChromeLocale()).toBe('en');
    });

    it('falls back to en for unsupported languages', () => {
      vi.mocked(chrome.i18n.getUILanguage).mockReturnValue('ja');
      expect(getChromeLocale()).toBe('en');
    });

    it('returns en for zh-HK (base language match to zh_CN)', () => {
      vi.mocked(chrome.i18n.getUILanguage).mockReturnValue('zh-HK');
      expect(getChromeLocale()).toBe('zh_CN');
    });
  });

  describe('getUserLocale()', () => {
    it('returns null when no preference is stored', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
      expect(await getUserLocale()).toBeNull();
    });

    it('returns stored locale when valid', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({ user_locale: 'zh_CN' });
      expect(await getUserLocale()).toBe('zh_CN');
    });

    it('returns null for invalid locale value', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({ user_locale: 'fr' });
      expect(await getUserLocale()).toBeNull();
    });
  });

  describe('setUserLocale()', () => {
    it('persists the locale to chrome.storage', async () => {
      const spy = vi.mocked(chrome.storage.local.set);
      await setUserLocale('zh_CN');
      expect(spy).toHaveBeenCalledWith({ locale: 'zh_CN' });
    });
  });

  describe('resolveLocale()', () => {
    it('returns user override when set', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({ user_locale: 'zh_CN' });
      const result = await resolveLocale();
      expect(result.locale).toBe('zh_CN');
      expect(result.isUserOverride).toBe(true);
    });

    it('returns Chrome locale when no override', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValueOnce({});
      vi.mocked(chrome.i18n.getUILanguage).mockReturnValue('en-US');
      const result = await resolveLocale();
      expect(result.locale).toBe('en');
      expect(result.isUserOverride).toBe(false);
    });
  });

  describe('isRTL()', () => {
    it('returns true for Arabic', () => {
      expect(isRTL('ar')).toBe(true);
    });

    it('returns true for Hebrew', () => {
      expect(isRTL('he')).toBe(true);
    });

    it('returns false for English', () => {
      expect(isRTL('en')).toBe(false);
    });

    it('returns false for Chinese', () => {
      expect(isRTL('zh_CN')).toBe(false);
    });
  });
});
