/**
 * Pet overlay — creates and manages the YiPet DOM element in the MAIN world.
 *
 * Extracted from bootstrap.ts Phase 2 (MAIN world).
 * Handles: pet container/image creation, event listeners for visibility/size/role/color,
 * CDN style management, CDN JS auto-loading, and the window.YiPet API.
 */

import { CDN_CATALOG, type CdnEntry, catalogByKey } from '../cdn/catalog';
import { createInjector } from '../cdn/injector';
import { applyThemeColors, getGradientByIndex } from '../config/theme-config';

// ── Log Helpers ─────────────────────────────────────────────────────────

function _ok(msg: string) {
  console.log(
    '%c[YiPet]%c ✓ %c' + msg,
    'color:#6366f1;font-weight:bold',
    'color:#22c55e;font-weight:bold',
    'color:#888',
  );
}
function _skip(msg: string) {
  console.log(
    '%c[YiPet]%c ⊘ %c' + msg,
    'color:#6366f1;font-weight:bold',
    'color:#f59e0b;font-weight:bold',
    'color:#888',
  );
}
function _err(msg: string) {
  console.log(
    '%c[YiPet]%c ✗ %c' + msg,
    'color:#6366f1;font-weight:bold',
    'color:#ef4444;font-weight:bold',
    'color:#888',
  );
}

// ── Main ────────────────────────────────────────────────────────────────

