/**
 * Locale detection and user preference management.
 *
 * Resolution order: user override (chrome.storage) → browser UI language → 'en'.
 * Supports dynamic switching for popup/options pages.
 */

import { localizeDOM } from './index';
import { setActiveLocale } from './messages';
import { readValidatedKV, writeKV } from '../storage/kv';

/* ── Supported Locales ─────────────────────────────────────────────────── */

/** Must match _locales/ directory names exactly. */
export const SUPPORTED_LOCALES = ['en', 'zh_CN'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const STORAGE_KEY = 'locale';

function isSupportedLocale(raw: unknown): raw is SupportedLocale {
  return typeof raw === 'string' && SUPPORTED_LOCALES.includes(raw as SupportedLocale);
}

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
  let raw = 'en';
  try {
    const chromeLocale = typeof chrome !== 'undefined' ? chrome.i18n?.getUILanguage?.() : '';
    raw = chromeLocale || navigator.language || 'en';
  } catch {
    raw = typeof navigator !== 'undefined' ? navigator.language || 'en' : 'en';
  }
  const base = raw.replace('-', '_'); // normalize to "zh_CN"

  // Exact match first
  if (SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
    return base as SupportedLocale;
  }

  // Try base language only (e.g. "zh" matches "zh_CN")
  const lang = base.split('_')[0];
  const match = SUPPORTED_LOCALES.find((l) => l.startsWith(lang));
  if (match) return match;

  return 'en';
}

/* ── User Preference ───────────────────────────────────────────────────── */

export async function getUserLocale(): Promise<SupportedLocale | null> {
  const raw = await readValidatedKV<SupportedLocale | null>(STORAGE_KEY, null, isSupportedLocale);
  return raw;
}

export async function setUserLocale(locale: SupportedLocale): Promise<void> {
  await writeKV<SupportedLocale>(STORAGE_KEY, locale);
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
  await setActiveLocale(locale);

  document.documentElement.lang = locale.replace('_', '-');
  document.documentElement.dir = isRTL(locale) ? 'rtl' : 'ltr';

  // Re-process [data-i18n] elements with the new locale
  localizeDOM();
}
