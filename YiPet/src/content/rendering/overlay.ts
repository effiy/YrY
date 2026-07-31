/**
 * Pet overlay — creates and manages the YiPet DOM element in the MAIN world.
 *
 * Extracted from bootstrap.ts Phase 2 (MAIN world).
 * Handles: pet container/image creation, event listeners for visibility/size/role/color,
 * CDN style management, CDN JS auto-loading, and the window.YiPet API.
 */

import { PET_DEFAULTS } from '@/config/defaults';
import { CDN_CATALOG, type CdnEntry, catalogByKey } from '../cdn/catalog';
import { createInjector } from '../cdn/injector';
import { applyThemeColors } from '../config/theme-config';

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
    'background-size:cover;' +
    'box-shadow:0 0 24px 4px rgba(var(--primary-rgb, 99, 102, 241), 0.45),' +
    '0 0 8px 2px rgba(var(--primary-rgb, 99, 102, 241), 0.6);';
  petContainer.setAttribute('data-pet', 'yipet');
  const petImg = document.createElement('img');
  petImg.id = 'yipet-pet-img';
  petImg.alt = 'YiPet';
  petImg.style.cssText = `width:${PET_DEFAULTS.pet.defaultSize}px;height:auto;`;
  petImg.src =
    extRoot + 'assets/images/' + initialRole.toLowerCase().replace(/\s+/g, '-') + '/icon.png';
  petContainer.appendChild(petImg);

  // Double-click pet to toggle chat window
  petImg.style.cursor = 'grab';

  let dragState: {
    startX: number;
    startY: number;
    originLeft: number;
    originTop: number;
    moved: boolean;
  } | null = null;

  function beginDrag(clientX: number, clientY: number) {
    const rect = petContainer.getBoundingClientRect();
    petContainer.style.left = rect.left + 'px';
    petContainer.style.top = rect.top + 'px';
    petContainer.style.right = 'auto';
    petContainer.style.bottom = 'auto';
    dragState = {
      startX: clientX,
      startY: clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false,
    };
    petImg.style.cursor = 'grabbing';
    document.addEventListener('mousemove', onDocMouseMove);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', onDocTouchMove, { passive: true });
    document.addEventListener('touchend', endDrag);
    document.addEventListener('touchcancel', endDrag);
  }

  function onDragMove(clientX: number, clientY: number) {
    if (!dragState) return;
    const dx = clientX - dragState.startX;
    const dy = clientY - dragState.startY;
    if (!dragState.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    dragState.moved = true;
    petContainer.style.left = dragState.originLeft + dx + 'px';
    petContainer.style.top = dragState.originTop + dy + 'px';
  }

  function onDocMouseMove(e: MouseEvent) {
    onDragMove(e.clientX, e.clientY);
  }
  function onDocTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    if (!t) return;
    onDragMove(t.clientX, t.clientY);
  }

  function endDrag() {
    if (!dragState) return;
    dragState = null;
    petImg.style.cursor = 'grab';
    document.removeEventListener('mousemove', onDocMouseMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDocTouchMove);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);
  }

  petImg.addEventListener('mousedown', (e) => {
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  });

  petImg.addEventListener(
    'touchstart',
    (e) => {
      const t = e.touches[0];
      if (!t) return;
      beginDrag(t.clientX, t.clientY);
    },
    { passive: true },
  );

  petImg.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    if (dragState?.moved) return;
    const w = window as unknown as Record<string, unknown>;
    const chat = w.YiPetChat as { toggle: () => void } | undefined;
    if (chat) {
      chat.toggle();
    } else {
      w.__yipetPendingToggle = true;
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
    const visible = e.detail.visible;
    petContainer.style.opacity = visible ? '1' : '0';
    petContainer.style.pointerEvents = visible ? 'auto' : 'none';
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
    petContainer.dataset.colorIndex = String(idx);
    applyThemeColors(document.documentElement, idx);
  }) as EventListener);

  window.addEventListener('yipet:chatToggled', (() => {
    const w = window as unknown as Record<string, unknown>;
    const chat = w.YiPetChat as { toggle: () => void } | undefined;
    if (!chat) {
      w.__yipetPendingChatToggle = true;
    }
    // When chat is loaded, index.tsx's own listener handles the toggle.
  }) as EventListener);

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
