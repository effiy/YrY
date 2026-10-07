/**
 * Pet overlay — creates and manages the YiPet DOM element in the MAIN world.
 *
 * Extracted from bootstrap.ts Phase 2 (MAIN world).
 * Handles: pet container/image creation, animation lifecycle (ambient, idle, bubbles),
 * drag interaction, CDN style/JS management, and the window.YiPet API.
 * DOM updates for settings (visibility/size/role/color) are handled by relay.ts.
 */

import { PET_DEFAULTS } from '@/config/defaults';
import { CDN_CATALOG } from '../cdn/catalog';
import { createInjector } from '../cdn/injector';
import { applyThemeColors } from '../config/theme-config';
import { injectPetStylesheet } from './animation-styles';
import { attachYiPetApi } from './yipetApi';

// ── Log Helpers ─────────────────────────────────────────────────────────

function _ok(msg: string) {
  console.log('%c[YiPet]%c ✓ %c' + msg, 'color:#6366f1;font-weight:bold', 'color:#22c55e;font-weight:bold', 'color:#888');
}

// ── Helpers ─────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Idle Behavior ───────────────────────────────────────────────────────

interface IdleAction {
  name: string;
  target: 'overlay' | 'img';
  duration: number;
  weight: number;
}

function pickWeightedAction(actions: IdleAction[]): IdleAction {
  const total = actions.reduce((s, a) => s + a.weight, 0);
  let r = Math.random() * total;
  for (const a of actions) {
    r -= a.weight;
    if (r <= 0) return a;
  }
  return actions[actions.length - 1];
}

function triggerPetAction(
  container: HTMLElement,
  img: HTMLElement,
  action: IdleAction,
): void {
  const el = action.target === 'img' ? img : container;
  el.classList.add('yipet-' + action.name);

  function cleanup() {
    el.classList.remove('yipet-' + action.name);
    el.removeEventListener('animationend', onEnd);
  }

  function onEnd(e: AnimationEvent) {
    if (e.animationName && e.animationName.indexOf('yipet-' + action.name) === 0) {
      cleanup();
    }
  }

  el.addEventListener('animationend', onEnd, { once: false });
  // Fallback timeout in case animationend doesn't fire
  setTimeout(() => {
    if (el.classList.contains('yipet-' + action.name)) {
      cleanup();
    }
  }, action.duration + 300);
}

function startIdleBehavior(
  container: HTMLElement,
  img: HTMLElement,
): { stop: () => void; pause: () => void; resume: () => void } {
  const cfg = PET_DEFAULTS.animation.pet;

  const actions: IdleAction[] = [
    { name: 'wiggle', target: 'overlay', duration: cfg.wagDuration, weight: 30 },
    { name: 'blink', target: 'img', duration: cfg.blinkDuration, weight: 30 },
    { name: 'tilt', target: 'overlay', duration: 1200, weight: 25 },
    { name: 'bounce', target: 'overlay', duration: 400, weight: 15 },
  ];

  let timer: ReturnType<typeof setTimeout> | null = null;
  let paused = false;

  function scheduleNext() {
    if (paused) return;
    const delay = rand(cfg.idleMinInterval, cfg.idleMaxInterval);
    timer = setTimeout(() => {
      if (paused) return;
      // Don't play idle actions while user is dragging
      if (container.dataset.dragging === 'true') {
        scheduleNext();
        return;
      }
      const action = pickWeightedAction(actions);
      triggerPetAction(container, img, action);
      // Schedule next after this action's duration + cooldown
      timer = setTimeout(scheduleNext, action.duration + cfg.idleActionCooldown);
    }, delay);
  }

  scheduleNext();

  return {
    stop() {
      paused = true;
      if (timer !== null) { clearTimeout(timer); timer = null; }
    },
    pause() {
      paused = true;
      if (timer !== null) { clearTimeout(timer); timer = null; }
    },
    resume() {
      paused = false;
      scheduleNext();
    },
  };
}

// ── Sparkle Particles ───────────────────────────────────────────────────

function createSparkles(container: HTMLElement, count: number, duration: number): void {
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('span');
    sparkle.className = 'yipet-sparkle';
    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 40;
    sparkle.style.setProperty('--sx', Math.cos(angle) * dist + 'px');
    sparkle.style.setProperty('--sy', Math.sin(angle) * dist + 'px');
    container.appendChild(sparkle);
    sparkle.addEventListener('animationend', () => {
      sparkle.remove();
    }, { once: true });
  }
  // Cleanup any stragglers
  setTimeout(() => {
    container.querySelectorAll('.yipet-sparkle').forEach((s) => s.remove());
  }, duration + 100);
}

// ── Thought Bubbles ─────────────────────────────────────────────────────

