/**
 * YiPet Bootstrap — Dual-World CDN Resource Loader.
 *
 * Architecture (Chrome MV3):
 *   1. Chrome loads this bundle as a content script (ISOLATED world).
 *   2. It resolves chrome.runtime.getURL('cdn/') and injects a &lt;script&gt;
 *      tag loading THIS SAME FILE into the page DOM.
 *   3. The second execution runs in the MAIN world, where window.YiPet
 *      is visible from the DevTools console ("top" context).
 *   4. If the page CSP blocks the injection, a fallback initializes
 *      YiPet in the ISOLATED world instead.
 *
 * This is a self-contained entry point — Vite bundles it independently
 * so it works in both execution contexts without external imports at
 * runtime. The catalog and injector are imported at build time and
 * inlined into this bundle.
 */

import { CDN_CATALOG, catalogByKey, type CdnEntry } from './catalog';
import { createInjector, type CdnInjector } from './injector';

/* ═══════════════════════════════════════════════════════════════════════════
   Context Detection
   ═══════════════════════════════════════════════════════════════════════════ */

// Only content scripts have chrome.runtime.getURL
let _isContentScript = false;
try {
  _isContentScript = !!(
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.getURL
  );
} catch (_) { /* not a content script */ }

// When injected into MAIN world, the &lt;script&gt; tag carries data-base
const _cs = typeof document !== 'undefined' ? document.currentScript : null;
const _injectedBase: string =
  (_cs && (_cs as HTMLScriptElement).dataset?.base) || '';

/* ═══════════════════════════════════════════════════════════════════════════
   Phase 1: Content Script — inject self into MAIN world
   ═══════════════════════════════════════════════════════════════════════════ */

if (_isContentScript && !_injectedBase) {
  (function injectIntoMainWorld() {
    const extBase = chrome.runtime.getURL('cdn/');
    const selfUrl = chrome.runtime.getURL('assets/bootstrap.js');

    const el = document.createElement('script');
    el.src = selfUrl;
    el.dataset.base = extBase;
    el.id = 'yipet-bootstrap';

    el.onerror = () => {
      console.warn(
        '%c[YiPet]%c CSP blocked MAIN world injection. ' +
        'Switch DevTools console to the extension context (%c' +
        chrome.runtime.id + '%c) to use YiPet.',
        'color:#6366f1;font-weight:bold', 'color:inherit',
        'color:#f59e0b', 'color:inherit',
      );
      // Fallback: set YiPet in isolated world (accessible via context switcher)
      createYiPet(window, extBase);
    };

    (document.head || document.documentElement).appendChild(el);
  })();
  // ISOLATED world done — do NOT fall through to Phase 2.
  // The original IIFE used `return` here; ES modules can't return at top level,
  // so we guard Phase 2 with a condition instead.
}

/* ═══════════════════════════════════════════════════════════════════════════
   Phase 2: MAIN world — initialize YiPet API
   ═══════════════════════════════════════════════════════════════════════════ */

