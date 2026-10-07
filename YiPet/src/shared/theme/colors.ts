/** Theme color system — public API re-exports.
 *
 * Data lives in focused sub-modules:
 * - types.ts: RgbTuple, ThemePalette, ColorScheme
 * - palettes.ts: THEME_PALETTES, NONE_PALETTE
 * - css-vars.ts: CSS variable injection helpers
 *
 * External callers should continue to import from shared/theme/colors.
 */

import type { ColorScheme, ThemePalette } from './types';
import { THEME_PALETTES, NONE_PALETTE } from './palettes';
import { applyPaletteToRoot, clearPaletteFromRoot } from './css-vars';
import { generatePalette } from './color-generator';

export type { ColorScheme, RgbTuple, ThemePalette } from './types';
export { THEME_PALETTES, NONE_PALETTE } from './palettes';
export { applyPaletteToRoot, clearPaletteFromRoot } from './css-vars';
export { THEME_VAR_KEYS } from './css-vars';

export function resolvePalette(idx: number): { palette: ThemePalette; scheme: ColorScheme } {
  if (idx < 0) return { palette: NONE_PALETTE, scheme: 'light' };
  if (!Number.isInteger(idx) || idx < 0 || idx >= THEME_PALETTES.length) {
    return { palette: THEME_PALETTES[0]!, scheme: 'dark' };
  }
  return { palette: THEME_PALETTES[idx]!, scheme: 'dark' };
}

export function applyThemeColors(root: HTMLElement, idx: number): void {
  const { palette, scheme } = resolvePalette(idx);
  applyPaletteToRoot(root, palette, scheme);
}

export function applyThemeHex(root: HTMLElement, hex: string): boolean {
  const palette = generatePalette(hex);
  if (!palette) return false;
  applyPaletteToRoot(root, palette, 'dark');
  return true;
}

export function clearThemeColors(root: HTMLElement): void {
  clearPaletteFromRoot(root);
}