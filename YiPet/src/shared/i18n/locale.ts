/**
 * Locale detection and user preference management.
 *
 * Resolution order: user override (chrome.storage) → browser UI language → 'en'.
 * Supports dynamic switching for popup/options pages.
 */

import type { MessageKey } from './i18n';

/* ── Supported Locales ─────────────────────────────────────────────────── */

/** Must match _locales/ directory names exactly. */
export const SUPPORTED_LOCALES = ['en', 'zh_CN'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

const STORAGE_KEY = 'locale';
const LEGACY_STORAGE_KEY = 'user_locale';

/* ── RTL Locales ───────────────────────────────────────────────────────── */

const RTL_LOCALES = new Set<string>(['ar', 'fa', 'he', 'ur']);

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.has(locale.split('-')[0].split('_')[0]);
}

/* ── Detection ─────────────────────────────────────────────────────────── */

/**
 * Resolve the effective locale:
 *   1. User override from chrome.storage (async — use in mount phase).
 *   2. Chrome's UI language (chrome.i18n.getUILanguage).
 *   3. Fallback to 'en'.
 */
export function getChromeLocale(): SupportedLocale {
  const raw = chrome.i18n.getUILanguage(); // e.g. "zh-CN", "en-US", "ja"
  const base = raw.replace('-', '_');       // normalize to "zh_CN"

  // Exact match first
  if (SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
    return base as SupportedLocale;
  }

  // Try base language only (e.g. "zh" matches "zh_CN")
  const lang = base.split('_')[0];
  const match = SUPPORTED_LOCALES.find(l => l.startsWith(lang));
  if (match) return match;

  return 'en';
}

/* ── User Preference ───────────────────────────────────────────────────── */

export async function getUserLocale(): Promise<SupportedLocale | null> {
  const result = await chrome.storage.local.get([STORAGE_KEY, LEGACY_STORAGE_KEY]);
  const val = result[STORAGE_KEY] as string | undefined;
  if (val && SUPPORTED_LOCALES.includes(val as SupportedLocale)) {
    return val as SupportedLocale;
  }
  // Migration: fall back to legacy key
  const legacy = result[LEGACY_STORAGE_KEY] as string | undefined;
  if (legacy && SUPPORTED_LOCALES.includes(legacy as SupportedLocale)) {
    // Migrate to new key asynchronously (fire-and-forget)
    chrome.storage.local.set({ [STORAGE_KEY]: legacy }).catch(() => {});
    return legacy as SupportedLocale;
  }
  return null;
}

export async function setUserLocale(locale: SupportedLocale): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: locale });
}

/* ── Combined Resolution ───────────────────────────────────────────────── */

/**
 * Resolve the effective locale (async — call once per surface mount).
 * Returns the locale and whether it differs from the Chrome default.
 */
export async function resolveLocale(): Promise<{
  locale: SupportedLocale;
  isUserOverride: boolean;
}> {
  const userLocale = await getUserLocale();
  if (userLocale) {
    return { locale: userLocale, isUserOverride: true };
  }
  return { locale: getChromeLocale(), isUserOverride: false };
}

/* ── DOM Application ───────────────────────────────────────────────────── */

/**
 * Apply the active locale to the document:
 *   - Load messages for this locale at runtime (bypasses chrome.i18n lock)
 *   - <html lang="...">
 *   - <html dir="rtl|ltr">
 *   - Re-localize all [data-i18n] elements
 */
export async function applyLocale(locale: SupportedLocale): Promise<void> {
  // Preload messages for the target locale before anything reads t()
  const { setActiveLocale } = await import('./locale-messages');
  await setActiveLocale(locale);

  document.documentElement.lang = locale.replace('_', '-');
  document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';

  // Re-process [data-i18n] elements with the new locale
  const { localizeDOM } = await import('./i18n');
  localizeDOM();
}