// Only run in MAIN world (no chrome.runtime.getURL) or when injected with data-base.
// In ISOLATED world without data-base, skip — Phase 1 already handled injection.
if (!_isContentScript || _injectedBase) {
  const BASE = _injectedBase || 'cdn/';
  createYiPet(window, BASE);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Implementation
   ═══════════════════════════════════════════════════════════════════════════ */

function createYiPet(root: typeof globalThis, BASE: string): void {
  const injector = createInjector(BASE);

  function _ok(msg: string) { console.log('%c[YiPet]%c ✓ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#22c55e;font-weight:bold', 'color:#888'); }
  function _skip(msg: string) { console.log('%c[YiPet]%c ⊘ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#f59e0b;font-weight:bold', 'color:#888'); }
  function _err(msg: string) { console.log('%c[YiPet]%c ✗ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#ef4444;font-weight:bold', 'color:#888'); }

  const YiPet = {
    version: '1.2.0',

    cdn(path: string): string {
      return BASE + path;
    },

    async load(path: string): Promise<boolean> {
      const entry = catalogByKey[path];
      const realPath = entry ? entry.path : path;
      try {
        const loaded = await injector.loadJS(realPath);
        loaded ? _ok(entry ? entry.desc : realPath) : _skip((entry ? entry.desc : realPath) + ' — already loaded');
        return loaded;
      } catch (e) {
        _err((entry ? entry.key : path) + ' — ' + (e as Error).message);
        return false;
      }
    },

    css(path: string): boolean {
      const entry = catalogByKey[path];
      const realPath = entry ? entry.path : path;
      const ok = injector.loadCSS(realPath);
      const label = entry ? entry.desc : realPath;
      ok ? _ok(label) : _skip(label + ' — already loaded');
      return ok;
    },

    loaded(): string[] {
      return injector.getLoadedKeys();
    },

    list(filter?: string): void {
      const q = (filter || '').toLowerCase();
      const rows: Record<string, string>[] = [];
      for (const c of CDN_CATALOG) {
        if (q && c.key.indexOf(q) === -1 && c.desc.toLowerCase().indexOf(q) === -1 && c.path.toLowerCase().indexOf(q) === -1) continue;
        let loaded = injector.isLoaded(c.path);
        if (c.global && (root as unknown as Record<string, unknown>)[c.global] !== undefined) loaded = true;
        rows.push({
          Key: c.key,
          Type: c.type.toUpperCase(),
          Status: loaded ? '✓ Loaded' : '-',
          Description: c.desc,
        });
      }
      if (!rows.length) {
        console.log('%c[YiPet]%c No resources matching "%s"', 'color:#6366f1;font-weight:bold', 'color:inherit', filter || '');
        return;
      }
      console.group('%c[YiPet]%c CDN Resources' + (filter ? ' (matching "' + filter + '")' : '') + ' — ' + rows.length + ' items',
        'color:#6366f1;font-weight:bold', 'color:inherit');
      console.table(rows, ['Key', 'Type', 'Status', 'Description']);
      console.log('%c  Usage: YiPet.load("key")%c or %cawait YiPet.key()',
        'color:#22c55e', 'color:#888', 'color:#22c55e');
      console.groupEnd();
    },

    help(): void {
      console.group('%c🐾 YiPet CDN Bootstrap %c v1.2.0',
        'font-size:16px;color:#6366f1;font-weight:bold', 'color:#888;font-size:12px');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#444');
      console.log('%c  YiPet.cdn(path)%c          — Get full URL of a CDN resource',         'color:#22c55e;font-weight:bold', 'color:inherit');
      console.log('%c  YiPet.load(path)%c         — Dynamically load JS file (returns Promise)', 'color:#22c55e;font-weight:bold', 'color:inherit');
      console.log('%c  YiPet.css(path)%c          — Dynamically load CSS file',                    'color:#22c55e;font-weight:bold', 'color:inherit');
      console.log('%c  YiPet.list(filter?)%c      — List available resources, supports keyword filtering',  'color:#22c55e;font-weight:bold', 'color:inherit');
      console.log('%c  YiPet.loaded()%c           — List of loaded resources',       'color:#22c55e;font-weight:bold', 'color:inherit');
      console.log('%c  YiPet.help()%c             — Show this help',                                 'color:#22c55e;font-weight:bold', 'color:inherit');
      console.log('');
      console.log('%c  Shorthand methods (common libraries):', 'color:#f59e0b;font-weight:bold');
      console.log('%c  await YiPet.vue()         YiPet.jquery()      YiPet.bootstrap()',    'color:inherit');
      console.log('%c  await YiPet.react()       YiPet.dayjs()       YiPet.gsap()',         'color:inherit');
      console.log('%c  await YiPet.anime()       YiPet.swiper()      YiPet.apexcharts()',   'color:inherit');
      console.log('%c  await YiPet.mermaid()     YiPet.marked()      YiPet.xlsx()',         'color:inherit');
      console.log('%c  await YiPet.html2canvas() YiPet.turndown()    YiPet.feather()',      'color:inherit');
      console.log('%c  YiPet.animateCSS()        YiPet.bootstrapCSS() YiPet.fancybox()',    'color:inherit');
      console.log('');
      console.log('%c  Examples:', 'color:#f59e0b;font-weight:bold');
      console.log('%c  > YiPet.list("vue")%c          // Search Vue-related resources',     'color:#a78bfa', 'color:#888');
      console.log('%c  > await YiPet.vue()%c          // Load Vue 3 to current page', 'color:#a78bfa', 'color:#888');
      console.log('%c  > YiPet.css("animate-css")%c   // Load Animate.css',                  'color:#a78bfa', 'color:#888');
      console.log('%c  > YiPet.cdn("vendor/jquery@3.7.1/jquery.min.js")%c',                         'color:#a78bfa', 'color:#888');
      console.groupEnd();
    },
  };

  /* ── Attach shortcut methods ─────────────────────────────────────── */

  for (const entry of CDN_CATALOG) {
    const method = entry.key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    if (!(method in YiPet)) {
      (YiPet as Record<string, unknown>)[method] = () => injector.loadByKey(entry.key);
    }
  }

  /* ── Export ──────────────────────────────────────────────────────── */

  (root as unknown as Record<string, unknown>).YiPet = YiPet;

  /* ── Auto-load all catalog resources ────────────────────────────── */

  // CSS (sync injection, order-safe)
  for (const entry of CDN_CATALOG) {
    if (entry.type === 'css') injector.loadCSS(entry.path);
  }

  // JS (sequential injection to respect inter-library dependencies)
  const jsEntries = CDN_CATALOG.filter(e => e.type === 'js');
  (function loadSeq(i: number) {
    if (i >= jsEntries.length) {
      console.log('%c🐾%c CDN Bootstrap ready — type YiPet.help() for usage guide',
        'color:#6366f1;font-weight:bold', 'color:#888');
      return;
    }
    injector.loadJS(jsEntries[i].path).then(() => {
      loadSeq(i + 1);
    }).catch(() => {
      loadSeq(i + 1);
    });
  })(0);
}