function startThoughtBubbles(
  container: HTMLElement,
): { stop: () => void; pause: () => void; resume: () => void } {
  const cfg = PET_DEFAULTS.animation.pet;
  const bubbles = PET_DEFAULTS.constants.ANIMATION.IDLE_BUBBLES;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let paused = false;
  let bubbleEl: HTMLElement | null = null;

  function showBubble() {
    if (paused) return;
    if (bubbleEl) bubbleEl.remove();

    bubbleEl = document.createElement('div');
    bubbleEl.className = 'yipet-thought-bubble';
    bubbleEl.textContent = pickRandom(bubbles);
    container.appendChild(bubbleEl);

    // Trigger in animation
    requestAnimationFrame(() => {
      if (!bubbleEl) return;
      bubbleEl.classList.add('in');
    });

    // Start out animation after show duration
    const outTimer = setTimeout(() => {
      if (!bubbleEl) return;
      bubbleEl.classList.add('out');
      bubbleEl.addEventListener('animationend', (e) => {
        if (e.animationName === 'yipet-bubble-out' && bubbleEl) {
          bubbleEl.remove();
          bubbleEl = null;
        }
      }, { once: true });
      // Fallback cleanup
      setTimeout(() => {
        if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }
      }, 400);
    }, cfg.thoughtBubbleShowDuration);

    // Schedule next bubble
    const nextDelay = cfg.thoughtBubbleShowDuration + 400 + rand(cfg.thoughtBubbleMinInterval, cfg.thoughtBubbleMaxInterval);
    timer = setTimeout(showBubble, nextDelay);
  }

  // Initial delay before first bubble
  timer = setTimeout(showBubble, rand(cfg.thoughtBubbleMinInterval, cfg.thoughtBubbleMaxInterval));

  return {
    stop() {
      paused = true;
      if (timer !== null) { clearTimeout(timer); timer = null; }
      if (bubbleEl) { bubbleEl.remove(); bubbleEl = null; }
    },
    pause() {
      paused = true;
      if (timer !== null) { clearTimeout(timer); timer = null; }
    },
    resume() {
      paused = false;
      timer = setTimeout(showBubble, rand(2000, cfg.thoughtBubbleMinInterval));
    },
  };
}

// ── Main ────────────────────────────────────────────────────────────────

