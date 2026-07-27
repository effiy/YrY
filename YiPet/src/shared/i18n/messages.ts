/**
 * Runtime message loader — enables locale switching at runtime by loading
 * _locales/<locale>/messages.json via fetch() instead of relying on
 * chrome.i18n.getMessage() which is locked to the browser's UI language.
 */

import type { SupportedLocale } from './locale';

/* ── Chrome Message JSON Shape ──────────────────────────────────────────── */

interface ChromePlaceholder {
  content: string;
  example?: string;
}

interface ChromeMessageEntry {
  message: string;
  placeholders?: Record<string, ChromePlaceholder>;
}

type MessageTable = Record<string, ChromeMessageEntry>;

/* ── Cache ──────────────────────────────────────────────────────────────── */

const cache = new Map<string, MessageTable>();
let _activeLocale: SupportedLocale = 'en';

/* ── Public API ─────────────────────────────────────────────────────────── */

export function getActiveLocale(): SupportedLocale {
  return _activeLocale;
}

/**
 * Set the active locale and preload messages. Resolves when ready.
 */
export async function setActiveLocale(locale: SupportedLocale): Promise<void> {
  _activeLocale = locale;
  await loadMessages(locale);
}

/**
 * Fetch and cache messages.json for a locale.
 */
export async function loadMessages(locale: SupportedLocale): Promise<MessageTable> {
  if (cache.has(locale)) return cache.get(locale)!;

  const url = chrome.runtime.getURL(`_locales/${locale}/messages.json`);
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to load messages for ${locale}: HTTP ${resp.status}`);
  }
  const json: MessageTable = await resp.json();
  cache.set(locale, json);
  return json;
}

/**
 * Look up a message key in the cached table for the active locale.
 * Returns the resolved string, or null if not found.
 */
export function lookupMessage(
  key: string,
  locale?: SupportedLocale,
  substitutions?: string | string[]
): string | null {
  const loc = locale ?? _activeLocale;
  const table = cache.get(loc);
  if (!table || !table[key]) return null;

  const entry = table[key];
  let text = entry.message;

  // Apply $PLACEHOLDER$ → value substitution
  if (entry.placeholders) {
    const subs: string[] =
      typeof substitutions === 'string'
        ? [substitutions]
        : substitutions ?? [];

    for (const [phName, phDef] of Object.entries(entry.placeholders)) {
      const m = phDef.content.match(/^\$(\d+)$/);
      if (m) {
        const idx = parseInt(m[1], 10) - 1; // 1-based → 0-based
        const val = subs[idx] ?? '';
        text = text.replace(new RegExp(`\\$${phName.replace(/\$/g, '\\$')}\\$`, 'g'), val);
      }
    }
  }

  return text;
}
