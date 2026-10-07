/**
 * Color Utilities — backed by colord, a tiny (2KB) battle-tested color library.
 *
 * All functions preserve the existing API surface so callers need no changes.
 * colord handles hex/rgb/hsl parsing, WCAG luminance/contrast, and HSL-based
 * lighten/darken/saturate operations with proper edge-case clamping.
 */

import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";
import mixPlugin from "colord/plugins/mix";

extend([a11yPlugin, mixPlugin]);

export type HexColor = `#${string}`;

export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

export interface Hsl {
  readonly h: number;
  readonly s: number;
  readonly l: number;
}

export function isValidHex(value: string): value is HexColor {
  return colord(value).isValid();
}

export function parseHex(value: string): Rgb | null {
  const c = colord(value);
  if (!c.isValid()) return null;
  const { r, g, b } = c.toRgb();
  return { r, g, b };
}

export function rgbToHex(r: number, g: number, b: number): HexColor {
  return colord({ r: clamp(r, 0, 255), g: clamp(g, 0, 255), b: clamp(b, 0, 255) }).toHex() as HexColor;
}

export function rgbToHsl(r: number, g: number, b: number): Hsl {
  const { h, s, l } = colord({ r, g, b }).toHsl();
  return { h, s, l };
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  const { r, g, b } = colord({ h: ((h % 360) + 360) % 360, s: clamp(s, 0, 100), l: clamp(l, 0, 100) }).toRgb();
  return { r, g, b };
}

export function hslToHex(h: number, s: number, l: number): HexColor {
  return colord({ h: ((h % 360) + 360) % 360, s: clamp(s, 0, 100), l: clamp(l, 0, 100) }).toHex() as HexColor;
}

export function lighten(color: string, amount: number): HexColor | null {
  const c = colord(color);
  return c.isValid() ? c.lighten(clamp(amount, 0, 1)).toHex() as HexColor : null;
}

export function darken(color: string, amount: number): HexColor | null {
  const c = colord(color);
  return c.isValid() ? c.darken(clamp(amount, 0, 1)).toHex() as HexColor : null;
}

export function saturate(color: string, amount: number): HexColor | null {
  const c = colord(color);
  return c.isValid() ? c.saturate(clamp(amount, 0, 1)).toHex() as HexColor : null;
}

export function desaturate(color: string, amount: number): HexColor | null {
  const c = colord(color);
  return c.isValid() ? c.desaturate(clamp(amount, 0, 1)).toHex() as HexColor : null;
}

export function mix(color1: string, color2: string, weight = 0.5): HexColor | null {
  const c1 = colord(color1);
  const c2 = colord(color2);
  if (!c1.isValid() || !c2.isValid()) return null;
  return c1.mix(c2, clamp(weight, 0, 1)).toHex() as HexColor;
}

export function withAlpha(color: string, alpha: number): string | null {
  const c = colord(color).alpha(clamp(alpha, 0, 1));
  return c.isValid() ? c.toRgbString() : null;
}

export function getLuminance(color: string): number {
  return colord(color).luminance();
}

export function getContrastRatio(color1: string, color2: string): number {
  return colord(color1).contrast(colord(color2));
}

export function isReadableOn(foreground: string, background: string, level: "AA" | "AAA" = "AA"): boolean {
  return colord(foreground).isReadable(background, { level });
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}