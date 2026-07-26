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

// ── Inline Role Config (kept self-contained for content-script classic loading) ─

const ROLE_STORAGE_KEY = 'petRole';

const ROLE_SYSTEM_PROMPTS: Record<string, string> = {
  Teacher:
    'You are a knowledgeable and patient Teacher. ' +
    'You explain concepts clearly with examples, adapt your teaching style ' +
    'to the learner\'s level, and encourage curiosity. ' +
    'You are warm, approachable, and never condescending. ' +
    'When you don\'t know something, you admit it honestly and offer to look it up. ' +
    'You celebrate small wins and gently correct mistakes. ' +
    'Your goal is to make learning enjoyable and empowering.',
  Doctor:
    'You are a caring and professional Doctor with extensive medical knowledge. ' +
    'You provide evidence-based health information with a warm bedside manner. ' +
    'You always include a disclaimer that you are not a substitute for in-person ' +
    'medical consultation. You ask clarifying questions about symptoms, duration, ' +
    'and severity before offering guidance. You explain medical terms in plain ' +
    'language, show empathy for discomfort or anxiety, and prioritize safety — ' +
    'urging the user to seek emergency care when symptoms sound serious. ' +
    'You cover general medicine, preventive care, mental health, nutrition, ' +
    'and wellness. You stay calm, reassuring, and never alarmist. ' +
    'Your tone is warm, attentive, and deeply respectful of patient dignity.',
  'Pastry Chef':
    'You are a creative and passionate Pastry Chef. ' +
    'You share baking tips, recipes, and techniques with infectious enthusiasm. ' +
    'You know the science behind pastry — why butter must be cold, why dough ' +
    'needs to rest, how gluten develops. You suggest substitutions for dietary ' +
    'needs, troubleshoot common baking failures, and celebrate the joy of ' +
    'homemade desserts. You describe flavors, textures, and aromas in vivid ' +
    'sensory detail. Your tone is warm, playful, and irresistibly inspiring — ' +
    'like a friend who always brings the best dessert to the party.',
  'Police Officer':
    'You are a dedicated and community-focused Police Officer. ' +
    'You provide safety advice, explain laws and regulations in plain language, ' +
    'and promote crime prevention awareness. You are approachable, fair, and ' +
    'committed to protecting and serving. You de-escalate tense situations with ' +
    'calm, clear communication. You know when to listen and when to act. ' +
    'You never offer legal advice but can explain general principles of law ' +
    'and public safety. Your tone is professional yet personable — firm when ' +
    'necessary, compassionate when someone is scared or vulnerable. ' +
    'You treat every interaction with dignity and respect.',
};

const VALID_ROLE_SET_BS = new Set(Object.keys(ROLE_SYSTEM_PROMPTS));

