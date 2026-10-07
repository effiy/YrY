/** window.YiPet CDN API — exposed on global scope for console usage. */

import type { CdnEntry } from '../cdn/catalog';
import { CDN_CATALOG, catalogByKey } from '../cdn/catalog';
import type { CdnInjector } from '../cdn/injector';

function _ok(msg: string) {
  console.log('%c[YiPet]%c ✓ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#22c55e;font-weight:bold', 'color:#888');
}
function _skip(msg: string) {
  console.log('%c[YiPet]%c ⊘ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#f59e0b;font-weight:bold', 'color:#888');
}
function _err(msg: string) {
  console.log('%c[YiPet]%c ✗ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#ef4444;font-weight:bold', 'color:#888');
}

export function attachYiPetApi(root: typeof globalThis, BASE: string, injector: CdnInjector): void {
  const YiPet = {
    version: '1.2.0',

    cdn(path: string): string { return BASE + path; },

    async load(path: string): Promise<boolean> {
      const entry = catalogByKey[path];
      const realPath = entry ? entry.path : path;
      try {
        const loaded = await injector.loadJS(realPath);
        loaded ? _ok(entry ? entry.desc : realPath) : _skip((entry ? entry.desc : realPath) + ' — already loaded');
        return loaded;
      } catch (e) { _err((entry ? entry.key : path) + ' — ' + (e as Error).message); return false; }
    },

    css(path: string): boolean {
      const entry = catalogByKey[path];
      const realPath = entry ? entry.path : path;
      const ok = injector.loadCSS(realPath);
      const label = entry ? entry.desc : realPath;
      ok ? _ok(label) : _skip(label + ' — already loaded');
      return ok;
    },

    loaded(): string[] { return injector.getLoadedKeys(); },

    list(filter?: string): void {
      const q = (filter || '').toLowerCase();
      const rows: Record<string, string>[] = [];
      for (const c of CDN_CATALOG) {
        if (q && c.key.indexOf(q) === -1 && c.desc.toLowerCase().indexOf(q) === -1 && c.path.toLowerCase().indexOf(q) === -1) continue;
        let loaded = injector.isLoaded(c.path);
        if (c.global && (root as unknown as Record<string, unknown>)[c.global] !== undefined) loaded = true;
        rows.push({ Key: c.key, Type: c.type.toUpperCase(), Status: loaded ? '✓ Loaded' : '-', Description: c.desc });
      }
      if (!rows.length) {
        if (import.meta.env.DEV) console.log('%c[YiPet]%c No resources matching "%s"', 'color:#6366f1;font-weight:bold', 'color:inherit', filter || '');
        return;
      }
      if (import.meta.env.DEV) {
        console.group('%c[YiPet]%c CDN Resources' + (filter ? ' (matching "' + filter + '")' : '') + ' — ' + rows.length + ' items', 'color:#6366f1;font-weight:bold', 'color:inherit');
        console.table(rows, ['Key', 'Type', 'Status', 'Description']);
        console.log('%c  Usage: YiPet.load("key")%c or %cawait YiPet.key()', 'color:#22c55e', 'color:#888', 'color:#22c55e');
        console.groupEnd();
      }
    },

    help(): void {
      if (!import.meta.env.DEV) return;
      console.group('%c🐾 YiPet CDN Bootstrap %c v1.2.0', 'font-size:16px;color:#6366f1;font-weight:bold', 'color:#888;font-size:12px');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#444');
      for (const [cmd, desc] of [['cdn(path)', 'Get full URL'], ['load(path)', 'Load JS (Promise)'], ['css(path)', 'Load CSS'], ['list(filter?)', 'List resources'], ['loaded()', 'Loaded resources'], ['help()', 'Show this help']]) {
        console.log('%c  YiPet.' + cmd + '%c — ' + desc, 'color:#22c55e;font-weight:bold', 'color:inherit');
      }
      console.log('%c  Shorthand: await YiPet.vue() | YiPet.jquery() | YiPet.gsap() ...', 'color:#f59e0b;font-weight:bold');
      console.log('%c  Example: > YiPet.list("vue")%c   |  %c> await YiPet.mermaid()', 'color:#a78bfa', 'color:#888', 'color:#a78bfa');
      console.groupEnd();
    },
  };

  for (const entry of CDN_CATALOG) {
    const method = entry.key.replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase());
    if (!(method in YiPet)) { (YiPet as Record<string, unknown>)[method] = () => injector.loadByKey(entry.key); }
  }

  (root as unknown as Record<string, unknown>).YiPet = YiPet;
}