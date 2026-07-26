/**
 * CDN Resource Injector — creates &lt;script&gt; and &lt;link&gt; tags on demand.
 * JS injection is async (Promise-based); CSS injection is synchronous.
 */

import { CDN_CATALOG, catalogByKey, type CdnEntry } from './catalog';

export interface CdnInjector {
  loadJS(path: string): Promise<boolean>;
  loadCSS(path: string): boolean;
  loadByKey(key: string): Promise<boolean> | boolean;
  injectAll(): Promise<void>;
  isLoaded(path: string): boolean;
  getLoadedKeys(): string[];
}

export function createInjector(baseUrl: string): CdnInjector {
  const loaded = new Map<string, boolean>();

  // Safety: baseUrl must be absolute. If not (e.g. relative 'cdn/' fallback),
  // try to reconstruct from chrome.runtime.getURL if available.
  function normalizeBase(raw: string): string {
    if (raw.startsWith('chrome-extension://') || raw.startsWith('http')) {
      return raw.endsWith('/') ? raw : raw + '/';
    }
    // Relative path — try to repair using chrome.runtime.getURL (ISOLATED world only)
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
        return chrome.runtime.getURL(raw.endsWith('/') ? raw : raw + '/');
      }
    } catch { /* not available */ }

    // Last resort: make it absolute from current location
    // (this should never happen in practice — BASE is always from chrome.runtime.getURL)
    console.error('[YiPet CDN] baseUrl is relative, resources may fail to load:', raw);
    return (raw.startsWith('/') ? raw : '/' + raw);
  }

  const BASE = normalizeBase(baseUrl);

  function resolveUrl(path: string): string {
    return BASE + path;
  }

  function loadJS(path: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if (loaded.has(path)) { resolve(false); return; }
      const el = document.createElement('script');
      el.src = resolveUrl(path);
      el.onload = () => { loaded.set(path, true); resolve(true); };
      el.onerror = () => reject(new Error(`Failed to load: ${path}`));
      (document.head || document.documentElement).appendChild(el);
    });
  }

  function loadCSS(path: string): boolean {
    if (loaded.has(path)) return false;
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.href = resolveUrl(path);
    el.onload = () => { loaded.set(path, true); };
    (document.head || document.documentElement).appendChild(el);
    loaded.set(path, true);
    return true;
  }

  function loadByKey(key: string): Promise<boolean> | boolean {
    const entry = catalogByKey[key];
    if (!entry) {
      console.warn(`[YiPet CDN] Unknown resource: "${key}"`);
      return false;
    }
    // Skip if already present on page via global
    if (entry.global && (window as unknown as Record<string, unknown>)[entry.global] !== undefined) {
      console.log(`%c[YiPet]%c ⊘ ${entry.desc} — already present, skipped`,
        'color:#6366f1;font-weight:bold', 'color:#888');
      return entry.type === 'js' ? Promise.resolve(false) : false;
    }
    return entry.type === 'js' ? loadJS(entry.path) : loadCSS(entry.path);
  }

  async function injectAll(): Promise<void> {
    // CSS first (order-safe, parallel)
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'css') loadCSS(entry.path);
    }
    // JS: sequential to respect inter-library dependencies
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'js') {
        try { await loadJS(entry.path); } catch { /* continue */ }
      }
    }
  }

  function isLoaded(path: string): boolean {
    return loaded.has(path);
  }

  function getLoadedKeys(): string[] {
    return CDN_CATALOG.filter(e => loaded.has(e.path)).map(e => e.key);
  }

  return { loadJS, loadCSS, loadByKey, injectAll, isLoaded, getLoadedKeys };
}
