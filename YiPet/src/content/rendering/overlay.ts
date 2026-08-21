/**
 * Pet overlay — creates and manages the YiPet DOM element in the MAIN world.
 *
 * Extracted from bootstrap.ts Phase 2 (MAIN world).
 * Handles: pet container/image creation, animation lifecycle (ambient, idle, bubbles),
 * drag interaction, CDN style/JS management, and the window.YiPet API.
 * DOM updates for settings (visibility/size/role/color) are handled by relay.ts.
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

// ── Helpers ─────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Animation Stylesheet Injection ──────────────────────────────────────

let _stylesheetInjected = false;

function injectPetStylesheet(): void {
  if (_stylesheetInjected) return;
  if (!document.head) return;

  const cfg = PET_DEFAULTS.animation.pet;
  const style = document.createElement('style');
  style.id = 'yipet-animations';
  style.textContent = `
/* ── Keyframes ─────────────────────────── */

@keyframes yipet-float {
  0%, 100% { transform: translateY(0) translateZ(0); }
  50%      { transform: translateY(-8px) translateZ(0); }
}

@keyframes yipet-glow-pulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

@keyframes yipet-bounce {
  0%   { transform: scale(1) translateZ(0); }
  30%  { transform: scale(1.12) translateZ(0); }
  60%  { transform: scale(0.95) translateZ(0); }
  100% { transform: scale(1) translateZ(0); }
}

@keyframes yipet-wiggle {
  0%   { transform: rotate(0deg) translateZ(0); }
  25%  { transform: rotate(-6deg) translateZ(0); }
  75%  { transform: rotate(6deg) translateZ(0); }
  100% { transform: rotate(0deg) translateZ(0); }
}

@keyframes yipet-blink-img {
  0%, 90%, 100% { transform: scaleY(1) translateZ(0); }
  95%           { transform: scaleY(0.1) translateZ(0); }
}

@keyframes yipet-tilt {
  0%   { transform: rotate(0deg) translateZ(0); }
  40%  { transform: rotate(-10deg) translateZ(0); }
  80%  { transform: rotate(10deg) translateZ(0); }
  100% { transform: rotate(0deg) translateZ(0); }
}

@keyframes yipet-sparkle {
  0%   { transform: translate(0, 0) scale(1); opacity: 0.9; }
  100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
}

@keyframes yipet-bubble-in {
  0%   { transform: translate(-50%, 8px) scale(0.8); opacity: 0; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}

@keyframes yipet-bubble-out {
  0%   { transform: translate(-50%, 0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -12px) scale(0.8); opacity: 0; }
}

@keyframes yipet-entrance {
  0%   { transform: scale(0.3) translateZ(0); opacity: 0; }
  60%  { transform: scale(1.08) translateZ(0); opacity: 1; }
  100% { transform: scale(1) translateZ(0); opacity: 1; }
}

/* ── Container ──────────────────────────── */

#yipet-overlay {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
}

#yipet-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  box-shadow:
    0 10px 30px rgba(var(--primary-rgb), 0.4),
    0 0 0 1px rgba(255,255,255,0.08) inset;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* ── Always-on ambient class ───────────── */

#yipet-overlay.yipet-ambient {
  animation:
    yipet-float var(--yipet-float-dur, 3000ms) cubic-bezier(0.45, 0, 0.55, 1) infinite;
}

#yipet-overlay.yipet-ambient::after {
  animation: yipet-glow-pulse var(--yipet-glow-dur, 3000ms) ease-in-out infinite;
}

/* ── Idle action classes (override ambient) ─ */

#yipet-overlay.yipet-wiggle {
  animation: yipet-wiggle var(--yipet-wag-dur, 2000ms) cubic-bezier(0.45, 0, 0.55, 1);
}

#yipet-overlay.yipet-bounce {
  animation: yipet-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

#yipet-overlay.yipet-tilt {
  animation: yipet-tilt 600ms cubic-bezier(0.45, 0, 0.55, 1);
}