export function createPetOverlay(
  root: typeof globalThis,
  BASE: string,
  initialColor: number,
  initialRole: string,
  initialVisible: boolean,
  ipcSecret: string,
): void {
  const injector = createInjector(BASE);

  function isValidIpcEvent(e: CustomEvent): boolean {
    const detail = e.detail;
    if (!detail || typeof detail !== 'object') return false;
    if (!detail.__yipet) return false;
    if (!ipcSecret || detail.__signature !== ipcSecret) return false;
    if (Date.now() - detail.__timestamp > 5000) return false;
    return true;
  }
  // Animation stylesheet is injected lazily in _ensureAnimationsReady()
  // when the pet first becomes visible — not on every page load.

  // ── window.YiPet API ────────────────────────────────────────────────

  attachYiPetApi(root, BASE, injector);

  // ── Pet Overlay DOM ──────────────────────────────────────────────────

  const extRoot = BASE.replace(/cdn\/$/, '');
  const animCfg = PET_DEFAULTS.animation.pet;

  const petContainer = document.createElement('div');
  petContainer.id = 'yipet-overlay';
  petContainer.style.cssText =
    'position:fixed;bottom:20%;right:20px;z-index:2147483645;' +
    'transition:opacity 100ms ease;opacity:' + (initialVisible ? '1' : '0') + ';pointer-events:' + (initialVisible ? 'auto' : 'none') + ';' +
    'padding:10px;border-radius:50%;' +
    'background:var(--primary-gradient,linear-gradient(135deg,#667eea 0%,#764ba2 50%,#f093fb 100%));' +
    'box-shadow:0 10px 30px rgba(var(--primary-rgb,102,126,234),0.45),' +
    '0 0 0 1px rgba(255,255,255,0.08) inset;';
  petContainer.setAttribute('data-pet', 'yipet');
  // Set CSS custom properties for animation durations
  petContainer.style.setProperty('--yipet-float-dur', animCfg.floatDuration + 'ms');
  petContainer.style.setProperty('--yipet-wag-dur', animCfg.wagDuration + 'ms');
  petContainer.style.setProperty('--yipet-blink-dur', animCfg.blinkDuration + 'ms');
  petContainer.style.setProperty('--yipet-glow-dur', animCfg.glowPulseDuration + 'ms');
  petContainer.style.setProperty('--yipet-ring-dur', animCfg.ringRotateDuration + 'ms');

  const petImg = document.createElement('img');
  petImg.id = 'yipet-pet-img';
  petImg.alt = 'YiPet';
  petImg.title = initialRole;
  petImg.style.cssText =
    `width:${PET_DEFAULTS.pet.defaultSize}px;height:auto;` +
    'border-radius:50%;display:block;user-select:none;' +
    'position:relative;z-index:1;';
  petImg.draggable = false;
  petImg.src =
    extRoot + 'assets/images/' + initialRole.toLowerCase().replace(/\s+/g, '-') + '/icon.png';
  petContainer.appendChild(petImg);

  // Double-click pet to toggle chat window
  petImg.style.cursor = 'grab';

  // ── Always-on ambient animation classes ──────────────────────────────

  if (initialVisible) {
    petContainer.classList.add('yipet-entrance');
    petContainer.addEventListener('animationend', function onEntrance(e: AnimationEvent) {
      if (e.animationName && e.animationName.indexOf('yipet-entrance') === 0) {
        petContainer.classList.remove('yipet-entrance');
        petContainer.classList.add('yipet-ambient');
        petContainer.removeEventListener('animationend', onEntrance);
      }
    });
  }

  // ── Idle behavior & thought bubbles (lazy) ─────────────────────────────
  // Only initialized when the pet first becomes visible, so pages that
  // never show the pet don't pay the cost of timers or stylesheet injection.

  let _animationsReady = false;
  let idleCtrl: ReturnType<typeof startIdleBehavior> | null = null;
  let bubbleCtrl: ReturnType<typeof startThoughtBubbles> | null = null;

  function _ensureAnimationsReady() {
    if (_animationsReady) return;
    _animationsReady = true;
    injectPetStylesheet();
    idleCtrl = startIdleBehavior(petContainer, petImg);
    bubbleCtrl = startThoughtBubbles(petContainer);
  }

  // Only init animations when pet first becomes visible
  if (initialVisible) {
    _ensureAnimationsReady();
  }

  // Pause animations when tab is hidden to reduce GPU/CPU usage
  function _onVisChange() {
    if (document.visibilityState === 'hidden') {
      petContainer.classList.remove('yipet-ambient');
      idleCtrl?.pause();
      bubbleCtrl?.pause();
    } else if (initialVisible || petContainer.style.opacity !== '0') {
      _ensureAnimationsReady();
      petContainer.classList.add('yipet-ambient');
      idleCtrl?.resume();
      bubbleCtrl?.resume();
    }
  }
  document.addEventListener('visibilitychange', _onVisChange);
  window.addEventListener('pagehide', () => {
    idleCtrl?.stop();
    bubbleCtrl?.stop();
    document.removeEventListener('visibilitychange', _onVisChange);
  }, { once: true });

  // ── Drag Handling ────────────────────────────────────────────────────

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
    petContainer.style.willChange = 'transform';
    dragState = {
      startX: clientX,
      startY: clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false,
    };
    petImg.style.cursor = 'grabbing';
    petContainer.dataset.dragging = 'true';
    petContainer.classList.add('yipet-hover');
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
    const wasMoved = dragState.moved;
    dragState = null;
    petImg.style.cursor = 'grab';
    delete petContainer.dataset.dragging;
    petContainer.classList.remove('yipet-hover');
    petContainer.style.willChange = 'auto';
    document.removeEventListener('mousemove', onDocMouseMove);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', onDocTouchMove);
    document.removeEventListener('touchend', endDrag);
    document.removeEventListener('touchcancel', endDrag);

    // Click feedback (not a drag): bounce + sparkles
    if (!wasMoved) {
      const bounceAction: IdleAction = { name: 'bounce', target: 'overlay', duration: 400, weight: 0 };
      triggerPetAction(petContainer, petImg, bounceAction);
      createSparkles(petContainer, animCfg.sparkleCount, animCfg.sparkleDuration);
    }
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

  // Apply theme to overlay only — never touch document.documentElement
  // to avoid destroying host page styles.
  applyThemeColors(petContainer, initialColor);

  // ── Event Listeners ──────────────────────────────────────────────────

  // Visibility — relay.ts updates DOM directly; we only manage animations.
  window.addEventListener('yipet:visibilityChanged', ((e: CustomEvent) => {
    if (!isValidIpcEvent(e)) return;
    ensureOverlayInDOM();
    const visible = e.detail.data.visible;
    if (visible) {
      _ensureAnimationsReady();
      petContainer.classList.add('yipet-entrance');
      petContainer.addEventListener('animationend', function onEntrance(e: AnimationEvent) {
        if (e.animationName && e.animationName.indexOf('yipet-entrance') === 0) {
          petContainer.classList.remove('yipet-entrance');
          petContainer.classList.add('yipet-ambient');
          petContainer.removeEventListener('animationend', onEntrance);
        }
      });
      idleCtrl?.resume();
      bubbleCtrl?.resume();
    } else {
      petContainer.classList.remove(
        'yipet-ambient', 'yipet-entrance',
        'yipet-wiggle', 'yipet-bounce', 'yipet-tilt',
      );
      petImg.classList.remove('yipet-blink');
      idleCtrl?.pause();
      bubbleCtrl?.pause();
    }
  }) as EventListener);

  // Chat toggle — dispatched by relay.ts.
  window.addEventListener('yipet:chatToggled', ((e: CustomEvent) => {
    if (!isValidIpcEvent(e)) return;
    const w = window as unknown as Record<string, unknown>;
    const chat = w.YiPetChat as { toggle: () => void } | undefined;
    if (!chat) {
      w.__yipetPendingChatToggle = true;
    }
  }) as EventListener);

  // CDN JS resources are loaded on-demand via window.YiPet.load(), not
  // auto-loaded — loading 40+ libraries (Vue, jQuery, Bootstrap, etc.) on
  // every page visit would slow down host page loading.
  // The injector + window.YiPet API are already wired above via attachYiPetApi.
}