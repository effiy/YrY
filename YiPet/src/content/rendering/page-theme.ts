/**
 * Page Theme — intensity-based dark mode via filter:invert().
 *
 * Replaces the previous mix-blend-mode overlay (too subtle) with a proper
 * dark-mode transformation. The approach is a proven technique used by
 * Dark Reader, Night Eye, and similar extensions:
 *
 *   1. filter: invert(intensity%) hue-rotate(180deg) on <html>
 *      — Inverts page colors scaled by the intensity slider. At 100%,
 *        white backgrounds become black, black text becomes white.
 *
 *   2. Double-invert on img/video/canvas/svg
 *      — Media elements get the inverse filter applied so they appear
 *        in their original colors. No broken images.
 *
 *   3. color-scheme: dark
 *      — Triggers native dark mode on supporting sites (GitHub, MDN, etc.)
 *
 *   4. Per-theme hue adjustment
 *      — Each theme shifts the base hue-rotate slightly to give the
 *        dark mode a warm/cool tint matching the selected theme.
 *
 * Intensity range: 0 (off) to 100 (full dark mode).
 */

const PROTECTION_SHEET_ID = 'yipet-dark-protection';

// Per-theme hue offsets — subtle shifts to match each theme's character.
// Base is 180deg (standard color correction after invert).
const THEME_HUE_OFFSETS: Record<number, number> = {
  0: 180,  // Slate Pro — neutral cool
  1: 185,  // Indigo — slight purple-blue
  2: 175,  // Ocean — slight teal
  3: 195,  // Forest — slight green-warm
  4: 195,  // Sunset — warm amber shift
  5: 170,  // Rose — slight pink shift
};

let _intensity = 0;
let _colorIdx = 0;

/** Inject the protection stylesheet once — double-inverts media elements. */
function ensureProtectionSheet(): void {
  if (document.getElementById(PROTECTION_SHEET_ID)) return;

  const style = document.createElement('style');
  style.id = PROTECTION_SHEET_ID;
  style.textContent = `
    html.yipet-dark-active img,
    html.yipet-dark-active video,
    html.yipet-dark-active canvas,
    html.yipet-dark-active svg:not([class*="icon"]):not([class*="logo"]),
    html.yipet-dark-active [style*="background-image"],
    html.yipet-dark-active [role="img"],
    html.yipet-dark-active .yipet-dark-protect {
      filter: invert(1) hue-rotate(180deg) !important;
    }
    /* Don't double-invert YiPet's own UI elements */
    html.yipet-dark-active #yipet-overlay,
    html.yipet-dark-active #yipet-chat-root,
    html.yipet-dark-active #yipet-overlay *,
    html.yipet-dark-active #yipet-chat-root * {
      filter: none !important;
    }
  `;
  document.head.appendChild(style);
}

/** Apply page theme at a given intensity (0-100) and color index. */
export function applyPageTheme(colorIndex: number, intensity: number): void {
  const pct = Math.max(0, Math.min(100, intensity));

  // Off — remove everything
  if (pct === 0 || colorIndex < 0) {
    removePageTheme();
    return;
  }

  const safeIdx = colorIndex;
  const hueDeg = THEME_HUE_OFFSETS[safeIdx] ?? 180;
  const html = document.documentElement;

  // 1. Mark page as dark-mode-active (triggers protection stylesheet)
  html.classList.add('yipet-dark-active');

  // 2. Inject protection stylesheet (idempotent)
  ensureProtectionSheet();

  // 3. Apply invert filter scaled by intensity
  //    At intensity 50: invert(0.5) — half dark
  //    At intensity 100: invert(1.0) — full dark
  const invertAmt = pct / 100;
  html.style.filter = `invert(${invertAmt}) hue-rotate(${hueDeg}deg)`;

  // 4. Native dark mode hint
  html.style.colorScheme = 'dark';

  _intensity = pct;
  _colorIdx = safeIdx;
}

/** Remove page theme, restoring original page appearance. */
export function removePageTheme(): void {
  const html = document.documentElement;
  html.classList.remove('yipet-dark-active');
  html.style.removeProperty('filter');
  html.style.removeProperty('color-scheme');

  _intensity = 0;
}

/** Current intensity (0-100). */
export function getPageThemeIntensity(): number {
  return _intensity;
}

/** Active theme color index. */
export function getPageThemeColor(): number {
  return _colorIdx;
}