#yipet-pet-img.yipet-blink {
  animation: yipet-blink-img var(--yipet-blink-dur, 4000ms) ease-in-out;
}

/* Entrance animation on first show */
#yipet-overlay.yipet-entrance {
  animation: yipet-entrance 500ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

/* ── Hover ─────────────────────────────── */

#yipet-overlay:hover {
  box-shadow: 0 10px 45px rgba(var(--primary-rgb), 0.7), 0 0 0 1px rgba(255,255,255,0.12) inset !important;
  transform: scale(1.03);
}

#yipet-overlay:hover::after {
  opacity: 1;
}

#yipet-overlay:hover #yipet-pet-img {
  transform: scale(${cfg.hoverScale});
  filter: brightness(1.15) drop-shadow(0 0 10px rgba(var(--primary-rgb), 0.6));
}

#yipet-pet-img {
  will-change: transform, filter;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s ease;
}

/* ── Sparkle particles ─────────────────── */

.yipet-sparkle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(var(--primary-rgb), 0.9);
  pointer-events: none;
  filter: blur(0.5px);
  will-change: transform, opacity;
  animation: yipet-sparkle ${cfg.sparkleDuration}ms cubic-bezier(0, 0.7, 0.3, 1) forwards;
}

/* ── Thought bubble ────────────────────── */

.yipet-thought-bubble {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  background: rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: #fff;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 16px;
  line-height: 1.3;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 0);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  will-change: transform, opacity;
}

.yipet-thought-bubble.in {
  animation: yipet-bubble-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.yipet-thought-bubble.out {
  animation: yipet-bubble-out 300ms ease-in forwards;
}

/* ── Accessibility ─────────────────────── */

@media (prefers-reduced-motion: reduce) {
  #yipet-overlay,
  #yipet-overlay *,
  #yipet-overlay::before,
  #yipet-overlay::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

  document.head.appendChild(style);
  _stylesheetInjected = true;
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
): void {
  const injector = createInjector(BASE);

  // Inject animation stylesheet (once, idempotent)
  injectPetStylesheet();

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

  // ── Idle behavior & thought bubbles ──────────────────────────────────

  const idleCtrl = startIdleBehavior(petContainer, petImg);
  const bubbleCtrl = startThoughtBubbles(petContainer);

  if (!initialVisible) {
    idleCtrl.pause();
    bubbleCtrl.pause();
  }

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

  // Apply initial theme
  applyThemeColors(document.documentElement, initialColor);

  // ── Event Listeners ──────────────────────────────────────────────────

  // Visibility — relay.ts updates DOM directly; we only manage animations.
  window.addEventListener('yipet:visibilityChanged', ((e: CustomEvent) => {
    ensureOverlayInDOM();
    const visible = e.detail.visible;
    if (visible) {
      petContainer.classList.add('yipet-entrance');
      petContainer.addEventListener('animationend', function onEntrance(e: AnimationEvent) {
        if (e.animationName && e.animationName.indexOf('yipet-entrance') === 0) {
          petContainer.classList.remove('yipet-entrance');
          petContainer.classList.add('yipet-ambient');
          petContainer.removeEventListener('animationend', onEntrance);
        }
      });
      idleCtrl.resume();
      bubbleCtrl.resume();
    } else {
      petContainer.classList.remove(
        'yipet-ambient', 'yipet-entrance',
        'yipet-wiggle', 'yipet-bounce', 'yipet-tilt',
      );
      petImg.classList.remove('yipet-blink');
      idleCtrl.pause();
      bubbleCtrl.pause();
    }
  }) as EventListener);

  // Chat toggle — dispatched by relay.ts.
  window.addEventListener('yipet:chatToggled', (() => {
    const w = window as unknown as Record<string, unknown>;
    const chat = w.YiPetChat as { toggle: () => void } | undefined;
    if (!chat) {
      w.__yipetPendingChatToggle = true;
    }
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