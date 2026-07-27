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

// ── Inline Theme Data (kept self-contained for classic-script injection) ─

/** CSS custom-property values per theme index, for documentElement.style injection.
 *  Mirrors theme-colors.ts THEME_PALETTES — keep in sync. */
const T: Record<string, string>[] = [
  {/* 0: Quantum Violet */
    '--primary':'#667eea','--primary-hover':'#5a67d8','--primary-light':'#818cf8',
    '--primary-gradient':'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    '--primary-gradient-hover':'linear-gradient(135deg, #5a67d8 0%, #6b46c1 50%, #d946ef 100%)',
    '--primary-rgb':'102,126,234','--primary-alpha':'rgba(102,126,234,0.1)',
    '--bg-primary':'#13122a','--bg-secondary':'#1e1a3b','--bg-tertiary':'#312d55',
    '--bg-elevated':'rgba(30,26,59,0.9)',
    '--bg-gradient':'linear-gradient(135deg, #13122a 0%, #1e1a3b 25%, #312d55 50%, #3d3870 75%, #5b5290 100%)',
    '--accent':'#a78bfa','--accent-rgb':'167,139,250','--accent-gradient':'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)',
    '--border-secondary':'rgba(167,139,250,0.3)','--border-focus':'#a78bfa',
    '--text-primary':'#f5f3ff','--text-secondary':'#d4d0e8','--text-accent':'#c4b5fd','--link-color':'#c4b5fd','--placeholder-color':'rgba(212,208,232,0.5)','--button-bg':'#667eea','--button-hover':'#5a67d8','--button-text':'#ffffff','--input-bg':'#1a1835','--input-border':'rgba(167,139,250,0.2)','--selection-bg':'rgba(102,126,234,0.3)',
    '--shadow-primary':'0 4px 20px rgba(102,126,234,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green':'#667eea',
  },
  {/* 1: Indigo Violet */
    '--primary':'#6366f1','--primary-hover':'#4f46e5','--primary-light':'#818cf8',
    '--primary-gradient':'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    '--primary-gradient-hover':'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
    '--primary-rgb':'99,102,241','--primary-alpha':'rgba(99,102,241,0.1)',
    '--bg-primary':'#11132b','--bg-secondary':'#1a1c3d','--bg-tertiary':'#2a2d5c',
    '--bg-elevated':'rgba(26,28,61,0.9)',
    '--bg-gradient':'linear-gradient(135deg, #11132b 0%, #1a1c3d 25%, #2a2d5c 50%, #3b3e78 75%, #4f52a0 100%)',
    '--accent':'#818cf8','--accent-rgb':'129,140,248','--accent-gradient':'linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)',
    '--border-secondary':'rgba(129,140,248,0.3)','--border-focus':'#818cf8',
    '--text-primary':'#f3f2ff','--text-secondary':'#d2d0e8','--text-accent':'#a5b4fc','--link-color':'#a5b4fc','--placeholder-color':'rgba(210,208,232,0.5)','--button-bg':'#6366f1','--button-hover':'#4f46e5','--button-text':'#ffffff','--input-bg':'#181730','--input-border':'rgba(129,140,248,0.2)','--selection-bg':'rgba(99,102,241,0.3)',
    '--shadow-primary':'0 4px 20px rgba(99,102,241,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green':'#6366f1',
  },
  {/* 2: Quantum Ocean */
    '--primary':'#06b6d4','--primary-hover':'#0891b2','--primary-light':'#22d3ee',
    '--primary-gradient':'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
    '--primary-gradient-hover':'linear-gradient(135deg, #0891b2 0%, #2563eb 50%, #4f46e5 100%)',
    '--primary-rgb':'6,182,212','--primary-alpha':'rgba(6,182,212,0.1)',
    '--bg-primary':'#0a1a22','--bg-secondary':'#0e2430','--bg-tertiary':'#143848',
    '--bg-elevated':'rgba(14,36,48,0.9)',
    '--bg-gradient':'linear-gradient(135deg, #0a1a22 0%, #0e2430 25%, #143848 50%, #1a4d63 75%, #226b8a 100%)',
    '--accent':'#22d3ee','--accent-rgb':'34,211,238','--accent-gradient':'linear-gradient(135deg, #22d3ee 0%, #06b6d4 50%, #0891b2 100%)',
    '--border-secondary':'rgba(34,211,238,0.3)','--border-focus':'#22d3ee',
    '--text-primary':'#f0f9fb','--text-secondary':'#c8e4ea','--text-accent':'#67e8f9','--link-color':'#67e8f9','--placeholder-color':'rgba(200,228,234,0.5)','--button-bg':'#06b6d4','--button-hover':'#0891b2','--button-text':'#ffffff','--input-bg':'#0f1e28','--input-border':'rgba(34,211,238,0.2)','--selection-bg':'rgba(6,182,212,0.3)',
    '--shadow-primary':'0 4px 20px rgba(6,182,212,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green':'#06b6d4',
  },
  {/* 3: Quantum Forest */
    '--primary':'#22c55e','--primary-hover':'#16a34a','--primary-light':'#4ade80',
    '--primary-gradient':'linear-gradient(135deg, #22c55e 0%, #10b981 50%, #059669 100%)',
    '--primary-gradient-hover':'linear-gradient(135deg, #16a34a 0%, #059669 50%, #047857 100%)',
    '--primary-rgb':'34,197,94','--primary-alpha':'rgba(34,197,94,0.1)',
    '--bg-primary':'#0a1a12','--bg-secondary':'#0e2418','--bg-tertiary':'#143824',
    '--bg-elevated':'rgba(14,36,24,0.9)',
    '--bg-gradient':'linear-gradient(135deg, #0a1a12 0%, #0e2418 25%, #143824 50%, #1a4d30 75%, #226b42 100%)',
    '--accent':'#34d399','--accent-rgb':'52,211,153','--accent-gradient':'linear-gradient(135deg, #34d399 0%, #10b981 50%, #059669 100%)',
    '--border-secondary':'rgba(52,211,153,0.3)','--border-focus':'#34d399',
    '--text-primary':'#f0faf3','--text-secondary':'#c8e8d0','--text-accent':'#6ee7b7','--link-color':'#6ee7b7','--placeholder-color':'rgba(200,232,208,0.5)','--button-bg':'#22c55e','--button-hover':'#16a34a','--button-text':'#ffffff','--input-bg':'#0f1e16','--input-border':'rgba(52,211,153,0.2)','--selection-bg':'rgba(34,197,94,0.3)',
    '--shadow-primary':'0 4px 20px rgba(34,197,94,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green':'#22c55e',
  },
  {/* 4: Quantum Sunset */
    '--primary':'#f59e0b','--primary-hover':'#d97706','--primary-light':'#fbbf24',
    '--primary-gradient':'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #a855f7 100%)',
    '--primary-gradient-hover':'linear-gradient(135deg, #d97706 0%, #db2777 50%, #9333ea 100%)',
    '--primary-rgb':'245,158,11','--primary-alpha':'rgba(245,158,11,0.1)',
    '--bg-primary':'#1a140a','--bg-secondary':'#281e0e','--bg-tertiary':'#3d2e14',
    '--bg-elevated':'rgba(40,30,14,0.9)',
    '--bg-gradient':'linear-gradient(135deg, #1a140a 0%, #281e0e 25%, #3d2e14 50%, #5c401a 75%, #855e22 100%)',
    '--accent':'#fbbf24','--accent-rgb':'251,191,36','--accent-gradient':'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
    '--border-secondary':'rgba(251,191,36,0.3)','--border-focus':'#fbbf24',
    '--text-primary':'#fdf8f0','--text-secondary':'#e8dcc8','--text-accent':'#fcd34d','--link-color':'#fcd34d','--placeholder-color':'rgba(232,220,200,0.5)','--button-bg':'#f59e0b','--button-hover':'#d97706','--button-text':'#1a140a','--input-bg':'#1f180e','--input-border':'rgba(251,191,36,0.2)','--selection-bg':'rgba(245,158,11,0.3)',
    '--shadow-primary':'0 4px 20px rgba(245,158,11,0.4),0 0 0 1px rgba(255,255,255,0.1) inset',
    '--green':'#f59e0b',
  },
];

function getGradientByIndex(idx: number): string {
  if (idx < 0) return 'none';
  return (idx >= 0 && idx < T.length) ? T[idx]['--primary-gradient'] : T[0]['--primary-gradient'];
}

function applyThemeColors(root: HTMLElement, idx: number): void {
  if (idx < 0) { for (const k of Object.keys(T[0])) root.style.removeProperty(k); return; }
  const safe = (idx >= 0 && idx < T.length) ? idx : 0;
  const vars = T[safe];
  const s = root.style;
  for (const key of Object.keys(vars)) s.setProperty(key, vars[key]);
}

const THEME_COUNT = T.length;

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

// When injected into MAIN world, the &lt;script&gt; tag carries data-base + data-role
const _cs = typeof document !== 'undefined' ? document.currentScript : null;
const _injectedBase: string =
  (_cs && (_cs as HTMLScriptElement).dataset?.base) || '';
const _injectedRole: string =
  (_cs && (_cs as HTMLScriptElement).dataset?.role) || 'Teacher';
const _injectedColor: number = parseInt(
  (_cs && (_cs as HTMLScriptElement).dataset?.color) || '0', 10
);

/* ═══════════════════════════════════════════════════════════════════════════
   Phase 1: Content Script — inject self into MAIN world
   ═══════════════════════════════════════════════════════════════════════════ */

if (_isContentScript && !_injectedBase) {
  /* ── Pet state + popup message relay (ISOLATED world) ──────────── */

  const PET_URL_STATE_KEY = 'pet_state_by_url';
  let _petVisible = false;
  let _petSize = 260;
  let _petRole = 'Teacher';
  let _petColor = 0;

  /** Derive a stable URL key from the current page (origin + pathname, ignoring hash/query). */
  function getPageUrlKey(): string {
    return window.location.origin + window.location.pathname;
  }
  (async function injectIntoMainWorld() {
    const extBase = chrome.runtime.getURL('cdn/');
    const selfUrl = chrome.runtime.getURL('assets/bootstrap.js');

    // Load saved color theme BEFORE injecting into MAIN world so the
    // initial pet gradient matches the user's chosen theme immediately.
    try {
      const themeResult = await chrome.storage.local.get('petColorTheme');
      const savedTheme = themeResult?.petColorTheme;
      if (typeof savedTheme === 'number' && savedTheme >= -1 && savedTheme < THEME_COUNT) {
        _petColor = savedTheme;
      }
    } catch { /* use default */ }

    // Load saved role BEFORE injecting into MAIN world so the
    // initial pet image matches the user's chosen role immediately.
    let initialRole = _petRole;
    try {
      const roleResult = await chrome.storage.local.get(ROLE_STORAGE_KEY);
      const savedRole = roleResult?.[ROLE_STORAGE_KEY];
      if (savedRole && isValidRole(savedRole)) {
        initialRole = savedRole;
        _petRole = savedRole;
      }
    } catch { /* use default */ }

    // Also check per-URL state for a page-specific role override
    try {
      const urlKey = getPageUrlKey();
      const stateResult = await chrome.storage.local.get(PET_URL_STATE_KEY);
      const map = (stateResult && stateResult[PET_URL_STATE_KEY]) || {};
      const urlState = map[urlKey];
      if (urlState?.role && isValidRole(urlState.role)) {
        initialRole = urlState.role;
        _petRole = urlState.role;
      }
    } catch { /* use global role */ }

    const el = document.createElement('script');
    el.src = selfUrl;
    el.dataset.base = extBase;
    el.dataset.role = initialRole;
    el.dataset.color = String(_petColor);
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

    // Inject chat script into MAIN world
    try {
      const chatUrl = chrome.runtime.getURL('assets/chat.js');
      const chatEl = document.createElement('script');
      chatEl.src = chatUrl;
      chatEl.dataset.apiBase = 'http://localhost:10086';
      chatEl.dataset.colorIndex = String(_petColor);
      chatEl.dataset.role = initialRole;
      chatEl.id = 'yipet-chat';
      (document.head || document.documentElement).appendChild(chatEl);
    } catch { /* chat unavailable */ }
  })();

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
   * Role is loaded before MAIN world injection — this restores visibility,
   * size, and color, then always syncs the role with MAIN world.
   */
  function restorePetState(): void {
    const urlKey = getPageUrlKey();

    // Load per-url pet state (visible, size, color) — role already loaded before injection
    chrome.storage.local.get(PET_URL_STATE_KEY).then((stateResult: any) => {
      const map = (stateResult && stateResult[PET_URL_STATE_KEY]) || {};
      const urlState = map[urlKey];
      if (urlState) {
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
        // Restore color
        if (typeof urlState.color === 'number' && urlState.color !== _petColor) {
          _petColor = urlState.color;
          notifyMainWorld('colorChanged', { color: _petColor });
        }
      }
    }).then(() => {
      // Always sync role with MAIN world — corrects any stale state
      notifyMainWorld('roleChanged', { role: _petRole, systemPrompt: lookupSystemPrompt(_petRole) });
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
          sendResponse({ success: true, visible: _petVisible, size: _petSize, role: _petRole, color: _petColor });
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
          // Persist color theme globally (cross-page default)
          chrome.storage.local.set({ petColorTheme: _petColor }).catch(() => {});
          sendResponse({ success: true });
          break;
        }
        case 'toggleChat': {
          notifyMainWorld('chatToggled', {});
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

  // Persist state on page unload — defensive safety net ensuring the latest
  // in-memory state is flushed to chrome.storage.local before the page destroys
  // the execution context. Normal changes are already persisted synchronously
  // in each message handler; this covers edge cases where a final state
  // mutation arrives between the last persist call and page teardown.
  window.addEventListener('beforeunload', () => {
    persistPetState();
  });

  // Also persist when the page enters the back/forward cache (bfcache) or
  // becomes hidden — not strictly required since beforeunload covers teardown,
  // but visibilitychange fires sooner and covers tab-switch edge cases.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      persistPetState();
    }
  });

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
    'transition:opacity 100ms ease;opacity:0;pointer-events:none;' +
    'padding:24px;border-radius:50%;' +
    'background-size:cover;';
  petContainer.setAttribute('data-pet', 'yipet');
  // Apply initial color theme gradient
  petContainer.style.backgroundImage = getGradientByIndex(_injectedColor);
  const petImg = document.createElement('img');
  petImg.id = 'yipet-pet-img';
  petImg.alt = 'YiPet';
  petImg.style.cssText = 'width:260px;height:auto;';
  // Use the role passed from ISOLATED world — always matches saved preference
  petImg.src = extRoot + 'assets/images/' +
    _injectedRole.toLowerCase().replace(/\s+/g, '-') + '/icon.png';
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

  // Apply initial theme via direct CSS custom property injection
  applyThemeColors(document.documentElement, _injectedColor);

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

  // Color listener — apply gradient, theme CSS, and manage CDN styles
  window.addEventListener('yipet:colorChanged', ((e: CustomEvent) => {
    const idx = Number(e.detail.color) || 0;
    petContainer.style.backgroundImage = getGradientByIndex(idx);
    petContainer.dataset.colorIndex = String(idx);
    applyThemeColors(document.documentElement, idx);
    // Remove CDN styles when None selected; restore when switching to a theme
    if (idx < 0) removeCdnStyles(); else ensureCdnStyles();
  }) as EventListener);

  /* ── CDN style management (removable for None theme) ──────────── */

  const cdnStyleLinks: HTMLLinkElement[] = [];
  const CDN_STYLE_ATTR = 'data-yipet-cdn';

  /** Inject a CDN CSS link, tagging it for later removal. Returns the <link>. */
  function injectCdnCss(path: string): HTMLLinkElement {
    const el = document.createElement('link');
    el.rel = 'stylesheet';
    el.setAttribute(CDN_STYLE_ATTR, '');
    el.href = BASE + path;
    document.head.appendChild(el);
    cdnStyleLinks.push(el);
    return el;
  }

  /** Remove all injected CDN style links from the DOM. */
  function removeCdnStyles(): void {
    for (const el of document.querySelectorAll(`[${CDN_STYLE_ATTR}]`)) el.remove();
    cdnStyleLinks.length = 0;
  }

  /** (Re-)inject CDN CSS if not already present. */
  function ensureCdnStyles(): void {
    if (cdnStyleLinks.length > 0) return; // already injected
    for (const entry of CDN_CATALOG) {
      if (entry.type === 'css') injectCdnCss(entry.path);
    }
  }

  // Load CDN CSS only when a theme is active (skip for None / idx < 0)
  if (_injectedColor >= 0) ensureCdnStyles();

  /* ── Auto-load all catalog JS resources ────────────────────────── */

  // CSS already handled above; now inject vendor JS
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