function isValidRole(input: string): string | null {
  if (VALID_ROLE_SET_BS.has(input)) return input;
  const lower = input.toLowerCase();
  for (const name of VALID_ROLE_SET_BS) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

function lookupSystemPrompt(name: string): string {
  return ROLE_SYSTEM_PROMPTS[name] || '';
}

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

  /* ── Pet state + popup message relay (ISOLATED world) ──────────── */

  const PET_STATE_KEY = 'pet_global_state';
  const PET_URL_STATE_KEY = 'pet_state_by_url';
  let _petVisible = false;
  let _petSize = 260;
  let _petRole = 'Teacher';
  let _petColor = 0;

  /** Derive a stable URL key from the current page (origin + pathname, ignoring hash/query). */
  function getPageUrlKey(): string {
    return window.location.origin + window.location.pathname;
  }

  /**
   * Persist current pet state to chrome.storage.local (keyed by page URL).
   * The content script reads this on init to survive page refresh;
   * the popup also writes here so popup changes survive refresh.
   */
  function persistPetState(): void {
    const urlKey = getPageUrlKey();
    chrome.storage.local.get(PET_URL_STATE_KEY).then((result) => {
      const map = (result && result[PET_URL_STATE_KEY]) || {};
      map[urlKey] = { visible: _petVisible, size: _petSize, role: _petRole, color: _petColor };
      chrome.storage.local.set({ [PET_URL_STATE_KEY]: map }).catch(() => {});
    }).catch(() => {});
  }

  /**
   * Restore saved pet state from chrome.storage.local on content script init.
   * Uses page URL as key so no service worker is needed to resolve tab ID.
   */
  function restorePetState(): void {
    const urlKey = getPageUrlKey();

    // Load role preference (global, survives tab changes and browser restart)
    chrome.storage.local.get(ROLE_STORAGE_KEY).then((roleResult) => {
      const savedRole = roleResult?.[ROLE_STORAGE_KEY];
      if (savedRole && isValidRole(savedRole) && savedRole !== _petRole) {
        _petRole = savedRole;
        notifyMainWorld('roleChanged', { role: _petRole, systemPrompt: lookupSystemPrompt(_petRole) });
      }

      // Load per-url pet state (visible, size, role, color)
      return chrome.storage.local.get(PET_URL_STATE_KEY);
    }).then((stateResult: any) => {
      const map = (stateResult && stateResult[PET_URL_STATE_KEY]) || {};
      const urlState = map[urlKey];
      if (!urlState) return;

      // Restore visibility
      if (typeof urlState.visible === 'boolean' && urlState.visible !== _petVisible) {
        _petVisible = urlState.visible;
        notifyMainWorld('visibilityChanged', { visible: _petVisible });
      }
      // Restore size
      if (typeof urlState.size === 'number' && urlState.size !== _petSize) {
        _petSize = urlState.size;
        notifyMainWorld('sizeChanged', { size: _petSize });
      }
      // Restore role (url-specific overrides global)
      if (typeof urlState.role === 'string' && isValidRole(urlState.role) && urlState.role !== _petRole) {
        _petRole = urlState.role;
        notifyMainWorld('roleChanged', { role: _petRole, systemPrompt: lookupSystemPrompt(_petRole) });
      }
      // Restore color
      if (typeof urlState.color === 'number' && urlState.color !== _petColor) {
        _petColor = urlState.color;
        notifyMainWorld('colorChanged', { color: _petColor });
      }
    }).catch((err: Error) => {
      console.warn('[YiPet] Failed to restore pet state:', err.message);
    });
  }

  function notifyMainWorld(type: string, detail: Record<string, unknown>): void {
    window.dispatchEvent(new CustomEvent(`yipet:${type}`, { detail }));
  }

  chrome.runtime.onMessage.addListener(
    (msg: Record<string, unknown>, _sender, sendResponse) => {
      switch (msg.action) {
        case 'ping': {
          sendResponse({ success: true, visible: _petVisible, size: _petSize, role: _petRole });
          break;
        }
        case 'toggleVisibility': {
          _petVisible = !_petVisible;
          notifyMainWorld('visibilityChanged', { visible: _petVisible });
          persistPetState();
          sendResponse({ success: true, visible: _petVisible });
          break;
        }
        case 'setVisibility': {
          _petVisible = !!msg.visible;
          notifyMainWorld('visibilityChanged', { visible: _petVisible });
          persistPetState();
          sendResponse({ success: true, visible: _petVisible });
          break;
        }
        case 'changeSize': {
          _petSize = (msg.size as number) ?? _petSize;
          notifyMainWorld('sizeChanged', { size: _petSize });
          persistPetState();
          sendResponse({ success: true, size: _petSize });
          break;
        }
        case 'setRole': {
          const canonical = isValidRole((msg.role as string) ?? '');
          if (!canonical) {
            console.warn('[YiPet] Invalid role rejected:', msg.role);
            sendResponse({ success: false });
            break;
          }
          _petRole = canonical;
          const systemPrompt = lookupSystemPrompt(canonical);
          notifyMainWorld('roleChanged', { role: _petRole, systemPrompt });
          // Persist role globally
          chrome.storage.local.set({ [ROLE_STORAGE_KEY]: _petRole }).catch((err: Error) => {
            console.warn('[YiPet] Failed to persist role preference:', err.message);
          });
          persistPetState();
          sendResponse({ success: true, role: _petRole });
          break;
        }
        case 'setColor': {
          _petColor = (msg.color as number) ?? _petColor;
          notifyMainWorld('colorChanged', { color: _petColor });
          persistPetState();
          sendResponse({ success: true });
          break;
        }
        default: {
          sendResponse({ success: false });
        }
      }
      return true; // keep channel open for async response
    },
  );

  // Restore saved pet state on content script initialization
  // so settings survive page refresh without needing to open the popup
  restorePetState();

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

  /* ── Pet Overlay ────────────────────────────────────────────────── */

  // Derive extension root from CDN base (BASE = chrome-extension://xxx/cdn/)
  const extRoot = BASE.replace(/cdn\/$/, '');

  const petContainer = document.createElement('div');
  petContainer.id = 'yipet-overlay';
  petContainer.style.cssText =
    'position:fixed;bottom:20%;right:20px;z-index:2147483647;' +
    'transition:opacity 100ms ease;opacity:0;pointer-events:none;';
  const petImg = document.createElement('img');
  petImg.id = 'yipet-pet-img';
  petImg.alt = 'YiPet';
  petImg.style.cssText = 'width:260px;height:auto;';
  petImg.src = extRoot + 'assets/images/teacher/icon.png';
  petContainer.appendChild(petImg);

  function ensureOverlayInDOM(): void {
    if (!petContainer.parentNode && document.body) {
      document.body.appendChild(petContainer);
    }
  }
  ensureOverlayInDOM();

  // Visibility listener
  window.addEventListener('yipet:visibilityChanged', ((e: CustomEvent) => {
    ensureOverlayInDOM();
    petContainer.style.opacity = e.detail.visible ? '1' : '0';
  }) as EventListener);

  // Size listener
  window.addEventListener('yipet:sizeChanged', ((e: CustomEvent) => {
    petImg.style.width = String(e.detail.size) + 'px';
  }) as EventListener);

  // Role listener — swap pet icon and update system prompt for AI chat
  window.addEventListener('yipet:roleChanged', ((e: CustomEvent) => {
    const role = String(e.detail.role || 'teacher').toLowerCase().replace(/\s+/g, '-');
    petImg.src = extRoot + 'assets/images/' + role + '/icon.png';
    // Store system prompt on the pet container for chat integration
    if (e.detail.systemPrompt) {
      petContainer.dataset.systemPrompt = String(e.detail.systemPrompt);
    }
  }) as EventListener);

  // Color listener — store color index for render layer
  window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
    petContainer.dataset.colorIndex = String(Number(e.detail.color) || 0);
  }) as EventListener);

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
