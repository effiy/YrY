/**
 * YiPet animation stylesheet — CSS keyframes and styles for pet visuals.
 *
 * Extracted from overlay.ts to keep rendering logic focused on DOM construction.
 */
import { PET_DEFAULTS } from '@/config/defaults';

let _injected = false;

/** CSS keyframes and styles injected once into the page head. */
export const ANIMATION_CSS = (cfg: typeof PET_DEFAULTS.animation.pet) => `
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
  contain: layout style paint;
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

/** Inject the pet animation stylesheet into the document head. Idempotent. */
export function injectPetStylesheet(): void {
  if (_injected) return;
  if (!document.head) return;

  const style = document.createElement('style');
  style.id = 'yipet-animations';
  style.textContent = ANIMATION_CSS(PET_DEFAULTS.animation.pet);
  document.head.appendChild(style);
  _injected = true;
}