export function createPetOverlay(
  root: typeof globalThis,
  BASE: string,
  initialColor: number,
  initialRole: string,
): void {
  const injector = createInjector(BASE);

  // ── window.YiPet API ────────────────────────────────────────────────

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
        loaded
          ? _ok(entry ? entry.desc : realPath)
          : _skip((entry ? entry.desc : realPath) + ' — already loaded');
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
        if (
          q &&
          c.key.indexOf(q) === -1 &&
          c.desc.toLowerCase().indexOf(q) === -1 &&
          c.path.toLowerCase().indexOf(q) === -1
        )
          continue;
        let loaded = injector.isLoaded(c.path);
        if (c.global && (root as unknown as Record<string, unknown>)[c.global] !== undefined)
          loaded = true;
        rows.push({
          Key: c.key,
          Type: c.type.toUpperCase(),
          Status: loaded ? '✓ Loaded' : '-',
          Description: c.desc,
        });
      }
      if (!rows.length) {
        console.log(
          '%c[YiPet]%c No resources matching "%s"',
          'color:#6366f1;font-weight:bold',
          'color:inherit',
          filter || '',
        );
        return;
      }
      console.group(
        '%c[YiPet]%c CDN Resources' +
          (filter ? ' (matching "' + filter + '")' : '') +
          ' — ' +
          rows.length +
          ' items',
        'color:#6366f1;font-weight:bold',
        'color:inherit',
      );
      console.table(rows, ['Key', 'Type', 'Status', 'Description']);
      console.log(
        '%c  Usage: YiPet.load("key")%c or %cawait YiPet.key()',
        'color:#22c55e',
        'color:#888',
        'color:#22c55e',
      );
      console.groupEnd();
    },

    help(): void {
      console.group(
        '%c🐾 YiPet CDN Bootstrap %c v1.2.0',
        'font-size:16px;color:#6366f1;font-weight:bold',
        'color:#888;font-size:12px',
      );
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color:#444');
      console.log(
        '%c  YiPet.cdn(path)%c          — Get full URL of a CDN resource',
        'color:#22c55e;font-weight:bold',
        'color:inherit',
      );
      console.log(
        '%c  YiPet.load(path)%c         — Dynamically load JS file (returns Promise)',
        'color:#22c55e;font-weight:bold',
        'color:inherit',
      );
      console.log(
        '%c  YiPet.css(path)%c          — Dynamically load CSS file',
        'color:#22c55e;font-weight:bold',
        'color:inherit',
      );
      console.log(
        '%c  YiPet.list(filter?)%c      — List available resources, supports keyword filtering',
        'color:#22c55e;font-weight:bold',
        'color:inherit',
      );
      console.log(
        '%c  YiPet.loaded()%c           — List of loaded resources',
        'color:#22c55e;font-weight:bold',
        'color:inherit',
      );
      console.log(
        '%c  YiPet.help()%c             — Show this help',
        'color:#22c55e;font-weight:bold',
        'color:inherit',
      );
      console.log('');
      console.log('%c  Shorthand methods (common libraries):', 'color:#f59e0b;font-weight:bold');
      console.log(
        '%c  await YiPet.vue()         YiPet.jquery()      YiPet.bootstrap()',
        'color:inherit',
      );
      console.log(
        '%c  await YiPet.react()       YiPet.dayjs()       YiPet.gsap()',
        'color:inherit',
      );
      console.log(
        '%c  await YiPet.anime()       YiPet.swiper()      YiPet.apexcharts()',
        'color:inherit',
      );
      console.log(
        '%c  await YiPet.mermaid()     YiPet.marked()      YiPet.xlsx()',
        'color:inherit',
      );
      console.log(
        '%c  await YiPet.html2canvas() YiPet.turndown()    YiPet.feather()',
        'color:inherit',
      );
      console.log(
        '%c  YiPet.animateCSS()        YiPet.bootstrapCSS() YiPet.fancybox()',
        'color:inherit',
      );
      console.log('');
      console.log('%c  Examples:', 'color:#f59e0b;font-weight:bold');
      console.log(
        '%c  > YiPet.list("vue")%c          // Search Vue-related resources',
        'color:#a78bfa',
        'color:#888',
      );
      console.log(
        '%c  > await YiPet.vue()%c          // Load Vue 3 to current page',
        'color:#a78bfa',
        'color:#888',
      );
      console.log(
        '%c  > YiPet.css("animate-css")%c   // Load Animate.css',
        'color:#a78bfa',
        'color:#888',
      );
      console.log(
        '%c  > YiPet.cdn("vendor/jquery@3.7.1/jquery.min.js")%c',
        'color:#a78bfa',
        'color:#888',
      );
      console.groupEnd();
    },
  };

  // Attach shortcut methods
  for (const entry of CDN_CATALOG) {
    const method = entry.key.replace(/-([a-z])/g, (_match: string, c: string) => c.toUpperCase());
    if (!(method in YiPet)) {
      (YiPet as Record<string, unknown>)[method] = () => injector.loadByKey(entry.key);
    }
  }

  (root as unknown as Record<string, unknown>).YiPet = YiPet;

  // ── Pet Overlay DOM ──────────────────────────────────────────────────

  const extRoot = BASE.replace(/cdn\/$/, '');

  const petContainer = document.createElement('div');
  petContainer.id = 'yipet-overlay';
  petContainer.style.cssText =
    'position:fixed;bottom:20%;right:20px;z-index:2147483647;' +
    'transition:opacity 100ms ease;opacity:0;pointer-events:none;' +
    'padding:24px;border-radius:50%;' +
    'background-size:cover;';
  petContainer.setAttribute('data-pet', 'yipet');
  petContainer.style.backgroundImage = getGradientByIndex(initialColor);
  const petImg = document.createElement('img');
  petImg.id = 'yipet-pet-img';
  petImg.alt = 'YiPet';
  petImg.style.cssText = 'width:260px;height:auto;';
  petImg.src =
    extRoot + 'assets/images/' + initialRole.toLowerCase().replace(/\s+/g, '-') + '/icon.png';
  petContainer.appendChild(petImg);

  // Click pet to toggle chat window
  petImg.style.cursor = 'pointer';
  petImg.addEventListener('click', (e) => {
    e.stopPropagation();
    if ((window as unknown as Record<string, unknown>).YiPetChat) {
      ((window as unknown as Record<string, unknown>).YiPetChat as { toggle: () => void }).toggle();
    }
  });

  function ensureOverlayInDOM(): void {
    if (!petContainer.parentNode && document.body) {
      document.body.appendChild(petContainer);
    }
  }
  ensureOverlayInDOM();

  // Apply initial theme
  applyThemeColors(document.documentElement, initialColor);

  // ── Event Listeners ──────────────────────────────────────────────────

  window.addEventListener('yipet:visibilityChanged', ((e: CustomEvent) => {
    ensureOverlayInDOM();
    petContainer.style.opacity = e.detail.visible ? '1' : '0';
  }) as EventListener);

  window.addEventListener('yipet:sizeChanged', ((e: CustomEvent) => {
    petImg.style.width = String(e.detail.size) + 'px';
  }) as EventListener);

  window.addEventListener('yipet:roleChanged', ((e: CustomEvent) => {
    const role = String(e.detail.role || 'teacher')
      .toLowerCase()
      .replace(/\s+/g, '-');
    petImg.src = extRoot + 'assets/images/' + role + '/icon.png';
    if (e.detail.systemPrompt) {
      petContainer.dataset.systemPrompt = String(e.detail.systemPrompt);
    }
  }) as EventListener);

  window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
    const idx = Number(e.detail.color) || 0;
    petContainer.style.backgroundImage = getGradientByIndex(idx);
    petContainer.dataset.colorIndex = String(idx);
    applyThemeColors(document.documentElement, idx);
    if (idx < 0) removeCdnStyles();
    else ensureCdnStyles();
  }) as EventListener);

  // ── CDN Style Management ─────────────────────────────────────────────

  const cdnStyleLinks: HTMLLinkElement[] = [];
  const CDN_STYLE_ATTR = 'data-yipet-cdn';

  function injectCdnCss(path: string): HTMLLinkElement {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.setAttribute(CDN_STYLE_ATTR, '');
    el.href = BASE + path;
    document.head.appendChild(el);
    cdnStyleLinks.push(el);
    return el;
  }

  function removeCdnStyles(): void {
    for (const el of document.querySelectorAll(`[${CDN_STYLE_ATTR}]`)) el.remove();
    cdnStyleLinks.length = 0;
  }

  function ensureCdnStyles(): void {
    if (cdnStyleLinks.length > 0) return;
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'css') injectCdnCss(entry.path);
    }
  }

  if (initialColor >= 0) ensureCdnStyles();

  // ── Auto-load JS ─────────────────────────────────────────────────────

  const jsEntries = CDN_CATALOG.filter((e: CdnEntry) => e.type === 'js');
  (function loadSeq(i: number) {
    if (i >= jsEntries.length) {
      console.log(
        '%c🐾%c CDN Bootstrap ready — type YiPet.help() for usage guide',
        'color:#6366f1;font-weight:bold',
        'color:#888',
      );
      return;
    }
    injector
      .loadJS(jsEntries[i].path)
      .then(() => {
        loadSeq(i + 1);
      })
      .catch(() => {
        loadSeq(i + 1);
      });
  })(0);
}
